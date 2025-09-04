# Quick Reference: Adobe CEP Security-First Development
**Your Personal Cheat Sheet - Keep This Handy!**

## 🚨 **NEVER DO** (Your Past Mistakes)

```javascript
// 🚫 NEVER store sensitive data in localStorage
localStorage.setItem('api_key', key);           // SECURITY VIOLATION!

// 🚫 NEVER trust user input
element.innerHTML = userInput;                  // XSS VULNERABILITY!

// 🚫 NEVER ignore errors
riskyFunction();                                // NO ERROR HANDLING!

// 🚫 NEVER mix storage systems
localStorage.setItem('setting1', value);       // INCONSISTENT!
secureStorage.setItem('setting2', value);

// 🚫 NEVER forget resource cleanup
element.addEventListener('click', handler);     // MEMORY LEAK!
```

## ✅ **ALWAYS DO** (Your New Patterns)

```javascript
// ✅ ALWAYS use secure storage
await globalSecureStorage.setItem('api_key', key);

// ✅ ALWAYS validate input
const validation = globalValidator.validateText(userInput);
if (validation.valid) { /* process */ }

// ✅ ALWAYS handle errors
try {
    riskyFunction();
} catch (error) {
    globalErrorHandler.handleError(error, 'context');
}

// ✅ ALWAYS use consistent storage
await globalSecureStorage.setItem('setting1', value);
await globalSecureStorage.setItem('setting2', value);

// ✅ ALWAYS track resources
const key = globalMemoryManager.trackEventListener(element, 'click', handler);
```

---

## 📋 **Module Template** (Copy & Paste)

```javascript
/**
 * [ModuleName] - [Description]
 */
class ModuleName {
    constructor() {
        this.initialized = false;
        this.eventListeners = [];
    }

    async initialize() {
        try {
            // Check security framework
            if (!globalErrorHandler || !globalValidator || !globalSecureStorage) {
                throw new Error('Security framework not ready');
            }

            // Initialize module
            await this.setupUI();
            await this.loadConfig();
            
            this.initialized = true;
            console.log('✅ ModuleName initialized');
            
        } catch (error) {
            globalErrorHandler.handleError(error, 'ModuleName.initialize');
            throw error;
        }
    }

    async handleUserInput(input) {
        const validation = globalValidator.validateText(input, {
            minLength: 1,
            maxLength: 1000,
            stripHtml: true
        });

        if (!validation.valid) {
            globalErrorHandler.showUserNotification(
                validation.errors.join(', '),
                'warning'
            );
            return;
        }

        return this.processInput(validation.value);
    }

    async saveData(key, value) {
        try {
            await globalSecureStorage.setItem(key, value);
        } catch (error) {
            globalErrorHandler.handleError(error, 'ModuleName.saveData');
        }
    }

    cleanup() {
        this.eventListeners.forEach(key => {
            globalMemoryManager.removeEventListener(key);
        });
        this.initialized = false;
    }
}

// Register module
const moduleName = new ModuleName();
window.globalDIContainer?.register('moduleName', moduleName);
```

---

## 🔧 **HTML Template** (Script Loading Order)

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Extension</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <!-- Your UI here -->

    <!-- SECURITY FRAMEWORK - ALWAYS FIRST -->
    <script src="js/core/error-handler.js"></script>
    <script src="js/core/input-validator.js"></script>
    <script src="js/core/memory-manager.js"></script>
    <script src="js/core/accessibility-manager.js"></script>
    <script src="js/core/di-container.js"></script>
    
    <!-- SECURE STORAGE -->
    <script src="storage/secureAPIStorage.js"></script>
    
    <!-- ADOBE CEP -->
    <script src="js/libs/CSInterface.js"></script>
    
    <!-- YOUR MODULES -->
    <script src="js/your-modules.js"></script>
    
    <!-- INITIALIZER - ALWAYS LAST -->
    <script src="js/core/module-initializer.js"></script>
</body>
</html>
```

---

## 🧪 **Testing Checklist**

### **Security Tests** (Run Every Time)
```javascript
// 1. API Key Protection
const testKey = 'test-key';
await globalSecureStorage.setItem('test', testKey);
console.assert(localStorage.getItem('test') !== testKey, 'Not encrypted!');

// 2. XSS Protection
const xss = '<script>alert("XSS")</script>';
const result = globalValidator.validateText(xss);
console.assert(!result.valid, 'XSS not blocked!');

