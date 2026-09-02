import assert from 'node:assert/strict';
import test from 'node:test';
import { Blob } from 'node:buffer';

globalThis.Blob ??= Blob;
const { createZip } = await import('../../js/modules/zip.js');

async function bytes(blob) {
    return Buffer.from(await blob.arrayBuffer());
}

test('writes a readable archive', async () => {
    const data = await bytes(createZip([
        { name: 'a.txt', data: new TextEncoder().encode('hello') },
        { name: 'b.bin', data: new Uint8Array([0, 1, 2, 255]) },
    ]));

    assert.equal(data.readUInt32LE(0), 0x04034b50, 'starts with a local file header');
    assert.ok(data.includes(Buffer.from('a.txt')));
    assert.ok(data.includes(Buffer.from('b.bin')));

    // End-of-central-directory record, at the very end for archives with no comment.
    const end = data.length - 22;
    assert.equal(data.readUInt32LE(end), 0x06054b50);
    assert.equal(data.readUInt16LE(end + 8), 2, 'records both entries');
});

test('stores file contents verbatim', async () => {
    const payload = new Uint8Array(1024).map((_, index) => index % 256);
    const data = await bytes(createZip([{ name: 'x', data: payload }]));
    assert.ok(data.includes(Buffer.from(payload)));
});

test('an empty archive is still well formed', async () => {
    const data = await bytes(createZip([]));
    assert.equal(data.length, 22);
    assert.equal(data.readUInt32LE(0), 0x06054b50);
});
