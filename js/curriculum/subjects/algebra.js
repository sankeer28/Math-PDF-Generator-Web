/**
 * Algebra Subject Configuration
 * Variables, equations, functions, and abstract mathematical reasoning
 */

export const algebra = {
    id: 'algebra',
    name: 'Algebra',
    description: 'Variables, equations, and algebraic thinking',
    icon: 'function',

    // Topics organized by concept
    topics: {
        'expressions': {
            id: 'expressions',
            name: 'Algebraic Expressions',
            description: 'Writing, evaluating, and simplifying expressions',
            grades: ['middle', 'high'],
            difficulty: {
                easy: 'Evaluating expressions with one variable',
                medium: 'Simplifying expressions by combining like terms',
                hard: 'Complex expressions with multiple variables and operations'
            }
        },

        'linear-equations': {
            id: 'linear-equations',
            name: 'Linear Equations',
            description: 'Solving equations of the form ax + b = c',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'One-step equations (x + 5 = 12)',
                medium: 'Two-step equations (2x + 5 = 13)',
                hard: 'Multi-step equations with variables on both sides'
            }
        },

        'quadratic-equations': {
            id: 'quadratic-equations',
            name: 'Quadratic Equations',
            description: 'Solving equations of the form ax² + bx + c = 0',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Factoring simple quadratics (x² + 5x + 6 = 0)',
                medium: 'Using quadratic formula',
                hard: 'Completing the square and complex solutions'
            }
        },

        'systems': {
            id: 'systems',
            name: 'Systems of Equations',
            description: 'Solving multiple equations simultaneously',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Two linear equations with substitution',
                medium: 'Elimination method',
                hard: 'Three or more equations or non-linear systems'
            }
        },

        'polynomials': {
            id: 'polynomials',
            name: 'Polynomials',
            description: 'Operations with polynomial expressions',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Adding and subtracting polynomials',
                medium: 'Multiplying polynomials',
                hard: 'Polynomial division and synthetic division'
            }
        },

        'exponents-radicals': {
            id: 'exponents-radicals',
            name: 'Exponents & Radicals',
            description: 'Simplifying expressions with exponents and radicals',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Basic exponent rules (product, quotient, power)',
                medium: 'Simplifying radical expressions',
                hard: 'Rational exponents and complex radical operations'
            }
        },

        'rational-expressions': {
            id: 'rational-expressions',
            name: 'Rational Expressions',
            description: 'Simplifying and operating with rational expressions',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Simplifying simple rational expressions',
                medium: 'Adding and subtracting rational expressions',
                hard: 'Complex fractions and rational equations'
            }
        },

        'absolute-value': {
            id: 'absolute-value',
            name: 'Absolute Value',
            description: 'Absolute value equations, inequalities, and graphs',
            grades: ['middle', 'high'],
            difficulty: {
                easy: 'Evaluating absolute value expressions',
                medium: 'Solving absolute value equations',
                hard: 'Absolute value inequalities and piecewise functions'
            }
        },

        'factoring': {
            id: 'factoring',
            name: 'Factoring',
            description: 'Breaking down algebraic expressions into factors',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Factoring out common factors',
                medium: 'Factoring trinomials',
                hard: 'Difference of squares and complex factoring'
            }
        },

        'inequalities': {
            id: 'inequalities',
            name: 'Inequalities',
            description: 'Solving and graphing inequalities',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'One-step inequalities',
                medium: 'Multi-step inequalities',
                hard: 'Compound inequalities and absolute value'
            }
        },

        'functions': {
            id: 'functions',
            name: 'Functions & Relations',
            description: 'Understanding functions, domain, and range',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Evaluating functions f(x)',
                medium: 'Graphing linear and quadratic functions',
                hard: 'Composite functions and inverse functions'
            }
        },

        'word-problems': {
            id: 'word-problems',
            name: 'Algebraic Word Problems',
            description: 'Real-world problems requiring algebraic solutions',
            grades: ['middle', 'high', 'college'],
            difficulty: {
                easy: 'Simple translation from words to equations',
                medium: 'Age problems and number problems',
                hard: 'Complex motion, mixture, and work problems'
            }
        }
    }
};
