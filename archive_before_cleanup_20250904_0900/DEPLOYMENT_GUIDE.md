# LetterBlack GenAI - Deployment Guide

## 🚀 Reliable Deployment System

Your extension now has a comprehensive deployment system that ensures it works consistently every time!

### 📦 Available Deployment Commands

#### 1. **Full Deployment** (Recommended)
```bash
npm run deploy
```
- Builds the project
- Stops CEP processes to prevent caching
- Enables CEP debugging
- Copies files to extension directory
- Adds timestamp indicators
- Verifies all required files exist
- Provides clear status updates

#### 2. **Quick Deployment** (Development)
```bash
npm run deploy:quick
```
- Fast build and copy
- Updates timestamp
- Stops CEP engine for refresh
- Perfect for rapid iteration

#### 3. **Force Deployment** (When stuck)
```bash
npm run deploy:force
```
- Full deployment + restarts After Effects
- Use when extension appears cached/stuck

#### 4. **Auto-Deploy Watcher** (Development)
```bash
npm run deploy:auto
```
- Watches `src/` folder for changes
- Automatically deploys when files change
- Great for active development

### 🔍 How to Verify Deployment Worked

#### Visual Indicators:
1. **Green timestamp badge** in extension header: "UPDATED [timestamp]"
2. **Blue refresh button** next to the timestamp
3. **Updated window title** with timestamp

#### Console Verification:
1. Press **F12** in the extension panel
2. Look for: `🚀 EXTENSION UPDATED - [timestamp] - Mascot Typing Indicator Active!`

#### Functional Test:
1. Type a message in chat: "add wiggle to position"
2. Watch for the **mascot** (not emoji) during AI processing

### 🛠️ Troubleshooting

#### Extension Not Updating?
```bash
# Stop all CEP processes
Stop-Process -Name "CEPHtmlEngine" -Force -ErrorAction SilentlyContinue

# Force deployment
npm run deploy:force
```

#### Extension Not Visible?
1. Check: **Window > Extensions > LetterBlack Gen AI**
2. If missing: **Window > Extensions > Manage Extensions**
3. Ensure CEP debugging is enabled (deploy script does this automatically)

#### Changes Not Appearing?
1. Click the **🔄 REFRESH** button in extension header
2. Or press **Ctrl+R** in the extension panel
3. Or run: `npm run deploy:quick`

### 📁 File Structure After Deployment

```
com.letterblack.genai_Build/
├── index.html                 # Main UI (with timestamp)
├── js/
│   ├── ai/
│   │   └── chat-demo.js      # Chat system (with mascot typing)
│   └── core/
│       └── main.js           # Core functionality
├── css/                      # All styles
├── assets/                   # Mascot images & videos
├── CSXS/
│   └── manifest.xml          # CEP configuration
└── storage/                  # Data persistence
```

### ⚡ Development Workflow

#### Daily Development:
1. Make changes in `src/`
2. Run: `npm run deploy:quick`
3. Test in After Effects

#### Feature Development:
1. Start: `npm run deploy:auto` (watches for changes)
2. Code in `src/`
3. Changes auto-deploy on save

#### Release Preparation:
1. Run: `npm run deploy` (full verification)
2. Test all features
3. Document changes

### 🎯 Extension Loading Process

1. **After Effects starts** → Loads CEP extensions
2. **Extension loads** → Runs `index.html`
3. **JavaScript executes** → Initializes `AIAssistant` class
4. **Console logs** → Shows update confirmation
5. **UI displays** → With timestamp badge
6. **Ready to use** → Mascot typing indicator active

### 🔧 Advanced Configuration

#### Enable CEP Debugging (Done automatically):
```powershell
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
```

#### Manual File Copy:
```powershell
Copy-Item -Path "build\*" -Destination "com.letterblack.genai_Build\" -Recurse -Force
```

#### Check Extension Directory:
```powershell
Get-ChildItem "com.letterblack.genai_Build" -Recurse -Name
```

---

## ✅ YES, YOUR EXTENSION WILL RUN WITH EVERY DEPLOYMENT!

The deployment system ensures:
- ✅ **Consistent builds** with verification
- ✅ **Cache clearing** to prevent old versions
- ✅ **Timestamp tracking** for version confirmation
- ✅ **Automatic setup** of CEP debugging
- ✅ **File integrity checks** before completion
- ✅ **Clear success/failure indicators**

**Just run `npm run deploy` and your extension will work reliably every time!** 🎉
