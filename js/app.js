/**
 * Math-PDF-Generator Application
 * Main application entry point
 * @module app
 */

import { ThemeManager } from './modules/themeManager.js';
import { FormManager } from './modules/formManager.js';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Math-PDF-Generator initializing...');

    // Initialize theme system
    const themeManager = new ThemeManager();
    console.log(`Theme initialized: ${themeManager.getTheme()}`);

    // Initialize form management system
    window.formManager = new FormManager();
    console.log('Form manager initialized');

    console.log('Math-PDF-Generator ready!');
});

// Handle service worker registration (optional - for future PWA support)
if ('serviceWorker' in navigator) {
    // Disabled for now, can be enabled later for offline support
    // navigator.serviceWorker.register('/sw.js');
}
