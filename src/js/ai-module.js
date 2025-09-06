/**
 * LetterBlack GenAI - AI Module
 * Consolidates: ai-module.js, ai-provider.js, prompt-templates.js, response-formatter.js
 */

(function() {
    'use strict';
    
    class AIModule {
        constructor() {
            this.providers = {
                google: new GoogleProvider(),
                openai: new OpenAIProvider(),
                anthropic: new AnthropicProvider()
            };
            this.promptTemplates = new PromptTemplates();
            this.responseFormatter = new ResponseFormatter();
        }
        
        async generateResponse(userMessage, settings = {}) {
            try {
                const provider = this.providers[settings.provider || 'google'];
                if (!provider) {
                    throw new Error(`Unsupported provider: ${settings.provider}`);
                }
                
                // Build context-aware prompt
                const prompt = this.promptTemplates.buildPrompt(userMessage, {
                    context: 'after-effects',
                    userLevel: settings.userLevel || 'intermediate'
                });
                
                // Generate response
                const response = await provider.generateResponse(prompt, settings);
                
                // Format and return
                return this.responseFormatter.format(response);
                
            } catch (error) {
                console.error('AI generation error:', error);
                return this.generateFallbackResponse(userMessage, error);
            }
        }
        
        generateFallbackResponse(userMessage, error) {
            if (error.message.includes('API key')) {
                return `🔑 **API Key Required**

To use AI features, please:
1. Go to the **Settings** tab ⚙️
2. Add your API key for Google Gemini, OpenAI, or Anthropic
3. Return here and ask your question again

**Your question:** "${userMessage}"

I'll be ready to help once you're set up! 🚀`;
            }
            
            const lowerMessage = userMessage.toLowerCase();
            
            if (lowerMessage.includes('expression')) {
                return this.getExpressionHelp(userMessage);
            } else if (lowerMessage.includes('script')) {
                return this.getScriptHelp(userMessage);
            } else {
                return this.getGeneralHelp(userMessage);
            }
        }
        
        getExpressionHelp(userMessage) {
            return `🎬 **Expression Helper**

**Common Expressions:**

**Wiggle Animation:**
\`\`\`javascript
wiggle(frequency, amplitude)
// Example: wiggle(2, 50) - 2 times/sec, ±50 units
\`\`\`

**Smooth Loop:**
\`\`\`javascript
loopOut("cycle")
loopOut("pingpong")
\`\`\`

**Time-based Animation:**
\`\`\`javascript
time * speed + offset
Math.sin(time * speed) * amplitude
\`\`\`

💡 **Your question:** "${userMessage}"
Set up AI for custom expression generation!`;
        }
        
        getScriptHelp(userMessage) {
            return `🤖 **Script Helper**

**Basic Script Structure:**
\`\`\`javascript
app.beginUndoGroup("Script Name");
try {
    var comp = app.project.activeItem;
    if (comp && comp instanceof CompItem) {
        // Your code here
    }
} catch (error) {
    alert("Error: " + error.toString());
}
app.endUndoGroup();
\`\`\`

💡 **Your question:** "${userMessage}"
Configure AI for advanced script generation!`;
        }
        
        getGeneralHelp(userMessage) {
            return `✨ **After Effects Assistant**

I can help with:
- 🎬 Expressions & Animation
- 🤖 ExtendScript & Automation
- 🎨 Effects & Workflows
- 📚 Learning & Tutorials

**Your question:** "${userMessage}"

🔧 **For AI-powered help:** Add your API key in Settings!`;
        }

        async testConnection(provider, apiKey, model) {
            try {
                const providerInstance = this.providers[provider];
                if (!providerInstance) {
                    return { success: false, error: `Provider '${provider}' not supported` };
                }

                // Create test settings
                const testSettings = {
                    provider: provider,
                    apiKey: apiKey,
                    model: model || 'test',
                    temperature: 0.1,
                    maxTokens: 10
                };

                // Send a simple test message
                const testPrompt = "Hello";
                const response = await providerInstance.generateResponse(testPrompt, testSettings);
                
                if (response && response.length > 0) {
                    return { success: true, message: 'Connection successful!' };
                } else {
                    return { success: false, error: 'Empty response from provider' };
                }
                
            } catch (error) {
                console.error('Connection test failed:', error);
                return { 
                    success: false, 
                    error: error.message || 'Connection test failed' 
                };
            }
        }
    }
    
    // Google Gemini Provider
    class GoogleProvider {
        async generateResponse(prompt, settings) {
            const apiKey = settings.apiKey;
            if (!apiKey) {
                throw new Error('Google API key required');
            }
            
            const model = settings.model || 'gemini-1.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: settings.temperature || 0.7,
                        maxOutputTokens: settings.maxTokens || 2048
                    }
                })
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Google API error: ${error}`);
            }
            
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
        }
    }
    
    // OpenAI Provider  
    class OpenAIProvider {
        async generateResponse(prompt, settings) {
            const apiKey = settings.apiKey;
            if (!apiKey) {
                throw new Error('OpenAI API key required');
            }
            
            const model = settings.model || 'gpt-3.5-turbo';
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert After Effects assistant. Provide helpful, accurate advice about expressions, scripts, and workflows.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: settings.temperature || 0.7,
                    max_tokens: settings.maxTokens || 2048
                })
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`OpenAI API error: ${error}`);
            }
            
            const data = await response.json();
            return data.choices?.[0]?.message?.content || 'No response generated';
        }
    }
    
    // Anthropic Provider
    class AnthropicProvider {
        async generateResponse(prompt, settings) {
            const apiKey = settings.apiKey;
            if (!apiKey) {
                throw new Error('Anthropic API key required');
            }
            
            const model = settings.model || 'claude-3-sonnet-20240229';
            
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: settings.maxTokens || 2048,
                    temperature: settings.temperature || 0.7,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Anthropic API error: ${error}`);
            }
            
            const data = await response.json();
            return data.content?.[0]?.text || 'No response generated';
        }
    }
    
    // Prompt Templates
    class PromptTemplates {
        buildPrompt(userMessage, options = {}) {
            const basePrompt = this.getBasePrompt(options.context);
            const contextPrompt = this.getContextPrompt(options);
            
            return `${basePrompt}

${contextPrompt}

User Question: ${userMessage}

Please provide a helpful, detailed response with:
1. Direct answer to the question
2. Code examples if applicable
3. Best practices
4. Additional tips or alternatives

Format code in markdown code blocks with appropriate language tags.`;
        }
        
        getBasePrompt(context) {
            switch (context) {
                case 'after-effects':
                    return `You are an expert After Effects assistant specializing in:
- Expressions and animation programming
- ExtendScript automation and scripting
- Visual effects workflows and techniques
- Performance optimization
- Creative problem solving

Always provide accurate, tested code examples and explain concepts clearly.`;
                
                default:
                    return 'You are a helpful AI assistant for creative professionals.';
            }
        }
        
        getContextPrompt(options) {
            let context = '';
            
            if (options.userLevel) {
                context += `User Experience Level: ${options.userLevel}\n`;
            }
            
            if (options.projectType) {
                context += `Project Type: ${options.projectType}\n`;
            }
            
            return context;
        }
    }
    
    // Response Formatter
    class ResponseFormatter {
        format(response) {
            if (!response || typeof response !== 'string') {
                return 'No response received from AI provider.';
            }
            
            // Clean up common formatting issues
            let formatted = response.trim();
            
            // Ensure proper code block formatting
            formatted = this.fixCodeBlocks(formatted);
            
            // Add emoji for better visual appeal
            formatted = this.addEmojis(formatted);
            
            return formatted;
        }
        
        fixCodeBlocks(text) {
            // Ensure proper code block syntax
            return text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang || 'javascript';
                return `\`\`\`${language}\n${code.trim()}\n\`\`\``;
            });
        }
        
        addEmojis(text) {
            // Add contextual emojis for common topics
            text = text.replace(/^(Expression|Expressions):/gm, '🎬 $1:');
            text = text.replace(/^(Script|Scripts):/gm, '🤖 $1:');
            text = text.replace(/^(Tip|Tips):/gm, '💡 $1:');
            text = text.replace(/^(Warning|Important):/gm, '⚠️ $1:');
            text = text.replace(/^(Note|Notes):/gm, '📝 $1:');
            
            return text;
        }
    }
    
    // Export module
    window.AIModule = AIModule;
    console.log('✅ AI Module loaded');
    
})();
