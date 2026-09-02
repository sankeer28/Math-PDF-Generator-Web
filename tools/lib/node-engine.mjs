/**
 * Runs the SwiftLaTeX pdfTeX worker under Node.
 *
 * The engine is an Emscripten build targeting a web worker: it expects `self`,
 * `importScripts` and a *synchronous* XMLHttpRequest. This module provides just
 * enough of that environment to drive the engine from build scripts and tests,
 * resolving TeX Live lookups against a directory on disk instead of the network.
 *
 * @module tools/lib/node-engine
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const TEXLIVE_PREFIX = 'texlive://';

/** Extensions to try per kpathsea format code; mirrors the browser worker. */
const FORMAT_EXTENSIONS = {
    3: ['.tfm'],
    10: ['.fmt'],
    11: ['.map'],
    26: ['.tex', '.sty', '.cls', '.def', '.clo', '.cfg', '.ltx', '.fd', '.dfu'],
    32: ['.pfb'],
    33: ['.vf'],
};
const FALLBACK_EXTENSIONS = ['.tex', '.sty', '.cls', '.def', '.clo', '.cfg', '.ltx', '.fd', '.tfm', '.map', '.pfb', '.vf'];

export class NodePdfTeX {
    /**
     * @param {object} options
     * @param {string} options.engineDir - directory holding swiftlatexpdftex.{js,wasm}
     * @param {string} options.poolDir - flat directory of TeX Live files, by basename
     */
    constructor({ engineDir, poolDir }) {
        this.engineDir = engineDir;
        this.poolDir = poolDir;
        /** Names actually served, so callers can vendor exactly what is used. */
        this.used = new Set();
        this.missing = new Set();
        this.messages = [];
        this.context = null;
    }

    async start() {
        const runner = this;

        class SyncXHR {
            open(_method, url, isAsync) {
                this.url = url;
                this.status = 0;
                this.isAsync = isAsync !== false;
            }

            setRequestHeader() {}

            getResponseHeader(name) {
                return name === 'fileid' || name === 'pkid' ? this.fileId : null;
            }

            send() {
                const file = runner.#resolve(this.url);
                if (file && fs.statSync(file).isFile()) {
                    const buffer = fs.readFileSync(file);
                    this.status = 200;
                    this.fileId = path.basename(file);
                    this.response = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
                    this.responseText = buffer.toString('binary');
                    if (this.url.startsWith(TEXLIVE_PREFIX)) runner.used.add(path.basename(file));
                } else {
                    this.status = 301;
                    if (this.url.startsWith(TEXLIVE_PREFIX)) runner.missing.add(path.basename(this.url));
                }
                if (this.isAsync) {
                    setTimeout(() => (this.status === 200 ? this.onload?.() : this.onerror?.()), 0);
                }
            }
        }

        const sandbox = {
            console,
            performance,
            WebAssembly,
            TextDecoder,
            TextEncoder,
            URL,
            Blob: class {},
            setTimeout,
            clearTimeout,
            XMLHttpRequest: SyncXHR,
            importScripts: () => {},
            postMessage: (message) => this.messages.push(message),
            close: () => {},
        };
        sandbox.self = sandbox;
        sandbox.globalThis = sandbox;
        sandbox.location = { href: 'engine://swiftlatexpdftex.js' };

        this.context = vm.createContext(sandbox);
        vm.runInContext(
            fs.readFileSync(path.join(this.engineDir, 'swiftlatexpdftex.js'), 'utf8'),
            this.context,
            { filename: 'swiftlatexpdftex.js' }
        );

        await this.#waitFor((message) => message.result === 'ok' && !message.cmd);
        this.#send({ cmd: 'settexliveurl', url: TEXLIVE_PREFIX });
    }

    /**
     * @param {string} source - LaTeX source for main.tex
     * @param {number} [passes]
     * @returns {Promise<{status:number, log:string, pdf?:Buffer}>}
     */
    async compile(source, passes = 2) {
        this.#send({ cmd: 'flushcache' });
        this.#send({ cmd: 'writefile', url: 'main.tex', src: source });
        this.#send({ cmd: 'setmainfile', url: 'main.tex' });

        let result;
        for (let pass = 0; pass < passes; pass += 1) {
            this.messages.length = 0;
            this.#send({ cmd: 'compilelatex' });
            result = await this.#waitFor((message) => message.cmd === 'compile');
        }
        return {
            status: result.status,
            log: result.log || '',
            pdf: result.pdf ? Buffer.from(result.pdf) : undefined,
        };
    }

    /** Builds the pdflatex format dump the engine preloads on every run. */
    async buildFormat() {
        this.messages.length = 0;
        this.#send({ cmd: 'compileformat' });
        const result = await this.#waitFor((message) => message.cmd === 'compile');
        if (result.result !== 'ok') throw new Error(`format build failed:\n${result.log}`);
        return Buffer.from(result.pdf);
    }

    #send(message) {
        this.context.self.onmessage({ data: message });
    }

    #resolve(url) {
        if (!url.startsWith(TEXLIVE_PREFIX)) {
            return path.join(this.engineDir, url.replace(/^engine:\/\//, ''));
        }
        const name = path.basename(url);
        const format = Number(url.split('/').at(-2));
        const candidates = ['', ...(FORMAT_EXTENSIONS[format] || FALLBACK_EXTENSIONS)];
        for (const extension of candidates) {
            const file = path.join(this.poolDir, name + extension);
            if (fs.existsSync(file)) return file;
        }
        return null;
    }

    async #waitFor(predicate, timeoutMs = 300000) {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            const message = this.messages.find(predicate);
            if (message) return message;
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
        throw new Error('timed out waiting for the pdfTeX worker');
    }
}
