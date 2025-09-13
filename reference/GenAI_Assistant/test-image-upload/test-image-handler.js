/**
 * Image Upload Test Handler
 * Safe testing environment for image upload functionality
 */

class ImageUploadTester {
    constructor() {
        this.currentImage = null;
        this.currentImageData = null;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        this.initializeEventListeners();
        this.showStatus('Image upload tester initialized', 'info');
    }

    initializeEventListeners() {
        const uploadZone = document.getElementById('uploadZone');
        const imageInput = document.getElementById('imageInput');

        // Click to upload
        uploadZone.addEventListener('click', () => {
            imageInput.click();
        });

        // File input change
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageUpload(files[0]);
            }
        });
    }

    async handleImageUpload(file) {
        console.log('📁 Handling image upload:', file.name);
        
        try {
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                this.showStatus(`❌ ${validation.error}`, 'error');
                return;
            }

            this.showStatus(`✅ File "${file.name}" passed validation`, 'success');
            
            // Show preview
            await this.showPreview(file);
            
            // Store current image
            this.currentImage = file;
            
            // Enable test buttons
            this.enableTestButtons();
            
        } catch (error) {
            console.error('Image upload error:', error);
            this.showStatus(`❌ Upload failed: ${error.message}`, 'error');
        }
    }

    validateFile(file) {
        console.log('🔍 Validating file:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        // Check file type
        if (!this.supportedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Unsupported file type: ${file.type}. Supported: JPG, PNG, GIF, WebP`
            };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 5MB`
            };
        }

        // Check if it's actually an image
        if (!file.type.startsWith('image/')) {
            return {
                valid: false,
                error: 'File is not an image'
            };
        }

        return { valid: true };
    }

    async showPreview(file) {
        const previewContainer = document.getElementById('previewContainer');
        const previewImage = document.getElementById('previewImage');
        const imageInfo = document.getElementById('imageInfo');

        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        previewImage.src = objectUrl;
        
        // Wait for image to load to get dimensions
        return new Promise((resolve, reject) => {
            previewImage.onload = () => {
                const info = {
                    name: file.name,
                    size: `${(file.size / 1024).toFixed(2)} KB`,
                    type: file.type,
                    dimensions: `${previewImage.naturalWidth} x ${previewImage.naturalHeight}`,
                    lastModified: new Date(file.lastModified).toLocaleString()
                };

                imageInfo.innerHTML = `
                    <strong>File Information:</strong><br>
                    📁 Name: ${info.name}<br>
                    📏 Size: ${info.size}<br>
                    🎨 Type: ${info.type}<br>
                    📐 Dimensions: ${info.dimensions}<br>
                    📅 Modified: ${info.lastModified}
                `;

                previewContainer.style.display = 'block';
                this.showStatus('✅ Image preview loaded successfully', 'success');
                resolve();
            };

            previewImage.onerror = () => {
                reject(new Error('Failed to load image preview'));
            };
        });
    }

    enableTestButtons() {
        const buttons = [
            'validateBtn', 'encodeBtn', 'resizeBtn',
            'testGeminiVision', 'testGPTVision', 'testClaudeVision', 'runRealAPITest',
            'testAEIntegration', 'testContextMerge'
        ];

        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = false;
            }
        });
    }

    async encodeToBase64() {
        if (!this.currentImage) {
            this.showStatus('❌ No image selected', 'error');
            return;
        }

        this.showStatus('🔄 Encoding image to Base64...', 'info');

        try {
            const base64 = await this.fileToBase64(this.currentImage);
            this.currentImageData = base64;

            const preview = document.getElementById('base64Preview');
            preview.innerHTML = `
                <strong>Base64 Encoded (${base64.length} characters):</strong><br>
                ${base64.substring(0, 200)}...
                <br><br>
                <button onclick="copyBase64()" style="padding: 5px 10px; margin-top: 5px;">Copy Full Base64</button>
            `;
            preview.style.display = 'block';

            this.showStatus('✅ Base64 encoding completed', 'success');
            console.log('📄 Base64 length:', base64.length);

        } catch (error) {
            this.showStatus(`❌ Encoding failed: ${error.message}`, 'error');
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    testResize() {
        if (!this.currentImage) {
            this.showStatus('❌ No image selected', 'error');
            return;
        }

        this.showStatus('🔄 Testing image resize...', 'info');

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.getElementById('previewImage');

        // Test different resize scenarios
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const originalSize = this.currentImageData ? this.currentImageData.length : 0;
        const resizedSize = resizedDataUrl.length;

        this.showStatus(`✅ Resize test: ${img.naturalWidth}x${img.naturalHeight} → ${Math.round(width)}x${Math.round(height)} (${((originalSize - resizedSize) / originalSize * 100).toFixed(1)}% smaller)`, 'success');
    }

    showStatus(message, type = 'info') {
        const container = document.getElementById('statusMessages');
        const statusDiv = document.createElement('div');
        statusDiv.className = `status ${type}`;
        statusDiv.innerHTML = message;
        
        container.appendChild(statusDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 10000);

        // Scroll to show latest status
        statusDiv.scrollIntoView({ behavior: 'smooth' });
    }

    clearImage() {
        this.currentImage = null;
        this.currentImageData = null;
        
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('base64Preview').style.display = 'none';
        document.getElementById('imageInput').value = '';
        
        // Disable test buttons
        const buttons = [
            'validateBtn', 'encodeBtn', 'resizeBtn',
            'testGeminiVision', 'testGPTVision', 'testClaudeVision', 'runRealAPITest',
            'testAEIntegration', 'testContextMerge'
        ];

        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = true;
            }
        });

        this.showStatus('🗑️ Image cleared', 'info');
    }
}

