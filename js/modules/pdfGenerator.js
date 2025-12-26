/**
 * PDF Generator Module
 * Handles PDF creation, formatting, and ZIP archiving
 * @module pdfGenerator
 */

import { ProblemGenerator } from './problemGenerator.js';
import { ProgressManager } from './progressManager.js';
import { GRADE_CONFIGS, SUBJECT_TOPICS } from './constants.js';

export class PDFGenerator {
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

                this.addHeader(doc, formData, p + 1, numPages);

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

    addHeader(doc, formData, pageNum, totalPages) {
        const { pdfTitle, showTitle, showName, showDate, showScore, showGrade } = formData;

        // Add border around the page
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, 190, 277);

        let currentY = 25;

        // Title with decorative line (if enabled)
        if (showTitle) {
            doc.setFontSize(24);
            doc.setTextColor(0, 102, 204);
            doc.setFont('helvetica', 'bold');
            doc.text(pdfTitle, 105, currentY, null, null, 'center');

            // Decorative line under title
            currentY += 5;
            doc.setLineWidth(1);
            doc.setDrawColor(0, 102, 204);
            doc.line(30, currentY, 180, currentY);
            currentY += 15;
        } else {
            currentY = 35; // Start lower if no title
        }

        // Header fields (only show if any are enabled)
        const hasAnyField = showName || showDate || showScore || showGrade;
        if (hasAnyField) {
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');

            // Row 1: Name and Date
            if (showName || showDate) {
                if (showName) {
                    doc.text("Name:", 20, currentY);
                    doc.line(35, currentY, 100, currentY);
                }
                if (showDate) {
                    doc.text("Date:", 130, currentY);
                    doc.line(145, currentY, 190, currentY);
                }
                currentY += 10;
            }

            // Row 2: Score and Grade
            if (showScore || showGrade) {
                if (showScore) {
                    doc.text("Score:", 20, currentY);
                    doc.line(40, currentY, 80, currentY);
                }
                if (showGrade) {
                    doc.text("Grade:", 130, currentY);
                    doc.line(150, currentY, 190, currentY);
                }
            }
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

            // Add problem number (with optional circle)
            doc.setFontSize(11);
            if (formData.showNumberCircles) {
                doc.circle(x - 3, y, 3); // Moved circle down from y-2 to y for better centering
                doc.text(`${j + 1}`, x - 3, y + 1, null, null, 'center');
            } else {
                doc.text(`${j + 1}.`, x - 3, y + 1);
            }

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

            // Add problem number (with optional styling)
            doc.setFontSize(10);
            if (formData.showNumberCircles) {
                // Circle style
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.5);
                doc.circle(27.5, y - 4, 5);
                doc.setTextColor(0, 0, 0);
                doc.text(`${j + 1}`, 27.5, y - 2, null, null, 'center');
            } else {
                // Simple number with period
                doc.setTextColor(0, 0, 0);
                doc.text(`${j + 1}.`, 20, y - 2);
            }

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
        try {
            console.log('Preview: Starting generation with data:', formData);

            const { gradeLevel, difficulty, subject, problemType, operations, topics } = formData;

            // Validate required data
            if (!operations || operations.length === 0) {
                throw new Error('No operations selected');
            }

            this.problemGenerator.setConfig(gradeLevel, difficulty, subject);
            this.problemGenerator.clearUsedProblems(); // Clear previous problems

            const previewContent = document.getElementById('preview-content');
            const previewContainer = document.getElementById('preview-container');

            if (!previewContent) {
                throw new Error('Preview content element not found');
            }
            if (!previewContainer) {
                throw new Error('Preview container element not found');
            }

            const problems = [];
            console.log('Preview: Elements found, generating problems...');

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
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--accent-primary);">Preview: Full Page Sample</h4>
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
            previewContainer.style.display = 'block';
            previewContainer.classList.add('show');

            console.log('Preview: Successfully generated and displayed');
        } catch (error) {
            console.error('Preview generation error:', error);
            alert(`Preview Error: ${error.message}\n\nPlease check the browser console (F12) for more details.`);

            // Try to show error in preview container
            const previewContent = document.getElementById('preview-content');
            const previewContainer = document.getElementById('preview-container');
            if (previewContent && previewContainer) {
                previewContent.innerHTML = `
                    <div style="color: #dc2626; padding: 2rem; text-align: center;">
                        <h3 style="margin-bottom: 1rem;">Preview Generation Failed</h3>
                        <p style="margin-bottom: 0.5rem;"><strong>Error:</strong> ${error.message}</p>
                        <p style="font-size: 0.875rem; opacity: 0.8;">Check browser console (F12) for details</p>
                    </div>
                `;
                previewContainer.style.display = 'block';
                previewContainer.classList.add('show');
            }
        }
    }

    generatePDFPreview(formData) {
        try {
            console.log('PDF Preview: Starting generation with data:', formData);

            const {
                gradeLevel,
                difficulty,
                subject,
                problemType,
                operations,
                numPages,
                pdfTitle,
                answerKey
            } = formData;

            // Validate required data
            if (!operations || operations.length === 0) {
                throw new Error('No operations selected');
            }

            // Configure problem generator
            this.problemGenerator.setConfig(gradeLevel, difficulty, subject);
            this.problemGenerator.clearUsedProblems();

            // Create a new PDF document
            const doc = new jsPDF();
            const answers = [];

            // Generate the exact number of pages specified in settings
            for (let p = 0; p < numPages; p++) {
                if (p !== 0) {
                    doc.addPage();
                }

                // Add header to each page
                this.addHeader(doc, formData, p + 1, numPages);

                // Determine which page type to generate
                let pageType = problemType;
                if (problemType === "mixed") {
                    pageType = p % 2 === 0 ? "equations" : "word";
                }

                // Generate problems based on type
                if (pageType === "equations") {
                    const pageAnswers = this.addEquationsPage(doc, operations, 20, formData);
                    answers.push(...pageAnswers);
                } else {
                    const pageAnswers = this.addWordProblemsPage(doc, operations, 4, formData);
                    answers.push(...pageAnswers);
                }
            }

            // Add answer key if requested
            if (answerKey === 'separate') {
                this.addAnswerKey(doc, answers);
            }

            // Generate blob URL for preview
            const pdfBlob = doc.output('blob');
            const blobUrl = URL.createObjectURL(pdfBlob);

            console.log(`PDF Preview: Successfully generated ${numPages} pages`);
            return { blobUrl, pdfBlob };
        } catch (error) {
            console.error('PDF Preview generation error:', error);
            throw error;
        }
    }
}
