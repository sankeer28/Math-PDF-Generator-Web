function generateRandomFilename() {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    return Array.from({length: 10}, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}


function generateEquation(operation) {
    let question = "";
    let answer = 0;
    let num1, num2, num3;

    switch(operation) {
        case "addition":
            num1 = Math.floor(Math.random() * 1000) + 1;
            num2 = Math.floor(Math.random() * 1000) + 1;
            question = `${num1} + ${num2} = `;
            answer = num1 + num2;
            break;
        case "subtraction":
            num1 = Math.floor(Math.random() * 1000) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            question = `${num1} - ${num2} = `;
            answer = num1 - num2;
            break;
        case "multiplication":
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * 100) + 1;
            question = `${num1} × ${num2} = `;
            answer = num1 * num2;
            break;
        case "division":
            num2 = Math.floor(Math.random() * 20) + 1;
            answer = Math.floor(Math.random() * 50) + 1;
            num1 = num2 * answer;
            question = `${num1} ÷ ${num2} = `;
            break;
        case "mixed":
            const operations = ["addition", "subtraction", "multiplication", "division"];
            return generateEquation(operations[Math.floor(Math.random() * operations.length)]);
    }

    return { question, answer };
}

const usedProblems = new Set();

function generateWordProblem(operation) {
    let problem;
    let attempts = 0;
    const maxAttempts = 100; 

    do {
        problem = generateUniqueWordProblem(operation);
        attempts++;
    } while (usedProblems.has(problem.question) && attempts < maxAttempts);

    if (attempts === maxAttempts) {
        console.warn("Warning: Reached maximum attempts to generate a unique problem.");
    } else {
        usedProblems.add(problem.question);
    }

    return problem;
}

function generateUniqueWordProblem(operation) {
    const problemTypes = [
        "standard",
        "sequence",
        "ageRelated",
        "workRate",
        "mixture",
        "brainTeaser"
    ];
    const selectedType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    
    switch (selectedType) {
        case "standard":
            return generateStandardWordProblem(operation);
        case "sequence":
            return generateSequenceProblem();
        case "ageRelated":
            return generateAgeRelatedProblem();
        case "workRate":
            return generateWorkRateProblem();
        case "mixture":
            return generateMixtureProblem();
        case "brainTeaser":
            return generateBrainTeaser();
        default:
            return generateStandardWordProblem(operation);
    }
}


function generateStandardWordProblem(operation) {
    let question = "";
    let answer = 0;
    let num1, num2, num3;

    const names = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah"];
    const items = ["books", "computers", "cars", "houses", "employees", "projects", "investments", "products"];

    const randomName = () => names[Math.floor(Math.random() * names.length)];
    const randomItem = () => items[Math.floor(Math.random() * items.length)];

    switch (operation) {
        case "addition":
            num1 = Math.floor(Math.random() * 1000) + 100;
            num2 = Math.floor(Math.random() * 1000) + 100;
            question = `${randomName()}'s company acquired ${num1} new ${randomItem()} last year. This year, they acquired ${num2} more. What is the total number of new ${randomItem()} acquired over the two years?`;
            answer = num1 + num2;
            break;

        case "subtraction":
            num1 = Math.floor(Math.random() * 10000) + 5000;
            num2 = Math.floor(Math.random() * num1) + 1000;
            question = `${randomName()}'s corporation started the year with ${num1} ${randomItem()}. Due to market conditions, they had to reduce their inventory by ${num2} units. How many ${randomItem()} do they have left?`;
            answer = num1 - num2;
            break;

        case "multiplication":
            num1 = Math.floor(Math.random() * 100) + 20;
            num2 = Math.floor(Math.random() * 100) + 20;
            question = `${randomName()}'s factory produces ${num1} ${randomItem()} per hour. If the factory operates for ${num2} hours, how many ${randomItem()} will be produced in total?`;
            answer = num1 * num2;
            break;

        case "division":
            num2 = Math.floor(Math.random() * 50) + 10;
            answer = Math.floor(Math.random() * 100) + 20;
            num1 = num2 * answer;
            question = `${randomName()}'s company needs to distribute ${num1} ${randomItem()} equally among ${num2} departments. How many ${randomItem()} will each department receive?`;
            break;

        case "addition2":
            num1 = Math.floor(Math.random() * 500) + 100;
            num2 = Math.floor(Math.random() * 300) + 50;
            question = `${randomName()} organized ${num1} ${randomItem()} in the first quarter and ${num2} ${randomItem()} in the second quarter. What is the total number of ${randomItem()} organized?`;
            answer = num1 + num2;
            break;

        case "subtraction2":
            num1 = Math.floor(Math.random() * 10000) + 5000;
            num2 = Math.floor(Math.random() * 5000) + 1000;
            question = `${randomName()}'s warehouse had ${num1} ${randomItem()} at the beginning of the month. After selling ${num2} units, how many ${randomItem()} are left?`;
            answer = num1 - num2;
            break;

        case "multiplication2":
            num1 = Math.floor(Math.random() * 50) + 10;
            num2 = Math.floor(Math.random() * 10) + 1;
            question = `If ${randomName()} can produce ${num1} ${randomItem()} in a day, how many ${randomItem()} can they produce in ${num2} days?`;
            answer = num1 * num2;
            break;

        case "division2":
            num1 = Math.floor(Math.random() * 5000) + 1000;
            num2 = Math.floor(Math.random() * 100) + 1;
            question = `${randomName()} has ${num1} ${randomItem()} that they want to distribute among ${num2} stores. How many ${randomItem()} will each store receive?`;
            answer = Math.floor(num1 / num2); 
            break;

        case "mixed":
            const operations = ["addition", "subtraction", "multiplication", "division", "addition2", "subtraction2", "multiplication2", "division2"];
            return generateStandardWordProblem(operations[Math.floor(Math.random() * operations.length)]);
    }

    return { question, answer };
}


