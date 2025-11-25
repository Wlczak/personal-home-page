package main

type Project struct {
	Name        string
	Description string
	Website     string
	GitHub      string
}

func getProjects() []Project {
	return []Project{
		{
			Name:        "Buffet",
			Description: "A food preordering system for fast food and food stands.",
			Website:     "https://hetzner.vlastas.cc/",
			GitHub:      "https://github.com/Web-Projekty/buffet-rezervace",
		},
		{
			Name:        "JShort",
			Description: "Simple url shortnener app written in Java spring boot.",
			Website:     "https://jshort.vlastas.cc/",
			GitHub:      "https://github.com/Wlczak/jshort",
		},
		{
			Name:        "LyLink",
			Description: "A multiplatform lyrics tracker that allows you to sync your lyrics live with the music you're listening to.",
			Website:     "https://lylink.vlastas.cc/",
			GitHub:      "https://github.com/wlczak/LyLink",
		},
		{
			Name:        "Tanks",
			Description: "TankTrouble inspired game with full multiplayer implementation coming someday.",
			Website:     "https://tanks.vlastas.cc/",
			GitHub:      "https://github.com/Wlczak/go-tanks",
		},
		{
			Name:        "Blogfinity",
			Description: "A never-ending supply of low quality AI generated articles.",
			Website:     "https://blogfinity.vlastas.cc/",
			GitHub:      "https://github.com/Wlczak/blogfinity",
		},
		{
			Name:        "GameList",
			Description: "A gamified todo list.",
			Website:     "https://gamelist.vlastas.cc/",
			GitHub:      "https://github.com/Wlczak/gamelist",
		},
	}
}
