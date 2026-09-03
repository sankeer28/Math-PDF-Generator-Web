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

test('every numeric default is a value its own control accepts', () => {
    // A number input whose value is off the step grid, or outside min/max, is
    // :invalid. That blocks form submission, and when the control sits in a
    // hidden tab panel the browser cannot even focus it to say why - the
    // download just fails with a console warning.
    for (const [subjectId, topicId, topic] of everyTopic) {
        for (const parameter of parametersForTopic(topic)) {
            if (parameter.type !== 'number') continue;
            const where = `${subjectId}/${topicId}.${parameter.id}`;

            assert.ok(parameter.default >= parameter.min, `${where} default below min`);
            assert.ok(parameter.default <= parameter.max, `${where} default above max`);
            assert.equal(
                (parameter.default - parameter.min) % parameter.step, 0,
                `${where} default ${parameter.default} is off its step grid (min ${parameter.min}, step ${parameter.step})`
            );
        }
    }
});

test('every visual template produces a question, an answer and a figure', async () => {
    const { VISUAL_PROBLEMS } = await import('../../js/curriculum/templates/visualProblems.js');
    const parameters = { maxNumber: 20, maxDenominator: 12 };

    for (const [topicId, draws] of Object.entries(VISUAL_PROBLEMS)) {
        assert.ok(findTopicById(topicId), `visual topic "${topicId}" is not a real topic`);

        for (const draw of draws) {
            // Figures are random, so draw each one repeatedly: a bad rounding or
            // an empty range would otherwise only show up for some seeds.
            for (let attempt = 0; attempt < 25; attempt += 1) {
                const problem = draw(parameters);
                assert.ok(problem.question?.length > 0, topicId);
                assert.ok(String(problem.answer).length > 0, topicId);
                assert.match(problem.figure, /^\\begin\{tikzpicture\}/, topicId);
                assert.match(problem.figure, /\\end\{tikzpicture\}$/, topicId);
                assert.ok(!problem.figure.includes('NaN'), `${topicId} produced NaN in its figure`);
                assert.ok(!problem.figure.includes('undefined'), `${topicId} produced undefined`);
            }
        }
    }
});

/** Visual templates are keyed by topic id, so those ids have to exist. */
function findTopicById(topicId) {
    return Object.values(SUBJECT_TOPICS).some((subject) => subject.topics[topicId]);
}

test('every visual template declares a grade band and a height', async () => {
    const { VISUAL_PROBLEMS } = await import('../../js/curriculum/templates/visualProblems.js');
    for (const draw of new Set(Object.values(VISUAL_PROBLEMS).flat())) {
        assert.ok(Array.isArray(draw.grades), `${draw.name} has no grade band`);
        const [first, last] = draw.grades;
        assert.ok(first >= 1 && last <= 12 && first <= last, `${draw.name} band ${first}-${last} is not sane`);
        assert.ok(draw.heightMm > 0, `${draw.name} has no height`);
    }
});

test('a grade is never offered a figure from outside its band', async () => {
    const { ProblemGenerator } = await import('../../js/modules/problemGenerator.js');
    const { VISUAL_PROBLEMS } = await import('../../js/curriculum/templates/visualProblems.js');

    // Which question wordings each figure can produce, so a drawn problem can be
    // traced back to the figure that made it.
    const owner = new Map();
    for (const draw of new Set(Object.values(VISUAL_PROBLEMS).flat())) {
        for (let i = 0; i < 40; i += 1) {
            for (const grade of [2, 6, 11]) {
                const problem = draw({ grade, difficulty: 'medium', maxNumber: 20, maxDenominator: 12 });
                if (!owner.has(problem.question)) owner.set(problem.question, draw);
            }
        }
    }

    for (const gradeId of ['grade1', 'grade2', 'grade5', 'grade8', 'grade11', 'grade12']) {
        const grade = Number(gradeId.replace('grade', ''));
        const generator = new ProblemGenerator();
        generator.setConfig(gradeId, 'medium', Object.keys(SUBJECT_TOPICS));

        for (let i = 0; i < 150; i += 1) {
            const problem = generator.generateVisualProblem();
            const draw = owner.get(problem.question);
            if (!draw) continue;
            const [first, last] = draw.grades;
            assert.ok(
                grade >= first && grade <= last,
                `${gradeId} was offered ${draw.name}, which is for grades ${first}-${last}`
            );
        }
    }
});
