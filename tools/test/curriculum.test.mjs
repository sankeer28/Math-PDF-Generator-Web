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

    // Which figures can produce each question wording. A wording can belong to
    // more than one figure — "How many figures are shown?" fits both a growing
    // pattern and a sequence of dots — so a question is only evidence of a
    // band violation when *every* figure that could have written it is out of
    // band for the grade.
    const owners = new Map();
    for (const draw of new Set(Object.values(VISUAL_PROBLEMS).flat())) {
        for (let i = 0; i < 40; i += 1) {
            for (const grade of [2, 6, 11]) {
                const problem = draw({ grade, difficulty: 'medium', maxNumber: 20, maxDenominator: 12 });
                if (!owners.has(problem.question)) owners.set(problem.question, new Set());
                owners.get(problem.question).add(draw);
            }
        }
    }

    for (const gradeId of ['grade1', 'grade2', 'grade5', 'grade8', 'grade11', 'grade12']) {
        const grade = Number(gradeId.replace('grade', ''));
        const generator = new ProblemGenerator();
        generator.setConfig(gradeId, 'medium', Object.keys(SUBJECT_TOPICS));

        for (let i = 0; i < 150; i += 1) {
            const problem = generator.generateVisualProblem();
            const candidates = owners.get(problem.question);
            if (!candidates) continue;

            const anyInBand = [...candidates].some((draw) => {
                const [first, last] = draw.grades;
                return grade >= first && grade <= last;
            });

            assert.ok(
                anyInBand,
                `${gradeId} was offered "${problem.question}", which only ${[...candidates]
                    .map((draw) => `${draw.name} (grades ${draw.grades.join('-')})`)
                    .join(', ')} can produce`
            );
        }
    }
});

test('every figure declared in the module is reachable from some topic', async () => {
    // A figure is anything given a height and a grade band. One that no topic
    // lists is dead code: it compiles, it passes its own checks, and it never
    // once appears on a worksheet.
    const { readFileSync } = await import('node:fs');
    const module = await import('../../js/curriculum/templates/visualProblems.js');

    const source = readFileSync(new URL('../../js/curriculum/templates/visualProblems.js', import.meta.url), 'utf8');
    const declared = [...source.matchAll(/^(\w+)\.heightMm = /gm)].map((match) => match[1]);
    assert.ok(declared.length > 40, 'expected the figure catalogue to be found');

    const wired = new Set(Object.values(module.VISUAL_PROBLEMS).flat().map((draw) => draw.name));
    const orphans = declared.filter((name) => !wired.has(name));
    assert.deepEqual(orphans, [], `figures declared but never offered: ${orphans.join(', ')}`);
});

