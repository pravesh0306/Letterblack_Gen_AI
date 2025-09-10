/**
 * Floating Mascot Controller
 * Handles mascot dragging, positioning, and debugging functionality
 */

// Initialize floating mascot dragging functionality
document.addEventListener('DOMContentLoaded', function() {
    const bubble = document.getElementById('floating-mascot');
    if(!bubble) return; 
    
    let dragging = false;
    let startX = 0, startY = 0, offX = 0, offY = 0;
    
    // Get the main panel container for boundary constraints
    function getPanelBounds() {
        const panel = document.body; // CEP panel body
        const rect = panel.getBoundingClientRect();
        const bubbleRect = bubble.getBoundingClientRect();
        const mascotWidth = bubbleRect.width || 78; // Default size if not measured
        const mascotHeight = bubbleRect.height || 78;
        
        return {
            minX: 10, // 10px margin from left
            minY: 10, // 10px margin from top  
            maxX: Math.max(50, rect.width - mascotWidth - 10), // 10px margin from right
            maxY: Math.max(50, rect.height - mascotHeight - 10) // 10px margin from bottom
        };
    }
    
    // Constrain position within panel boundaries
    function constrainPosition(x, y) {
        const bounds = getPanelBounds();
        return {
            x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
            y: Math.max(bounds.minY, Math.min(bounds.maxY, y))
        };
    }
    
    // Restore position with boundary check
    try {
        const pos = JSON.parse(localStorage.getItem('floatingMascotPos'));
        if(pos && pos.x != null && pos.y != null) {
            const constrained = constrainPosition(pos.x, pos.y);
            bubble.style.left = constrained.x + 'px';
            bubble.style.top = constrained.y + 'px';
            bubble.style.right = 'auto';
            bubble.style.bottom = 'auto';
        } else {
            // Set default position if no saved position
            bubble.style.bottom = '20px';
            bubble.style.right = '20px';
        }
    } catch(e) {
        this.logger.warn('Failed to restore mascot position:', e);
        // Set default position on error
        bubble.style.bottom = '20px';
        bubble.style.right = '20px';
    }
    
    // Start drag
    function down(e) {
        e.preventDefault();
        dragging = true;
        bubble.style.transition = 'none';
        bubble.classList.add('dragging');
        
        const r = bubble.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        offX = clientX - r.left;
        offY = clientY - r.top;
        
        document.addEventListener('mousemove', move, { passive: false });
        document.addEventListener('mouseup', up, { passive: false });
        document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('touchend', up, { passive: false });
    }
    
    // Handle drag movement
    function move(e) {
        if (!dragging) return;
        e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const x = clientX - offX;
        const y = clientY - offY;
        
        const constrained = constrainPosition(x, y);
        
        bubble.style.left = constrained.x + 'px';
        bubble.style.top = constrained.y + 'px';
        bubble.style.right = 'auto';
        bubble.style.bottom = 'auto';
    }
    
    // End drag
    function up(e) {
        if (!dragging) return;
        dragging = false;
        bubble.classList.remove('dragging');
        bubble.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        document.removeEventListener('mousemove', move, { passive: false });
        document.removeEventListener('mouseup', up, { passive: false });
        document.removeEventListener('touchmove', move, { passive: false });
        document.removeEventListener('touchend', up, { passive: false });
        
        // Save position
        try {
            const currentPos = {
                x: parseInt(bubble.style.left) || 0,
                y: parseInt(bubble.style.top) || 0
            };
            localStorage.setItem('floatingMascotPos', JSON.stringify(currentPos));
        } catch(e) {
            this.logger.warn('Failed to save mascot position:', e);
        }
    }
    
    // Attach event listeners
    bubble.addEventListener('mousedown', down, { passive: false });
    bubble.addEventListener('touchstart', down, { passive: false });
});