function generateSequenceProblem() {
    const sequences = [
        {
            pattern: n => n * 2,
            description: "doubles",
            length: 5
        },
        {
            pattern: n => n * n,
            description: "squares",
            length: 5
        },
        {
            pattern: n => n * (n + 1) / 2,
            description: "triangular numbers",
            length: 5
        }
    ];
    
    const selectedSequence = sequences[Math.floor(Math.random() * sequences.length)];
    const sequence = Array.from({length: selectedSequence.length}, (_, i) => selectedSequence.pattern(i + 1));
    
    const question = `What is the next number in the sequence of ${selectedSequence.description}: ${sequence.join(', ')}, ...?`;
    const answer = selectedSequence.pattern(selectedSequence.length + 1);
    
    return { question, answer };
}

function generateAgeRelatedProblem() {
    const currentAge = Math.floor(Math.random() * 30) + 20;
    const yearsPassed = Math.floor(Math.random() * 20) + 5;
    const ratio = Math.floor(Math.random() * 3) + 2;
    const problemType = Math.floor(Math.random() * 4); 
    let question, answer;

    switch (problemType) {
        case 0:
            question = `A person is currently ${currentAge} years old. In ${yearsPassed} years, they will be ${ratio} times as old as they were ${yearsPassed} years ago. How old were they ${yearsPassed} years ago?`;
            answer = (currentAge - yearsPassed) / (ratio - 1);
            break;

        case 1:
            const timeShift = Math.floor(Math.random() * 30) + 10;
            const futureOrPast = Math.random() < 0.5 ? 'years ago' : 'years from now';
            if (futureOrPast === 'years ago') {
                question = `A person is currently ${currentAge} years old. How old were they ${timeShift} years ago?`;
                answer = currentAge - timeShift;
            } else {
                question = `A person is currently ${currentAge} years old. How old will they be ${timeShift} years from now?`;
                answer = currentAge + timeShift;
            }
            break;

        case 2:
            const ageDifference = Math.floor(Math.random() * 10) + 5;
            const person2Age = currentAge + ageDifference;
            question = `Person A is currently ${currentAge} years old, and Person B is ${ageDifference} years older. In ${yearsPassed} years, Person B will be ${ratio} times as old as Person A was ${yearsPassed} years ago. How old is Person A now?`;
            answer = currentAge;
            break;

        case 3:
            const futureYears = Math.floor(Math.random() * 20) + 5;
            question = `A person is currently ${currentAge} years old. In ${futureYears} years, their age will be ${ratio} times their age ${yearsPassed} years ago. What is their current age?`;
            answer = (currentAge + futureYears) / (ratio + (yearsPassed / futureYears));
            break;
    }

    return { question, answer: Math.round(answer) };
}


