package main

import (
	"compress/gzip"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestStaticServer(t *testing.T) {
	dir := t.TempDir()
	for name, content := range map[string]string{
		"index.html": "home", "about/index.html": "about", "404.html": "missing EN",
		"cs/404/index.html": "missing CS", "ja/404/index.html": "missing JA", "_astro/app.abc.js": "script",
		"robots.txt": "robots", "sitemap.xml": "sitemap", "og.png": "image",
	} {
		if err := os.MkdirAll(filepath.Dir(filepath.Join(dir, name)), 0755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(dir, name), []byte(content), 0644); err != nil {
			t.Fatal(err)
		}
	}
	outside := filepath.Join(t.TempDir(), "secret")
	if err := os.WriteFile(outside, []byte("secret"), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.Symlink(outside, filepath.Join(dir, "escape.txt")); err != nil {
		t.Fatal(err)
	}
	router, err := newRouter(dir)
	if err != nil {
		t.Fatal(err)
	}
	for _, test := range []struct {
		target         string
		status         int
		body, location string
	}{
		{"/", 200, "home", ""}, {"/about/", 200, "about", ""}, {"/about?x=1", 301, "", "/about/?x=1"},
		{"/?lang=En", 301, "", "/"}, {"/?lang=Cs", 301, "", "/cs/"}, {"/?lang=Ja&x=1", 301, "", "/ja/?x=1"},
		{"/?lang=invalid", 301, "", "/"}, {"/missing", 404, "missing EN", ""}, {"/cs/missing", 404, "missing CS", ""},
		{"/ja/missing", 404, "missing JA", ""}, {"/missing.js", 404, "", ""}, {"/_astro/missing.js", 404, "", ""},
		{"/escape.txt", 404, "", ""}, {"/../secret", 404, "", ""}, {"/api/missing", 404, "", ""},
		{"/api/health", 200, `{"status":"ok"}`, ""}, {"/robots.txt", 200, "robots", ""}, {"/sitemap.xml", 200, "sitemap", ""},
	} {
		t.Run(test.target, func(t *testing.T) {
			response := httptest.NewRecorder()
			router.ServeHTTP(response, httptest.NewRequest("GET", test.target, nil))
			if response.Code != test.status {
				t.Fatalf("status %d, want %d", response.Code, test.status)
			}
			if !strings.Contains(response.Body.String(), test.body) {
				t.Fatalf("body %q, want %q", response.Body.String(), test.body)
			}
			if test.status == 404 && test.body == "" && response.Body.Len() != 0 {
				t.Fatalf("unexpected fallback: %q", response.Body.String())
			}
			if response.Header().Get("Location") != test.location {
				t.Fatalf("location %q", response.Header().Get("Location"))
			}
			if response.Header().Get("Set-Cookie") != "" {
				t.Fatal("unexpected visitor cookie")
			}
		})
	}
	for _, method := range []string{http.MethodGet, http.MethodHead} {
		response := httptest.NewRecorder()
		router.ServeHTTP(response, httptest.NewRequest(method, "/_astro/app.abc.js", nil))
		if response.Header().Get("Cache-Control") != "public, max-age=31536000, immutable" {
			t.Fatal("missing immutable cache")
		}
		if method == http.MethodHead && response.Body.Len() != 0 {
			t.Fatal("HEAD returned a body")
		}
	}
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/about/", nil))
	if response.Code != http.StatusMethodNotAllowed {
		t.Fatal("unexpected method allowed")
	}
	for _, encoding := range []string{"gzip", "br, gzip;q=0.8", "gzip;q=0"} {
		request := httptest.NewRequest(http.MethodGet, "/_astro/app.abc.js", nil)
		request.Header.Set("Accept-Encoding", encoding)
		response := httptest.NewRecorder()
		router.ServeHTTP(response, request)
		if response.Header().Get("Vary") != "Accept-Encoding" {
			t.Fatal("missing encoding vary")
		}
		if encoding == "gzip;q=0" {
			if response.Header().Get("Content-Encoding") != "" {
				t.Fatal("compressed despite q=0")
			}
			continue
		}
		if response.Header().Get("Content-Encoding") != "gzip" {
			t.Fatal("missing gzip")
		}
		if response.Header().Get("Content-Length") != "" {
			t.Fatal("uncompressed content length")
		}
		reader, err := gzip.NewReader(response.Body)
		if err != nil {
			t.Fatal(err)
		}
		body, err := io.ReadAll(reader)
		reader.Close()
		if err != nil || string(body) != "script" {
			t.Fatalf("gzip body: %q, %v", body, err)
		}
	}
	request := httptest.NewRequest(http.MethodGet, "/_astro/app.abc.js", nil)
	request.Header.Set("Accept-Encoding", "gzip")
	request.Header.Set("Range", "bytes=0-2")
	response = httptest.NewRecorder()
	router.ServeHTTP(response, request)
	if response.Code != http.StatusPartialContent || response.Body.String() != "scr" || response.Header().Get("Content-Encoding") != "" {
		t.Fatal("range did not return the identity representation")
	}
	request = httptest.NewRequest(http.MethodGet, "/", nil)
	response = httptest.NewRecorder()
	router.ServeHTTP(response, request)
	if response.Header().Get("Cache-Control") != "public, max-age=0, must-revalidate" {
		t.Fatal("HTML must revalidate")
	}
	request = httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("If-Modified-Since", response.Header().Get("Last-Modified"))
	request.Header.Set("Accept-Encoding", "gzip")
	response = httptest.NewRecorder()
	router.ServeHTTP(response, request)
	if response.Code != http.StatusNotModified || response.Body.Len() != 0 {
		t.Fatal("304 must not have a body")
	}
}
