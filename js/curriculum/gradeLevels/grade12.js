/**
 * Grade 12 Level Configuration (MHF4U - Advanced Functions / MCV4U - Calculus and Vectors)
 * Age: 17-18 years old
 * Based on: Ontario Secondary Mathematics Curriculum
 * Focus: Advanced functions, calculus (limits, derivatives, integrals), vectors
 */

export const grade12 = {
    id: 'grade12',
    name: 'Grade 12 (Pre-Calc/Calc)',
    ageRange: '17-18 years',
    description: 'MHF4U/MCV4U: Polynomial/rational/logarithmic/trigonometric functions, calculus, vectors',

    // Available subjects
    subjects: ['algebra', 'geometry', 'trigonometry', 'precalculus', 'calculus', 'statistics'],

    // Number range
    maxNumber: 10000000,

    // Available operations
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],

    // Complexity multiplier
    complexityMultiplier: 1.5,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'hard',
        problemType: 'equations',
        problemsPerPage: 10
    }
};
