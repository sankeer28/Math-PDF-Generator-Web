/**
 * Early-grade problems
 *
 * Grades 1 to 3 have the narrowest content in the curriculum, and the subject
 * generators — written for the middle grades — reach for ideas those grades have
 * not met. This module holds work that genuinely belongs to the youngest
 * grades: counting on, number bonds, comparing lengths, naming shapes, reading
 * a tally.
 *
 * Keyed by subject, then by grade. The subject generators consult this first
 * for Grades 1-3 and fall back to their usual behaviour when it has nothing.
 *
 * @module curriculum/templates/earlyGrades
 */

import { randomChoice } from '../../modules/utils.js';

const between = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
    'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** Spells a number below 100, so "write it in words" has a real answer. */
function inWords(value) {
    if (value < 20) return ONES[value];
    const tens = TENS[Math.floor(value / 10)];
    const ones = value % 10;
    return ones === 0 ? tens : `${tens}-${ONES[ones]}`;
}

const SHAPES_2D = ['circle', 'square', 'triangle', 'rectangle', 'hexagon', 'pentagon'];
const SIDES = { circle: 0, square: 4, triangle: 3, rectangle: 4, hexagon: 6, pentagon: 5 };
const SHAPES_3D = ['cube', 'sphere', 'cylinder', 'cone', 'pyramid'];
const FACES = { cube: 6, sphere: 1, cylinder: 3, cone: 2, pyramid: 5 };

const OBJECTS = ['pencil', 'book', 'ribbon', 'straw', 'crayon', 'stick', 'rope', 'leaf'];
const ANIMALS = ['cats', 'dogs', 'birds', 'fish', 'rabbits', 'frogs'];
const CONTAINERS = ['cup', 'bottle', 'jug', 'bucket', 'kettle'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'March', 'May', 'July', 'September', 'November'];

/* ------------------------------------------------------------ arithmetic */

