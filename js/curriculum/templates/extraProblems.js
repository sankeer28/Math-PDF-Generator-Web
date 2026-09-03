/**
 * Supplementary problem banks
 *
 * The subject generators cover each strand once. This module widens them: for
 * every subject it holds extra work banded to the grades that have met the
 * idea, so a worksheet can ask forty different things about number sense
 * rather than the same eight with new digits.
 *
 * Each draw carries its own `grades` band, checked against the worksheet's
 * grade before it is offered. A draw usually holds several phrasings of the
 * same setup — asking for the perimeter, the missing side and the scale factor
 * from one rectangle is three genuinely different questions, not one.
 *
 * Notation follows the subject generators: plain Unicode (√, ², ^) rather than
 * LaTeX, since the worksheet layer escapes and typesets what it is given.
 *
 * @module curriculum/templates/extraProblems
 */

import { randomChoice } from '../../modules/utils.js';

/** @typedef {{question: string, answer: string|number}} Problem */
/** @typedef {(() => Problem) & {grades: [number, number]}} Draw */

const between = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** Tags a draw with the grades it suits. @returns {Draw} */
function band(low, high, draw) {
    draw.grades = [low, high];
    return draw;
}

/** Picks one [question, answer] pair from a draw's phrasings. @returns {Problem} */
function task(pairs) {
    const [question, answer] = pick(pairs);
    return { question, answer };
}

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const round2 = (value) => Math.round(value * 100) / 100;

/** Reduces a fraction to lowest terms, as "a/b". */
function simplify(numerator, denominator) {
    const divisor = gcd(numerator, denominator) || 1;
    const bottom = denominator / divisor;
    return bottom === 1 ? `${numerator / divisor}` : `${numerator / divisor}/${bottom}`;
}

/* -------------------------------------------------------------- number */

