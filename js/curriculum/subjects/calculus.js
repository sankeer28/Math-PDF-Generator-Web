/**
 * Calculus Subject Configuration
 * Limits, derivatives, integrals, and applications
 */

export const calculus = {
    id: 'calculus',
    name: 'Calculus',
    description: 'Limits, derivatives, integrals, and their applications',
    icon: 'infinity',

    // Topics organized by concept
    topics: {
        'limits': {
            id: 'limits',
            name: 'Limits',
            description: 'Understanding and evaluating limits',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Direct substitution limits',
                medium: 'Limits requiring factoring or rationalization',
                hard: 'Limits at infinity and indeterminate forms'
            }
        },

        'derivatives': {
            id: 'derivatives',
            name: 'Derivatives',
            description: 'Finding and applying derivatives',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Power rule derivatives',
                medium: 'Product and quotient rules',
                hard: 'Chain rule and implicit differentiation'
            }
        },

        'integrals': {
            id: 'integrals',
            name: 'Integrals',
            description: 'Antiderivatives and definite integrals',
            grades: ['college'],
            difficulty: {
                easy: 'Basic power rule integration',
                medium: 'U-substitution',
                hard: 'Integration by parts and partial fractions'
            }
        },

        'optimization': {
            id: 'optimization',
            name: 'Optimization',
            description: 'Finding maximum and minimum values',
            grades: ['college'],
            difficulty: {
                easy: 'Finding critical points',
                medium: 'First and second derivative tests',
                hard: 'Applied optimization word problems'
            }
        },

        'related-rates': {
            id: 'related-rates',
            name: 'Related Rates',
            description: 'Rates of change in related quantities',
            grades: ['college'],
            difficulty: {
                easy: 'Simple related rates (growing radius)',
                medium: 'Pythagorean related rates',
                hard: 'Complex multi-variable related rates'
            }
        },

        'applications': {
            id: 'applications',
            name: 'Applications of Calculus',
            description: 'Real-world calculus applications',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Position, velocity, acceleration',
                medium: 'Area under curves',
                hard: 'Volume of revolution and advanced applications'
            }
        }
    }
};
