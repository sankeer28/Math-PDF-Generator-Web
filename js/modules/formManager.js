/**
 * Form Manager Module
 * Handles form interactions, validation, and dynamic updates
 * @module formManager
 */

import { WorksheetGenerator, LatexError, fileNameStem } from '../latex/worksheetGenerator.js';
import { ProgressManager } from './progressManager.js';
import { createZip, saveBlob } from './zip.js';
import { History } from './history.js';
import { GRADE_CONFIGS, SUBJECT_TOPICS } from './constants.js';
import { parametersForTopic, defaultParameterValues } from '../curriculum/config/parameters.js';

/** Sets a control's value, ignoring anything the saved entry did not carry. */
function setValue(id, value) {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== null) element.value = String(value);
}

/** The short list of facts that identify a past run. */
function describeOptions(options) {
    const subjects = options.subjects || [];
    const parts = [
        GRADE_CONFIGS[options.gradeLevel]?.name || options.gradeLevel,
        capitalize(options.difficulty),
        subjects.length === 1 ? subjectLabel(subjects[0]) : `${subjects.length} subjects`,
        options.problemType === 'mixed' ? 'Mixed format' : capitalize(options.problemType),
        `${options.numPages} page${options.numPages === 1 ? '' : 's'}`,
        options.paperSize === 'a4' ? 'A4' : 'Letter',
    ];
    if (options.topics !== 'all' && Array.isArray(options.topics)) {
        parts.push(`${options.topics.length} topics`);
    }
    if (options.answerKey === 'separate') parts.push('Answer key');
    if (Number(options.numPDFs) > 1) parts.push(`\u00d7${options.numPDFs} copies`);
    return parts;
}

