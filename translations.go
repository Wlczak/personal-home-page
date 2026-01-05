package main

func getTranslations() map[string]MultiLangString {
	return map[string]MultiLangString{
		"AboutMeHeading": {
			En: "Hi I'm Adam Vlček",
			Cs: "Ahoj, jsem Adam Vlček",
			Ja: "こんにちは、Adam Vlčekです",
		},
		"AboutMeSubheading": {
			En: "a junior backend software developer",
			Cs: "junior backend software developer",
			Ja: "ジュニアバックエンドエンジニア",
		},
		"AboutMe1": {
			En: `I'm a developer based in Pilsen, Czechia. I mostly build backends for web applications, but I also enjoy working 
			with embedded systems for their straightforward, hands-on nature.`,
			Cs: `Jsem Plzeňský vývojář. Nejčastěji tvořím backendy pro webovky, ale rád pracuji třeba i s embedded systémy kvůli příme práci s hardwarem bez abstrakcí.`,
			Ja: `チェコのピルゼン（Plzeň）を拠点にしている開発者です。主にウェブアプリケーションのバックエンドを構築していますが、直接的で実践的な性質が好きなので組み込みシステムの開発も楽しんでいます。`,
		},
		"AboutMe2": {
			En: `I primarily use PHP and Go for my personal projects, though I like trying out other languages from time
                to time. I'm currently interested in learning Rust and maybe Kotlin for native android development.`,
			Cs: `Ve svých projektech nejčastěji využívám jazyky PHP a Go, ale rád zkouším a učím se práci s novými jazyky, či technologiemi. Aktuálně mám zájem se naučit Rust a možná Kotlin pro nativní android vývoj.`,
			Ja: `個人プロジェクトでは主にPHPとGoを使っていますが、時々他の言語を試すのも好きです。現在はRustを学びたいと考えており、ネイティブAndroid開発のためにKotlinも学んでみたいと思っています。`,
		},
		"MainUsedLanguages": {
			En: "My main languages",
			Cs: "Moje nejpoužívanější jazyky",
			Ja: "主に使っている言語",
		},

		"ViewMyGitHub": {
			En: "View GitHub",
			Cs: "Zobrazit GitHub",
			Ja: "GitHub を見る",
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
