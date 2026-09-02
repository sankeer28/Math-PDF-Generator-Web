/**
 * Minimal ZIP writer
 *
 * PDFs are already compressed, so storing them verbatim costs nothing and lets
 * the app drop its ZIP library along with the CDN request that came with it.
 *
 * @module zip
 */

const CRC_TABLE = buildCrcTable();

function buildCrcTable() {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
    }
    return table;
}

function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) {
        crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

/** MS-DOS date and time, as ZIP has recorded timestamps since 1989. */
function dosDateTime(date) {
    const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
    const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { time, day };
}

/**
 * Packs files into an uncompressed ZIP archive.
 *
 * @param {Array<{name: string, data: Uint8Array}>} files
 * @param {Date} [modified]
 * @returns {Blob} an `application/zip` blob
 */
export function createZip(files, modified = new Date()) {
    const encoder = new TextEncoder();
    const { time, day } = dosDateTime(modified);

    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const file of files) {
        const name = encoder.encode(file.name);
        const data = file.data;
        const crc = crc32(data);

        const local = new DataView(new ArrayBuffer(30));
        local.setUint32(0, 0x04034b50, true); // local file header
        local.setUint16(4, 20, true); // version needed
        local.setUint16(6, 0x0800, true); // UTF-8 names
        local.setUint16(8, 0, true); // stored, not deflated
        local.setUint16(10, time, true);
        local.setUint16(12, day, true);
        local.setUint32(14, crc, true);
        local.setUint32(18, data.length, true);
        local.setUint32(22, data.length, true);
        local.setUint16(26, name.length, true);
        local.setUint16(28, 0, true); // no extra field

        const central = new DataView(new ArrayBuffer(46));
        central.setUint32(0, 0x02014b50, true); // central directory header
        central.setUint16(4, 20, true); // version made by
        central.setUint16(6, 20, true); // version needed
        central.setUint16(8, 0x0800, true);
        central.setUint16(10, 0, true);
        central.setUint16(12, time, true);
        central.setUint16(14, day, true);
        central.setUint32(16, crc, true);
        central.setUint32(20, data.length, true);
        central.setUint32(24, data.length, true);
        central.setUint16(28, name.length, true);
        central.setUint32(42, offset, true);

        localParts.push(new Uint8Array(local.buffer), name, data);
        centralParts.push(new Uint8Array(central.buffer), name);
        offset += 30 + name.length + data.length;
    }

    const centralSize = centralParts.reduce((total, part) => total + part.length, 0);

    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); // end of central directory
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);

    return new Blob([...localParts, ...centralParts, new Uint8Array(end.buffer)], {
        type: 'application/zip',
    });
}

/**
 * Saves a blob to the user's downloads.
 *
 * @param {Blob} blob
 * @param {string} filename
 */
export function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.hidden = true;
    document.body.appendChild(link);
    link.click();

    // Tearing the link down, or revoking the URL, before the browser has taken
    // the blob cancels the download. Let both outlive the click.
    setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
    }, 30000);
}