const arithmetic = [
    band(1, 2, () => {
        const a = between(2, 9);
        return task([
            [`How many more than ${a} makes 10?`, 10 - a],
            [`${a} + __ = 10`, 10 - a],
            [`10 = __ + ${a}`, 10 - a],
        ]);
    }),

    band(1, 2, () => {
        const a = between(1, 10);
        const b = between(1, 10);
        const sign = a > b ? '>' : a < b ? '<' : '=';
        return task([
            [`Write >, < or = between ${a} and ${b}.`, sign],
            [`Is ${a} greater than ${b}? Write yes or no.`, a > b ? 'yes' : 'no'],
            [`Which of ${a} and ${b} would come first when counting?`, Math.min(a, b)],
        ]);
    }),

    band(1, 2, () => {
        const a = between(1, 5);
        return task([
            [`Double ${a}, then double your answer.`, a * 4],
            [`Double ${a} and add 1.`, a * 2 + 1],
            [`Double ${a} and take away 1.`, a * 2 - 1],
        ]);
    }),

    band(1, 2, () => {
        const start = between(10, 20);
        return task([
            [`Count back by 2s from ${start}. Write the next three numbers.`, `${start - 2}, ${start - 4}, ${start - 6}`],
            [`Count back by 1s from ${start}. Write the next three numbers.`, `${start - 1}, ${start - 2}, ${start - 3}`],
            [`Start at ${start} and count on by 2s. Write the next three numbers.`, `${start + 2}, ${start + 4}, ${start + 6}`],
        ]);
    }),

    band(1, 2, () => {
        const n = between(1, 10);
        return task([
            [`Write the ${ORDINALS[n - 1]} letter of the word MATHEMATICS.`, 'MATHEMATICS'[n - 1]],
            [`In the word NUMBERS, which letter is ${ORDINALS[Math.min(n, 7) - 1]}?`, 'NUMBERS'[Math.min(n, 7) - 1]],
        ]);
    }),

    band(1, 3, () => {
        const tens = between(1, 6);
        const ones = between(1, 9);
        const value = tens * 10 + ones;
        return task([
            [`Build the number with ${tens} tens and ${ones} ones.`, value],
            [`How many tens are in ${value}?`, tens],
            [`How many ones are left over in ${value} after the tens?`, ones],
            [`What is ${value} with the tens and ones swapped?`, ones * 10 + tens],
        ]);
    }),

    band(1, 3, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`${a} + ${b} = __ . Write the matching subtraction sentence.`, `${a + b} - ${b} = ${a}`],
            [`Write two addition sentences that make ${a + b}.`, `${a} + ${b} and ${b} + ${a}`],
            [`${a} + ${b} = ${b} + __`, a],
        ]);
    }),

    band(1, 3, () => {
        const total = between(6, 12);
        const groups = 2;
        return task([
            [`Share ${total * groups} counters equally between ${groups} children. How many does each get?`, total],
            [`${total * groups} counters are shared into groups of ${total}. How many groups?`, groups],
            [`Half of ${total * groups} is __`, total],
        ]);
    }),

    band(2, 3, () => {
        const a = between(2, 5);
        const b = between(2, 5);
        return task([
            [`${a} groups of ${b} is the same as ${b} groups of __`, a],
            [`Write ${a} + ${a} + ${a === b ? a : a} (${b} times) as a multiplication.`, `${b} × ${a} = ${a * b}`],
            [`${a} × ${b} = __`, a * b],
        ]);
    }),

    band(2, 4, () => {
        const value = between(21, 89);
        return task([
            [`Round ${value} to the nearest ten.`, Math.round(value / 10) * 10],
            [`Is ${value} nearer to ${Math.floor(value / 10) * 10} or ${Math.ceil(value / 10) * 10}?`, Math.round(value / 10) * 10],
            [`Write ${value} as a sum of tens and ones.`, `${Math.floor(value / 10) * 10} + ${value % 10}`],
        ]);
    }),

    band(2, 4, () => {
        const parts = pick([2, 3, 4]);
        const whole = parts * between(2, 6);
        return task([
            [`What is 1/${parts} of ${whole}?`, whole / parts],
            [`${whole / parts} is 1/${parts} of what number?`, whole],
            [`How many ${parts}s are in ${whole}?`, whole / parts],
        ]);
    }),

    band(2, 4, () => {
        const step = pick([3, 4, 5]);
        const start = step * between(1, 4);
        return task([
            [`Continue the pattern: ${start}, ${start + step}, ${start + step * 2}, __`, start + step * 3],
            [`What is the rule of the pattern ${start}, ${start + step}, ${start + step * 2}?`, `add ${step}`],
            [`What is the ${ORDINALS[4]} term of the pattern starting at ${start} and adding ${step}?`, start + step * 4],
        ]);
    }),

    band(3, 5, () => {
        const a = between(120, 890);
        const b = between(110, 400);
        return task([
            [`Estimate ${a} + ${b} by rounding each to the nearest hundred.`, Math.round(a / 100) * 100 + Math.round(b / 100) * 100],
            [`Estimate ${a} - ${b} by rounding each to the nearest hundred.`, Math.round(a / 100) * 100 - Math.round(b / 100) * 100],
            [`Round ${a} to the nearest hundred.`, Math.round(a / 100) * 100],
        ]);
    }),

    band(4, 6, () => {
        const value = between(12, 60);
        const factors = [];
        for (let i = 1; i <= value; i += 1) if (value % i === 0) factors.push(i);
        return task([
            [`List all the factors of ${value}.`, factors.join(', ')],
            [`How many factors does ${value} have?`, factors.length],
            [`Is ${value} prime or composite?`, factors.length === 2 ? 'prime' : 'composite'],
            [`What is the largest factor of ${value} other than ${value} itself?`, factors[factors.length - 2]],
        ]);
    }),

    band(4, 6, () => {
        const a = between(4, 12);
        const b = between(4, 12);
        let lcm = (a * b) / gcd(a, b);
        return task([
            [`What is the lowest common multiple of ${a} and ${b}?`, lcm],
            [`What is the greatest common factor of ${a} and ${b}?`, gcd(a, b)],
            [`List the first three multiples of ${a}.`, `${a}, ${a * 2}, ${a * 3}`],
        ]);
    }),

    band(4, 6, () => {
        const denominator = pick([4, 5, 8, 10]);
        const numerator = between(1, denominator - 1);
        const decimal = numerator / denominator;
        return task([
            [`Write ${numerator}/${denominator} as a decimal.`, decimal],
            [`Write ${numerator}/${denominator} as a percent.`, `${decimal * 100}%`],
            [`Which is larger, ${numerator}/${denominator} or 1/2?`, decimal > 0.5 ? `${numerator}/${denominator}` : (decimal < 0.5 ? '1/2' : 'they are equal')],
        ]);
    }),

    band(4, 6, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        const c = between(2, 9);
        return task([
            [`${a} × (${b} + ${c}) = __`, a * (b + c)],
            [`${a} × ${b} + ${a} × ${c} = __`, a * b + a * c],
            [`Use the distributive property to write ${a} × ${b + c} as two products.`, `${a} × ${b} + ${a} × ${c}`],
        ]);
    }),

    band(4, 6, () => {
        const whole = between(2, 5);
        const denominator = pick([2, 3, 4, 5]);
        const numerator = between(1, denominator - 1);
        const improper = whole * denominator + numerator;
        return task([
            [`Write ${whole} ${numerator}/${denominator} as an improper fraction.`, `${improper}/${denominator}`],
            [`Write ${improper}/${denominator} as a mixed number.`, `${whole} ${numerator}/${denominator}`],
            [`How many ${denominator}ths are in ${whole} wholes?`, whole * denominator],
        ]);
    }),

    band(5, 8, () => {
        const price = between(20, 80);
        const percent = pick([10, 20, 25, 50]);
        return task([
            [`What is ${percent}% of ${price}?`, round2((price * percent) / 100)],
            [`${round2((price * percent) / 100)} is what percent of ${price}?`, `${percent}%`],
            [`Increase ${price} by ${percent}%.`, round2(price + (price * percent) / 100)],
            [`Decrease ${price} by ${percent}%.`, round2(price - (price * percent) / 100)],
        ]);
    }),

    band(5, 8, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        const c = between(2, 6);
        return task([
            [`${a} + ${b} × ${c} = __`, a + b * c],
            [`(${a} + ${b}) × ${c} = __`, (a + b) * c],
            [`${a} × ${b} - ${c} = __`, a * b - c],
            [`Which is larger: ${a} + ${b} × ${c} or (${a} + ${b}) × ${c}?`, a + b * c > (a + b) * c ? `${a} + ${b} × ${c}` : `(${a} + ${b}) × ${c}`],
        ]);
    }),

    band(5, 8, () => {
        const first = between(2, 9);
        const second = first * between(2, 5);
        const scale = second / first;
        return task([
            [`Write the ratio ${first} : ${second} in simplest form.`, `1 : ${scale}`],
            [`If ${first} pens cost $${second}, what does one pen cost?`, `$${round2(second / first)}`],
            [`Complete the equivalent ratio ${first} : ${second} = ${first * 3} : __`, second * 3],
        ]);
    }),

    band(5, 8, () => {
        const value = round2(between(15, 95) / 10);
        return task([
            [`Round ${value} to the nearest whole number.`, Math.round(value)],
            [`Write ${value} as a mixed number.`, `${Math.floor(value)} ${simplify(Math.round((value % 1) * 10), 10)}`],
            [`Multiply ${value} by 10.`, round2(value * 10)],
            [`Divide ${value} by 10.`, round2(value / 10)],
        ]);
    }),

    band(6, 9, () => {
        const a = between(-12, -2);
        const b = between(2, 12);
        return task([
            [`${a} + ${b} = __`, a + b],
            [`${a} - (${b}) = __`, a - b],
            [`${a} × ${b} = __`, a * b],
            [`Which is greater, ${a} or ${-b}?`, Math.max(a, -b)],
        ]);
    }),

    band(7, 9, () => {
        const base = between(2, 6);
        const first = between(2, 4);
        const second = between(2, 4);
        return task([
            [`${base}^${first} × ${base}^${second} = ${base}^__`, first + second],
            [`${base}^${first + second} ÷ ${base}^${second} = ${base}^__`, first],
            [`Evaluate ${base}^${first}.`, Math.pow(base, first)],
            [`Write ${Math.pow(base, first)} as a power of ${base}.`, `${base}^${first}`],
        ]);
    }),

    band(7, 9, () => {
        const digits = between(1, 9) + between(0, 9) / 10;
        const power = between(3, 6);
        return task([
            [`Write ${round2(digits * Math.pow(10, power))} in scientific notation.`, `${round2(digits)} × 10^${power}`],
            [`Write ${round2(digits)} × 10^${power} in standard form.`, round2(digits * Math.pow(10, power))],
            [`How many places does the decimal point move to write ${round2(digits)} × 10^${power} in standard form?`, power],
        ]);
    }),

    band(7, 9, () => {
        const root = between(2, 12);
        const square = root * root;
        return task([
            [`√${square} = __`, root],
            [`Between which two whole numbers does √${square + 3} lie?`, `${root} and ${root + 1}`],
            [`What is ${root} squared?`, square],
            [`Is √${square + 3} rational or irrational?`, 'irrational'],
        ]);
    }),

    band(9, 12, () => {
        const base = between(2, 5);
        const exponent = between(2, 4);
        return task([
            [`Write ${base}^(1/${exponent}) in radical form.`, `the ${exponent}th root of ${base}`],
            [`Evaluate ${Math.pow(base, exponent)}^(1/${exponent}).`, base],
            [`Simplify ${base}^${exponent} × ${base}^(-${exponent}).`, 1],
            [`Write ${base}^(-${exponent}) as a fraction.`, `1/${Math.pow(base, exponent)}`],
        ]);
    }),

    band(9, 12, () => {
        const inner = pick([8, 12, 18, 20, 27, 32, 45, 50, 75]);
        let outer = 1;
        let rest = inner;
        for (let f = 2; f * f <= rest; f += 1) {
            while (rest % (f * f) === 0) { outer *= f; rest /= f * f; }
        }
        return task([
            [`Simplify √${inner}.`, rest === 1 ? `${outer}` : `${outer}√${rest}`],
            [`Write √${inner} as a decimal to two places.`, round2(Math.sqrt(inner))],
            [`What is the largest perfect square that divides ${inner}?`, outer * outer],
        ]);
    }),

    band(9, 12, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Simplify (${a}/${b}) ÷ (${b}/${a}).`, simplify(a * a, b * b)],
            [`Write the reciprocal of ${a}/${b}.`, `${b}/${a}`],
            [`Is ${a}/${b} a terminating or repeating decimal?`, (() => { let d = b / gcd(a, b); while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1 ? 'terminating' : 'repeating'; })()],
        ]);
    }),

    band(9, 12, () => {
        const value = between(3, 15);
        return task([
            [`Solve |x| = ${value}.`, `x = ${value} or x = -${value}`],
            [`Evaluate |-${value}| + |${value}|.`, value * 2],
            [`Write the distance between ${value} and -${value} on a number line.`, value * 2],
        ]);
    }),

    band(9, 12, () => {
        const first = between(2, 9);
        const difference = between(2, 7);
        return task([
            [`An arithmetic sequence starts at ${first} and adds ${difference}. What is the 10th term?`, first + difference * 9],
            [`Write the general term of the sequence ${first}, ${first + difference}, ${first + difference * 2}, ...`, `${difference}n + ${first - difference}`],
            [`Find the sum of the first 10 terms of the sequence starting at ${first} with common difference ${difference}.`, (10 * (2 * first + 9 * difference)) / 2],
        ]);
    }),

    band(9, 12, () => {
        const first = between(2, 5);
        const ratio = between(2, 4);
        return task([
            [`A geometric sequence starts at ${first} with ratio ${ratio}. What is the 5th term?`, first * Math.pow(ratio, 4)],
            [`Write the general term of ${first}, ${first * ratio}, ${first * ratio * ratio}, ...`, `${first} × ${ratio}^(n-1)`],
            [`What is the common ratio of ${first}, ${first * ratio}, ${first * ratio * ratio}?`, ratio],
        ]);
    }),

    band(9, 12, () => {
        const low = between(-8, 2);
        const high = low + between(3, 9);
        return task([
            [`Write the interval ${low} < x < ${high} in interval notation.`, `(${low}, ${high})`],
            [`Write the interval ${low} ≤ x ≤ ${high} in interval notation.`, `[${low}, ${high}]`],
            [`How many integers satisfy ${low} < x < ${high}?`, high - low - 1],
        ]);
    }),

    band(3, 5, () => {
        const a = between(12, 99);
        const b = between(2, 9);
        return task([
            [`${a} × ${b} = __`, a * b],
            [`${a * b} ÷ ${b} = __`, a],
            [`Estimate ${a} × ${b} by rounding ${a} to the nearest ten.`, Math.round(a / 10) * 10 * b],
            [`Is ${a} × ${b} greater or less than ${Math.round(a / 10) * 10 * b}?`, a * b > Math.round(a / 10) * 10 * b ? 'greater' : (a * b < Math.round(a / 10) * 10 * b ? 'less' : 'equal')],
        ]);
    }),

    band(3, 5, () => {
        const total = between(20, 90);
        const groups = pick([3, 4, 5, 6]);
        const each = Math.floor(total / groups);
        return task([
            [`Divide ${total} by ${groups}. Give the quotient and remainder.`, `${each} remainder ${total - each * groups}`],
            [`${total} pencils are packed ${groups} to a box. How many full boxes?`, each],
            [`${total} pencils are packed ${groups} to a box. How many pencils are left over?`, total - each * groups],
        ]);
    }),

    band(3, 5, () => {
        const denominator = pick([4, 6, 8, 10, 12]);
        const first = between(1, denominator - 2);
        const second = between(1, denominator - first - 1);
        return task([
            [`${first}/${denominator} + ${second}/${denominator} = __`, simplify(first + second, denominator)],
            [`${first + second}/${denominator} - ${second}/${denominator} = __`, simplify(first, denominator)],
            [`Write ${first}/${denominator} in simplest form.`, simplify(first, denominator)],
            [`Is ${first}/${denominator} greater or less than one half?`, first / denominator > 0.5 ? 'greater' : (first / denominator < 0.5 ? 'less' : 'equal')],
        ]);
    }),

    band(4, 6, () => {
        const whole = between(2, 9);
        const tenths = between(1, 9);
        const value = round2(whole + tenths / 10);
        return task([
            [`Write ${value} in words.`, `${whole} and ${tenths} tenths`],
            [`What digit is in the tenths place of ${value}?`, tenths],
            [`Round ${value} to the nearest whole number.`, Math.round(value)],
            [`${value} + ${value} = __`, round2(value * 2)],
        ]);
    }),

    band(4, 6, () => {
        const a = between(2, 12);
        const b = between(2, 12);
        return task([
            [`Write ${a} × ${b} as a repeated addition.`, `${b} added ${a} times`],
            [`What is ${a} squared?`, a * a],
            [`Find the missing factor: ${a} × __ = ${a * b}`, b],
            [`Is ${a * b} divisible by ${a}? Write yes or no.`, 'yes'],
        ]);
    }),
    band(1, 3, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Is ${a} + ${b} equal to ${a + b}? Write true or false.`, 'true'],
            [`Is ${a} + ${b} equal to ${a + b + 1}? Write true or false.`, 'false'],
            [`Fill in the sign to make it true: ${a} + ${b} __ ${a + b}`, '='],
            [`Write a number sentence using ${a}, ${b} and ${a + b}.`, `${a} + ${b} = ${a + b}`],
        ]);
    }),

    band(1, 3, () => {
        const a = between(1, 8);
        const b = between(1, 8);
        const c = between(1, 8);
        return task([
            [`Which of ${a}, ${b} and ${c} is the largest?`, Math.max(a, b, c)],
            [`Which of ${a}, ${b} and ${c} is the smallest?`, Math.min(a, b, c)],
            [`Add ${a}, ${b} and ${c}.`, a + b + c],
            [`Order ${a}, ${b} and ${c} from largest to smallest.`, [a, b, c].sort((x, y) => y - x).join(', ')],
        ]);
    }),

    band(1, 3, () => {
        const marker = pick([0, 5, 10, 15, 20]);
        const step = between(1, 4);
        return task([
            [`On a number line, what number is ${step} steps to the right of ${marker}?`, marker + step],
            [`On a number line, what number is ${step} steps to the left of ${marker + step}?`, marker],
            [`How many steps from ${marker} to ${marker + step} on a number line?`, step],
            [`Which number is halfway between ${marker} and ${marker + 10}?`, marker + 5],
        ]);
    }),

    band(2, 4, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Is the sum of ${a} and ${b} odd or even?`, (a + b) % 2 === 0 ? 'even' : 'odd'],
            [`Is the product of ${a} and ${b} odd or even?`, (a * b) % 2 === 0 ? 'even' : 'odd'],
            [`Write the fact family for ${a}, ${b} and ${a + b}.`, `${a} + ${b} = ${a + b}, ${b} + ${a} = ${a + b}, ${a + b} - ${a} = ${b}, ${a + b} - ${b} = ${a}`],
            [`How many more is ${a + b} than ${a}?`, b],
        ]);
    }),

    band(2, 4, () => {
        const hundreds = between(1, 9);
        const tens = between(0, 9);
        const ones = between(0, 9);
        const value = hundreds * 100 + tens * 10 + ones;
        return task([
            [`How many hundreds are in ${value}?`, hundreds],
            [`Write ${value} in expanded form.`, `${hundreds * 100} + ${tens * 10} + ${ones}`],
            [`What is ${value} plus 100?`, value + 100],
            [`Round ${value} to the nearest hundred.`, Math.round(value / 100) * 100],
        ]);
    }),

    band(1, 3, () => {
        const a = between(2, 9);
        return task([
            [`How many groups of 2 are in ${a * 2}?`, a],
            [`How many groups of 5 are in ${a * 5}?`, a],
            [`Share ${a * 3} equally into 3 groups. How many in each?`, a],
            [`${a * 4} counters are put into groups of 4. How many groups?`, a],
        ]);
    }),

    band(1, 3, () => {
        const a = between(11, 19);
        return task([
            [`Break ${a} into 10 and some more. How many more?`, a - 10],
            [`${a} - 10 = __`, a - 10],
            [`10 + __ = ${a}`, a - 10],
            [`Is ${a} closer to 10 or 20?`, a - 10 < 20 - a ? '10' : (a - 10 > 20 - a ? '20' : 'the same')],
        ]);
    }),

    band(2, 5, () => {
        const a = between(100, 900);
        return task([
            [`What is 10 more than ${a}?`, a + 10],
            [`What is 100 more than ${a}?`, a + 100],
            [`What is 100 less than ${a}?`, a - 100],
            [`Which digit of ${a} is in the hundreds place?`, Math.floor(a / 100)],
        ]);
    }),

    band(4, 8, () => {
        const a = between(2, 12);
        const b = between(2, 12);
        return task([
            [`Find the product of ${a} and ${b}.`, a * b],
            [`Find the quotient of ${a * b} and ${b}.`, a],
            [`Find the difference between ${a * b} and ${a + b}.`, a * b - (a + b)],
            [`Is ${a * b} a multiple of ${a}? Write yes or no.`, 'yes'],
            [`Write ${a * b} as a product of two factors other than 1.`, `${a} × ${b}`],
        ]);
    }),

    band(4, 8, () => {
        const numerator = between(1, 8);
        const denominator = between(numerator + 1, 12);
        const multiplier = between(2, 5);
        return task([
            [`Write a fraction equivalent to ${numerator}/${denominator}.`, `${numerator * multiplier}/${denominator * multiplier}`],
            [`Simplify ${numerator * multiplier}/${denominator * multiplier}.`, simplify(numerator, denominator)],
            [`Is ${numerator}/${denominator} a proper or improper fraction?`, 'proper'],
            [`Write ${numerator}/${denominator} as a decimal to two places.`, round2(numerator / denominator)],
            [`Order ${numerator}/${denominator} and 1/2 from smallest.`, numerator / denominator < 0.5 ? `${numerator}/${denominator}, 1/2` : `1/2, ${numerator}/${denominator}`],
        ]);
    }),

    band(4, 8, () => {
        const a = round2(between(11, 99) / 10);
        const b = round2(between(11, 99) / 10);
        return task([
            [`${a} + ${b} = __`, round2(a + b)],
            [`${round2(a + b)} - ${b} = __`, a],
            [`${a} × 10 = __`, round2(a * 10)],
            [`Round ${a} to the nearest tenth.`, round2(a)],
            [`Which is larger, ${a} or ${b}?`, a > b ? a : (b > a ? b : 'they are equal')],
        ]);
    }),

    band(5, 9, () => {
        const whole = between(20, 200);
        const percent = pick([5, 15, 30, 40, 60, 75]);
        return task([
            [`Find ${percent}% of ${whole}.`, round2((whole * percent) / 100)],
            [`${round2((whole * percent) / 100)} is what percent of ${whole}?`, `${percent}%`],
            [`${round2((whole * percent) / 100)} is ${percent}% of what number?`, whole],
            [`Write ${percent}% as a fraction in lowest terms.`, simplify(percent, 100)],
            [`Write ${percent}% as a decimal.`, round2(percent / 100)],
        ]);
    }),

    band(6, 10, () => {
        const a = between(-15, -2);
        const b = between(2, 15);
        return task([
            [`${a} - ${b} = __`, a - b],
            [`${a} ÷ ${pick([-1, 1])} = __ . Give both possible answers.`, `${a} or ${-a}`],
            [`Order ${a}, 0 and ${b} from least to greatest.`, `${a}, 0, ${b}`],
            [`What is the absolute value of ${a}?`, Math.abs(a)],
            [`How far apart are ${a} and ${b} on a number line?`, b - a],
        ]);
    }),

    band(6, 10, () => {
        const first = between(2, 9);
        const second = between(2, 9);
        const total = first + second;
        const amount = total * between(2, 9);
        return task([
            [`Share $${amount} in the ratio ${first} : ${second}. What is the larger share?`, `$${(amount / total) * Math.max(first, second)}`],
            [`Share $${amount} in the ratio ${first} : ${second}. What is the smaller share?`, `$${(amount / total) * Math.min(first, second)}`],
            [`In the ratio ${first} : ${second}, what fraction is the first part?`, simplify(first, total)],
            [`Write the ratio ${first * 3} : ${second * 3} in simplest form.`, `${simplify(first, second).includes('/') ? `${first} : ${second}` : `${first} : ${second}`}`],
        ]);
    }),

    band(7, 11, () => {
        const base = between(2, 5);
        const exponent = between(2, 5);
        return task([
            [`Evaluate ${base}^${exponent}.`, Math.pow(base, exponent)],
            [`Evaluate (-${base})^${exponent}.`, Math.pow(-base, exponent)],
            [`Is (-${base})^${exponent} positive or negative?`, exponent % 2 === 0 ? 'positive' : 'negative'],
            [`Evaluate ${base}^0.`, 1],
            [`Write ${Math.pow(base, exponent)} as a power of ${base}.`, `${base}^${exponent}`],
        ]);
    }),

    band(9, 12, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Rationalise the denominator of ${a}/√${b}.`, `${a}√${b}/${b}`],
            [`Simplify √${a * a * b}.`, `${a}√${b}`],
            [`Multiply √${a} by √${b}.`, `√${a * b}`],
            [`Is √${a} + √${b} equal to √${a + b}? Write yes or no.`, 'no'],
        ]);
    }),

    band(11, 12, () => {
        const a = between(2, 9);
        const n = between(2, 4);
        return task([
            [`Evaluate log base ${a} of ${Math.pow(a, n)}.`, n],
            [`Write ${a}^${n} = ${Math.pow(a, n)} in logarithmic form.`, `log base ${a} of ${Math.pow(a, n)} = ${n}`],
            [`Write log base ${a} of ${Math.pow(a, n)} = ${n} in exponential form.`, `${a}^${n} = ${Math.pow(a, n)}`],
            [`Evaluate log base ${a} of 1.`, 0],
            [`Evaluate log base ${a} of ${a}.`, 1],
        ]);
    }),

    band(9, 12, () => {
        const first = between(2, 9);
        const ratio = pick([2, 3, 0.5]);
        return task([
            [`Is the sequence ${first}, ${round2(first * ratio)}, ${round2(first * ratio * ratio)} arithmetic or geometric?`, 'geometric'],
            [`Find the common ratio of ${first}, ${round2(first * ratio)}, ${round2(first * ratio * ratio)}.`, ratio],
            [`Find the next term of ${first}, ${round2(first * ratio)}, ${round2(first * ratio * ratio)}.`, round2(first * ratio * ratio * ratio)],
            [`Does the geometric series with ratio ${ratio} converge? Write yes or no.`, Math.abs(ratio) < 1 ? 'yes' : 'no'],
        ]);
    }),

    band(9, 12, () => {
        const percent = pick([3, 4, 5, 6]);
        const years = between(2, 10);
        const principal = pick([1000, 2500, 5000]);
        const compound = round2(principal * Math.pow(1 + percent / 100, years));
        return task([
            [`Find the simple interest on $${principal} at ${percent}% for ${years} years.`, `$${round2((principal * percent * years) / 100)}`],
            [`Find the value of $${principal} compounded annually at ${percent}% for ${years} years.`, `$${compound}`],
            [`How much more does compounding earn than simple interest on $${principal} at ${percent}% over ${years} years?`, `$${round2(compound - principal - (principal * percent * years) / 100)}`],
            [`Write the growth factor for ${percent}% annual growth.`, round2(1 + percent / 100)],
        ]);
    }),

    band(3, 6, () => {
        const a = between(100, 999);
        const b = between(100, 999);
        return task([
            [`${a} + ${b} = __`, a + b],
            [`Which is larger, ${a} or ${b}?`, Math.max(a, b)],
            [`Round ${a} to the nearest ten.`, Math.round(a / 10) * 10],
            [`What is the difference between ${Math.max(a, b)} and ${Math.min(a, b)}?`, Math.abs(a - b)],
        ]);
    }),

    band(6, 9, () => {
        const a = between(2, 12);
        const b = between(2, 12);
        const c = between(2, 6);
        return task([
            [`Evaluate ${a} + ${b} × ${c} - ${a}.`, a + b * c - a],
            [`Evaluate ${a}² - ${b}.`, a * a - b],
            [`Evaluate (${a} + ${b})² .`, (a + b) * (a + b)],
            [`Is (${a} + ${b})² equal to ${a}² + ${b}²? Write yes or no.`, 'no'],
        ]);
    }),

    band(9, 12, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Simplify (${a}x)(${b}x).`, `${a * b}x²`],
            [`Simplify ${a * b}x² ÷ ${a}x.`, `${b}x`],
            [`Expand ${a}(x + ${b}).`, `${a}x + ${a * b}`],
            [`Factor ${a}x + ${a * b}.`, `${a}(x + ${b})`],
            [`Evaluate ${a}x + ${b} when x = 2.`, a * 2 + b],
        ]);
    }),

    band(9, 12, () => {
        const a = between(2, 9);
        return task([
            [`Write 0.${a}${a}${a}... as a fraction.`, simplify(a, 9)],
            [`Write ${a}/9 as a repeating decimal.`, `0.${a} repeating`],
            [`Is ${a}/9 rational or irrational?`, 'rational'],
            [`Is π rational or irrational?`, 'irrational'],
            [`Give a number between ${a}/9 and ${a + 1 <= 9 ? `${a + 1}/9` : '1'}.`, round2((a / 9 + Math.min((a + 1) / 9, 1)) / 2)],
        ]);
    }),

    band(9, 12, () => {
        const principal = pick([200, 450, 800]);
        const percent = pick([8, 12, 15, 20]);
        return task([
            [`A price of $${principal} rises by ${percent}%. Find the new price.`, `$${round2(principal * (1 + percent / 100))}`],
            [`A price of $${principal} falls by ${percent}%. Find the new price.`, `$${round2(principal * (1 - percent / 100))}`],
            [`A price rose from $${principal} to $${round2(principal * (1 + percent / 100))}. Find the percent increase.`, `${percent}%`],
            [`A price rises ${percent}% then falls ${percent}%. Is it back to $${principal}? Write yes or no.`, 'no'],
        ]);
    }),

    band(1, 5, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`What is the total of ${a} and ${b}?`, a + b],
            [`Take ${Math.min(a, b)} from ${Math.max(a, b)}.`, Math.max(a, b) - Math.min(a, b)],
            [`Which number added to ${a} gives ${a + b}?`, b],
            [`Write ${a + b} as the sum of two numbers.`, `${a} + ${b}`],
        ]);
    }),

    band(4, 8, () => {
        const a = between(11, 40);
        const b = between(2, 9);
        return task([
            [`Find the remainder when ${a} is divided by ${b}.`, a % b],
            [`Is ${a} divisible by ${b}? Write yes or no.`, a % b === 0 ? 'yes' : 'no'],
            [`What is the next number after ${a} that is divisible by ${b}?`, a + (b - (a % b)) % b || a],
            [`List the first three multiples of ${b} above ${a}.`, `${Math.ceil((a + 1) / b) * b}, ${Math.ceil((a + 1) / b) * b + b}, ${Math.ceil((a + 1) / b) * b + b * 2}`],
        ]);
    }),

    band(4, 8, () => {
        const parts = pick([3, 4, 5, 6]);
        const each = between(2, 9);
        return task([
            [`A pizza is cut into ${parts} equal slices. What fraction is ${each % parts || parts} slices?`, simplify(each % parts || parts, parts)],
            [`${parts} friends share ${parts * each} sweets equally. How many each?`, each],
            [`What is ${parts}/${parts}?`, 1],
            [`How many ${parts}ths make 2 wholes?`, parts * 2],
        ]);
    }),

    band(7, 11, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Evaluate ${a}⁻¹ as a fraction.`, `1/${a}`],
            [`Evaluate (${a}/${b})⁻¹.`, `${b}/${a}`],
            [`Simplify ${a}^5 ÷ ${a}^3.`, a * a],
            [`Simplify (${a}²)³ as a power of ${a}.`, `${a}^6`],
            [`Write √${a * a} without a radical.`, a],
        ]);
    }),

    band(9, 12, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Solve ${a}x = ${a * b}.`, b],
            [`Solve x + ${a} = ${a + b}.`, b],
            [`Solve x/${a} = ${b}.`, a * b],
            [`Solve ${a}x + ${b} = ${a * b + b}.`, b],
            [`Check: does x = ${b} satisfy ${a}x = ${a * b}? Write yes or no.`, 'yes'],
        ]);
    }),

    band(9, 12, () => {
        const a = between(2, 9);
        return task([
            [`Write ${a} × 10⁻³ in standard form.`, round2(a / 1000)],
            [`Write ${round2(a / 1000)} in scientific notation.`, `${a} × 10^-3`],
            [`Multiply ${a} × 10³ by 2 × 10².`, `${a * 2} × 10^5`],
            [`Divide ${a} × 10⁶ by ${a} × 10².`, '10^4'],
            [`Which is larger, ${a} × 10³ or ${a} × 10⁻³?`, `${a} × 10^3`],
        ]);
    }),

    band(2, 6, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Is ${a} × ${b} the same as ${b} × ${a}? Write yes or no.`, 'yes'],
            [`Is ${a} - ${b} the same as ${b} - ${a}? Write yes or no.`, a === b ? 'yes' : 'no'],
            [`What must be added to ${a * b} to reach ${a * b + a}?`, a],
            [`Halve ${a * 2} and then double it. What do you get?`, a * 2],
        ]);
    }),

    band(9, 12, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Simplify ${a}/${b} + ${b}/${a} as a single fraction.`, simplify(a * a + b * b, a * b)],
            [`Simplify ${a}/${b} × ${b}/${a}.`, 1],
            [`Simplify ${a}/${b} - ${a}/${b}.`, 0],
            [`Write ${a}/${b} as a percent to two decimals.`, `${round2((a / b) * 100)}%`],
            [`Which is larger, ${a}/${b} or ${b}/${a}?`, a > b ? `${a}/${b}` : (b > a ? `${b}/${a}` : 'they are equal')],
        ]);
    }),

    band(1, 3, () => {
        const a = between(2, 9);
        return task([
            [`Count on 5 from ${a}. What number do you reach?`, a + 5],
            [`Count back 4 from ${a + 5}. What number do you reach?`, a + 1],
            [`What is 3 more than ${a}?`, a + 3],
            [`What is 3 less than ${a + 3}?`, a],
            [`Add 10 to ${a}.`, a + 10],
        ]);
    }),

    band(9, 12, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Estimate ${a}.${b} × ${b}.${a} by rounding each to the nearest whole number.`, Math.round(a + b / 10) * Math.round(b + a / 10)],
            [`Is ${a}.${b} × ${b}.${a} greater or less than ${a} × ${b}?`, 'greater'],
            [`Round ${a}.${b}${a} to two decimal places.`, round2(Number(`${a}.${b}${a}`))],
            [`Write ${a}.${b} as an improper fraction.`, `${a * 10 + b}/10`],
            [`Multiply ${a}.${b} by 100.`, Number(`${a}.${b}`) * 100],
        ]);
    }),
    band(1, 3, () => {
        const a = between(1, 6);
        const b = between(1, 6);
        return task([
            [`There are ${a} red and ${b} blue counters. How many in all?`, a + b],
            [`There are ${a + b} counters and ${a} are red. How many are blue?`, b],
            [`Are there more red or blue if there are ${a} red and ${b} blue?`, a > b ? 'red' : (b > a ? 'blue' : 'the same')],
            [`Put ${a} counters in one hand and ${b} in the other. How many altogether?`, a + b],
        ]);
    }),

    band(1, 3, () => {
        const a = between(1, 9);
        return task([
            [`Write the number that is 1 bigger than ${a}.`, a + 1],
            [`Write the number that is 2 smaller than ${a + 2}.`, a],
            [`Say the numbers from ${a} to ${a + 3}. How many did you say?`, 4],
            [`Which number is missing: ${a}, __, ${a + 2}?`, a + 1],
            [`Is ${a} bigger or smaller than 5?`, a > 5 ? 'bigger' : (a < 5 ? 'smaller' : 'the same')],
        ]);
    }),
];

