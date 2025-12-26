/**
 * Grade 6 Level Configuration
 * Age: 11-12 years old
 * Based on: Ontario Mathematics Curriculum 2020
 * Focus: Integers introduced, divisibility rules, ratios, percents, patterns, introduction to algebra
 */

export const grade6 = {
    id: 'grade6',
    name: 'Grade 6',
    ageRange: '11-12 years',
    description: 'Introduction to integers, divisibility rules (2,3,4,5,6,8,9,10), ratios, percents, algebraic patterns',

    // Available subjects (Ontario Strands: Number, Algebra, Data, Spatial Sense, Financial Literacy)
    subjects: ['arithmetic', 'measurement', 'algebra', 'geometry', 'statistics'],

    // Number range (Ontario: working with larger numbers, introduction to negative numbers)
    maxNumber: 1000000,

    // Available operations (Ontario: all operations including integers)
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],

    // Complexity multiplier
    complexityMultiplier: 0.9,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'medium',
        problemType: 'equations',
        problemsPerPage: 18
    }
};
