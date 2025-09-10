// eslint.config.js - CommonJS format for Adobe AE Extension
module.exports = [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script', // CEP extensions use script mode
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        
        // Timers and events
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        
        // Web APIs
        fetch: 'readonly',
        XMLHttpRequest: 'readonly',
        WebSocket: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        AbortController: 'readonly',
        
        // DOM APIs
        Event: 'readonly',
        CustomEvent: 'readonly',
        EventTarget: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        HTMLElement: 'readonly',
        HTMLScriptElement: 'readonly',
        Image: 'readonly',
        Audio: 'readonly',
        Node: 'readonly',
        
        // Browser objects
        performance: 'readonly',
        Prism: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        
        // Dialog methods
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        
        // CEP and Adobe specific
        CSInterface: 'readonly',
        CSEvent: 'readonly',
        themeManager: 'readonly',
        SystemPath: 'readonly',
        
        // Node.js style (for CEP hybrid environment)
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        Buffer: 'readonly',
        process: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        
        // Modern JS
        Promise: 'readonly',
        Set: 'readonly',
        Map: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Symbol: 'readonly',
        Proxy: 'readonly',
        Reflect: 'readonly',
        
        // Cache API
        caches: 'readonly',
        
        // jQuery (if used)
        $: 'readonly',
        jQuery: 'readonly',
        
        // Extension specific
        MascotAnimator: 'readonly',
        ErrorHandler: 'readonly',
        updateTooltip: 'readonly'
      }
    },
    rules: {
      // Production quality rules - relaxed for CEP environment
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn', // CEP extensions sometimes use dialogs
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      // Code quality - relaxed for legacy code
      'no-unused-vars': ['warn', { 
        'varsIgnorePattern': '^_|^unused|^ignore',
        'argsIgnorePattern': '^_|^unused|^ignore|^e$|^error$|^err$'
      }],
      'no-undef': 'error',
      'no-redeclare': 'warn', // Allow redeclare for global overrides
      'no-shadow': 'warn',
      'no-use-before-define': 'warn', // Common in module patterns
      
      // Best practices - relaxed
      'eqeqeq': ['warn', 'always'],
      'curly': ['warn', 'all'],
      'dot-notation': 'warn',
      'no-multi-spaces': 'warn',
      'no-trailing-spaces': 'warn',
      'no-multiple-empty-lines': ['warn', { 'max': 3 }],
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { 'allowTemplateLiterals': true }],
      'indent': ['warn', 4],
      'no-tabs': 'warn',
      
      // Modern practices - relaxed for legacy compatibility
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'off', // Legacy code uses function expressions
      'prefer-template': 'off',
      'object-shorthand': 'off',
      'no-var': 'warn',
      
      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error'
    }
  },
  {
    files: ['src/**/*.test.js', 'src/**/*.spec.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off'
    }
  }
];
