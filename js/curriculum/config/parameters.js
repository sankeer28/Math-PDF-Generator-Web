/**
 * Topic parameters
 *
 * A topic can expose knobs a teacher may want to set: how large the numbers
 * get, whether answers may be negative, which denominators appear. Topics
 * declare which of the shared definitions below they use, plus any per-topic
 * override, so the UI can render controls and the generators can read values
 * without either side hard-coding a list.
 *
 * @module curriculum/config/parameters
 */

/**
 * @typedef {object} ParameterDefinition
 * @property {string} id
 * @property {string} label - shown next to the control
 * @property {string} help - one line explaining what it changes
 * @property {'number'|'boolean'|'select'} type
 * @property {number|boolean|string} default
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {Array<{value: string, label: string}>} [options] - for `select`
 */

/** @type {Record<string, ParameterDefinition>} */
export const PARAMETER_DEFINITIONS = {
    maxNumber: {
        id: 'maxNumber',
        label: 'Largest number',
        help: 'Upper bound for the numbers that appear in questions.',
        type: 'number',
        default: 100,
        min: 5,
        max: 1000000,
        step: 5,
    },

    minNumber: {
        id: 'minNumber',
        label: 'Smallest number',
        help: 'Lower bound for the numbers that appear in questions.',
        type: 'number',
        default: 1,
        min: 0,
        max: 1000,
        step: 1,
    },

    allowNegatives: {
        id: 'allowNegatives',
        label: 'Allow negative numbers',
        help: 'Lets questions and answers go below zero.',
        type: 'boolean',
        default: false,
    },

    allowRemainders: {
        id: 'allowRemainders',
        label: 'Allow remainders',
        help: 'Division may leave a remainder instead of dividing evenly.',
        type: 'boolean',
        default: false,
    },

    missingNumber: {
        id: 'missingNumber',
        label: 'Include missing-number blanks',
        help: 'Mixes in questions written as 7 + __ = 15.',
        type: 'boolean',
        default: true,
    },

    decimalPlaces: {
        id: 'decimalPlaces',
        label: 'Decimal places',
        help: 'How many digits appear after the decimal point.',
        type: 'number',
        default: 2,
        min: 0,
        max: 4,
        step: 1,
    },

    maxDenominator: {
        id: 'maxDenominator',
        label: 'Largest denominator',
        help: 'Fractions will not use a denominator above this.',
        type: 'number',
        default: 12,
        min: 2,
        max: 100,
        step: 1,
    },

    denominatorStyle: {
        id: 'denominatorStyle',
        label: 'Denominators',
        help: 'Whether fractions share a denominator before they are combined.',
        type: 'select',
        default: 'mixed',
        options: [
            { value: 'like', label: 'Like denominators only' },
            { value: 'unlike', label: 'Unlike denominators only' },
            { value: 'mixed', label: 'A mix of both' },
        ],
    },

    terms: {
        id: 'terms',
        label: 'Numbers per question',
        help: 'How many values each question combines.',
        type: 'number',
        default: 2,
        min: 2,
        max: 5,
        step: 1,
    },

    maxExponent: {
        id: 'maxExponent',
        label: 'Largest exponent',
        help: 'Upper bound for powers used in questions.',
        type: 'number',
        default: 3,
        min: 2,
        max: 6,
        step: 1,
    },

    requireIntegerAnswers: {
        id: 'requireIntegerAnswers',
        label: 'Whole-number answers only',
        help: 'Chooses values so the answer never needs rounding.',
        type: 'boolean',
        default: true,
    },
};

/**
 * Builds the parameter set for a topic: each definition it names, with the
 * topic's own overrides folded in.
 *
 * @param {object} topic - a topic from a subject file
 * @returns {ParameterDefinition[]} in declaration order, empty if the topic
 *   exposes none
 */
export function parametersForTopic(topic) {
    if (!topic?.parameters) return [];

    return Object.entries(topic.parameters).map(([id, override]) => {
        const base = PARAMETER_DEFINITIONS[id];
        if (!base) {
            throw new Error(`Topic "${topic.id}" names unknown parameter "${id}"`);
        }
        return { ...base, ...(override === true ? {} : override) };
    });
}

/**
 * The values a topic starts with, before a user changes anything.
 *
 * @param {object} topic
 * @returns {Record<string, number|boolean|string>}
 */
export function defaultParameterValues(topic) {
    const values = {};
    for (const parameter of parametersForTopic(topic)) {
        values[parameter.id] = parameter.default;
    }
    return values;
}

/**
 * Clamps a user-supplied value into what its definition allows, so a hand-typed
 * or stored value can never push a generator into a bad state.
 *
 * @param {ParameterDefinition} definition
 * @param {*} value
 * @returns {number|boolean|string}
 */
export function coerceParameter(definition, value) {
    switch (definition.type) {
        case 'boolean':
            return Boolean(value);
        case 'select':
            return definition.options.some((option) => option.value === value)
                ? value
                : definition.default;
        case 'number': {
            const number = Number(value);
            if (!Number.isFinite(number)) return definition.default;
            return Math.min(definition.max, Math.max(definition.min, Math.round(number / definition.step) * definition.step));
        }
        default:
            return definition.default;
    }
}
