/**
 * Grade 2 Level Configuration
 * Age: 7-8 years old
 * Based on: Ontario Mathematics Curriculum 2020
 * Focus: Numbers to 200, addition/subtraction with regrouping, equal sharing, fractions
 */

export const grade2 = {
    id: 'grade2',
    name: 'Grade 2',
    ageRange: '7-8 years',
    description: 'Numbers to 200, addition and subtraction with regrouping, introduction to equal sharing and fractions',

    // Available subjects (Ontario Strands: Number, Algebra, Data, Spatial Sense, Financial Literacy)
    subjects: ['arithmetic', 'measurement', 'geometry', 'statistics'],

    // Number range (Ontario: working with numbers up to 200)
    maxNumber: 200,

    // Available operations (Ontario: addition, subtraction, introduction to multiplication through equal groups)
    operations: ['addition', 'subtraction', 'multiplication'],

    // Complexity multiplier
    complexityMultiplier: 0.5,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'easy',
        problemType: 'mixed',
        problemsPerPage: 16
    }
};
