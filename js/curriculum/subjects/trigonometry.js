/**
 * Trigonometry Subject Configuration
 * Trigonometric functions, identities, and applications
 */

import { gradeRange } from '../config/grades.js';

export const trigonometry = {
    id: 'trigonometry',
    name: 'Trigonometry',
    description: 'Ratios, the unit circle, identities and applications',
    icon: 'triangle',
    strand: 'E',

    // Topics organized by concept
    topics: {
        'right-triangles': {
            id: 'right-triangles',
            name: 'Right Triangle Trigonometry',
            description: 'Sine, cosine, and tangent in right triangles',
            strand: 'E',
            grades: gradeRange(10, 12),
            difficulty: {
                easy: 'Finding trig ratios with given sides',
                medium: 'Solving for missing sides using SOHCAHTOA',
                hard: 'Word problems with angles of elevation and depression'
            },
            parameters: { maxNumber: { default: 30 }, decimalPlaces: { default: 2 } },
        },

        'unit-circle': {
            id: 'unit-circle',
            name: 'Unit Circle',
            description: 'Understanding the unit circle and special angles',
            strand: 'E',
            grades: gradeRange(11, 12),
            difficulty: {
                easy: 'Finding coordinates on unit circle for special angles',
                medium: 'Converting between degrees and radians',
                hard: 'Reference angles and all quadrants'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'trig-functions': {
            id: 'trig-functions',
            name: 'Trigonometric Functions',
            description: 'Graphing and analyzing trig functions',
            strand: 'E',
            grades: gradeRange(11, 12),
            difficulty: {
                easy: 'Evaluating basic trig functions',
                medium: 'Graphing sine and cosine functions',
                hard: 'Amplitude, period, phase shift transformations'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'identities': {
            id: 'identities',
            name: 'Trigonometric Identities',
            description: 'Pythagorean, reciprocal, and other identities',
            strand: 'E',
            grades: gradeRange(11, 12),
            difficulty: {
                easy: 'Using basic identities (sin²θ + cos²θ = 1)',
                medium: 'Sum and difference formulas',
                hard: 'Proving complex identities'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'equations': {
            id: 'equations',
            name: 'Trigonometric Equations',
            description: 'Solving equations involving trig functions',
            strand: 'E',
            grades: gradeRange(11, 12),
            difficulty: {
                easy: 'Simple equations (sin x = 0.5)',
                medium: 'Equations requiring factoring',
                hard: 'Multiple angle equations and all solutions'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'applications': {
            id: 'applications',
            name: 'Real-World Applications',
            description: 'Applying trigonometry to real situations',
            strand: 'E',
            grades: gradeRange(10, 12),
            difficulty: {
                easy: 'Basic height and distance problems',
                medium: 'Navigation and bearing problems',
                hard: 'Complex modeling with multiple triangles'
            },
            parameters: { maxNumber: { default: 100 }, decimalPlaces: { default: 2 } },
        },
    }
};
