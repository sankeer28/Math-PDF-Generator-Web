import assert from 'node:assert/strict';
import test from 'node:test';

import { buildWorksheet, PROBLEMS_PER_PAGE } from '../../js/latex/worksheet.js';

const BASE = {
    pdfTitle: 'Practice Worksheet',
    showTitle: 'first',
    showName: true,
    showDate: true,
    showScore: false,
    showGrade: false,
    showNumberCircles: false,
    pageNumberPosition: 'bottom-center',
    showPageNumberBox: false,
    showPageBorder: false,
    answerKey: 'separate',
    paperSize: 'letter',
};

const page = (type, count) => ({
    type,
    problems: Array.from({ length: count }, (_, index) => ({
        question: `${index + 1} + 1 = `,
        answer: `${index + 2}`,
        type,
    })),
});

const equationsPage = page('equations', PROBLEMS_PER_PAGE.equations);

test('produces a complete document', () => {
    const source = buildWorksheet(BASE, [equationsPage]);
    assert.ok(source.startsWith('\\documentclass'));
    assert.ok(source.includes('\\begin{document}'));
    assert.ok(source.trimEnd().endsWith('\\end{document}'));
});

test('every problem reaches the page', () => {
    const source = buildWorksheet(BASE, [equationsPage]);
    const count = source.match(/\\wsproblem\{/g).length;
    assert.equal(count, PROBLEMS_PER_PAGE.equations);
});

test('pages are separated', () => {
    const source = buildWorksheet(BASE, [equationsPage, equationsPage]);
    assert.ok(source.includes('\\newpage'));
});

test('the title appears once when set to the first page only', () => {
    const source = buildWorksheet(BASE, [equationsPage, equationsPage]);
    assert.equal(source.match(/\\wstitle\{/g).length, 1);
});

test('the title repeats when set to every page', () => {
    const source = buildWorksheet({ ...BASE, showTitle: 'all' }, [equationsPage, equationsPage]);
    assert.equal(source.match(/\\wstitle\{/g).length, 2);
});

test('the title is escaped, so a stray & cannot break the build', () => {
    const source = buildWorksheet({ ...BASE, pdfTitle: 'Rates & Ratios #2' }, [equationsPage]);
    assert.ok(source.includes('Rates \\& Ratios \\#2'));
});

test('the answer key is included only when asked for', () => {
    assert.ok(buildWorksheet(BASE, [equationsPage]).includes('Answer Key'));
    assert.ok(!buildWorksheet({ ...BASE, answerKey: 'none' }, [equationsPage]).includes('Answer Key'));
});

test('the answer key holds one entry per problem', () => {
    const source = buildWorksheet(BASE, [equationsPage, equationsPage]);
    const key = source.slice(source.indexOf('Answer Key'));
    assert.equal(key.match(/\\item\[/g).length, PROBLEMS_PER_PAGE.equations * 2);
});

test('question numbering continues across pages', () => {
    // The counter is never reset, so numbering runs 1..40 over two pages.
    const source = buildWorksheet(BASE, [equationsPage, equationsPage]);
    assert.equal(source.match(/\\setcounter\{wsq\}/g), null);
});

test('page numbers can be turned off', () => {
    const source = buildWorksheet({ ...BASE, pageNumberPosition: 'none' }, [equationsPage]);
    assert.ok(!source.includes('\\pageref{LastPage}'));
});

test('page number position selects the right fancyhdr slot', () => {
    assert.ok(buildWorksheet({ ...BASE, pageNumberPosition: 'bottom-left' }, [equationsPage])
        .includes('\\fancyfoot[L]'));
    assert.ok(buildWorksheet({ ...BASE, pageNumberPosition: 'top-right' }, [equationsPage])
        .includes('\\fancyhead[R]'));
});

test('paper size reaches geometry', () => {
    assert.ok(buildWorksheet({ ...BASE, paperSize: 'a4' }, [equationsPage]).includes('a4paper'));
    assert.ok(buildWorksheet(BASE, [equationsPage]).includes('letterpaper'));
});

test('the page border is opt-in', () => {
    assert.ok(!buildWorksheet(BASE, [equationsPage]).includes('shipout/background'));
    assert.ok(buildWorksheet({ ...BASE, showPageBorder: true }, [equationsPage])
        .includes('shipout/background'));
});

test('word problems get answer lines', () => {
    const source = buildWorksheet(BASE, [page('word', PROBLEMS_PER_PAGE.word)]);
    assert.equal(source.match(/\\wsanswerlines/g).length, PROBLEMS_PER_PAGE.word + 1); // +1 definition
});
