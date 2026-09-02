/**
 * LaTeX escaping and math formatting
 *
 * The problem generator emits human-readable strings ("3/4 × 2/5 = ",
 * "√144", "A tank holds 12.5 L"). This module turns them into LaTeX that
 * typesets the way a teacher would write it: real fractions, radicals,
 * multiplication crosses and degree signs rather than ASCII stand-ins.
 *
 * @module latex/escape
 */

/** Characters TeX would otherwise interpret, and their literal spellings. */
const TEXT_ESCAPES = new Map([
    ['\\', '\\textbackslash{}'],
    ['{', '\\{'],
    ['}', '\\}'],
    ['$', '\\wsdollar{}'],
    ['&', '\\&'],
    ['#', '\\#'],
    ['%', '\\%'],
    ['_', '\\_'],
    ['^', '\\textasciicircum{}'],
    ['~', '\\textasciitilde{}'],
]);

/** Unicode the generator uses that has a plain-text LaTeX spelling. */
const TEXT_REPLACEMENTS = new Map([
    [' ', ' '],
    ['–', '--'],
    ['—', '---'],
    ['‘', '`'],
    ['’', "'"],
    ['“', '``'],
    ['”', "''"],
    ['…', '\\ldots{}'],
    ['¢', '\\,c'],
]);

/** Unicode that only makes sense inside math mode. */
const MATH_REPLACEMENTS = new Map([
    ['×', '\\times '],
    ['÷', '\\div '],
    ['·', '\\cdot '],
    ['−', '-'],
    ['≈', '\\approx '],
    ['≤', '\\leq '],
    ['≥', '\\geq '],
    ['≠', '\\neq '],
    ['±', '\\pm '],
    ['π', '\\pi '],
    ['θ', '\\theta '],
    ['∞', '\\infty '],
    ['→', '\\to '],
    ['°', '^{\\circ}'],
    ['⁰', '^{0}'],
    ['¹', '^{1}'],
    ['²', '^{2}'],
    ['³', '^{3}'],
    ['⁴', '^{4}'],
    ['⁵', '^{5}'],
    ['⁶', '^{6}'],
    ['⁷', '^{7}'],
    ['⁸', '^{8}'],
    ['⁹', '^{9}'],
    ['ⁿ', '^{n}'],
    ['₀', '_{0}'],
    ['₁', '_{1}'],
    ['₂', '_{2}'],
    ['₃', '_{3}'],
    ['₄', '_{4}'],
    ['₅', '_{5}'],
    ['₆', '_{6}'],
    ['₇', '_{7}'],
    ['₈', '_{8}'],
    ['₉', '_{9}'],
    ['ₙ', '_{n}'],
]);

/** Names that should be upright and spaced as operators, not italic variables. */
const OPERATOR_NAMES = new Set([
    'sin', 'cos', 'tan', 'csc', 'sec', 'cot',
    'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh',
    'log', 'ln', 'exp', 'lim', 'max', 'min', 'gcd', 'det', 'mod',
]);

const MATH_SIGNALS = /[0-9+\-*/^()=<>|.,%×÷·−√π°θ∞≈≤≥≠±⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ₀₁₂₃₄₅₆₇₈₉ₙ]/;
const WORD_LIKE = /[A-Za-z]{3,}/;
const BLANK = /_{2,}/g;

/** A fill-in-the-blank rule, sized to hold a two or three digit answer. */
const BLANK_MACRO = '\\wsblank{}';

/** Stands in for a blank while the surrounding text is escaped character by character. */
const BLANK_SENTINEL = '\u0000';

/**
 * Escapes a run of prose. Math-only characters are wrapped in `$...$` so the
 * result is safe to drop straight into a paragraph.
 *
 * @param {string} text
 * @returns {string} LaTeX source
 */
export function escapeText(text) {
    if (!text) return '';

    let out = '';
    for (const character of String(text).replace(BLANK, BLANK_SENTINEL)) {
        if (character === BLANK_SENTINEL) {
            out += BLANK_MACRO;
        } else if (TEXT_ESCAPES.has(character)) {
            out += TEXT_ESCAPES.get(character);
        } else if (TEXT_REPLACEMENTS.has(character)) {
            out += TEXT_REPLACEMENTS.get(character);
        } else if (MATH_REPLACEMENTS.has(character)) {
            out += `$${MATH_REPLACEMENTS.get(character).trim()}$`;
        } else if (character === '√') {
            out += '$\\surd$';
        } else {
            out += character;
        }
    }
    return mergeScripts(collapseAdjacentMath(out));
}

/** `$a$$b$` reads better, and kerns better, as `$ab$`. */
function collapseAdjacentMath(source) {
    return source.replace(/\$\$/g, '');
}

