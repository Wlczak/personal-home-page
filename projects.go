package main

type Project struct {
	Name            string
	Description     string
	ProjectLink     string
	GitHub          string
	VisitButtonText string
}

func getProjects() []Project {
	return []Project{
		{
			Name:        "Buffet",
			Description: "A food preordering system for fast food and food stands.",
			ProjectLink: "https://buffet.vlastas.cc/",
			GitHub:      "https://github.com/Web-Projekty/buffet-rezervace",
		},
		{
			Name:            "2D platformer",
			Description:     "A 2D platformer game made with Java swing.",
			ProjectLink:     "https://github.com/Web-Projekty/vap-projekt/releases/download/0.2.1-beta/0.2.1-beta.jar",
			GitHub:          "https://github.com/Web-projekty/vap-projekt",
			VisitButtonText: "Download",
		},
		{
			Name:        "JShort",
			Description: "Simple url shortnener app written in Java spring boot.",
			ProjectLink: "https://jshort.vlastas.cc/",
			GitHub:      "https://github.com/Wlczak/jshort",
		},
		{
			Name:        "LyLink",
			Description: "A multiplatform lyrics tracker that allows you to sync your lyrics live with the music you're listening to.",
			ProjectLink: "https://lylink.vlastas.cc/",
			GitHub:      "https://github.com/wlczak/LyLink",
		},
		{
			Name:        "Tanks",
			Description: "TankTrouble inspired game with full multiplayer implementation coming someday.",
			ProjectLink: "https://tanks.vlastas.cc/",
			GitHub:      "https://github.com/Wlczak/go-tanks",
		},
		{
			Name:        "Blogfinity",
			Description: "A never-ending supply of low quality AI generated articles.",
			ProjectLink: "https://blogfinity.vlastas.cc/",
			GitHub:      "https://github.com/Wlczak/blogfinity",
		},
		{
			Name:        "GameList",
			Description: "A gamified todo list.",
			ProjectLink: "https://gamelist.vlastas.cc/",
			GitHub:      "https://github.com/Wlczak/gamelist",
		},
	}
}
