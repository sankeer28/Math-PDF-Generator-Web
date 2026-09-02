/**
 * Worksheet document builder
 *
 * Turns a set of form options and generated problems into a complete LaTeX
 * document. Nothing here talks to the DOM or to the engine, so the output is
 * easy to inspect, diff and test.
 *
 * @module latex/worksheet
 */

import { escapeText, formatExpression, formatAnswer } from './escape.js';

/** How many problems each page type holds. */
export const PROBLEMS_PER_PAGE = {
    equations: 20,
    word: 4,
};

const PAPER_SIZES = {
    letter: 'letterpaper',
    a4: 'a4paper',
};

const PAGE_NUMBER_SLOTS = {
    'bottom-center': 'C',
    'bottom-left': 'L',
    'bottom-right': 'R',
};

/**
 * @typedef {object} WorksheetProblem
 * @property {string} question
 * @property {string} answer
 * @property {'equations'|'word'} type
 */

/**
 * @typedef {object} WorksheetPage
 * @property {'equations'|'word'} type
 * @property {WorksheetProblem[]} problems
 */

/**
 * Builds the LaTeX source for one worksheet.
 *
 * @param {object} options - form options (see FormManager#getFormData)
 * @param {WorksheetPage[]} pages
 * @returns {string} a complete LaTeX document
 */
export function buildWorksheet(options, pages) {
    const body = [];
    const answers = [];

    pages.forEach((page, index) => {
        if (index > 0) body.push('\\newpage');

        const header = renderHeader(options, index);
        const free = usableHeightMm(options) - headerHeightMm(options, index);
        body.push(header);
        body.push(page.type === 'word'
            ? renderWordProblems(page.problems, free)
            : renderEquations(page.problems, free));

        for (const problem of page.problems) answers.push(problem.answer);
    });

    if (options.answerKey === 'separate' && answers.length > 0) {
        body.push(renderAnswerKey(answers));
    }

    return `${preamble(options)}\n\\begin{document}\n${body.join('\n\n')}\n\\end{document}\n`;
}

/* -------------------------------------------------------------------------- */
/* Preamble                                                                    */
/* -------------------------------------------------------------------------- */

function preamble(options) {
    const paper = PAPER_SIZES[options.paperSize] || PAPER_SIZES.letter;
    const lines = [
        '\\documentclass[11pt]{article}',
        `\\usepackage[${paper},top=20mm,bottom=20mm,left=18mm,right=18mm,footskip=8mm,headsep=6mm]{geometry}`,
        '\\usepackage{amsmath}',
        '\\usepackage{amssymb}',
        '\\usepackage{multicol}',
        '\\usepackage{fancyhdr}',
        '\\usepackage{lastpage}',
        '',
        '\\setlength{\\parindent}{0pt}',
        '\\setlength{\\columnsep}{9mm}',
        '\\raggedbottom',
        '\\pagestyle{fancy}',
        '\\fancyhf{}',
        '\\renewcommand{\\headrulewidth}{0pt}',
        '\\renewcommand{\\footrulewidth}{0pt}',
        '',
        '% `\\$` would pull in the TS1 text companion fonts, which this build does',
        '% not ship; the math dollar is metrically identical and always available.',
        '\\newcommand{\\wsdollar}{\\ensuremath{\\mathdollar}}',
        '\\newcommand{\\wsblank}{\\underline{\\hspace{13mm}}}',
        '\\newcommand{\\wsrule}{\\leavevmode\\leaders\\hrule height 0.4pt\\hfill\\kern0pt}',
        '\\newcommand{\\wsfield}[2]{\\textbf{#1}~\\underline{\\hspace{#2}}}',
        '% A circled number, drawn from the math fonts so no extra font is needed.',
        '\\newcommand{\\wscircled}[1]{%',
        '  \\makebox[1.7em][c]{%',
        '    \\makebox[0pt][c]{\\raisebox{-0.34em}{\\LARGE$\\bigcirc$}}%',
        '    \\makebox[0pt][c]{\\scriptsize #1}}}',
        '',
        '\\newcounter{wsq}',
        '\\newlength{\\wslabelwidth}\\setlength{\\wslabelwidth}{9mm}',
        '\\newlength{\\wsgap}',
        renderLabelMacro(options.showNumberCircles),
        '\\newcommand{\\wsproblem}[1]{%',
        '  \\stepcounter{wsq}%',
        '  \\noindent\\makebox[\\wslabelwidth][l]{\\wslabel}%',
        '  \\begin{minipage}[t]{\\dimexpr\\linewidth-\\wslabelwidth\\relax}\\raggedright #1\\end{minipage}%',
        '  \\par\\vspace{\\wsgap}}',
        '',
        '\\newcommand{\\wstitle}[1]{%',
        '  \\begin{center}\\LARGE\\bfseries #1\\end{center}%',
        '  \\vspace{-3mm}\\rule{\\linewidth}{0.8pt}\\par\\vspace{4mm}}',
        '\\newcommand{\\wsanswerlines}{%',
        '  \\par\\vspace{2mm}\\textbf{\\footnotesize Answer:}~\\wsrule',
        '  \\par\\vspace{6mm}\\wsrule\\par\\vspace{1mm}}',
    ];

    lines.push(renderPageNumberStyle(options));
    if (options.showPageBorder) lines.push(renderPageBorder());

    return lines.join('\n');
}

function renderLabelMacro(showNumberCircles) {
    return showNumberCircles
        ? '\\newcommand{\\wslabel}{\\wscircled{\\thewsq}}'
        : '\\newcommand{\\wslabel}{\\textbf{\\thewsq.}}';
}

