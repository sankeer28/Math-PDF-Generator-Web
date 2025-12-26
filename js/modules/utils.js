/**
 * Utility Functions Module
 * @module utils
 */

/**
 * Generates a random filename using alphanumeric characters
 * @returns {string} Random 10-character string
 */
export function generateRandomFilename() {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    return Array.from(
        { length: 10 },
        () => characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
}

/**
 * Selects a random element from an array
 * @param {Array} array - Array to select from
 * @returns {*} Random element from array
 */
export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Formats a number with thousands separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise}
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates unique ID
 * @returns {string} Unique ID with timestamp
 */
export function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
