/**
 * LetterBlack Component Loader
 * Dynamically loads HTML components to keep main HTML clean
 */

class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.loadedComponents = new Set();
    }

    /**
     * Register a component with its file path
     */
    register(name, filePath) {
        this.components.set(name, filePath);
        return this;
    }

    /**
     * Load a component and inject it into the target element
     */
    async load(componentName, targetSelector) {
        try {
            const filePath = this.components.get(componentName);
            if (!filePath) {
                throw new Error(`Component '${componentName}' not registered`);
            }

            const target = document.querySelector(targetSelector);
            if (!target) {
                throw new Error(`Target element '${targetSelector}' not found`);
            }

            // Check if already loaded
            if (this.loadedComponents.has(componentName)) {
                console.log(`Component '${componentName}' already loaded`);
                return;
            }

            console.log(`Loading component: ${componentName} from ${filePath}`);
            
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.statusText}`);
            }

            const html = await response.text();
            target.innerHTML = html;
            
            this.loadedComponents.add(componentName);
            console.log(`✅ Component '${componentName}' loaded successfully`);
            
            // Dispatch custom event
            target.dispatchEvent(new CustomEvent('component-loaded', {
                detail: { componentName, target }
            }));

        } catch (error) {
            console.error(`❌ Failed to load component '${componentName}':`, error);
            
            // Show fallback content using DOM APIs to avoid HTML injection
            const target = document.querySelector(targetSelector);
            if (target) {
                const wrapper = document.createElement('div');
                wrapper.className = 'component-error';

                const p = document.createElement('p');
                p.textContent = `⚠️ Failed to load ${componentName}`;

                const small = document.createElement('small');
                // Use textContent for the error message to avoid injecting HTML
                small.textContent = error && error.message ? String(error.message) : 'Unknown error';

                wrapper.appendChild(p);
                wrapper.appendChild(small);

                // Clear target and append wrapper
                target.textContent = '';
                target.appendChild(wrapper);
            }
        }
    }

    /**
     * Load multiple components in parallel
     */
    async loadAll(componentMap) {
        const promises = Object.entries(componentMap).map(([componentName, targetSelector]) => 
            this.load(componentName, targetSelector)
        );
        
        await Promise.all(promises);
        console.log('✅ All components loaded');
    }

    /**
     * Reload a component (useful for development)
     */
    async reload(componentName, targetSelector) {
        this.loadedComponents.delete(componentName);
        await this.load(componentName, targetSelector);
    }

    /**
     * Check if a component is loaded
     */
    isLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    /**
     * Get list of loaded components
     */
    getLoadedComponents() {
        return Array.from(this.loadedComponents);
    }
}

// Create global instance
window.componentLoader = new ComponentLoader();

// Register all LetterBlack components
window.componentLoader
    .register('header', 'html/components/header.html')
    .register('navigation', 'html/components/navigation.html')
    .register('chat-interface', 'html/components/chat-interface.html')
    .register('script-editor', 'html/components/script-editor.html')
    .register('quick-actions', 'html/components/quick-actions.html')
    .register('settings-panel', 'html/components/settings-panel.html');

/**
 * Initialize all components when DOM is ready
 */
async function initializeComponents() {
    console.log('🚀 Initializing LetterBlack components...');
    
    try {
        await window.componentLoader.loadAll({
            'header': '#header-container',
            'navigation': '#navigation-container', 
            'chat-interface': '#chat-container',
            'script-editor': '#script-container',
            'quick-actions': '#quick-container',
            'settings-panel': '#settings-container'
        });
        
        console.log('✅ All LetterBlack components initialized');
        
        // Trigger component initialization event
        document.dispatchEvent(new CustomEvent('components-ready'));
        
    } catch (error) {
        console.error('❌ Component initialization failed:', error);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
    initializeComponents();
}

// Export for manual use
window.initializeComponents = initializeComponents;
