/**
 * Simple File Upload Module for After Effects AI Extension
 * Handles image and audio upload, validation, and UI updates.
 */

// --- TYPE DEFINITIONS ---

type FileType = 'image' | 'audio';

interface UploadedFile {
    type: FileType;
    file: File;
    name: string;
    size: number;
    mimeType: string;
    base64: string;
    previewUrl?: string; // For image previews
    duration?: number;   // For audio files
}

interface FileValidationResult {
    valid: boolean;
    error?: string;
}

// Assuming a global simpleToast object for notifications
declare const simpleToast: {
    show(message: string, type: 'error' | 'success' | 'info'): void;
};

class SimpleFileUpload {
    private uploadedFiles: UploadedFile[] = [];
    private maxFileSize: number = 10 * 1024 * 1024; // 10MB
    private allowedImageTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private allowedAudioTypes: string[] = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/mpeg'];
    private allowedTypes: string[] = [...this.allowedImageTypes, ...this.allowedAudioTypes];

    // DOM Elements
    private uploadBtn: HTMLElement | null;
    private uploadInput: HTMLInputElement | null;
    private removeBtn: HTMLElement | null;
    private composerMain: HTMLElement | null;
    private previewArea: HTMLElement | null;
    private previewImage: HTMLImageElement | null;
    private previewName: HTMLElement | null;

    constructor() {
        // Bind methods
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.handleDragDrop = this.handleDragDrop.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDragLeave = this.handleDragLeave.bind(this);
        this.removeCurrentFile = this.removeCurrentFile.bind(this);
    }

    public init(): void {
        this.queryDOMElements();
        this.attachEventListeners();
    }

    private queryDOMElements(): void {
        this.uploadBtn = document.getElementById('image-upload-btn');
        this.uploadInput = document.getElementById('image-upload-input');
        this.removeBtn = document.getElementById('remove-image-btn');
        this.composerMain = document.querySelector('.composer-main');
        this.previewArea = document.getElementById('image-preview-area');
        this.previewImage = document.getElementById('image-preview') as HTMLImageElement;
        this.previewName = document.getElementById('image-preview-name');
    }

    private attachEventListeners(): void {
        if (this.uploadBtn && this.uploadInput) {
            this.uploadBtn.addEventListener('click', () => this.uploadInput?.click());
            this.uploadInput.addEventListener('change', this.handleFileSelect);
        }

        if (this.removeBtn) {
            this.removeBtn.addEventListener('click', this.removeCurrentFile);
        }

        if (this.composerMain) {
            this.composerMain.addEventListener('dragover', this.handleDragOver);
            this.composerMain.addEventListener('dragleave', this.handleDragLeave);
            this.composerMain.addEventListener('drop', this.handleDragDrop);
        }
    }

