/**
 * Visual problems
 *
 * Questions that need a picture. Each draw returns a `figure` of raw TikZ
 * alongside the question and answer, and the worksheet builder inserts it
 * without escaping.
 *
 * Every template scales itself. The same fraction bar asks for halves in
 * Grade 2, an equivalent fraction in Grade 5 and a percent in Grade 8, and
 * difficulty shifts the task again within a grade. A figure that looked the
 * same for a six-year-old and a sixteen-year-old would be worthless to both.
 *
 * Figures are small and monochrome: these are printed, often photocopied.
 *
 * @module curriculum/templates/visualProblems
 */

import { randomChoice } from '../../modules/utils.js';

/* ------------------------------------------------------------------ tools */

const between = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Trims a float for TikZ, which does not want 0.30000000000000004. */
const n = (value) => Number(Number(value).toFixed(3));

const tikz = (body, options = '') => `\\begin{tikzpicture}[${options}]\n${body}\n\\end{tikzpicture}`;

/** 0 easy, 1 medium, 2 hard. */
const level = (ctx) => ({ easy: 0, medium: 1, hard: 2 }[ctx.difficulty] ?? 1);

/** The grade this sheet is for, as a number. */
const gradeOf = (ctx) => Number(ctx.grade) || 6;

/**
 * Picks the first band whose ceiling the grade has not passed.
 *
 * @param {number} grade
 * @param {Array<[number, *]>} bands - [maxGrade, value], in ascending order
 */
function byGrade(grade, bands) {
    for (const [ceiling, value] of bands) {
        if (grade <= ceiling) return value;
    }
    return bands[bands.length - 1][1];
}

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** "3/4", already reduced. */
function simplify(numerator, denominator) {
    const divisor = gcd(numerator, denominator) || 1;
    return `${numerator / divisor}/${denominator / divisor}`;
}

const rad = (degrees) => (degrees * Math.PI) / 180;

/* ================================================================== NUMBER */

/** A number line: whole numbers, then decimals, then negatives. */
function numberLine(ctx) {
    const grade = gradeOf(ctx);
    const hard = level(ctx) === 2;

    const style = byGrade(grade, [
        [2, 'ones'], [4, 'skip'], [6, 'decimal'], [12, 'integer'],
    ]);

    let start;
    let step;
    let format = (v) => `${n(v)}`;

    if (style === 'ones') {
        start = 0;
        step = 1;
    } else if (style === 'skip') {
        step = randomChoice(hard ? [25, 50, 100] : [2, 5, 10]);
        start = step * between(0, 3);
    } else if (style === 'decimal') {
        step = randomChoice(hard ? [0.05, 0.25] : [0.1, 0.5]);
        start = 0;
        format = (v) => v.toFixed(step < 0.1 ? 2 : (step < 1 ? 1 : 0));
    } else {
        step = randomChoice([1, 2, 5]);
        start = -step * between(3, 5);
    }

    const ticks = between(6, 9);
    const marked = between(1, ticks - 1);
    const value = start + marked * step;
    const unit = n(Math.min(0.9, 6.4 / ticks));

    const labels = Array.from({ length: ticks + 1 }, (_, i) =>
        `\\draw (${n(i * unit)},0.1) -- (${n(i * unit)},-0.1) node[below,font=\\tiny] {$${format(start + i * step)}$};`
    ).join('\n  ');

    return {
        question: 'What number does the arrow point to?',
        answer: format(value),
        figure: tikz(
            `  \\draw[<->] (-0.3,0) -- (${n(ticks * unit + 0.5)},0);\n  ${labels}\n` +
            `  \\draw[->,line width=0.9pt] (${n(marked * unit)},0.7) -- (${n(marked * unit)},0.13);`
        ),
    };
}

/** A shaded bar: naming a fraction, then simplifying, then decimals and percents. */
function fractionBar(ctx) {
    const grade = gradeOf(ctx);
    const hard = level(ctx) === 2;
    const ceiling = Number(ctx.maxDenominator) || 12;

    const choices = byGrade(grade, [
        [2, [2, 3, 4]],
        [4, [2, 3, 4, 5, 6, 8]],
        [6, [4, 5, 6, 8, 10, 12]],
        [12, [6, 8, 9, 10, 12, 16, 20]],
    ]).filter((d) => d <= Math.max(4, ceiling));

    const parts = randomChoice(choices);
    const shaded = between(1, parts - 1);
    const width = n(Math.min(0.55, 5.0 / parts));

    const tasks = [];
    tasks.push(['What fraction of the bar is shaded?', `${shaded}/${parts}`]);
    if (grade >= 3) tasks.push(['What fraction of the bar is NOT shaded?', `${parts - shaded}/${parts}`]);
    if (grade >= 4) tasks.push(['Write the shaded fraction in simplest form.', simplify(shaded, parts)]);
    if (grade >= 5) tasks.push(['Write the shaded amount as a decimal.', n(shaded / parts).toString()]);
    if (grade >= 6 || hard) tasks.push(['Write the shaded amount as a percent.', `${n((shaded / parts) * 100)}%`]);

    const [question, answer] = randomChoice(hard ? tasks.slice(-3) : tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\foreach \\i in {0,...,${shaded - 1}} \\fill[black!25] (\\i*${width},0) rectangle (\\i*${width}+${width},0.5);\n` +
            `  \\foreach \\i in {0,...,${parts - 1}} \\draw (\\i*${width},0) rectangle (\\i*${width}+${width},0.5);`
        ),
    };
}

/** A circle cut into equal sectors, shaded. */
function fractionCircle(ctx) {
    const grade = gradeOf(ctx);
    const parts = randomChoice(byGrade(grade, [[3, [2, 3, 4]], [5, [3, 4, 6, 8]], [12, [5, 6, 8, 10, 12]]]));
    const shaded = between(1, parts - 1);
    const r = 1.05;
    const slice = 360 / parts;

    const wedges = Array.from({ length: shaded }, (_, i) =>
        `  \\fill[black!25] (0,0) -- (${n(r * Math.cos(rad(i * slice)))},${n(r * Math.sin(rad(i * slice)))}) arc (${n(i * slice)}:${n((i + 1) * slice)}:${r}) -- cycle;`
    ).join('\n');

    const spokes = Array.from({ length: parts }, (_, i) =>
        `  \\draw (0,0) -- (${n(r * Math.cos(rad(i * slice)))},${n(r * Math.sin(rad(i * slice)))});`
    ).join('\n');

    return {
        question: grade >= 4 && level(ctx) === 2
            ? 'What fraction of the circle is shaded? Give your answer in simplest form.'
            : 'What fraction of the circle is shaded?',
        answer: grade >= 4 && level(ctx) === 2 ? simplify(shaded, parts) : `${shaded}/${parts}`,
        figure: tikz(`${wedges}\n  \\draw (0,0) circle (${r});\n${spokes}`),
    };
}

/** A hundred grid: hundredths, decimals and percents. */
function hundredGrid(ctx) {
    const grade = gradeOf(ctx);
    const shaded = between(8, 92);
    const cell = 0.15;
    const rows = Math.floor(shaded / 10);
    const rest = shaded % 10;

    const tasks = [
        ['What fraction of the grid is shaded?', `${shaded}/100`],
        ['What percent of the grid is shaded?', `${shaded}%`],
    ];
    if (grade >= 4) tasks.push(['Write the shaded amount as a decimal.', `0.${String(shaded).padStart(2, '0')}`]);
    const [question, answer] = randomChoice(grade >= 5 ? tasks : tasks.slice(0, 2));

    return {
        question,
        answer,
        figure: tikz(
            (rows > 0 ? `  \\fill[black!25] (0,0) rectangle (${n(10 * cell)},${n(rows * cell)});\n` : '') +
            (rest > 0 ? `  \\fill[black!25] (0,${n(rows * cell)}) rectangle (${n(rest * cell)},${n((rows + 1) * cell)});\n` : '') +
            `  \\draw[step=${cell},black!45,line width=0.25pt] (0,0) grid (${n(10 * cell)},${n(10 * cell)});\n` +
            `  \\draw (0,0) rectangle (${n(10 * cell)},${n(10 * cell)});`
        ),
    };
}

/** Base-ten blocks for place value. */
function placeValueBlocks(ctx) {
    const grade = gradeOf(ctx);
    const hundreds = grade <= 2 ? 0 : between(1, 4);
    const tens = between(1, 6);
    const ones = between(1, 9);
    const value = hundreds * 100 + tens * 10 + ones;

    let x = 0;
    const parts = [];
    for (let i = 0; i < hundreds; i += 1) {
        parts.push(`  \\draw[step=0.1,black!45,line width=0.2pt] (${n(x)},0) grid (${n(x + 0.5)},0.5);\n  \\draw (${n(x)},0) rectangle (${n(x + 0.5)},0.5);`);
        x += 0.62;
    }
    for (let i = 0; i < tens; i += 1) {
        parts.push(`  \\draw[step=0.1,black!45,line width=0.2pt] (${n(x)},0) grid (${n(x + 0.1)},0.5);\n  \\draw (${n(x)},0) rectangle (${n(x + 0.1)},0.5);`);
        x += 0.2;
    }
    for (let i = 0; i < ones; i += 1) {
        parts.push(`  \\draw (${n(x)},0) rectangle (${n(x + 0.1)},0.1);`);
        x += 0.16;
    }

    return {
        question: grade >= 3 && level(ctx) === 2
            ? 'What number do these blocks show, and what is the value of its tens digit?'
            : 'What number do these blocks show?',
        answer: grade >= 3 && level(ctx) === 2 ? `${value}, tens digit worth ${tens * 10}` : `${value}`,
        figure: tikz(parts.join('\n')),
    };
}

/** A ten frame, for the earliest grades. */
function tenFrame(ctx) {
    const filled = between(3, 9);
    const cell = 0.32;
    const dots = Array.from({ length: filled }, (_, i) =>
        `  \\filldraw (${n((i % 5) * cell + cell / 2)},${n(Math.floor(i / 5) * cell + cell / 2)}) circle (2pt);`
    ).join('\n');

    return {
        question: randomChoice([
            'How many counters are shown?',
            'How many more counters are needed to fill the frame?',
        ]) === 'How many counters are shown?'
            ? 'How many counters are shown?'
            : 'How many more counters are needed to fill the frame?',
        answer: `${filled}`,
        figure: tikz(
            `  \\draw[step=${cell}] (0,0) grid (${n(5 * cell)},${n(2 * cell)});\n${dots}`
        ),
    };
}

/** A dot array: multiplication, then division and factors. */
function dotArray(ctx) {
    const grade = gradeOf(ctx);
    const rows = between(2, grade <= 3 ? 5 : 7);
    const cols = between(2, grade <= 3 ? 5 : 7);
    const dots = `  \\foreach \\r in {1,...,${rows}} \\foreach \\c in {1,...,${cols}}\n    \\filldraw (\\c*0.34,\\r*0.34) circle (1.6pt);`;

    const tasks = [['Write the multiplication fact this array shows, and its answer.', `${rows} × ${cols} = ${rows * cols}`]];
    if (grade >= 3) tasks.push(['Write a division fact for this array.', `${rows * cols} ÷ ${cols} = ${rows}`]);
    if (grade >= 4) tasks.push(['How many dots are there in total?', `${rows * cols}`]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(dots) };
}

/* ============================================================= MEASUREMENT */

/** A ruler with an object laid along it. */
function ruler(ctx) {
    const grade = gradeOf(ctx);
    const half = grade >= 3 && level(ctx) >= 1;
    const length = half ? between(4, 20) / 2 : between(2, 11);
    const unit = 0.42;
    const marks = 12;

    const ticks = Array.from({ length: marks + 1 }, (_, i) =>
        `  \\draw (${n(i * unit)},0.34) -- (${n(i * unit)},0.5) node[above,font=\\tiny] {${i}};` +
        (half ? `\n  \\draw (${n(i * unit + unit / 2)},0.42) -- (${n(i * unit + unit / 2)},0.5);` : '')
    ).join('\n');

    return {
        question: 'How long is the bar, in centimetres?',
        answer: `${length} cm`,
        figure: tikz(
            `  \\draw (0,0.34) rectangle (${n(marks * unit)},0.5);\n${ticks}\n` +
            `  \\fill[black!30,draw=black] (0,0.02) rectangle (${n(length * unit)},0.26);`
        ),
    };
}

/** A thermometer, which is how negative numbers first appear. */
function thermometer(ctx) {
    const grade = gradeOf(ctx);
    const min = grade >= 4 ? -20 : 0;
    const max = 40;
    const step = 10;
    const value = between(min / 2, max / 2) * 2;
    const height = 3.0;
    const at = (v) => n(((v - min) / (max - min)) * height);

    const ticks = [];
    for (let v = min; v <= max; v += step) {
        ticks.push(`  \\draw (0.28,${at(v)}) -- (0.42,${at(v)}) node[right,font=\\tiny] {$${v}$};`);
    }

    return {
        question: 'What temperature does the thermometer show?',
        answer: `${value}°C`,
        figure: tikz(
            `  \\draw (0.12,0) rectangle (0.28,${n(height)});\n` +
            `  \\fill[black!35] (0.12,0) rectangle (0.28,${at(value)});\n` +
            `  \\filldraw[black!35,draw=black] (0.2,-0.12) circle (0.17);\n${ticks.join('\n')}`
        ),
    };
}

/** A clock: o'clock, then five-minute intervals, then elapsed time. */
function clock(ctx) {
    const grade = gradeOf(ctx);
    const minute = randomChoice(byGrade(grade, [
        [1, [0, 30]],
        [2, [0, 15, 30, 45]],
        [3, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]],
        [12, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]],
    ]));
    const hour = between(1, 12);
    const r = 1.1;
    const hourAngle = 90 - (hour % 12) * 30 - minute * 0.5;
    const minuteAngle = 90 - minute * 6;

    const face = Array.from({ length: 12 }, (_, i) => {
        const a = rad(90 - i * 30);
        return `  \\node[font=\\tiny] at (${n(0.82 * r * Math.cos(a))},${n(0.82 * r * Math.sin(a))}) {${i === 0 ? 12 : i}};`;
    }).join('\n');

    const shown = `${hour}:${String(minute).padStart(2, '0')}`;
    let question = 'What time is shown on this clock?';
    let answer = shown;

    if (grade >= 4) {
        const later = randomChoice([20, 30, 45, 60, 90]);
        const total = (hour % 12) * 60 + minute + later;
        const h = Math.floor(total / 60) % 12 || 12;
        question = `What time will it be ${later} minutes after the time shown?`;
        answer = `${h}:${String(total % 60).padStart(2, '0')}`;
    }

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw (0,0) circle (${r});\n${face}\n` +
            `  \\draw[line width=1.1pt] (0,0) -- (${n(0.48 * r * Math.cos(rad(hourAngle)))},${n(0.48 * r * Math.sin(rad(hourAngle)))});\n` +
            `  \\draw[line width=0.6pt] (0,0) -- (${n(0.72 * r * Math.cos(rad(minuteAngle)))},${n(0.72 * r * Math.sin(rad(minuteAngle)))});\n` +
            `  \\filldraw (0,0) circle (1.1pt);`
        ),
    };
}

