/**
 * pdfTeX worker.
 *
 * Wraps the stock SwiftLaTeX pdfTeX WebAssembly build. Upstream resolves every
 * .cls/.sty/.tfm/.pfb it needs with a *synchronous* XHR against a hosted TeX Live
 * service; that service no longer exists, and a per-file round trip would be far
 * too slow anyway. Instead we ship one compressed archive of the TeX files this
 * app needs, load it up front, and answer the engine's lookups from memory.
 *
 * Protocol (superset of upstream's):
 *   -> {cmd:'loadbundle', url}   <- {cmd:'loadbundle', result:'ok'|'failed', ...}
 *   -> {cmd:'writefile', url, src}
 *   -> {cmd:'setmainfile', url}
 *   -> {cmd:'compilelatex'}      <- {cmd:'compile', result, status, log, pdf}
 *   -> {cmd:'flushcache'} | {cmd:'grace'}
 */

/* global FS, allocate, intArrayFromString, ALLOC_NORMAL, UTF8ToString */

const TEX_ROOT = '/tex';

/** Extensions to try, in order, for each of pdfTeX's kpathsea format codes. */
const FORMAT_EXTENSIONS = {
    3: ['.tfm'],
    10: ['.fmt'],
    11: ['.map'],
    26: ['.tex', '.sty', '.cls', '.def', '.clo', '.cfg', '.ltx', '.fd', '.dfu'],
    32: ['.pfb'],
    33: ['.vf'],
};
const FALLBACK_EXTENSIONS = ['.tex', '.sty', '.cls', '.def', '.clo', '.cfg', '.ltx', '.fd', '.tfm', '.map', '.pfb', '.vf'];

/** name -> Uint8Array, populated by loadBundle(). */
const bundle = new Map();
/** cache key -> path inside the emscripten FS, so each file is written once. */
const resolved = new Map();
const notFound = new Set();

let bundleReady = false;

self.texlive_endpoint = '';

/**
 * Decodes the bundle container: "TEXB" magic, uint32 index length,
 * JSON index {name: [offset, length]}, then the raw file bytes.
 */
function decodeBundle(buffer) {
    const view = new DataView(buffer);
    const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
    if (magic !== 'TEXB') {
        throw new Error('not a TeX bundle');
    }
    const indexLength = view.getUint32(4, true);
    const indexBytes = new Uint8Array(buffer, 8, indexLength);
    const index = JSON.parse(new TextDecoder().decode(indexBytes));
    const dataStart = 8 + indexLength;

    bundle.clear();
    for (const [name, [offset, length]] of Object.entries(index)) {
        bundle.set(name, new Uint8Array(buffer, dataStart + offset, length));
    }
}

async function loadBundle(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`bundle request failed with HTTP ${response.status}`);
    }

    let stream = response.body;
    // The bundle is stored gzipped so it survives hosts that do not compress
    // application/octet-stream. Servers that *do* decode it for us hand back
    // plain bytes, so sniff the gzip magic rather than trusting the transport.
    const buffer = await new Response(stream).arrayBuffer();
    const head = new Uint8Array(buffer, 0, 2);
    if (head[0] === 0x1f && head[1] === 0x8b) {
        const inflated = new Response(buffer).body.pipeThrough(new DecompressionStream('gzip'));
        decodeBundle(await new Response(inflated).arrayBuffer());
    } else {
        decodeBundle(buffer);
    }

    bundleReady = true;
}

/** Finds `name` in the bundle, trying the extensions plausible for `format`. */
function lookup(name, format) {
    if (bundle.has(name)) return name;
    const extensions = FORMAT_EXTENSIONS[format] || FALLBACK_EXTENSIONS;
    for (const extension of extensions) {
        if (bundle.has(name + extension)) return name + extension;
    }
    return undefined;
}

/**
 * Replaces the engine's file lookup. Must stay synchronous: pdfTeX calls it
 * from inside WebAssembly, mid-compile.
 *
 * @returns {number} pointer to the FS path, or 0 when the file is unavailable.
 */
function findFile(namePointer, format) {
    const requested = UTF8ToString(namePointer);
    if (requested.includes('/')) return 0;

    const cacheKey = `${format}/${requested}`;
    if (notFound.has(cacheKey)) return 0;

    const cached = resolved.get(cacheKey);
    if (cached) return allocate(intArrayFromString(cached), 'i8', ALLOC_NORMAL);

    const name = bundleReady ? lookup(requested, format) : undefined;
    if (name === undefined) {
        notFound.add(cacheKey);
        return 0;
    }

    const path = `${TEX_ROOT}/${name}`;
    if (!resolved.has(cacheKey)) {
        FS.writeFile(path, bundle.get(name));
    }
    resolved.set(cacheKey, path);
    return allocate(intArrayFromString(path), 'i8', ALLOC_NORMAL);
}

/** Bitmap fonts are never needed: everything we typeset ships as Type 1. */
function findPk() {
    return 0;
}

importScripts('swiftlatexpdftex.js');

// The engine declares these as globals and calls them through late-bound
// wrappers, so reassigning after load is enough to take over resolution.
// eslint-disable-next-line no-global-assign, no-func-assign
kpse_find_file_impl = findFile;
// eslint-disable-next-line no-global-assign, no-func-assign
kpse_find_pk_impl = findPk;

const engineMessageHandler = self.onmessage;

self.onmessage = (event) => {
    const data = event.data;
    if (data && data.cmd === 'loadbundle') {
        loadBundle(data.url).then(
            () => self.postMessage({ cmd: 'loadbundle', result: 'ok', files: bundle.size }),
            (error) => self.postMessage({ cmd: 'loadbundle', result: 'failed', log: String(error && error.message || error) })
        );
        return;
    }
    engineMessageHandler(event);
};
