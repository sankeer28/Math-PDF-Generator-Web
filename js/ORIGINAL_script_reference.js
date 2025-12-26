// =============================================
// MATH PDF GENERATOR PRO - Enhanced Version
// =============================================

// Utility Functions
function generateRandomFilename() {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    return Array.from({length: 10}, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('mathgen-theme') || 'matrix';
        this.applyTheme(this.currentTheme);
        this.initializeThemeToggle();
    }

    applyTheme(theme) {
        document.body.className = theme === 'matrix' ? '' : `theme-${theme}`;
        this.currentTheme = theme;
        localStorage.setItem('mathgen-theme', theme);
    }

    initializeThemeToggle() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.applyTheme(theme);
                this.updateActiveTheme(btn);
            });
        });
        
        const activeBtn = document.querySelector(`[data-theme="${this.currentTheme}"]`);
        if (activeBtn) this.updateActiveTheme(activeBtn);
    }

    updateActiveTheme(activeBtn) {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = 'none';
        });
        activeBtn.style.transform = 'scale(1.2)';
        activeBtn.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
    }
}

// Progress Manager
class ProgressManager {
    constructor() {
        this.container = document.getElementById('progress-container');
        this.bar = document.getElementById('progress-fill');
        this.message = document.getElementById('progress-message');
    }

    show() {
        this.container.style.display = 'block';
        this.updateProgress(0, 'Initializing...');
    }

    hide() {
        this.container.style.display = 'none';
    }

    updateProgress(percentage, message = '') {
        this.bar.style.width = `${percentage}%`;
        if (message) this.message.textContent = message;
    }
}

// Grade Level Configurations
const GRADE_CONFIGS = {
    elementary: {
        name: 'Elementary (K-5)',
        subjects: ['arithmetic', 'geometry'], // Added basic geometry
        maxNumber: 100,
        operations: ['addition', 'subtraction', 'multiplication', 'division'],
        complexityMultiplier: 0.5,
        problemTypes: ['equations', 'word', 'mixed'] // All problem types available
    },
    middle: {
        name: 'Middle School (6-8)',
        subjects: ['arithmetic', 'algebra', 'geometry', 'statistics'],
        maxNumber: 1000,
        operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],
        complexityMultiplier: 0.7,
        problemTypes: ['equations', 'word', 'mixed', 'story']
    },
    high: {
        name: 'High School (9-12)',
        subjects: ['arithmetic', 'algebra', 'geometry', 'trigonometry', 'statistics'], // Re-added arithmetic
        maxNumber: 10000,
        operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],
        complexityMultiplier: 1.0,
        problemTypes: ['equations', 'word', 'mixed', 'story']
    },
    college: {
        name: 'College/Advanced',
        subjects: ['arithmetic', 'calculus', 'statistics', 'algebra', 'trigonometry'], // Added arithmetic back
        maxNumber: 100000,
        operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'], // Fixed operations
        complexityMultiplier: 1.5,
        problemTypes: ['equations', 'word', 'mixed', 'story']
    }
};

// Grade-Aware Subject Topics Configuration
const SUBJECT_TOPICS = {
    arithmetic: {
        name: 'Basic Arithmetic',
        topics: {
            'basic-operations': { 
                name: 'Basic Operations (+, -, ×, ÷)', 
                grades: ['elementary', 'middle', 'high', 'college'] 
            },
            'place-value': { 
                name: 'Place Value & Number Sense', 
                grades: ['elementary', 'middle'] 
            },
            'fractions': { 
                name: 'Fractions & Decimals', 
                grades: ['elementary', 'middle', 'high'] 
            },
            'word-problems': { 
                name: 'Word Problems', 
                grades: ['elementary', 'middle', 'high', 'college'] 
            },
            'estimation': { 
                name: 'Estimation & Rounding', 
                grades: ['elementary', 'middle'] 
            },
            'patterns': { 
                name: 'Number Patterns', 
                grades: ['elementary', 'middle'] 
            },
            'percentages': {
                name: 'Percentages & Interest',
                grades: ['middle', 'high', 'college']
            }
        }
    },
    algebra: {
        name: 'Algebra',
        topics: {
            'linear-equations': { 
                name: 'Linear Equations', 
                grades: ['middle', 'high', 'college'] 
            },
            'quadratic-equations': { 
                name: 'Quadratic Equations', 
                grades: ['high', 'college'] 
            },
            'systems': { 
                name: 'Systems of Equations', 
                grades: ['high', 'college'] 
            },
            'polynomials': { 
                name: 'Polynomials', 
                grades: ['high', 'college'] 
            },
            'factoring': { 
                name: 'Factoring', 
                grades: ['middle', 'high', 'college'] 
            },
            'inequalities': { 
                name: 'Inequalities', 
                grades: ['middle', 'high', 'college'] 
            },
            'functions': { 
                name: 'Functions & Relations', 
                grades: ['high', 'college'] 
            },
            'word-problems': {
                name: 'Algebraic Word Problems',
                grades: ['middle', 'high', 'college']
            }
        }
    },
    geometry: {
        name: 'Geometry',
        topics: {
            'area-perimeter': { 
                name: 'Area & Perimeter', 
                grades: ['elementary', 'middle', 'high'] 
            },
            'angles': { 
                name: 'Angles & Lines', 
                grades: ['elementary', 'middle', 'high'] 
            },
            'triangles': { 
                name: 'Triangles', 
                grades: ['middle', 'high', 'college'] 
            },
            'circles': { 
                name: 'Circles', 
                grades: ['middle', 'high', 'college'] 
            },
            'polygons': { 
                name: 'Polygons', 
                grades: ['elementary', 'middle', 'high'] 
            },
            'coordinate-geometry': { 
                name: 'Coordinate Geometry', 
                grades: ['high', 'college'] 
            },
            'volume-surface': { 
                name: 'Volume & Surface Area', 
                grades: ['middle', 'high', 'college'] 
            },
            'word-problems': {
                name: 'Geometry Word Problems',
                grades: ['elementary', 'middle', 'high', 'college']
            }
        }
    },
    statistics: {
        name: 'Statistics & Probability',
        topics: {
            'data-analysis': 'Data Analysis',
            'mean-median-mode': 'Mean, Median, Mode',
            'probability': 'Basic Probability',
            'graphs-charts': 'Graphs & Charts',
            'sampling': 'Sampling & Surveys',
            'correlation': 'Correlation & Regression'
        }
    },
    trigonometry: {
        name: 'Trigonometry',
        topics: {
            'right-triangles': 'Right Triangle Trigonometry',
            'unit-circle': 'Unit Circle',
            'trig-functions': 'Trigonometric Functions',
            'identities': 'Trigonometric Identities',
            'equations': 'Trigonometric Equations',
            'applications': 'Real-World Applications'
        }
    },
    calculus: {
        name: 'Calculus',
        topics: {
            'limits': 'Limits',
            'derivatives': 'Derivatives',
            'integrals': 'Integrals',
            'optimization': 'Optimization',
            'related-rates': 'Related Rates',
            'applications': 'Applications of Calculus'
        }
    }
};

// Difficulty Multipliers
const DIFFICULTY_MULTIPLIERS = {
    easy: 0.6,
    medium: 1.0,
    hard: 1.4
};

