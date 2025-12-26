/**
 * Grade 1 Level Configuration
 * Age: 6-7 years old
 * Based on: Ontario Mathematics Curriculum 2020
 * Focus: Numbers to 50, addition/subtraction to 20, counting by 1s, 2s, 5s, 10s
 */

export const grade1 = {
    id: 'grade1',
    name: 'Grade 1',
    ageRange: '6-7 years',
    description: 'Numbers to 50, addition and subtraction to 20, skip counting, money to 20¢',

    // Available subjects (Ontario Strands: Number, Algebra, Data, Spatial Sense, Financial Literacy)
    subjects: ['arithmetic', 'measurement', 'geometry', 'statistics'],

    // Number range (Ontario: representing and ordering to 50, operations to 20)
    maxNumber: 50,

    // Available operations (Ontario: addition/subtraction, counting by 1s, 2s, 5s, 10s)
    operations: ['addition', 'subtraction'],

    // Complexity multiplier
    complexityMultiplier: 0.4,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'easy',
        problemType: 'mixed',
        problemsPerPage: 15
    }
};