const arithmetic = {
    grade1: [
        () => { const a = between(1, 9); return { question: `What is 1 more than ${a}?`, answer: a + 1 }; },
        () => { const a = between(2, 10); return { question: `What is 1 less than ${a}?`, answer: a - 1 }; },
        () => { const a = between(1, 9); return { question: `What is 2 more than ${a}?`, answer: a + 2 }; },
        () => { const a = between(1, 10); return { question: `Double ${a} = `, answer: a * 2 }; },
        () => { const a = between(1, 9); return { question: `${a} + ${a} + 1 = `, answer: a * 2 + 1 }; },
        () => { const a = between(1, 9); return { question: `${a} and __ make 10`, answer: 10 - a }; },
        () => { const a = between(0, 10); return { question: `10 - ${a} = `, answer: 10 - a }; },
        () => { const a = between(1, 20); const b = between(1, 20); return { question: `Which is greater, ${a} or ${b}?`, answer: a === b ? 'they are equal' : Math.max(a, b) }; },
        () => { const a = between(1, 20); const b = between(1, 20); return { question: `Which is less, ${a} or ${b}?`, answer: a === b ? 'they are equal' : Math.min(a, b) }; },
        () => { const a = between(2, 8); return { question: `Count on 3 from ${a}. What number do you reach?`, answer: a + 3 }; },
        () => { const a = between(4, 15); return { question: `Count back 2 from ${a}. What number do you reach?`, answer: a - 2 }; },
        () => { const start = between(0, 6) * 2; return { question: `Skip count by 2s: ${start}, ${start + 2}, ${start + 4}, __`, answer: start + 6 }; },
        () => { const start = between(0, 4) * 5; return { question: `Skip count by 5s: ${start}, ${start + 5}, ${start + 10}, __`, answer: start + 15 }; },
        () => { const start = between(0, 4) * 10; return { question: `Skip count by 10s: ${start}, ${start + 10}, ${start + 20}, __`, answer: start + 30 }; },
        () => { const a = between(11, 19); return { question: `How many tens and ones are in ${a}?`, answer: `1 ten and ${a - 10} ones` }; },
        () => { const a = between(1, 10); const b = between(1, 10); const c = between(1, 5); return { question: `${a} + ${b} - ${c} = `, answer: a + b - c }; },
        () => { const total = between(5, 10); const part = between(1, total - 1); return { question: `${total} is made of ${part} and __`, answer: total - part }; },
        () => { const a = between(1, 5); return { question: `${a} + 0 = `, answer: a }; },
        () => { const a = between(3, 12); return { question: `Is ${a} an even or an odd number?`, answer: a % 2 === 0 ? 'even' : 'odd' }; },
        () => { const nums = [between(1, 9), between(10, 19), between(20, 29)].sort(() => Math.random() - 0.5); return { question: `Put these in order from smallest: ${nums.join(', ')}`, answer: [...nums].sort((x, y) => x - y).join(', ') }; },
        () => { const a = between(1, 9); return { question: `What number comes between ${a} and ${a + 2}?`, answer: a + 1 }; },
        () => { const a = between(1, 5); return { question: `${a} + ${a} = `, answer: a * 2 }; },
        () => { const a = between(6, 10); return { question: `${a} - ${a - 1} = `, answer: 1 }; },
        () => { const a = between(2, 9); return { question: `How many more than ${a} is 10?`, answer: 10 - a }; },
        () => { const a = between(1, 5); const b = between(1, 5); return { question: `Add ${a} and ${b}. Then add 1 more.`, answer: a + b + 1 }; },
        () => { const a = between(3, 9); return { question: `Take away 3 from ${a}.`, answer: a - 3 }; },
        () => { const a = between(2, 9); return { question: `Write the number sentence for ${a} add 2, and its answer.`, answer: `${a} + 2 = ${a + 2}` }; },
        () => { const total = between(6, 10); const part = between(1, total - 1); return { question: `There are ${total} in all and ${part} are red. How many are not red?`, answer: total - part }; },
        () => { const a = between(1, 10); return { question: `Which is the number before ${a + 1}?`, answer: a }; },
        () => { const start = between(1, 5); return { question: `Count on from ${start} to ${start + 4}. How many numbers did you say?`, answer: 4 }; },
        () => { const a = between(10, 19); return { question: `Is ${a} closer to 10 or to 20?`, answer: a - 10 < 20 - a ? '10' : (a - 10 > 20 - a ? '20' : 'the same distance') }; },
        () => { const a = between(1, 9); return { question: `Show ${a} as a tens and ones number.`, answer: `0 tens and ${a} ones` }; },
        () => { const a = between(2, 5); return { question: `${a} + ${a} + ${a} = `, answer: a * 3 }; },
        () => { const a = between(1, 8); return { question: `What is the next number after ${a}?`, answer: a + 1 }; },
        () => {
            const nums = [between(1, 10), between(1, 10), between(1, 10)];
            return {
                question: `Add the largest and the smallest of ${nums.join(', ')}.`,
                answer: Math.max(...nums) + Math.min(...nums),
            };
        },
        () => { const a = between(2, 9); return { question: `If you have ${a} and give away 1, how many are left?`, answer: a - 1 }; },
    ],

    grade2: [
        () => { const a = between(10, 90); return { question: `What is 10 more than ${a}?`, answer: a + 10 }; },
        () => { const a = between(20, 99); return { question: `What is 10 less than ${a}?`, answer: a - 10 }; },
        () => { const a = between(11, 60); return { question: `Round ${a} to the nearest ten.`, answer: Math.round(a / 10) * 10 }; },
        () => { const a = between(20, 99); return { question: `How many tens and ones are in ${a}?`, answer: `${Math.floor(a / 10)} tens and ${a % 10} ones` }; },
        () => { const a = between(2, 12); return { question: `Double ${a} = `, answer: a * 2 }; },
        () => { const a = between(2, 10); return { question: `Half of ${a * 2} = `, answer: a }; },
        () => { const a = between(2, 9); const b = between(2, 5); return { question: `${b} groups of ${a} = `, answer: a * b }; },
        () => { const a = between(2, 9); return { question: `Skip count by ${a}s four times from 0. What is the last number?`, answer: a * 4 }; },
        () => { const a = between(20, 80); const b = between(5, 19); return { question: `${a} + ${b} = `, answer: a + b }; },
        () => { const a = between(30, 99); const b = between(5, 25); return { question: `${a} - ${b} = `, answer: a - b }; },
        () => { const a = between(1, 40); return { question: `Is ${a} even or odd?`, answer: a % 2 === 0 ? 'even' : 'odd' }; },
        () => { const a = between(2, 9); return { question: `${a} + __ = ${a * 2}`, answer: a }; },
        () => { const total = between(20, 50); const part = between(5, total - 5); return { question: `${total} is made of ${part} and __`, answer: total - part }; },
        () => { const a = between(100, 200); return { question: `What number comes after ${a}?`, answer: a + 1 }; },
        () => { const parts = [2, 4]; const n = randomChoice(parts); return { question: `Share 12 equally between ${n}. How many each?`, answer: 12 / n }; },
        () => { const a = between(1, 9); return { question: `Write the number that is ${a} tens.`, answer: a * 10 }; },
    ],

    grade3: [
        () => { const a = between(100, 900); return { question: `Round ${a} to the nearest hundred.`, answer: Math.round(a / 100) * 100 }; },
        () => { const a = between(100, 999); return { question: `How many hundreds, tens and ones are in ${a}?`, answer: `${Math.floor(a / 100)} hundreds, ${Math.floor((a % 100) / 10)} tens, ${a % 10} ones` }; },
        () => { const a = between(2, 10); const b = between(2, 10); return { question: `${a} × ${b} = `, answer: a * b }; },
        () => { const b = between(2, 9); const q = between(2, 9); return { question: `${b * q} ÷ ${b} = `, answer: q }; },
        () => { const a = between(2, 9); return { question: `Write a multiplication fact for ${a} + ${a} + ${a}.`, answer: `3 × ${a} = ${a * 3}` }; },
        () => { const d = randomChoice([2, 3, 4]); const n = between(1, d - 1); return { question: `Which is larger, ${n}/${d} or ${d - n}/${d}?`, answer: n > d - n ? `${n}/${d}` : (n === d - n ? 'they are equal' : `${d - n}/${d}`) }; },
        () => { const total = between(2, 6) * 4; return { question: `Share ${total} equally between 4. How many each?`, answer: total / 4 }; },
        () => { const a = between(100, 800); const b = between(50, 190); return { question: `${a} + ${b} = `, answer: a + b }; },
        () => { const a = between(300, 999); const b = between(50, 290); return { question: `${a} - ${b} = `, answer: a - b }; },
        () => { const a = between(2, 12); return { question: `What is ${a} × 10?`, answer: a * 10 }; },
        () => { const a = between(2, 9); return { question: `List the first four multiples of ${a}.`, answer: [1, 2, 3, 4].map((k) => a * k).join(', ') }; },
        () => { const a = between(6, 24); return { question: `Name two numbers that multiply to make ${a}.`, answer: (() => { for (let f = 2; f <= Math.sqrt(a); f += 1) if (a % f === 0) return `${f} and ${a / f}`; return `1 and ${a}`; })() }; },
        () => { const a = between(2, 9); return { question: `${a} × __ = ${a * 5}`, answer: 5 }; },
        () => { const a = between(11, 99); return { question: `Write ${a} in words.`, answer: inWords(a) }; },
    ],
};