// Enhanced Problem Generator with Advanced Uniqueness Algorithm
class ProblemGenerator {
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
        this.config = {
            grade: GRADE_CONFIGS[gradeLevel],
            difficulty: DIFFICULTY_MULTIPLIERS[difficulty],
            subject: subject,
            maxNumber: Math.floor(GRADE_CONFIGS[gradeLevel].maxNumber * DIFFICULTY_MULTIPLIERS[difficulty])
        };
    }

    generateProblem(operation, problemType, selectedTopics = 'all') {
        // Smart conflict resolution: Topics take priority over Problem Type for arithmetic
        if (this.config.subject === 'arithmetic' && selectedTopics !== 'all' && selectedTopics.length > 0) {
            // Topic-specific overrides
            if (selectedTopics.includes('word-problems')) {
                problemType = 'word';
            } else if (selectedTopics.includes('basic-operations')) {
                problemType = 'equations';
            } else if (selectedTopics.includes('fractions') || selectedTopics.includes('place-value')) {
                problemType = 'equations'; // These work better as equations
            } else if (selectedTopics.includes('estimation') || selectedTopics.includes('patterns')) {
                problemType = 'mixed'; // These can be either
            }
        }
        
        // Handle mixed problem types
        if (problemType === 'mixed') {
            problemType = Math.random() < 0.5 ? 'equations' : 'word';
        }
        
        // Validate operation for subject - override invalid operations
        operation = this.validateOperationForSubject(operation);
        
        if (problemType === 'equations') {
            return this.generateEquation(operation, selectedTopics);
        } else {
            return this.generateWordProblem(operation);
        }
    }
    
    validateOperationForSubject(operation) {
        // Subject-specific operation validation
        switch (this.config.subject) {
            case 'algebra':
                // Algebra should focus on algebraic operations, not basic arithmetic
                if (['addition', 'subtraction', 'multiplication', 'division'].includes(operation)) {
                    return 'algebraic'; // Convert to algebraic equivalent
                }
                return operation;
                
            case 'geometry':
                // Geometry problems don't use basic arithmetic operations
                return 'geometric';
                
            case 'trigonometry':
                return 'trigonometric';
                
            case 'calculus':
                return 'calculus';
                
            case 'statistics':
                return 'statistical';
                
            case 'arithmetic':
            default:
                // Basic arithmetic can use all operations
                return operation;
        }
    }

    // Enhanced equation generation based on subject and grade level
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
        } else {
            return this.generateArithmeticEquation(operation, selectedTopics);
        }
    }

    generateArithmeticEquation(operation, selectedTopics = 'all') {
        // Topic-specific generation for arithmetic
        if (selectedTopics !== 'all' && selectedTopics.length > 0) {
            return this.generateTopicSpecificEquation(operation, selectedTopics);
        }

        let question = "";
        let answer = 0;
        let num1, num2;
        const maxNum = this.config.maxNumber;

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
        }

        return { question, answer };
    }

    generateTopicSpecificEquation(operation, selectedTopics) {
        // Topic-specific equation generation
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
                default:
                    continue;
            }
        }
        
        // Fallback to basic operations if no specific topic match
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
        
        // Round to nearest 50 for estimation
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

    // Advanced subject-specific problem generators
    generateAlgebraEquation(operation) {
        const problems = [
            () => this.generateLinearEquation(),
            () => this.generateQuadraticExpansion(),
            () => this.generateFactoring()
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

    generateGeometryProblem() {
        const problems = [
            () => this.generateAreaProblem(),
            () => this.generatePerimeterProblem(),
            () => this.generatePythagoreanProblem()
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

    generateStatisticsProblem() {
        const problems = [
            () => this.generateMeanProblem(),
            () => this.generateProbabilityProblem()
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

    // Enhanced word problem generation
    generateWordProblem(operation) {
        let problem;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            if (this.config.subject === 'algebra') {
                problem = this.generateAlgebraWordProblem();
            } else if (this.config.subject === 'geometry') {
                problem = this.generateGeometryWordProblem();
            } else {
                problem = this.generateStandardWordProblem(operation);
            }
            attempts++;
        } while (this.usedProblems.has(problem.question) && attempts < maxAttempts);

        if (attempts < maxAttempts) {
            this.usedProblems.add(problem.question);
        }

        return problem;
    }

    generateAlgebraWordProblem() {
        const scenarios = [
            'age problems', 'distance problems', 'work problems'
        ];
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

    generateStandardWordProblem(operation) {
        const problemTypes = [
            "basic", "sequence", "ageRelated", "workRate", "mixture", "brainTeaser"
        ];
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
        // Massive pools for maximum variety
        const contexts = this.getContextualData();
        
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
        }
    }

    getContextualData() {
        return {
            names: [
                "Alex", "Bailey", "Carmen", "Devon", "Elena", "Felix", "Grace", "Hunter", "Isabella", "Jordan",
                "Kai", "Luna", "Marcus", "Nina", "Oliver", "Phoenix", "Quinn", "River", "Sage", "Taylor",
                "Uma", "Victor", "Willow", "Xander", "Yara", "Zoe", "Ava", "Blake", "Cora", "Dylan",
                "Emma", "Finn", "Gemma", "Hudson", "Ivy", "Jax", "Kira", "Leo", "Maya", "Noah",
                "Aria", "Beau", "Chloe", "Diego", "Eva", "Gage", "Hana", "Ian", "Jade", "Knox"
            ],
            professions: [
                "teacher", "chef", "artist", "scientist", "engineer", "doctor", "librarian", "farmer",
                "architect", "musician", "photographer", "designer", "pilot", "mechanic", "programmer"
            ],
            places: [
                "school", "library", "store", "park", "museum", "theater", "restaurant", "hospital",
                "factory", "office", "farm", "bakery", "workshop", "studio", "laboratory"
            ],
            items: {
                school: ["pencils", "notebooks", "erasers", "rulers", "markers", "textbooks", "folders", "calculators"],
                food: ["apples", "cookies", "sandwiches", "pizzas", "cupcakes", "bagels", "muffins", "donuts"],
                toys: ["action figures", "dolls", "puzzles", "board games", "building blocks", "toy cars", "stuffed animals", "marbles"],
                technology: ["computers", "tablets", "phones", "cameras", "headphones", "speakers", "keyboards", "mice"],
                nature: ["flowers", "trees", "rocks", "shells", "leaves", "seeds", "butterflies", "birds"],
                sports: ["basketballs", "soccer balls", "tennis balls", "baseball cards", "helmets", "jerseys", "trophies", "medals"],
                art: ["paintbrushes", "canvases", "colored pencils", "sketchbooks", "sculptures", "paintings", "clay pots", "stickers"],
                books: ["novels", "comics", "magazines", "encyclopedias", "poetry books", "cookbooks", "atlases", "dictionaries"]
            },
            actions: {
                addition: [
                    "bought", "found", "received", "collected", "gathered", "picked up", "earned", "won",
                    "discovered", "inherited", "was given", "acquired", "obtained", "got as gifts"
                ],
                subtraction: [
                    "sold", "gave away", "lost", "used", "ate", "donated", "threw away", "broke",
                    "returned", "lent", "traded", "exchanged", "consumed", "spent"
                ],
                multiplication: [
                    "packed into boxes", "organized into groups", "arranged in rows", "sorted into sets",
                    "divided among teams", "placed in containers", "distributed across", "allocated to"
                ],
                division: [
                    "shared equally", "distributed evenly", "divided among", "split between",
                    "separated into", "organized into", "arranged in", "grouped into"
                ]
            },
            timeframes: ["daily", "weekly", "monthly", "per hour", "each day", "every week", "per session", "each time"],
            measurements: ["pounds", "kilograms", "liters", "gallons", "meters", "feet", "inches", "centimeters"]
        };
    }

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
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const action = this.randomChoice(contexts.actions.addition);
        const maxNum = Math.min(this.config.maxNumber, 500);
        
        const num1 = Math.floor(Math.random() * maxNum) + 10;
        const num2 = Math.floor(Math.random() * maxNum) + 5;
        
        return {
            question: `${name} had ${num1} ${items} in their collection. Last week, they ${action} ${num2} more ${items}. How many ${items} does ${name} have now?`,
            answer: num1 + num2
        };
    }

    additionTemplate2(contexts) {
        const name = this.randomChoice(contexts.names);
        const place = this.randomChoice(contexts.places);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 300);
        
        const num1 = Math.floor(Math.random() * maxNum) + 15;
        const num2 = Math.floor(Math.random() * maxNum) + 8;
        
        return {
            question: `At the ${place}, ${name} counted ${num1} ${items} in the morning. By afternoon, ${num2} more ${items} had arrived. What is the total number of ${items} now?`,
            answer: num1 + num2
        };
    }

    additionTemplate3(contexts) {
        const names = [this.randomChoice(contexts.names), this.randomChoice(contexts.names)];
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 400);
        
        const num1 = Math.floor(Math.random() * maxNum) + 12;
        const num2 = Math.floor(Math.random() * maxNum) + 8;
        
        return {
            question: `${names[0]} has ${num1} ${items} and ${names[1]} has ${num2} ${items}. If they combine their ${items} together, how many will they have in total?`,
            answer: num1 + num2
        };
    }

    additionTemplate4(contexts) {
        const name = this.randomChoice(contexts.names);
        const profession = this.randomChoice(contexts.professions);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const timeframe = this.randomChoice(contexts.timeframes);
        const maxNum = Math.min(this.config.maxNumber, 200);
        
        const num1 = Math.floor(Math.random() * maxNum) + 8;
        const num2 = Math.floor(Math.random() * maxNum) + 6;
        
        return {
            question: `${name} is a ${profession} who creates ${num1} ${items} ${timeframe}. This week, they made an extra ${num2} ${items} for a special project. How many ${items} did they create this week in total?`,
            answer: num1 + num2
        };
    }

    additionTemplate5(contexts) {
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const measurement = this.randomChoice(contexts.measurements);
        const maxNum = Math.min(this.config.maxNumber, 150);
        
        const num1 = Math.floor(Math.random() * maxNum) + 20;
        const num2 = Math.floor(Math.random() * maxNum) + 15;
        
        return {
            question: `${name} weighed their collection of ${items} and found it was ${num1} ${measurement}. After adding more ${items}, the collection now weighs ${num1 + num2} ${measurement}. How many ${measurement} of ${items} did ${name} add?`,
            answer: num2
        };
    }

    additionTemplate6(contexts) {
        const name = this.randomChoice(contexts.names);
        const place1 = this.randomChoice(contexts.places);
        const place2 = this.randomChoice(contexts.places);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 250);
        
        const num1 = Math.floor(Math.random() * maxNum) + 18;
        const num2 = Math.floor(Math.random() * maxNum) + 12;
        
        return {
            question: `${name} visited two locations today. At the ${place1}, they saw ${num1} ${items}. At the ${place2}, they counted ${num2} ${items}. How many ${items} did ${name} see in total during their visits?`,
            answer: num1 + num2
        };
    }

    additionTemplate7(contexts) {
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const action = this.randomChoice(contexts.actions.addition);
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
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const profession = this.randomChoice(contexts.professions);
        const maxNum = Math.min(this.config.maxNumber, 120);
        
        const num1 = Math.floor(Math.random() * maxNum) + 30;
        const num2 = Math.floor(Math.random() * maxNum) + 20;
        
        return {
            question: `${name}, who works as a ${profession}, needs ${items} for a project. They already have ${num1} ${items} and their colleague brought ${num2} more. What is the total number of ${items} available for the project?`,
            answer: num1 + num2
        };
    }

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // SUBTRACTION PROBLEM TEMPLATES
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
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const action = this.randomChoice(contexts.actions.subtraction);
        const maxNum = Math.min(this.config.maxNumber, 500);
        
        const num1 = Math.floor(Math.random() * maxNum) + 50;
        const num2 = Math.floor(Math.random() * (num1 - 10)) + 5;
        
        return {
            question: `${name} had a collection of ${num1} ${items}. During spring cleaning, they ${action} ${num2} of them. How many ${items} does ${name} have left?`,
            answer: num1 - num2
        };
    }

    subtractionTemplate2(contexts) {
        const name = this.randomChoice(contexts.names);
        const place = this.randomChoice(contexts.places);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const action = this.randomChoice(contexts.actions.subtraction);
        const maxNum = Math.min(this.config.maxNumber, 400);
        
        const num1 = Math.floor(Math.random() * maxNum) + 40;
        const num2 = Math.floor(Math.random() * (num1 - 15)) + 8;
        
        return {
            question: `The ${place} started the day with ${num1} ${items} in stock. By closing time, customers had ${action} ${num2} ${items}. How many ${items} remained?`,
            answer: num1 - num2
        };
    }

    subtractionTemplate3(contexts) {
        const name = this.randomChoice(contexts.names);
        const profession = this.randomChoice(contexts.professions);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 300);
        
        const num1 = Math.floor(Math.random() * maxNum) + 60;
        const num2 = Math.floor(Math.random() * (num1 - 20)) + 10;
        
        return {
            question: `${name}, a ${profession}, was managing ${num1} ${items} for a project. Due to budget cuts, they had to remove ${num2} ${items} from the project. How many ${items} are still part of the project?`,
            answer: num1 - num2
        };
    }

    subtractionTemplate4(contexts) {
        const name = this.randomChoice(contexts.names);
        const place1 = this.randomChoice(contexts.places);
        const place2 = this.randomChoice(contexts.places);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 250);
        
        const num1 = Math.floor(Math.random() * maxNum) + 80;
        const num2 = Math.floor(Math.random() * (num1 - 30)) + 15;
        
        return {
            question: `${name} moved ${num1} ${items} from the ${place1} to the ${place2}. However, ${num2} ${items} were damaged during transport and had to be discarded. How many ${items} successfully reached the ${place2}?`,
            answer: num1 - num2
        };
    }

    subtractionTemplate5(contexts) {
        const names = [this.randomChoice(contexts.names), this.randomChoice(contexts.names)];
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(this.config.maxNumber, 200);
        
        const num1 = Math.floor(Math.random() * maxNum) + 70;
        const num2 = Math.floor(Math.random() * (num1 - 25)) + 12;
        
        return {
            question: `${names[0]} and ${names[1]} were sharing ${num1} ${items}. ${names[0]} took ${num2} ${items} for their personal use. How many ${items} were left for ${names[1]}?`,
            answer: num1 - num2
        };
    }

    subtractionTemplate6(contexts) {
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const measurement = this.randomChoice(contexts.measurements);
        const maxNum = Math.min(this.config.maxNumber, 180);
        
        const total = Math.floor(Math.random() * maxNum) + 90;
        const used = Math.floor(Math.random() * (total - 35)) + 18;
        
        return {
            question: `${name} started with ${total} ${measurement} of ${items}. During the week, they used ${used} ${measurement} for various projects. How many ${measurement} of ${items} do they have remaining?`,
            answer: total - used
        };
    }

    subtractionTemplate7(contexts) {
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const action1 = this.randomChoice(contexts.actions.subtraction);
        const action2 = this.randomChoice(contexts.actions.subtraction);
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
        const name = this.randomChoice(contexts.names);
        const place = this.randomChoice(contexts.places);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const timeframe = this.randomChoice(contexts.timeframes);
        const maxNum = Math.min(this.config.maxNumber, 220);
        
        const num1 = Math.floor(Math.random() * maxNum) + 65;
        const num2 = Math.floor(Math.random() * (num1 - 30)) + 20;
        
        return {
            question: `At the ${place}, ${name} was responsible for maintaining ${num1} ${items} ${timeframe}. Due to wear and tear, ${num2} ${items} needed to be replaced and removed. How many original ${items} are still in use?`,
            answer: num1 - num2
        };
    }

    // MULTIPLICATION PROBLEM TEMPLATES
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
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 50);
        
        const groups = Math.floor(Math.random() * maxNum) + 3;
        const perGroup = Math.floor(Math.random() * maxNum) + 2;
        
        return {
            question: `${name} is organizing ${items} for an event. They create ${groups} equal groups, with ${perGroup} ${items} in each group. How many ${items} are there in total?`,
            answer: groups * perGroup
        };
    }

    multiplicationTemplate2(contexts) {
        const name = this.randomChoice(contexts.names);
        const profession = this.randomChoice(contexts.professions);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const timeframe = this.randomChoice(contexts.timeframes);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 40);
        
        const rate = Math.floor(Math.random() * maxNum) + 4;
        const time = Math.floor(Math.random() * maxNum) + 3;
        
        return {
            question: `${name} works as a ${profession} and produces ${rate} ${items} ${timeframe}. If they work for ${time} time periods, how many ${items} will they produce?`,
            answer: rate * time
        };
    }

    multiplicationTemplate3(contexts) {
        const name = this.randomChoice(contexts.names);
        const place = this.randomChoice(contexts.places);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 35);
        
        const rows = Math.floor(Math.random() * maxNum) + 4;
        const cols = Math.floor(Math.random() * maxNum) + 3;
        
        return {
            question: `At the ${place}, ${name} arranged ${items} in a rectangular pattern with ${rows} rows and ${cols} columns. How many ${items} are there in total?`,
            answer: rows * cols
        };
    }

    multiplicationTemplate4(contexts) {
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const containers = ["boxes", "bags", "containers", "packages", "crates", "baskets"];
        const container = this.randomChoice(containers);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 45);
        
        const numContainers = Math.floor(Math.random() * maxNum) + 3;
        const itemsPerContainer = Math.floor(Math.random() * maxNum) + 2;
        
        return {
            question: `${name} packed ${items} into ${container}. Each ${container.slice(0, -1)} contains exactly ${itemsPerContainer} ${items}. If there are ${numContainers} ${container}, how many ${items} are there altogether?`,
            answer: numContainers * itemsPerContainer
        };
    }

    multiplicationTemplate5(contexts) {
        const names = [this.randomChoice(contexts.names), this.randomChoice(contexts.names)];
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 30);
        
        const person1Amount = Math.floor(Math.random() * maxNum) + 5;
        const multiplier = Math.floor(Math.random() * 8) + 2;
        
        return {
            question: `${names[0]} has ${person1Amount} ${items}. ${names[1]} has ${multiplier} times as many ${items} as ${names[0]}. How many ${items} does ${names[1]} have?`,
            answer: person1Amount * multiplier
        };
    }

    multiplicationTemplate6(contexts) {
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const measurement = this.randomChoice(contexts.measurements);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 25);
        
        const length = Math.floor(Math.random() * maxNum) + 6;
        const width = Math.floor(Math.random() * maxNum) + 4;
        
        return {
            question: `${name} is creating a display area that measures ${length} ${measurement} by ${width} ${measurement}. If they place one ${items.slice(0, -1)} per square ${measurement}, how many ${items} will fit in the display?`,
            answer: length * width
        };
    }

    multiplicationTemplate7(contexts) {
        const name = this.randomChoice(contexts.names);
        const place = this.randomChoice(contexts.places);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 38);
        
        const floors = Math.floor(Math.random() * 6) + 3;
        const itemsPerFloor = Math.floor(Math.random() * maxNum) + 5;
        
        return {
            question: `The ${place} has ${floors} floors. ${name} counted ${itemsPerFloor} ${items} on each floor. What is the total number of ${items} in the entire ${place}?`,
            answer: floors * itemsPerFloor
        };
    }

    multiplicationTemplate8(contexts) {
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const events = ["weeks", "months", "sessions", "classes", "meetings", "workshops"];
        const event = this.randomChoice(events);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 20);
        
        const perEvent = Math.floor(Math.random() * maxNum) + 7;
        const numEvents = Math.floor(Math.random() * 12) + 4;
        
        return {
            question: `${name} collects ${perEvent} ${items} during each ${event.slice(0, -1)}. Over the course of ${numEvents} ${event}, how many ${items} will ${name} collect in total?`,
            answer: perEvent * numEvents
        };
    }

    // DIVISION PROBLEM TEMPLATES
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
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const action = this.randomChoice(contexts.actions.division);
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
        const name = this.randomChoice(contexts.names);
        const people = ["friends", "students", "colleagues", "family members", "teammates", "participants"];
        const group = this.randomChoice(people);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
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
        const name = this.randomChoice(contexts.names);
        const profession = this.randomChoice(contexts.professions);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const containers = ["boxes", "bags", "containers", "packages", "sets"];
        const container = this.randomChoice(containers);
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
        const name = this.randomChoice(contexts.names);
        const place = this.randomChoice(contexts.places);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const areas = ["sections", "departments", "zones", "areas", "wings", "rooms"];
        const area = this.randomChoice(areas);
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
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const timeframes = ["days", "weeks", "months", "sessions", "periods"];
        const timeframe = this.randomChoice(timeframes);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 18);
        
        const numPeriods = Math.floor(Math.random() * maxNum) + 5;
        const perPeriod = Math.floor(Math.random() * maxNum) + 4;
        const total = numPeriods * perPeriod;
        
        return {
            question: `${name} produced ${total} ${items} over ${numPeriods} ${timeframe}. If the production was consistent each ${timeframe.slice(0, -1)}, how many ${items} were produced per ${timeframe.slice(0, -1)}?`,
            answer: perPeriod
        };
    }

    divisionTemplate6(contexts) {
        const name = this.randomChoice(contexts.names);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const measurement = this.randomChoice(contexts.measurements);
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
        const names = [this.randomChoice(contexts.names), this.randomChoice(contexts.names), this.randomChoice(contexts.names)];
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 16);
        
        const perPerson = Math.floor(Math.random() * maxNum) + 7;
        const total = perPerson * 3;
        
        return {
            question: `${names[0]}, ${names[1]}, and ${names[2]} collected ${total} ${items} together. If they split the ${items} equally among themselves, how many ${items} will each person get?`,
            answer: perPerson
        };
    }

    divisionTemplate8(contexts) {
        const name = this.randomChoice(contexts.names);
        const place = this.randomChoice(contexts.places);
        const itemCategory = this.randomChoice(Object.keys(contexts.items));
        const items = this.randomChoice(contexts.items[itemCategory]);
        const vehicles = ["trucks", "vans", "cars", "buses", "trailers"];
        const vehicle = this.randomChoice(vehicles);
        const maxNum = Math.min(Math.sqrt(this.config.maxNumber), 14);
        
        const numVehicles = Math.floor(Math.random() * maxNum) + 4;
        const perVehicle = Math.floor(Math.random() * maxNum) + 8;
        const total = numVehicles * perVehicle;
        
        return {
            question: `${name} needs to transport ${total} ${items} from the ${place} using ${numVehicles} ${vehicle}. If each ${vehicle.slice(0, -1)} carries the same amount, how many ${items} will be in each ${vehicle.slice(0, -1)}?`,
            answer: perVehicle
        };
    }

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

    // Advanced Uniqueness Algorithms
    generateUniqueNumbers(count, operation, maxNum) {
        const numbers = [];
        const attempts = new Set();
        
        for (let i = 0; i < count; i++) {
            let num, attempt = 0;
            do {
                num = this.getSmartNumber(maxNum, operation, attempts);
                attempt++;
            } while (attempts.has(num) && attempt < 50);
            
            numbers.push(num);
            attempts.add(num);
            
            // Track number history for better distribution
            const key = `${operation}_${i}`;
            if (!this.numberHistory.has(key)) {
                this.numberHistory.set(key, new Set());
            }
            this.numberHistory.get(key).add(num);
        }
        
        return numbers;
    }

    getSmartNumber(maxNum, operation, usedNums) {
        const ranges = this.getNumberRanges(maxNum, operation);
        const selectedRange = this.randomChoice(ranges);
        
        // Use mathematical sequences for more interesting numbers
        const patterns = [
            () => selectedRange.min + Math.floor(Math.random() * (selectedRange.max - selectedRange.min + 1)),
            () => this.getFibonacci(Math.floor(Math.random() * 12) + 1),
            () => Math.pow(Math.floor(Math.random() * Math.sqrt(maxNum)) + 1, 2),
            () => this.getPrime(maxNum),
            () => this.getFactorial(Math.floor(Math.random() * 7) + 1),
            () => this.getTriangular(Math.floor(Math.random() * 15) + 1),
        ];
        
        const pattern = this.randomChoice(patterns);
        let num = pattern();
        
        // Ensure number is within bounds and not overused
        num = Math.max(selectedRange.min, Math.min(selectedRange.max, num));
        
        // Add slight variation if number is commonly used
        if (usedNums.has(num) && usedNums.size < maxNum / 3) {
            num += Math.floor(Math.random() * 10) - 5;
            num = Math.max(selectedRange.min, Math.min(selectedRange.max, num));
        }
        
        return num;
    }

    getNumberRanges(maxNum, operation) {
        const base = Math.floor(maxNum / 5);
        switch(operation) {
            case 'addition':
                return [
                    { min: 1, max: base },
                    { min: base, max: base * 2 },
                    { min: base * 2, max: maxNum }
                ];
            case 'subtraction':
                return [
                    { min: base, max: base * 3 },
                    { min: base * 2, max: maxNum }
                ];
            case 'multiplication':
                return [
                    { min: 2, max: Math.sqrt(maxNum) },
                    { min: Math.sqrt(maxNum), max: Math.sqrt(maxNum) * 2 }
                ];
            case 'division':
                return [
                    { min: 2, max: Math.sqrt(maxNum) },
                    { min: 1, max: 50 }
                ];
            default:
                return [{ min: 1, max: maxNum }];
        }
    }

    getFibonacci(n) {
        if (n <= 1) return n;
        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) {
            [a, b] = [b, a + b];
        }
        return b;
    }

    getPrime(max) {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
        const validPrimes = primes.filter(p => p <= max);
        return validPrimes.length > 0 ? this.randomChoice(validPrimes) : Math.floor(Math.random() * max) + 1;
    }

    getFactorial(n) {
        if (n <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    getTriangular(n) {
        return (n * (n + 1)) / 2;
    }

    generateUniqueContext() {
        const contexts = this.getContextualData();
        const contextKey = this.getSmartContext(contexts);
        
        // Track context usage to prevent repetition
        const contextHash = this.hashContext(contextKey);
        if (!this.contextHistory.has(contextHash)) {
            this.contextHistory.set(contextHash, 0);
        }
        this.contextHistory.set(contextHash, this.contextHistory.get(contextHash) + 1);
        
        return contextKey;
    }

    getSmartContext(contexts) {
        // Create context combinations that haven't been overused
        const leastUsedCombos = this.findLeastUsedCombinations(contexts);
        return this.randomChoice(leastUsedCombos);
    }

    findLeastUsedCombinations(contexts) {
        const combinations = [];
        
        for (let i = 0; i < 20; i++) { // Generate 20 potential combinations
            const combo = {
                name: this.randomChoice(contexts.names),
                profession: this.randomChoice(contexts.professions),
                place: this.randomChoice(contexts.places),
                itemCategory: this.randomChoice(Object.keys(contexts.items)),
                action: null, // Will be set based on operation
                timeframe: this.randomChoice(contexts.timeframes),
                measurement: this.randomChoice(contexts.measurements)
            };
            
            combo.items = this.randomChoice(contexts.items[combo.itemCategory]);
            combinations.push(combo);
        }
        
        // Sort by least used
        return combinations.sort((a, b) => {
            const hashA = this.hashContext(a);
            const hashB = this.hashContext(b);
            const usageA = this.contextHistory.get(hashA) || 0;
            const usageB = this.contextHistory.get(hashB) || 0;
            return usageA - usageB;
        });
    }

    hashContext(context) {
        return `${context.name}_${context.profession}_${context.place}_${context.itemCategory}`;
    }

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
            
            // Check against all previously generated problems
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

// PDF Generator with Enhanced Features
class PDFGenerator {
    constructor() {
        this.problemGenerator = new ProblemGenerator();
        this.progressManager = new ProgressManager();
    }

    async generatePDFs(formData) {
        this.progressManager.show();
        
        const {
            gradeLevel,
            difficulty,
            subject,
            problemType,
            operations,
            numPDFs,
            numPages,
            pdfTitle,
            studentName,
            answerKey
        } = formData;

        this.problemGenerator.setConfig(gradeLevel, difficulty, subject);
        this.problemGenerator.clearUsedProblems();

        const zip = new JSZip();
        const totalPDFs = parseInt(numPDFs);
        
        for (let i = 0; i < totalPDFs; i++) {
            this.progressManager.updateProgress(
                (i / totalPDFs) * 100, 
                `Generating PDF ${i + 1} of ${totalPDFs}...`
            );
            
            const doc = new jsPDF();
            const answers = [];
            let totalQuestions = 0;

            // Generate PDF pages
            for (let p = 0; p < numPages; p++) {
                if (p !== 0) {
                    doc.addPage();
                }

                this.addHeader(doc, pdfTitle, studentName === 'yes', p + 1, numPages);

                let pageType = problemType;
                if (problemType === "mixed") {
                    pageType = p % 2 === 0 ? "equations" : "word";
                }

                if (pageType === "equations") {
                    const pageAnswers = this.addEquationsPage(doc, operations, 20, formData);
                    answers.push(...pageAnswers);
                    totalQuestions += pageAnswers.length;
                } else {
                    const pageAnswers = this.addWordProblemsPage(doc, operations, 4, formData);
                    answers.push(...pageAnswers);
                    totalQuestions += pageAnswers.length;
                }
            }

            // Add answer key if requested
            if (answerKey === 'separate') {
                this.addAnswerKey(doc, answers);
            }

            zip.file(`${pdfTitle.replace(/\s+/g, '_')}_${i + 1}.pdf`, doc.output('blob'));
        }

        this.progressManager.updateProgress(100, 'Finalizing download...');

        // Generate and download ZIP
        const content = await zip.generateAsync({type: "blob"});
        saveAs(content, `${pdfTitle.replace(/\s+/g, '_')}_worksheets.zip`);
        
        this.progressManager.hide();
    }

    addHeader(doc, title, includeNameField, pageNum, totalPages) {
        // Add border around the page
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, 190, 277);
        
        // Title with decorative line
        doc.setFontSize(24);
        doc.setTextColor(0, 102, 204);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 105, 25, null, null, 'center');
        
        // Decorative line under title
        doc.setLineWidth(1);
        doc.setDrawColor(0, 102, 204);
        doc.line(30, 30, 180, 30);
        
        // Name and date fields
        if (includeNameField) {
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.text("Name:", 20, 45);
            doc.line(35, 45, 100, 45);
            
            doc.text("Date:", 130, 45);
            doc.line(145, 45, 190, 45);
            
            doc.text("Score:", 20, 55);
            doc.line(40, 55, 80, 55);
            
            doc.text("Grade:", 130, 55);
            doc.line(150, 55, 190, 55);
        }

        // Page number with decorative border
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.rect(95, 275, 20, 8);
        doc.text(`${pageNum}/${totalPages}`, 105, 281, null, null, 'center');
        
        // Reset font
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
    }

    addEquationsPage(doc, operations, numProblems, formData) {
        const answers = [];
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        
        const startY = 70; // Start after header
        const spacing = 16; // Better spacing between problems
        const leftColumn = 25;
        const rightColumn = 115;

        for (let j = 0; j < numProblems; j++) {
            const randomOperation = operations[Math.floor(Math.random() * operations.length)];
            const { question, answer } = this.problemGenerator.generateUniqueProblem(randomOperation, 'equations', formData.topics);
            answers.push(answer);
            
            const x = (j % 2 === 0) ? leftColumn : rightColumn;
            const y = startY + Math.floor(j / 2) * spacing;
            
            // Add problem number with circle
            doc.setFontSize(11);
            doc.circle(x - 3, y - 2, 3);
            doc.text(`${j + 1}`, x - 3, y + 1, null, null, 'center');
            
            // Add equation with better spacing
            doc.setFontSize(13);
            doc.text(question, x + 8, y + 1);
            
            // Add answer line
            doc.setLineWidth(0.3);
            doc.line(x + 8 + doc.getTextWidth(question) + 3, y + 1, x + 75, y + 1);
        }

        return answers;
    }

    addWordProblemsPage(doc, operations, numProblems, formData) {
        const answers = [];
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        
        const startY = 70;
        const problemSpacing = 48;

        for (let j = 0; j < numProblems; j++) {
            const randomOperation = operations[Math.floor(Math.random() * operations.length)];
            const { question, answer } = this.problemGenerator.generateUniqueProblem(randomOperation, 'word', formData.topics);
            answers.push(answer);
            
            const y = startY + j * problemSpacing;
            
            // Add problem number in a box
            doc.setFontSize(10);
            doc.setFillColor(240, 240, 240);
            doc.rect(20, y - 8, 15, 8, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text(`${j + 1}`, 27.5, y - 2, null, null, 'center');
            
            // Add question with better formatting
            doc.setFontSize(11);
            const splitQuestion = doc.splitTextToSize(question, 165);
            doc.text(splitQuestion, 40, y);
            
            // Add answer box
            const answerBoxY = y + splitQuestion.length * 4.5 + 8;
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(0.5);
            
            // Answer label
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text("Answer:", 40, answerBoxY);
            
            // Answer lines
            doc.line(62, answerBoxY, 180, answerBoxY);
            doc.line(40, answerBoxY + 8, 180, answerBoxY + 8);
            doc.line(40, answerBoxY + 16, 120, answerBoxY + 16);
            
            // Reset colors
            doc.setTextColor(0, 0, 0);
            doc.setDrawColor(0, 0, 0);
        }

        return answers;
    }

    addAnswerKey(doc, answers) {
        doc.addPage();
        doc.setFontSize(20);
        doc.setTextColor(0, 102, 204);
        doc.text("Answer Key", 105, 20, null, null, 'center');
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        for (let idx = 0; idx < answers.length; idx++) {
            const x = 20 + (idx % 3) * 60;
            const y = 40 + Math.floor(idx / 3) * 8;
            doc.text(`${idx + 1}) ${answers[idx]}`, x, y);
        }
    }

    generatePreview(formData) {
        const { gradeLevel, difficulty, subject, problemType, operations, topics } = formData;
        
        this.problemGenerator.setConfig(gradeLevel, difficulty, subject);
        
        const previewContent = document.getElementById('preview-content');
        const problems = [];
        
        // Generate a full page worth of problems (20 for equations, 8 for word problems)
        const numProblems = problemType === 'word' ? 8 : (problemType === 'equations' ? 20 : 14);
        
        for (let i = 0; i < numProblems; i++) {
            // For mixed problem types, alternate between equations and word problems
            let currentProblemType = problemType;
            if (problemType === 'mixed') {
                currentProblemType = i % 2 === 0 ? 'equations' : 'word';
            }
            
            // Select random operation from the selected operations for each problem
            const randomOperation = operations[Math.floor(Math.random() * operations.length)];
            const problem = this.problemGenerator.generateUniqueProblem(randomOperation, currentProblemType, topics);
            
            if (currentProblemType === 'word') {
                problems.push(`${i + 1}. ${problem.question}\n\n   Answer: ${problem.answer}\n`);
            } else {
                problems.push(`${i + 1}. ${problem.question} = _____     (${problem.answer})`);
            }
        }
        
        const operationText = operations.length === 1 ? operations[0] : `Mixed (${operations.join(', ')})`;
        const difficultyText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        
        let topicText = 'All Topics';
        if (topics !== 'all' && topics.length > 0) {
            const subjectTopics = SUBJECT_TOPICS[subject]?.topics || {};
            const topicNames = topics.map(topic => {
                const topicData = subjectTopics[topic];
                return typeof topicData === 'string' ? topicData : topicData?.name || topic;
            });
            topicText = topicNames.length === 1 ? topicNames[0] : `Selected (${topicNames.join(', ')})`;
        }
        
        const previewHeader = `
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--secondary-bg); border-radius: 8px;">
                <h4 style="margin: 0 0 0.5rem 0; color: var(--accent-color);">Preview: Full Page Sample</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; font-size: 0.9rem;">
                    <div><strong>Grade:</strong> ${GRADE_CONFIGS[gradeLevel]?.name}</div>
                    <div><strong>Subject:</strong> ${SUBJECT_TOPICS[subject]?.name}</div>
                    <div><strong>Difficulty:</strong> ${difficultyText}</div>
                    <div><strong>Problem Type:</strong> ${problemType === 'mixed' ? 'Mixed Format' : problemType}</div>
                    <div><strong>Topics:</strong> ${topicText}</div>
                    <div><strong>Operations:</strong> ${operationText}</div>
                    <div><strong>Problems:</strong> ${numProblems} questions</div>
                </div>
            </div>
        `;
        
        const problemsDisplay = problemType === 'word' 
            ? problems.join('\n') 
            : problems.reduce((acc, problem, index) => {
                if (index % 2 === 0) {
                    const nextProblem = problems[index + 1] || '';
                    acc += `${problem.padEnd(40)} ${nextProblem}\n`;
                    return acc;
                } else if (index === problems.length - 1) {
                    acc += problem + '\n';
                }
                return acc;
            }, '');
        
        previewContent.innerHTML = `${previewHeader}<pre style="max-height: 400px; overflow-y: auto; font-size: 0.85rem; line-height: 1.4;">${problemsDisplay}</pre>`;
        document.getElementById('preview-container').style.display = 'block';
    }
}

// Form Management
class FormManager {
    constructor() {
        this.form = document.getElementById('pdfForm');
        this.pdfGenerator = new PDFGenerator();
        this.initializeForm();
    }

    initializeForm() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Preview button
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.handlePreview();
        });

        // Dynamic form updates
        document.getElementById('gradeLevel').addEventListener('change', () => {
            this.updateSubjectOptions();
        });

        document.getElementById('subject').addEventListener('change', () => {
            this.updateTopicOptions();
            this.updateOperationTypesForSubject();
            this.updateProblemTypeForSubject();
        });

        // Difficulty slider update
        document.getElementById('difficulty').addEventListener('input', (e) => {
            this.updateDifficultyLabel(e.target.value);
        });

        // Topic selection handlers
        document.addEventListener('change', (e) => {
            if (e.target.id === 'topic-all') {
                this.handleAllTopicsToggle(e.target.checked);
            } else if (e.target.classList.contains('topic-checkbox')) {
                this.handleIndividualTopicToggle();
            }
        });

        // Configuration management handlers
        document.getElementById('saveConfigBtn').addEventListener('click', () => {
            this.saveConfiguration();
        });

        document.getElementById('loadConfigBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleConfigDropdown();
        });

        // Click outside to close dropdown
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.config-dropdown')) {
                this.closeConfigDropdown();
            }
        });

        // Initialize subject and topic options
        this.updateSubjectOptions();
        this.updateTopicOptions();
        
        // Initialize configuration system
        this.configManager = new ConfigurationManager();
        this.configManager.loadConfigurations();
        this.updateConfigDropdown();
    }

    updateDifficultyLabel(value) {
        const difficultyLabel = document.getElementById('difficultyLabel');
        const difficulties = ['Easy', 'Medium', 'Hard'];
        difficultyLabel.textContent = difficulties[parseInt(value) - 1];
    }

    updateSubjectOptions() {
        const gradeLevel = document.getElementById('gradeLevel').value;
        const subjectSelect = document.getElementById('subject');
        const availableSubjects = GRADE_CONFIGS[gradeLevel].subjects;
        
        // Clear current options
        subjectSelect.innerHTML = '';
        
        // Add available subjects
        const subjectNames = {
            arithmetic: 'Basic Arithmetic',
            algebra: 'Algebra',
            geometry: 'Geometry', 
            statistics: 'Statistics & Probability',
            trigonometry: 'Trigonometry',
            calculus: 'Calculus'
        };
        
        availableSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subjectNames[subject];
            subjectSelect.appendChild(option);
        });
        
        // Update operation types and problem type based on subject
        this.updateOperationTypesForSubject();
        this.updateProblemTypeForSubject();
        this.updateTopicOptions(); // Refresh topics for new grade level
    }

    updateTopicOptions() {
        const subject = document.getElementById('subject').value;
        const gradeLevel = document.getElementById('gradeLevel').value;
        const topicContainer = document.getElementById('topicSelection');
        
        if (!subject || !SUBJECT_TOPICS[subject]) {
            return;
        }

        const allTopics = SUBJECT_TOPICS[subject].topics;
        
        // Filter topics by grade level
        const gradeAppropriateTopics = Object.entries(allTopics).filter(([key, topicData]) => {
            // Handle both old format (string) and new format (object with grades)
            if (typeof topicData === 'string') {
                return true; // Keep old topics for backward compatibility
            }
            return topicData.grades && topicData.grades.includes(gradeLevel);
        });
        
        // Clear existing topics (except "All Topics")
        topicContainer.innerHTML = `
            <label class="topic-label">
                <input type="checkbox" value="all" id="topic-all" checked>
                <span class="checkbox-custom"></span>
                All Topics
            </label>
        `;
        
        // Add individual grade-appropriate topics with stagger animation
        gradeAppropriateTopics.forEach(([key, topicData], index) => {
            const label = document.createElement('label');
            label.className = 'topic-label';
            label.style.opacity = '0';
            label.style.transform = 'translateY(20px)';
            
            // Handle both old and new format
            const topicName = typeof topicData === 'string' ? topicData : topicData.name;
            
            label.innerHTML = `
                <input type="checkbox" value="${key}" class="topic-checkbox" disabled>
                <span class="checkbox-custom"></span>
                ${topicName}
            `;
            topicContainer.appendChild(label);
            
            // Stagger animation
            setTimeout(() => {
                label.style.opacity = '1';
                label.style.transform = 'translateY(0)';
            }, index * 50 + 100);
        });
    }

    handleAllTopicsToggle(checked) {
        const topicCheckboxes = document.querySelectorAll('.topic-checkbox');
        topicCheckboxes.forEach(checkbox => {
            checkbox.disabled = checked;
            if (checked) {
                checkbox.checked = false;
            }
        });
    }

    handleIndividualTopicToggle() {
        const allTopicsCheckbox = document.getElementById('topic-all');
        const topicCheckboxes = document.querySelectorAll('.topic-checkbox');
        const anyTopicSelected = Array.from(topicCheckboxes).some(cb => cb.checked);
        
        if (anyTopicSelected) {
            allTopicsCheckbox.checked = false;
        }
    }
    
    updateOperationTypesForSubject() {
        const subject = document.getElementById('subject').value;
        const operationGroup = document.querySelector('.checkbox-group');
        const operationSection = operationGroup.closest('.form-group');
        
        // Operations are relevant for all subjects, just with different context
        // Always show operations but adjust their meaning
        operationSection.style.maxHeight = 'none';
        operationSection.style.opacity = '1';
        operationSection.style.transform = 'translateY(0)';
        operationSection.style.overflow = 'visible';
        
        // Update operation labels based on subject context
        this.updateOperationLabelsForSubject(subject);
    }
    
    updateOperationLabelsForSubject(subject) {
        const operationLabels = {
            arithmetic: {
                addition: 'Addition',
                subtraction: 'Subtraction', 
                multiplication: 'Multiplication',
                division: 'Division'
            },
            algebra: {
                addition: 'Linear Combinations',
                subtraction: 'Solving Equations',
                multiplication: 'Expanding & Factoring', 
                division: 'Rational Expressions'
            },
            geometry: {
                addition: 'Perimeter & Sum',
                subtraction: 'Difference & Complement',
                multiplication: 'Area & Volume',
                division: 'Ratios & Proportions'
            },
            statistics: {
                addition: 'Data Summation',
                subtraction: 'Differences & Variations',
                multiplication: 'Probability & Combinations',
                division: 'Averages & Rates'
            },
            trigonometry: {
                addition: 'Angle Addition',
                subtraction: 'Angle Difference',
                multiplication: 'Multiple Angles',
                division: 'Half Angles'
            },
            calculus: {
                addition: 'Sum Rules',
                subtraction: 'Difference Rules', 
                multiplication: 'Product Rules',
                division: 'Quotient Rules'
            }
        };
        
        // Update checkbox labels (keep this simple for now, could be enhanced later)
        const checkboxes = document.querySelectorAll('.checkbox-label');
        const currentLabels = operationLabels[subject] || operationLabels.arithmetic;
        
        // For now, just keep original labels but know the context changed
    }
    
    updateProblemTypeForSubject() {
        const subject = document.getElementById('subject').value;
        const gradeLevel = document.getElementById('gradeLevel').value;
        const problemTypeSelect = document.getElementById('problemType');
        
        // All subjects can have different problem types - don't restrict
        problemTypeSelect.disabled = false;
        
        // Set smart defaults based on subject, but allow user to change
        const subjectDefaults = {
            arithmetic: 'mixed',      // Mix of equations and word problems
            algebra: 'equations',     // Start with equations but allow word problems
            geometry: 'mixed',        // Geometry works great with both
            statistics: 'word',       // Statistics is often word-problem heavy
            trigonometry: 'equations', // Usually equations but word problems exist
            calculus: 'equations'     // Usually equations but applications exist
        };
        
        // Only set default if current selection doesn't make sense
        const currentValue = problemTypeSelect.value;
        if (!currentValue || currentValue === '') {
            problemTypeSelect.value = subjectDefaults[subject] || 'mixed';
        }
        
        // Update problem type options based on grade level
        this.updateAvailableProblemTypes(gradeLevel);
    }
    
    updateAvailableProblemTypes(gradeLevel) {
        const problemTypeSelect = document.getElementById('problemType');
        const availableTypes = GRADE_CONFIGS[gradeLevel]?.problemTypes || ['equations', 'word', 'mixed'];
        
        // Store current selection
        const currentValue = problemTypeSelect.value;
        
        // Clear and repopulate options
        problemTypeSelect.innerHTML = '';
        
        const typeLabels = {
            equations: 'Equations Only',
            word: 'Word Problems Only', 
            mixed: 'Mixed (Alternating Pages)',
            story: 'Story Problems'
        };
        
        availableTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = typeLabels[type];
            problemTypeSelect.appendChild(option);
        });
        
        // Restore selection if still available
        if (availableTypes.includes(currentValue)) {
            problemTypeSelect.value = currentValue;
        }
    }

    getFormData() {
        // Get selected operations from checkboxes
        const operationCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="op-"]');
        const selectedOperations = Array.from(operationCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        
        // Get selected topics
        const allTopicsChecked = document.getElementById('topic-all').checked;
        let selectedTopics = [];
        
        if (!allTopicsChecked) {
            const topicCheckboxes = document.querySelectorAll('.topic-checkbox');
            selectedTopics = Array.from(topicCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
        }
        
        // Convert difficulty slider value to string
        const difficultyValue = document.getElementById('difficulty').value;
        const difficultyMap = { '1': 'easy', '2': 'medium', '3': 'hard' };
        
        return {
            gradeLevel: document.getElementById('gradeLevel').value,
            difficulty: difficultyMap[difficultyValue] || 'medium',
            subject: document.getElementById('subject').value,
            topics: allTopicsChecked ? 'all' : selectedTopics,
            problemType: document.getElementById('problemType').value,
            operations: selectedOperations.length > 0 ? selectedOperations : ['addition', 'subtraction', 'multiplication', 'division'],
            numPDFs: parseInt(document.getElementById('numPDFs').value),
            numPages: parseInt(document.getElementById('numPages').value),
            pdfTitle: document.getElementById('pdfTitle').value.trim(),
            studentName: document.getElementById('studentName').value,
            answerKey: document.getElementById('answerKey').value
        };
    }

    validateFormData(formData) {
        const errors = [];
        
        // Validate operations
        if (formData.operations.length === 0) {
            errors.push({
                field: 'operations',
                message: 'Please select at least one operation type.'
            });
        }
        
        // Validate topics (only if not "all topics")
        if (formData.topics !== 'all' && formData.topics.length === 0) {
            errors.push({
                field: 'topics',
                message: 'Please select at least one topic or choose "All Topics".'
            });
        }
        
        // Validate PDF count
        if (formData.numPDFs < 1 || formData.numPDFs > 100) {
            errors.push({
                field: 'numPDFs',
                message: 'Number of PDFs must be between 1 and 100.'
            });
        }
        
        // Validate pages per PDF
        if (formData.numPages < 1 || formData.numPages > 50) {
            errors.push({
                field: 'numPages',
                message: 'Pages per PDF must be between 1 and 50.'
            });
        }
        
        // Validate PDF title
        if (!formData.pdfTitle || formData.pdfTitle.length < 3) {
            errors.push({
                field: 'pdfTitle',
                message: 'Worksheet title must be at least 3 characters long.'
            });
        }
        
        // Warn about large generations
        if (formData.numPDFs * formData.numPages > 100) {
            errors.push({
                field: 'generation-size',
                message: 'Warning: Generating many pages may take a long time. Consider reducing the number of PDFs or pages per PDF.',
                type: 'warning'
            });
        }
        
        return errors;
    }

    showValidationErrors(errors) {
        // Clear previous errors
        this.clearValidationErrors();
        
        errors.forEach(error => {
            const fieldElement = this.getFieldElement(error.field);
            if (fieldElement) {
                this.addErrorToField(fieldElement, error.message, error.type);
            } else {
                // Show general error
                this.showGeneralError(error.message, error.type);
            }
        });
    }

    clearValidationErrors() {
        // Remove all error messages
        document.querySelectorAll('.error-message, .warning-message').forEach(el => el.remove());
        
        // Remove error styling
        document.querySelectorAll('.error, .warning').forEach(el => {
            el.classList.remove('error', 'warning');
        });
    }

    getFieldElement(fieldName) {
        switch (fieldName) {
            case 'operations':
                return document.querySelector('.checkbox-group');
            case 'topics':
                return document.getElementById('topicSelection');
            case 'numPDFs':
                return document.getElementById('numPDFs');
            case 'numPages':
                return document.getElementById('numPages');
            case 'pdfTitle':
                return document.getElementById('pdfTitle');
            default:
                return null;
        }
    }

    addErrorToField(fieldElement, message, type = 'error') {
        const errorClass = type === 'warning' ? 'warning' : 'error';
        const messageClass = type === 'warning' ? 'warning-message' : 'error-message';
        
        // Add styling to field
        fieldElement.classList.add(errorClass);
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = `${messageClass} form-help`;
        errorElement.textContent = message;
        errorElement.style.color = type === 'warning' ? 'var(--warning-color)' : 'var(--error-color)';
        errorElement.style.fontWeight = '500';
        errorElement.style.marginTop = '0.5rem';
        
        // Insert after the field
        fieldElement.parentNode.appendChild(errorElement);
    }

    showGeneralError(message, type = 'error') {
        const alertClass = type === 'warning' ? 'warning-alert' : 'error-alert';
        const alertColor = type === 'warning' ? 'var(--warning-color)' : 'var(--error-color)';
        
        const alertElement = document.createElement('div');
        alertElement.className = `${alertClass} form-help`;
        alertElement.style.cssText = `
            background: ${alertColor}20;
            border: 1px solid ${alertColor};
            color: ${alertColor};
            padding: 0.75rem;
            border-radius: 8px;
            margin: 1rem 0;
            font-weight: 500;
        `;
        alertElement.textContent = message;
        
        // Insert at top of form
        const form = document.getElementById('pdfForm');
        form.insertBefore(alertElement, form.firstChild);
    }

    handleFormSubmit() {
        const formData = this.getFormData();
        
        // Validate form data
        const validationErrors = this.validateFormData(formData);
        if (validationErrors.length > 0) {
            this.showValidationErrors(validationErrors);
            return;
        }
        
        // Clear any previous validation errors
        this.clearValidationErrors();
        
        // Disable form during generation
        this.setFormEnabled(false);
        
        this.pdfGenerator.generatePDFs(formData).then(() => {
            this.setFormEnabled(true);
        }).catch(error => {
            console.error('Error generating PDFs:', error);
            this.showGeneralError('An error occurred while generating PDFs. Please try again.', 'error');
            this.setFormEnabled(true);
        });
    }

    handlePreview() {
        const formData = this.getFormData();
        
        // Basic validation for preview (less strict)
        const basicErrors = this.validateFormData(formData).filter(error => 
            !['generation-size', 'numPDFs', 'numPages'].includes(error.field)
        );
        
        if (basicErrors.length > 0) {
            this.showValidationErrors(basicErrors);
            return;
        }
        
        this.clearValidationErrors();
        this.pdfGenerator.generatePreview(formData);
    }

    saveConfiguration() {
        const formData = this.getFormData();
        const configName = prompt('Enter a name for this configuration:', formData.pdfTitle + ' - ' + formData.subject);
        
        if (configName) {
            const config = {
                name: configName.trim(),
                data: formData,
                created: new Date().toISOString(),
                id: Date.now().toString()
            };
            
            this.configManager.saveConfiguration(config);
            this.updateConfigDropdown();
            this.showGeneralError(`Configuration "${configName}" saved successfully!`, 'success');
        }
    }

    loadConfiguration(config) {
        this.setFormData(config.data);
        this.closeConfigDropdown();
        this.showGeneralError(`Configuration "${config.name}" loaded successfully!`, 'success');
    }

    setFormData(data) {
        // Set form values from configuration
        document.getElementById('gradeLevel').value = data.gradeLevel;
        document.getElementById('difficulty').value = data.difficulty === 'easy' ? '1' : data.difficulty === 'hard' ? '3' : '2';
        document.getElementById('subject').value = data.subject;
        document.getElementById('problemType').value = data.problemType;
        document.getElementById('numPDFs').value = data.numPDFs;
        document.getElementById('numPages').value = data.numPages;
        document.getElementById('pdfTitle').value = data.pdfTitle;
        document.getElementById('studentName').value = data.studentName;
        document.getElementById('answerKey').value = data.answerKey;

        // Update difficulty label
        this.updateDifficultyLabel(document.getElementById('difficulty').value);

        // Update operations
        const operationCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="op-"]');
        operationCheckboxes.forEach(checkbox => {
            checkbox.checked = data.operations.includes(checkbox.value);
        });

        // Update subjects and topics
        this.updateSubjectOptions();
        this.updateTopicOptions();
        
        // Set topics after a brief delay to allow DOM updates
        setTimeout(() => {
            if (data.topics === 'all') {
                document.getElementById('topic-all').checked = true;
                this.handleAllTopicsToggle(true);
            } else {
                document.getElementById('topic-all').checked = false;
                const topicCheckboxes = document.querySelectorAll('.topic-checkbox');
                topicCheckboxes.forEach(checkbox => {
                    checkbox.disabled = false;
                    checkbox.checked = data.topics.includes(checkbox.value);
                });
            }
        }, 100);
    }

    toggleConfigDropdown() {
        const dropdown = document.getElementById('configDropdown');
        dropdown.classList.toggle('show');
    }

    closeConfigDropdown() {
        const dropdown = document.getElementById('configDropdown');
        dropdown.classList.remove('show');
    }

    updateConfigDropdown() {
        const recentConfigs = document.getElementById('recentConfigs');
        const templates = document.getElementById('templates');
        
        const configs = this.configManager.getConfigurations();
        const templateConfigs = this.configManager.getTemplates();
        
        // Update recent configurations
        recentConfigs.innerHTML = '';
        if (configs.length === 0) {
            recentConfigs.innerHTML = '<div style="padding: 1rem; color: var(--secondary-text); text-align: center;">No saved configurations</div>';
        } else {
            configs.forEach(config => {
                const configElement = this.createConfigElement(config, false);
                recentConfigs.appendChild(configElement);
            });
        }

        // Update templates
        templates.innerHTML = '';
        templateConfigs.forEach(template => {
            const templateElement = this.createConfigElement(template, true);
            templates.appendChild(templateElement);
        });
    }

    createConfigElement(config, isTemplate) {
        const element = document.createElement('div');
        element.className = 'config-item';
        
        const date = new Date(config.created).toLocaleDateString();
        const details = `${config.data.subject} • ${config.data.gradeLevel} • ${date}`;
        
        element.innerHTML = `
            <div class="config-info">
                <div class="config-name">${config.name}</div>
                <div class="config-details">${details}</div>
            </div>
            <div class="config-actions">
                <button class="config-action load" onclick="formManager.loadConfiguration(${JSON.stringify(config).replace(/"/g, '&quot;')})">Load</button>
                ${!isTemplate ? `<button class="config-action delete" onclick="formManager.deleteConfiguration('${config.id}')">Delete</button>` : ''}
            </div>
        `;
        
        return element;
    }

    deleteConfiguration(configId) {
        if (confirm('Are you sure you want to delete this configuration?')) {
            this.configManager.deleteConfiguration(configId);
            this.updateConfigDropdown();
        }
    }

    setFormEnabled(enabled) {
        const inputs = this.form.querySelectorAll('input, select, button');
        inputs.forEach(input => {
            input.disabled = !enabled;
        });
    }
}

