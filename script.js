function generateRandomFilename() {
    var result = '';
    var characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function generatePDF(numPDFs=1, numPages=5, batchSize=20) {
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
                    var numOperands = Math.floor(Math.random() * 4) + 2;
                    for (var c = 0; c < 3; c++) { 
                        var equation = "";
                        var operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
                        for (var k = 0; k < numOperands; k++) {
                            equation += Math.floor(Math.random() * 10) + " " + operator + " ";
                        }
                        equation = equation.slice(0, -2) + " ="; 
                        var answer = eval(equation.slice(0, -2)).toFixed(2); 
                        answers.push(answer);
                        totalQuestions++; 
                        doc.setFontSize(12);
                        doc.text(totalQuestions + ") " + equation, 10 + c*70, 20 + j * 12); 
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
    var numPDFs = document.getElementById('numPDFs').value;
    var numPages = document.getElementById('numPages').value;
    generatePDF(numPDFs, numPages);  
});
