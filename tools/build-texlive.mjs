/**
 * Builds `vendor/texlive/texlive.bundle.gz`.
 *
 * The app ships the slice of TeX Live its worksheets need, because SwiftLaTeX's
 * hosted package service is gone and a per-file fetch would be far too slow.
 * This script downloads the upstream TeX Live packages, builds the pdfLaTeX
 * format dump with the same WebAssembly engine the browser runs, discovers the
 * exact file set by typesetting probe documents, and writes one compressed
 * archive.
 *
 * Usage: node tools/build-texlive.mjs [--fresh]
 *
 * The output is committed, so this only needs re-running when the template
 * grows a dependency or the engine is updated.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { NodePdfTeX } from './lib/node-engine.mjs';
import { buildWorksheet } from '../js/latex/worksheet.js';
import { VISUAL_PROBLEMS } from '../js/curriculum/templates/visualProblems.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, '.cache', 'texlive');
const DOWNLOADS = path.join(CACHE, 'downloads');
const POOL = path.join(CACHE, 'pool');
const ENGINE_DIR = path.join(ROOT, 'vendor', 'swiftlatex');
const OUTPUT_DIR = path.join(ROOT, 'vendor', 'texlive');

const CTAN_ARCHIVE = 'https://mirror.ctan.org/systems/texlive/tlnet/archive';

/** TeX Live packages the worksheet template draws on, directly or indirectly. */
const PACKAGES = [
    // format construction
    'tex-ini-files', 'latex', 'latexconfig', 'hyphen-base', 'firstaid',
    'l3kernel', 'unicode-data', 'etex', 'pdftex', 'knuth-lib',
    // document packages
    'amsmath', 'amsfonts', 'geometry', 'graphics', 'graphics-def', 'graphics-cfg',
    'tools', 'iftex', 'fancyhdr', 'lastpage',
    // diagrams: TikZ, plus the support packages pgf loads
    'pgf', 'xcolor', 'epstopdf-pkg', 'kvoptions', 'infwarerr', 'ltxcmds',
    'pdftexcmds', 'grfext', 'kvsetkeys', 'etexcmds', 'kvdefinekeys', 'pdfescape',
    // fonts
    'cm', 'latex-fonts',
];

/** Font map files merged into the `pdftex.map` pdfTeX looks for by name. */
const MAP_SOURCES = ['cm.map', 'cmextra.map', 'latxfont.map', 'symbols.map', 'cmtext-bsr-interpolated.map'];

const FORMAT_NAME = 'swiftlatexpdftex.fmt';

/**
 * Probe documents. Between them these must exercise every macro, font size and
 * option combination the app can emit, since only the files they touch ship.
 */
const PROBES = probeDocuments();

async function main() {
    if (process.argv.includes('--fresh')) fs.rmSync(CACHE, { recursive: true, force: true });
    fs.mkdirSync(DOWNLOADS, { recursive: true });
    fs.mkdirSync(POOL, { recursive: true });
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    await downloadPackages();
    writeFontMap();

    const engine = new NodePdfTeX({ engineDir: ENGINE_DIR, poolDir: POOL });
    await engine.start();

    console.log('Building the pdfLaTeX format...');
    const format = await engine.buildFormat();
    fs.writeFileSync(path.join(POOL, FORMAT_NAME), format);
    console.log(`  ${FORMAT_NAME}: ${mb(format.length)}`);

    // A fresh engine picks the format up through the normal lookup path.
    const probeEngine = new NodePdfTeX({ engineDir: ENGINE_DIR, poolDir: POOL });
    await probeEngine.start();

    for (const [name, source] of Object.entries(PROBES)) {
        const result = await probeEngine.compile(source);
        if (result.status !== 0) {
            fs.writeFileSync(path.join(CACHE, `${name}.log`), result.log);
            fs.writeFileSync(path.join(CACHE, `${name}.tex`), source);
            throw new Error(`probe "${name}" did not compile; see .cache/texlive/${name}.log`);
        }
        console.log(`  probe ${name}: ${mb(result.pdf.length)} PDF`);
    }

    // Probes cannot cover every font size and shape LaTeX might reach for, and
    // a missing .pfb is a hard failure mid-compile. Metrics and Computer Modern
    // / AMS outlines are small enough to ship whole, so the set is closed over
    // them rather than left to chance.
    const used = new Set([
        ...probeEngine.used,
        FORMAT_NAME,
        ...poolFiles(/\.tfm$/),
        ...poolFiles(/\.fd$/),
        ...poolFiles(/^(cm|ms)[a-z0-9]*\.pfb$/),
    ]);
    console.log(`\n${probeEngine.used.size} files used by the probes, ${used.size} shipped.`);

    writeBundle(used);
}

/* -------------------------------------------------------------------------- */

/** Names in the pool matching `pattern`. */
function poolFiles(pattern) {
    return fs.readdirSync(POOL).filter((name) => pattern.test(name));
}

async function downloadPackages() {
    for (const name of PACKAGES) {
        const archive = path.join(DOWNLOADS, `${name}.tar.xz`);
        if (!fs.existsSync(archive)) {
            console.log(`Downloading ${name}...`);
            const response = await fetch(`${CTAN_ARCHIVE}/${name}.tar.xz`);
            if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
            fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
        }

        const extracted = path.join(DOWNLOADS, name);
        const marker = path.join(extracted, '.extracted');
        if (!fs.existsSync(marker)) {
            fs.rmSync(extracted, { recursive: true, force: true });
            fs.mkdirSync(extracted, { recursive: true });
            // A relative path keeps GNU tar from reading "C:" as a remote host.
            execFileSync('tar', ['-xf', path.relative(extracted, archive)], { cwd: extracted });
            fs.writeFileSync(marker, '');
        }
        flattenInto(extracted, POOL);
    }
}