/* ----------------------------------------------------------- measurement */

const measurement = {
    grade1: [
        () => { const [a, b] = [randomChoice(OBJECTS), randomChoice(OBJECTS)]; return { question: `A ${a} is 6 cubes long. A ${b} is 9 cubes long. Which is longer?`, answer: b }; },
        () => { const n = between(3, 9); return { question: `A ribbon is ${n} cubes long. How many cubes long are two of them?`, answer: n * 2 }; },
        () => ({ question: `Which holds more, a cup or a bucket?`, answer: 'the bucket' }),
        () => ({ question: `Which is heavier, a feather or a book?`, answer: 'the book' }),
        () => { const d = randomChoice(DAYS); return { question: `What day comes after ${d}?`, answer: DAYS[(DAYS.indexOf(d) + 1) % 7] }; },
        () => { const d = randomChoice(DAYS); return { question: `What day comes before ${d}?`, answer: DAYS[(DAYS.indexOf(d) + 6) % 7] }; },
        () => ({ question: `How many days are in one week?`, answer: 7 }),
        () => { const h = between(1, 12); return { question: `The hour hand points at ${h} and the minute hand at 12. What time is it?`, answer: `${h} o'clock` }; },
        () => { const n = between(2, 5); return { question: `You have ${n} dimes. How many cents is that?`, answer: `${n * 10} cents` }; },
        () => { const n = between(2, 6); return { question: `You have ${n} nickels. How many cents is that?`, answer: `${n * 5} cents` }; },
    ],

    grade2: [
        () => { const n = between(20, 90); return { question: `A ${randomChoice(OBJECTS)} is ${n} cm long. Is that longer or shorter than one metre?`, answer: n >= 100 ? 'longer' : 'shorter' }; },
        () => { const n = between(2, 9); return { question: `How many centimetres are in ${n} tens of centimetres?`, answer: `${n * 10} cm` }; },
        () => { const c = randomChoice(CONTAINERS); return { question: `Would you measure a ${c} in millilitres or litres?`, answer: c === 'bucket' ? 'litres' : 'millilitres' }; },
        () => { const m = randomChoice(MONTHS); return { question: `How many days are in ${m}?`, answer: ['January', 'March', 'May', 'July'].includes(m) ? 31 : 30 }; },
        () => ({ question: `How many months are in one year?`, answer: 12 }),
        () => { const h = between(1, 11); return { question: `What time is half an hour after ${h}:00?`, answer: `${h}:30` }; },
        () => { const q = between(1, 4); return { question: `You have ${q} quarters. How many cents is that?`, answer: `${q * 25} cents` }; },
        () => { const n = between(2, 9); return { question: `A ${randomChoice(OBJECTS)} weighs ${n * 100} g. How many grams do two weigh?`, answer: `${n * 200} g` }; },
        () => { const n = between(3, 9); return { question: `A rope is ${n} m long. How many centimetres is that?`, answer: `${n * 100} cm` }; },
    ],

    grade3: [
        () => { const n = between(2, 9); return { question: `Convert ${n} m to centimetres.`, answer: `${n * 100} cm` }; },
        () => { const n = between(2, 9); return { question: `Convert ${n} kg to grams.`, answer: `${n * 1000} g` }; },
        () => { const n = between(2, 9); return { question: `Convert ${n} L to millilitres.`, answer: `${n * 1000} mL` }; },
        () => { const h = between(1, 6); return { question: `How many minutes are in ${h} hours?`, answer: `${h * 60} minutes` }; },
        () => { const m = between(2, 8) * 15; return { question: `How many quarter hours are in ${m} minutes?`, answer: m / 15 }; },
        () => { const start = between(1, 9); const dur = between(1, 3); return { question: `A film starts at ${start}:00 and lasts ${dur} hours. When does it end?`, answer: `${start + dur}:00` }; },
        () => { const n = between(2, 9); return { question: `A perimeter of a square is ${n * 4} cm. How long is one side?`, answer: `${n} cm` }; },
        () => { const n = between(20, 90); return { question: `Round ${n} cm to the nearest 10 cm.`, answer: `${Math.round(n / 10) * 10} cm` }; },
    ],
};

