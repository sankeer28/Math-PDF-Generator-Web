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

    // Sanitize text to replace special Unicode characters with ASCII equivalents for PDF compatibility
    sanitizeText(text) {
        if (!text) return text;
        return text
            .replace(/π/g, 'pi')
            .replace(/≈/g, ' approx ')
            .replace(/°/g, ' deg')
            .replace(/×/g, ' x ')
            .replace(/÷/g, ' / ')
            .replace(/≤/g, '<=')
            .replace(/≥/g, '>=')
            .replace(/±/g, '+/-')
            .replace(/–/g, '-')  // en-dash
            .replace(/—/g, '-')  // em-dash
            .replace(/"/g, '"')  // smart quotes
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/'/g, "'")
            .replace(/\u00A0/g, ' ')  // non-breaking space
            .replace(/\s+/g, ' ')     // normalize multiple spaces
            .trim();
    }

    // Custom text wrapping that's more reliable than splitTextToSize
    wrapText(doc, text, maxWidth) {
        // Use EXTREMELY conservative width (65%) to prevent jsPDF 1.5.3 justification bug
        // This old version of jsPDF has a bug where it justifies text randomly
        const safeMaxWidth = maxWidth * 0.65;

        // Additionally, if line is within 15% of safeMaxWidth, break it early
        // This prevents jsPDF from stretching text that's "close enough" to the edge
        const earlyBreakThreshold = safeMaxWidth * 0.85;

        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            // Check if single word is too long
            const wordWidth = doc.getTextWidth(word);
            if (wordWidth > safeMaxWidth) {
                // If we have a current line, push it first
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = '';
                }
                // Break the long word into smaller chunks
                let remainingWord = word;
                while (remainingWord.length > 0) {
                    let chunk = '';
                    for (let j = 0; j < remainingWord.length; j++) {
                        const testChunk = chunk + remainingWord[j];
                        if (doc.getTextWidth(testChunk) > safeMaxWidth * 0.9 && chunk) {
                            break;
                        }
                        chunk = testChunk;
                    }
                    if (chunk) {
                        lines.push(chunk);
                        remainingWord = remainingWord.substring(chunk.length);
                    } else {
                        // Even a single character is too wide - force it
                        lines.push(remainingWord[0]);
                        remainingWord = remainingWord.substring(1);
                    }
                }
                continue;
            }

            const testLine = currentLine ? currentLine + ' ' + word : word;
            const testWidth = doc.getTextWidth(testLine);

            // Break early if we're getting close to the threshold to avoid justification
            if (testWidth > earlyBreakThreshold && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else if (testWidth > safeMaxWidth && currentLine) {
                // Line would be too long, start a new line
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        // Add the last line
        if (currentLine) {
            lines.push(currentLine);
        }

        // Add trailing space to each line except the last to prevent justification bug in jsPDF 1.5.3
        for (let i = 0; i < lines.length - 1; i++) {
            if (!lines[i].endsWith(' ')) {
                lines[i] = lines[i] + ' ';
            }
        }

        return lines.length > 0 ? lines : [text];
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

        const zip = new JSZip();
        const totalPDFs = parseInt(numPDFs);

        for (let i = 0; i < totalPDFs; i++) {
            this.progressManager.updateProgress(
                (i / totalPDFs) * 100,
                `Generating PDF ${i + 1} of ${totalPDFs}...`
            );

            // Clear used problems for each new PDF to allow fresh unique problems
            this.problemGenerator.clearUsedProblems();

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
                    const pageAnswers = this.addEquationsPage(doc, operations, 20, formData, p + 1);
                    answers.push(...pageAnswers);
                    totalQuestions += pageAnswers.length;
                } else {
                    const pageAnswers = this.addWordProblemsPage(doc, operations, 4, formData, p + 1);
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
        const { pdfTitle, showTitle, showName, showDate, showScore, showGrade, pageNumberPosition, showPageNumberBox, showPageBorder } = formData;

        // Add border around the page (optional)
        if (showPageBorder) {
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.rect(10, 10, 190, 277);
        }

        let currentY = 25;

        // Title with decorative line (if enabled)
        // showTitle can be: 'all', 'first', or 'no'
        const shouldShowTitle = showTitle === 'all' || (showTitle === 'first' && pageNum === 1);

        if (shouldShowTitle) {
            doc.setFontSize(24);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            const sanitizedTitle = this.sanitizeText(pdfTitle);
            doc.text(sanitizedTitle, 105, currentY, null, null, 'center');

            // Decorative line under title
            currentY += 5;
            doc.setLineWidth(1);
            doc.setDrawColor(0, 0, 0);
            doc.line(30, currentY, 180, currentY);
            currentY += 8;
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

        // Page number (customizable position and styling)
        if (pageNumberPosition !== 'none') {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);

            let pageX, pageY, align;

            // Determine position based on setting
            switch (pageNumberPosition) {
                case 'bottom-center':
                    pageX = 105;
                    pageY = 281;
                    align = 'center';
                    if (showPageNumberBox) {
                        doc.rect(95, 275, 20, 8);
                    }
                    break;
                case 'bottom-left':
                    pageX = 20;
                    pageY = 281;
                    align = 'left';
                    if (showPageNumberBox) {
                        doc.rect(15, 275, 20, 8);
                    }
                    break;
                case 'bottom-right':
                    pageX = 190;
                    pageY = 281;
                    align = 'right';
                    if (showPageNumberBox) {
                        doc.rect(175, 275, 20, 8);
                    }
                    break;
                case 'top-right':
                    pageX = 190;
                    pageY = 18;
                    align = 'right';
                    if (showPageNumberBox) {
                        doc.rect(175, 12, 20, 8);
                    }
                    break;
                default:
                    pageX = 105;
                    pageY = 281;
                    align = 'center';
                    if (showPageNumberBox) {
                        doc.rect(95, 275, 20, 8);
                    }
            }

            doc.text(`${pageNum}/${totalPages}`, pageX, pageY, null, null, align);
        }

        // Reset font
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
    }

    addEquationsPage(doc, operations, numProblems, formData, pageNum = 1) {
        const answers = [];

        // Page margins (optimized for 2-column layout)
        const pageMargins = {
            left: 15,
            right: 195,
            top: 10,
            bottom: 282
        };

        // Determine if title is shown on this page
        const { showTitle } = formData;
        const shouldShowTitle = showTitle === 'all' || (showTitle === 'first' && pageNum === 1);

        // Adjust starting position based on whether title is shown
        const startY = shouldShowTitle ? 58 : 38;

        // Two-column layout with clear separation
        const leftColumnX = 20;
        const rightColumnX = 112;
        const columnGap = 15; // Large gap between columns
        const pageWidth = pageMargins.right - pageMargins.left;
        const columnWidth = (pageWidth - columnGap) / 2; // Each column gets equal width
        const maxQuestionWidth = columnWidth - 20; // Large margin to prevent justification

        const lineHeight = 5; // Line spacing for wrapped text

        // Calculate spacing to fit all problems
        const rowsNeeded = Math.ceil(numProblems / 2);
        const availableHeight = pageMargins.bottom - startY - 8;
        const baseSpacing = Math.max(18, availableHeight / rowsNeeded); // Minimum spacing for multi-line questions

        let currentLeftY = startY;
        let currentRightY = startY;
        let problemsAdded = 0;

        for (let j = 0; j < numProblems; j++) {
            const randomOperation = operations[Math.floor(Math.random() * operations.length)];
            const { question, answer } = this.problemGenerator.generateUniqueProblem(randomOperation, 'equations', formData.topics);

            // Sanitize question text for PDF compatibility
            const sanitizedQuestion = this.sanitizeText(question);

            const isLeftColumn = (j % 2 === 0);
            const columnX = isLeftColumn ? leftColumnX : rightColumnX;
            const currentY = isLeftColumn ? currentLeftY : currentRightY;

            // Dynamic font sizing based on question length
            let fontSize = 11;
            if (sanitizedQuestion.length > 60) fontSize = 10;
            if (sanitizedQuestion.length > 90) fontSize = 9.5;

            // Set font BEFORE wrapping to ensure accurate width measurements
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(fontSize);

            // Use custom text wrapping to ensure it fits WITHIN the column width
            const splitQuestion = this.wrapText(doc, sanitizedQuestion, maxQuestionWidth);
            const questionHeight = splitQuestion.length * lineHeight;

            // Check if this problem will fit on the page
            if (currentY + questionHeight > pageMargins.bottom - 8) {
                console.warn(`Equation ${j + 1} would overflow page, skipping`);
                continue;
            }

            answers.push(answer);
            problemsAdded++;

            // Add problem number (with optional circle)
            doc.setFontSize(9);
            if (formData.showNumberCircles) {
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.3);
                doc.circle(columnX - 2, currentY, 2.5);
                doc.setTextColor(0, 0, 0);
                // Use centered text for circle numbers (old API)
                const numText = `${problemsAdded}`;
                const numWidth = doc.getTextWidth(numText);
                doc.text(numText, columnX - 2 - (numWidth / 2), currentY + 0.8);
            } else {
                doc.setTextColor(0, 0, 0);
                doc.text(`${problemsAdded}.`, columnX - 2, currentY + 1);
            }

            // Add equation with proper wrapping - STAYS IN ITS COLUMN
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(fontSize);
            doc.setTextColor(0, 0, 0);

            // Render each line of the wrapped question - USE SIMPLE API WITHOUT OPTIONS
            for (let lineIdx = 0; lineIdx < splitQuestion.length; lineIdx++) {
                const lineY = currentY + (lineIdx * lineHeight) + 1;
                // Simple x, y positioning - NO options object to avoid justification bug
                // Add extra space after each character to prevent justification
                const line = splitQuestion[lineIdx];
                doc.text(line, columnX + 5, lineY);
            }

            // Add answer line on the last line of the question
            const answerLineY = currentY + ((splitQuestion.length - 1) * lineHeight) + 1;
            const lastLineWidth = doc.getTextWidth(splitQuestion[splitQuestion.length - 1]);
            doc.setLineWidth(0.3);
            doc.setDrawColor(0, 0, 0);

            const lineStart = columnX + 5 + lastLineWidth + 2;
            const lineEnd = columnX + columnWidth - 2;

            // Only draw answer line if there's sufficient space within the column
            if (lineStart < lineEnd - 8) {
                doc.line(lineStart, answerLineY, lineEnd, answerLineY);
            }

            // Update Y position for next problem in this column
            const spacing = Math.max(baseSpacing, questionHeight + 6);
            if (isLeftColumn) {
                currentLeftY += spacing;
            } else {
                currentRightY += spacing;
            }
        }

        return answers;
    }

    addWordProblemsPage(doc, operations, numProblems, formData, pageNum = 1) {
        const answers = [];

        // Page margins (optimized for maximum content)
        const pageMargins = {
            left: 12,
            right: 198,
            top: 10,
            bottom: 282
        };

        // Determine if title is shown on this page
        const { showTitle } = formData;
        const shouldShowTitle = showTitle === 'all' || (showTitle === 'first' && pageNum === 1);

        // Adjust starting position based on whether title is shown
        const startY = shouldShowTitle ? 58 : 38;
        const questionLeftMargin = 36;
        const maxQuestionWidth = pageMargins.right - questionLeftMargin - 20; // Large margin to prevent justification
        const lineHeight = 4.5;

        // Calculate spacing to fit problems with answer boxes
        const availableHeight = pageMargins.bottom - startY - 8;
        const estimatedProblemHeight = 42; // Optimized height per problem
        const maxProblemsToFit = Math.floor(availableHeight / estimatedProblemHeight);
        const actualProblems = Math.min(numProblems, maxProblemsToFit);
        const problemSpacing = availableHeight / actualProblems;

        let currentY = startY;
        let problemsAdded = 0;

        for (let j = 0; j < numProblems; j++) {
            const randomOperation = operations[Math.floor(Math.random() * operations.length)];
            const { question, answer } = this.problemGenerator.generateUniqueProblem(randomOperation, 'word', formData.topics);

            // Sanitize question text for PDF compatibility
            const sanitizedQuestion = this.sanitizeText(question);

            // Dynamic font sizing based on question length
            let fontSize = 10.5;
            if (sanitizedQuestion.length > 120) fontSize = 10;
            if (sanitizedQuestion.length > 180) fontSize = 9.5;

            // Set font BEFORE wrapping to ensure accurate width measurements
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(fontSize);

            // Use custom text wrapping for reliable wrapping
            const splitQuestion = this.wrapText(doc, sanitizedQuestion, maxQuestionWidth);
            const questionHeight = splitQuestion.length * lineHeight;
            const answerBoxHeight = 18;
            const totalHeight = questionHeight + answerBoxHeight + 8;

            // Check if this problem will fit on the page
            if (currentY + totalHeight > pageMargins.bottom - 5) {
                console.warn(`Word problem ${j + 1} would overflow page, skipping remaining problems`);
                break;
            }

            answers.push(answer);
            problemsAdded++;

            // Add problem number (with optional styling)
            doc.setFontSize(9.5);
            if (formData.showNumberCircles) {
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.3);
                doc.circle(25, currentY - 2, 4);
                doc.setTextColor(0, 0, 0);
                // Center text in circle using old API
                const numText = `${problemsAdded}`;
                const numWidth = doc.getTextWidth(numText);
                doc.text(numText, 25 - (numWidth / 2), currentY - 0.5);
            } else {
                doc.setTextColor(0, 0, 0);
                doc.text(`${problemsAdded}.`, 18, currentY);
            }

            // Add question with proper wrapping
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(fontSize);
            doc.setTextColor(0, 0, 0);

            // Render each line of the wrapped question - USE SIMPLE API WITHOUT OPTIONS
            for (let lineIdx = 0; lineIdx < splitQuestion.length; lineIdx++) {
                const lineY = currentY + (lineIdx * lineHeight);
                // Simple x, y positioning - NO options object to avoid justification bug
                doc.text(splitQuestion[lineIdx], questionLeftMargin, lineY);
            }

            // Add answer box
            const answerBoxY = currentY + questionHeight + 6;
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(0.4);

            // Answer label
            doc.setFontSize(8.5);
            doc.setTextColor(100, 100, 100);
            doc.text("Answer:", questionLeftMargin, answerBoxY);

            // Answer lines (optimized spacing and length)
            const lineRightEdge = pageMargins.right - 8;
            doc.line(58, answerBoxY, lineRightEdge, answerBoxY);
            doc.line(questionLeftMargin, answerBoxY + 7, lineRightEdge, answerBoxY + 7);
            doc.line(questionLeftMargin, answerBoxY + 14, Math.min(lineRightEdge - 40, 130), answerBoxY + 14);

            // Reset colors
            doc.setTextColor(0, 0, 0);
            doc.setDrawColor(0, 0, 0);

            // Move to next problem position
            currentY += problemSpacing;
        }

        return answers;
    }

    addAnswerKey(doc, answers) {
        doc.addPage();

        // Page margins (optimized for answer key)
        const pageMargins = {
            left: 15,
            right: 195,
            top: 35,
            bottom: 278
        };

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text("Answer Key", 105, 22, null, null, 'center');

        // Decorative line
        doc.setLineWidth(0.5);
        doc.line(40, 26, 170, 26);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);

        const columns = 3;
        const columnWidth = 62;
        const lineHeight = 7;
        const startY = 38;
        const maxAnswersPerPage = Math.floor((pageMargins.bottom - startY) / lineHeight) * columns;

        let answersOnCurrentPage = 0;

        for (let idx = 0; idx < answers.length; idx++) {
            // Check if we need a new page
            if (answersOnCurrentPage >= maxAnswersPerPage) {
                doc.addPage();
                doc.setFontSize(18);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text("Answer Key (continued)", 105, 22, null, null, 'center');
                doc.setLineWidth(0.5);
                doc.line(40, 26, 170, 26);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9.5);
                doc.setTextColor(0, 0, 0);
                answersOnCurrentPage = 0;
            }

            const col = answersOnCurrentPage % columns;
            const row = Math.floor(answersOnCurrentPage / columns);
            const x = pageMargins.left + col * columnWidth;
            const y = startY + row * lineHeight;

            // Sanitize and truncate long answers
            let sanitizedAnswer = this.sanitizeText(String(answers[idx]));

            // Dynamic font size for very long answers
            let answerFontSize = 9.5;
            if (sanitizedAnswer.length > 25) {
                answerFontSize = 8.5;
            }

            // Set font BEFORE measuring width
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(answerFontSize);

            // Truncate extremely long answers to prevent overflow
            const maxAnswerLength = 35;
            if (sanitizedAnswer.length > maxAnswerLength) {
                sanitizedAnswer = sanitizedAnswer.substring(0, maxAnswerLength - 3) + '...';
            }

            const answerText = `${idx + 1}) ${sanitizedAnswer}`;

            // Use custom text wrapping to ensure it fits within column
            const splitAnswer = this.wrapText(doc, answerText, columnWidth - 2);
            doc.text(splitAnswer[0], x, y); // Only show first line to prevent overflow

            answersOnCurrentPage++;
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
                    const pageAnswers = this.addEquationsPage(doc, operations, 20, formData, p + 1);
                    answers.push(...pageAnswers);
                } else {
                    const pageAnswers = this.addWordProblemsPage(doc, operations, 4, formData, p + 1);
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
