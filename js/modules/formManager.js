/**
 * Form Manager Module
 * Handles form interactions, validation, and dynamic updates
 * @module formManager
 */

import { PDFGenerator } from './pdfGenerator.js';
import { GRADE_CONFIGS, SUBJECT_TOPICS } from './constants.js';

export class FormManager {
    constructor() {
        this.form = document.getElementById('pdfForm');
        this.pdfGenerator = new PDFGenerator();
        this.currentPDFBlobUrl = null; // Store current blob URL for cleanup
        this.initializeForm();
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

        // Topic selection handlers
        document.addEventListener('change', (e) => {
            if (e.target.id === 'topic-all') {
                this.handleAllTopicsToggle(e.target.checked);
            } else if (e.target.classList.contains('topic-checkbox')) {
                this.handleIndividualTopicToggle();
            }
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
        // Get first selected subject for topic display
        const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
        const selectedSubjects = Array.from(subjectCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        const subject = selectedSubjects[0] || 'arithmetic';
        const gradeLevel = document.getElementById('gradeLevel').value;
        const topicContainer = document.getElementById('topicSelection');

        if (!subject || !SUBJECT_TOPICS[subject]) {
            return;
        }

        const allTopics = SUBJECT_TOPICS[subject].topics;

        // Filter topics by grade level
        const gradeAppropriateTopics = Object.entries(allTopics).filter(([key, topicData]) => {
            if (typeof topicData === 'string') {
                return true;
            }
            return topicData.grades && topicData.grades.includes(gradeLevel);
        });

        // Clear existing topics
        topicContainer.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" value="all" id="topic-all" class="checkbox-input" checked>
                <span class="checkbox-text">All Topics</span>
            </label>
        `;

        // Add individual grade-appropriate topics
        gradeAppropriateTopics.forEach(([key, topicData]) => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';

            const topicName = typeof topicData === 'string' ? topicData : topicData.name;

            label.innerHTML = `
                <input type="checkbox" value="${key}" class="topic-checkbox checkbox-input" disabled>
                <span class="checkbox-text">${topicName}</span>
            `;
            topicContainer.appendChild(label);
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
            answerKey: document.getElementById('answerKey').value
        };
    }

    validateFormData(formData) {
        const errors = [];

        // Validate operations (only for arithmetic subject)
        if (formData.subject === 'arithmetic' && formData.operations.length === 0) {
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

    handleFormSubmit() {
        const formData = this.getFormData();

        const validationErrors = this.validateFormData(formData);
        if (validationErrors.length > 0) {
            this.showValidationErrors(validationErrors);
            return;
        }

        this.clearValidationErrors();
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

    handlePDFPreview() {
        const formData = this.getFormData();

        const basicErrors = this.validateFormData(formData).filter(error =>
            !['generation-size', 'numPDFs', 'numPages'].includes(error.field)
        );

        if (basicErrors.length > 0) {
            this.showValidationErrors(basicErrors);
            return;
        }

        this.clearValidationErrors();

        try {
            // Clean up previous blob URL if exists
            if (this.currentPDFBlobUrl) {
                URL.revokeObjectURL(this.currentPDFBlobUrl);
            }

            // Generate PDF preview with all pages from settings
            const { blobUrl, pdfBlob } = this.pdfGenerator.generatePDFPreview(formData);
            this.currentPDFBlobUrl = blobUrl;

            // Show PDF preview in the preview-content div
            const previewContainer = document.getElementById('preview-container');
            const previewContent = document.getElementById('preview-content');

            // Build settings header
            const operationText = formData.operations.length === 1 ? formData.operations[0] : `Mixed (${formData.operations.join(', ')})`;
            const difficultyText = formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1);

            let topicText = 'All Topics';
            if (formData.topics !== 'all' && formData.topics.length > 0) {
                const subjectTopics = SUBJECT_TOPICS[formData.subject]?.topics || {};
                const topicNames = formData.topics.map(topic => {
                    const topicData = subjectTopics[topic];
                    return typeof topicData === 'string' ? topicData : topicData?.name || topic;
                });
                topicText = topicNames.length === 1 ? topicNames[0] : `Selected (${topicNames.join(', ')})`;
            }

            const previewHeader = `
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--accent-primary);">Preview Settings</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; font-size: 0.9rem;">
                        <div><strong>Grade:</strong> ${GRADE_CONFIGS[formData.gradeLevel]?.name}</div>
                        <div><strong>Subject:</strong> ${SUBJECT_TOPICS[formData.subject]?.name}</div>
                        <div><strong>Difficulty:</strong> ${difficultyText}</div>
                        <div><strong>Problem Type:</strong> ${formData.problemType === 'mixed' ? 'Mixed Format' : formData.problemType}</div>
                        <div><strong>Topics:</strong> ${topicText}</div>
                        <div><strong>Operations:</strong> ${operationText}</div>
                        <div><strong>Pages:</strong> ${formData.numPages} page${formData.numPages !== 1 ? 's' : ''}</div>
                        <div><strong>Answer Key:</strong> ${formData.answerKey === 'separate' ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            `;

            // Replace content with header and iframe
            previewContent.innerHTML = `
                ${previewHeader}
                <iframe src="${blobUrl}" style="width: 100%; height: 800px; border: 1px solid var(--border-light); border-radius: var(--radius-md); display: block; background-color: #525659;"></iframe>
            `;
            previewContent.classList.add('pdf-mode');

            // Show container
            previewContainer.style.display = 'block';
            previewContainer.classList.add('show');

            // Scroll to the preview
            setTimeout(() => {
                previewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            console.log(`PDF Preview: Successfully displayed ${formData.numPages} pages in preview container`);
        } catch (error) {
            console.error('Error generating PDF preview:', error);
            this.showGeneralError('An error occurred while generating the PDF preview. Please try again.', 'error');
        }
    }

    setFormEnabled(enabled) {
        const inputs = this.form.querySelectorAll('input, select, button');
        inputs.forEach(input => {
            input.disabled = !enabled;
        });
    }
}