function generateWorkRateProblem() {
    const totalWork = Math.floor(Math.random() * 100) + 50;
    const rate1 = Math.floor(Math.random() * 10) + 5;
    const rate2 = Math.floor(Math.random() * 10) + 5;
    
    const question = `Alice can complete a project in ${rate1} days, while Bob can complete the same project in ${rate2} days. If they work together, how many days will it take them to complete ${totalWork} such projects?`;
    const combinedRate = 1/rate1 + 1/rate2;
    const answer = Math.round((totalWork / combinedRate) * 10) / 10; 
    
    return { question, answer };
}

function generateMixtureProblem() {
    const volume1 = Math.floor(Math.random() * 50) + 10;
    const concentration1 = Math.floor(Math.random() * 50) + 10;
    const volume2 = Math.floor(Math.random() * 50) + 10;
    const concentration2 = Math.floor(Math.random() * 50) + 10;
    
    const question = `A solution of ${volume1} liters contains ${concentration1}% alcohol. Another solution of ${volume2} liters contains ${concentration2}% alcohol. If these solutions are mixed, what will be the concentration of alcohol in the resulting mixture?`;
    const totalVolume = volume1 + volume2;
    const totalAlcohol = (volume1 * concentration1 + volume2 * concentration2) / 100;
    const answer = Math.round((totalAlcohol / totalVolume) * 1000) / 10; 
    
    return { question, answer };
}

function generateBrainTeaser() { 
    const brainTeasers = [
        {
            question: "I am an odd number. Take away one letter and I become even. What number am I?",
            answer: "Seven"
        },
        {
            question: "If you have me, you want to share me. If you share me, you haven't got me. What am I?",
            answer: "A secret"
        },
        {
            question: "What has keys, but no locks; space, but no room; you can enter, but not go in?",
            answer: "A keyboard"
        },
        {
            question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
            answer: "The letter M"
        },
        {
            question: "The more you take, the more you leave behind. What am I?",
            answer: "Footsteps"
        },
        {
            question: "What has hands but can’t clap?",
            answer: "A clock"
        },
        {
            question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
            answer: "An echo"
        },
        {
            question: "I’m tall when I’m young, and I’m short when I’m old. What am I?",
            answer: "A candle"
        },
        {
            question: "What has many teeth, but cannot bite?",
            answer: "A comb"
        },
        {
            question: "The more of this there is, the less you see. What is it?",
            answer: "Darkness"
        },
        {
            question: "What can you hold in your right hand but not in your left?",
            answer: "Your left hand"
        },
        {
            question: "What can travel around the world while staying in the same corner?",
            answer: "A stamp"
        },
        {
            question: "What can run, but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?",
            answer: "A river"
        },
        {
            question: "What can fill a room but takes up no space?",
            answer: "Light"
        },
        {
            question: "What is so fragile that saying its name breaks it?",
            answer: "Silence"
        },
        {
            question: "What has one eye, but can’t see?",
            answer: "A needle"
        },
        {
            question: "I’m light as a feather, yet the strongest man can’t hold me for much longer. What am I?",
            answer: "Your breath"
        },
        {
            question: "What has a head, a tail, is brown, and has no legs?",
            answer: "A penny"
        },
        {
            question: "What has cities, but no houses; forests, but no trees; and rivers, but no water?",
            answer: "A map"
        },
        {
            question: "What has four wheels and flies?",
            answer: "A garbage truck"
        },
        {
            question: "Forward I am heavy, but backward I am not. What am I?",
            answer: "A ton"
        },
        {
            question: "What gets wetter the more it dries?",
            answer: "A towel"
        },
        {
            question: "The more you have of it, the less you see. What is it?",
            answer: "Fog"
        },
        {
            question: "What can you catch, but not throw?",
            answer: "A cold"
        },
        {
            question: "I have branches, but no fruit, trunk, or leaves. What am I?",
            answer: "A bank"
        },
        {
            question: "What has a heart that doesn’t beat?",
            answer: "An artichoke"
        },
        {
            question: "What word is spelled incorrectly in every dictionary?",
            answer: "Incorrectly"
        },
        {
            question: "I am not alive, but I grow. I don’t have lungs, but I need air. I don’t have a mouth, but water kills me. What am I?",
            answer: "Fire"
        },
        {
            question: "What goes up but never comes down?",
            answer: "Your age"
        },
        {
            question: "What can you break, even if you never pick it up or touch it?",
            answer: "A promise"
        },
        {
            question: "What belongs to you, but others use it more than you do?",
            answer: "Your name"
        },
        {
            question: "The more you take, the more you leave behind. What am I?",
            answer: "Footsteps"
        },
        {
            question: "What has an eye but cannot see?",
            answer: "A needle"
        },
        {
            question: "What is always in front of you but can’t be seen?",
            answer: "The future"
        },
        {
            question: "I shave every day, but my beard stays the same. What am I?",
            answer: "A barber"
        },
        {
            question: "The person who makes it, sells it. The person who buys it never uses it. The person who uses it never knows they are using it. What is it?",
            answer: "A coffin"
        },
        {
            question: "What has many keys but can’t open a single lock?",
            answer: "A piano"
        },
        {
            question: "What is black when it’s clean and white when it’s dirty?",
            answer: "A chalkboard"
        },
        {
            question: "What runs but never walks, murmurs but never talks, has a bed but never sleeps, and has a mouth but never eats?",
            answer: "A river"
        },
        {
            question: "What gets bigger the more you take away?",
            answer: "A hole"
        }
    ];

    return brainTeasers[Math.floor(Math.random() * brainTeasers.length)];
}


