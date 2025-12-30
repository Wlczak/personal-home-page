package main

func getTranslations() map[string]MultiLangString {
	return map[string]MultiLangString{
		"AboutMeHeading": {
			En: "Hi I'm Adam Vlček",
		},
		"AboutMeSubheading": {
			En: "a junior backend software developer",
		},
		"AboutMe1": {
			En: `I'm a developer based in Pilsen, Czechia. I mostly build backends for web applications, but I also enjoy working 
			with embedded systems for their straightforward, hands-on nature.`,
		},
		"AboutMe2": {
			En: `I primarily use PHP and Go for my personal projects, though I like trying out other languages from time
                to time. I'm currently interested in learning Rust and maybe Kotlin for native android development.`,
		},
		"MainUsedLanguages": {En: "My main languages"},
		"ViewMyGitHub": {
			En: "View GitHub",
		},
		"ProjectListHeading": {
			En: "My projects",
			Cs: "Moje projekty",
			Ja: "私のプロジェクト",
		},
		"ProjectListSubheading": {
			En: "A collection of my recent work and experiments",
			Cs: "Sbírka mých nedávných projektů a experimentů",
			Ja: "僕の最近の仕事と実験のコレクション",
		},
		"Language": {
			En: "Language",
			Cs: "Jazyk",
			Ja: "言語",
		},
		"StatusPage": {
			En: "Status page",
			Cs: "Stav stránky",
			Ja: "ステータスページ",
		},
		"Visit": {
			En: "Visit",
			Cs: "Zobrazit",
			Ja: "見る",
		},
	}
}
