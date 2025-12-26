/**
 * Configuration Constants Module
 * @module constants
 *
 * NOTE: This file now imports from the organized curriculum structure.
 * To modify curriculum data, edit files in the /curriculum directory:
 *
 * - Grade Levels: /curriculum/gradeLevels/
 * - Subjects: /curriculum/subjects/
 * - Difficulty: /curriculum/config/difficulty.js
 * - Word Problem Data: /curriculum/config/contextualData.js
 */

// Import and re-export from organized curriculum structure
export {
    GRADE_CONFIGS,
    SUBJECT_TOPICS,
    DIFFICULTY_MULTIPLIERS,
    CONTEXTUAL_DATA,
    getGradeConfig,
    getSubjectConfig,
    getTopicsForGrade,
    isSubjectAvailableForGrade,
    getDifficultyMultiplier,
    getDifficultyConfig,
    getRandomItem,
    getRandomItems
} from '../curriculum/index.js';