/** A measuring jug. */
function beaker(ctx) {
    const capacity = randomChoice([500, 1000]);
    const step = capacity / 5;
    const value = between(1, 4) * step;
    const height = 2.4;
    const at = (v) => n((v / capacity) * height);

    const ticks = Array.from({ length: 6 }, (_, i) =>
        `  \\draw (0.62,${at(i * step)}) -- (0.78,${at(i * step)}) node[right,font=\\tiny] {${i * step}};`
    ).join('\n');

    return {
        question: 'How much liquid is in the jug, in millilitres?',
        answer: `${value} mL`,
        figure: tikz(
            `  \\fill[black!18] (0.05,0) rectangle (0.75,${at(value)});\n` +
            `  \\draw (0.05,${n(height + 0.15)}) -- (0.05,0) -- (0.75,0) -- (0.75,${n(height + 0.15)});\n${ticks}`
        ),
    };
}

/** A pan balance: equal masses on both sides. */
function balanceScale(ctx) {
    const grade = gradeOf(ctx);
    const algebraic = grade >= 6;
    const known = between(2, 9);
    const boxes = between(2, 4);
    const total = known * boxes;

    return {
        question: algebraic
            ? `The scale balances. Each box has the same mass. What is the mass of one box?`
            : `The scale balances. What is the total mass on the right pan?`,
        answer: algebraic ? `${known}` : `${total}`,
        figure: tikz(
            `  \\draw (-2.2,0) -- (2.2,0);\n  \\draw (0,0) -- (0,-0.5);\n  \\draw (-0.3,-0.5) -- (0.3,-0.5);\n` +
            `  \\draw (-2.2,0) -- (-2.2,0.28) node[above,font=\\tiny] {$${total}$};\n` +
            `  \\draw (-1.4,0) rectangle (-0.9,0.4);\n` +
            Array.from({ length: boxes }, (_, i) =>
                `  \\draw (${n(0.7 + i * 0.42)},0) rectangle (${n(1.05 + i * 0.42)},0.4);\n` +
                `  \\node[font=\\tiny] at (${n(0.875 + i * 0.42)},0.2) {?};`
            ).join('\n')
        ),
    };
}

/* ================================================================ GEOMETRY */

/** A labelled rectangle: area, perimeter, or a missing side. */
function rectangleMeasure(ctx) {
    const grade = gradeOf(ctx);
    const limit = Math.max(4, Math.min(Number(ctx.maxNumber) || 20, grade <= 4 ? 12 : 30));
    const w = between(2, limit);
    const h = between(2, limit);
    const scale = n(Math.min(3.2 / Math.max(w, h), 0.4));

    const tasks = [
        ['Find the area of this rectangle.', `${w * h} square units`],
        ['Find the perimeter of this rectangle.', `${2 * (w + h)} units`],
    ];
    if (grade >= 5) {
        tasks.push([`The area of this rectangle is ${w * h} square units. Find the missing side.`, `${h} units`]);
    }
    const [question, answer] = randomChoice(tasks);
    const hideHeight = question.startsWith('The area');

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw (0,0) rectangle (${n(w * scale)},${n(h * scale)});\n` +
            `  \\node[below,font=\\scriptsize] at (${n((w * scale) / 2)},0) {$${w}$};\n` +
            `  \\node[left,font=\\scriptsize] at (0,${n((h * scale) / 2)}) {$${hideHeight ? '?' : h}$};`
        ),
    };
}

/** An L-shaped composite figure. */
function compositeShape(ctx) {
    const a = between(3, 8);
    const b = between(3, 8);
    const c = between(1, a - 1);
    const d = between(1, b - 1);
    const s = n(Math.min(2.8 / Math.max(a, b), 0.36));
    const area = a * b - c * d;

    return {
        question: 'Find the area of this shape.',
        answer: `${area} square units`,
        figure: tikz(
            `  \\draw (0,0) -- (${n(a * s)},0) -- (${n(a * s)},${n((b - d) * s)}) -- (${n(c * s)},${n((b - d) * s)}) -- (${n(c * s)},${n(b * s)}) -- (0,${n(b * s)}) -- cycle;\n` +
            `  \\node[below,font=\\tiny] at (${n((a * s) / 2)},0) {$${a}$};\n` +
            `  \\node[left,font=\\tiny] at (0,${n((b * s) / 2)}) {$${b}$};\n` +
            `  \\node[right,font=\\tiny] at (${n(c * s)},${n((b - d / 2) * s)}) {$${d}$};\n` +
            `  \\node[above,font=\\tiny] at (${n((c * s) / 2)},${n(b * s)}) {$${c}$};`
        ),
    };
}

const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25]];

/** A right triangle: Pythagorean triples, then trigonometry. */
function rightTriangle(ctx) {
    const [a, b, c] = randomChoice(TRIPLES);
    const missing = randomChoice(['c', 'a', 'b']);
    const scale = n(2.9 / Math.max(a, b));
    const label = (side, value) => (missing === side ? '?' : `$${value}$`);

    return {
        question: 'Find the missing side length of this right triangle.',
        answer: missing === 'c' ? `${c}` : missing === 'a' ? `${a}` : `${b}`,
        figure: tikz(
            `  \\draw (0,0) -- (${n(b * scale)},0) -- (${n(b * scale)},${n(a * scale)}) -- cycle;\n` +
            `  \\draw (${n(b * scale - 0.2)},0) rectangle (${n(b * scale)},0.2);\n` +
            `  \\node[below,font=\\scriptsize] at (${n((b * scale) / 2)},0) {${label('b', b)}};\n` +
            `  \\node[right,font=\\scriptsize] at (${n(b * scale)},${n((a * scale) / 2)}) {${label('a', a)}};\n` +
            `  \\node[above left,font=\\scriptsize] at (${n((b * scale) / 2)},${n((a * scale) / 2)}) {${label('c', c)}};`
        ),
    };
}

/** A right triangle labelled with an angle: the trigonometric ratios. */
function trigTriangle(ctx) {
    const angle = randomChoice([30, 35, 40, 45, 50, 55, 60]);
    const hyp = between(6, 20);
    const opposite = n(hyp * Math.sin(rad(angle)));
    const adjacent = n(hyp * Math.cos(rad(angle)));
    const ask = randomChoice(['opposite', 'adjacent', 'ratio']);
    const scale = n(2.9 / hyp);

    const asked = {
        opposite: [`Find the side opposite the ${angle}° angle, to 1 decimal place.`, `${opposite.toFixed(1)}`],
        adjacent: [`Find the side adjacent to the ${angle}° angle, to 1 decimal place.`, `${adjacent.toFixed(1)}`],
        ratio: [`Write sin, cos and tan of the ${angle}° angle, to 2 decimal places.`,
            `sin ${Math.sin(rad(angle)).toFixed(2)}, cos ${Math.cos(rad(angle)).toFixed(2)}, tan ${Math.tan(rad(angle)).toFixed(2)}`],
    }[ask];

    return {
        question: asked[0],
        answer: asked[1],
        figure: tikz(
            `  \\draw (0,0) -- (${n(adjacent * scale)},0) -- (${n(adjacent * scale)},${n(opposite * scale)}) -- cycle;\n` +
            `  \\draw (${n(adjacent * scale - 0.2)},0) rectangle (${n(adjacent * scale)},0.2);\n` +
            `  \\draw (0.5,0) arc (0:${angle}:0.5);\n` +
            `  \\node[font=\\tiny] at (0.85,0.2) {$${angle}^{\\circ}$};\n` +
            `  \\node[above left,font=\\scriptsize] at (${n((adjacent * scale) / 2)},${n((opposite * scale) / 2)}) {$${hyp}$};`
        ),
    };
}

/** A circle with a radius or diameter marked. */
function circleMeasure(ctx) {
    const grade = gradeOf(ctx);
    const r = between(2, 12);
    const showDiameter = Math.random() < 0.5;
    const R = 1.2;

    const tasks = [
        ['Find the circumference of this circle. Use π ≈ 3.14, and round to 1 decimal place.', `${(2 * Math.PI * r).toFixed(1)}`],
        ['Find the area of this circle. Use π ≈ 3.14, and round to 1 decimal place.', `${(Math.PI * r * r).toFixed(1)}`],
    ];
    if (grade <= 7) tasks.unshift([showDiameter ? 'What is the radius of this circle?' : 'What is the diameter of this circle?',
        showDiameter ? `${r}` : `${2 * r}`]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw (0,0) circle (${R});\n  \\filldraw (0,0) circle (1pt);\n` +
            (showDiameter
                ? `  \\draw[<->] (${-R},0) -- (${R},0);\n  \\node[above,font=\\tiny] at (0,0) {$${2 * r}$};`
                : `  \\draw[->] (0,0) -- (${R},0);\n  \\node[above,font=\\tiny] at (${n(R / 2)},0) {$${r}$};`)
        ),
    };
}

/** Angles: classifying, then complementary and supplementary, then triangle sum. */
function angleMeasure(ctx) {
    const grade = gradeOf(ctx);

    if (grade <= 5) {
        const angle = randomChoice([35, 55, 90, 120, 145, 75, 100]);
        const kind = angle < 90 ? 'acute' : angle === 90 ? 'right' : 'obtuse';
        return {
            question: 'Is this angle acute, right, or obtuse?',
            answer: kind,
            figure: tikz(
                `  \\draw (0,0) -- (2.4,0);\n` +
                `  \\draw (0,0) -- (${n(2.4 * Math.cos(rad(angle)))},${n(2.4 * Math.sin(rad(angle)))});\n` +
                `  \\draw (0.55,0) arc (0:${angle}:0.55);`
            ),
        };
    }

    if (grade >= 8 && level(ctx) >= 1) {
        const a = between(35, 75);
        const b = between(35, 180 - a - 20);
        return {
            question: 'Find the missing angle in this triangle.',
            answer: `${180 - a - b}°`,
            figure: tikz(
                `  \\draw (0,0) -- (3,0) -- (1.1,1.9) -- cycle;\n` +
                `  \\node[above right,font=\\tiny] at (0.15,0.08) {$${a}^{\\circ}$};\n` +
                `  \\node[above left,font=\\tiny] at (2.85,0.08) {$${b}^{\\circ}$};\n` +
                `  \\node[below,font=\\tiny] at (1.1,1.85) {$?$};`
            ),
        };
    }

    const known = between(25, 65);
    const style = randomChoice(['complementary', 'supplementary']);
    const total = style === 'complementary' ? 90 : 180;

    return {
        question: `The two angles together make ${total === 90 ? 'a right angle' : 'a straight line'}. Find the missing angle.`,
        answer: `${total - known}°`,
        figure: tikz(
            `  \\draw (0,0) -- (2.6,0);\n` +
            `  \\draw (0,0) -- (${n(2.6 * Math.cos(rad(known)))},${n(2.6 * Math.sin(rad(known)))});\n` +
            `  \\draw (0,0) -- (${n(2.6 * Math.cos(rad(total)))},${n(2.6 * Math.sin(rad(total)))});\n` +
            `  \\draw (0.6,0) arc (0:${known}:0.6);\n` +
            `  \\draw (${n(0.78 * Math.cos(rad(known)))},${n(0.78 * Math.sin(rad(known)))}) arc (${known}:${total}:0.78);\n` +
            `  \\node[font=\\tiny] at (${n(1.15 * Math.cos(rad(known / 2)))},${n(1.15 * Math.sin(rad(known / 2)))}) {$${known}^{\\circ}$};\n` +
            `  \\node[font=\\tiny] at (${n(1.3 * Math.cos(rad((known + total) / 2)))},${n(1.3 * Math.sin(rad((known + total) / 2)))}) {$?$};`
        ),
    };
}

