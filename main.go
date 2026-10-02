package main

import (
	"compress/gzip"
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

type compressedResponse struct {
	http.ResponseWriter
	writer *gzip.Writer
}

func (w compressedResponse) WriteHeader(code int) {
	w.Header().Del("Content-Length")
	w.ResponseWriter.WriteHeader(code)
}

func (w compressedResponse) Write(data []byte) (int, error) {
	return w.writer.Write(data)
}

func acceptsGzip(header string) bool {
	for _, encoding := range strings.Split(header, ",") {
		parts := strings.Split(encoding, ";")
		if strings.TrimSpace(parts[0]) != "gzip" {
			continue
		}
		quality := 1.0
		for _, parameter := range parts[1:] {
			if value, ok := strings.CutPrefix(strings.TrimSpace(parameter), "q="); ok {
				parsed, err := strconv.ParseFloat(value, 64)
				if err != nil {
					return false
				}
				quality = parsed
			}
		}
		return quality > 0 && quality <= 1
	}
	return false
}

// Serve only public build files. os.Root prevents symlinks escaping SITE_DIR.
func newRouter(siteDir string) (*gin.Engine, error) {
	root, err := os.OpenRoot(siteDir)
	if err != nil {
		return nil, err
	}
	root.Close()
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery(), func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Next()
		// Finish empty 404s before Gin adds its default text response.
		if c.Writer.Status() == http.StatusNotFound && !c.Writer.Written() {
			c.Writer.WriteHeaderNow()
		}
	})
	r.GET("/api/health", func(c *gin.Context) {
		c.Header("Cache-Control", "no-store")
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	r.NoRoute(func(c *gin.Context) {
		if c.Request.Method != http.MethodGet && c.Request.Method != http.MethodHead {
			c.Header("Allow", "GET, HEAD")
			c.Status(http.StatusMethodNotAllowed)
			return
		}
		if c.Request.URL.Path == "/" && c.Request.URL.Query().Has("lang") {
			target := "/"
			switch strings.ToLower(c.Query("lang")) {
			case "cs":
				target = "/cs/"
			case "ja":
				target = "/ja/"
			}
			query := c.Request.URL.Query()
			query.Del("lang")
			if len(query) > 0 {
				target += "?" + query.Encode()
			}
			c.Redirect(http.StatusMovedPermanently, target)
			return
		}
		clean := path.Clean(c.Request.URL.Path)
		if clean != strings.TrimSuffix(c.Request.URL.Path, "/") && c.Request.URL.Path != "/" {
			c.Status(http.StatusNotFound)
			return
		}
		if clean == "/api" || strings.HasPrefix(clean, "/api/") {
			c.Status(http.StatusNotFound)
			return
		}
		site, err := os.OpenRoot(siteDir)
		if err != nil {
			c.Status(http.StatusServiceUnavailable)
			return
		}
		defer site.Close()
		name := strings.TrimPrefix(clean, "/")
		missing := false
		if name == "" {
			name = "."
		}
		file, err := site.Open(name)
		if err == nil {
			info, statErr := file.Stat()
			if statErr == nil && info.IsDir() {
				file.Close()
				name = path.Join(name, "index.html")
				file, err = site.Open(name)
				if err == nil && !strings.HasSuffix(c.Request.URL.Path, "/") {
					file.Close()
					target := c.Request.URL.Path + "/"
					if c.Request.URL.RawQuery != "" {
						target += "?" + c.Request.URL.RawQuery
					}
					c.Redirect(http.StatusMovedPermanently, target)
					return
				}
			}
		}
		if err != nil {
			// Missing assets never fall back to HTML.
			if path.Ext(clean) != "" {
				c.Status(http.StatusNotFound)
				return
			}
			locale := ""
			for _, prefix := range []string{"cs", "ja"} {
				if clean == "/"+prefix || strings.HasPrefix(clean, "/"+prefix+"/") {
					locale = prefix
				}
			}
			errorPage := "404.html"
			if locale != "" {
				errorPage = path.Join(locale, "404", "index.html")
			}
			file, err = site.Open(errorPage)
			if err != nil {
				c.Status(http.StatusNotFound)
				return
			}
			c.Status(http.StatusNotFound)
			missing = true
		}
		defer file.Close()
		info, err := file.Stat()
		if err != nil || !info.Mode().IsRegular() {
			c.Status(http.StatusNotFound)
			return
		}
		c.Header("Cache-Control", "public, max-age=0, must-revalidate")
		if strings.HasPrefix(name, "_astro/") {
			c.Header("Cache-Control", "public, max-age=31536000, immutable")
		}
		if missing {
			c.Header("Content-Type", "text/html; charset=utf-8")
			c.Header("Cache-Control", "no-store")
			c.Writer.WriteHeaderNow()
		}
		// Compress text, preserving identity representations for range requests.
		switch path.Ext(name) {
		case ".html", ".css", ".js", ".svg", ".xml", ".txt", ".json":
			c.Header("Vary", "Accept-Encoding")
			if !missing && c.Request.Method == http.MethodGet && c.GetHeader("Range") == "" && acceptsGzip(c.GetHeader("Accept-Encoding")) {
				c.Header("Content-Encoding", "gzip")
				writer := gzip.NewWriter(c.Writer)
				defer func() {
					if c.Writer.Status() != http.StatusNotModified && c.Writer.Status() != http.StatusNoContent {
						writer.Close()
					}
				}()
				http.ServeContent(compressedResponse{ResponseWriter: c.Writer, writer: writer}, c.Request, name, info.ModTime(), file)
				return
			}
		}
		http.ServeContent(c.Writer, c.Request, name, info.ModTime(), file)
	})
	return r, nil
}

func main() {
	siteDir := os.Getenv("SITE_DIR")
	if siteDir == "" {
		siteDir = "dist"
	}
	router, err := newRouter(siteDir)
	if err != nil {
		log.Fatalf("open static site: %v (run npm run build first)", err)
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	server := &http.Server{Addr: ":" + port, Handler: router, ReadHeaderTimeout: 5 * time.Second}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		log.Printf("serving %s on http://localhost:%s", siteDir, port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()
	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}