// 3. Memory Management
const stats = globalMemoryManager.getMemoryStats();
console.log('Memory usage:', stats);
```

### **Pre-Commit Checklist**
- [ ] No `localStorage` for sensitive data
- [ ] All `innerHTML` assignments validated
- [ ] Error handling on all async operations
- [ ] Resources tracked for cleanup
- [ ] Security tests passing

---

## 🚀 **Common Code Snippets**

### **Secure Settings Management**
```javascript
class SettingsManager {
    static async getSetting(key, defaultValue = null) {
        try {
            return await globalSecureStorage.getItem(key) || defaultValue;
        } catch (error) {
            globalErrorHandler.handleError(error, 'SettingsManager.getSetting');
            return defaultValue;
        }
    }

    static async setSetting(key, value) {
        try {
            await globalSecureStorage.setItem(key, value);
            return true;
        } catch (error) {
            globalErrorHandler.handleError(error, 'SettingsManager.setSetting');
            return false;
        }
    }
}
```

### **Safe DOM Updates**
```javascript
function updateElementSafely(element, content, isHTML = false) {
    try {
        if (isHTML) {
            const validation = globalValidator.validateText(content, {
                stripHtml: false,
                maxLength: 10000
            });
            
            if (!validation.valid) {
                throw new Error('Invalid HTML content');
            }
            
            element.innerHTML = globalValidator.sanitizeHtml(validation.value);
        } else {
            element.textContent = content;
        }
    } catch (error) {
        globalErrorHandler.handleError(error, 'updateElementSafely');
        element.textContent = 'Content unavailable';
    }
}
```

### **Event Handler Template**
```javascript
function setupEventHandler(elementId, eventType, handler) {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element ${elementId} not found`);
        }

        const safeHandler = (event) => {
            try {
                handler(event);
            } catch (error) {
                globalErrorHandler.handleError(error, `${elementId}.${eventType}`);
            }
        };

        const key = globalMemoryManager.trackEventListener(
            element, 
            eventType, 
            safeHandler
        );
        
        return key;
    } catch (error) {
        globalErrorHandler.handleError(error, 'setupEventHandler');
        return null;
    }
}
```

---

## 📁 **Folder Structure Reminder**

```
MyExtension/
├── src/
│   ├── CSXS/
│   │   └── manifest.xml
│   ├── css/
│   ├── js/
│   │   ├── core/              # Security framework (copy from your project)
│   │   │   ├── error-handler.js
│   │   │   ├── input-validator.js
│   │   │   ├── memory-manager.js
│   │   │   ├── accessibility-manager.js
│   │   │   ├── di-container.js
│   │   │   └── module-initializer.js
│   │   ├── libs/              # Adobe CEP & third-party
│   │   ├── modules/           # Your feature modules
│   │   └── utils/             # Utility functions
│   ├── storage/
│   │   └── secureAPIStorage.js # Copy from your project
│   ├── assets/
│   └── index.html
├── docs/
├── tests/
└── package.json
```

---

## ⚡ **Emergency Commands**

### **When Things Break:**
```javascript
// 1. Check security framework status
console.log('Error Handler:', !!globalErrorHandler);
console.log('Validator:', !!globalValidator);
console.log('Secure Storage:', !!globalSecureStorage);
console.log('Memory Manager:', !!globalMemoryManager);

// 2. Check memory usage
globalMemoryManager?.getMemoryStats();

// 3. Force cleanup
globalMemoryManager?.cleanup();

// 4. Reset module state
window.moduleInitializer?.getStatus();
```

### **Debug Mode:**
```javascript
// Enable verbose logging
window.DEBUG_MODE = true;

// Check initialization status
console.table(window.moduleInitializer?.getStatus());

// Test security features
await testAPIKeySecurity();
testXSSProtection();
testMemoryManagement();
```

---

## 🎯 **Success Metrics** (Your Targets)

### **Security**
- ✅ Zero API keys in localStorage
- ✅ 100% input validation
- ✅ All errors handled
- ✅ No XSS vulnerabilities

### **Performance**
- ✅ Memory usage < 100MB
- ✅ Initialization < 2 seconds
- ✅ No memory leaks

### **Quality**
- ✅ All modules initialized
- ✅ Tests passing
- ✅ Console errors = 0

---

## 📞 **When in Doubt**

1. **Check the security framework first** - Most issues are missing dependencies
2. **Validate all inputs** - When users report weird behavior
3. **Look at error logs** - Use globalErrorHandler to see what's failing
4. **Check memory usage** - When extension feels slow
5. **Review your past mistakes** - Don't repeat the localStorage/XSS errors

**Remember: Security first, features second. This approach saved your project!**
