export const locales = ['en', 'cs', 'ja'] as const;
export type Locale = typeof locales[number];
export function url(locale: Locale, page = '') {
  return `${locale === 'en' ? '/' : `/${locale}/`}${page ? `${page.replace(/^\/+|\/+$/g, '')}/` : ''}`;
}
export const languageNames = { en: 'English', cs: 'Česky', ja: '日本語' };
const en = {
  home: 'Home', about: 'About', projects: 'Projects', skip: 'Skip to content',
  language: 'Language', theme: 'Toggle color theme', commands: 'Quick navigation', close: 'Close',
  heroLead: 'A little curiosity.', heroEnd: 'A lot of building.',
  heroText: 'Backends, browser experiments, and the occasional bit of hardware. Welcome to my corner of the internet.',
  explore: 'Explore my projects', meet: 'Meet the developer', location: 'Pilsen, Czechia', role: 'Junior backend developer',
  featured: 'A few things I’ve made', featuredIntro: 'Useful tools, small games, and ideas that became code.', allProjects: 'All projects',
  interests: 'What keeps me curious', web: 'Web & tools', games: 'Games', hardware: 'Hardware',
  webText: 'From food preorders to lyric syncing: web applications with PHP, Go, and Java.',
  gamesText: 'A Java platformer, a tank game, and a to-do list with a playful twist.',
  hardwareText: 'Small displays and embedded systems. Sometimes the best interface is a few physical buttons.',
  contactTitle: 'Keep in touch', contactText: 'You can find my code and follow what I’m building on GitHub.', github: 'Find me on GitHub',
  status: 'Service status', footer: 'Built with Go, Astro & a little curiosity.',
  aboutTitle: 'The person behind the pixels', aboutDescription: 'Meet Adam Vlček, a junior backend developer in Pilsen working with PHP, Go, Java, and embedded systems.',
  aboutLabel: 'About me', toolkit: 'My toolkit', learning: 'Always learning', approach: 'How I explore',
  approachText: 'My projects range from practical web utilities to music tools, games, and microcontroller libraries. Each one is a way to try a different problem or technology.',
  projectsTitle: 'The project directory', projectsIntro: 'Projects, experiments, and tools. Different stacks. Plenty of curiosity. Browse the things I’ve built and the experiments still taking shape.',
  search: 'Search projects', searchPlaceholder: 'Try “Go”, “lyrics”, or “game”…', filter: 'Filter by category', all: 'Everything',
  results: 'projects shown', empty: 'No projects match. Try another search or category.', reset: 'Reset filters',
  detail: 'Open project', purpose: 'The idea', implementation: 'Under the hood', technologies: 'Tech stack',
  visit: 'Visit website', download: 'Download release', play: 'Play the game', source: 'View source',
  unavailable: 'Separate release in preparation', illustration: 'Project illustration · not a screenshot',
  back: 'Back to projects', more: 'Keep exploring', notFound: 'This file seems to be missing.',
  notFoundText: 'The page you’re looking for isn’t in this directory. Let’s get you back to somewhere familiar.',
  returnHome: 'Return home', nojs: 'All projects are listed below. Enable JavaScript to search and filter.',
  paletteHint: 'Search pages and projects', paletteEmpty: 'No matching pages.', identity: 'Adam Vlček — backend developer',
  homeDescription: 'Adam Vlček is a junior backend developer in Pilsen, Czechia. Explore PHP, Go, and Java projects, browser games, music tools, and embedded experiments.',
};
type Messages = typeof en;
export const messages: Record<Locale, Messages> = {
  en,
  cs: {
    home: 'Domů', about: 'O mně', projects: 'Projekty', skip: 'Přejít na obsah', language: 'Jazyk', theme: 'Přepnout barevný motiv', commands: 'Rychlá navigace', close: 'Zavřít',
    heroLead: 'Trochu zvědavosti.', heroEnd: 'Spousta tvoření.', heroText: 'Backendy, pokusy v prohlížeči a občas kousek hardwaru. Vítejte v mém koutku internetu.',
    explore: 'Prozkoumat projekty', meet: 'Poznat vývojáře', location: 'Plzeň, Česko', role: 'Junior backend vývojář',
    featured: 'Pár věcí, které jsem vytvořil', featuredIntro: 'Užitečné nástroje, malé hry a nápady, ze kterých se stal kód.', allProjects: 'Všechny projekty',
    interests: 'Co mě zajímá', web: 'Web a nástroje', games: 'Hry', hardware: 'Hardware',
    webText: 'Od předobjednávek jídla po synchronizaci textů: webové aplikace s PHP, Go a Javou.', gamesText: 'Java plošinovka, tanková hra a úkolníček s hravým nádechem.', hardwareText: 'Malé displeje a embedded systémy. Někdy je nejlepším rozhraním pár fyzických tlačítek.',
    contactTitle: 'Zůstaňme v kontaktu', contactText: 'Můj kód a to, na čem pracuji, najdete na GitHubu.', github: 'Najdete mě na GitHubu', status: 'Stav služeb', footer: 'Vytvořeno s Go, Astro a trochou zvědavosti.',
    aboutTitle: 'Člověk za pixely', aboutDescription: 'Poznejte Adama Vlčka, junior backend vývojáře z Plzně, který pracuje s PHP, Go, Javou a embedded systémy.', aboutLabel: 'O mně', toolkit: 'Moje nástroje', learning: 'Stále se učím', approach: 'Jak zkoumám',
    approachText: 'Moje projekty sahají od praktických webových nástrojů přes hudební aplikace a hry až po knihovny pro mikrokontroléry. Každý je příležitostí vyzkoušet jiný problém nebo technologii.',
    projectsTitle: 'Adresář projektů', projectsIntro: 'Projekty, experimenty a nástroje. Různé technologie. Spousta zvědavosti. Prohlédněte si, co jsem vytvořil, i experimenty, které se teprve formují.',
    search: 'Hledat projekty', searchPlaceholder: 'Zkuste „Go“, „texty“ nebo „hra“…', filter: 'Filtrovat podle kategorie', all: 'Všechno', results: 'zobrazených projektů', empty: 'Žádný projekt neodpovídá. Zkuste jiné hledání nebo kategorii.', reset: 'Zrušit filtry',
    detail: 'Otevřít projekt', purpose: 'Nápad', implementation: 'Pod kapotou', technologies: 'Technologie', visit: 'Navštívit web', download: 'Stáhnout vydání', play: 'Hrát hru', source: 'Zdrojový kód', unavailable: 'Samostatné vydání se připravuje', illustration: 'Ilustrace projektu · není snímek obrazovky',
    back: 'Zpět na projekty', more: 'Pokračovat v prohlížení', notFound: 'Tento soubor se někam zatoulal.', notFoundText: 'Hledaná stránka v tomto adresáři není. Vraťme se na známé místo.', returnHome: 'Vrátit se domů', nojs: 'Níže jsou všechny projekty. Pro hledání a filtrování povolte JavaScript.', paletteHint: 'Hledat stránky a projekty', paletteEmpty: 'Žádné odpovídající stránky.', identity: 'Adam Vlček — backend vývojář',
    homeDescription: 'Adam Vlček je junior backend vývojář z Plzně. Prozkoumejte projekty v PHP, Go a Javě, hry, hudební nástroje a embedded experimenty.',
  },
  ja: {
    home: 'ホーム', about: '自己紹介', projects: 'プロジェクト', skip: '本文へ移動', language: '言語', theme: '配色を切り替える', commands: 'クイックナビゲーション', close: '閉じる',
    heroLead: '小さな好奇心。', heroEnd: 'たくさんのものづくり。', heroText: 'バックエンド、ブラウザーでの実験、ときどきハードウェア。私のインターネットの片隅へようこそ。', explore: 'プロジェクトを見る', meet: '開発者を知る', location: 'チェコ・ピルゼン', role: 'ジュニアバックエンドエンジニア',
    featured: '作ってきたもの', featuredIntro: '便利なツール、小さなゲーム、コードになったアイデア。', allProjects: 'すべてのプロジェクト', interests: '興味のあること', web: 'ウェブ・ツール', games: 'ゲーム', hardware: 'ハードウェア',
    webText: '食べ物の事前注文から歌詞同期まで。PHP、Go、Javaで作るウェブアプリ。', gamesText: 'Javaのプラットフォーマー、戦車ゲーム、遊び心のあるタスクリスト。', hardwareText: '小さなディスプレイと組み込みシステム。物理ボタンが最適なインターフェースになることも。',
    contactTitle: 'つながりましょう', contactText: 'コードや制作中のものはGitHubで見られます。', github: 'GitHubで見る', status: 'サービスの稼働状況', footer: 'GoとAstro、そして少しの好奇心で制作。',
    aboutTitle: 'ピクセルの向こうの人', aboutDescription: 'チェコのピルゼンでPHP、Go、Java、組み込みシステムを扱うジュニアバックエンドエンジニア、Adam Vlčekの紹介。', aboutLabel: '自己紹介', toolkit: '使っている技術', learning: '学び続ける', approach: '探求のしかた', approachText: '実用的なウェブツールから音楽アプリ、ゲーム、マイコン用ライブラリまで、いろいろなものを作っています。それぞれが、新しい課題や技術を試すきっかけです。',
    projectsTitle: 'プロジェクトディレクトリ', projectsIntro: 'プロジェクト、実験、ツール。さまざまな技術。たくさんの好奇心。作ったものや、まだ形になりつつある実験をご覧ください。', search: 'プロジェクトを検索', searchPlaceholder: '「Go」「歌詞」「ゲーム」など…', filter: 'カテゴリーで絞り込む', all: 'すべて', results: '件のプロジェクト', empty: '一致するプロジェクトがありません。検索やカテゴリーを変更してください。', reset: '絞り込みをリセット',
    detail: 'プロジェクトを見る', purpose: 'アイデア', implementation: '仕組みと技術', technologies: '技術スタック', visit: 'サイトを見る', download: 'リリースをダウンロード', play: 'ゲームで遊ぶ', source: 'ソースを見る', unavailable: '独立したリリースを準備中', illustration: 'プロジェクトのイラスト · スクリーンショットではありません',
    back: 'プロジェクトに戻る', more: 'ほかの作品を見る', notFound: 'このファイルは見つかりません。', notFoundText: 'お探しのページは、このディレクトリにはありません。ホームへ戻りましょう。', returnHome: 'ホームへ戻る', nojs: 'すべてのプロジェクトを下に掲載しています。検索にはJavaScriptを有効にしてください。', paletteHint: 'ページとプロジェクトを検索', paletteEmpty: '一致するページがありません。', identity: 'Adam Vlček — バックエンドエンジニア',
    homeDescription: 'チェコのピルゼンを拠点とするジュニアバックエンドエンジニア、Adam Vlček。PHP、Go、Javaの作品、ゲーム、音楽ツール、組み込みの実験をご覧ください。',
  },
};
