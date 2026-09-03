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

/**
 * Deepens the floating bar's shadow once the page has moved beneath it, so the
 * layering reads as a bar over content rather than a stripe printed on it.
 */
function trackAppBarElevation() {
    const appbar = document.querySelector('.appbar');
    if (!appbar) return;

    const update = () => appbar.classList.toggle('is-scrolled', window.scrollY > 4);
    window.addEventListener('scroll', update, { passive: true });
    update();
}

document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    trackAppBarElevation();
    window.formManager = new FormManager();
});
