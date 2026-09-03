/**
 * Counts how many distinct question *types* each grade and subject can produce.
 *
 * A type is a question with its numbers normalised away, so "12 + 5 =" and
 * "40 + 7 =" count once. That is the number a teacher actually feels: how many
 * genuinely different things a worksheet can ask.
 *
 * Usage: node tools/check-variety.mjs [--draws N] [--min N]
 */

import { ProblemGenerator } from '../js/modules/problemGenerator.js';
import { GRADE_CONFIGS, SUBJECT_TOPICS } from '../js/curriculum/index.js';

const drawsIndex = process.argv.indexOf('--draws');
const DRAWS = drawsIndex === -1 ? 900 : Number(process.argv[drawsIndex + 1]);
const minIndex = process.argv.indexOf('--min');
const TARGET = minIndex === -1 ? 50 : Number(process.argv[minIndex + 1]);

// --visual counts only the questions that come with a figure, which is the
// number that matters when the diagrams are what is being widened.
const VISUAL_ONLY = process.argv.includes('--visual');
const MODES = VISUAL_ONLY ? ['visual'] : ['equations', 'word', 'visual'];

console.log = () => {};
console.warn = () => {};
const say = process.stdout.write.bind(process.stdout);

/** Strips the numbers out of a question, leaving its shape. */
function shape(question) {
    return String(question)
        .replace(/-?\d+(\.\d+)?/g, '#')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

const rows = [];
let worst = Infinity;

for (const grade of Object.values(GRADE_CONFIGS)) {
    for (const subject of grade.subjects) {
        const generator = new ProblemGenerator();
        generator.setConfig(grade.id, 'medium', [subject]);

        const types = new Set();
        for (const problemType of MODES) {
            for (let i = 0; i < DRAWS; i += 1) {
                try {
                    const problem = generator.generateProblem('mixed', problemType, 'all');
                    // In visual mode a problem without a figure is the
                    // no-figures-for-this-grade fallback, not a diagram.
                    if (VISUAL_ONLY && !problem?.figure) continue;
                    if (problem?.question) types.add(shape(problem.question));
                } catch {
                    // A generator that throws on some draw is a separate concern;
                    // variety counting should not stop for it.
                }
            }
        }

        rows.push({ grade: grade.id, subject, types: types.size });
        worst = Math.min(worst, types.size);
    }
}

const byGrade = new Map();
for (const row of rows) {
    if (!byGrade.has(row.grade)) byGrade.set(row.grade, []);
    byGrade.get(row.grade).push(row);
}

say(`Distinct question types per grade and subject (target ${TARGET})\n\n`);
for (const [grade, list] of byGrade) {
    const cells = list.map((row) => {
        const name = SUBJECT_TOPICS[row.subject].name.slice(0, 11);
        const flag = row.types < TARGET ? '*' : ' ';
        return `${name}:${String(row.types).padStart(3)}${flag}`;
    });
    say(`${grade.padEnd(8)} ${cells.join('  ')}\n`);
}

const below = rows.filter((row) => row.types < TARGET);
say(`\n${rows.length} grade/subject pairs, ${below.length} below ${TARGET}. Lowest: ${worst}.\n`);
if (below.length > 0) {
    const sorted = [...below].sort((a, b) => a.types - b.types).slice(0, 15);
    say(`Thinnest:\n${sorted.map((r) => `  ${r.grade}/${r.subject}: ${r.types}`).join('\n')}\n`);
}
