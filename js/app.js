/**
 * Math-PDF-Generator
 *
 * Entry point. Worksheets are typeset by a real LaTeX engine (pdfTeX compiled
 * to WebAssembly) running in the browser, so nothing a teacher types ever
 * leaves the machine and the site can be hosted as plain static files.
 *
 * @module app
 */

import { ThemeManager } from './modules/themeManager.js';
import { FormManager } from './modules/formManager.js';

document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    window.formManager = new FormManager();
});