    private handleFileSelect(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            this.processFile(target.files[0]);
        }
    }

    private handleDragOver(event: DragEvent): void {
        event.preventDefault();
        this.composerMain?.classList.add('drag-over');
    }

    private handleDragLeave(): void {
        this.composerMain?.classList.remove('drag-over');
    }

    private handleDragDrop(event: DragEvent): void {
        event.preventDefault();
        this.composerMain?.classList.remove('drag-over');
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
            this.processFile(event.dataTransfer.files[0]);
        }
    }

    private async processFile(file: File): Promise<void> {
        console.log('📁 Handling file upload:', file.name, file.type);

        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.showError(validation.error || 'Invalid file.');
            return;
        }

        this.setProcessingState(true, file.name);

        try {
            const base64 = await this.fileToBase64(file);
            let uploadedFile: UploadedFile;

            if (this.allowedImageTypes.includes(file.type)) {
                uploadedFile = {
                    type: 'image',
                    file, name: file.name, size: file.size, mimeType: file.type, base64,
                    previewUrl: base64
                };
            } else { // Audio file
                const duration = await this.getAudioDuration(file);
                uploadedFile = {
                    type: 'audio',
                    file, name: file.name, size: file.size, mimeType: file.type, base64,
                    duration
                };
            }
            
            this.uploadedFiles = [uploadedFile]; // Replace any existing file
            this.updateUI(uploadedFile);
            console.log(`✅ ${uploadedFile.type} uploaded:`, file.name);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            console.error('❌ File processing error:', errorMessage);
            this.showError(`File upload failed: ${errorMessage}`);
        } finally {
            this.setProcessingState(false);
        }
    }

    private validateFile(file: File): FileValidationResult {
        if (!this.allowedTypes.includes(file.type)) {
            return { valid: false, error: 'File type not supported.' };
        }
        if (file.size > this.maxFileSize) {
            return { valid: false, error: `File exceeds ${this.maxFileSize / 1024 / 1024}MB limit.` };
        }
        return { valid: true };
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    private getAudioDuration(file: File): Promise<number> {
        return new Promise((resolve) => {
            const audio = new Audio(URL.createObjectURL(file));
            audio.onloadedmetadata = () => {
                URL.revokeObjectURL(audio.src);
                resolve(audio.duration);
            };
            audio.onerror = () => {
                URL.revokeObjectURL(audio.src);
                resolve(0); // Resolve with 0 if duration can't be read
            };
        });
    }

    private updateUI(fileData: UploadedFile): void {
        if (!this.previewArea || !this.previewImage || !this.previewName || !this.removeBtn) return;

        this.previewArea.classList.remove('hidden');
        this.removeBtn.style.display = 'block';
        this.previewName.textContent = fileData.name;
        this.previewName.style.display = 'block';

        // Clear previous audio indicator if it exists
        const existingAudioIndicator = document.getElementById('current-audio-indicator');
        if (existingAudioIndicator) existingAudioIndicator.remove();

        if (fileData.type === 'image' && fileData.previewUrl) {
            this.previewImage.src = fileData.previewUrl;
            this.previewImage.alt = fileData.name;
            this.previewImage.style.display = 'block';
        } else if (fileData.type === 'audio') {
            this.previewImage.style.display = 'none';
            this.createAudioIndicator(fileData);
        }
    }

    private createAudioIndicator(fileData: UploadedFile): void {
        const audioIndicator = document.createElement('div');
        audioIndicator.id = 'current-audio-indicator';
        audioIndicator.className = 'audio-file-indicator';
        
        const duration = fileData.duration ? ` • ${Math.round(fileData.duration)}s` : '';
        const size = `${(fileData.size / 1024 / 1024).toFixed(1)}MB`;

        audioIndicator.innerHTML = `
            <div class="audio-icon">🎵</div>
            <div class="audio-info">
                <div class="audio-name">${fileData.name}</div>
                <div class="audio-details">${size}${duration}</div>
            </div>
        `;
        this.previewArea?.prepend(audioIndicator);
    }

    private removeCurrentFile(): void {
        this.uploadedFiles = [];
        if (this.previewArea) this.previewArea.classList.add('hidden');
        if (this.previewImage) {
            this.previewImage.src = '';
            this.previewImage.style.display = 'none';
        }
        const audioIndicator = document.getElementById('current-audio-indicator');
        if (audioIndicator) audioIndicator.remove();
        if (this.previewName) this.previewName.style.display = 'none';
        if (this.removeBtn) this.removeBtn.style.display = 'none';
        if (this.uploadInput) this.uploadInput.value = ''; // Reset input
        console.log('🗑️ File removed.');
    }

    private setProcessingState(isProcessing: boolean, fileName: string = ''): void {
        if (this.previewName) {
            this.previewName.textContent = isProcessing ? `Processing ${fileName}...` : '';
            this.previewName.style.display = isProcessing ? 'block' : 'none';
        }
    }

    private showError(message: string): void {
        console.error('❌', message);
        if (typeof simpleToast !== 'undefined' && simpleToast.show) {
            simpleToast.show(message, 'error');
        } else {
            alert(message);
        }
    }

    // --- Public API ---

    public hasFiles(): boolean {
        return this.uploadedFiles.length > 0;
    }

    public getCurrentFile(): UploadedFile | null {
        return this.uploadedFiles[0] || null;
    }

    public getFileDataForAI(): { type: FileType; base64: string; name: string; mimeType: string; } | null {
        const file = this.getCurrentFile();
        return file ? {
            type: file.type,
            base64: file.base64,
            name: file.name,
            mimeType: file.mimeType,
        } : null;
    }

    public clearFiles(): void {
        this.removeCurrentFile();
    }

    public destroy(): void {
        // Clean up event listeners
        if (this.uploadBtn && this.uploadInput) {
            this.uploadBtn.removeEventListener('click', () => this.uploadInput?.click());
            this.uploadInput.removeEventListener('change', this.handleFileSelect);
        }
        if (this.removeBtn) {
            this.removeBtn.removeEventListener('click', this.removeCurrentFile);
        }
        if (this.composerMain) {
            this.composerMain.removeEventListener('dragover', this.handleDragOver);
            this.composerMain.removeEventListener('dragleave', this.handleDragLeave);
            this.composerMain.removeEventListener('drop', this.handleDragDrop);
        }
        console.log('SimpleFileUpload listeners cleaned up.');
    }
}

export default new SimpleFileUpload();