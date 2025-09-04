/**
 * Dependency Checker Module
 * Validates availability of required modules and displays appropriate warnings
 * Extracted and optimized from abilities folder
 */

class DependencyChecker {
    constructor() {
        this.dependencies = {
            // Core CEP dependencies
            'CEP': {
                check: () => typeof window.cep !== 'undefined',
                required: true,
                description: 'Adobe CEP Framework'
            },
            'CSInterface': {
                check: () => typeof CSInterface !== 'undefined',
                required: true,
                description: 'CSInterface for ExtendScript communication'
            },
            
            // File system dependencies
            'FileSystem': {
                check: () => typeof window.cep?.fs !== 'undefined',
                required: true,
                description: 'CEP File System API'
            },
            
            // After Effects dependencies
            'AfterEffects': {
                check: () => this.checkAfterEffectsConnection(),
                required: true,
                description: 'Adobe After Effects application'
            },
            
            // Speech API dependencies
            'SpeechSynthesis': {
                check: () => 'speechSynthesis' in window,
                required: false,
                description: 'Text-to-Speech API'
            },
            'SpeechRecognition': {
                check: () => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
                required: false,
                description: 'Speech-to-Text API'
            },
            
            // Modern browser features
            'LocalStorage': {
                check: () => typeof Storage !== 'undefined',
                required: true,
                description: 'Local Storage API'
            },
            'Fetch': {
                check: () => typeof fetch !== 'undefined',
                required: true,
                description: 'Fetch API for network requests'
            },
            'WebGL': {
                check: () => this.checkWebGLSupport(),
                required: false,
                description: 'WebGL for advanced graphics'
            }
        };
        
        this.lastCheck = null;
        this.statusDisplayed = false;
    }
    
    /**
     * Check all dependencies and return status
     */
    async checkAllDependencies() {
        console.log('🔍 Checking system dependencies...');
        
        const results = {
            timestamp: new Date().toISOString(),
            total: Object.keys(this.dependencies).length,
            passed: 0,
            failed: 0,
            optional: 0,
            required: 0,
            details: {}
        };
        
        for (const [name, dep] of Object.entries(this.dependencies)) {
            try {
                const isAvailable = await this.checkDependency(name);
                
                results.details[name] = {
                    available: isAvailable,
                    required: dep.required,
                    description: dep.description,
                    status: isAvailable ? 'ok' : (dep.required ? 'error' : 'warning')
                };
                
                if (isAvailable) {
                    results.passed++;
                } else {
                    results.failed++;
                }
                
                if (dep.required) {
                    results.required++;
                } else {
                    results.optional++;
                }
                
            } catch (error) {
                console.error(`Error checking ${name}:`, error);
                results.details[name] = {
                    available: false,
                    required: dep.required,
                    description: dep.description,
                    status: 'error',
                    error: error.message
                };
                results.failed++;
            }
        }
        
        this.lastCheck = results;
        return results;
    }
    
    /**
     * Check individual dependency
     */
    async checkDependency(name) {
        const dependency = this.dependencies[name];
        if (!dependency) {
            throw new Error(`Unknown dependency: ${name}`);
        }
        
        if (typeof dependency.check === 'function') {
            return await dependency.check();
        }
        
        return false;
    }
    
