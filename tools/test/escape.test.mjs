import assert from 'node:assert/strict';
import test from 'node:test';

import { escapeText, formatExpression } from '../../js/latex/escape.js';

test('escapes characters TeX would otherwise interpret', () => {
    assert.equal(escapeText('50% & #1'), '50\\% \\& \\#1');
    assert.equal(escapeText('a_b'), 'a\\_b');
    assert.equal(escapeText('{x}'), '\\{x\\}');
});

test('currency uses the math dollar, which needs no extra font', () => {
    assert.equal(escapeText('$4.50'), '\\wsdollar{}4.50');
});

test('prose keeps single letters upright', () => {
    // "A" and "a" are words here, not algebraic variables.
    const out = escapeText('A tank holds 12.5 L of a liquid');
    assert.ok(!out.includes('$'), out);
});

test('typographic characters become LaTeX spellings', () => {
    assert.equal(escapeText('a — b'), 'a --- b');
    assert.equal(escapeText('a – b'), 'a -- b');
});

test('expressions become math mode', () => {
    assert.equal(formatExpression('12 + 5 = '), '$12 + 5 =$');
});

test('fractions become \\frac', () => {
    assert.equal(formatExpression('3/4 = '), '$\\frac{3}{4} =$');
});

test('a whole number before a fraction is a mixed number', () => {
    assert.equal(formatExpression('2 3/4'), '$2\\frac{3}{4}$');
});

test('radicals take their argument', () => {
    assert.ok(formatExpression('√144').includes('\\sqrt{144}'));
    assert.ok(formatExpression('√(x+1)').includes('\\sqrt{x+1}'));
});

test('unicode operators map to real math symbols', () => {
    const out = formatExpression('3 × 4 ÷ 2 ≈ 6');
    assert.ok(out.includes('\\times'), out);
    assert.ok(out.includes('\\div'), out);
    assert.ok(out.includes('\\approx'), out);
});

test('superscripts and degrees survive', () => {
    assert.ok(formatExpression('x²').includes('^{2}'));
    assert.ok(formatExpression('45°').includes('^{\\circ}'));
});

test('function names are set as operators', () => {
    const out = formatExpression('sin(30°) = ');
    assert.ok(out.startsWith('$'), `expected math mode, got ${out}`);
    assert.ok(out.includes('\\sin'), out);
});

test('blanks become a rule to write on', () => {
    assert.ok(formatExpression('__ + 5 = 17').includes('\\wsblank'));
});

test('words mixed into an expression stay prose', () => {
    const out = formatExpression('Convert 2 3/4 to improper fraction');
    assert.ok(out.startsWith('Convert '), out);
    assert.ok(out.includes('improper fraction'), out);
});

test('units are upright rather than a product of variables', () => {
    assert.ok(formatExpression('7cm').includes('\\mathrm{cm}'));
});

test('empty input is handled', () => {
    assert.equal(escapeText(''), '');
    assert.equal(formatExpression(undefined), '');
});

test('a run of subscripts is one subscript, not two', () => {
    // "log₁₀" once produced `_{1}_{0}`, which TeX rejects: "Double subscript".
    const out = formatExpression('log₁₀(500) = ');
    assert.ok(out.includes('\\log_{10}'), out);
    assert.ok(!/_\{[^{}]*\}_\{/.test(out), out);
});

test('a run of superscripts is one superscript', () => {
    const out = formatExpression('2¹⁰ = ');
    assert.ok(out.includes('^{10}'), out);
    assert.ok(!/\^\{[^{}]*\}\^\{/.test(out), out);
});

test('subscript runs in prose merge too', () => {
    const out = escapeText('Evaluate log₁₀(1000)');
    assert.ok(out.includes('$_{10}$'), out);
});

test('every sub- and superscript digit is mapped', () => {
    for (const [subscript, superscript, digit] of [
        ['₀', '⁰', '0'], ['₁', '¹', '1'], ['₂', '²', '2'], ['₃', '³', '3'], ['₄', '⁴', '4'],
        ['₅', '⁵', '5'], ['₆', '⁶', '6'], ['₇', '⁷', '7'], ['₈', '⁸', '8'], ['₉', '⁹', '9'],
    ]) {
        assert.ok(formatExpression(`x${subscript}`).includes(`_{${digit}}`), subscript);
        assert.ok(formatExpression(`x${superscript}`).includes(`^{${digit}}`), superscript);
    }
});
