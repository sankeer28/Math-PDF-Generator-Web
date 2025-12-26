/**
 * Basic Arithmetic Subject Configuration
 * Core mathematics: addition, subtraction, multiplication, division
 */

export const arithmetic = {
    id: 'arithmetic',
    name: 'Basic Arithmetic',
    description: 'Fundamental mathematical operations and number sense',
    icon: 'calculator',

    // Topics organized by concept
    topics: {
        'basic-operations': {
            id: 'basic-operations',
            name: 'Basic Operations (+, -, ×, ÷)',
            description: 'Addition, subtraction, multiplication, and division',
            grades: ['elementary', 'middle', 'high', 'college'],
            difficulty: {
                easy: 'Single-digit and simple two-digit problems',
                medium: 'Multi-digit problems with regrouping',
                hard: 'Complex multi-digit problems and mixed operations'
            }
        },

        'place-value': {
            id: 'place-value',
            name: 'Place Value & Number Sense',
            description: 'Understanding place value, rounding, and number relationships',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Ones, tens, hundreds place value',
                medium: 'Thousands and ten-thousands',
                hard: 'Millions and decimal place value'
            }
        },

        'fractions': {
            id: 'fractions',
            name: 'Fractions & Decimals',
            description: 'Working with fractions, decimals, and conversions',
            grades: ['elementary', 'middle', 'high'],
            difficulty: {
                easy: 'Simple fractions like 1/2, 1/4',
                medium: 'Adding/subtracting fractions with different denominators',
                hard: 'Complex fraction operations and conversions'
            }
        },

        'word-problems': {
            id: 'word-problems',
            name: 'Word Problems',
            description: 'Real-world arithmetic application problems',
            grades: ['elementary', 'middle', 'high', 'college'],
            difficulty: {
                easy: 'Single-step problems',
                medium: 'Two-step problems',
                hard: 'Multi-step problems with multiple operations'
            }
        },

        'estimation': {
            id: 'estimation',
            name: 'Estimation & Rounding',
            description: 'Estimating answers and rounding numbers',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Rounding to nearest 10',
                medium: 'Rounding to nearest 100 and estimating sums',
                hard: 'Complex estimation and reasonableness checks'
            }
        },

        'patterns': {
            id: 'patterns',
            name: 'Number Patterns',
            description: 'Identifying and extending numerical patterns',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Simple skip counting patterns',
                medium: 'Arithmetic sequences',
                hard: 'Complex patterns and sequences'
            }
        },

        'percentages': {
            id: 'percentages',
            name: 'Percentages & Interest',
            description: 'Calculating percentages, discounts, and interest',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Finding 10%, 25%, 50% of numbers',
                medium: 'Calculating any percentage',
                hard: 'Compound interest and complex percentage problems'
            }
        },

        'ratios-proportions': {
            id: 'ratios-proportions',
            name: 'Ratios & Proportions',
            description: 'Understanding ratios, rates, and proportional relationships',
            grades: ['middle', 'high'],
            difficulty: {
                easy: 'Simple ratios (1:2, 3:4) and equivalent ratios',
                medium: 'Solving proportions and finding unit rates',
                hard: 'Complex proportions, scale drawings, and percent of change'
            }
        },

        'integers': {
            id: 'integers',
            name: 'Integers & Negative Numbers',
            description: 'Working with positive and negative numbers',
            grades: ['middle', 'high'],
            difficulty: {
                easy: 'Comparing and ordering integers on number line',
                medium: 'Adding and subtracting integers',
                hard: 'Multiplying, dividing, and mixed operations with integers'
            }
        },

        'exponents-roots': {
            id: 'exponents-roots',
            name: 'Exponents & Roots',
            description: 'Powers, exponents, square roots, and scientific notation',
            grades: ['middle', 'high'],
            difficulty: {
                easy: 'Simple powers (2², 3³) and perfect squares',
                medium: 'Exponent rules and square roots',
                hard: 'Scientific notation and negative/fractional exponents'
            }
        },

        'order-of-operations': {
            id: 'order-of-operations',
            name: 'Order of Operations',
            description: 'PEMDAS/BODMAS - proper sequence for evaluating expressions',
            grades: ['elementary', 'middle', 'high'],
            difficulty: {
                easy: 'Two operations (addition and multiplication)',
                medium: 'Three or more operations with parentheses',
                hard: 'Complex expressions with nested parentheses and exponents'
            }
        },

        'factors-multiples': {
            id: 'factors-multiples',
            name: 'Factors, Multiples & Primes',
            description: 'Factors, multiples, GCF, LCM, prime factorization, divisibility',
            grades: ['elementary', 'middle'],
            difficulty: {
                easy: 'Finding factors of small numbers and identifying primes',
                medium: 'GCF, LCM, and prime factorization',
                hard: 'Complex problems with divisibility rules and applications'
            }
        }
    }
};