// Configuration Management System
class ConfigurationManager {
    constructor() {
        this.storageKey = 'mathgen-configurations';
        this.templatesKey = 'mathgen-templates';
        this.maxConfigs = 10; // Limit to prevent localStorage bloat
    }

    loadConfigurations() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.configurations = stored ? JSON.parse(stored) : [];
            
            const templates = localStorage.getItem(this.templatesKey);
            this.templates = templates ? JSON.parse(templates) : this.getDefaultTemplates();
            
            // Save default templates if they don't exist
            if (!templates) {
                this.saveTemplates();
            }
        } catch (error) {
            console.error('Error loading configurations:', error);
            this.configurations = [];
            this.templates = this.getDefaultTemplates();
        }
    }

    saveConfiguration(config) {
        // Add to beginning of array
        this.configurations.unshift(config);
        
        // Limit number of stored configurations
        if (this.configurations.length > this.maxConfigs) {
            this.configurations = this.configurations.slice(0, this.maxConfigs);
        }
        
        this.saveConfigurations();
    }

    saveConfigurations() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.configurations));
        } catch (error) {
            console.error('Error saving configurations:', error);
        }
    }

    saveTemplates() {
        try {
            localStorage.setItem(this.templatesKey, JSON.stringify(this.templates));
        } catch (error) {
            console.error('Error saving templates:', error);
        }
    }

    getConfigurations() {
        return this.configurations || [];
    }

    getTemplates() {
        return this.templates || [];
    }

    deleteConfiguration(configId) {
        this.configurations = this.configurations.filter(config => config.id !== configId);
        this.saveConfigurations();
    }

    getDefaultTemplates() {
        return [
            {
                id: 'template-elementary-basic',
                name: 'Elementary - Basic Math',
                created: '2024-01-01T00:00:00.000Z',
                data: {
                    gradeLevel: 'elementary',
                    difficulty: 'easy',
                    subject: 'arithmetic',
                    topics: 'all',
                    problemType: 'mixed',
                    operations: ['addition', 'subtraction'],
                    numPDFs: 3,
                    numPages: 2,
                    pdfTitle: 'Elementary Math Practice',
                    studentName: 'yes',
                    answerKey: 'separate'
                }
            },
            {
                id: 'template-middle-fractions',
                name: 'Middle School - Fractions',
                created: '2024-01-01T00:00:00.000Z',
                data: {
                    gradeLevel: 'middle',
                    difficulty: 'medium',
                    subject: 'arithmetic',
                    topics: ['fractions'],
                    problemType: 'equations',
                    operations: ['addition', 'subtraction', 'multiplication'],
                    numPDFs: 5,
                    numPages: 3,
                    pdfTitle: 'Fraction Practice Worksheets',
                    studentName: 'yes',
                    answerKey: 'separate'
                }
            },
            {
                id: 'template-high-algebra',
                name: 'High School - Algebra',
                created: '2024-01-01T00:00:00.000Z',
                data: {
                    gradeLevel: 'high',
                    difficulty: 'medium',
                    subject: 'algebra',
                    topics: 'all',
                    problemType: 'equations',
                    operations: ['addition', 'subtraction', 'multiplication', 'division'],
                    numPDFs: 5,
                    numPages: 4,
                    pdfTitle: 'Algebra Practice Problems',
                    studentName: 'yes',
                    answerKey: 'separate'
                }
            },
            {
                id: 'template-word-problems',
                name: 'Mixed - Word Problems',
                created: '2024-01-01T00:00:00.000Z',
                data: {
                    gradeLevel: 'middle',
                    difficulty: 'medium',
                    subject: 'arithmetic',
                    topics: ['word-problems'],
                    problemType: 'word',
                    operations: ['addition', 'subtraction', 'multiplication', 'division'],
                    numPDFs: 3,
                    numPages: 2,
                    pdfTitle: 'Word Problem Challenge',
                    studentName: 'yes',
                    answerKey: 'separate'
                }
            }
        ];
    }
}

// Make formManager globally accessible for onclick handlers
let formManager;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    new ThemeManager();
    formManager = new FormManager();
    
    // Add feature card animations
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.setProperty('--delay', index);
    });
    
    console.log('Math PDF Generator Pro - Enhanced Version Loaded');
});