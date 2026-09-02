/**
 * Typesets a worksheet for every grade and subject the app offers.
 *
 * The problem generator emits notation the LaTeX layer has to understand, and a
 * single mishandled string ("log₁₀" becoming two subscripts, say) fails the
 * whole compile at run time. This sweep catches that before a user does.
 *
 * Usage: node tools/check-curriculum.mjs [--samples N]
 * Requires `npm run build:texlive` to have populated .cache/texlive/pool.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { NodePdfTeX } from './lib/node-engine.mjs';
import { buildWorksheet, PROBLEMS_PER_PAGE } from '../js/latex/worksheet.js';
import { ProblemGenerator } from '../js/modules/problemGenerator.js';
import { GRADE_CONFIGS } from '../js/modules/constants.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POOL = path.join(ROOT, '.cache', 'texlive', 'pool');
const FAILURES = path.join(ROOT, '.cache', 'curriculum-failures');

const samplesIndex = process.argv.indexOf('--samples');
const SAMPLES = samplesIndex === -1 ? 3 : Number(process.argv[samplesIndex + 1]);

const OPTIONS = {
    pdfTitle: 'Curriculum Check',
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
};

const OPERATIONS = ['addition', 'subtraction', 'multiplication', 'division'];

// Silence the generator's own chatter so failures stand out.
console.log = () => {};
console.warn = () => {};
const report = process.stdout.write.bind(process.stdout);

function buildPage(generator, type, topics) {
    const problems = [];
    for (let index = 0; index < PROBLEMS_PER_PAGE[type]; index += 1) {
        const operation = OPERATIONS[index % OPERATIONS.length];
        const { question, answer } = generator.generateUniqueProblem(operation, type, topics);
        problems.push({ question, answer, type });
    }
    return { type, problems };
}

const engine = new NodePdfTeX({ engineDir: path.join(ROOT, 'vendor', 'swiftlatex'), poolDir: POOL });
await engine.start();

fs.rmSync(FAILURES, { recursive: true, force: true });

let checked = 0;
const failures = [];

for (const [grade, config] of Object.entries(GRADE_CONFIGS)) {
    for (const subject of config.subjects) {
        for (const difficulty of ['easy', 'medium', 'hard']) {
            for (let sample = 0; sample < SAMPLES; sample += 1) {
                const generator = new ProblemGenerator();
                generator.setConfig(grade, difficulty, [subject]);
                generator.clearUsedProblems();

                const source = buildWorksheet(OPTIONS, [
                    buildPage(generator, 'equations', 'all'),
                    buildPage(generator, 'word', 'all'),
                ]);

                const result = await engine.compile(source, 1);
                checked += 1;

                if (result.status !== 0) {
                    const name = `${grade}-${subject}-${difficulty}-${sample}`;
                    fs.mkdirSync(FAILURES, { recursive: true });
                    fs.writeFileSync(path.join(FAILURES, `${name}.tex`), source);
                    fs.writeFileSync(path.join(FAILURES, `${name}.log`), result.log);
                    const reason = (/^!.*$/m.exec(result.log) || ['unknown'])[0];
                    failures.push({ name, reason });
                    report(`FAIL ${name}: ${reason}\n`);
                }
            }
        }
        report(`  ${grade}/${subject} checked\n`);
    }
}

report(`\n${checked} worksheets typeset, ${failures.length} failed.\n`);
if (failures.length > 0) {
    report(`Sources and logs written to .cache/curriculum-failures/\n`);
    process.exit(1);
}
