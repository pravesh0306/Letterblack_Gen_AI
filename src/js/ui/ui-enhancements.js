// ui-enhancements.js
// Conservative enhancements: minimal thinking UI, quick actions, basic persistence
// Keep small and non-invasive. Do not remove comments.
(function(){
    'use strict';

    // Simple thinking indicator with mascot integration
    function showThinking(msg){
        const indicator = document.getElementById('ai-thinking');
        if(!indicator) return;
        indicator.classList.remove('hidden');
        indicator.setAttribute('aria-hidden','false');
        const feedback = document.getElementById('ai-feedback');
        if(feedback) feedback.textContent = msg || 'Thinking...';
        
        // Trigger mascot thinking animation
        const mascotContainer = document.querySelector('.mascot-container');
        if(mascotContainer) {
            mascotContainer.classList.add('mascot-thinking');
            const mascotImage = mascotContainer.querySelector('.mascot-image');
            if(mascotImage) {
                mascotImage.src = 'js/components/assets/ae-mascot-animated.gif';
            }
        }
    }
    
    function hideThinking(){
        const indicator = document.getElementById('ai-thinking');
        if(!indicator) return;
        indicator.classList.add('hidden');
        indicator.setAttribute('aria-hidden','true');
        
        // Stop mascot thinking animation
        const mascotContainer = document.querySelector('.mascot-container');
        if(mascotContainer) {
            mascotContainer.classList.remove('mascot-thinking');
            const mascotImage = mascotContainer.querySelector('.mascot-image');
            if(mascotImage) {
                mascotImage.src = 'js/components/assets/ae-mascot.png';
            }
        }
    }

    // Wire quick actions to populate chat input
    function wireQuickActions(){
        const actions = {
            text: 'Create a basic text animation script for After Effects',
            particles: 'Create a simple particle system using shape layers',
            transitions: 'Create a crossfade transition between two layers'
        };
        
        document.querySelectorAll('[data-template]').forEach(btn => {
            btn.addEventListener('click', () => {
                const template = btn.getAttribute('data-template');
                const prompt = actions[template];
                if(prompt) {
                    const chatInput = document.getElementById('chat-input');
                    if(chatInput) {
                        chatInput.value = prompt;
                        chatInput.focus();
                        // Trigger mascot pop animation
                        triggerMascotAnimation('mascot-pop');
                    }
                }
            });
        });
    }

    // Mascot animation helpers
    function triggerMascotAnimation(animationClass) {
        const mascotContainer = document.querySelector('.mascot-container');
        if(mascotContainer) {
            mascotContainer.classList.add(animationClass);
            setTimeout(() => {
                mascotContainer.classList.remove(animationClass);
            }, 1000);
        }
    }

    function updateMascotMessage(message) {
        const mascotMessage = document.getElementById('mascot-message');
        if(mascotMessage) {
            mascotMessage.textContent = message;
            const bubble = document.querySelector('.mascot-speech-bubble');
            if(bubble) {
                bubble.style.opacity = '1';
                setTimeout(() => {
                    bubble.style.opacity = '0';
                }, 3000);
            }
        }
    }

    // Wire mascot interactions
    function wireMascotInteractions(){
        const mascotImage = document.querySelector('.mascot-image');
        if(mascotImage) {
            mascotImage.addEventListener('click', () => {
                triggerMascotAnimation('mascot-celebrate');
                updateMascotMessage('How can I help you today?');
            });
        }
    }

    // Basic settings persistence - API provider and key only
    function persistSettings(){
        const provider = document.getElementById('api-provider');
        const apiKey = document.getElementById('api-key-setting');
        if(!provider || !apiKey) return;
        
        // Load saved settings
        try {
            const saved = localStorage.getItem('lb_settings');
            if(saved) {
                const settings = JSON.parse(saved);
                if(settings.provider) provider.value = settings.provider;
                if(settings.apiKey) apiKey.value = settings.apiKey;
            }
        } catch(e) {
            console.warn('Could not load settings:', e);
        }
        
        // Save on change
        function saveSettings() {
            try {
                localStorage.setItem('lb_settings', JSON.stringify({
                    provider: provider.value,
                    apiKey: apiKey.value
                }));
            } catch(e) {
                console.warn('Could not save settings:', e);
            }
        }
        
        provider.addEventListener('change', saveSettings);
        apiKey.addEventListener('blur', saveSettings);
    }

    // Initialize when DOM ready
    function init(){
        wireQuickActions();
        persistSettings();
        wireMascotInteractions();
        
        // Check AI module availability
        checkAIModuleAvailability();
        
        // Show welcome animation after a short delay
        setTimeout(() => {
            triggerMascotAnimation('mascot-welcome');
            updateMascotMessage('Welcome to LetterBlack AI!');
        }, 1000);
    }

    // Check and report AI module status
    function checkAIModuleAvailability() {
        const maxChecks = 10;
        let checks = 0;
        
        const checkInterval = setInterval(() => {
            checks++;
            
            if (window.aiModule) {
                console.log('✅ AI Module is available');
                updateMascotMessage('AI Module Ready!');
                clearInterval(checkInterval);
                return;
            }
            
            if (checks >= maxChecks) {
                console.warn('⚠️ AI Module not available after', maxChecks, 'checks');
                updateMascotMessage('AI Module loading...');
                clearInterval(checkInterval);
                
                // Try to trigger initialization manually
                if (window.AIModule && !window.aiModule) {
                    console.log('🔄 Attempting to initialize AI Module manually...');
                    try {
                        window.aiModule = new window.AIModule();
                        if (window.aiModule.init) {
                            window.aiModule.init().then(success => {
                                if (success) {
                                    updateMascotMessage('AI Module Ready!');
                                    triggerMascotAnimation('mascot-success');
                                } else {
                                    updateMascotMessage('AI Module Error');
                                    triggerMascotAnimation('mascot-error');
                                }
                            });
                        }
                    } catch (error) {
                        console.error('❌ Manual AI Module initialization failed:', error);
                        updateMascotMessage('AI Module Error');
                        triggerMascotAnimation('mascot-error');
                    }
                }
            }
        }, 500);
        
        // Store interval reference for cleanup
        window._uiEnhancementsCleanup = window._uiEnhancementsCleanup || [];
        window._uiEnhancementsCleanup.push(checkInterval);
    }

    // Global cleanup function
    function cleanup() {
        if (window._uiEnhancementsCleanup) {
            window._uiEnhancementsCleanup.forEach(interval => {
                if (interval) clearInterval(interval);
            });
            window._uiEnhancementsCleanup = [];
            console.log('🧹 UI Enhancements cleanup completed');
        }
    }

    // Add cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

    // Run when ready
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose minimal API
    window.UIEnhancements = { 
        showThinking, 
        hideThinking, 
        triggerMascotAnimation, 
        updateMascotMessage 
    };

})();
