package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ikeikeikeike/go-sitemap-generator/v2/stm"
)

func main() {

	gin.SetMode(gin.DebugMode)

	r := gin.Default()

	r.LoadHTMLGlob("templates/*")

	r.NoRoute(func(c *gin.Context) {
		c.HTML(http.StatusNotFound, "error", gin.H{
			"error": "Page not found",
			"Title": "Error - 404",
		})
	})

	r.Use(gin.CustomRecovery(func(c *gin.Context, err any) {
		c.HTML(http.StatusInternalServerError, "error", gin.H{
			"error": err,
			"Title": "Error - 500",
		})
	}))

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index", gin.H{
			"Year":  time.Now().Year(),
			"Title": "My Projects",
		})
	})

	r.GET("/assets/*filepath", func(c *gin.Context) {
		c.File("./assets/" + c.Param("filepath"))
	})

	r.GET("/sitemap.xml", renderSitemap)

	// Listen and Server in 0.0.0.0:8080
	err := r.Run(":8080")

	if err != nil {
		fmt.Println(err)
	}
}

func renderSitemap(c *gin.Context) {
	stmap := stm.NewSitemap(1)
	stmap.Create()
	stmap.SetDefaultHost("https://wlczak.vlastas.cc/")
	stmap.Add(stm.URL{
		{"loc", "/"},
		{"priority", "1.0"},
		{"changefreq", "monthly"},
	})

	xml := stmap.XMLContent()
	c.Header("Content-Type", "application/xml")
	c.String(http.StatusOK, fmt.Sprintf("%s", xml))
}
