/**
 * Curriculum Index
 * Central export point for all curriculum data
 *
 * This modular structure allows for easy:
 * - Addition of new grade levels
 * - Addition of new subjects
 * - Modification of topics
 * - Updates to difficulty settings
 * - Expansion of contextual data
 */

// Grade Level Configurations - Individual Grades 1-12
import { grade1 } from './gradeLevels/grade1.js';
import { grade2 } from './gradeLevels/grade2.js';
import { grade3 } from './gradeLevels/grade3.js';
import { grade4 } from './gradeLevels/grade4.js';
import { grade5 } from './gradeLevels/grade5.js';
import { grade6 } from './gradeLevels/grade6.js';
import { grade7 } from './gradeLevels/grade7.js';
import { grade8 } from './gradeLevels/grade8.js';
import { grade9 } from './gradeLevels/grade9.js';
import { grade10 } from './gradeLevels/grade10.js';
import { grade11 } from './gradeLevels/grade11.js';
import { grade12 } from './gradeLevels/grade12.js';

// Subject Configurations
import { arithmetic } from './subjects/arithmetic.js';
import { measurement } from './subjects/measurement.js';
import { algebra } from './subjects/algebra.js';
import { geometry } from './subjects/geometry.js';
import { statistics } from './subjects/statistics.js';
import { trigonometry } from './subjects/trigonometry.js';
import { precalculus } from './subjects/precalculus.js';
import { calculus } from './subjects/calculus.js';

// Configuration Data
import { DIFFICULTY_MULTIPLIERS, getDifficultyMultiplier, getDifficultyConfig } from './config/difficulty.js';
import { names, professions, places, items, actions, timeframes, measurements, events, seasons, activities, comparisons, getRandomItem, getRandomItems } from './config/contextualData.js';

/**
 * Grade configurations indexed by ID
 * Individual grades 1-12
 */
export const GRADE_CONFIGS = {
    grade1,
    grade2,
    grade3,
    grade4,
    grade5,
    grade6,
    grade7,
    grade8,
    grade9,
    grade10,
    grade11,
    grade12
};

/**
 * Subject configurations indexed by ID
 */
export const SUBJECT_TOPICS = {
    arithmetic,
    measurement,
    algebra,
    geometry,
    statistics,
    trigonometry,
    precalculus,
    calculus
};

/**
 * Difficulty settings and multipliers
 */
export { DIFFICULTY_MULTIPLIERS, getDifficultyMultiplier, getDifficultyConfig };

/**
 * Contextual data for word problems
 */
export const CONTEXTUAL_DATA = {
    names,
    professions,
    places,
    items,
    actions,
    timeframes,
    measurements,
    events,
    seasons,
    activities,
    comparisons
};

/**
 * Utility functions for contextual data
 */
export { getRandomItem, getRandomItems };

/**
 * Get grade level configuration
 * @param {string} gradeId - Grade level ID
 * @returns {object} Grade configuration
 */
export function getGradeConfig(gradeId) {
    return GRADE_CONFIGS[gradeId];
}

/**
 * Get subject configuration
 * @param {string} subjectId - Subject ID
 * @returns {object} Subject configuration
 */
export function getSubjectConfig(subjectId) {
    return SUBJECT_TOPICS[subjectId];
}

/**
 * Get topics for a specific subject and grade level
 * @param {string} subjectId - Subject ID
 * @param {string} gradeId - Grade level ID
 * @returns {object} Filtered topics appropriate for grade level
 */
export function getTopicsForGrade(subjectId, gradeId) {
    const subject = SUBJECT_TOPICS[subjectId];
    if (!subject) return {};

    const filteredTopics = {};
    for (const [topicId, topicData] of Object.entries(subject.topics)) {
        if (topicData.grades.includes(gradeId)) {
            filteredTopics[topicId] = topicData;
        }
    }
    return filteredTopics;
}

/**
 * Check if a subject is available for a grade level
 * @param {string} subjectId - Subject ID
 * @param {string} gradeId - Grade level ID
 * @returns {boolean} True if subject is available for grade
 */
export function isSubjectAvailableForGrade(subjectId, gradeId) {
    const grade = GRADE_CONFIGS[gradeId];
    return grade?.subjects.includes(subjectId) || false;
}
