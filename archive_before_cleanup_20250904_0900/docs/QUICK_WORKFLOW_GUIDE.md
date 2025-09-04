# LetterBlack GenAI Extension - Quick Workflow Guide

## 🚀 Current Setup (September 2025)

### **Junction-Based Development System**
- **Extension Location**: `C:\Users\prave\AppData\Roaming\Adobe\CEP\extensions\com.letterblack.genai` (Junction)
- **Workspace Files**: `G:\Developments\15_AI_AE\Adobe_AI_Generations\com.letterblack.genai_Build\`
- **Development**: Edit workspace files → Changes instantly available in After Effects

---

## 📁 Workspace Structure

```
Adobe_AI_Generations/
├── 🎯 com.letterblack.genai_Build/    # ACTIVE EXTENSION FILES
│   ├── CSXS/manifest.xml             # Extension config
│   ├── index.html                    # Main UI
│   ├── main.jsx                      # ExtendScript
│   ├── assets/                       # Mascot & images
│   ├── css/                          # Styles
│   ├── js/                           # JavaScript modules
│   └── storage/                      # Data persistence
├── 📝 src/                           # Development source
├── 📚 docs/                          # Documentation
├── 🔧 scripts/                       # Automation scripts
├── 🧪 tests/                         # Test files
├── 📦 archive/                       # Legacy files
└── ⚙️ config/                        # Build config
```

---

## 🔧 Daily Development

### **1. Edit Files**
```bash
# Edit any file in the active extension folder
com.letterblack.genai_Build/index.html
com.letterblack.genai_Build/css/components/floating-mascot.css
com.letterblack.genai_Build/js/core/main.js
```

### **2. Test Changes**
1. Save files in workspace
2. Right-click extension panel → "Reload"
3. Changes appear immediately

### **3. Debug**
- Open: http://localhost:8000
- Click extension target for DevTools

### **4. Scripts Available**
```bash
scripts/refresh-extension.ps1      # Refresh extension
scripts/debug-ae-extension.ps1     # Debug utilities
scripts/manage-junction.ps1        # Junction management
```

---

## 🎭 Mascot Features

- **Size**: Fixed 70×70px (production ready)
- **Position**: Draggable, position saved
- **Animations**: WebM → GIF → Emoji fallback
- **States**: Idle, Thinking, Success, Error

---

## 🔐 Security Active

- ✅ **Encrypted API Storage**
- ✅ **Input Validation** 
- ✅ **Memory Management**
- ✅ **Error Handling**
- ✅ **XSS Protection**

---

## 📋 Quick Commands

```bash
# Check junction status
.\scripts\manage-junction.ps1 check

# Refresh extension
.\scripts\refresh-extension.ps1

# Debug extension
.\scripts\debug-ae-extension.ps1
```

---

## 🎯 Production Ready

The extension is fully configured for production use with:
- Professional UI with clean styling
- Complete security framework
- Comprehensive error handling
- Memory leak prevention
- Accessibility compliance (WCAG)
- Real-time development workflow

**Ready for After Effects 2025!** 🚀
