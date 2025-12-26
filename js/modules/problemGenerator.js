/**
 * Problem Generator Module
 * Core engine for generating math problems across all subjects and difficulty levels
 * @module problemGenerator
 */

import { randomChoice } from './utils.js';
import { GRADE_CONFIGS, DIFFICULTY_MULTIPLIERS, CONTEXTUAL_DATA } from './constants.js';

export class ProblemGenerator {
    constructor() {
        this.usedProblems = new Set();
        this.usedCombinations = new Map();
        this.contextHistory = new Map();
        this.numberHistory = new Map();
        this.scenarioHistory = new Map();
        this.config = null;
        this.generationCache = new Map();
        this.uniquenessThreshold = 0.7; // 70% similarity threshold
    }

    setConfig(gradeLevel, difficulty, subject) {
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

        // Get the numeric multiplier value from the difficulty config object
        const difficultyValue = DIFFICULTY_MULTIPLIERS[difficulty]?.value || 1.0;

        this.config = {
            grade: GRADE_CONFIGS[gradeLevel],
            difficulty: difficultyValue,
            subject: subject,
            maxNumber: Math.floor(GRADE_CONFIGS[gradeLevel].maxNumber * difficultyValue)
        };

        console.log('Problem generator configured:', {
            gradeLevel,
            difficulty,
            difficultyValue,
            subject,
            maxNumber: this.config.maxNumber
        });
    }

