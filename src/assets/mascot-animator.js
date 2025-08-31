/**
 * WebM Mascot Animation System for Audio Toolkit Extension
 * Manages scenario-based transparent mascot animations using WebM videos
 */

class MascotAnimator {
    constructor() {
        this.mascotVideo = null;
        this.currentScenario = 'idle';
        this.isPlaying = false;
        
        // Animation scenarios mapping with WebM files
        this.scenarios = {
            idle: {
                file: 'assets/Idle.webm',
                loop: true,
                tooltip: 'Ready to help! 🚀'
            },
            thinking: {
                file: 'assets/problem-solving.webm', // normalized filename (thinking pose)
                loop: true,
                tooltip: 'Processing your request... 🤔'
            },
            success: {
                file: 'assets/completion.webm',
                loop: false,
                duration: 3000,
                tooltip: 'Task completed successfully! 🎉'
            },
            solution: {
                file: 'assets/solution.webm',
                loop: false,
                duration: 3000,
                tooltip: 'Found a solution! 💡'
            },
            explain: {
                file: 'assets/explain.webm',
                loop: false,
                duration: 3000,
                tooltip: 'Let me explain... 📖'
            },
            debug: {
                file: 'assets/debug.webm',
                loop: true,
                tooltip: 'Debugging in progress... 🔍'
            },
            settings: {
                file: 'assets/settings.webm',
                loop: false,
                duration: 2500,
                tooltip: 'Configuring settings... ⚙️'
            }
        };
        
        this.init();
    }
    
    init() {
        this.mascotVideo = document.getElementById('floating-mascot-video');
        if (!this.mascotVideo) {
            console.warn('Mascot video element not found');
            return;
        }
        
        // Ensure proper video attributes for WebM transparency
        this.mascotVideo.setAttribute('disablepictureinpicture', '');
        this.mascotVideo.setAttribute('controlslist', 'nodownload noplaybackrate');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Validate asset availability & apply fallbacks
        this.loadManifest().then(() => this.validateAssets()).then(missing => {
            if (missing.length) {
                console.warn('Mascot missing or unverifiable pose assets (fallback to Idle when needed):', missing);
            }
            this.playScenario('idle');
        });
        
        console.log('🎭 WebM Mascot Animation System initialized');
    }

    /**
     * Validate that each scenario's WebM file exists; fall back to idle if missing.
     * Returns list of missing scenario keys.
     */
    async validateAssets() {
        const missing = [];
        // Light validation: only log failures, do NOT overwrite file paths (prevents accidental loss of restored poses)
        await Promise.all(Object.entries(this.scenarios).map(async ([key, data]) => {
            if (key === 'idle') return;
            try {
                // Skip network HEAD if likely running from file:// where fetch may fail; detect by location.protocol
                if (location.protocol.startsWith('http')) {
                    const res = await fetch(data.file, { method: 'HEAD', cache: 'no-store' });
                    if (!res.ok) throw new Error('HTTP '+res.status);
                }
                // If manifest present, mark integrity status
                if (this.manifest && this.manifest.assets) {
                    const fileName = data.file.split('/').pop();
                    if (!this.manifest.assets[fileName]) {
                        missing.push(key);
                    }
                }
            } catch (e) {
                console.warn('Mascot pose not verifiable (will attempt play anyway):', key, e.message);
                missing.push(key);
            }
        }));
        this.missingAssets = missing;
        window.listMissingMascotAssets = () => missing.slice();
        return missing;
    }

    async loadManifest() {
        try {
            const res = await fetch('assets/mascot-assets.json', { cache: 'no-store' });
            if (res.ok) {
                this.manifest = await res.json();
                console.log('Mascot manifest loaded', this.manifest.generated);
            }
        } catch (e) {
            // Silent if manifest absent
        }
    }
    
