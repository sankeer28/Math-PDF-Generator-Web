/**
 * Theme Management Module
 * Handles light/dark theme switching and persistence
 * @module themeManager
 */

export class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'mathgen-theme';
        this.THEMES = ['light', 'dark'];
        this.currentTheme = this.loadTheme();
        this.init();
    }

    /**
     * Loads theme from localStorage or defaults to light
     * @returns {string} Theme name
     */
    loadTheme() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved && this.THEMES.includes(saved) ? saved : 'light';
    }

    /**
     * Initializes theme system
     */
    init() {
        this.applyTheme(this.currentTheme);
        this.initializeToggle();
    }

    /**
     * Applies theme to document
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    applyTheme(theme) {
        if (!this.THEMES.includes(theme)) {
            console.warn(`Invalid theme: ${theme}. Using light theme.`);
            theme = 'light';
        }

        // Remove all theme data attributes
        document.documentElement.removeAttribute('data-theme');

        // Apply new theme (light is default, dark gets attribute)
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        this.currentTheme = theme;
        this.saveTheme(theme);
        this.updateToggleButton();
    }

    /**
     * Saves theme preference to localStorage
     * @param {string} theme - Theme name
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.STORAGE_KEY, theme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }

    /**
     * Initializes theme toggle button event listeners
     */
    initializeToggle() {
        const toggleBtn = document.querySelector('.theme-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    /**
     * Toggles between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    /**
     * Updates toggle button icon based on current theme
     */
    updateToggleButton() {
        const toggleBtn = document.querySelector('.theme-toggle-btn');
        if (!toggleBtn) return;

        const icon = toggleBtn.querySelector('i') || toggleBtn.querySelector('svg');
        if (!icon) return;

        // Update icon class for Font Awesome
        if (icon.tagName === 'I') {
            icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    /**
     * Gets current theme
     * @returns {string} Current theme name
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Checks if dark theme is active
     * @returns {boolean} True if dark theme is active
     */
    isDark() {
        return this.currentTheme === 'dark';
    }
}
