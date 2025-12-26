/**
 * Progress Tracking Module
 * Manages progress bar display and updates during PDF generation
 * @module progressManager
 */

export class ProgressManager {
    constructor() {
        this.container = document.getElementById('progress-container');
        this.fill = document.getElementById('progress-fill');
        this.message = document.getElementById('progress-message');

        if (!this.container || !this.fill || !this.message) {
            console.warn('Progress elements not found in DOM');
        }
    }

    /**
     * Shows the progress container
     */
    show() {
        if (this.container) {
            this.container.classList.add('show');
            this.container.style.display = 'block';
        }
        this.updateProgress(0, 'Initializing...');
    }

    /**
     * Hides the progress container
     */
    hide() {
        if (this.container) {
            this.container.classList.remove('show');
            this.container.style.display = 'none';
        }
        this.reset();
    }

    /**
     * Updates progress bar and message
     * @param {number} percentage - Progress percentage (0-100)
     * @param {string} message - Status message
     */
    updateProgress(percentage, message = '') {
        // Clamp percentage between 0 and 100
        percentage = Math.max(0, Math.min(100, percentage));

        if (this.fill) {
            this.fill.style.width = `${percentage}%`;
        }

        if (message && this.message) {
            this.message.textContent = message;
        }
    }

    /**
     * Resets progress to initial state
     */
    reset() {
        this.updateProgress(0, '');
    }

    /**
     * Sets progress to complete state
     * @param {string} message - Completion message
     */
    complete(message = 'Complete!') {
        this.updateProgress(100, message);
    }

    /**
     * Increments progress by specified amount
     * @param {number} increment - Amount to increment (0-100)
     * @param {string} message - Optional status message
     */
    increment(increment, message = '') {
        const currentWidth = this.fill ? parseFloat(this.fill.style.width) || 0 : 0;
        const newProgress = Math.min(100, currentWidth + increment);
        this.updateProgress(newProgress, message);
    }
}