// Force mascot visibility for development/debugging
window.forceMascotVisibility = function() {
    const mascot = document.getElementById('floating-mascot');
    if (mascot) {
        const video = document.getElementById('floating-mascot-video');
        const fallbackImg = document.getElementById('floating-mascot-fallback');
        const simpleFallback = document.getElementById('floating-mascot-simple');
        
        // Ensure main container is visible
        mascot.style.display = 'block';
        mascot.style.visibility = 'visible';
        mascot.style.opacity = '1';
        mascot.style.pointerEvents = 'auto';
        mascot.style.zIndex = '10000';
        
        let mediaWorking = false;
        
        // Try video first if available
        if (video && video.src) {
            video.style.display = 'block';
            video.style.visibility = 'visible';
            video.style.opacity = '1';
            if (fallbackImg) fallbackImg.style.display = 'none';
            if (simpleFallback) simpleFallback.style.display = 'none';
            
            // Only try to play if not already playing and has valid state
            if (video.paused && video.readyState >= 2) {
                try {
                    video.play().catch(() => {
                        // Ignore play errors in CEP environment
                    });
                } catch(e) {
                    // Ignore play errors
                }
            }
            
            if (video.readyState >= 1) {
                mediaWorking = true;
                this.logger.debug('✅ Video mascot working');
            } else {
                video.style.display = 'none';
            }
        }
        
        // Try GIF fallback if video not working
        if (!mediaWorking && fallbackImg) {
            fallbackImg.style.display = 'block';
            fallbackImg.style.visibility = 'visible';
            fallbackImg.style.opacity = '1';
            if (simpleFallback) simpleFallback.style.display = 'none';
            mediaWorking = true;
            // Only log GIF fallback once every 30 seconds
            if (!window.lastGifFallbackLog || Date.now() - window.lastGifFallbackLog > 30000) {
                this.logger.debug('🔄 Using GIF fallback');
                window.lastGifFallbackLog = Date.now();
            }
        }
        
        // Use simple emoji fallback if nothing else works
        if (!mediaWorking && simpleFallback) {
            if (video) video.style.display = 'none';
            if (fallbackImg) fallbackImg.style.display = 'none';
            simpleFallback.style.display = 'flex';
            simpleFallback.style.visibility = 'visible';
            simpleFallback.style.opacity = '1';
            this.logger.debug('🎭 Using simple emoji fallback');
        }
        
        // Only log forced visibility once every 30 seconds
        if (!window.lastForcedVisibilityLog || Date.now() - window.lastForcedVisibilityLog > 30000) {
            this.logger.debug('🔥 Mascot visibility enforced');
            window.lastForcedVisibilityLog = Date.now();
        }
    } else {
        this.logger.error('❌ MASCOT ELEMENT NOT FOUND!');
    }
}

// Test function for mascot
window.testFloatingMascot = function() {
    const mascot = document.getElementById('floating-mascot');
    const video = document.getElementById('floating-mascot-video');
    const gif = document.getElementById('floating-mascot-fallback');
    const simple = document.getElementById('floating-mascot-simple');
    
    this.logger.debug('🔍 === MASCOT DEBUG REPORT ===');
    
    if (mascot) {
        // Reduced logging - only log once every 10 calls
        const currentTime = Date.now();
        if (!window.lastMascotLogTime || currentTime - window.lastMascotLogTime > 30000) {
            this.logger.debug('✅ Floating mascot element found and active');
            window.lastMascotLogTime = currentTime;
        }
        
        // Check bounding rect for issues
        const rect = mascot.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            this.logger.warn('⚠️ Mascot has zero dimensions!');
        }
    } else {
        this.logger.error('❌ Floating mascot element NOT FOUND!');
    }
    
    // Check video element
    if (video) {
        this.logger.debug('🎥 Video element found. State:', {
            src: video.src,
            readyState: video.readyState,
            paused: video.paused,
            ended: video.ended,
            muted: video.muted,
            loop: video.loop
        });
    } else {
        this.logger.warn('⚠️ Video element not found');
    }
    
    // Reduced logging for diagnostic elements
    if (!window.lastMascotLogTime || Date.now() - window.lastMascotLogTime > 30000) {
        // Only log missing elements, not working ones
        if (!gif) this.logger.warn('⚠️ GIF fallback not found');
        if (!simple) this.logger.warn('⚠️ Simple fallback not found');
    }
    
    // Test animation if mascot animator is available
    if (window.mascotAnimator) {
        this.logger.debug('🎬 MascotAnimator found - testing animations...');
        window.mascotAnimator.testAllAnimations();
    } else {
        this.logger.debug('⚠️ MascotAnimator not found');
    }
    
    this.logger.debug('🔍 === END MASCOT DEBUG REPORT ===');
    
    return {
        mascotFound: !!mascot,
        videoFound: !!video,
        gifFound: !!gif,
        simpleFound: !!simple,
        animatorFound: !!window.mascotAnimator
    };
};
