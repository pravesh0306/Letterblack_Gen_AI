# LetterBlack Gen AI - Adobe After Effects Extension Deployment

## Deployment Status: ✅ COMPLETED

The LetterBlack Gen AI extension has been successfully deployed to Adobe After Effects using the official npm script method!

### 📦 Deployment Method Used
**NPM Scripts** (Recommended method from documentation):
```bash
npm run install-extension    # Build and deploy
npm run enable-cep-debug    # Enable debug mode
npm run uninstall-extension # Remove extension (if needed)
```

### 📍 Deployment Location
```
C:\Users\prave\AppData\Roaming\Adobe\CEP\extensions\com.letterblack.genai\
```

### 🚀 How to Access the Extension

1. **Close Adobe After Effects** if it's currently running
2. **Launch Adobe After Effects** (version 22.0 or higher required)
3. **Navigate to**: `Window > Extensions > LetterBlack_Gen_AI v2.0.2`
4. The extension panel will open showing the AI assistant interface

### 📋 What Was Deployed

- ✅ All built extension files (129 files from `src/` to `build/`)
- ✅ Manifest file (`CSXS/manifest.xml`) 
- ✅ Assets, CSS, JavaScript modules
- ✅ CEP debug mode enabled in Windows registry
- ✅ Extension registered with Adobe CEP system

### 🔧 Configuration Applied

- **Extension ID**: `com.letterblack.genai`
- **Version**: `2.0.2`
- **CEP Debug Mode**: Enabled (CSXS 11.0 & 12.0)
- **Panel Type**: Resizable panel (300x300 min, 1200x1200 max)
- **Host Compatibility**: After Effects 22.0+

### 🚨 Troubleshooting

If the extension doesn't appear:

1. **Restart After Effects** completely
2. **Check the Extensions menu** under `Window > Extensions`
3. **Verify After Effects version** is 22.0 or higher
4. **Re-run deployment**: Execute `npm run install-extension`
5. **Check extension files** exist in the deployment location above

### 🔄 Future Deployments

To redeploy after making changes:

```bash
# Using npm scripts (recommended)
npm run install-extension

# Or step by step
npm run build
npm run deploy-to-cep

# Or manual steps (Windows):
npm run build
xcopy build\* "%APPDATA%\Adobe\CEP\extensions\com.letterblack.genai\" /E /I /Y
```

### 📝 Extension Features Available

- 🤖 AI-powered After Effects assistance
- 💬 Chat interface with context awareness  
- 🎭 Floating mascot with notifications
- 🎤 Voice input and text-to-speech
- 📚 Script library and code generation
- ⚙️ Settings and API configuration
- 🔍 YouTube tutorial analysis
- 💾 Chat history and conversation management

The extension is now ready to use in Adobe After Effects!
