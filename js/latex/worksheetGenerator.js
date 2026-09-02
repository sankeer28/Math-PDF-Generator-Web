/**
 * Worksheet generation
 *
 * Ties the problem generator, the LaTeX document builder and the pdfTeX engine
 * together: produce problems, typeset them, hand back PDFs.
 *
 * @module latex/worksheetGenerator
 */

import { ProblemGenerator } from '../modules/problemGenerator.js';
import { LatexEngine, LatexError } from './engine.js';
import { buildWorksheet, PROBLEMS_PER_PAGE } from './worksheet.js';

/** One shared engine: loading the TeX bundle is the expensive part. */
const engine = new LatexEngine();

export { LatexError };

export class WorksheetGenerator {
    constructor() {
        this.problemGenerator = new ProblemGenerator();
    }

    /** Warms the engine up so the first worksheet is not the slow one. */
    prepare() {
        return engine.load();
    }

    get isEngineReady() {
        return engine.isLoaded;
    }

    /**
     * Typesets one worksheet.
     *
     * @param {object} options - form options
     * @returns {Promise<{pdf: Uint8Array, source: string, log: string}>}
     */
    async generateOne(options) {
        const source = this.buildSource(options);
        const { pdf, log } = await engine.compile(source);
        return { pdf, source, log };
    }

    /**
     * Typesets `options.numPDFs` worksheets, each with its own problems.
     *
     * @param {object} options
     * @param {(done: number, total: number) => void} [onProgress]
     * @returns {Promise<Array<{name: string, pdf: Uint8Array}>>}
     */
    async generateMany(options, onProgress = () => {}) {
        const total = Math.max(1, Number(options.numPDFs) || 1);
        const baseName = fileNameStem(options.pdfTitle);
        const worksheets = [];

        for (let index = 0; index < total; index += 1) {
            onProgress(index, total);
            const { pdf } = await this.generateOne(options);
            worksheets.push({
                name: total === 1 ? `${baseName}.pdf` : `${baseName}_${index + 1}.pdf`,
                pdf,
            });
        }

        onProgress(total, total);
        return worksheets;
    }

    /**
     * Builds the LaTeX source for one worksheet without typesetting it. Useful
     * for the source view, and fast enough to run on every keystroke.
     *
     * @param {object} options
     * @returns {string}
     */
    buildSource(options) {
        this.problemGenerator.setConfig(options.gradeLevel, options.difficulty, options.subjects);
        this.problemGenerator.clearUsedProblems();
        return buildWorksheet(options, this.#generatePages(options));
    }

    #generatePages(options) {
        const pageCount = Math.max(1, Number(options.numPages) || 1);
        const pages = [];

        for (let index = 0; index < pageCount; index += 1) {
            const type = pageTypeFor(options.problemType, index);
            const count = PROBLEMS_PER_PAGE[type];
            const problems = [];

            for (let n = 0; n < count; n += 1) {
                const operation = randomOf(options.operations);
                const { question, answer } = this.problemGenerator.generateUniqueProblem(
                    operation,
                    type,
                    options.topics
                );
                problems.push({ question, answer, type });
            }

            pages.push({ type, problems });
        }

        return pages;
    }
}

/** "mixed" alternates equation pages with word-problem pages. */
function pageTypeFor(problemType, pageIndex) {
    if (problemType === 'mixed') return pageIndex % 2 === 0 ? 'equations' : 'word';
    return problemType === 'word' ? 'word' : 'equations';
}

function randomOf(values) {
    if (!values || values.length === 0) return 'addition';
    return values[Math.floor(Math.random() * values.length)];
}

/** Turns a worksheet title into something safe for a file name. */
export function fileNameStem(title) {
    const cleaned = String(title || 'worksheet')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_');
    return cleaned || 'worksheet';
}
