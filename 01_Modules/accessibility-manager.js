/**
 * Accessibility Enhancement System
 * Provides comprehensive accessibility improvements for the extension
 */

class AccessibilityManager {
    constructor() {
        this.focusHistory = [];
        this.announcements = [];
        this.keyboardHandlers = new Map();
        this.ariaLiveRegion = null;
        this.highContrastMode = false;
        this.reducedMotion = false;
        this.screenReaderActive = false;

        this.init();
    }

    /**
   * Initialize accessibility features
   */
    init() {
        this.createAriaLiveRegion();
        this.detectAccessibilityPreferences();
        this.setupKeyboardNavigation();
        this.enhanceExistingElements();
        this.startAccessibilityMonitoring();
    }

    /**
   * Create ARIA live region for announcements
   */
    createAriaLiveRegion() {
        this.ariaLiveRegion = document.createElement('div');
        this.ariaLiveRegion.setAttribute('aria-live', 'polite');
        this.ariaLiveRegion.setAttribute('aria-atomic', 'true');
        this.ariaLiveRegion.setAttribute('class', 'sr-only');
        this.ariaLiveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

        document.body.appendChild(this.ariaLiveRegion);
    }

    /**
   * Detect user accessibility preferences
   */
    detectAccessibilityPreferences() {
    // Check for high contrast mode
        if (window.matchMedia) {
            const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
            this.highContrastMode = highContrastQuery.matches;

            highContrastQuery.addEventListener('change', (e) => {
                this.highContrastMode = e.matches;
                this.applyHighContrastMode();
            });

            // Check for reduced motion preference
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.reducedMotion = reducedMotionQuery.matches;

            reducedMotionQuery.addEventListener('change', (e) => {
                this.reducedMotion = e.matches;
                this.applyReducedMotion();
            });
        }

        // Detect screen reader
        this.detectScreenReader();
    }

    /**
   * Detect screen reader usage
   */
    detectScreenReader() {
    // Check for screen reader indicators
        const indicators = [
            () => window.navigator.userAgent.includes('NVDA'),
            () => window.navigator.userAgent.includes('JAWS'),
            () => window.speechSynthesis && window.speechSynthesis.getVoices().length > 0,
            () => document.body.getAttribute('data-whatinput') === 'keyboard'
        ];

        this.screenReaderActive = indicators.some(check => {
            try {
                return check();
            } catch (error) {
                return false;
            }
        });

        if (this.screenReaderActive) {
            document.body.classList.add('screen-reader-active');
        }
    }

