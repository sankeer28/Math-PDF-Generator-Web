/**
 * Grade 4 Level Configuration
 * Age: 9-10 years old
 * Based on: Ontario Mathematics Curriculum 2020
 * Focus: Multiplication facts 0×0 to 12×12, multi-digit operations, decimal tenths, fractions
 */

export const grade4 = {
    id: 'grade4',
    name: 'Grade 4',
    ageRange: '9-10 years',
    description: 'Mastery of multiplication facts to 12×12, multi-digit operations, decimal tenths, equivalent fractions',

    // Available subjects (Ontario Strands: Number, Algebra, Data, Spatial Sense, Financial Literacy)
    subjects: ['arithmetic', 'measurement', 'algebra', 'geometry', 'statistics'],

    // Number range (Ontario: multi-digit numbers)
    maxNumber: 10000,

    // Available operations (Ontario: all multiplication facts 0×0 to 12×12, division with remainders)
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],

    // Complexity multiplier
    complexityMultiplier: 0.7,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'medium',
        problemType: 'mixed',
        problemsPerPage: 20
    }
};