/** A rectangular prism: volume and surface area. */
function solidVolume(ctx) {
    const l = between(2, 9);
    const w = between(2, 9);
    const h = between(2, 9);
    const askVolume = Math.random() < 0.6;
    const d = 0.42;

    return {
        question: askVolume
            ? 'Find the volume of this rectangular prism.'
            : 'Find the surface area of this rectangular prism.',
        answer: askVolume
            ? `${l * w * h} cubic units`
            : `${2 * (l * w + l * h + w * h)} square units`,
        figure: tikz(
            `  \\draw (0,0) rectangle (2,1.3);\n` +
            `  \\draw (0,1.3) -- (${d},${n(1.3 + d)}) -- (${n(2 + d)},${n(1.3 + d)}) -- (2,1.3);\n` +
            `  \\draw (2,0) -- (${n(2 + d)},${d}) -- (${n(2 + d)},${n(1.3 + d)});\n` +
            `  \\node[below,font=\\tiny] at (1,0) {$${l}$};\n` +
            `  \\node[left,font=\\tiny] at (0,0.65) {$${h}$};\n` +
            `  \\node[right,font=\\tiny] at (${n(2 + d / 2)},${n(d / 2)}) {$${w}$};`
        ),
    };
}

/** A point on a coordinate grid: one quadrant, then four, then two points. */
function coordinateGrid(ctx) {
    const grade = gradeOf(ctx);
    const negatives = grade >= 7;
    const max = 5;
    const cell = 0.34;
    const lo = negatives ? -max : 0;
    const span = max - lo;

    const gx = (v) => n((v - lo) * cell);
    const x = between(lo + 1, max);
    const y = between(lo + 1, max);

    const axes =
        `  \\draw[step=${cell},black!22,line width=0.25pt] (0,0) grid (${n(span * cell)},${n(span * cell)});\n` +
        `  \\draw[->] (0,${gx(0)}) -- (${n(span * cell + 0.25)},${gx(0)}) node[right,font=\\tiny] {$x$};\n` +
        `  \\draw[->] (${gx(0)},0) -- (${gx(0)},${n(span * cell + 0.25)}) node[above,font=\\tiny] {$y$};`;

    if (grade >= 8 && level(ctx) === 2) {
        const x2 = between(lo + 1, max);
        const y2 = between(lo + 1, max);
        return {
            question: 'Write the coordinates of both points, and the distance between them if they share a row or column.',
            answer: `(${x}, ${y}) and (${x2}, ${y2})`,
            figure: tikz(`${axes}\n  \\filldraw (${gx(x)},${gx(y)}) circle (2pt);\n  \\filldraw (${gx(x2)},${gx(y2)}) circle (2pt);`),
        };
    }

    return {
        question: 'Write the coordinates of the plotted point.',
        answer: `(${x}, ${y})`,
        figure: tikz(`${axes}\n  \\filldraw (${gx(x)},${gx(y)}) circle (2.2pt);`),
    };
}

/** A shape and its image after a translation. */
function transformation(ctx) {
    const cell = 0.34;
    const dx = between(1, 4);
    const dy = between(1, 3);
    const gx = (v) => n(v * cell);

    return {
        question: 'Describe the translation that maps the shaded shape onto the outlined one.',
        answer: `${dx} right, ${dy} up`,
        figure: tikz(
            `  \\draw[step=${cell},black!22,line width=0.25pt] (0,0) grid (${gx(9)},${gx(7)});\n` +
            `  \\fill[black!25,draw=black] (${gx(1)},${gx(1)}) -- (${gx(3)},${gx(1)}) -- (${gx(1)},${gx(3)}) -- cycle;\n` +
            `  \\draw (${gx(1 + dx)},${gx(1 + dy)}) -- (${gx(3 + dx)},${gx(1 + dy)}) -- (${gx(1 + dx)},${gx(3 + dy)}) -- cycle;`
        ),
    };
}

/* ====================================================== DATA & PROBABILITY */

const BAR_SETS = [
    ['Mon', 'Tue', 'Wed', 'Thu'],
    ['Red', 'Blue', 'Green', 'Yellow'],
    ['Cats', 'Dogs', 'Birds', 'Fish'],
    ['Gr 4', 'Gr 5', 'Gr 6', 'Gr 7'],
];

/** A bar graph: reading it, then combining, then averaging. */
function barGraph(ctx) {
    const grade = gradeOf(ctx);
    const labels = randomChoice(BAR_SETS);
    const top = Math.max(4, Math.min(Number(ctx.maxNumber) || 10, 12));
    const values = labels.map(() => between(1, top));
    const unit = n(2.6 / Math.max(...values));
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const total = values.reduce((a, b) => a + b, 0);

    const tasks = [
        ['Which bar is tallest, and what is its value?', `${labels[values.indexOf(highest)]}, ${highest}`],
        ['Which bar is shortest, and what is its value?', `${labels[values.indexOf(lowest)]}, ${lowest}`],
    ];
    if (grade >= 3) tasks.push(['What is the total of all four bars?', `${total}`]);
    if (grade >= 3) tasks.push(['What is the difference between the tallest and shortest bar?', `${highest - lowest}`]);
    if (grade >= 5) tasks.push(['What is the mean of the four values?', `${n(total / values.length)}`]);
    if (grade >= 6) tasks.push(['What percent of the total does the tallest bar represent? Round to the nearest percent.',
        `${Math.round((highest / total) * 100)}%`]);

    const [question, answer] = randomChoice(grade >= 6 && level(ctx) === 2 ? tasks.slice(-2) : tasks);

    const bars = values.map((v, i) =>
        `  \\fill[black!20,draw=black] (${n(i * 0.85 + 0.25)},0) rectangle (${n(i * 0.85 + 0.8)},${n(v * unit)});\n` +
        `  \\node[below,font=\\tiny] at (${n(i * 0.85 + 0.52)},0) {${labels[i]}};`
    ).join('\n');

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw[->] (0,0) -- (0,${n(highest * unit + 0.4)});\n` +
            `  \\draw[->] (0,0) -- (${n(labels.length * 0.85 + 0.35)},0);\n${bars}`
        ),
    };
}

/** A dot plot: mode, range, then median. */
function linePlot(ctx) {
    const grade = gradeOf(ctx);
    const size = between(5, 9);
    const counts = Array.from({ length: size }, () => between(0, 4));
    if (counts.every((c) => c === 0)) counts[0] = 2;

    const data = [];
    counts.forEach((c, i) => { for (let k = 0; k < c; k += 1) data.push(i + 1); });
    data.sort((a, b) => a - b);

    const most = Math.max(...counts);
    const mode = counts.indexOf(most) + 1;
    const range = data[data.length - 1] - data[0];
    const median = data.length % 2
        ? data[(data.length - 1) / 2]
        : n((data[data.length / 2 - 1] + data[data.length / 2]) / 2);

    const tasks = [
        ['Which value appears most often?', `${mode}`],
        ['How many values are plotted in total?', `${data.length}`],
    ];
    if (grade >= 4) tasks.push(['What is the range of the data?', `${range}`]);
    if (grade >= 5) tasks.push(['What is the median of the data?', `${median}`]);

    const [question, answer] = randomChoice(tasks);
    const unit = 0.44;

    const dots = counts.flatMap((c, i) =>
        Array.from({ length: c }, (_, k) => `  \\node[font=\\scriptsize] at (${n(i * unit)},${n(0.28 + k * 0.26)}) {$\\times$};`)
    ).join('\n');

    const axis = counts.map((_, i) =>
        `  \\draw (${n(i * unit)},0.05) -- (${n(i * unit)},-0.05) node[below,font=\\tiny] {${i + 1}};`
    ).join('\n');

    return {
        question,
        answer,
        figure: tikz(`  \\draw (-0.25,0) -- (${n((size - 1) * unit + 0.3)},0);\n${axis}\n${dots}`),
    };
}

/** A pictograph, where one symbol stands for several. */
function pictograph(ctx) {
    const labels = randomChoice(BAR_SETS).slice(0, 3);
    const each = randomChoice([2, 5, 10]);
    const counts = labels.map(() => between(1, 5));
    const which = between(0, labels.length - 1);

    const rows = labels.map((label, i) =>
        `  \\node[left,font=\\tiny] at (0,${n(-i * 0.44)}) {${label}};\n` +
        Array.from({ length: counts[i] }, (_, k) =>
            `  \\filldraw (${n(0.2 + k * 0.36)},${n(-i * 0.44)}) circle (0.11);`
        ).join('\n')
    ).join('\n');

    return {
        question: `Each circle stands for ${each}. How many does ${labels[which]} represent?`,
        answer: `${counts[which] * each}`,
        figure: tikz(rows),
    };
}

/** A spinner: probability as a fraction. */
function spinner(ctx) {
    const grade = gradeOf(ctx);
    const sectors = randomChoice([4, 5, 6, 8]);
    const winning = between(1, sectors - 1);
    const r = 1.15;
    const slice = 360 / sectors;

    const shaded = Array.from({ length: winning }, (_, i) =>
        `  \\fill[black!22] (0,0) -- (${n(r * Math.cos(rad(i * slice)))},${n(r * Math.sin(rad(i * slice)))}) arc (${n(i * slice)}:${n((i + 1) * slice)}:${r}) -- cycle;`
    ).join('\n');

    const spokes = Array.from({ length: sectors }, (_, i) =>
        `  \\draw (0,0) -- (${n(r * Math.cos(rad(i * slice)))},${n(r * Math.sin(rad(i * slice)))});`
    ).join('\n');

    const tasks = [['What is the probability of landing on a shaded section?', simplify(winning, sectors)]];
    if (grade >= 6) tasks.push(['What is the probability of NOT landing on a shaded section?', simplify(sectors - winning, sectors)]);
    if (grade >= 7) tasks.push([`If the spinner is spun ${sectors * 10} times, how many shaded results would you expect?`, `${winning * 10}`]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(`${shaded}\n  \\draw (0,0) circle (${r});\n${spokes}\n  \\draw[->,line width=0.8pt] (0,0) -- (${n(0.8 * r * Math.cos(rad(35)))},${n(0.8 * r * Math.sin(rad(35)))});`),
    };
}

/** A line graph over time. */
function lineGraph(ctx) {
    const points = 5;
    const values = Array.from({ length: points }, () => between(1, 9));
    const unit = 0.3;
    const step = 0.62;
    const rise = values[points - 1] - values[0];

    const path = values.map((v, i) => `(${n(i * step)},${n(v * unit)})`).join(' -- ');
    const dots = values.map((v, i) => `  \\filldraw (${n(i * step)},${n(v * unit)}) circle (1.5pt);`).join('\n');
    const axis = values.map((_, i) => `  \\node[below,font=\\tiny] at (${n(i * step)},0) {${i + 1}};`).join('\n');

    const tasks = [
        ['What is the highest value shown?', `${Math.max(...values)}`],
        ['Between which two points is the increase greatest?',
            (() => {
                let best = 1;
                let bestGain = -Infinity;
                for (let i = 1; i < points; i += 1) {
                    if (values[i] - values[i - 1] > bestGain) { bestGain = values[i] - values[i - 1]; best = i; }
                }
                return `${best} to ${best + 1}`;
            })()],
        ['What is the overall change from the first point to the last?', `${rise > 0 ? '+' : ''}${rise}`],
    ];
    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw[->] (0,0) -- (0,3.1);\n  \\draw[->] (0,0) -- (${n((points - 1) * step + 0.35)},0);\n` +
            `  \\draw ${path};\n${dots}\n${axis}`
        ),
    };
}

/* ================================================================= ALGEBRA */

