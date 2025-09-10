// Simple, self-contained AI chat - following Adobe CEP guidelines

// ==============================
// Utility: CEP ⇄ AE bridge with Enhanced Error Handling
// ==============================
function evalInAE(jsx, cb) {
    if (window.__adobe_cep__ && typeof window.__adobe_cep__.evalScript === "function") {
        console.log('📡 Executing in AE:', jsx.substring(0, 100) + '...');
        
        window.__adobe_cep__.evalScript(jsx, (rawResult) => {
            console.log('📥 Raw AE Result:', rawResult);
            
            // Enhanced result parsing for better error handling
            const result = parseAEResult(rawResult);
            console.log('✅ Parsed Result:', result);
            
            if (cb) cb(result);
        });
    } else {
        console.warn("Not running inside After Effects (CEP).");
        const errorResult = {
            success: false,
            error: 'Not running inside After Effects (CEP)',
            details: 'CEP not available or evalScript not found'
        };
        cb && cb(errorResult);
    }
}

// Parse and structure AE script results for consistent error handling
function parseAEResult(rawResult) {
    const result = {
        success: false,
        error: null,
        data: null,
        details: rawResult
    };
    
    if (!rawResult) {
        result.error = 'No response from After Effects';
        result.details = 'Script executed but returned undefined/empty result';
    } else if (typeof rawResult === 'string') {
        // Check for standard error patterns
        if (rawResult.startsWith('ERROR:')) {
            result.error = rawResult.substring(6).trim();
        } else if (rawResult.includes('Error:') || rawResult.includes('error:')) {
            result.error = rawResult;
        } else if (rawResult.startsWith('SUCCESS:')) {
            result.success = true;
            result.data = rawResult.substring(8).trim();
        } else {
            // Assume success if no error indicators
            result.success = true;
            result.data = rawResult;
        }
    } else {
        // Non-string result, assume success
        result.success = true;
        result.data = rawResult;
    }
    
    return result;
}

function inAE() {
    return !!(window.__adobe_cep__ && window.__adobe_cep__.evalScript);
}