    generateProblem(operation, problemType, selectedTopics = 'all') {
        // Smart conflict resolution: Topics take priority over Problem Type for arithmetic
        if (this.config.subject === 'arithmetic' && selectedTopics !== 'all' && selectedTopics.length > 0) {
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

        operation = this.validateOperationForSubject(operation);

        if (problemType === 'equations') {
            return this.generateEquation(operation, selectedTopics);
        } else {
            return this.generateWordProblem(operation);
        }
    }

    validateOperationForSubject(operation) {
        switch (this.config.subject) {
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
            case 'arithmetic':
            default:
                return operation;
        }
    }

    generateEquation(operation, selectedTopics = 'all') {
        if (this.config.subject === 'algebra') {
            return this.generateAlgebraEquation(operation, selectedTopics);
        } else if (this.config.subject === 'geometry') {
            return this.generateGeometryProblem(selectedTopics);
        } else if (this.config.subject === 'trigonometry') {
            return this.generateTrigProblem(selectedTopics);
        } else if (this.config.subject === 'calculus') {
            return this.generateCalculusProblem(selectedTopics);
        } else if (this.config.subject === 'statistics') {
            return this.generateStatisticsProblem(selectedTopics);
        } else if (this.config.subject === 'measurement') {
            return this.generateMeasurementProblem(selectedTopics);
        } else if (this.config.subject === 'precalculus') {
            return this.generatePrecalculusProblem(selectedTopics);
        } else {
            return this.generateArithmeticEquation(operation, selectedTopics);
        }
    }

    generateArithmeticEquation(operation, selectedTopics = 'all') {
        if (selectedTopics !== 'all' && selectedTopics.length > 0) {
            return this.generateTopicSpecificEquation(operation, selectedTopics);
        }

        let question = "";
        let answer = 0;
        let num1, num2;
        const maxNum = this.config?.maxNumber || 100; // Default to 100 if config not set

        switch(operation) {
            case "addition":
                num1 = Math.floor(Math.random() * maxNum) + 1;
                num2 = Math.floor(Math.random() * maxNum) + 1;
                question = `${num1} + ${num2} = `;
                answer = num1 + num2;
                break;
            case "subtraction":
                num1 = Math.floor(Math.random() * maxNum) + 1;
                num2 = Math.floor(Math.random() * num1) + 1;
                question = `${num1} - ${num2} = `;
                answer = num1 - num2;
                break;
            case "multiplication":
                const multMax = Math.min(maxNum / 10, 100);
                num1 = Math.floor(Math.random() * multMax) + 1;
                num2 = Math.floor(Math.random() * multMax) + 1;
                question = `${num1} × ${num2} = `;
                answer = num1 * num2;
                break;
            case "division":
                const divMax = Math.min(maxNum / 5, 50);
                num2 = Math.floor(Math.random() * divMax) + 1;
                answer = Math.floor(Math.random() * divMax) + 1;
                num1 = num2 * answer;
                question = `${num1} ÷ ${num2} = `;
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
        const denominators = [2, 3, 4, 5, 6, 8, 10, 12];
        let question = "";
        let answer = 0;

        switch (operation) {
            case "addition":
                const denom1 = denominators[Math.floor(Math.random() * denominators.length)];
                const denom2 = denominators[Math.floor(Math.random() * denominators.length)];
                const num1 = Math.floor(Math.random() * denom1) + 1;
                const num2 = Math.floor(Math.random() * denom2) + 1;

                if (denom1 === denom2) {
                    question = `${num1}/${denom1} + ${num2}/${denom2} = `;
                    answer = `${num1 + num2}/${denom1}`;
                } else {
                    question = `${num1}/${denom1} + ${num2}/${denom2} = `;
                    const commonDenom = denom1 * denom2;
                    const newNum1 = num1 * denom2;
                    const newNum2 = num2 * denom1;
                    answer = `${newNum1 + newNum2}/${commonDenom}`;
                }
                break;
            case "subtraction":
                const d1 = denominators[Math.floor(Math.random() * denominators.length)];
                const n1 = Math.floor(Math.random() * d1) + 2;
                const n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
                question = `${n1}/${d1} - ${n2}/${d1} = `;
                answer = `${n1 - n2}/${d1}`;
                break;
            case "multiplication":
                const d = denominators[Math.floor(Math.random() * denominators.length)];
                const n = Math.floor(Math.random() * d) + 1;
                const whole = Math.floor(Math.random() * 10) + 1;
                question = `${n}/${d} × ${whole} = `;
                answer = `${n * whole}/${d}`;
                break;
            default:
                return this.generateArithmeticEquation(operation, 'all');
        }

        return { question, answer };
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
                const a = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 6) + 2;
                const c = Math.floor(Math.random() * 10) + 5;
                return {
                    question: `Solve the proportion: ${a}/${b} = x/${c}`,
                    answer: `x = ${(a * c / b).toFixed(2)}`
                };
            },
            () => {
                const miles = Math.floor(Math.random() * 200) + 100;
                const hours = Math.floor(Math.random() * 4) + 2;
                return {
                    question: `A car travels ${miles} miles in ${hours} hours. What is the unit rate (miles per hour)?`,
                    answer: `${Math.round(miles / hours)} mph`
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
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 20) - 10;
        const c = Math.floor(Math.random() * 50) + 1;
        const answer = Math.round((c - b) / a * 100) / 100;
        return {
            question: `Solve for x: ${a}x ${b >= 0 ? '+' : ''}${b} = ${c}`,
            answer: `x = ${answer}`
        };
    }

    generateQuadraticExpansion() {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 10) - 5;
        const question = `Expand: (x + ${a})(x ${b >= 0 ? '+' : ''}${b})`;
        const answer = `x² ${(a + b) >= 0 ? '+' : ''}${a + b}x ${(a * b) >= 0 ? '+' : ''}${a * b}`;
        return { question, answer };
    }