/** A straight line on a grid: slope, intercept, then the equation. */
function linearGraph(ctx) {
    const grade = gradeOf(ctx);
    const slope = randomChoice([-2, -1, 1, 1, 2, 3]);
    const intercept = between(-3, 3);
    const cell = 0.3;
    const max = 5;
    const gx = (v) => n((v + max) * cell);

    // Keep the drawn segment inside the grid.
    const xs = [];
    for (let x = -max; x <= max; x += 1) {
        const y = slope * x + intercept;
        if (y >= -max && y <= max) xs.push(x);
    }
    const x1 = xs[0];
    const x2 = xs[xs.length - 1];

    const tasks = [
        ['What is the slope of this line?', `${slope}`],
        ['What is the y-intercept of this line?', `${intercept}`],
    ];
    if (grade >= 9) tasks.push(['Write the equation of this line in the form y = mx + b.',
        `y = ${slope}x ${intercept < 0 ? '-' : '+'} ${Math.abs(intercept)}`]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw[step=${cell},black!20,line width=0.25pt] (0,0) grid (${n(2 * max * cell)},${n(2 * max * cell)});\n` +
            `  \\draw[->] (0,${gx(0)}) -- (${n(2 * max * cell + 0.22)},${gx(0)}) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (${gx(0)},0) -- (${gx(0)},${n(2 * max * cell + 0.22)}) node[above,font=\\tiny] {$y$};\n` +
            `  \\draw[line width=0.8pt] (${gx(x1)},${gx(slope * x1 + intercept)}) -- (${gx(x2)},${gx(slope * x2 + intercept)});`
        ),
    };
}

/** A growing pattern of squares: the next term, then the general rule. */
function growingPattern(ctx) {
    const grade = gradeOf(ctx);
    const start = between(1, 4);
    const step = between(1, 4);
    const terms = 3;
    const cell = 0.19;

    let x = 0;
    const groups = [];
    for (let t = 0; t < terms; t += 1) {
        const count = start + t * step;
        for (let i = 0; i < count; i += 1) {
            groups.push(`  \\draw (${n(x + (i % 3) * cell)},${n(Math.floor(i / 3) * cell)}) rectangle (${n(x + (i % 3) * cell + cell)},${n(Math.floor(i / 3) * cell + cell)});`);
        }
        groups.push(`  \\node[below,font=\\tiny] at (${n(x + 1.5 * cell)},-0.06) {${t + 1}};`);
        x += 4.2 * cell;
    }

    const tasks = [['How many squares are in the next figure?', `${start + terms * step}`]];
    if (grade >= 6) tasks.push(['Write a rule for the number of squares in figure n.',
        `${step}n ${start - step < 0 ? '-' : '+'} ${Math.abs(start - step)}`]);
    if (grade >= 5) tasks.push(['How many squares are in figure 10?', `${start + 9 * step}`]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(groups.join('\n')) };
}

/** An inequality shown on a number line. */
function inequalityLine(ctx) {
    const value = between(-4, 4);
    const greater = Math.random() < 0.5;
    const closed = Math.random() < 0.5;
    const cell = 0.42;
    const lo = -5;
    const gx = (v) => n((v - lo) * cell);

    const ticks = Array.from({ length: 11 }, (_, i) =>
        `  \\draw (${n(i * cell)},0.09) -- (${n(i * cell)},-0.09) node[below,font=\\tiny] {$${lo + i}$};`
    ).join('\n');

    const symbol = greater ? (closed ? '≥' : '>') : (closed ? '≤' : '<');

    return {
        question: 'Write the inequality shown on this number line.',
        answer: `x ${symbol} ${value}`,
        figure: tikz(
            `  \\draw[<->] (-0.3,0) -- (${n(10 * cell + 0.3)},0);\n${ticks}\n` +
            `  \\draw[line width=1.3pt] (${gx(value)},0) -- (${greater ? n(10 * cell + 0.2) : -0.2},0);\n` +
            (closed
                ? `  \\filldraw (${gx(value)},0) circle (2.4pt);`
                : `  \\draw[fill=white,line width=0.7pt] (${gx(value)},0) circle (2.4pt);`)
        ),
    };
}

/** A function machine. */
function functionMachine(ctx) {
    const multiplier = between(2, 6);
    const offset = between(1, 9);
    const input = between(1, 9);

    return {
        question: `What comes out of the machine when ${input} goes in?`,
        answer: `${multiplier * input + offset}`,
        figure: tikz(
            `  \\draw (0,0) rectangle (2.2,1.0);\n` +
            `  \\node[font=\\scriptsize] at (1.1,0.5) {$\\times ${multiplier}$, then $+ ${offset}$};\n` +
            `  \\draw[->] (-0.85,0.5) -- (0,0.5) node[midway,above,font=\\tiny] {${input}};\n` +
            `  \\draw[->] (2.2,0.5) -- (3.05,0.5) node[midway,above,font=\\tiny] {?};`
        ),
    };
}

/* ============================================ ADVANCED FUNCTIONS & CALCULUS */

/** A parabola: vertex, roots, then the derivative at a point. */
function parabola(ctx) {
    const grade = gradeOf(ctx);
    const h = between(-2, 2);
    const k = between(-3, 2);
    const opens = randomChoice([1, 1, -1]);
    const cell = 0.3;
    const max = 5;
    const gx = (v) => n((v + max) * cell);

    const samples = [];
    for (let x = -max; x <= max; x += 0.5) {
        const y = opens * (x - h) ** 2 + k;
        if (y >= -max && y <= max) samples.push(`(${gx(x)},${gx(y)})`);
    }

    const vertexForm = `y = ${opens < 0 ? '-' : ''}(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})\u00b2 ${k < 0 ? '-' : '+'} ${Math.abs(k)}`;
    const rootGap = opens * k < 0 ? Math.sqrt(Math.abs(k)) : null;

    // Grade 9 and 10 read the graph. From Grade 11 the course is Functions, so
    // the questions are about the function: its equation, its transformations,
    // its range, its rate of change.
    const junior = [
        ['What are the coordinates of the vertex?', `(${h}, ${k})`],
        ['Does this parabola open upward or downward?', opens > 0 ? 'upward' : 'downward'],
        ['What is the equation of the axis of symmetry?', `x = ${h}`],
    ];

    const senior = [
        ['Write the equation of this parabola in vertex form.', vertexForm],
        ['Describe the transformations applied to y = x².',
            `${opens < 0 ? 'reflection in the x-axis, ' : ''}${h === 0 ? '' : `${Math.abs(h)} ${h > 0 ? 'right' : 'left'}, `}${k === 0 ? 'no vertical shift' : `${Math.abs(k)} ${k > 0 ? 'up' : 'down'}`}`],
        ['State the domain and range of this function.',
            `domain all real numbers, range y ${opens > 0 ? '≥' : '≤'} ${k}`],
        [`What is the ${opens > 0 ? 'minimum' : 'maximum'} value of this function, and where does it occur?`,
            `${k} at x = ${h}`],
    ];
    if (rootGap !== null && Number.isInteger(rootGap)) {
        senior.push(['What are the zeros of this function?', `x = ${h - rootGap} and x = ${h + rootGap}`]);
    }
    if (grade >= 12) {
        const a = h + 1;
        const b = h + 3;
        const rate = opens * ((b - h) ** 2 - (a - h) ** 2) / (b - a);
        senior.push([`Find the average rate of change between x = ${a} and x = ${b}.`, `${n(rate)}`]);
    }

    const [question, answer] = randomChoice(grade >= 11 ? senior : junior);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw[step=${cell},black!20,line width=0.25pt] (0,0) grid (${n(2 * max * cell)},${n(2 * max * cell)});\n` +
            `  \\draw[->] (0,${gx(0)}) -- (${n(2 * max * cell + 0.22)},${gx(0)}) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (${gx(0)},0) -- (${gx(0)},${n(2 * max * cell + 0.22)}) node[above,font=\\tiny] {$y$};\n` +
            `  \\draw[line width=0.8pt] plot coordinates {${samples.join(' ')}};\n` +
            `  \\filldraw (${gx(h)},${gx(k)}) circle (1.8pt);`
        ),
    };
}

/** A curve with a tangent drawn at a point. */
function tangentLine(ctx) {
    const a = between(1, 3);
    const point = between(1, 3);
    const slope = 2 * a * point;
    const cell = 0.3;
    const max = 5;
    const gx = (v) => n((v + max) * cell);

    const samples = [];
    for (let x = -max; x <= max; x += 0.4) {
        const y = a * x * x - 3;
        if (y >= -max && y <= max) samples.push(`(${gx(x)},${gx(y)})`);
    }

    const py = a * point * point - 3;
    const x1 = point - 1.6;
    const x2 = point + 1.6;

    return {
        question: `The curve is y = ${a}x². What is the slope of the tangent drawn at x = ${point}?`,
        answer: `${slope}`,
        figure: tikz(
            `  \\draw[step=${cell},black!20,line width=0.25pt] (0,0) grid (${n(2 * max * cell)},${n(2 * max * cell)});\n` +
            `  \\draw[->] (0,${gx(0)}) -- (${n(2 * max * cell + 0.22)},${gx(0)}) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (${gx(0)},0) -- (${gx(0)},${n(2 * max * cell + 0.22)}) node[above,font=\\tiny] {$y$};\n` +
            `  \\draw[line width=0.8pt] plot coordinates {${samples.join(' ')}};\n` +
            `  \\draw[dashed] (${gx(x1)},${gx(Math.max(-max, Math.min(max, py + slope * (x1 - point))))}) -- (${gx(x2)},${gx(Math.max(-max, Math.min(max, py + slope * (x2 - point))))});\n` +
            `  \\filldraw (${gx(point)},${gx(py)}) circle (1.8pt);`
        ),
    };
}

/** A point on the unit circle. */
function unitCircle(ctx) {
    const angle = randomChoice([30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330]);
    const r = 1.25;
    const exact = { 30: ['√3/2', '1/2'], 45: ['√2/2', '√2/2'], 60: ['1/2', '√3/2'] };
    const base = angle % 90 === 0 ? 90 : (angle > 180 ? (angle > 270 ? 360 - angle : angle - 180) : (angle > 90 ? 180 - angle : angle));
    const pair = exact[base] || ['?', '?'];

    return {
        question: `The point is at ${angle}° on the unit circle. Give its coordinates.`,
        answer: `(${Math.cos(rad(angle)).toFixed(3)}, ${Math.sin(rad(angle)).toFixed(3)})`,
        figure: tikz(
            `  \\draw (0,0) circle (${r});\n` +
            `  \\draw[->] (${n(-r - 0.3)},0) -- (${n(r + 0.3)},0);\n` +
            `  \\draw[->] (0,${n(-r - 0.3)}) -- (0,${n(r + 0.3)});\n` +
            `  \\draw[line width=0.8pt] (0,0) -- (${n(r * Math.cos(rad(angle)))},${n(r * Math.sin(rad(angle)))});\n` +
            `  \\filldraw (${n(r * Math.cos(rad(angle)))},${n(r * Math.sin(rad(angle)))}) circle (1.8pt);\n` +
            `  \\draw (0.42,0) arc (0:${angle}:0.42);`
        ),
    };
}

/* ====================================================== FINANCIAL LITERACY */

/** A handful of coins to total. */
function coins(ctx) {
    const grade = gradeOf(ctx);
    // `\$` reaches for the TS1 text-companion fonts, which this build does not
    // ship. The math dollar draws the same glyph from a font that is always there.
    const kinds = grade <= 2
        ? [[5, '5'], [10, '10'], [25, '25']]
        : [[5, '5'], [10, '10'], [25, '25'], [100, '$\\mathdollar 1$']];
    const picked = Array.from({ length: between(3, 6) }, () => randomChoice(kinds));
    const total = picked.reduce((sum, [value]) => sum + value, 0);

    const drawn = picked.map(([, label], i) =>
        `  \\draw (${n(i * 0.62)},0) circle (0.27);\n  \\node[font=\\tiny] at (${n(i * 0.62)},0) {${label}};`
    ).join('\n');

    const paid = Math.ceil(total / 100) * 100;
    const tasks = [['How much money is shown?', `$${(total / 100).toFixed(2)}`]];
    if (grade >= 3) tasks.push([`If you pay with $${(paid / 100).toFixed(2)}, how much change is left?`, `$${((paid - total) / 100).toFixed(2)}`]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(drawn) };
}

/** A budget as a divided circle. */
function budgetPie(ctx) {
    const slices = [
        ['Rent', randomChoice([40, 45, 50])],
        ['Food', randomChoice([15, 20, 25])],
        ['Travel', randomChoice([10, 15])],
    ];
    const used = slices.reduce((sum, [, pct]) => sum + pct, 0);
    slices.push(['Savings', 100 - used]);

    const income = randomChoice([1200, 1500, 2000, 2400, 3000]);
    const which = between(0, slices.length - 1);

    let start = 0;
    const wedges = slices.map(([label, pct], i) => {
        const end = start + (pct / 100) * 360;
        const mid = (start + end) / 2;
        const wedge =
            `  \\fill[black!${8 + i * 12}] (0,0) -- (${n(1.15 * Math.cos(rad(start)))},${n(1.15 * Math.sin(rad(start)))}) arc (${n(start)}:${n(end)}:1.15) -- cycle;\n` +
            `  \\draw (0,0) -- (${n(1.15 * Math.cos(rad(start)))},${n(1.15 * Math.sin(rad(start)))});\n` +
            `  \\node[font=\\tiny] at (${n(1.5 * Math.cos(rad(mid)))},${n(1.5 * Math.sin(rad(mid)))}) {${label} ${pct}\\%};`;
        start = end;
        return wedge;
    }).join('\n');

    return {
        question: `The circle shows a monthly budget for an income of $${income}. How much goes to ${slices[which][0]}?`,
        answer: `$${((income * slices[which][1]) / 100).toFixed(2)}`,
        figure: tikz(`${wedges}\n  \\draw (0,0) circle (1.15);`),
    };
}

