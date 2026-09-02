/**
 * Form Manager Module
 * Handles form interactions, validation, and dynamic updates
 * @module formManager
 */

import { WorksheetGenerator, LatexError, fileNameStem } from '../latex/worksheetGenerator.js';
import { ProgressManager } from './progressManager.js';
import { createZip, saveBlob } from './zip.js';
import { GRADE_CONFIGS, SUBJECT_TOPICS } from './constants.js';

export class FormManager {
    constructor() {
        this.form = document.getElementById('pdfForm');
        this.worksheetGenerator = new WorksheetGenerator();
        this.progress = new ProgressManager();
        this.currentPDFBlobUrl = null;
        this.initializeForm();

        // The TeX bundle is a few megabytes; fetch it while the teacher is still
        // choosing options rather than making them wait once they hit Generate.
        this.worksheetGenerator.prepare().then(
            () => this.setEngineStatus('ready', 'LaTeX engine ready'),
            (error) => {
                console.error('The LaTeX engine failed to load:', error);
                this.setEngineStatus('error', 'The LaTeX engine could not load. Check your connection and reload the page.');
            }
        );
    }

    initializeForm() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Preview button - show PDF preview
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.handlePDFPreview();
        });

        // Dynamic form updates
        document.getElementById('gradeLevel').addEventListener('change', () => {
            this.updateSubjectOptions();
            this.updateWorksheetTitle();
        });

        // Difficulty slider update
        document.getElementById('difficulty').addEventListener('input', (e) => {
            this.updateDifficultyLabel(e.target.value);
        });

        // Initialize subject and topic options
        this.updateSubjectOptions();
        this.updateTopicOptions();
        this.toggleOperationsVisibility();

        // Initialize accordion toggles
        this.initializeAccordions();

        // Set initial worksheet title
        this.updateWorksheetTitle();
    }

    initializeAccordions() {
        const accordionToggles = document.querySelectorAll('.form-accordion-toggle');

        accordionToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                const content = toggle.nextElementSibling;

                if (isExpanded) {
                    toggle.setAttribute('aria-expanded', 'false');
                    content.classList.remove('expanded');
                } else {
                    toggle.setAttribute('aria-expanded', 'true');
                    content.classList.add('expanded');
                }
            });
        });
    }

    updateWorksheetTitle() {
        const gradeLevel = document.getElementById('gradeLevel').value;
        const titleInput = document.getElementById('pdfTitle');

        // Get grade name
        const gradeName = GRADE_CONFIGS[gradeLevel]?.name || 'Math';

        // Get selected subjects
        const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
        const selectedSubjects = Array.from(subjectCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        // Get subject name(s)
        const subjectNames = {
            arithmetic: 'Arithmetic',
            measurement: 'Measurement',
            algebra: 'Algebra',
            geometry: 'Geometry',
            statistics: 'Statistics',
            trigonometry: 'Trigonometry',
            precalculus: 'Pre-Calculus',
            calculus: 'Calculus'
        };

        let subjectName = 'Math';
        if (selectedSubjects.length === 1) {
            subjectName = subjectNames[selectedSubjects[0]] || 'Math';
        } else if (selectedSubjects.length > 1) {
            subjectName = 'Mixed Subjects';
        }

        // Generate title
        const newTitle = `${gradeName} ${subjectName} Practice`;
        titleInput.value = newTitle;
    }

    toggleOperationsVisibility() {
        // Get selected subjects
        const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
        const selectedSubjects = Array.from(subjectCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        const operationsSection = document.getElementById('operationsSection');

        if (!operationsSection) return;

        // Only show operations if arithmetic is one of the selected subjects
        if (selectedSubjects.includes('arithmetic')) {
            operationsSection.style.display = 'block';
        } else {
            operationsSection.style.display = 'none';
            // Auto-check all operations for non-arithmetic subjects (they won't be used anyway)
            document.querySelectorAll('input[type="checkbox"][id^="op-"]').forEach(cb => {
                cb.checked = true;
            });
        }
    }

    updateDifficultyLabel(value) {
        const difficultyLabel = document.getElementById('difficultyLabel');
        const difficulties = ['Easy', 'Medium', 'Hard'];
        if (difficultyLabel) {
            difficultyLabel.textContent = difficulties[parseInt(value) - 1];
        }
    }

    updateSubjectOptions() {
        const gradeLevel = document.getElementById('gradeLevel').value;
        const subjectContainer = document.getElementById('subjectSelection');
        const availableSubjects = GRADE_CONFIGS[gradeLevel].subjects;

        // Subject display names
        const subjectNames = {
            arithmetic: 'Basic Arithmetic',
            measurement: 'Measurement & Data',
            algebra: 'Algebra',
            geometry: 'Geometry',
            statistics: 'Statistics & Probability',
            trigonometry: 'Trigonometry',
            precalculus: 'Pre-Calculus',
            calculus: 'Calculus'
        };

        // Clear current checkboxes
        subjectContainer.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" value="all" id="subject-all" class="checkbox-input" checked>
                <span class="checkbox-text">All Subjects</span>
            </label>
        `;

        // Add checkboxes for each available subject
        availableSubjects.forEach(subject => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';
            label.innerHTML = `
                <input type="checkbox" value="${subject}" class="checkbox-input subject-checkbox" checked>
                <span class="checkbox-text">${subjectNames[subject]}</span>
            `;
            subjectContainer.appendChild(label);
        });

        // Setup "All Subjects" checkbox behavior
        const allSubjectsCheckbox = document.getElementById('subject-all');
        const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');

        allSubjectsCheckbox.addEventListener('change', () => {
            subjectCheckboxes.forEach(checkbox => {
                checkbox.checked = allSubjectsCheckbox.checked;
            });
            this.updateOperationTypesForSubject();
            this.updateTopicOptions();
        });

        subjectCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const allChecked = Array.from(subjectCheckboxes).every(cb => cb.checked);
                const noneChecked = Array.from(subjectCheckboxes).every(cb => !cb.checked);

                if (allChecked) {
                    allSubjectsCheckbox.checked = true;
                } else if (noneChecked) {
                    allSubjectsCheckbox.checked = false;
                } else {
                    allSubjectsCheckbox.checked = false;
                }

                this.updateOperationTypesForSubject();
                this.updateTopicOptions();
            });
        });

        // Update operation types and problem type based on subject
        this.updateOperationTypesForSubject();
        this.updateProblemTypeForSubject();
        this.updateTopicOptions();
    }

    updateTopicOptions() {
        // Get all selected subjects for comprehensive topic display
        const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
        const selectedSubjects = Array.from(subjectCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        const gradeLevel = document.getElementById('gradeLevel').value;
        const topicContainer = document.getElementById('topicSelection');

        // Map specific grades to broader categories used in subject files
        const getGradeCategory = (gradeId) => {
            const gradeNum = parseInt(gradeId.replace('grade', ''));
            if (gradeNum >= 1 && gradeNum <= 5) return 'elementary';
            if (gradeNum >= 6 && gradeNum <= 8) return 'middle';
            if (gradeNum >= 9 && gradeNum <= 12) return 'high';
            return 'college';
        };

        const gradeCategory = getGradeCategory(gradeLevel);

        if (selectedSubjects.length === 0) {
            topicContainer.innerHTML = `
                <label class="checkbox-label">
                    <input type="checkbox" value="all" id="topic-all" class="checkbox-input" checked>
                    <span class="checkbox-text">All Topics</span>
                </label>
            `;
            return;
        }

        // Subject display names for grouping
        const subjectNames = {
            arithmetic: 'Arithmetic',
            measurement: 'Measurement',
            algebra: 'Algebra',
            geometry: 'Geometry',
            statistics: 'Statistics',
            trigonometry: 'Trigonometry',
            precalculus: 'Pre-Calculus',
            calculus: 'Calculus'
        };

        // Clear existing topics - "All Topics" checkbox starts checked
        topicContainer.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" value="all" id="topic-all" class="checkbox-input" checked>
                <span class="checkbox-text">All Topics</span>
            </label>
        `;

        // Add topics from each selected subject, grouped by subject
        selectedSubjects.forEach(subjectId => {
            const subjectConfig = SUBJECT_TOPICS[subjectId];

            if (!subjectConfig || !subjectConfig.topics) {
                return;
            }

            const allTopics = subjectConfig.topics;

            // Filter topics by grade level using category mapping
            const gradeAppropriateTopics = Object.entries(allTopics).filter(([key, topicData]) => {
                if (typeof topicData === 'string') {
                    return true;
                }
                // Check if the topic's grade array includes the current grade category
                return topicData.grades && topicData.grades.includes(gradeCategory);
            });

            // Only show subject header if there are topics for this subject
            if (gradeAppropriateTopics.length > 0) {
                // Add subject header (non-interactive)
                const headerDiv = document.createElement('div');
                headerDiv.className = 'topic-subject-header';
                headerDiv.style.cssText = 'grid-column: 1 / -1; font-weight: 600; color: var(--accent-primary); margin-top: 8px; font-size: 0.875rem;';
                headerDiv.textContent = subjectNames[subjectId] || subjectId;
                topicContainer.appendChild(headerDiv);

                // Add individual grade-appropriate topics for this subject (auto-selected)
                gradeAppropriateTopics.forEach(([key, topicData]) => {
                    const label = document.createElement('label');
                    label.className = 'checkbox-label';

                    const topicName = typeof topicData === 'string' ? topicData : topicData.name;

                    label.innerHTML = `
                        <input type="checkbox" value="${subjectId}:${key}" class="topic-checkbox checkbox-input" checked>
                        <span class="checkbox-text">${topicName}</span>
                    `;
                    topicContainer.appendChild(label);
                });
            }
        });

        // Setup "All Topics" checkbox behavior
        const allTopicsCheckbox = document.getElementById('topic-all');
        const topicCheckboxes = document.querySelectorAll('.topic-checkbox');

        allTopicsCheckbox.addEventListener('change', () => {
            topicCheckboxes.forEach(checkbox => {
                checkbox.checked = allTopicsCheckbox.checked;
            });
        });

        topicCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const allChecked = Array.from(topicCheckboxes).every(cb => cb.checked);
                const noneChecked = Array.from(topicCheckboxes).every(cb => !cb.checked);

                if (allChecked) {
                    allTopicsCheckbox.checked = true;
                } else {
                    allTopicsCheckbox.checked = false;
                }
            });
        });
    }


    updateOperationTypesForSubject() {
        // Get selected subjects
        const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
        const selectedSubjects = Array.from(subjectCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        const subject = selectedSubjects[0] || 'arithmetic';

        const operationGroup = document.querySelector('.operation-grid');
        const operationSection = operationGroup?.closest('.form-group');

        if (operationSection) {
            operationSection.style.maxHeight = 'none';
            operationSection.style.opacity = '1';
            operationSection.style.transform = 'translateY(0)';
            operationSection.style.overflow = 'visible';
        }

        this.updateOperationLabelsForSubject(subject);
    }

    updateOperationLabelsForSubject(subject) {
        // Placeholder for operation label updates
        // Could be enhanced to show subject-specific operation meanings
    }

    updateProblemTypeForSubject() {
        // Get selected subjects
        const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
        const selectedSubjects = Array.from(subjectCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        const subject = selectedSubjects[0] || 'arithmetic';
        const gradeLevel = document.getElementById('gradeLevel').value;
        const problemTypeSelect = document.getElementById('problemType');

        problemTypeSelect.disabled = false;

        const subjectDefaults = {
            arithmetic: 'mixed',
            algebra: 'equations',
            geometry: 'mixed',
            statistics: 'word',
            trigonometry: 'equations',
            calculus: 'equations'
        };

        const currentValue = problemTypeSelect.value;
        if (!currentValue || currentValue === '') {
            problemTypeSelect.value = subjectDefaults[subject] || 'mixed';
        }

        this.updateAvailableProblemTypes(gradeLevel);
    }

    updateAvailableProblemTypes(gradeLevel) {
        const problemTypeSelect = document.getElementById('problemType');
        const availableTypes = GRADE_CONFIGS[gradeLevel]?.problemTypes || ['equations', 'word', 'mixed'];

        const currentValue = problemTypeSelect.value;

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

        if (availableTypes.includes(currentValue)) {
            problemTypeSelect.value = currentValue;
        }
    }

    getFormData() {
        // Get selected operations
        const operationCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="op-"]');
        const selectedOperations = Array.from(operationCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        // Get selected subjects
        const allSubjectsChecked = document.getElementById('subject-all').checked;
        let selectedSubjects = [];

        if (allSubjectsChecked) {
            // If "All Subjects" is checked, get all available subjects for the grade
            const gradeLevel = document.getElementById('gradeLevel').value;
            selectedSubjects = GRADE_CONFIGS[gradeLevel].subjects;
        } else {
            // Otherwise, get checked subject checkboxes
            const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
            selectedSubjects = Array.from(subjectCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
        }

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
            subjects: selectedSubjects,  // Changed from 'subject' to 'subjects' (array)
            topics: allTopicsChecked ? 'all' : selectedTopics,
            problemType: document.getElementById('problemType').value,
            operations: selectedOperations.length > 0 ? selectedOperations : ['addition', 'subtraction', 'multiplication', 'division'],
            numPDFs: parseInt(document.getElementById('numPDFs').value),
            numPages: parseInt(document.getElementById('numPages').value),
            pdfTitle: document.getElementById('pdfTitle').value.trim(),
            showTitle: document.getElementById('showTitle').value,
            showName: document.getElementById('showName').checked,
            showDate: document.getElementById('showDate').checked,
            showScore: document.getElementById('showScore').checked,
            showGrade: document.getElementById('showGrade').checked,
            showNumberCircles: document.getElementById('showNumberCircles').checked,
            pageNumberPosition: document.getElementById('pageNumberPosition').value,
            showPageNumberBox: document.getElementById('showPageNumberBox').checked,
            showPageBorder: document.getElementById('showPageBorder').checked,
            answerKey: document.getElementById('answerKey').value,
            paperSize: document.getElementById('paperSize').value
        };
    }

    validateFormData(formData) {
        const errors = [];

        // Validate operations (only for arithmetic, the one subject that uses them).
        // `subjects` is an array; the old singular `subject` never matched here.
        if (formData.subjects.includes('arithmetic') && formData.operations.length === 0) {
            errors.push({
                field: 'operations',
                message: 'Please select at least one operation type.'
            });
        }

        // Validate topics
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
        this.clearValidationErrors();

        errors.forEach(error => {
            const fieldElement = this.getFieldElement(error.field);
            if (fieldElement) {
                this.addErrorToField(fieldElement, error.message, error.type);
            } else {
                this.showGeneralError(error.message, error.type);
            }
        });
    }

    clearValidationErrors() {
        document.querySelectorAll('.form-error, .form-success, .alert').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
    }

    getFieldElement(fieldName) {
        switch (fieldName) {
            case 'operations':
                return document.querySelector('.operation-grid');
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
        const messageClass = type === 'warning' ? 'form-success' : 'form-error';

        fieldElement.classList.add(errorClass);

        const errorElement = document.createElement('div');
        errorElement.className = messageClass;
        errorElement.textContent = message;

        fieldElement.parentNode.insertBefore(errorElement, fieldElement.nextSibling);
    }

    showGeneralError(message, type = 'error') {
        const alertClass = type === 'warning' ? 'alert-warning' : type === 'success' ? 'alert-success' : 'alert-error';

        const alertElement = document.createElement('div');
        alertElement.className = `alert ${alertClass}`;
        alertElement.textContent = message;

        const form = document.getElementById('pdfForm');
        form.insertBefore(alertElement, form.firstChild);

        // Auto-remove success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                alertElement.remove();
            }, 3000);
        }
    }

    async handleFormSubmit() {
        const formData = this.getFormData();

        const validationErrors = this.validateFormData(formData);
        if (validationErrors.length > 0) {
            this.showValidationErrors(validationErrors);
            return;
        }

        this.clearValidationErrors();
        this.setFormEnabled(false);
        this.progress.show();

        try {
            if (!this.worksheetGenerator.isEngineReady) {
                this.progress.updateProgress(4, 'Loading the LaTeX engine...');
                await this.worksheetGenerator.prepare();
            }

            const worksheets = await this.worksheetGenerator.generateMany(formData, (done, total) => {
                this.progress.updateProgress(
                    10 + (done / total) * 85,
                    `Typesetting worksheet ${Math.min(done + 1, total)} of ${total}...`
                );
            });

            this.progress.updateProgress(97, 'Packaging the download...');
            this.deliver(worksheets, formData);
            this.progress.complete('Done.');
        } catch (error) {
            this.reportLatexFailure(error, 'generate these worksheets');
        } finally {
            this.progress.hide();
            this.setFormEnabled(true);
        }
    }

    /** Saves a single PDF directly, or several as one ZIP. */
    deliver(worksheets, formData) {
        const stem = fileNameStem(formData.pdfTitle);

        if (worksheets.length === 1) {
            saveBlob(new Blob([worksheets[0].pdf], { type: 'application/pdf' }), worksheets[0].name);
            return;
        }

        const zip = createZip(worksheets.map((sheet) => ({ name: sheet.name, data: sheet.pdf })));
        saveBlob(zip, `${stem}_worksheets.zip`);
    }

    async handlePDFPreview() {
        const formData = this.getFormData();

        const basicErrors = this.validateFormData(formData).filter(error =>
            !['generation-size', 'numPDFs', 'numPages'].includes(error.field)
        );

        if (basicErrors.length > 0) {
            this.showValidationErrors(basicErrors);
            return;
        }

        this.clearValidationErrors();
        this.setFormEnabled(false);
        this.progress.show();

        try {
            if (!this.worksheetGenerator.isEngineReady) {
                this.progress.updateProgress(10, 'Loading the LaTeX engine...');
                await this.worksheetGenerator.prepare();
            }

            this.progress.updateProgress(50, 'Typesetting the preview...');
            const { pdf, source } = await this.worksheetGenerator.generateOne(formData);
            this.showPreview(pdf, source, formData);
        } catch (error) {
            this.reportLatexFailure(error, 'typeset this preview');
        } finally {
            this.progress.hide();
            this.setFormEnabled(true);
        }
    }

    showPreview(pdf, source, formData) {
        if (this.currentPDFBlobUrl) URL.revokeObjectURL(this.currentPDFBlobUrl);
        this.currentPDFBlobUrl = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));

        const container = document.getElementById('preview-container');
        const content = document.getElementById('preview-content');

        content.replaceChildren(
            this.buildPreviewSummary(formData),
            buildPreviewFrame(this.currentPDFBlobUrl),
            buildSourceView(source)
        );
        content.classList.add('pdf-mode');

        container.style.display = 'block';
        container.classList.add('show');
        setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    buildPreviewSummary(formData) {
        const operations = formData.operations.length === 1
            ? formData.operations[0]
            : `Mixed (${formData.operations.join(', ')})`;

        const subjects = (formData.subjects || [])
            .map((subject) => SUBJECT_TOPICS[subject]?.name || subject)
            .join(', ');

        const summary = document.createElement('div');
        summary.className = 'preview-summary';

        const heading = document.createElement('h4');
        heading.textContent = 'Preview settings';
        summary.appendChild(heading);

        const grid = document.createElement('dl');
        grid.className = 'preview-summary-grid';
        const rows = [
            ['Grade', GRADE_CONFIGS[formData.gradeLevel]?.name || formData.gradeLevel],
            ['Subjects', subjects || 'All'],
            ['Difficulty', formData.difficulty],
            ['Problem type', formData.problemType === 'mixed' ? 'Mixed format' : formData.problemType],
            ['Operations', operations],
            ['Pages', `${formData.numPages}`],
            ['Paper', formData.paperSize === 'a4' ? 'A4' : 'Letter'],
            ['Answer key', formData.answerKey === 'separate' ? 'Yes' : 'No'],
        ];

        for (const [label, value] of rows) {
            const term = document.createElement('dt');
            term.textContent = label;
            const description = document.createElement('dd');
            description.textContent = value;
            grid.append(term, description);
        }

        summary.appendChild(grid);
        return summary;
    }

    /** Turns an engine failure into something a user can act on. */
    reportLatexFailure(error, action) {
        console.error(`Could not ${action}:`, error);
        if (error instanceof LatexError && error.log) console.error(error.log);

        const detail = error instanceof LatexError && error.texError
            ? ` LaTeX reported: ${error.texError}`
            : '';
        this.showGeneralError(`Could not ${action}.${detail} Please try again.`, 'error');
    }

    /** Tells the user where the engine is, since the first load takes a moment. */
    setEngineStatus(state, message) {
        const element = document.getElementById('engine-status');
        if (!element) return;
        element.className = `engine-status engine-status-${state}`;
        element.textContent = message;
    }

    setFormEnabled(enabled) {
        const inputs = this.form.querySelectorAll('input, select, button');
        inputs.forEach(input => {
            input.disabled = !enabled;
        });
    }
}

/** The rendered PDF, shown inline so the teacher sees exactly what prints. */
function buildPreviewFrame(blobUrl) {
    const frame = document.createElement('iframe');
    frame.className = 'preview-pdf-frame';
    frame.src = blobUrl;
    frame.title = 'Worksheet preview';
    return frame;
}

/** The generated LaTeX, collapsed by default, for anyone who wants to tweak it. */
function buildSourceView(source) {
    const details = document.createElement('details');
    details.className = 'preview-source';

    const summary = document.createElement('summary');
    summary.textContent = 'LaTeX source';
    details.appendChild(summary);

    const pre = document.createElement('pre');
    pre.className = 'preview-source-code custom-scrollbar';
    pre.textContent = source;
    details.appendChild(pre);

    return details;
}
