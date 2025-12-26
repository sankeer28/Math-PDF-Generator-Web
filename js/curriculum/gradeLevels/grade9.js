/**
 * Grade 9 Level Configuration (MPM1D - Principles of Mathematics)
 * Age: 14-15 years old
 * Based on: Ontario Secondary Mathematics Curriculum
 * Focus: Algebra, analytic geometry, measurement, linear relations
 */

export const grade9 = {
    id: 'grade9',
    name: 'Grade 9 (Algebra I)',
    ageRange: '14-15 years',
    description: 'MPM1D: Algebra, linear relations, analytic geometry, measurement and geometry',

    // Available subjects (MPM1D strands)
    subjects: ['algebra', 'geometry', 'statistics'],

    // Number range
    maxNumber: 1000000,

    // Available operations
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],

    // Complexity multiplier
    complexityMultiplier: 1.2,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'medium',
        problemType: 'equations',
        problemsPerPage: 12
    }
};