/* -------------------------------------------------------------- geometry */

const geometry = {
    grade1: [
        () => { const s = randomChoice(SHAPES_2D); return { question: `How many sides does a ${s} have?`, answer: SIDES[s] === 0 ? 'none, it is curved' : SIDES[s] }; },
        () => { const s = randomChoice(SHAPES_2D.filter((x) => x !== 'circle')); return { question: `How many corners does a ${s} have?`, answer: SIDES[s] }; },
        () => ({ question: `Which shape has three sides?`, answer: 'a triangle' }),
        () => ({ question: `Which shape is perfectly round with no corners?`, answer: 'a circle' }),
        () => { const s = randomChoice(SHAPES_3D); return { question: `Name an everyday object shaped like a ${s}.`, answer: { cube: 'a dice', sphere: 'a ball', cylinder: 'a tin', cone: 'a party hat', pyramid: 'a tent' }[s] }; },
        () => ({ question: `A square has four sides. Are they all the same length?`, answer: 'yes' }),
        () => { const n = between(2, 5); return { question: `You join ${n} triangles side by side. How many triangles are there?`, answer: n }; },
        () => ({ question: `Is a door shaped more like a rectangle or a circle?`, answer: 'a rectangle' }),
    ],

    grade2: [
        () => { const s = randomChoice(SHAPES_3D); return { question: `How many faces does a ${s} have?`, answer: FACES[s] }; },
        () => ({ question: `How many edges does a cube have?`, answer: 12 }),
        () => ({ question: `How many vertices does a cube have?`, answer: 8 }),
        () => { const s = randomChoice(['square', 'rectangle', 'triangle']); return { question: `How many lines of symmetry does a ${s} have?`, answer: { square: 4, rectangle: 2, triangle: 3 }[s] }; },
        () => { const n = between(2, 6); return { question: `A shape has ${n} equal sides. What is it called?`, answer: { 3: 'a triangle', 4: 'a square', 5: 'a pentagon', 6: 'a hexagon' }[n] || 'a polygon' }; },
        () => { const w = between(2, 6); const h = between(2, 6); return { question: `A rectangle is ${w} squares wide and ${h} squares tall. How many squares cover it?`, answer: w * h }; },
        () => ({ question: `Which has more sides, a pentagon or a hexagon?`, answer: 'a hexagon' }),
    ],

    grade3: [
        () => { const w = between(2, 9); const h = between(2, 9); return { question: `A rectangle is ${w} cm by ${h} cm. What is its perimeter?`, answer: `${2 * (w + h)} cm` }; },
        () => { const w = between(2, 9); const h = between(2, 9); return { question: `A rectangle is ${w} cm by ${h} cm. What is its area?`, answer: `${w * h} square cm` }; },
        () => { const s = between(2, 9); return { question: `A square has sides of ${s} cm. What is its perimeter?`, answer: `${4 * s} cm` }; },
        () => ({ question: `How many right angles are in a rectangle?`, answer: 4 }),
        () => { const n = randomChoice([3, 4, 5, 6, 8]); return { question: `What is the name of a polygon with ${n} sides?`, answer: { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 8: 'octagon' }[n] }; },
        () => ({ question: `Is a cube a flat shape or a solid shape?`, answer: 'a solid shape' }),
        () => { const n = between(2, 5); return { question: `A shape is turned a quarter turn ${n} times. How far has it turned in total?`, answer: `${n * 90} degrees` }; },
    ],
};

