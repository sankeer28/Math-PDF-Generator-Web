/**
 * LaTeX engine
 *
 * Thin, promise-based front end for the pdfTeX WebAssembly worker in
 * `vendor/swiftlatex`. Everything runs in the browser: no server, no upload.
 *
 * @module latex/engine
 */

const WORKER_URL = 'vendor/swiftlatex/pdftex-worker.js';
const BUNDLE_URL = 'vendor/texlive/texlive.bundle.gz';
const MAIN_FILE = 'main.tex';

/** Compiling twice lets `\pageref` and friends resolve against the .aux file. */
const DEFAULT_PASSES = 2;

export class LatexError extends Error {
    /**
     * @param {string} message
     * @param {string} log - the pdfTeX transcript, which holds the real diagnosis
     */
    constructor(message, log = '') {
        super(message);
        this.name = 'LatexError';
        this.log = log;
    }

    /** The first `! ...` line of the transcript, which is what a user can act on. */
    get texError() {
        const match = /^!.*$/m.exec(this.log);
        return match ? match[0].replace(/^!\s*/, '') : '';
    }
}

export class LatexEngine {
    constructor({ workerUrl = WORKER_URL, bundleUrl = BUNDLE_URL } = {}) {
        this.workerUrl = workerUrl;
        this.bundleUrl = bundleUrl;
        this.worker = null;
        this.ready = null;
    }

    /**
     * Starts the worker and loads the TeX Live bundle. Safe to call repeatedly;
     * concurrent callers share one load.
     *
     * @returns {Promise<void>}
     */
    load() {
        if (!this.ready) {
            this.ready = this.#start().catch((error) => {
                this.ready = null;
                this.dispose();
                throw error;
            });
        }
        return this.ready;
    }

    get isLoaded() {
        return this.worker !== null && this.ready !== null;
    }

    async #start() {
        this.worker = new Worker(this.workerUrl);

        await new Promise((resolve, reject) => {
            this.worker.onmessage = (event) => {
                if (event.data && event.data.result === 'ok') resolve();
                else reject(new LatexError('The LaTeX engine failed to start.'));
            };
            this.worker.onerror = (event) => {
                reject(new LatexError(`The LaTeX engine failed to load: ${event.message || 'unknown error'}`));
            };
        });

        this.worker.onerror = null;
        // Resolve here: inside the worker a relative URL would be taken as
        // relative to the worker script, not to the page.
        const bundleUrl = new URL(this.bundleUrl, document.baseURI).href;
        const result = await this.#request({ cmd: 'loadbundle', url: bundleUrl }, 'loadbundle');
        if (result.result !== 'ok') {
            throw new LatexError(`Could not load the TeX Live bundle: ${result.log || 'unknown error'}`);
        }
    }

    /**
     * Typesets a document.
     *
     * @param {string} source - the LaTeX source of the main file
     * @param {object} [options]
     * @param {Record<string,string>} [options.files] - extra files, keyed by name
     * @param {number} [options.passes] - how many times to run pdfTeX
     * @returns {Promise<{pdf: Uint8Array, log: string}>}
     */
    async compile(source, { files = {}, passes = DEFAULT_PASSES } = {}) {
        await this.load();

        this.#post({ cmd: 'flushcache' });
        for (const [name, content] of Object.entries(files)) {
            this.#post({ cmd: 'writefile', url: name, src: content });
        }
        this.#post({ cmd: 'writefile', url: MAIN_FILE, src: source });
        this.#post({ cmd: 'setmainfile', url: MAIN_FILE });

        let result;
        for (let pass = 0; pass < passes; pass += 1) {
            result = await this.#request({ cmd: 'compilelatex' }, 'compile');
            if (result.result !== 'ok') {
                throw new LatexError('LaTeX could not typeset this worksheet.', result.log || '');
            }
        }

        return { pdf: new Uint8Array(result.pdf), log: result.log || '' };
    }

    dispose() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.ready = null;
    }

    /** Fire-and-forget commands; the worker acknowledges them but nothing waits. */
    #post(message) {
        this.worker.postMessage(message);
    }

    /** Sends `message` and resolves with the first reply carrying `expectedCmd`. */
    #request(message, expectedCmd) {
        return new Promise((resolve, reject) => {
            this.worker.onmessage = (event) => {
                const data = event.data;
                if (!data || data.cmd !== expectedCmd) return;
                this.worker.onmessage = null;
                resolve(data);
            };
            this.worker.onerror = (event) => {
                this.worker.onerror = null;
                reject(new LatexError(`The LaTeX engine crashed: ${event.message || 'unknown error'}`));
            };
            this.worker.postMessage(message);
        });
    }
}
