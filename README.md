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

## Checks

```sh
make check
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
