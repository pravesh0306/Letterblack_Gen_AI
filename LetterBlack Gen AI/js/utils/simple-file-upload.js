/**
 * Simple File Upload Module for After Effects AI Extension
 * Handles image and audio upload, validation, and AI processing
 */

(function() {
    'use strict';

class SimpleFileUpload {
    constructor() {
        this.uploadedFiles = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.allowedAudioTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/mpeg'];
        this.allowedTypes = [...this.allowedImageTypes, ...this.allowedAudioTypes];
        this.init();
    }

    init() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadBtn = document.getElementById('image-upload-btn');
        const uploadInput = document.getElementById('image-upload-input');
        const removeBtn = document.getElementById('remove-image-btn');
        const composerMain = document.querySelector('.composer-main');

        if (uploadBtn && uploadInput) {
            // Update button text and input accept
            uploadBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
            `;
            uploadInput.setAttribute('accept', 'image/*,audio/*');

            // Upload button click
            uploadBtn.addEventListener('click', () => {
                uploadInput.click();
            });

            // File input change
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }

        // Remove file button
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeCurrentFile();
            });
        }

        // Drag and drop on composer
        if (composerMain) {
            composerMain.addEventListener('dragover', (e) => {
                e.preventDefault();
                composerMain.classList.add('drag-over');
            });

            composerMain.addEventListener('dragleave', () => {
                composerMain.classList.remove('drag-over');
            });

            composerMain.addEventListener('drop', (e) => {
                e.preventDefault();
                composerMain.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0]);
                }
            });
        }
    }

    async handleFileUpload(file) {
        this.logger.debug('📁 Handling file upload:', file.name, file.type);
        
        try {
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                this.showError(`File upload failed: ${validation.error}`);
                return;
            }

            // Show processing state
            this.showProcessingState(file);
            
            if (this.allowedImageTypes.includes(file.type)) {
                // Handle image upload
                await this.processImageFile(file);
            } else if (this.allowedAudioTypes.includes(file.type)) {
                // Handle audio upload
                await this.processAudioFile(file);
            }

        } catch (error) {
            this.logger.error('❌ File upload error:', error);
            this.showError(`File upload failed: ${error.message}`);
            this.hideProcessingState();
        }
    }

    async processImageFile(file) {
        const base64 = await this.fileToBase64(file);
        
        const fileData = {
            type: 'image',
            file: file,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            base64: base64,
            preview: base64 // Images can use base64 as preview
        };

        this.uploadedFiles = [fileData]; // Replace previous file
        this.updateUI(fileData);
        this.logger.debug('✅ Image uploaded successfully:', file.name);
    }

    async processAudioFile(file) {
        const base64 = await this.fileToBase64(file);
        
        const fileData = {
            type: 'audio',
            file: file,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            base64: base64,
            duration: await this.getAudioDuration(file),
            preview: null // Audio doesn't need visual preview
        };

        this.uploadedFiles = [fileData]; // Replace previous file
        this.updateUI(fileData);
        this.logger.debug('✅ Audio uploaded successfully:', file.name);
    }

    validateFile(file) {
        if (!file) {
            return { valid: false, error: 'No file selected' };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: `File type not supported. Allowed: Images (JPG, PNG, GIF, WebP) and Audio (MP3, WAV, OGG, M4A)` 
            };
        }

        if (file.size > this.maxFileSize) {
            return { 
                valid: false, 
                error: `File too large. Maximum size: ${(this.maxFileSize / 1024 / 1024).toFixed(1)}MB` 
            };
        }

        return { valid: true };
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async getAudioDuration(file) {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.addEventListener('loadedmetadata', () => {
                resolve(audio.duration || 0);
            });
            audio.addEventListener('error', () => {
                resolve(0); // Default to 0 if can't get duration
            });
            audio.src = URL.createObjectURL(file);
        });
    }

    updateUI(fileData) {
        const imagePreview = document.getElementById('image-preview');
        const fileName = document.getElementById('image-preview-name');
        const removeBtn = document.getElementById('remove-image-btn');

        if (fileData.type === 'image') {
            // Show image preview
            if (imagePreview) {
                imagePreview.style.display = 'block';
                imagePreview.src = fileData.preview;
                imagePreview.alt = fileData.name;
            }
            document.getElementById('image-preview-area').classList.remove('hidden');
        } else if (fileData.type === 'audio') {
            // Show audio file info
            if (imagePreview) {
                imagePreview.style.display = 'none';
            }
            
            // Create audio indicator if it doesn't exist
            let audioIndicator = document.getElementById('current-audio-indicator');
            if (!audioIndicator) {
                audioIndicator = document.createElement('div');
                audioIndicator.id = 'current-audio-indicator';
                audioIndicator.className = 'audio-file-indicator';
                audioIndicator.innerHTML = `
                    <div class="audio-icon">🎵</div>
                    <div class="audio-info">
                        <div class="audio-name"></div>
                        <div class="audio-details"></div>
                    </div>
                `;
                
                if (imagePreview && imagePreview.parentNode) {
                    imagePreview.parentNode.insertBefore(audioIndicator, imagePreview);
                }
            }
            
            if (audioIndicator) {
                audioIndicator.style.display = 'flex';
                const nameEl = audioIndicator.querySelector('.audio-name');
                const detailsEl = audioIndicator.querySelector('.audio-details');
                
                if (nameEl) nameEl.textContent = fileData.name;
                if (detailsEl) {
                    const duration = fileData.duration ? ` • ${Math.round(fileData.duration)}s` : '';
                    const size = `${(fileData.size / 1024 / 1024).toFixed(1)}MB`;
                    detailsEl.textContent = `${size}${duration}`;
                }
            }
        }

        // Update file name display
        if (fileName) {
            fileName.textContent = fileData.name;
            fileName.style.display = 'block';
        }

        // Show remove button
        if (removeBtn) {
            removeBtn.style.display = 'block';
        }

        this.hideProcessingState();
    }

    showProcessingState(file) {
        const fileName = document.getElementById('current-image-name');
        if (fileName) {
            fileName.textContent = `Processing ${file.name}...`;
            fileName.style.display = 'block';
        }
    }

    hideProcessingState() {
        // Processing indicators are handled by updateUI
    }

    removeCurrentFile() {
        this.uploadedFiles = [];
        
        // Hide image preview
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.style.display = 'none';
            imagePreview.src = '';
        }
        const imagePreviewArea = document.getElementById('image-preview-area');
        if (imagePreviewArea) {
            imagePreviewArea.classList.add('hidden');
        }

        // Hide audio indicator
        const audioIndicator = document.getElementById('current-audio-indicator');
        if (audioIndicator) {
            audioIndicator.style.display = 'none';
        }

        // Hide file name and remove button
        const fileName = document.getElementById('current-image-name');
        const removeBtn = document.getElementById('remove-image-btn');
        
        if (fileName) fileName.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'none';

        this.logger.debug('🗑️ File removed');
    }

    showError(message) {
        this.logger.error('❌', message);
        
        // Show toast notification
        if (window.simpleToast) {
            window.simpleToast.show(message, 'error');
        } else {
            alert(message);
        }
    }

    // Public methods for integration
    hasFiles() {
        return this.uploadedFiles.length > 0;
    }

    getCurrentFile() {
        return this.uploadedFiles.length > 0 ? this.uploadedFiles[0] : null;
    }

    getFileData() {
        const file = this.getCurrentFile();
        return file ? {
            type: file.type,
            base64: file.base64,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            duration: file.duration
        } : null;
    }

    clearFiles() {
        this.removeCurrentFile();
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.SimpleFileUpload = SimpleFileUpload;
}

})();