/* ------------------------------------------------------------ geometry */

const SHAPE_SIDES = {
    triangle: 3, square: 4, rectangle: 4, rhombus: 4, trapezoid: 4,
    pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8,
};

const SOLIDS = {
    cube: { faces: 6, edges: 12, vertices: 8 },
    'rectangular prism': { faces: 6, edges: 12, vertices: 8 },
    'triangular prism': { faces: 5, edges: 9, vertices: 6 },
    'square pyramid': { faces: 5, edges: 8, vertices: 5 },
    cylinder: { faces: 3, edges: 2, vertices: 0 },
    cone: { faces: 2, edges: 1, vertices: 1 },
};

const geometry = [
    band(1, 3, () => {
        const name = pick(Object.keys(SHAPE_SIDES));
        const sides = SHAPE_SIDES[name];
        return task([
            [`How many sides does a ${name} have?`, sides],
            [`How many corners does a ${name} have?`, sides],
            [`Name a shape that has ${sides} sides.`, name],
            [`Does a ${name} have more sides than a triangle? Write yes or no.`, sides > 3 ? 'yes' : 'no'],
        ]);
    }),

    band(1, 3, () => {
        const name = pick(Object.keys(SOLIDS));
        const solid = SOLIDS[name];
        return task([
            [`How many faces does a ${name} have?`, solid.faces],
            [`How many edges does a ${name} have?`, solid.edges],
            [`How many vertices does a ${name} have?`, solid.vertices],
            [`Name a solid that has ${solid.faces} faces.`, name],
        ]);
    }),

    band(1, 3, () => {
        const LINES = { circle: 'infinitely many', square: 4, rectangle: 2, 'equilateral triangle': 3, hexagon: 6 };
        const name = pick(Object.keys(LINES));
        return task([
            [`How many lines of symmetry does a ${name} have?`, LINES[name]],
            [`Does a ${name} have at least one line of symmetry? Write yes or no.`, 'yes'],
            [`Fold a ${name} in half so the two parts match. What is the fold line called?`, 'a line of symmetry'],
        ]);
    }),

    band(1, 3, () => {
        const a = between(2, 6);
        const b = between(2, 6);
        return task([
            [`A picture is made from ${a} triangles and ${b} squares. How many shapes were used in all?`, a + b],
            [`A picture has ${a} triangles and ${a + b} squares. How many more squares than triangles?`, b],
            [`How many corners are there altogether on ${a} triangles?`, a * 3],
            [`How many sides are there altogether on ${b} squares?`, b * 4],
        ]);
    }),

    band(1, 3, () => {
        const rows = between(2, 5);
        const columns = between(2, 5);
        return task([
            [`A floor is ${rows} tiles across and ${columns} tiles down. How many tiles in all?`, rows * columns],
            [`A rectangle is built from squares, ${rows} across and ${columns} down. How many squares are in one row?`, rows],
            [`How many squares are in one column of a ${rows} by ${columns} rectangle?`, columns],
        ]);
    }),

    band(1, 3, () => {
        const shape = pick(['square', 'rectangle', 'triangle', 'circle']);
        return task([
            [`Is a ${shape} a flat shape or a solid?`, 'a flat shape'],
            [`Name a solid that has a ${shape} face.`, shape === 'circle' ? 'a cylinder' : (shape === 'triangle' ? 'a triangular prism' : 'a cube')],
            [`Which has fewer sides, a triangle or a ${shape}?`, shape === 'circle' ? 'a circle has no straight sides' : (SHAPE_SIDES[shape] > 3 ? 'the triangle' : 'they are the same')],
        ]);
    }),

    band(2, 4, () => {
        const side = between(2, 12);
        return task([
            [`What is the perimeter of a square with side ${side} cm?`, `${side * 4} cm`],
            [`A square has perimeter ${side * 4} cm. How long is one side?`, `${side} cm`],
            [`What is the area of a square with side ${side} cm?`, `${side * side} cm²`],
            [`A square has area ${side * side} cm². How long is one side?`, `${side} cm`],
        ]);
    }),

    band(3, 6, () => {
        const length = between(3, 15);
        const width = between(2, 12);
        return task([
            [`Find the perimeter of a rectangle ${length} cm by ${width} cm.`, `${(length + width) * 2} cm`],
            [`Find the area of a rectangle ${length} cm by ${width} cm.`, `${length * width} cm²`],
            [`A rectangle has area ${length * width} cm² and width ${width} cm. Find its length.`, `${length} cm`],
            [`A rectangle has perimeter ${(length + width) * 2} cm and length ${length} cm. Find its width.`, `${width} cm`],
        ]);
    }),

    band(3, 6, () => {
        const angle = pick([30, 45, 60, 90, 120, 135, 150]);
        const kind = angle < 90 ? 'acute' : angle === 90 ? 'right' : 'obtuse';
        return task([
            [`Is a ${angle}° angle acute, right or obtuse?`, kind],
            [`What angle completes ${angle}° to a straight angle?`, `${180 - angle}°`],
            [`What angle completes ${angle}° to a full turn?`, `${360 - angle}°`],
            [`How many ${angle}° angles fit in a full turn?`, round2(360 / angle)],
        ]);
    }),

    band(3, 6, () => {
        const base = between(4, 16);
        const height = between(3, 12);
        return task([
            [`Find the area of a triangle with base ${base} cm and height ${height} cm.`, `${round2((base * height) / 2)} cm²`],
            [`A triangle has area ${round2((base * height) / 2)} cm² and base ${base} cm. Find its height.`, `${height} cm`],
            [`Find the area of a parallelogram with base ${base} cm and height ${height} cm.`, `${base * height} cm²`],
            [`How does the area of a triangle compare with a parallelogram on the same base and height?`, 'it is half'],
        ]);
    }),

    band(3, 6, () => {
        const first = between(30, 80);
        const second = between(30, 80);
        const third = 180 - first - second;
        const largest = Math.max(first, second, third);
        return task([
            [`Two angles of a triangle are ${first}° and ${second}°. Find the third.`, `${third}°`],
            [`A triangle has angles ${first}°, ${second}° and ${third}°. Is it acute, right or obtuse?`, largest > 90 ? 'obtuse' : (largest === 90 ? 'right' : 'acute')],
            [`Three angles of a quadrilateral are ${first}°, ${second}° and 90°. Find the fourth.`, `${360 - first - second - 90}°`],
        ]);
    }),

    band(3, 6, () => {
        const units = between(2, 8);
        const turn = pick([90, 180, 270]);
        return task([
            [`A shape slides ${units} units to the right. Name this transformation.`, 'a translation'],
            [`A shape is flipped over a line. Name this transformation.`, 'a reflection'],
            [`A shape turns ${turn}° about a point. Name this transformation.`, 'a rotation'],
            [`Does a translation change the size of a shape? Write yes or no.`, 'no'],
        ]);
    }),

    band(4, 7, () => {
        const x = between(1, 9);
        const y = between(1, 9);
        return task([
            [`Point A is at (${x}, ${y}). What is its x-coordinate?`, x],
            [`Point A is at (${x}, ${y}). Move it 3 right and 2 up. Where is it now?`, `(${x + 3}, ${y + 2})`],
            [`In which quadrant is the point (${-x}, ${y})?`, 'the second'],
            [`Reflect (${x}, ${y}) in the x-axis.`, `(${x}, ${-y})`],
            [`Reflect (${x}, ${y}) in the y-axis.`, `(${-x}, ${y})`],
        ]);
    }),

    band(5, 8, () => {
        const length = between(3, 10);
        const width = between(2, 8);
        const height = between(2, 8);
        return task([
            [`Find the volume of a box ${length} by ${width} by ${height} cm.`, `${length * width * height} cm³`],
            [`Find the surface area of a box ${length} by ${width} by ${height} cm.`, `${2 * (length * width + length * height + width * height)} cm²`],
            [`A box has volume ${length * width * height} cm³ and a base ${length} by ${width} cm. Find its height.`, `${height} cm`],
            [`How many faces does a box have to be covered when finding surface area?`, 6],
        ]);
    }),

    band(6, 9, () => {
        const radius = between(2, 12);
        return task([
            [`Find the circumference of a circle with radius ${radius} cm. Use π = 3.14.`, `${round2(2 * 3.14 * radius)} cm`],
            [`Find the area of a circle with radius ${radius} cm. Use π = 3.14.`, `${round2(3.14 * radius * radius)} cm²`],
            [`A circle has diameter ${radius * 2} cm. What is its radius?`, `${radius} cm`],
            [`A circle has circumference ${round2(2 * 3.14 * radius)} cm. Find its diameter. Use π = 3.14.`, `${radius * 2} cm`],
        ]);
    }),

    band(6, 9, () => {
        const angle = between(20, 70);
        return task([
            [`Find the complement of ${angle}°.`, `${90 - angle}°`],
            [`Find the supplement of ${angle}°.`, `${180 - angle}°`],
            [`Two parallel lines are cut by a transversal and one angle is ${angle}°. Find its co-interior angle.`, `${180 - angle}°`],
            [`Two parallel lines are cut by a transversal and one angle is ${angle}°. Find its alternate angle.`, `${angle}°`],
        ]);
    }),

    band(7, 10, () => {
        const sides = between(5, 12);
        return task([
            [`Find the sum of the interior angles of a ${sides}-sided polygon.`, `${(sides - 2) * 180}°`],
            [`Find one interior angle of a regular ${sides}-sided polygon.`, `${round2(((sides - 2) * 180) / sides)}°`],
            [`Find one exterior angle of a regular ${sides}-sided polygon.`, `${round2(360 / sides)}°`],
            [`A regular polygon has exterior angle ${round2(360 / sides)}°. How many sides does it have?`, sides],
        ]);
    }),

    band(9, 12, () => {
        const x1 = between(-8, 4);
        const y1 = between(-8, 4);
        const x2 = x1 + between(2, 8);
        const y2 = y1 + between(2, 8);
        return task([
            [`Find the midpoint of (${x1}, ${y1}) and (${x2}, ${y2}).`, `(${round2((x1 + x2) / 2)}, ${round2((y1 + y2) / 2)})`],
            [`Find the distance between (${x1}, ${y1}) and (${x2}, ${y2}) to two decimal places.`, round2(Math.hypot(x2 - x1, y2 - y1))],
            [`Find the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`, simplify(y2 - y1, x2 - x1)],
            [`Is the line through (${x1}, ${y1}) and (${x2}, ${y2}) increasing or decreasing?`, 'increasing'],
        ]);
    }),

    band(9, 12, () => {
        const h = between(-6, 6);
        const k = between(-6, 6);
        const r = between(2, 9);
        return task([
            [`Write the equation of the circle with centre (${h}, ${k}) and radius ${r}.`, `(x - ${h})² + (y - ${k})² = ${r * r}`],
            [`A circle has equation (x - ${h})² + (y - ${k})² = ${r * r}. What is its centre?`, `(${h}, ${k})`],
            [`A circle has equation (x - ${h})² + (y - ${k})² = ${r * r}. What is its radius?`, r],
            [`Find the area of the circle (x - ${h})² + (y - ${k})² = ${r * r}, in terms of π.`, `${r * r}π`],
        ]);
    }),

    band(9, 12, () => {
        const scale = between(2, 5);
        const side = between(3, 9);
        return task([
            [`Two similar triangles have scale factor ${scale}. A ${side} cm side on the small triangle matches what length on the large one?`, `${side * scale} cm`],
            [`Two similar figures have scale factor ${scale}. How many times as large is the area?`, scale * scale],
            [`Two similar solids have scale factor ${scale}. How many times as large is the volume?`, scale * scale * scale],
            [`Two similar triangles have areas in the ratio ${scale * scale} : 1. What is their scale factor?`, `${scale} : 1`],
        ]);
    }),

    band(9, 12, () => {
        const a = between(3, 12);
        const b = between(3, 12);
        const c = round2(Math.hypot(a, b));
        return task([
            [`A right triangle has legs ${a} and ${b}. Find the hypotenuse to two decimal places.`, c],
            [`A right triangle has hypotenuse ${c} and one leg ${a}. Find the other leg.`, b],
            [`Is a triangle with sides ${a}, ${b} and ${c} right-angled? Write yes or no.`, 'yes'],
            [`Find the area of a right triangle with legs ${a} and ${b}.`, round2((a * b) / 2)],
        ]);
    }),

    band(9, 12, () => {
        const m = between(2, 5) * pick([1, -1]);
        const b = between(-8, 8);
        return task([
            [`Write the equation of the line with slope ${m} through (0, ${b}).`, `y = ${m}x + ${b}`],
            [`What is the slope of a line perpendicular to y = ${m}x + ${b}?`, m > 0 ? `-1/${m}` : `1/${Math.abs(m)}`],
            [`Where does y = ${m}x + ${b} cross the x-axis?`, `(${round2(-b / m)}, 0)`],
            [`Are y = ${m}x + ${b} and y = ${m}x - ${b} parallel? Write yes or no.`, 'yes'],
        ]);
    }),

    band(4, 6, () => {
        const length = between(4, 12);
        const width = between(2, 9);
        return task([
            [`A rectangle ${length} by ${width} is cut in half along its length. What are the new dimensions?`, `${length} by ${round2(width / 2)}`],
            [`How many squares of side 1 cm fit in a ${length} cm by ${width} cm rectangle?`, length * width],
            [`Two rectangles ${length} by ${width} are joined along a ${width} side. What is the new area?`, `${length * width * 2} cm²`],
            [`A square and a ${length} by ${width} rectangle have the same perimeter. What is the square's side?`, `${round2((length + width) / 2)} cm`],
        ]);
    }),

    band(4, 6, () => {
        const shape = pick(['rhombus', 'trapezoid', 'parallelogram', 'kite']);
        const PROPERTIES = {
            rhombus: 'all four sides equal',
            trapezoid: 'exactly one pair of parallel sides',
            parallelogram: 'two pairs of parallel sides',
            kite: 'two pairs of adjacent equal sides',
        };
        return task([
            [`Name the defining property of a ${shape}.`, PROPERTIES[shape]],
            [`How many sides does a ${shape} have?`, 4],
            [`Is every square also a ${shape}? Write yes or no.`, shape === 'rhombus' || shape === 'parallelogram' ? 'yes' : 'no'],
        ]);
    }),

    band(10, 12, () => {
        const a = between(2, 8);
        const b = between(2, 8);
        return task([
            [`Find the area of a triangle with vertices (0, 0), (${a}, 0) and (0, ${b}).`, round2((a * b) / 2)],
            [`Find the length of the line segment from (0, 0) to (${a}, ${b}) to two decimal places.`, round2(Math.hypot(a, b))],
            [`Find the equation of the line through (0, 0) and (${a}, ${b}).`, `y = ${simplify(b, a)}x`],
            [`Does the point (${a * 2}, ${b * 2}) lie on the line through (0, 0) and (${a}, ${b})? Write yes or no.`, 'yes'],
        ]);
    }),

    band(7, 10, () => {
        const radius = between(3, 12);
        const height = between(4, 15);
        return task([
            [`Find the volume of a cylinder with radius ${radius} and height ${height}, in terms of π.`, `${radius * radius * height}π`],
            [`Find the curved surface area of a cylinder with radius ${radius} and height ${height}, in terms of π.`, `${2 * radius * height}π`],
            [`Find the total surface area of a cylinder with radius ${radius} and height ${height}, in terms of π.`, `${2 * radius * height + 2 * radius * radius}π`],
            [`A cylinder has volume ${radius * radius * height}π and radius ${radius}. Find its height.`, height],
        ]);
    }),

    band(8, 12, () => {
        const radius = between(2, 9);
        return task([
            [`Find the volume of a sphere of radius ${radius}, in terms of π.`, `${simplify(4 * radius * radius * radius, 3)}π`],
            [`Find the surface area of a sphere of radius ${radius}, in terms of π.`, `${4 * radius * radius}π`],
            [`Find the volume of a cone with radius ${radius} and height ${radius * 3}, in terms of π.`, `${radius * radius * radius}π`],
            [`A sphere and a cylinder share radius ${radius} and the cylinder has height ${radius * 2}. Which holds more?`, 'the cylinder'],
        ]);
    }),

    band(9, 12, () => {
        const x1 = between(-6, 2);
        const y1 = between(-6, 2);
        const x2 = x1 + between(2, 7);
        const y2 = y1 + between(2, 7);
        const x3 = x1 + between(2, 7);
        const y3 = y1 - between(2, 7);
        return task([
            [`Find the perimeter of the triangle with vertices (${x1}, ${y1}), (${x2}, ${y2}) and (${x3}, ${y3}), to two decimals.`, round2(Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2) + Math.hypot(x1 - x3, y1 - y3))],
            [`Find the midpoint of the side joining (${x2}, ${y2}) and (${x3}, ${y3}).`, `(${round2((x2 + x3) / 2)}, ${round2((y2 + y3) / 2)})`],
            [`Is the segment from (${x1}, ${y1}) to (${x2}, ${y2}) longer than the one to (${x3}, ${y3})?`, Math.hypot(x2 - x1, y2 - y1) > Math.hypot(x3 - x1, y3 - y1) ? 'yes' : 'no'],
        ]);
    }),

    band(9, 12, () => {
        const a = between(2, 6);
        const b = between(2, 6);
        const c = between(1, 9);
        return task([
            [`Write ${a}x + ${b}y = ${c} in slope-intercept form.`, `y = ${simplify(-a, b)}x + ${simplify(c, b)}`],
            [`Find the y-intercept of ${a}x + ${b}y = ${c}.`, simplify(c, b)],
            [`Find the x-intercept of ${a}x + ${b}y = ${c}.`, simplify(c, a)],
            [`Is (0, ${simplify(c, b)}) on the line ${a}x + ${b}y = ${c}? Write yes or no.`, 'yes'],
        ]);
    }),

    band(9, 12, () => {
        const sides = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
        const k = between(1, 4);
        const scaled = sides.map((side) => side * k);
        return task([
            [`Is a triangle with sides ${scaled.join(', ')} right-angled? Write yes or no.`, 'yes'],
            [`Find the area of a right triangle with legs ${scaled[0]} and ${scaled[1]}.`, (scaled[0] * scaled[1]) / 2],
            [`Find the perimeter of the triangle with sides ${scaled.join(', ')}.`, scaled[0] + scaled[1] + scaled[2]],
            [`The triangle ${sides.join(', ')} is enlarged by factor ${k}. What is its new hypotenuse?`, scaled[2]],
        ]);
    }),

    band(10, 12, () => {
        const radius = between(3, 10);
        const angle = pick([30, 45, 60, 90, 120, 180]);
        return task([
            [`Find the arc length of a ${angle}° sector of radius ${radius}, in terms of π.`, `${simplify(angle * radius, 180)}π`],
            [`Find the area of a ${angle}° sector of radius ${radius}, in terms of π.`, `${simplify(angle * radius * radius, 360)}π`],
            [`What fraction of the full circle is a ${angle}° sector?`, simplify(angle, 360)],
            [`Convert ${angle}° to radians, in terms of π.`, `${simplify(angle, 180)}π`],
        ]);
    }),

    band(10, 12, () => {
        const h = between(-5, 5);
        const k = between(-5, 5);
        const a = pick([1, 2, -1, -2]);
        return task([
            [`Find the vertex of y = ${a}(x - ${h})² + ${k}.`, `(${h}, ${k})`],
            [`Does y = ${a}(x - ${h})² + ${k} open upward or downward?`, a > 0 ? 'upward' : 'downward'],
            [`Give the axis of symmetry of y = ${a}(x - ${h})² + ${k}.`, `x = ${h}`],
            [`State the range of y = ${a}(x - ${h})² + ${k}.`, a > 0 ? `y ≥ ${k}` : `y ≤ ${k}`],
        ]);
    }),

    band(10, 12, () => {
        const sides = between(3, 10);
        const side = between(2, 9);
        return task([
            [`A regular ${sides}-gon has side ${side}. Find its perimeter.`, sides * side],
            [`How many diagonals does a ${sides}-sided polygon have?`, (sides * (sides - 3)) / 2],
            [`How many triangles does a ${sides}-gon split into from one vertex?`, sides - 2],
            [`Find the central angle of a regular ${sides}-gon.`, `${round2(360 / sides)}°`],
        ]);
    }),

    band(3, 8, () => {
        const length = between(5, 20);
        const width = between(3, 15);
        const cut = between(1, Math.min(length, width) - 1);
        return task([
            [`A ${length} by ${width} rectangle has a ${cut} by ${cut} square cut from a corner. What area is left?`, `${length * width - cut * cut} square units`],
            [`Find the area of an L-shape made of a ${length} by ${width} rectangle and a ${cut} by ${cut} square.`, `${length * width + cut * cut} square units`],
            [`How many ${cut} by ${cut} squares fit inside a ${length} by ${width} rectangle?`, Math.floor(length / cut) * Math.floor(width / cut)],
            [`A rectangle ${length} by ${width} is doubled in both directions. How many times as large is the area?`, 4],
        ]);
    }),

    band(3, 8, () => {
        const sides = pick([3, 4, 5, 6, 8]);
        const side = between(2, 12);
        return task([
            [`Find the perimeter of a regular ${sides}-gon with side ${side}.`, sides * side],
            [`A regular ${sides}-gon has perimeter ${sides * side}. Find one side.`, side],
            [`How many lines of symmetry does a regular ${sides}-gon have?`, sides],
            [`What is the order of rotational symmetry of a regular ${sides}-gon?`, sides],
        ]);
    }),

    band(5, 10, () => {
        const base = between(4, 12);
        const height = between(3, 10);
        const depth = between(2, 8);
        return task([
            [`Find the volume of a triangular prism with base ${base}, height ${height} and length ${depth}.`, round2(((base * height) / 2) * depth)],
            [`Find the area of the triangular face with base ${base} and height ${height}.`, round2((base * height) / 2)],
            [`A prism has cross-section area ${round2((base * height) / 2)} and volume ${round2(((base * height) / 2) * depth)}. Find its length.`, depth],
            [`How many faces does a triangular prism have?`, 5],
        ]);
    }),

    band(10, 12, () => {
        const a = between(2, 8);
        const b = between(2, 8);
        return task([
            [`Find the equation of the line perpendicular to y = ${a}x + ${b} through the origin.`, `y = ${simplify(-1, a).replace('/-', '/')}x`.replace('--', '-')],
            [`Are y = ${a}x + ${b} and y = ${-1 / a === Math.round(-1 / a) ? -1 / a : `-1/${a}`}x perpendicular? Write yes or no.`, 'yes'],
            [`Find the angle a line of slope 1 makes with the x-axis.`, '45°'],
            [`Two lines have slopes ${a} and ${b}. Are they parallel? Write yes or no.`, a === b ? 'yes' : 'no'],
        ]);
    }),

    band(10, 12, () => {
        const r = between(2, 8);
        const h = between(-5, 5);
        return task([
            [`Find the centre and radius of x² + (y - ${h})² = ${r * r}.`, `centre (0, ${h}), radius ${r}`],
            [`Does the point (${r}, ${h}) lie on x² + (y - ${h})² = ${r * r}? Write yes or no.`, 'yes'],
            [`Find the circumference of x² + (y - ${h})² = ${r * r}, in terms of π.`, `${2 * r}π`],
            [`How far is the centre of x² + (y - ${h})² = ${r * r} from the origin?`, Math.abs(h)],
        ]);
    }),

    band(2, 5, () => {
        const across = between(2, 6);
        const down = between(2, 6);
        return task([
            [`How many squares are in a ${across} by ${down} grid?`, across * down],
            [`How many squares are on the border of a ${across} by ${down} grid?`, across * 2 + down * 2 - 4],
            [`How many squares are inside the border of a ${across} by ${down} grid?`, Math.max(0, (across - 2) * (down - 2))],
            [`A ${across} by ${down} grid is folded in half. How many squares in one half?`, round2((across * down) / 2)],
        ]);
    }),

    band(11, 12, () => {
        const a = between(2, 8);
        const b = between(2, 8);
        return task([
            [`Find the distance from the origin to (${a}, ${b}), to two decimals.`, round2(Math.hypot(a, b))],
            [`Find the angle the segment from the origin to (${a}, ${b}) makes with the x-axis, to the nearest degree.`, `${Math.round((Math.atan(b / a) * 180) / Math.PI)}°`],
            [`Write (${a}, ${b}) in polar form, to two decimals.`, `(${round2(Math.hypot(a, b))}, ${Math.round((Math.atan(b / a) * 180) / Math.PI)}°)`],
            [`Find the magnitude of the vector [${a}, ${b}], to two decimals.`, round2(Math.hypot(a, b))],
            [`Add the vectors [${a}, ${b}] and [${b}, ${a}].`, `[${a + b}, ${a + b}]`],
        ]);
    }),

    band(11, 12, () => {
        const a = between(2, 6);
        const b = between(2, 6);
        return task([
            [`Find the area of a triangle with vertices (0, 0), (${a}, 0) and (${b}, ${a}).`, round2((a * a) / 2)],
            [`Find the centroid of the triangle with vertices (0, 0), (${a}, 0) and (0, ${b}).`, `(${round2(a / 3)}, ${round2(b / 3)})`],
            [`Find the length of the median from (0, 0) to the midpoint of (${a}, 0) and (0, ${b}), to two decimals.`, round2(Math.hypot(a / 2, b / 2))],
            [`Is the triangle with vertices (0, 0), (${a}, 0) and (0, ${b}) right-angled? Write yes or no.`, 'yes'],
        ]);
    }),

    band(2, 8, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`A rectangle is ${a} by ${b}. Is it also a square? Write yes or no.`, a === b ? 'yes' : 'no'],
            [`How many right angles does a rectangle have?`, 4],
            [`A square has side ${a}. How does its perimeter compare with a ${a} by ${b} rectangle's?`, a === b ? 'they are equal' : (a * 4 > (a + b) * 2 ? 'larger' : 'smaller')],
            [`Name the shape with four equal sides and four right angles.`, 'a square'],
        ]);
    }),

    band(6, 10, () => {
        const angle = between(100, 170);
        return task([
            [`Two angles on a straight line: one is ${angle}°. Find the other.`, `${180 - angle}°`],
            [`Vertically opposite angles: one is ${angle}°. Find its pair.`, `${angle}°`],
            [`Angles around a point include ${angle}° and 90°. Find the third.`, `${360 - angle - 90}°`],
            [`Is a ${angle}° angle reflex? Write yes or no.`, angle > 180 ? 'yes' : 'no'],
        ]);
    }),

    band(10, 12, () => {
        const a = between(2, 8);
        // b must differ from a: (a, b) and (b, a) are the same point otherwise,
        // and the question would ask for the slope of a point to itself.
        const b = a <= 4 ? a + between(1, 4) : a - between(1, 4);
        return task([
            [`Find the slope of the line joining (${a}, ${b}) and (${b}, ${a}).`, -1],
            [`Is the line joining (${a}, ${b}) and (${b}, ${a}) perpendicular to y = x? Write yes or no.`, 'yes'],
            [`Find the midpoint of (${a}, ${b}) and (${b}, ${a}).`, `(${round2((a + b) / 2)}, ${round2((a + b) / 2)})`],
            [`Does the midpoint of (${a}, ${b}) and (${b}, ${a}) lie on y = x? Write yes or no.`, 'yes'],
        ]);
    }),

    band(11, 12, () => {
        const r = between(2, 9);
        const h = between(2, 9);
        return task([
            [`Find the volume of a cone with radius ${r} and height ${h}, in terms of π.`, `${simplify(r * r * h, 3)}π`],
            [`Find the slant height of a cone with radius ${r} and height ${h}, to two decimals.`, round2(Math.hypot(r, h))],
            [`Find the volume of a pyramid with a ${r} by ${r} base and height ${h}.`, round2((r * r * h) / 3)],
            [`How does a cone's volume compare with a cylinder of the same radius and height?`, 'it is one third'],
        ]);
    }),

    band(3, 8, () => {
        const a = between(3, 12);
        return task([
            [`A square has perimeter ${a * 4}. Find its area.`, a * a],
            [`A square has area ${a * a}. Find its perimeter.`, a * 4],
            [`Two squares of side ${a} are joined. Find the perimeter of the rectangle formed.`, a * 6],
            [`Two squares of side ${a} are joined. Find the area.`, a * a * 2],
        ]);
    }),

    band(10, 12, () => {
        const a = between(2, 8);
        const b = between(2, 8);
        const c = between(2, 8);
        return task([
            [`Find the surface area of a box ${a} by ${b} by ${c}.`, 2 * (a * b + a * c + b * c)],
            [`Find the length of the space diagonal of a box ${a} by ${b} by ${c}, to two decimals.`, round2(Math.sqrt(a * a + b * b + c * c))],
            [`Find the volume of a box ${a} by ${b} by ${c}.`, a * b * c],
            [`A cube has the same volume as a ${a} by ${b} by ${c} box. Find its edge to two decimals.`, round2(Math.cbrt(a * b * c))],
            [`How many edges does a rectangular box have?`, 12],
        ]);
    }),

    band(1, 4, () => {
        const name = pick(['triangle', 'square', 'rectangle', 'circle', 'hexagon']);
        return task([
            [`Does a ${name} have any curved sides? Write yes or no.`, name === 'circle' ? 'yes' : 'no'],
            [`Can a ${name} tile a floor with no gaps? Write yes or no.`, name === 'circle' ? 'no' : 'yes'],
            [`Draw a ${name}. How many corners does it have?`, name === 'circle' ? 0 : { triangle: 3, square: 4, rectangle: 4, hexagon: 6 }[name]],
            [`Is a ${name} a closed shape? Write yes or no.`, 'yes'],
        ]);
    }),

    band(11, 12, () => {
        const a = between(2, 8);
        const b = between(2, 8);
        return task([
            [`Find the dot product of [${a}, ${b}] and [${b}, ${a}].`, a * b * 2],
            [`Are [${a}, ${b}] and [${-b}, ${a}] perpendicular? Write yes or no.`, 'yes'],
            [`Find the unit vector direction of [${a}, 0].`, '[1, 0]'],
            [`Scale the vector [${a}, ${b}] by 3.`, `[${a * 3}, ${b * 3}]`],
            [`Subtract [${b}, ${a}] from [${a}, ${b}].`, `[${a - b}, ${b - a}]`],
        ]);
    }),
];

