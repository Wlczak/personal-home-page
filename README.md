# personal-home-page

Adam Vlček’s multilingual retro portfolio: Astro generates the pages, React
islands add project filtering and quick navigation, and Go/Gin serves the
production build. Content is available in English, Czech, and Japanese. No blog.

## Development

Requires **Node 22.12+**, npm 9.6.5+, and **Go 1.26.6**. With nvm, run `nvm use`.

```sh
make install
make dev
```

Open **http://localhost:4321**. One command starts Astro (live updates for content,
styles, and components) and Go on port 8080. Astro proxies `/api` to Go. Ctrl+C
stops both processes. Restart `make dev` after changing Go source. Port 8080 must
be free; the development backend’s port is fixed to match the proxy.

For a production preview, run `make run` and open **http://localhost:8080**.
`make build` creates `dist/` and the `personal-home-page` executable. Run the
executable from the repository root, or set `SITE_DIR` to an absolute build path.
`PORT` defaults to 8080 in production. `GET /api/health` returns `{"status":"ok"}`.

## Content and design

- Edit `src/content/projects.json` for project facts, technology tags, links,
  featured status, and English/Czech/Japanese descriptions and detail copy.
- Edit `src/content/profiles.json` for localized biography and learning interests.
- UI translations live in `src/lib/i18n.ts`; visual tokens live in
  `src/styles/global.css`. Collection schemas validate all three languages.
- Project art is original vector illustration, labeled on detail pages.
  To add a real screenshot, keep it under `src/` and use Astro’s `Image` or `Picture`
  component with responsive sizes and descriptive alt text. The existing logo uses
  that optimization pipeline on the about page.
- English routes use `/`, `/about/`, and `/projects/`; other languages use `/cs/`
  and `/ja/`. Language links preserve the current page. Old `/?lang=En|Cs|Ja`
  links permanently redirect to the corresponding home page.
- All canonical URLs, social previews, and sitemap entries use `https://wlczak.net`.
  Configure old hostnames to redirect to this domain at your reverse proxy.
- Essential content is prerendered and works without JavaScript. Interactivity
  includes project search/filtering, a Ctrl/Cmd+K command palette, and a persisted
  light/dark theme. Reduced-motion preferences disable animation.
