# LetterBlack Gen AI - After Effects Extension

An AI-powered Adobe After Effects CEP extension with VS Code-style interface for creative automation and scripting assistance.

## 🚀 Features

- **AI Assistant**: Integrated chat interface with multiple AI providers (OpenAI, Google Gemini, Claude)
- **Script Editor**: Built-in ExtendScript editor with syntax highlighting
- **Project Tools**: Automated project analysis and optimization tools
- **YouTube Integration**: Analyze and learn from After Effects tutorials
- **Smart Suggestions**: Context-aware recommendations based on your workflow
- **Save & Organize**: Manage your custom scripts and expressions

## 📁 Project Structure

```
LetterBlack_Gen_AI/
├── src/                          # CEP Extension source code
│   ├── index.html               # Main extension UI
│   ├── assets/                  # Extension assets (mascot, icons)
│   ├── js/                      # JavaScript modules
│   │   ├── ai/                 # AI integration modules
│   │   ├── core/               # Core functionality
│   │   ├── ui/                 # UI enhancement modules
│   │   └── utils/              # Utility functions
│   ├── styles/                  # CSS stylesheets
│   │   ├── foundation/         # Base styles
│   │   ├── themes/             # VS Code themes
│   │   └── *.css              # Component styles
│   └── css/                     # Legacy CSS (to be organized)
├── config/                      # Adobe CEP configuration
│   └── CSXS/                   
│       └── manifest.xml        # Extension manifest
├── reference/                   # Reference implementations
│   └── src/                    # Clean reference version
├── docs/                        # Documentation
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

## Development

### Adding New Modules
1. Create module in `src/scripts/modules/`
2. Add script tag to `src/index.html`
3. Follow existing module patterns for consistency

### Styling Guidelines
- Use foundation styles for base elements
- Create component-specific styles in `src/styles/components/`
- Follow VS Code dark theme color scheme

### Asset Management
- Place images in `src/assets/`
- Use mascot assets for AI interaction feedback
- Optimize file sizes for web delivery

## Architecture

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
