# Medium Priority Changes - Features & UX

## 🎛️ **INCOMPLETE FEATURES**

### **1. Command Palette - Complete or Remove**

**Current State**: UI exists but functionality is incomplete

**Option A: Complete Implementation**

**File**: `src/js/core/main.js` (Lines 2808-2934)
**Add missing functionality:**
```javascript
// Complete command palette implementation
function initializeCommandPalette() {
    const commandPalette = document.getElementById('command-menu-panel');
    const commandSearch = document.getElementById('command-search');
    const commandList = document.querySelector('.command-list');
    
    // Add real command search functionality
    const commands = [
        { name: 'Create New Composition', action: 'app.project.items.addComp' },
        { name: 'Import File', action: 'app.project.importFile' },
        { name: 'Render Queue', action: 'app.project.renderQueue' },
        // Add more commands
    ];
    
    commandSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query)
        );
        renderCommands(filtered);
    });
}
```

**Option B: Remove UI (Recommended)**

**File**: `src/index.html`
**Remove lines 62-89:**
```html
<!-- REMOVE THIS ENTIRE BLOCK -->
<button id="command-menu-trigger" class="header-btn" title="Command Palette (Ctrl+K)">
    <i class="fa-solid fa-search"></i>
</button>
<div id="command-menu-panel" class="command-palette hidden">
    <!-- ... entire command palette UI ... -->
</div>
```

### **2. AI Status Dashboard - Complete Implementation**

**File**: `src/js/core/main.js`
**Add real status monitoring:**
```javascript
// Add real AI status monitoring
function updateAIStatus() {
    const statusIndicator = document.querySelector('.status-indicator');
    const modelDisplay = document.getElementById('current-model-display');
    
    // Check AI provider connectivity
    if (window.aiProviders) {
        const currentProvider = window.aiProviders.getCurrentProvider();
        statusIndicator.className = 'fa-solid fa-robot status-connected';
        modelDisplay.textContent = currentProvider.model || 'Connected';
    } else {
        statusIndicator.className = 'fa-solid fa-robot status-disconnected';
        modelDisplay.textContent = 'Disconnected';
    }
}

// Update status every 30 seconds
setInterval(updateAIStatus, 30000);
```

### **3. Voice Features - Complete Integration**

**File**: `src/js/features/voice-features.js`
**Add missing transcription:**
```javascript
// Complete voice transcription functionality
async function transcribeAudio(audioBlob) {
    try {
        // Add real transcription service integration
        const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: audioBlob
        });
        
        const result = await response.json();
        return result.text;
    } catch (error) {
        logger.error('Transcription failed:', error);
        return 'Transcription failed. Please try typing your message.';
    }
}
```

---

## 🎨 **CSS CLEANUP & OPTIMIZATION**

### **1. Remove Unused Utility Classes**

**File**: `src/css/components/foundation/interactive.css`
**Lines 200-250**: Remove unused classes
```css
/* REMOVE THESE UNUSED CLASSES */
.transition-none { transition-property: none !important; }
.transition-colors { transition-property: color, background-color, border-color !important; }
.transition-transform { transition-property: transform !important; }
.transition-opacity { transition-property: opacity !important; }

.hover-lift { transition: transform var(--transition-base); }
.hover-scale { transition: transform var(--transition-base); }
.hover-glow { transition: box-shadow var(--transition-base); }

.loading { position: relative; pointer-events: none; }
.skeleton { background: linear-gradient(...); }
.ripple { position: relative; overflow: hidden; }
```

**Keep only classes that are actually used in the codebase.**

### **2. Fix CSS Override Conflicts**

**File**: `src/index.html` (Lines 600-670)
**Reduce !important declarations:**

**Current (problematic):**
```css
.floating-mascot {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    z-index: 999999 !important;
    position: fixed !important;
    /* ... more !important declarations */
}
```

**Improved (specific selectors):**
```css
.floating-mascot,
#floating-mascot {
    display: flex;
    visibility: visible;
    opacity: 1;
    z-index: var(--z-mascot);
    position: fixed;
    /* Remove unnecessary !important */
}
```

### **3. CSS Variables for Z-Index**

**File**: `src/css/components/foundation/core.css`
**Add z-index scale:**
```css
:root {
    /* Z-Index Scale */
    --z-base: 1;
    --z-dropdown: 100;
    --z-modal: 1000;
    --z-notification: 5000;
    --z-mascot: 9999;
    --z-debug: 10000;
}
```

**Update files to use variables:**
- `src/css/components/floating-mascot.css`
- `src/css/components/consolidated-components.css`

---

## ♿ **ACCESSIBILITY IMPROVEMENTS**

### **1. Add Missing ARIA Labels**

**File**: `src/index.html`

**Line 155**: YouTube button
```html
<!-- Current -->
<button id="analyze-youtube" class="composer-btn" title="Analyze YouTube Tutorial">

<!-- Improved -->
<button id="analyze-youtube" class="composer-btn" 
        title="Analyze YouTube Tutorial" 
        aria-label="Analyze YouTube video content">
```

**Line 585**: Audio visualizer
```html
<!-- Current -->
<div class="audio-visualizer" id="audio-visualizer">

<!-- Improved -->
<div class="audio-visualizer" id="audio-visualizer" 
     aria-live="polite" 
     aria-label="Voice recording status">
```

### **2. Improve Context Indicators**

**File**: `src/index.html` (Lines 136-137)
```html
<!-- Current -->
<div id="context-indicator" class="context-indicator" aria-hidden="true"></div>
<div id="effects-indicator" class="effects-indicator" aria-hidden="true"></div>

<!-- Improved -->
<div id="context-indicator" class="context-indicator" 
     aria-live="polite" 
     aria-label="Context status"
     style="display: none;"></div>
<div id="effects-indicator" class="effects-indicator" 
     aria-live="polite" 
     aria-label="Effects status"
     style="display: none;"></div>
```

### **3. Voice Features Accessibility**

**File**: `src/js/features/voice-features.js`
**Add ARIA announcements:**
```javascript
function announceVoiceState(state) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    
    const messages = {
        recording: 'Voice recording started',
        stopped: 'Voice recording stopped',
        processing: 'Processing voice input',
        error: 'Voice input failed'
    };
    
    announcement.textContent = messages[state] || '';
    document.body.appendChild(announcement);
    
    setTimeout(() => document.body.removeChild(announcement), 1000);
}
```