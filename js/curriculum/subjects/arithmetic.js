/**
 * Number
 *
 * Ontario strand B. Grade availability follows where each idea is introduced
 * in the Ontario mathematics curriculum (2020 for Grades 1-8, MTH1W and the
 * senior courses above that), so a Grade 3 worksheet cannot offer integers and
 * a Grade 8 one is not padded with counting.
 *
 * @module curriculum/subjects/arithmetic
 */

import { gradeRange } from '../config/grades.js';

export const arithmetic = {
    id: 'arithmetic',
    name: 'Number',
    description: 'Number sense, operations, fractions, and proportional reasoning',
    icon: 'calculator',
    strand: 'B',

    topics: {
        'basic-operations': {
            id: 'basic-operations',
            name: 'Basic Operations (+, -, ×, ÷)',
            description: 'Addition, subtraction, multiplication, and division',
            strand: 'B',
            grades: gradeRange(1, 8),
            difficulty: {
                easy: 'Single-digit and simple two-digit problems',
                medium: 'Multi-digit problems with regrouping',
                hard: 'Complex multi-digit problems and mixed operations',
            },
            parameters: {
                maxNumber: true,
                terms: true,
                missingNumber: true,
                allowNegatives: { default: false },
            },
        },

        'counting-quantity': {
            id: 'counting-quantity',
            name: 'Counting & Quantity',
            description: 'Counting on, skip counting, and comparing quantities',
            strand: 'B',
            grades: gradeRange(1, 3),
            difficulty: {
                easy: 'Counting forward and back within 20',
                medium: 'Skip counting by 2s, 5s and 10s',
                hard: 'Counting on from any number and comparing sets',
            },
            parameters: {
                maxNumber: { default: 50, max: 1000 },
            },
        },

        'place-value': {
            id: 'place-value',
            name: 'Place Value & Number Sense',
            description: 'Place value, rounding, and how numbers relate to each other',
            strand: 'B',
            grades: gradeRange(1, 8),
            difficulty: {
                easy: 'Ones, tens, hundreds place value',
                medium: 'Thousands and ten-thousands',
                hard: 'Millions and decimal place value',
            },
            parameters: {
                maxNumber: { default: 1000 },
            },
        },

        'fractions': {
            id: 'fractions',
            name: 'Fractions',
            description: 'Naming, comparing, and operating on fractions',
            strand: 'B',
            grades: gradeRange(2, 9),
            difficulty: {
                easy: 'Simple fractions like 1/2 and 1/4',
                medium: 'Adding and subtracting with different denominators',
                hard: 'Multiplying, dividing, and converting mixed numbers',
            },
            parameters: {
                maxDenominator: true,
                denominatorStyle: true,
            },
        },

        'decimals': {
            id: 'decimals',
            name: 'Decimals',
            description: 'Reading, comparing, and calculating with decimal numbers',
            strand: 'B',
            grades: gradeRange(4, 9),
            difficulty: {
                easy: 'Tenths, and comparing decimals',
                medium: 'Hundredths, adding and subtracting',
                hard: 'Multiplying and dividing decimals',
            },
            parameters: {
                decimalPlaces: true,
                maxNumber: { default: 1000 },
            },
        },

        'word-problems': {
            id: 'word-problems',
            name: 'Word Problems',
            description: 'Real-world arithmetic in context',
            strand: 'B',
            grades: gradeRange(1, 12),
            difficulty: {
                easy: 'Single-step problems',
                medium: 'Two-step problems',
                hard: 'Multi-step problems with several operations',
            },
            parameters: {
                maxNumber: true,
            },
        },

        'estimation': {
            id: 'estimation',
            name: 'Estimation & Rounding',
            description: 'Estimating answers and rounding numbers',
            strand: 'B',
            grades: gradeRange(2, 8),
            difficulty: {
                easy: 'Rounding to the nearest 10',
                medium: 'Rounding to the nearest 100 and estimating sums',
                hard: 'Estimation with decimals and checking reasonableness',
            },
            parameters: {
                maxNumber: { default: 1000 },
            },
        },

        'patterns': {
            id: 'patterns',
            name: 'Number Patterns',
            description: 'Identifying and extending numerical patterns',
            strand: 'C',
            grades: gradeRange(1, 9),
            difficulty: {
                easy: 'Simple skip-counting patterns',
                medium: 'Arithmetic sequences',
                hard: 'Growing patterns and general terms',
            },
            parameters: {
                maxNumber: { default: 200 },
                terms: { label: 'Terms shown', default: 4, min: 3, max: 8 },
            },
        },

        'percentages': {
            id: 'percentages',
            name: 'Percents',
            description: 'Percents, discounts, and percent change',
            strand: 'B',
            grades: gradeRange(5, 12),
            difficulty: {
                easy: 'Finding 10%, 25% and 50% of a number',
                medium: 'Finding any percentage of a number',
                hard: 'Percent increase, decrease, and working backwards',
            },
            parameters: {
                maxNumber: { default: 500 },
                requireIntegerAnswers: true,
            },
        },

        'ratios-proportions': {
            id: 'ratios-proportions',
            name: 'Ratios, Rates & Proportions',
            description: 'Ratios, unit rates, and proportional relationships',
            strand: 'B',
            grades: gradeRange(6, 12),
            difficulty: {
                easy: 'Simple ratios and equivalent ratios',
                medium: 'Solving proportions and finding unit rates',
                hard: 'Scale drawings and multi-step proportional reasoning',
            },
            parameters: {
                maxNumber: { default: 200 },
                requireIntegerAnswers: true,
            },
        },

        'integers': {
            id: 'integers',
            name: 'Integers & Negative Numbers',
            description: 'Comparing and operating on positive and negative numbers',
            strand: 'B',
            grades: gradeRange(6, 12),
            difficulty: {
                easy: 'Comparing and ordering integers',
                medium: 'Adding and subtracting integers',
                hard: 'Multiplying, dividing, and mixed operations',
            },
            parameters: {
                maxNumber: { default: 50 },
                allowNegatives: { default: true },
            },
        },

        'exponents-roots': {
            id: 'exponents-roots',
            name: 'Powers & Roots',
            description: 'Powers, exponent laws, square roots, and scientific notation',
            strand: 'B',
            grades: gradeRange(7, 12),
            difficulty: {
                easy: 'Simple powers and perfect squares',
                medium: 'Exponent laws and square roots',
                hard: 'Scientific notation and negative or fractional exponents',
            },
            parameters: {
                maxExponent: true,
                maxNumber: { default: 20 },
            },
        },

        'order-of-operations': {
            id: 'order-of-operations',
            name: 'Order of Operations',
            description: 'Evaluating expressions in the proper sequence',
            strand: 'B',
            grades: gradeRange(5, 12),
            difficulty: {
                easy: 'Two operations without brackets',
                medium: 'Three or more operations with brackets',
                hard: 'Nested brackets and exponents',
            },
            parameters: {
                maxNumber: { default: 50 },
                terms: { default: 3, min: 3, max: 5 },
            },
        },

        'factors-multiples': {
            id: 'factors-multiples',
            name: 'Factors, Multiples & Primes',
            description: 'Factors, multiples, GCF, LCM, and prime factorisation',
            strand: 'B',
            grades: gradeRange(4, 9),
            difficulty: {
                easy: 'Factors of small numbers and identifying primes',
                medium: 'Greatest common factor and lowest common multiple',
                hard: 'Prime factorisation and divisibility rules',
            },
            parameters: {
                maxNumber: { default: 100 },
            },
        },

        'rational-numbers': {
            id: 'rational-numbers',
            name: 'Rational Numbers',
            description: 'Moving between fractions, decimals and percents, including negatives',
            strand: 'B',
            grades: gradeRange(7, 12),
            difficulty: {
                easy: 'Converting between fractions and decimals',
                medium: 'Ordering rational numbers including negatives',
                hard: 'Operations across all four representations',
            },
            parameters: {
                maxDenominator: true,
                allowNegatives: { default: true },
            },
        },
    },
};
