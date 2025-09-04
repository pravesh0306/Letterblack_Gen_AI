/**
 * AUDIO TRANSCRIPTION MODULE
 * Voice command processing and audio effect suggestions
 */

class AudioTranscriptionModule {
    constructor(aiModule, aeIntegration) {
        this.aiModule = aiModule;
        this.aeIntegration = aeIntegration;
        this.recognition = null;
        this.isListening = false;
        this.transcriptHistory = [];
        this.audioContext = null;
        this.mediaStream = null;

        this.audioCommands = {
            // Basic commands
            'create text layer': 'createTextLayer',
            'add solid': 'addSolidLayer',
            'new composition': 'newComposition',
            'play timeline': 'playTimeline',
            'stop playback': 'stopPlayback',

            // Effect commands
            'add glow': 'addGlowEffect',
            'add blur': 'addBlurEffect',
            'add drop shadow': 'addDropShadow',
            'add motion blur': 'addMotionBlur',

            // Navigation commands
            'go to start': 'goToStart',
            'go to end': 'goToEnd',
            'next keyframe': 'nextKeyframe',
            'previous keyframe': 'previousKeyframe',

            // Analysis commands
            'analyze audio': 'analyzeAudio',
            'suggest effects': 'suggestAudioEffects',
            'sync to beat': 'syncToBeat'
        };

        this.audioEffectTemplates = {
            music: {
                eq: 'Parametric EQ with boost at 5kHz for clarity',
                compression: 'Compressor with 4:1 ratio, fast attack',
                reverb: 'Small room reverb for natural sound'
            },
            voiceover: {
                deEsser: 'De-esser to reduce sibilance',
                compression: 'Gentle compression with 3:1 ratio',
                noiseReduction: 'Light noise reduction if needed'
            },
            soundEffects: {
                normalization: 'Normalize to -6dB peak',
                fade: 'Fade in/out for smooth transitions',
                pitch: 'Pitch shift for creative effects'
            }
        };

        this.init();
    }

    async init() {
        // Initialize Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }

        // Initialize speech recognition
        this.initializeSpeechRecognition();

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();

        console.log('🎤 Audio Transcription Module initialized');
    }

