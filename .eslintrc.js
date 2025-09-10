module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    rules: {
        // Production Quality Rules
        'no-console': 'warn',
        'no-unused-vars': 'error',
        'no-undef': 'error',
        'no-duplicate-imports': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        
        // Code Quality
        'eqeqeq': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',
        
        // Best Practices
        'curly': 'error',
        'dot-notation': 'error',
        'no-alert': 'warn',
        'no-caller': 'error',
        'no-floating-decimal': 'error',
        'no-multi-spaces': 'error',
        'no-new': 'error',
        'no-new-wrappers': 'error',
        'no-throw-literal': 'error',
        'no-with': 'error',
        'prefer-promise-reject-errors': 'error',
        'radix': 'error',
        'wrap-iife': 'error',
        'yoda': 'error',
        
        // Style
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always']
    },
    globals: {
        // CEP Globals
        'CSInterface': 'readonly',
        'SystemPath': 'readonly',
        'CSEvent': 'readonly',
        'window': 'readonly',
        'document': 'readonly',
        
        // Extension Globals
        'app': 'readonly'
    }
};
