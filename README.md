# LetterBlack Gen AI - After Effects Extension

An AI-powered Adobe After Effects CEP extension with enterprise-grade security, VS Code-style interface, and comprehensive development framework.

## 🚀 Features

- **🔐 Enterprise Security**: AES-256 encrypted storage, comprehensive input validation, XSS protection
- **🤖 AI Assistant**: Integrated chat interface with multiple AI providers (OpenAI, Google Gemini, Claude)
- **💾 Secure Storage**: Cross-platform encrypted storage that survives browser restarts
- **📝 Script Editor**: Built-in ExtendScript editor with syntax highlighting
- **🛠️ Project Tools**: Automated project analysis and optimization tools
- **📺 YouTube Integration**: Analyze and learn from After Effects tutorials
- **🧠 Smart Suggestions**: Context-aware recommendations based on your workflow
- **♿ Accessibility**: WCAG 2.1 compliant with screen reader support

## 🛡️ Security Framework

This extension implements enterprise-grade security:

- ✅ **AES-256 Encryption** for all sensitive data
- ✅ **Input Validation** with XSS protection
- ✅ **Memory Leak Prevention** with automatic cleanup
- ✅ **Error Boundaries** with comprehensive handling
- ✅ **Accessibility Compliance** (WCAG 2.1 Level AA)
- ✅ **Dependency Injection** preventing race conditions

See [docs/SECURITY_HARDENING_REPORT.md](docs/SECURITY_HARDENING_REPORT.md) for complete security details.

## � Storage System

The extension uses a robust, OS-correct storage system that saves chat history in appropriate user data directories:

**Windows:** `C:\Users\<USERNAME>\AppData\Roaming\Letterblack\AEChatExtension\`
**macOS:** `~/Library/Application Support/Letterblack/AEChatExtension/`

Features:
- ✅ Atomic file operations (corruption-resistant)
- ✅ Automatic file rotation (prevents large files)
- ✅ Secret redaction (protects API keys)
- ✅ Cross-platform compatibility
- ✅ No admin permissions required

See [docs/CHAT_STORAGE.md](docs/CHAT_STORAGE.md) for detailed documentation.

## �📁 Project Structure

```
LetterBlack_Gen_AI/
├── src/                          # CEP Extension source code
│   ├── index.html               # Main extension UI
│   ├── storage/                 # Persistent storage system
│   │   ├── chatStore.js        # Core storage module
│   │   ├── chatStore.test.js   # Test suite
│   │   └── demo.js             # Usage demonstration
│   ├── js/                      # JavaScript modules
│   │   ├── storage-integration.js # UI integration for storage
│   │   ├── ai/                 # AI integration modules
│   │   ├── core/               # Core functionality
│   │   ├── ui/                 # UI enhancement modules
│   │   └── utils/              # Utility functions
│   ├── assets/                  # Extension assets (mascot, icons)
│   ├── styles/                  # CSS stylesheets
│   │   ├── foundation/         # Base styles
│   │   ├── themes/             # VS Code themes
│   │   └── *.css              # Component styles
│   └── css/                     # Legacy CSS (to be organized)
├── config/                      # Adobe CEP configuration
│   └── CSXS/                   
│       └── manifest.xml        # Extension manifest
├── docs/                        # Documentation
│   └── CHAT_STORAGE.md         # Storage system documentation
├── reference/                   # Reference implementations
└── package.json                # Extension metadata
```

## 🛠 Installation

### Method 1: Manual Installation
1. Clone this repository
2. Copy the entire folder to your CEP extensions directory:
   - **Windows**: `%APPDATA%\Adobe\CEP\extensions\`
   - **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/`
3. Restart After Effects
4. Open the extension: `Window > Extensions > LetterBlack Gen AI`

### Method 2: Using Package Scripts
```bash
# Install extension to CEP directory
npm run install-extension

# Uninstall extension
npm run uninstall-extension
```

## Features

### Core Application
- **VS Code-style Interface**: Familiar development environment UI
- **AI Integration**: Multiple AI provider support (OpenAI, Anthropic, etc.)
- **Smart Suggestions**: AI-powered creative assistance
- **Performance Monitoring**: Real-time system performance tracking
- **Module System**: Modular architecture for easy extensibility

### Enhanced Features
- **Constants Management**: Centralized configuration system
- **Module Monitor**: Real-time debugging with load time tracking  
- **Performance System**: Intelligent monitoring with predictions
- **Animated Mascot**: Interactive AI assistant character
- **Memory System**: Context-aware AI interactions

## 🧪 Testing

The storage system includes comprehensive tests:

```bash
# Run storage system tests
npm run test-storage

# Run storage demonstration
npm run demo-storage

# Run all tests
npm test
```

**Test Coverage:**
- ✅ Cross-platform directory creation
- ✅ Message persistence and retrieval
- ✅ File rotation and archiving
- ✅ Secret redaction security
- ✅ Performance with 100+ messages
- ✅ Error handling and recovery

## Getting Started

1. **Development Server**:
   ```bash
   cd src
   python -m http.server 8080
   ```

2. **Open Application**:
   Navigate to `http://localhost:8080` in your browser

3. **Configure AI Settings**:
   - Click the settings icon in the bottom panel
   - Add your AI provider API key
   - Select your preferred model

4. **Test Storage System**:
   ```bash
   npm run demo-storage
   ```

## Development

### Adding New Modules
1. Create module in `src/scripts/modules/`
2. Add script tag to `src/index.html`
3. Follow existing module patterns for consistency

### Working with Storage
```javascript
// Access the storage system
const chatStore = require("./storage/chatStore");

// Create conversation
const id = chatStore.createConversation("My Conversation");

// Add messages
await chatStore.appendMessage(id, {
  role: "user",
  text: "Hello!",
  meta: { context: "development" }
});
```

### Styling Guidelines
- Use foundation styles for base elements
- Create component-specific styles in `src/styles/components/`
- Follow VS Code dark theme color scheme

### Asset Management
- Place images in `src/assets/`
- Use mascot assets for AI interaction feedback
- Optimize file sizes for web delivery

## Architecture

### Storage System
- **chatStore.js**: Core persistent storage with atomic writes
- **storage-integration.js**: UI integration layer
- **Cross-platform**: Windows AppData, macOS Application Support
- **Security**: Automatic secret redaction, corruption protection

### Module System
- **constants.js**: Configuration management
- **module-monitor.js**: Development debugging
- **enhanced-performance-system.js**: Performance tracking
- **ai-*.js**: AI provider integrations
- **ui-*.js**: User interface enhancements

### Component System
- Modular CSS architecture
- Reusable UI components
- Theme-consistent styling

## Performance

The application includes advanced performance monitoring:
- Module load time tracking
- Memory usage monitoring
- Performance predictions
- Real-time diagnostics

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile-responsive design

## License

[Add your license information here]
