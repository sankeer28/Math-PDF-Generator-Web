/**
 * Algebra Subject Configuration
 * Variables, equations, functions, and abstract mathematical reasoning
 */

import { gradeRange } from '../config/grades.js';

export const algebra = {
    id: 'algebra',
    name: 'Algebra',
    description: 'Expressions, equations, relations and modelling',
    icon: 'function',
    strand: 'C',

    // Topics organized by concept
    topics: {
        'expressions': {
            id: 'expressions',
            name: 'Algebraic Expressions',
            description: 'Writing, evaluating, and simplifying expressions',
            strand: 'C',
            grades: gradeRange(6, 12),
            difficulty: {
                easy: 'Evaluating expressions with one variable',
                medium: 'Simplifying expressions by combining like terms',
                hard: 'Complex expressions with multiple variables and operations'
            },
            parameters: { maxNumber: { default: 20 }, terms: { default: 2, max: 4 } },
        },

        'linear-equations': {
            id: 'linear-equations',
            name: 'Linear Equations',
            description: 'Solving equations of the form ax + b = c',
            strand: 'C',
            grades: gradeRange(7, 12),
            difficulty: {
                easy: 'One-step equations (x + 5 = 12)',
                medium: 'Two-step equations (2x + 5 = 13)',
                hard: 'Multi-step equations with variables on both sides'
            },
            parameters: { maxNumber: { default: 30 }, allowNegatives: { default: true }, requireIntegerAnswers: true },
        },

        'quadratic-equations': {
            id: 'quadratic-equations',
            name: 'Quadratic Equations',
            description: 'Solving equations of the form ax² + bx + c = 0',
            strand: 'C',
            grades: gradeRange(10, 12),
            difficulty: {
                easy: 'Factoring simple quadratics (x² + 5x + 6 = 0)',
                medium: 'Using quadratic formula',
                hard: 'Completing the square and complex solutions'
            },
            parameters: { maxNumber: { default: 12 }, requireIntegerAnswers: true },
        },

        'systems': {
            id: 'systems',
            name: 'Systems of Equations',
            description: 'Solving multiple equations simultaneously',
            strand: 'C',
            grades: gradeRange(9, 12),
            difficulty: {
                easy: 'Two linear equations with substitution',
                medium: 'Elimination method',
                hard: 'Three or more equations or non-linear systems'
            },
            parameters: { maxNumber: { default: 12 }, requireIntegerAnswers: true },
        },

        'polynomials': {
            id: 'polynomials',
            name: 'Polynomials',
            description: 'Operations with polynomial expressions',
            strand: 'C',
            grades: gradeRange(10, 12),
            difficulty: {
                easy: 'Adding and subtracting polynomials',
                medium: 'Multiplying polynomials',
                hard: 'Polynomial division and synthetic division'
            },
            parameters: { maxNumber: { default: 12 }, maxExponent: { default: 3 } },
        },

        'exponents-radicals': {
            id: 'exponents-radicals',
            name: 'Exponents & Radicals',
            description: 'Simplifying expressions with exponents and radicals',
            strand: 'C',
            grades: gradeRange(8, 12),
            difficulty: {
                easy: 'Basic exponent rules (product, quotient, power)',
                medium: 'Simplifying radical expressions',
                hard: 'Rational exponents and complex radical operations'
            },
            parameters: { maxExponent: true, maxNumber: { default: 20 } },
        },

        'rational-expressions': {
            id: 'rational-expressions',
            name: 'Rational Expressions',
            description: 'Simplifying and operating with rational expressions',
            strand: 'C',
            grades: gradeRange(11, 12),
            difficulty: {
                easy: 'Simplifying simple rational expressions',
                medium: 'Adding and subtracting rational expressions',
                hard: 'Complex fractions and rational equations'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'absolute-value': {
            id: 'absolute-value',
            name: 'Absolute Value',
            description: 'Absolute value equations, inequalities, and graphs',
            strand: 'C',
            grades: gradeRange(9, 12),
            difficulty: {
                easy: 'Evaluating absolute value expressions',
                medium: 'Solving absolute value equations',
                hard: 'Absolute value inequalities and piecewise functions'
            },
            parameters: { maxNumber: { default: 20 }, allowNegatives: { default: true } },
        },

        'factoring': {
            id: 'factoring',
            name: 'Factoring',
            description: 'Breaking down algebraic expressions into factors',
            strand: 'C',
            grades: gradeRange(10, 12),
            difficulty: {
                easy: 'Factoring out common factors',
                medium: 'Factoring trinomials',
                hard: 'Difference of squares and complex factoring'
            },
            parameters: { maxNumber: { default: 12 } },
        },

        'inequalities': {
            id: 'inequalities',
            name: 'Inequalities',
            description: 'Solving and graphing inequalities',
            strand: 'C',
            grades: gradeRange(9, 12),
            difficulty: {
                easy: 'One-step inequalities',
                medium: 'Multi-step inequalities',
                hard: 'Compound inequalities and absolute value'
            },
            parameters: { maxNumber: { default: 30 }, allowNegatives: { default: true } },
        },

        'functions': {
            id: 'functions',
            name: 'Functions & Relations',
            description: 'Understanding functions, domain, and range',
            strand: 'C',
            grades: gradeRange(9, 12),
            difficulty: {
                easy: 'Evaluating functions f(x)',
                medium: 'Graphing linear and quadratic functions',
                hard: 'Composite functions and inverse functions'
            },
            parameters: { maxNumber: { default: 20 } },
        },

        'word-problems': {
            id: 'word-problems',
            name: 'Algebraic Word Problems',
            description: 'Real-world problems requiring algebraic solutions',
            strand: 'C',
            grades: gradeRange(7, 12),
            difficulty: {
                easy: 'Simple translation from words to equations',
                medium: 'Age problems and number problems',
                hard: 'Complex motion, mixture, and work problems'
            },
            parameters: { maxNumber: { default: 100 } },
        },

        'linear-relations': {
            id: 'linear-relations',
            name: 'Linear Relations',
            description: 'Tables, graphs and equations of linear relationships, and rate of change',
            strand: 'C',
            grades: gradeRange(8, 11),
            difficulty: {
                easy: 'Reading a rate of change from a table',
                medium: 'Writing y = mx + b from two points',
                hard: 'Comparing relations and interpreting intercepts in context'
            },
            parameters: { maxNumber: { default: 20 }, allowNegatives: { default: true } },
        },

        'coding': {
            id: 'coding',
            name: 'Coding & Algorithms',
            description: 'Tracing and completing sequences of instructions',
            strand: 'C',
            grades: gradeRange(1, 9),
            difficulty: {
                easy: 'Following a short sequence of steps',
                medium: 'Tracing a loop and reporting the result',
                hard: 'Working out the input that produces a given output'
            },
            parameters: {
                terms: { label: 'Steps in the sequence', default: 4, min: 3, max: 8 },
                maxNumber: { default: 50 },
            },
        },
    }
};
