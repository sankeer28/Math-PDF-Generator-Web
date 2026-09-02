import assert from 'node:assert/strict';
import test from 'node:test';

import { GRADE_CONFIGS, SUBJECT_TOPICS, getTopicsForGrade } from '../../js/curriculum/index.js';
import { ALL_GRADES, gradeRange } from '../../js/curriculum/config/grades.js';
import { parametersForTopic, defaultParameterValues, coerceParameter } from '../../js/curriculum/config/parameters.js';

const everyTopic = Object.entries(SUBJECT_TOPICS).flatMap(
    ([subjectId, subject]) => Object.entries(subject.topics).map(([topicId, topic]) => [subjectId, topicId, topic])
);

test('gradeRange builds inclusive ranges', () => {
    assert.deepEqual(gradeRange(3, 5), ['grade3', 'grade4', 'grade5']);
    assert.deepEqual(gradeRange(11), ['grade11', 'grade12']);
    assert.equal(gradeRange(1).length, 12);
});

test('every topic names real grades', () => {
    for (const [subjectId, topicId, topic] of everyTopic) {
        assert.ok(Array.isArray(topic.grades) && topic.grades.length > 0, `${subjectId}/${topicId}`);
        for (const grade of topic.grades) {
            assert.ok(ALL_GRADES.includes(grade), `${subjectId}/${topicId} names unknown grade ${grade}`);
        }
    }
});

test('every topic names a strand', () => {
    for (const [subjectId, topicId, topic] of everyTopic) {
        assert.ok(['B', 'C', 'D', 'E', 'F'].includes(topic.strand), `${subjectId}/${topicId}`);
    }
});

test('every topic parameter resolves against a known definition', () => {
    for (const [subjectId, topicId, topic] of everyTopic) {
        // parametersForTopic throws on an unknown parameter id.
        const parameters = parametersForTopic(topic);
        assert.ok(parameters.length > 0, `${subjectId}/${topicId} exposes no parameters`);
        for (const parameter of parameters) {
            assert.ok(parameter.label && parameter.help, `${subjectId}/${topicId}.${parameter.id}`);
            if (parameter.type === 'number') {
                assert.ok(parameter.default >= parameter.min && parameter.default <= parameter.max,
                    `${subjectId}/${topicId}.${parameter.id} default is outside its own range`);
            }
        }
    }
});

test('every grade offers subjects that exist and topics to fill them', () => {
    for (const grade of Object.values(GRADE_CONFIGS)) {
        assert.ok(grade.subjects.length > 0, grade.id);
        let topics = 0;
        for (const subjectId of grade.subjects) {
            assert.ok(SUBJECT_TOPICS[subjectId], `${grade.id} names unknown subject ${subjectId}`);
            topics += Object.keys(getTopicsForGrade(subjectId, grade.id)).length;
        }
        assert.ok(topics >= 10, `${grade.id} only has ${topics} topics`);
    }
});

test('topic availability rises then narrows across the grades', () => {
    const count = (gradeId) => GRADE_CONFIGS[gradeId].subjects
        .reduce((n, s) => n + Object.keys(getTopicsForGrade(s, gradeId)).length, 0);
    assert.ok(count('grade1') < count('grade5'), 'grade 1 should offer less than grade 5');
    assert.ok(count('grade5') < count('grade8'), 'grade 5 should offer less than grade 8');
});

test('the Financial Literacy strand spans the whole school', () => {
    assert.ok(SUBJECT_TOPICS.financialLiteracy);
    assert.ok(Object.keys(getTopicsForGrade('financialLiteracy', 'grade1')).length > 0);
    assert.ok(Object.keys(getTopicsForGrade('financialLiteracy', 'grade12')).length > 0);
});

test('senior grades carry their Ontario course code', () => {
    assert.equal(GRADE_CONFIGS.grade9.course, 'MTH1W');
    assert.equal(GRADE_CONFIGS.grade10.course, 'MPM2D');
    assert.equal(GRADE_CONFIGS.grade11.course, 'MCR3U');
    assert.equal(GRADE_CONFIGS.grade12.course, 'MHF4U');
});

test('parameter values are clamped to their definition', () => {
    const definition = { type: 'number', default: 100, min: 5, max: 1000, step: 5 };
    assert.equal(coerceParameter(definition, 999999), 1000);
    assert.equal(coerceParameter(definition, -3), 5);
    assert.equal(coerceParameter(definition, 'nonsense'), 100);
    assert.equal(coerceParameter({ type: 'boolean', default: false }, 'yes'), true);
    assert.equal(
        coerceParameter({ type: 'select', default: 'mixed', options: [{ value: 'like' }, { value: 'mixed' }] }, 'bogus'),
        'mixed'
    );
});

test('defaults are produced for every topic', () => {
    for (const [subjectId, topicId, topic] of everyTopic) {
        const values = defaultParameterValues(topic);
        assert.ok(Object.keys(values).length > 0, `${subjectId}/${topicId}`);
    }
});
