/**
 * Local File Storage Manager
 * Handles file operations, storage, and processing
 * Converted from React/TypeScript file management patterns to pure JavaScript
 */

class LocalFileStorageManager {
    constructor() {
        this.storageKey = 'adobe-ai-files';
        this.tempStorageKey = 'adobe-ai-temp-files';
        this.maxStorageSize = 100 * 1024 * 1024; // 100MB default
        this.supportedFormats = {
            images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
            videos: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
            audio: ['.mp3', '.wav', '.aac', '.flac', '.ogg'],
            documents: ['.pdf', '.txt', '.md', '.json', '.csv', '.xml'],
            code: ['.js', '.ts', '.jsx', '.tsx', '.css', '.html', '.py', '.cpp'],
            archives: ['.zip', '.rar', '.7z', '.tar', '.gz'],
            models: ['.obj', '.fbx', '.gltf', '.glb', '.stl', '.ply']
        };

        this.files = new Map();
        this.tempFiles = new Map();
        this.uploadQueue = [];
        this.processing = false;
        this.observers = new Set();

        this.init();
    }

    /**
     * Initialize the file storage manager
     */
    async init() {
        await this.loadStoredFiles();
        this.setupEventListeners();
        this.startCleanupTimer();
        console.log('✅ Local File Storage Manager initialized');
    }