/* ================================================ SENIOR FUNCTIONS */

/** A sinusoid: amplitude, period, then the equation. */
function sineWave(ctx) {
    const amplitude = between(1, 3);
    const periodDegrees = randomChoice([90, 120, 180, 360]);
    const k = 360 / periodDegrees;
    const shift = randomChoice([0, 0, 1, -1]);
    const cell = 0.3;
    const maxY = 4;
    const gy = (v) => n((v + maxY) * cell);
    const width = 8;

    const samples = [];
    for (let i = 0; i <= 96; i += 1) {
        const x = (i / 96) * width;
        const y = amplitude * Math.sin(rad(k * x * (360 / width) / 4)) + shift;
        samples.push(`(${n(i * (width * cell) / 96)},${gy(Math.max(-maxY, Math.min(maxY, y)))})`);
    }

    const tasks = [
        ['What is the amplitude of this function?', `${amplitude}`],
        ['What is the equation of the axis of the curve?', `y = ${shift}`],
        ['State the maximum and minimum values.', `max ${amplitude + shift}, min ${shift - amplitude}`],
    ];

    return {
        question: randomChoice(tasks)[0],
        answer: randomChoice(tasks)[1],
        figure: tikz(
            `  \\draw[step=${cell},black!18,line width=0.25pt] (0,0) grid (${n(width * cell)},${n(2 * maxY * cell)});\n` +
            `  \\draw[->] (0,${gy(0)}) -- (${n(width * cell + 0.22)},${gy(0)}) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (0,0) -- (0,${n(2 * maxY * cell + 0.22)}) node[above,font=\\tiny] {$y$};\n` +
            `  \\draw[line width=0.8pt] plot coordinates {${samples.join(' ')}};`
        ),
    };
}

/** An exponential curve with its horizontal asymptote. */
function exponentialCurve(ctx) {
    const growth = Math.random() < 0.6;
    const base = growth ? randomChoice([2, 3]) : randomChoice([0.5, 0.25]);
    const cell = 0.3;
    const maxY = 5;
    const maxX = 5;
    const gx = (v) => n((v + maxX) * cell);
    const gy = (v) => n(v * cell);

    const samples = [];
    for (let x = -maxX; x <= maxX; x += 0.25) {
        const y = base ** x;
        if (y <= maxY * 2 && y >= 0) samples.push(`(${gx(x)},${gy(Math.min(y, maxY * 2))})`);
    }

    const tasks = [
        ['Does this function show growth or decay?', growth ? 'growth' : 'decay'],
        ['What is the equation of the horizontal asymptote?', 'y = 0'],
        ['What is the y-intercept of this function?', '1'],
        ['Write the equation of this function.', `y = ${base}^x`],
    ];
    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw[step=${cell},black!18,line width=0.25pt] (0,0) grid (${n(2 * maxX * cell)},${n(maxY * cell)});\n` +
            `  \\draw[->] (0,0) -- (${n(2 * maxX * cell + 0.22)},0) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (${gx(0)},0) -- (${gx(0)},${n(maxY * cell + 0.22)}) node[above,font=\\tiny] {$y$};\n` +
            `  \\draw[line width=0.8pt] plot coordinates {${samples.join(' ')}};`
        ),
    };
}

/** A reciprocal curve with its asymptotes drawn in. */
function rationalAsymptote(ctx) {
    const h = between(-2, 2);
    const k = between(-2, 2);
    const cell = 0.3;
    const max = 5;
    const g = (v) => n((v + max) * cell);

    const branch = (from, to) => {
        const points = [];
        for (let x = from; x <= to; x += 0.2) {
            const y = 1 / (x - h) + k;
            if (y >= -max && y <= max) points.push(`(${g(x)},${g(y)})`);
        }
        return points;
    };

    const left = branch(-max, h - 0.25);
    const right = branch(h + 0.25, max);

    const tasks = [
        ['What is the equation of the vertical asymptote?', `x = ${h}`],
        ['What is the equation of the horizontal asymptote?', `y = ${k}`],
        ['State the domain of this function.', `all real numbers except x = ${h}`],
    ];
    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw[step=${cell},black!18,line width=0.25pt] (0,0) grid (${n(2 * max * cell)},${n(2 * max * cell)});\n` +
            `  \\draw[->] (0,${g(0)}) -- (${n(2 * max * cell + 0.22)},${g(0)}) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (${g(0)},0) -- (${g(0)},${n(2 * max * cell + 0.22)}) node[above,font=\\tiny] {$y$};\n` +
            `  \\draw[dashed,black!55] (${g(h)},0) -- (${g(h)},${n(2 * max * cell)});\n` +
            `  \\draw[dashed,black!55] (0,${g(k)}) -- (${n(2 * max * cell)},${g(k)});\n` +
            (left.length > 1 ? `  \\draw[line width=0.8pt] plot coordinates {${left.join(' ')}};\n` : '') +
            (right.length > 1 ? `  \\draw[line width=0.8pt] plot coordinates {${right.join(' ')}};` : '')
        ),
    };
}

/** A polynomial curve: degree, end behaviour, number of zeros. */
function polynomialCurve(ctx) {
    const roots = randomChoice([[-3, 0, 3], [-2, 1, 3], [-3, -1, 2]]);
    const lead = randomChoice([1, -1]);
    const cell = 0.3;
    const max = 5;
    const g = (v) => n((v + max) * cell);

    const samples = [];
    for (let x = -max; x <= max; x += 0.2) {
        const y = lead * 0.35 * roots.reduce((product, r) => product * (x - r), 1);
        if (y >= -max && y <= max) samples.push(`(${g(x)},${g(y)})`);
    }

    const tasks = [
        ['What is the least possible degree of this polynomial?', '3'],
        ['How many real zeros does this function have?', `${roots.length}`],
        ['Describe the end behaviour of this function.',
            lead > 0 ? 'falls on the left, rises on the right' : 'rises on the left, falls on the right'],
        ['What are the zeros of this function?', roots.map((r) => `x = ${r}`).join(', ')],
    ];
    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw[step=${cell},black!18,line width=0.25pt] (0,0) grid (${n(2 * max * cell)},${n(2 * max * cell)});\n` +
            `  \\draw[->] (0,${g(0)}) -- (${n(2 * max * cell + 0.22)},${g(0)}) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (${g(0)},0) -- (${g(0)},${n(2 * max * cell + 0.22)}) node[above,font=\\tiny] {$y$};\n` +
            `  \\draw[line width=0.8pt] plot coordinates {${samples.join(' ')}};`
        ),
    };
}

/** Two vectors drawn head to tail. */
function vectorSum(ctx) {
    const ax = between(1, 4);
    const ay = between(1, 4);
    const bx = between(-3, 4);
    const by = between(-3, 4);
    const cell = 0.32;
    const max = 6;
    const g = (v) => n((v + max) * cell);

    const rx = ax + bx;
    const ry = ay + by;
    const tasks = [
        ['Write the resultant vector in component form.', `(${rx}, ${ry})`],
        ['Find the magnitude of the resultant, to 1 decimal place.', `${Math.hypot(rx, ry).toFixed(1)}`],
    ];
    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw[step=${cell},black!18,line width=0.25pt] (0,0) grid (${n(2 * max * cell)},${n(2 * max * cell)});\n` +
            `  \\draw[->] (0,${g(0)}) -- (${n(2 * max * cell + 0.2)},${g(0)});\n` +
            `  \\draw[->] (${g(0)},0) -- (${g(0)},${n(2 * max * cell + 0.2)});\n` +
            `  \\draw[->,line width=0.9pt] (${g(0)},${g(0)}) -- (${g(ax)},${g(ay)}) node[midway,above,font=\\tiny] {$\\vec{a}$};\n` +
            `  \\draw[->,line width=0.9pt] (${g(ax)},${g(ay)}) -- (${g(rx)},${g(ry)}) node[midway,right,font=\\tiny] {$\\vec{b}$};`
        ),
    };
}

