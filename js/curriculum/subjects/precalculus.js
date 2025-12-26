/**
 * Pre-Calculus Subject Configuration
 * Advanced functions, trigonometry, and preparation for calculus
 * Typically Grade 11-12 (before Calculus)
 */

export const precalculus = {
    id: 'precalculus',
    name: 'Pre-Calculus',
    description: 'Advanced algebra, trigonometry, and preparation for calculus',
    icon: 'function',

    // Topics organized by concept
    topics: {
        'exponential-functions': {
            id: 'exponential-functions',
            name: 'Exponential Functions',
            description: 'Exponential growth, decay, and applications',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Evaluating exponential expressions (2^x, e^x)',
                medium: 'Graphing exponential functions and transformations',
                hard: 'Exponential growth/decay word problems and applications'
            }
        },

        'logarithms': {
            id: 'logarithms',
            name: 'Logarithmic Functions',
            description: 'Logarithms, properties, and equations',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Converting between exponential and logarithmic form',
                medium: 'Using logarithm properties to simplify expressions',
                hard: 'Solving logarithmic equations and applications'
            }
        },

        'sequences-series': {
            id: 'sequences-series',
            name: 'Sequences & Series',
            description: 'Arithmetic and geometric sequences, series, and summation',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Finding terms in arithmetic and geometric sequences',
                medium: 'Finding sums of finite series',
                hard: 'Infinite series, convergence, and applications'
            }
        },

        'polynomial-functions': {
            id: 'polynomial-functions',
            name: 'Polynomial Functions',
            description: 'Higher-degree polynomials, graphing, and analysis',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Evaluating and graphing simple polynomials',
                medium: 'Finding zeros and analyzing end behavior',
                hard: 'Polynomial division, Remainder Theorem, Factor Theorem'
            }
        },

        'rational-functions': {
            id: 'rational-functions',
            name: 'Rational Functions',
            description: 'Ratios of polynomials, asymptotes, and graphing',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Simplifying rational expressions',
                medium: 'Finding vertical and horizontal asymptotes',
                hard: 'Graphing rational functions with holes and asymptotes'
            }
        },

        'conic-sections': {
            id: 'conic-sections',
            name: 'Conic Sections',
            description: 'Circles, ellipses, parabolas, and hyperbolas',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Graphing circles from standard form',
                medium: 'Writing equations of ellipses and parabolas',
                hard: 'Identifying and graphing all conics from general form'
            }
        },

        'parametric-polar': {
            id: 'parametric-polar',
            name: 'Parametric & Polar Equations',
            description: 'Parametric equations and polar coordinates',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Plotting points in polar coordinates',
                medium: 'Converting between rectangular and polar forms',
                hard: 'Graphing complex polar and parametric equations'
            }
        },

        'vectors-matrices': {
            id: 'vectors-matrices',
            name: 'Vectors & Matrices',
            description: 'Vector operations, matrices, and transformations',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Vector addition and scalar multiplication',
                medium: 'Matrix operations (addition, multiplication)',
                hard: 'Determinants, inverses, and solving systems with matrices'
            }
        },

        'complex-numbers': {
            id: 'complex-numbers',
            name: 'Complex Numbers',
            description: 'Imaginary numbers and complex number operations',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Simplifying expressions with i',
                medium: 'Operations with complex numbers (a + bi)',
                hard: 'Complex plane, De Moivre\'s Theorem, and polar form'
            }
        }
    }
};