test('every early-grade problem states a real question and a real answer', async () => {
    // These templates are written by hand and are easy to get wrong in a way
    // nothing else catches: an answer that is a hint ("add the two ends") or an
    // undefined slipping into a template string still renders a worksheet, and
    // the mistake surfaces only on the answer key a teacher hands out.
    const { EARLY_PROBLEMS, drawEarlyProblem } = await import('../../js/curriculum/templates/earlyGrades.js');

    for (const [subject, byGrade] of Object.entries(EARLY_PROBLEMS)) {
        for (const gradeId of Object.keys(byGrade)) {
            for (let i = 0; i < 400; i += 1) {
                const problem = drawEarlyProblem(subject, gradeId);
                assert.ok(problem, `${subject}/${gradeId} produced nothing`);

                const where = `${subject}/${gradeId}: ${problem.question}`;
                assert.ok(problem.question?.trim().length > 0, `${where} has no question`);

                const answer = String(problem.answer ?? '');
                assert.ok(answer.trim().length > 0, `${where} has no answer`);
                assert.ok(!/undefined|NaN|\[object/.test(answer), `${where} answered with "${answer}"`);
                assert.ok(!/undefined|NaN|\[object/.test(problem.question), `${where} has a broken question`);
            }
        }
    }
});

test('early-grade problems only cover grades 1 to 3', async () => {
    const { EARLY_PROBLEMS, drawEarlyProblem } = await import('../../js/curriculum/templates/earlyGrades.js');

    for (const byGrade of Object.values(EARLY_PROBLEMS)) {
        for (const gradeId of Object.keys(byGrade)) {
            assert.ok(['grade1', 'grade2', 'grade3'].includes(gradeId), `${gradeId} is not an early grade`);
        }
    }

    assert.equal(drawEarlyProblem('arithmetic', 'grade7'), null);
    assert.equal(drawEarlyProblem('calculus', 'grade1'), null);
});

test('every supplementary problem states a real question and a real answer', async () => {
    const { EXTRA_PROBLEMS, drawExtraProblem } = await import('../../js/curriculum/templates/extraProblems.js');

    for (const subject of Object.keys(EXTRA_PROBLEMS)) {
        for (let grade = 1; grade <= 12; grade += 1) {
            for (let i = 0; i < 300; i += 1) {
                const problem = drawExtraProblem(subject, grade);
                if (!problem) continue;

                const where = `${subject} grade ${grade}: ${problem.question}`;
                const answer = String(problem.answer ?? '');
                assert.ok(problem.question?.trim().length > 0, `${where} has no question`);
                assert.ok(answer.trim().length > 0, `${where} has no answer`);
                assert.ok(!/undefined|NaN|Infinity|\[object/.test(answer), `${where} answered with "${answer}"`);
                assert.ok(!/undefined|NaN|Infinity|\[object/.test(problem.question), `${where} has a broken question`);
            }
        }
    }
});

test('supplementary draws declare a sane grade band', async () => {
    const { EXTRA_PROBLEMS } = await import('../../js/curriculum/templates/extraProblems.js');

    for (const [subject, bank] of Object.entries(EXTRA_PROBLEMS)) {
        assert.ok(bank.length > 0, `${subject} has no draws`);
        for (const draw of bank) {
            const [low, high] = draw.grades ?? [];
            assert.ok(Number.isInteger(low) && Number.isInteger(high), `${subject} has a draw with no grade band`);
            assert.ok(low >= 1 && high <= 12 && low <= high, `${subject} has band ${low}-${high}`);
        }
    }
});

test('supplementary symbols are all ones the LaTeX escaper knows', async () => {
    // The banks write plain Unicode (×, √, ², π). Anything the escaper has no
    // mapping for reaches pdfTeX as a byte it cannot set, and the worksheet
    // fails to typeset rather than rendering wrongly — so catch it here.
    const { readFileSync } = await import('node:fs');
    const { EXTRA_PROBLEMS, drawExtraProblem } = await import('../../js/curriculum/templates/extraProblems.js');

    const escaper = readFileSync(new URL('../../js/latex/escape.js', import.meta.url), 'utf8');
    const used = new Set();
    for (const subject of Object.keys(EXTRA_PROBLEMS)) {
        for (let grade = 1; grade <= 12; grade += 1) {
            for (let i = 0; i < 200; i += 1) {
                const problem = drawExtraProblem(subject, grade);
                if (!problem) continue;
                for (const character of `${problem.question}${problem.answer}`) {
                    if (character.charCodeAt(0) > 126) used.add(character);
                }
            }
        }
    }

    const unmapped = [...used].filter((character) => !escaper.includes(character));
    assert.deepEqual(unmapped, [], `symbols the escaper does not map: ${unmapped.join(' ')}`);
});

test('no grade is asked for an idea it has not met', async () => {
    // Every subject has a fallback pool for when no topic is chosen. Those
    // pools listed whatever the subject could generate, so a Grade 2 sheet
    // could ask for a hypotenuse and a Grade 4 sheet for a standard deviation.
    // The grade each idea belongs to is the Ontario curriculum's.
    const { ProblemGenerator } = await import('../../js/modules/problemGenerator.js');

    const notBefore = [
        [/hypotenuse|pythagor/i, 8],
        [/standard deviation|variance/i, 9],
        [/quartile/i, 7],
        [/integral|derivative/i, 12],
        [/logarithm/i, 11],
        [/scientific notation/i, 7],
        [/sine|cosine|tangent/i, 10],
        [/quadratic/i, 9],
    ];

    for (const gradeConfig of Object.values(GRADE_CONFIGS)) {
        const grade = Number(gradeConfig.id.replace('grade', ''));

        for (const subject of gradeConfig.subjects) {
            const generator = new ProblemGenerator();
            generator.setConfig(gradeConfig.id, 'medium', [subject]);

            for (let i = 0; i < 250; i += 1) {
                const { question } = generator.generateProblem('mixed', 'equations', 'all');
                for (const [pattern, earliest] of notBefore) {
                    assert.ok(
                        grade >= earliest || !pattern.test(question),
                        `${gradeConfig.id}/${subject} was asked (a grade ${earliest} idea): ${question}`
                    );
                }
            }
        }
    }
});

test('choosing one subject never draws a topic from another', async () => {
    // The figure pool spans every subject, and it was filtered only by grade
    // and topic. A sheet set to Geometry alone still drew thermometers,
    // function machines and money, because nothing checked the subject.
    const { ProblemGenerator } = await import('../../js/modules/problemGenerator.js');

    const subjectOfTopic = (topicId) =>
        Object.entries(SUBJECT_TOPICS).find(([, subject]) => subject.topics[topicId])?.[0] ?? null;

    for (const gradeConfig of Object.values(GRADE_CONFIGS)) {
        for (const subject of gradeConfig.subjects) {
            const generator = new ProblemGenerator();
            generator.setConfig(gradeConfig.id, 'medium', [subject]);

            // The topic a problem is built from is the honest signal; question
            // wording is shared between figures and cannot identify a subject.
            const drawn = [];
            const paramsFor = generator.paramsFor.bind(generator);
            generator.paramsFor = (topicId) => {
                drawn.push(topicId);
                return paramsFor(topicId);
            };

            for (const kind of ['visual', 'mixed', 'equations', 'word']) {
                for (let i = 0; i < 120; i += 1) generator.generateProblem('mixed', kind, 'all');
            }

            for (const topicId of drawn) {
                const owner = subjectOfTopic(topicId);
                assert.ok(
                    owner === null || owner === subject,
                    `${gradeConfig.id} set to ${subject} drew ${topicId}, which belongs to ${owner}`
                );
            }
        }
    }
});

test('no figure writes a character the LaTeX escaper cannot map', async () => {
    // A "half" sign in a trig question pulled in the TS1 text companion fonts,
    // which this TeX build does not ship, and the whole worksheet failed to
    // typeset. Any unmapped non-ASCII character is the same fault waiting.
    const { readFileSync } = await import('node:fs');
    const { VISUAL_PROBLEMS } = await import('../../js/curriculum/templates/visualProblems.js');

    const escaper = readFileSync(new URL('../../js/latex/escape.js', import.meta.url), 'utf8');
    const used = new Map();

    for (const draw of new Set(Object.values(VISUAL_PROBLEMS).flat())) {
        const [first, last] = draw.grades;
        for (let grade = first; grade <= last; grade += 1) {
            for (const difficulty of ['easy', 'medium', 'hard']) {
                for (let i = 0; i < 40; i += 1) {
                    const problem = draw({ grade, difficulty, maxNumber: 20, maxDenominator: 12, terms: 3 });
                    for (const character of `${problem.question}${problem.answer}`) {
                        if (character.charCodeAt(0) > 126 && !used.has(character)) used.set(character, draw.name);
                    }
                }
            }
        }
    }

    const unmapped = [...used].filter(([character]) => !escaper.includes(character));
    assert.deepEqual(
        unmapped, [],
        `unmapped characters: ${unmapped.map(([c, name]) => `"${c}" from ${name}`).join(', ')}`
    );
});