    generateFactoring() {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        const expanded = a * b;
        const sum = a + b;
        const question = `Factor: x² ${sum >= 0 ? '+' : ''}${sum}x ${expanded >= 0 ? '+' : ''}${expanded}`;
        const answer = `(x ${a >= 0 ? '+' : ''}${a})(x ${b >= 0 ? '+' : ''}${b})`;
        return { question, answer };
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
        const shapes = ['rectangle', 'triangle', 'circle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        switch(shape) {
            case 'rectangle':
                const length = Math.floor(Math.random() * 20) + 5;
                const width = Math.floor(Math.random() * 15) + 3;
                return {
                    question: `Find the area of a rectangle with length ${length} units and width ${width} units.`,
                    answer: `${length * width} square units`
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
        const length = Math.floor(Math.random() * 20) + 5;
        const width = Math.floor(Math.random() * 15) + 3;
        return {
            question: `Find the perimeter of a rectangle with length ${length} units and width ${width} units.`,
            answer: `${2 * (length + width)} units`
        };
    }

    generatePythagoreanProblem() {
        const a = Math.floor(Math.random() * 10) + 3;
        const b = Math.floor(Math.random() * 10) + 4;
        const c = Math.round(Math.sqrt(a * a + b * b) * 100) / 100;
        return {
            question: `In a right triangle, if one leg is ${a} units and the other leg is ${b} units, find the hypotenuse.`,
            answer: `${c} units`
        };
    }

    generateTrigProblem() {
        const angle = [30, 45, 60][Math.floor(Math.random() * 3)];
        const functions = ['sin', 'cos', 'tan'];
        const func = functions[Math.floor(Math.random() * functions.length)];

        const values = {
            sin: { 30: '1/2', 45: '√2/2', 60: '√3/2' },
            cos: { 30: '√3/2', 45: '√2/2', 60: '1/2' },
            tan: { 30: '√3/3', 45: '1', 60: '√3' }
        };

        return {
            question: `Find ${func}(${angle}°)`,
            answer: values[func][angle]
        };
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
            { f: 'cos(x)', df: '-sin(x)' }
        ];
        const func = functions[Math.floor(Math.random() * functions.length)];
        return {
            question: `Find the derivative of f(x) = ${func.f}`,
            answer: `f'(x) = ${func.df}`
        };
    }

    generateLimitProblem() {
        const a = Math.floor(Math.random() * 5) + 1;
        return {
            question: `Find the limit as x approaches ${a} of (x² - ${a}²)/(x - ${a})`,
            answer: `${2 * a}`
        };
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
        const data = Array.from({length: 5}, () => Math.floor(Math.random() * 20) + 1);
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        return {
            question: `Find the mean of: ${data.join(', ')}`,
            answer: Math.round(mean * 100) / 100
        };
    }

    generateProbabilityProblem() {
        const total = Math.floor(Math.random() * 20) + 10;
        const favorable = Math.floor(Math.random() * total) + 1;
        return {
            question: `If there are ${favorable} favorable outcomes out of ${total} total outcomes, what is the probability?`,
            answer: `${favorable}/${total} = ${Math.round((favorable / total) * 100) / 100}`
        };
    }

    // Word problem generation
    generateWordProblem(operation) {
        let problem;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            // Subject-specific word problems
            switch (this.config.subject) {
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

    generateStandardWordProblem(operation) {
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

    generateBasicWordProblem(operation) {
        const contexts = CONTEXTUAL_DATA;

        switch (operation) {
            case "addition":
                return this.generateAdditionProblem(contexts);
            case "subtraction":
                return this.generateSubtractionProblem(contexts);
            case "multiplication":
                return this.generateMultiplicationProblem(contexts);
            case "division":
                return this.generateDivisionProblem(contexts);
            case "mixed":
                const operations = ["addition", "subtraction", "multiplication", "division"];
                return this.generateBasicWordProblem(operations[Math.floor(Math.random() * operations.length)]);
            default:
                // Handle unknown operations (like 'geometric', 'algebraic', etc.) by defaulting to random operation
                console.warn(`Unknown operation '${operation}' in generateBasicWordProblem, defaulting to random`);
                const fallbackOps = ["addition", "subtraction", "multiplication", "division"];
                return this.generateBasicWordProblem(fallbackOps[Math.floor(Math.random() * fallbackOps.length)]);
        }
    }

    // Addition word problem templates
    generateAdditionProblem(contexts) {
        const templates = [
            this.additionTemplate1,
            this.additionTemplate2,
            this.additionTemplate3,
            this.additionTemplate4,
            this.additionTemplate5,
            this.additionTemplate6,
            this.additionTemplate7,
            this.additionTemplate8
        ];

        const template = templates[Math.floor(Math.random() * templates.length)];
        return template.call(this, contexts);
    }

    additionTemplate1(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const action = randomChoice(contexts.actions.addition);
        const maxNum = Math.min(this.config.maxNumber, 500);

        const num1 = Math.floor(Math.random() * maxNum) + 10;
        const num2 = Math.floor(Math.random() * maxNum) + 5;

        return {
            question: `${name} had ${num1} ${items} in their collection. Last week, they ${action} ${num2} more ${items}. How many ${items} does ${name} have now?`,
            answer: num1 + num2
        };
    }

    additionTemplate2(contexts) {
        const name = randomChoice(contexts.names);
        const place = randomChoice(contexts.places);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 300);

        const num1 = Math.floor(Math.random() * maxNum) + 15;
        const num2 = Math.floor(Math.random() * maxNum) + 8;

        return {
            question: `At the ${place}, ${name} counted ${num1} ${items} in the morning. By afternoon, ${num2} more ${items} had arrived. What is the total number of ${items} now?`,
            answer: num1 + num2
        };
    }

    additionTemplate3(contexts) {
        const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 400);

        const num1 = Math.floor(Math.random() * maxNum) + 12;
        const num2 = Math.floor(Math.random() * maxNum) + 8;

        return {
            question: `${names[0]} has ${num1} ${items} and ${names[1]} has ${num2} ${items}. If they combine their ${items} together, how many will they have in total?`,
            answer: num1 + num2
        };
    }

    additionTemplate4(contexts) {
        const name = randomChoice(contexts.names);
        const profession = randomChoice(contexts.professions);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const timeframe = randomChoice(contexts.timeframes);
        const maxNum = Math.min(this.config.maxNumber, 200);

        const num1 = Math.floor(Math.random() * maxNum) + 8;
        const num2 = Math.floor(Math.random() * maxNum) + 6;

        return {
            question: `${name} is a ${profession} who creates ${num1} ${items} ${timeframe}. This week, they made an extra ${num2} ${items} for a special project. How many ${items} did they create this week in total?`,
            answer: num1 + num2
        };
    }

    additionTemplate5(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const measurement = randomChoice(contexts.measurements);
        const maxNum = Math.min(this.config.maxNumber, 150);

        const num1 = Math.floor(Math.random() * maxNum) + 20;
        const num2 = Math.floor(Math.random() * maxNum) + 15;

        return {
            question: `${name} weighed their collection of ${items} and found it was ${num1} ${measurement}. After adding more ${items}, the collection now weighs ${num1 + num2} ${measurement}. How many ${measurement} of ${items} did ${name} add?`,
            answer: num2
        };
    }

    additionTemplate6(contexts) {
        const name = randomChoice(contexts.names);
        const place1 = randomChoice(contexts.places);
        const place2 = randomChoice(contexts.places);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 250);

        const num1 = Math.floor(Math.random() * maxNum) + 18;
        const num2 = Math.floor(Math.random() * maxNum) + 12;

        return {
            question: `${name} visited two locations today. At the ${place1}, they saw ${num1} ${items}. At the ${place2}, they counted ${num2} ${items}. How many ${items} did ${name} see in total during their visits?`,
            answer: num1 + num2
        };
    }

    additionTemplate7(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const action = randomChoice(contexts.actions.addition);
        const maxNum = Math.min(this.config.maxNumber, 180);

        const num1 = Math.floor(Math.random() * maxNum) + 25;
        const num2 = Math.floor(Math.random() * maxNum) + 18;
        const num3 = Math.floor(Math.random() * maxNum) + 10;

        return {
            question: `${name} started the month with ${num1} ${items}. In the first week, they ${action} ${num2} more. In the second week, they got ${num3} additional ${items}. How many ${items} does ${name} have now?`,
            answer: num1 + num2 + num3
        };
    }

    additionTemplate8(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const profession = randomChoice(contexts.professions);
        const maxNum = Math.min(this.config.maxNumber, 120);

        const num1 = Math.floor(Math.random() * maxNum) + 30;
        const num2 = Math.floor(Math.random() * maxNum) + 20;

        return {
            question: `${name}, who works as a ${profession}, needs ${items} for a project. They already have ${num1} ${items} and their colleague brought ${num2} more. What is the total number of ${items} available for the project?`,
            answer: num1 + num2
        };
    }

    // Subtraction word problem templates
    generateSubtractionProblem(contexts) {
        const templates = [
            this.subtractionTemplate1,
            this.subtractionTemplate2,
            this.subtractionTemplate3,
            this.subtractionTemplate4,
            this.subtractionTemplate5,
            this.subtractionTemplate6,
            this.subtractionTemplate7,
            this.subtractionTemplate8
        ];

        const template = templates[Math.floor(Math.random() * templates.length)];
        return template.call(this, contexts);
    }

    subtractionTemplate1(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const action = randomChoice(contexts.actions.subtraction);
        const maxNum = Math.min(this.config.maxNumber, 500);

        const num1 = Math.floor(Math.random() * maxNum) + 50;
        const num2 = Math.floor(Math.random() * (num1 - 10)) + 5;

        return {
            question: `${name} had a collection of ${num1} ${items}. During spring cleaning, they ${action} ${num2} of them. How many ${items} does ${name} have left?`,
            answer: num1 - num2
        };
    }

    subtractionTemplate2(contexts) {
        const name = randomChoice(contexts.names);
        const place = randomChoice(contexts.places);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const action = randomChoice(contexts.actions.subtraction);
        const maxNum = Math.min(this.config.maxNumber, 400);

        const num1 = Math.floor(Math.random() * maxNum) + 40;
        const num2 = Math.floor(Math.random() * (num1 - 15)) + 8;

        return {
            question: `The ${place} started the day with ${num1} ${items} in stock. By closing time, customers had ${action} ${num2} ${items}. How many ${items} remained?`,
            answer: num1 - num2
        };
    }

    subtractionTemplate3(contexts) {
        const name = randomChoice(contexts.names);
        const profession = randomChoice(contexts.professions);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 300);

        const num1 = Math.floor(Math.random() * maxNum) + 60;
        const num2 = Math.floor(Math.random() * (num1 - 20)) + 10;

        return {
            question: `${name}, a ${profession}, was managing ${num1} ${items} for a project. Due to budget cuts, they had to remove ${num2} ${items} from the project. How many ${items} are still part of the project?`,
            answer: num1 - num2
        };
    }

