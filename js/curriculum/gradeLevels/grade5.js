/**
 * Grade 5 Level Configuration
 * Age: 10-11 years old
 * Based on: Ontario Mathematics Curriculum 2020
 * Focus: Percentages, adding/subtracting fractions with same denominator, decimal operations, large numbers
 */

export const grade5 = {
    id: 'grade5',
    name: 'Grade 5',
    ageRange: '10-11 years',
    description: 'Introduction to percentages, fraction operations, decimal operations, numbers to 100,000',

    // Available subjects (Ontario Strands: Number, Algebra, Data, Spatial Sense, Financial Literacy)
    subjects: ['arithmetic', 'measurement', 'algebra', 'geometry', 'statistics'],

    // Number range (Ontario: large numbers, decimals)
    maxNumber: 100000,

    // Available operations (Ontario: all operations, percentages, fractions)
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],

    // Complexity multiplier
    complexityMultiplier: 0.8,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'medium',
        problemType: 'mixed',
        problemsPerPage: 20
    }
};
