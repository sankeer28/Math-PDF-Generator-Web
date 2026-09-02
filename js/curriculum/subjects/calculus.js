/**
 * Calculus Subject Configuration
 * Limits, derivatives, integrals, and applications
 */

import { gradeRange } from '../config/grades.js';

export const calculus = {
    id: 'calculus',
    name: 'Calculus',
    description: 'Limits, derivatives, integrals and their applications',
    icon: 'infinity',
    strand: 'C',

    // Topics organized by concept
    topics: {
        'limits': {
            id: 'limits',
            name: 'Limits',
            description: 'Understanding and evaluating limits',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Direct substitution limits',
                medium: 'Limits requiring factoring or rationalization',
                hard: 'Limits at infinity and indeterminate forms'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'derivatives': {
            id: 'derivatives',
            name: 'Derivatives',
            description: 'Finding and applying derivatives',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Power rule derivatives',
                medium: 'Product and quotient rules',
                hard: 'Chain rule and implicit differentiation'
            },
            parameters: { maxNumber: { default: 12 }, maxExponent: { default: 4 } },
        },

        'integrals': {
            id: 'integrals',
            name: 'Integrals',
            description: 'Antiderivatives and definite integrals',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Basic power rule integration',
                medium: 'U-substitution',
                hard: 'Integration by parts and partial fractions'
            },
            parameters: { maxNumber: { default: 12 }, maxExponent: { default: 4 } },
        },

        'optimization': {
            id: 'optimization',
            name: 'Optimization',
            description: 'Finding maximum and minimum values',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Finding critical points',
                medium: 'First and second derivative tests',
                hard: 'Applied optimization word problems'
            },
            parameters: { maxNumber: { default: 50 } },
        },

        'related-rates': {
            id: 'related-rates',
            name: 'Related Rates',
            description: 'Rates of change in related quantities',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Simple related rates (growing radius)',
                medium: 'Pythagorean related rates',
                hard: 'Complex multi-variable related rates'
            },
            parameters: { maxNumber: { default: 50 } },
        },

        'applications': {
            id: 'applications',
            name: 'Applications of Calculus',
            description: 'Real-world calculus applications',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Position, velocity, acceleration',
                medium: 'Area under curves',
                hard: 'Volume of revolution and advanced applications'
            },
            parameters: { maxNumber: { default: 50 } },
        },
    }
};