/** A box plot: the five-number summary. */
function boxPlot(ctx) {
    const min = between(1, 6);
    const q1 = min + between(2, 5);
    const median = q1 + between(2, 5);
    const q3 = median + between(2, 5);
    const max = q3 + between(2, 5);
    const unit = n(5.2 / max);
    const x = (v) => n(v * unit);

    const tasks = [
        ['What is the median of this data set?', `${median}`],
        ['What is the interquartile range?', `${q3 - q1}`],
        ['What is the range of this data set?', `${max - min}`],
        ['What value is the upper quartile?', `${q3}`],
    ];
    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw (${x(min)},0.25) -- (${x(q1)},0.25);\n` +
            `  \\draw (${x(q3)},0.25) -- (${x(max)},0.25);\n` +
            `  \\draw (${x(min)},0.1) -- (${x(min)},0.4);\n` +
            `  \\draw (${x(max)},0.1) -- (${x(max)},0.4);\n` +
            `  \\draw (${x(q1)},0) rectangle (${x(q3)},0.5);\n` +
            `  \\draw[line width=0.9pt] (${x(median)},0) -- (${x(median)},0.5);\n` +
            `  \\draw[->] (0,-0.25) -- (${x(max + 1)},-0.25);\n` +
            [min, q1, median, q3, max].map((v) => `  \\draw (${x(v)},-0.2) -- (${x(v)},-0.3) node[below,font=\\tiny] {${v}};`).join('\n')
        ),
    };
}

/* ================================================== NUMBER, PART TWO */

/** A tape diagram: two quantities in a ratio. */
function ratioTape(ctx) {
    const grade = gradeOf(ctx);
    // At least two boxes a side, or the bars read as two empty squares.
    const a = between(2, 5);
    const b = between(2, 5);
    const unit = between(2, 9);
    const cell = n(Math.min(0.45, 4.4 / (a + b)));

    const boxes = (count, y) => Array.from({ length: count }, (_, i) =>
        `  \\draw (${n(i * cell)},${y}) rectangle (${n((i + 1) * cell)},${n(y + 0.42)});`
    ).join('\n');

    const tasks = [
        ['What is the ratio of the top bar to the bottom bar?', simplify(a, b)],
        [`Each box is worth ${unit}. What is the total value of both bars?`, `${(a + b) * unit}`],
    ];
    if (grade >= 7) tasks.push([`The top bar is worth ${a * unit}. What is one box worth?`, `${unit}`]);

    const [question, answer] = randomChoice(tasks);
    const labelX = n(Math.max(a, b) * cell + 0.12);
    return {
        question,
        answer,
        figure: tikz(
            `${boxes(a, 0.5)}\n${boxes(b, 0)}\n` +
            `  \\node[right,font=\\tiny] at (${labelX},0.71) {A};\n` +
            `  \\node[right,font=\\tiny] at (${labelX},0.21) {B};`
        ),
    };
}

/** A prime factor tree with one branch left blank. */
function factorTree(ctx) {
    const primes = [2, 3, 5, 7];
    const p1 = randomChoice(primes);
    const p2 = randomChoice(primes);
    const p3 = randomChoice(primes);
    const composite = p1 * p2;
    const total = composite * p3;

    return {
        question: 'Complete the factor tree: what is the missing value?',
        answer: `${composite}`,
        figure: tikz(
            `  \\node[font=\\scriptsize] (a) at (1.4,1.7) {$${total}$};\n` +
            `  \\node[font=\\scriptsize] (b) at (0.5,0.9) {$${p3}$};\n` +
            `  \\node[font=\\scriptsize,draw] (c) at (2.3,0.9) {$?$};\n` +
            `  \\node[font=\\scriptsize] (d) at (1.7,0.1) {$${p1}$};\n` +
            `  \\node[font=\\scriptsize] (e) at (2.9,0.1) {$${p2}$};\n` +
            `  \\draw (a) -- (b); \\draw (a) -- (c); \\draw (c) -- (d); \\draw (c) -- (e);`
        ),
    };
}

/** A square of unit tiles: perfect squares and square roots. */
function squareRootArea(ctx) {
    const side = between(2, 9);
    const cell = n(Math.min(0.24, 2.3 / side));
    const askRoot = Math.random() < 0.5;

    return {
        question: askRoot
            ? 'The square is made of unit tiles. What is the length of one side?'
            : 'The square is made of unit tiles. How many tiles are there in total?',
        answer: askRoot ? `${side}` : `${side * side}`,
        figure: tikz(
            `  \\draw[step=${cell},black!45,line width=0.25pt] (0,0) grid (${n(side * cell)},${n(side * cell)});\n` +
            `  \\draw (0,0) rectangle (${n(side * cell)},${n(side * cell)});`
        ),
    };
}

/** A chain of operation boxes, evaluated in order. */
function operationChain(ctx) {
    const start = between(2, 12);
    const steps = [
        ['+', between(2, 9)],
        ['\\times', between(2, 5)],
        ['-', between(1, 9)],
    ].slice(0, gradeOf(ctx) <= 5 ? 2 : 3);

    let value = start;
    for (const [op, amount] of steps) value = op === '+' ? value + amount : op === '-' ? value - amount : value * amount;

    let x = 0;
    const boxes = steps.map(([op, amount]) => {
        const block =
            `  \\draw (${n(x)},0) rectangle (${n(x + 0.95)},0.6);\n` +
            `  \\node[font=\\scriptsize] at (${n(x + 0.475)},0.3) {$${op} ${amount}$};\n` +
            `  \\draw[->] (${n(x - 0.35)},0.3) -- (${n(x)},0.3);`;
        x += 1.3;
        return block;
    }).join('\n');

    return {
        question: 'Follow the boxes from left to right. What is the result?',
        answer: `${value}`,
        figure: tikz(
            `  \\node[font=\\scriptsize] at (-0.62,0.3) {$${start}$};\n${boxes}\n` +
            `  \\draw[->] (${n(x - 0.35)},0.3) -- (${n(x)},0.3);\n` +
            `  \\node[font=\\scriptsize] at (${n(x + 0.25)},0.3) {$?$};`
        ),
    };
}

/** A bar model for a word problem: part, part, whole. */
function tapeDiagram(ctx) {
    const part = between(4, 30);
    const other = between(4, 30);
    const whole = part + other;
    const width = 4.4;
    const split = n((part / whole) * width);

    const hideWhole = Math.random() < 0.5;
    return {
        question: hideWhole
            ? 'The bar model shows two parts. What is the whole?'
            : 'The bar model shows the whole and one part. What is the other part?',
        answer: hideWhole ? `${whole}` : `${other}`,
        figure: tikz(
            `  \\draw (0,0.55) rectangle (${width},1.05);\n` +
            `  \\node[font=\\scriptsize] at (${n(width / 2)},0.8) {${hideWhole ? '?' : `$${whole}$`}};\n` +
            `  \\draw (0,0) rectangle (${split},0.5);\n` +
            `  \\node[font=\\scriptsize] at (${n(split / 2)},0.25) {$${part}$};\n` +
            `  \\draw (${split},0) rectangle (${width},0.5);\n` +
            `  \\node[font=\\scriptsize] at (${n((split + width) / 2)},0.25) {${hideWhole ? `$${other}$` : '?'}};`
        ),
    };
}

/** A conversion ladder between metric units. */
function unitLadder(ctx) {
    const rungs = ['km', 'm', 'cm', 'mm'];
    const from = between(0, 2);
    const to = from + between(1, Math.min(2, rungs.length - 1 - from));
    const factor = 10 ** [3, 2, 1][from] ** 1;
    const steps = to - from;
    const multiplier = from === 0 && to === 1 ? 1000 : 10 ** (steps === 1 ? (from === 1 ? 2 : 1) : 3);
    const value = between(2, 9);

    const ladder = rungs.map((label, i) =>
        `  \\node[font=\\scriptsize] at (0,${n(-i * 0.5)}) {${label}};` +
        (i < rungs.length - 1 ? `\n  \\draw[->] (0.28,${n(-i * 0.5 - 0.08)}) -- (0.28,${n(-i * 0.5 - 0.42)});` : '')
    ).join('\n');

    return {
        question: `Use the ladder: convert ${value} ${rungs[from]} to ${rungs[to]}.`,
        answer: `${value * multiplier} ${rungs[to]}`,
        figure: tikz(ladder),
    };
}

/* ================================================== ALGEBRA, PART TWO */

/** Two lines crossing: the solution of a system. */
function systemsGraph(ctx) {
    const x = between(-3, 3);
    const y = between(-3, 3);
    const m1 = randomChoice([-2, -1, 1, 2]);
    let m2 = randomChoice([-2, -1, 1, 2, 3]);
    if (m2 === m1) m2 = m1 + 1;

    const cell = 0.3;
    const max = 5;
    const g = (v) => n((v + max) * cell);
    const segment = (m) => {
        const b = y - m * x;
        const points = [];
        for (let px = -max; px <= max; px += 1) {
            const py = m * px + b;
            if (py >= -max && py <= max) points.push([px, py]);
        }
        return points.length >= 2
            ? `  \\draw[line width=0.8pt] (${g(points[0][0])},${g(points[0][1])}) -- (${g(points[points.length - 1][0])},${g(points[points.length - 1][1])});`
            : '';
    };

    return {
        question: 'The two lines are a system of equations. What is the solution?',
        answer: `(${x}, ${y})`,
        figure: tikz(
            `  \\draw[step=${cell},black!18,line width=0.25pt] (0,0) grid (${n(2 * max * cell)},${n(2 * max * cell)});\n` +
            `  \\draw[->] (0,${g(0)}) -- (${n(2 * max * cell + 0.2)},${g(0)}) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (${g(0)},0) -- (${g(0)},${n(2 * max * cell + 0.2)}) node[above,font=\\tiny] {$y$};\n` +
            `${segment(m1)}\n${segment(m2)}\n  \\filldraw (${g(x)},${g(y)}) circle (1.8pt);`
        ),
    };
}

/** Algebra tiles: an area model of a quadratic. */
function algebraTiles(ctx) {
    const a = between(1, 3);
    const b = between(1, 4);
    const big = 0.62;
    const small = 0.24;

    const squares = Array.from({ length: a }, (_, i) =>
        `  \\draw[fill=black!18] (${n(i * (big + 0.08))},0) rectangle (${n(i * (big + 0.08) + big)},${big});\n` +
        `  \\node[font=\\tiny] at (${n(i * (big + 0.08) + big / 2)},${n(big / 2)}) {$x^2$};`
    ).join('\n');

    const startX = a * (big + 0.08) + 0.15;
    const bars = Array.from({ length: b }, (_, i) =>
        `  \\draw[fill=black!8] (${n(startX + i * (small + 0.06))},0) rectangle (${n(startX + i * (small + 0.06) + small)},${big});\n` +
        `  \\node[font=\\tiny] at (${n(startX + i * (small + 0.06) + small / 2)},${n(big / 2)}) {$x$};`
    ).join('\n');

    return {
        question: 'Write the expression these algebra tiles represent.',
        answer: `${a === 1 ? '' : a}x² + ${b === 1 ? '' : b}x`,
        figure: tikz(`${squares}\n${bars}`),
    };
}

/** An area model showing a product split into partial products. */
function areaModel(ctx) {
    const grade = gradeOf(ctx);
    const tens = between(1, 4) * 10;
    const ones = between(1, 9);
    const multiplier = between(2, 9);

    return {
        question: grade >= 9
            ? 'Write the product this area model represents, expanded.'
            : 'Use the area model to find the product.',
        answer: grade >= 9
            ? `${multiplier * tens} + ${multiplier * ones} = ${multiplier * (tens + ones)}`
            : `${multiplier * (tens + ones)}`,
        figure: tikz(
            `  \\draw (0,0) rectangle (2.1,0.9);\n  \\draw (1.5,0) -- (1.5,0.9);\n` +
            `  \\node[font=\\tiny] at (0.75,0.45) {$${multiplier} \\times ${tens}$};\n` +
            `  \\node[font=\\tiny] at (1.8,0.45) {$${multiplier} \\times ${ones}$};\n` +
            `  \\node[above,font=\\tiny] at (0.75,0.9) {$${tens}$};\n` +
            `  \\node[above,font=\\tiny] at (1.8,0.9) {$${ones}$};\n` +
            `  \\node[left,font=\\tiny] at (0,0.45) {$${multiplier}$};`
        ),
    };
}

/** A V-shaped absolute value graph. */
function absoluteValueGraph(ctx) {
    const h = between(-2, 2);
    const k = between(-3, 2);
    const cell = 0.3;
    const max = 5;
    const g = (v) => n((v + max) * cell);

    const arm = (direction) => {
        const points = [];
        for (let x = h; direction > 0 ? x <= max : x >= -max; x += direction) {
            const y = Math.abs(x - h) + k;
            if (y >= -max && y <= max) points.push(`(${g(x)},${g(y)})`);
        }
        return points;
    };
    const left = arm(-1);
    const right = arm(1);

    const tasks = [
        ['What are the coordinates of the vertex?', `(${h}, ${k})`],
        ['Write the equation of this function.', `y = |x ${h < 0 ? '+' : '-'} ${Math.abs(h)}| ${k < 0 ? '-' : '+'} ${Math.abs(k)}`],
        ['State the range of this function.', `y ≥ ${k}`],
    ];
    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw[step=${cell},black!18,line width=0.25pt] (0,0) grid (${n(2 * max * cell)},${n(2 * max * cell)});\n` +
            `  \\draw[->] (0,${g(0)}) -- (${n(2 * max * cell + 0.2)},${g(0)}) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (${g(0)},0) -- (${g(0)},${n(2 * max * cell + 0.2)}) node[above,font=\\tiny] {$y$};\n` +
            (left.length > 1 ? `  \\draw[line width=0.8pt] plot coordinates {${left.join(' ')}};\n` : '') +
            (right.length > 1 ? `  \\draw[line width=0.8pt] plot coordinates {${right.join(' ')}};` : '')
        ),
    };
}

/** A short program as boxes, traced or reversed. */
function codingFlow(ctx) {
    const steps = Math.max(3, Math.min(Number(ctx.terms) || 4, 5));
    const start = between(1, 12);
    const instructions = [];
    let value = start;
    for (let i = 0; i < steps; i += 1) {
        const amount = between(2, 9);
        if (Math.random() < 0.5) { instructions.push([`ADD ${amount}`, amount]); value += amount; }
        else { instructions.push([`SUB ${amount}`, -amount]); value -= amount; }
    }

    const boxes = instructions.map(([label], i) =>
        `  \\draw (0,${n(-i * 0.55)}) rectangle (1.75,${n(-i * 0.55 + 0.42)});\n` +
        `  \\node[font=\\tiny] at (0.875,${n(-i * 0.55 + 0.21)}) {${label}};` +
        (i < instructions.length - 1 ? `\n  \\draw[->] (0.875,${n(-i * 0.55)}) -- (0.875,${n(-i * 0.55 - 0.13)});` : '')
    ).join('\n');

    return {
        question: `The program starts at ${start} and runs top to bottom. What value does it end with?`,
        answer: `${value}`,
        figure: tikz(boxes),
    };
}

/* ================================================= GEOMETRY, PART TWO */

/** A regular polygon: interior and exterior angles. */
function polygonAngles(ctx) {
    const sides = randomChoice([5, 6, 7, 8, 9, 10]);
    const r = 1.1;
    const points = Array.from({ length: sides }, (_, i) => {
        const a = rad(90 + (i * 360) / sides);
        return `(${n(r * Math.cos(a))},${n(r * Math.sin(a))})`;
    });

    const interior = (sides - 2) * 180 / sides;
    const tasks = [
        ['How many sides does this regular polygon have?', `${sides}`],
        ['What is the sum of the interior angles?', `${(sides - 2) * 180}°`],
        ['What is the size of one interior angle?', `${n(interior)}°`],
        ['What is the size of one exterior angle?', `${n(360 / sides)}°`],
    ];
    const [question, answer] = randomChoice(gradeOf(ctx) <= 5 ? tasks.slice(0, 1) : tasks);

    return {
        question,
        answer,
        figure: tikz(`  \\draw ${points.join(' -- ')} -- cycle;`),
    };
}

/** Two similar triangles with a scale factor. */
function similarTriangles(ctx) {
    const base = between(2, 6);
    const height = between(2, 6);
    const factor = between(2, 3);
    // Scale from the enlarged triangle: sizing on the small one let the big one
    // run clear off the page.
    const s = n(Math.min(1.5 / (base * factor), 1.2 / (height * factor)));

    return {
        question: 'These triangles are similar. Find the missing side length.',
        answer: `${height * factor}`,
        figure: tikz(
            `  \\draw (0,0) -- (${n(base * s)},0) -- (0,${n(height * s)}) -- cycle;\n` +
            `  \\node[below,font=\\tiny] at (${n(base * s / 2)},0) {$${base}$};\n` +
            `  \\node[left,font=\\tiny] at (0,${n(height * s / 2)}) {$${height}$};\n` +
            `  \\draw (${n(base * s + 0.6)},0) -- (${n(base * s + 0.6 + base * factor * s)},0) -- (${n(base * s + 0.6)},${n(height * factor * s)}) -- cycle;\n` +
            `  \\node[below,font=\\tiny] at (${n(base * s + 0.6 + base * factor * s / 2)},0) {$${base * factor}$};\n` +
            `  \\node[left,font=\\tiny] at (${n(base * s + 0.6)},${n(height * factor * s / 2)}) {$?$};`
        ),
    };
}

/** A shape with a dashed candidate line of symmetry. */
function symmetryShape(ctx) {
    const shapes = [
        ['a rectangle', '  \\draw (0,0) rectangle (2.2,1.3);\n  \\draw[dashed] (1.1,-0.2) -- (1.1,1.5);', 'yes'],
        ['a parallelogram', '  \\draw (0,0) -- (1.8,0) -- (2.3,1.1) -- (0.5,1.1) -- cycle;\n  \\draw[dashed] (1.15,-0.2) -- (1.15,1.3);', 'no'],
        ['an isosceles triangle', '  \\draw (0,0) -- (2.0,0) -- (1.0,1.5) -- cycle;\n  \\draw[dashed] (1.0,-0.2) -- (1.0,1.7);', 'yes'],
    ];
    const [, drawing, answer] = randomChoice(shapes);

    return {
        question: 'Is the dashed line a line of symmetry?',
        answer,
        figure: tikz(drawing),
    };
}