    /**
     * Initialize speech recognition
     */
    initializeSpeechRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        // Event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            this.showListeningIndicator(true);
            console.log('🎤 Listening for voice commands...');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.showListeningIndicator(false);
            console.log('🎤 Stopped listening');
        };

        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showError('Voice recognition error: ' + event.error);
        };
    }

    /**
     * Setup keyboard shortcuts for voice control
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+V to toggle voice recognition
            if (event.ctrlKey && event.shiftKey && event.key === 'V') {
                event.preventDefault();
                this.toggleVoiceRecognition();
            }

            // Ctrl+Shift+A to analyze current audio
            if (event.ctrlKey && event.shiftKey && event.key === 'A') {
                event.preventDefault();
                this.analyzeCurrentAudio();
            }
        });
    }

    /**
     * Toggle voice recognition on/off
     */
    toggleVoiceRecognition() {
        if (!this.recognition) {
            this.showError('Voice recognition not supported');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    /**
     * Start listening for voice commands
     */
    startListening() {
        if (!this.recognition) return;

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            this.showError('Failed to start voice recognition');
        }
    }

    /**
     * Stop listening
     */
    stopListening() {
        if (!this.recognition) return;

        try {
            this.recognition.stop();
        } catch (error) {
            console.error('Failed to stop voice recognition:', error);
        }
    }

    /**
     * Handle speech recognition results
     */
    handleSpeechResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update UI with interim results
        this.updateTranscriptDisplay(interimTranscript);

        // Process final transcript
        if (finalTranscript.trim()) {
            this.processVoiceCommand(finalTranscript.trim().toLowerCase());
            this.transcriptHistory.push({
                transcript: finalTranscript,
                timestamp: Date.now(),
                processed: true
            });
        }
    }

    /**
     * Process voice command
     */
    async processVoiceCommand(command) {
        console.log('🎤 Processing voice command:', command);

        // Store command in history
        this.transcriptHistory.push({
            transcript: command,
            timestamp: Date.now(),
            processed: false
        });

        // Check for direct commands
        const directCommand = this.findDirectCommand(command);
        if (directCommand) {
            await this.executeDirectCommand(directCommand);
            return;
        }

        // Use AI to interpret complex commands
        if (this.aiModule) {
            await this.processAICommand(command);
        } else {
            this.showError('AI module not available for complex commands');
        }
    }

    /**
     * Find direct command match
     */
    findDirectCommand(command) {
        for (const [phrase, action] of Object.entries(this.audioCommands)) {
            if (command.includes(phrase)) {
                return { action, phrase, confidence: this.calculateConfidence(command, phrase) };
            }
        }
        return null;
    }

    /**
     * Calculate confidence score for command match
     */
    calculateConfidence(command, phrase) {
        const commandWords = command.split(' ');
        const phraseWords = phrase.split(' ');
        const matches = phraseWords.filter(word => commandWords.includes(word)).length;
        return matches / phraseWords.length;
    }

    /**
     * Execute direct command
     */
    async executeDirectCommand(command) {
        const { action, phrase, confidence } = command;

        if (confidence < 0.5) {
            this.showError(`Low confidence in command: "${phrase}"`);
            return;
        }

        try {
            console.log(`🎯 Executing command: ${action}`);

            switch (action) {
                case 'createTextLayer':
                    await this.createTextLayer();
                    break;
                case 'addSolidLayer':
                    await this.addSolidLayer();
                    break;
                case 'newComposition':
                    await this.newComposition();
                    break;
                case 'playTimeline':
                    await this.playTimeline();
                    break;
                case 'stopPlayback':
                    await this.stopPlayback();
                    break;
                case 'addGlowEffect':
                    await this.addGlowEffect();
                    break;
                case 'addBlurEffect':
                    await this.addBlurEffect();
                    break;
                case 'addDropShadow':
                    await this.addDropShadow();
                    break;
                case 'addMotionBlur':
                    await this.addMotionBlur();
                    break;
                case 'goToStart':
                    await this.goToStart();
                    break;
                case 'goToEnd':
                    await this.goToEnd();
                    break;
                case 'nextKeyframe':
                    await this.nextKeyframe();
                    break;
                case 'previousKeyframe':
                    await this.previousKeyframe();
                    break;
                case 'analyzeAudio':
                    await this.analyzeCurrentAudio();
                    break;
                case 'suggestAudioEffects':
                    await this.suggestAudioEffects();
                    break;
                case 'syncToBeat':
                    await this.syncToBeat();
                    break;
                default:
                    this.showError(`Unknown command: ${action}`);
            }

            // Show success feedback
            this.showSuccess(`Executed: ${phrase}`);

        } catch (error) {
            console.error('Command execution failed:', error);
            this.showError(`Failed to execute: ${phrase}`);
        }
    }

    /**
     * Process complex commands with AI
     */
    async processAICommand(command) {
        if (!this.aiModule) return;

        try {
            const prompt = `Interpret this voice command for After Effects and provide a structured response:

Voice Command: "${command}"

Please provide:
1. What the user is trying to accomplish
2. Specific After Effects actions to take
3. Any parameters or settings needed
4. Alternative ways to achieve the same result

Format as JSON with keys: intent, actions, parameters, alternatives`;

            const aiResponse = await this.aiModule.generateResponse(prompt);
            const interpretation = this.parseAIResponse(aiResponse);

            if (interpretation) {
                await this.executeAIInterpretation(interpretation);
            }

        } catch (error) {
            console.error('AI command processing failed:', error);
            this.showError('Failed to process complex command');
        }
    }

    /**
     * Parse AI response for command interpretation
     */
    parseAIResponse(response) {
        try {
            // Try to parse as JSON first
            return JSON.parse(response);
        } catch {
            // Fallback to simple text parsing
            return {
                intent: response,
                actions: ['analyze manually'],
                parameters: {},
                alternatives: ['Use mouse and keyboard']
            };
        }
    }

    /**
     * Execute AI interpretation
     */
    async executeAIInterpretation(interpretation) {
        console.log('🤖 AI interpreted command:', interpretation);

        // Show interpretation to user
        this.showInterpretation(interpretation);

        // Execute primary action if possible
        if (interpretation.actions && interpretation.actions.length > 0) {
            const primaryAction = interpretation.actions[0];
            // Could implement action execution here
            console.log('Primary action to execute:', primaryAction);
        }
    }

    /**
     * Audio analysis functionality
     */
    async analyzeCurrentAudio() {
        try {
            if (!this.aeIntegration) {
                throw new Error('AE Integration not available');
            }

            console.log('🎵 Analyzing current audio...');

            const audioData = await this.aeIntegration.getCurrentAudioData();

            if (audioData) {
                const analysis = await this.performAudioAnalysis(audioData);
                this.showAudioAnalysis(analysis);
            } else {
                this.showError('No audio data available');
            }

        } catch (error) {
            console.error('Audio analysis failed:', error);
            this.showError('Failed to analyze audio: ' + error.message);
        }
    }

    /**
     * Perform detailed audio analysis
     */
    async performAudioAnalysis(audioData) {
        const analysis = {
            duration: audioData.duration || 0,
            sampleRate: audioData.sampleRate || 44100,
            channels: audioData.channels || 2,
            peakLevel: 0,
            rmsLevel: 0,
            frequency: {},
            issues: []
        };

        try {
            // Basic audio analysis
            if (audioData.buffer) {
                const audioBuffer = audioData.buffer;
                const channelData = audioBuffer.getChannelData(0);

                // Calculate peak and RMS
                let sum = 0;
                let peak = 0;

                for (let i = 0; i < channelData.length; i++) {
                    const sample = Math.abs(channelData[i]);
                    sum += sample * sample;
                    if (sample > peak) peak = sample;
                }

                analysis.peakLevel = peak;
                analysis.rmsLevel = Math.sqrt(sum / channelData.length);

                // Detect issues
                if (peak > 0.95) {
                    analysis.issues.push('Audio is clipping - reduce levels');
                }

                if (analysis.rmsLevel < 0.01) {
                    analysis.issues.push('Audio levels are very low');
                }

                // Frequency analysis (simplified)
                analysis.frequency = this.analyzeFrequency(channelData, audioBuffer.sampleRate);
            }

        } catch (error) {
            console.warn('Audio analysis calculation failed:', error);
        }

        return analysis;
    }

    /**
     * Analyze frequency content
     */
    analyzeFrequency(channelData, sampleRate) {
        // Simplified frequency analysis
        const fftSize = 2048;
        const frequencyBins = {};

        // Very basic frequency detection
        const nyquist = sampleRate / 2;
        const binSize = nyquist / (fftSize / 2);

        // Count samples in different frequency ranges
        frequencyBins.low = 0;    // 20-250 Hz
        frequencyBins.mid = 0;    // 250-4000 Hz
        frequencyBins.high = 0;   // 4000+ Hz

        for (let i = 0; i < Math.min(channelData.length, 10000); i++) {
            const frequency = (i * sampleRate) / channelData.length;

            if (frequency >= 20 && frequency < 250) {
                frequencyBins.low++;
            } else if (frequency >= 250 && frequency < 4000) {
                frequencyBins.mid++;
            } else if (frequency >= 4000) {
                frequencyBins.high++;
            }
        }

        return frequencyBins;
    }

    /**
     * Suggest audio effects based on analysis
     */
    async suggestAudioEffects() {
        try {
            const audioData = await this.aeIntegration?.getCurrentAudioData();

            if (!audioData) {
                // Provide general suggestions
                this.showAudioEffectSuggestions(this.audioEffectTemplates);
                return;
            }

            const analysis = await this.performAudioAnalysis(audioData);

            // Generate personalized suggestions
            const suggestions = this.generatePersonalizedSuggestions(analysis);
            this.showAudioEffectSuggestions(suggestions);

        } catch (error) {
            console.error('Audio effect suggestions failed:', error);
            this.showAudioEffectSuggestions(this.audioEffectTemplates);
        }
    }

    /**
     * Generate personalized audio effect suggestions
     */
    generatePersonalizedSuggestions(analysis) {
        const suggestions = {};

        // Analyze frequency content
        const { low, mid, high } = analysis.frequency;

        if (low > mid * 2) {
            suggestions.bass = 'Consider adding bass enhancement or EQ boost in low frequencies';
        }

        if (high > mid * 1.5) {
            suggestions.treble = 'High frequencies are prominent - consider gentle high-frequency rolloff';
        }

        // Level-based suggestions
        if (analysis.peakLevel > 0.9) {
            suggestions.dynamics = 'Audio is peaking high - consider compression or limiting';
        }

        if (analysis.rmsLevel < 0.05) {
            suggestions.gain = 'Audio levels are low - consider normalization or gain staging';
        }

        return suggestions;
    }

    /**
     * Sync animations to audio beat
     */
    async syncToBeat() {
        try {
            if (!this.aeIntegration) {
                throw new Error('AE Integration required for beat sync');
            }

            console.log('🎵 Syncing to audio beat...');

            const audioData = await this.aeIntegration.getCurrentAudioData();

            if (audioData && audioData.buffer) {
                const beats = await this.detectBeats(audioData.buffer);
                const keyframes = this.generateBeatKeyframes(beats);

                await this.applyBeatSync(keyframes);

                this.showSuccess(`Synced ${keyframes.length} keyframes to audio beat`);
            } else {
                this.showError('No audio data available for beat detection');
            }

        } catch (error) {
            console.error('Beat sync failed:', error);
            this.showError('Failed to sync to beat: ' + error.message);
        }
    }

    /**
     * Detect beats in audio (simplified)
     */
    async detectBeats(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const beats = [];

        // Simple beat detection based on amplitude envelope
        const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
        let maxAmplitude = 0;

        for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
            let sum = 0;
            for (let j = 0; j < windowSize; j++) {
                sum += Math.abs(channelData[i + j]);
            }
            const amplitude = sum / windowSize;

            if (amplitude > maxAmplitude) maxAmplitude = amplitude;

            // Detect peaks above threshold
            if (amplitude > maxAmplitude * 0.6) {
                const time = i / sampleRate;
                beats.push(time);
            }
        }

        return beats;
    }

    /**
     * Generate keyframes from beat positions
     */
    generateBeatKeyframes(beats) {
        const keyframes = [];

        beats.forEach((beatTime, index) => {
            keyframes.push({
                time: beatTime,
                value: index % 2 === 0 ? 100 : 120, // Alternate scale values
                property: 'scale'
            });
        });

        return keyframes;
    }

    /**
     * Apply beat sync to current layer
     */
    async applyBeatSync(keyframes) {
        if (!this.aeIntegration) return;

        const script = `
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    app.beginUndoGroup("Beat Sync");

    var layer = comp.selectedLayers[0];
    var scaleProp = layer.property("Scale");

    ${keyframes.map(kf => `
    scaleProp.setValueAtTime(${kf.time}, [${kf.value}, ${kf.value}]);`).join('\n')}

    app.endUndoGroup();
}`;

        await this.aeIntegration.runScript(script);
    }

    // Command execution methods
    async createTextLayer() {
        const script = `
var comp = app.project.activeItem;
if (comp) {
    app.beginUndoGroup("Voice: Create Text");
    var textLayer = comp.layers.addText("Voice Created");
    app.endUndoGroup();
}`;
        await this.aeIntegration?.runScript(script);
    }

    async addSolidLayer() {
        const script = `
var comp = app.project.activeItem;
if (comp) {
    app.beginUndoGroup("Voice: Add Solid");
    var solid = comp.layers.addSolid([1, 0.5, 0], "Voice Solid", 200, 200, 1);
    app.endUndoGroup();
}`;
        await this.aeIntegration?.runScript(script);
    }

    async newComposition() {
        const script = `
var comp = app.project.items.addComp("Voice Comp", 1920, 1080, 1, 10, 30);
comp.openInViewer();`;
        await this.aeIntegration?.runScript(script);
    }

    async playTimeline() {
        const script = `app.project.activeItem.time = 0;`;
        await this.aeIntegration?.runScript(script);
    }

    async stopPlayback() {
        // This would need to be handled differently as AE scripts run synchronously
        console.log('Stop playback requested');
    }

    async addGlowEffect() {
        const script = `
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    app.beginUndoGroup("Voice: Add Glow");
    var layer = comp.selectedLayers[0];
    var glow = layer.property("Effects").addProperty("Glow");
    glow.property("Glow Radius").setValue(20);
    app.endUndoGroup();
}`;
        await this.aeIntegration?.runScript(script);
    }

    async addBlurEffect() {
        const script = `
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    app.beginUndoGroup("Voice: Add Blur");
    var layer = comp.selectedLayers[0];
    var blur = layer.property("Effects").addProperty("Gaussian Blur");
    blur.property("Blurriness").setValue(10);
    app.endUndoGroup();
}`;
        await this.aeIntegration?.runScript(script);
    }

    async addDropShadow() {
        const script = `
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    app.beginUndoGroup("Voice: Add Drop Shadow");
    var layer = comp.selectedLayers[0];
    var shadow = layer.property("Effects").addProperty("Drop Shadow");
    app.endUndoGroup();
}`;
        await this.aeIntegration?.runScript(script);
    }

    async addMotionBlur() {
        const script = `
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    app.beginUndoGroup("Voice: Add Motion Blur");
    var layer = comp.selectedLayers[0];
    var motionBlur = layer.property("Effects").addProperty("Motion Blur");
    app.endUndoGroup();
}`;
        await this.aeIntegration?.runScript(script);
    }

    async goToStart() {
        const script = `if (app.project.activeItem) app.project.activeItem.time = 0;`;
        await this.aeIntegration?.runScript(script);
    }

    async goToEnd() {
        const script = `if (app.project.activeItem) app.project.activeItem.time = app.project.activeItem.duration;`;
        await this.aeIntegration?.runScript(script);
    }

    async nextKeyframe() {
        const script = `
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    var layer = comp.selectedLayers[0];
    var props = layer.selectedProperties;
    if (props.length > 0) {
        var prop = props[0];
        var keys = prop.selectedKeys;
        if (keys.length > 0) {
            var currentTime = comp.time;
            var nextKey = keys.find(key => prop.keyTime(key) > currentTime);
            if (nextKey) comp.time = prop.keyTime(nextKey);
        }
    }
}`;
        await this.aeIntegration?.runScript(script);
    }

    async previousKeyframe() {
        const script = `
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    var layer = comp.selectedLayers[0];
    var props = layer.selectedProperties;
    if (props.length > 0) {
        var prop = props[0];
        var keys = prop.selectedKeys;
        if (keys.length > 0) {
            var currentTime = comp.time;
            var prevKeys = keys.filter(key => prop.keyTime(key) < currentTime);
            if (prevKeys.length > 0) {
                var lastPrevKey = prevKeys[prevKeys.length - 1];
                comp.time = prop.keyTime(lastPrevKey);
            }
        }
    }
}`;
        await this.aeIntegration?.runScript(script);
    }

    /**
     * UI Helper methods
     */
    showListeningIndicator(isListening) {
        let indicator = document.querySelector('.voice-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'voice-indicator';
            document.body.appendChild(indicator);
        }

        if (isListening) {
            indicator.innerHTML = '🎤 <span>Listening...</span>';
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
            setTimeout(() => indicator.remove(), 2000);
        }
    }

    updateTranscriptDisplay(interimTranscript) {
        let display = document.querySelector('.voice-transcript');
        if (!display) {
            display = document.createElement('div');
            display.className = 'voice-transcript';
            document.body.appendChild(display);
        }

        display.textContent = interimTranscript || 'Listening...';
        display.classList.add('active');

        if (!interimTranscript) {
            setTimeout(() => display.remove(), 1000);
        }
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    showInterpretation(interpretation) {
        const modal = document.createElement('div');
        modal.className = 'voice-interpretation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🎤 Voice Command Interpretation</h3>
                <div class="interpretation-details">
                    <p><strong>Intent:</strong> ${interpretation.intent || 'Unknown'}</p>
                    <p><strong>Actions:</strong> ${interpretation.actions?.join(', ') || 'None'}</p>
                    <p><strong>Parameters:</strong> ${JSON.stringify(interpretation.parameters || {})}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showAudioAnalysis(analysis) {
        const modal = document.createElement('div');
        modal.className = 'audio-analysis-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🎵 Audio Analysis</h3>
                <div class="analysis-details">
                    <p><strong>Duration:</strong> ${analysis.duration?.toFixed(2) || 'N/A'}s</p>
                    <p><strong>Peak Level:</strong> ${(analysis.peakLevel * 100)?.toFixed(1) || 'N/A'}%</p>
                    <p><strong>RMS Level:</strong> ${(analysis.rmsLevel * 100)?.toFixed(1) || 'N/A'}%</p>
                    ${analysis.issues?.length > 0 ? `<p><strong>Issues:</strong> ${analysis.issues.join(', ')}</p>` : ''}
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showAudioEffectSuggestions(suggestions) {
        const modal = document.createElement('div');
        modal.className = 'audio-suggestions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🎚️ Audio Effect Suggestions</h3>
                <div class="suggestions-list">
                    ${Object.entries(suggestions).map(([category, suggestion]) =>
                        `<div class="suggestion-item">
                            <strong>${category}:</strong> ${suggestion}
                        </div>`
                    ).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Get transcript history
     */
    getTranscriptHistory() {
        return this.transcriptHistory;
    }

    /**
     * Clear transcript history
     */
    clearHistory() {
        this.transcriptHistory.length = 0;
        console.log('🧹 Voice transcript history cleared');
    }

    /**
     * Check if voice recognition is supported
     */
    isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isListening: this.isListening,
            isSupported: this.isSupported(),
            transcriptCount: this.transcriptHistory.length,
            lastTranscript: this.transcriptHistory[this.transcriptHistory.length - 1]
        };
    }
}

// Export for global use
window.AudioTranscriptionModule = AudioTranscriptionModule;
