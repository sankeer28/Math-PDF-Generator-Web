/**
 * Grade 7 Level Configuration
 * Age: 12-13 years old
 * Based on: Ontario Mathematics Curriculum 2020
 * Focus: Rational numbers, integers operations, solving equations, proportional relationships
 */

export const grade7 = {
    id: 'grade7',
    name: 'Grade 7',
    ageRange: '12-13 years',
    description: 'Rational numbers to 1 billion, integer operations, solving equations with decimals, proportional relationships',

    // Available subjects (Ontario Strands: Number, Algebra, Data, Spatial Sense, Financial Literacy)
    subjects: ['arithmetic', 'algebra', 'geometry', 'statistics'],

    // Number range (Ontario: numbers to 1 billion)
    maxNumber: 1000000000,

    // Available operations (Ontario: all operations with integers and rational numbers)
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],

    // Complexity multiplier
    complexityMultiplier: 1.0,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'medium',
        problemType: 'equations',
        problemsPerPage: 16
    }
};