/** Parallel lines cut by a transversal. */
function parallelLines(ctx) {
    const angle = between(35, 70);

    return {
        question: `The lines are parallel. Find the angle marked with a question mark.`,
        answer: `${180 - angle}°`,
        figure: tikz(
            `  \\draw (0,1.4) -- (3.2,1.4);\n  \\draw (0,0.2) -- (3.2,0.2);\n` +
            `  \\draw (0.5,-0.2) -- (2.7,1.8);\n` +
            `  \\node[font=\\tiny] at (1.95,1.6) {$${angle}^{\\circ}$};\n` +
            `  \\node[font=\\tiny] at (1.05,0.42) {$?$};`
        ),
    };
}

/* ============================================ DATA & PROBABILITY, TWO */

/** A scatter plot with a visible trend. */
function scatterPlot(ctx) {
    const direction = randomChoice(['positive', 'negative', 'none']);
    const cell = 0.28;
    const max = 10;
    const points = Array.from({ length: 10 }, (_, i) => {
        const x = i + 1;
        const y = direction === 'positive' ? Math.min(max, x + between(-2, 2))
            : direction === 'negative' ? Math.max(1, max - x + between(-2, 2))
                : between(1, max);
        return `  \\filldraw (${n(x * cell)},${n(y * cell)}) circle (1.5pt);`;
    }).join('\n');

    return {
        question: 'Does this scatter plot show a positive, negative, or no correlation?',
        answer: direction === 'none' ? 'no correlation' : `${direction} correlation`,
        figure: tikz(
            `  \\draw[->] (0,0) -- (0,${n(max * cell + 0.3)});\n` +
            `  \\draw[->] (0,0) -- (${n(max * cell + 0.3)},0);\n${points}`
        ),
    };
}

/** A two-stage outcome tree. */
function treeDiagram(ctx) {
    const first = randomChoice([['H', 'T'], ['Red', 'Blue']]);
    const second = randomChoice([['H', 'T'], ['Win', 'Lose']]);

    // Each first-stage branch owns a horizontal band and its second-stage
    // branches stay inside that band, so no two branches cross.
    const band = 1.4;
    const spread = 0.6;
    const branches = [];

    first.forEach((a, i) => {
        const y = (first.length - 1 - i) * band;
        branches.push(`  \\draw (0,${n(((first.length - 1) * band) / 2)}) -- (0.9,${n(y)});`);
        branches.push(`  \\node[font=\\tiny] at (1.08,${n(y)}) {${a}};`);

        second.forEach((b, k) => {
            const y2 = y + (second.length - 1 - k) * spread - ((second.length - 1) * spread) / 2;
            branches.push(`  \\draw (1.3,${n(y)}) -- (2.1,${n(y2)});`);
            branches.push(`  \\node[right,font=\\tiny] at (2.15,${n(y2)}) {${b}};`);
        });
    });

    return {
        question: 'How many possible outcomes does this tree diagram show?',
        answer: `${first.length * second.length}`,
        figure: tikz(branches.join('\n')),
    };
}