    /**
   * Setup keyboard navigation
   */
    setupKeyboardNavigation() {
    // Tab management
        this.setupTabNavigation();

        // Arrow key navigation for lists and grids
        this.setupArrowNavigation();

        // Escape key handling
        this.setupEscapeHandling();

        // Custom keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    /**
   * Setup tab navigation
   */
    setupTabNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });

        // Focus management
        document.addEventListener('focus', (e) => {
            this.focusHistory.push({
                element: e.target,
                timestamp: Date.now()
            });

            // Keep only last 10 focus events
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }

            this.announceFocusedElement(e.target);
        }, true);
    }

    /**
   * Handle tab navigation
   */
    handleTabNavigation(e) {
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);

        if (e.shiftKey) {
            // Shift+Tab (backward)
            if (currentIndex <= 0) {
                e.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }
        } else {
            // Tab (forward)
            if (currentIndex >= focusableElements.length - 1) {
                e.preventDefault();
                focusableElements[0].focus();
            }
        }
    }

    /**
   * Setup arrow key navigation
   */
    setupArrowNavigation() {
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowNavigation(e);
            }
        });
    }

    /**
   * Handle arrow key navigation
   */
    handleArrowNavigation(e) {
        const element = e.target;
        const role = element.getAttribute('role');
        const parent = element.closest('[role="listbox"], [role="menu"], [role="grid"], [role="tablist"]');

        if (!parent) {return;}

        const items = Array.from(parent.querySelectorAll('[role="option"], [role="menuitem"], [role="gridcell"], [role="tab"]'));
        const currentIndex = items.indexOf(element);

        if (currentIndex === -1) {return;}

        let nextIndex = currentIndex;

        switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
            nextIndex = (currentIndex + 1) % items.length;
            break;
        case 'ArrowUp':
        case 'ArrowLeft':
            nextIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
            break;
        }

        if (nextIndex !== currentIndex) {
            e.preventDefault();
            items[nextIndex].focus();

            // Update aria-activedescendant if needed
            if (parent.hasAttribute('aria-activedescendant')) {
                parent.setAttribute('aria-activedescendant', items[nextIndex].id || '');
            }
        }
    }

    /**
   * Setup escape key handling
   */
    setupEscapeHandling() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape(e);
            }
        });
    }

    /**
   * Handle escape key
   */
    handleEscape(e) {
    // Close modals, dropdowns, etc.
        const openModals = document.querySelectorAll('[role="dialog"][aria-hidden="false"], .modal:not(.hidden)');
        if (openModals.length > 0) {
            const modal = openModals[openModals.length - 1];
            this.closeModal(modal);
            e.preventDefault();
            return;
        }

        // Close dropdowns
        const openDropdowns = document.querySelectorAll('[aria-expanded="true"]');
        if (openDropdowns.length > 0) {
            openDropdowns.forEach(dropdown => {
                dropdown.setAttribute('aria-expanded', 'false');
                const menu = document.getElementById(dropdown.getAttribute('aria-controls'));
                if (menu) {
                    menu.hidden = true;
                }
            });
            e.preventDefault();
            return;
        }

        // Return focus to previous element
        if (this.focusHistory.length > 1) {
            const previous = this.focusHistory[this.focusHistory.length - 2];
            if (previous.element && document.contains(previous.element)) {
                previous.element.focus();
                e.preventDefault();
            }
        }
    }

    /**
   * Setup keyboard shortcuts
   */
    setupKeyboardShortcuts() {
        const shortcuts = {
            'Alt+1': () => this.skipToMainContent(),
            'Alt+2': () => this.skipToNavigation(),
            'Alt+s': () => this.focusSearch(),
            'Alt+h': () => this.showHelp(),
            'Ctrl+/': () => this.showKeyboardShortcuts()
        };

        document.addEventListener('keydown', (e) => {
            const key = this.getShortcutKey(e);
            const handler = shortcuts[key];

            if (handler) {
                e.preventDefault();
                handler();
            }
        });
    }

    /**
   * Get shortcut key combination
   */
    getShortcutKey(e) {
        const parts = [];

        if (e.ctrlKey) {parts.push('Ctrl');}
        if (e.altKey) {parts.push('Alt');}
        if (e.shiftKey) {parts.push('Shift');}
        if (e.metaKey) {parts.push('Meta');}

        parts.push(e.key);

        return parts.join('+');
    }

    /**
   * Enhance existing elements with accessibility features
   */
    enhanceExistingElements() {
    // Add missing labels
        this.addMissingLabels();

        // Enhance buttons
        this.enhanceButtons();

        // Enhance forms
        this.enhanceForms();

        // Enhance images
        this.enhanceImages();

        // Add landmark roles
        this.addLandmarkRoles();
    }

    /**
   * Add missing labels to form elements
   */
    addMissingLabels() {
        const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([id]), textarea:not([aria-label]):not([aria-labelledby]):not([id]), select:not([aria-label]):not([aria-labelledby]):not([id])');

        unlabeledInputs.forEach((input, index) => {
            const placeholder = input.getAttribute('placeholder');
            const name = input.getAttribute('name');
            const type = input.getAttribute('type');

            const labelText = placeholder || name || type || `Input ${index + 1}`;
            input.setAttribute('aria-label', labelText);
        });
    }

    /**
   * Enhance buttons with accessibility features
   */
    enhanceButtons() {
        const buttons = document.querySelectorAll('button, [role="button"]');

        buttons.forEach(button => {
            // Add role if missing
            if (!button.hasAttribute('role') && button.tagName !== 'BUTTON') {
                button.setAttribute('role', 'button');
            }

            // Add tabindex if missing
            if (!button.hasAttribute('tabindex')) {
                button.setAttribute('tabindex', '0');
            }

            // Add keyboard support for non-button elements
            if (button.tagName !== 'BUTTON') {
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        button.click();
                    }
                });
            }

            // Add pressed state for toggle buttons
            if (button.classList.contains('toggle')) {
                const pressed = button.classList.contains('active');
                button.setAttribute('aria-pressed', pressed.toString());
            }
        });
    }

    /**
   * Enhance forms with accessibility features
   */
    enhanceForms() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            // Add form role if missing
            if (!form.hasAttribute('role')) {
                form.setAttribute('role', 'form');
            }

            // Add required field indicators
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                field.setAttribute('aria-required', 'true');

                // Add visual indicator
                const label = form.querySelector(`label[for="${field.id}"]`);
                if (label && !label.querySelector('.required-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'required-indicator';
                    indicator.textContent = ' *';
                    indicator.setAttribute('aria-label', 'required');
                    label.appendChild(indicator);
                }
            });

            // Add error handling
            form.addEventListener('submit', (e) => {
                this.handleFormValidation(form, e);
            });
        });
    }

    /**
   * Enhance images with accessibility features
   */
    enhanceImages() {
        const images = document.querySelectorAll('img:not([alt])');

        images.forEach(img => {
            const src = img.getAttribute('src');
            const filename = src ? src.split('/').pop().split('.')[0] : 'image';
            img.setAttribute('alt', filename);
        });
    }

    /**
   * Add landmark roles to page sections
   */
    addLandmarkRoles() {
    // Main content
        const main = document.querySelector('main, #main, .main-content');
        if (main && !main.hasAttribute('role')) {
            main.setAttribute('role', 'main');
        }

        // Navigation
        const nav = document.querySelector('nav, .navigation, .nav');
        if (nav && !nav.hasAttribute('role')) {
            nav.setAttribute('role', 'navigation');
        }

        // Search
        const search = document.querySelector('.search, #search, [data-search]');
        if (search && !search.hasAttribute('role')) {
            search.setAttribute('role', 'search');
        }
    }

    /**
   * Get all focusable elements
   */
    getFocusableElements() {
        const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
        const elements = Array.from(document.querySelectorAll(selector));

        return elements.filter(el => {
            return !el.disabled &&
             !el.hasAttribute('aria-hidden') &&
             el.offsetParent !== null &&
             window.getComputedStyle(el).visibility !== 'hidden';
        });
    }

    /**
   * Announce text to screen readers
   */
    announce(text, priority = 'polite') {
        if (!text || typeof text !== 'string') {return;}

        this.announcements.push({
            text,
            priority,
            timestamp: Date.now()
        });

        // Update live region
        this.ariaLiveRegion.setAttribute('aria-live', priority);
        this.ariaLiveRegion.textContent = text;

        // Clear after announcement
        setTimeout(() => {
            this.ariaLiveRegion.textContent = '';
        }, 1000);
    }

    /**
   * Announce focused element
   */
    announceFocusedElement(element) {
        if (!this.screenReaderActive) {return;}

        const role = element.getAttribute('role') || element.tagName.toLowerCase();
        const label = this.getElementLabel(element);
        const description = element.getAttribute('aria-describedby');

        let announcement = '';

        if (label) {
            announcement += label;
        }

        if (role && role !== 'generic') {
            announcement += `, ${role}`;
        }

        if (description) {
            const descElement = document.getElementById(description);
            if (descElement) {
                announcement += `, ${descElement.textContent}`;
            }
        }

        // Add state information
        const state = this.getElementState(element);
        if (state) {
            announcement += `, ${state}`;
        }

        if (announcement) {
            this.announce(announcement.trim(), 'polite');
        }
    }

    /**
   * Get element label
   */
    getElementLabel(element) {
    // Try aria-label first
        if (element.hasAttribute('aria-label')) {
            return element.getAttribute('aria-label');
        }

        // Try aria-labelledby
        if (element.hasAttribute('aria-labelledby')) {
            const labelIds = element.getAttribute('aria-labelledby').split(' ');
            const labels = labelIds.map(id => {
                const labelElement = document.getElementById(id);
                return labelElement ? labelElement.textContent : '';
            }).filter(text => text);

            if (labels.length > 0) {
                return labels.join(' ');
            }
        }

        // Try associated label
        if (element.id) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) {
                return label.textContent;
            }
        }

        // Try placeholder
        if (element.hasAttribute('placeholder')) {
            return element.getAttribute('placeholder');
        }

        // Try text content for buttons
        if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
            return element.textContent;
        }

        // Try alt text for images
        if (element.tagName === 'IMG') {
            return element.getAttribute('alt');
        }

        return '';
    }

    /**
   * Get element state
   */
    getElementState(element) {
        const states = [];

        if (element.hasAttribute('aria-expanded')) {
            const expanded = element.getAttribute('aria-expanded') === 'true';
            states.push(expanded ? 'expanded' : 'collapsed');
        }

        if (element.hasAttribute('aria-pressed')) {
            const pressed = element.getAttribute('aria-pressed') === 'true';
            states.push(pressed ? 'pressed' : 'not pressed');
        }

        if (element.hasAttribute('aria-checked')) {
            const checked = element.getAttribute('aria-checked');
            states.push(`${checked} checked`);
        }

        if (element.hasAttribute('aria-selected')) {
            const selected = element.getAttribute('aria-selected') === 'true';
            states.push(selected ? 'selected' : 'not selected');
        }

        if (element.disabled) {
            states.push('disabled');
        }

        if (element.hasAttribute('required')) {
            states.push('required');
        }

        return states.join(', ');
    }

    /**
   * Apply high contrast mode
   */
    applyHighContrastMode() {
        if (this.highContrastMode) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }

    /**
   * Apply reduced motion preferences
   */
    applyReducedMotion() {
        if (this.reducedMotion) {
            document.body.classList.add('reduced-motion');

            // Disable animations
            const style = document.createElement('style');
            style.textContent = `
        .reduced-motion *, 
        .reduced-motion *::before, 
        .reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
            document.head.appendChild(style);
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }

    /**
   * Start accessibility monitoring
   */
    startAccessibilityMonitoring() {
    // Monitor for new elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.enhanceNewElement(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
   * Enhance newly added elements
   */
    enhanceNewElement(element) {
    // Add accessibility features to new elements
        if (element.tagName === 'BUTTON' || element.hasAttribute('role') === 'button') {
            this.enhanceButtons();
        }

        if (element.tagName === 'IMG') {
            this.enhanceImages();
        }

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
            this.addMissingLabels();
        }
    }

    /**
   * Skip to main content
   */
    skipToMainContent() {
        const main = document.querySelector('[role="main"], main, #main');
        if (main) {
            main.focus();
            this.announce('Skipped to main content');
        }
    }

    /**
   * Skip to navigation
   */
    skipToNavigation() {
        const nav = document.querySelector('[role="navigation"], nav, .navigation');
        if (nav) {
            nav.focus();
            this.announce('Skipped to navigation');
        }
    }

    /**
   * Focus search input
   */
    focusSearch() {
        const search = document.querySelector('[role="search"] input, .search input, #search');
        if (search) {
            search.focus();
            this.announce('Search focused');
        }
    }

    /**
   * Show help dialog
   */
    showHelp() {
        this.announce('Help dialog opened');
    // Implementation depends on specific help system
    }

    /**
   * Show keyboard shortcuts
   */
    showKeyboardShortcuts() {
        const shortcuts = [
            'Alt+1: Skip to main content',
            'Alt+2: Skip to navigation',
            'Alt+S: Focus search',
            'Alt+H: Show help',
            'Ctrl+/: Show keyboard shortcuts',
            'Tab: Next element',
            'Shift+Tab: Previous element',
            'Enter/Space: Activate button',
            'Arrow keys: Navigate lists and menus',
            'Escape: Close dialogs and menus'
        ];

        this.announce(`Keyboard shortcuts: ${shortcuts.join(', ')}`);
    }

    /**
   * Handle form validation
   */
    handleFormValidation(form, e) {
        const invalidFields = [];
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            if (!input.checkValidity()) {
                invalidFields.push(input);

                // Add aria-invalid
                input.setAttribute('aria-invalid', 'true');

                // Add error message
                this.addErrorMessage(input, input.validationMessage);
            } else {
                input.removeAttribute('aria-invalid');
                this.removeErrorMessage(input);
            }
        });

        if (invalidFields.length > 0) {
            e.preventDefault();
            invalidFields[0].focus();
            this.announce(`Form has ${invalidFields.length} error${invalidFields.length > 1 ? 's' : ''}. Please correct and try again.`, 'assertive');
        }
    }

    /**
   * Add error message to field
   */
    addErrorMessage(field, message) {
        const existingError = document.getElementById(`${field.id}-error`);
        if (existingError) {
            existingError.textContent = message;
            return;
        }

        const errorElement = document.createElement('div');
        errorElement.id = `${field.id}-error`;
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');

        field.parentNode.insertBefore(errorElement, field.nextSibling);
        field.setAttribute('aria-describedby', errorElement.id);
    }

    /**
   * Remove error message from field
   */
    removeErrorMessage(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.remove();
            field.removeAttribute('aria-describedby');
        }
    }

    /**
   * Close modal dialog
   */
    closeModal(modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';

        // Return focus to trigger element
        const trigger = document.querySelector(`[aria-controls="${modal.id}"]`);
        if (trigger) {
            trigger.focus();
        }

        this.announce('Dialog closed');
    }
}

// Create global accessibility manager
const globalAccessibilityManager = new AccessibilityManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}

// Make available globally
window.AccessibilityManager = AccessibilityManager;
window.globalAccessibilityManager = globalAccessibilityManager;