- Click the illustrated computer to open a portfolio terminal. It supports
  navigation and editing (`ls`, `cd`, `pwd`, `cat`, `nano`), filesystem operations
  (`mkdir`, `touch`, `cp`, `mv`, `rm`, `rmdir`), search (`find`, `tree`, `grep`),
  text utilities (`head`, `tail`, `wc`, `sort`, `uniq`, `diff`), file information
  (`file`, `stat`, `du`, `basename`, `dirname`), and session utilities (`echo`,
  `whoami`, `id`, `hostname`, `uname`, `date`, `env`, `printenv`, `seq`, `type`,
  `which`, `history`, `clear`, `man`, `help`). `help` lists the supported flags;
  `man command` shows that command’s usage. The virtual filesystem
  starts at `/home/adam` and contains localized biography and project files.
  The Linux-style root layout includes `/bin`, `/boot`, `/dev`, `/etc`, `/home`,
  `/lib`, `/lib64`, `/media`, `/mnt`, `/opt`, `/proc`, `/root`, `/run`, `/sbin`,
  `/srv`, `/sys`, `/tmp`, `/usr`, and `/var`. Explore system information in
  `/etc/os-release`, `/etc/hosts`, `/etc/motd`, and `/proc/version`; `/bin`
  contains descriptions of the available virtual commands.
  Paths support `/`, `~`, `.`, and `..`; `cd -` returns to the previous directory.
  Quoted arguments and escaped spaces work. Commands run in the browser;
  pipes, redirection, command chaining, and host filesystem access are unsupported.
  Fish-style suggestions appear at half opacity, preferring the latest matching
  command in session history. Right Arrow at the end of the line accepts the
  suggestion. Tab cycles matching commands or filesystem paths, Shift+Tab cycles
  backward, and matching options appear below the input and can be clicked.
  Down Arrow enters completion navigation; after Tab or Down Arrow, all four
  arrow keys cycle through the options. Up Arrow otherwise browses history,
  and Enter accepts a selected completion without running the command; press
  Enter again to submit it. Right Arrow otherwise accepts the inline suggestion.
  Ctrl+C cancels the
  current input and completion selection without executing or recording it.
  Completion suggestions show six options per page. Tab and arrow navigation
  automatically reveal the selected option’s page. Previous/Next buttons and
  Page Up/Page Down select the first option on the adjacent page; typing resets
  pagination to the first page.
  `nano [file]` opens a multiline editor (`nano` alone opens `untitled.txt`).
  Ctrl+O saves and Ctrl+X exits, with Save/Discard/Cancel for unsaved changes.
  Ctrl+G shows help; on-screen buttons also work on mobile. Nano can edit existing
  files or create files in existing directories. Saved files appear in `ls`,
  `cat`, and completion suggestions, and are kept until the page reloads.
  System commands include `mount`, `umount`, `df`, `lsblk`, `free`, `ps`, `top`,
  `kill`, `systemctl`, `uptime`, `dmesg`, `lscpu`, `hostnamectl`, `who`, `w`,
  `tty`, and `groups`. These use simulated session state. For example,
  `mount /dev/vdb1 /mnt` exposes a virtual data disk; saved files survive
  `umount /mnt` and remounting until page reload. `mount -t tmpfs scratch /mnt`
  creates temporary storage, discarded on unmount. Mount targets must be empty
  directories. `mount`, `df -h`, `lsblk`, and `/proc/mounts` show current mounts.
  `systemctl status portfolio`, `systemctl stop portfolio`, and
  `systemctl start portfolio` update the virtual service and process table;
  `top` prints a snapshot. These commands do not control the website or host OS.

Custom commands and easter eggs can be registered through the second argument
to `createTerminal` in `src/components/Desktop.astro`. They automatically join
help, command completion, and history suggestions. Handlers receive arguments
and the current directory, plus virtual `readFile` and `saveFile` helpers:

```ts
createTerminal(locale, {
  hello: {
    description: 'A little greeting',
    run: (args, { cwd }) => ({ output: `Hello ${args[0] ?? 'world'} from ${cwd}!` }),
  },
});
```

## Checks

```sh
make check
npm run test:terminal
npx playwright install chromium
make test
```

Browser tests build the production site and start Go on port 8080. They cover all
all localized content pages, SEO metadata, language switching, filters, keyboard interaction,
theme persistence, JavaScript-disabled navigation, mobile layout, and WCAG axe checks.
Go tests cover redirects, caching, HEAD, localized 404s, methods, and file containment.
The development integration test checks both servers, the API proxy, and shutdown.
If port 8080 is already in use, run browser tests on another port with
`PLAYWRIGHT_PORT=18080 npm run test:e2e`.

With `make run` active in another terminal, run `npm run audit` for mobile
Lighthouse audits of home, project listing, and a detail page. JSON reports are
written to ignored `reports/`; the command fails if any category scores below 90.
These are local lab results, not a guarantee of production Core Web Vitals.

## Docker

```sh
make docker-build
make up
```

Open **http://localhost:1234**. The Dockerfile builds Node and Go separately and
packages the static output with the Go executable in an Alpine runtime running as
an unprivileged user. Compose builds the local image; `make down` stops it and
`make logs` follows its output. The image includes a health check.

Discord notifications, visitor cookies, and webhook configuration have been
removed. Requests use standard server logs. Hashed Astro assets receive immutable
caching; HTML is revalidated, and missing pages return HTTP 404.
Text assets use gzip when supported; byte-range requests retain the original
representation. Fonts are served locally and preloaded to reduce layout shifts.

GitHub Actions runs type/build checks, Go checks, and browser tests on pushes and
pull requests. The Docker publishing workflow builds the full image; publishing
occurs through your existing workflow, not local builds.
