# Contributing to TIE Fighter

## Local setup

Install Node.js 24 and npm, then run:

```sh
npm ci
npx playwright install chrome
./scripts/install-hooks.sh
npm run dev
```

Chrome is required for the native WebMCP browser tests.
See [WebMCP setup](docs/webmcp.md) to try the tools manually.

## Checks

```sh
npm run lint
npm test
npm run build
# Or run all of the above:
npm run verify
```

The browser test reporter checks the expected test count; update that expectation
when deliberately adding or removing tests.
Installed hooks run repository checks before commits and pushes; CI runs checks
on pull requests and pushes to main.

## Coding style

Use small JavaScript ES modules and keep handwritten files below 100 lines.
Document necessary exceptions in [codex.md](codex.md) before retaining them.
Use the repository's Oxlint and Biome configuration.
Keep English and Persian copy consistent and preserve right-to-left layout.

## Pull request checklist

- [ ] Repository checks pass.
- [ ] Changed controls and gameplay have been tried in a browser.
- [ ] Both languages work at phone and desktop widths when the UI changes.
- [ ] Documentation reflects behavior changes.

## Publishing follow-ups

After deploying, the site owner can verify the production URL in
[Google Search Console](https://search.google.com/search-console) and
[Bing Webmaster Tools](https://www.bing.com/webmasters), add their issued HTML
verification tags, and submit
[the sitemap](https://cocodedk.github.io/tie-fighter/sitemap.xml).
These account-only steps require owner access and are not part of the build.
