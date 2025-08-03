package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {

	gin.SetMode(gin.DebugMode)

	r := gin.Default()

	r.LoadHTMLGlob("templates/*")

	r.NoRoute(func(c *gin.Context) {
		c.HTML(http.StatusNotFound, "error", gin.H{
			"error": "Page not found",
		})
	})

	r.Use(gin.CustomRecovery(func(c *gin.Context, err any) {
		c.HTML(http.StatusInternalServerError, "error", gin.H{
			"error": err,
		})
	}))

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index", gin.H{
			"Year": time.Now().Year(),
		})
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
