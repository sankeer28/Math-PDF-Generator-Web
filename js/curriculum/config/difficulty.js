/**
 * Difficulty Configuration
 * Multipliers and settings for problem complexity
 */

/**
 * Difficulty multipliers affect:
 * - Number ranges
 * - Problem complexity
 * - Number of steps required
 */
export const DIFFICULTY_MULTIPLIERS = {
    easy: {
        value: 0.6,
        description: 'Simple problems with smaller numbers',
        characteristics: [
            'Single-digit or small two-digit numbers',
            'One or two steps to solve',
            'Clear, straightforward language',
            'Minimal complexity'
        ]
    },

    medium: {
        value: 1.0,
        description: 'Standard problems with moderate complexity',
        characteristics: [
            'Two to three-digit numbers',
            'Two to three steps to solve',
            'Some problem-solving required',
            'Grade-level appropriate'
        ]
    },

    hard: {
        value: 1.4,
        description: 'Challenging problems requiring critical thinking',
        characteristics: [
            'Larger numbers (three+ digits)',
            'Multiple steps and operations',
            'Requires strategic thinking',
            'May include unnecessary information'
        ]
    }
};

/**
 * Get difficulty multiplier value
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {number} Multiplier value
 */
export function getDifficultyMultiplier(difficulty) {
    return DIFFICULTY_MULTIPLIERS[difficulty]?.value || 1.0;
}

/**
 * Get difficulty characteristics
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} Difficulty configuration
 */
export function getDifficultyConfig(difficulty) {
    return DIFFICULTY_MULTIPLIERS[difficulty] || DIFFICULTY_MULTIPLIERS.medium;
}
