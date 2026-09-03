/**
 * Typesets every visual template, at every grade and difficulty.
 *
 * These figures are raw TikZ built by string concatenation, so a bad coordinate
 * or an unbalanced brace is a compile error that no unit test would catch. This
 * draws each template across the whole range it has to survive and puts the lot
 * through the same engine the browser runs.
 *
 * Usage: node tools/check-visuals.mjs [--draws N]
 * Requires `npm run build:texlive` to have populated .cache/texlive/pool.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { NodePdfTeX } from './lib/node-engine.mjs';
import { VISUAL_PROBLEMS } from '../js/curriculum/templates/visualProblems.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POOL = path.join(ROOT, '.cache', 'texlive', 'pool');

const drawsIndex = process.argv.indexOf('--draws');
const DRAWS = drawsIndex === -1 ? 4 : Number(process.argv[drawsIndex + 1]);

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

/** Every distinct template, with the topic it is reached through. */
const templates = new Map();
for (const [topicId, draws] of Object.entries(VISUAL_PROBLEMS)) {
    for (const draw of draws) {
        if (!templates.has(draw)) templates.set(draw, topicId);
    }
}

const engine = new NodePdfTeX({ engineDir: path.join(ROOT, 'vendor', 'swiftlatex'), poolDir: POOL });
await engine.start();

const failures = [];
let drawn = 0;

for (const [draw, topicId] of templates) {
    const blocks = [];

    for (const grade of GRADES) {
        for (const difficulty of DIFFICULTIES) {
            for (let i = 0; i < DRAWS; i += 1) {
                const ctx = { grade, difficulty, maxNumber: 20, maxDenominator: 12 };
                let problem;
                try {
                    problem = draw(ctx);
                } catch (error) {
                    failures.push(`${draw.name}: threw at grade ${grade} ${difficulty} - ${error.message}`);
                    continue;
                }

                if (!problem?.figure?.includes('tikzpicture')) {
                    failures.push(`${draw.name}: no figure at grade ${grade} ${difficulty}`);
                    continue;
                }
                if (/NaN|undefined|Infinity/.test(problem.figure + problem.answer)) {
                    failures.push(`${draw.name}: bad value at grade ${grade} ${difficulty}`);
                    continue;
                }

                blocks.push(problem.figure);
                drawn += 1;
            }
        }
    }

    // One document per template, so a failure names the template that caused it.
    const source = [
        '\\documentclass[11pt]{article}',
        '\\usepackage[letterpaper,margin=12mm]{geometry}',
        '\\usepackage{amsmath}\\usepackage{amssymb}\\usepackage{tikz}',
        '\\setlength{\\parindent}{0pt}\\pagestyle{empty}',
        '\\begin{document}',
        blocks.join('\\hspace{4mm}\n'),
        '\\end{document}',
        '',
    ].join('\n');

    const result = await engine.compile(source, 1);
    if (result.status !== 0) {
        const reason = (/^!.*$/m.exec(result.log) || ['unknown'])[0];
        failures.push(`${draw.name} (${topicId}): ${reason}`);
        fs.mkdirSync(path.join(ROOT, '.cache', 'visual-failures'), { recursive: true });
        fs.writeFileSync(path.join(ROOT, '.cache', 'visual-failures', `${draw.name}.tex`), source);
        fs.writeFileSync(path.join(ROOT, '.cache', 'visual-failures', `${draw.name}.log`), result.log);
        process.stdout.write(`FAIL ${draw.name}: ${reason}\n`);
    } else {
        process.stdout.write(`ok   ${draw.name} (${blocks.length} figures)\n`);
    }
}

process.stdout.write(`\n${templates.size} templates, ${drawn} figures drawn, ${failures.length} problems.\n`);
if (failures.length > 0) {
    process.stdout.write(`${failures.join('\n')}\nSources in .cache/visual-failures/\n`);
    process.exit(1);
}