/** "12 min ago" reads better than a timestamp for something this recent. */
function formatWhen(savedAt) {
    const seconds = Math.round((Date.now() - savedAt) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} d ago`;
    return new Date(savedAt).toLocaleDateString();
}

/** Sentence case for a single lower-case word coming from the form. */
function capitalize(text) {
    const value = String(text || '');
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/** A subject's display name, from the curriculum data rather than a copy of it. */
function subjectLabel(subjectId) {
    return SUBJECT_TOPICS[subjectId]?.name || subjectId;
}

export class FormManager {
    constructor() {
        this.form = document.getElementById('pdfForm');
        this.worksheetGenerator = new WorksheetGenerator();
        this.progress = new ProgressManager();
        this.history = new History();
        this.currentPDFBlobUrl = null;
        this.previewTimer = null;
        this.previewRunning = false;
        this.previewAgain = false;
        this.initializeForm();

        // The TeX bundle is a few megabytes; fetch it while the teacher is still
        // choosing options rather than making them wait once they hit Generate.
        this.worksheetGenerator.prepare().then(
            () => {
                // Nothing to announce once it works: the preview appearing says so.
                this.setEngineStatus('ready');
                this.schedulePreview(0);
            },
            (error) => {
                console.error('The LaTeX engine failed to load:', error);
                this.setEngineStatus('error', 'The LaTeX engine could not load. Check your connection and reload the page.');
            }
        );
    }

    initializeForm() {
        // Validation is ours (validateFormData) and values are clamped again in
        // the generator. Native validation would also refuse to submit whenever
        // a control in a hidden tab panel is invalid, and cannot focus it to say
        // why, so the download would fail with nothing but a console warning.
        this.form.noValidate = true;

        this.populateGradeLevels();

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

        // "All subjects" is part of the static markup, so it binds once.
        document.getElementById('subject-all').addEventListener('change', (event) => {
            for (const checkbox of document.querySelectorAll('.subject-checkbox')) {
                checkbox.checked = event.target.checked;
            }
            this.updateOperationTypesForSubject();
            this.updateProblemTypeForSubject();
            this.updateTopicOptions();
            this.updateWorksheetTitle();
            this.toggleOperationsVisibility();
        });

        document.getElementById('topic-all').addEventListener('change', (event) => {
            for (const checkbox of document.querySelectorAll('.topic-checkbox')) {
                checkbox.checked = event.target.checked;
            }
        });

        // Any settings change re-typesets the preview, so the pane always shows
        // what the current options produce.
        this.form.addEventListener('input', () => this.schedulePreview());
        this.form.addEventListener('change', () => this.schedulePreview());

        document.getElementById('historyClear').addEventListener('click', () => {
            this.history.clear();
            this.renderHistory();
        });

        this.initializeTabs();
        this.renderHistory();
        this.updateWorksheetTitle();
    }

    /**
     * Fills the grade selector from the curriculum data, so grade names and
     * Ontario course codes live in one place.
     */
    populateGradeLevels() {
        const select = document.getElementById('gradeLevel');
        select.replaceChildren(...Object.values(GRADE_CONFIGS).map((grade) => {
            const option = document.createElement('option');
            option.value = grade.id;
            option.textContent = grade.course
                ? `${grade.name} — ${grade.courseName}`
                : grade.name;
            return option;
        }));
    }

    /**
     * Turns the four sections into tabs.
     *
     * Only one section is visible at a time, so the settings column stays about
     * a screen tall instead of scrolling past four stacked panels. Hidden
     * panels stay in the DOM, so every control is still readable by the form.
     */
    initializeTabs() {
        const tabs = [...document.querySelectorAll('.step-link')];
        if (tabs.length === 0) return;

        const select = (chosen) => {
            for (const tab of tabs) {
                const panel = document.getElementById(tab.getAttribute('aria-controls'));
                const isChosen = tab === chosen;
                tab.setAttribute('aria-selected', String(isChosen));
                tab.classList.toggle('is-active', isChosen);
                if (panel) panel.hidden = !isChosen;
            }
        };

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => select(tab));
            tab.addEventListener('keydown', (event) => {
                const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
                if (step === 0) return;
                event.preventDefault();
                const next = tabs[(index + step + tabs.length) % tabs.length];
                next.focus();
                select(next);
            });
        });

        select(tabs[0]);
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

        let subjectName = 'Math';
        if (selectedSubjects.length === 1) {
            subjectName = subjectLabel(selectedSubjects[0]);
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

    /**
     * Renders the subject chips for the current grade.
     *
     * The "All" checkbox is part of the static markup, so it is bound once in
     * initializeForm(); only the chips are rebuilt here.
     */
    updateSubjectOptions() {
        const gradeLevel = document.getElementById('gradeLevel').value;
        const container = document.getElementById('subjectSelection');

        container.replaceChildren(...GRADE_CONFIGS[gradeLevel].subjects.map((subject) => {
            const label = document.createElement('label');
            label.className = 'chip';
            label.innerHTML = `
                <input type="checkbox" value="${subject}" class="checkbox-input subject-checkbox" checked>
                <span class="chip-text">${subjectLabel(subject)}</span>
            `;
            label.title = SUBJECT_TOPICS[subject]?.description || '';
            return label;
        }));

        for (const checkbox of container.querySelectorAll('.subject-checkbox')) {
            checkbox.addEventListener('change', () => {
                this.syncAllSubjectsCheckbox();
                this.updateOperationTypesForSubject();
                this.updateProblemTypeForSubject();
                this.updateTopicOptions();
                this.updateWorksheetTitle();
                this.toggleOperationsVisibility();
            });
        }

        this.syncAllSubjectsCheckbox();
        this.updateOperationTypesForSubject();
        this.updateProblemTypeForSubject();
        this.updateTopicOptions();
    }

    /** Keeps the "All" topic checkbox in step with the individual topics. */
    syncAllTopicsCheckbox() {
        const boxes = [...document.querySelectorAll('.topic-checkbox')];
        const all = document.getElementById('topic-all');
        all.checked = boxes.length > 0 && boxes.every((box) => box.checked);
        all.indeterminate = !all.checked && boxes.some((box) => box.checked);
    }

    /** Keeps the "All" subject checkbox in step with the individual chips. */
    syncAllSubjectsCheckbox() {
        const boxes = [...document.querySelectorAll('.subject-checkbox')];
        const all = document.getElementById('subject-all');
        all.checked = boxes.length > 0 && boxes.every((box) => box.checked);
        all.indeterminate = !all.checked && boxes.some((box) => box.checked);
    }

    updateTopicOptions() {
        // Get all selected subjects for comprehensive topic display
        const subjectCheckboxes = document.querySelectorAll('.subject-checkbox');
        const selectedSubjects = Array.from(subjectCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        const gradeLevel = document.getElementById('gradeLevel').value;
        const topicContainer = document.getElementById('topicSelection');

        if (selectedSubjects.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'field-help';
            empty.textContent = 'Choose a subject to see its topics.';
            topicContainer.replaceChildren(empty);
            return;
        }

        topicContainer.replaceChildren();

        // Add topics from each selected subject, grouped by subject
        selectedSubjects.forEach(subjectId => {
            const subjectConfig = SUBJECT_TOPICS[subjectId];

            if (!subjectConfig || !subjectConfig.topics) {
                return;
            }

            const allTopics = subjectConfig.topics;

            // Topics declare the grades they belong to, so filtering is direct.
            const gradeAppropriateTopics = Object.entries(allTopics)
                .filter(([, topic]) => topic.grades?.includes(gradeLevel));

            // Only show subject header if there are topics for this subject
            if (gradeAppropriateTopics.length > 0) {
                // Add subject header (non-interactive)
                const headerDiv = document.createElement('div');
                headerDiv.className = 'topic-subject-header';
                headerDiv.textContent = subjectLabel(subjectId);
                topicContainer.appendChild(headerDiv);

                // Add individual grade-appropriate topics for this subject (auto-selected)
                gradeAppropriateTopics.forEach(([key, topic]) => {
                    topicContainer.appendChild(this.buildTopicRow(subjectId, key, topic));
                });
            }
        });

        // The topics themselves are rebuilt on every change, so they bind here;
        // "All topics" is static markup and binds once, in initializeForm().
        for (const checkbox of topicContainer.querySelectorAll('.topic-checkbox')) {
            checkbox.addEventListener('change', () => this.syncAllTopicsCheckbox());
        }
        this.syncAllTopicsCheckbox();
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
            equations: 'Equations only',
            word: 'Word problems only',
            visual: 'Diagrams only',
            mixed: 'Mixed (alternating pages)',
            story: 'Story problems'
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

    /**
     * One topic row: the checkbox that includes it, plus a disclosure holding
     * whatever parameters that topic exposes. Values are held on the element so
     * re-rendering the list cannot lose them silently.
     *
     * @returns {HTMLElement}
     */
    buildTopicRow(subjectId, topicId, topic) {
        const parameters = parametersForTopic(topic);
        const row = document.createElement('div');
        row.className = 'topic-row';

        const label = document.createElement('label');
        label.className = 'checkbox-label';
        label.innerHTML = `
            <input type="checkbox" value="${subjectId}:${topicId}" class="topic-checkbox checkbox-input" checked>
            <span class="checkbox-text">${topic.name}</span>
        `;
        label.title = topic.description || '';
        row.appendChild(label);

        if (parameters.length === 0) return row;

        const details = document.createElement('details');
        details.className = 'topic-parameters';

        const summary = document.createElement('summary');
        summary.textContent = `Customize (${parameters.length})`;
        details.appendChild(summary);

        for (const parameter of parameters) {
            details.appendChild(this.buildParameterControl(topicId, parameter));
        }

        row.appendChild(details);
        return row;
    }

    /** A single labelled control bound to one topic parameter. */
    buildParameterControl(topicId, parameter) {
        const field = document.createElement('div');
        field.className = 'topic-parameter';

        const id = `param-${topicId}-${parameter.id}`;
        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = parameter.label;
        label.title = parameter.help;

        let input;
        if (parameter.type === 'boolean') {
            input = document.createElement('input');
            input.type = 'checkbox';
            // Shares the app's checkbox styling rather than the browser default.
            input.classList.add('checkbox-input');
            input.checked = Boolean(parameter.default);
        } else if (parameter.type === 'select') {
            input = document.createElement('select');
            for (const option of parameter.options) {
                const element = document.createElement('option');
                element.value = option.value;
                element.textContent = option.label;
                input.appendChild(element);
            }
            input.value = String(parameter.default);
        } else {
            input = document.createElement('input');
            input.type = 'number';
            input.min = parameter.min;
            input.max = parameter.max;
            input.step = parameter.step;
            input.value = String(parameter.default);
        }

        input.id = id;
        input.classList.add('topic-parameter-input');
        input.dataset.topic = topicId;
        input.dataset.parameter = parameter.id;
        input.dataset.type = parameter.type;

        field.append(label, input);
        return field;
    }

    /**
     * Collects every parameter control into { topicId: { parameterId: value } }.
     * The generator clamps these again, so a hand-edited value cannot break it.
     */
    getTopicParameters() {
        const values = {};
        for (const input of document.querySelectorAll('.topic-parameter-input')) {
            const { topic, parameter, type } = input.dataset;
            values[topic] ??= {};
            values[topic][parameter] = type === 'boolean' ? input.checked : input.value;
        }
        return values;
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
                // Values are "subject:topic" so they stay unique in the DOM; the
                // generators match on the bare topic id.
                .map(checkbox => checkbox.value.split(':').pop());
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
            paperSize: document.getElementById('paperSize').value,
            topicParameters: this.getTopicParameters()
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
        this.history.add(formData);
        this.renderHistory();

        const stem = fileNameStem(formData.pdfTitle);

        if (worksheets.length === 1) {
            saveBlob(new Blob([worksheets[0].pdf], { type: 'application/pdf' }), worksheets[0].name);
            return;
        }

        const zip = createZip(worksheets.map((sheet) => ({ name: sheet.name, data: sheet.pdf })));
        saveBlob(zip, `${stem}_worksheets.zip`);
    }

    /** The Preview button: re-rolls the problems and reports any problem loudly. */
    handlePDFPreview() {
        return this.renderPreview({ announce: true });
    }

    /**
     * Queues an automatic preview.
     *
     * Typesetting takes a moment, so edits are coalesced: only the last change
     * in a burst is typeset, and the settings are read when the run starts
     * rather than when it was queued.
     */
    schedulePreview(delay = 650) {
        clearTimeout(this.previewTimer);
        this.previewTimer = setTimeout(() => this.renderPreview(), delay);
    }

    /**
     * Typesets one worksheet into the preview pane.
     *
     * @param {object} [options]
     * @param {boolean} [options.announce] - show progress and surface errors;
     *   automatic previews stay quiet so they cannot interrupt typing
     */
    async renderPreview({ announce = false } = {}) {
        // A run is already in flight: remember to repeat it with the newer settings.
        if (this.previewRunning) {
            this.previewAgain = true;
            return;
        }

        const formData = this.getFormData();
        const blocking = this.validateFormData(formData).filter((error) =>
            !['generation-size', 'numPDFs', 'numPages'].includes(error.field)
        );

        if (blocking.length > 0) {
            if (announce) this.showValidationErrors(blocking);
            return;
        }
        if (announce) this.clearValidationErrors();

        this.previewRunning = true;
        this.setPreviewBusy(true);
        if (announce) this.progress.show();

        try {
            if (!this.worksheetGenerator.isEngineReady) {
                if (announce) this.progress.updateProgress(10, 'Loading the LaTeX engine...');
                await this.worksheetGenerator.prepare();
            }

            if (announce) this.progress.updateProgress(50, 'Typesetting the preview...');
            const { pdf, source } = await this.worksheetGenerator.generateOne(formData);
            this.showPreview(pdf, source, formData);
        } catch (error) {
            if (announce) this.reportLatexFailure(error, 'typeset this preview');
            else console.error('Automatic preview failed:', error);
        } finally {
            this.previewRunning = false;
            this.setPreviewBusy(false);
            if (announce) this.progress.hide();

            if (this.previewAgain) {
                this.previewAgain = false;
                this.schedulePreview(0);
            }
        }
    }

    /** Dims the preview, and spins the regenerate icon, while one is typeset. */
    setPreviewBusy(busy) {
        document.getElementById('preview-container')?.classList.toggle('is-busy', busy);

        const button = document.getElementById('previewBtn');
        if (!button) return;
        button.disabled = busy;
        button.querySelector('i')?.classList.toggle('fa-spin', busy);
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
        // On a wide screen the preview already sits beside the form; scrolling to
        // it would only push the Preview and Generate buttons out of view.
        if (window.matchMedia('(max-width: 1100px)').matches) {
            setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }

    /**
     * A one-line summary of what was typeset, as small pills.
     *
     * The earlier term/description grid was accurate but ate a third of the
     * preview pane; the same facts fit on a line or two this way.
     */
    buildPreviewSummary(formData) {
        const subjects = formData.subjects || [];
        const pills = [
            GRADE_CONFIGS[formData.gradeLevel]?.name || formData.gradeLevel,
            capitalize(formData.difficulty),
            subjects.length === 1 ? subjectLabel(subjects[0]) : `${subjects.length} subjects`,
            formData.problemType === 'mixed' ? 'Mixed format' : capitalize(formData.problemType),
            `${formData.numPages} page${formData.numPages === 1 ? '' : 's'}`,
            formData.paperSize === 'a4' ? 'A4' : 'Letter',
        ];
        if (formData.answerKey === 'separate') pills.push('Answer key');
        if (Number(formData.numPDFs) > 1) pills.push(`×${formData.numPDFs} copies`);

        const summary = document.createElement('div');
        summary.className = 'preview-summary';
        summary.append(...pills.map((text) => {
            const pill = document.createElement('span');
            pill.className = 'preview-pill';
            pill.textContent = text;
            return pill;
        }));
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

    /**
     * Draws the history panel: one row per past download, showing what was
     * chosen and offering to put those settings back.
     */
    renderHistory() {
        const list = document.getElementById('historyList');
        if (!list) return;

        const entries = this.history.list();
        document.getElementById('historyClear').hidden = entries.length === 0;

        if (entries.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'field-help';
            empty.textContent = 'Nothing yet. Worksheets you download will be listed here.';
            list.replaceChildren(empty);
            return;
        }

        list.replaceChildren(...entries.map((entry) => this.buildHistoryRow(entry)));
    }

    /** @returns {HTMLElement} one history row */
    buildHistoryRow(entry) {
        const { options } = entry;
        const row = document.createElement('div');
        row.className = 'history-row';

        const head = document.createElement('div');
        head.className = 'history-head';

        const title = document.createElement('span');
        title.className = 'history-title';
        title.textContent = options.pdfTitle || 'Untitled worksheet';

        const when = document.createElement('time');
        when.className = 'history-when';
        when.dateTime = new Date(entry.savedAt).toISOString();
        when.textContent = formatWhen(entry.savedAt);

        head.append(title, when);

        const pills = document.createElement('div');
        pills.className = 'history-pills';
        for (const text of describeOptions(options)) {
            const pill = document.createElement('span');
            pill.className = 'preview-pill';
            pill.textContent = text;
            pills.appendChild(pill);
        }

        const actions = document.createElement('div');
        actions.className = 'history-actions';

        const load = document.createElement('button');
        load.type = 'button';
        load.className = 'quiet-btn';
        load.innerHTML = '<i class="fas fa-rotate-left"></i> Load these settings';
        load.addEventListener('click', () => this.applyOptions(options));

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'quiet-btn';
        remove.title = 'Remove from history';
        remove.setAttribute('aria-label', 'Remove from history');
        remove.innerHTML = '<i class="fas fa-xmark"></i>';
        remove.addEventListener('click', () => {
            this.history.remove(entry.id);
            this.renderHistory();
        });

        actions.append(load, remove);
        row.append(head, pills, actions);
        return row;
    }

    /**
     * Puts a saved set of options back into the form.
     *
     * Order matters: the grade decides which subjects exist, the subjects decide
     * which topics exist, and the topics carry the parameter controls, so each
     * list has to be rebuilt before the next selection can be applied.
     */
    applyOptions(options) {
        setValue('gradeLevel', options.gradeLevel);
        this.updateSubjectOptions();

        const subjects = new Set(options.subjects || []);
        for (const checkbox of document.querySelectorAll('.subject-checkbox')) {
            checkbox.checked = subjects.has(checkbox.value);
        }
        this.syncAllSubjectsCheckbox();
        this.updateOperationTypesForSubject();
        this.updateProblemTypeForSubject();
        this.toggleOperationsVisibility();
        this.updateTopicOptions();

        const wantsAllTopics = options.topics === 'all';
        const topics = new Set(wantsAllTopics ? [] : options.topics || []);
        for (const checkbox of document.querySelectorAll('.topic-checkbox')) {
            checkbox.checked = wantsAllTopics || topics.has(checkbox.value.split(':').pop());
        }
        this.syncAllTopicsCheckbox();

        for (const input of document.querySelectorAll('.topic-parameter-input')) {
            const saved = options.topicParameters?.[input.dataset.topic]?.[input.dataset.parameter];
            if (saved === undefined) continue;
            if (input.dataset.type === 'boolean') input.checked = Boolean(saved);
            else input.value = String(saved);
        }

        const operations = new Set(options.operations || []);
        for (const checkbox of document.querySelectorAll('input[type="checkbox"][id^="op-"]')) {
            checkbox.checked = operations.has(checkbox.value);
        }

        const difficulty = { easy: '1', medium: '2', hard: '3' }[options.difficulty] || '2';
        setValue('difficulty', difficulty);
        this.updateDifficultyLabel(difficulty);

        setValue('problemType', options.problemType);
        setValue('answerKey', options.answerKey);
        setValue('numPDFs', options.numPDFs);
        setValue('numPages', options.numPages);
        setValue('pdfTitle', options.pdfTitle);
        setValue('showTitle', options.showTitle);
        setValue('paperSize', options.paperSize);
        setValue('pageNumberPosition', options.pageNumberPosition);

        for (const id of ['showName', 'showDate', 'showScore', 'showGrade',
            'showPageBorder', 'showPageNumberBox', 'showNumberCircles']) {
            const element = document.getElementById(id);
            if (element) element.checked = Boolean(options[id]);
        }

        this.schedulePreview(0);
    }

    /**
     * Reports the engine only while that is worth saying.
     *
     * The first visit downloads several megabytes, so "loading" explains the
     * wait, and a failure has to be visible or nothing works for no apparent
     * reason. Success needs no label: the preview shows up.
     */
    setEngineStatus(state, message = '') {
        const element = document.getElementById('engine-status');
        if (!element) return;

        element.className = `engine-status engine-status-${state}`;
        element.textContent = message;
        element.hidden = state === 'ready';
    }

    /**
     * Locks the settings while a download is being produced.
     *
     * The two actions sit outside the form element, so they are named here as
     * well; otherwise Download stayed live during its own run.
     */
    setFormEnabled(enabled) {
        for (const input of this.form.querySelectorAll('input, select, button')) {
            input.disabled = !enabled;
        }
        for (const button of document.querySelectorAll('.preview-actions .btn, #previewBtn')) {
            button.disabled = !enabled;
        }
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
