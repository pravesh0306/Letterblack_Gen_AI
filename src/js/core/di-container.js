/**
 * Dependency Injection Container
 * Solves race conditions, circular dependencies, and provides proper module initialization
 */

class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
    this.initializing = new Set();
    this.initialized = new Set();
    this.dependencies = new Map();
    this.eventEmitter = new EventTarget();
  }

  /**
   * Register a service with its dependencies
   */
  register(name, factory, options = {}) {
    if (this.services.has(name)) {
      throw new Error(`Service ${name} is already registered`);
    }

    const serviceConfig = {
      factory,
      singleton: options.singleton !== false, // Default to singleton
      dependencies: options.dependencies || [],
      initialized: false,
      eager: options.eager || false
    };

    this.services.set(name, serviceConfig);
    this.dependencies.set(name, serviceConfig.dependencies);

    // Validate no circular dependencies
    this.validateDependencies(name);

    // If eager loading, initialize immediately
    if (serviceConfig.eager) {
      setTimeout(() => this.get(name), 0);
    }

    this.emit('serviceRegistered', { name, config: serviceConfig });
  }

  /**
   * Get a service instance
   */
  async get(name) {
    // Check if singleton already exists
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Check if service is registered
    if (!this.services.has(name)) {
      throw new Error(`Service ${name} is not registered`);
    }

    // Prevent circular initialization
    if (this.initializing.has(name)) {
      throw new Error(`Circular dependency detected for service ${name}`);
    }

    return this.initializeService(name);
  }

  /**
   * Initialize a service with dependency resolution
   */
  async initializeService(name) {
    const config = this.services.get(name);
    
    if (!config) {
      throw new Error(`Service ${name} not found`);
    }

    // Mark as initializing
    this.initializing.add(name);

    try {
      // Resolve dependencies first
      const resolvedDependencies = {};
      
      for (const depName of config.dependencies) {
        resolvedDependencies[depName] = await this.get(depName);
      }

      // Create service instance
      let instance;
      
      if (typeof config.factory === 'function') {
        instance = await config.factory(resolvedDependencies, this);
      } else if (typeof config.factory === 'object') {
        instance = config.factory;
      } else {
        throw new Error(`Invalid factory for service ${name}`);
      }

      // Store singleton if required
      if (config.singleton) {
        this.singletons.set(name, instance);
      }

      // Mark as initialized
      this.initialized.add(name);
      this.initializing.delete(name);
      config.initialized = true;

      this.emit('serviceInitialized', { name, instance });

      return instance;

    } catch (error) {
      this.initializing.delete(name);
      this.emit('serviceInitializationFailed', { name, error });
      throw new Error(`Failed to initialize service ${name}: ${error.message}`);
    }
  }

  /**
   * Validate dependencies for circular references
   */
  validateDependencies(serviceName, visited = new Set(), path = []) {
    if (visited.has(serviceName)) {
      const cycle = path.slice(path.indexOf(serviceName));
      throw new Error(`Circular dependency detected: ${cycle.join(' -> ')}`);
    }

    const deps = this.dependencies.get(serviceName) || [];
    visited.add(serviceName);
    path.push(serviceName);

    for (const dep of deps) {
      if (this.dependencies.has(dep)) {
        this.validateDependencies(dep, new Set(visited), [...path]);
      }
    }
  }

  /**
   * Check if service is registered
   */
  isRegistered(name) {
    return this.services.has(name);
  }

  /**
   * Check if service is initialized
   */
  isInitialized(name) {
    return this.initialized.has(name);
  }

  /**
   * Get all registered service names
   */
  getServiceNames() {
    return Array.from(this.services.keys());
  }

  /**
   * Get initialization status
   */
  getStatus() {
    const services = this.getServiceNames();
    return {
      total: services.length,
      initialized: services.filter(name => this.isInitialized(name)).length,
      initializing: Array.from(this.initializing),
      pending: services.filter(name => !this.isInitialized(name) && !this.initializing.has(name))
    };
  }

  /**
   * Wait for service to be initialized
   */
  async waitFor(name, timeout = 10000) {
    if (this.isInitialized(name)) {
      return this.get(name);
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.eventEmitter.removeEventListener('serviceInitialized', handler);
        reject(new Error(`Timeout waiting for service ${name}`));
      }, timeout);

      const handler = (event) => {
        if (event.detail.name === name) {
          clearTimeout(timeoutId);
          this.eventEmitter.removeEventListener('serviceInitialized', handler);
          resolve(event.detail.instance);
        }
      };

      this.eventEmitter.addEventListener('serviceInitialized', handler);
    });
  }

  /**
   * Initialize all registered services
   */
  async initializeAll() {
    const services = this.getServiceNames();
    const results = await Promise.allSettled(
      services.map(name => this.get(name))
    );

    const failed = results
      .map((result, index) => ({ result, name: services[index] }))
      .filter(({ result }) => result.status === 'rejected');

    if (failed.length > 0) {
      console.warn('Some services failed to initialize:', failed);
    }

    return {
      total: services.length,
      succeeded: results.filter(r => r.status === 'fulfilled').length,
      failed: failed.map(f => ({ name: f.name, error: f.result.reason }))
    };
  }

  /**
   * Emit event
   */
  emit(eventName, detail) {
    this.eventEmitter.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  /**
   * Add event listener
   */
  on(eventName, handler) {
    this.eventEmitter.addEventListener(eventName, handler);
  }

  /**
   * Remove event listener
   */
  off(eventName, handler) {
    this.eventEmitter.removeEventListener(eventName, handler);
  }

  /**
   * Clear all services
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
    this.initializing.clear();
    this.initialized.clear();
    this.dependencies.clear();
  }

  /**
   * Create a child container with inherited services
   */
  createChild() {
    const child = new DIContainer();
    
    // Copy service registrations (but not instances)
    for (const [name, config] of this.services) {
      child.register(name, config.factory, {
        singleton: config.singleton,
        dependencies: config.dependencies,
        eager: false // Don't auto-initialize in child
      });
    }
    
    return child;
  }
}

// Create global container
const globalContainer = new DIContainer();

// Register core services
globalContainer.register('errorHandler', () => {
  return window.globalErrorHandler || new ErrorHandler();
}, { singleton: true, eager: true });

globalContainer.register('secureStorage', async (deps, container) => {
  try {
    if (typeof require !== 'undefined') {
      const SecureAPIStorage = require('../storage/secureAPIStorage');
      const instance = new SecureAPIStorage();
      await instance.ensureDirs();
      return instance;
    }
  } catch (error) {
    deps.errorHandler.handle(error, { context: 'secureStorage initialization' });
  }
  return null;
}, { 
  dependencies: ['errorHandler'],
  singleton: true 
});

globalContainer.register('chatStore', (deps) => {
  try {
    if (typeof require !== 'undefined') {
      return require('../storage/chatStore');
    }
    if (typeof window !== 'undefined' && window.chatStore) {
      return window.chatStore;
    }
    throw new Error('chatStore not available');
  } catch (error) {
    deps.errorHandler.handle(error, { context: 'chatStore initialization' });
    return null;
  }
}, { 
  dependencies: ['errorHandler'],
  singleton: true 
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DIContainer;
}

// Make available globally
window.DIContainer = DIContainer;
window.globalContainer = globalContainer;
