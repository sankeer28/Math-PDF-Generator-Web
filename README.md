# [Math-PDF-Generator-Web](https://sankeer28.github.io/Math-PDF-Generator-Web/)

Generate printable math worksheets — with answer keys — for kindergarten through grade 12.

Worksheets are typeset by **real LaTeX**: a build of pdfTeX compiled to WebAssembly that runs
**entirely in your browser**. There is no server, no upload and no account. The site is plain
static files, so it works from GitHub Pages, and once the engine is cached it works offline.

This is the web version of the [Math PDF Generator I made in Python](https://github.com/sankeer28/Math-PDF-Generator).

## Why LaTeX

The previous version drew each worksheet with `jsPDF`, one text call at a time. That meant
hand-rolled line wrapping, ASCII stand-ins for real notation (`pi`, `x`, `/`), and layout that
had to be nudged by hand. LaTeX does the typesetting properly:

| | Before (jsPDF) | Now (pdfTeX) |
|---|---|---|
| Fractions | `3/4` | genuine stacked fractions |
| Radicals | `sqrt(144)` | `√144` with a real vinculum |
| Multiplication | ` x ` | `×` |
| Degrees, π, θ, ≤ | spelled out in ASCII | typeset as symbols |
| Line breaking | custom, with a 65% width fudge for a known jsPDF bug | TeX's paragraph breaker |
| Output | one hard-coded layout | a LaTeX document you can read, copy and adapt |

Every preview also shows the generated LaTeX source, so a worksheet can be taken into Overleaf
and edited further.

## Features

- Kindergarten through grade 12, across arithmetic, measurement, algebra, geometry,
  statistics, trigonometry, pre-calculus and calculus
- Equation pages, word-problem pages, or an alternating mix
- Optional answer key, name/date/score/grade fields, page border, circled question numbers,
  configurable page numbers, Letter or A4
- Generate many worksheets at once — each gets its own problems, and they download as a ZIP
- Runs offline after the first visit; nothing you type leaves your machine

## Running locally

The app uses ES modules and a web worker, so it needs to be served over HTTP.

```bash
npm start          # serves the repository on http://localhost:8000
npm test           # unit tests for the LaTeX and ZIP layers
npm run sample     # typeset a sample worksheet to .cache/sample.pdf
```

Nothing is installed: `npm start` and `npm test` use only Node's standard library.

## How it works

```
form options ──▶ problemGenerator ──▶ worksheet.js ──▶ .tex ──▶ pdfTeX (WASM) ──▶ PDF ──▶ ZIP
                 (curriculum data)     (escape.js)              in a Web Worker
```

| Path | What lives there |
|---|---|
| `js/curriculum/` | grade levels, subjects, topics and word-problem contexts |
| `js/modules/problemGenerator.js` | problem generation and de-duplication |
| `js/latex/escape.js` | text and expressions → LaTeX (fractions, radicals, symbols) |
| `js/latex/worksheet.js` | builds the LaTeX document from the form options |
| `js/latex/engine.js` | promise API over the pdfTeX worker |
| `js/modules/zip.js` | a small ZIP writer, so no ZIP library is needed |
| `vendor/swiftlatex/` | the pdfTeX WebAssembly engine and its worker |
| `vendor/texlive/` | the slice of TeX Live the worksheets need |
| `tools/` | build, test and dev-server scripts |

### The TeX Live bundle

pdfTeX needs `article.cls`, the AMS packages, font metrics and Type 1 outlines at run time.
Upstream SwiftLaTeX fetched these one at a time from a hosted service that no longer exists,
so this repository ships them instead: `tools/build-texlive.mjs` downloads the upstream
packages from CTAN, builds the pdfLaTeX format dump with the same WebAssembly engine the
browser runs, and packs everything into one gzipped archive
(`vendor/texlive/texlive.bundle.gz`, about 5.7 MB compressed).

The browser fetches that archive once, keeps it in the HTTP cache, and answers every one of
pdfTeX's file lookups from memory. Typesetting a worksheet then takes roughly a quarter of a
second.

Re-run the build only when the document template gains a dependency:

```bash
npm run build:texlive
```

## Limitations

- The first visit downloads about 7 MB (engine plus TeX bundle). After that it is cached.
- Generating dozens of worksheets takes a few seconds each — they are typeset one at a time.

## Licences

The app is GPL-3.0 licensed (see `LICENSE`). It bundles third-party components under their own terms:

- **SwiftLaTeX pdfTeX** (`vendor/swiftlatex/`) — EPL-2.0 or GPL-2.0 with Classpath exception,
  from <https://github.com/SwiftLaTeX/SwiftLaTeX>
- **TeX Live** (`vendor/texlive/`) — LPPL and other free licences; see
  `vendor/texlive/manifest.json` for the exact package list
