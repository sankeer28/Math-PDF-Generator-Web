function generateRandomFilename() {
    var result = 'math';
    var numbers = '0123456789';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var numbersLength = numbers.length;
    var charactersLength = characters.length;
    for (var i = 0; i < 3; i++) {
        result += numbers.charAt(Math.floor(Math.random() * numbersLength));
    }
    for (var i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function generatePDF(numPDFs=1, batchSize=20) {
    var operators = ['+', '-', '*', '/'];
    var zip = new JSZip();
    var progressMessage = document.getElementById('progress-message');

    function generateBatch(startIndex, endIndex) {
        var startTime = Date.now(); 
        for (var i = startIndex; i < endIndex; i++) {
            var doc = new jsPDF();
            var answers = [];
            for (var p = 0; p < 5; p++) {
                if (p != 0) {
                    doc.addPage();
                }
                doc.setFontSize(20);
                doc.text("Math Problems", 105, 10, null, null, 'center');
                doc.setFontSize(12);
                for (var j = 0; j < 26; j++) {
                    var numOperands = Math.floor(Math.random() * 4) + 2;
                    for (var c = 0; c < 3; c++) {
                        var equation = "";
                        for (var k = 0; k < numOperands; k++) {
                            equation += Math.floor(Math.random() * 10) + " " + operators[Math.floor(Math.random() * operators.length)] + " ";
                        }
                        equation = equation.slice(0, -2);
                        var answer = eval(equation).toFixed(2);
                        answers.push(answer);
                        var equation_number = (p === 0 ? p*78 : p*78 - 3) + j*3 + c + 1;
                        doc.setFontSize(12);
                        doc.text(equation_number + ") " + equation + " =", 10 + c*60, 20 + j * 10);
                    }
                }
            }
            doc.addPage();
            doc.setFontSize(16);
            doc.text("Answer Key", 105, 10, null, null, 'center');
            doc.setFontSize(12);
            for (var idx = 0; idx < answers.length; idx++) {
                if (idx != 0 && idx % 78 == 0) {
                    doc.addPage();
                }
                doc.text((idx + 1) + ") " + answers[idx], 10 + (idx % 3) * 60, 20 + Math.floor((idx % 78) / 3) * 10);
            }
            zip.file(generateRandomFilename() + '.pdf', doc.output('blob'));
        }
        var endTime = Date.now(); 
        var timeTaken = (endTime - startTime) / 1000; 
        progressMessage.textContent = 'Generated ' + numPDFs + ' PDFs';
    }

    var numBatches = Math.ceil(numPDFs / batchSize);
    for (var i = 0; i < numBatches; i++) {
        generateBatch(i * batchSize, Math.min((i + 1) * batchSize, numPDFs));
    }

    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "math_pdfs.zip");
    });
}

document.getElementById('generateButton').addEventListener('click', function(event) {
    event.preventDefault();  
    progressMessage.textContent = 'Starting PDF generation...';
    generatePDF(100, 20);  
});