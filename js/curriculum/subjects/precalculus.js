/**
 * Pre-Calculus Subject Configuration
 * Advanced functions, trigonometry, and preparation for calculus
 * Typically Grade 11-12 (before Calculus)
 */

import { gradeRange } from '../config/grades.js';

export const precalculus = {
    id: 'precalculus',
    name: 'Advanced Functions',
    description: 'Exponential, logarithmic, polynomial and rational functions',
    icon: 'function',
    strand: 'C',

    // Topics organized by concept
    topics: {
        'exponential-functions': {
            id: 'exponential-functions',
            name: 'Exponential Functions',
            description: 'Exponential growth, decay, and applications',
            strand: 'C',
            grades: gradeRange(11, 12),
            difficulty: {
                easy: 'Evaluating exponential expressions (2^x, e^x)',
                medium: 'Graphing exponential functions and transformations',
                hard: 'Exponential growth/decay word problems and applications'
            },
            parameters: { maxNumber: { default: 20 }, maxExponent: true },
        },

        'logarithms': {
            id: 'logarithms',
            name: 'Logarithmic Functions',
            description: 'Logarithms, properties, and equations',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Converting between exponential and logarithmic form',
                medium: 'Using logarithm properties to simplify expressions',
                hard: 'Solving logarithmic equations and applications'
            },
            parameters: { maxNumber: { default: 20 } },
        },

        'sequences-series': {
            id: 'sequences-series',
            name: 'Sequences & Series',
            description: 'Arithmetic and geometric sequences, series, and summation',
            strand: 'C',
            grades: gradeRange(11, 12),
            difficulty: {
                easy: 'Finding terms in arithmetic and geometric sequences',
                medium: 'Finding sums of finite series',
                hard: 'Infinite series, convergence, and applications'
            },
            parameters: { maxNumber: { default: 30 }, terms: { label: 'Terms shown', default: 4, min: 3, max: 8 } },
        },

        'polynomial-functions': {
            id: 'polynomial-functions',
            name: 'Polynomial Functions',
            description: 'Higher-degree polynomials, graphing, and analysis',
            strand: 'C',
            grades: gradeRange(11, 12),
            difficulty: {
                easy: 'Evaluating and graphing simple polynomials',
                medium: 'Finding zeros and analyzing end behavior',
                hard: 'Polynomial division, Remainder Theorem, Factor Theorem'
            },
            parameters: { maxNumber: { default: 12 }, maxExponent: { default: 4 } },
        },

        'rational-functions': {
            id: 'rational-functions',
            name: 'Rational Functions',
            description: 'Ratios of polynomials, asymptotes, and graphing',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Simplifying rational expressions',
                medium: 'Finding vertical and horizontal asymptotes',
                hard: 'Graphing rational functions with holes and asymptotes'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'conic-sections': {
            id: 'conic-sections',
            name: 'Conic Sections',
            description: 'Circles, ellipses, parabolas, and hyperbolas',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Graphing circles from standard form',
                medium: 'Writing equations of ellipses and parabolas',
                hard: 'Identifying and graphing all conics from general form'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'parametric-polar': {
            id: 'parametric-polar',
            name: 'Parametric & Polar Equations',
            description: 'Parametric equations and polar coordinates',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Plotting points in polar coordinates',
                medium: 'Converting between rectangular and polar forms',
                hard: 'Graphing complex polar and parametric equations'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'vectors-matrices': {
            id: 'vectors-matrices',
            name: 'Vectors & Matrices',
            description: 'Vector operations, matrices, and transformations',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Vector addition and scalar multiplication',
                medium: 'Matrix operations (addition, multiplication)',
                hard: 'Determinants, inverses, and solving systems with matrices'
            },
            parameters: { maxNumber: { default: 12 }, allowNegatives: { default: true } },
        },

        'complex-numbers': {
            id: 'complex-numbers',
            name: 'Complex Numbers',
            description: 'Imaginary numbers and complex number operations',
            strand: 'C',
            grades: gradeRange(12, 12),
            difficulty: {
                easy: 'Simplifying expressions with i',
                medium: 'Operations with complex numbers (a + bi)',
                hard: 'Complex plane, De Moivre\'s Theorem, and polar form'
            },
            parameters: { maxNumber: { default: 12 }, allowNegatives: { default: true } },
        },
    }
};