/* ------------------------------------------------------------ statistics */

const statistics = {
    grade1: [
        () => { const a = randomChoice(ANIMALS); const n = between(3, 9); return { question: `A tally chart shows ${n} marks for ${a}. How many ${a} are there?`, answer: n }; },
        () => { const [a, b] = [between(2, 6), between(7, 12)]; return { question: `One column has ${a} counters and another has ${b}. Which has more?`, answer: `the one with ${b}` }; },
        () => { const [a, b] = [between(2, 6), between(7, 12)]; return { question: `One column has ${a} counters and another has ${b}. How many more are in the taller one?`, answer: b - a }; },
        () => { const n = between(2, 5); return { question: `You sort ${n * 2} blocks into 2 equal groups. How many in each group?`, answer: n }; },
        () => ({ question: `If you flip a coin, name the two possible results.`, answer: 'heads or tails' }),
        () => { const a = randomChoice(ANIMALS); return { question: `Is it certain, possible, or impossible that a ${a} can fly?`, answer: a === 'birds' ? 'certain' : 'impossible' }; },
        () => { const n = between(4, 10); return { question: `A graph shows ${n} in total across 2 equal bars. How tall is each bar?`, answer: n / 2 }; },
    ],

    grade2: [
        () => { const counts = [between(2, 9), between(2, 9), between(2, 9)]; return { question: `A chart shows ${counts.join(', ')}. What is the total?`, answer: counts.reduce((a, b) => a + b, 0) }; },
        () => { const counts = [between(2, 9), between(2, 9), between(2, 9)]; return { question: `A chart shows ${counts.join(', ')}. What is the largest value?`, answer: Math.max(...counts) }; },
        () => { const counts = [between(2, 9), between(2, 9), between(2, 9)]; return { question: `A chart shows ${counts.join(', ')}. What is the difference between the largest and smallest?`, answer: Math.max(...counts) - Math.min(...counts) }; },
        () => { const each = randomChoice([2, 5]); const n = between(2, 6); return { question: `On a pictograph each symbol stands for ${each}. What do ${n} symbols show?`, answer: each * n }; },
        () => ({ question: `Rolling a 7 on a normal six-sided die is certain, possible, or impossible?`, answer: 'impossible' }),
        () => ({ question: `Rolling an even number on a six-sided die is certain, possible, or impossible?`, answer: 'possible' }),
    ],

    grade3: [
        () => { const data = Array.from({ length: 5 }, () => between(1, 20)); return { question: `The data is ${data.join(', ')}. What is the range?`, answer: Math.max(...data) - Math.min(...data) }; },
        () => { const data = Array.from({ length: 5 }, () => between(1, 20)); return { question: `The data is ${data.join(', ')}. What is the largest value?`, answer: Math.max(...data) }; },
        () => { const v = between(2, 6); const data = [v, v, between(7, 12), between(7, 12), v]; return { question: `The data is ${data.join(', ')}. Which value appears most often?`, answer: v }; },
        () => { const each = randomChoice([2, 5, 10]); const total = each * between(2, 8); return { question: `On a pictograph each symbol stands for ${each}. How many symbols show ${total}?`, answer: total / each }; },
        () => ({ question: `A bag holds 3 red and 3 blue counters. Are red and blue equally likely?`, answer: 'yes' }),
        () => { const r = between(1, 4); const b = between(5, 8); return { question: `A bag holds ${r} red and ${b} blue counters. Which colour is more likely?`, answer: 'blue' }; },
    ],
};

/**
 * Early-grade problems by subject and grade.
 *
 * @type {Record<string, Record<string, Array<() => {question: string, answer: string|number}>>>}
 */
export const EARLY_PROBLEMS = { arithmetic, measurement, geometry, statistics };

/**
 * Draws an early-grade problem, if this subject and grade have any.
 *
 * @param {string} subject
 * @param {string} gradeId
 * @returns {{question: string, answer: string|number}|null}
 */
export function drawEarlyProblem(subject, gradeId) {
    const draws = EARLY_PROBLEMS[subject]?.[gradeId];
    if (!draws || draws.length === 0) return null;
    return randomChoice(draws)();
}
