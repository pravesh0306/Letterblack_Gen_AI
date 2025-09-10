/**
 * Voice Features Manager - Speech & Voice Input System
 * Provides TTS, STT, and audio visualization for the AI Assistant
 * Extracted from abilities folder and optimized for main extension
 */

class VoiceFeatureManager {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.speechRecognition = this.initSpeechRecognition();
        this.isListening = false;
        this.isMuted = false;
        this.audioVisualizerActive = false;
        this.currentUtterance = null;
        this.attachedFiles = [];
        
        this.settings = {
            speechEnabled: true,
            voiceInputEnabled: true,
            audioVisualizerEnabled: true,
            speechRate: 1.0,
            selectedVoice: 'default'
        };
        
        this.init();
    }

    init() {
        console.log('🎤 Initializing Voice Features...');
        this.loadSettings();
        this.setupEventListeners();
        this.populateVoiceOptions();
        this.setupFileAttachment();
        
        // Test button visibility after a short delay
        setTimeout(() => {
            this.testButtonVisibility();
        }, 1000);
    }

    // Test if the voice button is properly visible and functional
    testButtonVisibility() {
        const voiceBtn = document.getElementById('voice-input-btn');
        if (voiceBtn) {
            console.log('✅ Voice button found and accessible');
            console.log('Button styles:', {
                display: window.getComputedStyle(voiceBtn).display,
                visibility: window.getComputedStyle(voiceBtn).visibility,
                opacity: window.getComputedStyle(voiceBtn).opacity
            });
            
            // Ensure proper initial state
            this.updateVoiceButtonState();
        } else {
            console.error('❌ Voice button not found - checking for HTML structure...');
            console.log('Available voice-related elements:', 
                document.querySelectorAll('[id*="voice"], [class*="voice"]')
            );
        }
    }

    // Speech Recognition Setup
    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceButtonState();
        };

        recognition.onresult = (event) => {
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

            if (finalTranscript) {
                this.insertVoiceText(finalTranscript);
            }
        };

        recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButtonState();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceButtonState();
            
            // Provide user-friendly error messages
            let errorMessage = 'Voice input error occurred';
            switch (event.error) {
                case 'not-allowed':
                    errorMessage = 'Microphone access denied. Please allow microphone permissions.';
                    break;
                case 'no-speech':
                    errorMessage = 'No speech detected. Try speaking closer to the microphone.';
                    break;
                case 'network':
                    errorMessage = 'Network error. Check your internet connection.';
                    break;
                case 'audio-capture':
                    errorMessage = 'Microphone not found. Check if a microphone is connected.';
                    break;
                case 'service-not-allowed':
                    errorMessage = 'Speech service not allowed. This may be due to browser restrictions.';
                    break;
            }
            
            this.showVoiceError(errorMessage);
        };

        return recognition;
    }

    // Text-to-Speech
    speak(text) {
        if (!this.settings.speechEnabled || this.isMuted) return;

        // Stop any current speech
        this.stopSpeaking();

        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.rate = this.settings.speechRate;
        
        // Set voice if selected
        if (this.settings.selectedVoice !== 'default') {
            const voices = this.speechSynthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.name === this.settings.selectedVoice);
            if (selectedVoice) {
                this.currentUtterance.voice = selectedVoice;
            }
        }

        this.currentUtterance.onstart = () => {
            this.startAudioVisualizer();
        };

        this.currentUtterance.onend = () => {
            this.stopAudioVisualizer();
        };

        this.currentUtterance.onerror = () => {
            this.stopAudioVisualizer();
        };

        this.speechSynthesis.speak(this.currentUtterance);
    }

    stopSpeaking() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        this.stopAudioVisualizer();
    }

    // Audio Visualizer Control
    startAudioVisualizer() {
        if (!this.settings.audioVisualizerEnabled) return;
        
        const visualizer = document.getElementById('audio-visualizer');
        if (visualizer) {
            visualizer.classList.add('active');
            this.audioVisualizerActive = true;
        }
    }

    stopAudioVisualizer() {
        const visualizer = document.getElementById('audio-visualizer');
        if (visualizer) {
            visualizer.classList.remove('active');
            this.audioVisualizerActive = false;
        }
    }

    // Voice Input Control
    toggleVoiceInput() {
        if (!this.speechRecognition) {
            console.warn('Speech recognition not available');
            this.showVoiceError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
            return;
        }

        if (this.isListening) {
            this.speechRecognition.stop();
        } else {
            if (this.settings.voiceInputEnabled) {
                try {
                    this.speechRecognition.start();
                } catch (error) {
                    console.error('Speech recognition error:', error);
                    this.showVoiceError('Failed to start voice input. Please check microphone permissions.');
                }
            } else {
                this.showVoiceError('Voice input is disabled. Enable it in settings.');
            }
        }
    }

    // Show voice-related errors to the user
    showVoiceError(message) {
        // Create a temporary tooltip or notification
        const voiceBtn = document.getElementById('voice-input-btn');
        if (voiceBtn) {
            const errorTooltip = document.createElement('div');
            errorTooltip.className = 'voice-error-tooltip';
            errorTooltip.textContent = message;
            errorTooltip.style.cssText = `
                position: absolute;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--color-error);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                pointer-events: none;
            `;
            
            voiceBtn.style.position = 'relative';
            voiceBtn.appendChild(errorTooltip);
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (errorTooltip && errorTooltip.parentNode) {
                    errorTooltip.parentNode.removeChild(errorTooltip);
                }
            }, 3000);
        }
        
        console.warn('Voice Error:', message);
    }

    insertVoiceText(text) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            const currentValue = chatInput.value;
            const newValue = currentValue ? `${currentValue} ${text}` : text;
            chatInput.value = newValue.trim();
            
            // Trigger input event for any listeners
            chatInput.dispatchEvent(new Event('input'));
        }
    }

    updateVoiceButtonState() {
        const voiceBtn = document.getElementById('voice-input-btn');
        if (voiceBtn) {
            // Ensure button is visible and properly styled
            voiceBtn.style.opacity = '1';
            voiceBtn.style.visibility = 'visible';
            voiceBtn.style.display = '';
            
            if (this.isListening) {
                voiceBtn.classList.add('recording');
                voiceBtn.title = 'Stop Recording';
                
                // Add visual feedback for recording state
                const icon = voiceBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-stop';
                }
            } else {
                voiceBtn.classList.remove('recording');
                voiceBtn.title = 'Voice to Text';
                
                // Reset icon to microphone
                const icon = voiceBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-microphone';
                }
            }
        } else {
            console.warn('Voice input button not found in DOM');
        }
    }

    // Mute Control
    toggleMute() {
        this.isMuted = !this.isMuted;
        const muteBtn = document.getElementById('mascot-mute-btn');
        
        if (muteBtn) {
            if (this.isMuted) {
                muteBtn.classList.add('muted');
                muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
                muteBtn.title = 'Unmute Assistant';
                this.stopSpeaking();
            } else {
                muteBtn.classList.remove('muted');
                muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
                muteBtn.title = 'Mute Assistant';
            }
        }

        // Save mute state
        localStorage.setItem('ai_assistant_muted', this.isMuted);
    }

    // Voice Options Population
    populateVoiceOptions() {
        const voiceSelect = document.getElementById('speech-voice');
        if (!voiceSelect) return;

        const updateVoices = () => {
            const voices = this.speechSynthesis.getVoices();
            voiceSelect.innerHTML = '<option value="default">Default Voice</option>';
            
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            });
            
            // Set saved voice
            if (this.settings.selectedVoice) {
                voiceSelect.value = this.settings.selectedVoice;
            }
        };

        updateVoices();
        this.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    }

    // File Attachment
    setupFileAttachment() {
        const attachBtn = document.getElementById('attach-file-btn');
        if (attachBtn && !attachBtn.querySelector('input[type="file"]')) {
            // Create hidden file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*,.pdf,.txt,.doc,.docx';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            
            attachBtn.parentNode.appendChild(fileInput);
            
            attachBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }
    }

    handleFileSelection(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.addAttachedFile(file);
            }
        });
        
        this.updateFilePreview();
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/msword'];
        
        if (file.size > maxSize) {
            console.warn('File too large:', file.name);
            return false;
        }
        
        if (!allowedTypes.some(type => file.type.startsWith(type))) {
            console.warn('File type not allowed:', file.type);
            return false;
        }
        
        return true;
    }

    addAttachedFile(file) {
        const fileData = {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type
        };
        
        this.attachedFiles.push(fileData);
    }

    removeAttachedFile(fileId) {
        this.attachedFiles = this.attachedFiles.filter(f => f.id !== fileId);
        this.updateFilePreview();
    }

    updateFilePreview() {
        let previewContainer = document.querySelector('.file-preview');
        
        if (this.attachedFiles.length === 0) {
            if (previewContainer) {
                previewContainer.remove();
            }
            return;
        }
        
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.className = 'file-preview';
            
            const composer = document.querySelector('.composer');
            if (composer) {
                composer.insertBefore(previewContainer, composer.firstChild);
            }
        }
        
        // Rebuild preview content safely
        previewContainer.innerHTML = '';
        this.attachedFiles.forEach(fileData => {
            const item = document.createElement('div');
            item.className = 'file-preview-item';

            // Preview image or icon
            if (fileData.type && fileData.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.className = 'file-preview-image';
                img.alt = '';
                const objectUrl = URL.createObjectURL(fileData.file);
                img.src = objectUrl;
                // Revoke object URL after load to avoid memory leak
                img.addEventListener('load', () => URL.revokeObjectURL(objectUrl));
                item.appendChild(img);
            } else {
                const iconWrap = document.createElement('div');
                iconWrap.className = 'file-preview-image';
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-file';
                iconWrap.appendChild(icon);
                item.appendChild(iconWrap);
            }

            // Info
            const info = document.createElement('div');
            info.className = 'file-preview-info';
            const nameDiv = document.createElement('div');
            nameDiv.className = 'file-preview-name';
            nameDiv.textContent = this.escapeText(fileData.name);
            const sizeDiv = document.createElement('div');
            sizeDiv.className = 'file-preview-size';
            sizeDiv.textContent = this.formatFileSize(fileData.size);
            info.appendChild(nameDiv);
            info.appendChild(sizeDiv);
            item.appendChild(info);

            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'file-remove-btn';
            const xIcon = document.createElement('i');
            xIcon.className = 'fa-solid fa-times';
            removeBtn.appendChild(xIcon);
            removeBtn.addEventListener('click', () => this.removeAttachedFile(fileData.id));
            item.appendChild(removeBtn);

            previewContainer.appendChild(item);
        });
    }

    // Simple text escape helper to avoid DOM injection via filenames
    escapeText(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.textContent;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Settings Management
    loadSettings() {
        const saved = localStorage.getItem('voice_features_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        
        this.isMuted = localStorage.getItem('ai_assistant_muted') === 'true';
        this.updateSettingsUI();
    }

    saveSettings() {
        localStorage.setItem('voice_features_settings', JSON.stringify(this.settings));
    }

    updateSettingsUI() {
        const elements = {
            'enable-speech': this.settings.speechEnabled,
            'enable-voice-input': this.settings.voiceInputEnabled,
            'enable-audio-visualizer': this.settings.audioVisualizerEnabled,
            'speech-rate': this.settings.speechRate,
            'speech-voice': this.settings.selectedVoice
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
        
        // Update rate display
        const rateValue = document.querySelector('.range-value');
        if (rateValue) {
            rateValue.textContent = `${this.settings.speechRate}x`;
        }
    }

    setupEventListeners() {
        // Voice input button
        const voiceBtn = document.getElementById('voice-input-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        }

        // Mute button
        const muteBtn = document.getElementById('mascot-mute-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleMute());
        }

        // Settings event listeners
        document.addEventListener('change', (e) => {
            switch (e.target.id) {
                case 'enable-speech':
                    this.settings.speechEnabled = e.target.checked;
                    break;
                case 'enable-voice-input':
                    this.settings.voiceInputEnabled = e.target.checked;
                    break;
                case 'enable-audio-visualizer':
                    this.settings.audioVisualizerEnabled = e.target.checked;
                    break;
                case 'speech-rate':
                    this.settings.speechRate = parseFloat(e.target.value);
                    const rateValue = document.querySelector('.range-value');
                    if (rateValue) rateValue.textContent = `${this.settings.speechRate}x`;
                    break;
                case 'speech-voice':
                    this.settings.selectedVoice = e.target.value;
                    break;
            }
            
            if (['enable-speech', 'enable-voice-input', 'enable-audio-visualizer', 'speech-rate', 'speech-voice'].includes(e.target.id)) {
                this.saveSettings();
            }
        });
    }

    // Public methods for integration
    speakAIResponse(text) {
        if (text && this.settings.speechEnabled) {
            this.speak(text);
        }
    }

    getAttachedFiles() {
        return this.attachedFiles;
    }

    clearAttachedFiles() {
        this.attachedFiles = [];
        this.updateFilePreview();
    }
}

// Initialize voice features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.voiceManager) {
        window.voiceManager = new VoiceFeatureManager();
        console.log('✅ Voice Features Manager initialized');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceFeatureManager;
}
