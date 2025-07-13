package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {

	gin.SetMode(gin.DebugMode)

	r := gin.Default()

	r.LoadHTMLGlob("templates/*")

	r.NoRoute(func(c *gin.Context) {
		c.HTML(http.StatusNotFound, "error.tmpl", gin.H{
			"error": "Page not found",
		})
	})

	r.Use(gin.CustomRecovery(func(c *gin.Context, err any) {
		c.HTML(http.StatusInternalServerError, "error.tmpl", gin.H{
			"error": err,
		})
	}))

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.tmpl", nil)
	})

	r.GET("/assets/*filepath", func(c *gin.Context) {
		c.File("./assets/" + c.Param("filepath"))
	})

	// Listen and Server in 0.0.0.0:8080
	err := r.Run(":8080")

	if err != nil {
		fmt.Println(err)
	}
}
