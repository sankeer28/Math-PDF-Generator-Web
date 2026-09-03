/**
 * Generation history
 *
 * Remembers the settings behind each worksheet that was downloaded, so the same
 * sheet can be produced again without rebuilding the options by hand. Entries
 * live in this browser only; nothing is sent anywhere.
 *
 * @module history
 */

const STORAGE_KEY = 'mathpdf.history.v1';

/** Older entries fall off the end; a teacher wants the last few, not all of them. */
const MAX_ENTRIES = 25;

/**
 * @typedef {object} HistoryEntry
 * @property {string} id
 * @property {number} savedAt - epoch milliseconds
 * @property {object} options - the form data that produced the worksheet
 */

export class History {
    constructor(storage = safeStorage()) {
        this.storage = storage;
    }

    /**
     * @returns {HistoryEntry[]} newest first, or an empty list if nothing is
     *   stored or the stored value is unusable
     */
    list() {
        try {
            const parsed = JSON.parse(this.storage?.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
        } catch {
            return [];
        }
    }

    /**
     * Records one generation.
     *
     * A run with the same settings as the newest entry replaces it rather than
     * stacking up: pressing Download twice should not fill the list.
     *
     * @param {object} options - form data
     * @returns {HistoryEntry[]} the updated list
     */
    add(options) {
        const entry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            savedAt: Date.now(),
            options: structuredCloneSafe(options),
        };

        const entries = this.list();
        if (entries[0] && sameOptions(entries[0].options, entry.options)) {
            entries[0] = entry;
        } else {
            entries.unshift(entry);
        }

        return this.#write(entries.slice(0, MAX_ENTRIES));
    }

    /** @returns {HistoryEntry|undefined} */
    find(id) {
        return this.list().find((entry) => entry.id === id);
    }

    remove(id) {
        return this.#write(this.list().filter((entry) => entry.id !== id));
    }

    clear() {
        return this.#write([]);
    }

    #write(entries) {
        try {
            this.storage?.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch {
            // A full or blocked store is not worth interrupting a download for.
        }
        return entries;
    }
}

/** localStorage throws outright in some privacy modes, so probe it once. */
function safeStorage() {
    try {
        const probe = '__mathpdf__';
        window.localStorage.setItem(probe, '1');
        window.localStorage.removeItem(probe);
        return window.localStorage;
    } catch {
        return null;
    }
}

function isEntry(value) {
    return Boolean(value) && typeof value.id === 'string' && typeof value.savedAt === 'number' && Boolean(value.options);
}

function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
}

function sameOptions(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