function generatePDF() {
    const numPDFs = document.getElementById('numPDFs').value;
    const numPages = document.getElementById('numPages').value;
    const operation = document.getElementById('operation').value;
    const problemType = document.getElementById('problemType').value;
    const zip = new JSZip();
    const progressMessage = document.getElementById('progress-message');

    usedProblems.clear();

    function generateBatch(startIndex, endIndex) {
        const startTime = Date.now();

        for (let i = startIndex; i < endIndex; i++) {
            const doc = new jsPDF();
            const answers = [];
            let totalQuestions = 0;

            for (let p = 0; p < numPages; p++) {
                if (p != 0) {
                    doc.addPage();
                }
                doc.setFontSize(24);
                doc.setTextColor(0, 102, 204);
                doc.text("Math Problems", 105, 20, null, null, 'center');
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);

                let pageType = problemType;
                if (problemType === "mixed") {
                    pageType = p % 2 === 0 ? "equations" : "word";
                }

                if (pageType === "equations") {
                    for (let j = 0; j < 20; j++) {
                        const { question, answer } = generateEquation(operation);
                        answers.push(answer);
                        totalQuestions++;
                        doc.setFontSize(12);
                        doc.text(`${totalQuestions}) ${question}`, 20 + (j % 2) * 85, 40 + Math.floor(j / 2) * 13);
                    }
                } else {
                    for (let j = 0; j < 4; j++) {
                        const { question, answer } = generateWordProblem(operation);
                        answers.push(answer);
                        totalQuestions++;
                        doc.setFontSize(12);
                        const splitQuestion = doc.splitTextToSize(`${totalQuestions}) ${question}`, 180);
                        doc.text(splitQuestion, 15, 40 + j * 60);
                        doc.setDrawColor(200);
                        doc.line(15, 40 + j * 60 + splitQuestion.length * 5 + 5, 195, 40 + j * 60 + splitQuestion.length * 5 + 5);
                        doc.line(15, 40 + j * 60 + splitQuestion.length * 5 + 15, 195, 40 + j * 60 + splitQuestion.length * 5 + 15);
                    }
                }

                doc.setFontSize(10);
                doc.text(`Page ${p + 1} of ${numPages}`, 105, 285, null, null, 'center');
            }

        
            doc.addPage();
            doc.setFontSize(24);
            doc.setTextColor(0, 102, 204);
            doc.text("Answer Key", 105, 20, null, null, 'center');
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);

            for (let idx = 0; idx < answers.length; idx++) {
                doc.text(`${idx + 1}) ${answers[idx]}`, 20 + (idx % 3) * 60, 40 + Math.floor(idx / 3) * 10);
            }

            zip.file(`${generateRandomFilename()}.pdf`, doc.output('blob'));
        }
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000;

        progressMessage.textContent = `Generated ${numPDFs} PDFs in ${timeTaken.toFixed(2)} seconds`;
    }

    const batchSize = 20;
    const numBatches = Math.ceil(numPDFs / batchSize);
    for (let i = 0; i < numBatches; i++) {
        generateBatch(i * batchSize, Math.min((i + 1) * batchSize, numPDFs));
    }

    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "math_problems.zip");
    });
}

document.getElementById('pdfForm').addEventListener('submit', function(event) {
    event.preventDefault();
    generatePDF();
});
