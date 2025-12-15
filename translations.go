package main

func getTranslations() map[string]MultiLangString {
	return map[string]MultiLangString{
		"Title": {
			En: "My projects",
			Cs: "Moje projekty",
			Ja: "私のプロジェクト",
		},
		"Language": {
			En: "Language",
			Cs: "Jazyk",
			Ja: "言語",
		},
		"IndexSubHeading": {
			En: "A collection of my recent work and experiments",
			Cs: "Sbírka mých nedávných projektů a experimentů",
			Ja: "僕の最近の仕事と実験のコレクション",
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
