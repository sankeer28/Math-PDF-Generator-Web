/**
 * Trigonometry Subject Configuration
 * Trigonometric functions, identities, and applications
 */

export const trigonometry = {
    id: 'trigonometry',
    name: 'Trigonometry',
    description: 'Trigonometric functions and their applications',
    icon: 'triangle',

    // Topics organized by concept
    topics: {
        'right-triangles': {
            id: 'right-triangles',
            name: 'Right Triangle Trigonometry',
            description: 'Sine, cosine, and tangent in right triangles',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Finding trig ratios with given sides',
                medium: 'Solving for missing sides using SOHCAHTOA',
                hard: 'Word problems with angles of elevation and depression'
            }
        },

        'unit-circle': {
            id: 'unit-circle',
            name: 'Unit Circle',
            description: 'Understanding the unit circle and special angles',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Finding coordinates on unit circle for special angles',
                medium: 'Converting between degrees and radians',
                hard: 'Reference angles and all quadrants'
            }
        },

        'trig-functions': {
            id: 'trig-functions',
            name: 'Trigonometric Functions',
            description: 'Graphing and analyzing trig functions',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Evaluating basic trig functions',
                medium: 'Graphing sine and cosine functions',
                hard: 'Amplitude, period, phase shift transformations'
            }
        },

        'identities': {
            id: 'identities',
            name: 'Trigonometric Identities',
            description: 'Pythagorean, reciprocal, and other identities',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Using basic identities (sin²θ + cos²θ = 1)',
                medium: 'Sum and difference formulas',
                hard: 'Proving complex identities'
            }
        },

        'equations': {
            id: 'equations',
            name: 'Trigonometric Equations',
            description: 'Solving equations involving trig functions',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Simple equations (sin x = 0.5)',
                medium: 'Equations requiring factoring',
                hard: 'Multiple angle equations and all solutions'
            }
        },

        'applications': {
            id: 'applications',
            name: 'Real-World Applications',
            description: 'Applying trigonometry to real situations',
            grades: ['high', 'college'],
            difficulty: {
                easy: 'Basic height and distance problems',
                medium: 'Navigation and bearing problems',
                hard: 'Complex modeling with multiple triangles'
            }
        }
    }
};