/* ------------------------------------------------- data and probability */

const CATEGORIES = ['apples', 'pears', 'plums', 'cherries', 'grapes', 'peaches'];
const COLOURS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const PETS = ['cats', 'dogs', 'fish', 'birds', 'rabbits'];

/** Mean of a list, to two decimal places. */
const meanOf = (values) => round2(values.reduce((sum, value) => sum + value, 0) / values.length);

/** Median of a list. */
function medianOf(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? round2((sorted[middle - 1] + sorted[middle]) / 2) : sorted[middle];
}

const statistics = [
    band(1, 3, () => {
        const first = between(3, 9);
        const second = between(3, 9);
        const a = pick(CATEGORIES);
        let b = pick(CATEGORIES);
        while (b === a) b = pick(CATEGORIES);
        return task([
            [`A chart shows ${first} ${a} and ${second} ${b}. How many pieces of fruit in all?`, first + second],
            [`A chart shows ${first} ${a} and ${second} ${b}. Which group has more?`, first > second ? a : (second > first ? b : 'they are equal')],
            [`A chart shows ${first} ${a} and ${second} ${b}. How many more of the larger group are there?`, Math.abs(first - second)],
            [`A chart shows ${first} ${a} and ${second} ${b}. Which group has fewer?`, first < second ? a : (second < first ? b : 'they are equal')],
        ]);
    }),

    band(1, 3, () => {
        const tallies = between(6, 20);
        return task([
            [`A tally chart shows ${tallies} marks. How many complete groups of five are there?`, Math.floor(tallies / 5)],
            [`A tally chart shows ${tallies} marks. How many single marks are left over after the groups of five?`, tallies % 5],
            [`How many tally marks are needed to show ${tallies}?`, tallies],
        ]);
    }),

    band(1, 3, () => {
        const each = pick([2, 5, 10]);
        const pictures = between(3, 8);
        return task([
            [`On a picture graph each symbol stands for ${each}. How many does ${pictures} symbols show?`, each * pictures],
            [`On a picture graph each symbol stands for ${each}. How many symbols show ${each * pictures}?`, pictures],
            [`On a picture graph each symbol stands for ${each}. How many symbols show half of ${each * pictures}?`, pictures / 2],
        ]);
    }),

    band(1, 3, () => {
        const event = pick([
            ['the sun will rise tomorrow', 'certain'],
            ['a dropped ball will fall up', 'impossible'],
            ['it will rain next week', 'likely'],
            ['you will roll a 7 on a normal number cube', 'impossible'],
            ['tomorrow is a school day', 'likely'],
        ]);
        return task([
            [`Is this certain, likely, unlikely or impossible: ${event[0]}?`, event[1]],
            [`Name something that is certain to happen today.`, 'answers will vary, for example the sun will set'],
            [`Name something that is impossible.`, 'answers will vary, for example rolling a 7 on a number cube'],
        ]);
    }),

    band(1, 3, () => {
        const pet = pick(PETS);
        const counts = [between(2, 9), between(2, 9), between(2, 9)];
        return task([
            [`A class counted ${counts[0]} ${pet}, ${counts[1]} fish and ${counts[2]} birds. Which was counted most?`, Math.max(...counts) === counts[0] ? pet : (Math.max(...counts) === counts[1] ? 'fish' : 'birds')],
            [`A class counted ${counts[0]}, ${counts[1]} and ${counts[2]} animals in three groups. How many altogether?`, counts[0] + counts[1] + counts[2]],
            [`A class counted ${counts[0]}, ${counts[1]} and ${counts[2]} animals. What is the difference between the largest and smallest group?`, Math.max(...counts) - Math.min(...counts)],
        ]);
    }),

    band(1, 3, () => {
        const colour = pick(COLOURS);
        const target = between(2, 6);
        const others = between(3, 8);
        return task([
            [`A bag holds ${target} ${colour} counters and ${others} white ones. How many counters in all?`, target + others],
            [`A bag holds ${target} ${colour} counters and ${others} white ones. Which colour are you more likely to pick?`, target > others ? colour : (others > target ? 'white' : 'both are equally likely')],
            [`A bag holds ${target} ${colour} counters and ${others} white ones. Is picking a black counter possible?`, 'no, it is impossible'],
        ]);
    }),

    band(2, 4, () => {
        const values = [between(1, 9), between(1, 9), between(1, 9), between(1, 9)];
        return task([
            [`Put these in order from least to greatest: ${values.join(', ')}`, [...values].sort((a, b) => a - b).join(', ')],
            [`What is the largest of ${values.join(', ')}?`, Math.max(...values)],
            [`What is the range of ${values.join(', ')}?`, Math.max(...values) - Math.min(...values)],
        ]);
    }),

    band(3, 6, () => {
        const values = [between(2, 20), between(2, 20), between(2, 20), between(2, 20), between(2, 20)];
        return task([
            [`Find the mean of ${values.join(', ')}.`, meanOf(values)],
            [`Find the median of ${values.join(', ')}.`, medianOf(values)],
            [`Find the range of ${values.join(', ')}.`, Math.max(...values) - Math.min(...values)],
            [`What is the sum of ${values.join(', ')}?`, values.reduce((sum, value) => sum + value, 0)],
        ]);
    }),

    band(3, 6, () => {
        const repeated = between(2, 9);
        const values = [repeated, repeated, between(10, 18), between(10, 18)];
        return task([
            [`Find the mode of ${values.join(', ')}.`, repeated],
            [`Which value appears most often in ${values.join(', ')}?`, repeated],
            [`How many values are in the set ${values.join(', ')}?`, values.length],
            [`Find the mean of ${values.join(', ')}.`, meanOf(values)],
        ]);
    }),

    band(3, 6, () => {
        const scale = pick([2, 5, 10]);
        const bars = between(3, 9);
        return task([
            [`A bar graph has a scale of ${scale} per square. A bar is ${bars} squares tall. What does it show?`, scale * bars],
            [`A bar graph has a scale of ${scale} per square. How many squares tall is a bar showing ${scale * bars}?`, bars],
            [`Why does a bar graph need a scale?`, 'so large values fit on the grid'],
        ]);
    }),

    band(4, 7, () => {
        const favourable = between(1, 5);
        const total = favourable + between(2, 7);
        return task([
            [`A bag has ${favourable} red and ${total - favourable} blue marbles. What is P(red)?`, simplify(favourable, total)],
            [`A bag has ${favourable} red and ${total - favourable} blue marbles. What is P(blue)?`, simplify(total - favourable, total)],
            [`A bag has ${favourable} red and ${total - favourable} blue marbles. What is P(not red)?`, simplify(total - favourable, total)],
            [`A bag has ${favourable} red and ${total - favourable} blue marbles. Write P(red) as a percent to the nearest whole number.`, `${Math.round((favourable / total) * 100)}%`],
        ]);
    }),

    band(4, 7, () => {
        const sides = pick([6, 8, 10, 12]);
        const target = between(1, 4);
        return task([
            [`A fair ${sides}-sided die is rolled. What is P(rolling a ${target})?`, `1/${sides}`],
            [`A fair ${sides}-sided die is rolled. What is P(rolling more than ${target})?`, simplify(sides - target, sides)],
            [`A fair ${sides}-sided die is rolled. How many outcomes are possible?`, sides],
            [`A fair ${sides}-sided die is rolled twice. How many outcomes are possible?`, sides * sides],
        ]);
    }),

    band(4, 7, () => {
        const trials = pick([20, 50, 100]);
        const hits = between(4, 15);
        return task([
            [`In ${trials} spins a spinner landed on red ${hits} times. What is the experimental probability of red?`, simplify(hits, trials)],
            [`In ${trials} spins a spinner landed on red ${hits} times. How many times did it not land on red?`, trials - hits],
            [`In ${trials} spins a spinner landed on red ${hits} times. Write the experimental probability as a percent.`, `${round2((hits / trials) * 100)}%`],
        ]);
    }),

    band(6, 9, () => {
        const values = [between(5, 15), between(5, 15), between(5, 15), between(5, 15)];
        const outlier = between(60, 90);
        const withOutlier = [...values, outlier];
        return task([
            [`Find the mean of ${values.join(', ')}.`, meanOf(values)],
            [`Find the mean of ${withOutlier.join(', ')}.`, meanOf(withOutlier)],
            [`Which value in ${withOutlier.join(', ')} is an outlier?`, outlier],
            [`Does the outlier ${outlier} pull the mean up or down?`, 'up'],
            [`Which average is less affected by the outlier ${outlier}, the mean or the median?`, 'the median'],
        ]);
    }),

    band(6, 9, () => {
        const population = pick([200, 500, 1200, 2500]);
        const sample = pick([20, 40, 50]);
        const found = between(4, 15);
        return task([
            [`In a sample of ${sample} from ${population} people, ${found} said yes. Estimate how many of the ${population} would say yes.`, Math.round((found / sample) * population)],
            [`A sample of ${sample} is taken from ${population}. What fraction of the population is sampled?`, simplify(sample, population)],
            [`Is asking only your friends a fair sample of the whole school? Write yes or no.`, 'no'],
            [`Name the kind of sample where every person has an equal chance of being chosen.`, 'a simple random sample'],
        ]);
    }),

    band(7, 10, () => {
        const first = between(2, 5);
        const second = between(2, 5);
        return task([
            [`A meal has ${first} mains and ${second} desserts. How many different meals are possible?`, first * second],
            [`A lock has ${first} letters followed by ${second} digits, with repeats allowed. How many codes use 2 letters and 1 digit?`, first * first * second],
            [`How many outcomes are there when a coin is tossed ${first} times?`, Math.pow(2, first)],
            [`A tree diagram has ${first} branches, each splitting into ${second}. How many end points are there?`, first * second],
        ]);
    }),

    band(9, 12, () => {
        const n = between(5, 9);
        const r = between(2, 3);
        const permutations = (() => { let value = 1; for (let i = 0; i < r; i += 1) value *= n - i; return value; })();
        const combinations = (() => { let f = 1; for (let i = 2; i <= r; i += 1) f *= i; return permutations / f; })();
        return task([
            [`How many ways can ${r} people be chosen from ${n} when order matters?`, permutations],
            [`How many ways can ${r} people be chosen from ${n} when order does not matter?`, combinations],
            [`Evaluate ${n}P${r}.`, permutations],
            [`Evaluate ${n}C${r}.`, combinations],
            [`How many ways can ${n} people line up?`, (() => { let value = 1; for (let i = 2; i <= n; i += 1) value *= i; return value; })()],
        ]);
    }),

    band(9, 12, () => {
        const values = [between(2, 10), between(2, 10), between(2, 10), between(2, 10), between(2, 10)];
        const mean = meanOf(values);
        const variance = round2(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
        return task([
            [`Find the mean of ${values.join(', ')}.`, mean],
            [`Find the population variance of ${values.join(', ')}.`, variance],
            [`Find the population standard deviation of ${values.join(', ')} to two decimal places.`, round2(Math.sqrt(variance))],
            [`If every value in ${values.join(', ')} increased by 5, what happens to the standard deviation?`, 'it stays the same'],
            [`If every value in ${values.join(', ')} doubled, what happens to the mean?`, 'it doubles'],
        ]);
    }),

    band(9, 12, () => {
        const strength = pick([
            [0.92, 'a strong positive correlation'],
            [0.45, 'a weak positive correlation'],
            [-0.88, 'a strong negative correlation'],
            [-0.31, 'a weak negative correlation'],
            [0.04, 'almost no correlation'],
        ]);
        return task([
            [`A scatter plot has correlation coefficient r = ${strength[0]}. Describe the relationship.`, strength[1]],
            [`A scatter plot has r = ${strength[0]}. Is the line of best fit rising or falling?`, strength[0] > 0 ? 'rising' : 'falling'],
            [`Does r = ${strength[0]} prove that one variable causes the other? Write yes or no.`, 'no'],
        ]);
    }),

    band(9, 12, () => {
        const total = pick([100, 200, 400]);
        const a = Math.round(total * 0.3);
        const b = Math.round(total * 0.25);
        return task([
            [`In a two-way table of ${total} people, ${a} are in group A. What fraction is that?`, simplify(a, total)],
            [`In a two-way table of ${total} people, ${a} are in group A and ${b} in group B, with no overlap. How many are in neither?`, total - a - b],
            [`Given ${a} of ${total} are in group A, find P(group A) as a decimal.`, round2(a / total)],
            [`Of ${total} people, ${a} are in group A and ${b} of those also read. Find P(reads given group A).`, round2(b / a)],
        ]);
    }),

    band(9, 12, () => {
        const prize = pick([10, 20, 50]);
        const chance = pick([4, 5, 10]);
        const cost = between(1, 4);
        return task([
            [`A ticket costs $${cost}. There is a 1 in ${chance} chance of winning $${prize}. Find the expected value of one ticket.`, round2(prize / chance - cost)],
            [`A game pays $${prize} with probability 1/${chance}. What is the expected payout?`, round2(prize / chance)],
            [`Is a $${cost} ticket with a 1 in ${chance} chance of $${prize} a fair game? Write yes or no.`, prize / chance === cost ? 'yes' : 'no'],
        ]);
    }),

    band(4, 6, () => {
        const values = [between(1, 6), between(1, 6), between(1, 6), between(1, 6), between(1, 6), between(1, 6)];
        return task([
            [`A line plot shows ${values.join(', ')}. How many data points are there?`, values.length],
            [`A line plot shows ${values.join(', ')}. What value occurs most often?`, (() => { const counts = {}; values.forEach((v) => { counts[v] = (counts[v] || 0) + 1; }); return Object.keys(counts).reduce((best, key) => (counts[key] > counts[best] ? key : best)); })()],
            [`A line plot shows ${values.join(', ')}. What is the total?`, values.reduce((sum, value) => sum + value, 0)],
            [`A line plot shows ${values.join(', ')}. How many points are above ${Math.min(...values)}?`, values.filter((value) => value > Math.min(...values)).length],
        ]);
    }),

    band(4, 6, () => {
        const survey = between(20, 60);
        const yes = between(5, survey - 5);
        return task([
            [`Of ${survey} students surveyed, ${yes} said yes. How many said no?`, survey - yes],
            [`Of ${survey} students surveyed, ${yes} said yes. What fraction said yes?`, simplify(yes, survey)],
            [`Of ${survey} students surveyed, ${yes} said yes. What percent said yes, to the nearest whole number?`, `${Math.round((yes / survey) * 100)}%`],
        ]);
    }),

    band(10, 12, () => {
        const mean = between(50, 80);
        const deviation = between(4, 12);
        return task([
            [`A set is normally distributed with mean ${mean} and standard deviation ${deviation}. What percent lies within one standard deviation?`, 'about 68%'],
            [`A set is normally distributed with mean ${mean} and standard deviation ${deviation}. Give the range within one standard deviation of the mean.`, `${mean - deviation} to ${mean + deviation}`],
            [`A value of ${mean + deviation * 2} comes from a set with mean ${mean} and standard deviation ${deviation}. Find its z-score.`, 2],
            [`A value has z-score -1 in a set with mean ${mean} and standard deviation ${deviation}. What is the value?`, mean - deviation],
        ]);
    }),

    band(4, 8, () => {
        const values = [between(10, 40), between(10, 40), between(10, 40), between(10, 40), between(10, 40), between(10, 40)];
        const sorted = [...values].sort((a, b) => a - b);
        return task([
            [`Find the median of ${values.join(', ')}.`, round2((sorted[2] + sorted[3]) / 2)],
            [`Find the mean of ${values.join(', ')}.`, meanOf(values)],
            [`How many values in ${values.join(', ')} are above the mean?`, values.filter((value) => value > meanOf(values)).length],
            [`Find the difference between the largest and smallest of ${values.join(', ')}.`, Math.max(...values) - Math.min(...values)],
            [`If ${Math.max(...values)} were removed from ${values.join(', ')}, would the mean rise or fall?`, 'fall'],
        ]);
    }),

    band(4, 8, () => {
        const total = pick([12, 20, 24, 30]);
        const part = between(2, total - 2);
        return task([
            [`A spinner has ${total} equal sections and ${part} are red. Find P(red).`, simplify(part, total)],
            [`A spinner has ${total} sections, ${part} red. In ${total * 2} spins, how many reds would you expect?`, part * 2],
            [`A spinner has ${total} sections, ${part} red. Find P(not red).`, simplify(total - part, total)],
            [`Do P(red) and P(not red) add to 1? Write yes or no.`, 'yes'],
        ]);
    }),

    band(6, 10, () => {
        const a = between(2, 6);
        const b = between(2, 6);
        return task([
            [`Two dice are rolled. How many outcomes are there?`, 36],
            [`Two dice are rolled. Find P(both show ${a}).`, '1/36'],
            [`Two dice are rolled. Find P(sum is ${a + b}).`, simplify(Math.min(a + b - 1, 13 - (a + b)), 36)],
            [`A coin is tossed and a die rolled. How many outcomes are there?`, 12],
        ]);
    }),

    band(9, 12, () => {
        const n = between(20, 60);
        const mean = between(40, 80);
        return task([
            [`A sample of ${n} has mean ${mean}. What is the total of all values?`, n * mean],
            [`A sample of ${n} totals ${n * mean}. What is the mean?`, mean],
            [`Adding one value of ${mean} to a sample of ${n} with mean ${mean} changes the mean how?`, 'not at all'],
            [`A sample of ${n} has mean ${mean}. A new value of ${mean + 20} is added. Does the mean rise or fall?`, 'rise'],
        ]);
    }),

    band(9, 12, () => {
        const p = pick([0.2, 0.25, 0.4, 0.5, 0.6]);
        const n = between(2, 5);
        return task([
            [`An event has probability ${p}. Find the probability it happens ${n} times in a row.`, round2(Math.pow(p, n) * 10000) / 10000],
            [`An event has probability ${p}. Find the probability it does not happen.`, round2(1 - p)],
            [`An event has probability ${p}. Find the probability it fails ${n} times in a row.`, round2(Math.pow(1 - p, n) * 10000) / 10000],
            [`Are independent events' probabilities multiplied or added?`, 'multiplied'],
            [`Two mutually exclusive events have probabilities ${p} and ${round2(1 - p)}. Find P(either).`, 1],
        ]);
    }),

    band(9, 12, () => {
        const values = [between(1, 20), between(1, 20), between(1, 20), between(1, 20), between(1, 20), between(1, 20), between(1, 20)];
        const sorted = [...values].sort((a, b) => a - b);
        return task([
            [`Find the first quartile of ${values.join(', ')}.`, sorted[1]],
            [`Find the third quartile of ${values.join(', ')}.`, sorted[5]],
            [`Find the interquartile range of ${values.join(', ')}.`, sorted[5] - sorted[1]],
            [`Find the median of ${values.join(', ')}.`, sorted[3]],
            [`Which measure of spread ignores outliers, the range or the interquartile range?`, 'the interquartile range'],
        ]);
    }),

    band(5, 9, () => {
        const categories = between(3, 6);
        const total = between(40, 120);
        return task([
            [`A circle graph has ${categories} equal sectors. What angle is each?`, `${round2(360 / categories)}°`],
            [`A circle graph sector is ${round2(360 / categories)}°. What fraction of the whole is it?`, simplify(1, categories)],
            [`A circle graph shows ${total} people in ${categories} equal groups. How many per group?`, round2(total / categories)],
            [`A sector holds 25% of the data. What is its angle?`, '90°'],
        ]);
    }),

    band(5, 9, () => {
        const values = [between(1, 10), between(1, 10), between(1, 10), between(1, 10), between(1, 10)];
        return task([
            [`A stem-and-leaf plot holds ${values.join(', ')}. How many data points are there?`, values.length],
            [`What is the smallest value in ${values.join(', ')}?`, Math.min(...values)],
            [`Would a bar graph or a line graph better show change over time?`, 'a line graph'],
            [`Would a circle graph or a bar graph better show parts of a whole?`, 'a circle graph'],
            [`Is the data ${values.join(', ')} discrete or continuous?`, 'discrete'],
        ]);
    }),

    band(6, 10, () => {
        const total = between(60, 200);
        const percent = pick([20, 25, 40, 50]);
        return task([
            [`${percent}% of ${total} people said yes. How many is that?`, round2((total * percent) / 100)],
            [`${round2((total * percent) / 100)} of ${total} said yes. What percent is that?`, `${percent}%`],
            [`Of ${total} people, ${percent}% said yes. How many said no?`, round2(total - (total * percent) / 100)],
            [`A survey of ${total} is repeated with 2 times as many people. Would the percent likely change much?`, 'no'],
        ]);
    }),

    band(9, 12, () => {
        const cards = 52;
        const suit = 13;
        return task([
            [`A card is drawn from ${cards}. Find P(a heart).`, simplify(suit, cards)],
            [`A card is drawn from ${cards}. Find P(an ace).`, simplify(4, cards)],
            [`A card is drawn from ${cards}. Find P(a face card).`, simplify(12, cards)],
            [`Two cards are drawn without replacement. How many outcomes are there?`, cards * (cards - 1)],
            [`A card is drawn from ${cards}. Find P(not a heart).`, simplify(cards - suit, cards)],
        ]);
    }),

    band(9, 12, () => {
        const trials = between(5, 10);
        const p = pick([0.2, 0.5]);
        return task([
            [`A fair coin is tossed ${trials} times. How many outcomes are there?`, Math.pow(2, trials)],
            [`A fair coin is tossed ${trials} times. Find P(all heads).`, `1/${Math.pow(2, trials)}`],
            [`An event with probability ${p} is tried ${trials} times. Find the expected number of successes.`, round2(p * trials)],
            [`Name the distribution for a fixed number of independent trials with two outcomes.`, 'the binomial distribution'],
        ]);
    }),

    band(9, 12, () => {
        const n = between(4, 8);
        return task([
            [`How many ways can ${n} books be arranged on a shelf?`, (() => { let v = 1; for (let i = 2; i <= n; i += 1) v *= i; return v; })()],
            [`How many ways can ${n} people sit in a circle?`, (() => { let v = 1; for (let i = 2; i <= n - 1; i += 1) v *= i; return v; })()],
            [`Evaluate ${n}!.`, (() => { let v = 1; for (let i = 2; i <= n; i += 1) v *= i; return v; })()],
            [`Evaluate ${n}! / ${n - 1}!.`, n],
            [`How many two-letter codes use ${n} letters with repeats allowed?`, n * n],
        ]);
    }),

    band(5, 9, () => {
        const values = [between(2, 12), between(2, 12), between(2, 12), between(2, 12)];
        return task([
            [`Four bars measure ${values.join(', ')}. Find their total.`, values.reduce((sum, value) => sum + value, 0)],
            [`Four bars measure ${values.join(', ')}. Find the tallest.`, Math.max(...values)],
            [`Four bars measure ${values.join(', ')}. How much taller is the tallest than the shortest?`, Math.max(...values) - Math.min(...values)],
            [`Four bars measure ${values.join(', ')}. Find their mean.`, meanOf(values)],
        ]);
    }),

    band(5, 9, () => {
        const favourite = pick(['soccer', 'reading', 'music', 'art']);
        const votes = between(6, 25);
        const total = votes + between(10, 40);
        return task([
            [`${votes} of ${total} chose ${favourite}. What fraction is that?`, simplify(votes, total)],
            [`${votes} of ${total} chose ${favourite}. How many did not?`, total - votes],
            [`${votes} of ${total} chose ${favourite}. What percent is that, to the nearest whole?`, `${Math.round((votes / total) * 100)}%`],
            [`Is a survey of ${total} students enough to speak for a whole city? Write yes or no.`, 'no'],
        ]);
    }),

    band(8, 12, () => {
        const first = between(2, 8);
        const second = between(2, 8);
        return task([
            [`A bag has ${first} red and ${second} blue counters. Two are drawn with replacement. Find P(both red).`, simplify(first * first, (first + second) * (first + second))],
            [`A bag has ${first} red and ${second} blue counters. Two are drawn without replacement. Find P(both red).`, simplify(first * (first - 1), (first + second) * (first + second - 1))],
            [`Does drawing without replacement make events independent or dependent?`, 'dependent'],
            [`A bag has ${first} red and ${second} blue. Find P(first red, then blue) without replacement.`, simplify(first * second, (first + second) * (first + second - 1))],
        ]);
    }),

    band(9, 12, () => {
        const slope = between(2, 6);
        const intercept = between(1, 20);
        const x = between(2, 9);
        return task([
            [`A line of best fit is y = ${slope}x + ${intercept}. Predict y when x = ${x}.`, slope * x + intercept],
            [`A line of best fit is y = ${slope}x + ${intercept}. What does the slope mean?`, `y rises ${slope} for each 1 unit of x`],
            [`A line of best fit is y = ${slope}x + ${intercept}. What is the value of y when x = 0?`, intercept],
            [`Is predicting y at x = ${x * 100} from this data interpolation or extrapolation?`, 'extrapolation'],
        ]);
    }),

    band(9, 12, () => {
        const size = pick([100, 400, 900]);
        const margin = round2(100 / Math.sqrt(size));
        return task([
            [`A poll of ${size} has margin of error about ${margin}%. What happens to it if the sample quadruples?`, 'it halves'],
            [`A poll of ${size} reports 45%. Give the interval using a margin of ${margin}%.`, `${round2(45 - margin)}% to ${round2(45 + margin)}%`],
            [`Does a larger sample give a wider or narrower margin of error?`, 'narrower'],
            [`Name one source of bias in a voluntary online poll.`, 'only people with strong opinions answer'],
        ]);
    }),

    band(9, 12, () => {
        const values = [between(10, 30), between(10, 30), between(10, 30), between(10, 30), between(10, 30)];
        const mean = meanOf(values);
        return task([
            [`Find the sum of the deviations from the mean for ${values.join(', ')}.`, 0],
            [`Find the largest deviation from the mean in ${values.join(', ')}, to two decimals.`, round2(Math.max(...values.map((value) => Math.abs(value - mean))))],
            [`Find the mean absolute deviation of ${values.join(', ')}, to two decimals.`, round2(values.reduce((sum, value) => sum + Math.abs(value - mean), 0) / values.length)],
            [`Would adding 10 to every value in ${values.join(', ')} change the spread?`, 'no'],
            [`Find the new mean if every value in ${values.join(', ')} is doubled.`, round2(mean * 2)],
        ]);
    }),

    band(10, 12, () => {
        const n = between(3, 8);
        return task([
            [`How many subsets does a set of ${n} elements have?`, Math.pow(2, n)],
            [`How many ways can ${n} items be split into two ordered groups?`, Math.pow(2, n)],
            [`In how many orders can ${n} finishers place first, second and third?`, n * (n - 1) * (n - 2)],
            [`How many pairs can be chosen from ${n} people?`, (n * (n - 1)) / 2],
            [`How many handshakes happen if ${n} people all shake hands once?`, (n * (n - 1)) / 2],
        ]);
    }),
];

/* ----------------------------------------------------------- measurement */

const measurement = [
    band(1, 4, () => {
        const object = pick(['a pencil', 'a book', 'a door', 'a paperclip', 'a classroom']);
        const UNITS = { 'a pencil': 'centimetres', 'a book': 'centimetres', 'a door': 'metres', 'a paperclip': 'centimetres', 'a classroom': 'metres' };
        return task([
            [`Would you measure ${object} in centimetres or metres?`, UNITS[object]],
            [`Name a unit smaller than a metre.`, 'a centimetre'],
            [`Name a unit larger than a metre.`, 'a kilometre'],
            [`How many centimetres are in a metre?`, 100],
        ]);
    }),

    band(1, 4, () => {
        const first = between(3, 20);
        const second = between(3, 20);
        return task([
            [`One ribbon is ${first} cm and another is ${second} cm. Which is longer?`, first > second ? `the ${first} cm ribbon` : (second > first ? `the ${second} cm ribbon` : 'they are the same')],
            [`One ribbon is ${first} cm and another is ${second} cm. How much longer is the longer one?`, `${Math.abs(first - second)} cm`],
            [`Two ribbons measure ${first} cm and ${second} cm. What is their total length?`, `${first + second} cm`],
        ]);
    }),

    band(1, 4, () => {
        const hour = between(1, 12);
        const minutes = pick([0, 15, 30, 45]);
        const LABELS = { 0: "o'clock", 15: 'quarter past', 30: 'half past', 45: 'quarter to' };
        return task([
            [`What time is ${hour}:${String(minutes).padStart(2, '0')} in words?`, minutes === 45 ? `quarter to ${hour === 12 ? 1 : hour + 1}` : `${LABELS[minutes]} ${hour}`],
            [`How many minutes past the hour is ${hour}:${String(minutes).padStart(2, '0')}?`, minutes],
            [`What time is one hour after ${hour}:${String(minutes).padStart(2, '0')}?`, `${hour === 12 ? 1 : hour + 1}:${String(minutes).padStart(2, '0')}`],
            [`How many minutes are in an hour?`, 60],
        ]);
    }),

    band(2, 5, () => {
        const coins = between(3, 9);
        const value = pick([5, 10, 25]);
        return task([
            [`What is the value of ${coins} coins worth ${value} cents each?`, `${coins * value} cents`],
            [`How many ${value} cent coins make ${coins * value} cents?`, coins],
            [`How much change from one dollar after spending ${coins * value} cents?`, `${100 - coins * value} cents`],
        ]);
    }),

    band(3, 6, () => {
        const metres = between(2, 20);
        return task([
            [`Convert ${metres} m to centimetres.`, `${metres * 100} cm`],
            [`Convert ${metres * 100} cm to metres.`, `${metres} m`],
            [`Convert ${metres} m to millimetres.`, `${metres * 1000} mm`],
            [`Convert ${metres} km to metres.`, `${metres * 1000} m`],
        ]);
    }),

    band(3, 6, () => {
        const grams = between(2, 9);
        return task([
            [`Convert ${grams} kg to grams.`, `${grams * 1000} g`],
            [`Convert ${grams * 1000} g to kilograms.`, `${grams} kg`],
            [`Convert ${grams} L to millilitres.`, `${grams * 1000} mL`],
            [`Convert ${grams * 1000} mL to litres.`, `${grams} L`],
        ]);
    }),

    band(3, 6, () => {
        const startHour = between(1, 9);
        const lasts = between(2, 4);
        return task([
            [`A film starts at ${startHour}:00 and lasts ${lasts} hours. When does it end?`, `${startHour + lasts}:00`],
            [`A film starts at ${startHour}:00 and ends at ${startHour + lasts}:00. How long is it?`, `${lasts} hours`],
            [`How many minutes long is a film of ${lasts} hours?`, lasts * 60],
            [`Write ${startHour + 12}:00 on a 12-hour clock.`, `${startHour}:00 p.m.`],
        ]);
    }),

    band(3, 6, () => {
        const celsius = between(-10, 35);
        return task([
            [`Is ${celsius}°C above or below freezing?`, celsius > 0 ? 'above' : (celsius < 0 ? 'below' : 'exactly at freezing')],
            [`The temperature is ${celsius}°C and falls 5 degrees. What is the new temperature?`, `${celsius - 5}°C`],
            [`The temperature rises from ${celsius}°C to ${celsius + 8}°C. By how much did it rise?`, '8 degrees'],
            [`At what temperature in degrees Celsius does water freeze?`, '0°C'],
        ]);
    }),

    band(3, 6, () => {
        const side = between(2, 9);
        return task([
            [`How many square centimetres are in a square ${side} cm on each side?`, `${side * side} cm²`],
            [`A square has area ${side * side} cm². What is its perimeter?`, `${side * 4} cm`],
            [`Would you measure the floor of a room in cm² or m²?`, 'm²'],
            [`How many cubic centimetres are in a cube ${side} cm on each edge?`, `${side * side * side} cm³`],
        ]);
    }),

    band(4, 6, () => {
        const inches = between(2, 24);
        return task([
            [`About how many centimetres is ${inches} inches? Use 1 inch = 2.54 cm.`, `${round2(inches * 2.54)} cm`],
            [`How many inches are in a foot?`, 12],
            [`Convert ${inches} feet to inches.`, inches * 12],
            [`Which is longer, a metre or a yard?`, 'a metre'],
        ]);
    }),
    band(1, 3, () => {
        const heavy = pick(['a brick', 'a melon', 'a bag of sand']);
        const light = pick(['a feather', 'a paperclip', 'a leaf']);
        return task([
            [`Which is heavier, ${heavy} or ${light}?`, heavy],
            [`Which is lighter, ${heavy} or ${light}?`, light],
            [`Would you measure ${heavy} in grams or kilograms?`, 'kilograms'],
            [`Would you measure ${light} in grams or kilograms?`, 'grams'],
        ]);
    }),

    band(1, 3, () => {
        const cups = between(2, 8);
        return task([
            [`A jug fills ${cups} cups. How many cups do 2 jugs fill?`, cups * 2],
            [`It takes ${cups} cups to fill a jug. How many cups fill half a jug?`, round2(cups / 2)],
            [`Which holds more, a cup or a jug that holds ${cups} cups?`, 'the jug'],
            [`Would you measure a spoonful of medicine in millilitres or litres?`, 'millilitres'],
        ]);
    }),

    band(1, 3, () => {
        const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const index = between(0, 6);
        return task([
            [`What day comes after ${DAYS[index]}?`, DAYS[(index + 1) % 7]],
            [`What day comes before ${DAYS[index]}?`, DAYS[(index + 6) % 7]],
            [`How many days are in a week?`, 7],
            [`How many months are in a year?`, 12],
        ]);
    }),

    band(2, 4, () => {
        const paperclips = between(4, 20);
        return task([
            [`A desk is ${paperclips} paperclips long. Two desks end to end measure how many paperclips?`, paperclips * 2],
            [`A pencil is ${paperclips} cubes long and a crayon is ${Math.max(1, paperclips - 3)} cubes long. Which is longer?`, 'the pencil'],
            [`Why is a paperclip a poor unit for measuring a classroom?`, 'it is too small, so the number would be very large'],
        ]);
    }),

    band(7, 12, () => {
        const distance = between(40, 320);
        const hours = between(2, 8);
        return task([
            [`A car travels ${distance} km in ${hours} hours. Find its average speed.`, `${round2(distance / hours)} km/h`],
            [`A car travels at ${round2(distance / hours)} km/h for ${hours} hours. How far does it go?`, `${distance} km`],
            [`How long does a ${distance} km trip take at ${round2(distance / hours)} km/h?`, `${hours} hours`],
            [`Convert ${round2(distance / hours)} km/h to metres per hour.`, `${round2((distance / hours) * 1000)} m/h`],
        ]);
    }),

    band(7, 12, () => {
        const metres = between(2, 9);
        return task([
            [`Convert ${metres} m² to square centimetres.`, `${metres * 10000} cm²`],
            [`Convert ${metres} m³ to cubic centimetres.`, `${metres * 1000000} cm³`],
            [`Why is 1 m² equal to 10 000 cm² and not 100 cm²?`, 'both length and width are converted, so the factor is squared'],
            [`Convert ${metres * 10000} cm² to square metres.`, `${metres} m²`],
        ]);
    }),

    band(7, 12, () => {
        const mass = between(20, 90);
        const volume = between(2, 9);
        return task([
            [`An object has mass ${mass} g and volume ${volume} cm³. Find its density.`, `${round2(mass / volume)} g/cm³`],
            [`A substance has density ${round2(mass / volume)} g/cm³. What is the mass of ${volume} cm³?`, `${mass} g`],
            [`A substance has density ${round2(mass / volume)} g/cm³ and mass ${mass} g. Find its volume.`, `${volume} cm³`],
        ]);
    }),

    band(7, 12, () => {
        const scale = pick([50, 100, 200, 500]);
        const drawn = between(2, 12);
        return task([
            [`A map has scale 1 : ${scale}. A length of ${drawn} cm on the map is what real length in metres?`, `${round2((drawn * scale) / 100)} m`],
            [`A map has scale 1 : ${scale}. A real length of ${round2((drawn * scale) / 100)} m is how long on the map?`, `${drawn} cm`],
            [`On a 1 : ${scale} map, does a larger second number mean more or less detail?`, 'less detail'],
        ]);
    }),

    band(5, 9, () => {
        const celsius = between(-15, 40);
        const fahrenheit = round2((celsius * 9) / 5 + 32);
        return task([
            [`Convert ${celsius}°C to degrees Fahrenheit.`, `${fahrenheit}°F`],
            [`Convert ${fahrenheit}°F to degrees Celsius.`, `${celsius}°C`],
            [`Which is warmer, ${celsius}°C or ${celsius}°F?`, celsius > (celsius - 32) * 5 / 9 ? `${celsius}°C` : `${celsius}°F`],
            [`Water boils at 100°C. How many degrees above ${celsius}°C is that?`, `${100 - celsius} degrees`],
        ]);
    }),

    band(5, 9, () => {
        const hours = between(1, 9);
        const minutes = pick([5, 15, 20, 35, 40, 50]);
        const total = hours * 60 + minutes;
        return task([
            [`Convert ${hours} h ${minutes} min to minutes.`, total],
            [`Convert ${total} minutes to hours and minutes.`, `${hours} h ${minutes} min`],
            [`Convert ${hours} hours to seconds.`, hours * 3600],
            [`How many minutes are there between ${hours}:00 and ${hours + 1}:${minutes}?`, 60 + minutes],
        ]);
    }),

    band(5, 9, () => {
        const price = between(2, 9);
        const cents = pick([25, 49, 75, 99]);
        const amount = round2(price + cents / 100);
        const many = between(3, 8);
        return task([
            [`One item costs $${amount}. What do ${many} cost?`, `$${round2(amount * many)}`],
            [`${many} items cost $${round2(amount * many)}. What does one cost?`, `$${amount}`],
            [`What change is left from $${Math.ceil(amount * many) + 5} after spending $${round2(amount * many)}?`, `$${round2(Math.ceil(amount * many) + 5 - amount * many)}`],
            [`Round $${amount} to the nearest dollar.`, `$${Math.round(amount)}`],
        ]);
    }),

    band(6, 10, () => {
        const litres = between(2, 40);
        return task([
            [`Convert ${litres} L to millilitres.`, `${litres * 1000} mL`],
            [`Convert ${litres} L to cubic centimetres, given 1 mL = 1 cm³.`, `${litres * 1000} cm³`],
            [`A tank holds ${litres} L. How many 250 mL glasses can it fill?`, (litres * 1000) / 250],
            [`Convert ${litres * 1000} mL to litres.`, `${litres} L`],
        ]);
    }),

    band(6, 10, () => {
        const grams = between(150, 900);
        return task([
            [`Convert ${grams} g to kilograms.`, `${round2(grams / 1000)} kg`],
            [`Convert ${grams} mg to grams.`, `${round2(grams / 1000)} g`],
            [`How many ${grams} g packets make 1 kg? Round down.`, Math.floor(1000 / grams)],
            [`What mass is left over after taking as many ${grams} g packets as possible from 1 kg?`, `${1000 - Math.floor(1000 / grams) * grams} g`],
        ]);
    }),

    band(7, 12, () => {
        const value = pick([0.0045, 0.052, 1.2, 34.06, 250.0, 1080]);
        const digits = String(value).replace('-', '').replace('.', '').replace(/^0+/, '').replace(/0+$/, '').length || 1;
        return task([
            [`How many significant figures does ${value} have?`, digits],
            [`Round ${value} to two significant figures.`, Number(value.toPrecision(2))],
            [`Round ${value} to one significant figure.`, Number(value.toPrecision(1))],
            [`Write ${value} in scientific notation.`, value.toExponential().replace('e+', ' × 10^').replace('e-', ' × 10^-')],
        ]);
    }),

    band(7, 12, () => {
        const litres = between(30, 70);
        const hundredKm = between(5, 12);
        return task([
            [`A car uses ${litres} L over ${hundredKm * 100} km. Find its fuel use in L per 100 km.`, round2(litres / hundredKm)],
            [`A car uses ${round2(litres / hundredKm)} L per 100 km. How much fuel for ${hundredKm * 100} km?`, `${litres} L`],
            [`Fuel costs $1.60 per litre. What do ${litres} L cost?`, `$${round2(litres * 1.6)}`],
            [`How far can a car go on ${litres} L at ${round2(litres / hundredKm)} L per 100 km?`, `${hundredKm * 100} km`],
        ]);
    }),

    band(7, 12, () => {
        const metres = between(20, 90);
        const seconds = between(4, 12);
        return task([
            [`An object moves ${metres} m in ${seconds} s. Find its speed in m/s.`, round2(metres / seconds)],
            [`Convert ${round2(metres / seconds)} m/s to km/h.`, `${round2((metres / seconds) * 3.6)} km/h`],
            [`Convert ${round2((metres / seconds) * 3.6)} km/h to m/s.`, `${round2(metres / seconds)} m/s`],
            [`How far does an object travelling ${round2(metres / seconds)} m/s go in ${seconds * 2} s?`, `${metres * 2} m`],
        ]);
    }),

    band(9, 12, () => {
        const rate = pick([1.25, 1.32, 0.74, 0.68]);
        const amount = between(50, 900);
        return task([
            [`One Canadian dollar buys ${rate} of another currency. What does $${amount} CAD buy?`, round2(amount * rate)],
            [`At ${rate} per Canadian dollar, how many Canadian dollars buy ${amount}?`, `$${round2(amount / rate)} CAD`],
            [`If the rate moves from ${rate} to ${round2(rate * 1.1)}, is the Canadian dollar stronger or weaker?`, 'stronger'],
            [`Convert $${amount} CAD at ${rate}, then back again. What do you get?`, `$${amount} CAD`],
        ]);
    }),

    band(9, 12, () => {
        const measured = between(20, 80);
        const precision = pick([0.5, 0.1, 1]);
        return task([
            [`A length is measured as ${measured} cm to the nearest ${precision * 2} cm. What is the smallest it could be?`, `${round2(measured - precision)} cm`],
            [`A length is measured as ${measured} cm to the nearest ${precision * 2} cm. What is the largest it could be?`, `${round2(measured + precision)} cm`],
            [`Give the absolute error when ${measured} cm is measured to the nearest ${precision * 2} cm.`, `${precision} cm`],
            [`Give the percent error of ±${precision} cm on a ${measured} cm measurement, to two decimals.`, `${round2((precision / measured) * 100)}%`],
        ]);
    }),

    band(9, 12, () => {
        const hours = between(2, 9);
        const rate = between(14, 32);
        return task([
            [`A job pays $${rate} an hour. What do ${hours} hours earn?`, `$${rate * hours}`],
            [`A job paid $${rate * hours} for ${hours} hours. What is the hourly rate?`, `$${rate}`],
            [`At $${rate} an hour, how long to earn $${rate * hours}?`, `${hours} hours`],
            [`Overtime pays time and a half. What does one overtime hour earn at $${rate}?`, `$${round2(rate * 1.5)}`],
        ]);
    }),

    band(3, 8, () => {
        const km = between(2, 40);
        return task([
            [`Convert ${km} km to metres.`, `${km * 1000} m`],
            [`Convert ${km * 1000} m to kilometres.`, `${km} km`],
            [`A walk of ${km} km takes how many minutes at 1 km per 12 minutes?`, km * 12],
            [`How many 500 m laps make ${km} km?`, km * 2],
        ]);
    }),

    band(3, 8, () => {
        const start = between(1, 10);
        const minutes = pick([25, 40, 55, 70, 95]);
        const endMinutes = start * 60 + minutes;
        return task([
            [`A task starts at ${start}:00 and takes ${minutes} minutes. When does it end?`, `${Math.floor(endMinutes / 60)}:${String(endMinutes % 60).padStart(2, '0')}`],
            [`How many hours and minutes is ${minutes} minutes?`, `${Math.floor(minutes / 60)} h ${minutes % 60} min`],
            [`Two tasks take ${minutes} minutes each. How long in total?`, `${Math.floor((minutes * 2) / 60)} h ${(minutes * 2) % 60} min`],
            [`How many minutes from ${start}:00 to ${start + 2}:00?`, 120],
        ]);
    }),

    band(4, 9, () => {
        const side = between(2, 12);
        const height = between(2, 12);
        return task([
            [`A rectangular pool is ${side} m by ${height} m and 2 m deep. Find its volume.`, `${side * height * 2} m³`],
            [`How many litres does a ${side * height * 2} m³ pool hold, given 1 m³ = 1000 L?`, `${side * height * 2000} L`],
            [`Find the area of the pool floor, ${side} m by ${height} m.`, `${side * height} m²`],
            [`Find the perimeter of a pool ${side} m by ${height} m.`, `${(side + height) * 2} m`],
        ]);
    }),

    band(3, 9, () => {
        const cm = between(150, 400);
        return task([
            [`Convert ${cm} cm to metres.`, `${round2(cm / 100)} m`],
            [`Convert ${cm} cm to millimetres.`, `${cm * 10} mm`],
            [`A rope ${cm} cm long is cut into 50 cm pieces. How many whole pieces?`, Math.floor(cm / 50)],
            [`How much rope is left over after cutting ${cm} cm into 50 cm pieces?`, `${cm % 50} cm`],
        ]);
    }),

    band(4, 9, () => {
        const litres = between(3, 15);
        const perDay = between(1, 3);
        return task([
            [`A tank holds ${litres} L and loses ${perDay} L a day. How many days until it is empty?`, round2(litres / perDay)],
            [`A tank holds ${litres} L. How much is left after ${perDay} days of losing 1 L a day?`, `${litres - perDay} L`],
            [`How many millilitres does a tank of ${litres} L hold?`, `${litres * 1000} mL`],
            [`A ${litres} L tank fills at 500 mL a minute. How long to fill?`, `${litres * 2} minutes`],
        ]);
    }),

    band(5, 9, () => {
        const degrees = between(5, 30);
        return task([
            [`The temperature falls ${degrees}° from 12°C. What is it now?`, `${12 - degrees}°C`],
            [`The temperature rises from -${degrees}°C to 0°C. By how much did it rise?`, `${degrees} degrees`],
            [`Which is colder, -${degrees}°C or ${degrees}°C?`, `-${degrees}°C`],
            [`Order -${degrees}°C, 0°C and ${degrees}°C from coldest.`, `-${degrees}°C, 0°C, ${degrees}°C`],
        ]);
    }),

    band(4, 9, () => {
        const a = between(2, 12);
        const b = between(2, 12);
        return task([
            [`A garden is ${a} m by ${b} m. How much fencing goes around it?`, `${(a + b) * 2} m`],
            [`A garden is ${a} m by ${b} m. How much turf covers it?`, `${a * b} m²`],
            [`Fencing costs $12 a metre. What does ${(a + b) * 2} m cost?`, `$${(a + b) * 2 * 12}`],
            [`Turf costs $8 a square metre. What does ${a * b} m² cost?`, `$${a * b * 8}`],
        ]);
    }),

    band(5, 9, () => {
        const km = between(3, 30);
        const minutes = between(10, 90);
        return task([
            [`A journey of ${km} km takes ${minutes} minutes. Find the speed in km/h to two decimals.`, round2(km / (minutes / 60))],
            [`Convert ${minutes} minutes to hours, to two decimals.`, round2(minutes / 60)],
            [`At ${round2(km / (minutes / 60))} km/h, how far in 2 hours?`, `${round2((km / (minutes / 60)) * 2)} km`],
            [`Two journeys of ${km} km each take ${minutes} minutes. What is the total time?`, `${minutes * 2} minutes`],
        ]);
    }),

    band(8, 12, () => {
        const before = between(20, 90);
        const percent = pick([5, 10, 15, 20]);
        return task([
            [`A ${before} kg load increases by ${percent}%. Find the new mass.`, `${round2(before * (1 + percent / 100))} kg`],
            [`A ${before} m length shrinks by ${percent}%. Find the new length.`, `${round2(before * (1 - percent / 100))} m`],
            [`A measurement of ${before} cm has ${percent}% error. Give the range.`, `${round2(before * (1 - percent / 100))} to ${round2(before * (1 + percent / 100))} cm`],
            [`Convert ${before} kg to grams.`, `${before * 1000} g`],
        ]);
    }),

    band(3, 6, () => {
        const a = between(2, 12);
        return task([
            [`How many hours are in ${a} days?`, a * 24],
            [`How many days are in ${a} weeks?`, a * 7],
            [`How many seconds are in ${a} minutes?`, a * 60],
            [`How many weeks are in ${a * 7} days?`, a],
            [`How many months are in ${a} years?`, a * 12],
        ]);
    }),
    band(1, 4, () => {
        const hand = between(3, 12);
        return task([
            [`A desk is ${hand} hand-spans wide. How many spans for two desks?`, hand * 2],
            [`Which is longer, ${hand} hand-spans or ${hand + 2} hand-spans?`, `${hand + 2} hand-spans`],
            [`Why might two people measure the same desk as ${hand} and ${hand + 1} spans?`, 'their hands are different sizes'],
            [`Name a unit that gives the same answer for everyone.`, 'a centimetre'],
        ]);
    }),

    band(1, 4, () => {
        const kg = between(2, 9);
        return task([
            [`Which is heavier, ${kg} kg or ${kg * 1000} g?`, 'they are the same'],
            [`Order ${kg} kg, ${kg} g and ${kg * 100} g from lightest.`, `${kg} g, ${kg * 100} g, ${kg} kg`],
            [`A bag holds ${kg} kg. How many 1 kg bags is that?`, kg],
            [`Would you weigh an apple in grams or kilograms?`, 'grams'],
        ]);
    }),
];

/* ------------------------------------------------------------ calculus */

const calculus = [
    band(12, 12, () => {
        const a = between(2, 6);
        const b = between(2, 6);
        return task([
            [`Find the limit of (${a}x² + ${b}x) / x as x approaches 0.`, b],
            [`Find the limit of ${a}x + ${b} as x approaches 1.`, a + b],
            [`Find the limit of (x² - ${a * a}) / (x - ${a}) as x approaches ${a}.`, a * 2],
            [`Is f(x) = (x² - ${a * a}) / (x - ${a}) continuous at x = ${a}? Write yes or no.`, 'no'],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 8);
        const n = between(2, 5);
        return task([
            [`Differentiate y = ${a}x^${n}.`, `${a * n}x^${n - 1}`],
            [`Find the second derivative of y = ${a}x^${n}.`, `${a * n * (n - 1)}x^${n - 2}`],
            [`Find the slope of y = ${a}x^${n} at x = 1.`, a * n],
            [`Differentiate y = ${a}x^${n} + ${a}.`, `${a * n}x^${n - 1}`],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 8);
        const n = between(1, 4);
        return task([
            [`Integrate ${a}x^${n} with respect to x.`, `${simplify(a, n + 1)}x^${n + 1} + C`],
            [`Evaluate the integral of ${a}x^${n} from 0 to 1.`, simplify(a, n + 1)],
            [`Find the area under y = ${a}x from x = 0 to x = 2.`, a * 2],
            [`What is the integral of a constant ${a} with respect to x?`, `${a}x + C`],
        ]);
    }),

    band(12, 12, () => {
        const rate = between(2, 9);
        const radius = between(2, 9);
        return task([
            [`A balloon's radius grows at ${rate} cm/s. How fast is the volume changing when r = ${radius}? Leave the answer in terms of π.`, `${4 * radius * radius * rate}π cm³/s`],
            [`A square's side grows at ${rate} cm/s. How fast is the area changing when the side is ${radius} cm?`, `${2 * radius * rate} cm²/s`],
            [`A car travels so that s(t) = ${rate}t². Find its velocity at t = ${radius}.`, rate * 2 * radius],
            [`A car travels so that s(t) = ${rate}t². Find its acceleration.`, rate * 2],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 6);
        const b = between(2, 6);
        return task([
            [`Differentiate y = ${a}x³ + ${b}x.`, `${a * 3}x² + ${b}`],
            [`Differentiate y = sin(${a}x).`, `${a}cos(${a}x)`],
            [`Differentiate y = e^(${a}x).`, `${a}e^(${a}x)`],
            [`Differentiate y = ln(${a}x).`, '1/x'],
            [`Differentiate y = ${a}x⁻¹.`, `-${a}x⁻²`],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 6);
        const b = between(2, 6);
        return task([
            [`Use the product rule to differentiate y = x^${a} · x^${b}.`, `${a + b}x^${a + b - 1}`],
            [`Use the chain rule to differentiate y = (x + ${a})^${b}.`, `${b}(x + ${a})^${b - 1}`],
            [`Use the quotient rule to state the derivative of ${a}/x.`, `-${a}/x²`],
            [`Differentiate y = (${a}x + ${b})².`, `${2 * a}(${a}x + ${b})`],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 8);
        return task([
            [`Find the critical points of y = x² - ${2 * a}x.`, `x = ${a}`],
            [`Is x = ${a} a maximum or a minimum of y = x² - ${2 * a}x?`, 'a minimum'],
            [`Find the minimum value of y = x² - ${2 * a}x.`, -a * a],
            [`On what interval is y = x² - ${2 * a}x decreasing?`, `x < ${a}`],
            [`Find the second derivative of y = x² - ${2 * a}x.`, 2],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Evaluate the integral of x from 0 to ${a}.`, round2((a * a) / 2)],
            [`Evaluate the integral of ${b} from ${a} to ${a + 2}.`, b * 2],
            [`Find the area between y = x and the x-axis from 0 to ${a}.`, round2((a * a) / 2)],
            [`State the fundamental theorem of calculus in one sentence.`, 'differentiation and integration are inverse operations'],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 9);
        return task([
            [`Find the average rate of change of y = x² from x = 0 to x = ${a}.`, a],
            [`Find the instantaneous rate of change of y = x² at x = ${a}.`, a * 2],
            [`Find the equation of the tangent to y = x² at x = ${a}.`, `y = ${a * 2}x - ${a * a}`],
            [`Find the slope of the normal to y = x² at x = ${a}.`, `-1/${a * 2}`],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 9);
        const b = between(2, 9);
        return task([
            [`Find the limit of (${a}x + ${b}) / x as x approaches infinity.`, a],
            [`Find the limit of ${b} / x as x approaches infinity.`, 0],
            [`Find the limit of x² as x approaches ${a}.`, a * a],
            [`Does the limit of 1/x exist as x approaches 0? Write yes or no.`, 'no'],
            [`Find the limit of (x² - ${a * a}) / (x + ${a}) as x approaches -${a}.`, -2 * a],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 8);
        return task([
            [`A ball's height is h(t) = -5t² + ${a * 10}t. Find its velocity at time t.`, `-10t + ${a * 10}`],
            [`A ball's height is h(t) = -5t² + ${a * 10}t. When is it at its highest?`, `t = ${a}`],
            [`A ball's height is h(t) = -5t² + ${a * 10}t. What is its maximum height?`, 5 * a * a],
            [`A ball's height is h(t) = -5t² + ${a * 10}t. When does it hit the ground?`, `t = ${a * 2}`],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 8);
        const b = between(2, 8);
        return task([
            [`Find the area between y = x² and the x-axis from 0 to ${a}.`, round2((a * a * a) / 3)],
            [`Find the integral of x² from 0 to ${a}.`, round2((a * a * a) / 3)],
            [`Find the integral of ${b}x from 0 to ${a}.`, round2((b * a * a) / 2)],
            [`Find the average value of y = ${b}x on [0, ${a}].`, round2((b * a) / 2)],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 9);
        return task([
            [`Find dy/dx for y = ${a}x.`, a],
            [`Find dy/dx for y = ${a}.`, 0],
            [`Find dy/dx for y = x² + ${a}x.`, `2x + ${a}`],
            [`Find dy/dx for y = √x.`, '1/(2√x)'],
            [`Find dy/dx for y = ${a}/x.`, `-${a}/x²`],
        ]);
    }),

    band(12, 12, () => {
        const a = between(2, 8);
        return task([
            [`A cube's side grows at ${a} cm/s. How fast is its volume changing when the side is 2 cm?`, `${12 * a} cm³/s`],
            [`A circle's radius grows at ${a} cm/s. How fast is its area changing at r = 1, in terms of π?`, `${2 * a}π cm²/s`],
            [`A circle's radius grows at ${a} cm/s. How fast is its circumference changing, in terms of π?`, `${2 * a}π cm/s`],
            [`Which changes faster as a sphere grows, its surface area or its volume?`, 'the volume'],
        ]);
    }),

    band(12, 12, () => {
        const total = between(20, 60);
        return task([
            [`A rectangle has perimeter ${total * 2}. What dimensions give the largest area?`, `${round2(total / 2)} by ${round2(total / 2)}`],
            [`A rectangle has perimeter ${total * 2}. What is the largest possible area?`, round2((total / 2) * (total / 2))],
            [`A rectangle of perimeter ${total * 2} has width ${round2(total / 4)}. Find its area.`, round2((total / 4) * (total - total / 4))],
            [`For a fixed perimeter, which rectangle has the greatest area?`, 'the square'],
        ]);
    }),
];

/* --------------------------------------------------------- trigonometry */

const trigonometry = [
    band(10, 12, () => {
        const opposite = between(3, 12);
        const adjacent = between(3, 12);
        const hypotenuse = round2(Math.hypot(opposite, adjacent));
        return task([
            [`A right triangle has opposite ${opposite} and hypotenuse ${hypotenuse}. Find sin θ to three decimals.`, round2((opposite / hypotenuse) * 1000) / 1000],
            [`A right triangle has adjacent ${adjacent} and hypotenuse ${hypotenuse}. Find cos θ to three decimals.`, round2((adjacent / hypotenuse) * 1000) / 1000],
            [`A right triangle has opposite ${opposite} and adjacent ${adjacent}. Find tan θ to three decimals.`, round2((opposite / adjacent) * 1000) / 1000],
            [`A right triangle has legs ${opposite} and ${adjacent}. Find the angle θ opposite ${opposite}, to the nearest degree.`, `${Math.round((Math.atan(opposite / adjacent) * 180) / Math.PI)}°`],
        ]);
    }),

    band(10, 12, () => {
        const angle = pick([0, 30, 45, 60, 90]);
        const SIN = { 0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1' };
        const COS = { 0: '1', 30: '√3/2', 45: '√2/2', 60: '1/2', 90: '0' };
        const TAN = { 0: '0', 30: '√3/3', 45: '1', 60: '√3' };

        const tasks = [
            [`Give the exact value of sin ${angle}°.`, SIN[angle]],
            [`Give the exact value of cos ${angle}°.`, COS[angle]],
            [`Convert ${angle}° to radians, in terms of π.`, angle === 0 ? '0' : `${simplify(angle, 180)}π`],
        ];
        // tan 90 has no value, so that phrasing is only offered where it does.
        if (angle !== 90) tasks.push([`Give the exact value of tan ${angle}°.`, TAN[angle]]);

        return task(tasks);
    }),

    band(10, 12, () => {
        const a = between(4, 15);
        const angleA = between(25, 70);
        const angleB = between(25, 180 - angleA - 20);
        const angleC = 180 - angleA - angleB;
        return task([
            [`In a triangle, angles are ${angleA}° and ${angleB}°. Find the third angle.`, `${angleC}°`],
            [`Use the sine law: side a = ${a} opposite ${angleA}°. Find the side opposite ${angleB}°, to two decimals.`, round2((a * Math.sin((angleB * Math.PI) / 180)) / Math.sin((angleA * Math.PI) / 180))],
            [`Which side of a triangle with angles ${angleA}°, ${angleB}° and ${angleC}° is longest?`, `the one opposite ${Math.max(angleA, angleB, angleC)}°`],
        ]);
    }),

    band(10, 12, () => {
        const b = between(4, 12);
        const c = between(4, 12);
        const angleA = pick([30, 45, 60, 90, 120]);
        const a = round2(Math.sqrt(b * b + c * c - 2 * b * c * Math.cos((angleA * Math.PI) / 180)));
        return task([
            [`Use the cosine law: b = ${b}, c = ${c}, A = ${angleA}°. Find a to two decimals.`, a],
            [`When is the cosine law needed instead of the sine law?`, 'with two sides and the angle between them, or all three sides'],
            [`For b = ${b}, c = ${c} and A = 90°, what does the cosine law reduce to?`, 'the Pythagorean theorem'],
        ]);
    }),

    band(11, 12, () => {
        const amplitude = between(2, 6);
        const period = pick([2, 3, 4]);
        const shift = between(1, 5);
        return task([
            [`State the amplitude of y = ${amplitude} sin(${period}x).`, amplitude],
            [`State the period of y = ${amplitude} sin(${period}x), in terms of π.`, `${simplify(2, period)}π`],
            [`State the range of y = ${amplitude} sin(${period}x).`, `-${amplitude} ≤ y ≤ ${amplitude}`],
            [`State the vertical shift of y = ${amplitude} sin(${period}x) + ${shift}.`, `up ${shift}`],
            [`State the maximum of y = ${amplitude} sin(${period}x) + ${shift}.`, amplitude + shift],
        ]);
    }),

    band(11, 12, () => {
        const angle = pick([120, 135, 150, 210, 225, 240, 300, 315, 330]);
        const reference = angle < 180 ? 180 - angle : (angle < 270 ? angle - 180 : 360 - angle);
        const quadrant = angle < 180 ? 'second' : (angle < 270 ? 'third' : 'fourth');
        return task([
            [`Find the reference angle for ${angle}°.`, `${reference}°`],
            [`In which quadrant does ${angle}° lie?`, `the ${quadrant}`],
            [`Is sin ${angle}° positive or negative?`, angle < 180 ? 'positive' : 'negative'],
            [`Is cos ${angle}° positive or negative?`, angle > 270 ? 'positive' : 'negative'],
        ]);
    }),

    band(11, 12, () => {
        const value = pick(['sin²θ + cos²θ', '1 + tan²θ', '1 + cot²θ']);
        const RESULTS = { 'sin²θ + cos²θ': '1', '1 + tan²θ': 'sec²θ', '1 + cot²θ': 'csc²θ' };
        return task([
            [`Simplify ${value}.`, RESULTS[value]],
            [`Write tan θ in terms of sin θ and cos θ.`, 'sin θ / cos θ'],
            [`Write sec θ in terms of cos θ.`, '1 / cos θ'],
            [`Write csc θ in terms of sin θ.`, '1 / sin θ'],
        ]);
    }),

    band(11, 12, () => {
        const height = between(8, 40);
        const angle = pick([30, 45, 60]);
        const distance = round2(height / Math.tan((angle * Math.PI) / 180));
        return task([
            [`From ${distance} m away, a tower's top has angle of elevation ${angle}°. Find its height to two decimals.`, `${round2(distance * Math.tan((angle * Math.PI) / 180))} m`],
            [`A ${height} m tower has angle of elevation ${angle}°. How far away is the observer, to two decimals?`, `${distance} m`],
            [`If the observer walks closer, does the angle of elevation increase or decrease?`, 'increase'],
        ]);
    }),

    band(10, 12, () => {
        const sides = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]]);
        const [opposite, adjacent, hypotenuse] = sides;
        return task([
            [`In a right triangle with sides ${sides.join(', ')}, find sin of the angle opposite ${opposite}.`, simplify(opposite, hypotenuse)],
            [`In a right triangle with sides ${sides.join(', ')}, find cos of the angle opposite ${opposite}.`, simplify(adjacent, hypotenuse)],
            [`In a right triangle with sides ${sides.join(', ')}, find tan of the angle opposite ${opposite}.`, simplify(opposite, adjacent)],
            [`In a right triangle with sides ${sides.join(', ')}, find the angle opposite ${opposite} to the nearest degree.`, `${Math.round((Math.asin(opposite / hypotenuse) * 180) / Math.PI)}°`],
            [`Find the area of a right triangle with legs ${opposite} and ${adjacent}.`, (opposite * adjacent) / 2],
        ]);
    }),

    band(10, 12, () => {
        const angle = between(20, 70);
        const hypotenuse = between(6, 20);
        return task([
            [`A ladder ${hypotenuse} m long leans at ${angle}°. How high up the wall does it reach, to two decimals?`, `${round2(hypotenuse * Math.sin((angle * Math.PI) / 180))} m`],
            [`A ladder ${hypotenuse} m long leans at ${angle}°. How far is its foot from the wall, to two decimals?`, `${round2(hypotenuse * Math.cos((angle * Math.PI) / 180))} m`],
            [`A ramp rises ${round2(hypotenuse * Math.sin((angle * Math.PI) / 180))} m over a length of ${hypotenuse} m. Find its angle to the nearest degree.`, `${angle}°`],
            [`Does a steeper ladder make a larger or smaller angle with the ground?`, 'larger'],
        ]);
    }),

    band(10, 12, () => {
        const radians = pick([1, 2, 3, 4, 6]);
        return task([
            [`Convert π/${radians} radians to degrees.`, `${round2(180 / radians)}°`],
            [`Convert ${round2(180 / radians)}° to radians, in terms of π.`, `π/${radians}`],
            [`How many degrees are in one radian, to two decimals?`, round2(180 / Math.PI)],
            [`How many radians are in a full turn, in terms of π?`, '2π'],
            [`How many radians are in a straight angle, in terms of π?`, 'π'],
        ]);
    }),

    band(10, 12, () => {
        const a = between(2, 8);
        const b = between(2, 8);
        return task([
            [`Solve sin θ = 0 for 0° ≤ θ < 360°.`, 'θ = 0° or 180°'],
            [`Solve cos θ = 0 for 0° ≤ θ < 360°.`, 'θ = 90° or 270°'],
            [`Solve sin θ = 1 for 0° ≤ θ < 360°.`, 'θ = 90°'],
            [`How many solutions does sin θ = ${round2(a / (a + b))} have for 0° ≤ θ < 360°?`, 2],
            [`What is the maximum value of sin θ?`, 1],
        ]);
    }),

    band(11, 12, () => {
        const amplitude = between(2, 8);
        const shift = between(1, 6);
        return task([
            [`State the minimum of y = ${amplitude} cos x + ${shift}.`, shift - amplitude],
            [`State the maximum of y = ${amplitude} cos x + ${shift}.`, shift + amplitude],
            [`State the midline of y = ${amplitude} cos x + ${shift}.`, `y = ${shift}`],
            [`State the amplitude of y = ${amplitude} cos x + ${shift}.`, amplitude],
            [`State the period of y = ${amplitude} cos x, in terms of π.`, '2π'],
        ]);
    }),

    band(11, 12, () => {
        const angle = pick([30, 45, 60]);
        return task([
            [`Use the identity sin 2θ = 2 sin θ cos θ. Write sin ${angle * 2}° in terms of ${angle}°.`, `2 sin ${angle}° cos ${angle}°`],
            [`Write cos 2θ in terms of cos θ.`, '2cos²θ - 1'],
            [`Write sin(-θ) in terms of sin θ.`, '-sin θ'],
            [`Write cos(-θ) in terms of cos θ.`, 'cos θ'],
            [`Is sin θ an even or an odd function?`, 'odd'],
        ]);
    }),

    band(10, 12, () => {
        const north = between(3, 20);
        const east = between(3, 20);
        return task([
            [`A boat sails ${north} km north then ${east} km east. How far is it from the start, to two decimals?`, `${round2(Math.hypot(north, east))} km`],
            [`A boat sails ${north} km north then ${east} km east. Find its bearing from the start, to the nearest degree.`, `${Math.round((Math.atan(east / north) * 180) / Math.PI)}°`],
            [`Two roads meet at 90°. One runs ${north} km, the other ${east} km. Find the direct distance to two decimals.`, round2(Math.hypot(north, east))],
        ]);
    }),

    band(10, 12, () => {
        const a = between(3, 15);
        const b = between(3, 15);
        const angle = between(20, 80);
        return task([
            [`Find the area of a triangle with sides ${a} and ${b} enclosing ${angle}°, to two decimals.`, round2(0.5 * a * b * Math.sin((angle * Math.PI) / 180))],
            [`Find the area of a triangle with base ${a} and height ${b}.`, round2((a * b) / 2)],
            [`Two sides ${a} and ${b} enclose 90°. Find the area.`, round2((a * b) / 2)],
            [`Does a larger enclosed angle up to 90° give a larger area?`, 'yes'],
        ]);
    }),

    band(10, 12, () => {
        const height = between(10, 60);
        const shadow = between(10, 60);
        return task([
            [`A pole ${height} m tall casts a ${shadow} m shadow. Find the sun's angle of elevation to the nearest degree.`, `${Math.round((Math.atan(height / shadow) * 180) / Math.PI)}°`],
            [`A pole casts a ${shadow} m shadow when the sun is at ${Math.round((Math.atan(height / shadow) * 180) / Math.PI)}°. Find its height to two decimals.`, `${round2(shadow * Math.tan(Math.atan(height / shadow)))} m`],
            [`As the sun rises higher, does a shadow get longer or shorter?`, 'shorter'],
            [`Find the hypotenuse of a right triangle with legs ${height} and ${shadow}, to two decimals.`, round2(Math.hypot(height, shadow))],
        ]);
    }),

    band(10, 12, () => {
        const angle = pick([15, 25, 35, 55, 65, 75]);
        return task([
            [`Find the complement of ${angle}°.`, `${90 - angle}°`],
            [`Is sin ${angle}° equal to cos ${90 - angle}°? Write yes or no.`, 'yes'],
            [`In a right triangle, one acute angle is ${angle}°. Find the other.`, `${90 - angle}°`],
            [`Order sin ${angle}°, sin ${angle + 10}° and sin ${angle + 20}° from smallest.`, `sin ${angle}°, sin ${angle + 10}°, sin ${angle + 20}°`],
        ]);
    }),

    band(10, 12, () => {
        const a = between(2, 9);
        const angle = pick([30, 45, 60]);
        return task([
            [`In a 30-60-90 triangle the short leg is ${a}. Find the hypotenuse.`, a * 2],
            [`In a 30-60-90 triangle the short leg is ${a}. Find the long leg.`, `${a}√3`],
            [`In a 45-45-90 triangle a leg is ${a}. Find the hypotenuse.`, `${a}√2`],
            [`Name the two special right triangles used for exact values.`, '30-60-90 and 45-45-90'],
            [`Give the exact value of tan ${angle}°.`, angle === 30 ? '√3/3' : (angle === 45 ? '1' : '√3')],
        ]);
    }),

    band(10, 12, () => {
        const a = between(2, 9);
        return task([
            [`If sin θ = ${a}/10, find cos θ to three decimals, given θ is acute.`, Math.round(Math.sqrt(1 - (a / 10) ** 2) * 1000) / 1000],
            [`If sin θ = ${a}/10, find θ to the nearest degree.`, `${Math.round((Math.asin(a / 10) * 180) / Math.PI)}°`],
            [`If cos θ = ${a}/10, find θ to the nearest degree.`, `${Math.round((Math.acos(a / 10) * 180) / Math.PI)}°`],
            [`If tan θ = ${a}, find θ to the nearest degree.`, `${Math.round((Math.atan(a) * 180) / Math.PI)}°`],
            [`What is the largest value sin θ can take?`, 1],
        ]);
    }),
];

/* ------------------------------------------------- advanced functions */

const precalculus = [
    band(11, 12, () => {
        const a = between(2, 6);
        const b = between(2, 9);
        return task([
            [`If f(x) = ${a}x + ${b}, find f(2).`, a * 2 + b],
            [`If f(x) = ${a}x + ${b}, find f(-1).`, -a + b],
            [`If f(x) = ${a}x + ${b}, find x when f(x) = ${a * 3 + b}.`, 3],
            [`Find the inverse of f(x) = ${a}x + ${b}.`, `(x - ${b})/${a}`],
            [`State the domain of f(x) = ${a}x + ${b}.`, 'all real numbers'],
        ]);
    }),

    band(11, 12, () => {
        const a = between(2, 6);
        return task([
            [`State the domain of f(x) = 1/(x - ${a}).`, `all real numbers except x = ${a}`],
            [`State the vertical asymptote of f(x) = 1/(x - ${a}).`, `x = ${a}`],
            [`State the horizontal asymptote of f(x) = 1/(x - ${a}).`, 'y = 0'],
            [`State the domain of f(x) = √(x - ${a}).`, `x ≥ ${a}`],
            [`State the range of f(x) = √(x - ${a}).`, 'y ≥ 0'],
        ]);
    }),

    band(11, 12, () => {
        const h = between(1, 6);
        const k = between(1, 6);
        return task([
            [`Describe the transformation from y = x² to y = (x - ${h})².`, `right ${h}`],
            [`Describe the transformation from y = x² to y = x² + ${k}.`, `up ${k}`],
            [`Describe the transformation from y = x² to y = -x².`, 'a reflection in the x-axis'],
            [`Describe the transformation from y = x² to y = ${k}x².`, `a vertical stretch by ${k}`],
            [`State the vertex of y = (x - ${h})² + ${k}.`, `(${h}, ${k})`],
        ]);
    }),

    band(11, 12, () => {
        const a = between(2, 5);
        const b = between(2, 5);
        return task([
            [`If f(x) = ${a}x and g(x) = x + ${b}, find f(g(x)).`, `${a}x + ${a * b}`],
            [`If f(x) = ${a}x and g(x) = x + ${b}, find g(f(x)).`, `${a}x + ${b}`],
            [`If f(x) = ${a}x and g(x) = x + ${b}, find f(g(1)).`, a * (1 + b)],
            [`Is f(g(x)) always equal to g(f(x))? Write yes or no.`, 'no'],
        ]);
    }),

    band(11, 12, () => {
        const degree = between(2, 5);
        const leading = pick([1, -1, 2, -3]);
        return task([
            [`State the degree of a polynomial whose highest term is ${leading}x^${degree}.`, degree],
            [`How many turning points can a degree ${degree} polynomial have at most?`, degree - 1],
            [`How many real roots can a degree ${degree} polynomial have at most?`, degree],
            [`As x → ∞, does ${leading}x^${degree} go up or down?`, leading > 0 ? 'up' : 'down'],
            [`Is a degree ${degree} polynomial's end behaviour the same on both sides?`, degree % 2 === 0 ? 'yes' : 'no'],
        ]);
    }),

    band(11, 12, () => {
        const base = between(2, 5);
        const start = pick([100, 200, 500]);
        return task([
            [`A quantity starts at ${start} and triples each hour. Write its equation after t hours.`, `y = ${start}(3^t)`],
            [`A quantity starts at ${start} and halves each hour. What is it after 3 hours?`, round2(start / 8)],
            [`State the y-intercept of y = ${start}(${base}^x).`, start],
            [`Is y = ${start}(${base}^x) growth or decay?`, base > 1 ? 'growth' : 'decay'],
            [`State the horizontal asymptote of y = ${start}(${base}^x).`, 'y = 0'],
        ]);
    }),

    band(11, 12, () => {
        const a = between(2, 6);
        const b = between(2, 6);
        return task([
            [`If f(x) = x² and g(x) = x + ${a}, find f(g(x)).`, `(x + ${a})²`],
            [`If f(x) = x², find f(${b}) - f(${a}).`, b * b - a * a],
            [`Is f(x) = x² one-to-one over all real numbers? Write yes or no.`, 'no'],
            [`State the range of f(x) = x² + ${a}.`, `y ≥ ${a}`],
            [`On what interval is f(x) = x² increasing?`, 'x ≥ 0'],
        ]);
    }),
];

export const EXTRA_PROBLEMS = { arithmetic, geometry, statistics, measurement, calculus, trigonometry, precalculus };

/**
 * Draws a supplementary problem for a subject at a grade.
 *
 * @param {string} subject
 * @param {number} grade
 * @returns {Problem|null} null when the subject has nothing banded to that grade
 */
export function drawExtraProblem(subject, grade) {
    const bank = EXTRA_PROBLEMS[subject];
    if (!bank) return null;

    const eligible = bank.filter((draw) => grade >= draw.grades[0] && grade <= draw.grades[1]);
    if (eligible.length === 0) return null;

    return randomChoice(eligible)();
}