/** A two-set Venn diagram with counts. */
function vennDiagram(ctx) {
    const onlyA = between(3, 12);
    const both = between(2, 8);
    const onlyB = between(3, 12);
    const neither = between(0, 5);

    const tasks = [
        ['How many are in both sets?', `${both}`],
        ['How many are in set A in total?', `${onlyA + both}`],
        ['How many were surveyed altogether?', `${onlyA + both + onlyB + neither}`],
    ];
    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw (0,0) rectangle (3.4,2.0);\n` +
            `  \\draw (1.25,1.0) circle (0.78);\n  \\draw (2.15,1.0) circle (0.78);\n` +
            `  \\node[font=\\tiny] at (0.82,1.0) {${onlyA}};\n` +
            `  \\node[font=\\tiny] at (1.7,1.0) {${both}};\n` +
            `  \\node[font=\\tiny] at (2.58,1.0) {${onlyB}};\n` +
            `  \\node[font=\\tiny] at (3.1,0.25) {${neither}};\n` +
            `  \\node[font=\\tiny] at (0.72,1.95) {A};\n  \\node[font=\\tiny] at (2.68,1.95) {B};`
        ),
    };
}

/* ======================================= SENIOR FUNCTIONS, PART TWO */

/** A dot pattern growing arithmetically or geometrically. */
function sequenceDots(ctx) {
    const geometric = Math.random() < 0.4;
    const first = between(1, 3);
    const step = between(2, 3);
    const terms = 4;
    const counts = Array.from({ length: terms }, (_, i) => (geometric ? first * step ** i : first + i * step));
    const next = geometric ? counts[terms - 1] * step : counts[terms - 1] + step;

    let x = 0;
    const groups = counts.map((count, t) => {
        const dots = Array.from({ length: Math.min(count, 12) }, (_, i) =>
            `  \\filldraw (${n(x + (i % 4) * 0.17)},${n(Math.floor(i / 4) * 0.17)}) circle (1.3pt);`
        ).join('\n');
        const label = `  \\node[below,font=\\tiny] at (${n(x + 0.25)},-0.08) {${t + 1}};`;
        x += 0.95;
        return `${dots}\n${label}`;
    }).join('\n');

    const tasks = [
        ['How many dots are in the next figure?', `${next}`],
        ['Is this sequence arithmetic or geometric?', geometric ? 'geometric' : 'arithmetic'],
        [geometric ? 'What is the common ratio?' : 'What is the common difference?', `${step}`],
    ];
    const [question, answer] = randomChoice(tasks);

    return { question, answer, figure: tikz(groups) };
}

/** A conic section drawn on axes. */
function conicShape(ctx) {
    const kind = randomChoice(['circle', 'ellipse']);
    const a = between(2, 4);
    const b = kind === 'circle' ? a : between(1, 4);
    const cell = 0.3;
    const max = 5;
    const g = (v) => n((v + max) * cell);

    return {
        question: kind === 'circle'
            ? 'Write the equation of this circle, centred at the origin.'
            : 'Write the equation of this ellipse, centred at the origin.',
        answer: kind === 'circle'
            ? `x² + y² = ${a * a}`
            : `x²/${a * a} + y²/${b * b} = 1`,
        figure: tikz(
            `  \\draw[step=${cell},black!18,line width=0.25pt] (0,0) grid (${n(2 * max * cell)},${n(2 * max * cell)});\n` +
            `  \\draw[->] (0,${g(0)}) -- (${n(2 * max * cell + 0.2)},${g(0)}) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (${g(0)},0) -- (${g(0)},${n(2 * max * cell + 0.2)}) node[above,font=\\tiny] {$y$};\n` +
            `  \\draw[line width=0.8pt] (${g(0)},${g(0)}) ellipse (${n(a * cell)} and ${n(b * cell)});`
        ),
    };
}

/** A point on the Argand plane. */
function complexPlane(ctx) {
    const re = between(-4, 4) || 2;
    const im = between(-4, 4) || 3;
    const cell = 0.3;
    const max = 5;
    const g = (v) => n((v + max) * cell);

    const tasks = [
        ['Write the complex number this point represents.', `${re} ${im < 0 ? '-' : '+'} ${Math.abs(im)}i`],
        ['Find the modulus of this complex number, to 2 decimal places.', `${Math.hypot(re, im).toFixed(2)}`],
    ];
    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer,
        figure: tikz(
            `  \\draw[step=${cell},black!18,line width=0.25pt] (0,0) grid (${n(2 * max * cell)},${n(2 * max * cell)});\n` +
            `  \\draw[->] (0,${g(0)}) -- (${n(2 * max * cell + 0.2)},${g(0)}) node[right,font=\\tiny] {Re};\n` +
            `  \\draw[->] (${g(0)},0) -- (${g(0)},${n(2 * max * cell + 0.2)}) node[above,font=\\tiny] {Im};\n` +
            `  \\draw[->,line width=0.7pt] (${g(0)},${g(0)}) -- (${g(re)},${g(im)});\n` +
            `  \\filldraw (${g(re)},${g(im)}) circle (1.8pt);`
        ),
    };
}

/** A shaded region under a straight line. */
function areaUnderCurve(ctx) {
    const m = between(1, 3);
    const upper = between(2, 4);
    const cell = 0.42;
    const g = (v) => n(v * cell);
    const area = (m * upper * upper) / 2;

    const samples = [];
    for (let x = 0; x <= upper; x += 0.25) samples.push(`(${g(x)},${g(m * x)})`);

    return {
        question: `Find the exact area under y = ${m}x from x = 0 to x = ${upper}.`,
        answer: `${n(area)}`,
        figure: tikz(
            `  \\fill[black!15] (0,0) -- (${g(upper)},0) -- (${g(upper)},${g(m * upper)}) -- cycle;\n` +
            `  \\draw[->] (0,0) -- (${g(upper + 1)},0) node[right,font=\\tiny] {$x$};\n` +
            `  \\draw[->] (0,0) -- (0,${g(m * upper + 1)}) node[above,font=\\tiny] {$y$};\n` +
            `  \\draw[line width=0.8pt] plot coordinates {${samples.join(' ')}};\n` +
            `  \\draw[dashed] (${g(upper)},0) -- (${g(upper)},${g(m * upper)});\n` +
            `  \\node[below,font=\\tiny] at (${g(upper)},0) {$${upper}$};`
        ),
    };
}

/** An open box folded from a sheet with corners cut out. */
function optimizationBox(ctx) {
    const sheet = between(10, 20);
    const cut = between(1, 4);
    const s = n(2.6 / sheet);
    const volume = cut * (sheet - 2 * cut) ** 2;

    return {
        question: `Squares of side ${cut} are cut from the corners of this ${sheet} by ${sheet} sheet and the sides folded up. What is the volume of the open box?`,
        answer: `${volume} cubic units`,
        figure: tikz(
            `  \\draw (0,0) rectangle (${n(sheet * s)},${n(sheet * s)});\n` +
            `  \\draw (0,0) rectangle (${n(cut * s)},${n(cut * s)});\n` +
            `  \\draw (${n((sheet - cut) * s)},0) rectangle (${n(sheet * s)},${n(cut * s)});\n` +
            `  \\draw (0,${n((sheet - cut) * s)}) rectangle (${n(cut * s)},${n(sheet * s)});\n` +
            `  \\draw (${n((sheet - cut) * s)},${n((sheet - cut) * s)}) rectangle (${n(sheet * s)},${n(sheet * s)});\n` +
            `  \\node[below,font=\\tiny] at (${n(sheet * s / 2)},0) {$${sheet}$};`
        ),
    };
}

/** A ladder against a wall: the classic related-rates setup. */
function ladderSlide(ctx) {
    const [a, b, c] = randomChoice([[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
    const s = n(2.6 / c);

    return {
        question: `A ${c} m ladder leans against a wall with its foot ${b} m from the base. How far up the wall does it reach?`,
        answer: `${a} m`,
        figure: tikz(
            `  \\draw[line width=0.9pt] (0,0) -- (0,${n(a * s * 1.6)});\n` +
            `  \\draw (0,0) -- (${n(b * s * 1.6)},0);\n` +
            `  \\draw[line width=0.9pt] (0,${n(a * s * 1.6)}) -- (${n(b * s * 1.6)},0);\n` +
            `  \\draw (0,0.16) -- (0.16,0.16) -- (0.16,0);\n` +
            `  \\node[below,font=\\tiny] at (${n(b * s * 0.8)},0) {$${b}$};\n` +
            `  \\node[above right,font=\\tiny] at (${n(b * s * 0.8)},${n(a * s * 0.8)}) {$${c}$};\n` +
            `  \\node[left,font=\\tiny] at (0,${n(a * s * 0.8)}) {$?$};`
        ),
    };
}

/* ========================================= FINANCIAL LITERACY, TWO */

/** Two packages side by side: which is the better buy. */
function priceCompare(ctx) {
    const countA = between(2, 6);
    const countB = countA * between(2, 3);
    const priceA = between(2, 9) + 0.99;
    const priceB = n(priceA * (countB / countA) * randomChoice([0.8, 0.85, 0.9]));
    const perA = priceA / countA;
    const perB = priceB / countB;

    return {
        question: 'Which package is the better value per item?',
        answer: perA < perB ? `the pack of ${countA}` : `the pack of ${countB}`,
        figure: tikz(
            `  \\draw (0,0) rectangle (1.5,1.1);\n` +
            `  \\node[font=\\tiny] at (0.75,0.72) {${countA} items};\n` +
            `  \\node[font=\\tiny] at (0.75,0.38) {$\\mathdollar ${priceA.toFixed(2)}$};\n` +
            `  \\draw (1.9,0) rectangle (3.4,1.1);\n` +
            `  \\node[font=\\tiny] at (2.65,0.72) {${countB} items};\n` +
            `  \\node[font=\\tiny] at (2.65,0.38) {$\\mathdollar ${priceB.toFixed(2)}$};`
        ),
    };
}

/** A price tag with a discount on it. */
function discountTag(ctx) {
    const price = between(20, 120);
    const percent = randomChoice([10, 15, 20, 25, 30, 40, 50]);
    const withTax = Math.random() < 0.4;
    const sale = price * (1 - percent / 100);

    return {
        question: withTax
            ? `Apply the discount, then add 13% tax. What is the final price?`
            : `What is the sale price after the discount?`,
        answer: `$${(withTax ? sale * 1.13 : sale).toFixed(2)}`,
        figure: tikz(
            `  \\draw (0,0) -- (2.4,0) -- (2.4,1.2) -- (0,1.2) -- cycle;\n` +
            `  \\filldraw (0.25,0.95) circle (0.07);\n` +
            `  \\node[font=\\scriptsize] at (1.4,0.82) {$\\mathdollar ${price}.00$};\n` +
            `  \\node[font=\\scriptsize] at (1.4,0.35) {${percent}\\% off};`
        ),
    };
}

/** Savings growing year by year. */
function interestBars(ctx) {
    const principal = randomChoice([500, 1000, 2000]);
    const rate = between(2, 8);
    const years = 4;
    const compound = Math.random() < 0.5;
    const value = (t) => (compound ? principal * (1 + rate / 100) ** t : principal * (1 + (rate * t) / 100));
    const top = value(years);
    const unit = n(2.4 / top);

    const bars = Array.from({ length: years + 1 }, (_, t) =>
        `  \\fill[black!20,draw=black] (${n(t * 0.62 + 0.2)},0) rectangle (${n(t * 0.62 + 0.62)},${n(value(t) * unit)});\n` +
        `  \\node[below,font=\\tiny] at (${n(t * 0.62 + 0.41)},0) {${t}};`
    ).join('\n');

    return {
        question: `$${principal} is invested at ${rate}% ${compound ? 'compounded annually' : 'simple interest'}. What is it worth after ${years} years?`,
        answer: `$${value(years).toFixed(2)}`,
        figure: tikz(
            `  \\draw[->] (0,0) -- (0,${n(top * unit + 0.35)});\n` +
            `  \\draw[->] (0,0) -- (${n((years + 1) * 0.62 + 0.3)},0);\n${bars}`
        ),
    };
}

/** Two currency bars at a given rate. */
function currencyBars(ctx) {
    // Below 1, so the converted bar is always the shorter of the two and the
    // picture agrees with the arithmetic.
    const rate = Number((Math.random() * 0.22 + 0.68).toFixed(2));
    const amount = between(20, 200);

    return {
        question: `The bar shows the exchange rate. Convert ${amount} CAD to USD.`,
        answer: `${(amount * rate).toFixed(2)} USD`,
        figure: tikz(
            `  \\fill[black!15,draw=black] (0,0.55) rectangle (3.0,1.0);\n` +
            `  \\node[font=\\tiny] at (1.5,0.775) {1.00 CAD};\n` +
            `  \\fill[black!30,draw=black] (0,0) rectangle (${n(3.0 * rate)},0.45);\n` +
            `  \\node[font=\\tiny] at (${n(1.5 * rate)},0.225) {${rate.toFixed(2)} USD};`
        ),
    };
}

/*
 * What each figure is: how tall it draws, and which grades it suits.
 *
 * The grade band belongs to the figure, not to the topic that reaches it.
 * "Integers" spans Grades 6-12, but reading a thermometer is a Grade 3-8
 * skill; without its own band a Grade 12 sheet could ask for one. Likewise a
 * parabola is fair game from Grade 9, but only from Grade 11 does it get
 * asked about as a function.
 */
ratioTape.heightMm = 14;
ratioTape.grades = [5, 10];
factorTree.heightMm = 22;
factorTree.grades = [4, 9];
squareRootArea.heightMm = 22;
squareRootArea.grades = [6, 10];
operationChain.heightMm = 14;
operationChain.grades = [3, 9];
tapeDiagram.heightMm = 16;
tapeDiagram.grades = [2, 8];
unitLadder.heightMm = 24;
unitLadder.grades = [4, 9];
systemsGraph.heightMm = 34;
systemsGraph.grades = [9, 12];
algebraTiles.heightMm = 16;
algebraTiles.grades = [8, 11];
areaModel.heightMm = 16;
areaModel.grades = [3, 10];
absoluteValueGraph.heightMm = 34;
absoluteValueGraph.grades = [9, 12];
codingFlow.heightMm = 26;
codingFlow.grades = [1, 9];
polygonAngles.heightMm = 24;
polygonAngles.grades = [3, 10];
similarTriangles.heightMm = 20;
similarTriangles.grades = [7, 11];
symmetryShape.heightMm = 20;
symmetryShape.grades = [2, 8];
parallelLines.heightMm = 24;
parallelLines.grades = [7, 10];
scatterPlot.heightMm = 28;
scatterPlot.grades = [8, 12];
treeDiagram.heightMm = 26;
treeDiagram.grades = [6, 12];
vennDiagram.heightMm = 24;
vennDiagram.grades = [6, 12];
sequenceDots.heightMm = 16;
sequenceDots.grades = [6, 12];
conicShape.heightMm = 34;
conicShape.grades = [11, 12];
complexPlane.heightMm = 34;
complexPlane.grades = [11, 12];
areaUnderCurve.heightMm = 28;
areaUnderCurve.grades = [11, 12];
optimizationBox.heightMm = 26;
optimizationBox.grades = [11, 12];
ladderSlide.heightMm = 26;
ladderSlide.grades = [9, 12];
priceCompare.heightMm = 16;
priceCompare.grades = [4, 12];
discountTag.heightMm = 18;
discountTag.grades = [6, 12];
interestBars.heightMm = 28;
interestBars.grades = [7, 12];
currencyBars.heightMm = 14;
currencyBars.grades = [7, 12];
tenFrame.heightMm = 14;
tenFrame.grades = [1, 2];
placeValueBlocks.heightMm = 13;
placeValueBlocks.grades = [1, 4];
dotArray.heightMm = 18;
dotArray.grades = [2, 5];
numberLine.heightMm = 13;
numberLine.grades = [1, 9];
hundredGrid.heightMm = 22;
hundredGrid.grades = [4, 8];
fractionBar.heightMm = 10;
fractionBar.grades = [1, 8];
fractionCircle.heightMm = 24;
fractionCircle.grades = [1, 8];
growingPattern.heightMm = 13;
growingPattern.grades = [3, 9];
ruler.heightMm = 12;
ruler.grades = [1, 6];
thermometer.heightMm = 40;
thermometer.grades = [3, 8];
clock.heightMm = 26;
clock.grades = [1, 6];
beaker.heightMm = 32;
beaker.grades = [2, 7];
balanceScale.heightMm = 16;
balanceScale.grades = [3, 9];
rectangleMeasure.heightMm = 20;
rectangleMeasure.grades = [3, 9];
compositeShape.heightMm = 22;
compositeShape.grades = [4, 10];
solidVolume.heightMm = 22;
solidVolume.grades = [5, 11];
rightTriangle.heightMm = 22;
rightTriangle.grades = [8, 12];
angleMeasure.heightMm = 22;
angleMeasure.grades = [4, 10];
circleMeasure.heightMm = 28;
circleMeasure.grades = [7, 12];
coordinateGrid.heightMm = 26;
coordinateGrid.grades = [5, 10];
transformation.heightMm = 28;
transformation.grades = [3, 10];
barGraph.heightMm = 30;
barGraph.grades = [1, 9];
pictograph.heightMm = 18;
pictograph.grades = [1, 5];
linePlot.heightMm = 20;
linePlot.grades = [2, 9];
lineGraph.heightMm = 30;
lineGraph.grades = [4, 11];
spinner.heightMm = 28;
spinner.grades = [4, 12];
boxPlot.heightMm = 16;
boxPlot.grades = [9, 12];
functionMachine.heightMm = 16;
functionMachine.grades = [3, 9];
inequalityLine.heightMm = 12;
inequalityLine.grades = [7, 12];
linearGraph.heightMm = 34;
linearGraph.grades = [8, 12];
trigTriangle.heightMm = 24;
trigTriangle.grades = [10, 12];
unitCircle.heightMm = 30;
unitCircle.grades = [11, 12];
sineWave.heightMm = 32;
sineWave.grades = [11, 12];
parabola.heightMm = 34;
parabola.grades = [9, 12];
exponentialCurve.heightMm = 32;
exponentialCurve.grades = [9, 12];
rationalAsymptote.heightMm = 34;
rationalAsymptote.grades = [11, 12];
polynomialCurve.heightMm = 34;
polynomialCurve.grades = [11, 12];
tangentLine.heightMm = 34;
tangentLine.grades = [12, 12];
vectorSum.heightMm = 34;
vectorSum.grades = [12, 12];
coins.heightMm = 11;
coins.grades = [1, 6];
budgetPie.heightMm = 36;
budgetPie.grades = [7, 12];

/**
 * Visual draws by topic id, so grade and topic filtering govern these the way
 * they govern every other question.
 *
 * @type {Record<string, Array<(ctx: object) => {question: string, answer: string, figure: string}>>}
 */
export const VISUAL_PROBLEMS = {
    // Number
    'counting-quantity': [tenFrame, numberLine, dotArray],
    'basic-operations': [dotArray, numberLine, tenFrame],
    'place-value': [placeValueBlocks, numberLine, hundredGrid],
    'fractions': [fractionBar, fractionCircle],
    'decimals': [hundredGrid, numberLine],
    'percentages': [hundredGrid, fractionBar],
    'rational-numbers': [numberLine, fractionBar],
    'integers': [numberLine, thermometer],
    'patterns': [growingPattern, numberLine],
    'estimation': [numberLine],
    'word-problems': [tapeDiagram, areaModel],
    'ratios-proportions': [ratioTape, similarTriangles],
    'exponents-roots': [squareRootArea],
    'order-of-operations': [operationChain],
    'factors-multiples': [factorTree, squareRootArea],

    // Measurement
    'length': [ruler],
    'temperature': [thermometer],
    'time': [clock],
    'capacity-volume': [beaker],
    'weight-mass': [balanceScale],
    'metric-customary': [ruler, beaker],
    'unit-conversions': [unitLadder],

    // Geometry
    '2d-shapes': [rectangleMeasure, compositeShape],
    '3d-shapes': [solidVolume],
    'area-perimeter': [rectangleMeasure, compositeShape],
    'volume-surface': [solidVolume],
    'triangles': [rightTriangle, angleMeasure],
    'pythagorean-theorem': [rightTriangle],
    'angles': [angleMeasure, parallelLines],
    'circles': [circleMeasure],
    'coordinate-geometry': [coordinateGrid, linearGraph],
    'transformations': [transformation],
    'symmetry': [symmetryShape, transformation],
    'polygons': [polygonAngles],
    'congruence-similarity': [similarTriangles],

    // Data and probability
    'bar-graphs': [barGraph],
    'picture-graphs': [pictograph],
    'line-plots': [linePlot],
    'graphs-charts': [barGraph, lineGraph],
    'data-analysis': [lineGraph, linePlot, boxPlot],
    'mean-median-mode': [linePlot, barGraph, boxPlot],
    'probability': [spinner],
    'sampling': [vennDiagram],
    'correlation': [scatterPlot],
    'counting-principles': [treeDiagram],

    // Algebra
    'expressions': [functionMachine],
    'linear-equations': [balanceScale, functionMachine],
    'linear-relations': [linearGraph, growingPattern],
    'functions': [linearGraph, functionMachine, parabola, exponentialCurve],
    'inequalities': [inequalityLine],
    'systems': [systemsGraph],
    'polynomials': [algebraTiles],
    'exponents-radicals': [squareRootArea, algebraTiles],
    'rational-expressions': [areaModel],
    'absolute-value': [absoluteValueGraph],
    'factoring': [algebraTiles, areaModel],
    'coding': [codingFlow],

    // Trigonometry
    'right-triangles': [trigTriangle],
    'unit-circle': [unitCircle],
    'trig-functions': [sineWave, unitCircle, trigTriangle],
    'identities': [sineWave],
    'equations': [sineWave],

    // Advanced functions and calculus
    'polynomial-functions': [polynomialCurve, parabola, exponentialCurve],
    'quadratic-equations': [parabola],
    'exponential-functions': [exponentialCurve],
    'logarithms': [exponentialCurve],
    'rational-functions': [rationalAsymptote],
    'derivatives': [tangentLine, polynomialCurve],
    'limits': [tangentLine, rationalAsymptote],
    'vectors-matrices': [vectorSum],
    'sequences-series': [sequenceDots],
    'conic-sections': [conicShape],
    'parametric-polar': [conicShape],
    'complex-numbers': [complexPlane],
    'integrals': [areaUnderCurve],
    'optimization': [optimizationBox],
    'related-rates': [ladderSlide],
    'applications': [trigTriangle, tangentLine],

    // Financial literacy
    'coins-and-bills': [coins],
    'making-change': [coins],
    'money': [coins],
    'budgeting': [budgetPie],
    'unit-price': [priceCompare],
    'sales-tax-discount': [discountTag],
    'simple-interest': [interestBars],
    'compound-interest': [interestBars],
    'currency-exchange': [currencyBars],
};
