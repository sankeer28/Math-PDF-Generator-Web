/**
 * Problem Generator Module
 * Core engine for generating math problems across all subjects and difficulty levels
 * @module problemGenerator
 */

import { randomChoice } from './utils.js';
import { GRADE_CONFIGS, DIFFICULTY_MULTIPLIERS, CONTEXTUAL_DATA } from './constants.js';
import { WORD_PROBLEM_TEMPLATES } from '../curriculum/templates/wordProblems.js';
import { GRADE_EQUATIONS, GRADE_WORD_PROBLEMS } from '../curriculum/templates/gradeProblems.js';
import { FINANCIAL_PROBLEMS } from '../curriculum/templates/financialProblems.js';
import { SUBJECT_TOPICS, defaultParameterValues, parametersForTopic, coerceParameter } from '../curriculum/index.js';

export class ProblemGenerator {
    constructor() {
        this.usedProblems = new Set();
        this.usedCombinations = new Map();
        this.contextHistory = new Map();
        this.numberHistory = new Map();
        this.scenarioHistory = new Map();
        this.config = null;
        this.generationCache = new Map();
        this.uniquenessThreshold = 0.85; // 85% similarity threshold - stricter to catch more duplicates
    }

    setConfig(gradeLevel, difficulty, subjects, topicParameters = {}) {
        // Validate inputs
        if (!GRADE_CONFIGS[gradeLevel]) {
            console.error(`Invalid grade level: ${gradeLevel}. Available:`, Object.keys(GRADE_CONFIGS));
            // Set default config
            gradeLevel = 'elementary';
        }

        if (!DIFFICULTY_MULTIPLIERS[difficulty]) {
            console.error(`Invalid difficulty: ${difficulty}. Available:`, Object.keys(DIFFICULTY_MULTIPLIERS));
            difficulty = 'medium';
        }

        // Handle both single subject (string) and multiple subjects (array) for backward compatibility
        if (typeof subjects === 'string') {
            subjects = [subjects];
        }

        // Get the numeric multiplier value from the difficulty config object
        const difficultyValue = DIFFICULTY_MULTIPLIERS[difficulty]?.value || 1.0;

        this.config = {
            grade: GRADE_CONFIGS[gradeLevel],
            difficulty: difficultyValue,
            subjects: subjects,  // Store array of subjects
            maxNumber: Math.floor(GRADE_CONFIGS[gradeLevel].maxNumber * difficultyValue)
        };

        this.topicParameters = this.resolveTopicParameters(topicParameters);
    }

    /**
     * Merges the user's per-topic settings over each topic's declared defaults,
     * clamping every value to what its definition allows.
     *
     * @param {Record<string, Record<string, *>>} overrides - by topic id
     * @returns {Record<string, Record<string, number|boolean|string>>}
     */
    resolveTopicParameters(overrides) {
        const resolved = {};

        for (const subject of Object.values(SUBJECT_TOPICS)) {
            for (const [topicId, topic] of Object.entries(subject.topics)) {
                const values = defaultParameterValues(topic);
                const supplied = overrides?.[topicId];

                if (supplied) {
                    for (const definition of parametersForTopic(topic)) {
                        if (definition.id in supplied) {
                            values[definition.id] = coerceParameter(definition, supplied[definition.id]);
                        }
                    }
                }
                resolved[topicId] = values;
            }
        }
        return resolved;
    }

    /**
     * The settings in force for a topic. Falls back to the grade's own ceiling
     * so a generator can always ask for `maxNumber` and get something sensible.
     *
     * @param {string} topicId
     * @returns {Record<string, number|boolean|string>}
     */
    paramsFor(topicId) {
        return {
            maxNumber: this.config?.maxNumber ?? 100,
            ...(this.topicParameters?.[topicId] || {}),
        };
    }

    getRandomSubject() {
        // Randomly select one subject from the available subjects
        if (!this.config || !this.config.subjects || this.config.subjects.length === 0) {
            return 'arithmetic';  // Default fallback
        }
        const randomIndex = Math.floor(Math.random() * this.config.subjects.length);
        return this.config.subjects[randomIndex];
    }

    generateProblem(operation, problemType, selectedTopics = 'all') {
        // Randomly select a subject from available subjects for this problem
        const subject = this.getRandomSubject();

        // Smart conflict resolution: Topics take priority over Problem Type for arithmetic
        if (subject === 'arithmetic' && selectedTopics !== 'all' && selectedTopics.length > 0) {
            if (selectedTopics.includes('word-problems')) {
                problemType = 'word';
            } else if (selectedTopics.includes('basic-operations')) {
                problemType = 'equations';
            } else if (selectedTopics.includes('fractions') || selectedTopics.includes('place-value')) {
                problemType = 'equations';
            } else if (selectedTopics.includes('estimation') || selectedTopics.includes('patterns')) {
                problemType = 'mixed';
            }
        }

        if (problemType === 'mixed') {
            problemType = Math.random() < 0.5 ? 'equations' : 'word';
        }

        operation = this.validateOperationForSubject(operation, subject);

        if (problemType === 'equations') {
            return this.generateEquation(operation, selectedTopics, subject);
        } else {
            return this.generateWordProblem(operation, subject);
        }
    }

    /**
     * Draws one problem from a per-grade table.
     *
     * Falls back within the grade — the requested operation, then `any`, then
     * addition — because not every grade covers every operation (Grade 1 does
     * no formal division, for instance).
     *
     * @param {Record<string, Record<string, Function[]>>} table
     * @param {string} operation
     * @returns {{question: string, answer: string|number}|null} null when the
     *   grade has no table, so the caller can fall through to other generators
     */
    drawFromGradeTable(table, operation) {
        const grade = table[this.config?.grade?.id];
        if (!grade) return null;

        const draws = grade[operation] || grade.any || grade.addition;
        if (!draws || draws.length === 0) return null;

        const draw = () => randomChoice(draws)(draw);
        return draw();
    }

    validateOperationForSubject(operation, subject) {
        switch (subject) {
            case 'algebra':
                if (['addition', 'subtraction', 'multiplication', 'division'].includes(operation)) {
                    return 'algebraic';
                }
                return operation;
            case 'geometry':
                return 'geometric';
            case 'trigonometry':
                return 'trigonometric';
            case 'calculus':
                return 'calculus';
            case 'statistics':
                return 'statistical';
            case 'measurement':
                return 'measurement';
            case 'precalculus':
                return 'precalculus';
            case 'financialLiteracy':
                return 'financial';
            case 'arithmetic':
            default:
                return operation;
        }
    }

    generateEquation(operation, selectedTopics = 'all', subject = null) {
        // Use provided subject or get random one
        if (!subject) {
            subject = this.getRandomSubject();
        }

        if (subject === 'algebra') {
            return this.generateAlgebraEquation(operation, selectedTopics);
        } else if (subject === 'geometry') {
            return this.generateGeometryProblem(selectedTopics);
        } else if (subject === 'trigonometry') {
            return this.generateTrigProblem(selectedTopics);
        } else if (subject === 'calculus') {
            return this.generateCalculusProblem(selectedTopics);
        } else if (subject === 'statistics') {
            return this.generateStatisticsProblem(selectedTopics);
        } else if (subject === 'measurement') {
            return this.generateMeasurementProblem(selectedTopics);
        } else if (subject === 'precalculus') {
            return this.generatePrecalculusProblem(selectedTopics);
        } else if (subject === 'financialLiteracy') {
            return this.generateFinancialProblem(selectedTopics);
        } else {
            return this.generateArithmeticEquation(operation, selectedTopics);
        }
    }

    generateArithmeticEquation(operation, selectedTopics = 'all') {
        // Grades 1-8 have their own tables of grade-appropriate draws; grades
        // 9-12 fall through to the subject generators below.
        const fromGrade = this.drawFromGradeTable(GRADE_EQUATIONS, operation);
        if (fromGrade) return fromGrade;

        const gradeId = this.config?.grade?.id;
        if (gradeId) {
            const gradeNum = gradeId.replace('grade', '');
            const gradeMethod = `generateGrade${gradeNum}Arithmetic`;
            if (this[gradeMethod]) {
                return this[gradeMethod](operation);
            }
        }

        if (selectedTopics !== 'all' && selectedTopics.length > 0) {
            return this.generateTopicSpecificEquation(operation, selectedTopics);
        }

        // Randomly choose format variation (30% chance for variation)
        const useVariation = Math.random() < 0.3;
        const variationType = Math.floor(Math.random() * 4); // 0=missing first, 1=missing second, 2=three numbers, 3=chain

        let question = "";
        let answer = 0;
        let num1, num2, num3;
        const maxNum = this.config?.maxNumber || 100; // Default to 100 if config not set

        switch(operation) {
            case "addition":
                if (useVariation) {
                    if (variationType === 0) {
                        // Missing first number: __ + 5 = 12
                        num2 = Math.floor(Math.random() * (maxNum / 2)) + 1;
                        num1 = Math.floor(Math.random() * (maxNum / 2)) + 1;
                        const total = num1 + num2;
                        question = `__ + ${num2} = ${total}`;
                        answer = num1;
                    } else if (variationType === 1) {
                        // Missing second number: 7 + __ = 15
                        num1 = Math.floor(Math.random() * (maxNum / 2)) + 1;
                        num2 = Math.floor(Math.random() * (maxNum / 2)) + 1;
                        const total = num1 + num2;
                        question = `${num1} + __ = ${total}`;
                        answer = num2;
                    } else if (variationType === 2) {
                        // Three numbers: 5 + 3 + 2 =
                        num1 = Math.floor(Math.random() * (maxNum / 2)) + 1;
                        num2 = Math.floor(Math.random() * (maxNum / 2)) + 1;
                        num3 = Math.floor(Math.random() * (maxNum / 2)) + 1;
                        question = `${num1} + ${num2} + ${num3} = `;
                        answer = num1 + num2 + num3;
                    } else {
                        // Chain: 10 + 5 - 2 =
                        num1 = Math.floor(Math.random() * (maxNum / 2)) + 10;
                        num2 = Math.floor(Math.random() * (maxNum / 3)) + 1;
                        num3 = Math.floor(Math.random() * Math.min(num1 + num2 - 1, maxNum / 3)) + 1;
                        question = `${num1} + ${num2} - ${num3} = `;
                        answer = num1 + num2 - num3;
                    }
                } else {
                    // Standard format
                    num1 = Math.floor(Math.random() * maxNum) + 1;
                    num2 = Math.floor(Math.random() * maxNum) + 1;
                    question = `${num1} + ${num2} = `;
                    answer = num1 + num2;
                }
                break;
            case "subtraction":
                if (useVariation) {
                    if (variationType === 0) {
                        // Missing first number: __ - 5 = 7
                        num2 = Math.floor(Math.random() * (maxNum / 3)) + 1;
                        answer = Math.floor(Math.random() * (maxNum / 2)) + 1;
                        num1 = num2 + answer;
                        question = `__ - ${num2} = ${answer}`;
                        answer = num1;
                    } else if (variationType === 1) {
                        // Missing second number: 12 - __ = 7
                        num1 = Math.floor(Math.random() * maxNum) + 10;
                        num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
                        const result = num1 - num2;
                        question = `${num1} - __ = ${result}`;
                        answer = num2;
                    } else if (variationType === 2) {
                        // Chain subtraction: 20 - 5 - 3 =
                        num1 = Math.floor(Math.random() * maxNum) + 15;
                        num2 = Math.floor(Math.random() * (num1 / 3)) + 1;
                        num3 = Math.floor(Math.random() * (num1 - num2 - 1)) + 1;
                        question = `${num1} - ${num2} - ${num3} = `;
                        answer = num1 - num2 - num3;
                    } else {
                        // Mixed: 15 - 5 + 3 =
                        num1 = Math.floor(Math.random() * maxNum) + 10;
                        num2 = Math.floor(Math.random() * (num1 / 2)) + 1;
                        num3 = Math.floor(Math.random() * (maxNum / 3)) + 1;
                        question = `${num1} - ${num2} + ${num3} = `;
                        answer = num1 - num2 + num3;
                    }
                } else {
                    // Standard format
                    num1 = Math.floor(Math.random() * maxNum) + 1;
                    num2 = Math.floor(Math.random() * num1) + 1;
                    question = `${num1} - ${num2} = `;
                    answer = num1 - num2;
                }
                break;
            case "multiplication":
                const multMax = Math.min(maxNum / 10, 100);
                if (useVariation && variationType < 2) {
                    if (variationType === 0) {
                        // Missing first number: __ × 4 = 20
                        num2 = Math.floor(Math.random() * 12) + 2;
                        num1 = Math.floor(Math.random() * 12) + 2;
                        const product = num1 * num2;
                        question = `__ × ${num2} = ${product}`;
                        answer = num1;
                    } else {
                        // Missing second number: 6 × __ = 30
                        num1 = Math.floor(Math.random() * 12) + 2;
                        num2 = Math.floor(Math.random() * 12) + 2;
                        const product = num1 * num2;
                        question = `${num1} × __ = ${product}`;
                        answer = num2;
                    }
                } else {
                    // Standard format
                    num1 = Math.floor(Math.random() * multMax) + 1;
                    num2 = Math.floor(Math.random() * multMax) + 1;
                    question = `${num1} × ${num2} = `;
                    answer = num1 * num2;
                }
                break;
            case "division":
                const divMax = Math.min(maxNum / 5, 50);
                if (useVariation && variationType < 2) {
                    if (variationType === 0) {
                        // Missing dividend: __ ÷ 4 = 7
                        num2 = Math.floor(Math.random() * 12) + 2;
                        answer = Math.floor(Math.random() * 12) + 2;
                        num1 = num2 * answer;
                        question = `__ ÷ ${num2} = ${answer}`;
                        answer = num1;
                    } else {
                        // Missing divisor: 24 ÷ __ = 6
                        answer = Math.floor(Math.random() * 12) + 2;
                        num2 = Math.floor(Math.random() * 12) + 2;
                        num1 = num2 * answer;
                        question = `${num1} ÷ __ = ${answer}`;
                        answer = num2;
                    }
                } else {
                    // Standard format
                    num2 = Math.floor(Math.random() * divMax) + 1;
                    answer = Math.floor(Math.random() * divMax) + 1;
                    num1 = num2 * answer;
                    question = `${num1} ÷ ${num2} = `;
                }
                break;
            case "mixed":
                const operations = ["addition", "subtraction", "multiplication", "division"];
                return this.generateArithmeticEquation(operations[Math.floor(Math.random() * operations.length)], selectedTopics);
            default:
                // Handle unknown operations by defaulting to addition
                console.warn(`Unknown operation '${operation}' in generateArithmeticEquation, defaulting to addition`);
                num1 = Math.floor(Math.random() * maxNum) + 1;
                num2 = Math.floor(Math.random() * maxNum) + 1;
                question = `${num1} + ${num2} = `;
                answer = num1 + num2;
                break;
        }

        return { question, answer };
    }

    generateTopicSpecificEquation(operation, selectedTopics) {
        for (let topic of selectedTopics) {
            switch (topic) {
                case 'fractions':
                    return this.generateFractionProblem(operation);
                case 'place-value':
                    return this.generatePlaceValueProblem(operation);
                case 'percentages':
                    return this.generatePercentageProblem(operation);
                case 'estimation':
                    return this.generateEstimationProblem(operation);
                case 'patterns':
                    return this.generatePatternProblem(operation);
                case 'ratios-proportions':
                    return this.generateRatioProblem(operation);
                case 'integers':
                    return this.generateIntegerProblem(operation);
                case 'exponents-roots':
                    return this.generateExponentRootProblem(operation);
                case 'order-of-operations':
                    return this.generateOrderOfOperationsProblem(operation);
                case 'factors-multiples':
                    return this.generateFactorsMultiplesProblem(operation);
                default:
                    continue;
            }
        }
        return this.generateArithmeticEquation(operation, 'all');
    }

