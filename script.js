
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

var images = [
    'images/1.jpeg', 'images/2.jpeg', 'images/3.jpeg', 'images/4.jpeg', 
    'images/5.jpeg', 'images/6.jpeg', 'images/7.jpeg', 'images/8.jpeg', 
    'images/9.jpeg', 'images/10.jpeg'
];

async function loadImage(src) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function generatePDF(numPDFs=1, numPages=5, batchSize=20) {
    var zip = new JSZip();
    var progressMessage = document.getElementById('progress-message');

    async function generateBatch(startIndex, endIndex) {
        var startTime = Date.now(); 
        for (var i = startIndex; i < endIndex; i++) {
            var doc = new jsPDF();
            var answers = [];
            var totalQuestions = 0;
            doc.setFontSize(20);
            doc.text("Math Problems", 105, 10, null, null, 'center');
            var imgSrc = images[Math.floor(Math.random() * images.length)]; 
            var img = await loadImage(imgSrc);
            doc.addImage(img, 'JPEG', 15, 40, 180, 160); 

            doc.addPage(); 

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
                        var numOperands = Math.floor(Math.random() * 4) + 2;
                        var operator = ['+', '-', '*', '/'];
                        for (var k = 0; k < numOperands; k++) {
                            equation += Math.floor(Math.random() * 10) + " " + operator[Math.floor(Math.random() * 4)] + " ";
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
                if (idx != 0 && idx % 69 == 0) {
                    doc.addPage();
                }
                doc.text((idx + 1) + ") " + answers[idx], 10 + (idx % 3) * 70, 20 + Math.floor((idx % 69) / 3) * 12); 
            }
            zip.file(generateRandomFilename() + '.pdf', doc.output('blob'));
        }
        var endTime = Date.now(); 
        var timeTaken = (endTime - startTime) / 1000; 
        progressMessage.textContent = 'Generated ' + numPDFs + ' PDFs';
    }

    var numBatches = Math.ceil(numPDFs / batchSize);
    var batchPromises = [];
    for (var i = 0; i < numBatches; i++) {
        batchPromises.push(generateBatch(i * batchSize, Math.min((i + 1) * batchSize, numPDFs)));
    }

    Promise.all(batchPromises).then(function() {
        zip.generateAsync({type:"blob"}).then(function(content) {
            saveAs(content, "math_pdfs.zip");
        });
    });
}
document.getElementById('generateButton').addEventListener('click', function(event) {
    event.preventDefault();  
    var numPDFs = document.getElementById('numPDFs').value;
    var numPages = document.getElementById('numPages').value;
    generatePDF(numPDFs, numPages);  
});
