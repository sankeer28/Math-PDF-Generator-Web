# Vendored third-party components

Both directories here are build outputs, not hand-edited source.

## `swiftlatex/`

`swiftlatexpdftex.js` and `swiftlatexpdftex.wasm` are taken unmodified from the SwiftLaTeX
release `v20022022` (<https://github.com/SwiftLaTeX/SwiftLaTeX/releases>).

Copyright (C) 2019 Elliott Wen.
Licensed under EPL-2.0, or GPL-2.0 with the Classpath exception.

`pdftex-worker.js` is ours. It wraps the engine and replaces its file lookup: upstream resolves
every `.cls`, `.sty`, `.tfm` and `.pfb` with a synchronous XHR against `texlive2.swiftlatex.com`,
which is no longer reachable. The worker serves those files from the bundle below instead.

## `texlive/`

`texlive.bundle.gz` holds the TeX Live files the worksheet template needs, plus the pdfLaTeX
format dump, in one gzipped archive. `manifest.json` records when it was built, which upstream
packages it came from, and how large it is.

Regenerate with:

```bash
npm run build:texlive
```

TeX Live components are distributed under the LPPL and other free licences. Sources are the
CTAN TeX Live package archives (<https://mirror.ctan.org/systems/texlive/tlnet/archive>).