/**
 * kpathsea asks for files by bare name, so the whole tree collapses into one
 * flat pool. Documentation and sources are dropped.
 */
function flattenInto(directory, pool) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'doc' || entry.name === 'source' || entry.name === 'tlpkg') continue;
            flattenInto(full, pool);
        } else if (entry.name !== '.extracted') {
            fs.copyFileSync(full, path.join(pool, entry.name));
        }
    }
}

/** pdfTeX looks for a single `pdftex.map`; TeX Live builds it with updmap. */
function writeFontMap() {
    const parts = MAP_SOURCES
        .map((name) => path.join(POOL, name))
        .filter((file) => fs.existsSync(file))
        .map((file) => fs.readFileSync(file));
    fs.writeFileSync(path.join(POOL, 'pdftex.map'), Buffer.concat(parts));
}

/**
 * Writes the container: "TEXB", a uint32 index length, a JSON index of
 * {name: [offset, length]}, then the file bytes; gzipped as a whole.
 */
function writeBundle(names) {
    const index = {};
    const blobs = [];
    let offset = 0;

    for (const name of [...names].sort()) {
        const file = path.join(POOL, name);
        if (!fs.existsSync(file)) continue;
        const data = fs.readFileSync(file);
        index[name] = [offset, data.length];
        blobs.push(data);
        offset += data.length;
    }

    const indexBytes = Buffer.from(JSON.stringify(index), 'utf8');
    const header = Buffer.alloc(8);
    header.write('TEXB', 0, 'ascii');
    header.writeUInt32LE(indexBytes.length, 4);

    const bundle = Buffer.concat([header, indexBytes, ...blobs]);
    const compressed = zlib.gzipSync(bundle, { level: 9 });

    fs.writeFileSync(path.join(OUTPUT_DIR, 'texlive.bundle.gz'), compressed);
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'manifest.json'),
        `${JSON.stringify({
            built: new Date().toISOString().slice(0, 10),
            source: 'TeX Live via CTAN (mirror.ctan.org/systems/texlive/tlnet)',
            packages: PACKAGES,
            files: Object.keys(index).length,
            bytes: bundle.length,
            compressedBytes: compressed.length,
        }, null, 2)}\n`
    );

    console.log(`\nWrote vendor/texlive/texlive.bundle.gz`);
    console.log(`  ${Object.keys(index).length} files, ${mb(bundle.length)} raw, ${mb(compressed.length)} gzipped`);
}

/** Builds worksheets covering every layout switch, so no file set is missed. */
function probeDocuments() {
    const equations = [
        '12 + 5 = ', '3/4 × 2/5 = ', '√144 + 2³ = ', '__ + 5 = 17',
        '(4 + 5) × 2 ÷ 3 = ', 'x² - 4x + 4 = 0', '45° ÷ 3 = ', 'π × 7² ≈ ',
        'sin(30°) = ', '2 3/4 + 1 1/2 = ', '-8 ± 4 = ', '5 ≤ x ≤ 12',
    ];
    const words = [
        'A store sells 12 apples for $4.50. How much do 30 apples cost?',
        'A tank holds 12.5 L of water and loses 0.4 L per hour — when is it empty?',
        'A rectangle measures 8 cm × 5 cm. What is its area in cm²?',
        'If 35% of a class of 40 students play piano, how many students is that?',
    ];

    // Every figure kind the app can draw, so the probe pulls in every TikZ
    // library those figures need.
    const visuals = [
        'counting-quantity', 'fractions', 'area-perimeter', 'pythagorean-theorem',
        'angles', 'bar-graphs', 'time', 'coordinate-geometry', 'basic-operations',
    ].flatMap((topicId) => VISUAL_PROBLEMS[topicId].map((draw) => {
        const drawn = draw({ maxNumber: 20, maxDenominator: 12 });
        return { question: drawn.question, answer: drawn.answer, figure: drawn.figure, type: 'visual' };
    }));

    const toProblems = (questions, type) => questions.map((question, index) => ({
        question,
        answer: type === 'word' ? `${index + 1} units` : `${index + 1}/${index + 2}`,
        type,
    }));

    const base = {
        pdfTitle: 'Practice Worksheet — Grade 7',
        showTitle: 'all',
        showName: true,
        showDate: true,
        showScore: true,
        showGrade: true,
        showNumberCircles: false,
        pageNumberPosition: 'bottom-center',
        showPageNumberBox: false,
        showPageBorder: false,
        answerKey: 'separate',
        paperSize: 'letter',
    };

    const pages = [
        { type: 'equations', problems: toProblems(equations, 'equations') },
        { type: 'word', problems: toProblems(words, 'word') },
        { type: 'visual', problems: visuals },
    ];

    return {
        plain: buildWorksheet(base, pages),
        decorated: buildWorksheet(
            { ...base, showNumberCircles: true, showPageBorder: true, showPageNumberBox: true, paperSize: 'a4' },
            pages
        ),
        minimal: buildWorksheet(
            {
                ...base,
                showTitle: 'no',
                showName: false,
                showDate: false,
                showScore: false,
                showGrade: false,
                pageNumberPosition: 'top-right',
                answerKey: 'none',
            },
            pages
        ),
        corners: buildWorksheet({ ...base, pageNumberPosition: 'bottom-left' }, pages),
        corners2: buildWorksheet({ ...base, pageNumberPosition: 'bottom-right' }, pages),
    };
}

function mb(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

await main();
