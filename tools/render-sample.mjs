/**
 * Typesets a sample worksheet with the same code the browser runs, so layout
 * changes can be checked without opening a browser.
 *
 * Usage: node tools/render-sample.mjs [outfile.pdf]
 * Requires `node tools/build-texlive.mjs` to have populated .cache/texlive/pool.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { NodePdfTeX } from './lib/node-engine.mjs';
import { buildWorksheet } from '../js/latex/worksheet.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POOL = path.join(ROOT, '.cache', 'texlive', 'pool');
const output = path.resolve(process.argv[2] || path.join(ROOT, '.cache', 'sample.pdf'));

const EQUATIONS = [
    '12 + 5 = ', '3/4 × 2/5 = ', '√144 + 2³ = ', '__ + 5 = 17',
    '(4 + 5) × 2 ÷ 3 = ', 'x² - 4x + 4 = 0', '45° ÷ 3 = ', 'π × 7² ≈ ',
    'sin(30°) = ', '2 3/4 + 1 1/2 = ', '-8 ± 4 = ', '5 ≤ x ≤ 12',
    '144 ÷ 12 = ', '0.75 × 400 = ', '7/8 - 1/4 = ', '2⁵ = ',
    '√81 × 3 = ', '35% of 80 = ', '1250 ÷ 25 = ', '9 × 12 = ',
];

const WORDS = [
    'A store sells 12 apples for $4.50. How much do 30 apples cost?',
    'A tank holds 12.5 L of water and loses 0.4 L per hour — when is it empty?',
    'A rectangle measures 8 cm × 5 cm. What is its area in cm²?',
    'If 35% of a class of 40 students play piano, how many students is that?',
];

const problems = (questions, type) => questions.map((question, index) => ({
    question,
    answer: type === 'word' ? `${(index + 1) * 3} units` : `${index + 1}/${index + 2}`,
    type,
}));

const source = buildWorksheet(
    {
        pdfTitle: 'Practice Worksheet — Grade 7',
        showTitle: 'first',
        showName: true,
        showDate: true,
        showScore: true,
        showGrade: true,
        showNumberCircles: true,
        pageNumberPosition: 'bottom-center',
        showPageNumberBox: false,
        showPageBorder: true,
        answerKey: 'separate',
        paperSize: 'letter',
    },
    [
        { type: 'equations', problems: problems(EQUATIONS, 'equations') },
        { type: 'word', problems: problems(WORDS, 'word') },
        { type: 'equations', problems: problems(EQUATIONS, 'equations') },
    ]
);

fs.writeFileSync(output.replace(/\.pdf$/, '.tex'), source);

const engine = new NodePdfTeX({ engineDir: path.join(ROOT, 'vendor', 'swiftlatex'), poolDir: POOL });
await engine.start();
const result = await engine.compile(source);
fs.writeFileSync(output.replace(/\.pdf$/, '.log'), result.log);

if (result.status !== 0 || !result.pdf) {
    console.error(result.log.split('\n').filter((line) => line.startsWith('!')).join('\n') || result.log.slice(-1500));
    process.exit(1);
}

fs.writeFileSync(output, result.pdf);
console.log(`Wrote ${path.relative(ROOT, output)} (${(result.pdf.length / 1024).toFixed(0)} KB)`);