    setupEventListeners() {
        let dragStartTime = 0;
        let dragMoved = false;
        
        // Get the mascot container for event handling
        const mascotContainer = document.getElementById('floating-mascot');
        if (!mascotContainer) {
            console.warn('Mascot container not found');
            return;
        }
        
        // Handle mouse/touch start for drag detection
        const handleStart = (e) => {
            dragStartTime = Date.now();
            dragMoved = false;
        };
        
        // Handle mouse/touch move for drag detection
        const handleMove = (e) => {
            dragMoved = true;
        };
        
        // Handle click interactions (only if not dragged)
        const handleClick = (e) => {
            const dragDuration = Date.now() - dragStartTime;
            
            // Only trigger click if it was a quick tap/click and no dragging occurred
            if (dragDuration < 300 && !dragMoved) {
                this.onMascotClick();
            }
        };
        
        // Attach events to container instead of video element
        mascotContainer.addEventListener('mousedown', handleStart);
        mascotContainer.addEventListener('touchstart', handleStart);
        mascotContainer.addEventListener('mousemove', handleMove);
        mascotContainer.addEventListener('touchmove', handleMove);
        mascotContainer.addEventListener('click', handleClick);
        
        // Handle video loading events
        this.mascotVideo.addEventListener('loadeddata', () => {
            console.log('✅ WebM mascot video loaded successfully');
        });
        
        // Handle video loading errors
        this.mascotVideo.addEventListener('error', () => {
            console.warn('WebM mascot failed to load, showing fallback');
            this.showFallback();
        });
        
        // Handle video end (for non-looping animations)
        this.mascotVideo.addEventListener('ended', () => {
            this.onVideoEnded();
        });
    }
    
    /**
     * Show fallback image if WebM fails to load
     */
    showFallback() {
        const fallback = document.getElementById('floating-mascot-fallback');
        if (fallback) {
            this.mascotVideo.style.display = 'none';
            fallback.style.display = 'block';
            console.log('🎭 Switched to fallback GIF animation');
        }
    }
    
    /**
     * Handle video playback errors with intelligent fallback
     */
    handlePlaybackError(attemptedScenario) {
        // If we're already trying to play idle and it fails, show GIF fallback
        if (attemptedScenario === 'idle') {
            console.warn('Idle video failed, switching to GIF fallback');
            this.showFallback();
            return;
        }
        
        // Try to fall back to idle video first
        console.warn(`${attemptedScenario} video failed, trying idle animation`);
        this.playScenario('idle');
    }
    
    /**
     * Handle video end events
     */
    onVideoEnded() {
        const scenario = this.scenarios[this.currentScenario];
        if (scenario && !scenario.loop) {
            // Return to idle after non-looping animations
            setTimeout(() => {
                this.playScenario('idle');
            }, 500);
        }
    }
    