class SimpleAIChat {
    constructor({ chatSel = "#chatMessages", inputSel = "#messageInput", sendSel = "#sendBtn" } = {}) {
        console.log('🚀 Simple AI Chat starting...');
        
        this.chatSel = chatSel;
        this.inputSel = inputSel;
        this.sendSel = sendSel;
        this.apiKey = null;
        this.messages = []; // Simple message storage
        this.modelHint = "Act as an AE assistant. Output code fences for expressions or scripts where relevant.";
        
        // Follow Adobe CEP guidelines - wait for full DOM and script loading
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.delayedInit());
        } else {
            this.delayedInit();
        }
    }
    
    delayedInit() {
        // Wait additional time for all CEP scripts to load (Adobe recommendation)
        setTimeout(() => {
            this.apiKey = this.getAPIKey();
            console.log('API Key:', this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'none');
            console.log('CONFIG at init:', window.CONFIG);
            this.init();
        }, 500);
    }
    
    getAPIKey() {
        // CEP-compliant API key detection with multiple fallbacks
        const sources = [
            () => window.CONFIG?.GEMINI_API_KEY,
            () => window.CONFIG && window.CONFIG.GEMINI_API_KEY,
            () => {
                // Force re-check if config exists but no key
                if (window.CONFIG && (!window.CONFIG.GEMINI_API_KEY || window.CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY')) {
                    console.log('⚠️ Config exists but API key missing/invalid');
                    return null;
                }
                return window.CONFIG?.GEMINI_API_KEY;
            }
        ];
        
        for (const getKey of sources) {
            try {
                const key = getKey();
                if (key && key !== 'YOUR_GEMINI_API_KEY' && key.length > 10) {
                    console.log('✅ API key found from config');
                    return key;
                }
            } catch (e) {
                console.log('Key source failed:', e.message);
            }
        }
        
        console.log('❌ No valid API key found');
        return null;
    }
    
    init() {
        this.messageInput = document.querySelector(this.inputSel);
        this.sendBtn = document.querySelector(this.sendSel);
        this.chatMessages = document.querySelector(this.chatSel);
        
        if (!this.messageInput || !this.sendBtn || !this.chatMessages) {
            console.error('❌ UI elements not found. Check selectors:', {
                input: this.inputSel,
                send: this.sendSel,
                chat: this.chatSel
            });
            return;
        }
        
        // Clear any existing content
        this.chatMessages.innerHTML = '';
        
        // Bind events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Show status
        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY') {
            this.addMessage('⚠️ API Key Required: Please configure your Google Gemini API key using the Settings button.', 'assistant');
        } else {
            this.addMessage(`🎯 **LetterBlack AI Assistant v2.0** - Enhanced with Intent Classification!

**NEW FEATURES:**
- 🧠 **Smart Intent Recognition** - I analyze your requests and provide specialized assistance
- 🎬 **AE Context Awareness** - I know your current project, comp, and selected properties  
- ⚡ **Adaptive Responses** - Get context-specific help based on your current workflow

**I CAN HELP WITH:**
- 🎨 **Expressions**: wiggle, noise, keyframe loops, complex animations
- ⚙️ **Scripts**: automation, batch operations, project management
- 🔧 **Panels**: custom UI creation and dockable tools
- 📚 **Learning**: tutorials, explanations, best practices
- 🐛 **Troubleshooting**: debugging expressions and scripts

Try: *"wiggle for position"*, *"loop last keyframe"*, *"script to organize layers"*`, 'assistant');
        }
        
        // Add Test Config button
        this.addTestConfigButton();
        
        console.log('✅ SimpleAIChat initialized');
    }
    
    // ===== INTENT CLASSIFICATION SYSTEM =====
    
    classifyIntent(userMessage) {
        const msg = userMessage.toLowerCase();
        
        // Check for effect/preset requests first (more specific)
        const effectMatch = msg.match(/(?:apply|add)\s+(?:the\s+)?effect\s*[:\s]*["'](.+?)["']/);
        const presetMatch = msg.match(/\b([^\s]+\.ffx)\b/i);
        
        const intents = {
            EXPRESSION: {
                keywords: ['expression', 'animate', 'wiggle', 'sine', 'random', 'noise', 'ease', 'interpolate', 'value', 'transform', 'keyframe', 'time', 'index', 'loop', 'smooth', 'bounce', 'oscillate'],
                patterns: [/value(\s*\+|\s*-|\s*\*|\s*\/)/i, /wiggle\s*\(/, /sine\s*\(/, /time\s*\*/, /ease\s*\(/, /linear\s*\(/],
                confidence: 0
            },
            SCRIPT: {
                keywords: ['script', 'function', 'var', 'for', 'if', 'layer', 'comp', 'project', 'item', 'duplicate', 'create', 'import', 'export', 'render', 'batch', 'organize'],
                patterns: [/app\./i, /project\./i, /layer\./i, /comp\./i, /function\s+\w+\s*\(/i, /for\s*\(/i, /if\s*\(/i],
                confidence: 0
            },
            PANEL_GEN: {
                keywords: ['panel', 'ui', 'interface', 'button', 'window', 'dialog', 'cep', 'extension', 'create panel', 'build panel', 'generate panel'],
                patterns: [/create.*panel/i, /build.*panel/i, /generate.*panel/i, /panel.*for/i, /make.*ui/i, /\b(cep|uxp)\b.*\b(panel|dockable|extension)\b/i],
                confidence: 0
            },
            EFFECT: {
                keywords: ['effect', 'apply effect', 'add effect'],
                patterns: [/apply.*effect/i, /add.*effect/i],
                confidence: effectMatch ? 10 : 0
            },
            PRESET: {
                keywords: ['preset', 'apply preset', 'ffx'],
                patterns: [/apply.*preset/i, /\.ffx/i],
                confidence: presetMatch ? 10 : 0
            },
            CONTEXT: {
                keywords: ['what', 'current', 'selected', 'active', 'composition', 'layer', 'property', 'tell me about', 'show me', 'analyze'],
                patterns: [/what.*selected/i, /current.*comp/i, /active.*layer/i, /tell.*about/i, /show.*me/i],
                confidence: 0
            },
            HELP: {
                keywords: ['help', 'how', 'tutorial', 'learn', 'explain', 'guide', 'documentation', 'example'],
                patterns: [/how.*to/i, /how.*do/i, /explain.*how/i, /tutorial.*on/i, /guide.*for/i],
                confidence: 0
            },
            TROUBLESHOOT: {
                keywords: ['error', 'problem', 'issue', 'not working', 'broken', 'fix', 'debug', 'trouble'],
                patterns: [/not.*work/i, /error.*in/i, /problem.*with/i, /fix.*this/i, /debug.*my/i],
                confidence: 0
            },
            GENERAL: {
                keywords: ['hello', 'hi', 'thanks', 'good', 'awesome', 'cool'],
                patterns: [],
                confidence: 0
            }
        };
        
        // Calculate confidence scores
        for (const [intentName, intent] of Object.entries(intents)) {
            if (intentName === 'EFFECT' || intentName === 'PRESET') continue; // Already calculated above
            
            // Keyword matching
            const keywordMatches = intent.keywords.filter(keyword => msg.includes(keyword)).length;
            intent.confidence += keywordMatches * 2;
            
            // Pattern matching  
            const patternMatches = intent.patterns.filter(pattern => pattern.test(userMessage)).length;
            intent.confidence += patternMatches * 3;
        }
        
        // Find primary intent
        const primary = Object.entries(intents).reduce((max, [name, intent]) => 
            intent.confidence > max.confidence ? {name, confidence: intent.confidence} : max
        , {name: 'GENERAL', confidence: 0});
        
        return {
            primary: primary.name,
            confidence: primary.confidence,
            scores: Object.fromEntries(Object.entries(intents).map(([name, intent]) => [name, intent.confidence])),
            effectName: effectMatch ? effectMatch[1] : null,
            presetPath: presetMatch ? presetMatch[1] : null
        };
    }
    
    // ===== AE CONTEXT AWARENESS =====
    
    async getAEContext() {
        if (!window.__adobe_cep__) {
            return {available: false, reason: 'CEP not available'};
        }
        
        return new Promise((resolve) => {
            const contextScript = `
                (function() {
                    try {
                        var context = {
                            available: true,
                            project: {},
                            composition: null,
                            selectedLayers: [],
                            selectedProperties: []
                        };
                        
                        // Project info
                        if (app.project) {
                            context.project = {
                                name: app.project.file ? app.project.file.name : "Untitled Project",
                                numItems: app.project.numItems,
                                activeItem: null,
                                totalDuration: 0
                            };
                            
                            if (app.project.activeItem) {
                                var activeItem = app.project.activeItem;
                                context.project.activeItem = {
                                    name: activeItem.name,
                                    typeName: activeItem.typeName || "Unknown"
                                };
                                
                                // If it's a composition, get detailed info
                                if (activeItem instanceof CompItem) {
                                    context.composition = {
                                        name: activeItem.name,
                                        width: activeItem.width,
                                        height: activeItem.height,
                                        duration: activeItem.duration,
                                        frameRate: activeItem.frameRate,
                                        numLayers: activeItem.numLayers,
                                        currentTime: activeItem.time
                                    };
                                    
                                    // Get selected layers
                                    var selectedLayers = activeItem.selectedLayers;
                                    for (var i = 0; i < selectedLayers.length; i++) {
                                        var layer = selectedLayers[i];
                                        context.selectedLayers.push({
                                            name: layer.name,
                                            index: layer.index,
                                            typeName: layer.typeName || "Unknown",
                                            enabled: layer.enabled,
                                            hasVideo: layer.hasVideo,
                                            hasAudio: layer.hasAudio
                                        });
                                    }
                                    
                                    // Get selected properties (more complex)
                                    var selectedProps = activeItem.selectedProperties;
                                    for (var j = 0; j < selectedProps.length; j++) {
                                        var prop = selectedProps[j];
                                        try {
                                            context.selectedProperties.push({
                                                name: prop.name || "Unknown Property",
                                                matchName: prop.matchName || "",
                                                canSetExpression: prop.canSetExpression || false,
                                                hasKeyframes: prop.numKeys > 0,
                                                numKeys: prop.numKeys || 0,
                                                value: prop.value ? prop.value.toString() : "N/A"
                                            });
                                        } catch(propError) {
                                            // Some properties might not be accessible
                                            context.selectedProperties.push({
                                                name: "Property (Limited Access)",
                                                matchName: "",
                                                canSetExpression: false,
                                                hasKeyframes: false,
                                                numKeys: 0,
                                                value: "N/A"
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        
                        return JSON.stringify(context);
                    } catch(e) {
                        return JSON.stringify({
                            available: false, 
                            error: e.toString()
                        });
                    }
                })();
            `;
            
            window.__adobe_cep__.evalScript(contextScript, (result) => {
                try {
                    const context = JSON.parse(result || '{"available": false}');
                    resolve(context);
                } catch(e) {
                    resolve({available: false, error: 'Failed to parse context'});
                }
            });
        });
    }
    
    // ===== ENHANCED PROMPT BUILDING =====
    
    buildEnhancedPrompt(userMessage, intent, context) {
        // Build context-aware prompts based on intent and current AE state
        let basePrompt = `You are an Adobe After Effects expert assistant running inside an AE CEP extension.

UI INTERFACE KNOWLEDGE:
Every code block you generate has three smart buttons:
- 📋 COPY: Copies code to clipboard for manual pasting
- APPLY: Directly applies expressions to selected AE properties (expressions only)
- RUN: Smart button - applies expressions OR executes scripts in AE automatically

BUTTON BEHAVIOR:
- For EXPRESSIONS: Apply = Run (both apply to selected properties)
- For SCRIPTS: Run executes the complete script in After Effects
- Copy always available as backup option for any code type

CRITICAL DELIVERY RULES:
1. ALWAYS wrap code in triple backticks with language identifier
2. Use \`\`\`javascript for expressions and scripts
3. Keep expressions clean and focused on the specific property
4. Include helpful comments explaining complex logic
5. Test expressions work with selected property types

EXPRESSION GUIDELINES:
- Write expressions for the currently selected property type
- Use clear, readable syntax with good variable names  
- Include error handling for robust expressions
- Provide context about what the expression does

SCRIPT GUIDELINES:
- Always wrap scripts in proper undo groups
- Include comprehensive error handling with try/catch
- Return meaningful success/error messages
- Use descriptive variable names and comments

`;

        // Add intent-specific context
        switch(intent.primary) {
            case 'EFFECT':
                basePrompt += `
CURRENT CONTEXT: User wants to apply an effect to selected layers
FOCUS: Apply the effect "${intent.effectName}" to selected layers in After Effects

EFFECT APPLICATION CONTEXT:`;
                if (context.selectedLayers && context.selectedLayers.length > 0) {
                    basePrompt += `
✅ SELECTED LAYERS (${context.selectedLayers.length}):
${context.selectedLayers.map(l => `- "${l.name}" (#${l.index}, ${l.typeName})`).join('\n')}

The effect "${intent.effectName}" will be applied to these layers.`;
                } else {
                    basePrompt += `
📝 NO LAYERS SELECTED
Note: User needs to select layers first before applying effects.`;
                }
                break;
                
            case 'PRESET':
                basePrompt += `
CURRENT CONTEXT: User wants to apply a preset to selected layers
FOCUS: Apply the preset "${intent.presetPath}" to selected layers

PRESET APPLICATION CONTEXT:`;
                if (context.selectedLayers && context.selectedLayers.length > 0) {
                    basePrompt += `
✅ SELECTED LAYERS (${context.selectedLayers.length}):
${context.selectedLayers.map(l => `- "${l.name}" (#${l.index})`).join('\n')}

The preset will be applied to these layers.`;
                } else {
                    basePrompt += `
📝 NO LAYERS SELECTED
Note: User needs to select layers first before applying presets.`;
                }
                break;
                
            case 'EXPRESSION':
                basePrompt += `
CURRENT CONTEXT: User wants expression help
FOCUS: Create clean, applicable expressions for After Effects properties

SELECTED PROPERTIES CONTEXT:`;
                if (context.selectedProperties && context.selectedProperties.length > 0) {
                    const expressionReady = context.selectedProperties.filter(p => p.canSetExpression);
                    if (expressionReady.length > 0) {
                        basePrompt += `
✅ EXPRESSION-READY PROPERTIES (${expressionReady.length}):
${expressionReady.map(p => `- ${p.name} (${p.matchName}) - Current: ${p.value}`).join('\n')}

Priority: Generate expressions optimized for these selected properties.`;
                    } else {
                        basePrompt += `
⚠️ SELECTED PROPERTIES (${context.selectedProperties.length}) - may not support expressions
${context.selectedProperties.map(p => `- ${p.name}`).join('\n')}

Note: Suggest expression-compatible properties (Position, Scale, Rotation, Opacity) if needed.`;
                    }
                } else {
                    basePrompt += `
📝 NO PROPERTIES SELECTED
Recommendation: Provide general expressions with instructions to select target properties first.`;
                }
                break;
                
            case 'SCRIPT':
                basePrompt += `
CURRENT CONTEXT: User wants script automation
FOCUS: Create complete, executable scripts for After Effects

PROJECT CONTEXT:`;
                if (context.project && context.project.activeItem) {
                    basePrompt += `
📁 Active Project: "${context.project.name}" (${context.project.numItems} items)
🎬 Active Composition: "${context.project.activeItem.name}" (${context.project.activeItem.typeName})`;
                    
                    if (context.composition) {
                        basePrompt += `
📐 Comp Details: ${context.composition.width}x${context.composition.height}, ${context.composition.frameRate}fps
⏱️ Duration: ${context.composition.duration}s, Current Time: ${context.composition.currentTime}s
🎭 Layers: ${context.composition.numLayers} total`;
                        
                        if (context.selectedLayers.length > 0) {
                            basePrompt += `
✅ SELECTED LAYERS (${context.selectedLayers.length}):
${context.selectedLayers.map(l => `- "${l.name}" (#${l.index}, ${l.typeName})`).join('\n')}`;
                        }
                    }
                } else {
                    basePrompt += `
📝 NO ACTIVE COMPOSITION
Note: Some scripts may require an active composition. Suggest creating one if needed.`;
                }
                break;
                
            case 'PANEL_GEN':
                basePrompt += `
CURRENT CONTEXT: User wants custom panel/UI creation
FOCUS: Generate complete CEP panel scaffolds with manifest, HTML, CSS, and JavaScript

PANEL GENERATION CAPABILITIES:
- Create complete CEP extension structure
- Include proper manifest.xml with AE host configuration
- Generate responsive HTML/CSS interface
- Provide JavaScript with CEP evalScript integration
- Include sample ExtendScript for AE automation
- Add "Package" functionality to deploy to CEP extensions folder

When generating panels:
1. Ask for panel name and intended functionality
2. Create complete file structure (manifest.xml, index.html, panel.js)
3. Include sample buttons and controls relevant to the use case
4. Provide packaging instructions for easy deployment`;
                break;
                
            case 'CONTEXT':
                basePrompt += `
CURRENT CONTEXT: User wants information about their current AE state
FOCUS: Analyze and explain current project/composition/selection context

PROVIDE DETAILED ANALYSIS OF:`;
                if (context.available) {
                    basePrompt += `
- Current project and composition status
- Selected layers and properties
- Workflow recommendations
- Available automation opportunities`;
                } else {
                    basePrompt += `
- General After Effects workflow guidance
- Best practices and recommendations`;
                }
                break;
                
            case 'HELP':
                basePrompt += `
CURRENT CONTEXT: User needs learning assistance
FOCUS: Provide educational content, tutorials, and explanations

TEACHING APPROACH:
- Break down complex concepts into understandable steps
- Provide practical examples with code
- Explain the reasoning behind techniques
- Include best practices and common pitfalls`;
                break;
                
            case 'TROUBLESHOOT':
                basePrompt += `
CURRENT CONTEXT: User has problems that need debugging
FOCUS: Diagnose issues and provide solutions

DEBUGGING APPROACH:
- Identify likely causes of the problem
- Provide step-by-step troubleshooting
- Offer alternative approaches
- Include prevention strategies`;
                break;
        }
        
        basePrompt += `

USER REQUEST: "${userMessage}"

Provide a helpful, context-aware response optimized for their current After Effects workflow.`;

        return basePrompt;
    }
    
    // ===== MESSAGE MANAGEMENT =====
    
    addMessage(message, type, metadata = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // Convert markdown-style formatting to HTML
        let formattedMessage = message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        
        // Format code blocks with syntax highlighting and buttons
        formattedMessage = formattedMessage.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
            const blockId = 'code-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const cleanCode = code.trim();
            
            // Determine code type for button logic
            const isExpression = this.looksLikeExpression(cleanCode);
            const isScript = this.looksLikeScript(cleanCode);
            const isPanelCode = this.looksLikePanelCode(cleanCode);
            
            return `
                <div class="code-block-wrapper">
                    <div class="code-block-header">
                        <span class="code-type">${lang || 'code'}</span>
                        <div class="code-actions">
                            <button class="copy-btn" data-block-id="${blockId}" data-action="copy" title="Copy to clipboard">📋 Copy</button>
                            ${isExpression ? `<button class="apply-btn" data-block-id="${blockId}" data-action="apply" title="Apply to selected properties">⚡ Apply</button>` : ''}
                            ${isScript ? `<button class="run-btn" data-block-id="${blockId}" data-action="run" title="Execute script in After Effects">▶️ Run</button>` : ''}
                            ${isPanelCode ? `<button class="package-btn" data-block-id="${blockId}" data-action="package" title="Package as CEP panel">📦 Package</button>` : ''}
                        </div>
                    </div>
                    <pre class="code-block" id="${blockId}"><code class="language-${lang || 'javascript'}">${cleanCode}</code></pre>
                </div>
            `;
        });
        
        messageDiv.innerHTML = formattedMessage;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // Use event delegation for code block buttons
        this.setupCodeBlockEventDelegation(messageDiv);
        
        // Store message with metadata
        this.messages.push({
            content: message,
            type: type,
            timestamp: Date.now(),
            metadata: metadata
        });
    }
    
    setupCodeBlockEventDelegation(container) {
        // Use event delegation for better security and performance
        container.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;
            
            const action = button.getAttribute('data-action');
            const blockId = button.getAttribute('data-block-id');
            
            if (!blockId) return;
            
            switch(action) {
                case 'copy':
                    this.copyCode(blockId);
                    break;
                case 'apply':
                    this.applyToAE(blockId);
                    break;
                case 'run':
                    this.runScript(blockId);
                    break;
                case 'package':
                    this.packagePanel(blockId);
                    break;
                default:
                    console.warn('Unknown action:', action);
            }
        });
    }
    
    looksLikeExpression(code) {
        const expressionIndicators = [
            /value(\s*[\+\-\*\/]|\s*\.\w+)/i,
            /wiggle\s*\(/i,
            /ease\s*\(/i,
            /linear\s*\(/i,
            /sine\s*\(/i,
            /time(\s*[\+\-\*\/]|\s*\.\w+)/i,
            /index(\s*[\+\-\*\/]|\s*\.\w+)/i,
            /transform\./i,
            /thisComp\./i,
            /thisLayer\./i
        ];
        
        return expressionIndicators.some(pattern => pattern.test(code)) && 
               !code.includes('app.') && 
               !code.includes('var ') && 
               !code.includes('function ') &&
               code.split('\n').length < 20; // Expressions typically shorter
    }
    
    looksLikeScript(code) {
        const scriptIndicators = [
            /app\./i,
            /project\./i,
            /function\s+\w+\s*\(/i,
            /var\s+\w+/i,
            /for\s*\(/i,
            /beginUndoGroup/i,
            /endUndoGroup/i
        ];
        
        return scriptIndicators.some(pattern => pattern.test(code));
    }
    
    looksLikePanelCode(code) {
        // Detect panel-related code (HTML, CSS, or panel-specific JS)
        const panelIndicators = [
            /<html/i,
            /<body/i,
            /<div.*class/i,
            /manifest\.xml/i,
            /ExtensionManifest/i,
            /window\.__adobe_cep__/i,
            /evalScript/i,
            /\.panel-/i,
            /<!DOCTYPE html>/i
        ];
        
        return panelIndicators.some(pattern => pattern.test(code)) || 
               (code.includes('function') && code.includes('window') && code.includes('CEP'));
    }
    
    // ===== CODE INTERACTION SYSTEM =====
    
    copyCode(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (!codeBlock) return;
        
        const code = codeBlock.textContent;
        this.copyToClipboardAE(code);
        this.showToast('📋 Code copied to clipboard');
    }
    
    copyToClipboardAE(text) {
        // Adobe CEP-compatible clipboard method
        if (window.__adobe_cep__) {
            // Use CEP's evalScript to copy via ExtendScript
            window.__adobe_cep__.evalScript(`
                try {
                    var clipText = "${text.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
                    // Note: ExtendScript doesn't have direct clipboard access
                    // This is a placeholder for future clipboard functionality
                    "CEP_COPY_SUCCESS";
                } catch(e) {
                    "CEP_COPY_ERROR: " + e.toString();
                }
            `, (result) => {
                console.log('CEP copy result:', result);
            });
        }
        
        // Fallback to standard clipboard API
        this.legacyCopy(text);
    }
    
    legacyCopy(text) {
        // Standard web clipboard with fallback
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).catch(() => this.textareaCopy(text));
        } else {
            this.textareaCopy(text);
        }
    }
    
    textareaCopy(text) {
        // Last resort: temporary textarea method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (e) {
            console.log('Copy failed:', e);
        }
        document.body.removeChild(textarea);
    }
    
    // ===== EXPRESSION PROCESSING (BULLETPROOF) =====
    
    cleanExpression(rawCode) {
        // Gentler expression cleaning - preserve intentional complexity
        return rawCode
            .replace(/^```[\w]*\n?/gm, '')
            .replace(/```$/gm, '')
            .replace(/^\/\/.*$/gm, '') // Remove comment-only lines
            .split('\n')
            .filter(line => line.trim()) // Remove empty lines
            .join('\n')
            .trim();
    }
    
    formatExpressionForAE(cleanExpression) {
        // Pre-flight validation and user-friendly formatting
        const lines = cleanExpression.split('\n');
        
        // Check for common issues
        const issues = [];
        if (cleanExpression.includes('app.')) {
            issues.push('Expression contains script-like "app." reference');
        }
        if (cleanExpression.includes('beginUndoGroup')) {
            issues.push('Expression contains script-like undo group commands');
        }
        if (lines.length > 50) {
            issues.push('Expression is very long - consider breaking into smaller parts');
        }
        
        if (issues.length > 0) {
            console.warn('Expression formatting issues:', issues);
        }
        
        // Return the expression as-is for direct application
        return cleanExpression;
    }
    
    // ===== BULLETPROOF EXPRESSION APPLICATION =====
    
    async applyToAE(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (!codeBlock) {
            this.showToast('❌ Code block not found');
            return;
        }
        
        const rawCode = codeBlock.textContent;
        
        // Pre-flight context check
        const context = await this.getAEContext();
        if (!context.available) {
            this.showToast('❌ After Effects context not available');
            return;
        }
        
        // Auto-fallback: if no expression-ready properties but layers are selected, guide user
        if (!context.selectedProperties || context.selectedProperties.length === 0) {
            if (context.selectedLayers && context.selectedLayers.length > 0) {
                this.showToast('💡 Select a property (Position, Scale, Rotation, Opacity) from the selected layer first');
                return;
            } else {
                this.showToast('💡 Select a layer and property in the Timeline first');
                return;
            }
        }
        
        const expressionReady = context.selectedProperties.filter(p => p.canSetExpression);
        if (expressionReady.length === 0) {
            this.showToast('⚠️ Selected properties don\'t support expressions. Try Position, Scale, Rotation, or Opacity');
            return;
        }
        
        const cleanCode = this.cleanExpression(rawCode);
        const finalExpression = this.formatExpressionForAE(cleanCode);
        
        // Bulletproof application with try/catch/finally
        const applyScript = `
            (function() {
                app.beginUndoGroup("Apply Expression");
                var successCount = 0;
                var errors = [];
                
                try {
                    var comp = app.project.activeItem;
                    if (!comp || !(comp instanceof CompItem)) {
                        app.endUndoGroup();
                        return "ERROR: No active composition";
                    }
                    
                    var selectedProps = comp.selectedProperties;
                    if (selectedProps.length === 0) {
                        app.endUndoGroup();
                        return "ERROR: No properties selected";
                    }
                    
                    var expression = \`${finalExpression.replace(/`/g, '\\`')}\`;
                    
                    for (var i = 0; i < selectedProps.length; i++) {
                        try {
                            var prop = selectedProps[i];
                            if (prop.canSetExpression) {
                                prop.expression = expression;
                                successCount++;
                            } else {
                                errors.push("Property '" + prop.name + "' doesn't support expressions");
                            }
                        } catch(propError) {
                            errors.push("Property " + (i+1) + ": " + propError.toString());
                        }
                    }
                    
                    app.endUndoGroup();
                    
                    if (successCount > 0) {
                        var result = "SUCCESS: Applied expression to " + successCount + " properties";
                        if (errors.length > 0) {
                            result += "\\nWarnings: " + errors.join(", ");
                        }
                        return result;
                    } else {
                        return "ERROR: No expressions applied. " + (errors.length > 0 ? errors.join(", ") : "Unknown error");
                    }
                    
                } catch(e) {
                    app.endUndoGroup();
                    return "ERROR: " + e.toString();
                }
            })();
        `;
        
        evalInAE(applyScript, (result) => {
            console.log('Expression application result:', result);
            
            // Use enhanced result parsing for better feedback
            if (result.success) {
                this.showToast('✅ ' + result.data);
                
                // If there were warnings, show them in chat
                if (result.data.includes('Warnings:')) {
                    const warnings = result.data.split('\\nWarnings: ')[1];
                    this.addMessage(`⚠️ **Expression Applied with Warnings:**\n${warnings}`, 'assistant');
                }
            } else {
                this.showToast('❌ ' + result.error);
                // Show detailed error in chat for debugging
                this.addMessage(`❌ **Expression Application Failed:**\n${result.error}\n\n*Details:* ${result.details}`, 'assistant');
            }
        });
    }
    
    // ===== BULLETPROOF SCRIPT EXECUTION =====
    
    async runScript(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (!codeBlock) {
            this.showToast('❌ Code block not found');
            return;
        }
        
        const rawCode = codeBlock.textContent;
        
        // Pre-flight checks
        if (!window.__adobe_cep__) {
            this.showToast('❌ CEP not available for script execution');
            return;
        }
        
        // Bulletproof script wrapper with guaranteed undo group closure
        const wrappedScript = `
            (function() {
                var undoGroupActive = false;
                try {
                    app.beginUndoGroup("AI Generated Script");
                    undoGroupActive = true;
                    
                    // USER SCRIPT EXECUTION
                    ${rawCode}
                    
                    app.endUndoGroup();
                    undoGroupActive = false;
                    return "SUCCESS: Script executed successfully";
                    
                } catch(e) {
                    if (undoGroupActive) {
                        try { app.endUndoGroup(); } catch(undoError) { /* ignore */ }
                    }
                    return "ERROR: " + e.toString();
                } finally {
                    // Final safety net for undo group closure
                    if (undoGroupActive) {
                        try { app.endUndoGroup(); } catch(finalError) { /* ignore */ }
                    }
                }
            })();
        `;
        
        evalInAE(wrappedScript, (result) => {
            console.log('Script execution result:', result);
            
            // Use enhanced result parsing for better feedback
            if (result.success) {
                this.showToast('✅ ' + result.data);
            } else {
                this.showToast('❌ ' + result.error);
                // Show detailed error in chat for debugging
                this.addMessage(`❌ **Script Execution Failed:**\n${result.error}\n\n*Script:*\n\`\`\`javascript\n${rawCode.substring(0, 200)}${rawCode.length > 200 ? '...' : ''}\n\`\`\``, 'assistant');
            }
        });
    }
    
    // ===== PANEL PACKAGING INTERFACE =====
    
    async packagePanel(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (!codeBlock) {
            this.showToast('❌ Code block not found');
            return;
        }
        
        const code = codeBlock.textContent;
        
        // Smart panel name extraction
        let panelName = 'AI_Panel';
        
        // Try to extract panel name from code
        const nameMatches = [
            code.match(/<title>(.*?)<\/title>/i),
            code.match(/ExtensionBundleName="([^"]+)"/),
            code.match(/Menu>([^<]+)</),
            code.match(/panel[_\s]*name[:\s]*["']([^"']+)/i)
        ];
        
        for (const match of nameMatches) {
            if (match && match[1] && match[1].trim()) {
                panelName = match[1].trim();
                break;
            }
        }
        
        // Use custom modal instead of native prompt
        const userPanelName = await window.modalUtils.prompt(
            '📦 Package Panel',
            `Detected panel name: "${panelName}"\n\nEnter the final panel name:`,
            panelName,
            'My Custom Panel'
        );
        
        if (!userPanelName) return; // User cancelled
        
        const finalPanelName = userPanelName.trim() || panelName;
        
        try {
            // Generate complete panel structure
            const files = await this.generateDockablePanelScaffold(finalPanelName, {
                displayName: finalPanelName,
                description: 'AI Generated CEP Panel',
                customCode: code
            });
            
            // Package to extensions folder
            await this.packageToExtensionsFolder(files, finalPanelName);
            
        } catch (error) {
            console.error('Panel packaging error:', error);
            this.showToast('❌ Panel packaging failed: ' + error.message);
        }
    }
    
    // ===== EFFECT & PRESET APPLICATION =====
    
    async applyEffect(effectName) {
        if (!inAE()) {
            this.showToast('❌ Not running inside After Effects');
            return;
        }
        
        if (!effectName) {
            this.showToast('❌ No effect name provided');
            return;
        }
        
        const jsx = `(function(){
            var __msg = "UNKNOWN";
            try {
                if (!app.project) { __msg = "ERROR: No project open"; return __msg; }
                var comp = app.project.activeItem;
                if (!(comp && (comp instanceof CompItem))) { __msg = "ERROR: No active comp"; return __msg; }
                if (!(comp.selectedLayers && comp.selectedLayers.length)) { __msg = "ERROR: No layers selected"; return __msg; }

                app.beginUndoGroup("Apply Effect (AI Chat)");
                var count = 0;
                for (var i=0; i<comp.selectedLayers.length; i++) {
                    try {
                        var fx = comp.selectedLayers[i].property("ADBE Effect Parade").addProperty("${effectName}");
                        if (fx) count++;
                    } catch(e) {
                        // Effect name might be invalid, continue with others
                    }
                }
                __msg = count > 0 ? ("SUCCESS: Applied '" + "${effectName}" + "' to " + count + " layer(s)") : ("ERROR: Could not apply effect '" + "${effectName}" + "' - check name");
                return __msg;
            } catch(e) {
                return "ERROR: " + e.toString();
            } finally {
                try { app.endUndoGroup(); } catch(_) {}
            }
        })();`;
        
        return new Promise((resolve) => evalInAE(jsx, (result) => {
            if (result && result.includes('SUCCESS')) {
                this.showToast('✅ ' + result.replace('SUCCESS: ', ''));
            } else {
                this.showToast('❌ ' + (result || 'Effect application failed'));
            }
            resolve(result);
        }));
    }
    
    async applyPreset(presetPath) {
        if (!inAE()) {
            this.showToast('❌ Not running inside After Effects');
            return;
        }
        
        const jsx = `(function(){
            var __msg = "UNKNOWN";
            try {
                if (!app.project) { __msg = "ERROR: No project open"; return __msg; }
                var comp = app.project.activeItem;
                if (!(comp && (comp instanceof CompItem))) { __msg = "ERROR: No active comp"; return __msg; }
                if (!(comp.selectedLayers && comp.selectedLayers.length)) { __msg = "ERROR: No layers selected"; return __msg; }

                app.beginUndoGroup("Apply Preset (AI Chat)");
                // AE does not apply a specific path silently without extra automation.
                // As a placeholder, open the Apply Preset dialog:
                app.executeCommand(app.findMenuCommandId("Apply Preset..."));
                __msg = "SUCCESS: Opened 'Apply Preset...' dialog. Select: ${presetPath || "(choose file)"}";
                return __msg;
            } catch(e) {
                return "ERROR: " + e.toString();
            } finally {
                try { app.endUndoGroup(); } catch(_) {}
            }
        })();`;
        
        return new Promise((resolve) => evalInAE(jsx, (result) => {
            this.showToast(result || 'Preset dialog opened');
            resolve(result);
        }));
    }
    
    // ===== PANEL GENERATION SYSTEM =====
    
    async generateDockablePanelScaffold(panelName, specs = {}) {
        const sanitizedName = panelName.replace(/[^a-zA-Z0-9_]/g, '_');
        const displayName = specs.displayName || panelName;
        const description = specs.description || 'AI Generated Panel';
        
        const files = {
            'manifest.xml': `<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest Version="7.0" ExtensionBundleId="${sanitizedName}" ExtensionBundleVersion="1.0.0" 
                 ExtensionBundleName="${displayName}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ExtensionList>
    <Extension Id="${sanitizedName}" Version="1.0.0" />
  </ExtensionList>
  <ExecutionEnvironment>
    <HostList>
      <Host Name="AEFT" Version="[0.0,99.9]" />
    </HostList>
    <LocaleList>
      <Locale Code="All" />
    </LocaleList>
    <RequiredRuntimeList>
      <RequiredRuntime Name="CSXS" Version="11.0" />
    </RequiredRuntimeList>
  </ExecutionEnvironment>
  <DispatchInfoList>
    <Extension Id="${sanitizedName}">
      <DispatchInfo>
        <Resources>
          <MainPath>./index.html</MainPath>
          <CEFCommandLine>
            <Parameter>--enable-nodejs</Parameter>
            <Parameter>--mixed-context</Parameter>
          </CEFCommandLine>
        </Resources>
        <Lifecycle>
          <AutoVisible>true</AutoVisible>
        </Lifecycle>
        <UI>
          <Type>Panel</Type>
          <Menu>${displayName}</Menu>
          <Geometry>
            <Size>
              <Height>400</Height>
              <Width>300</Width>
            </Size>
          </Geometry>
        </UI>
      </DispatchInfo>
    </Extension>
  </DispatchInfoList>
</ExtensionManifest>`,

            'index.html': `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${displayName}</title>
    <style>
        body { 
            font-family: system-ui; 
            margin: 0; 
            padding: 16px; 
            background: #2d2d30; 
            color: #cccccc; 
        }
        .panel-container { 
            display: flex; 
            flex-direction: column; 
            gap: 12px; 
        }
        .btn { 
            padding: 8px 16px; 
            background: #0e639c; 
            border: none; 
            border-radius: 4px; 
            color: white; 
            cursor: pointer; 
        }
        .btn:hover { background: #1177bb; }
        input, textarea { 
            padding: 8px; 
            background: #1e1e1e; 
            border: 1px solid #3c3c3c; 
            border-radius: 4px; 
            color: #cccccc; 
        }
    </style>
</head>
<body>
    <div class="panel-container">
        <h2>${displayName}</h2>
        <p>${description}</p>
        ${specs.controls ? this.generatePanelControls(specs.controls) : `
        <button class="btn" onclick="executeAction()">Sample Action</button>
        <input type="text" id="textInput" placeholder="Enter text..." />
        <button class="btn" onclick="processText()">Process</button>
        `}
    </div>
    <script src="panel.js"></script>
</body>
</html>`,

            'panel.js': `// ${displayName} Panel JavaScript
console.log('${displayName} panel loaded');

// Execute sample action
function executeAction() {
    if (window.__adobe_cep__) {
        const script = \`
            app.beginUndoGroup("${displayName} Action");
            try {
                // Add your After Effects script here
                alert("Hello from ${displayName}!");
                app.endUndoGroup();
                "SUCCESS: Action completed";
            } catch(e) {
                app.endUndoGroup();
                "ERROR: " + e.toString();
            }
        \`;
        
        window.__adobe_cep__.evalScript(script, (result) => {
            console.log('Action result:', result);
        });
    }
}

// Process text input
function processText() {
    const text = document.getElementById('textInput').value;
    if (!text) return;
    
    if (window.__adobe_cep__) {
        const script = \`
            app.beginUndoGroup("Process Text");
            try {
                var comp = app.project.activeItem;
                if (comp && comp instanceof CompItem) {
                    var textLayer = comp.layers.addText("\${text}");
                    textLayer.transform.position.setValue([comp.width/2, comp.height/2]);
                }
                app.endUndoGroup();
                "SUCCESS: Text layer created";
            } catch(e) {
                app.endUndoGroup();
                "ERROR: " + e.toString();
            }
        \`;
        
        window.__adobe_cep__.evalScript(script, (result) => {
            console.log('Text process result:', result);
        });
    }
}`
        };
        
        return files;
    }
    
    generatePanelControls(controls) {
        return controls.map(control => {
            switch(control.type) {
                case 'button':
                    return `<button class="btn" onclick="${control.action || 'console.log(\'button clicked\')'}">${control.label}</button>`;
                case 'input':
                    return `<input type="text" id="${control.id}" placeholder="${control.placeholder || ''}" />`;
                case 'textarea':
                    return `<textarea id="${control.id}" placeholder="${control.placeholder || ''}" rows="4"></textarea>`;
                default:
                    return `<div>${control.label || 'Unknown control'}</div>`;
            }
        }).join('\n        ');
    }
    
    async packageToExtensionsFolder(files, panelName) {
        const sanitizedName = panelName.replace(/[^a-zA-Z0-9_]/g, '_');
        
        if (!window.__adobe_cep__) {
            this.showToast('❌ CEP not available for file operations');
            return;
        }
        
        // Use CEP evalScript to write files via ExtendScript
        const writeScript = `
            (function() {
                try {
                    var extensionsFolder = Folder(Folder.appData + "/Adobe/CEP/extensions");
                    if (!extensionsFolder.exists) {
                        extensionsFolder.create();
                    }
                    
                    var panelFolder = Folder(extensionsFolder.fsName + "/${sanitizedName}");
                    if (panelFolder.exists) {
                        // Remove existing
                        panelFolder.remove();
                    }
                    panelFolder.create();
                    
                    var filesWritten = 0;
                    var fileData = ${JSON.stringify(files)};
                    
                    for (var filename in fileData) {
                        var file = File(panelFolder.fsName + "/" + filename);
                        if (file.open("w")) {
                            file.write(fileData[filename]);
                            file.close();
                            filesWritten++;
                        }
                    }
                    
                    return "SUCCESS: Packaged " + filesWritten + " files to CEP extensions folder. Restart After Effects to see the panel.";
                } catch(e) {
                    return "ERROR: " + e.toString();
                }
            })();
        `;
        
        evalInAE(writeScript, (result) => {
            // Use enhanced error handling for panel packaging
            if (result.success) {
                this.showToast('✅ ' + result.data);
                this.addMessage(`🎉 **Panel Packaged Successfully!**

**Next Steps:**
1. **Restart After Effects** 
2. **Open Panel**: Window > Extensions > ${userPanelName}
3. **Customize**: Edit files in CEP extensions folder if needed

**Panel Location**: Adobe CEP Extensions folder

*${result.data}*`, 'assistant');
            } else {
                this.showToast('❌ ' + result.error);
                this.addMessage(`❌ **Panel Packaging Failed:**\n${result.error}\n\n*Details:* ${result.details}`, 'assistant');
            }
        });
    }
    
    // ===== TOAST NOTIFICATIONS =====
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }
    
    // ===== MESSAGE SENDING WITH INTELLIGENCE =====
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY') {
            this.addMessage('❌ Please configure your API key first using the Settings button.', 'assistant');
            return;
        }
        
        // Clear input and add user message
        this.messageInput.value = '';
        this.addMessage(message, 'user');
        
        try {
            // Phase 1: Intent Classification
            const intent = this.classifyIntent(message);
            console.log('Intent Classification:', intent);
            
            // Phase 2: Context Gathering  
            const context = await this.getAEContext();
            console.log('AE Context:', context);
            
            // Phase 3: Enhanced Prompt Building
            const enhancedPrompt = this.buildEnhancedPrompt(message, intent, context);
            
            // Phase 4: API Call with Context
            const response = await this.callGeminiAPI(enhancedPrompt);
            
            // Phase 5: Context-Enhanced Response Formatting
            const finalResponse = this.formatResponseWithContext(response, intent, context);
            
            this.addMessage(finalResponse, 'assistant', {
                intent: intent,
                context: context,
                originalMessage: message
            });
            
        } catch (error) {
            console.error('Error:', error);
            this.addMessage(`❌ Error: ${error.message}`, 'assistant');
        }
    }
    
    formatResponseWithContext(response, intent, context) {
        // Add helpful context information to responses when relevant
        let contextInfo = '';
        
        // Add context indicators for expressions
        if (intent.primary === 'EXPRESSION' && context && context.selectedProperties) {
            const expressionReady = context.selectedProperties.filter(p => p.canSetExpression).length;
            if (expressionReady > 0) {
                contextInfo = `<div class="context-info">💡 <strong>Ready to apply:</strong> ${expressionReady} selected properties can use expressions</div>\n\n`;
            } else if (context.selectedProperties.length > 0) {
                contextInfo = `<div class="context-info">⚠️ <strong>Note:</strong> Selected properties may not support expressions. Try selecting Position, Scale, Rotation, or Opacity.</div>\n\n`;
            } else {
                contextInfo = `<div class="context-info">👆 <strong>Tip:</strong> Select a property in the Timeline first, then use the Apply button for instant application</div>\n\n`;
            }
        }
        
        // Add context for scripts
        if (intent.primary === 'SCRIPT' && context && context.project) {
            if (context.project.activeItem) {
                contextInfo = `<div class="context-info">🎬 <strong>Active:</strong> "${context.project.activeItem.name}" composition ready for script execution</div>\n\n`;
            } else {
                contextInfo = `<div class="context-info">📝 <strong>Note:</strong> Create or open a composition for scripts that need active comp access</div>\n\n`;
            }
        }
        
        return contextInfo + response;
    }
    
    // ===== GEMINI API INTEGRATION =====
    
    async callGeminiAPI(enhancedMessage) {
        const baseUrl = window.CONFIG?.API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        const url = `${baseUrl}?key=${this.apiKey}`;
        
        // Use the pre-built enhanced message (includes context and intent-specific prompting)
        const body = {
            contents: [{
                parts: [{ text: enhancedMessage }]
            }]
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    }
    
    // ===== UTILITY METHODS =====
    
    reloadConfig() {
        console.log('Reloading config...');
        this.apiKey = this.getAPIKey();
        console.log('New API Key:', this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'none');
    }
    
    addTestConfigButton() {
        const settingsBtn = document.querySelector('.settings-btn');
        if (!settingsBtn) return;
        
        // Add test button for config debugging
        if (!document.querySelector('.test-config-btn')) {
            const testBtn = document.createElement('button');
            testBtn.className = 'test-config-btn';
            testBtn.textContent = 'Test Config';
            testBtn.className = 'btn';
            testBtn.style.marginLeft = '8px';
            testBtn.onclick = () => {
                console.log('=== CONFIG DEBUG ===');
                console.log('CONFIG:', window.CONFIG);
                console.log('Chat object:', window.chat);
                console.log('API Key:', this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'none');
                alert(`Config Debug:\nAPI Key: ${this.apiKey ? '✅ Set' : '❌ Missing'}\nCheck console for details`);
            };
            settingsBtn.parentNode.appendChild(testBtn);
        }
    }
}

// Initialize when page loads and expose to global scope
document.addEventListener('DOMContentLoaded', () => {
    window.chat = new SimpleAIChat({
        chatSel: "#chatMessages", 
        inputSel: "#messageInput", 
        sendSel: "#sendBtn"
    });
});
