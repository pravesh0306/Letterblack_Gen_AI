# Letterblack AI Chat Extension

A real-time AI chat extension for Adobe After Effects using Google Gemini API.

## Features
- ✅ Real-time chat with Google Gemini
- ✅ Secure encrypted API key storage
- ✅ Code generation for AE scripts/expressions
- ✅ Copy/Apply code directly to After Effects
- ✅ Compatible with all recent AE versions

## Quick Start

### 1. Build & Deploy
```bash
npm run build
npm run deploy
```

### 2. Enable in After Effects
1. Restart After Effects
2. Go to **Window → Extensions → Letterblack AI Chat**
3. Panel will open with chat interface

### 3. Configure API Key
1. Click **Settings** button in the panel
2. Enter a passphrase for encryption
3. Paste your [Google Gemini API key](https://makersuite.google.com/app/apikey)
4. Click **Save** to encrypt and store locally
5. Click **Load** to use the key in chat

### 4. Start Chatting
- Type: `"Give me a wiggle expression for position"`
- AI responds with code blocks that you can copy/apply

## Project Structure
```
src/
├── index.html              # Main panel UI
├── host-script.jsx         # AE host integration
├── CSXS/manifest.xml       # Extension manifest
└── js/
    ├── chat.js             # Chat logic & Gemini API
    ├── config.js           # Configuration
    ├── config.local.js     # Local API key (ignored)
    └── secure-api-settings-ui.js  # Encrypted settings UI
```

## Development Notes
- Extension ID: `com.letterblack.ae.ai.chat`
- Uses CSXS 11.0 for broad compatibility
- API keys are encrypted using Web Crypto (AES-GCM)
- Works with After Effects 2021+ (version 18.0+)

## Created by
pravesh.pandey@letterblack.ae