    /**
     * Play a specific animation scenario
     * @param {string} scenario - The scenario name
     * @param {boolean} immediate - Skip transition if true
     */
    playScenario(scenario, immediate = false) {
        if (!this.scenarios[scenario]) {
            console.warn(`Unknown mascot scenario: ${scenario}, falling back to idle`);
            scenario = 'idle'; // Fallback to idle for unknown scenarios
        }
        
        const scenarioData = this.scenarios[scenario];
        this.currentScenario = scenario;
        
        // Update video source
        if (this.mascotVideo.src !== scenarioData.file) {
            this.mascotVideo.src = scenarioData.file;
        }
        
        // Set loop property
        this.mascotVideo.loop = scenarioData.loop;
        
        // Update tooltip
        const mascotContainer = document.getElementById('floating-mascot');
        if (mascotContainer) {
            mascotContainer.setAttribute('data-tooltip', scenarioData.tooltip);
        }
        
        // Play video with proper error handling
        const playVideo = async () => {
            try {
                // Reset to start
                this.mascotVideo.currentTime = 0;
                
                // Ensure video is loaded before playing
                if (this.mascotVideo.readyState < 2) {
                    // Wait for video to load enough data to play
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('Video load timeout'));
                        }, 5000); // 5 second timeout
                        
                        this.mascotVideo.addEventListener('loadeddata', () => {
                            clearTimeout(timeout);
                            resolve();
                        }, { once: true });
                        
                        this.mascotVideo.addEventListener('error', () => {
                            clearTimeout(timeout);
                            reject(new Error('Video load error'));
                        }, { once: true });
                    });
                }
                
                // Now try to play
                await this.mascotVideo.play();
                this.isPlaying = true;
                console.log(`🎭 Playing WebM mascot scenario: ${scenario}`);
                
            } catch (error) {
                console.warn('Failed to play mascot animation:', error.message);
                this.handlePlaybackError(scenario);
            }
        };
        
        playVideo();
        
        // Set up auto-return to idle for timed scenarios
        if (scenarioData.duration && !scenarioData.loop) {
            setTimeout(() => {
                if (this.currentScenario === scenario) {
                    this.playScenario('idle');
                }
            }, scenarioData.duration);
        }
    }
    
    /**
     * Handle mascot click - cycle through fun animations
     */
    onMascotClick() {
        const funScenarios = ['solution', 'success', 'explain'];
        const randomScenario = funScenarios[Math.floor(Math.random() * funScenarios.length)];
        this.playScenario(randomScenario);
        
        // Add bounce effect
        const mascotContainer = document.getElementById('floating-mascot');
        if (mascotContainer) {
            mascotContainer.style.animation = 'bounce 0.6s ease';
            setTimeout(() => {
                mascotContainer.style.animation = '';
            }, 600);
        }
    }
    
    // ===== Public API for different scenarios =====
    
    /**
     * Called when audio generation starts
     */
    onAudioGenerationStart() {
        this.playScenario('thinking');
    }
    
    /**
     * Called when audio generation completes
     */
    onAudioGenerationComplete() {
        this.playScenario('success');
        // Will auto-return to idle after duration
    }
    
    /**
     * Called when settings are opened
     */
    onSettingsOpened() {
        this.playScenario('settings');
        // Will auto-return to idle after duration
    }
    
    /**
     * Called when a solution is found
     */
    onSolutionFound() {
        this.playScenario('solution');
        // Will auto-return to idle after duration
    }
    
    /**
     * Called when debugging/processing
     */
    onProcessing() {
        this.playScenario('debug');
    }
    
    /**
     * Called when explaining something
     */
    onExplaining() {
        this.playScenario('explain');
        // Will auto-return to idle after duration
    }
    
    /**
     * Return to idle state
     */
    returnToIdle() {
        this.playScenario('idle');
    }
    
    /**
     * Test function to cycle through all animations (for development)
     */
    testAllAnimations() {
        const scenarios = Object.keys(this.scenarios);
        let index = 0;
        
        const playNext = () => {
            if (index < scenarios.length) {
                console.log(`Testing animation: ${scenarios[index]}`);
                this.playScenario(scenarios[index]);
                index++;
                setTimeout(playNext, 4000); // 4 seconds per animation
            } else {
                this.playScenario('idle');
                console.log('Animation test complete');
            }
        };
        
        playNext();
    }
    
    /**
     * Check if video system is working properly
     */
    checkVideoHealth() {
        const video = this.mascotVideo;
        if (!video) {
            console.warn('🎭 Video element not found');
            return false;
        }
        
        console.log('🎭 Video Health Check:');
        console.log(`  - Current source: ${video.src}`);
        console.log(`  - Ready state: ${video.readyState}`);
        console.log(`  - Network state: ${video.networkState}`);
        console.log(`  - Can play: ${video.readyState >= 2}`);
        console.log(`  - Duration: ${video.duration || 'unknown'}`);
        
        return video.readyState >= 2;
    }
}

// ===== Initialization =====

// Initialize mascot animator when DOM is ready
let mascotAnimator = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        mascotAnimator = new MascotAnimator();
        // Make globally available
        window.mascotAnimator = mascotAnimator;
        console.log('🎭 Global WebM mascot animator initialized');
        
        // Make test and debug functions available in console
        window.testMascotAnimations = () => mascotAnimator.testAllAnimations();
        window.checkMascotHealth = () => mascotAnimator.checkVideoHealth();
        console.log('🎬 Debug commands available:');
        console.log('  - testMascotAnimations() - Test all animations');
        console.log('  - checkMascotHealth() - Check video system status');
    } catch (error) {
        console.error('Failed to initialize mascot animator:', error);
    }
});

// Module exports for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MascotAnimator;
}
