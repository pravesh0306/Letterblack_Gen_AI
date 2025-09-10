/**
 * Comprehensive Input Validation System
 * Provides robust validation and sanitization for all user inputs
 */

class InputValidator {
    constructor() {
        this.patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
            apiKey: /^[A-Za-z0-9_-]{10,}$/,
            uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            alphanumeric: /^[a-zA-Z0-9]+$/,
            filename: /^[a-zA-Z0-9._-]+$/,
            hex: /^[0-9a-fA-F]+$/,
            base64: /^[A-Za-z0-9+/]*={0,2}$/
        };

        this.limits = {
            shortText: 100,
            mediumText: 1000,
            longText: 10000,
            scriptContent: 100000,
            apiKey: 200,
            filename: 255,
            url: 2000
        };

        this.dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /eval\s*\(/gi,
            /function\s*\(/gi,
            /\bexec\b/gi,
            /\bsystem\b/gi,
            /\bfile_get_contents\b/gi,
            /\binclude\b/gi,
            /\brequire\b/gi
        ];
    }

    /**
   * Validate text input with length and content checks
   */
    validateText(input, options = {}) {
        const {
            minLength = 0,
            maxLength = this.limits.mediumText,
            allowEmpty = true,
            stripHtml = false,
            allowNewlines = true,
            pattern = null
        } = options;

        const result = {
            valid: false,
            value: null,
            errors: [],
            warnings: []
        };

        // Type check
        if (typeof input !== 'string') {
            result.errors.push('Input must be a string');
            return result;
        }

        let processedInput = input;

        // Strip HTML if requested
        if (stripHtml) {
            processedInput = this.stripHtml(processedInput);
        }

        // Handle newlines
        if (!allowNewlines) {
            processedInput = processedInput.replace(/[\r\n]/g, ' ');
        }

        // Trim whitespace
        processedInput = processedInput.trim();

        // Empty check
        if (!allowEmpty && processedInput.length === 0) {
            result.errors.push('Input cannot be empty');
            return result;
        }

        // Length validation
        if (processedInput.length < minLength) {
            result.errors.push(`Input must be at least ${minLength} characters`);
        }

        if (processedInput.length > maxLength) {
            result.errors.push(`Input must be no more than ${maxLength} characters`);
        }

        // Pattern validation
        if (pattern && !pattern.test(processedInput)) {
            result.errors.push('Input format is invalid');
        }

        // Security checks
        const securityIssues = this.checkSecurity(processedInput);
        result.warnings.push(...securityIssues);

        // Set result
        if (result.errors.length === 0) {
            result.valid = true;
            result.value = processedInput;
        }

        return result;
    }

    /**
   * Validate API key
   */
    validateApiKey(input) {
        return this.validateText(input, {
            minLength: 10,
            maxLength: this.limits.apiKey,
            allowEmpty: false,
            pattern: this.patterns.apiKey
        });
    }

    /**
   * Validate email address
   */
    validateEmail(input) {
        const result = this.validateText(input, {
            minLength: 5,
            maxLength: 254,
            allowEmpty: false
        });

        if (result.valid && !this.patterns.email.test(result.value)) {
            result.valid = false;
            result.errors.push('Invalid email format');
        }

        return result;
    }

    /**
   * Validate URL
   */
    validateUrl(input) {
        const result = this.validateText(input, {
            minLength: 10,
            maxLength: this.limits.url,
            allowEmpty: false
        });

        if (result.valid && !this.patterns.url.test(result.value)) {
            result.valid = false;
            result.errors.push('Invalid URL format');
        }

        return result;
    }

    /**
   * Validate filename
   */
    validateFilename(input) {
        return this.validateText(input, {
            minLength: 1,
            maxLength: this.limits.filename,
            allowEmpty: false,
            pattern: this.patterns.filename
        });
    }

    /**
   * Validate JSON string
   */
    validateJson(input) {
        const result = this.validateText(input, {
            allowEmpty: false,
            maxLength: this.limits.longText
        });

        if (result.valid) {
            try {
                const parsed = JSON.parse(result.value);
                result.parsed = parsed;
            } catch (error) {
                result.valid = false;
                result.errors.push('Invalid JSON format');
            }
        }

        return result;
    }

    /**
   * Validate script content
   */
    validateScript(input) {
        const result = this.validateText(input, {
            minLength: 1,
            maxLength: this.limits.scriptContent,
            allowEmpty: false,
            allowNewlines: true
        });

        if (result.valid) {
            // Additional script-specific checks
            const scriptIssues = this.checkScriptSecurity(result.value);
            result.warnings.push(...scriptIssues);
        }

        return result;
    }

