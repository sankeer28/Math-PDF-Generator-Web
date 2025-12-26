/**
 * Grade 11 Level Configuration (MCR3U - Functions / MCF3M - Functions and Applications)
 * Age: 16-17 years old
 * Based on: Ontario Secondary Mathematics Curriculum
 * Focus: Functions, exponential, trigonometric functions, sequences and series
 */

export const grade11 = {
    id: 'grade11',
    name: 'Grade 11 (Algebra II)',
    ageRange: '16-17 years',
    description: 'MCR3U: Functions, exponential functions, trigonometric functions, sequences and series',

    // Available subjects
    subjects: ['algebra', 'trigonometry', 'precalculus', 'statistics'],

    // Number range
    maxNumber: 10000000,

    // Available operations
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],

    // Complexity multiplier
    complexityMultiplier: 1.4,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'hard',
        problemType: 'equations',
        problemsPerPage: 10
    }
};
