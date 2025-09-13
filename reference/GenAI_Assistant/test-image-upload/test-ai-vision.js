/**
 * Vision API Test Module
 * Tests actual API calls with real providers (when API keys are provided)
 */

class VisionAPITester {
    constructor() {
        this.apiKeys = {
            google: null,
            openai: null,
            claude: null
        };
    }

    // Load API keys from localStorage (same format as main extension)
    loadAPIKeys() {
        try {
            const settings = JSON.parse(localStorage.getItem('ae_extension_settings') || '{}');
            this.apiKeys.google = settings.apiKey || null;
            // For testing, we'll use the same key for different providers
            // In real implementation, each provider would have separate keys
            return !!this.apiKeys.google;
        } catch (error) {
            console.error('Failed to load API keys:', error);
            return false;
        }
    }

    async testGoogleGeminiVision(imageBase64, userMessage = "Describe this image in the context of After Effects.") {
        if (!this.apiKeys.google) {
            throw new Error('Google API key not found');
        }

        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
        
        // Extract base64 data and mime type
        const [mimeType, base64Data] = imageBase64.split(',');
        const mimeTypeClean = mimeType.match(/data:(.+);base64/)[1];

        const payload = {
            contents: [{
                parts: [
                    {
                        text: userMessage
                    },
                    {
                        inline_data: {
                            mime_type: mimeTypeClean,
                            data: base64Data
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024
            }
        };

        try {
            const response = await fetch(`${url}?key=${this.apiKeys.google}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Unexpected response format from Gemini Vision API');
            }

        } catch (error) {
            console.error('Gemini Vision API error:', error);
            throw error;
        }
    }

    async testOpenAIVision(imageBase64, userMessage = "Analyze this image for After Effects workflow suggestions.") {
        if (!this.apiKeys.openai) {
            throw new Error('OpenAI API key not found');
        }

        const url = 'https://api.openai.com/v1/chat/completions';
        
        const payload = {
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: userMessage
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageBase64,
                                detail: "low" // Use "low" for faster/cheaper processing
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.openai}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                throw new Error('Unexpected response format from OpenAI Vision API');
            }

        } catch (error) {
            console.error('OpenAI Vision API error:', error);
            throw error;
        }
    }

    async testClaudeVision(imageBase64, userMessage = "Provide After Effects guidance based on this image.") {
        // Note: Claude Vision API integration would go here
        // For now, return a simulated response
        throw new Error('Claude Vision API integration not yet implemented in test environment');
    }

    // Utility function to validate image for vision APIs
    validateImageForVision(imageBase64) {
        const [mimeType, base64Data] = imageBase64.split(',');
        
        // Check if it's a valid data URL
        if (!mimeType.startsWith('data:image/')) {
            return { valid: false, error: 'Invalid image data URL' };
        }

        // Check size (most vision APIs have limits)
        const sizeInBytes = Math.ceil(base64Data.length * 3/4);
        const maxSize = 20 * 1024 * 1024; // 20MB limit for vision APIs
        
        if (sizeInBytes > maxSize) {
            return { 
                valid: false, 
                error: `Image too large for Vision API: ${(sizeInBytes/1024/1024).toFixed(2)}MB (max 20MB)` 
            };
        }

        return { valid: true };
    }

    // Create a comprehensive test report
    async runComprehensiveTest(imageBase64) {
        const results = {
            timestamp: new Date().toISOString(),
            imageSize: Math.ceil(imageBase64.split(',')[1].length * 3/4),
            tests: {}
        };

        // Test image validation
        const validation = this.validateImageForVision(imageBase64);
        results.validation = validation;

        if (!validation.valid) {
            return results;
        }

        // Load API keys
        const hasKeys = this.loadAPIKeys();
        results.hasAPIKeys = hasKeys;

        if (!hasKeys) {
            results.error = 'No API keys available for testing';
            return results;
        }

        // Test each vision API
        const testPrompt = "Analyze this image and suggest After Effects techniques, expressions, or workflows that would be relevant for creating similar visual content.";

        // Test Google Gemini Vision
        try {
            console.log('🧪 Testing Google Gemini Vision...');
            const start = Date.now();
            const response = await this.testGoogleGeminiVision(imageBase64, testPrompt);
            results.tests.gemini = {
                success: true,
                responseTime: Date.now() - start,
                responseLength: response.length,
                response: response.substring(0, 200) + (response.length > 200 ? '...' : '')
            };
        } catch (error) {
            results.tests.gemini = {
                success: false,
                error: error.message
            };
        }

        // Add delays between API calls to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test OpenAI Vision (if different key available)
        // Commented out to avoid using same key for different service
        /*
        try {
            console.log('🧪 Testing OpenAI Vision...');
            const start = Date.now();
            const response = await this.testOpenAIVision(imageBase64, testPrompt);
            results.tests.openai = {
                success: true,
                responseTime: Date.now() - start,
                responseLength: response.length,
                response: response.substring(0, 200) + (response.length > 200 ? '...' : '')
            };
        } catch (error) {
            results.tests.openai = {
                success: false,
                error: error.message
            };
        }
        */

        return results;
    }
}

// Global function to run real API tests
window.runRealVisionAPITest = async function() {
    if (!imageTester || !imageTester.currentImageData) {
        console.error('No image loaded for testing');
        return;
    }

    const visionTester = new VisionAPITester();
    
    try {
        imageTester.showStatus('🔄 Running real Vision API tests...', 'info');
        
        const results = await visionTester.runComprehensiveTest(imageTester.currentImageData);
        
        // Display results
        const resultsHTML = `
            <div style="background: #1a1a2e; padding: 20px; border-radius: 8px; margin-top: 15px; font-family: monospace;">
                <strong>🧪 Real Vision API Test Results</strong><br>
                📅 Timestamp: ${new Date(results.timestamp).toLocaleString()}<br>
                📏 Image Size: ${(results.imageSize / 1024).toFixed(2)} KB<br>
                🔑 API Keys Available: ${results.hasAPIKeys ? '✅ Yes' : '❌ No'}<br>
                ✅ Validation: ${results.validation.valid ? 'Passed' : results.validation.error}<br><br>
                
                ${results.tests.gemini ? `
                    <strong>Google Gemini Vision:</strong><br>
                    ${results.tests.gemini.success ? 
                        `✅ Success (${results.tests.gemini.responseTime}ms)<br>📝 Response: "${results.tests.gemini.response}"<br>` :
                        `❌ Failed: ${results.tests.gemini.error}<br>`
                    }<br>
                ` : ''}
                
                ${results.tests.openai ? `
                    <strong>OpenAI GPT-4V:</strong><br>
                    ${results.tests.openai.success ? 
                        `✅ Success (${results.tests.openai.responseTime}ms)<br>📝 Response: "${results.tests.openai.response}"<br>` :
                        `❌ Failed: ${results.tests.openai.error}<br>`
                    }<br>
                ` : ''}
                
                ${results.error ? `<strong>❌ Error:</strong> ${results.error}` : ''}
            </div>
        `;
        
        document.getElementById('visionResults').innerHTML = resultsHTML;
        
        if (results.hasAPIKeys && results.validation.valid) {
            imageTester.showStatus('✅ Real Vision API tests completed', 'success');
        } else {
            imageTester.showStatus('⚠️ Vision API tests completed with limitations', 'info');
        }
        
    } catch (error) {
        imageTester.showStatus(`❌ Vision API test failed: ${error.message}`, 'error');
    }
};

console.log('🔬 Vision API Tester loaded');
