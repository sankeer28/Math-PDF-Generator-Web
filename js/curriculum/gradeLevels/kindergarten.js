/**
 * Kindergarten Grade Level Configuration
 * Age: 4-6 years old
 * Based on: Ontario Mathematics Curriculum 2020
 * Focus: Counting to 10, subitizing, comparing quantities, basic shapes
 */

export const kindergarten = {
    id: 'kindergarten',
    name: 'Kindergarten',
    ageRange: '4-6 years',
    description: 'Investigating numbers 1-10, subitizing, comparing quantities, and exploring shapes',

    // Available subjects for this grade level (Ontario Strands: Number, Spatial Sense, Data)
    subjects: ['arithmetic', 'geometry', 'statistics'],

    // Number range appropriate for this level (Ontario: counting to 10)
    maxNumber: 10,

    // Available operations (Ontario: subitizing and simple combining/separating)
    operations: ['addition', 'subtraction'],

    // Complexity multiplier
    complexityMultiplier: 0.3,

    // Available problem types
    problemTypes: ['equations', 'word', 'mixed'],

    // Recommended defaults
    defaults: {
        difficulty: 'easy',
        problemType: 'word',
        problemsPerPage: 10
    }
};