    subtractionTemplate4(contexts) {
        const name = randomChoice(contexts.names);
        const place1 = randomChoice(contexts.places);
        const place2 = randomChoice(contexts.places);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 250);

        const num1 = Math.floor(Math.random() * maxNum) + 80;
        const num2 = Math.floor(Math.random() * (num1 - 30)) + 15;

        return {
            question: `${name} moved ${num1} ${items} from the ${place1} to the ${place2}. However, ${num2} ${items} were damaged during transport and had to be discarded. How many ${items} successfully reached the ${place2}?`,
            answer: num1 - num2
        };
    }

    subtractionTemplate5(contexts) {
        const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 200);

        const num1 = Math.floor(Math.random() * maxNum) + 70;
        const num2 = Math.floor(Math.random() * (num1 - 25)) + 12;

        return {
            question: `${names[0]} and ${names[1]} were sharing ${num1} ${items}. ${names[0]} took ${num2} ${items} for their personal use. How many ${items} were left for ${names[1]}?`,
            answer: num1 - num2
        };
    }

    subtractionTemplate6(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const measurement = randomChoice(contexts.measurements);
        const maxNum = Math.min(this.config.maxNumber, 180);

        const total = Math.floor(Math.random() * maxNum) + 90;
        const used = Math.floor(Math.random() * (total - 35)) + 18;

        return {
            question: `${name} started with ${total} ${measurement} of ${items}. During the week, they used ${used} ${measurement} for various projects. How many ${measurement} of ${items} do they have remaining?`,
            answer: total - used
        };
    }

    subtractionTemplate7(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const action1 = randomChoice(contexts.actions.subtraction);
        const action2 = randomChoice(contexts.actions.subtraction);
        const maxNum = Math.min(this.config.maxNumber, 150);

        const num1 = Math.floor(Math.random() * maxNum) + 100;
        const num2 = Math.floor(Math.random() * 40) + 20;
        const num3 = Math.floor(Math.random() * 30) + 15;

        return {
            question: `${name} began the month with ${num1} ${items}. In the first week, they ${action1} ${num2} ${items}. In the second week, they ${action2} ${num3} more ${items}. How many ${items} does ${name} have left?`,
            answer: num1 - num2 - num3
        };
    }

    subtractionTemplate8(contexts) {
        const name = randomChoice(contexts.names);
        const place = randomChoice(contexts.places);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const timeframe = randomChoice(contexts.timeframes);
        const maxNum = Math.min(this.config.maxNumber, 220);

        const num1 = Math.floor(Math.random() * maxNum) + 65;
        const num2 = Math.floor(Math.random() * (num1 - 30)) + 20;

        return {
            question: `At the ${place}, ${name} was responsible for maintaining ${num1} ${items} ${timeframe}. Due to wear and tear, ${num2} ${items} needed to be replaced and removed. How many original ${items} are still in use?`,
            answer: num1 - num2
        };
    }

    // Multiplication word problem templates
    generateMultiplicationProblem(contexts) {
        const templates = [
            this.multiplicationTemplate1,
            this.multiplicationTemplate2,
            this.multiplicationTemplate3,
            this.multiplicationTemplate4,
            this.multiplicationTemplate5,
            this.multiplicationTemplate6,
            this.multiplicationTemplate7,
            this.multiplicationTemplate8
        ];

        const template = templates[Math.floor(Math.random() * templates.length)];
        return template.call(this, contexts);
    }

    multiplicationTemplate1(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 50);

        const groups = Math.floor(Math.random() * maxNum) + 3;
        const perGroup = Math.floor(Math.random() * maxNum) + 2;

        return {
            question: `${name} is organizing ${items} for an event. They create ${groups} equal groups, with ${perGroup} ${items} in each group. How many ${items} are there in total?`,
            answer: groups * perGroup
        };
    }

    multiplicationTemplate2(contexts) {
        const name = randomChoice(contexts.names);
        const profession = randomChoice(contexts.professions);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const timeframe = randomChoice(contexts.timeframes);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 40);

        const rate = Math.floor(Math.random() * maxNum) + 4;
        const time = Math.floor(Math.random() * maxNum) + 3;

        return {
            question: `${name} works as a ${profession} and produces ${rate} ${items} ${timeframe}. If they work for ${time} time periods, how many ${items} will they produce?`,
            answer: rate * time
        };
    }

    multiplicationTemplate3(contexts) {
        const name = randomChoice(contexts.names);
        const place = randomChoice(contexts.places);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 35);

        const rows = Math.floor(Math.random() * maxNum) + 4;
        const cols = Math.floor(Math.random() * maxNum) + 3;

        return {
            question: `At the ${place}, ${name} arranged ${items} in a rectangular pattern with ${rows} rows and ${cols} columns. How many ${items} are there in total?`,
            answer: rows * cols
        };
    }

    multiplicationTemplate4(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const containers = ["boxes", "bags", "containers", "packages", "crates", "baskets"];
        const container = randomChoice(containers);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 45);

        const numContainers = Math.floor(Math.random() * maxNum) + 3;
        const itemsPerContainer = Math.floor(Math.random() * maxNum) + 2;

        return {
            question: `${name} packed ${items} into ${container}. Each ${container.slice(0, -1)} contains exactly ${itemsPerContainer} ${items}. If there are ${numContainers} ${container}, how many ${items} are there altogether?`,
            answer: numContainers * itemsPerContainer
        };
    }

    multiplicationTemplate5(contexts) {
        const names = [randomChoice(contexts.names), randomChoice(contexts.names)];
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 30);

        const person1Amount = Math.floor(Math.random() * maxNum) + 5;
        const multiplier = Math.floor(Math.random() * 8) + 2;

        return {
            question: `${names[0]} has ${person1Amount} ${items}. ${names[1]} has ${multiplier} times as many ${items} as ${names[0]}. How many ${items} does ${names[1]} have?`,
            answer: person1Amount * multiplier
        };
    }

    multiplicationTemplate6(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const measurement = randomChoice(contexts.measurements);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 25);

        const length = Math.floor(Math.random() * maxNum) + 6;
        const width = Math.floor(Math.random() * maxNum) + 4;

        return {
            question: `${name} is creating a display area that measures ${length} ${measurement} by ${width} ${measurement}. If they place one ${items.slice(0, -1)} per square ${measurement}, how many ${items} will fit in the display?`,
            answer: length * width
        };
    }

    multiplicationTemplate7(contexts) {
        const name = randomChoice(contexts.names);
        const place = randomChoice(contexts.places);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 38);

        const floors = Math.floor(Math.random() * 6) + 3;
        const itemsPerFloor = Math.floor(Math.random() * maxNum) + 5;

        return {
            question: `The ${place} has ${floors} floors. ${name} counted ${itemsPerFloor} ${items} on each floor. What is the total number of ${items} in the entire ${place}?`,
            answer: floors * itemsPerFloor
        };
    }

    multiplicationTemplate8(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const events = ["weeks", "months", "sessions", "classes", "meetings", "workshops"];
        const event = randomChoice(events);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 20);

        const perEvent = Math.floor(Math.random() * maxNum) + 7;
        const numEvents = Math.floor(Math.random() * 12) + 4;

        return {
            question: `${name} collects ${perEvent} ${items} during each ${event.slice(0, -1)}. Over the course of ${numEvents} ${event}, how many ${items} will ${name} collect in total?`,
            answer: perEvent * numEvents
        };
    }

    // Division word problem templates
    generateDivisionProblem(contexts) {
        const templates = [
            this.divisionTemplate1,
            this.divisionTemplate2,
            this.divisionTemplate3,
            this.divisionTemplate4,
            this.divisionTemplate5,
            this.divisionTemplate6,
            this.divisionTemplate7,
            this.divisionTemplate8
        ];

        const template = templates[Math.floor(Math.random() * templates.length)];
        return template.call(this, contexts);
    }

    divisionTemplate1(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const action = randomChoice(contexts.actions.division);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 30);

        const groups = Math.floor(Math.random() * maxNum) + 3;
        const perGroup = Math.floor(Math.random() * maxNum) + 2;
        const total = groups * perGroup;

        return {
            question: `${name} has ${total} ${items} that need to be ${action} ${groups} groups. How many ${items} will be in each group?`,
            answer: perGroup
        };
    }

    divisionTemplate2(contexts) {
        const name = randomChoice(contexts.names);
        const people = ["friends", "students", "colleagues", "family members", "teammates", "participants"];
        const group = randomChoice(people);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 25);

        const numPeople = Math.floor(Math.random() * maxNum) + 4;
        const perPerson = Math.floor(Math.random() * maxNum) + 3;
        const total = numPeople * perPerson;

        return {
            question: `${name} wants to share ${total} ${items} equally among ${numPeople} ${group}. How many ${items} will each person receive?`,
            answer: perPerson
        };
    }

    divisionTemplate3(contexts) {
        const name = randomChoice(contexts.names);
        const profession = randomChoice(contexts.professions);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const containers = ["boxes", "bags", "containers", "packages", "sets"];
        const container = randomChoice(containers);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 20);

        const perContainer = Math.floor(Math.random() * maxNum) + 5;
        const numContainers = Math.floor(Math.random() * maxNum) + 3;
        const total = perContainer * numContainers;

        return {
            question: `${name}, a ${profession}, has ${total} ${items} to pack into ${container}. If each ${container.slice(0, -1)} should contain the same number of ${items}, and there are ${numContainers} ${container}, how many ${items} go in each ${container.slice(0, -1)}?`,
            answer: perContainer
        };
    }

    divisionTemplate4(contexts) {
        const name = randomChoice(contexts.names);
        const place = randomChoice(contexts.places);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const areas = ["sections", "departments", "zones", "areas", "wings", "rooms"];
        const area = randomChoice(areas);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 22);

        const numAreas = Math.floor(Math.random() * maxNum) + 4;
        const perArea = Math.floor(Math.random() * maxNum) + 6;
        const total = numAreas * perArea;

        return {
            question: `The ${place} has ${total} ${items} distributed across ${numAreas} different ${area}. If each ${area.slice(0, -1)} has an equal number of ${items}, how many ${items} are in each ${area.slice(0, -1)}?`,
            answer: perArea
        };
    }

    divisionTemplate5(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const timeframes = ["days", "weeks", "months", "sessions", "periods"];
        const timeframe = randomChoice(timeframes);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 18);

        const numPeriods = Math.floor(Math.random() * maxNum) + 5;
        const perPeriod = Math.floor(Math.random() * maxNum) + 4;
        const total = numPeriods * perPeriod;

        return {
            question: `${name} produced ${total} ${items} over ${numPeriods} ${timeframes}. If the production was consistent each ${timeframe.slice(0, -1)}, how many ${items} were produced per ${timeframe.slice(0, -1)}?`,
            answer: perPeriod
        };
    }

    divisionTemplate6(contexts) {
        const name = randomChoice(contexts.names);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const measurement = randomChoice(contexts.measurements);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 15);

        const length = Math.floor(Math.random() * maxNum) + 8;
        const segments = Math.floor(Math.random() * 8) + 3;
        const total = length * segments;

        return {
            question: `${name} has ${total} ${measurement} of ${items} to cut into ${segments} equal pieces. How many ${measurement} long will each piece be?`,
            answer: length
        };
    }

    divisionTemplate7(contexts) {
        const names = [randomChoice(contexts.names), randomChoice(contexts.names), randomChoice(contexts.names)];
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 16);

        const perPerson = Math.floor(Math.random() * maxNum) + 7;
        const total = perPerson * 3;

        return {
            question: `${names[0]}, ${names[1]}, and ${names[2]} collected ${total} ${items} together. If they split the ${items} equally among themselves, how many ${items} will each person get?`,
            answer: perPerson
        };
    }

    divisionTemplate8(contexts) {
        const name = randomChoice(contexts.names);
        const place = randomChoice(contexts.places);
        const itemCategory = randomChoice(Object.keys(contexts.items));
        const items = randomChoice(contexts.items[itemCategory]);
        const vehicles = ["trucks", "vans", "cars", "buses", "trailers"];
        const vehicle = randomChoice(vehicles);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 14);

        const numVehicles = Math.floor(Math.random() * maxNum) + 4;
        const perVehicle = Math.floor(Math.random() * maxNum) + 8;
        const total = numVehicles * perVehicle;

        return {
            question: `${name} needs to transport ${total} ${items} from the ${place} using ${numVehicles} ${vehicle}. If each ${vehicle.slice(0, -1)} carries the same amount, how many ${items} will be in each ${vehicle.slice(0, -1)}?`,
            answer: perVehicle
        };
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

            isUnique = true;

            for (let existingProblem of this.usedProblems) {
                if (this.checkSimilarity(problem.question, existingProblem) > this.uniquenessThreshold) {
                    isUnique = false;
                    break;
                }
            }

            attempts++;
        } while (!isUnique && attempts < maxAttempts);

        if (isUnique) {
            this.usedProblems.add(problem.question);
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
}