    /**
     * Check After Effects connection
     */
    checkAfterEffectsConnection() {
        try {
            if (typeof CSInterface === 'undefined') return false;
            
            const cs = new CSInterface();
            const appName = cs.hostEnvironment.appName;
            return appName === 'AEFT' || appName === 'AfterEffects';
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Check WebGL support
     */
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Display dependency status in console and UI
     */
    async showDependencyStatus() {
        if (!this.lastCheck) {
            await this.checkAllDependencies();
        }
        
        const results = this.lastCheck;
        
        console.log('\n📊 DEPENDENCY STATUS REPORT');
        console.log('═'.repeat(50));
        console.log(`✅ Passed: ${results.passed}/${results.total}`);
        console.log(`❌ Failed: ${results.failed}/${results.total}`);
        console.log(`🔧 Required: ${results.required}`);
        console.log(`⚡ Optional: ${results.optional}`);
        console.log('─'.repeat(50));
        
        // Group dependencies by status
        const categories = { ok: [], warning: [], error: [] };
        
        Object.entries(results.details).forEach(([name, info]) => {
            categories[info.status].push({ name, ...info });
        });
        
        // Display each category
        if (categories.ok.length > 0) {
            console.log('✅ AVAILABLE:');
            categories.ok.forEach(dep => {
                console.log(`  ✓ ${dep.name}: ${dep.description}`);
            });
        }
        
        if (categories.warning.length > 0) {
            console.log('\n⚠️  OPTIONAL (Not Available):');
            categories.warning.forEach(dep => {
                console.log(`  ⚠ ${dep.name}: ${dep.description}`);
            });
        }
        
        if (categories.error.length > 0) {
            console.log('\n❌ MISSING REQUIRED:');
            categories.error.forEach(dep => {
                console.log(`  ❌ ${dep.name}: ${dep.description}`);
                if (dep.error) {
                    console.log(`     Error: ${dep.error}`);
                }
            });
        }
        
        console.log('═'.repeat(50));
        
        // Show UI notification for critical issues
        const criticalIssues = categories.error.length;
        if (criticalIssues > 0) {
            this.showUIWarning(criticalIssues, categories.error);
        } else {
            this.showUISuccess();
        }
        
        this.statusDisplayed = true;
        return results;
    }
    
    /**
     * Show UI warning for missing dependencies
     */
    showUIWarning(count, errors) {
        if (window.floatingMascot) {
            window.floatingMascot.showNotification(
                `⚠️ ${count} critical dependencies missing`,
                'warning',
                5000
            );
        }
        
        // Log actionable advice
        console.log('\n🔧 RECOMMENDED ACTIONS:');
        errors.forEach(dep => {
            console.log(`  • ${dep.name}: ${this.getRecommendation(dep.name)}`);
        });
    }
    
    /**
     * Show UI success message
     */
    showUISuccess() {
        if (window.floatingMascot) {
            window.floatingMascot.showNotification(
                '✅ All critical dependencies available',
                'success',
                3000
            );
        }
        console.log('🎉 All critical dependencies are available!');
    }
    
    /**
     * Get recommendation for missing dependency
     */
    getRecommendation(depName) {
        const recommendations = {
            'CEP': 'Ensure extension is running inside Adobe CEP environment',
            'CSInterface': 'Check that CEP debug mode is enabled',
            'AfterEffects': 'Launch Adobe After Effects and load the extension',
            'FileSystem': 'Enable CEP file system permissions',
            'LocalStorage': 'Use a modern browser or enable local storage',
            'Fetch': 'Update to a modern browser that supports Fetch API'
        };
        
        return recommendations[depName] || 'Check system requirements and configuration';
    }
    
    /**
     * Get system readiness score
     */
    getReadinessScore() {
        if (!this.lastCheck) return 0;
        
        const required = Object.values(this.lastCheck.details)
            .filter(dep => dep.required);
        
        const requiredAvailable = required.filter(dep => dep.available).length;
        
        return required.length > 0 ? (requiredAvailable / required.length) * 100 : 100;
    }
    
    /**
     * Check if system is ready for operation
     */
    isSystemReady() {
        return this.getReadinessScore() >= 100;
    }
    
    /**
     * Add custom dependency
     */
    addDependency(name, config) {
        this.dependencies[name] = {
            check: config.check,
            required: config.required || false,
            description: config.description || `Custom dependency: ${name}`
        };
        
        // Clear last check to force recheck
        this.lastCheck = null;
    }
    
    /**
     * Remove dependency
     */
    removeDependency(name) {
        delete this.dependencies[name];
        this.lastCheck = null;
    }
}

// Initialize global dependency checker
document.addEventListener('DOMContentLoaded', () => {
    if (!window.dependencyChecker) {
        window.dependencyChecker = new DependencyChecker();
        console.log('✅ Dependency Checker initialized');
        
        // Auto-check dependencies after a short delay
        setTimeout(() => {
            window.dependencyChecker.showDependencyStatus();
        }, 2000);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DependencyChecker;
}