    generateFractionProblem(operation) {
        const denominators = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
        const problems = [
            // Addition - same denominator (5 variations)
            () => {
                const d = denominators[Math.floor(Math.random() * 5)];
                const n1 = Math.floor(Math.random() * d) + 1;
                const n2 = Math.floor(Math.random() * d) + 1;
                return { question: `${n1}/${d} + ${n2}/${d} = `, answer: `${n1 + n2}/${d}` };
            },
            () => {
                const d = denominators[Math.floor(Math.random() * 5)];
                const n1 = Math.floor(Math.random() * d) + 1;
                const n2 = Math.floor(Math.random() * d) + 1;
                const n3 = Math.floor(Math.random() * d) + 1;
                return { question: `${n1}/${d} + ${n2}/${d} + ${n3}/${d} = `, answer: `${n1 + n2 + n3}/${d}` };
            },

            // Addition - different denominators (10 variations)
            () => {
                const d1 = [2, 4, 6][Math.floor(Math.random() * 3)];
                const d2 = d1 * 2;
                const n1 = Math.floor(Math.random() * d1) + 1;
                const n2 = Math.floor(Math.random() * d2) + 1;
                const lcd = d2;
                const newN1 = n1 * (lcd / d1);
                return { question: `${n1}/${d1} + ${n2}/${d2} = `, answer: `${newN1 + n2}/${lcd}` };
            },
            () => {
                const d1 = [3, 6][Math.floor(Math.random() * 2)];
                const d2 = d1 === 3 ? 6 : 3;
                const n1 = Math.floor(Math.random() * d1) + 1;
                const n2 = Math.floor(Math.random() * d2) + 1;
                const lcd = 6;
                const newN1 = n1 * (lcd / d1);
                const newN2 = n2 * (lcd / d2);
                return { question: `${n1}/${d1} + ${n2}/${d2} = `, answer: `${newN1 + newN2}/${lcd}` };
            },

            // Subtraction - same denominator (5 variations)
            () => {
                const d = denominators[Math.floor(Math.random() * 5)];
                const n1 = Math.floor(Math.random() * d) + 2;
                const n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
                return { question: `${n1}/${d} - ${n2}/${d} = `, answer: `${n1 - n2}/${d}` };
            },
            () => {
                const d = [4, 5, 6, 8][Math.floor(Math.random() * 4)];
                const n1 = Math.floor(Math.random() * d) + d;
                const n2 = Math.floor(Math.random() * d) + 1;
                return { question: `${n1}/${d} - ${n2}/${d} = `, answer: `${n1 - n2}/${d}` };
            },

            // Multiplication (8 variations)
            () => {
                const d = denominators[Math.floor(Math.random() * 6)];
                const n = Math.floor(Math.random() * d) + 1;
                const whole = Math.floor(Math.random() * 10) + 1;
                return { question: `${n}/${d} × ${whole} = `, answer: `${n * whole}/${d}` };
            },
            () => {
                const d1 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
                const d2 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
                const n1 = Math.floor(Math.random() * d1) + 1;
                const n2 = Math.floor(Math.random() * d2) + 1;
                return { question: `${n1}/${d1} × ${n2}/${d2} = `, answer: `${n1 * n2}/${d1 * d2}` };
            },
            () => {
                const whole = Math.floor(Math.random() * 8) + 2;
                const d = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
                const n = Math.floor(Math.random() * d) + 1;
                return { question: `${whole} × ${n}/${d} = `, answer: `${whole * n}/${d}` };
            },

            // Division (5 variations)
            () => {
                const d = [2, 3, 4, 5, 6][Math.floor(Math.random() * 5)];
                const n = Math.floor(Math.random() * d) + 1;
                const whole = Math.floor(Math.random() * 6) + 2;
                return { question: `${n}/${d} / ${whole} = `, answer: `${n}/${d * whole}` };
            },
            () => {
                const whole = Math.floor(Math.random() * 8) + 2;
                const d = [2, 3, 4][Math.floor(Math.random() * 3)];
                return { question: `${whole} / 1/${d} = `, answer: `${whole * d}` };
            },

            // Mixed numbers (7 variations)
            () => {
                const whole = Math.floor(Math.random() * 3) + 1;
                const d = [2, 3, 4][Math.floor(Math.random() * 3)];
                const n = Math.floor(Math.random() * (d - 1)) + 1;
                const improper = whole * d + n;
                return { question: `Convert ${whole} ${n}/${d} to improper fraction = `, answer: `${improper}/${d}` };
            },
            () => {
                const d = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
                const improper = Math.floor(Math.random() * d * 3) + d + 1;
                const whole = Math.floor(improper / d);
                const n = improper % d;
                return { question: `Convert ${improper}/${d} to mixed number = `, answer: n > 0 ? `${whole} ${n}/${d}` : `${whole}` };
            },

            // Comparing fractions (5 variations)
            () => {
                const d = [4, 6, 8][Math.floor(Math.random() * 3)];
                const n1 = Math.floor(Math.random() * d) + 1;
                const n2 = Math.floor(Math.random() * d) + 1;
                const answer = n1 > n2 ? '>' : n1 < n2 ? '<' : '=';
                return { question: `Compare: ${n1}/${d} ___ ${n2}/${d} (>, <, or =)`, answer };
            },
            () => {
                const n = Math.floor(Math.random() * 3) + 1;
                const d1 = [2, 4, 8][Math.floor(Math.random() * 3)];
                const d2 = [2, 4, 8][Math.floor(Math.random() * 3)];
                const val1 = n / d1;
                const val2 = n / d2;
                const answer = val1 > val2 ? '>' : val1 < val2 ? '<' : '=';
                return { question: `Compare: ${n}/${d1} ___ ${n}/${d2} (>, <, or =)`, answer };
            },

            // Simplifying fractions (5 variations)
            () => {
                const base = [2, 3, 4][Math.floor(Math.random() * 3)];
                const mult = Math.floor(Math.random() * 4) + 2;
                const n = base * mult;
                const d = base * mult * 2;
                return { question: `Simplify ${n}/${d} = `, answer: `1/2` };
            },
            () => {
                const gcf = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
                const n = gcf * (Math.floor(Math.random() * 4) + 1);
                const d = gcf * (Math.floor(Math.random() * 4) + 2);
                const simpleN = n / gcf;
                const simpleD = d / gcf;
                return { question: `Simplify ${n}/${d} = `, answer: `${simpleN}/${simpleD}` };
            }
        ];

        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateDecimalProblem(operation) {
        const problems = [
            // Addition - tenths (5 variations)
            () => {
                const a = (Math.floor(Math.random() * 50) + 1) / 10;
                const b = (Math.floor(Math.random() * 50) + 1) / 10;
                return { question: `${a.toFixed(1)} + ${b.toFixed(1)} = `, answer: (a + b).toFixed(1) };
            },
            () => {
                const a = (Math.floor(Math.random() * 90) + 10) / 10;
                const b = (Math.floor(Math.random() * 90) + 10) / 10;
                const c = (Math.floor(Math.random() * 50) + 1) / 10;
                return { question: `${a.toFixed(1)} + ${b.toFixed(1)} + ${c.toFixed(1)} = `, answer: (a + b + c).toFixed(1) };
            },

            // Addition - hundredths (5 variations)
            () => {
                const a = (Math.floor(Math.random() * 500) + 1) / 100;
                const b = (Math.floor(Math.random() * 500) + 1) / 100;
                return { question: `${a.toFixed(2)} + ${b.toFixed(2)} = `, answer: (a + b).toFixed(2) };
            },
            () => {
                const a = (Math.floor(Math.random() * 300) + 100) / 100;
                const b = (Math.floor(Math.random() * 300) + 100) / 100;
                return { question: `${a.toFixed(2)} + ${b.toFixed(2)} = `, answer: (a + b).toFixed(2) };
            },

            // Subtraction - tenths (5 variations)
            () => {
                const a = (Math.floor(Math.random() * 80) + 20) / 10;
                const b = (Math.floor(Math.random() * 50) + 1) / 10;
                return { question: `${a.toFixed(1)} - ${b.toFixed(1)} = `, answer: (a - b).toFixed(1) };
            },
            () => {
                const a = (Math.floor(Math.random() * 90) + 10) / 10;
                const b = (Math.floor(Math.random() * Math.floor(a * 10)) + 1) / 10;
                return { question: `${a.toFixed(1)} - ${b.toFixed(1)} = `, answer: (a - b).toFixed(1) };
            },

            // Subtraction - hundredths (5 variations)
            () => {
                const a = (Math.floor(Math.random() * 800) + 200) / 100;
                const b = (Math.floor(Math.random() * 500) + 1) / 100;
                return { question: `${a.toFixed(2)} - ${b.toFixed(2)} = `, answer: (a - b).toFixed(2) };
            },
            () => {
                const a = (Math.floor(Math.random() * 500) + 100) / 100;
                const b = (Math.floor(Math.random() * Math.floor(a * 100)) + 1) / 100;
                return { question: `${a.toFixed(2)} - ${b.toFixed(2)} = `, answer: (a - b).toFixed(2) };
            },

            // Multiplication - tenths (8 variations)
            () => {
                const a = (Math.floor(Math.random() * 50) + 1) / 10;
                const b = Math.floor(Math.random() * 9) + 2;
                return { question: `${a.toFixed(1)} × ${b} = `, answer: (a * b).toFixed(1) };
            },
            () => {
                const a = (Math.floor(Math.random() * 30) + 1) / 10;
                const b = (Math.floor(Math.random() * 30) + 1) / 10;
                return { question: `${a.toFixed(1)} × ${b.toFixed(1)} = `, answer: (a * b).toFixed(2) };
            },
            () => {
                const a = (Math.floor(Math.random() * 50) + 5) / 10;
                const b = 10;
                return { question: `${a.toFixed(1)} × ${b} = `, answer: (a * b).toFixed(0) };
            },

            // Multiplication - hundredths (5 variations)
            () => {
                const a = (Math.floor(Math.random() * 200) + 10) / 100;
                const b = Math.floor(Math.random() * 9) + 2;
                return { question: `${a.toFixed(2)} × ${b} = `, answer: (a * b).toFixed(2) };
            },
            () => {
                const a = (Math.floor(Math.random() * 100) + 10) / 100;
                const b = (Math.floor(Math.random() * 100) + 10) / 100;
                return { question: `${a.toFixed(2)} × ${b.toFixed(2)} = `, answer: (a * b).toFixed(4) };
            },

            // Division - tenths (8 variations)
            () => {
                const b = (Math.floor(Math.random() * 20) + 1) / 10;
                const q = Math.floor(Math.random() * 9) + 2;
                const a = b * q;
                return { question: `${a.toFixed(1)} / ${b.toFixed(1)} = `, answer: q.toFixed(0) };
            },
            () => {
                const a = (Math.floor(Math.random() * 50) + 10) / 10;
                const b = Math.floor(Math.random() * 8) + 2;
                return { question: `${a.toFixed(1)} / ${b} = `, answer: (a / b).toFixed(2) };
            },
            () => {
                const a = Math.floor(Math.random() * 50) + 10;
                const b = 10;
                return { question: `${a} / ${b} = `, answer: (a / b).toFixed(1) };
            },

            // Rounding decimals (10 variations)
            () => {
                const a = (Math.floor(Math.random() * 900) + 100) / 100;
                return { question: `Round ${a.toFixed(2)} to nearest tenth = `, answer: a.toFixed(1) };
            },
            () => {
                const a = (Math.floor(Math.random() * 9000) + 1000) / 1000;
                return { question: `Round ${a.toFixed(3)} to nearest hundredth = `, answer: a.toFixed(2) };
            },
            () => {
                const a = (Math.floor(Math.random() * 500) + 100) / 10;
                return { question: `Round ${a.toFixed(1)} to nearest whole number = `, answer: Math.round(a).toFixed(0) };
            },

            // Comparing decimals (8 variations)
            () => {
                const a = (Math.floor(Math.random() * 100) + 1) / 10;
                const b = (Math.floor(Math.random() * 100) + 1) / 10;
                const answer = a > b ? '>' : a < b ? '<' : '=';
                return { question: `Compare: ${a.toFixed(1)} ___ ${b.toFixed(1)} (>, <, or =)`, answer };
            },
            () => {
                const a = (Math.floor(Math.random() * 500) + 1) / 100;
                const b = (Math.floor(Math.random() * 500) + 1) / 100;
                const answer = a > b ? '>' : a < b ? '<' : '=';
                return { question: `Compare: ${a.toFixed(2)} ___ ${b.toFixed(2)} (>, <, or =)`, answer };
            },

            // Converting fractions to decimals (8 variations)
            () => {
                const d = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
                const n = Math.floor(Math.random() * d) + 1;
                const dec = (n / d).toFixed(2);
                return { question: `Convert ${n}/${d} to decimal = `, answer: dec };
            },
            () => {
                const d = [2, 4, 5, 10, 20][Math.floor(Math.random() * 5)];
                const n = Math.floor(Math.random() * d) + 1;
                return { question: `${n}/${d} as a decimal = `, answer: (n / d).toFixed(2) };
            },

            // Converting decimals to fractions (5 variations)
            () => {
                const tenths = Math.floor(Math.random() * 9) + 1;
                return { question: `Convert 0.${tenths} to a fraction = `, answer: `${tenths}/10` };
            },
            () => {
                const hundredths = Math.floor(Math.random() * 99) + 1;
                const tensDigit = Math.floor(hundredths / 10);
                const onesDigit = hundredths % 10;
                return { question: `Convert 0.${tensDigit}${onesDigit} to a fraction = `, answer: `${hundredths}/100` };
            }
        ];

        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generatePlaceValueProblem(operation) {
        const placeValues = [10, 100, 1000];
        const place = placeValues[Math.floor(Math.random() * placeValues.length)];
        let question = "";
        let answer = 0;

        switch (operation) {
            case "addition":
                const num1 = Math.floor(Math.random() * place) + place;
                const num2 = Math.floor(Math.random() * place) + place;
                question = `${num1.toLocaleString()} + ${num2.toLocaleString()} = `;
                answer = (num1 + num2).toLocaleString();
                break;
            case "subtraction":
                const n1 = Math.floor(Math.random() * place) + place;
                const n2 = Math.floor(Math.random() * n1);
                question = `${n1.toLocaleString()} - ${n2.toLocaleString()} = `;
                answer = (n1 - n2).toLocaleString();
                break;
            case "multiplication":
                const base = Math.floor(Math.random() * 9) + 1;
                question = `${base} × ${place.toLocaleString()} = `;
                answer = (base * place).toLocaleString();
                break;
            default:
                return this.generateArithmeticEquation(operation, 'all');
        }

        return { question, answer };
    }

    generatePercentageProblem(operation) {
        const percentages = [10, 20, 25, 50, 75];
        const percent = percentages[Math.floor(Math.random() * percentages.length)];
        const base = Math.floor(Math.random() * 200) + 50;

        let question = `${percent}% of ${base} = `;
        let answer = Math.round((percent / 100) * base);

        return { question, answer };
    }

    generateEstimationProblem(operation) {
        const num1 = Math.floor(Math.random() * 900) + 100;
        const num2 = Math.floor(Math.random() * 900) + 100;

        const rounded1 = Math.round(num1 / 50) * 50;
        const rounded2 = Math.round(num2 / 50) * 50;

        let question = `Estimate: ${num1} + ${num2} ≈ `;
        let answer = rounded1 + rounded2;

        return { question, answer };
    }

    generatePatternProblem(operation) {
        const start = Math.floor(Math.random() * 10) + 1;
        const step = Math.floor(Math.random() * 5) + 2;
        const sequence = [start, start + step, start + (step * 2), start + (step * 3)];

        let question = `Find the next number: ${sequence.join(', ')}, ? = `;
        let answer = start + (step * 4);

        return { question, answer };
    }

    // NEW ARITHMETIC TOPIC GENERATORS
    generateRatioProblem(operation) {
        const problems = [
            // Equivalent ratios (8 variations)
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 8) + 2;
                const multiplier = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `If the ratio is ${a}:${b}, find the equivalent ratio when the first number is ${a * multiplier}.`,
                    answer: `${a * multiplier}:${b * multiplier}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 1;
                const b = Math.floor(Math.random() * 6) + 1;
                const multiplier = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `Complete the equivalent ratio: ${a}:${b} = ?:${b * multiplier}`,
                    answer: `${a * multiplier}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 12) + 4;
                const b = Math.floor(Math.random() * 12) + 4;
                const gcd = a > b ? b : a;
                const factor = [2, 3, 4][Math.floor(Math.random() * 3)];
                return {
                    question: `Simplify the ratio ${a * factor}:${b * factor}`,
                    answer: `${a}:${b}`
                };
            },

            // Proportions (10 variations)
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 6) + 2;
                const c = Math.floor(Math.random() * 10) + 5;
                return {
                    question: `Solve the proportion: ${a}/${b} = x/${c}`,
                    answer: `x = ${(a * c / b).toFixed(2)}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const c = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 10) + 5;
                return {
                    question: `Solve for x: ${a}/${b} = ${c}/x`,
                    answer: `x = ${(b * c / a).toFixed(2)}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 3;
                const b = Math.floor(Math.random() * 5) + 3;
                const k = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `If ${a}/${b} = ${a * k}/x, what is x?`,
                    answer: `x = ${b * k}`
                };
            },

            // Unit rates (12 variations)
            () => {
                const miles = Math.floor(Math.random() * 200) + 100;
                const hours = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `A car travels ${miles} miles in ${hours} hours. What is the unit rate (miles per hour)?`,
                    answer: `${Math.round(miles / hours)} mph`
                };
            },
            () => {
                const cost = (Math.floor(Math.random() * 800) + 200) / 100;
                const items = Math.floor(Math.random() * 8) + 3;
                return {
                    question: `${items} items cost $${cost.toFixed(2)}. What is the cost per item?`,
                    answer: `$${(cost / items).toFixed(2)}`
                };
            },
            () => {
                const pages = Math.floor(Math.random() * 80) + 40;
                const minutes = Math.floor(Math.random() * 15) + 10;
                return {
                    question: `Reading ${pages} pages in ${minutes} minutes gives what reading rate (pages per minute)?`,
                    answer: `${(pages / minutes).toFixed(1)} pages/min`
                };
            },
            () => {
                const distance = Math.floor(Math.random() * 40) + 10;
                const time = Math.floor(Math.random() * 6) + 2;
                return {
                    question: `Walking ${distance} km in ${time} hours. What is the speed in km/h?`,
                    answer: `${(distance / time).toFixed(1)} km/h`
                };
            },
            () => {
                const words = Math.floor(Math.random() * 200) + 100;
                const minutes = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `Typing ${words} words in ${minutes} minutes. Words per minute?`,
                    answer: `${Math.round(words / minutes)} wpm`
                };
            },

            // Part-to-whole ratios (8 variations)
            () => {
                const part = Math.floor(Math.random() * 15) + 5;
                const total = part + Math.floor(Math.random() * 20) + 10;
                return {
                    question: `In a class of ${total} students, ${part} are girls. What is the ratio of girls to boys?`,
                    answer: `${part}:${total - part}`
                };
            },
            () => {
                const red = Math.floor(Math.random() * 10) + 3;
                const blue = Math.floor(Math.random() * 10) + 3;
                const total = red + blue;
                return {
                    question: `A bag has ${red} red marbles and ${blue} blue marbles. What is the ratio of red to total?`,
                    answer: `${red}:${total}`
                };
            },
            () => {
                const wins = Math.floor(Math.random() * 12) + 4;
                const losses = Math.floor(Math.random() * 8) + 2;
                return {
                    question: `A team has ${wins} wins and ${losses} losses. What is the win-to-loss ratio?`,
                    answer: `${wins}:${losses}`
                };
            },

            // Scaling recipes/mixtures (6 variations)
            () => {
                const flour = Math.floor(Math.random() * 4) + 2;
                const sugar = Math.floor(Math.random() * 3) + 1;
                const scale = Math.floor(Math.random() * 3) + 2;
                return {
                    question: `A recipe uses ${flour} cups flour to ${sugar} cups sugar. For ${scale} batches, how much flour?`,
                    answer: `${flour * scale} cups`
                };
            },
            () => {
                const red = Math.floor(Math.random() * 5) + 2;
                const yellow = Math.floor(Math.random() * 5) + 2;
                const totalRed = red * (Math.floor(Math.random() * 3) + 2);
                return {
                    question: `Paint mix ratio is ${red}:${yellow} (red:yellow). If using ${totalRed} parts red, how much yellow?`,
                    answer: `${totalRed * yellow / red} parts`
                };
            },

            // Percent as ratio (5 variations)
            () => {
                const percent = [25, 50, 75, 20, 40, 60, 80][Math.floor(Math.random() * 7)];
                return {
                    question: `Express ${percent}% as a simplified ratio to 100.`,
                    answer: `${percent}:100 or ${percent / (percent > 50 ? 25 : 20)}:${100 / (percent > 50 ? 25 : 20)}`
                };
            },
            () => {
                const part = Math.floor(Math.random() * 40) + 10;
                const total = Math.floor(Math.random() * 40) + 60;
                const percent = Math.round((part / total) * 100);
                return {
                    question: `${part} out of ${total} is what percent?`,
                    answer: `${percent}%`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateIntegerProblem(operation) {
        const maxNum = Math.min(this.config?.maxNumber || 50, 50);
        let question = "";
        let answer = 0;

        switch (operation) {
            case "addition":
                const num1 = Math.floor(Math.random() * maxNum) - Math.floor(maxNum / 2);
                const num2 = Math.floor(Math.random() * maxNum) - Math.floor(maxNum / 2);
                question = `${num1} + (${num2}) = `;
                answer = num1 + num2;
                break;
            case "subtraction":
                const n1 = Math.floor(Math.random() * maxNum) - Math.floor(maxNum / 2);
                const n2 = Math.floor(Math.random() * maxNum) - Math.floor(maxNum / 2);
                question = `${n1} - (${n2}) = `;
                answer = n1 - n2;
                break;
            case "multiplication":
                const a = Math.floor(Math.random() * 15) - 7;
                const b = Math.floor(Math.random() * 15) - 7;
                question = `(${a}) × (${b}) = `;
                answer = a * b;
                break;
            default:
                const x = Math.floor(Math.random() * 20) - 10;
                const y = Math.floor(Math.random() * 20) - 10;
                question = `${x} + (${y}) = `;
                answer = x + y;
        }

        return { question, answer };
    }

    generateExponentRootProblem(operation) {
        const problems = [
            () => {
                const base = Math.floor(Math.random() * 8) + 2;
                const exp = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `${base}^${exp} = `,
                    answer: Math.pow(base, exp)
                };
            },
            () => {
                const num = [4, 9, 16, 25, 36, 49, 64, 81, 100][Math.floor(Math.random() * 9)];
                return {
                    question: `√${num} = `,
                    answer: Math.sqrt(num)
                };
            },
            () => {
                const base = Math.floor(Math.random() * 5) + 2;
                const exp1 = Math.floor(Math.random() * 3) + 2;
                const exp2 = Math.floor(Math.random() * 3) + 2;
                return {
                    question: `${base}^${exp1} × ${base}^${exp2} = ${base}^?`,
                    answer: exp1 + exp2
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateOrderOfOperationsProblem(operation) {
        const problems = [
            () => {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                const c = Math.floor(Math.random() * 10) + 1;
                return {
                    question: `${a} + ${b} × ${c} = `,
                    answer: a + (b * c)
                };
            },
            () => {
                const a = Math.floor(Math.random() * 15) + 5;
                const b = Math.floor(Math.random() * 5) + 1;
                const c = Math.floor(Math.random() * 5) + 1;
                return {
                    question: `(${a} - ${b}) × ${c} = `,
                    answer: (a - b) * c
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 8) + 2;
                const c = Math.floor(Math.random() * 8) + 2;
                const d = Math.floor(Math.random() * 8) + 2;
                return {
                    question: `${a} × ${b} + ${c} × ${d} = `,
                    answer: (a * b) + (c * d)
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateFactorsMultiplesProblem(operation) {
        const problems = [
            () => {
                const num = Math.floor(Math.random() * 20) + 10;
                const factors = [];
                for (let i = 1; i <= num; i++) {
                    if (num % i === 0) factors.push(i);
                }
                return {
                    question: `List all factors of ${num}`,
                    answer: factors.join(', ')
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 8) + 2;
                const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
                return {
                    question: `Find the GCF of ${a} and ${b}`,
                    answer: gcd(a, b)
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 8) + 2;
                const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
                const lcm = (a * b) / gcd(a, b);
                return {
                    question: `Find the LCM of ${a} and ${b}`,
                    answer: lcm
                };
            },
            () => {
                const num = Math.floor(Math.random() * 4) + 2;
                const count = Math.floor(Math.random() * 3) + 3;
                const multiples = Array.from({length: count}, (_, i) => num * (i + 1));
                return {
                    question: `First ${count} multiples of ${num}:`,
                    answer: multiples.join(', ')
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    // MEASUREMENT PROBLEM GENERATORS
    generateMeasurementProblem(selectedTopics = 'all') {
        const topics = selectedTopics !== 'all' && selectedTopics.length > 0
            ? selectedTopics
            : ['length', 'weight-mass', 'capacity-volume', 'time', 'money', 'temperature', 'unit-conversions'];

        const topic = Array.isArray(topics) ? topics[Math.floor(Math.random() * topics.length)] : topics;

        switch (topic) {
            case 'length':
                return this.generateLengthProblem();
            case 'weight-mass':
                return this.generateWeightProblem();
            case 'capacity-volume':
                return this.generateCapacityProblem();
            case 'time':
                return this.generateTimeProblem();
            case 'money':
                return this.generateMoneyProblem();
            case 'temperature':
                return this.generateTemperatureProblem();
            case 'unit-conversions':
            case 'metric-customary':
                return this.generateUnitConversionProblem();
            default:
                return this.generateLengthProblem();
        }
    }

    generateLengthProblem() {
        const problems = [
            () => {
                const inches = Math.floor(Math.random() * 48) + 12;
                return {
                    question: `Convert ${inches} inches to feet and inches.`,
                    answer: `${Math.floor(inches / 12)} feet ${inches % 12} inches`
                };
            },
            () => {
                const feet1 = Math.floor(Math.random() * 10) + 5;
                const feet2 = Math.floor(Math.random() * 10) + 5;
                return {
                    question: `${feet1} feet + ${feet2} feet = `,
                    answer: `${feet1 + feet2} feet`
                };
            },
            () => {
                const cm = Math.floor(Math.random() * 900) + 100;
                return {
                    question: `Convert ${cm} cm to meters.`,
                    answer: `${(cm / 100).toFixed(2)} m`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateWeightProblem() {
        const problems = [
            () => {
                const ounces = Math.floor(Math.random() * 48) + 16;
                return {
                    question: `Convert ${ounces} ounces to pounds.`,
                    answer: `${(ounces / 16).toFixed(2)} pounds`
                };
            },
            () => {
                const grams = Math.floor(Math.random() * 4000) + 1000;
                return {
                    question: `Convert ${grams} grams to kilograms.`,
                    answer: `${(grams / 1000).toFixed(2)} kg`
                };
            },
            () => {
                const lbs1 = Math.floor(Math.random() * 50) + 10;
                const lbs2 = Math.floor(Math.random() * 50) + 10;
                return {
                    question: `${lbs1} pounds + ${lbs2} pounds = `,
                    answer: `${lbs1 + lbs2} pounds`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateCapacityProblem() {
        const problems = [
            () => {
                const cups = Math.floor(Math.random() * 12) + 4;
                return {
                    question: `Convert ${cups} cups to pints.`,
                    answer: `${(cups / 2).toFixed(1)} pints`
                };
            },
            () => {
                const ml = Math.floor(Math.random() * 3000) + 1000;
                return {
                    question: `Convert ${ml} mL to liters.`,
                    answer: `${(ml / 1000).toFixed(2)} L`
                };
            },
            () => {
                const gallons = Math.floor(Math.random() * 10) + 2;
                return {
                    question: `Convert ${gallons} gallons to quarts.`,
                    answer: `${gallons * 4} quarts`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateTimeProblem() {
        const problems = [
            () => {
                const hours = Math.floor(Math.random() * 11) + 1;
                const minutes = Math.floor(Math.random() * 60);
                const addHours = Math.floor(Math.random() * 3) + 1;
                const addMinutes = Math.floor(Math.random() * 60);
                const totalMinutes = (hours * 60 + minutes) + (addHours * 60 + addMinutes);
                const finalHours = Math.floor(totalMinutes / 60) % 12 || 12;
                const finalMinutes = totalMinutes % 60;
                return {
                    question: `If it's ${hours}:${minutes.toString().padStart(2, '0')}, what time will it be in ${addHours} hours and ${addMinutes} minutes?`,
                    answer: `${finalHours}:${finalMinutes.toString().padStart(2, '0')}`
                };
            },
            () => {
                const minutes = Math.floor(Math.random() * 180) + 60;
                return {
                    question: `Convert ${minutes} minutes to hours and minutes.`,
                    answer: `${Math.floor(minutes / 60)} hours ${minutes % 60} minutes`
                };
            },
            () => {
                const startHour = Math.floor(Math.random() * 8) + 8;
                const endHour = startHour + Math.floor(Math.random() * 4) + 2;
                return {
                    question: `How much time elapsed from ${startHour}:00 to ${endHour}:00?`,
                    answer: `${endHour - startHour} hours`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateMoneyProblem() {
        const problems = [
            () => {
                const dollars = Math.floor(Math.random() * 20) + 5;
                const cents = Math.floor(Math.random() * 100);
                const price = Math.floor(Math.random() * 15) + 3;
                const priceCents = Math.floor(Math.random() * 100);
                const totalCents = (dollars * 100 + cents) - (price * 100 + priceCents);
                return {
                    question: `You have $${dollars}.${cents.toString().padStart(2, '0')}. You buy something for $${price}.${priceCents.toString().padStart(2, '0')}. How much change do you get?`,
                    answer: `$${Math.floor(totalCents / 100)}.${(totalCents % 100).toString().padStart(2, '0')}`
                };
            },
            () => {
                const quarters = Math.floor(Math.random() * 8) + 2;
                const dimes = Math.floor(Math.random() * 10) + 3;
                const nickels = Math.floor(Math.random() * 10) + 2;
                const pennies = Math.floor(Math.random() * 20) + 5;
                const total = (quarters * 25 + dimes * 10 + nickels * 5 + pennies) / 100;
                return {
                    question: `${quarters} quarters + ${dimes} dimes + ${nickels} nickels + ${pennies} pennies = `,
                    answer: `$${total.toFixed(2)}`
                };
            },
            () => {
                const items = Math.floor(Math.random() * 5) + 2;
                const price = (Math.floor(Math.random() * 400) + 100) / 100;
                const total = items * price;
                return {
                    question: `If one item costs $${price.toFixed(2)}, how much do ${items} items cost?`,
                    answer: `$${total.toFixed(2)}`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateTemperatureProblem() {
        const problems = [
            () => {
                const celsius = Math.floor(Math.random() * 40) + 0;
                const fahrenheit = Math.round((celsius * 9/5) + 32);
                return {
                    question: `Convert ${celsius}°C to Fahrenheit.`,
                    answer: `${fahrenheit}°F`
                };
            },
            () => {
                const temp1 = Math.floor(Math.random() * 20) + 60;
                const temp2 = Math.floor(Math.random() * 15) + 50;
                return {
                    question: `What is the temperature difference between ${temp1}°F and ${temp2}°F?`,
                    answer: `${Math.abs(temp1 - temp2)}°F`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateUnitConversionProblem() {
        const conversions = [
            { from: 'feet', to: 'inches', factor: 12, question: (n) => `${n} feet`, answer: (n, f) => `${n * f} inches` },
            { from: 'yards', to: 'feet', factor: 3, question: (n) => `${n} yards`, answer: (n, f) => `${n * f} feet` },
            { from: 'meters', to: 'centimeters', factor: 100, question: (n) => `${n} meters`, answer: (n, f) => `${n * f} cm` },
            { from: 'kilometers', to: 'meters', factor: 1000, question: (n) => `${n} kilometers`, answer: (n, f) => `${n * f} meters` },
            { from: 'pounds', to: 'ounces', factor: 16, question: (n) => `${n} pounds`, answer: (n, f) => `${n * f} ounces` },
            { from: 'kilograms', to: 'grams', factor: 1000, question: (n) => `${n} kilograms`, answer: (n, f) => `${n * f} grams` }
        ];

        const conv = conversions[Math.floor(Math.random() * conversions.length)];
        const num = Math.floor(Math.random() * 10) + 1;

        return {
            question: `Convert ${conv.question(num)} to ${conv.to}.`,
            answer: conv.answer(num, conv.factor)
        };
    }

    // Advanced subject generators
    generateAlgebraEquation(operation, selectedTopics = 'all') {
        // Handle topic-specific algebra problems
        if (selectedTopics !== 'all' && selectedTopics.length > 0) {
            for (let topic of selectedTopics) {
                switch (topic) {
                    case 'expressions':
                        return this.generateAlgebraicExpression();
                    case 'exponents-radicals':
                        return this.generateExponentsRadicalsProblem();
                    case 'rational-expressions':
                        return this.generateRationalExpressionProblem();
                    case 'absolute-value':
                        return this.generateAbsoluteValueProblem();
                    case 'linear-equations':
                        return this.generateLinearEquation();
                    case 'quadratic-equations':
                        return this.generateQuadraticExpansion();
                    case 'factoring':
                        return this.generateFactoring();
                    case 'linear-relations':
                        return this.generateLinearRelationProblem();
                    case 'coding':
                        return this.generateCodingProblem();
                    default:
                        continue;
                }
            }
        }

        const problems = [
            () => this.generateLinearEquation(),
            () => this.generateQuadraticExpansion(),
            () => this.generateFactoring()
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    /**
     * Linear relations: rate of change, initial value, and moving between a
     * table, a graph and an equation (Ontario strand C).
     */
    generateLinearRelationProblem() {
        const p = this.paramsFor('linear-relations');
        const limit = Math.max(4, Math.min(Number(p.maxNumber) || 20, 40));
        const slope = randomChoice([-1, 1]) * (Math.floor(Math.random() * limit) + 1);
        const intercept = Math.floor(Math.random() * limit) + 1;
        const x = Math.floor(Math.random() * 8) + 2;

        const variants = [
            () => ({
                question: `A linear relation passes through (0, ${intercept}) and (1, ${intercept + slope}). What is its rate of change?`,
                answer: `${slope}`,
            }),
            () => ({
                question: `Write the equation of the line with slope ${slope} and y-intercept ${intercept}.`,
                answer: `y = ${slope}x + ${intercept}`,
            }),
            () => ({
                question: `For y = ${slope}x + ${intercept}, find y when x = ${x}.`,
                answer: `${slope * x + intercept}`,
            }),
            () => ({
                question: `A table shows y = ${intercept} when x = 0 and y = ${intercept + slope * x} when x = ${x}. What is the rate of change?`,
                answer: `${slope}`,
            }),
        ];
        return randomChoice(variants)();
    }

    /**
     * Coding: tracing a short sequence of instructions, which Ontario places in
     * the Algebra strand from Grade 1 onward.
     */
    generateCodingProblem() {
        const p = this.paramsFor('coding');
        const steps = Math.max(3, Math.min(Number(p.terms) || 4, 8));
        const limit = Math.max(10, Math.min(Number(p.maxNumber) || 50, 200));

        const start = Math.floor(Math.random() * limit) + 1;
        const instructions = [];
        let value = start;

        for (let i = 0; i < steps; i += 1) {
            const amount = Math.floor(Math.random() * 9) + 2;
            if (Math.random() < 0.5) {
                instructions.push(`ADD ${amount}`);
                value += amount;
            } else {
                instructions.push(`SUBTRACT ${amount}`);
                value -= amount;
            }
        }

        const variants = [
            () => ({
                question: `Start with ${start}, then ${instructions.join(', ')}. What is the final value?`,
                answer: `${value}`,
            }),
            () => {
                const times = Math.floor(Math.random() * 3) + 2;
                const step = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `REPEAT ${times} times: ADD ${step}. Starting at ${start}, what is the final value?`,
                    answer: `${start + times * step}`,
                };
            },
            () => ({
                question: `A program runs ${instructions.join(', ')} and ends at ${value}. What value did it start with?`,
                answer: `${start}`,
            }),
        ];
        return randomChoice(variants)();
    }

    generateAlgebraicExpression() {
        const problems = [
            () => {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                const x = Math.floor(Math.random() * 5) + 1;
                return {
                    question: `Evaluate ${a}x + ${b} when x = ${x}`,
                    answer: a * x + b
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 8) + 2;
                return {
                    question: `Simplify: ${a}x + ${b}x`,
                    answer: `${a + b}x`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 6) + 2;
                const c = Math.floor(Math.random() * 6) + 2;
                return {
                    question: `Expand: ${a}(x + ${b})`,
                    answer: `${a}x + ${a * b}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 7) + 2;
                const b = Math.floor(Math.random() * 7) + 2;
                return {
                    question: `Simplify: ${a}x - ${b}x + ${a + b}x`,
                    answer: `${a + a + b - b}x` // Simplifies to 2ax
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 1;
                const b = Math.floor(Math.random() * 8) + 1;
                const c = Math.floor(Math.random() * 5) + 1;
                return {
                    question: `Evaluate ${a}x² + ${b}x + ${c} when x = 2`,
                    answer: a * 4 + b * 2 + c
                };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 5) + 1;
                return {
                    question: `Expand: (x + ${a})(x + ${b})`,
                    answer: `x² + ${a + b}x + ${a * b}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 2;
                const b = Math.floor(Math.random() * 6) + 3;
                const c = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `Simplify: ${a}(${b}x - ${c})`,
                    answer: `${a * b}x - ${a * c}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const b = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `Simplify: ${a}x + ${b} - ${a}x`,
                    answer: `${b}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 2;
                const b = Math.floor(Math.random() * 4) + 2;
                const c = Math.floor(Math.random() * 4) + 1;
                return {
                    question: `Expand: ${a}(x + ${b}) + ${c}x`,
                    answer: `${a + c}x + ${a * b}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const x = Math.floor(Math.random() * 3) + 1;
                const y = Math.floor(Math.random() * 3) + 1;
                return {
                    question: `Evaluate ${a}x - ${a}y when x = ${x} and y = ${y}`,
                    answer: a * (x - y)
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateExponentsRadicalsProblem() {
        const problems = [
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const exp1 = Math.floor(Math.random() * 3) + 2;
                const exp2 = Math.floor(Math.random() * 3) + 2;
                return {
                    question: `Simplify: x^${exp1} × x^${exp2}`,
                    answer: `x^${exp1 + exp2}`
                };
            },
            () => {
                const coef = Math.floor(Math.random() * 4) + 2;
                const num = [4, 9, 16, 25, 36][Math.floor(Math.random() * 5)];
                return {
                    question: `Simplify: √${num}x²`,
                    answer: `${Math.sqrt(num)}x`
                };
            },
            () => {
                const base = Math.floor(Math.random() * 4) + 2;
                const exp = Math.floor(Math.random() * 3) + 2;
                return {
                    question: `Simplify: (x^${exp})^${base}`,
                    answer: `x^${exp * base}`
                };
            },
            () => {
                const exp1 = Math.floor(Math.random() * 4) + 3;
                const exp2 = Math.floor(Math.random() * 3) + 1;
                return {
                    question: `Simplify: x^${exp1} ÷ x^${exp2}`,
                    answer: `x^${exp1 - exp2}`
                };
            },
            () => {
                const base = Math.floor(Math.random() * 5) + 2;
                const exp = Math.floor(Math.random() * 4) + 1;
                return {
                    question: `Evaluate: ${base}^${exp}`,
                    answer: Math.pow(base, exp)
                };
            },
            () => {
                const num = [8, 27, 64, 125][Math.floor(Math.random() * 4)];
                const root = Math.cbrt(num);
                return {
                    question: `Find the cube root: ³√${num}`,
                    answer: Math.round(root)
                };
            },
            () => {
                const a = Math.floor(Math.random() * 3) + 2;
                const b = Math.floor(Math.random() * 3) + 2;
                return {
                    question: `Simplify: (${a}x²)³`,
                    answer: `${Math.pow(a, 3)}x^6`
                };
            },
            () => {
                const num1 = [4, 9, 16, 25][Math.floor(Math.random() * 4)];
                const num2 = [4, 9, 16, 25][Math.floor(Math.random() * 4)];
                return {
                    question: `Simplify: √${num1} × √${num2}`,
                    answer: Math.round(Math.sqrt(num1) * Math.sqrt(num2))
                };
            },
            () => {
                const exp = Math.floor(Math.random() * 3) + 2;
                return {
                    question: `Simplify: x^${exp} × x^${-exp}`,
                    answer: '1'
                };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 2;
                const exp = Math.floor(Math.random() * 3) + 2;
                return {
                    question: `Simplify: (${a}xy)²`,
                    answer: `${a * a}x²y²`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateRationalExpressionProblem() {
        const problems = [
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 6) + 2;
                const c = Math.floor(Math.random() * 6) + 2;
                return {
                    question: `Simplify: (${a}x)/(${b}) × (${c})/(x)`,
                    answer: `${(a * c) / b}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const b = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `Simplify: (${a}x)/(${b}x)`,
                    answer: `${a}/${b}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = a; // Same to simplify to 1
                return {
                    question: `Simplify: (${a}x² + ${a}x)/(${b}x)`,
                    answer: `x + 1`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateAbsoluteValueProblem() {
        const problems = [
            () => {
                const a = Math.floor(Math.random() * 20) - 10;
                return {
                    question: `|${a}| = `,
                    answer: Math.abs(a)
                };
            },
            () => {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 15) + 5;
                return {
                    question: `Solve: |x| = ${b}`,
                    answer: `x = ${b} or x = -${b}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const b = Math.floor(Math.random() * 10) + 5;
                const c = Math.floor(Math.random() * 10) + 3;
                return {
                    question: `Solve: |${a}x - ${b}| = ${c}`,
                    answer: `x = ${((b + c) / a).toFixed(2)} or x = ${((b - c) / a).toFixed(2)}`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateLinearEquation() {
        const problemTypes = [
            () => {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 20) - 10;
                const c = Math.floor(Math.random() * 50) + 1;
                const answer = Math.round((c - b) / a * 100) / 100;
                return {
                    question: `Solve for x: ${a}x ${b >= 0 ? '+' : ''}${b} = ${c}`,
                    answer: `x = ${answer}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 15) + 5;
                const c = Math.floor(Math.random() * 12) + 3;
                const answer = Math.round((b - c) / a * 100) / 100;
                return {
                    question: `Solve: ${a}x + ${c} = ${b}`,
                    answer: `x = ${answer}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 7) + 2;
                const b = Math.floor(Math.random() * 18) + 8;
                const c = Math.floor(Math.random() * 10) + 4;
                const answer = Math.round((b + c) / a * 100) / 100;
                return {
                    question: `Find x: ${a}x - ${c} = ${b}`,
                    answer: `x = ${answer}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 6) + 2;
                const c = Math.floor(Math.random() * 30) + 10;
                const answer = Math.round(c / (a + b) * 100) / 100;
                return {
                    question: `Solve for x: ${a}x + ${b}x = ${c}`,
                    answer: `x = ${answer}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const b = Math.floor(Math.random() * 8) + 3;
                const c = Math.floor(Math.random() * 5) + 2;
                const d = Math.floor(Math.random() * 25) + 10;
                const answer = Math.round((d - c) / (a - b) * 100) / 100;
                return {
                    question: `Solve: ${a}x + ${c} = ${b}x + ${d}`,
                    answer: `x = ${answer}`
                };
            }
        ];
        return problemTypes[Math.floor(Math.random() * problemTypes.length)]();
    }

    generateQuadraticExpansion() {
        const problemTypes = [
            () => {
                const a = Math.floor(Math.random() * 5) + 1;
                const b = Math.floor(Math.random() * 10) - 5;
                const question = `Expand: (x + ${a})(x ${b >= 0 ? '+' : ''}${b})`;
                const answer = `x² ${(a + b) >= 0 ? '+' : ''}${a + b}x ${(a * b) >= 0 ? '+' : ''}${a * b}`;
                return { question, answer };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 8) - 4;
                const question = `Expand: (x ${a >= 0 ? '+' : ''}${a})(x ${b >= 0 ? '+' : ''}${b})`;
                const answer = `x² ${(a + b) >= 0 ? '+' : ''}${a + b}x ${(a * b) >= 0 ? '+' : ''}${a * b}`;
                return { question, answer };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 2;
                const b = Math.floor(Math.random() * 7) + 1;
                const question = `Multiply: (x - ${a})(x + ${b})`;
                const answer = `x² ${(b - a) >= 0 ? '+' : ''}${b - a}x ${(-a * b) >= 0 ? '+' : ''}${-a * b}`;
                return { question, answer };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const question = `Expand: (x + ${a})²`;
                const answer = `x² + ${2 * a}x + ${a * a}`;
                return { question, answer };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const question = `Expand: (x - ${a})²`;
                const answer = `x² - ${2 * a}x + ${a * a}`;
                return { question, answer };
            }
        ];
        return problemTypes[Math.floor(Math.random() * problemTypes.length)]();
    }

    generateFactoring() {
        const problemTypes = [
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 8) + 2;
                const expanded = a * b;
                const sum = a + b;
                const question = `Factor: x² ${sum >= 0 ? '+' : ''}${sum}x ${expanded >= 0 ? '+' : ''}${expanded}`;
                const answer = `(x ${a >= 0 ? '+' : ''}${a})(x ${b >= 0 ? '+' : ''}${b})`;
                return { question, answer };
            },
            () => {
                const a = Math.floor(Math.random() * 7) + 1;
                const b = Math.floor(Math.random() * 7) + 1;
                const expanded = a * b;
                const diff = a - b;
                const question = `Factor: x² ${diff >= 0 ? '+' : ''}${diff}x ${-expanded}`;
                const answer = `(x + ${a})(x - ${b})`;
                return { question, answer };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const gcf = Math.floor(Math.random() * 4) + 2;
                const b = Math.floor(Math.random() * 5) + 1;
                const question = `Factor out GCF: ${gcf}x² + ${gcf * b}x`;
                const answer = `${gcf}x(x + ${b})`;
                return { question, answer };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const question = `Factor: x² - ${a * a}`;
                const answer = `(x + ${a})(x - ${a})`;
                return { question, answer };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 6) + 2;
                const question = `Factor completely: ${a}x + ${a * b}`;
                const answer = `${a}(x + ${b})`;
                return { question, answer };
            }
        ];
        return problemTypes[Math.floor(Math.random() * problemTypes.length)]();
    }

    generateGeometryProblem(selectedTopics = 'all') {
        // Handle topic-specific geometry problems
        if (selectedTopics !== 'all' && selectedTopics.length > 0) {
            for (let topic of selectedTopics) {
                switch (topic) {
                    case '2d-shapes':
                        return this.generate2DShapesProblem();
                    case '3d-shapes':
                        return this.generate3DShapesProblem();
                    case 'transformations':
                        return this.generateTransformationProblem();
                    case 'symmetry':
                        return this.generateSymmetryProblem();
                    case 'congruence-similarity':
                        return this.generateCongruenceSimilarityProblem();
                    case 'area-perimeter':
                        return Math.random() < 0.5 ? this.generateAreaProblem() : this.generatePerimeterProblem();
                    case 'pythagorean-theorem':
                        return this.generatePythagoreanProblem();
                    default:
                        continue;
                }
            }
        }

        const problems = [
            () => this.generateAreaProblem(),
            () => this.generatePerimeterProblem(),
            () => this.generatePythagoreanProblem()
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generate2DShapesProblem() {
        const shapes = [
            { name: 'triangle', sides: 3, question: 'How many sides does a triangle have?' },
            { name: 'rectangle', sides: 4, question: 'How many sides does a rectangle have?' },
            { name: 'pentagon', sides: 5, question: 'How many sides does a pentagon have?' },
            { name: 'hexagon', sides: 6, question: 'How many sides does a hexagon have?' },
            { name: 'octagon', sides: 8, question: 'How many sides does an octagon have?' }
        ];

        const problems = [
            () => {
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                return {
                    question: shape.question,
                    answer: shape.sides
                };
            },
            () => {
                const sides = Math.floor(Math.random() * 6) + 3;
                const angleSum = (sides - 2) * 180;
                return {
                    question: `What is the sum of interior angles in a polygon with ${sides} sides?`,
                    answer: `${angleSum}°`
                };
            },
            () => {
                return {
                    question: 'A quadrilateral with 4 equal sides and 4 right angles is called a...',
                    answer: 'square'
                };
            }
        ];

        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generate3DShapesProblem() {
        const shapes = [
            { name: 'cube', faces: 6, vertices: 8, edges: 12 },
            { name: 'rectangular prism', faces: 6, vertices: 8, edges: 12 },
            { name: 'pyramid', faces: 5, vertices: 5, edges: 8 },
            { name: 'cylinder', faces: 3, vertices: 0, edges: 2 },
            { name: 'sphere', faces: 1, vertices: 0, edges: 0 }
        ];

        const problems = [
            () => {
                const shape = shapes[Math.floor(Math.random() * 3)]; // Only use shapes with clear face counts
                return {
                    question: `How many faces does a ${shape.name} have?`,
                    answer: shape.faces
                };
            },
            () => {
                return {
                    question: 'How many vertices does a cube have?',
                    answer: 8
                };
            },
            () => {
                const side = Math.floor(Math.random() * 8) + 2;
                return {
                    question: `What is the volume of a cube with side length ${side} units?`,
                    answer: `${Math.pow(side, 3)} cubic units`
                };
            }
        ];

        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateTransformationProblem() {
        const problems = [
            () => {
                const x = Math.floor(Math.random() * 10) + 1;
                const y = Math.floor(Math.random() * 10) + 1;
                const dx = Math.floor(Math.random() * 5) + 1;
                const dy = Math.floor(Math.random() * 5) + 1;
                return {
                    question: `Point (${x}, ${y}) is translated ${dx} units right and ${dy} units up. What is the new location?`,
                    answer: `(${x + dx}, ${y + dy})`
                };
            },
            () => {
                const x = Math.floor(Math.random() * 10) + 1;
                const y = Math.floor(Math.random() * 10) + 1;
                return {
                    question: `Point (${x}, ${y}) is reflected across the x-axis. What is the new location?`,
                    answer: `(${x}, ${-y})`
                };
            },
            () => {
                const x = Math.floor(Math.random() * 10) + 1;
                const y = Math.floor(Math.random() * 10) + 1;
                return {
                    question: `Point (${x}, ${y}) is rotated 90° clockwise around the origin. What is the new location?`,
                    answer: `(${y}, ${-x})`
                };
            }
        ];

        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateSymmetryProblem() {
        const problems = [
            () => {
                const shapes = [
                    { name: 'square', lines: 4 },
                    { name: 'rectangle', lines: 2 },
                    { name: 'equilateral triangle', lines: 3 },
                    { name: 'circle', lines: 'infinite' }
                ];
                const shape = shapes[Math.floor(Math.random() * 3)]; // Avoid infinite
                return {
                    question: `How many lines of symmetry does a ${shape.name} have?`,
                    answer: shape.lines
                };
            },
            () => {
                return {
                    question: 'Does the letter "A" have line symmetry?',
                    answer: 'Yes (vertical line)'
                };
            },
            () => {
                return {
                    question: 'How many degrees of rotational symmetry does a square have?',
                    answer: '90°'
                };
            }
        ];

        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateCongruenceSimilarityProblem() {
        const problems = [
            () => {
                const scale = Math.floor(Math.random() * 4) + 2;
                const side = Math.floor(Math.random() * 8) + 3;
                return {
                    question: `A triangle has a side of ${side} cm. A similar triangle has a scale factor of ${scale}. What is the corresponding side length?`,
                    answer: `${side * scale} cm`
                };
            },
            () => {
                return {
                    question: 'Two triangles with all corresponding sides equal are called...',
                    answer: 'congruent'
                };
            },
            () => {
                const ratio = Math.floor(Math.random() * 3) + 2;
                const side1 = Math.floor(Math.random() * 6) + 4;
                const side2 = side1 * ratio;
                return {
                    question: `Triangle A has sides 4 cm and Triangle B has sides 8 cm. If they are similar, what is the scale factor?`,
                    answer: '2'
                };
            }
        ];

        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateAreaProblem() {
        const shapes = ['rectangle', 'square', 'triangle', 'circle', 'parallelogram', 'trapezoid'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        switch(shape) {
            case 'rectangle':
                const length = Math.floor(Math.random() * 20) + 5;
                const width = Math.floor(Math.random() * 15) + 3;
                return {
                    question: `Find the area of a rectangle with length ${length} units and width ${width} units.`,
                    answer: `${length * width} square units`
                };
            case 'square':
                const side = Math.floor(Math.random() * 15) + 4;
                return {
                    question: `Find the area of a square with side length ${side} units.`,
                    answer: `${side * side} square units`
                };
            case 'triangle':
                const base = Math.floor(Math.random() * 20) + 5;
                const height = Math.floor(Math.random() * 15) + 3;
                return {
                    question: `Find the area of a triangle with base ${base} units and height ${height} units.`,
                    answer: `${(base * height) / 2} square units`
                };
            case 'circle':
                const radius = Math.floor(Math.random() * 10) + 2;
                const area = Math.round(Math.PI * radius * radius * 100) / 100;
                return {
                    question: `Find the area of a circle with radius ${radius} units. (Use π ≈ 3.14)`,
                    answer: `${area} square units`
                };
            case 'parallelogram':
                const pBase = Math.floor(Math.random() * 18) + 6;
                const pHeight = Math.floor(Math.random() * 12) + 4;
                return {
                    question: `Find the area of a parallelogram with base ${pBase} units and height ${pHeight} units.`,
                    answer: `${pBase * pHeight} square units`
                };
            case 'trapezoid':
                const base1 = Math.floor(Math.random() * 15) + 8;
                const base2 = Math.floor(Math.random() * 12) + 4;
                const tHeight = Math.floor(Math.random() * 10) + 5;
                return {
                    question: `Find the area of a trapezoid with bases ${base1} and ${base2} units and height ${tHeight} units.`,
                    answer: `${((base1 + base2) * tHeight) / 2} square units`
                };
            default:
                // Fallback to rectangle
                const len = Math.floor(Math.random() * 20) + 5;
                const wid = Math.floor(Math.random() * 15) + 3;
                return {
                    question: `Find the area of a rectangle with length ${len} units and width ${wid} units.`,
                    answer: `${len * wid} square units`
                };
        }
    }

    generatePerimeterProblem() {
        const shapes = ['rectangle', 'square', 'triangle', 'pentagon', 'hexagon'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        switch(shape) {
            case 'rectangle':
                const length = Math.floor(Math.random() * 20) + 5;
                const width = Math.floor(Math.random() * 15) + 3;
                return {
                    question: `Find the perimeter of a rectangle with length ${length} units and width ${width} units.`,
                    answer: `${2 * (length + width)} units`
                };
            case 'square':
                const side = Math.floor(Math.random() * 18) + 4;
                return {
                    question: `Find the perimeter of a square with side length ${side} units.`,
                    answer: `${4 * side} units`
                };
            case 'triangle':
                const s1 = Math.floor(Math.random() * 12) + 5;
                const s2 = Math.floor(Math.random() * 12) + 5;
                const s3 = Math.floor(Math.random() * 12) + 5;
                return {
                    question: `Find the perimeter of a triangle with sides ${s1}, ${s2}, and ${s3} units.`,
                    answer: `${s1 + s2 + s3} units`
                };
            case 'pentagon':
                const pSide = Math.floor(Math.random() * 10) + 4;
                return {
                    question: `Find the perimeter of a regular pentagon with side length ${pSide} units.`,
                    answer: `${5 * pSide} units`
                };
            case 'hexagon':
                const hSide = Math.floor(Math.random() * 10) + 3;
                return {
                    question: `Find the perimeter of a regular hexagon with side length ${hSide} units.`,
                    answer: `${6 * hSide} units`
                };
            default:
                const len = Math.floor(Math.random() * 20) + 5;
                const wid = Math.floor(Math.random() * 15) + 3;
                return {
                    question: `Find the perimeter of a rectangle with length ${len} units and width ${wid} units.`,
                    answer: `${2 * (len + wid)} units`
                };
        }
    }

    generatePythagoreanProblem() {
        const problemTypes = [
            () => {
                const a = Math.floor(Math.random() * 10) + 3;
                const b = Math.floor(Math.random() * 10) + 4;
                const c = Math.round(Math.sqrt(a * a + b * b) * 100) / 100;
                return {
                    question: `In a right triangle, if one leg is ${a} units and the other leg is ${b} units, find the hypotenuse.`,
                    answer: `${c} units`
                };
            },
            () => {
                const c = Math.floor(Math.random() * 15) + 10;
                const a = Math.floor(Math.random() * (c - 2)) + 3;
                const b = Math.round(Math.sqrt(c * c - a * a) * 100) / 100;
                return {
                    question: `Right triangle: hypotenuse = ${c} cm, one leg = ${a} cm. Find the other leg.`,
                    answer: `${b} cm`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 12) + 5;
                const b = Math.floor(Math.random() * 12) + 5;
                const c = Math.round(Math.sqrt(a * a + b * b) * 100) / 100;
                return {
                    question: `Triangle legs are ${a}m and ${b}m. Calculate hypotenuse length.`,
                    answer: `${c}m`
                };
            },
            () => {
                const c = Math.floor(Math.random() * 20) + 13;
                const b = Math.floor(Math.random() * (c - 3)) + 5;
                const a = Math.round(Math.sqrt(c * c - b * b) * 100) / 100;
                return {
                    question: `Given hypotenuse ${c} units and one leg ${b} units, find missing leg.`,
                    answer: `${a} units`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 6;
                const b = Math.floor(Math.random() * 8) + 6;
                const c = Math.round(Math.sqrt(a * a + b * b) * 100) / 100;
                return {
                    question: `Use Pythagorean theorem: a=${a}, b=${b}. Find c.`,
                    answer: `${c}`
                };
            }
        ];
        return problemTypes[Math.floor(Math.random() * problemTypes.length)]();
    }

    generateTrigProblem() {
        const problemTypes = [
            () => {
                const angle = [30, 45, 60][Math.floor(Math.random() * 3)];
                const functions = ['sin', 'cos', 'tan'];
                const func = functions[Math.floor(Math.random() * functions.length)];
                const values = {
                    sin: { 30: '1/2', 45: '√2/2', 60: '√3/2' },
                    cos: { 30: '√3/2', 45: '√2/2', 60: '1/2' },
                    tan: { 30: '√3/3', 45: '1', 60: '√3' }
                };
                return {
                    question: `Find the value of ${func}(${angle}°)`,
                    answer: values[func][angle]
                };
            },
            () => {
                const opposite = Math.floor(Math.random() * 15) + 3;
                const adjacent = Math.floor(Math.random() * 15) + 4;
                const hypotenuse = Math.round(Math.sqrt(opposite * opposite + adjacent * adjacent) * 100) / 100;
                return {
                    question: `In a right triangle with opposite = ${opposite} units and adjacent = ${adjacent} units, calculate sin(θ) to 3 decimal places.`,
                    answer: (opposite / hypotenuse).toFixed(3)
                };
            },
            () => {
                const opposite = Math.floor(Math.random() * 15) + 3;
                const adjacent = Math.floor(Math.random() * 15) + 4;
                const hypotenuse = Math.round(Math.sqrt(opposite * opposite + adjacent * adjacent) * 100) / 100;
                return {
                    question: `Given a right triangle where opposite side = ${opposite} and adjacent side = ${adjacent}, find cos(θ) to 3 decimals.`,
                    answer: (adjacent / hypotenuse).toFixed(3)
                };
            },
            () => {
                const opposite = Math.floor(Math.random() * 15) + 3;
                const adjacent = Math.floor(Math.random() * 15) + 4;
                return {
                    question: `In a right triangle, if the opposite leg is ${opposite} cm and the adjacent leg is ${adjacent} cm, what is tan(θ) as a decimal?`,
                    answer: (opposite / adjacent).toFixed(3)
                };
            },
            () => {
                const height = Math.floor(Math.random() * 40) + 15;
                const angle = Math.floor(Math.random() * 45) + 15;
                return {
                    question: `A ${height}m tall tower casts a shadow when the sun's angle of elevation is ${angle}°. Find the shadow length (tan ${angle}° ≈ ${Math.tan(angle * Math.PI / 180).toFixed(3)}).`,
                    answer: `${(height / Math.tan(angle * Math.PI / 180)).toFixed(2)}m`
                };
            },
            () => {
                const opposite = Math.floor(Math.random() * 12) + 5;
                const hypotenuse = Math.floor(Math.random() * 8) + opposite + 2;
                return {
                    question: `Right triangle: opposite = ${opposite}, hypotenuse = ${hypotenuse}. Calculate cos(θ) to 3 decimal places.`,
                    answer: `${(Math.sqrt(hypotenuse * hypotenuse - opposite * opposite) / hypotenuse).toFixed(3)}`
                };
            },
            () => {
                const adjacent = Math.floor(Math.random() * 20) + 5;
                const opposite = Math.floor(Math.random() * 20) + 5;
                const hyp = Math.sqrt(opposite * opposite + adjacent * adjacent).toFixed(2);
                return {
                    question: `If tan(θ) = ${opposite}/${adjacent} (θ in quadrant I), calculate the hypotenuse length.`,
                    answer: hyp
                };
            },
            () => {
                const ladder = Math.floor(Math.random() * 15) + 10;
                const angle = Math.floor(Math.random() * 35) + 35;
                const height = (ladder * Math.sin(angle * Math.PI / 180)).toFixed(2);
                return {
                    question: `A ${ladder}ft ladder leans against a wall at ${angle}° from the ground. How high does it reach? (sin ${angle}° ≈ ${Math.sin(angle * Math.PI / 180).toFixed(3)})`,
                    answer: `${height}ft`
                };
            },
            () => {
                const distance = Math.floor(Math.random() * 60) + 40;
                const angle = Math.floor(Math.random() * 30) + 35;
                const height = (distance * Math.tan(angle * Math.PI / 180)).toFixed(2);
                return {
                    question: `From ${distance}m away, the angle of elevation to a building's top is ${angle}°. Find height (tan ${angle}° ≈ ${Math.tan(angle * Math.PI / 180).toFixed(3)}).`,
                    answer: `${height}m`
                };
            },
            () => {
                const opp = Math.floor(Math.random() * 10) + 6;
                const adj = Math.floor(Math.random() * 10) + 6;
                const hyp = Math.sqrt(opp * opp + adj * adj).toFixed(2);
                return {
                    question: `Triangle sides: opposite ${opp}cm, adjacent ${adj}cm. Find hypotenuse using Pythagorean theorem.`,
                    answer: `${hyp}cm`
                };
            },
            () => {
                const sinVal = (Math.floor(Math.random() * 7) + 3) / 10;
                const cosVal = Math.sqrt(1 - sinVal * sinVal).toFixed(3);
                return {
                    question: `If sin(θ) = ${sinVal} and θ is in quadrant I, find cos(θ) to 3 decimals.`,
                    answer: cosVal
                };
            },
            () => {
                const cosVal = (Math.floor(Math.random() * 7) + 3) / 10;
                const sinVal = Math.sqrt(1 - cosVal * cosVal).toFixed(3);
                return {
                    question: `Given cos(θ) = ${cosVal} (quadrant I), calculate sin(θ) to 3 decimal places.`,
                    answer: sinVal
                };
            },
            () => {
                const angle = Math.floor(Math.random() * 60) + 15;
                const sinVal = Math.sin(angle * Math.PI / 180).toFixed(3);
                return {
                    question: `Using a calculator, find sin(${angle}°) to 3 decimal places.`,
                    answer: sinVal
                };
            },
            () => {
                const angle = Math.floor(Math.random() * 60) + 15;
                const cosVal = Math.cos(angle * Math.PI / 180).toFixed(3);
                return {
                    question: `Calculate cos(${angle}°) to 3 decimal places using a calculator.`,
                    answer: cosVal
                };
            },
            () => {
                const angle = Math.floor(Math.random() * 50) + 20;
                const tanVal = Math.tan(angle * Math.PI / 180).toFixed(3);
                return {
                    question: `Evaluate tan(${angle}°) to 3 decimal places.`,
                    answer: tanVal
                };
            },
            () => {
                const opp = Math.floor(Math.random() * 12) + 4;
                const hyp = Math.floor(Math.random() * 6) + opp + 3;
                const adj = Math.sqrt(hyp * hyp - opp * opp).toFixed(2);
                return {
                    question: `Right triangle: opposite ${opp} units, hypotenuse ${hyp} units. Find the adjacent side.`,
                    answer: `${adj} units`
                };
            },
            () => {
                const adj = Math.floor(Math.random() * 12) + 4;
                const hyp = Math.floor(Math.random() * 6) + adj + 3;
                const opp = Math.sqrt(hyp * hyp - adj * adj).toFixed(2);
                return {
                    question: `In a right triangle, adjacent = ${adj}cm and hypotenuse = ${hyp}cm. Calculate the opposite side.`,
                    answer: `${opp}cm`
                };
            },
            () => {
                const base = Math.floor(Math.random() * 30) + 20;
                const angle1 = Math.floor(Math.random() * 25) + 25;
                const angle2 = Math.floor(Math.random() * 25) + 25;
                return {
                    question: `A surveyor measures angles of ${angle1}° and ${angle2}° from a ${base}m baseline. This is a trigonometry problem (answer: requires law of sines).`,
                    answer: 'Use law of sines'
                };
            },
            () => {
                const amplitude = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `What is the amplitude of y = ${amplitude}sin(x)?`,
                    answer: amplitude
                };
            },
            () => {
                const period = Math.floor(Math.random() * 3) + 2;
                return {
                    question: `Find the period of y = sin(${period}x) in terms of π.`,
                    answer: `${(2 / period).toFixed(2)}π`
                };
            },
            () => {
                const shift = Math.floor(Math.random() * 5) + 1;
                const direction = Math.random() < 0.5 ? 'up' : 'down';
                const sign = direction === 'up' ? '+' : '-';
                return {
                    question: `The graph of y = sin(x) ${sign} ${shift} is shifted ${shift} units ${direction}. What is the new equation?`,
                    answer: `y = sin(x) ${sign} ${shift}`
                };
            },
            () => {
                const hyp = Math.floor(Math.random() * 15) + 10;
                const opp = Math.floor(Math.random() * (hyp - 2)) + 3;
                const sinTheta = (opp / hyp).toFixed(3);
                return {
                    question: `In a right triangle with hypotenuse ${hyp} and opposite side ${opp}, what is sin(θ)?`,
                    answer: sinTheta
                };
            },
            () => {
                const hyp = Math.floor(Math.random() * 15) + 10;
                const adj = Math.floor(Math.random() * (hyp - 2)) + 3;
                const cosTheta = (adj / hyp).toFixed(3);
                return {
                    question: `Right triangle has hypotenuse = ${hyp}m and adjacent = ${adj}m. Find cos(θ).`,
                    answer: cosTheta
                };
            },
            () => {
                const ratio = Math.floor(Math.random() * 8) + 3;
                const multiple = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `If sin(θ) : cos(θ) = ${ratio} : ${multiple}, find tan(θ) as a simplified fraction.`,
                    answer: `${ratio}/${multiple}`
                };
            },
            () => {
                const height = Math.floor(Math.random() * 25) + 35;
                const dist = Math.floor(Math.random() * 25) + 35;
                const angle = (Math.atan(height / dist) * 180 / Math.PI).toFixed(2);
                return {
                    question: `A ${height}ft flagpole is viewed from ${dist}ft away. Find the angle of elevation to the top.`,
                    answer: `${angle}°`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 4;
                const b = Math.floor(Math.random() * 8) + 4;
                const c = Math.sqrt(a * a + b * b).toFixed(2);
                const angle = (Math.atan(a / b) * 180 / Math.PI).toFixed(2);
                return {
                    question: `Triangle legs are ${a} and ${b} units. Find one acute angle to 2 decimal places.`,
                    answer: `${angle}°`
                };
            },
            () => {
                const coeff = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `What is the frequency of y = sin(${coeff}πx)? (frequency = coefficient of x / 2π)`,
                    answer: `${coeff / 2}`
                };
            },
            () => {
                const r = Math.floor(Math.random() * 8) + 5;
                const angle = Math.floor(Math.random() * 60) + 20;
                const x = (r * Math.cos(angle * Math.PI / 180)).toFixed(2);
                const y = (r * Math.sin(angle * Math.PI / 180)).toFixed(2);
                return {
                    question: `Point P is ${r} units from origin at ${angle}°. Find x-coordinate (x = r·cos θ).`,
                    answer: x
                };
            },
            () => {
                const r = Math.floor(Math.random() * 8) + 5;
                const angle = Math.floor(Math.random() * 60) + 20;
                const y = (r * Math.sin(angle * Math.PI / 180)).toFixed(2);
                return {
                    question: `Point at distance ${r} and angle ${angle}° from origin. Find y-coordinate (y = r·sin θ).`,
                    answer: y
                };
            },
            () => {
                const opposite = Math.floor(Math.random() * 18) + 6;
                const adjacent = Math.floor(Math.random() * 18) + 6;
                const angle = (Math.atan(opposite / adjacent) * 180 / Math.PI).toFixed(2);
                return {
                    question: `Opposite side = ${opposite}, adjacent = ${adjacent}. Find angle θ using inverse tangent.`,
                    answer: `${angle}°`
                };
            },
            () => {
                const ratio = (Math.floor(Math.random() * 7) + 3) / 10;
                const angle = (Math.asin(ratio) * 180 / Math.PI).toFixed(2);
                return {
                    question: `If sin(θ) = ${ratio}, find θ in degrees (0° < θ < 90°).`,
                    answer: `${angle}°`
                };
            },
            () => {
                const wire = Math.floor(Math.random() * 20) + 25;
                const angle = Math.floor(Math.random() * 25) + 50;
                const height = (wire * Math.sin(angle * Math.PI / 180)).toFixed(2);
                return {
                    question: `A ${wire}m wire is attached to the ground at ${angle}°. How high is the attachment point?`,
                    answer: `${height}m`
                };
            },
            () => {
                const radius = Math.floor(Math.random() * 12) + 6;
                const angle = Math.floor(Math.random() * 50) + 30;
                const arc = (radius * angle * Math.PI / 180).toFixed(2);
                return {
                    question: `Circle radius ${radius}cm, central angle ${angle}°. Find arc length (s = rθ, θ in radians).`,
                    answer: `${arc}cm`
                };
            },
            () => {
                const angle = [120, 135, 150, 210, 225, 240, 300, 315, 330][Math.floor(Math.random() * 9)];
                const ref = angle <= 180 ? 180 - angle : angle - 180;
                return {
                    question: `What is the reference angle for ${angle}°?`,
                    answer: `${Math.abs(ref)}°`
                };
            },
            () => {
                const opp1 = Math.floor(Math.random() * 10) + 5;
                const opp2 = Math.floor(Math.random() * 10) + 5;
                const adj = Math.floor(Math.random() * 10) + 5;
                return {
                    question: `Two angles in a right triangle have opposite sides ${opp1} and ${opp2} sharing adjacent side ${adj}. Find tan of first angle.`,
                    answer: (opp1 / adj).toFixed(3)
                };
            },
            () => {
                const deg = Math.floor(Math.random() * 180) + 30;
                const rad = (deg * Math.PI / 180).toFixed(4);
                return {
                    question: `Convert ${deg}° to radians (use π ≈ 3.14159).`,
                    answer: `${rad} rad`
                };
            },
            () => {
                const rad = (Math.floor(Math.random() * 25) + 5) / 10;
                const deg = (rad * 180 / Math.PI).toFixed(2);
                return {
                    question: `Convert ${rad} radians to degrees.`,
                    answer: `${deg}°`
                };
            },
            () => {
                const angle = Math.floor(Math.random() * 45) + 30;
                const complement = 90 - angle;
                return {
                    question: `Find the complement of ${angle}°.`,
                    answer: `${complement}°`
                };
            },
            () => {
                const angle = Math.floor(Math.random() * 90) + 45;
                const supplement = 180 - angle;
                return {
                    question: `What is the supplement of ${angle}°?`,
                    answer: `${supplement}°`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 10) + 5;
                const b = Math.floor(Math.random() * 10) + 5;
                const angle = Math.floor(Math.random() * 40) + 40;
                const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(angle * Math.PI / 180)).toFixed(2);
                return {
                    question: `Triangle sides a=${a}, b=${b}, angle C=${angle}°. Find side c using law of cosines.`,
                    answer: `${c} units`
                };
            }
        ];

        return problemTypes[Math.floor(Math.random() * problemTypes.length)]();
    }

    generateCalculusProblem() {
        const problems = [
            () => this.generateDerivativeProblem(),
            () => this.generateLimitProblem()
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateDerivativeProblem() {
        const functions = [
            { f: 'x²', df: '2x' },
            { f: 'x³', df: '3x²' },
            { f: '2x²', df: '4x' },
            { f: 'sin(x)', df: 'cos(x)' },
            { f: 'cos(x)', df: '-sin(x)' },
            { f: '3x⁴', df: '12x³' },
            { f: 'x⁵', df: '5x⁴' },
            { f: 'e^x', df: 'e^x' },
            { f: 'ln(x)', df: '1/x' },
            { f: '1/x', df: '-1/x²' },
            { f: '√x', df: '1/(2√x)' },
            { f: 'x² + 3x', df: '2x + 3' },
            { f: '4x³ - 2x', df: '12x² - 2' },
            { f: 'tan(x)', df: 'sec²(x)' },
            { f: 'sec(x)', df: 'sec(x)tan(x)' }
        ];
        const func = functions[Math.floor(Math.random() * functions.length)];
        return {
            question: `Find the derivative of f(x) = ${func.f}`,
            answer: `f'(x) = ${func.df}`
        };
    }

    generateLimitProblem() {
        const problemTypes = [
            () => {
                const a = Math.floor(Math.random() * 5) + 1;
                return {
                    question: `Find the limit as x approaches ${a} of (x² - ${a}²)/(x - ${a})`,
                    answer: `${2 * a}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 8) + 3;
                return {
                    question: `Evaluate: lim (x→∞) (${a}x + ${b})/x`,
                    answer: a
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `Find: lim (x→0) sin(${a}x)/(${a}x)`,
                    answer: 1
                };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 1;
                const b = Math.floor(Math.random() * 6) + 2;
                return {
                    question: `Evaluate: lim (x→${a}) (x² + ${b}x)`,
                    answer: a * a + b * a
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 1;
                return {
                    question: `Find: lim (x→${a}) (x³ - ${a}³)/(x - ${a})`,
                    answer: `${3 * a * a}`
                };
            },
            () => {
                return {
                    question: 'What is lim (x→0) (1 - cos(x))/x?',
                    answer: '0'
                };
            },
            () => {
                const c = Math.floor(Math.random() * 8) + 3;
                return {
                    question: `Evaluate: lim (x→∞) ${c}/x`,
                    answer: 0
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const b = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `Find: lim (x→∞) (${a}x² + ${b})/(x²)`,
                    answer: a
                };
            }
        ];
        return problemTypes[Math.floor(Math.random() * problemTypes.length)]();
    }

    generateStatisticsProblem(selectedTopics = 'all') {
        // Handle topic-specific statistics problems
        if (selectedTopics !== 'all' && selectedTopics.length > 0) {
            for (let topic of selectedTopics) {
                switch (topic) {
                    case 'picture-graphs':
                        return this.generatePictureGraphProblem();
                    case 'bar-graphs':
                        return this.generateBarGraphProblem();
                    case 'line-plots':
                        return this.generateLinePlotProblem();
                    case 'counting-principles':
                        return this.generateCountingPrinciplesProblem();
                    case 'mean-median-mode':
                        return this.generateMeanProblem();
                    case 'probability':
                        return this.generateProbabilityProblem();
                    default:
                        continue;
                }
            }
        }

        const problems = [
            () => this.generateMeanProblem(),
            () => this.generateProbabilityProblem()
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generatePictureGraphProblem() {
        const items = ['apples', 'books', 'cars', 'flowers', 'stars'];
        const item = items[Math.floor(Math.random() * items.length)];
        const categories = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const data = categories.map(() => Math.floor(Math.random() * 8) + 2);

        const problems = [
            {
                question: `A picture graph shows ${item} collected each day. Mon: ${data[0]}, Tue: ${data[1]}, Wed: ${data[2]}. How many ${item} were collected on Monday?`,
                answer: data[0]
            },
            {
                question: `In a picture graph, each symbol = 2 ${item}. If there are ${Math.floor(data[0] / 2)} symbols for Monday, how many ${item} does that represent?`,
                answer: data[0]
            }
        ];

        return problems[Math.floor(Math.random() * problems.length)];
    }

    generateBarGraphProblem() {
        const categories = ['Red', 'Blue', 'Green', 'Yellow'];
        const values = categories.map(() => Math.floor(Math.random() * 20) + 5);
        const maxIdx = values.indexOf(Math.max(...values));
        const minIdx = values.indexOf(Math.min(...values));

        const problems = [
            {
                question: `A bar graph shows favorite colors: Red=${values[0]}, Blue=${values[1]}, Green=${values[2]}, Yellow=${values[3]}. Which color is most popular?`,
                answer: categories[maxIdx]
            },
            {
                question: `According to the bar graph: Red=${values[0]}, Blue=${values[1]}, Green=${values[2]}, Yellow=${values[3]}. How many students chose Red?`,
                answer: values[0]
            },
            {
                question: `Bar graph data: Red=${values[0]}, Blue=${values[1]}, Green=${values[2]}, Yellow=${values[3]}. How many more students chose ${categories[maxIdx]} than ${categories[minIdx]}?`,
                answer: values[maxIdx] - values[minIdx]
            }
        ];

        return problems[Math.floor(Math.random() * problems.length)];
    }

    generateLinePlotProblem() {
        const data = Array.from({length: 10}, () => Math.floor(Math.random() * 6) + 1);
        const mode = data.sort((a, b) =>
            data.filter(v => v === a).length - data.filter(v => v === b).length
        ).pop();

        return {
            question: `A line plot shows the following data points: ${data.join(', ')}. What number appears most frequently?`,
            answer: mode
        };
    }

    generateCountingPrinciplesProblem() {
        const problems = [
            () => {
                const shirts = Math.floor(Math.random() * 4) + 3;
                const pants = Math.floor(Math.random() * 3) + 2;
                return {
                    question: `If you have ${shirts} shirts and ${pants} pairs of pants, how many different outfits can you make?`,
                    answer: shirts * pants
                };
            },
            () => {
                const choices1 = Math.floor(Math.random() * 4) + 2;
                const choices2 = Math.floor(Math.random() * 4) + 2;
                const choices3 = Math.floor(Math.random() * 3) + 2;
                return {
                    question: `A menu has ${choices1} appetizers, ${choices2} main courses, and ${choices3} desserts. How many different 3-course meals can you order?`,
                    answer: choices1 * choices2 * choices3
                };
            },
            () => {
                const n = Math.floor(Math.random() * 4) + 3;
                const factorial = (num) => num <= 1 ? 1 : num * factorial(num - 1);
                return {
                    question: `How many ways can you arrange ${n} books on a shelf? (Factorial)`,
                    answer: `${factorial(n)} ways`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateMeanProblem() {
        const problemTypes = [
            () => {
                const data = Array.from({length: 5}, () => Math.floor(Math.random() * 20) + 1);
                const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
                return {
                    question: `Find the mean of: ${data.join(', ')}`,
                    answer: Math.round(mean * 100) / 100
                };
            },
            () => {
                const data = Array.from({length: 6}, () => Math.floor(Math.random() * 30) + 10);
                data.sort((a, b) => a - b);
                const median = (data[2] + data[3]) / 2;
                return {
                    question: `Find the median of: ${data.join(', ')}`,
                    answer: median
                };
            },
            () => {
                const data = [5, 7, 3, 7, 9, 7, 11, 3, 7].map(n => n + Math.floor(Math.random() * 5));
                const mode = data.sort((a, b) =>
                    data.filter(v => v === b).length - data.filter(v => v === a).length
                )[0];
                return {
                    question: `Find the mode of: ${data.join(', ')}`,
                    answer: mode
                };
            },
            () => {
                const data = Array.from({length: 5}, () => Math.floor(Math.random() * 25) + 5);
                const range = Math.max(...data) - Math.min(...data);
                return {
                    question: `Find the range of: ${data.join(', ')}`,
                    answer: range
                };
            },
            () => {
                const data = Array.from({length: 7}, () => Math.floor(Math.random() * 15) + 5);
                const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
                const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
                const stdDev = Math.sqrt(variance);
                return {
                    question: `Find the standard deviation of: ${data.join(', ')} (round to 2 decimals)`,
                    answer: Math.round(stdDev * 100) / 100
                };
            },
            () => {
                const data = Array.from({length: 5}, () => Math.floor(Math.random() * 20) + 10);
                data.sort((a, b) => a - b);
                const q1 = data[1];
                const q3 = data[3];
                return {
                    question: `For the data set ${data.join(', ')}, find the first quartile (Q1)`,
                    answer: q1
                };
            },
            () => {
                const data = Array.from({length: 8}, () => Math.floor(Math.random() * 30) + 20);
                const sum = data.reduce((a, b) => a + b, 0);
                return {
                    question: `Find the sum of: ${data.join(', ')}`,
                    answer: sum
                };
            },
            () => {
                const scores = Array.from({length: 4}, () => Math.floor(Math.random() * 30) + 60);
                const mean = scores.reduce((sum, val) => sum + val, 0) / scores.length;
                return {
                    question: `A student scored ${scores.join(', ')} on four tests. What is the average score?`,
                    answer: Math.round(mean * 100) / 100
                };
            }
        ];
        return problemTypes[Math.floor(Math.random() * problemTypes.length)]();
    }

    generateProbabilityProblem() {
        const problemTypes = [
            () => {
                const total = Math.floor(Math.random() * 20) + 10;
                const favorable = Math.floor(Math.random() * total) + 1;
                return {
                    question: `If there are ${favorable} favorable outcomes out of ${total} total outcomes, what is the probability?`,
                    answer: `${favorable}/${total} = ${Math.round((favorable / total) * 100) / 100}`
                };
            },
            () => {
                const red = Math.floor(Math.random() * 8) + 3;
                const blue = Math.floor(Math.random() * 8) + 3;
                const total = red + blue;
                return {
                    question: `A bag contains ${red} red marbles and ${blue} blue marbles. What is the probability of drawing a red marble?`,
                    answer: `${red}/${total} = ${Math.round((red / total) * 100) / 100}`
                };
            },
            () => {
                const prob = Math.round(Math.random() * 6 + 1) / 10;
                const complement = 1 - prob;
                return {
                    question: `If the probability of rain is ${prob}, what is the probability it will NOT rain?`,
                    answer: Math.round(complement * 100) / 100
                };
            },
            () => {
                const sides = 6;
                return {
                    question: `What is the probability of rolling a 4 on a fair 6-sided die?`,
                    answer: `1/6 ≈ 0.167`
                };
            },
            () => {
                const prob1 = 0.5;
                const prob2 = 0.5;
                return {
                    question: `What is the probability of flipping heads twice in a row on a fair coin?`,
                    answer: `${prob1 * prob2} = 0.25 or 1/4`
                };
            },
            () => {
                const total = 52;
                const favorable = 13;
                return {
                    question: `What is the probability of drawing a heart from a standard deck of 52 cards?`,
                    answer: `${favorable}/${total} = 1/4 = 0.25`
                };
            },
            () => {
                const success = Math.floor(Math.random() * 5) + 2;
                const total = Math.floor(Math.random() * 10) + success + 3;
                return {
                    question: `In ${total} trials, an event occurred ${success} times. What is the experimental probability?`,
                    answer: `${success}/${total} = ${Math.round((success / total) * 100) / 100}`
                };
            },
            () => {
                return {
                    question: `If two events are independent with P(A) = 0.4 and P(B) = 0.5, what is P(A and B)?`,
                    answer: `0.4 × 0.5 = 0.2`
                };
            }
        ];
        return problemTypes[Math.floor(Math.random() * problemTypes.length)]();
    }

    // Word problem generation
    generateWordProblem(operation, subject = null) {
        // Use provided subject or get random one
        if (!subject) {
            subject = this.getRandomSubject();
        }

        let problem;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            // Subject-specific word problems
            switch (subject) {
                case 'algebra':
                    problem = this.generateAlgebraWordProblem();
                    break;
                case 'geometry':
                    problem = this.generateGeometryWordProblem();
                    break;
                case 'trigonometry':
                    problem = this.generateTrigWordProblem();
                    break;
                case 'calculus':
                    problem = this.generateCalculusWordProblem();
                    break;
                case 'statistics':
                    problem = this.generateStatisticsWordProblem();
                    break;
                case 'measurement':
                    problem = this.generateMeasurementWordProblem();
                    break;
                case 'precalculus':
                    problem = this.generatePrecalculusWordProblem();
                    break;
                case 'financialLiteracy':
                    // Financial literacy questions are written in context already.
                    problem = this.generateFinancialProblem();
                    break;
                default:
                    // For arithmetic, use standard word problems
                    problem = this.generateStandardWordProblem(operation);
            }
            attempts++;
        } while (this.usedProblems.has(problem.question) && attempts < maxAttempts);

        if (attempts < maxAttempts) {
            this.usedProblems.add(problem.question);
        }

        return problem;
    }

    generateMeasurementWordProblem() {
        // Measurement word problems use the same generators as equation mode
        return this.generateMeasurementProblem();
    }

    generatePrecalculusWordProblem() {
        // Precalculus word problems use the same generators as equation mode
        return this.generatePrecalculusProblem();
    }

    generateAlgebraWordProblem() {
        const scenarios = ['age problems', 'distance problems', 'work problems'];
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

        switch(scenario) {
            case 'age problems':
                const currentAge = Math.floor(Math.random() * 30) + 20;
                const yearsAgo = Math.floor(Math.random() * 10) + 5;
                const daughterAgeNow = Math.floor((currentAge - yearsAgo) / 3) + yearsAgo;
                return {
                    question: `John is currently ${currentAge} years old. ${yearsAgo} years ago, he was three times as old as his daughter was then. How old is his daughter now?`,
                    answer: `${daughterAgeNow} years old`
                };
            case 'distance problems':
                const speed = Math.floor(Math.random() * 50) + 30;
                const time = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `A car travels at ${speed} mph for ${time} hours. What is the total distance traveled?`,
                    answer: `${speed * time} miles`
                };
            default:
                return this.generateBasicWordProblem('mixed');
        }
    }

    generateGeometryWordProblem() {
        return this.generateAreaProblem();
    }

    generateTrigWordProblem() {
        const scenarios = [
            {
                question: `A ladder ${10 + Math.floor(Math.random() * 10)} feet long leans against a wall at an angle of ${30 + Math.floor(Math.random() * 30)} degrees. How high up the wall does the ladder reach?`,
                answer: 'Use sine function'
            },
            {
                question: `From a point ${50 + Math.floor(Math.random() * 50)} meters from the base of a building, the angle of elevation to the top is ${40 + Math.floor(Math.random() * 20)} degrees. Find the height of the building.`,
                answer: 'Use tangent function'
            }
        ];
        return scenarios[Math.floor(Math.random() * scenarios.length)];
    }

    generateCalculusWordProblem() {
        const scenarios = [
            {
                question: `The position of a particle is given by s(t) = ${Math.floor(Math.random() * 5) + 1}t² + ${Math.floor(Math.random() * 10)}t. Find the velocity at t = ${Math.floor(Math.random() * 5) + 1}.`,
                answer: 'Take derivative ds/dt'
            },
            {
                question: `Find the maximum value of f(x) = -x² + ${Math.floor(Math.random() * 10) + 2}x + ${Math.floor(Math.random() * 5)}.`,
                answer: 'Use first derivative test'
            }
        ];
        return scenarios[Math.floor(Math.random() * scenarios.length)];
    }

    generateStatisticsWordProblem() {
        const data = Array.from({length: 5}, () => Math.floor(Math.random() * 50) + 20);
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        return {
            question: `Given the data set: ${data.join(', ')}. Find the mean and standard deviation.`,
            answer: `Mean = ${Math.round(mean * 100) / 100}`
        };
    }

    /**
     * Draws a financial literacy problem, honouring the topics the user chose
     * and the parameters set on whichever topic is drawn.
     *
     * @param {string[]|'all'} [selectedTopics]
     */
    generateFinancialProblem(selectedTopics = 'all') {
        const available = Object.keys(FINANCIAL_PROBLEMS).filter((topicId) => {
            const topic = SUBJECT_TOPICS.financialLiteracy.topics[topicId];
            if (!topic?.grades.includes(this.config?.grade?.id)) return false;
            if (selectedTopics === 'all' || !selectedTopics?.length) return true;
            return selectedTopics.includes(topicId);
        });

        // Nothing chosen that this grade can offer: fall back to the whole strand.
        const topicId = randomChoice(available.length ? available : Object.keys(FINANCIAL_PROBLEMS));
        return randomChoice(FINANCIAL_PROBLEMS[topicId])(this.paramsFor(topicId));
    }

    generateStandardWordProblem(operation) {
        // Grades 1-8 draw from their own tables so contexts stay age-appropriate.
        const fromGrade = this.drawFromGradeTable(GRADE_WORD_PROBLEMS, operation);
        if (fromGrade) return fromGrade;

        const gradeId = this.config?.grade?.id;
        if (gradeId) {
            const gradeNum = gradeId.replace('grade', '');
            const gradeMethod = `generateGrade${gradeNum}WordProblem`;
            if (this[gradeMethod]) {
                return this[gradeMethod](operation);
            }
        }

        // Fallback to general word problems
        const problemTypes = ["basic", "sequence", "ageRelated", "workRate", "mixture", "brainTeaser"];
        const selectedType = problemTypes[Math.floor(Math.random() * problemTypes.length)];

        switch (selectedType) {
            case "basic":
                return this.generateBasicWordProblem(operation);
            case "sequence":
                return this.generateSequenceProblem();
            case "ageRelated":
                return this.generateAgeRelatedProblem();
            case "workRate":
                return this.generateWorkRateProblem();
            case "mixture":
                return this.generateMixtureProblem();
            case "brainTeaser":
                return this.generateBrainTeaser();
            default:
                return this.generateBasicWordProblem(operation);
        }
    }

    /**
     * Draws one contextual word problem for `operation` from the shared
     * template table. "mixed", and anything that is not one of the four
     * arithmetic operations, picks an operation at random.
     */
    generateBasicWordProblem(operation) {
        const templates = WORD_PROBLEM_TEMPLATES[operation]
            || WORD_PROBLEM_TEMPLATES[randomChoice(Object.keys(WORD_PROBLEM_TEMPLATES))];
        return randomChoice(templates)(CONTEXTUAL_DATA, this.config);
    }

    // Advanced problem types
    generateSequenceProblem() {
        const sequences = [
            {
                pattern: n => n * 2,
                description: "doubles",
                length: 4
            },
            {
                pattern: n => n + 3,
                description: "add 3 each time",
                length: 4
            },
            {
                pattern: n => n * n,
                description: "squares",
                length: 4
            }
        ];

        const selectedSequence = sequences[Math.floor(Math.random() * sequences.length)];
        const sequence = Array.from({length: selectedSequence.length}, (_, i) => selectedSequence.pattern(i + 1));

        const question = `What is the next number in this sequence: ${sequence.join(', ')}, ...?`;
        const answer = selectedSequence.pattern(selectedSequence.length + 1);

        return { question, answer };
    }

    generateAgeRelatedProblem() {
        const currentAge = Math.floor(Math.random() * 50) + 20;
        const yearsDiff = Math.floor(Math.random() * 20) + 5;

        const question = `Sarah is currently ${currentAge} years old. How old will she be in ${yearsDiff} years?`;
        const answer = currentAge + yearsDiff;

        return { question, answer };
    }

    generateWorkRateProblem() {
        const rate1 = Math.floor(Math.random() * 10) + 5;
        const rate2 = Math.floor(Math.random() * 10) + 5;
        const totalWork = Math.floor(Math.random() * 50) + 20;

        const question = `Alice can complete a job in ${rate1} hours, while Bob can complete it in ${rate2} hours. Working together, how many hours will it take to complete ${totalWork} such jobs?`;
        const combinedRate = 1/rate1 + 1/rate2;
        const answer = Math.round((totalWork / combinedRate) * 10) / 10;

        return { question, answer };
    }

    generateMixtureProblem() {
        const volume1 = Math.floor(Math.random() * 50) + 10;
        const concentration1 = Math.floor(Math.random() * 50) + 10;
        const volume2 = Math.floor(Math.random() * 50) + 10;
        const concentration2 = Math.floor(Math.random() * 50) + 10;

        const question = `Mix ${volume1} liters of ${concentration1}% solution with ${volume2} liters of ${concentration2}% solution. What is the concentration of the mixture?`;
        const totalVolume = volume1 + volume2;
        const totalSolute = (volume1 * concentration1 + volume2 * concentration2) / 100;
        const answer = Math.round((totalSolute / totalVolume) * 1000) / 10;

        return { question, answer: `${answer}%` };
    }

    generateBrainTeaser() {
        const brainTeasers = [
            {
                question: "I am an odd number. Take away one letter and I become even. What number am I?",
                answer: "Seven"
            },
            {
                question: "What has hands but can't clap?",
                answer: "A clock"
            },
            {
                question: "What gets bigger the more you take away?",
                answer: "A hole"
            },
            {
                question: "What can you catch, but not throw?",
                answer: "A cold"
            },
            {
                question: "What goes up but never comes down?",
                answer: "Your age"
            }
        ];

        return brainTeasers[Math.floor(Math.random() * brainTeasers.length)];
    }

    // PRECALCULUS PROBLEM GENERATORS
    generatePrecalculusProblem(selectedTopics = 'all') {
        const topics = selectedTopics !== 'all' && selectedTopics.length > 0
            ? selectedTopics
            : ['exponential-functions', 'logarithms', 'sequences-series', 'polynomial-functions'];

        const topic = Array.isArray(topics) ? topics[Math.floor(Math.random() * topics.length)] : topics;

        switch (topic) {
            case 'exponential-functions':
                return this.generateExponentialProblem();
            case 'logarithms':
                return this.generateLogarithmProblem();
            case 'sequences-series':
                return this.generateSequencesSeriesProblem();
            case 'polynomial-functions':
                return this.generatePolynomialProblem();
            case 'rational-functions':
                return this.generateRationalFunctionProblem();
            case 'conic-sections':
                return this.generateConicSectionProblem();
            case 'vectors-matrices':
                return this.generateVectorMatrixProblem();
            case 'complex-numbers':
                return this.generateComplexNumberProblem();
            default:
                return this.generateExponentialProblem();
        }
    }

    generateExponentialProblem() {
        const problems = [
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const b = Math.floor(Math.random() * 3) + 2;
                const x = Math.floor(Math.random() * 4) + 1;
                return {
                    question: `Evaluate: ${a} × ${b}^${x}`,
                    answer: a * Math.pow(b, x)
                };
            },
            () => {
                const initial = Math.floor(Math.random() * 500) + 100;
                const rate = (Math.floor(Math.random() * 15) + 5) / 100;
                const time = Math.floor(Math.random() * 5) + 1;
                return {
                    question: `A population of ${initial} grows at ${(rate * 100).toFixed(0)}% per year. What is the population after ${time} years? Use P = ${initial}(${(1 + rate).toFixed(2)})^t`,
                    answer: Math.round(initial * Math.pow(1 + rate, time))
                };
            },
            () => {
                const base = Math.floor(Math.random() * 3) + 2;
                const exp = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `Solve for x: ${base}^x = ${Math.pow(base, exp)}`,
                    answer: exp
                };
            },
            () => {
                const initial = Math.floor(Math.random() * 1000) + 500;
                const rate = (Math.floor(Math.random() * 20) + 10) / 100;
                const time = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `An investment of $${initial} decays at ${(rate * 100).toFixed(0)}% per year. Find the value after ${time} years.`,
                    answer: `$${Math.round(initial * Math.pow(1 - rate, time))}`
                };
            },
            () => {
                const base = 2;
                const exp1 = Math.floor(Math.random() * 4) + 2;
                const exp2 = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `Simplify: ${base}^${exp1} × ${base}^${exp2}`,
                    answer: `${base}^${exp1 + exp2}`
                };
            },
            () => {
                return {
                    question: 'What is the value of e^0?',
                    answer: 1
                };
            },
            () => {
                const principal = Math.floor(Math.random() * 5000) + 1000;
                const rate = 0.05;
                const time = Math.floor(Math.random() * 5) + 1;
                return {
                    question: `Find the compound interest on $${principal} at 5% annually for ${time} years.`,
                    answer: `$${Math.round(principal * Math.pow(1 + rate, time) - principal)}`
                };
            },
            () => {
                const half_life = Math.floor(Math.random() * 10) + 5;
                const initial = Math.floor(Math.random() * 50) + 50;
                return {
                    question: `A substance has a half-life of ${half_life} years. If you start with ${initial}g, how much remains after ${half_life} years?`,
                    answer: `${initial / 2}g`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateLogarithmProblem() {
        const problems = [
            () => {
                const base = [2, 3, 10][Math.floor(Math.random() * 3)];
                const exp = Math.floor(Math.random() * 4) + 1;
                const value = Math.pow(base, exp);
                return {
                    question: `log₁₀(${value}) = `,
                    answer: `log₁₀(${value})`
                };
            },
            () => {
                const base = Math.floor(Math.random() * 3) + 2;
                const exp = Math.floor(Math.random() * 4) + 2;
                const value = Math.pow(base, exp);
                return {
                    question: `If ${base}^x = ${value}, find x`,
                    answer: exp
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const b = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `Expand: log(${a} × ${b})`,
                    answer: `log(${a}) + log(${b})`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `Expand: log(${a}/${b})`,
                    answer: `log(${a}) - log(${b})`
                };
            },
            () => {
                const base = Math.floor(Math.random() * 3) + 2;
                const exp = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `Expand: log(${base}^${exp})`,
                    answer: `${exp}log(${base})`
                };
            },
            () => {
                return {
                    question: 'What is ln(e)?',
                    answer: 1
                };
            },
            () => {
                return {
                    question: 'Evaluate: log₁₀(1000)',
                    answer: 3
                };
            },
            () => {
                return {
                    question: 'Evaluate: log₂(8)',
                    answer: 3
                };
            },
            () => {
                const base = 10;
                return {
                    question: 'What is log₁₀(1)?',
                    answer: 0
                };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `Simplify: log(${a}) + log(${a})`,
                    answer: `log(${a * a})`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateSequencesSeriesProblem() {
        const problems = [
            () => {
                const a = Math.floor(Math.random() * 10) + 1;
                const d = Math.floor(Math.random() * 5) + 1;
                const n = Math.floor(Math.random() * 8) + 3;
                const term = a + (n - 1) * d;
                return {
                    question: `In an arithmetic sequence, a₁ = ${a} and d = ${d}. Find the ${n}th term.`,
                    answer: term
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const r = Math.floor(Math.random() * 3) + 2;
                const n = Math.floor(Math.random() * 4) + 3;
                const term = a * Math.pow(r, n - 1);
                return {
                    question: `In a geometric sequence, a₁ = ${a} and r = ${r}. Find the ${n}th term.`,
                    answer: term
                };
            },
            () => {
                const n = Math.floor(Math.random() * 8) + 3;
                const sum = (n * (n + 1)) / 2;
                return {
                    question: `Find the sum of the first ${n} positive integers: 1 + 2 + 3 + ... + ${n}`,
                    answer: sum
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const d = Math.floor(Math.random() * 6) + 2;
                const n = Math.floor(Math.random() * 7) + 4;
                const sum = (n / 2) * (2 * a + (n - 1) * d);
                return {
                    question: `Arithmetic series: a₁ = ${a}, d = ${d}. Find sum of first ${n} terms.`,
                    answer: Math.round(sum)
                };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 2;
                const r = (Math.floor(Math.random() * 3) + 2) / 10;
                const n = Math.floor(Math.random() * 5) + 4;
                const sum = a * (1 - Math.pow(r, n)) / (1 - r);
                return {
                    question: `Geometric series: a₁ = ${a}, r = ${r}. Find sum of first ${n} terms.`,
                    answer: Math.round(sum * 100) / 100
                };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 3;
                const term5 = a + 4 * Math.floor(Math.random() * 4 + 2);
                const d = (term5 - a) / 4;
                return {
                    question: `Arithmetic sequence: a₁ = ${a}, a₅ = ${term5}. Find common difference d.`,
                    answer: d
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const r = (Math.floor(Math.random() * 8) + 2) / 10;
                const sum = a / (1 - r);
                return {
                    question: `Infinite geometric series: a = ${a}, r = ${r}. Find sum (|r| < 1).`,
                    answer: Math.round(sum * 100) / 100
                };
            },
            () => {
                const a = Math.floor(Math.random() * 7) + 4;
                const d = Math.floor(Math.random() * 5) + 2;
                const n = Math.floor(Math.random() * 6) + 5;
                const term = a + (n - 1) * d;
                return {
                    question: `Sequence: ${a}, ${a + d}, ${a + 2 * d}, ... Find the ${n}th term.`,
                    answer: term
                };
            },
            () => {
                const n = Math.floor(Math.random() * 6) + 5;
                const sumSquares = (n * (n + 1) * (2 * n + 1)) / 6;
                return {
                    question: `Find: 1² + 2² + 3² + ... + ${n}²`,
                    answer: sumSquares
                };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 2;
                const r = Math.floor(Math.random() * 3) + 2;
                const n = Math.floor(Math.random() * 4) + 4;
                const term = a * Math.pow(r, n - 1);
                return {
                    question: `Geometric sequence ${a}, ${a * r}, ${a * r * r}, ... Find term ${n}.`,
                    answer: term
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generatePolynomialProblem() {
        const problems = [
            () => {
                const a = Math.floor(Math.random() * 5) + 1;
                const b = Math.floor(Math.random() * 10) - 5;
                const c = Math.floor(Math.random() * 10) - 5;
                const x = Math.floor(Math.random() * 5) + 1;
                const result = a * x * x + b * x + c;
                return {
                    question: `Evaluate f(x) = ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} when x = ${x}`,
                    answer: result
                };
            },
            () => {
                const a = Math.floor(Math.random() * 3) + 1;
                const b = Math.floor(Math.random() * 3) + 1;
                return {
                    question: `What is the degree of the polynomial ${a}x⁴ + ${b}x² + 1?`,
                    answer: 4
                };
            },
            () => {
                const roots = [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1];
                return {
                    question: `A quadratic function has roots at x = ${roots[0]} and x = ${roots[1]}. What is a possible equation?`,
                    answer: `(x - ${roots[0]})(x - ${roots[1]}) = 0`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 1;
                const b = Math.floor(Math.random() * 8) - 4;
                const c = Math.floor(Math.random() * 8) - 4;
                const d = Math.floor(Math.random() * 8) - 4;
                const x = Math.floor(Math.random() * 3) + 1;
                const result = a * x * x * x + b * x * x + c * x + d;
                return {
                    question: `Find f(${x}) for f(x) = ${a}x³ ${b >= 0 ? '+' : ''}${b}x² ${c >= 0 ? '+' : ''}${c}x ${d >= 0 ? '+' : ''}${d}`,
                    answer: result
                };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 2;
                const b = Math.floor(Math.random() * 6) - 3;
                return {
                    question: `What is the leading coefficient of ${a}x³ ${b >= 0 ? '+' : ''}${b}x² + 5?`,
                    answer: a
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 1;
                const root = Math.floor(Math.random() * 6) + 2;
                return {
                    question: `If (x - ${root}) is a factor of ${a}x² + bx + c, then x = ${root} is a ___?`,
                    answer: 'root or zero'
                };
            },
            () => {
                const coeff = Math.floor(Math.random() * 4) + 2;
                const degree = Math.floor(Math.random() * 3) + 3;
                return {
                    question: `How many zeros does f(x) = ${coeff}x^${degree} have (counting multiplicities)?`,
                    answer: `at most ${degree}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 1;
                const h = Math.floor(Math.random() * 6) - 3;
                const k = Math.floor(Math.random() * 8) - 4;
                return {
                    question: `Vertex form: f(x) = ${a}(x ${h >= 0 ? '-' : '+'}${Math.abs(h)})² ${k >= 0 ? '+' : ''}${k}. What is the vertex?`,
                    answer: `(${h}, ${k})`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 6) + 2;
                const c = Math.floor(Math.random() * 8) - 4;
                const discriminant = b * b - 4 * a * c;
                return {
                    question: `Find discriminant of ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c}`,
                    answer: discriminant
                };
            },
            () => {
                const a = Math.floor(Math.random() * 4) + 1;
                const b = -2 * a * Math.floor(Math.random() * 5 + 2);
                const vertex_x = -b / (2 * a);
                return {
                    question: `Find x-coordinate of vertex for f(x) = ${a}x² ${b >= 0 ? '+' : ''}${b}x + 10 using x = -b/(2a)`,
                    answer: vertex_x
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateRationalFunctionProblem() {
        const problems = [
            () => {
                const a = Math.floor(Math.random() * 5) + 1;
                return {
                    question: `What is the vertical asymptote of f(x) = 1/(x - ${a})?`,
                    answer: `x = ${a}`
                };
            },
            () => {
                const numerator = Math.floor(Math.random() * 5) + 2;
                const denominator = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `Simplify: (${numerator}x²)/(${denominator}x)`,
                    answer: `${numerator}x/${denominator}`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateConicSectionProblem() {
        const problems = [
            () => {
                const r = Math.floor(Math.random() * 8) + 2;
                return {
                    question: `What is the radius of the circle x² + y² = ${r * r}?`,
                    answer: r
                };
            },
            () => {
                const h = Math.floor(Math.random() * 5) + 1;
                const k = Math.floor(Math.random() * 5) + 1;
                const r = Math.floor(Math.random() * 5) + 2;
                return {
                    question: `What is the center of the circle (x - ${h})² + (y - ${k})² = ${r * r}?`,
                    answer: `(${h}, ${k})`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateVectorMatrixProblem() {
        const problems = [
            () => {
                const v1 = [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1];
                const v2 = [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1];
                return {
                    question: `Add vectors: <${v1[0]}, ${v1[1]}> + <${v2[0]}, ${v2[1]}> = `,
                    answer: `<${v1[0] + v2[0]}, ${v1[1] + v2[1]}>`
                };
            },
            () => {
                const scalar = Math.floor(Math.random() * 5) + 2;
                const v = [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1];
                return {
                    question: `Multiply: ${scalar} × <${v[0]}, ${v[1]}> = `,
                    answer: `<${scalar * v[0]}, ${scalar * v[1]}>`
                };
            },
            () => {
                const v = [Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1];
                const magnitude = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
                return {
                    question: `Find the magnitude of vector <${v[0]}, ${v[1]}>`,
                    answer: magnitude.toFixed(2)
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    generateComplexNumberProblem() {
        const problems = [
            () => {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                const c = Math.floor(Math.random() * 10) + 1;
                const d = Math.floor(Math.random() * 10) + 1;
                return {
                    question: `Add: (${a} + ${b}i) + (${c} + ${d}i) = `,
                    answer: `${a + c} + ${b + d}i`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 8) + 2;
                return {
                    question: `Multiply: ${a}i × ${b}i = `,
                    answer: `-${a * b}`
                };
            },
            () => {
                const a = Math.floor(Math.random() * 6) + 1;
                const b = Math.floor(Math.random() * 6) + 1;
                return {
                    question: `What is the complex conjugate of ${a} + ${b}i?`,
                    answer: `${a} - ${b}i`
                };
            }
        ];
        return problems[Math.floor(Math.random() * problems.length)]();
    }

    // Uniqueness checking
    checkSimilarity(question1, question2) {
        const words1 = question1.toLowerCase().split(/\s+/);
        const words2 = question2.toLowerCase().split(/\s+/);

        const commonWords = words1.filter(word => words2.includes(word)).length;
        const totalWords = Math.max(words1.length, words2.length);

        return commonWords / totalWords;
    }

    generateUniqueProblem(operation, problemType, selectedTopics = 'all', maxAttempts = 100) {
        let problem;
        let attempts = 0;
        let isUnique = false;

        do {
            problem = this.generateProblem(operation, problemType, selectedTopics);

            // Normalize the question for better duplicate detection
            const normalizedQuestion = problem.question.trim().toLowerCase();

            // First check for exact duplicates
            if (this.usedProblems.has(normalizedQuestion)) {
                isUnique = false;
                attempts++;
                continue;
            }

            // Then check for similarity
            isUnique = true;
            for (let existingProblem of this.usedProblems) {
                if (this.checkSimilarity(normalizedQuestion, existingProblem) > this.uniquenessThreshold) {
                    isUnique = false;
                    break;
                }
            }

            attempts++;
        } while (!isUnique && attempts < maxAttempts);

        if (isUnique) {
            // Store normalized version to catch exact duplicates faster
            this.usedProblems.add(problem.question.trim().toLowerCase());
        } else {
            // If we couldn't find a unique problem after max attempts, log a warning
            console.warn(`Could not generate unique problem after ${maxAttempts} attempts. Question: ${problem.question}`);
        }

        return problem;
    }

    clearUsedProblems() {
        this.usedProblems.clear();
        this.usedCombinations.clear();
        this.contextHistory.clear();
        this.numberHistory.clear();
        this.scenarioHistory.clear();
        this.generationCache.clear();
    }

    // ========== GRADES 9-12: Route to algebra, geometry, trigonometry, calculus ==========
    // For high school, we use existing subject-based generators rather than grade-specific arithmetic
    generateGrade9Arithmetic(operation) {
        // Grade 9 (Algebra I) - use algebra generators
        return this.generateAlgebraEquation(operation);
    }

    generateGrade10Arithmetic(operation) {
        // Grade 10 (Geometry) - use geometry generators
        return this.generateGeometryProblem();
    }

    generateGrade11Arithmetic(operation) {
        // Grade 11 (Algebra II) - use advanced algebra generators
        return this.generateAlgebraEquation(operation);
    }

    generateGrade12Arithmetic(operation) {
        // Grade 12 (Pre-Calculus/Calculus) - use calculus/precalculus generators
        const subjects = ['precalculus', 'calculus', 'trigonometry'];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];

        if (subject === 'precalculus') {
            return this.generatePrecalculusProblem();
        } else if (subject === 'calculus') {
            return this.generateCalculusProblem();
        } else {
            return this.generateTrigProblem();
        }
    }

    // ========== GRADES 9-12: Use subject-specific word problems ==========
    generateGrade9WordProblem(operation) {
        // Algebra I - linear equations, systems
        const scenarios = [
            () => {
                const speed1 = Math.floor(Math.random() * 30) + 40;
                const speed2 = Math.floor(Math.random() * 30) + 40;
                const distance = Math.floor(Math.random() * 200) + 150;
                return { question: `Two cars start from the same point traveling in opposite directions. One travels at ${speed1} mph and the other at ${speed2} mph. How long until they are ${distance} miles apart?`, answer: `${(distance / (speed1 + speed2)).toFixed(2)} hours` };
            },
            () => {
                const coeff = Math.floor(Math.random() * 8) + 3;
                const const1 = Math.floor(Math.random() * 20) + 10;
                const result = Math.floor(Math.random() * 100) + 50;
                return { question: `Solve for x: ${coeff}x + ${const1} = ${result}`, answer: `x = ${((result - const1) / coeff).toFixed(2)}` };
            },
            () => {
                const cost = Math.floor(Math.random() * 30) + 20;
                const perItem = Math.floor(Math.random() * 5) + 2;
                return { question: `A phone plan costs $${cost} per month plus $${perItem} per GB of data. Write an equation for the total cost C in terms of data usage d GB.`, answer: `C = ${cost} + ${perItem}d` };
            }
        ];
        return scenarios[Math.floor(Math.random() * scenarios.length)]();
    }

    generateGrade10WordProblem(operation) {
        // Geometry - use geometry word problems
        return this.generateGeometryWordProblem();
    }

    generateGrade11WordProblem(operation) {
        // Algebra II - quadratics, exponentials
        const scenarios = [
            () => {
                const a = Math.floor(Math.random() * 3) + 1;
                const b = Math.floor(Math.random() * 10) + 5;
                const c = Math.floor(Math.random() * 20) + 10;
                return { question: `A ball is thrown upward with an initial velocity. Its height h(t) = -${a}t² + ${b}t + ${c}. Find the maximum height.`, answer: `Use vertex formula: h = ${c + (b * b) / (4 * a)} feet` };
            },
            () => {
                const principal = Math.floor(Math.random() * 5000) + 5000;
                const rate = Math.floor(Math.random() * 5) + 3;
                const time = Math.floor(Math.random() * 8) + 5;
                return { question: `$${principal} is invested at ${rate}% annual interest compounded annually. What is the value after ${time} years?`, answer: `$${(principal * Math.pow(1 + rate / 100, time)).toFixed(2)}` };
            },
            () => {
                const base = Math.floor(Math.random() * 5) + 2;
                const growth = Math.floor(Math.random() * 30) + 10;
                const time = Math.floor(Math.random() * 6) + 3;
                return { question: `A population grows at ${growth}% per year. Starting with ${base * 1000} individuals, estimate the population after ${time} years.`, answer: `${Math.round(base * 1000 * Math.pow(1 + growth / 100, time))} individuals` };
            }
        ];
        return scenarios[Math.floor(Math.random() * scenarios.length)]();
    }

    generateGrade12WordProblem(operation) {
        // Pre-Calculus / Calculus - use advanced word problems
        const type = Math.random();
        if (type < 0.33) {
            return this.generatePrecalculusWordProblem();
        } else if (type < 0.67) {
            return this.generateCalculusWordProblem();
        } else {
            return this.generateTrigWordProblem();
        }
    }
}
