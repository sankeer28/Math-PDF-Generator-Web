/**
 * Grade 3 Level Configuration
 * Age: 8-9 years old
 * Based on: Ontario Mathematics Curriculum 2020
 * Focus: Multiplication facts (×2, ×5, ×10), division, fractions (halves, thirds, fourths, fifths, sixths, eighths, tenths)
 */

export const grade3 = {
    id: 'grade3',
    name: 'Grade 3',
    ageRange: '8-9 years',
    description: 'Multiplication facts ×2, ×5, ×10, division, fractions as fair shares, numbers to 1000',

    // Available subjects (Ontario Strands: Number, Algebra, Data, Spatial Sense, Financial Literacy)
    subjects: ['arithmetic', 'measurement', 'geometry', 'statistics'],

    // Number range (Ontario: numbers to 1000)
    maxNumber: 1000,

    // Available operations (Ontario: × 2, × 5, × 10, related division)
    operations: ['addition', 'subtraction', 'multiplication', 'division'],

    // Complexity multiplier
    complexityMultiplier: 0.6,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'medium',
        problemType: 'mixed',
        problemsPerPage: 18
    }
};
