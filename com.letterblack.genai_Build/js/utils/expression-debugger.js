/**
 * Expression Debugger and Validator
 * Provides syntax checking, error detection, and performance analysis for After Effects expressions
 */

class ExpressionDebugger {
    constructor() {
        this.commonErrors = {
            'SyntaxError': /SyntaxError|Expected|Unexpected|Invalid/i,
            'ReferenceError': /ReferenceError|is not defined/i,
            'TypeError': /TypeError|cannot read property/i,
            'RangeError': /RangeError|maximum call stack/i
        };

        this.expressionPatterns = {
            // Common expression patterns
            wiggle: /wiggle\s*\(/i,
            random: /random\s*\(/i,
            noise: /noise\s*\(/i,
            linear: /linear\s*\(/i,
            ease: /ease\s*\(/i,
            clamp: /clamp\s*\(/i,
            loop: /loop\s*\(/i,
            time: /\btime\b/i,
            value: /\bvalue\b/i,
            index: /\bindex\b/i
        };

        this.performanceWarnings = [
            'Avoid using eval() in expressions',
            'Minimize property access in loops',
            'Cache expensive calculations',
            'Use Math functions efficiently'
        ];
    }

    /**
     * Validate expression syntax and logic
     * @param {string} expression - The expression to validate
     * @param {string} propertyType - The property type (position, scale, opacity, etc.)
     * @returns {Object} Validation results
     */
    validateExpression(expression, propertyType = 'generic') {
        const results = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            performance: {
                score: 100,
                issues: []
            }
        };

        if (!expression || expression.trim() === '') {
            results.isValid = false;
            results.errors.push('Expression cannot be empty');
            return results;
        }

        // Basic syntax validation
        const syntaxResult = this.validateSyntax(expression);
        if (!syntaxResult.isValid) {
            results.isValid = false;
            results.errors = results.errors.concat(syntaxResult.errors);
        }

        // Property-specific validation
        const propertyResult = this.validatePropertySpecific(expression, propertyType);
        results.warnings = results.warnings.concat(propertyResult.warnings);
        results.suggestions = results.suggestions.concat(propertyResult.suggestions);

        // Performance analysis
        const performanceResult = this.analyzePerformance(expression);
        results.performance = performanceResult;

        // Logic validation
        const logicResult = this.validateLogic(expression);
        results.warnings = results.warnings.concat(logicResult.warnings);

        return results;
    }

    /**
     * Validate basic JavaScript syntax
     */
    validateSyntax(expression) {
        const results = {
            isValid: true,
            errors: []
        };

        try {
            // Basic syntax check using Function constructor
            new Function('time', 'value', 'index', expression);
        } catch (error) {
            results.isValid = false;

            // Parse error message
            const errorMessage = error.message;
            let friendlyMessage = 'Unknown syntax error';

            if (errorMessage.includes('Unexpected token')) {
                friendlyMessage = 'Unexpected character or symbol';
            } else if (errorMessage.includes('Expected')) {
                friendlyMessage = 'Missing expected character (check parentheses, brackets, or semicolons)';
            } else if (errorMessage.includes('is not defined')) {
                const undefinedVar = errorMessage.match(/'([^']+)' is not defined/)?.[1];
                if (undefinedVar) {
                    friendlyMessage = `Variable '${undefinedVar}' is not defined. Use 'time', 'value', or 'index'`;
                }
            }

            results.errors.push(friendlyMessage);
        }

        return results;
    }

    /**
     * Validate property-specific requirements
     */
    validatePropertySpecific(expression, propertyType) {
        const results = {
            warnings: [],
            suggestions: []
        };

        switch (propertyType.toLowerCase()) {
            case 'position':
            case 'anchor point':
            case 'scale':
                // These should return arrays for 2D/3D values
                if (!this.returnsArray(expression)) {
                    results.warnings.push(`${propertyType} expressions should return an array [x, y] or [x, y, z]`);
                }
                break;

            case 'rotation':
            case 'opacity':
                // These should return numbers
                if (this.returnsArray(expression)) {
                    results.warnings.push(`${propertyType} expressions should return a single number`);
                }
                break;

            case 'color':
                // Should return RGB array
                if (!this.returnsColorArray(expression)) {
                    results.suggestions.push('Color expressions should return [r, g, b] or [r, g, b, a] arrays');
                }
                break;
        }

        return results;
    }

    /**
     * Check if expression returns an array
     */
    returnsArray(expression) {
        // Simple heuristic - check for array literals or array-returning functions
        return /\[.*\]/.test(expression) ||
               /wiggle\s*\(/i.test(expression) ||
               /random\s*\(\s*\[/.test(expression) ||
               /linear\s*\(/i.test(expression);
    }

    /**
     * Check if expression returns a color array
     */
    returnsColorArray(expression) {
        // Look for RGB/RGBA patterns
        return /\[\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(,\s*[\d.]+\s*)?\]/.test(expression);
    }

    /**
     * Analyze performance characteristics
     */
    analyzePerformance(expression) {
        const results = {
            score: 100,
            issues: []
        };

        // Check for performance issues
        if (expression.includes('eval(')) {
            results.score -= 30;
            results.issues.push('Avoid using eval() - it\'s slow and insecure');
        }

        if (expression.match(/\bfor\b|\bwhile\b/)) {
            results.score -= 20;
            results.issues.push('Loops in expressions can cause performance issues');
        }

        // Check for excessive property access
        const propertyAccess = (expression.match(/\.|\[.*\]/g) || []).length;
        if (propertyAccess > 10) {
            results.score -= 15;
            results.issues.push('Too many property accesses - cache values when possible');
        }

        // Check for complex math operations
        const mathOps = (expression.match(/Math\./g) || []).length;
        if (mathOps > 5) {
            results.score -= 10;
            results.issues.push('Many Math operations - consider simplifying');
        }

        // Ensure score doesn't go below 0
        results.score = Math.max(0, results.score);

        return results;
    }

    /**
     * Validate expression logic
     */
    validateLogic(expression) {
        const results = {
            warnings: []
        };

        // Check for common logic issues
        if (expression.includes('/ 0') || expression.includes('/0')) {
            results.warnings.push('Potential division by zero');
        }

        if (expression.includes('time * 0') || expression.includes('0 * time')) {
            results.warnings.push('Multiplying by zero will always result in zero');
        }

        // Check for unused variables
        const lines = expression.split('\n');
        const varDeclarations = lines.filter(line => line.includes('var ') || line.includes('let ') || line.includes('const '));
        if (varDeclarations.length > 3) {
            results.warnings.push('Many variable declarations - consider simplifying');
        }

        return results;
    }

    /**
     * Debug expression with test values
     * @param {string} expression - Expression to debug
     * @param {Object} testValues - Test values for time, value, index
     */
    debugExpression(expression, testValues = {}) {
        const results = {
            success: false,
            result: null,
            error: null,
            testValues: {
                time: testValues.time || 1,
                value: testValues.value || 0,
                index: testValues.index || 1
            }
        };

        try {
            // Create a safe evaluation context
            const context = {
                time: results.testValues.time,
                value: results.testValues.value,
                index: results.testValues.index,
                Math: Math,
                // Add common AE functions
                wiggle: (freq, amp) => [Math.random() * amp, Math.random() * amp],
                random: (min, max) => min + Math.random() * (max - min),
                linear: (t, v1, v2) => v1 + (v2 - v1) * t,
                ease: (t, v1, v2) => v1 + (v2 - v1) * (t < 0.5 ? 2*t*t : -1+(4-2*t)*t)
            };

            // Evaluate the expression
            const func = new Function(...Object.keys(context), `return (${expression})`);
            results.result = func(...Object.values(context));
            results.success = true;

        } catch (error) {
            results.error = error.message;
            results.success = false;
        }

        return results;
    }

    /**
     * Get suggestions for improving the expression
     */
    getSuggestions(expression, propertyType) {
        const suggestions = [];

        // Pattern-based suggestions
        if (expression.includes('Math.random()') && !expression.includes('seedRandom')) {
            suggestions.push('Consider using seedRandom() for consistent random values');
        }

        if (expression.includes('time') && expression.includes('wiggle')) {
            suggestions.push('You can simplify by using wiggle() directly instead of combining with time');
        }

        if (expression.length > 200) {
            suggestions.push('Consider breaking long expressions into smaller, reusable parts');
        }

        if (!expression.includes('try') && !expression.includes('catch')) {
            suggestions.push('Consider adding error handling for robustness');
        }

        return suggestions;
    }

    /**
     * Format expression for better readability
     */
    formatExpression(expression) {
        try {
            // Basic formatting - add line breaks after semicolons and operators
            let formatted = expression
                .replace(/;/g, ';\n')
                .replace(/\n\s*\n/g, '\n') // Remove empty lines
                .replace(/([+\-*/=<>!&|]+)/g, ' $1 ') // Add spaces around operators
                .replace(/\s+/g, ' ') // Normalize spaces
                .trim();

            // Indent based on brackets
            let indent = 0;
            const lines = formatted.split('\n');
            formatted = lines.map(line => {
                const trimmed = line.trim();
                if (trimmed.includes('}')) indent = Math.max(0, indent - 1);
                const indented = '  '.repeat(indent) + trimmed;
                if (trimmed.includes('{')) indent++;
                return indented;
            }).join('\n');

            return formatted;
        } catch (error) {
            console.warn('⚠️ Could not format expression:', error);
            return expression;
        }
    }

    /**
     * Get expression templates for common use cases
     */
    getTemplates() {
        return {
            position: {
                wiggle: 'wiggle(2, 50);',
                bounce: 'let amp = 50;\nlet freq = 3;\nlet decay = 0.8;\namp * Math.sin(freq * time * 2 * Math.PI) * Math.pow(decay, time);',
                followMouse: '// Requires mouse tracking setup\n[value[0] + mouseX, value[1] + mouseY];'
            },
            scale: {
                pulse: 'let freq = 2;\nlet amp = 0.2;\nvalue * (1 + amp * Math.sin(freq * time * 2 * Math.PI));',
                breathe: 'let speed = 2;\nlet intensity = 0.1;\nvalue * (1 + intensity * Math.sin(speed * time));'
            },
            opacity: {
                fadeIn: 'linear(time, 0, 1, 0, 100);',
                blink: 'Math.sin(time * 10) > 0 ? 100 : 0;'
            },
            rotation: {
                spin: 'time * 360;',
                pendulum: 'let amp = 45;\namp * Math.sin(time * 2);'
            }
        };
    }
}

// Create global instance
window.ExpressionDebugger = ExpressionDebugger;
window.expressionDebugger = new ExpressionDebugger();
