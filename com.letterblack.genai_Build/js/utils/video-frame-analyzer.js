/**
 * VIDEO FRAME ANALYSIS MODULE
 * Analyzes specific frames from After Effects compositions
 */

class VideoFrameAnalyzer {
    constructor(aiModule, aeIntegration) {
        this.aiModule = aiModule;
        this.aeIntegration = aeIntegration;
        this.canvas = null;
        this.context = null;
        this.currentFrame = null;
        this.analysisCache = new Map();

        this.init();
    }

    init() {
        // Create analysis canvas
        this.createAnalysisCanvas();

        // Set up frame capture capabilities
        this.setupFrameCapture();

        console.log('🎬 Video Frame Analyzer initialized');
    }

    /**
     * Create canvas for frame analysis
     */
    createAnalysisCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1920;
        this.canvas.height = 1080;
        this.canvas.style.display = 'none';
        this.context = this.canvas.getContext('2d');

        document.body.appendChild(this.canvas);
    }

    /**
     * Setup frame capture from various sources
     */
    setupFrameCapture() {
        // Listen for frame capture events
        window.addEventListener('frameCaptured', (event) => {
            this.analyzeCapturedFrame(event.detail);
        });

        // Setup keyboard shortcuts for frame capture
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+F for frame capture
            if (event.ctrlKey && event.shiftKey && event.key === 'F') {
                event.preventDefault();
                this.captureCurrentFrame();
            }
        });
    }

    /**
     * Capture current frame from After Effects
     */
    async captureCurrentFrame() {
        try {
            if (!this.aeIntegration) {
                throw new Error('AE Integration not available');
            }

            console.log('📸 Capturing current frame...');

            // Get current composition frame
            const frameData = await this.aeIntegration.captureCurrentFrame();

            if (frameData) {
                await this.analyzeFrame(frameData);
            } else {
                console.warn('No frame data received from AE');
            }

        } catch (error) {
            console.error('Frame capture failed:', error);
            this.showError('Failed to capture frame: ' + error.message);
        }
    }

    /**
     * Analyze uploaded image/frame
     */
    async analyzeUploadedFrame(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const image = new Image();
                    image.onload = async () => {
                        // Draw image to canvas
                        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);

                        // Extract frame data
                        const frameData = {
                            imageData: this.context.getImageData(0, 0, this.canvas.width, this.canvas.height),
                            width: this.canvas.width,
                            height: this.canvas.height,
                            source: 'upload',
                            timestamp: Date.now()
                        };

                        const analysis = await this.analyzeFrame(frameData);
                        resolve(analysis);
                    };

                    image.src = event.target.result;
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Analyze frame data
     */
    async analyzeFrame(frameData) {
        console.log('🔍 Analyzing frame...');

        try {
            // Generate cache key
            const cacheKey = this.generateCacheKey(frameData);

            // Check cache first
            if (this.analysisCache.has(cacheKey)) {
                console.log('📖 Using cached frame analysis');
                return this.analysisCache.get(cacheKey);
            }

            // Extract visual features
            const visualFeatures = await this.extractVisualFeatures(frameData);

            // AI-powered analysis
            const aiAnalysis = await this.performAIAnalysis(frameData, visualFeatures);

            // Generate recommendations
            const recommendations = this.generateRecommendations(visualFeatures, aiAnalysis);

            const analysis = {
                frameData: frameData,
                visualFeatures: visualFeatures,
                aiAnalysis: aiAnalysis,
                recommendations: recommendations,
                timestamp: Date.now(),
                cacheKey: cacheKey
            };

            // Cache analysis
            this.analysisCache.set(cacheKey, analysis);

            // Limit cache size
            if (this.analysisCache.size > 20) {
                const firstKey = this.analysisCache.keys().next().value;
                this.analysisCache.delete(firstKey);
            }

            return analysis;

        } catch (error) {
            console.error('Frame analysis failed:', error);
            throw error;
        }
    }

    /**
     * Extract visual features from frame
     */
    async extractVisualFeatures(frameData) {
        const features = {
            composition: {},
            colors: {},
            elements: {},
            motion: {},
            effects: {}
        };

        try {
            const imageData = frameData.imageData;
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;

            // Analyze composition (rule of thirds, golden ratio)
            features.composition = this.analyzeComposition(data, width, height);

            // Extract color palette
            features.colors = this.extractColorPalette(data);

            // Detect visual elements
            features.elements = this.detectVisualElements(data, width, height);

            // Analyze motion blur and effects
            features.effects = this.analyzeEffects(data, width, height);

            // Estimate motion (if multiple frames available)
            features.motion = this.analyzeMotion(frameData);

        } catch (error) {
            console.warn('Visual feature extraction failed:', error);
        }

        return features;
    }

    /**
     * Analyze composition using rule of thirds and golden ratio
     */
    analyzeComposition(data, width, height) {
        const composition = {
            ruleOfThirds: { score: 0, alignment: [] },
            goldenRatio: { score: 0, alignment: [] },
            balance: { horizontal: 0, vertical: 0 },
            focus: { x: 0, y: 0, strength: 0 }
        };

        // Calculate brightness distribution
        const brightnessGrid = this.createBrightnessGrid(data, width, height, 3);

        // Rule of thirds analysis
        const thirdsX = [width / 3, 2 * width / 3];
        const thirdsY = [height / 3, 2 * height / 3];

        let ruleOfThirdsScore = 0;
        thirdsX.forEach(x => {
            thirdsY.forEach(y => {
                const gridX = Math.floor(x / (width / 3));
                const gridY = Math.floor(y / (height / 3));
                ruleOfThirdsScore += brightnessGrid[gridY][gridX];
            });
        });

        composition.ruleOfThirds.score = ruleOfThirdsScore / 4;

        // Balance analysis
        const leftBrightness = brightnessGrid.reduce((sum, row) =>
            sum + row[0] + row[1], 0) / (3 * 2);
        const rightBrightness = brightnessGrid.reduce((sum, row) =>
            sum + row[1] + row[2], 0) / (3 * 2);

        composition.balance.horizontal = Math.abs(leftBrightness - rightBrightness);

        return composition;
    }

    /**
     * Extract dominant colors from frame
     */
    extractColorPalette(data) {
        const colors = new Map();
        const colorCounts = {};

        // Sample colors (every 10th pixel for performance)
        for (let i = 0; i < data.length; i += 40) { // 4 bytes per pixel * 10
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = data[i + 3];

            if (alpha > 128) { // Only opaque pixels
                const colorKey = `${r},${g},${b}`;
                colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
            }
        }

        // Get top 8 colors
        const sortedColors = Object.entries(colorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        return {
            dominant: sortedColors[0] ? sortedColors[0][0].split(',').map(Number) : [0, 0, 0],
            palette: sortedColors.map(([color, count]) => ({
                rgb: color.split(',').map(Number),
                percentage: (count / Object.values(colorCounts).reduce((a, b) => a + b, 0)) * 100
            })),
            contrast: this.calculateContrast(sortedColors),
            saturation: this.calculateAverageSaturation(data)
        };
    }

    /**
     * Detect visual elements in the frame
     */
    detectVisualElements(data, width, height) {
        const elements = {
            text: { detected: false, confidence: 0, regions: [] },
            shapes: { detected: false, confidence: 0, types: [] },
            gradients: { detected: false, confidence: 0 },
            patterns: { detected: false, confidence: 0, types: [] }
        };

        // Simple edge detection for shapes
        const edges = this.detectEdges(data, width, height);
        const edgePercentage = (edges.reduce((sum, edge) => sum + edge, 0) / edges.length) * 100;

        if (edgePercentage > 30) {
            elements.shapes.detected = true;
            elements.shapes.confidence = Math.min(edgePercentage / 50, 1);
        }

        // Detect high contrast areas (potential text)
        const contrastMap = this.createContrastMap(data, width, height);
        const highContrastPixels = contrastMap.filter(contrast => contrast > 100).length;
        const textConfidence = highContrastPixels / (width * height);

        if (textConfidence > 0.05) {
            elements.text.detected = true;
            elements.text.confidence = Math.min(textConfidence * 20, 1);
        }

        return elements;
    }

    /**
     * Analyze visual effects and post-processing
     */
    analyzeEffects(data, width, height) {
        const effects = {
            blur: { detected: false, strength: 0 },
            noise: { detected: false, strength: 0 },
            vignette: { detected: false, strength: 0 },
            colorGrading: { detected: false, type: 'none' }
        };

        // Analyze blur by checking pixel variance
        const blurScore = this.calculateBlurScore(data, width, height);
        if (blurScore > 0.7) {
            effects.blur.detected = true;
            effects.blur.strength = blurScore;
        }

        // Analyze noise
        const noiseScore = this.calculateNoiseScore(data);
        if (noiseScore > 0.1) {
            effects.noise.detected = true;
            effects.noise.strength = noiseScore;
        }

        // Analyze vignette (darker corners)
        const vignetteScore = this.calculateVignetteScore(data, width, height);
        if (vignetteScore > 0.3) {
            effects.vignette.detected = true;
            effects.vignette.strength = vignetteScore;
        }

        return effects;
    }

    /**
     * Analyze motion (if frame sequence available)
     */
    analyzeMotion(frameData) {
        return {
            estimatedMotion: 'static', // Would need multiple frames for real motion analysis
            confidence: 0,
            direction: null,
            speed: 0
        };
    }

    /**
     * Perform AI analysis of the frame
     */
    async performAIAnalysis(frameData, visualFeatures) {
        if (!this.aiModule) {
            return { summary: 'AI analysis not available', suggestions: [] };
        }

        try {
            const prompt = `Analyze this After Effects frame/composition:

Visual Features:
- Composition: ${JSON.stringify(visualFeatures.composition)}
- Colors: ${visualFeatures.colors.palette.length} colors detected
- Elements: ${Object.keys(visualFeatures.elements).filter(key => visualFeatures.elements[key].detected).join(', ')}
- Effects: ${Object.keys(visualFeatures.effects).filter(key => visualFeatures.effects[key].detected).join(', ')}

Please provide:
1. Brief description of the frame
2. Technical analysis (lighting, composition, effects)
3. Suggestions for improvement
4. Similar techniques or styles to explore

Keep response focused and actionable.`;

            const aiResponse = await this.aiModule.generateResponse(prompt);

            return {
                summary: aiResponse,
                technicalAnalysis: this.parseTechnicalAnalysis(aiResponse),
                suggestions: this.parseSuggestions(aiResponse),
                timestamp: Date.now()
            };

        } catch (error) {
            console.warn('AI frame analysis failed:', error);
            return {
                summary: 'AI analysis temporarily unavailable',
                suggestions: ['Try basic composition analysis', 'Check color balance manually']
            };
        }
    }

    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(visualFeatures, aiAnalysis) {
        const recommendations = [];

        // Composition recommendations
        if (visualFeatures.composition.ruleOfThirds.score < 0.3) {
            recommendations.push({
                type: 'composition',
                priority: 'medium',
                message: 'Consider using rule of thirds for better composition',
                action: 'Adjust element positions to align with thirds grid'
            });
        }

        // Color recommendations
        if (visualFeatures.colors.contrast < 0.5) {
            recommendations.push({
                type: 'color',
                priority: 'high',
                message: 'Low contrast detected - improve readability',
                action: 'Increase contrast between foreground and background'
            });
        }

        // Effect recommendations
        if (visualFeatures.effects.blur.strength > 0.8) {
            recommendations.push({
                type: 'effects',
                priority: 'medium',
                message: 'Heavy blur detected - may reduce sharpness',
                action: 'Reduce blur amount or add sharpening'
            });
        }

        return recommendations;
    }

    /**
     * Helper methods for visual analysis
     */
    createBrightnessGrid(data, width, height, gridSize) {
        const grid = [];
        const cellWidth = width / gridSize;
        const cellHeight = height / gridSize;

        for (let y = 0; y < gridSize; y++) {
            grid[y] = [];
            for (let x = 0; x < gridSize; x++) {
                let brightness = 0;
                let pixelCount = 0;

                const startY = Math.floor(y * cellHeight);
                const endY = Math.floor((y + 1) * cellHeight);
                const startX = Math.floor(x * cellWidth);
                const endX = Math.floor((x + 1) * cellWidth);

                for (let py = startY; py < endY; py++) {
                    for (let px = startX; px < endX; px++) {
                        const index = (py * width + px) * 4;
                        const r = data[index];
                        const g = data[index + 1];
                        const b = data[index + 2];
                        brightness += (r + g + b) / 3;
                        pixelCount++;
                    }
                }

                grid[y][x] = pixelCount > 0 ? brightness / pixelCount / 255 : 0;
            }
        }

        return grid;
    }

    calculateContrast(colorPalette) {
        if (colorPalette.length < 2) return 0;

        const [color1, color2] = colorPalette.slice(0, 2).map(([color]) =>
            color.split(',').map(Number)
        );

        const lum1 = this.calculateLuminance(color1);
        const lum2 = this.calculateLuminance(color2);

        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);

        return (brightest - darkest) / brightest;
    }

    calculateLuminance(rgb) {
        const [r, g, b] = rgb.map(c => c / 255);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    calculateAverageSaturation(data) {
        let totalSaturation = 0;
        let pixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;

            totalSaturation += saturation;
            pixelCount++;
        }

        return pixelCount > 0 ? totalSaturation / pixelCount : 0;
    }

    detectEdges(data, width, height) {
        const edges = [];
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const index = ((y + ky) * width + (x + kx)) * 4;
                        const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;

                        gx += brightness * sobelX[(ky + 1) * 3 + (kx + 1)];
                        gy += brightness * sobelY[(ky + 1) * 3 + (kx + 1)];
                    }
                }

                const magnitude = Math.sqrt(gx * gx + gy * gy);
                edges.push(magnitude > 100 ? 1 : 0);
            }
        }

        return edges;
    }

    createContrastMap(data, width, height) {
        const contrastMap = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                // Simple contrast calculation with neighboring pixels
                let contrast = 0;
                const neighbors = [
                    [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
                ];

                neighbors.forEach(([nx, ny]) => {
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const nIndex = (ny * width + nx) * 4;
                        const nr = data[nIndex];
                        const ng = data[nIndex + 1];
                        const nb = data[nIndex + 2];

                        contrast += Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb);
                    }
                });

                contrastMap.push(contrast / 4);
            }
        }

        return contrastMap;
    }

    calculateBlurScore(data, width, height) {
        let totalVariance = 0;
        let pixelCount = 0;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const centerIndex = (y * width + x) * 4;
                const centerBrightness = (data[centerIndex] + data[centerIndex + 1] + data[centerIndex + 2]) / 3;

                let localVariance = 0;
                let localCount = 0;

                // Check 3x3 neighborhood
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;

                        const nIndex = ((y + dy) * width + (x + dx)) * 4;
                        const nBrightness = (data[nIndex] + data[nIndex + 1] + data[nIndex + 2]) / 3;

                        localVariance += Math.pow(centerBrightness - nBrightness, 2);
                        localCount++;
                    }
                }

                totalVariance += localVariance / localCount;
                pixelCount++;
            }
        }

        const averageVariance = pixelCount > 0 ? totalVariance / pixelCount : 0;
        return Math.min(averageVariance / 1000, 1); // Normalize to 0-1
    }

    calculateNoiseScore(data) {
        let totalNoise = 0;
        let pixelCount = 0;

        for (let i = 4; i < data.length; i += 4) {
            const current = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const previous = (data[i - 4] + data[i - 3] + data[i - 2]) / 3;

            totalNoise += Math.abs(current - previous);
            pixelCount++;
        }

        return pixelCount > 0 ? (totalNoise / pixelCount) / 255 : 0;
    }

    calculateVignetteScore(data, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        let totalBrightness = 0;
        let weightedBrightness = 0;
        let pixelCount = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;

                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const weight = 1 - (distance / maxDistance);

                totalBrightness += brightness;
                weightedBrightness += brightness * weight;
                pixelCount++;
            }
        }

        const averageBrightness = totalBrightness / pixelCount;
        const weightedAverage = weightedBrightness / pixelCount;

        return averageBrightness > 0 ? (averageBrightness - weightedAverage) / averageBrightness : 0;
    }

    /**
     * Generate cache key for frame data
     */
    generateCacheKey(frameData) {
        // Simple hash of frame data for caching
        const data = frameData.imageData ? frameData.imageData.data : frameData;
        let hash = 0;
        for (let i = 0; i < Math.min(data.length, 1000); i++) {
            hash = ((hash << 5) - hash) + data[i];
            hash = hash & hash; // Convert to 32-bit integer
        }
        return `frame_${Math.abs(hash)}_${frameData.timestamp || Date.now()}`;
    }

    /**
     * Parse AI response for technical analysis
     */
    parseTechnicalAnalysis(response) {
        // Simple parsing - could be enhanced with NLP
        const lines = response.split('\n');
        return {
            lighting: lines.find(line => /light/i.test(line)) || 'Standard lighting',
            composition: lines.find(line => /compos/i.test(line)) || 'Balanced composition',
            effects: lines.find(line => /effect/i.test(line)) || 'Minimal effects'
        };
    }

    /**
     * Parse AI response for suggestions
     */
    parseSuggestions(response) {
        const suggestions = [];
        const lines = response.split('\n');

        lines.forEach(line => {
            if (line.includes('•') || line.match(/^\d+\./) || line.includes('suggest')) {
                suggestions.push(line.replace(/^[•\d\.\-\s]+/, '').trim());
            }
        });

        return suggestions.length > 0 ? suggestions : ['Review composition balance', 'Check color contrast'];
    }

    /**
     * Show error message
     */
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    /**
     * Analyze captured frame from event
     */
    async analyzeCapturedFrame(frameData) {
        try {
            const analysis = await this.analyzeFrame(frameData);

            // Dispatch analysis complete event
            window.dispatchEvent(new CustomEvent('frameAnalysisComplete', {
                detail: analysis
            }));

            return analysis;
        } catch (error) {
            console.error('Captured frame analysis failed:', error);
            throw error;
        }
    }

    /**
     * Get analysis history
     */
    getAnalysisHistory() {
        return Array.from(this.analysisCache.values());
    }

    /**
     * Clear analysis cache
     */
    clearCache() {
        this.analysisCache.clear();
        console.log('🧹 Frame analysis cache cleared');
    }
}

// Export for global use
window.VideoFrameAnalyzer = VideoFrameAnalyzer;
