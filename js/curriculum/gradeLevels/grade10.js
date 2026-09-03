/**
 * Grade 10 Level Configuration (MPM2D - Principles of Mathematics)
 * Age: 15-16 years old
 * Based on: Ontario Secondary Mathematics Curriculum
 * Focus: Quadratics, trigonometry, analytic geometry, linear systems
 */

export const grade10 = {
    id: 'grade10',
    name: 'Grade 10 (MPM2D)',
    course: 'MPM2D',
    courseName: 'Principles of Mathematics',
    ageRange: '15-16 years',
    description: 'MPM2D: Quadratic relations, trigonometry, analytic geometry, linear systems',

    // Available subjects (MPM2D strands)
    subjects: ['arithmetic', 'algebra', 'geometry', 'trigonometry', 'statistics', 'financialLiteracy'],

    // Number range
    maxNumber: 1000000,

    // Available operations
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],

    // Complexity multiplier
    complexityMultiplier: 1.3,

    // Available problem types
    problemTypes: ['equations', 'word', 'visual', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'medium',
        problemType: 'equations',
        problemsPerPage: 12
    }
};