function renderPageNumberStyle(options) {
    if (options.pageNumberPosition === 'none') return '\\fancyfoot{}';

    const number = options.showPageNumberBox
        ? '\\fbox{\\thepage/\\pageref{LastPage}}'
        : '\\thepage/\\pageref{LastPage}';
    const field = `\\footnotesize ${number}`;

    if (options.pageNumberPosition === 'top-right') {
        return `\\fancyhead[R]{${field}}`;
    }
    const slot = PAGE_NUMBER_SLOTS[options.pageNumberPosition] || 'C';
    return `\\fancyfoot[${slot}]{${field}}`;
}

/** Draws a frame just inside the paper edge on every page. */
function renderPageBorder() {
    return [
        // `\\framebox(w,h)` is the picture form and takes bare numbers; the
        // optional-argument form takes real lengths, which is what we have.
        '\\AddToHook{shipout/background}{%',
        '  \\put(10mm,-\\dimexpr\\paperheight-10mm\\relax){%',
        '    \\fboxsep=0pt \\fboxrule=0.5pt',
        '    \\framebox[\\dimexpr\\paperwidth-20mm\\relax]{%',
        '      \\rule{0pt}{\\dimexpr\\paperheight-20mm\\relax}}}}',
    ].join('\n');
}

/* -------------------------------------------------------------------------- */
/* Page content                                                                */
/* -------------------------------------------------------------------------- */

function renderHeader(options, pageIndex) {
    const showTitle = options.showTitle === 'all' || (options.showTitle === 'first' && pageIndex === 0);
    const lines = [];

    if (showTitle) {
        lines.push(`\\wstitle{${escapeText(options.pdfTitle || 'Math Worksheet')}}`);
    }

    const nameRow = [];
    if (options.showName) nameRow.push('\\wsfield{Name:}{58mm}');
    if (options.showDate) nameRow.push('\\wsfield{Date:}{34mm}');
    const scoreRow = [];
    if (options.showScore) scoreRow.push('\\wsfield{Score:}{26mm}');
    if (options.showGrade) scoreRow.push('\\wsfield{Grade:}{26mm}');

    for (const row of [nameRow, scoreRow]) {
        if (row.length > 0) lines.push(`${row.join('\\hfill ')}\\par\\vspace{4mm}`);
    }

    if (lines.length > 0) lines.push('\\vspace{2mm}');
    return lines.join('\n');
}

/* Rough heights, in millimetres, used only to spread problems down the page.
   Getting these slightly wrong shifts the whitespace; it cannot break the page,
   because the gap is clamped well inside what a page can hold. */
const PAGE_HEIGHT_MM = { letter: 279.4, a4: 297 };
const VERTICAL_MARGIN_MM = 40;
const TITLE_BLOCK_MM = 17;
const FIELD_ROW_MM = 9;
const EQUATION_ITEM_MM = 6;
const WORD_ITEM_MM = 33;

function usableHeightMm(options) {
    return (PAGE_HEIGHT_MM[options.paperSize] || PAGE_HEIGHT_MM.letter) - VERTICAL_MARGIN_MM;
}

function headerHeightMm(options, pageIndex) {
    const showTitle = options.showTitle === 'all' || (options.showTitle === 'first' && pageIndex === 0);
    let height = showTitle ? TITLE_BLOCK_MM : 0;
    if (options.showName || options.showDate) height += FIELD_ROW_MM;
    if (options.showScore || options.showGrade) height += FIELD_ROW_MM;
    return height;
}

/** Gap that spreads `count` items of `itemMm` each over `freeMm` of page. */
function spread(freeMm, count, itemMm, minimum, maximum) {
    if (count <= 0) return minimum;
    const gap = (freeMm - count * itemMm) / count;
    return Math.round(Math.min(maximum, Math.max(minimum, gap)) * 10) / 10;
}

function renderEquations(problems, freeHeightMm) {
    const items = problems.map(
        (problem) => `\\wsproblem{${formatExpression(problem.question)}\\hspace{3pt}\\wsrule}`
    );
    const rows = Math.ceil(problems.length / 2);
    return [
        `\\setlength{\\wsgap}{${spread(freeHeightMm, rows, EQUATION_ITEM_MM, 5, 15)}mm}`,
        '\\begin{multicols}{2}',
        items.join('\n'),
        '\\end{multicols}',
    ].join('\n');
}

function renderWordProblems(problems, freeHeightMm) {
    // Word problems are prose. Running them through the expression formatter
    // would italicise "A" and "a" as if they were algebraic variables.
    const items = problems.map(
        (problem) => `\\wsproblem{${escapeText(problem.question)}\\wsanswerlines}`
    );
    return [
        `\\setlength{\\wsgap}{${spread(freeHeightMm, problems.length, WORD_ITEM_MM, 6, 30)}mm}`,
        items.join('\n\n'),
    ].join('\n');
}

function renderAnswerKey(answers) {
    const items = answers.map(
        (answer, index) => `\\item[${index + 1}.] ${formatAnswer(answer)}`
    );
    return [
        '\\newpage',
        '\\begin{center}\\Large\\bfseries Answer Key\\end{center}',
        '\\vspace{-2mm}\\rule{\\linewidth}{0.6pt}\\par\\vspace{4mm}',
        '\\begin{multicols}{3}\\raggedcolumns\\small',
        '\\begin{list}{}{\\setlength{\\leftmargin}{9mm}\\setlength{\\labelwidth}{8mm}',
        '\\setlength{\\labelsep}{1mm}\\setlength{\\itemsep}{1.2mm}\\setlength{\\parsep}{0pt}}',
        items.join('\n'),
        '\\end{list}',
        '\\end{multicols}',
    ].join('\n');
}
