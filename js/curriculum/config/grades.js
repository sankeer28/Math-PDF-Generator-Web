/**
 * Grade identifiers and ranges
 *
 * Topics declare which grades they belong to. Writing those as explicit lists
 * is verbose and easy to get wrong, so they are built from ranges instead.
 *
 * @module curriculum/config/grades
 */

/** Every grade the app offers, in order. */
export const ALL_GRADES = Object.freeze([
    'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6',
    'grade7', 'grade8', 'grade9', 'grade10', 'grade11', 'grade12',
]);

/**
 * The grades from `from` to `to`, inclusive.
 *
 * @param {number} from - first grade, 1-12
 * @param {number} [to] - last grade, 1-12; defaults to grade 12
 * @returns {string[]} grade ids
 * @example gradeRange(3, 6) // ['grade3', 'grade4', 'grade5', 'grade6']
 */
export function gradeRange(from, to = 12) {
    return ALL_GRADES.slice(from - 1, to);
}

/** The numeric part of a grade id, so grades can be compared. */
export function gradeNumber(gradeId) {
    return Number(String(gradeId).replace('grade', '')) || 0;
}

/**
 * Ontario organises expectations into strands. Topics name the strand they
 * serve so the UI can group them the way a teacher's planning documents do.
 *
 * Grades 1-8 use the six elementary strands; Grade 9 (MTH1W) and the senior
 * courses use their own, which map onto the same letters closely enough for
 * grouping purposes.
 */
export const STRANDS = Object.freeze({
    B: 'Number',
    C: 'Algebra',
    D: 'Data',
    E: 'Spatial Sense',
    F: 'Financial Literacy',
});
