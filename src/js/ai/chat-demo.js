// AI Assistant for After Effects (Enhanced with intelligent capabilities)
class AIAssistant {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        
        this.selectedLayers = [];
        this.projectContext = {};
        this.projectFiles = [];
        this.selectedEffects = [];
        
        this.csInterface = null;
        this.mascotAnimator = null;

        this.commandMap = this.getCommandMap();
        
        window.chatDemo = this; // Maintain compatibility - expose as singleton
        window.aiAssistant = this; // New reference name
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showWelcomeMessage();
        this.initializeCSInterface();
        this.initializeMascot();
        this.initializeVoiceFeatures();
        
        // Update context every 1 minute (60 seconds) to avoid performance issues
        setInterval(() => this.updateProjectContext(), 60000);
        
        // Add manual refresh capability
        this.lastContextUpdate = 0;
    }

    //================================================================================
    // INITIALIZATION
    //================================================================================

    initializeCSInterface() {
        try {
            if (window.CSInterface) {
                this.csInterface = new CSInterface();
                console.log('✅ CSInterface initialized successfully');
                this.addMessage('system', '🔗 Connected to After Effects', false);
                this.updateProjectContext(); // Initial fetch
            } else {
                console.log('❌ CSInterface not available');
                this.addMessage('system', '⚠️ CSInterface not available - some features may be limited', false);
            }
        } catch (error) {
            console.error('Failed to initialize CSInterface:', error);
            this.addMessage('system', '❌ Failed to connect to After Effects', false);
        }
    }

    initializeMascot() {
        try {
            if (typeof MascotAnimator !== 'undefined') {
                this.mascotAnimator = new MascotAnimator();
                this.setMascotScenario('idle');
            } else {
                 console.warn('MascotAnimator class not found. Ensure mascot-animator.js is loaded.');
            }
        } catch (error) {
            console.log('Could not initialize mascot:', error);
        }
    }

    initializeVoiceFeatures() {
        try {
            if (typeof VoiceFeatureManager !== 'undefined') {
                this.voiceManager = new VoiceFeatureManager();
                console.log('✅ Voice features initialized successfully');
            } else {
                console.warn('VoiceFeatureManager class not found. Voice features disabled.');
            }
        } catch (error) {
            console.error('Failed to initialize voice features:', error);
        }
    }

    // Force immediate context update when needed
    forceContextUpdate() {
        this.updateProjectContext();
        this.lastContextUpdate = Date.now();
    }

    // Check if context needs refresh (if it's been more than 30 seconds since last update)
    ensureFreshContext() {
        const now = Date.now();
        if (now - this.lastContextUpdate > 30000) { // 30 seconds
            this.forceContextUpdate();
        }
    }

    //================================================================================
    // COMMAND PROCESSING
    //================================================================================

    getCommandMap() {
        return [
            // Layer Information & Management
            { 
                patterns: ['how many.*layer', 'layer.*count', 'selected.*layer', 'layers.*selected'],
                handler: this.handleLayerCountQuery, 
                requiresLayer: false,
                description: 'Count selected layers'
            },
            { 
                patterns: ['layer.*properties', 'properties.*layer', 'layer.*info', 'info.*layer'],
                handler: this.generateLayerPropertiesResponse, 
                requiresLayer: true,
                description: 'Show layer properties'
            },
            
            // Animation Expressions
            { 
                patterns: ['wiggle.*position', 'position.*wiggle', 'wiggle.*movement', 'shake.*position'],
                handler: this.generatePositionResponse, 
                requiresLayer: true,
                description: 'Add wiggle animation to position'
            },
            { 
                patterns: ['ping.*pong', 'loop.*ping', 'back.*forth', 'reverse.*loop'],
                handler: this.generatePingPongResponse, 
                requiresLayer: true,
                description: 'Create ping-pong loop animation'
            },
            { 
                patterns: ['bounce', 'physics.*bounce', 'realistic.*bounce', 'bounce.*physics'],
                handler: this.generateBounceResponse, 
                requiresLayer: true,
                description: 'Add physics-based bounce animation'
            },
            
            // Data Export & Analysis
            { 
                patterns: ['export.*keyframe', 'keyframe.*export', 'keyframe.*data', 'animation.*data'],
                handler: this.handleKeyframeExport, 
                requiresLayer: true,
                description: 'Export keyframe data as text'
            },
            { 
                patterns: ['project.*file', 'file.*project', 'footage.*list', 'assets.*list', 'imported.*files'],
                handler: this.generateProjectFilesResponse, 
                requiresLayer: false,
                description: 'List project files and assets'
            },
            { 
                patterns: ['effects.*list', 'list.*effects', 'applied.*effects', 'effects.*applied'],
                handler: this.generateEffectsResponse, 
                requiresLayer: true,
                description: 'Show effects on selected layers'
            },
            
            // Layer Creation & Management
            { 
                patterns: ['create.*layer', 'new.*layer', 'add.*layer', 'make.*layer'],
                handler: this.generateCreateLayerScript, 
                requiresLayer: false,
                description: 'Create a new layer'
            },
            { 
                patterns: ['organize.*file', 'arrange.*file', 'file.*organization', 'clean.*project'],
                handler: this.generateFileOrganizationResponse, 
                requiresLayer: false,
                description: 'Organize project files'
            },
            
            // System & Utility
            { 
                patterns: ['refresh.*context', 'update.*context', 'refresh.*project', 'sync.*project'],
                handler: this.handleContextRefresh, 
                requiresLayer: false,
                description: 'Refresh project context'
            }
        ];
    }

    generateAIResponse(userMessage) {
        // Ensure we have fresh context for any request
        this.ensureFreshContext();
        
        const lowerMessage = userMessage.toLowerCase();
        
        // Try to match patterns using regex for more flexible matching
        for (const command of this.commandMap) {
            for (const pattern of command.patterns) {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(lowerMessage)) {
                    if (command.requiresLayer && this.selectedLayers.length === 0) {
                        // Generate fallback script instead of just asking for layer selection
                        this.generateFallbackScript(command, userMessage, lowerMessage);
                        return;
                    }
                    command.handler.call(this, userMessage);
                    return;
                }
            }
        }

        // If no specific command matches, try to provide intelligent responses based on content
        this.handleGeneralQuery(userMessage, lowerMessage);
    }

    // Handle general queries that don't match specific patterns
    handleGeneralQuery(userMessage, lowerMessage) {
        // Context-aware responses based on current project state
        if (lowerMessage.includes('help') || lowerMessage.includes('what can') || lowerMessage.includes('capabilities')) {
            this.showCapabilities();
            return;
        }
        
        if (lowerMessage.includes('expression') || lowerMessage.includes('animate')) {
            this.suggestAnimationOptions();
            return;
        }
        
        if (lowerMessage.includes('script') || lowerMessage.includes('automate')) {
            this.suggestScriptingOptions();
            return;
        }
        
        if (lowerMessage.includes('layer') && this.selectedLayers.length === 0) {
            this.addMessage('assistant', 'I see you\'re asking about layers, but no layers are currently selected. Select some layers first, then ask me again!', false);
            return;
        }
        
        // Default intelligent response
        this.addMessage('assistant', 
            `I understand you want to "${userMessage}". I can help with:\n\n` +
            `🎬 **Layer operations** - Select layers and ask about properties, effects, or animations\n` +
            `📊 **Data export** - Export keyframes, analyze project files\n` +
            `🎯 **Expressions** - Add wiggle, bounce, loops, and custom animations\n` +
            `🛠️ **Scripts** - Create layers, organize files, automate tasks\n\n` +
            `Try being more specific, like: "add wiggle to position" or "show layer properties"`, false);
        this.setMascotScenario('idle');
    }

    generateFallbackScript(command, userMessage, lowerMessage) {
        let scriptCode = '';
        let scriptDescription = '';
        
        // Determine what script to generate based on the command
        if (command.patterns.some(pattern => /scale|resize|size/i.test(pattern))) {
            scriptCode = `// Layer Scaling Script
// Instructions: First select the layer(s) you want to scale, then run this script

var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length > 0) {
        app.beginUndoGroup("Scale Layers");
        
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var scaleValue = [50, 50]; // Change this to desired scale percentage
            layer.property("ADBE Transform Group").property("ADBE Scale").setValue(scaleValue);
        }
        
        app.endUndoGroup();
        alert("Scaled " + selectedLayers.length + " layer(s) to 50%");
    } else {
        alert("Please select at least one layer first");
    }
} else {
    alert("Please open a composition first");
}`;
            scriptDescription = "This script will scale the selected layers. Modify the `scaleValue` array to change the scale percentage.";
            
        } else if (command.patterns.some(pattern => /position|move|place/i.test(pattern))) {
            scriptCode = `// Layer Position Script
// Instructions: First select the layer(s) you want to move, then run this script

var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length > 0) {
        app.beginUndoGroup("Move Layers");
        
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var newPosition = [comp.width/2, comp.height/2]; // Center position
            layer.property("ADBE Transform Group").property("ADBE Position").setValue(newPosition);
        }
        
        app.endUndoGroup();
        alert("Moved " + selectedLayers.length + " layer(s) to center");
    } else {
        alert("Please select at least one layer first");
    }
} else {
    alert("Please open a composition first");
}`;
            scriptDescription = "This script will move the selected layers. Modify the `newPosition` array to change the target position.";
            
        } else if (command.patterns.some(pattern => /rotate|rotation|spin/i.test(pattern))) {
            scriptCode = `// Layer Rotation Script
// Instructions: First select the layer(s) you want to rotate, then run this script

var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length > 0) {
        app.beginUndoGroup("Rotate Layers");
        
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var rotationValue = 45; // Change this to desired rotation in degrees
            layer.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(rotationValue);
        }
        
        app.endUndoGroup();
        alert("Rotated " + selectedLayers.length + " layer(s) by 45 degrees");
    } else {
        alert("Please select at least one layer first");
    }
} else {
    alert("Please open a composition first");
}`;
            scriptDescription = "This script will rotate the selected layers. Modify the `rotationValue` to change the rotation angle.";
            
        } else if (command.patterns.some(pattern => /opacity|fade|transparency/i.test(pattern))) {
            scriptCode = `// Layer Opacity Script
// Instructions: First select the layer(s) you want to modify, then run this script

var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length > 0) {
        app.beginUndoGroup("Change Opacity");
        
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var opacityValue = 50; // Change this to desired opacity percentage
            layer.property("ADBE Transform Group").property("ADBE Opacity").setValue(opacityValue);
        }
        
        app.endUndoGroup();
        alert("Set opacity of " + selectedLayers.length + " layer(s) to 50%");
    } else {
        alert("Please select at least one layer first");
    }
} else {
    alert("Please open a composition first");
}`;
            scriptDescription = "This script will change the opacity of selected layers. Modify the `opacityValue` to change the opacity percentage.";
            
        } else {
            // Generic layer manipulation script
            scriptCode = `// Generic Layer Script
// Instructions: First select the layer(s) you want to modify, then run this script

var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length > 0) {
        app.beginUndoGroup("Layer Modification");
        
        // Add your layer manipulation code here
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            // Example: layer.property("ADBE Transform Group").property("ADBE Scale").setValue([120, 120]);
        }
        
        app.endUndoGroup();
        alert("Modified " + selectedLayers.length + " layer(s)");
    } else {
        alert("Please select at least one layer first");
    }
} else {
    alert("Please open a composition first");
}`;
            scriptDescription = "This is a generic layer manipulation script. Add your specific modifications inside the loop.";
        }
        
        this.addMessage('assistant', 
            `I can't access your layers directly right now, but I've generated a script for you!

**Steps to use:**
1. First, select the layer(s) you want to modify in After Effects
2. Click the "Apply Script" button below to run the generated script
3. The script will perform the requested action on your selected layers

${scriptDescription}`, 
            false
        );
        
        this.addCodeBlock(scriptCode, 'javascript', {
            showCopyButton: true,
            showApplyButton: true,
            title: 'Generated Layer Script',
            description: 'Select your layers first, then click Apply Script'
        });
        
        this.setMascotScenario('solution');
    }

    //================================================================================
    // COMMAND HANDLERS
    //================================================================================

    handleLayerCountQuery() {
        if (this.selectedLayers.length > 0) {
            let response = `📊 **Layer Selection Analysis**\n\n`;
            response += `You have **${this.selectedLayers.length} layer${this.selectedLayers.length > 1 ? 's' : ''}** selected.\n\n`;
            
            if (this.selectedLayers.length === 1) {
                response += `🎯 **Perfect for:**\n• Applying expressions or effects\n• Adjusting transform properties\n• Adding animations\n\n`;
                response += `💡 Try asking: "add wiggle to position" or "show layer properties"`;
            } else if (this.selectedLayers.length <= 5) {
                response += `🎯 **Great for:**\n• Batch operations\n• Synchronized animations\n• Multi-layer effects\n\n`;
                response += `💡 Try asking: "animate all layers" or "apply effect to selection"`;
            } else {
                response += `🎯 **Bulk Operations:**\n• Perfect for large-scale changes\n• Batch transformations\n• Project organization\n\n`;
                response += `💡 Try asking: "organize layers" or "batch rename layers"`;
            }
            
            this.addMessage('assistant', response, false);
            this.setMascotScenario('solution');
        } else {
            this.addMessage('assistant', 
                `📋 **No Layers Selected**\n\n` +
                `Select some layers first, then I can help you with:\n\n` +
                `🎬 **Animations** - Wiggle, bounce, ping-pong loops\n` +
                `🎨 **Effects** - Blur, glow, color correction\n` +
                `📐 **Transforms** - Scale, position, rotation\n` +
                `📊 **Analysis** - Properties, keyframes, project data\n\n` +
                `💡 *Select layers in After Effects, then ask me what you want to do!*`,
                false
            );
            this.setMascotScenario('idle');
        }
    }

    handleContextRefresh() {
        this.forceContextUpdate();
        this.addMessage('assistant', '🔄 Project context refreshed! I now have the latest information about your layers, effects, and project files.', false);
        this.setMascotScenario('success');
    }

    showCapabilities() {
        let capabilities = `🤖 **AI Assistant Capabilities**\n\n`;
        
        // Dynamic capabilities based on current context
        if (this.selectedLayers.length > 0) {
            capabilities += `🎯 **Ready for layer operations** (${this.selectedLayers.length} layer${this.selectedLayers.length > 1 ? 's' : ''} selected)\n\n`;
        }
        
        capabilities += `**🎬 Layer Management:**\n` +
            `• Smart layer analysis and property inspection\n` +
            `• Intelligent layer creation with animations\n` +
            `• Batch operations on multiple layers\n` +
            `• Advanced transform controls\n\n` +
            
            `**📊 Data & Analysis:**\n` +
            `• Detailed keyframe data export\n` +
            `• Comprehensive project file analysis\n` +
            `• Effect performance monitoring\n` +
            `• Project organization insights\n\n` +
            
            `**🎯 Animation Expressions:**\n` +
            `• Dynamic wiggle animations (customizable)\n` +
            `• Physics-based bounce effects\n` +
            `• Ping-pong loop animations\n` +
            `• Advanced custom expression generation\n\n` +
            
            `**🛠️ Automation & Scripts:**\n` +
            `• Intelligent project organization\n` +
            `• Smart batch operations\n` +
            `• Custom script generation with fallbacks\n` +
            `• Performance-optimized automation\n\n` +
            
            `**🚀 Smart Features:**\n` +
            `• Context-aware responses\n` +
            `• Fallback script generation when direct access fails\n` +
            `• Performance monitoring (60-second update cycles)\n` +
            `• Natural language command processing\n\n`;
            
        if (this.selectedLayers.length > 0) {
            capabilities += `💡 **Try asking:** "add wiggle to position", "show layer properties", "export keyframes"\n\n`;
        } else {
            capabilities += `💡 **Get started:** Select some layers, then ask me what you want to do!\n\n`;
        }
        
        capabilities += `*Just describe what you want to do in natural language - I'll understand and help!*`;
            
        this.addMessage('assistant', capabilities, false);
        this.setMascotScenario('success');
    }

    suggestAnimationOptions() {
        const options = `🎬 **Animation Options Available:**\n\n` +
            `**Position Animations:**\n` +
            `• "add wiggle to position" - Random movement\n` +
            `• "create bounce animation" - Physics-based bounce\n` +
            `• "make ping-pong loop" - Back and forth motion\n\n` +
            `**Advanced Expressions:**\n` +
            `• Custom easing curves\n` +
            `• Time-based animations\n` +
            `• Property linking\n\n` +
            `*Select a layer first, then tell me what kind of animation you want!*`;
            
        this.addMessage('assistant', options, false);
        this.setMascotScenario('idle');
    }

    suggestScriptingOptions() {
        const options = `🛠️ **Scripting & Automation Options:**\n\n` +
            `**Layer Operations:**\n` +
            `• "create new layer" - Generate animated layers\n` +
            `• "organize layers" - Sort and arrange\n` +
            `• "duplicate selected layers" - Batch duplication\n\n` +
            `**Project Tools:**\n` +
            `• "organize project files" - Clean up assets\n` +
            `• "export project data" - Extract information\n` +
            `• "batch rename layers" - Mass renaming\n\n` +
            `*Describe the task you want to automate!*`;
            
        this.addMessage('assistant', options, false);
        this.setMascotScenario('idle');
    }

    generatePingPongResponse() {
        const expression = `loopOut("pingpong")`;
        
        this.addMessage('assistant', 
            '✅ **Ping-Pong Loop Animation**\n\nThis expression makes your animation play forward, then backward, then forward again in a continuous loop. Perfect for pendulum-like movements!',
            false
        );
        
        this.addCodeBlock(expression, 'javascript', {
            showCopyButton: true,
            showApplyButton: true,
            title: 'Ping-Pong Loop Expression',
            description: 'Apply this to any animated property for back-and-forth looping'
        });
        
        this.setMascotScenario('success');
    }

    generatePositionResponse() {
        const expression = `wiggle(5, 50)`;
        
        this.addMessage('assistant', 
            '✅ **Position Wiggle Animation**\n\nThis expression adds random movement to position. The first number (5) controls speed, the second (50) controls distance.',
            false
        );
        
        this.addCodeBlock(expression, 'javascript', {
            showCopyButton: true,
            showApplyButton: true,
            title: 'Position Wiggle Expression',
            description: 'Adds random movement to layer position'
        });
        
        this.setMascotScenario('success');
    }

    generateBounceResponse() {
        const expression = `n = 0;
if (numKeys > 0){ 
    n = nearestKey(time).index; 
    if (key(n).time > time){ n--; } 
}
if (n == 0){ 
    t = 0; 
} else { 
    t = time - key(n).time; 
}
if (n > 0 && t < 1){ 
    v = velocityAtTime(key(n).time - thisComp.frameDuration/10); 
    amp = .05; 
    freq = 3.0; 
    decay = 8.0; 
    bounce = amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t); 
    value + bounce*v; 
} else { 
    value; 
}`;
        
        this.addMessage('assistant', 
            '✅ **Physics-Based Bounce Animation**\n\nThis advanced expression creates realistic bounce effects after keyframes. Adjust `amp` for bounce intensity, `freq` for bounce speed, and `decay` for how quickly it settles.',
            false
        );
        
        this.addCodeBlock(expression, 'javascript', {
            showCopyButton: true,
            showApplyButton: true,
            title: 'Bounce Physics Expression',
            description: 'Creates realistic bounce animation after keyframes'
        });
        
        this.setMascotScenario('success');
    }

    generateProjectFilesResponse() {
        if (!this.projectFiles || this.projectFiles.length === 0) {
            this.addMessage('assistant', 
                `📁 **No Project Files Detected**\n\n` +
                `🎯 **To get started:**\n` +
                `• Import footage via File > Import\n` +
                `• Drag files into the Project panel\n` +
                `• Use File > Import > Multiple Files for bulk import\n\n` +
                `🔄 After importing, ask me to refresh context and I'll analyze your project!`,
                false
            );
            this.setMascotScenario('idle');
            return;
        }
        
        let response = `📁 **Project Files Analysis** (${this.projectFiles.length} total)\n\n`;
        
        // Categorize files
        let categories = {
            video: [],
            audio: [],
            images: [],
            comps: [],
            other: []
        };
        
        this.projectFiles.forEach(file => {
            if (file.type) {
                switch (file.type.toLowerCase()) {
                    case 'footage':
                        if (file.name.match(/\.(mp4|mov|avi|mkv|m4v|wmv|flv)$/i)) {
                            categories.video.push(file);
                        } else if (file.name.match(/\.(mp3|wav|aac|m4a|flac|ogg)$/i)) {
                            categories.audio.push(file);
                        } else if (file.name.match(/\.(jpg|jpeg|png|gif|bmp|tiff|psd|ai|svg)$/i)) {
                            categories.images.push(file);
                        } else {
                            categories.other.push(file);
                        }
                        break;
                    case 'composition':
                        categories.comps.push(file);
                        break;
                    default:
                        categories.other.push(file);
                }
            } else {
                categories.other.push(file);
            }
        });
        
        // Build categorized response
        if (categories.video.length > 0) {
            response += `🎬 **Video Files (${categories.video.length})**\n`;
            categories.video.slice(0, 5).forEach(file => response += `• ${file.name}\n`);
            if (categories.video.length > 5) response += `...and ${categories.video.length - 5} more\n`;
            response += '\n';
        }
        
        if (categories.images.length > 0) {
            response += `🖼️ **Images (${categories.images.length})**\n`;
            categories.images.slice(0, 5).forEach(file => response += `• ${file.name}\n`);
            if (categories.images.length > 5) response += `...and ${categories.images.length - 5} more\n`;
            response += '\n';
        }
        
        if (categories.audio.length > 0) {
            response += `🎵 **Audio Files (${categories.audio.length})**\n`;
            categories.audio.slice(0, 5).forEach(file => response += `• ${file.name}\n`);
            if (categories.audio.length > 5) response += `...and ${categories.audio.length - 5} more\n`;
            response += '\n';
        }
        
        if (categories.comps.length > 0) {
            response += `🎯 **Compositions (${categories.comps.length})**\n`;
            categories.comps.slice(0, 5).forEach(file => response += `• ${file.name}\n`);
            if (categories.comps.length > 5) response += `...and ${categories.comps.length - 5} more\n`;
            response += '\n';
        }
        
        if (categories.other.length > 0) {
            response += `📄 **Other Files (${categories.other.length})**\n`;
            categories.other.slice(0, 3).forEach(file => response += `• ${file.name}\n`);
            if (categories.other.length > 3) response += `...and ${categories.other.length - 3} more\n`;
            response += '\n';
        }
        
        response += `💡 **Quick Actions:**\n`;
        response += `• Ask "organize project files" to sort everything\n`;
        response += `• Try "create new layer" to start animating\n`;
        response += `• Say "help" to see all capabilities`;
        
        this.addMessage('assistant', response, false);
        this.setMascotScenario('solution');
    }

    generateEffectsResponse() {
        if (this.selectedLayers.length === 0) {
            this.addMessage('assistant', 
                `✨ **No Layers Selected**\n\n` +
                `Select some layers first to analyze their effects!\n\n` +
                `🎯 **After selecting layers, I can show you:**\n` +
                `• All applied effects and their properties\n` +
                `• Effect categories and usage\n` +
                `• Performance impact analysis\n` +
                `• Suggestions for optimization`,
                false
            );
            this.setMascotScenario('idle');
            return;
        }
        
        let totalEffects = 0;
        let effectCategories = {
            color: [],
            blur: [],
            distortion: [],
            generate: [],
            stylize: [],
            other: []
        };
        
        let response = `✨ **Effects Analysis** (${this.selectedLayers.length} layer${this.selectedLayers.length > 1 ? 's' : ''} selected)\n\n`;
        
        this.selectedLayers.forEach(layer => {
            if (layer.effects && layer.effects.length > 0) {
                response += `**${layer.name}** (${layer.effects.length} effect${layer.effects.length > 1 ? 's' : ''})\n`;
                
                layer.effects.forEach(effect => {
                    response += `• ${effect.name}\n`;
                    totalEffects++;
                    
                    // Categorize effects
                    const effectName = effect.name.toLowerCase();
                    if (effectName.includes('color') || effectName.includes('hue') || effectName.includes('saturation') || effectName.includes('levels') || effectName.includes('curves')) {
                        effectCategories.color.push(effect.name);
                    } else if (effectName.includes('blur') || effectName.includes('gaussian')) {
                        effectCategories.blur.push(effect.name);
                    } else if (effectName.includes('distort') || effectName.includes('warp') || effectName.includes('turbulent')) {
                        effectCategories.distortion.push(effect.name);
                    } else if (effectName.includes('generate') || effectName.includes('fractal') || effectName.includes('noise')) {
                        effectCategories.generate.push(effect.name);
                    } else if (effectName.includes('stylize') || effectName.includes('glow') || effectName.includes('shadow')) {
                        effectCategories.stylize.push(effect.name);
                    } else {
                        effectCategories.other.push(effect.name);
                    }
                });
                response += '\n';
            }
        });

        if (totalEffects === 0) {
            this.addMessage('assistant', 
                `✨ **No Effects Applied**\n\n` +
                `The selected layers don't have any effects applied.\n\n` +
                `🎯 **Popular effects to try:**\n` +
                `• **Gaussian Blur** - Softens and blurs\n` +
                `• **Drop Shadow** - Adds depth\n` +
                `• **Glow** - Creates luminous edges\n` +
                `• **Color Correction** - Adjusts colors\n\n` +
                `💡 *Add effects via Effect menu or ask me for specific effects!*`,
                false
            );
            this.setMascotScenario('idle');
        } else {
            // Add category summary
            response += `📊 **Effect Categories Summary:**\n`;
            if (effectCategories.color.length > 0) response += `🎨 Color & Correction: ${effectCategories.color.length}\n`;
            if (effectCategories.blur.length > 0) response += `🌫️ Blur & Focus: ${effectCategories.blur.length}\n`;
            if (effectCategories.distortion.length > 0) response += `🌀 Distortion: ${effectCategories.distortion.length}\n`;
            if (effectCategories.generate.length > 0) response += `⚡ Generate: ${effectCategories.generate.length}\n`;
            if (effectCategories.stylize.length > 0) response += `✨ Stylize: ${effectCategories.stylize.length}\n`;
            if (effectCategories.other.length > 0) response += `📦 Other: ${effectCategories.other.length}\n`;
            
            response += `\n💡 **Performance tip:** ${totalEffects > 5 ? 'Consider pre-composing layers with many effects' : 'Current effect count looks good for performance'}`;
            
            this.addMessage('assistant', response, false);
            this.setMascotScenario('solution');
        }
    }
    
    generateFileOrganizationResponse() {
        const organizationScript = `// Project Organization Script
app.beginUndoGroup("Organize Project");

try {
    var proj = app.project;
    
    // Create organization folders if they don't exist
    var folders = {
        "Footage": null,
        "Compositions": null,
        "Audio": null,
        "Images": null,
        "Solids": null
    };
    
    // Create folders
    for (var folderName in folders) {
        var existingFolder = null;
        for (var i = 1; i <= proj.numItems; i++) {
            if (proj.item(i) instanceof FolderItem && proj.item(i).name === folderName) {
                existingFolder = proj.item(i);
                break;
            }
        }
        folders[folderName] = existingFolder || proj.items.addFolder(folderName);
    }
    
    // Organize items into folders
    for (var i = proj.numItems; i >= 1; i--) {
        var item = proj.item(i);
        
        if (item.parentFolder === proj.rootFolder) {
            if (item instanceof CompItem) {
                item.parentFolder = folders["Compositions"];
            } else if (item instanceof FootageItem) {
                if (item.file && item.file.name.match(/\\.(mp3|wav|aac|m4a|flac)$/i)) {
                    item.parentFolder = folders["Audio"];
                } else if (item.file && item.file.name.match(/\\.(jpg|jpeg|png|gif|bmp|tiff|psd|ai)$/i)) {
                    item.parentFolder = folders["Images"];
                } else if (item.file) {
                    item.parentFolder = folders["Footage"];
                } else if (item.mainSource instanceof SolidSource) {
                    item.parentFolder = folders["Solids"];
                }
            }
        }
    }
    
    alert("Project organized successfully! Created folders: " + Object.keys(folders).join(", "));
    
} catch (error) {
    alert("Error organizing project: " + error.toString());
}

app.endUndoGroup();`;
        
        this.addMessage('assistant', 
            `🗂️ **Project Organization Tool**\n\n` +
            `This script will automatically organize your project by:\n\n` +
            `📁 **Creating organized folders:**\n` +
            `• Footage - Video files and sequences\n` +
            `• Compositions - All your comps\n` +
            `• Audio - Sound files and music\n` +
            `• Images - Photos and graphics\n` +
            `• Solids - Generated solid layers\n\n` +
            `🎯 **Smart sorting** - Automatically moves items to appropriate folders based on file type\n\n` +
            `⚡ **Safe operation** - Uses undo group so you can revert if needed`,
            false
        );
        
        this.addCodeBlock(organizationScript, 'javascript', {
            showCopyButton: true,
            showApplyButton: true,
            title: 'Project Organization Script',
            description: 'Automatically sorts project items into organized folders'
        });
        
        this.setMascotScenario('solution');
    }

    generateLayerPropertiesResponse() {
        let response = '👁️ **Selected Layer Properties**\n\n';
        this.selectedLayers.forEach(layer => {
            response += `**${layer.name}**\n`;
            response += `• Index: ${layer.index}\n`;
            response += `• Enabled: ${layer.enabled ? 'Yes' : 'No'}\n\n`;
        });
        this.addMessage('assistant', response, false);
        this.setMascotScenario('solution');
    }

    handleKeyframeExport(userMessage) {
        let propertyName = "Position"; // Default
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('scale')) propertyName = "Scale";
        else if (lowerMessage.includes('rotation')) propertyName = "Rotation";
        else if (lowerMessage.includes('opacity')) propertyName = "Opacity";
        
        this.exportKeyframesAsText(propertyName);
    }

    //================================================================================
    // AFTER EFFECTS COMMUNICATION (ExtendScript)
    //================================================================================

    updateProjectContext() {
        if (!this.csInterface) return;
        const scripts = {
            layers: `var comp = app.project.activeItem; if (comp) { var layers = comp.selectedLayers; var info = []; for(var i=0; i<layers.length; i++){ info.push({name: layers[i].name, index: layers[i].index, enabled: layers[i].enabled}); } JSON.stringify(info); } else { JSON.stringify([]); }`,
            project: `var proj = app.project; var comp = proj.activeItem; JSON.stringify({ name: proj.file ? proj.file.name : 'Untitled', items: proj.numItems, comp: comp ? comp.name : null });`,
            files: `var proj = app.project; var files = []; for(var i=1; i<=proj.numItems; i++){ if(proj.item(i) instanceof FootageItem) files.push({name: proj.item(i).name}); } JSON.stringify(files);`,
            effects: `var comp = app.project.activeItem; var layers = comp ? comp.selectedLayers : []; var allEffects = []; for(var i=0; i<layers.length; i++){ var layer = layers[i]; var effects = []; if(layer.property('Effects')){ for(var j=1; j<=layer.property('Effects').numProperties; j++){ effects.push({name: layer.property('Effects').property(j).name}); } } allEffects.push({name: layer.name, effects: effects}); } JSON.stringify(allEffects);`,
        };

        this.csInterface.evalScript(scripts.layers, (res) => { this.selectedLayers = JSON.parse(res || '[]'); this.updateContextIndicator(); });
        this.csInterface.evalScript(scripts.project, (res) => { this.projectContext = JSON.parse(res || '{}'); });
        this.csInterface.evalScript(scripts.files, (res) => { this.projectFiles = JSON.parse(res || '[]'); });
        this.csInterface.evalScript(scripts.effects, (res) => { this.selectedEffects = JSON.parse(res || '[]'); this.updateEffectsIndicator(); });
    }

    exportKeyframesAsText(propertyName) {
        const script = `
            var comp = app.project.activeItem;
            var layer = comp ? comp.selectedLayers[0] : null;
            if (layer) {
                var prop = layer.property("${propertyName}");
                if (prop && prop.numKeys > 0) {
                    var keyData = { layerName: layer.name, propertyName: prop.name, keyframes: [] };
                    for (var i = 1; i <= prop.numKeys; i++) {
                        keyData.keyframes.push({ time: prop.keyTime(i), value: prop.keyValue(i).toString() });
                    }
                    JSON.stringify(keyData);
                } else {
                    JSON.stringify({ error: "No keyframes on the '" + propertyName + "' property." });
                }
            } else {
                JSON.stringify({ error: "Please select a layer." });
            }
        `;
        this.csInterface.evalScript(script, (result) => {
            const data = JSON.parse(result || '{}');
            if (data.error) {
                this.addMessage('assistant', data.error, false);
                this.setMascotScenario('idle');
            } else {
                const keyframeText = data.keyframes.map(k => `Time: ${k.time.toFixed(2)}s, Value: [${k.value}]`).join('\n');
                const response = `✅ Exported keyframes from **${data.layerName} -> ${data.propertyName}**:\n\n`;
                this.addMessage('assistant', response + this.createCodeBlock('text', keyframeText, 'Keyframe Data'), true);
                this.setMascotScenario('success');
            }
        });
    }

    applyExpressionToSelected(code, property) {
        const script = `
            var comp = app.project.activeItem;
            if (comp) {
                var layers = comp.selectedLayers;
                if (layers.length > 0) {
                    app.beginUndoGroup('Apply Expression');
                    for (var i = 0; i < layers.length; i++) {
                        var prop = layers[i].property("${property}");
                        if (prop && prop.canSetExpression) {
                            prop.expression = "${code.replace(/"/g, '\\"')}";
                        }
                    }
                    app.endUndoGroup();
                    layers.length + ' layer(s) updated.';
                } else {
                    'No layers selected.';
                }
            } else { 'No active composition.'; }
        `;
        this.csInterface.evalScript(script, (res) => this.addMessage('system', `🎯 ${res}`, false));
    }

    //================================================================================
    // UI AND EVENT HANDLERS
    //================================================================================

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });
    }

    handleUserInput() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        this.addMessage('user', message);
        this.chatInput.value = '';
        this.setMascotScenario('thinking');
        // Show typing indicator with mascot during AI processing
        if (typeof showTypingIndicator === 'function') {
            showTypingIndicator('AI is thinking...');
        }
        setTimeout(() => this.generateAIResponse(message), 500);
    }

    addMessage(type, content, isHTML = false) {
        // Hide typing indicator when assistant responds
        if (type === 'assistant' && typeof hideTypingIndicator === 'function') {
            hideTypingIndicator();
        }
        
        const msg = document.createElement('div');
        msg.className = `message ${type}`;
        
        if (isHTML && content.includes('code-block-container')) {
            // Content contains code blocks, need to separate text from code
            const parts = content.split(/(<div class="code-block-container".*?<\/div><\/div><\/div>)/s);
            
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].trim() === '') continue;
                
                if (parts[i].includes('code-block-container')) {
                    // This is a code block
                    const codeDiv = document.createElement('div');
                    codeDiv.innerHTML = parts[i];
                    msg.appendChild(codeDiv);
                } else {
                    // This is regular text content
                    const textContent = parts[i].trim();
                    if (textContent) {
                        const contentDiv = document.createElement('div');
                        contentDiv.className = 'message-content';
                        if (isHTML) {
                            contentDiv.innerHTML = textContent;
                        } else {
                            contentDiv.textContent = textContent;
                        }
                        msg.appendChild(contentDiv);
                    }
                }
            }
        } else {
            // Regular message without code blocks
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            if (isHTML) {
                contentDiv.innerHTML = content;
            } else {
                contentDiv.textContent = content;
            }
            msg.appendChild(contentDiv);
        }
        
        this.chatMessages.appendChild(msg);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showWelcomeMessage() {
        const welcomeMessage = `
<div class="welcome-message">
    <h4>🤖 AI Assistant Ready</h4>
    <p>I can help you with After Effects automation, expressions, and project management.</p>
    <p><strong>Try saying:</strong> "How many layers are selected?" or "Add wiggle to position" or "What can you do?"</p>
    <p><em>Context updates every minute. Say "refresh context" for immediate updates.</em></p>
</div>`;
        this.addMessage('assistant', welcomeMessage, true);
    }

    updateContextIndicator() {
        const indicator = document.getElementById('context-indicator');
        if (indicator) {
            if (this.selectedLayers.length > 0) {
                indicator.textContent = `👁️ ${this.selectedLayers.length} layer${this.selectedLayers.length > 1 ? 's' : ''} selected`;
                indicator.style.display = 'block';
            } else {
                indicator.style.display = 'none';
            }
        }
    }

    updateEffectsIndicator() {
        const indicator = document.getElementById('effects-indicator');
        if (indicator) {
            const effectCount = this.selectedEffects.reduce((sum, layer) => sum + layer.effects.length, 0);
            if (effectCount > 0) {
                indicator.textContent = `✨ ${effectCount} effect${effectCount > 1 ? 's' : ''} on selected`;
                indicator.style.display = 'block';
            } else {
                indicator.style.display = 'none';
            }
        }
    }

    setMascotScenario(scenario) {
        if (this.mascotAnimator) {
            this.mascotAnimator.playScenario(scenario);
        }
    }

    //================================================================================
    // UI HELPERS (Code Blocks, etc.)
    //================================================================================

    // New method for adding messages with separate text and code
    addMessageWithCode(type, messageText, language, code, context = '') {
        const msg = document.createElement('div');
        msg.className = `message ${type}`;
        
        // Add the message text first
        if (messageText && messageText.trim()) {
            const textDiv = document.createElement('div');
            textDiv.className = 'message-content';
            textDiv.innerHTML = messageText;
            msg.appendChild(textDiv);
        }
        
        // Add the code block separately
        if (code && code.trim()) {
            const codeDiv = document.createElement('div');
            codeDiv.innerHTML = this.createCodeBlock(language, code, context);
            msg.appendChild(codeDiv);
        }
        
        this.chatMessages.appendChild(msg);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    createCodeBlock(language, code, context = '') {
        const escapedCode = this.escapeHtml(code);
        const blockId = 'code-block-' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        return `
<div class="code-block-container" id="${blockId}">
    <div class="code-block">
        <div class="code-header">
            <span class="code-language">${language.toUpperCase()}</span>
            <div class="code-actions">
                <button class="code-btn copy-btn" onclick="chatDemo.copyToClipboard('${blockId}')" title="Copy code to clipboard">
                    <i class="fas fa-copy"></i> Copy
                </button>
                ${(language === 'jsx' || language === 'js' || context === 'loop' || context === 'wiggle' || context === 'bounce') ? 
                    `<button class="code-btn apply-btn" onclick="chatDemo.applyCodeToAfterEffects('${blockId}', '${context}')" title="Apply code to After Effects">
                        <i class="fas fa-play"></i> Apply
                    </button>` : ''}
            </div>
        </div>
        <div class="code-content">
            <pre><code class="language-${language}">${escapedCode}</code></pre>
        </div>
    </div>
</div>`;
    }

    copyToClipboard(blockId) {
        const codeBlock = document.getElementById(blockId);
        const code = codeBlock.querySelector('code').textContent;
        const copyBtn = codeBlock.querySelector('.copy-btn');
        
        navigator.clipboard.writeText(code).then(() => {
            const originalContent = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.classList.add('success');
            setTimeout(() => { 
                copyBtn.innerHTML = originalContent;
                copyBtn.classList.remove('success');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code:', err);
            copyBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
            setTimeout(() => { 
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        });
    }

    applyCodeToAfterEffects(blockId, context) {
        const codeBlock = document.getElementById(blockId);
        const code = codeBlock.querySelector('code').textContent;
        const applyBtn = codeBlock.querySelector('.apply-btn');
        
        if (!this.csInterface) {
            this.addMessage('system', '❌ Cannot apply code: After Effects connection not available', false);
            return;
        }

        const originalContent = applyBtn.innerHTML;
        applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
        applyBtn.disabled = true;

        // Determine how to apply the code based on context
        let script = '';
        if (context === 'loop' || context === 'wiggle' || context === 'bounce') {
            // Apply as expression to selected layer's position property
            script = `
                app.beginUndoGroup("Apply Expression");
                try {
                    if (!app.project) {
                        throw new Error("No project open");
                    }
                    var activeComp = app.project.activeItem;
                    if (!activeComp || !(activeComp instanceof CompItem)) {
                        throw new Error("No active composition");
                    }
                    if (activeComp.selectedLayers.length === 0) {
                        throw new Error("No layers selected");
                    }
                    var layer = activeComp.selectedLayers[0];
                    layer.property("ADBE Transform Group").property("ADBE Position").expression = "${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
                    "✅ Expression applied to " + layer.name;
                } catch (e) {
                    "❌ Error: " + e.message;
                } finally {
                    app.endUndoGroup();
                }
            `;
        } else {
            // Apply as general script
            script = `
                app.beginUndoGroup("Apply Script");
                try {
                    ${code}
                    "✅ Script executed successfully";
                } catch (e) {
                    "❌ Error: " + e.message;
                } finally {
                    app.endUndoGroup();
                }
            `;
        }

        this.csInterface.evalScript(script, (result) => {
            applyBtn.innerHTML = originalContent;
            applyBtn.disabled = false;
            
            if (result.includes('✅')) {
                applyBtn.innerHTML = '<i class="fas fa-check"></i> Applied!';
                applyBtn.classList.add('success');
                setTimeout(() => { 
                    applyBtn.innerHTML = originalContent;
                    applyBtn.classList.remove('success');
                }, 3000);
            } else {
                applyBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
                applyBtn.classList.add('error');
                setTimeout(() => { 
                    applyBtn.innerHTML = originalContent;
                    applyBtn.classList.remove('error');
                }, 3000);
            }
    }

    escapeHtml(str) {
        return str.replace(/[&<>"']/g, (match) => {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
        });
    }

    generateCreateLayerScript() {
        const script = `// Create a new solid layer with animation
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Create Animated Layer");
    
    var newLayer = comp.layers.addSolid(
        [1, 0.5, 0.2],  // Orange color
        "AI Generated Layer",
        comp.width,
        comp.height,
        comp.pixelAspect
    );
    
    // Position in center
    newLayer.property("Transform").property("Position").setValue([comp.width/2, comp.height/2]);
    
    // Add scale animation
    newLayer.property("Transform").property("Scale").setValueAtTime(0, [0, 0]);
    newLayer.property("Transform").property("Scale").setValueAtTime(1, [100, 100]);
    
    // Add rotation animation
    newLayer.property("Transform").property("Rotation").setValueAtTime(0, 0);
    newLayer.property("Transform").property("Rotation").setValueAtTime(2, 360);
    
    app.endUndoGroup();
    alert("Created animated layer: " + newLayer.name);
} else {
    alert("Please open a composition first");
}`;
        
        this.addCodeBlock(script, 'javascript', {
            showCopyButton: true,
            showApplyButton: true,
            title: 'Create Animated Layer Script',
            description: 'This creates a new solid layer with scale and rotation animations'
        });
        
        this.addMessage('assistant', 
            '🎬 **Layer Created!** This script generates a new animated solid layer with scale and rotation effects. The layer will appear at the center of your composition with a 2-second animation.',
            false
        );
        this.setMascotScenario('success');
    }
}