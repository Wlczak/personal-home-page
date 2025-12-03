package main

type Button struct {
	Text     string
	Disabled bool
	Link     string
}

type Project struct {
	Name         string
	Description  string
	VisitButton  Button
	GitHubButton Button
	TechStack    string
}

func getProjects() []Project {
	return []Project{
		{
			Name:        "Buffet",
			Description: "A food preordering system for fast food and food stands.",
			VisitButton: Button{
				Link: "https://buffet.vlastas.cc/",
			},
			GitHubButton: Button{
				Text: "GitHub",
				Link: "https://github.com/Web-Projekty/buffet-rezervace",
			},
			TechStack: "PHP, MariaDB, WebSockets",
		},
		{
			Name:        "LyLink",
			Description: "A multiplatform lyrics tracker that allows you to sync your lyrics live with the music you're listening to.",
			VisitButton: Button{
				Link: "https://lylink.vlastas.cc/",
			},
			GitHubButton: Button{
				Text: "GitHub",
				Link: "https://github.com/wlczak/LyLink",
			},
			TechStack: "PHP, TypeScript, Twig, Sqlite",
		},
		{
			Name:        "2D platformer",
			Description: "A 2D platformer game made with Java swing.",
			VisitButton: Button{
				Text: "Download",
				Link: "https://github.com/Web-Projekty/vap-projekt/releases/download/0.2.1-beta/0.2.1-beta.jar",
			},
			GitHubButton: Button{
				Text: "GitHub",
				Link: "https://github.com/Web-projekty/vap-projekt",
			},
			TechStack: "Java, Java Swing",
		},
		{
			Name:        "Menu",
			Description: "Modular menu library designed for I2C LCD displays. (Tested on 16x2 and 20x4 displays)",
			VisitButton: Button{
				Link: "",
			},
			GitHubButton: Button{
				Text: "GitHub",
				Link: "https://github.com/Wlczak/Menu",
			},
			TechStack: "C/C++, Arduino libs, LiquidCrystal I2C library",
		},
		{
			Name:        "JShort",
			Description: "Simple url shortnener app written in Java spring boot.",
			VisitButton: Button{
				Link: "https://jshort.vlastas.cc/",
			},
			GitHubButton: Button{
				Text: "GitHub",
				Link: "https://github.com/Wlczak/jshort",
			},
			TechStack: "Java, Spring Boot, Sqlite",
		},
		{
			Name:        "Tanks",
			Description: "tankTrouble inspired game with full multiplayer implementation coming someday.",
			VisitButton: Button{
				Link: "https://tanks.vlastas.cc/",
			},
			GitHubButton: Button{
				Text: "GitHub",
				Link: "https://github.com/Wlczak/go-tanks",
			},
			TechStack: "Go, TypeScript, WebSockets",
		},
		{
			Name:        "Blogfinity",
			Description: "A never-ending supply of low quality AI generated articles.",
			VisitButton: Button{
				Link: "https://blogfinity.vlastas.cc/",
			},
			GitHubButton: Button{
				Text: "GitHub",
				Link: "https://github.com/Wlczak/blogfinity",
			},
			TechStack: "Go, WebSockets, Sqlite, JavaScript",
		},
		{
			Name:        "GameList",
			Description: "A gamified todo list.",
			VisitButton: Button{
				Link: "https://gamelist.vlastas.cc/",
			},
			GitHubButton: Button{
				Text: "GitHub",
				Link: "https://github.com/Wlczak/gamelist",
			},
			TechStack: "PHP, JavaScript, MariaDB",
		},
	}
}
