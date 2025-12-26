/**
 * Grade 8 Level Configuration
 * Age: 13-14 years old
 * Based on: Ontario Mathematics Curriculum 2020
 * Focus: Algebraic equations, linear relationships, Pythagorean theorem, transformations
 */

export const grade8 = {
    id: 'grade8',
    name: 'Grade 8',
    ageRange: '13-14 years',
    description: 'Writing and solving algebraic equations, linear relationships, Pythagorean theorem, geometric transformations',

    // Available subjects (Ontario Strands: Number, Algebra, Data, Spatial Sense, Financial Literacy)
    subjects: ['algebra', 'geometry', 'statistics'],

    // Number range (Ontario: focus on algebraic thinking)
    maxNumber: 1000000,

    // Available operations
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],

    // Complexity multiplier
    complexityMultiplier: 1.1,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'medium',
        problemType: 'equations',
        problemsPerPage: 15
    }
};