/**
 * Joins scripts that ended up side by side.
 *
 * Each unicode sub/superscript maps to its own `_{}` or `^{}`, so a run like
 * the "10" in `log₁₀` would otherwise become `_{1}_{0}` — two subscripts on one
 * base, which TeX rejects outright with "Double subscript".
 */
function mergeScripts(source) {
    let out = source;
    let previous;
    do {
        previous = out;
        out = out
            .replace(/\^\{([^{}]*)\}\^\{([^{}]*)\}/g, '^{$1$2}')
            .replace(/_\{([^{}]*)\}_\{([^{}]*)\}/g, '_{$1$2}');
    } while (out !== previous);
    return out;
}

/**
 * Formats a generated expression such as `3/4 × 2/5 = ` or
 * `Convert 2 3/4 to an improper fraction`. Runs that look like mathematics are
 * typeset in math mode; the surrounding words stay prose.
 *
 * @param {string} expression
 * @returns {string} LaTeX source
 */
export function formatExpression(expression) {
    if (expression === null || expression === undefined) return '';

    const tokens = String(expression).trim().split(/\s+/).filter(Boolean);
    const parts = [];
    let mathRun = [];

    const flush = () => {
        if (mathRun.length === 0) return;
        parts.push(`$${joinMathTokens(mathRun)}$`);
        mathRun = [];
    };

    for (const token of tokens) {
        if (isMathToken(token)) {
            mathRun.push(token);
        } else {
            flush();
            parts.push(escapeText(token));
        }
    }
    flush();

    return parts.join(' ');
}

/**
 * Formats an answer for the answer key. Answers use the same notation as
 * questions, so they go through the same path.
 *
 * @param {string|number} answer
 * @returns {string} LaTeX source
 */
export function formatAnswer(answer) {
    return formatExpression(answer);
}

/** Decides whether a whitespace-delimited token should be typeset as math. */
function isMathToken(token) {
    const bare = token.replace(/[.,;:!?]+$/, '');
    if (!bare) return false;
    if (OPERATOR_NAMES.has(bare.toLowerCase())) return true;
    if (/^[A-Za-z]$/.test(bare)) return true;
    if (/^_{2,}$/.test(bare)) return true;
    if (!MATH_SIGNALS.test(bare)) return false;
    // `sin(30)` is math even though it holds a word; `12-year-old` is not.
    const withoutOperators = bare.replace(/[A-Za-z]+/g, (word) => (
        OPERATOR_NAMES.has(word.toLowerCase()) ? '' : word
    ));
    return !WORD_LIKE.test(withoutOperators);
}

/**
 * Renders math tokens into one expression, joining a whole number to a
 * following fraction so `2 3/4` becomes a mixed number rather than a product.
 */
function joinMathTokens(tokens) {
    let out = '';
    tokens.forEach((token, index) => {
        const previous = tokens[index - 1];
        const isMixedNumber = index > 0 && /^\d+$/.test(previous) && /^\d+\/\d+$/.test(token);
        if (index > 0 && !isMixedNumber) out += ' ';
        out += formatMathToken(token);
    });
    return out;
}

/** Converts one token into math-mode LaTeX. */
function formatMathToken(token) {
    if (OPERATOR_NAMES.has(token.toLowerCase())) {
        return `\\${token.toLowerCase()}`;
    }

    let out = token;
    out = out.replace(BLANK, BLANK_MACRO);
    out = out.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    out = out.replace(/√\(([^)]*)\)/g, '\\sqrt{$1}');
    out = out.replace(/√([0-9.]+|[A-Za-z])/g, '\\sqrt{$1}');
    out = out.replace(/√/g, '\\surd ');

    for (const [character, replacement] of MATH_REPLACEMENTS) {
        out = out.split(character).join(replacement);
    }

    out = out.replace(/\*/g, '\\times ');
    out = out.replace(/%/g, '\\%');
    out = out.replace(/\$/g, '\\wsdollar ');
    // Multi-letter names are units or labels, not a product of variables.
    out = out.replace(/[A-Za-z]{2,}/g, (word, offset, whole) => {
        if (isControlSequence(whole, offset)) return word;
        return OPERATOR_NAMES.has(word.toLowerCase()) ? `\\${word.toLowerCase()}` : `\\mathrm{${word}}`;
    });

    return mergeScripts(out.replace(/ {2,}/g, ' '));
}

/** True when the letters at `offset` are the name of a TeX macro. */
function isControlSequence(source, offset) {
    let index = offset - 1;
    while (index >= 0 && /[A-Za-z]/.test(source[index])) index -= 1;
    return source[index] === '\\';
}
