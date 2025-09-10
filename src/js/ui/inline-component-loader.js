/**
 * LetterBlack Inline Component System
 * Embeds components directly to avoid fetch restrictions
 */

// Component Templates
const LetterBlackComponents = {
    header: `
        <header class="header">
            <div class="header-content">
                <div class="header-left">
                    <div class="mascot-container">
                        <div class="mascot mascot-happy" id="header-mascot"></div>
                    </div>
                    <div class="header-title">
                        <h1>LetterBlack_Gen_AI</h1>
                        <p class="header-subtitle">AI-Powered After Effects Assistant</p>
                    </div>
                </div>
                
                <div class="header-right">
                    <div class="connection-status" id="connection-status">
                        <span class="status-indicator status-connecting"></span>
                        <span class="status-text">Connecting...</span>
                    </div>
                </div>
            </div>
        </header>
    `,

    navigation: `
        <nav class="tabs-container">
            <div class="tabs">
                <button class="tab-btn active" data-tab="chat">
                    <svg class="icon" viewBox="0 0 16 16">
                        <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                    </svg>
                    Chat
                </button>
                
                <button class="tab-btn" data-tab="script">
                    <svg class="icon" viewBox="0 0 16 16">
                        <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                    </svg>
                    Script
                </button>
                
                <button class="tab-btn" data-tab="quick">
                    <svg class="icon" viewBox="0 0 16 16">
                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                    </svg>
                    Quick
                </button>
                
                <button class="tab-btn" data-tab="settings">
                    <svg class="icon" viewBox="0 0 16 16">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.292-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.292c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                    </svg>
                    Settings
                </button>
            </div>
        </nav>
    `,

    chatInterface: `
        <div class="tab-content" id="chat-content">
            <div class="chat-container">
                <div id="chat-messages" class="chat-messages"></div>
                
                <div class="chat-input-container">
                    <div class="input-group">
                        <textarea id="user-input" 
                                 placeholder="Ask LetterBlack AI about After Effects, scripts, or anything else..."
                                 rows="3"
                                 class="form-control"></textarea>
                        <div class="input-group-actions">
                            <button id="send-btn" class="btn btn-letterblack">
                                <svg class="icon" viewBox="0 0 16 16">
                                    <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                                </svg>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="chat-controls">
                    <div class="form-group">
                        <label class="form-label">AI Provider:</label>
                        <select id="ai-provider" class="form-control" title="Select AI provider">
                            <option value="gemini">Gemini (Google)</option>
                            <option value="groq">Groq (Fast)</option>
                            <option value="openai">OpenAI</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `,

    scriptEditor: `
        <div class="tab-content" id="script-content">
            <div class="script-panel">
                <div class="script-editor-container">
                    <div class="editor-header">
                        <h3>Script Editor</h3>
                        <div class="editor-actions">
                            <button id="health-check-script-btn" class="btn btn-sm btn-secondary" title="Check script for issues">
                                <svg class="icon" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                                </svg>
                                Check
                            </button>
                            <button id="explain-script-btn" class="btn btn-sm btn-secondary" title="Explain script with AI">
                                <svg class="icon" viewBox="0 0 16 16">
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                                </svg>
                                Explain
                            </button>
                        </div>
                    </div>
                    
                    <textarea id="script-editor" 
                             placeholder="// Enter your After Effects script here
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    // Your code here
    alert('Hello from LetterBlack!');
}"
                             class="form-control script-textarea"></textarea>
                </div>
                
                <div class="script-actions">
                    <button id="run-script-btn" class="btn btn-primary">
                        <svg class="icon" viewBox="0 0 16 16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                        </svg>
                        Run Script
                    </button>
                    <button id="apply-script-btn" class="btn btn-letterblack">
                        <svg class="icon" viewBox="0 0 16 16">
                            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                        </svg>
                        Apply to Layers
                    </button>
                </div>
            </div>
        </div>
    `,

    quickActions: `
        <div class="tab-content" id="quick-content">
            <div class="quick-actions-grid">
                <div class="quick-section">
                    <h3>Quick Expressions</h3>
                    <div class="quick-buttons">
                        <button class="btn btn-secondary btn-expression" data-expression="wiggle(2, 50)">
                            <svg class="icon" viewBox="0 0 16 16">
                                <path d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"/>
                                <path d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708l3 3z"/>
                            </svg>
                            Wiggle
                        </button>
                        <button class="btn btn-secondary btn-expression" data-expression="loopOut()">
                            <svg class="icon" viewBox="0 0 16 16">
                                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                                <path d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                            </svg>
                            Loop Out
                        </button>
                        <button class="btn btn-secondary btn-expression" data-expression="linear(time, inPoint, inPoint+1, 0, 100)">
                            <svg class="icon" viewBox="0 0 16 16">
                                <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                            </svg>
                            Fade In
                        </button>
                    </div>
                </div>
                
                <div class="quick-section">
                    <h3>Layer Tools</h3>
                    <div class="quick-buttons">
                        <button class="btn btn-primary" id="duplicate-layers-btn">
                            <svg class="icon" viewBox="0 0 16 16">
                                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                            </svg>
                            Duplicate Layers
                        </button>
                        <button class="btn btn-primary" id="organize-layers-btn">
                            <svg class="icon" viewBox="0 0 16 16">
                                <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm0 3a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm0 3a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm0 3a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11z"/>
                            </svg>
                            Organize Layers
                        </button>
                        <button class="btn btn-primary" id="analyze-layer-btn">
                            <svg class="icon" viewBox="0 0 16 16">
                                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
                            </svg>
                            Analyze Layer
                        </button>
                    </div>
                </div>
                
                <div class="quick-section">
                    <h3>Image Context</h3>
                    <div id="image-upload-container">
                        <input type="file" id="image-upload" accept="image/*" class="form-control" title="Upload image for context" />
                        <div id="image-preview-container" class="image-preview-container"></div>
                    </div>
                </div>
            </div>
        </div>
    `,

    settingsPanel: `
        <div class="tab-content" id="settings-content">
            <div class="settings-panel">
                <div class="settings-section">
                    <h3>AI Provider Settings</h3>
                    <div class="form-group">
                        <label class="form-label" for="api-key-input">API Key:</label>
                        <div class="input-group">
                            <input type="password" 
                                   id="api-key-input" 
                                   class="form-control" 
                                   placeholder="Enter your API key"
                                   title="API Key for AI provider">
                            <button id="save-api-key-btn" class="btn btn-primary">Save</button>
                        </div>
                        <div class="form-help">Your API key is stored securely in local storage</div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="model-select">AI Model:</label>
                        <select id="model-select" class="form-control" title="Select AI model">
                            <option value="gemini-pro">Gemini Pro</option>
                            <option value="gemini-pro-vision">Gemini Pro Vision</option>
                            <option value="groq-mixtral">Groq Mixtral</option>
                            <option value="gpt-4">GPT-4</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Extension Preferences</h3>
                    <div class="form-group">
                        <label class="form-checkbox">
                            <input type="checkbox" id="auto-save-scripts">
                            <span class="checkmark"></span>
                            Auto-save scripts
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-checkbox">
                            <input type="checkbox" id="show-mascot">
                            <span class="checkmark"></span>
                            Show mascot animations
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-checkbox">
                            <input type="checkbox" id="debug-mode">
                            <span class="checkmark"></span>
                            Enable debug mode
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>About</h3>
                    <div class="about-info">
                        <p><strong>LetterBlack_Gen_AI</strong></p>
                        <p>Version: 1.3.0</p>
                        <p>AI-powered After Effects assistant</p>
                        <div class="settings-actions">
                            <button id="reset-settings-btn" class="btn btn-secondary">Reset Settings</button>
                            <button id="export-settings-btn" class="btn btn-primary">Export Settings</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Inline Component Loader
class InlineComponentLoader {
    constructor() {
        this.loadedComponents = new Set();
    }

    load(componentName, targetSelector) {
        try {
            const template = LetterBlackComponents[componentName];
            if (!template) {
                throw new Error(`Component '${componentName}' not found`);
            }

            const target = document.querySelector(targetSelector);
            if (!target) {
                throw new Error(`Target element '${targetSelector}' not found`);
            }

            // Remove loading indicator
            target.classList.remove('component-loading');
            target.innerHTML = template;
            
            this.loadedComponents.add(componentName);
            console.log(`✅ Component '${componentName}' loaded successfully`);
            
            // Dispatch event
            target.dispatchEvent(new CustomEvent('component-loaded', {
                detail: { componentName, target }
            }));

        } catch (error) {
            console.error(`❌ Failed to load component '${componentName}':`, error);
            
            const target = document.querySelector(targetSelector);
            if (target) {
                target.classList.remove('component-loading');
                // Build error UI safely without innerHTML
                target.innerHTML = '';
                const wrap = document.createElement('div');
                wrap.className = 'component-error';
                const p = document.createElement('p');
                p.textContent = '⚠️ Failed to load ' + String(componentName);
                const small = document.createElement('small');
                small.textContent = String(error && error.message ? error.message : 'Unknown error');
                wrap.appendChild(p);
                wrap.appendChild(small);
                target.appendChild(wrap);
            }
        }
    }

    loadAll(componentMap) {
        Object.entries(componentMap).forEach(([componentName, targetSelector]) => {
            this.load(componentName, targetSelector);
        });
        console.log('✅ All components loaded');
    }

    isLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    getLoadedComponents() {
        return Array.from(this.loadedComponents);
    }
}

// Initialize inline component system
window.inlineComponentLoader = new InlineComponentLoader();

/**
 * Initialize all components
 */
function initializeInlineComponents() {
    console.log('🚀 Initializing LetterBlack inline components...');
    
    window.inlineComponentLoader.loadAll({
        'header': '#header-container',
        'navigation': '#navigation-container', 
        'chatInterface': '#chat-container',
        'scriptEditor': '#script-container',
        'quickActions': '#quick-container',
        'settingsPanel': '#settings-container'
    });
    
    console.log('✅ All LetterBlack components initialized');
    
    // Trigger component initialization event
    document.dispatchEvent(new CustomEvent('components-ready'));
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInlineComponents);
} else {
    initializeInlineComponents();
}

// Export for manual use
window.initializeInlineComponents = initializeInlineComponents;
