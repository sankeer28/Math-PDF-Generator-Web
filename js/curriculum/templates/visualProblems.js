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

    const gap = step;
    const tasks = [
        ['What number does the arrow point to?', format(value)],
        ['What is the spacing between two neighbouring ticks?', format(gap)],
        ['What number is one tick to the right of the arrow?', format(value + step)],
        ['What number is one tick to the left of the arrow?', format(value - step)],
        ['What number does the number line start at?', format(start)],
        ['What number does the number line end at?', format(start + ticks * step)],
    ];
    if (grade >= 3) tasks.push(['What number is halfway between the arrow and the next tick?', format(value + step / 2)]);
    if (grade >= 4) tasks.push(['Is the arrow nearer the start or the end of the line?', marked < ticks / 2 ? 'the start' : (marked > ticks / 2 ? 'the end' : 'exactly halfway')]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const tasks = [
        ['What fraction of the circle is shaded?', `${shaded}/${parts}`],
        ['What fraction of the circle is not shaded?', `${parts - shaded}/${parts}`],
        ['How many equal parts is the circle cut into?', parts],
        ['How many parts are shaded?', shaded],
    ];
    if (grade >= 3) tasks.push(['Is more or less than half the circle shaded?', shaded / parts > 0.5 ? 'more' : (shaded / parts < 0.5 ? 'less' : 'exactly half')]);
    if (grade >= 4) tasks.push(['What fraction of the circle is shaded? Give your answer in simplest form.', simplify(shaded, parts)]);
    if (grade >= 5) tasks.push(['Write the shaded amount as a decimal.', n(Math.round((shaded / parts) * 1000) / 1000)]);
    if (grade >= 6) tasks.push(['Write the shaded amount as a percent, to one decimal place.', `${n(Math.round((shaded / parts) * 1000) / 10)}%`]);
    if (grade >= 6) tasks.push(['What is the angle at the centre of one slice?', `${n(360 / parts)}°`]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const tasks = [
        ['What number do these blocks show?', value],
        ['How many ten-blocks are shown?', tens],
        ['How many single ones are shown?', ones],
        ['What is one more than the number shown?', value + 1],
        ['What is ten more than the number shown?', value + 10],
    ];
    if (grade >= 2) tasks.push(['Write the number shown in expanded form.', hundreds > 0 ? `${hundreds * 100} + ${tens * 10} + ${ones}` : `${tens * 10} + ${ones}`]);
    if (grade >= 3) tasks.push(['What is the value of the tens digit in the number shown?', tens * 10]);
    if (grade >= 3) tasks.push(['Round the number shown to the nearest ten.', Math.round(value / 10) * 10]);
    if (grade >= 4 && hundreds > 0) tasks.push(['What is the value of the hundreds digit?', hundreds * 100]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const tasks = [
        ['How long is the bar, in centimetres?', `${length} cm`],
        ['How long is the bar, in millimetres?', `${n(length * 10)} mm`],
        [`How much shorter than ${marks} cm is the bar?`, `${n(marks - length)} cm`],
        ['How long would two of these bars be end to end?', `${n(length * 2)} cm`],
    ];
    if (grade >= 3) tasks.push(['To the nearest whole centimetre, how long is the bar?', `${Math.round(length)} cm`]);
    if (grade >= 3) tasks.push(['Is the bar longer or shorter than half the ruler?', length > marks / 2 ? 'longer' : (length < marks / 2 ? 'shorter' : 'exactly half')]);
    if (grade >= 4) tasks.push(['What is half the length of the bar?', `${n(length / 2)} cm`]);
    if (grade >= 5) tasks.push(['What fraction of the whole ruler does the bar cover?', simplify(Math.round(length * 2), marks * 2)]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const drop = between(3, 12);
    const tasks = [
        ['What temperature does the thermometer show?', `${value}°C`],
        [`The temperature falls ${drop} degrees from this reading. What does it show then?`, `${value - drop}°C`],
        [`The temperature rises ${drop} degrees from this reading. What does it show then?`, `${value + drop}°C`],
        ['Is this reading above or below freezing?', value > 0 ? 'above' : (value < 0 ? 'below' : 'exactly at freezing')],
        ['How many degrees is this reading from 0°C?', Math.abs(value)],
    ];
    if (grade >= 4) tasks.push([`How many degrees warmer is this than ${value - drop}°C?`, drop]);
    if (grade >= 5) tasks.push(['What is this reading in degrees Fahrenheit?', `${n(Math.round(((value * 9) / 5 + 32) * 10) / 10)}°F`]);
    if (grade >= 6) tasks.push(['Write this reading as an integer.', value]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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
    const later = randomChoice([20, 30, 45, 60, 90]);
    const total = (hour % 12) * 60 + minute + later;
    const laterHour = Math.floor(total / 60) % 12 || 12;
    const earlier = (hour % 12) * 60 + minute - 30;
    const earlierHour = Math.floor(((earlier + 720) % 720) / 60) || 12;

    const tasks = [
        ['What time is shown on this clock?', shown],
        ['What hour is the hour hand pointing to or just past?', hour],
        ['How many minutes past the hour does this clock show?', minute],
        ['How many minutes until the next hour?', 60 - minute || 60],
    ];
    if (grade >= 2) tasks.push(['What time will it be one hour after the time shown?', `${hour === 12 ? 1 : hour + 1}:${String(minute).padStart(2, '0')}`]);
    if (grade >= 3) tasks.push(['Write the time shown in words.', minute === 0 ? `${hour} o'clock` : (minute === 30 ? `half past ${hour}` : (minute === 15 ? `quarter past ${hour}` : `${minute} minutes past ${hour}`))]);
    if (grade >= 4) tasks.push([`What time will it be ${later} minutes after the time shown?`, `${laterHour}:${String(total % 60).padStart(2, '0')}`]);
    if (grade >= 4) tasks.push(['What time was it 30 minutes before the time shown?', `${earlierHour}:${String(((earlier % 60) + 60) % 60).padStart(2, '0')}`]);
    if (grade >= 5) tasks.push(['Write the time shown on a 24-hour clock, assuming it is the afternoon.', `${(hour % 12) + 12}:${String(minute).padStart(2, '0')}`]);

    const [question, answer] = randomChoice(tasks);

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

    const grade = gradeOf(ctx);
    const tasks = [
        ['How much liquid is in the jug, in millilitres?', `${value} mL`],
        ['How much more liquid would fill the jug?', `${capacity - value} mL`],
        ['What is the capacity of this jug, in millilitres?', `${capacity} mL`],
        [`How much liquid would be left after pouring out ${step} mL?`, `${value - step} mL`],
    ];
    if (grade >= 3) tasks.push(['How much liquid is in the jug, in litres?', `${n(value / 1000)} L`]);
    if (grade >= 4) tasks.push(['What fraction of the jug is filled?', simplify(value, capacity)]);
    if (grade >= 5) tasks.push(['What percent of the jug is filled?', `${n((value / capacity) * 100)}%`]);
    if (grade >= 5) tasks.push([`How many ${step} mL glasses can be poured from what is in the jug?`, value / step]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const tasks = [
        ['The scale balances. Each box has the same mass. What is the mass of one box?', known],
        ['The scale balances. What is the total mass on the right pan?', total],
        ['How many boxes are on the scale?', boxes],
        ['If the scale balances, what does that say about the two sides?', 'their masses are equal'],
    ];
    if (grade >= 5) tasks.push(['What would the total mass be with one more box added to each side?', total + known]);
    if (grade >= 6) tasks.push([`Write an equation for this balance using x for one box.`, `${boxes}x = ${total}`]);
    if (grade >= 7) tasks.push([`Solve ${boxes}x = ${total}.`, known]);
    if (grade >= 7) tasks.push(['If one box were removed from the left, what must be removed from the right to keep the balance?', `${known}`]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const grade = gradeOf(ctx);
    const outerPerimeter = 2 * (a + b);

    const tasks = [
        ['Find the area of this shape.', `${area} square units`],
        ['Find the area of the whole rectangle before the corner was removed.', `${a * b} square units`],
        ['Find the area of the piece that was cut away.', `${c * d} square units`],
        ['Find the perimeter of the rectangle this shape was cut from.', `${outerPerimeter} units`],
    ];
    if (grade >= 5) tasks.push(['What fraction of the rectangle is left?', simplify(area, a * b)]);
    if (grade >= 6) tasks.push(['What percent of the rectangle was cut away?', `${n(Math.round(((c * d) / (a * b)) * 1000) / 10)}%`]);
    if (grade >= 6) tasks.push(['How many unit squares of side 1 fit in the shape?', area]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const grade = gradeOf(ctx);
    const tasks = [
        ['Find the missing side length of this right triangle.', missing === 'c' ? c : (missing === 'a' ? a : b)],
        ['Find the area of this right triangle.', (a * b) / 2],
        ['Find the perimeter of this right triangle.', a + b + c],
        ['Which side of this triangle is the hypotenuse?', `the side of length ${c}`],
    ];
    if (grade >= 9) tasks.push(['Is this triangle right-angled? Write yes or no.', 'yes']);
    if (grade >= 9) tasks.push([`Find sin of the angle opposite the side of length ${a}.`, simplify(a, c)]);
    if (grade >= 10) tasks.push([`Find the angle opposite the side of length ${a}, to the nearest degree.`, `${Math.round((Math.asin(a / c) * 180) / Math.PI)}°`]);
    if (grade >= 10) tasks.push(['Find the length of the altitude to the hypotenuse, to two decimals.', n(Math.round(((a * b) / c) * 100) / 100)]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const asked = randomChoice([
        [`Find the side opposite the ${angle}° angle, to 1 decimal place.`, opposite.toFixed(1)],
        [`Find the side adjacent to the ${angle}° angle, to 1 decimal place.`, adjacent.toFixed(1)],
        [`Write sin, cos and tan of the ${angle}° angle, to 2 decimal places.`,
            `sin ${Math.sin(rad(angle)).toFixed(2)}, cos ${Math.cos(rad(angle)).toFixed(2)}, tan ${Math.tan(rad(angle)).toFixed(2)}`],
        [`Find sin of the ${angle}° angle, to 2 decimal places.`, Math.sin(rad(angle)).toFixed(2)],
        [`Find cos of the ${angle}° angle, to 2 decimal places.`, Math.cos(rad(angle)).toFixed(2)],
        [`Find tan of the ${angle}° angle, to 2 decimal places.`, Math.tan(rad(angle)).toFixed(2)],
        [`Find the third angle of this right triangle.`, `${90 - angle}°`],
        [`Which side of this triangle is the hypotenuse?`, `the side of length ${hyp}`],
        [`Find the area of this triangle, to 1 decimal place.`, ((opposite * adjacent) / 2).toFixed(1)],
        [`Find the perimeter of this triangle, to 1 decimal place.`, (opposite + adjacent + hyp).toFixed(1)],
        [`Which ratio uses the opposite side and the hypotenuse?`, 'sine'],
        [`Which ratio uses the opposite side and the adjacent side?`, 'tangent'],
    ]);

    return {
        question: asked[0],
        answer: `${asked[1]}`,
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
        ['Write the circumference of this circle in terms of π.', `${2 * r}π`],
        ['Write the area of this circle in terms of π.', `${r * r}π`],
        [showDiameter ? 'What is the radius of this circle?' : 'What is the diameter of this circle?',
            showDiameter ? `${r}` : `${2 * r}`],
        ['How many radii make one diameter?', 2],
    ];
    if (grade >= 8) tasks.push(['Find the area of a semicircle with this radius, in terms of π.', `${simplify(r * r, 2)}π`]);
    if (grade >= 9) tasks.push(['Find the arc length of a quarter of this circle, in terms of π.', `${simplify(r, 2)}π`]);
    if (grade >= 9) tasks.push(['If the radius doubled, how many times as large would the area be?', 4]);
    if (grade >= 10) tasks.push([`Write the equation of this circle if it is centred at the origin.`, `x² + y² = ${r * r}`]);

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

    const grade = gradeOf(ctx);
    const tasks = [
        ['Find the volume of this rectangular prism.', `${l * w * h} cubic units`],
        ['Find the surface area of this rectangular prism.', `${2 * (l * w + l * h + w * h)} square units`],
        ['How many faces does this prism have?', 6],
        ['How many edges does this prism have?', 12],
        ['Find the area of the base of this prism.', `${l * w} square units`],
    ];
    if (grade >= 6) tasks.push(['Find the total length of all the edges of this prism.', `${4 * (l + w + h)} units`]);
    if (grade >= 7) tasks.push(['If every edge doubled, how many times as large would the volume be?', 8]);
    if (grade >= 7) tasks.push(['How many unit cubes would fill this prism?', l * w * h]);
    if (grade >= 9) tasks.push(['Find the length of the space diagonal of this prism, to two decimals.', n(Math.round(Math.sqrt(l * l + w * w + h * h) * 100) / 100)]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const grade = gradeOf(ctx);
    const tasks = [
        ['Describe the translation that maps the shaded shape onto the outlined one.', `${dx} right, ${dy} up`],
        ['How far right does the shape move?', `${dx} units`],
        ['How far up does the shape move?', `${dy} units`],
        ['Does this translation change the size of the shape?', 'no'],
        ['Name the transformation shown.', 'a translation'],
    ];
    if (grade >= 5) tasks.push(['Describe the translation that maps the outlined shape back onto the shaded one.', `${dx} left, ${dy} down`]);
    if (grade >= 6) tasks.push(['Write this translation as a coordinate rule.', `(x, y) → (x + ${dx}, y + ${dy})`]);
    if (grade >= 7) tasks.push(['Are the two shapes congruent or similar only?', 'congruent']);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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
    if (grade >= 2) tasks.push(['What is the total of all four bars?', `${total}`]);
    if (grade >= 2) tasks.push(['How many bars are on this graph?', `${values.length}`]);
    if (grade >= 2) tasks.push(['How much taller is the tallest bar than the shortest?', `${highest - lowest}`]);
    if (grade >= 3) tasks.push(['How many bars are taller than the shortest bar?', `${values.filter((v) => v > lowest).length}`]);
    if (grade >= 4) tasks.push(['What is the mean of the four bars, to two decimal places?', `${n(Math.round((total / values.length) * 100) / 100)}`]);
    if (grade >= 5) tasks.push(['What fraction of the total does the tallest bar hold?', simplify(highest, total)]);
    if (grade >= 6) tasks.push(['What percent of the total does the tallest bar hold, to one decimal place?', `${n(Math.round((highest / total) * 1000) / 10)}%`]);
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
        ['What is the smallest value plotted?', `${Math.min(...data)}`],
        ['What is the largest value plotted?', `${Math.max(...data)}`],
        [`How many times does the most common value appear?`, `${Math.max(...counts)}`],
    ];
    if (grade >= 4) tasks.push(['What is the range of the data?', `${range}`]);
    if (grade >= 4) tasks.push(['What is the sum of all the values plotted?', `${data.reduce((a, b) => a + b, 0)}`]);
    if (grade >= 5) tasks.push(['What is the median of the data?', `${median}`]);
    if (grade >= 5) tasks.push(['What is the mean of the data, to two decimal places?', `${n(Math.round((data.reduce((a, b) => a + b, 0) / data.length) * 100) / 100)}`]);
    if (grade >= 6) tasks.push(['How many values are above the smallest value?', `${data.filter((v) => v > Math.min(...data)).length}`]);

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
        ...(() => {
            const totals = counts.map((count) => count * each);
            const most = labels[totals.indexOf(Math.max(...totals))];
            const fewest = labels[totals.indexOf(Math.min(...totals))];
            const [question, answer] = randomChoice([
                [`Each circle stands for ${each}. How many does ${labels[which]} represent?`, counts[which] * each],
                [`Each circle stands for ${each}. How many symbols would show ${each * 4}?`, 4],
                [`How many circles are drawn for ${labels[which]}?`, counts[which]],
                ['Which row shows the most?', most],
                ['Which row shows the fewest?', fewest],
                [`Each circle stands for ${each}. What is the total of all the rows?`, totals.reduce((a, b) => a + b, 0)],
                [`Each circle stands for ${each}. How many more does ${most} show than ${fewest}?`, Math.max(...totals) - Math.min(...totals)],
            ]);
            return { question, answer: `${answer}` };
        })(),
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

    const tasks = [
        ['What is the probability of landing on a shaded section?', simplify(winning, sectors)],
        ['How many equal sections does this spinner have?', sectors],
        ['How many sections are shaded?', winning],
        ['How many sections are not shaded?', sectors - winning],
        ['Is landing on a shaded section likely or unlikely?', winning / sectors > 0.5 ? 'likely' : (winning / sectors < 0.5 ? 'unlikely' : 'equally likely')],
    ];
    if (grade >= 5) tasks.push(['Are all the outcomes on this spinner equally likely?', 'yes']);
    if (grade >= 6) tasks.push(['What is the probability of NOT landing on a shaded section?', simplify(sectors - winning, sectors)]);
    if (grade >= 6) tasks.push(['Write the probability of a shaded result as a percent, to one decimal place.', `${n(Math.round((winning / sectors) * 1000) / 10)}%`]);
    if (grade >= 7) tasks.push([`If the spinner is spun ${sectors * 10} times, how many shaded results would you expect?`, winning * 10]);
    if (grade >= 8) tasks.push(['What do the probabilities of shaded and not shaded add to?', 1]);
    if (grade >= 9) tasks.push(['Find the probability of two shaded results in two spins.', simplify(winning * winning, sectors * sectors)]);

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
        ['What is the lowest value shown?', `${Math.min(...values)}`],
        ['How many points are plotted on this graph?', `${points}`],
        ['Did the value end higher or lower than it started?', rise > 0 ? 'higher' : (rise < 0 ? 'lower' : 'the same')],
        ['What is the difference between the highest and lowest values?', `${Math.max(...values) - Math.min(...values)}`],
        ['What was the value at the first point?', `${values[0]}`],
        ['What was the value at the last point?', `${values[values.length - 1]}`],
        ['Between which two points does the value fall the most?',
            (() => {
                let best = 1;
                let bestDrop = Infinity;
                for (let i = 1; i < points; i += 1) {
                    if (values[i] - values[i - 1] < bestDrop) { bestDrop = values[i] - values[i - 1]; best = i; }
                }
                return `${best} to ${best + 1}`;
            })()],
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
        ['Write the equation of this line in slope-intercept form.', `y = ${slope}x ${intercept < 0 ? '-' : '+'} ${Math.abs(intercept)}`],
        ['Is this line increasing or decreasing?', slope > 0 ? 'increasing' : (slope < 0 ? 'decreasing' : 'neither, it is horizontal')],
        ['What is the slope of a line parallel to this one?', `${slope}`],
        ['What is the slope of a line perpendicular to this one?', slope === 0 ? 'undefined' : `${-1 / slope}`],
        ['By how much does y change when x increases by 1?', `${slope}`],
        ['Where does this line cross the y-axis?', `(0, ${intercept})`],
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

    const tasks = [
        ['How many squares are in the next figure?', `${start + terms * step}`],
        ['How many squares are added from one figure to the next?', `${step}`],
        ['How many squares are in the first figure?', `${start}`],
        ['How many figures are shown?', `${terms}`],
        ['Is this pattern growing or shrinking?', step > 0 ? 'growing' : 'shrinking'],
    ];
    if (grade >= 4) tasks.push(['How many squares are in the figure after next?', `${start + (terms + 1) * step}`]);
    if (grade >= 4) tasks.push(['How many squares are in the last figure shown?', `${start + (terms - 1) * step}`]);
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

    const inside = value + (greater ? 1 : -1);
    const outside = value + (greater ? -1 : 1);

    const [question, answer] = randomChoice([
        ['Write the inequality shown on this number line.', `x ${symbol} ${value}`],
        [`Is ${value} itself included in the solution set shown?`, closed ? 'yes' : 'no'],
        ['Does the shading extend left or right on this number line?', greater ? 'right' : 'left'],
        ['Is the circle at the endpoint open or closed?', closed ? 'closed' : 'open'],
        [`Is ${inside} a solution to the inequality shown?`, 'yes'],
        [`Is ${outside} a solution to the inequality shown?`, 'no'],
        ['What is the smallest whole number in the solution set, if there is one?', greater ? (closed ? value : value + 1) : 'there is none'],
    ]);

    return {
        question,
        answer: `${answer}`,
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
    const grade = gradeOf(ctx);
    const multiplier = between(2, 6);
    const offset = between(1, 9);
    const input = between(1, 9);
    const output = multiplier * input + offset;

    // A machine is a rule, so it can be read in either direction and, once the
    // grade has algebra, written as one. Asking only "what comes out" wastes it.
    const tasks = [
        [`What comes out of the machine when ${input} goes in?`, output],
        [`What comes out when ${input + 1} goes in?`, multiplier * (input + 1) + offset],
        [`What went in if ${output} came out?`, input],
    ];
    if (grade >= 4) tasks.push([`What comes out when 0 goes in?`, offset]);
    if (grade >= 4) tasks.push([`How much does the output grow when the input grows by 1?`, multiplier]);
    if (grade >= 4) tasks.push([`Write the machine's rule in words.`, `multiply by ${multiplier}, then add ${offset}`]);
    if (grade >= 6) tasks.push([`Write the machine's rule as an equation using x.`, `y = ${multiplier}x + ${offset}`]);
    if (grade >= 7) tasks.push([`If the machine's rule is reversed, what is the new rule?`, `subtract ${offset}, then divide by ${multiplier}`]);
    if (grade >= 8) tasks.push([`What is the slope of the line this machine describes?`, multiplier]);
    if (grade >= 8) tasks.push([`Where does this machine's line cross the y-axis?`, `(0, ${offset})`]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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
        ...(() => {
            const [question, answer] = randomChoice([
                [`The curve is y = ${a}x². What is the slope of the tangent drawn at x = ${point}?`, slope],
                [`The curve is y = ${a}x². Find dy/dx.`, `${2 * a}x`],
                [`The curve is y = ${a}x². What is the slope of the tangent at x = 0?`, 0],
                [`The curve is y = ${a}x². Write the equation of the tangent at x = ${point}.`, `y = ${slope}x - ${a * point * point + 3}`],
                [`The curve is y = ${a}x². Is the curve increasing or decreasing at x = ${point}?`, 'increasing'],
                [`The curve is y = ${a}x². What is the slope of the normal at x = ${point}?`, `-1/${slope}`],
                [`The curve is y = ${a}x². At what x is the tangent horizontal?`, 0],
            ]);
            return { question, answer: `${answer}` };
        })(),
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
        ...(() => {
            const quadrant = angle < 90 ? 'first' : (angle < 180 ? 'second' : (angle < 270 ? 'third' : 'fourth'));
            const reference = angle < 90 ? angle : (angle < 180 ? 180 - angle : (angle < 270 ? angle - 180 : 360 - angle));
            const [question, answer] = randomChoice([
                [`The point is at ${angle}° on the unit circle. Give its coordinates.`, `(${Math.cos(rad(angle)).toFixed(3)}, ${Math.sin(rad(angle)).toFixed(3)})`],
                [`The point is at ${angle}°. In which quadrant does it lie?`, `the ${quadrant}`],
                [`The point is at ${angle}°. What is its reference angle?`, `${reference}°`],
                [`The point is at ${angle}°. Is sin of this angle positive or negative?`, angle < 180 ? 'positive' : 'negative'],
                [`The point is at ${angle}°. Is cos of this angle positive or negative?`, (angle < 90 || angle > 270) ? 'positive' : 'negative'],
                [`The point is at ${angle}°. Give the angle in radians, in terms of π.`, `${simplify(angle, 180)}π`],
                [`The point is at ${angle}°. Give sin of this angle to three decimals.`, Math.sin(rad(angle)).toFixed(3)],
                [`The point is at ${angle}°. Give cos of this angle to three decimals.`, Math.cos(rad(angle)).toFixed(3)],
                ['What is the radius of the unit circle?', 1],
            ]);
            return { question, answer: `${answer}` };
        })(),
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
    const largest = Math.max(...picked.map(([value]) => value));

    const tasks = [
        ['How much money is shown?', `$${(total / 100).toFixed(2)}`],
        ['How many coins are shown?', picked.length],
        ['How much money is shown, in cents?', `${total} cents`],
        ['What is the value of the largest coin shown?', `${largest} cents`],
    ];
    if (grade >= 2) tasks.push(['How much more is needed to make one dollar?', `${Math.max(0, 100 - total)} cents`]);
    if (grade >= 3) tasks.push([`If you pay with $${(paid / 100).toFixed(2)}, how much change is left?`, `$${((paid - total) / 100).toFixed(2)}`]);
    if (grade >= 3) tasks.push(['How much would twice this amount be?', `$${((total * 2) / 100).toFixed(2)}`]);
    if (grade >= 4) tasks.push(['Rounded to the nearest dollar, how much is shown?', `$${Math.round(total / 100)}`]);

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
        ...(() => {
            const [label, percent] = slices[which];
            const biggest = slices.reduce((best, slice) => (slice[1] > best[1] ? slice : best));
            const [question, answer] = randomChoice([
                [`The circle shows a monthly budget for an income of $${income}. How much goes to ${label}?`, `$${((income * percent) / 100).toFixed(2)}`],
                [`The budget shows an income of $${income}. What percent goes to ${label}?`, `${percent}%`],
                ['Which category takes the largest share of this budget?', biggest[0]],
                [`The budget shows an income of $${income}. How much is left after ${label}?`, `$${((income * (100 - percent)) / 100).toFixed(2)}`],
                ['What do all the percentages in a budget circle add to?', '100%'],
                [`What angle at the centre does the ${label} slice take?`, `${n(Math.round(percent * 3.6 * 10) / 10)}°`],
                [`On an income of $${income * 2}, how much would go to ${label} at the same percent?`, `$${((income * 2 * percent) / 100).toFixed(2)}`],
            ]);
            return { question, answer: `${answer}` };
        })(),
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
        ['What is the maximum value of this function?', `${amplitude + shift}`],
        ['What is the minimum value of this function?', `${shift - amplitude}`],
        ['State the range of this function.', `${shift - amplitude} ≤ y ≤ ${amplitude + shift}`],
        ['Is the curve shown a sine or a cosine shape at x = 0?', 'sine'],
        ['How far does the curve rise above its axis?', `${amplitude}`],
        ['What is the vertical shift of this curve?', `${shift}`],
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
        ['State the range of this function.', `all real numbers except y = ${k}`],
        ['What value of x makes the denominator zero?', `${h}`],
        ['Does the curve ever cross its vertical asymptote?', 'no'],
        ['As x grows very large, what value does y approach?', `${k}`],
        ['How many vertical asymptotes does this function have?', '1'],
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
        ['How many turning points does this curve appear to have?', '2'],
        ['Is the leading coefficient positive or negative?', lead > 0 ? 'positive' : 'negative'],
        ['Is the degree of this polynomial odd or even?', 'odd'],
        ['How many x-intercepts does the graph show?', `${roots.length}`],
        ['What is the maximum number of real zeros a cubic can have?', '3'],
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
        ['What is the x-component of the resultant?', `${rx}`],
        ['What is the y-component of the resultant?', `${ry}`],
        ['Find the direction of the resultant, to the nearest degree.',
            `${Math.round((Math.atan2(ry, rx) * 180) / Math.PI)}°`],
        ['Does the order of adding two vectors change the resultant?', 'no'],
        ['Write the resultant scaled by 2 in component form.', `(${rx * 2}, ${ry * 2})`],
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
        ['What is the median of this data set?', median],
        ['What is the interquartile range?', q3 - q1],
        ['What is the range of this data set?', max - min],
        ['What value is the upper quartile?', q3],
        ['What value is the lower quartile?', q1],
        ['What is the smallest value in this data set?', min],
        ['What is the largest value in this data set?', max],
        ['What percent of the data lies inside the box?', '50%'],
        ['What percent of the data lies below the median?', '50%'],
        ['Is the data more spread out above or below the median?', (max - median) > (median - min) ? 'above' : ((max - median) < (median - min) ? 'below' : 'equally')],
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

    const grade = gradeOf(ctx);
    const factors = [p1, p2, p3].sort((a, b) => a - b);

    const tasks = [
        ['Complete the factor tree: what is the missing value?', composite],
        [`What number is at the top of the tree?`, total],
        ['Write the prime factorisation of the number at the top.', factors.join(' × ')],
        ['How many prime factors does the top number have, counting repeats?', 3],
    ];
    if (grade >= 5) tasks.push(['What is the largest prime factor of the top number?', Math.max(p1, p2, p3)]);
    if (grade >= 5) tasks.push(['What is the smallest prime factor of the top number?', Math.min(p1, p2, p3)]);
    if (grade >= 6) tasks.push(['Is the number at the top prime or composite?', 'composite']);
    if (grade >= 6) tasks.push([`Is the top number divisible by ${p3}?`, 'yes']);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const grade = gradeOf(ctx);
    const firstStep = steps[0][0] === '+' ? start + steps[0][1]
        : (steps[0][0] === '-' ? start - steps[0][1] : start * steps[0][1]);

    const tasks = [
        ['Follow the boxes from left to right. What is the result?', value],
        ['What value comes out of the first box?', firstStep],
        ['How many operations does the chain apply?', steps.length],
        ['What is the first operation in the chain?', `${steps[0][0] === '\\times' ? 'multiply by' : (steps[0][0] === '+' ? 'add' : 'subtract')} ${steps[0][1]}`],
    ];
    if (grade >= 4) tasks.push(['Does the chain give the same result if the boxes are reversed?', 'not always']);
    if (grade >= 4) tasks.push(['By how much did the chain change the starting number?', value - start]);
    if (grade >= 4) tasks.push(['Is the result larger or smaller than the starting number?', value > start ? 'larger' : (value < start ? 'smaller' : 'the same')]);
    if (grade >= 5) tasks.push(['What is the starting number of the chain?', start]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const grade = gradeOf(ctx);
    const tasks = [
        [`Use the ladder: convert ${value} ${rungs[from]} to ${rungs[to]}.`, `${value * multiplier} ${rungs[to]}`],
        [`Use the ladder: convert ${value * multiplier} ${rungs[to]} back to ${rungs[from]}.`, `${value} ${rungs[from]}`],
        [`How many rungs apart are ${rungs[from]} and ${rungs[to]} on this ladder?`, steps],
        [`Going from ${rungs[from]} to ${rungs[to]}, do you multiply or divide?`, 'multiply'],
        [`What number do you multiply by to go from ${rungs[from]} to ${rungs[to]}?`, multiplier],
        ['Which unit on this ladder is the largest?', 'km'],
        ['Which unit on this ladder is the smallest?', 'mm'],
    ];
    if (grade >= 6) tasks.push([`Convert ${value * 2} ${rungs[from]} to ${rungs[to]}.`, `${value * 2 * multiplier} ${rungs[to]}`]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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
        ...(() => {
            const expression = `${a === 1 ? '' : a}x² + ${b === 1 ? '' : b}x`;
            const [question, answer] = randomChoice([
                ['Write the expression these algebra tiles represent.', expression],
                ['How many x² tiles are shown?', a],
                ['How many x tiles are shown?', b],
                ['What is the degree of the expression these tiles show?', 2],
                ['Factor the expression these tiles represent.', `x(${a === 1 ? '' : a}x + ${b})`],
                ['What is the common factor of the two terms shown?', 'x'],
                ['Evaluate the expression these tiles show when x = 2.', a * 4 + b * 2],
            ]);
            return { question, answer: `${answer}` };
        })(),
        figure: tikz(`${squares}\n${bars}`),
    };
}

/** An area model showing a product split into partial products. */
function areaModel(ctx) {
    const grade = gradeOf(ctx);
    const tens = between(1, 4) * 10;
    const ones = between(1, 9);
    const multiplier = between(2, 9);

    const tasks = [
        ['Use the area model to find the product.', multiplier * (tens + ones)],
        ['What is the area of the left part of the model?', multiplier * tens],
        ['What is the area of the right part of the model?', multiplier * ones],
        ['What two numbers are being multiplied in this model?', `${multiplier} and ${tens + ones}`],
        ['Into how many parts has the model split the larger factor?', 2],
    ];
    if (grade >= 5) tasks.push(['Add the two part-areas. What do you get?', multiplier * (tens + ones)]);
    if (grade >= 6) tasks.push(['Which property of multiplication does this model show?', 'the distributive property']);
    if (grade >= 9) tasks.push(['Write the product this area model represents, expanded.', `${multiplier * tens} + ${multiplier * ones} = ${multiplier * (tens + ones)}`]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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
        ['State the domain of this function.', 'all real numbers'],
        ['What is the axis of symmetry of this graph?', `x = ${h}`],
        ['Does this graph open upward or downward?', 'upward'],
        ['What is the minimum value of this function?', `${k}`],
        ['How many x-intercepts does this graph have?', k > 0 ? '0' : (k === 0 ? '1' : '2')],
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
        ...(() => {
            const [question, answer] = randomChoice([
                [`The program starts at ${start} and runs top to bottom. What value does it end with?`, value],
                ['How many instructions does this program run?', instructions.length],
                [`The program starts at ${start}. By how much did the value change overall?`, value - start],
                [`Is the final value larger or smaller than the starting value of ${start}?`, value > start ? 'larger' : (value < start ? 'smaller' : 'the same')],
                ['What is the first instruction the program runs?', instructions[0][0]],
                ['What is the last instruction the program runs?', instructions[instructions.length - 1][0]],
                [`If the program started at ${start + 1} instead, would every step still work?`, 'yes'],
            ]);
            return { question, answer: `${answer}` };
        })(),
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

    const grade = gradeOf(ctx);
    const tasks = [
        ['These triangles are similar. Find the missing side length.', height * factor],
        ['What is the scale factor from the small triangle to the large one?', factor],
        ['What is the scale factor from the large triangle to the small one?', `1/${factor}`],
        ['Find the area of the small triangle.', n((base * height) / 2)],
    ];
    if (grade >= 8) tasks.push(['Find the area of the large triangle.', n((base * factor * height * factor) / 2)]);
    if (grade >= 8) tasks.push(['How many times as large is the area of the big triangle?', factor * factor]);
    if (grade >= 9) tasks.push(['Are these triangles congruent or similar only?', factor === 1 ? 'congruent' : 'similar only']);
    if (grade >= 9) tasks.push(['Do similar triangles have equal corresponding angles?', 'yes']);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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
    const grade = gradeOf(ctx);
    const [name, drawing, symmetric] = randomChoice(shapes);
    const LINES = { 'a rectangle': 2, 'a parallelogram': 0, 'an isosceles triangle': 1 };
    const ORDER = { 'a rectangle': 2, 'a parallelogram': 2, 'an isosceles triangle': 1 };

    const tasks = [
        ['Is the dashed line a line of symmetry?', symmetric],
        ['Name the shape drawn.', name],
        ['How many sides does the shape have?', name === 'an isosceles triangle' ? 3 : 4],
    ];
    if (grade >= 3) tasks.push(['How many lines of symmetry does this shape have in total?', LINES[name]]);
    if (grade >= 4) tasks.push(['If the shape were folded along the dashed line, would the halves match?', symmetric]);
    if (grade >= 5) tasks.push(['What is the order of rotational symmetry of this shape?', ORDER[name]]);
    if (grade >= 6) tasks.push(['Does this shape have any parallel sides?', name === 'an isosceles triangle' ? 'no' : 'yes']);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
        figure: tikz(drawing),
    };
}

/** Parallel lines cut by a transversal. */
function parallelLines(ctx) {
    const grade = gradeOf(ctx);
    const angle = between(35, 70);

    const tasks = [
        ['The lines are parallel. Find the angle marked with a question mark.', `${180 - angle}°`],
        [`The lines are parallel. Find the angle vertically opposite the ${angle}° angle.`, `${angle}°`],
        [`The lines are parallel. Find the angle co-interior with the ${angle}° angle.`, `${180 - angle}°`],
        [`The lines are parallel. Find the angle alternate to the ${angle}° angle.`, `${angle}°`],
        [`The lines are parallel. Find the angle corresponding to the ${angle}° angle.`, `${angle}°`],
    ];
    if (grade >= 8) tasks.push(['Do co-interior angles between parallel lines add to 180° or 360°?', '180°']);
    if (grade >= 8) tasks.push([`What is the supplement of the ${angle}° angle?`, `${180 - angle}°`]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const grade = gradeOf(ctx);
    const tasks = [
        ['Does this scatter plot show a positive, negative, or no correlation?', direction === 'none' ? 'no correlation' : `${direction} correlation`],
        ['How many points are plotted?', 10],
        ['Would a line of best fit rise, fall, or stay flat?', direction === 'positive' ? 'rise' : (direction === 'negative' ? 'fall' : 'stay roughly flat')],
        ['As x increases, what generally happens to y?', direction === 'positive' ? 'it increases' : (direction === 'negative' ? 'it decreases' : 'it stays about the same')],
    ];
    if (grade >= 9) tasks.push(['Would the correlation coefficient here be near +1, near -1, or near 0?', direction === 'positive' ? 'near +1' : (direction === 'negative' ? 'near -1' : 'near 0')]);
    if (grade >= 9) tasks.push(['Does this plot prove that x causes y?', 'no']);
    if (grade >= 10) tasks.push(['Is estimating y beyond the plotted range interpolation or extrapolation?', 'extrapolation']);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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

    const grade = gradeOf(ctx);
    const outcomes = first.length * second.length;
    const tasks = [
        ['How many possible outcomes does this tree diagram show?', outcomes],
        ['How many branches leave the first stage?', first.length],
        ['How many branches leave each first-stage branch?', second.length],
        [`What is the probability of any one outcome, if all are equally likely?`, `1/${outcomes}`],
    ];
    if (grade >= 7) tasks.push(['If a third equally likely stage were added, how many outcomes would there be?', outcomes * second.length]);
    if (grade >= 7) tasks.push(['Are the probabilities along one path multiplied or added?', 'multiplied']);
    if (grade >= 8) tasks.push(['What do the probabilities of all the outcomes add to?', 1]);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
        figure: tikz(branches.join('\n')),
    };
}

/** A two-set Venn diagram with counts. */
function vennDiagram(ctx) {
    const onlyA = between(3, 12);
    const both = between(2, 8);
    const onlyB = between(3, 12);
    const neither = between(0, 5);

    const grade = gradeOf(ctx);
    const surveyed = onlyA + both + onlyB + neither;

    const tasks = [
        ['How many are in both sets?', both],
        ['How many are in set A in total?', onlyA + both],
        ['How many are in set B in total?', onlyB + both],
        ['How many were surveyed altogether?', surveyed],
        ['How many are in set A but not set B?', onlyA],
        ['How many are in neither set?', neither],
        ['How many are in set A or set B or both?', onlyA + both + onlyB],
    ];
    if (grade >= 8) tasks.push(['What is the probability a person chosen at random is in both sets?', simplify(both, surveyed)]);
    if (grade >= 9) tasks.push(['What is the probability a person chosen at random is in neither set?', simplify(neither, surveyed)]);
    if (grade >= 9) tasks.push(['Given a person is in set A, what is the probability they are also in set B?', simplify(both, onlyA + both)]);

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
        ['How many dots are in the first figure shown?', `${counts[0]}`],
        ['How many figures are shown?', `${counts.length}`],
        ['How many dots are in the last figure shown?', `${counts[counts.length - 1]}`],
        ['Is the number of dots increasing or decreasing?', 'increasing'],
        ['How many dots are added between the first two figures?', `${counts[1] - counts[0]}`],
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
        ['What is the real part of this complex number?', `${re}`],
        ['What is the imaginary part of this complex number?', `${im}`],
        ['Write the conjugate of this complex number.', `${re} ${im < 0 ? '+' : '-'} ${Math.abs(im)}i`],
        ['In which quadrant of the complex plane does this point lie?',
            re > 0 && im > 0 ? 'the first' : (re < 0 && im > 0 ? 'the second' : (re < 0 && im < 0 ? 'the third' : 'the fourth'))],
        ['Find the argument of this complex number, to the nearest degree.',
            `${Math.round((Math.atan2(im, re) * 180) / Math.PI)}°`],
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
        ...(() => {
            const [question, answer] = randomChoice([
                [`Find the exact area under y = ${m}x from x = 0 to x = ${upper}.`, n(area)],
                [`Write the integral that gives the area under y = ${m}x from 0 to ${upper}.`, `the integral of ${m}x from 0 to ${upper}`],
                [`Find the area under y = ${m}x from x = 0 to x = ${upper * 2}.`, n((m * upper * upper * 4) / 2)],
                [`The region under y = ${m}x is a triangle. What are its base and height?`, `base ${upper}, height ${m * upper}`],
                [`Find the antiderivative of ${m}x.`, `${simplify(m, 2)}x² + C`],
                [`Doubling the upper limit multiplies this area by how much?`, 4],
                [`Find the average value of y = ${m}x on the interval from 0 to ${upper}.`, n((m * upper) / 2)],
            ]);
            return { question, answer: `${answer}` };
        })(),
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
        ...(() => {
            const base = sheet - 2 * cut;
            const [question, answer] = randomChoice([
                [`Squares of side ${cut} are cut from the corners of this ${sheet} by ${sheet} sheet and the sides folded up. What is the volume of the open box?`, `${volume} cubic units`],
                [`Squares of side ${cut} are cut from the corners of this ${sheet} by ${sheet} sheet. What are the base dimensions of the box?`, `${base} by ${base}`],
                [`Squares of side ${cut} are cut from this ${sheet} by ${sheet} sheet. What is the height of the folded box?`, cut],
                [`Write the volume of the box as a function of the cut size x, for a ${sheet} by ${sheet} sheet.`, `V = x(${sheet} - 2x)²`],
                [`Squares of side ${cut} are cut from this ${sheet} by ${sheet} sheet. What is the area of the open box's base?`, `${base * base} square units`],
                [`For a ${sheet} by ${sheet} sheet, what is the largest cut size that still leaves a box?`, `just under ${sheet / 2}`],
                [`Squares of side ${cut} are cut from this ${sheet} by ${sheet} sheet. How much card is cut away in total?`, `${4 * cut * cut} square units`],
            ]);
            return { question, answer: `${answer}` };
        })(),
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
        ...(() => {
            const [question, answer] = randomChoice([
                [`A ${c} m ladder leans against a wall with its foot ${b} m from the base. How far up the wall does it reach?`, `${a} m`],
                [`A ${c} m ladder reaches ${a} m up a wall. How far is its foot from the base?`, `${b} m`],
                [`A ladder reaches ${a} m up a wall with its foot ${b} m out. How long is the ladder?`, `${c} m`],
                [`A ${c} m ladder has its foot ${b} m from the wall. What angle does it make with the ground, to the nearest degree?`, `${Math.round((Math.acos(b / c) * 180) / Math.PI)}°`],
                [`As the foot of the ladder slides away from the wall, does the top move up or down?`, 'down'],
                [`A ${c} m ladder leans with its foot ${b} m out. What is the area of the triangle it forms with the wall and ground?`, `${n((a * b) / 2)} square metres`],
            ]);
            return { question, answer: `${answer}` };
        })(),
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

    const grade = gradeOf(ctx);
    const tasks = [
        ['Which package is the better value per item?', perA < perB ? `the pack of ${countA}` : `the pack of ${countB}`],
        [`What is the unit price of the pack of ${countA}?`, `$${n(Math.round(perA * 100) / 100)}`],
        [`What is the unit price of the pack of ${countB}?`, `$${n(Math.round(perB * 100) / 100)}`],
        [`What do the two packages cost together?`, `$${n(Math.round((priceA + priceB) * 100) / 100)}`],
    ];
    if (grade >= 6) tasks.push(['How much is saved per item by buying the better value pack?', `$${n(Math.round(Math.abs(perA - perB) * 100) / 100)}`]);
    if (grade >= 7) tasks.push([`What would ${countB} items cost at the smaller pack's unit price?`, `$${n(Math.round(perA * countB * 100) / 100)}`]);
    if (grade >= 8) tasks.push(['Why can a larger pack still be poor value?', 'the unit price can be higher']);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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
        ...(() => {
            const kind = compound ? 'compounded annually' : 'simple interest';
            const [question, answer] = randomChoice([
                [`$${principal} is invested at ${rate}% ${kind}. What is it worth after ${years} years?`, `$${value(years).toFixed(2)}`],
                [`$${principal} is invested at ${rate}% ${kind}. How much interest is earned in ${years} years?`, `$${(value(years) - principal).toFixed(2)}`],
                [`$${principal} is invested at ${rate}% ${kind}. What is it worth after 1 year?`, `$${value(1).toFixed(2)}`],
                [`$${principal} is invested at ${rate}% ${kind}. What is it worth after 2 years?`, `$${value(2).toFixed(2)}`],
                [`What amount was invested at the start?`, `$${principal}`],
                [`Does this graph show simple or compound interest?`, compound ? 'compound' : 'simple'],
                [`$${principal} grows at ${rate}% a year. What is the annual growth factor?`, n(1 + rate / 100)],
                [`Do the bars grow by an equal amount each year, or by an increasing amount?`, compound ? 'an increasing amount' : 'an equal amount'],
            ]);
            return { question, answer: `${answer}` };
        })(),
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

    const grade = gradeOf(ctx);
    const tasks = [
        [`The bar shows the exchange rate. Convert ${amount} CAD to USD.`, `${(amount * rate).toFixed(2)} USD`],
        [`The bar shows the exchange rate. Convert ${amount} USD to CAD.`, `${(amount / rate).toFixed(2)} CAD`],
        ['What does one Canadian dollar buy in US dollars?', `${rate} USD`],
        ['Is the Canadian dollar worth more or less than the US dollar here?', rate < 1 ? 'less' : 'more'],
    ];
    if (grade >= 8) tasks.push(['How many Canadian dollars buy one US dollar?', `${n(Math.round((1 / rate) * 100) / 100)} CAD`]);
    if (grade >= 9) tasks.push([`Converting ${amount} CAD to USD and back, what do you end with?`, `${amount} CAD`]);
    if (grade >= 9) tasks.push([`If the rate rose to ${n(Math.round(rate * 1.1 * 100) / 100)}, would ${amount} CAD buy more or fewer USD?`, 'more']);

    const [question, answer] = randomChoice(tasks);

    return {
        question,
        answer: `${answer}`,
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
ratioTape.grades = [5, 12];
factorTree.heightMm = 22;
factorTree.grades = [4, 9];
squareRootArea.heightMm = 22;
squareRootArea.grades = [6, 12];
operationChain.heightMm = 14;
operationChain.grades = [3, 12];
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
similarTriangles.grades = [7, 12];
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
numberLine.grades = [1, 12];
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
thermometer.grades = [3, 9];
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
solidVolume.grades = [5, 12];
rightTriangle.heightMm = 22;
rightTriangle.grades = [8, 12];
angleMeasure.heightMm = 22;
angleMeasure.grades = [4, 10];
circleMeasure.heightMm = 28;
circleMeasure.grades = [7, 12];
coordinateGrid.heightMm = 26;
coordinateGrid.grades = [5, 12];
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
trigTriangle.grades = [9, 12];
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

/* ------------------------------------------------- junior shape figures */

/** The outline of one named 2-D shape, for naming and counting its parts. */
function shapeOutline(ctx) {
    const grade = gradeOf(ctx);
    const SHAPES = [
        { name: 'triangle', sides: 3 },
        { name: 'square', sides: 4 },
        { name: 'rectangle', sides: 4 },
        { name: 'pentagon', sides: 5 },
        { name: 'hexagon', sides: 6 },
        { name: 'octagon', sides: 8 },
    ];
    const shape = randomChoice(grade <= 2 ? SHAPES.slice(0, 4) : SHAPES);

    let body;
    if (shape.name === 'rectangle') {
        body = '  \\draw[line width=0.7pt] (0,0) rectangle (2.0,1.1);';
    } else if (shape.name === 'square') {
        body = '  \\draw[line width=0.7pt] (0,0) rectangle (1.3,1.3);';
    } else {
        const points = Array.from({ length: shape.sides }, (_, i) => {
            const angle = 90 + (360 / shape.sides) * i;
            return `(${n(0.75 * Math.cos(rad(angle)))},${n(0.75 * Math.sin(rad(angle)))})`;
        }).join(' -- ');
        body = `  \\draw[line width=0.7pt] ${points} -- cycle;`;
    }

    const tasks = [
        ['Name this shape.', shape.name],
        ['How many sides does this shape have?', shape.sides],
        ['How many corners does this shape have?', shape.sides],
        ['Are all the sides of this shape straight?', 'yes'],
        ['Is this shape open or closed?', 'closed'],
        ['Count the sides. Is that number odd or even?', shape.sides % 2 === 0 ? 'even' : 'odd'],
        ['How many sides would two of these shapes have altogether?', shape.sides * 2],
    ];
    if (grade >= 2) tasks.push(['Does this shape have any curved sides?', 'no']);
    if (grade >= 2) tasks.push(['How many more sides does this shape have than a triangle?', shape.sides - 3]);
    if (grade >= 3) tasks.push(['How many lines of symmetry does this regular shape have?', shape.name === 'rectangle' ? 2 : shape.sides]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(body) };
}

/** A row of small shapes to count and sort. */
function shapeSort(ctx) {
    const grade = gradeOf(ctx);
    const triangles = between(2, 4);
    const squares = between(2, 4);
    const circles = between(1, 3);

    const parts = [];
    let x = 0;
    for (let i = 0; i < triangles; i += 1, x += 0.85) {
        parts.push(`  \\draw (${n(x)},0) -- (${n(x + 0.6)},0) -- (${n(x + 0.3)},0.55) -- cycle;`);
    }
    for (let i = 0; i < squares; i += 1, x += 0.85) {
        parts.push(`  \\draw (${n(x)},0) rectangle (${n(x + 0.55)},0.55);`);
    }
    for (let i = 0; i < circles; i += 1, x += 0.85) {
        parts.push(`  \\draw (${n(x + 0.28)},0.28) circle (0.28);`);
    }

    const total = triangles + squares + circles;
    const most = triangles >= squares && triangles >= circles ? 'triangles'
        : (squares >= circles ? 'squares' : 'circles');

    const tasks = [
        ['How many triangles are there?', triangles],
        ['How many squares are there?', squares],
        ['How many circles are there?', circles],
        ['How many shapes are there altogether?', total],
        ['Which shape appears most often?', most],
        ['How many shapes have straight sides?', triangles + squares],
        ['How many shapes have no corners?', circles],
        ['Are there more squares or circles?', squares > circles ? 'squares' : (circles > squares ? 'circles' : 'the same number')],
    ];
    if (grade >= 2) tasks.push(['How many more triangles than circles are there?', triangles - circles]);
    if (grade >= 2) tasks.push(['How many corners are there on all the triangles together?', triangles * 3]);
    if (grade >= 3) tasks.push(['How many sides are there on all the squares together?', squares * 4]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(parts.join('\n')) };
}

/** A simple 3-D solid drawn in outline, for naming faces, edges and vertices. */
function solidOutline(ctx) {
    const grade = gradeOf(ctx);
    const SOLIDS = [
        { name: 'cube', faces: 6, edges: 12, vertices: 8, rolls: 'no' },
        { name: 'cylinder', faces: 3, edges: 2, vertices: 0, rolls: 'yes' },
        { name: 'cone', faces: 2, edges: 1, vertices: 1, rolls: 'yes' },
        { name: 'square pyramid', faces: 5, edges: 8, vertices: 5, rolls: 'no' },
    ];
    const solid = randomChoice(grade <= 2 ? SOLIDS.slice(0, 3) : SOLIDS);

    let body;
    if (solid.name === 'cube') {
        body = '  \\draw (0,0) rectangle (1.2,1.2);\n'
            + '  \\draw (0,1.2) -- (0.4,1.55) -- (1.6,1.55) -- (1.2,1.2);\n'
            + '  \\draw (1.2,0) -- (1.6,0.35) -- (1.6,1.55);';
    } else if (solid.name === 'cylinder') {
        body = '  \\draw (0,0.25) ellipse (0.6 and 0.25);\n'
            + '  \\draw (-0.6,0.25) -- (-0.6,1.5);\n  \\draw (0.6,0.25) -- (0.6,1.5);\n'
            + '  \\draw (0,1.5) ellipse (0.6 and 0.25);';
    } else if (solid.name === 'cone') {
        body = '  \\draw (0,0.25) ellipse (0.6 and 0.25);\n'
            + '  \\draw (-0.6,0.25) -- (0,1.6) -- (0.6,0.25);';
    } else {
        body = '  \\draw (0,0) -- (1.4,0) -- (1.8,0.4) -- (0.4,0.4) -- cycle;\n'
            + '  \\draw (0,0) -- (0.9,1.5) -- (1.4,0);\n  \\draw (0.4,0.4) -- (0.9,1.5) -- (1.8,0.4);';
    }

    const tasks = [
        ['Name this solid.', solid.name],
        ['How many faces does this solid have?', solid.faces],
        ['Is this a flat shape or a solid?', 'a solid'],
        ['Does this solid have any flat faces?', 'yes'],
        ['Could you stack another one of these on top?', solid.rolls === 'yes' ? 'no' : 'yes'],
    ];
    if (grade >= 2) tasks.push(['Would this solid roll?', solid.rolls]);
    if (grade >= 3) tasks.push(['How many edges does this solid have?', solid.edges]);
    if (grade >= 3) tasks.push(['How many vertices does this solid have?', solid.vertices]);
    if (grade >= 4) tasks.push(['How many faces and vertices does it have in total?', solid.faces + solid.vertices]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(body) };
}

/** A repeating shape pattern, for saying what comes next. */
function shapePattern(ctx) {
    const grade = gradeOf(ctx);
    const NAMES = ['circle', 'square', 'triangle'];
    const unit = between(2, 3);
    const order = NAMES.slice(0, unit);
    const shown = unit * 2 + between(1, unit);

    const parts = [];
    for (let i = 0; i < shown; i += 1) {
        const kind = order[i % unit];
        const x = i * 0.72;
        if (kind === 'circle') parts.push(`  \\draw (${n(x + 0.25)},0.25) circle (0.25);`);
        else if (kind === 'square') parts.push(`  \\draw (${n(x)},0) rectangle (${n(x + 0.5)},0.5);`);
        else parts.push(`  \\draw (${n(x)},0) -- (${n(x + 0.5)},0) -- (${n(x + 0.25)},0.5) -- cycle;`);
    }
    parts.push(`  \\node at (${n(shown * 0.72 + 0.25)},0.25) {?};`);

    const next = order[shown % unit];
    const tasks = [
        ['What shape comes next in the pattern?', next],
        ['How many shapes repeat before the pattern starts again?', unit],
        ['How many shapes are shown before the question mark?', shown],
        ['What shape does the pattern start with?', order[0]],
        ['Name the shapes in one repeat of the pattern, in order.', order.join(', ')],
        ['Does this pattern repeat or grow?', 'it repeats'],
    ];
    if (grade >= 2) tasks.push(['What shape would be 2 places after the question mark?', order[(shown + 2) % unit]]);
    if (grade >= 3) tasks.push([`How many complete repeats are shown?`, Math.floor(shown / unit)]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(parts.join('\n')) };
}

/* ------------------------------------------------ junior money figures */

/** A price tag, for totals and change. */
function priceTag(ctx) {
    const grade = gradeOf(ctx);
    const dollars = between(1, grade <= 2 ? 5 : 9);
    const cents = grade <= 2 ? 0 : randomChoice([25, 50, 75, 99]);
    const price = n(dollars + cents / 100);
    const label = cents === 0 ? `${dollars}.00` : `${dollars}.${String(cents).padStart(2, '0')}`;

    const body = '  \\draw[line width=0.7pt] (0,0) -- (1.9,0) -- (1.9,0.9) -- (0,0.9) -- cycle;\n'
        + '  \\draw (0.25,0.72) circle (0.07);\n'
        + `  \\node[font=\\small] at (1.05,0.4) {$\\mathdollar ${label}$};`;

    const tasks = [
        ['What does this item cost?', `$${label}`],
        ['What do two of these cost?', `$${n(price * 2)}`],
        ['How many whole dollars does this item cost?', dollars],
        [`Is this item more or less than $${dollars + 1}?`, 'less'],
        ['Which costs more, this item or one costing $1?', dollars >= 1 ? 'this item' : 'the $1 item'],
    ];
    if (grade >= 2) tasks.push([`How much change from $${dollars + 1}?`, `$${n(dollars + 1 - price)}`]);
    if (grade >= 3) tasks.push(['What do three of these cost?', `$${n(price * 3)}`]);
    if (grade >= 4) tasks.push(['Rounded to the nearest dollar, what does this cost?', `$${Math.round(price)}`]);
    if (grade >= 5) tasks.push(['What do these cost with 13% tax added?', `$${n(Math.round(price * 1.13 * 100) / 100)}`]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(body) };
}

/** A savings jar filled to a level, for part-of-a-goal questions. */
function savingsJar(ctx) {
    const grade = gradeOf(ctx);
    const goal = randomChoice(grade <= 3 ? [10, 20] : [20, 50, 100]);
    const parts = between(1, 4);
    const saved = n((goal * parts) / 4);
    const fill = n((parts / 4) * 1.5);

    const body = '  \\draw[line width=0.7pt] (0,0) rectangle (1.1,1.6);\n'
        + `  \\fill[black!20] (0.03,0.03) rectangle (1.07,${n(Math.max(0.06, fill))});\n`
        + `  \\draw (0,${n(Math.max(0.06, fill))}) -- (1.1,${n(Math.max(0.06, fill))});\n`
        + `  \\node[font=\\tiny,below] at (0.55,0) {goal $\\mathdollar ${goal}$};`;

    const tasks = [
        ['How much has been saved?', `$${saved}`],
        ['How much more is needed to reach the goal?', `$${n(goal - saved)}`],
        ['What is the savings goal?', `$${goal}`],
        ['Has more or less than half the goal been saved?', saved > goal / 2 ? 'more' : (saved < goal / 2 ? 'less' : 'exactly half')],
        ['Is the jar full?', saved === goal ? 'yes' : 'no'],
    ];
    if (grade >= 3) tasks.push(['What fraction of the goal has been saved?', simplify(parts, 4)]);
    if (grade >= 4) tasks.push(['What percent of the goal has been saved?', `${n((parts / 4) * 100)}%`]);
    if (grade >= 5) tasks.push(['At $5 a week, how many weeks to reach the goal?', Math.ceil((goal - saved) / 5)]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(body) };
}

/* --------------------------------------------------- senior number line */

/** A number line carrying irrational points, for ordering and estimating. */
function realNumberLine(ctx) {
    const marks = [
        { label: '\\sqrt{2}', value: Math.SQRT2, kind: 'irrational' },
        { label: '\\pi', value: Math.PI, kind: 'irrational' },
        { label: '\\sqrt{9}', value: 3, kind: 'rational' },
        { label: '\\tfrac{5}{2}', value: 2.5, kind: 'rational' },
    ];
    const chosen = randomChoice(marks);
    const unit = 1.5;

    const ticks = Array.from({ length: 5 }, (_, i) =>
        `\\draw (${n(i * unit)},0.1) -- (${n(i * unit)},-0.1) node[below,font=\\tiny] {$${i}$};`
    ).join('\n  ');

    const at = n(chosen.value * unit);
    const body = `  \\draw[<->] (-0.3,0) -- (${n(4 * unit + 0.4)},0);\n  ${ticks}\n`
        + `  \\draw[->,line width=0.9pt] (${at},0.75) -- (${at},0.13);\n`
        + `  \\node[above,font=\\small] at (${at},0.75) {$${chosen.label}$};`;

    const tasks = [
        [`Between which two whole numbers does $${chosen.label}$ lie?`, `${Math.floor(chosen.value)} and ${Math.ceil(chosen.value)}`],
        [`Is $${chosen.label}$ rational or irrational?`, chosen.kind],
        [`Estimate $${chosen.label}$ to one decimal place.`, n(Math.round(chosen.value * 10) / 10)],
        [`Which whole number is $${chosen.label}$ closest to?`, Math.round(chosen.value)],
        [`Is $${chosen.label}$ greater or less than 2.5?`, chosen.value > 2.5 ? 'greater' : (chosen.value < 2.5 ? 'less' : 'equal')],
    ];

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(body) };
}

/* --------------------------------------------------- senior trigonometry */

/** A bearing from a north line, for direction and distance work. */
function bearingDiagram(ctx) {
    const bearing = randomChoice([35, 60, 120, 145, 210, 240, 315]);
    const distance = between(4, 30);
    const angle = 90 - bearing;
    const x = n(1.3 * Math.cos(rad(angle)));
    const y = n(1.3 * Math.sin(rad(angle)));

    const body = '  \\draw[->] (0,0) -- (0,1.5) node[above,font=\\tiny] {N};\n'
        + '  \\draw[dashed] (0,0) -- (1.5,0);\n'
        + `  \\draw[->,line width=0.9pt] (0,0) -- (${x},${y});\n`
        + `  \\draw (0,0.55) arc (90:${n(angle)}:0.55);\n`
        + `  \\node[font=\\tiny] at (${n(0.42 * Math.cos(rad((90 + angle) / 2)))},${n(0.42 * Math.sin(rad((90 + angle) / 2)))}) {${bearing}$^{\\circ}$};`;

    const quadrant = bearing < 90 ? 'north-east' : (bearing < 180 ? 'south-east' : (bearing < 270 ? 'south-west' : 'north-west'));
    const tasks = [
        ['What is the bearing shown?', `${bearing}°`],
        ['In which general direction does the arrow point?', quadrant],
        ['What is the back bearing of this direction?', `${(bearing + 180) % 360}°`],
        [`A boat travels ${distance} km on this bearing. How far north does it go, to two decimals?`, `${n(Math.round(distance * Math.cos(rad(bearing)) * 100) / 100)} km`],
        [`A boat travels ${distance} km on this bearing. How far east does it go, to two decimals?`, `${n(Math.round(distance * Math.sin(rad(bearing)) * 100) / 100)} km`],
    ];

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(body) };
}

/** A labelled non-right triangle, for the sine and cosine laws. */
function obliqueTriangle(ctx) {
    const angleA = between(35, 70);
    const angleB = between(35, 110 - angleA + 30);
    const angleC = 180 - angleA - angleB;
    const sideA = between(5, 14);
    const sideB = n(Math.round(((sideA * Math.sin(rad(angleB))) / Math.sin(rad(angleA))) * 100) / 100);

    const body = '  \\draw[line width=0.7pt] (0,0) -- (2.6,0) -- (1.1,1.4) -- cycle;\n'
        + `  \\node[below,font=\\tiny] at (1.3,0) {$c$};\n`
        + `  \\node[left,font=\\tiny] at (0.5,0.75) {$b = ${sideB}$};\n`
        + `  \\node[right,font=\\tiny] at (1.95,0.75) {$a = ${sideA}$};\n`
        + `  \\node[above right,font=\\tiny] at (0,0) {${angleA}$^{\\circ}$};\n`
        + `  \\node[above left,font=\\tiny] at (2.6,0) {${angleB}$^{\\circ}$};`;

    const tasks = [
        ['Find the third angle of this triangle.', `${angleC}°`],
        ['Which side of this triangle is the longest?', `the one opposite ${Math.max(angleA, angleB, angleC)}°`],
        ['Is this triangle acute, right or obtuse?', Math.max(angleA, angleB, angleC) > 90 ? 'obtuse' : (Math.max(angleA, angleB, angleC) === 90 ? 'right' : 'acute')],
        ['Which law finds side c from these two angles and a side?', 'the sine law'],
        [`Find side c using the sine law, to two decimals.`, n(Math.round(((sideA * Math.sin(rad(angleC))) / Math.sin(rad(angleA))) * 100) / 100)],
        [`Find the area of this triangle from two sides and the angle between them, to two decimals.`, n(Math.round(0.5 * sideA * sideB * Math.sin(rad(angleC)) * 100) / 100)],
    ];

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(body) };
}

/* ------------------------------------------------------ senior calculus */

/** A curve with marked turning points, read for the sign of the derivative. */
function slopeSketch(ctx) {
    const body = '  \\draw[->] (-0.2,0) -- (3.4,0) node[right,font=\\tiny] {$x$};\n'
        + '  \\draw[->] (0,-1.0) -- (0,1.3) node[above,font=\\tiny] {$y$};\n'
        + '  \\draw[line width=0.8pt,domain=0.2:3.1,samples=60,smooth] plot (\\x,{0.9*sin(\\x r)});\n'
        + '  \\fill (1.571,0.9) circle (0.05) node[above,font=\\tiny] {$A$};\n'
        + '  \\fill (3.1,0.037) circle (0.05) node[above right,font=\\tiny] {$B$};';

    const tasks = [
        ['At point A, is the slope of the curve positive, negative or zero?', 'zero'],
        ['Is the curve increasing or decreasing just before point A?', 'increasing'],
        ['Is the curve increasing or decreasing just after point A?', 'decreasing'],
        ['What kind of point is A?', 'a local maximum'],
        ['At point B, is the derivative positive or negative?', 'negative'],
        ['Where on this curve does the derivative equal zero?', 'at point A'],
    ];

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(body) };
}

/* ---------------------------------------------------- scale and measure */

/** A scale drawing with its scale marked, for converting to real lengths. */
function scaleDrawing(ctx) {
    const scale = randomChoice([10, 20, 50, 100]);
    const drawn = between(2, 6);
    const wide = between(2, 5);

    const body = `  \\draw[line width=0.7pt] (0,0) rectangle (${n(drawn * 0.4)},${n(wide * 0.4)});\n`
        + `  \\node[below,font=\\tiny] at (${n(drawn * 0.2)},0) {${drawn} cm};\n`
        + `  \\node[right,font=\\tiny] at (${n(drawn * 0.4)},${n(wide * 0.2)}) {${wide} cm};\n`
        + `  \\node[font=\\tiny] at (${n(drawn * 0.2)},${n(wide * 0.4 + 0.28)}) {scale 1 : ${scale}};`;

    const tasks = [
        [`What real length does the ${drawn} cm side represent, in centimetres?`, `${drawn * scale} cm`],
        [`What real length does the ${drawn} cm side represent, in metres?`, `${n((drawn * scale) / 100)} m`],
        [`What real length does the ${wide} cm side represent, in metres?`, `${n((wide * scale) / 100)} m`],
        ['What is the scale factor of this drawing?', scale],
        [`What is the real area, in square metres?`, `${n(((drawn * scale) / 100) * ((wide * scale) / 100))} m²`],
        [`A real length of ${scale * 2} cm is how long on this drawing?`, '2 cm'],
    ];

    const [question, answer] = randomChoice(tasks);
    return { question, answer, figure: tikz(body) };
}

shapeOutline.heightMm = 18;
shapeOutline.grades = [1, 5];
shapeSort.heightMm = 12;
shapeSort.grades = [1, 4];
solidOutline.heightMm = 20;
solidOutline.grades = [1, 6];
shapePattern.heightMm = 11;
shapePattern.grades = [1, 4];
priceTag.heightMm = 13;
priceTag.grades = [1, 6];
savingsJar.heightMm = 22;
savingsJar.grades = [1, 6];
realNumberLine.heightMm = 16;
realNumberLine.grades = [8, 12];
bearingDiagram.heightMm = 22;
bearingDiagram.grades = [10, 12];
obliqueTriangle.heightMm = 22;
obliqueTriangle.grades = [10, 12];
slopeSketch.heightMm = 26;
slopeSketch.grades = [11, 12];
scaleDrawing.heightMm = 22;
scaleDrawing.grades = [5, 10];

/** A domino, for number bonds and doubles. */
function dominoDots(ctx) {
    const grade = gradeOf(ctx);
    const left = between(1, 6);
    const right = between(1, 6);

    const pips = (count, offset) => {
        const spots = {
            1: [[0.5, 0.5]],
            2: [[0.25, 0.75], [0.75, 0.25]],
            3: [[0.25, 0.75], [0.5, 0.5], [0.75, 0.25]],
            4: [[0.25, 0.25], [0.25, 0.75], [0.75, 0.25], [0.75, 0.75]],
            5: [[0.25, 0.25], [0.25, 0.75], [0.5, 0.5], [0.75, 0.25], [0.75, 0.75]],
            6: [[0.25, 0.2], [0.25, 0.5], [0.25, 0.8], [0.75, 0.2], [0.75, 0.5], [0.75, 0.8]],
        }[count];
        return spots.map(([x, y]) => `  \\filldraw (${n(offset + x)},${n(y)}) circle (1.7pt);`).join('\n');
    };

    const body = '  \\draw (0,0) rectangle (2,1);\n  \\draw (1,0) -- (1,1);\n'
        + `${pips(left, 0)}\n${pips(right, 1)}`;

    const tasks = [
        ['How many dots are on this domino altogether?', left + right],
        ['How many dots are on the left half?', left],
        ['How many dots are on the right half?', right],
        ['How many more dots are on the side with more?', Math.abs(left - right)],
        ['Do both halves have the same number of dots?', left === right ? 'yes' : 'no'],
    ];
    if (grade >= 2) tasks.push(['Write an addition sentence for this domino.', `${left} + ${right} = ${left + right}`]);
    if (grade >= 2) tasks.push(['Is the total number of dots odd or even?', (left + right) % 2 === 0 ? 'even' : 'odd']);
    if (grade >= 3) tasks.push(['How many more dots would make 12 in all?', 12 - (left + right)]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer: `${answer}`, figure: tikz(body) };
}

/** Equal groups of counters, for early multiplication and sharing. */
function equalGroups(ctx) {
    const grade = gradeOf(ctx);
    const groups = between(2, 4);
    const each = between(2, 5);

    const parts = [];
    for (let g = 0; g < groups; g += 1) {
        const x = g * 1.15;
        parts.push(`  \\draw (${n(x)},0) ellipse (0.45 and 0.35);`);
        for (let i = 0; i < each; i += 1) {
            const a = rad((360 / each) * i + 90);
            parts.push(`  \\filldraw (${n(x + 0.24 * Math.cos(a))},${n(0.18 * Math.sin(a))}) circle (1.5pt);`);
        }
    }

    const tasks = [
        ['How many groups are there?', groups],
        ['How many counters are in each group?', each],
        ['How many counters are there altogether?', groups * each],
        ['How many counters would two of these groups hold?', each * 2],
    ];
    if (grade >= 2) tasks.push(['Write the multiplication fact this picture shows.', `${groups} × ${each} = ${groups * each}`]);
    if (grade >= 2) tasks.push(['Write the repeated addition this picture shows.', Array(groups).fill(each).join(' + ')]);
    if (grade >= 3) tasks.push([`If ${groups * each} counters are shared into ${groups} equal groups, how many in each?`, each]);
    if (grade >= 3) tasks.push([`How many groups of ${each} make ${groups * each}?`, groups]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer: `${answer}`, figure: tikz(parts.join('\n')) };
}

/** A month laid out as a calendar grid, for days, weeks and dates. */
function calendarMonth(ctx) {
    const grade = gradeOf(ctx);
    const days = randomChoice([28, 30, 31]);
    const startColumn = between(0, 6);
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const cells = [];
    for (let d = 1; d <= days; d += 1) {
        const index = startColumn + d - 1;
        const column = index % 7;
        const row = Math.floor(index / 7);
        cells.push(`  \\node[font=\\tiny] at (${n(column * 0.42)},${n(-row * 0.34)}) {${d}};`);
    }
    const header = DAY_NAMES.map((name, i) =>
        `  \\node[font=\\tiny] at (${n(i * 0.42)},0.4) {${name[0]}};`
    ).join('\n');

    const asked = between(1, days);
    const dayOfAsked = DAY_NAMES[(startColumn + asked - 1) % 7];

    const tasks = [
        ['How many days are in this month?', days],
        [`What day of the week is the ${asked}th?`, dayOfAsked],
        ['What day of the week does this month start on?', DAY_NAMES[startColumn]],
        ['How many days are in one week?', 7],
    ];
    if (grade >= 2) tasks.push([`What is the date one week after the ${asked}th?`, asked + 7 <= days ? `the ${asked + 7}th` : 'it falls in the next month']);
    if (grade >= 2) tasks.push(['How many complete weeks are in this month?', Math.floor(days / 7)]);
    if (grade >= 3) tasks.push([`How many days are left in the month after the ${asked}th?`, days - asked]);
    if (grade >= 3) tasks.push([`How many ${DAY_NAMES[startColumn]}s are in this month?`, Math.floor((days - 1) / 7) + 1]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer: `${answer}`, figure: tikz(`${header}\n${cells.join('\n')}`) };
}

/** Bills and coins in a purse, for counting money past a dollar. */
function moneyPurse(ctx) {
    const grade = gradeOf(ctx);
    const bills = between(1, 3);
    const billValue = randomChoice([5, 10]);
    const coins = between(1, 4);
    const coinValue = randomChoice([10, 25]);
    const total = bills * billValue * 100 + coins * coinValue;

    const parts = [];
    for (let i = 0; i < bills; i += 1) {
        parts.push(`  \\draw (${n(i * 0.95)},0.55) rectangle (${n(i * 0.95 + 0.85)},1.05);`);
        parts.push(`  \\node[font=\\tiny] at (${n(i * 0.95 + 0.42)},0.8) {$\\mathdollar ${billValue}$};`);
    }
    for (let i = 0; i < coins; i += 1) {
        parts.push(`  \\draw (${n(i * 0.6 + 0.28)},0.2) circle (0.24);`);
        parts.push(`  \\node[font=\\tiny] at (${n(i * 0.6 + 0.28)},0.2) {${coinValue}};`);
    }

    const tasks = [
        ['How much money is shown in total?', `$${n(total / 100)}`],
        ['How much is shown in bills alone?', `$${bills * billValue}`],
        ['How much is shown in coins alone?', `${coins * coinValue} cents`],
        ['How many bills are shown?', bills],
    ];
    if (grade >= 2) tasks.push(['How many coins are shown?', coins]);
    if (grade >= 3) tasks.push([`How much more is needed to reach $${Math.ceil(total / 100) + 5}?`, `$${n(Math.ceil(total / 100) + 5 - total / 100)}`]);
    if (grade >= 3) tasks.push(['Rounded to the nearest dollar, how much is shown?', `$${Math.round(total / 100)}`]);
    if (grade >= 4) tasks.push(['How much would twice this amount be?', `$${n((total * 2) / 100)}`]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer: `${answer}`, figure: tikz(parts.join('\n')) };
}

dominoDots.heightMm = 14;
dominoDots.grades = [1, 4];
equalGroups.heightMm = 13;
equalGroups.grades = [1, 5];
calendarMonth.heightMm = 26;
calendarMonth.grades = [1, 5];
moneyPurse.heightMm = 16;
moneyPurse.grades = [1, 6];

/** An observer sighting a height, for angles of elevation and depression. */
function elevationScene(ctx) {
    const angle = randomChoice([20, 25, 30, 35, 40, 45, 50, 55, 60]);
    const distance = between(8, 60);
    const height = n(Math.round(distance * Math.tan(rad(angle)) * 100) / 100);
    const line = n(Math.round((distance / Math.cos(rad(angle))) * 100) / 100);

    const body = '  \\draw (0,0) -- (2.8,0);\n'
        + '  \\draw (2.8,0) -- (2.8,1.5);\n'
        + '  \\draw[dashed] (0,0) -- (2.8,1.5);\n'
        + `  \\draw (0.6,0) arc (0:${n(Math.atan2(1.5, 2.8) * 180 / Math.PI)}:0.6);\n`
        + `  \\node[font=\\tiny] at (0.95,0.16) {${angle}$^{\\circ}$};\n`
        + `  \\node[below,font=\\tiny] at (1.4,0) {${distance} m};\n`
        + '  \\node[right,font=\\tiny] at (2.8,0.75) {$h$};';

    const [question, answer] = randomChoice([
        [`The angle of elevation to the top is ${angle}° from ${distance} m away. Find the height, to two decimals.`, `${height} m`],
        [`A tower is ${height} m tall and the observer is ${distance} m away. Find the angle of elevation, to the nearest degree.`, `${angle}°`],
        [`The angle of elevation is ${angle}° from ${distance} m away. Find the direct line of sight distance, to two decimals.`, `${line} m`],
        [`Which trigonometric ratio relates the height and the ${distance} m ground distance?`, 'tangent'],
        [`Looking down from the top instead, what is the angle of depression?`, `${angle}°`],
        [`If the observer walks closer, does the angle of elevation grow or shrink?`, 'grow'],
        [`The angle of elevation is ${angle}° and the height is ${height} m. Find the ground distance, to two decimals.`, `${distance} m`],
    ]);

    return { question, answer: `${answer}`, figure: tikz(body) };
}

/** A short till receipt, for totals, change and tax. */
function receiptTotal(ctx) {
    const grade = gradeOf(ctx);
    const items = between(2, 3);
    const prices = Array.from({ length: items }, () => between(1, 9) + randomChoice([0, 0.25, 0.5, 0.75]));
    const total = n(prices.reduce((sum, price) => sum + price, 0));
    const paid = Math.ceil(total / 5) * 5;

    const lines = prices.map((price, i) =>
        `  \\node[font=\\tiny] at (0.35,${n(1.15 - i * 0.28)}) {item ${i + 1}};\n` +
        `  \\node[font=\\tiny] at (1.5,${n(1.15 - i * 0.28)}) {$\\mathdollar ${price.toFixed(2)}$};`
    ).join('\n');

    const body = '  \\draw (0,0) rectangle (1.95,1.45);\n' + lines
        + `\n  \\draw (0.1,${n(1.15 - items * 0.28 + 0.14)}) -- (1.85,${n(1.15 - items * 0.28 + 0.14)});`;

    const tasks = [
        ['What is the total of this receipt?', `$${total.toFixed(2)}`],
        ['How many items are on this receipt?', items],
        ['What is the most expensive item on the receipt?', `$${Math.max(...prices).toFixed(2)}`],
        ['What is the cheapest item on the receipt?', `$${Math.min(...prices).toFixed(2)}`],
        [`What is the difference between the dearest and cheapest item?`, `$${n(Math.max(...prices) - Math.min(...prices)).toFixed(2)}`],
    ];
    if (grade >= 3) tasks.push([`How much change is left from $${paid}?`, `$${n(paid - total).toFixed(2)}`]);
    if (grade >= 4) tasks.push(['Rounded to the nearest dollar, what is the total?', `$${Math.round(total)}`]);
    if (grade >= 5) tasks.push(['What is the mean price of the items, to two decimals?', `$${n(Math.round((total / items) * 100) / 100).toFixed(2)}`]);
    if (grade >= 6) tasks.push(['What is the total with 13% tax added, to two decimals?', `$${n(Math.round(total * 1.13 * 100) / 100).toFixed(2)}`]);
    if (grade >= 7) tasks.push(['What is the total after a 20% discount, to two decimals?', `$${n(Math.round(total * 0.8 * 100) / 100).toFixed(2)}`]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer: `${answer}`, figure: tikz(body) };
}

/** Coins sorted onto a mat, for counting by value. */
function coinSort(ctx) {
    const grade = gradeOf(ctx);
    const nickels = between(1, 4);
    const dimes = between(1, 4);
    const quarters = between(1, 3);
    const total = nickels * 5 + dimes * 10 + quarters * 25;

    const row = (count, label, y) => Array.from({ length: count }, (_, i) =>
        `  \\draw (${n(i * 0.55 + 0.3)},${y}) circle (0.24);\n` +
        `  \\node[font=\\tiny] at (${n(i * 0.55 + 0.3)},${y}) {${label}};`
    ).join('\n');

    const body = `${row(nickels, '5', 1.2)}\n${row(dimes, '10', 0.6)}\n${row(quarters, '25', 0)}`;

    const tasks = [
        ['How much are the coins worth altogether, in cents?', `${total} cents`],
        ['How many coins are on the mat?', nickels + dimes + quarters],
        ['How much are the 25 cent coins worth together?', `${quarters * 25} cents`],
        ['How much are the 10 cent coins worth together?', `${dimes * 10} cents`],
        ['Which row is worth the most?', quarters * 25 >= dimes * 10 && quarters * 25 >= nickels * 5 ? 'the 25 cent row' : (dimes * 10 >= nickels * 5 ? 'the 10 cent row' : 'the 5 cent row')],
        ['How many 5 cent coins are there?', nickels],
    ];
    if (grade >= 2) tasks.push(['How much more is needed to make one dollar?', `${Math.max(0, 100 - total)} cents`]);
    if (grade >= 3) tasks.push(['Write the total in dollars.', `$${n(total / 100).toFixed(2)}`]);
    if (grade >= 3) tasks.push(['How many 10 cent coins would be worth the same as the 25 cent coins?', n((quarters * 25) / 10)]);

    const [question, answer] = randomChoice(tasks);
    return { question, answer: `${answer}`, figure: tikz(body) };
}

elevationScene.heightMm = 20;
elevationScene.grades = [10, 12];
receiptTotal.heightMm = 20;
receiptTotal.grades = [2, 9];
coinSort.heightMm = 22;
coinSort.grades = [1, 5];

/**
 * Visual draws by topic id, so grade and topic filtering govern these the way
 * they govern every other question.
 *
 * @type {Record<string, Array<(ctx: object) => {question: string, answer: string, figure: string}>>}
 */
export const VISUAL_PROBLEMS = {
    // Number
    'counting-quantity': [tenFrame, numberLine, dotArray, shapeSort, shapePattern, dominoDots, equalGroups],
    'basic-operations': [dotArray, numberLine, tenFrame, dominoDots, equalGroups],
    'place-value': [placeValueBlocks, numberLine, hundredGrid],
    'fractions': [fractionBar, fractionCircle],
    'decimals': [hundredGrid, numberLine],
    'percentages': [hundredGrid, fractionBar],
    'rational-numbers': [numberLine, fractionBar, realNumberLine],
    'integers': [numberLine, thermometer],
    'patterns': [growingPattern, numberLine, shapePattern],
    'estimation': [numberLine, realNumberLine],
    'word-problems': [tapeDiagram, areaModel],
    'ratios-proportions': [ratioTape, similarTriangles],
    'exponents-roots': [squareRootArea, realNumberLine],
    'order-of-operations': [operationChain],
    'factors-multiples': [factorTree, squareRootArea],

    // Measurement
    'length': [ruler],
    'temperature': [thermometer],
    'time': [clock, calendarMonth],
    'capacity-volume': [beaker],
    'weight-mass': [balanceScale],
    'metric-customary': [ruler, beaker, scaleDrawing],
    'unit-conversions': [unitLadder, scaleDrawing],

    // Geometry
    '2d-shapes': [rectangleMeasure, compositeShape, shapeOutline, shapeSort],
    '3d-shapes': [solidVolume, solidOutline],
    'area-perimeter': [rectangleMeasure, compositeShape],
    'volume-surface': [solidVolume],
    'triangles': [rightTriangle, angleMeasure],
    'pythagorean-theorem': [rightTriangle],
    'angles': [angleMeasure, parallelLines],
    'circles': [circleMeasure],
    'coordinate-geometry': [coordinateGrid, linearGraph],
    'transformations': [transformation],
    'symmetry': [symmetryShape, transformation, shapeOutline],
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
    'expressions': [functionMachine, areaModel, balanceScale],
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
    // Coding is the only algebra topic the junior grades have, so it carries
    // the step-following figures too — without them Grade 4 saw one diagram.
    'coding': [codingFlow, operationChain, functionMachine, growingPattern],

    // Trigonometry
    'right-triangles': [trigTriangle, bearingDiagram, obliqueTriangle, elevationScene],
    'unit-circle': [unitCircle],
    'trig-functions': [sineWave, unitCircle, trigTriangle, obliqueTriangle],
    'identities': [sineWave],
    'equations': [sineWave],

    // Advanced functions and calculus
    'polynomial-functions': [polynomialCurve, parabola, exponentialCurve],
    'quadratic-equations': [parabola],
    'exponential-functions': [exponentialCurve],
    'logarithms': [exponentialCurve],
    'rational-functions': [rationalAsymptote],
    'derivatives': [tangentLine, polynomialCurve, slopeSketch],
    'limits': [tangentLine, rationalAsymptote, slopeSketch],
    'vectors-matrices': [vectorSum],
    'sequences-series': [sequenceDots],
    'conic-sections': [conicShape],
    'parametric-polar': [conicShape],
    'complex-numbers': [complexPlane],
    'integrals': [areaUnderCurve],
    'optimization': [optimizationBox],
    'related-rates': [ladderSlide],
    'applications': [trigTriangle, tangentLine, bearingDiagram, slopeSketch, elevationScene],

    // Financial literacy
    'coins-and-bills': [coins, priceTag, savingsJar, moneyPurse, coinSort],
    'making-change': [coins, priceTag, savingsJar, moneyPurse, coinSort, receiptTotal],
    'money': [coins, priceTag, moneyPurse, coinSort],
    'budgeting': [budgetPie, savingsJar],
    'unit-price': [priceCompare, receiptTotal],
    'sales-tax-discount': [discountTag, receiptTotal],
    'simple-interest': [interestBars],
    'compound-interest': [interestBars],
    'currency-exchange': [currencyBars],
};
