function generateRandomFilename() {
    var result = '';
    var characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function generateQuestion(operation) {
    let question = "";
    let answer = 0;
    let num1, num2, num3;

    switch(operation) {
        case "addition":
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * 100) + 1;
            question = `${num1} + ${num2} = `;
            answer = num1 + num2;
            break;
        case "subtraction":
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            question = `${num1} - ${num2} = `;
            answer = num1 - num2;
            break;
        case "multiplication":
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            question = `${num1} × ${num2} = `;
            answer = num1 * num2;
            break;
        case "division":
            num2 = Math.floor(Math.random() * 12) + 1;
            answer = Math.floor(Math.random() * 12) + 1;
            num1 = num2 * answer;
            question = `${num1} ÷ ${num2} = `;
            break;
        case "bedmas":
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            num3 = Math.floor(Math.random() * 10) + 1;
            question = `(${num1} + ${num2}) × ${num3} = `;
            answer = (num1 + num2) * num3;
            break;
        case "exponents":
            num1 = Math.floor(Math.random() * 5) + 2;
            num2 = Math.floor(Math.random() * 3) + 2;
            question = `${num1}^${num2} = `;
            answer = Math.pow(num1, num2);
            break;
        case "mixed":
            let operations = ["addition", "subtraction", "multiplication", "division", "bedmas", "exponents"];
            return generateQuestion(operations[Math.floor(Math.random() * operations.length)]);
    }

    return { question, answer };
}

function generatePDF() {
    var numPDFs = document.getElementById('numPDFs').value;
    var numPages = document.getElementById('numPages').value;
    var operation = document.getElementById('operation').value;
    var zip = new JSZip();
    var progressMessage = document.getElementById('progress-message');

    function generateBatch(startIndex, endIndex) {
        var startTime = Date.now();

        for (var i = startIndex; i < endIndex; i++) {
            var doc = new jsPDF();
            var answers = [];
            var totalQuestions = 0;
            for (var p = 0; p < numPages; p++) {
                if (p != 0) {
                    doc.addPage();
                }
                doc.setFontSize(20);
                doc.text("Math Problems", 105, 10, null, null, 'center');
                doc.setFontSize(12);
                for (var j = 0; j < 23; j++) {
                    for (var c = 0; c < 3; c++) {
                        var { question, answer } = generateQuestion(operation);

                        answers.push(answer);
                        totalQuestions++;

                        doc.setFontSize(12);
                        doc.text(totalQuestions + ") " + question, 10 + c*70, 20 + j * 12);
                    }
                }
            }
            doc.addPage();
            doc.setFontSize(16);
            doc.text("Answer Key", 105, 10, null, null, 'center');
            doc.setFontSize(12);
            for (var idx = 0; idx < answers.length; idx++) {
                if (idx != 0 && idx % 81 == 0) {
                    doc.addPage();
                }
                doc.text((idx + 1) + ") " + answers[idx], 10 + (idx % 3) * 70, 20 + Math.floor((idx % 81) / 3) * 12);
            }
            zip.file(generateRandomFilename() + '.pdf', doc.output('blob'));
        }
        var endTime = Date.now();

        var timeTaken = (endTime - startTime) / 1000;

        progressMessage.textContent = 'Generated ' + numPDFs + ' PDFs';
    }

    var batchSize = 20;
    var numBatches = Math.ceil(numPDFs / batchSize);
    for (var i = 0; i < numBatches; i++) {
        generateBatch(i * batchSize, Math.min((i + 1) * batchSize, numPDFs));
    }

    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "math_pdfs.zip");
    });
}

document.getElementById('pdfForm').addEventListener('submit', function(event) {
    event.preventDefault();
    generatePDF();
});