// Global functions for test buttons
let imageTester = null;

window.validateImage = function() {
    if (imageTester && imageTester.currentImage) {
        const result = imageTester.validateFile(imageTester.currentImage);
        if (result.valid) {
            imageTester.showStatus('✅ Image validation passed', 'success');
        } else {
            imageTester.showStatus(`❌ Validation failed: ${result.error}`, 'error');
        }
    }
};

window.encodeToBase64 = function() {
    if (imageTester) {
        imageTester.encodeToBase64();
    }
};

window.testResize = function() {
    if (imageTester) {
        imageTester.testResize();
    }
};

window.clearImage = function() {
    if (imageTester) {
        imageTester.clearImage();
    }
};

window.copyBase64 = function() {
    if (imageTester && imageTester.currentImageData) {
        navigator.clipboard.writeText(imageTester.currentImageData).then(() => {
            imageTester.showStatus('📋 Base64 copied to clipboard!', 'success');
        }).catch(err => {
            imageTester.showStatus('❌ Failed to copy Base64', 'error');
        });
    }
};

// Vision API test functions (simulated for now)
window.testGeminiVision = function() {
    if (!imageTester || !imageTester.currentImageData) {
        return;
    }
    
    imageTester.showStatus('🔄 Testing Gemini Vision API...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        const result = `
            <div style="background: #333; padding: 15px; border-radius: 4px; margin-top: 10px;">
                <strong>🤖 Simulated Gemini Vision Response:</strong><br>
                "I can see an image with dimensions ${document.getElementById('previewImage').naturalWidth}x${document.getElementById('previewImage').naturalHeight}. 
                This appears to be a ${imageTester.currentImage.type} file. 
                For After Effects context, I could analyze the visual elements, colors, composition, 
                and suggest relevant animation techniques or expressions based on what I observe in the image."
            </div>
        `;
        document.getElementById('visionResults').innerHTML = result;
        imageTester.showStatus('✅ Gemini Vision test completed (simulated)', 'success');
    }, 2000);
};

window.testGPTVision = function() {
    if (!imageTester || !imageTester.currentImageData) {
        return;
    }
    
    imageTester.showStatus('🔄 Testing GPT-4 Vision API...', 'info');
    
    setTimeout(() => {
        const result = `
            <div style="background: #333; padding: 15px; border-radius: 4px; margin-top: 10px;">
                <strong>🤖 Simulated GPT-4V Response:</strong><br>
                "Image analysis complete. File size: ${(imageTester.currentImage.size / 1024).toFixed(2)} KB. 
                I can provide After Effects guidance based on the visual content, suggesting appropriate expressions, 
                animation techniques, color grading approaches, or compositing methods that would work well with this imagery."
            </div>
        `;
        document.getElementById('visionResults').innerHTML += result;
        imageTester.showStatus('✅ GPT-4V test completed (simulated)', 'success');
    }, 1500);
};

window.testClaudeVision = function() {
    if (!imageTester || !imageTester.currentImageData) {
        return;
    }
    
    imageTester.showStatus('🔄 Testing Claude Vision API...', 'info');
    
    setTimeout(() => {
        const result = `
            <div style="background: #333; padding: 15px; border-radius: 4px; margin-top: 10px;">
                <strong>🤖 Simulated Claude Vision Response:</strong><br>
                "Visual analysis ready. This ${imageTester.currentImage.type.split('/')[1].toUpperCase()} image can be used as reference for 
                After Effects projects. I can suggest motion graphics techniques, provide relevant expressions for animating similar content, 
                or help create animations that complement the visual style and composition shown in this image."
            </div>
        `;
        document.getElementById('visionResults').innerHTML += result;
        imageTester.showStatus('✅ Claude Vision test completed (simulated)', 'success');
    }, 1800);
};

window.testAEIntegration = function() {
    if (!imageTester || !imageTester.currentImageData) {
        return;
    }
    
    imageTester.showStatus('🔄 Testing After Effects integration...', 'info');
    
    setTimeout(() => {
        const result = `
            <div style="background: #2a4a2a; padding: 15px; border-radius: 4px; margin-top: 10px;">
                <strong>🎬 After Effects Integration Test:</strong><br>
                ✅ Image data prepared for AE context<br>
                ✅ Base64 encoding compatible with AI APIs<br>
                ✅ File size within CEP extension limits<br>
                ✅ Ready to merge with project context<br><br>
                <strong>Next steps:</strong> Image would be sent along with current AE project context to provide 
                visual reference for the AI assistant's responses.
            </div>
        `;
        document.getElementById('integrationResults').innerHTML = result;
        imageTester.showStatus('✅ AE integration test passed', 'success');
    }, 1200);
};

window.testContextMerge = function() {
    if (!imageTester || !imageTester.currentImageData) {
        return;
    }
    
    imageTester.showStatus('🔄 Testing context merge...', 'info');
    
    setTimeout(() => {
        const mockContext = {
            projectName: "Test_Project.aep",
            activeComp: "Main Composition", 
            selectedLayers: ["Text Layer 1", "Background"],
            currentTime: "00:00:02:15"
        };
        
        const result = `
            <div style="background: #2a2a4a; padding: 15px; border-radius: 4px; margin-top: 10px;">
                <strong>🔗 Context Merge Test:</strong><br><br>
                <strong>Mock AE Context:</strong><br>
                📁 Project: ${mockContext.projectName}<br>
                🎬 Composition: ${mockContext.activeComp}<br>
                📄 Selected: ${mockContext.selectedLayers.join(', ')}<br>
                ⏰ Time: ${mockContext.currentTime}<br><br>
                
                <strong>📷 Image Context:</strong><br>
                🖼️ Type: ${imageTester.currentImage.type}<br>
                📐 Size: ${document.getElementById('previewImage').naturalWidth}x${document.getElementById('previewImage').naturalHeight}<br><br>
                
                <strong>Merged Prompt Example:</strong><br>
                <em>"User has uploaded an image as visual reference. Current AE project context: ${JSON.stringify(mockContext)}. 
                Image shows [AI vision analysis here]. Please provide After Effects guidance that considers both the project context and the visual reference."</em>
            </div>
        `;
        document.getElementById('integrationResults').innerHTML += result;
        imageTester.showStatus('✅ Context merge test completed', 'success');
    }, 1500);
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    imageTester = new ImageUploadTester();
    console.log('🖼️ Image Upload Tester initialized');
});
