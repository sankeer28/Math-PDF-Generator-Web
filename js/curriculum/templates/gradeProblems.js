/**
 * Per-grade problem tables
 *
 * One entry per grade, keyed by operation, holding the draws that grade can
 * make. `any` is used where a grade's problems are not tied to a single
 * operation. Each draw returns { question, answer }; the `retry` argument
 * re-draws from the same list, for the few templates that can roll an invalid
 * pair (a subtraction that would go negative, say).
 *
 * Grades 9-12 are absent: their problems come from the subject generators
 * (algebra, geometry, pre-calculus, calculus) rather than from grade tables.
 *
 * @module curriculum/templates/gradeProblems
 */

/**
 * @typedef {object} GradeProblem
 * @property {string} question
 * @property {string|number} answer
 */

/**
 * @typedef {(retry: () => GradeProblem) => GradeProblem} GradeTemplate
 */

/** Equation-style problems. @type {Record<string, Record<string, GradeTemplate[]>>} */
export const GRADE_EQUATIONS = {
    grade1: {
        addition: [
            (retry) => { const a = Math.floor(Math.random() * 5) + 1; const b = Math.floor(Math.random() * 5) + 1; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const a = Math.floor(Math.random() * 10) + 1; return { question: `${a} + 1 = `, answer: a + 1 }; },
            (retry) => { const a = Math.floor(Math.random() * 8) + 2; return { question: `${a} + 2 = `, answer: a + 2 }; },
            (retry) => { const total = Math.floor(Math.random() * 10) + 3; const b = Math.floor(Math.random() * (total - 1)) + 1; return { question: `__ + ${b} = ${total}`, answer: total - b }; },
            (retry) => { const a = Math.floor(Math.random() * 5) + 1; const b = Math.floor(Math.random() * 5) + 1; const c = Math.floor(Math.random() * 3) + 1; return { question: `${a} + ${b} + ${c} = `, answer: a + b + c }; },
            (retry) => { const a = 10; const b = Math.floor(Math.random() * 5) + 1; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const a = Math.floor(Math.random() * 7) + 3; const b = Math.floor(Math.random() * 5) + 1; return { question: `${a} + ${b} = `, answer: a + b }; },
        ],
        subtraction: [
            (retry) => { const a = Math.floor(Math.random() * 8) + 3; const b = Math.floor(Math.random() * a) + 1; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = 10; const b = Math.floor(Math.random() * 9) + 1; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 5) + 6; const b = Math.floor(Math.random() * 3) + 1; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const answer = Math.floor(Math.random() * 5) + 1; const b = Math.floor(Math.random() * 5) + 1; const a = answer + b; return { question: `${a} - __ = ${answer}`, answer: b }; },
            (retry) => { const a = Math.floor(Math.random() * 10) + 5; return { question: `${a} - 0 = `, answer: a }; },
            (retry) => { const a = Math.floor(Math.random() * 8) + 2; return { question: `${a} - ${a} = `, answer: 0 }; },
            (retry) => { const a = Math.floor(Math.random() * 10) + 10; const b = Math.floor(Math.random() * 5) + 1; return { question: `${a} - ${b} = `, answer: a - b }; },
        ]
    },

    grade2: {
        addition: [
            (retry) => { const a = Math.floor(Math.random() * 30) + 10; const b = Math.floor(Math.random() * 30) + 10; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const a = Math.floor(Math.random() * 40) + 10; const b = Math.floor(Math.random() * 10) + 1; return { question: `${a} + ${b} (add ones) = `, answer: a + b }; },
            (retry) => { const a = Math.floor(Math.random() * 40) + 10; const b = 10; return { question: `${a} + ${b} (add tens) = `, answer: a + b }; },
            (retry) => { const total = Math.floor(Math.random() * 60) + 20; const b = Math.floor(Math.random() * 30) + 5; return { question: `__ + ${b} = ${total}`, answer: total - b }; },
            (retry) => { const a = Math.floor(Math.random() * 20) + 15; const b = Math.floor(Math.random() * 20) + 15; const c = Math.floor(Math.random() * 10) + 5; return { question: `${a} + ${b} + ${c} = `, answer: a + b + c }; },
            (retry) => { const a = Math.floor(Math.random() * 45) + 5; const b = Math.floor(Math.random() * 45) + 5; return { question: `${a} + ${b} (regroup) = `, answer: a + b }; },
            (retry) => { const tens = Math.floor(Math.random() * 4) + 2; const a = tens * 10; const b = Math.floor(Math.random() * 9) + 1; return { question: `${a} + ${b} = `, answer: a + b }; },
        ],
        subtraction: [
            (retry) => { const a = Math.floor(Math.random() * 50) + 20; const b = Math.floor(Math.random() * 30) + 5; if (b >= a) return retry(); return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 40) + 30; const b = Math.floor(Math.random() * 9) + 1; return { question: `${a} - ${b} (subtract ones) = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 70) + 30; const b = 10; return { question: `${a} - ${b} (subtract tens) = `, answer: a - b }; },
            (retry) => { const answer = Math.floor(Math.random() * 30) + 10; const b = Math.floor(Math.random() * 20) + 5; const a = answer + b; return { question: `${a} - __ = ${answer}`, answer: b }; },
            (retry) => { const a = Math.floor(Math.random() * 60) + 40; const b = Math.floor(Math.random() * 30) + 10; if (b >= a) return retry(); return { question: `${a} - ${b} (regroup) = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 80) + 20; const b = Math.floor(Math.random() * (a - 10)) + 5; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 50) + 25; const b = a - 10; return { question: `${a} - ${b} = `, answer: 10 }; },
        ],
        multiplication: [
            (retry) => { const a = Math.floor(Math.random() * 5) + 1; return { question: `${a} × 2 = `, answer: a * 2 }; },
            (retry) => { const a = Math.floor(Math.random() * 10) + 1; return { question: `${a} × 5 = `, answer: a * 5 }; },
            (retry) => { const a = Math.floor(Math.random() * 10) + 1; return { question: `${a} × 10 = `, answer: a * 10 }; },
            (retry) => { const groups = Math.floor(Math.random() * 5) + 2; const each = Math.floor(Math.random() * 5) + 2; return { question: `${groups} groups of ${each} = `, answer: groups * each }; },
            (retry) => { const a = Math.floor(Math.random() * 5) + 1; return { question: `Skip count by 2s: ${a} times = `, answer: a * 2 }; },
            (retry) => { const a = Math.floor(Math.random() * 5) + 1; return { question: `Double ${a} = `, answer: a * 2 }; },
            (retry) => { const a = Math.floor(Math.random() * 12) + 1; return { question: `${a} × 1 = `, answer: a }; },
        ]
    },

    grade3: {
        addition: [
            (retry) => { const a = Math.floor(Math.random() * 400) + 100; const b = Math.floor(Math.random() * 400) + 100; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const a = Math.floor(Math.random() * 500) + 100; const b = Math.floor(Math.random() * 99) + 1; return { question: `${a} + ${b} (add to hundreds) = `, answer: a + b }; },
            (retry) => { const a = Math.floor(Math.random() * 700) + 100; const b = Math.floor(Math.random() * 200) + 50; return { question: `${a} + ${b} (mental math) = `, answer: a + b }; },
            (retry) => { const total = Math.floor(Math.random() * 800) + 200; const b = Math.floor(Math.random() * 300) + 100; return { question: `__ + ${b} = ${total}`, answer: total - b }; },
            (retry) => { const a = Math.floor(Math.random() * 300) + 100; const b = Math.floor(Math.random() * 300) + 100; const c = Math.floor(Math.random() * 200) + 50; return { question: `${a} + ${b} + ${c} = `, answer: a + b + c }; },
            (retry) => { const a = Math.floor(Math.random() * 650) + 150; const b = Math.floor(Math.random() * 350) + 150; return { question: `${a} + ${b} (regroup hundreds) = `, answer: a + b }; },
            (retry) => { const a = (Math.floor(Math.random() * 9) + 1) * 100; const b = Math.floor(Math.random() * 99) + 1; return { question: `${a} + ${b} = `, answer: a + b }; },
        ],
        subtraction: [
            (retry) => { const a = Math.floor(Math.random() * 700) + 300; const b = Math.floor(Math.random() * 400) + 100; if (b >= a) return retry(); return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 600) + 400; const b = Math.floor(Math.random() * 99) + 1; return { question: `${a} - ${b} (subtract from hundreds) = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 800) + 200; const b = 100; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const answer = Math.floor(Math.random() * 400) + 100; const b = Math.floor(Math.random() * 300) + 100; const a = answer + b; return { question: `${a} - __ = ${answer}`, answer: b }; },
            (retry) => { const a = Math.floor(Math.random() * 600) + 400; const b = Math.floor(Math.random() * 300) + 150; if (b >= a) return retry(); return { question: `${a} - ${b} (regroup) = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 900) + 100; const b = Math.floor(Math.random() * (a - 50)) + 50; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = 1000; const b = Math.floor(Math.random() * 400) + 100; return { question: `${a} - ${b} = `, answer: a - b }; },
        ],
        multiplication: [
            (retry) => { const a = Math.floor(Math.random() * 10) + 1; const b = Math.floor(Math.random() * 10) + 1; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = Math.floor(Math.random() * 12) + 1; const b = Math.floor(Math.random() * 12) + 1; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = Math.floor(Math.random() * 9) + 1; const b = 0; return { question: `${a} × ${b} = `, answer: 0 }; },
            (retry) => { const a = Math.floor(Math.random() * 9) + 2; const b = Math.floor(Math.random() * 9) + 2; return { question: `__ × ${b} = ${a * b}`, answer: a }; },
            (retry) => { const a = Math.floor(Math.random() * 20) + 10; const b = 10; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = Math.floor(Math.random() * 12) + 1; return { question: `${a} × 6 = `, answer: a * 6 }; },
            (retry) => { const a = Math.floor(Math.random() * 12) + 1; return { question: `${a} × 8 = `, answer: a * 8 }; },
        ],
        division: [
            (retry) => { const b = Math.floor(Math.random() * 10) + 2; const a = b * (Math.floor(Math.random() * 10) + 1); return { question: `${a} ÷ ${b} = `, answer: a / b }; },
            (retry) => { const b = Math.floor(Math.random() * 5) + 2; const q = Math.floor(Math.random() * 12) + 1; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const a = Math.floor(Math.random() * 50) + 10; const b = 1; return { question: `${a} ÷ ${b} = `, answer: a }; },
            (retry) => { const a = Math.floor(Math.random() * 60) + 12; return { question: `${a} ÷ ${a} = `, answer: 1 }; },
            (retry) => { const q = Math.floor(Math.random() * 10) + 2; const b = Math.floor(Math.random() * 9) + 2; return { question: `__ ÷ ${b} = ${q}`, answer: q * b }; },
            (retry) => { const b = 10; const q = Math.floor(Math.random() * 10) + 1; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const b = Math.floor(Math.random() * 8) + 2; const q = Math.floor(Math.random() * 8) + 2; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
        ]
    },

    grade4: {
        addition: [
            (retry) => { const a = Math.floor(Math.random() * 5000) + 1000; const b = Math.floor(Math.random() * 5000) + 1000; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const a = Math.floor(Math.random() * 3000) + 2000; const b = Math.floor(Math.random() * 3000) + 2000; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const a = (Math.floor(Math.random() * 50) + 10) / 10; const b = (Math.floor(Math.random() * 50) + 10) / 10; return { question: `${a.toFixed(1)} + ${b.toFixed(1)} = `, answer: (a + b).toFixed(1) }; },
            (retry) => { const a = Math.floor(Math.random() * 8000) + 1000; const b = Math.floor(Math.random() * 2000) + 100; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const a = Math.floor(Math.random() * 4000) + 3000; const b = Math.floor(Math.random() * 4000) + 3000; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const a = (Math.floor(Math.random() * 30) + 5) / 10; const b = (Math.floor(Math.random() * 30) + 5) / 10; return { question: `${a.toFixed(1)} + ${b.toFixed(1)} = `, answer: (a + b).toFixed(1) }; },
            (retry) => { const a = Math.floor(Math.random() * 9999) + 1; const b = Math.floor(Math.random() * 9999) + 1; return { question: `${a} + ${b} = `, answer: a + b }; },
        ],
        subtraction: [
            (retry) => { const a = Math.floor(Math.random() * 5000) + 2000; const b = Math.floor(Math.random() * (a - 1000)) + 500; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 7000) + 3000; const b = Math.floor(Math.random() * 3000) + 1000; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = (Math.floor(Math.random() * 60) + 20) / 10; const b = (Math.floor(Math.random() * 30) + 5) / 10; return { question: `${a.toFixed(1)} - ${b.toFixed(1)} = `, answer: (a - b).toFixed(1) }; },
            (retry) => { const a = Math.floor(Math.random() * 9000) + 1000; const b = Math.floor(Math.random() * (a - 100)) + 100; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 8000) + 5000; const b = Math.floor(Math.random() * 4000) + 1000; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = (Math.floor(Math.random() * 50) + 10) / 10; const b = (Math.floor(Math.random() * 20) + 1) / 10; return { question: `${a.toFixed(1)} - ${b.toFixed(1)} = `, answer: (a - b).toFixed(1) }; },
            (retry) => { const a = Math.floor(Math.random() * 9999) + 1000; const b = Math.floor(Math.random() * (a - 500)) + 100; return { question: `${a} - ${b} = `, answer: a - b }; },
        ],
        multiplication: [
            (retry) => { const a = Math.floor(Math.random() * 50) + 10; const b = Math.floor(Math.random() * 50) + 10; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = Math.floor(Math.random() * 90) + 10; const b = Math.floor(Math.random() * 9) + 2; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = Math.floor(Math.random() * 12) + 1; const b = Math.floor(Math.random() * 12) + 1; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = Math.floor(Math.random() * 80) + 20; const b = 10; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = Math.floor(Math.random() * 30) + 10; const b = Math.floor(Math.random() * 30) + 10; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = Math.floor(Math.random() * 99) + 11; const b = Math.floor(Math.random() * 9) + 2; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = Math.floor(Math.random() * 20) + 5; const b = Math.floor(Math.random() * 20) + 5; return { question: `${a} × ${b} = `, answer: a * b }; },
        ],
        division: [
            (retry) => { const b = Math.floor(Math.random() * 12) + 1; const q = Math.floor(Math.random() * 50) + 10; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const b = Math.floor(Math.random() * 9) + 2; const q = Math.floor(Math.random() * 20) + 10; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const b = 10; const q = Math.floor(Math.random() * 90) + 10; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const b = Math.floor(Math.random() * 12) + 1; const q = Math.floor(Math.random() * 30) + 5; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const b = Math.floor(Math.random() * 8) + 2; const q = Math.floor(Math.random() * 99) + 11; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const b = 100; const q = Math.floor(Math.random() * 50) + 10; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const b = Math.floor(Math.random() * 9) + 2; const q = Math.floor(Math.random() * 15) + 5; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
        ]
    },

    grade5: {
        addition: [
            (retry) => { const a = (Math.floor(Math.random() * 500) + 100) / 100; const b = (Math.floor(Math.random() * 500) + 100) / 100; return { question: `${a.toFixed(2)} + ${b.toFixed(2)} = `, answer: (a + b).toFixed(2) }; },
            (retry) => { const a = (Math.floor(Math.random() * 300) + 50) / 100; const b = (Math.floor(Math.random() * 300) + 50) / 100; return { question: `${a.toFixed(2)} + ${b.toFixed(2)} = `, answer: (a + b).toFixed(2) }; },
            (retry) => { const d = 4; const n1 = Math.floor(Math.random() * 3) + 1; const n2 = Math.floor(Math.random() * 3) + 1; return { question: `${n1}/${d} + ${n2}/${d} = `, answer: `${n1 + n2}/${d}` }; },
            (retry) => { const a = (Math.floor(Math.random() * 900) + 100) / 100; const b = (Math.floor(Math.random() * 200) + 50) / 100; return { question: `${a.toFixed(2)} + ${b.toFixed(2)} = `, answer: (a + b).toFixed(2) }; },
            (retry) => { const d = 8; const n1 = Math.floor(Math.random() * 6) + 1; const n2 = Math.floor(Math.random() * 6) + 1; return { question: `${n1}/${d} + ${n2}/${d} = `, answer: `${n1 + n2}/${d}` }; },
            (retry) => { const a = (Math.floor(Math.random() * 800) + 200) / 100; const b = (Math.floor(Math.random() * 800) + 200) / 100; return { question: `${a.toFixed(2)} + ${b.toFixed(2)} = `, answer: (a + b).toFixed(2) }; },
            (retry) => { const d = 10; const n1 = Math.floor(Math.random() * 8) + 1; const n2 = Math.floor(Math.random() * 8) + 1; return { question: `${n1}/${d} + ${n2}/${d} = `, answer: `${n1 + n2}/${d}` }; },
        ],
        subtraction: [
            (retry) => { const a = (Math.floor(Math.random() * 500) + 200) / 100; const b = (Math.floor(Math.random() * 300) + 50) / 100; return { question: `${a.toFixed(2)} - ${b.toFixed(2)} = `, answer: (a - b).toFixed(2) }; },
            (retry) => { const a = (Math.floor(Math.random() * 800) + 300) / 100; const b = (Math.floor(Math.random() * 200) + 100) / 100; return { question: `${a.toFixed(2)} - ${b.toFixed(2)} = `, answer: (a - b).toFixed(2) }; },
            (retry) => { const d = 6; const n1 = Math.floor(Math.random() * 5) + 2; const n2 = Math.floor(Math.random() * n1) + 1; return { question: `${n1}/${d} - ${n2}/${d} = `, answer: `${n1 - n2}/${d}` }; },
            (retry) => { const a = (Math.floor(Math.random() * 900) + 400) / 100; const b = (Math.floor(Math.random() * 300) + 100) / 100; return { question: `${a.toFixed(2)} - ${b.toFixed(2)} = `, answer: (a - b).toFixed(2) }; },
            (retry) => { const d = 8; const n1 = Math.floor(Math.random() * 7) + 3; const n2 = Math.floor(Math.random() * n1) + 1; return { question: `${n1}/${d} - ${n2}/${d} = `, answer: `${n1 - n2}/${d}` }; },
            (retry) => { const a = (Math.floor(Math.random() * 1000) + 500) / 100; const b = (Math.floor(Math.random() * 400) + 100) / 100; return { question: `${a.toFixed(2)} - ${b.toFixed(2)} = `, answer: (a - b).toFixed(2) }; },
            (retry) => { const d = 12; const n1 = Math.floor(Math.random() * 10) + 4; const n2 = Math.floor(Math.random() * n1) + 1; return { question: `${n1}/${d} - ${n2}/${d} = `, answer: `${n1 - n2}/${d}` }; },
        ],
        multiplication: [
            (retry) => { const a = Math.floor(Math.random() * 90) + 10; const b = Math.floor(Math.random() * 90) + 10; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = (Math.floor(Math.random() * 50) + 10) / 10; const b = Math.floor(Math.random() * 9) + 2; return { question: `${a.toFixed(1)} × ${b} = `, answer: (a * b).toFixed(1) }; },
            (retry) => { const d = 4; const n = Math.floor(Math.random() * 3) + 1; const w = Math.floor(Math.random() * 5) + 2; return { question: `${n}/${d} × ${w} = `, answer: `${n * w}/${d}` }; },
            (retry) => { const a = Math.floor(Math.random() * 99) + 11; const b = Math.floor(Math.random() * 99) + 11; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = (Math.floor(Math.random() * 30) + 5) / 10; const b = Math.floor(Math.random() * 12) + 1; return { question: `${a.toFixed(1)} × ${b} = `, answer: (a * b).toFixed(1) }; },
            (retry) => { const a = Math.floor(Math.random() * 999) + 100; const b = Math.floor(Math.random() * 90) + 10; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const d = 5; const n = Math.floor(Math.random() * 4) + 1; const w = Math.floor(Math.random() * 8) + 2; return { question: `${n}/${d} × ${w} = `, answer: `${n * w}/${d}` }; },
        ],
        division: [
            (retry) => { const b = Math.floor(Math.random() * 90) + 10; const q = Math.floor(Math.random() * 90) + 10; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const b = Math.floor(Math.random() * 12) + 1; const q = Math.floor(Math.random() * 99) + 11; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const a = (Math.floor(Math.random() * 500) + 100) / 10; const b = 10; return { question: `${a.toFixed(1)} ÷ ${b} = `, answer: (a / b).toFixed(1) }; },
            (retry) => { const b = Math.floor(Math.random() * 99) + 11; const q = Math.floor(Math.random() * 50) + 10; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const a = (Math.floor(Math.random() * 800) + 200) / 10; const b = Math.floor(Math.random() * 9) + 2; return { question: `${a.toFixed(1)} ÷ ${b} = `, answer: (a / b).toFixed(1) }; },
            (retry) => { const b = Math.floor(Math.random() * 50) + 10; const q = Math.floor(Math.random() * 99) + 11; const a = b * q; return { question: `${a} ÷ ${b} = `, answer: q }; },
            (retry) => { const d = 6; const n = Math.floor(Math.random() * 5) + 1; const div = Math.floor(Math.random() * 4) + 2; return { question: `${n}/${d} ÷ ${div} = `, answer: `${n}/${d * div}` }; },
        ]
    },

    grade6: {
        addition: [
            (retry) => { const a = Math.floor(Math.random() * 20) - 10; const b = Math.floor(Math.random() * 20) - 10; return { question: `${a} + (${b}) = `, answer: a + b }; },
            (retry) => { const a = -Math.floor(Math.random() * 15) - 1; const b = Math.floor(Math.random() * 15) + 1; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const n1 = Math.floor(Math.random() * 5) + 1; const n2 = Math.floor(Math.random() * 5) + 1; const d1 = [2, 3, 4, 6][Math.floor(Math.random() * 4)]; const d2 = [2, 3, 4, 6][Math.floor(Math.random() * 4)]; return { question: `${n1}/${d1} + ${n2}/${d2} = `, answer: `(different denominators)` }; },
            (retry) => { const a = Math.floor(Math.random() * 30) - 15; const b = Math.floor(Math.random() * 30) - 15; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const a = (Math.floor(Math.random() * 1000) + 500) / 100; const b = (Math.floor(Math.random() * 1000) + 500) / 100; return { question: `${a.toFixed(2)} + ${b.toFixed(2)} = `, answer: (a + b).toFixed(2) }; },
            (retry) => { const a = -Math.floor(Math.random() * 25) - 5; const b = -Math.floor(Math.random() * 25) - 5; return { question: `${a} + (${b}) = `, answer: a + b }; },
            (retry) => { const pct1 = Math.floor(Math.random() * 30) + 10; const pct2 = Math.floor(Math.random() * 30) + 10; return { question: `${pct1}% + ${pct2}% = `, answer: `${pct1 + pct2}%` }; },
        ],
        subtraction: [
            (retry) => { const a = Math.floor(Math.random() * 20) - 10; const b = Math.floor(Math.random() * 20) - 10; return { question: `${a} - (${b}) = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 15) + 1; const b = -Math.floor(Math.random() * 15) - 1; return { question: `${a} - (${b}) = `, answer: a - b }; },
            (retry) => { const n1 = Math.floor(Math.random() * 7) + 2; const n2 = Math.floor(Math.random() * 5) + 1; const d1 = [2, 4, 8][Math.floor(Math.random() * 3)]; const d2 = [2, 4, 8][Math.floor(Math.random() * 3)]; return { question: `${n1}/${d1} - ${n2}/${d2} = `, answer: `(different denominators)` }; },
            (retry) => { const a = Math.floor(Math.random() * 30) - 15; const b = Math.floor(Math.random() * 30) - 15; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const a = (Math.floor(Math.random() * 1200) + 600) / 100; const b = (Math.floor(Math.random() * 500) + 200) / 100; return { question: `${a.toFixed(2)} - ${b.toFixed(2)} = `, answer: (a - b).toFixed(2) }; },
            (retry) => { const a = -Math.floor(Math.random() * 20) - 5; const b = Math.floor(Math.random() * 20) + 5; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const pct1 = Math.floor(Math.random() * 50) + 30; const pct2 = Math.floor(Math.random() * 30) + 10; return { question: `${pct1}% - ${pct2}% = `, answer: `${pct1 - pct2}%` }; },
        ],
        multiplication: [
            (retry) => { const a = Math.floor(Math.random() * 10) - 5; const b = Math.floor(Math.random() * 10) - 5; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = -Math.floor(Math.random() * 12) - 1; const b = Math.floor(Math.random() * 12) + 1; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const n1 = Math.floor(Math.random() * 5) + 1; const d1 = Math.floor(Math.random() * 5) + 2; const n2 = Math.floor(Math.random() * 5) + 1; const d2 = Math.floor(Math.random() * 5) + 2; return { question: `${n1}/${d1} × ${n2}/${d2} = `, answer: `${n1 * n2}/${d1 * d2}` }; },
            (retry) => { const a = (Math.floor(Math.random() * 50) + 10) / 10; const b = (Math.floor(Math.random() * 50) + 10) / 10; return { question: `${a.toFixed(1)} × ${b.toFixed(1)} = `, answer: (a * b).toFixed(2) }; },
            (retry) => { const a = -Math.floor(Math.random() * 15) - 2; const b = -Math.floor(Math.random() * 15) - 2; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const base = Math.floor(Math.random() * 80) + 20; const pct = Math.floor(Math.random() * 30) + 10; return { question: `${pct}% of ${base} = `, answer: Math.round(base * pct / 100) }; },
            (retry) => { const a = Math.floor(Math.random() * 999) + 100; const b = Math.floor(Math.random() * 999) + 100; return { question: `${a} × ${b} = `, answer: a * b }; },
        ],
        division: [
            (retry) => { const a = Math.floor(Math.random() * 20) - 10; const b = [2, 3, 4, 5][Math.floor(Math.random() * 4)]; return { question: `${a} ÷ ${b} = `, answer: (a / b).toFixed(2) }; },
            (retry) => { const b = -Math.floor(Math.random() * 9) - 2; const q = Math.floor(Math.random() * 10) + 1; const a = b * q; return { question: `${a} ÷ (${b}) = `, answer: q }; },
            (retry) => { const n1 = Math.floor(Math.random() * 5) + 1; const d1 = Math.floor(Math.random() * 5) + 2; const n2 = Math.floor(Math.random() * 4) + 1; const d2 = Math.floor(Math.random() * 4) + 2; return { question: `${n1}/${d1} ÷ ${n2}/${d2} = `, answer: `${n1 * d2}/${d1 * n2}` }; },
            (retry) => { const a = (Math.floor(Math.random() * 500) + 100) / 100; const b = (Math.floor(Math.random() * 20) + 5) / 10; return { question: `${a.toFixed(2)} ÷ ${b.toFixed(1)} = `, answer: (a / b).toFixed(2) }; },
            (retry) => { const a = -Math.floor(Math.random() * 50) - 10; const b = Math.floor(Math.random() * 9) + 2; return { question: `${a} ÷ ${b} = `, answer: (a / b).toFixed(2) }; },
            (retry) => { const ratio = `${Math.floor(Math.random() * 5) + 2}:${Math.floor(Math.random() * 5) + 2}`; const total = Math.floor(Math.random() * 80) + 40; return { question: `Divide ${total} in ratio ${ratio}`, answer: `(ratio problem)` }; },
            (retry) => { const a = Math.floor(Math.random() * 500) + 100; const b = Math.floor(Math.random() * 50) + 10; return { question: `${a} ÷ ${b} = `, answer: (a / b).toFixed(2) }; },
        ]
    },

    grade7: {
        addition: [
            (retry) => { const a = Math.floor(Math.random() * 40) - 20; const b = Math.floor(Math.random() * 40) - 20; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const a = -Math.floor(Math.random() * 30) - 5; const b = -Math.floor(Math.random() * 30) - 5; return { question: `${a} + (${b}) = `, answer: a + b }; },
            (retry) => { const w1 = Math.floor(Math.random() * 3) + 1; const n1 = Math.floor(Math.random() * 5) + 1; const d1 = Math.floor(Math.random() * 5) + 3; const w2 = Math.floor(Math.random() * 3) + 1; const n2 = Math.floor(Math.random() * 5) + 1; const d2 = Math.floor(Math.random() * 5) + 3; return { question: `${w1} ${n1}/${d1} + ${w2} ${n2}/${d2} = `, answer: `(mixed numbers)` }; },
            (retry) => { const a = Math.floor(Math.random() * 50) - 25; const b = Math.floor(Math.random() * 50) - 25; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const n1 = Math.floor(Math.random() * 8) + 1; const d1 = [3, 4, 5, 6, 8, 10, 12][Math.floor(Math.random() * 7)]; const n2 = Math.floor(Math.random() * 8) + 1; const d2 = [3, 4, 5, 6, 8, 10, 12][Math.floor(Math.random() * 7)]; return { question: `${n1}/${d1} + ${n2}/${d2} = `, answer: `(find LCD)` }; },
            (retry) => { const a = (Math.floor(Math.random() * 2000) + 1000) / 100; const b = (Math.floor(Math.random() * 2000) + 1000) / 100; return { question: `${a.toFixed(2)} + ${b.toFixed(2)} = `, answer: (a + b).toFixed(2) }; },
            (retry) => { const base1 = Math.floor(Math.random() * 15) + 5; const exp1 = 2; const base2 = Math.floor(Math.random() * 15) + 5; const exp2 = 2; return { question: `${base1}² + ${base2}² = `, answer: base1 ** exp1 + base2 ** exp2 }; },
        ],
        subtraction: [
            (retry) => { const a = Math.floor(Math.random() * 40) - 20; const b = Math.floor(Math.random() * 40) - 20; return { question: `${a} - (${b}) = `, answer: a - b }; },
            (retry) => { const a = Math.floor(Math.random() * 30) + 10; const b = -Math.floor(Math.random() * 30) - 10; return { question: `${a} - (${b}) = `, answer: a - b }; },
            (retry) => { const w1 = Math.floor(Math.random() * 4) + 2; const n1 = Math.floor(Math.random() * 6) + 1; const d1 = Math.floor(Math.random() * 5) + 4; const w2 = Math.floor(Math.random() * 3) + 1; const n2 = Math.floor(Math.random() * 5) + 1; const d2 = Math.floor(Math.random() * 5) + 4; return { question: `${w1} ${n1}/${d1} - ${w2} ${n2}/${d2} = `, answer: `(mixed numbers)` }; },
            (retry) => { const a = Math.floor(Math.random() * 50) - 25; const b = Math.floor(Math.random() * 50) - 25; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const n1 = Math.floor(Math.random() * 10) + 3; const d1 = [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)]; const n2 = Math.floor(Math.random() * 8) + 1; const d2 = [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)]; return { question: `${n1}/${d1} - ${n2}/${d2} = `, answer: `(find LCD)` }; },
            (retry) => { const a = (Math.floor(Math.random() * 2500) + 1500) / 100; const b = (Math.floor(Math.random() * 1000) + 500) / 100; return { question: `${a.toFixed(2)} - ${b.toFixed(2)} = `, answer: (a - b).toFixed(2) }; },
            (retry) => { const base1 = Math.floor(Math.random() * 20) + 10; const exp1 = 2; const base2 = Math.floor(Math.random() * 15) + 5; const exp2 = 2; return { question: `${base1}² - ${base2}² = `, answer: base1 ** exp1 - base2 ** exp2 }; },
        ],
        multiplication: [
            (retry) => { const a = Math.floor(Math.random() * 20) - 10; const b = Math.floor(Math.random() * 20) - 10; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const a = -Math.floor(Math.random() * 15) - 3; const b = -Math.floor(Math.random() * 15) - 3; return { question: `(${a}) × (${b}) = `, answer: a * b }; },
            (retry) => { const w = Math.floor(Math.random() * 3) + 1; const n = Math.floor(Math.random() * 5) + 1; const d = Math.floor(Math.random() * 5) + 3; const mult = Math.floor(Math.random() * 8) + 2; return { question: `${w} ${n}/${d} × ${mult} = `, answer: `(mixed × whole)` }; },
            (retry) => { const base = Math.floor(Math.random() * 8) + 2; const exp = Math.floor(Math.random() * 3) + 2; return { question: `${base}^${exp} = `, answer: base ** exp }; },
            (retry) => { const n1 = Math.floor(Math.random() * 8) + 1; const d1 = Math.floor(Math.random() * 8) + 2; const n2 = Math.floor(Math.random() * 8) + 1; const d2 = Math.floor(Math.random() * 8) + 2; return { question: `${n1}/${d1} × ${n2}/${d2} = `, answer: `${n1 * n2}/${d1 * d2}` }; },
            (retry) => { const a = (Math.floor(Math.random() * 100) + 50) / 10; const b = (Math.floor(Math.random() * 100) + 50) / 10; return { question: `${a.toFixed(1)} × ${b.toFixed(1)} = `, answer: (a * b).toFixed(2) }; },
            (retry) => { const coeff = Math.floor(Math.random() * 8) + 2; const x = Math.floor(Math.random() * 10) + 1; return { question: `${coeff}x when x = ${x}`, answer: coeff * x }; },
        ],
        division: [
            (retry) => { const a = Math.floor(Math.random() * 40) - 20; const b = [2, 3, 4, 5, -2, -3, -4, -5][Math.floor(Math.random() * 8)]; return { question: `${a} ÷ ${b} = `, answer: (a / b).toFixed(2) }; },
            (retry) => { const a = -Math.floor(Math.random() * 50) - 10; const b = -Math.floor(Math.random() * 9) - 2; return { question: `${a} ÷ (${b}) = `, answer: (a / b).toFixed(2) }; },
            (retry) => { const n1 = Math.floor(Math.random() * 7) + 2; const d1 = Math.floor(Math.random() * 7) + 3; const n2 = Math.floor(Math.random() * 6) + 2; const d2 = Math.floor(Math.random() * 6) + 3; return { question: `${n1}/${d1} ÷ ${n2}/${d2} = `, answer: `${n1 * d2}/${d1 * n2}` }; },
            (retry) => { const a = (Math.floor(Math.random() * 800) + 200) / 100; const b = (Math.floor(Math.random() * 40) + 10) / 10; return { question: `${a.toFixed(2)} ÷ ${b.toFixed(1)} = `, answer: (a / b).toFixed(2) }; },
            (retry) => { const w = Math.floor(Math.random() * 4) + 2; const n = Math.floor(Math.random() * 6) + 1; const d = Math.floor(Math.random() * 6) + 3; const div = Math.floor(Math.random() * 5) + 2; return { question: `${w} ${n}/${d} ÷ ${div} = `, answer: `(mixed ÷ whole)` }; },
            (retry) => { const base = Math.floor(Math.random() * 6) + 2; const exp = Math.floor(Math.random() * 3) + 2; const div = Math.floor(Math.random() * 10) + 2; return { question: `${base}^${exp} ÷ ${div} = `, answer: (base ** exp / div).toFixed(2) }; },
            (retry) => { const expr = Math.floor(Math.random() * 50) + 20; const x = Math.floor(Math.random() * 8) + 2; return { question: `${expr}x ÷ ${x} = `, answer: expr }; },
        ]
    },

    grade8: {
        addition: [
            (retry) => { const a = Math.floor(Math.random() * 60) - 30; const b = Math.floor(Math.random() * 60) - 30; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const base1 = Math.floor(Math.random() * 12) + 4; const base2 = Math.floor(Math.random() * 12) + 4; return { question: `${base1}² + ${base2}² = `, answer: base1 ** 2 + base2 ** 2 }; },
            (retry) => { const coeff1 = Math.floor(Math.random() * 9) + 1; const coeff2 = Math.floor(Math.random() * 9) + 1; return { question: `${coeff1}x + ${coeff2}x = `, answer: `${coeff1 + coeff2}x` }; },
            (retry) => { const mant1 = (Math.floor(Math.random() * 50) + 10) / 10; const mant2 = (Math.floor(Math.random() * 50) + 10) / 10; const exp = Math.floor(Math.random() * 4) + 2; return { question: `${mant1} × 10^${exp} + ${mant2} × 10^${exp} = `, answer: `${(mant1 + mant2).toFixed(1)} × 10^${exp}` }; },
            (retry) => { const a = Math.floor(Math.random() * 80) - 40; const b = Math.floor(Math.random() * 80) - 40; return { question: `${a} + ${b} = `, answer: a + b }; },
            (retry) => { const sqrt1 = Math.floor(Math.random() * 5) + 2; const sqrt2 = Math.floor(Math.random() * 5) + 2; return { question: `√${sqrt1 ** 2} + √${sqrt2 ** 2} = `, answer: sqrt1 + sqrt2 }; },
            (retry) => { const coeff1 = Math.floor(Math.random() * 8) + 2; const const1 = Math.floor(Math.random() * 15) + 5; const coeff2 = Math.floor(Math.random() * 8) + 2; const const2 = Math.floor(Math.random() * 15) + 5; return { question: `(${coeff1}x + ${const1}) + (${coeff2}x + ${const2}) = `, answer: `${coeff1 + coeff2}x + ${const1 + const2}` }; },
        ],
        subtraction: [
            (retry) => { const a = Math.floor(Math.random() * 60) - 30; const b = Math.floor(Math.random() * 60) - 30; return { question: `${a} - (${b}) = `, answer: a - b }; },
            (retry) => { const base1 = Math.floor(Math.random() * 15) + 8; const base2 = Math.floor(Math.random() * 12) + 4; return { question: `${base1}² - ${base2}² = `, answer: base1 ** 2 - base2 ** 2 }; },
            (retry) => { const coeff1 = Math.floor(Math.random() * 12) + 5; const coeff2 = Math.floor(Math.random() * 9) + 1; return { question: `${coeff1}x - ${coeff2}x = `, answer: `${coeff1 - coeff2}x` }; },
            (retry) => { const mant1 = (Math.floor(Math.random() * 70) + 30) / 10; const mant2 = (Math.floor(Math.random() * 40) + 10) / 10; const exp = Math.floor(Math.random() * 4) + 2; return { question: `${mant1} × 10^${exp} - ${mant2} × 10^${exp} = `, answer: `${(mant1 - mant2).toFixed(1)} × 10^${exp}` }; },
            (retry) => { const a = Math.floor(Math.random() * 80) - 40; const b = Math.floor(Math.random() * 80) - 40; return { question: `${a} - ${b} = `, answer: a - b }; },
            (retry) => { const sqrt1 = Math.floor(Math.random() * 7) + 5; const sqrt2 = Math.floor(Math.random() * 5) + 2; return { question: `√${sqrt1 ** 2} - √${sqrt2 ** 2} = `, answer: sqrt1 - sqrt2 }; },
            (retry) => { const coeff1 = Math.floor(Math.random() * 10) + 5; const const1 = Math.floor(Math.random() * 20) + 10; const coeff2 = Math.floor(Math.random() * 8) + 2; const const2 = Math.floor(Math.random() * 15) + 5; return { question: `(${coeff1}x + ${const1}) - (${coeff2}x + ${const2}) = `, answer: `${coeff1 - coeff2}x + ${const1 - const2}` }; },
        ],
        multiplication: [
            (retry) => { const base = Math.floor(Math.random() * 10) + 2; const exp = Math.floor(Math.random() * 4) + 2; return { question: `${base}^${exp} = `, answer: base ** exp }; },
            (retry) => { const a = Math.floor(Math.random() * 20) - 10; const b = Math.floor(Math.random() * 20) - 10; return { question: `${a} × ${b} = `, answer: a * b }; },
            (retry) => { const coeff = Math.floor(Math.random() * 12) + 2; const x = Math.floor(Math.random() * 15) + 1; return { question: `${coeff}x when x = ${x}`, answer: coeff * x }; },
            (retry) => { const mant1 = (Math.floor(Math.random() * 50) + 10) / 10; const exp1 = Math.floor(Math.random() * 4) + 2; const mant2 = (Math.floor(Math.random() * 50) + 10) / 10; const exp2 = Math.floor(Math.random() * 4) + 2; return { question: `(${mant1} × 10^${exp1}) × (${mant2} × 10^${exp2}) = `, answer: `${(mant1 * mant2).toFixed(2)} × 10^${exp1 + exp2}` }; },
            (retry) => { const base = Math.floor(Math.random() * 6) + 2; const exp1 = Math.floor(Math.random() * 3) + 2; const exp2 = Math.floor(Math.random() * 3) + 2; return { question: `${base}^${exp1} × ${base}^${exp2} = `, answer: `${base}^${exp1 + exp2}` }; },
            (retry) => { const coeff1 = Math.floor(Math.random() * 8) + 2; const coeff2 = Math.floor(Math.random() * 8) + 2; return { question: `${coeff1}x × ${coeff2} = `, answer: `${coeff1 * coeff2}x` }; },
            (retry) => { const a = -Math.floor(Math.random() * 15) - 3; const b = -Math.floor(Math.random() * 15) - 3; return { question: `${a} × ${b} = `, answer: a * b }; },
        ],
        division: [
            (retry) => { const base = Math.floor(Math.random() * 8) + 2; const exp = Math.floor(Math.random() * 4) + 2; const div = Math.floor(Math.random() * 20) + 5; return { question: `${base}^${exp} ÷ ${div} = `, answer: (base ** exp / div).toFixed(2) }; },
            (retry) => { const a = Math.floor(Math.random() * 60) - 30; const b = [2, 3, 4, 5, -2, -3, -4, -5][Math.floor(Math.random() * 8)]; return { question: `${a} ÷ ${b} = `, answer: (a / b).toFixed(2) }; },
            (retry) => { const expr = Math.floor(Math.random() * 80) + 20; const coeff = Math.floor(Math.random() * 10) + 2; return { question: `${expr}x ÷ ${coeff} = `, answer: `${(expr / coeff).toFixed(2)}x` }; },
            (retry) => { const mant1 = (Math.floor(Math.random() * 80) + 20) / 10; const exp1 = Math.floor(Math.random() * 5) + 3; const mant2 = (Math.floor(Math.random() * 40) + 10) / 10; const exp2 = Math.floor(Math.random() * 3) + 1; return { question: `(${mant1} × 10^${exp1}) ÷ (${mant2} × 10^${exp2}) = `, answer: `${(mant1 / mant2).toFixed(2)} × 10^${exp1 - exp2}` }; },
            (retry) => { const base = Math.floor(Math.random() * 6) + 2; const exp1 = Math.floor(Math.random() * 4) + 4; const exp2 = Math.floor(Math.random() * 3) + 1; return { question: `${base}^${exp1} ÷ ${base}^${exp2} = `, answer: `${base}^${exp1 - exp2}` }; },
            (retry) => { const perfect = [4, 9, 16, 25, 36, 49, 64, 81, 100][Math.floor(Math.random() * 9)]; return { question: `√${perfect} = `, answer: Math.sqrt(perfect) }; },
            (retry) => { const a = -Math.floor(Math.random() * 60) - 20; const b = -Math.floor(Math.random() * 9) - 2; return { question: `${a} ÷ (${b}) = `, answer: (a / b).toFixed(2) }; },
        ]
    },
};

/** Word problems in grade-appropriate contexts. @type {Record<string, Record<string, GradeTemplate[]>>} */
export const GRADE_WORD_PROBLEMS = {
    grade1: {
        addition: [
            (retry) => {
                const a = Math.floor(Math.random() * 5) + 1;
                const b = Math.floor(Math.random() * 5) + 1;
                return { question: `You have ${a} apples. Your friend gives you ${b} more apples. How many apples do you have now?`, answer: a + b };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 5) + 1;
                return { question: `There are ${a} birds in a tree. ${b} more birds fly to the tree. How many birds are there in total?`, answer: a + b };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 6) + 1;
                const b = Math.floor(Math.random() * 6) + 1;
                return { question: `Sam has ${a} toys. Emma has ${b} toys. How many toys do they have together?`, answer: a + b };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 7) + 3;
                const b = Math.floor(Math.random() * 5) + 1;
                return { question: `A basket has ${a} oranges. You add ${b} more oranges. How many oranges are in the basket?`, answer: a + b };
            },
        ],
        subtraction: [
            (retry) => {
                const a = Math.floor(Math.random() * 8) + 3;
                const b = Math.floor(Math.random() * a) + 1;
                return { question: `You have ${a} cookies. You eat ${b} cookies. How many cookies are left?`, answer: a - b };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 10) + 5;
                const b = Math.floor(Math.random() * (a - 2)) + 1;
                return { question: `There are ${a} flowers in a garden. ${b} flowers are picked. How many flowers remain?`, answer: a - b };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 9) + 4;
                const b = Math.floor(Math.random() * (a - 1)) + 1;
                return { question: `A pond has ${a} ducks. ${b} ducks swim away. How many ducks are still in the pond?`, answer: a - b };
            },
        ]
    },

    grade2: {
        addition: [
            (retry) => {
                const a = Math.floor(Math.random() * 30) + 10;
                const b = Math.floor(Math.random() * 30) + 10;
                return { question: `A classroom has ${a} pencils and ${b} crayons. How many writing tools are there in total?`, answer: a + b };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 25) + 15;
                const b = Math.floor(Math.random() * 25) + 15;
                return { question: `On Monday, ${a} students rode the bus. On Tuesday, ${b} students rode the bus. How many students rode the bus on both days?`, answer: a + b };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 40) + 20;
                const b = Math.floor(Math.random() * 30) + 10;
                return { question: `A library has ${a} fiction books and ${b} non-fiction books. How many books does the library have?`, answer: a + b };
            },
        ],
        subtraction: [
            (retry) => {
                const a = Math.floor(Math.random() * 50) + 20;
                const b = Math.floor(Math.random() * 20) + 5;
                return { question: `There are ${a} students in the playground. ${b} students go inside. How many students are still in the playground?`, answer: a - b };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 60) + 30;
                const b = Math.floor(Math.random() * 25) + 10;
                return { question: `A store had ${a} balloons. ${b} balloons were sold. How many balloons are left?`, answer: a - b };
            },
        ],
        multiplication: [
            (retry) => {
                const a = Math.floor(Math.random() * 5) + 1;
                const b = 2;
                return { question: `There are ${a} pairs of shoes. How many shoes are there in total?`, answer: a * b };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 4) + 2;
                const b = 5;
                return { question: `You have ${a} hands. Each hand has ${b} fingers. How many fingers in total?`, answer: a * b };
            },
        ]
    },

    grade3: {
        addition: [
            (retry) => {
                const a = Math.floor(Math.random() * 300) + 100;
                const b = Math.floor(Math.random() * 300) + 100;
                return { question: `A school collected ${a} cans in Week 1 and ${b} cans in Week 2 for recycling. How many cans were collected in total?`, answer: a + b };
            },
            (retry) => {
                const dollars = Math.floor(Math.random() * 5) + 3;
                const cents = Math.floor(Math.random() * 50) + 25;
                return { question: `You have $${dollars}.${cents}. You earn $2.50 more. How much money do you have now?`, answer: `$${dollars + 2}.${cents + 50 > 99 ? (cents + 50 - 100).toString().padStart(2, '0') : (cents + 50).toString().padStart(2, '0')}` };
            },
        ],
        subtraction: [
            (retry) => {
                const a = Math.floor(Math.random() * 500) + 200;
                const b = Math.floor(Math.random() * 200) + 50;
                return { question: `A bakery made ${a} cookies. They sold ${b} cookies. How many cookies are left?`, answer: a - b };
            },
        ],
        multiplication: [
            (retry) => {
                const a = Math.floor(Math.random() * 8) + 3;
                const b = Math.floor(Math.random() * 8) + 3;
                return { question: `A bookshelf has ${a} shelves. Each shelf has ${b} books. How many books are there in total?`, answer: a * b };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 10) + 2;
                const b = Math.floor(Math.random() * 9) + 2;
                return { question: `There are ${a} boxes. Each box contains ${b} markers. How many markers are there altogether?`, answer: a * b };
            },
            (retry) => {
                const price = Math.floor(Math.random() * 5) + 2;
                const qty = Math.floor(Math.random() * 6) + 3;
                return { question: `One notebook costs $${price}. How much do ${qty} notebooks cost?`, answer: `$${price * qty}` };
            },
        ],
        division: [
            (retry) => {
                const b = Math.floor(Math.random() * 8) + 3;
                const q = Math.floor(Math.random() * 9) + 2;
                const a = b * q;
                return { question: `${a} students are divided equally into ${b} groups. How many students are in each group?`, answer: q };
            },
            (retry) => {
                const b = Math.floor(Math.random() * 6) + 4;
                const q = Math.floor(Math.random() * 8) + 3;
                const a = b * q;
                return { question: `A teacher has ${a} stickers to share equally among ${b} students. How many stickers does each student get?`, answer: q };
            },
        ]
    },

    grade4: {
        addition: [
            (retry) => {
                const a = (Math.floor(Math.random() * 30) + 10) / 10;
                const b = (Math.floor(Math.random() * 30) + 10) / 10;
                return { question: `A recipe needs ${a.toFixed(1)} cups of flour and ${b.toFixed(1)} cups of sugar. How many cups of dry ingredients are needed in total?`, answer: `${(a + b).toFixed(1)} cups` };
            },
            (retry) => {
                const miles1 = Math.floor(Math.random() * 2000) + 1000;
                const miles2 = Math.floor(Math.random() * 1500) + 500;
                return { question: `A family drove ${miles1} miles on Saturday and ${miles2} miles on Sunday. How many total miles did they drive over the weekend?`, answer: `${miles1 + miles2} miles` };
            },
        ],
        subtraction: [
            (retry) => {
                const a = (Math.floor(Math.random() * 50) + 20) / 10;
                const b = (Math.floor(Math.random() * 20) + 5) / 10;
                return { question: `A water bottle holds ${a.toFixed(1)} liters. After drinking ${b.toFixed(1)} liters, how much water remains?`, answer: `${(a - b).toFixed(1)} liters` };
            },
        ],
        multiplication: [
            (retry) => {
                const length = Math.floor(Math.random() * 30) + 15;
                const width = Math.floor(Math.random() * 20) + 10;
                return { question: `A rectangular garden is ${length} feet long and ${width} feet wide. What is the area of the garden?`, answer: `${length * width} square feet` };
            },
            (retry) => {
                const price = (Math.floor(Math.random() * 50) + 25) / 10;
                const qty = Math.floor(Math.random() * 12) + 8;
                return { question: `One pencil costs $${price.toFixed(2)}. How much would ${qty} pencils cost?`, answer: `$${(price * qty).toFixed(2)}` };
            },
        ],
        division: [
            (retry) => {
                const total = Math.floor(Math.random() * 500) + 200;
                const people = Math.floor(Math.random() * 8) + 4;
                return { question: `A prize of $${total} is shared equally among ${people} winners. How much does each winner receive?`, answer: `$${(total / people).toFixed(2)}` };
            },
        ]
    },

    grade5: {
        addition: [
            (retry) => {
                const a = (Math.floor(Math.random() * 300) + 100) / 100;
                const b = (Math.floor(Math.random() * 300) + 100) / 100;
                return { question: `Sarah ran ${a.toFixed(2)} kilometers on Monday and ${b.toFixed(2)} kilometers on Wednesday. What is the total distance she ran?`, answer: `${(a + b).toFixed(2)} km` };
            },
            (retry) => {
                const d = 8;
                const n1 = Math.floor(Math.random() * 5) + 1;
                const n2 = Math.floor(Math.random() * 5) + 1;
                return { question: `A recipe calls for ${n1}/${d} cup of milk and ${n2}/${d} cup of cream. How many cups of liquid are needed in total?`, answer: `${n1 + n2}/${d} cups` };
            },
        ],
        subtraction: [
            (retry) => {
                const a = (Math.floor(Math.random() * 500) + 200) / 100;
                const b = (Math.floor(Math.random() * 200) + 50) / 100;
                return { question: `A rope is ${a.toFixed(2)} meters long. ${b.toFixed(2)} meters are cut off. How much rope remains?`, answer: `${(a - b).toFixed(2)} meters` };
            },
        ],
        multiplication: [
            (retry) => {
                const length = Math.floor(Math.random() * 50) + 30;
                const width = Math.floor(Math.random() * 40) + 20;
                const height = Math.floor(Math.random() * 15) + 10;
                return { question: `A rectangular box is ${length} cm long, ${width} cm wide, and ${height} cm tall. What is the volume?`, answer: `${length * width * height} cubic cm` };
            },
            (retry) => {
                const rate = (Math.floor(Math.random() * 30) + 15) / 10;
                const hours = Math.floor(Math.random() * 8) + 3;
                return { question: `A worker earns $${rate.toFixed(2)} per hour. How much does the worker earn in ${hours} hours?`, answer: `$${(rate * hours).toFixed(2)}` };
            },
        ],
        division: [
            (retry) => {
                const distance = Math.floor(Math.random() * 300) + 150;
                const time = Math.floor(Math.random() * 4) + 3;
                return { question: `A car travels ${distance} miles in ${time} hours. What is the average speed in miles per hour?`, answer: `${(distance / time).toFixed(1)} mph` };
            },
        ]
    },

    grade6: {
        subtraction: [
            (retry) => {
                const start = Math.floor(Math.random() * 15) + 5;
                const drop = Math.floor(Math.random() * 25) + 10;
                return { question: `At noon the temperature was ${start}°C. Overnight it fell by ${drop}°C. What was the overnight temperature?`, answer: `${start - drop}°C` };
            },
            (retry) => {
                const depth = Math.floor(Math.random() * 200) + 50;
                const rise = Math.floor(Math.random() * 40) + 10;
                return { question: `A submarine sits ${depth} m below sea level and rises ${rise} m. What is its new depth relative to sea level?`, answer: `${-(depth - rise)} m` };
            },
            (retry) => {
                const total = Math.floor(Math.random() * 400) + 200;
                const used = Math.floor(Math.random() * 150) + 50;
                return { question: `A school had ${total} sheets of paper and used ${used}. What fraction of the paper is left, as a percent?`, answer: `${Math.round(((total - used) / total) * 100)}%` };
            },
        ],
        addition: [
            (retry) => {
                const a = Math.floor(Math.random() * 20) - 10;
                const b = Math.floor(Math.random() * 20) - 10;
                return { question: `The temperature in the morning was ${a}°C. It changed by ${b}°C by afternoon. What is the afternoon temperature?`, answer: `${a + b}°C` };
            },
            (retry) => {
                const debt = -Math.floor(Math.random() * 50) - 20;
                const payment = Math.floor(Math.random() * 40) + 30;
                return { question: `A person has a debt of $${debt} (negative balance). They make a payment of $${payment}. What is their new balance?`, answer: `$${debt + payment}` };
            },
        ],
        multiplication: [
            (retry) => {
                const base = Math.floor(Math.random() * 200) + 100;
                const pct = Math.floor(Math.random() * 30) + 10;
                return { question: `A store offers a ${pct}% discount on a $${base} jacket. How much money do you save?`, answer: `$${(base * pct / 100).toFixed(2)}` };
            },
            (retry) => {
                const total = Math.floor(Math.random() * 150) + 100;
                const ratio1 = Math.floor(Math.random() * 3) + 2;
                const ratio2 = Math.floor(Math.random() * 3) + 2;
                return { question: `${total} marbles are divided between two friends in the ratio ${ratio1}:${ratio2}. How many marbles does the first friend get?`, answer: `${Math.round(total * ratio1 / (ratio1 + ratio2))} marbles` };
            },
        ],
        division: [
            (retry) => {
                const miles = Math.floor(Math.random() * 250) + 150;
                const gallons = Math.floor(Math.random() * 8) + 5;
                return { question: `A car travels ${miles} miles using ${gallons} gallons of gas. What is the fuel efficiency in miles per gallon?`, answer: `${(miles / gallons).toFixed(1)} mpg` };
            },
        ]
    },

    grade7: {
        subtraction: [
            (retry) => {
                const a = Math.floor(Math.random() * 30) + 10;
                const b = Math.floor(Math.random() * 40) + 15;
                return { question: `A bank account holds $${a} and a withdrawal of $${b} is made. What is the resulting balance?`, answer: `-$${b - a}` };
            },
            (retry) => {
                const price = Math.floor(Math.random() * 60) + 40;
                const cut = [10, 15, 20, 25][Math.floor(Math.random() * 4)];
                return { question: `A jacket costs $${price} and is reduced by ${cut}%. By how many dollars did the price drop?`, answer: `$${((price * cut) / 100).toFixed(2)}` };
            },
            (retry) => {
                const n = Math.floor(Math.random() * 5) + 2;
                const d = Math.floor(Math.random() * 4) + 5;
                const take = Math.floor(Math.random() * (n - 1)) + 1;
                return { question: `A tank is ${n}/${d} full and ${take}/${d} of the tank is drained. What fraction of the tank remains?`, answer: `${n - take}/${d}` };
            },
        ],
        addition: [
            (retry) => {
                const w1 = Math.floor(Math.random() * 3) + 1;
                const n1 = Math.floor(Math.random() * 5) + 1;
                const d = Math.floor(Math.random() * 5) + 4;
                const w2 = Math.floor(Math.random() * 3) + 1;
                const n2 = Math.floor(Math.random() * 5) + 1;
                return { question: `A carpenter cuts a board into two pieces measuring ${w1} ${n1}/${d} feet and ${w2} ${n2}/${d} feet. What is the total length of the board?`, answer: `${w1 + w2} ${n1 + n2}/${d} feet (approx)` };
            },
        ],
        multiplication: [
            (retry) => {
                const initial = Math.floor(Math.random() * 500) + 200;
                const rate = Math.floor(Math.random() * 15) + 5;
                const time = Math.floor(Math.random() * 4) + 2;
                return { question: `A population of ${initial} bacteria increases by ${rate}% each hour. Approximately how much does it grow in ${time} hours? (Simple interest model)`, answer: `${Math.round(initial * rate * time / 100)} bacteria` };
            },
            (retry) => {
                const base = Math.floor(Math.random() * 12) + 5;
                return { question: `What is the area of a square with side length ${base} units?`, answer: `${base * base} square units` };
            },
        ],
        division: [
            (retry) => {
                const n1 = Math.floor(Math.random() * 6) + 2;
                const d1 = Math.floor(Math.random() * 6) + 3;
                const n2 = Math.floor(Math.random() * 5) + 2;
                const d2 = Math.floor(Math.random() * 5) + 3;
                return { question: `A recipe that serves ${n1}/${d1} of a group is divided to serve ${n2}/${d2}. Express the result as a fraction.`, answer: `${n1 * d2}/${d1 * n2}` };
            },
        ]
    },

    grade8: {
        subtraction: [
            (retry) => {
                const mant1 = (Math.floor(Math.random() * 40) + 40) / 10;
                const mant2 = (Math.floor(Math.random() * 30) + 5) / 10;
                const exp = Math.floor(Math.random() * 3) + 4;
                return { question: `A city of ${mant1} × 10^${exp} people loses ${mant2} × 10^${exp} to migration. What is the new population?`, answer: `${(mant1 - mant2).toFixed(1)} × 10^${exp}` };
            },
            (retry) => {
                const start = Math.floor(Math.random() * 3000) + 2000;
                const rate = Math.floor(Math.random() * 15) + 5;
                return { question: `A car worth $${start} loses ${rate}% of its value in a year. What is it worth after that year?`, answer: `$${(start * (1 - rate / 100)).toFixed(2)}` };
            },
            (retry) => {
                const a = Math.floor(Math.random() * 12) + 5;
                const b = Math.floor(Math.random() * 20) + 10;
                return { question: `The temperature falls from ${a}°C to -${b}°C. By how many degrees did it fall?`, answer: `${a + b}°C` };
            },
        ],
        addition: [
            (retry) => {
                const mant1 = (Math.floor(Math.random() * 40) + 15) / 10;
                const mant2 = (Math.floor(Math.random() * 40) + 15) / 10;
                const exp = Math.floor(Math.random() * 3) + 3;
                return { question: `Two cities have populations of ${mant1} × 10^${exp} and ${mant2} × 10^${exp}. What is the combined population?`, answer: `${(mant1 + mant2).toFixed(1)} × 10^${exp}` };
            },
        ],
        multiplication: [
            (retry) => {
                const coeff = Math.floor(Math.random() * 10) + 3;
                const x = Math.floor(Math.random() * 12) + 5;
                return { question: `The cost of renting a bike is $${coeff} per hour. How much does it cost to rent for ${x} hours?`, answer: `$${coeff * x}` };
            },
            (retry) => {
                const base = Math.floor(Math.random() * 8) + 3;
                const exp = Math.floor(Math.random() * 3) + 2;
                return { question: `A bacteria colony doubles every hour. Starting with ${base} bacteria, express the population after ${exp} doubling periods using exponents.`, answer: `${base} × 2^${exp} = ${base * (2 ** exp)} bacteria` };
            },
        ],
        division: [
            (retry) => {
                const distance = Math.floor(Math.random() * 500) + 300;
                const speed = Math.floor(Math.random() * 50) + 40;
                return { question: `A train travels ${distance} kilometers at a constant speed of ${speed} km/h. How many hours does the journey take?`, answer: `${(distance / speed).toFixed(2)} hours` };
            },
        ]
    },

    grade9: {
        any: [
            (retry) => {
                const speed1 = Math.floor(Math.random() * 30) + 40;
                const speed2 = Math.floor(Math.random() * 30) + 40;
                const distance = Math.floor(Math.random() * 200) + 150;
                return { question: `Two cars start from the same point traveling in opposite directions. One travels at ${speed1} mph and the other at ${speed2} mph. How long until they are ${distance} miles apart?`, answer: `${(distance / (speed1 + speed2)).toFixed(2)} hours` };
            },
            (retry) => {
                const coeff = Math.floor(Math.random() * 8) + 3;
                const const1 = Math.floor(Math.random() * 20) + 10;
                const result = Math.floor(Math.random() * 100) + 50;
                return { question: `Solve for x: ${coeff}x + ${const1} = ${result}`, answer: `x = ${((result - const1) / coeff).toFixed(2)}` };
            },
            (retry) => {
                const cost = Math.floor(Math.random() * 30) + 20;
                const perItem = Math.floor(Math.random() * 5) + 2;
                return { question: `A phone plan costs $${cost} per month plus $${perItem} per GB of data. Write an equation for the total cost C in terms of data usage d GB.`, answer: `C = ${cost} + ${perItem}d` };
            }
        ]
    },

    grade11: {
        any: [
            (retry) => {
                const a = Math.floor(Math.random() * 3) + 1;
                const b = Math.floor(Math.random() * 10) + 5;
                const c = Math.floor(Math.random() * 20) + 10;
                return { question: `A ball is thrown upward with an initial velocity. Its height h(t) = -${a}t² + ${b}t + ${c}. Find the maximum height.`, answer: `Use vertex formula: h = ${c + (b * b) / (4 * a)} feet` };
            },
            (retry) => {
                const principal = Math.floor(Math.random() * 5000) + 5000;
                const rate = Math.floor(Math.random() * 5) + 3;
                const time = Math.floor(Math.random() * 8) + 5;
                return { question: `$${principal} is invested at ${rate}% annual interest compounded annually. What is the value after ${time} years?`, answer: `$${(principal * Math.pow(1 + rate / 100, time)).toFixed(2)}` };
            },
            (retry) => {
                const base = Math.floor(Math.random() * 5) + 2;
                const growth = Math.floor(Math.random() * 30) + 10;
                const time = Math.floor(Math.random() * 6) + 3;
                return { question: `A population grows at ${growth}% per year. Starting with ${base * 1000} individuals, estimate the population after ${time} years.`, answer: `${Math.round(base * 1000 * Math.pow(1 + growth / 100, time))} individuals` };
            }
        ]
    },
};
