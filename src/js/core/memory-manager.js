/**
 * Memory Leak Prevention System
 * Monitors and prevents common memory leaks in the extension
 */

class MemoryManager {
  constructor() {
    this.eventListeners = new Map();
    this.timers = new Set();
    this.observers = new Set();
    this.abortControllers = new Set();
    this.memoryThreshold = 100 * 1024 * 1024; // 100MB
    this.cleanupInterval = 5 * 60 * 1000; // 5 minutes
    this.isCleanupRunning = false;
    
    this.startMonitoring();
  }

  /**
   * Start memory monitoring
   */
  startMonitoring() {
    // Periodic cleanup
    const cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);
    
    this.trackTimer(cleanupTimer);

    // Monitor performance if available
    if (window.performance && window.performance.memory) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 30000); // Check every 30 seconds
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  /**
   * Track event listeners to prevent leaks
   */
  trackEventListener(element, event, handler, options = {}) {
    const key = `${element.constructor.name}_${event}_${Date.now()}`;
    
    this.eventListeners.set(key, {
      element,
      event,
      handler,
      options,
      timestamp: Date.now()
    });

    element.addEventListener(event, handler, options);
    
    return key;
  }

  /**
   * Remove tracked event listener
   */
  removeEventListener(key) {
    const listener = this.eventListeners.get(key);
    if (listener) {
      listener.element.removeEventListener(listener.event, listener.handler, listener.options);
      this.eventListeners.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Track timers to prevent leaks
   */
  trackTimer(timerId) {
    this.timers.add(timerId);
    return timerId;
  }

  /**
   * Clear tracked timer
   */
  clearTimer(timerId) {
    clearTimeout(timerId);
    clearInterval(timerId);
    this.timers.delete(timerId);
  }

  /**
   * Track observers to prevent leaks
   */
  trackObserver(observer) {
    this.observers.add(observer);
    return observer;
  }

  /**
   * Disconnect tracked observer
   */
  disconnectObserver(observer) {
    if (observer && typeof observer.disconnect === 'function') {
      observer.disconnect();
      this.observers.delete(observer);
      return true;
    }
    return false;
  }

  /**
   * Track abort controllers
   */
  trackAbortController(controller) {
    this.abortControllers.add(controller);
    return controller;
  }

  /**
   * Abort tracked controller
   */
  abortController(controller) {
    if (controller && typeof controller.abort === 'function') {
      controller.abort();
      this.abortControllers.delete(controller);
      return true;
    }
    return false;
  }

  /**
   * Create managed promise with cleanup
   */
  createManagedPromise(executor, timeout = 30000) {
    const controller = new AbortController();
    this.trackAbortController(controller);

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
    
    this.trackTimer(timeoutId);

    return new Promise((resolve, reject) => {
      const signal = controller.signal;
      
      signal.addEventListener('abort', () => {
        reject(new Error('Promise aborted'));
        this.clearTimer(timeoutId);
      });

      try {
        executor(resolve, reject, signal);
      } catch (error) {
        reject(error);
        this.clearTimer(timeoutId);
        this.abortController(controller);
      }
    }).finally(() => {
      this.clearTimer(timeoutId);
      this.abortController(controller);
    });
  }

  /**
   * Create managed fetch request
   */
  managedFetch(url, options = {}) {
    const controller = new AbortController();
    this.trackAbortController(controller);

    const enhancedOptions = {
      ...options,
      signal: controller.signal
    };

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeout || 30000);
    
    this.trackTimer(timeoutId);

    return fetch(url, enhancedOptions)
      .finally(() => {
        this.clearTimer(timeoutId);
        this.abortController(controller);
      });
  }

  /**
   * Check memory usage
   */
  checkMemoryUsage() {
    if (!window.performance || !window.performance.memory) {
      return;
    }

    const memory = window.performance.memory;
    const usedBytes = memory.usedJSHeapSize;
    const totalBytes = memory.totalJSHeapSize;
    const limitBytes = memory.jsHeapSizeLimit;

    console.log(`Memory Usage: ${(usedBytes / 1024 / 1024).toFixed(2)}MB / ${(limitBytes / 1024 / 1024).toFixed(2)}MB`);

    // Warn if memory usage is high
    if (usedBytes > this.memoryThreshold) {
      console.warn('High memory usage detected, performing cleanup');
      this.performCleanup();
    }

    // Critical memory warning
    if (usedBytes > limitBytes * 0.9) {
      console.error('Critical memory usage, forcing garbage collection');
      this.forceGarbageCollection();
    }
  }

  /**
   * Perform cleanup of tracked resources
   */
  performCleanup() {
    if (this.isCleanupRunning) {
      return;
    }

    this.isCleanupRunning = true;
    
    try {
      let cleaned = 0;

      // Clean up old event listeners
      const now = Date.now();
      for (const [key, listener] of this.eventListeners.entries()) {
        // Remove listeners older than 30 minutes
        if (now - listener.timestamp > 30 * 60 * 1000) {
          this.removeEventListener(key);
          cleaned++;
        }
      }

      // Clean up disconnected observers
      for (const observer of this.observers) {
        if (!observer || typeof observer.disconnect !== 'function') {
          this.observers.delete(observer);
          cleaned++;
        }
      }

      // Clean up aborted controllers
      for (const controller of this.abortControllers) {
        if (!controller || controller.signal.aborted) {
          this.abortControllers.delete(controller);
          cleaned++;
        }
      }

      // Clear any dangling DOM references
      this.cleanupDOMReferences();

      if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} memory references`);
      }

    } catch (error) {
      console.error('Error during memory cleanup:', error);
    } finally {
      this.isCleanupRunning = false;
    }
  }

  /**
   * Clean up DOM references
   */
  cleanupDOMReferences() {
    // Remove detached nodes from the DOM
    const detachedNodes = document.querySelectorAll('*');
    let removed = 0;

    detachedNodes.forEach(node => {
      if (!document.contains(node) && node.parentNode) {
        try {
          node.parentNode.removeChild(node);
          removed++;
        } catch (error) {
          // Ignore errors for nodes that can't be removed
        }
      }
    });

    if (removed > 0) {
      console.log(`Removed ${removed} detached DOM nodes`);
    }
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection() {
    if (window.gc) {
      window.gc();
      console.log('Forced garbage collection');
    } else {
      // Trigger garbage collection by creating and releasing memory
      const arrays = [];
      for (let i = 0; i < 100; i++) {
        arrays.push(new Array(1000).fill(Math.random()));
      }
      arrays.length = 0;
    }
  }

  /**
   * Create memory-safe event handler
   */
  createSafeEventHandler(handler) {
    return function safeHandler(...args) {
      try {
        return handler.apply(this, args);
      } catch (error) {
        console.error('Event handler error:', error);
        return null;
      }
    };
  }

  /**
   * Create weak reference manager
   */
  createWeakReferenceManager() {
    const weakRefs = new Set();
    
    return {
      add: (obj) => {
        const weakRef = new WeakRef(obj);
        weakRefs.add(weakRef);
        return weakRef;
      },
      
      cleanup: () => {
        for (const ref of weakRefs) {
          if (!ref.deref()) {
            weakRefs.delete(ref);
          }
        }
      },
      
      size: () => weakRefs.size
    };
  }

  /**
   * Monitor for memory leaks in specific objects
   */
  monitorObject(obj, name) {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    const monitor = {
      name,
      created: Date.now(),
      properties: Object.keys(obj).length,
      weakRef: new WeakRef(obj)
    };

    // Check if object is still alive after some time
    setTimeout(() => {
      if (!monitor.weakRef.deref()) {
        console.log(`Object ${name} was properly garbage collected`);
      } else {
        console.warn(`Object ${name} may have memory leak - still alive after timeout`);
      }
    }, 10000); // Check after 10 seconds

    return monitor;
  }

  /**
   * Complete cleanup of all tracked resources
   */
  cleanup() {
    console.log('Performing complete memory cleanup...');

    // Clear all timers
    for (const timerId of this.timers) {
      this.clearTimer(timerId);
    }
    this.timers.clear();

    // Remove all event listeners
    for (const key of this.eventListeners.keys()) {
      this.removeEventListener(key);
    }

    // Disconnect all observers
    for (const observer of this.observers) {
      this.disconnectObserver(observer);
    }

    // Abort all controllers
    for (const controller of this.abortControllers) {
      this.abortController(controller);
    }

    // Clean up DOM references
    this.cleanupDOMReferences();

    console.log('Memory cleanup completed');
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    const stats = {
      eventListeners: this.eventListeners.size,
      timers: this.timers.size,
      observers: this.observers.size,
      abortControllers: this.abortControllers.size,
      performance: null
    };

    if (window.performance && window.performance.memory) {
      stats.performance = {
        used: Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }

    return stats;
  }
}

// Create global memory manager
const globalMemoryManager = new MemoryManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemoryManager;
}

// Make available globally
window.MemoryManager = MemoryManager;
window.globalMemoryManager = globalMemoryManager;