    /**
   * Validate number input
   */
    validateNumber(input, options = {}) {
        const {
            min = Number.MIN_SAFE_INTEGER,
            max = Number.MAX_SAFE_INTEGER,
            integer = false,
            positive = false
        } = options;

        const result = {
            valid: false,
            value: null,
            errors: []
        };

        let num;

        if (typeof input === 'number') {
            num = input;
        } else if (typeof input === 'string') {
            num = parseFloat(input);
        } else {
            result.errors.push('Input must be a number or numeric string');
            return result;
        }

        if (isNaN(num) || !isFinite(num)) {
            result.errors.push('Invalid number');
            return result;
        }

        if (integer && !Number.isInteger(num)) {
            result.errors.push('Number must be an integer');
        }

        if (positive && num <= 0) {
            result.errors.push('Number must be positive');
        }

        if (num < min) {
            result.errors.push(`Number must be at least ${min}`);
        }

        if (num > max) {
            result.errors.push(`Number must be at most ${max}`);
        }

        if (result.errors.length === 0) {
            result.valid = true;
            result.value = num;
        }

        return result;
    }

    /**
   * Validate array input
   */
    validateArray(input, options = {}) {
        const {
            minLength = 0,
            maxLength = 1000,
            itemValidator = null
        } = options;

        const result = {
            valid: false,
            value: null,
            errors: [],
            itemErrors: []
        };

        if (!Array.isArray(input)) {
            result.errors.push('Input must be an array');
            return result;
        }

        if (input.length < minLength) {
            result.errors.push(`Array must have at least ${minLength} items`);
        }

        if (input.length > maxLength) {
            result.errors.push(`Array must have at most ${maxLength} items`);
        }

        // Validate individual items
        if (itemValidator && typeof itemValidator === 'function') {
            const validatedItems = [];

            for (let i = 0; i < input.length; i++) {
                try {
                    const itemResult = itemValidator(input[i], i);
                    if (itemResult.valid) {
                        validatedItems.push(itemResult.value);
                    } else {
                        result.itemErrors.push({
                            index: i,
                            errors: itemResult.errors
                        });
                    }
                } catch (error) {
                    result.itemErrors.push({
                        index: i,
                        errors: [`Validation error: ${error.message}`]
                    });
                }
            }

            if (result.itemErrors.length === 0) {
                result.value = validatedItems;
            }
        } else {
            result.value = [...input]; // Shallow copy
        }

        if (result.errors.length === 0 && result.itemErrors.length === 0) {
            result.valid = true;
        }

        return result;
    }

    /**
   * Sanitize HTML content
   */
    sanitizeHtml(input) {
        if (typeof input !== 'string') {return '';}

        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
   * Strip HTML tags
   */
    stripHtml(input) {
        if (typeof input !== 'string') {return '';}

        return input.replace(/<[^>]*>/g, '');
    }

    /**
   * Check for security issues
   */
    checkSecurity(input) {
        const issues = [];

        this.dangerousPatterns.forEach(pattern => {
            if (pattern.test(input)) {
                issues.push('Potentially dangerous content detected');
            }
        });

        // Check for excessive special characters
        const specialCharCount = (input.match(/[<>{}[\]()]/g) || []).length;
        if (specialCharCount > input.length * 0.1) {
            issues.push('High concentration of special characters');
        }

        return issues;
    }

    /**
   * Check script-specific security issues
   */
    checkScriptSecurity(script) {
        const issues = [];

        // Check for potentially dangerous functions
        const dangerousFunctions = [
            'eval', 'Function', 'setTimeout', 'setInterval',
            'innerHTML', 'outerHTML', 'document.write'
        ];

        dangerousFunctions.forEach(func => {
            if (script.includes(func)) {
                issues.push(`Potentially dangerous function: ${func}`);
            }
        });

        // Check for external requests
        if (script.includes('fetch') || script.includes('XMLHttpRequest') || script.includes('import')) {
            issues.push('Script contains external requests');
        }

        return issues;
    }

    /**
   * Create validator for specific use case
   */
    createValidator(name, options) {
        const validators = {
            chatMessage: (input) => this.validateText(input, {
                minLength: 1,
                maxLength: this.limits.mediumText,
                allowEmpty: false,
                stripHtml: true
            }),

            scriptName: (input) => this.validateText(input, {
                minLength: 1,
                maxLength: 100,
                allowEmpty: false,
                pattern: /^[a-zA-Z0-9_\-\s]+$/
            }),

            settingsKey: (input) => this.validateText(input, {
                minLength: 1,
                maxLength: 50,
                allowEmpty: false,
                pattern: /^[a-zA-Z0-9_-]+$/
            }),

            modelName: (input) => this.validateText(input, {
                minLength: 1,
                maxLength: 100,
                allowEmpty: false,
                pattern: /^[a-zA-Z0-9._-]+$/
            })
        };

        return validators[name] || ((input) => this.validateText(input, options));
    }

    /**
   * Batch validate multiple inputs
   */
    validateBatch(inputs, validators) {
        const results = {};
        let allValid = true;

        for (const [key, input] of Object.entries(inputs)) {
            const validator = validators[key];
            if (validator) {
                results[key] = validator(input);
                if (!results[key].valid) {
                    allValid = false;
                }
            } else {
                results[key] = {
                    valid: false,
                    errors: ['No validator specified']
                };
                allValid = false;
            }
        }

        return {
            valid: allValid,
            results
        };
    }
}

// Create global instance
const globalValidator = new InputValidator();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputValidator;
}

// Make available globally
window.InputValidator = InputValidator;
window.globalValidator = globalValidator;
