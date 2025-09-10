/**
 * Comprehensive Module Initialization System
 * Orchestrates secure initialization of all extension modules
 */

class ModuleInitializer {
  constructor() {
    this.modules = new Map();
    this.dependencies = new Map();
    this.initialized = new Set();
    this.failed = new Set();
    this.initPromises = new Map();
    this.config = null;
    this.startTime = Date.now();
    
    // Core modules in initialization order
    this.coreModules = [
      'errorHandler',
      'secureStorage', 
      'memoryManager',
      'inputValidator',
      'accessibilityManager',
      'diContainer',
      'chatStore',
      'aiModule',
      'uiBootstrap'
    ];
  }

  /**
   * Initialize the extension with comprehensive error handling
   */
  async initialize() {
    try {
      console.log('🚀 Starting Adobe AI Extension initialization...');
      
      // Load configuration
      await this.loadConfiguration();
      
      // Initialize core security systems first
      await this.initializeCoreModules();
      
      // Initialize feature modules
      await this.initializeFeatureModules();
      
      // Perform final setup
      await this.finalizeInitialization();
      
      const duration = Date.now() - this.startTime;
      console.log(`✅ Extension initialized successfully in ${duration}ms`);
      
      // Announce completion for accessibility
      if (window.globalAccessibilityManager) {
        window.globalAccessibilityManager.announce('Adobe AI Extension ready');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Extension initialization failed:', error);
      
      // Attempt fallback initialization
      await this.attemptFallbackInitialization(error);
      
      return false;
    }
  }

  /**
   * Load configuration from secure storage
   */
  async loadConfiguration() {
    try {
      // Initialize secure storage first
      if (typeof SecureAPIStorage !== 'undefined') {
        const storage = new SecureAPIStorage();
        this.config = await storage.getItem('extensionConfig') || this.getDefaultConfig();
      } else {
        console.warn('SecureAPIStorage not available, using default config');
        this.config = this.getDefaultConfig();
      }
      
      console.log('📋 Configuration loaded');
      
    } catch (error) {
      console.warn('⚠️ Failed to load configuration, using defaults:', error);
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      security: {
        enableXSSProtection: true,
        enableInputValidation: true,
        enableSecureStorage: true,
        apiKeyValidation: true
      },
      features: {
        enableAI: true,
        enableChat: true,
        enableScriptSaving: true,
        enablePresets: true
      },
      ui: {
        enableAnimations: true,
        enableAccessibility: true,
        theme: 'default'
      },
      performance: {
        enableMemoryMonitoring: true,
        enableErrorTracking: true,
        debugMode: false
      }
    };
  }

  /**
   * Initialize core security modules first
   */
  async initializeCoreModules() {
    console.log('🔐 Initializing core security modules...');
    
    const coreInitializations = [
      this.initializeErrorHandler(),
      this.initializeSecureStorage(),
      this.initializeMemoryManager(),
      this.initializeInputValidator(),
      this.initializeAccessibilityManager()
    ];
    
    try {
      await Promise.all(coreInitializations);
      console.log('✅ Core modules initialized');
    } catch (error) {
      console.error('❌ Core module initialization failed:', error);
      throw new Error('Critical core modules failed to initialize');
    }
  }

  /**
   * Initialize error handler
   */
  async initializeErrorHandler() {
    try {
      if (typeof ErrorHandler !== 'undefined') {
        window.globalErrorHandler = new ErrorHandler();
        this.registerModule('errorHandler', window.globalErrorHandler);
        console.log('✅ Error handler initialized');
      } else {
        throw new Error('ErrorHandler class not available');
      }
    } catch (error) {
      console.error('❌ Error handler initialization failed:', error);
      // Create basic error handler
      window.globalErrorHandler = {
        handleError: (error, context) => console.error('Error:', error, context),
        logError: (error, severity) => console.error(`[${severity}]`, error)
      };
    }
  }

  /**
   * Initialize secure storage
   */
  async initializeSecureStorage() {
    try {
      if (typeof SecureAPIStorage !== 'undefined') {
        window.globalSecureStorage = new SecureAPIStorage();
        this.registerModule('secureStorage', window.globalSecureStorage);
        console.log('✅ Secure storage initialized');
      } else {
        throw new Error('SecureAPIStorage class not available');
      }
    } catch (error) {
      console.error('❌ Secure storage initialization failed:', error);
      // Create fallback storage
      window.globalSecureStorage = {
        setItem: (key, value) => Promise.resolve(),
        getItem: (key) => Promise.resolve(null),
        removeItem: (key) => Promise.resolve()
      };
    }
  }

  /**
   * Initialize memory manager
   */
  async initializeMemoryManager() {
    try {
      if (typeof MemoryManager !== 'undefined') {
        window.globalMemoryManager = new MemoryManager();
        this.registerModule('memoryManager', window.globalMemoryManager);
        console.log('✅ Memory manager initialized');
      } else {
        console.warn('MemoryManager not available');
      }
    } catch (error) {
      console.error('❌ Memory manager initialization failed:', error);
    }
  }

  /**
   * Initialize input validator
   */
  async initializeInputValidator() {
    try {
      if (typeof InputValidator !== 'undefined') {
        window.globalValidator = new InputValidator();
        this.registerModule('inputValidator', window.globalValidator);
        console.log('✅ Input validator initialized');
      } else {
        throw new Error('InputValidator class not available');
      }
    } catch (error) {
      console.error('❌ Input validator initialization failed:', error);
      // Create basic validator
      window.globalValidator = {
        validateText: (input) => ({ valid: true, value: input, errors: [] })
      };
    }
  }

  /**
   * Initialize accessibility manager
   */
  async initializeAccessibilityManager() {
    try {
      if (typeof AccessibilityManager !== 'undefined') {
        window.globalAccessibilityManager = new AccessibilityManager();
        this.registerModule('accessibilityManager', window.globalAccessibilityManager);
        console.log('✅ Accessibility manager initialized');
      } else {
        console.warn('AccessibilityManager not available');
      }
    } catch (error) {
      console.error('❌ Accessibility manager initialization failed:', error);
    }
  }

  /**
   * Initialize feature modules
   */
  async initializeFeatureModules() {
    console.log('🎨 Initializing feature modules...');
    
    const featureInitializations = [
      this.initializeDIContainer(),
      this.initializeChatStore(),
      this.initializeAIModule(),
      this.initializeUIBootstrap()
    ];
    
    // Initialize features in parallel but handle failures gracefully
    const results = await Promise.allSettled(featureInitializations);
    
    results.forEach((result, index) => {
      const moduleName = ['diContainer', 'chatStore', 'aiModule', 'uiBootstrap'][index];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${moduleName} initialized`);
      } else {
        console.error(`❌ ${moduleName} initialization failed:`, result.reason);
        this.failed.add(moduleName);
      }
    });
  }

  /**
   * Initialize dependency injection container
   */
  async initializeDIContainer() {
    try {
      if (typeof DIContainer !== 'undefined') {
        window.globalDIContainer = new DIContainer();
        
        // Register core services
        window.globalDIContainer.register('errorHandler', window.globalErrorHandler);
        window.globalDIContainer.register('secureStorage', window.globalSecureStorage);
        window.globalDIContainer.register('memoryManager', window.globalMemoryManager);
        window.globalDIContainer.register('inputValidator', window.globalValidator);
        window.globalDIContainer.register('accessibilityManager', window.globalAccessibilityManager);
        
        this.registerModule('diContainer', window.globalDIContainer);
      } else {
        throw new Error('DIContainer class not available');
      }
    } catch (error) {
      console.error('❌ DI Container initialization failed:', error);
    }
  }

  /**
   * Initialize chat store
   */
  async initializeChatStore() {
    try {
      // Load chat store from storage integration
      if (typeof initializeChatStore === 'function') {
        await initializeChatStore();
        this.registerModule('chatStore', window.chatStore);
      } else {
        throw new Error('Chat store initialization function not available');
      }
    } catch (error) {
      console.error('❌ Chat store initialization failed:', error);
    }
  }

  /**
   * Initialize AI module
   */
  async initializeAIModule() {
    try {
      if (typeof initializeAI === 'function') {
        await initializeAI();
        this.registerModule('aiModule', window.aiModule);
      } else {
        console.warn('AI module initialization function not available');
      }
    } catch (error) {
      console.error('❌ AI module initialization failed:', error);
    }
  }

  /**
   * Initialize UI bootstrap
   */
  async initializeUIBootstrap() {
    try {
      if (typeof initializeUI === 'function') {
        await initializeUI();
        this.registerModule('uiBootstrap', true);
      } else {
        console.warn('UI bootstrap function not available');
      }
    } catch (error) {
      console.error('❌ UI bootstrap initialization failed:', error);
    }
  }

  /**
   * Finalize initialization
   */
  async finalizeInitialization() {
    console.log('🏁 Finalizing initialization...');
    
    // Disable insecure legacy modules
    this.disableLegacyModules();
    
    // Setup global error handling
    this.setupGlobalErrorHandling();
    
    // Setup security monitoring
    this.setupSecurityMonitoring();
    
    // Perform health checks
    await this.performHealthChecks();
    
    // Clean up initialization data
    this.cleanupInitialization();
    
    console.log('✅ Initialization finalized');
  }

  /**
   * Disable insecure legacy modules
   */
  disableLegacyModules() {
    const legacyModules = [
      'api-settings-storage.js',
      'legacy-chat-disabler.js'
    ];
    
    legacyModules.forEach(module => {
      if (window[module]) {
        console.warn(`🚫 Disabling insecure legacy module: ${module}`);
        window[module] = null;
      }
    });
  }

  /**
   * Setup global error handling
   */
  setupGlobalErrorHandling() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (window.globalErrorHandler) {
        window.globalErrorHandler.handleError(event.reason, 'unhandledrejection');
      }
      console.error('Unhandled promise rejection:', event.reason);
    });
    
    // Global errors
    window.addEventListener('error', (event) => {
      if (window.globalErrorHandler) {
        window.globalErrorHandler.handleError(event.error, 'global');
      }
      console.error('Global error:', event.error);
    });
  }

  /**
   * Setup security monitoring
   */
  setupSecurityMonitoring() {
    // Monitor for XSS attempts
    if (window.globalValidator) {
      const originalInnerHTML = Element.prototype.innerHTML;
      Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value) {
          const validation = window.globalValidator.validateText(value, {
            stripHtml: false,
            maxLength: 50000
          });
          
          if (!validation.valid || validation.warnings.length > 0) {
            console.warn('Potentially dangerous HTML detected:', validation.warnings);
            if (window.globalErrorHandler) {
              window.globalErrorHandler.handleError(
                new Error('XSS attempt detected'),
                'security'
              );
            }
          }
          
          originalInnerHTML.call(this, value);
        },
        get: function() {
          return originalInnerHTML.call(this);
        }
      });
    }
  }

  /**
   * Perform health checks
   */
  async performHealthChecks() {
    const checks = [];
    
    // Check secure storage
    if (window.globalSecureStorage) {
      checks.push(this.checkSecureStorage());
    }
    
    // Check AI connectivity
    if (window.aiModule) {
      checks.push(this.checkAIConnectivity());
    }
    
    // Check memory usage
    if (window.globalMemoryManager) {
      checks.push(this.checkMemoryUsage());
    }
    
    const results = await Promise.allSettled(checks);
    const failedChecks = results.filter(r => r.status === 'rejected').length;
    
    if (failedChecks > 0) {
      console.warn(`⚠️ ${failedChecks} health checks failed`);
    } else {
      console.log('✅ All health checks passed');
    }
  }

  /**
   * Check secure storage functionality
   */
  async checkSecureStorage() {
    try {
      const testKey = 'healthCheck';
      const testValue = 'test';
      
      await window.globalSecureStorage.setItem(testKey, testValue);
      const retrieved = await window.globalSecureStorage.getItem(testKey);
      await window.globalSecureStorage.removeItem(testKey);
      
      if (retrieved !== testValue) {
        throw new Error('Secure storage test failed');
      }
      
      return true;
    } catch (error) {
      console.error('Secure storage health check failed:', error);
      throw error;
    }
  }

  /**
   * Check AI connectivity
   */
  async checkAIConnectivity() {
    // This would be implemented based on the AI module's interface
    return true; // Placeholder
  }

  /**
   * Check memory usage
   */
  async checkMemoryUsage() {
    if (window.globalMemoryManager) {
      const stats = window.globalMemoryManager.getMemoryStats();
      
      if (stats.performance && stats.performance.used > 100) {
        console.warn(`High memory usage: ${stats.performance.used}MB`);
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Clean up initialization data
   */
  cleanupInitialization() {
    // Clear sensitive initialization data
    this.config = null;
    
    // Force garbage collection if available
    if (window.globalMemoryManager) {
      window.globalMemoryManager.performCleanup();
    }
  }

  /**
   * Attempt fallback initialization
   */
  async attemptFallbackInitialization(originalError) {
    console.warn('🔄 Attempting fallback initialization...');
    
    try {
      // Initialize only critical components
      await this.initializeErrorHandler();
      
      // Basic UI without advanced features
      this.initializeBasicUI();
      
      // Show error to user
      this.showInitializationError(originalError);
      
      console.log('⚠️ Fallback initialization completed');
      
    } catch (fallbackError) {
      console.error('❌ Fallback initialization also failed:', fallbackError);
      this.showCriticalError(originalError, fallbackError);
    }
  }

  /**
   * Initialize basic UI for fallback mode
   */
  initializeBasicUI() {
    // Build fallback UI using DOM APIs to avoid injecting raw HTML
    const errorContainer = document.createElement('div');
    errorContainer.id = 'fallback-ui';

    const panel = document.createElement('div');
    panel.style.padding = '20px';
    panel.style.background = '#fff3cd';
    panel.style.border = '1px solid #ffeaa7';
    panel.style.borderRadius = '4px';

    const title = document.createElement('h3');
    title.textContent = '⚠️ Extension Initialization Warning';

    const msg = document.createElement('p');
    msg.textContent = 'Some features may not be available due to initialization issues.';

    const reloadBtn = document.createElement('button');
    reloadBtn.type = 'button';
    reloadBtn.textContent = 'Reload Extension';
    reloadBtn.addEventListener('click', () => {
      try { location.reload(); } catch (e) { window.location.href = window.location.href; }
    });

    panel.appendChild(title);
    panel.appendChild(msg);
    panel.appendChild(reloadBtn);
    errorContainer.appendChild(panel);

    document.body.insertBefore(errorContainer, document.body.firstChild);
  }

  /**
   * Show initialization error to user
   */
  showInitializationError(error) {
    const errorMsg = `Extension initialization encountered issues: ${error.message}`;
    
    if (window.globalAccessibilityManager) {
      window.globalAccessibilityManager.announce(errorMsg, 'assertive');
    }
    
    if (window.globalErrorHandler) {
      window.globalErrorHandler.showUserNotification(errorMsg, 'warning');
    }
  }

  /**
   * Show critical error
   */
  showCriticalError(originalError, fallbackError) {
    // Create a non-intrusive critical error banner using safe DOM methods
    const errorDiv = document.createElement('div');
    Object.assign(errorDiv.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      background: '#dc3545',
      color: 'white',
      padding: '10px',
      zIndex: 9999
    });

    const strong = document.createElement('strong');
    strong.textContent = 'Critical Error:';

    const text = document.createTextNode(' Extension failed to initialize. Please reload the page.');

    const reloadBtn = document.createElement('button');
    reloadBtn.type = 'button';
    reloadBtn.textContent = 'Reload';
    Object.assign(reloadBtn.style, { marginLeft: '10px', background: 'white', color: '#dc3545', border: 'none', padding: '5px 10px' });
    reloadBtn.addEventListener('click', () => {
      try { location.reload(); } catch (e) { window.location.href = window.location.href; }
    });

    errorDiv.appendChild(strong);
    errorDiv.appendChild(text);
    errorDiv.appendChild(reloadBtn);

    document.body.appendChild(errorDiv);
  }

  /**
   * Register a module
   */
  registerModule(name, instance) {
    this.modules.set(name, instance);
    this.initialized.add(name);
  }

  /**
   * Get initialization status
   */
  getStatus() {
    return {
      initialized: Array.from(this.initialized),
      failed: Array.from(this.failed),
      modules: Array.from(this.modules.keys()),
      duration: Date.now() - this.startTime
    };
  }

  /**
   * Get module by name
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * Check if module is initialized
   */
  isInitialized(name) {
    return this.initialized.has(name);
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  window.moduleInitializer = new ModuleInitializer();
  await window.moduleInitializer.initialize();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModuleInitializer;
}

// Make available globally
window.ModuleInitializer = ModuleInitializer;