    /**
     * Load files from localStorage
     */
    async loadStoredFiles() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const fileData = JSON.parse(stored);
                Object.entries(fileData).forEach(([id, file]) => {
                    this.files.set(id, {
                        ...file,
                        createdAt: new Date(file.createdAt),
                        modifiedAt: new Date(file.modifiedAt)
                    });
                });
            }

            const tempStored = localStorage.getItem(this.tempStorageKey);
            if (tempStored) {
                const tempData = JSON.parse(tempStored);
                Object.entries(tempData).forEach(([id, file]) => {
                    this.tempFiles.set(id, {
                        ...file,
                        createdAt: new Date(file.createdAt)
                    });
                });
            }
        } catch (error) {
            console.warn('Failed to load stored files:', error);
        }
    }

    /**
     * Save files to localStorage
     */
    saveFiles() {
        try {
            const fileData = Object.fromEntries(this.files);
            localStorage.setItem(this.storageKey, JSON.stringify(fileData));

            const tempData = Object.fromEntries(this.tempFiles);
            localStorage.setItem(this.tempStorageKey, JSON.stringify(tempData));
        } catch (error) {
            console.error('Failed to save files:', error);
            this.cleanupOldFiles(); // Try to free space
        }
    }

    /**
     * Add a file to storage
     */
    async addFile(file, options = {}) {
        const fileId = this.generateFileId();
        const metadata = await this.extractMetadata(file);

        const fileRecord = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            category: this.categorizeFile(file),
            metadata,
            data: options.storeData ? await this.fileToBase64(file) : null,
            url: options.createURL ? URL.createObjectURL(file) : null,
            createdAt: new Date(),
            modifiedAt: new Date(),
            tags: options.tags || [],
            description: options.description || '',
            INTERIM: options.temporary || false
        };

        if (fileRecord.temporary) {
            this.tempFiles.set(fileId, fileRecord);
        } else {
            this.files.set(fileId, fileRecord);
        }

        this.saveFiles();
        this.notifyObservers('file_added', fileRecord);

        return fileId;
    }

    /**
     * Get a file by ID
     */
    getFile(fileId) {
        return this.files.get(fileId) || this.tempFiles.get(fileId);
    }

    /**
     * Get all files
     */
    getAllFiles(includeTemp = false) {
        const allFiles = Array.from(this.files.values());
        if (includeTemp) {
            allFiles.push(...Array.from(this.tempFiles.values()));
        }
        return allFiles;
    }

    /**
     * Delete a file
     */
    deleteFile(fileId) {
        const file = this.getFile(fileId);
        if (!file) {return false;}

        // Cleanup URL if exists
        if (file.url) {
            URL.revokeObjectURL(file.url);
        }

        const deleted = this.files.delete(fileId) || this.tempFiles.delete(fileId);
        if (deleted) {
            this.saveFiles();
            this.notifyObservers('file_deleted', { id: fileId, file });
        }

        return deleted;
    }

    /**
     * Update file metadata
     */
    updateFile(fileId, updates) {
        const file = this.getFile(fileId);
        if (!file) {return false;}

        Object.assign(file, updates, { modifiedAt: new Date() });
        this.saveFiles();
        this.notifyObservers('file_updated', file);

        return true;
    }

    /**
     * Search files
     */
    searchFiles(query, filters = {}) {
        const allFiles = this.getAllFiles(filters.includeTemp);

        return allFiles.filter(file => {
            // Text search
            if (query) {
                const searchText = `${file.name} ${file.description} ${file.tags.join(' ')}`.toLowerCase();
                if (!searchText.includes(query.toLowerCase())) {
                    return false;
                }
            }

            // Category filter
            if (filters.category && file.category !== filters.category) {
                return false;
            }

            // Size filter
            if (filters.maxSize && file.size > filters.maxSize) {
                return false;
            }

            // Date filter
            if (filters.since && file.createdAt < filters.since) {
                return false;
            }

            return true;
        });
    }

    /**
     * Process file upload queue
     */
    async processUploadQueue() {
        if (this.processing || this.uploadQueue.length === 0) {return;}

        this.processing = true;
        this.notifyObservers('processing_started', { queueLength: this.uploadQueue.length });

        try {
            while (this.uploadQueue.length > 0) {
                const item = this.uploadQueue.shift();
                await this.processFileUpload(item);
            }
        } catch (error) {
            console.error('Error processing upload queue:', error);
        } finally {
            this.processing = false;
            this.notifyObservers('processing_finished');
        }
    }

    /**
     * Process individual file upload
     */
    async processFileUpload({ file, options, resolve, reject }) {
        try {
            this.notifyObservers('file_processing', { name: file.name, size: file.size });

            // Validate file
            if (!this.validateFile(file)) {
                throw new Error(`Unsupported file type: ${file.type}`);
            }

            // Check storage space
            if (!this.hasStorageSpace(file.size)) {
                throw new Error('Insufficient storage space');
            }

            // Add file
            const fileId = await this.addFile(file, options);

            this.notifyObservers('file_processed', { id: fileId, name: file.name });
            resolve(fileId);
        } catch (error) {
            this.notifyObservers('file_error', { name: file.name, error: error.message });
            reject(error);
        }
    }

    /**
     * Queue file for processing
     */
    queueFile(file, options = {}) {
        return new Promise((resolve, reject) => {
            this.uploadQueue.push({ file, options, resolve, reject });
            this.processUploadQueue();
        });
    }

    /**
     * Create file drag and drop handler
     */
    createDropZone(element, options = {}) {
        const dropZone = {
            element,
            options: {
                multiple: true,
                acceptedTypes: Object.values(this.supportedFormats).flat(),
                maxSize: 50 * 1024 * 1024, // 50MB
                ...options
            }
        };

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Visual feedback
        ['dragenter', 'dragover'].forEach(eventName => {
            element.addEventListener(eventName, () => {
                element.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, () => {
                element.classList.remove('drag-over');
            });
        });

        // Handle file drop
        element.addEventListener('drop', async (e) => {
            const files = Array.from(e.dataTransfer.files);

            for (const file of files) {
                if (this.validateFile(file, dropZone.options)) {
                    try {
                        await this.queueFile(file, options);
                    } catch (error) {
                        console.error('Failed to process dropped file:', error);
                    }
                }
            }
        });

        return dropZone;
    }

    /**
     * Extract file metadata
     */
    async extractMetadata(file) {
        const metadata = {
            lastModified: file.lastModified ? new Date(file.lastModified) : null,
            webkitRelativePath: file.webkitRelativePath || null
        };

        // Image metadata
        if (file.type.startsWith('image/')) {
            try {
                const dimensions = await this.getImageDimensions(file);
                metadata.width = dimensions.width;
                metadata.height = dimensions.height;
            } catch (error) {
                console.warn('Failed to extract image dimensions:', error);
            }
        }

        // Video metadata
        if (file.type.startsWith('video/')) {
            try {
                const videoData = await this.getVideoMetadata(file);
                metadata.duration = videoData.duration;
                metadata.videoWidth = videoData.videoWidth;
                metadata.videoHeight = videoData.videoHeight;
            } catch (error) {
                console.warn('Failed to extract video metadata:', error);
            }
        }

        return metadata;
    }

    /**
     * Get image dimensions
     */
    getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Get video metadata
     */
    getVideoMetadata(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.onloadedmetadata = () => {
                resolve({
                    duration: video.duration,
                    videoWidth: video.videoWidth,
                    videoHeight: video.videoHeight
                });
            };
            video.onerror = reject;
            video.src = URL.createObjectURL(file);
        });
    }

    /**
     * Categorize file by type
     */
    categorizeFile(file) {
        const extension = `.${ file.name.split('.').pop().toLowerCase()}`;

        for (const [category, extensions] of Object.entries(this.supportedFormats)) {
            if (extensions.includes(extension)) {
                return category;
            }
        }

        return 'unknown';
    }

    /**
     * Validate file
     */
    validateFile(file, options = {}) {
        // Check file size
        const maxSize = options.maxSize || this.maxStorageSize;
        if (file.size > maxSize) {
            return false;
        }

        // Check file type
        if (options.acceptedTypes) {
            const extension = `.${ file.name.split('.').pop().toLowerCase()}`;
            if (!options.acceptedTypes.includes(extension)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check available storage space
     */
    hasStorageSpace(requiredSize) {
        const currentSize = this.getTotalStorageSize();
        return (currentSize + requiredSize) <= this.maxStorageSize;
    }

    /**
     * Get total storage size
     */
    getTotalStorageSize() {
        let totalSize = 0;

        this.files.forEach(file => {
            if (file.data) {
                totalSize += file.size;
            }
        });

        this.tempFiles.forEach(file => {
            if (file.data) {
                totalSize += file.size;
            }
        });

        return totalSize;
    }

    /**
     * Clean up old temporary files
     */
    cleanupOldFiles() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        let cleaned = 0;

        this.tempFiles.forEach((file, id) => {
            if (now - file.createdAt.getTime() > maxAge) {
                this.deleteFile(id);
                cleaned++;
            }
        });

        if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} old temporary files`);
        }
    }

    /**
     * Convert file to base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Generate unique file ID
     */
    generateFileId() {
        return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Subscribe to file storage events
     */
    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    /**
     * Notify observers of events
     */
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in file storage observer:', error);
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Storage space warnings
        this.subscribe((event, data) => {
            if (event === 'file_added' && this.getTotalStorageSize() > this.maxStorageSize * 0.9) {
                console.warn('Storage space is running low');
            }
        });
    }

    /**
     * Start cleanup timer
     */
    startCleanupTimer() {
        // Clean up every hour
        setInterval(() => {
            this.cleanupOldFiles();
        }, 60 * 60 * 1000);

        // Initial cleanup
        this.cleanupOldFiles();
    }

    /**
     * Export files to ZIP
     */
    async exportFiles(fileIds = null) {
        const filesToExport = fileIds ?
            fileIds.map(id => this.getFile(id)).filter(Boolean) :
            this.getAllFiles();

        // This would need a ZIP library in a real implementation
        console.log('Exporting files:', filesToExport.map(f => f.name));

        return filesToExport;
    }

    /**
     * Get storage statistics
     */
    getStorageStats() {
        const files = this.getAllFiles(true);
        const stats = {
            totalFiles: files.length,
            totalSize: this.getTotalStorageSize(),
            categories: {},
            averageSize: 0
        };

        files.forEach(file => {
            stats.categories[file.category] = (stats.categories[file.category] || 0) + 1;
        });

        stats.averageSize = stats.totalFiles > 0 ? stats.totalSize / stats.totalFiles : 0;

        return stats;
    }
}

// Export for use in other modules
window.LocalFileStorageManager = LocalFileStorageManager;

// Auto-initialize if not already done
if (!window.fileStorageManager) {
    window.fileStorageManager = new LocalFileStorageManager();
    console.log('✅ Local File Storage Manager initialized');
}

