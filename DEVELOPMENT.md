# Development Guide - LetterBlack Gen AI CEP Extension

## 🛠 Development Setup

### Prerequisites
- Adobe After Effects 2022 or later
- Node.js 14+ (for package management)
- Code editor (VS Code recommended)

### Environment Setup
1. **Enable CEP Debug Mode**:
   ```bash
   # Windows Registry
   reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.12" /v PlayerDebugMode /t REG_SZ /d 1

   # macOS Terminal
   defaults write com.adobe.CSXS.12 PlayerDebugMode 1
   ```

2. **Install Extension**:
   ```bash
   npm run install-extension
   ```

3. **Development Workflow**:
   - Edit files in `src/`
   - Refresh extension in After Effects (Help > About)
   - Debug using Chrome DevTools (localhost:8088)

## 📁 Project Structure

### Core Files
```
src/
├── index.html              # Main extension UI
├── js/
│   ├── ai/                 # AI integration modules
│   ├── core/               # Core functionality
│   ├── ui/                 # UI enhancement modules
│   └── utils/              # Utility functions
├── assets/                 # Images, icons, animations
├── styles/                 # CSS stylesheets
└── css/                    # Legacy CSS (to be organized)
```

### Configuration
```
config/CSXS/
└── manifest.xml           # Extension manifest
```

## 🔧 Development Commands

```bash
# Install extension to CEP directory
npm run install-extension

# Remove extension from CEP directory  
npm run uninstall-extension

# Development info
npm run dev
```

## 🐛 Debugging

### Chrome DevTools
1. Open `http://localhost:8088` in Chrome
2. Find your extension in the list
3. Click to open DevTools

### Console Logging
```javascript
// Extension console
console.log('Extension log');

// After Effects ExtendScript console
$.writeln('ExtendScript log');
```

### Common Issues
- **Extension not appearing**: Check CEP debug mode enabled
- **JS errors**: Check browser console (F12)
- **ExtendScript errors**: Check After Effects console

## 📝 Code Style

### JavaScript Modules
```javascript
// Use IIFE pattern for modules
(function() {
    'use strict';
    
    // Module code
    window.MyModule = {
        init: function() {
            // Initialize
        }
    };
})();
```

### CSS Organization
```css
/* Use CSS custom properties */
:root {
    --primary-color: #007acc;
    --bg-color: #1e1e1e;
}

/* Component-based naming */
.component-name {
    /* Styles */
}
```

## 🚀 Building for Production

1. **Test thoroughly** in target After Effects version
2. **Optimize assets** (compress images, minify CSS/JS if needed)
3. **Package extension** as .zxp file using Adobe tools
4. **Test installation** on clean system

## 📚 Resources

- [Adobe CEP Documentation](https://github.com/Adobe-CEP/CEP-Resources)
- [ExtendScript Documentation](https://extendscript.docsforadobe.dev/)
- [After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: description"

# Push to remote
git push origin feature/new-feature
```
