package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ikeikeikeike/go-sitemap-generator/v2/stm"
	"github.com/joho/godotenv"
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

		go postWebhook(WebHookRequest{
			Embeds: []WebHookEmbed{
				{
					Title:       "A lost lamb",
					Description: "Someone got lost at " + c.Request.URL.Path,
					Color:       "1561516",
				},
			},
		})
	})

	r.Use(gin.CustomRecovery(func(c *gin.Context, err any) {
		c.HTML(http.StatusInternalServerError, "error", gin.H{
			"error": err,
			"Title": "Error - 500",
		})
		color, colorErr := strconv.ParseInt("c70417", 16, 64)
		if colorErr != nil {
			color = 16753920
		}
		go postWebhook(WebHookRequest{
			Embeds: []WebHookEmbed{
				{
					Title:       "Someone broke something",
					Description: fmt.Sprintf("Some rascal broke something and it resulted in %v", err),
					Color:       strconv.FormatInt(color, 10),
				},
			},
		})
	}))

	r.GET("/", func(c *gin.Context) {
		cookies := c.Request.CookiesNamed("lastvisited")

		c.SetCookie("lastvisited", strconv.FormatInt(time.Now().UnixMilli(), 10), 86400, "/", "", false, false)
		if len(cookies) == 0 {
			go ping(true, time.Now())
		} else {
			cookie := cookies[0]
			timeStr := cookie.Value
			timeInt, err := strconv.ParseInt(timeStr, 10, 64)
			if err != nil {
				go ping(false, time.UnixMilli(0))
				return
			}
			timeObj := time.UnixMilli(timeInt)
			go ping(false, timeObj)
		}

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
	c.String(http.StatusOK, string(xml))
	go postWebhook(WebHookRequest{
		Embeds: []WebHookEmbed{
			{
				Title:       "Sitemap generated",
				Description: "Someone requested sitemap.xml",
				Color:       "1561516",
			},
		},
	})
}

type WebHookRequest struct {
	Embeds  []WebHookEmbed `json:"embeds"`
	Content string         `json:"content"`
}
type WebHookEmbed struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Color       string `json:"color"`
}

func ping(new bool, t time.Time) {
	var request WebHookRequest

	if new {
		request.Embeds = []WebHookEmbed{
			{
				Title:       "New User",
				Description: "New user visited at " + t.Format("15:04:05"),
				Color:       "16753920",
			},
		}
		go postWebhook(request)
	} else {
		tDiff := time.Since(t)
		var timeString string
		if tDiff.Hours() > 24 {
			timeString = fmt.Sprintf("%d days %d hours %d minutes %d seconds", int(tDiff.Hours()/24), int(tDiff.Hours())%24, int(tDiff.Minutes())%60, int(tDiff.Seconds())%60)
		} else if tDiff.Hours() > 1 {
			timeString = fmt.Sprintf("%d hours %d minutes %d seconds", int(tDiff.Hours()), int(tDiff.Minutes())%60, int(tDiff.Seconds())%60)
		} else if tDiff.Minutes() > 1 {
			timeString = fmt.Sprintf("%d minutes %d seconds", int(tDiff.Minutes()), int(tDiff.Seconds())%60)
		} else {
			timeString = fmt.Sprintf("%d seconds", int(tDiff.Seconds()))
		}
		request = WebHookRequest{
			Embeds: []WebHookEmbed{
				{
					Title:       "Revisit",
					Description: fmt.Sprintf("User revisited after %s", timeString),
					Color:       "5814783",
				},
			},
			// Content: fmt.Sprintf("User revisited after %s", timeString),
		}
		postWebhook(request)
	}

}

func postWebhook(request WebHookRequest) {
	err := godotenv.Load(".env")
	if err != nil {
		err := godotenv.Load("./conf/.env")

		if err != nil {
			fmt.Println(err)
		}
	}

	json, err := json.Marshal(request)
	if err != nil {
		fmt.Println(err)
		return
	}
	body := bytes.NewReader(json)
	_, err = http.Post(os.Getenv("DISCORD_WEBHOOK"), "application/json", body)
	if err != nil {
		fmt.Println(err)
	}
}
