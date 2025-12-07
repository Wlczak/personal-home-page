package main

func getTranslations() map[string]MultiLangString {
	return map[string]MultiLangString{
		"Title": {
			En: "My projects",
			Cs: "Moje projekty",
			Jp: "私のプロジェクト",
		},
		"Language": {
			En: "Language",
			Cs: "Jazyk",
			Jp: "言語",
		},
		"IndexSubHeading": {
			En: "A collection of my recent work and experiments",
			Cs: "Sbírka mých nedávných projektů a experimentů",
			Jp: "僕の最近の仕事と実験のコレクション",
		},
		"StatusPage": {
			En: "Status page",
			Cs: "Stav stránky",
			Jp: "ステータスページ",
		},
		"Visit": {
			En: "Visit",
			Cs: "Zobrazit",
			Jp: "見る",
		},
	}
}
