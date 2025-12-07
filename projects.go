package main

type Button struct {
	Text     MultiLangString
	Disabled bool
	Link     string
	Title    MultiLangString
}

type Project struct {
	Name         string
	Description  MultiLangString
	VisitButton  Button
	GitHubButton Button
	TechStack    string
}

type LanguageSelectItem struct {
	Flag string
	Name string
	Code string
}

type MultiLangString struct {
	En string
	Cs string
	Jp string
}

func getLanguages() []LanguageSelectItem {
	return []LanguageSelectItem{
		{
			Name: "English",
			Flag: "🇬🇧",
			Code: "En",
		},
		{
			Name: "Česky",
			Flag: "🇨🇿",
			Code: "Cs",
		},
		{
			Name: "日本語",
			Flag: "🇯🇵",
			Code: "Jp",
		},
	}
}

func getProjects() []Project {
	return []Project{
		{
			Name: "Buffet",
			Description: MultiLangString{
				En: "A food preordering system for fast food and food stands.",
				Cs: "Systém předobjednávání jídla pro rychlé občerstvení a stánky.",
				Jp: "ファーストフードや屋台のための食品事前注文システム。",
			},
			VisitButton: Button{
				Link: "https://buffet.vlastas.cc/",
			},
			GitHubButton: Button{
				Link: "https://github.com/Web-Projekty/buffet-rezervace",
			},
			TechStack: "PHP, Slim, MariaDB, WebSockets",
		},
		{
			Name: "LyLink",
			Description: MultiLangString{
				En: "A multiplatform lyrics tracker that allows you to sync your lyrics live with the music you're listening to.",
				Cs: "Multiplatformní sledovač textů, který umožňuje synchronizovat texty v reálném čase s přehrávanou hudbou.",
				Jp: "音楽を再生している間に歌詞をリアルタイムで同期できるマルチプラットフォーム歌詞トラッカー。",
			},
			VisitButton: Button{
				Link: "https://lylink.vlastas.cc/",
			},
			GitHubButton: Button{
				Link: "https://github.com/wlczak/LyLink",
			},
			TechStack: "PHP, TypeScript, Twig, SQLite",
		},
		{
			Name: "2D platformer",
			Description: MultiLangString{
				En: "A 2D platformer game made with Java swing.",
				Cs: "2D plošinovka vytvořená pomocí Java Swing.",
				Jp: "Java Swingで作られた2Dプラットフォームゲーム。",
			},
			VisitButton: Button{
				Text: MultiLangString{
					En: "Download",
					Cs: "Stáhnout",
					Jp: "ダウンロード",
				},
				Link: "https://github.com/Web-Projekty/vap-projekt/releases/download/0.2.1-beta/0.2.1-beta.jar",
			},
			GitHubButton: Button{
				Link: "https://github.com/Web-projekty/vap-projekt",
			},
			TechStack: "Java, Java Swing",
		},
		{
			Name: "Menu",
			Description: MultiLangString{
				En: "Modular menu library designed for I2C LCD displays. (Tested on 16x2 and 20x4 displays)",
				Cs: "Modulární knihovna menu navržená pro I2C LCD displeje. (Testováno na 16x2 a 20x4 displejích)",
				Jp: "I2C LCDディスプレイ向けに設計されたモジュール式メニューライブラリ。（16x2と20x4でテスト済み）",
			},
			GitHubButton: Button{
				Link:     "https://github.com/Wlczak/Menu",
				Disabled: true,
				Text: MultiLangString{
					En: "Preparing for individual release",
					Cs: "Připravuji pro samostatné vydání",
					Jp: "個別リリース準備中",
				},
			},
			TechStack: "C/C++, Arduino libs, LiquidCrystal I2C library",
		},
		{
			Name: "LyLink-jellyfin",
			Description: MultiLangString{
				En: "A lyllink plugin app for jellyfin integration. Enables live playback sync with the popular streaming service jellyfin.",
				Cs: "Plugin aplikace LyLink pro integraci s Jellyfin. Umožňuje synchronizaci přehrávání.",
				Jp: "Jellyfin統合のためのLyLinkプラグインアプリ。再生の同期を可能にします。",
			},
			VisitButton: Button{
				Text: MultiLangString{
					En: "Download",
					Cs: "Stáhnout",
					Jp: "ダウンロード",
				},
				Link: "https://github.com/Wlczak/lylink-jellyfin/releases/latest",
			},
			GitHubButton: Button{
				Link: "https://github.com/Wlczak/lylink-jellyfin/",
			},
			TechStack: "GO, Fyne",
		},
		{
			Name: "JShort",
			Description: MultiLangString{
				En: "Simple url shortnener app written in Java spring boot.",
				Cs: "Jednoduchá aplikace pro zkracování URL napsaná v Java Spring Boot.",
				Jp: "Java Spring Bootで書かれたシンプルなURL短縮アプリ。",
			},
			VisitButton: Button{
				Link: "https://jshort.vlastas.cc/",
			},
			GitHubButton: Button{
				Link: "https://github.com/Wlczak/jshort",
			},
			TechStack: "Java, Spring Boot, SQLite",
		},
		{
			Name: "Tanks",
			Description: MultiLangString{
				En: "tankTrouble inspired game with full multiplayer implementation coming someday.",
				Cs: "Hra inspirovaná tankTrouble s plánovanou plnou multiplayer implementací.",
				Jp: "tankTroubleに触発されたゲームで、いつかフルマルチプレイヤー実装予定。",
			},
			VisitButton: Button{
				Text: MultiLangString{
					En: "Play",
					Cs: "Hrát",
					Jp: "プレイ",
				},
				Link: "https://tanks.vlastas.cc/",
			},
			GitHubButton: Button{
				Link: "https://github.com/Wlczak/go-tanks",
			},
			TechStack: "Go, TypeScript, WebSockets",
		},
		{
			Name: "Blogfinity",
			Description: MultiLangString{
				En: "A never-ending supply of low quality AI generated articles.",
				Cs: "Nekonečné množství nízkokvalitních AI generovaných článků.",
				Jp: "低品質なAI生成記事が無限に供給されるブログ。",
			},
			VisitButton: Button{
				Link: "https://blogfinity.vlastas.cc/",
			},
			GitHubButton: Button{
				Link: "https://github.com/Wlczak/blogfinity",
			},
			TechStack: "Go, WebSockets, SQLite, JavaScript",
		},
		{
			Name: "GameList",
			Description: MultiLangString{
				En: "A gamified todo list.",
				Cs: "Gamifikovaný todo list.",
				Jp: "ゲーミフィケーションされたToDoリスト。",
			},
			VisitButton: Button{
				Link: "https://gamelist.vlastas.cc/",
			},
			GitHubButton: Button{
				Link: "https://github.com/Wlczak/gamelist",
			},
			TechStack: "PHP, JavaScript, MariaDB",
		},
	}
}
