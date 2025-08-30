# Adobe AI Generations

A comprehensive AI-powered creative toolkit with a VS Code-style interface for creative professionals.

## Project Structure

```
Adobe_AI_Generations/
├── src/                          # Main application source code
│   ├── index.html               # Main application entry point
│   ├── main.jsx                 # Host application file
│   ├── assets/                  # Static assets
│   │   └── mascot/             # Mascot animations and graphics
│   ├── components/             # Reusable UI components
│   ├── scripts/                # JavaScript modules
│   │   ├── main.js            # Main application script
│   │   └── modules/           # Feature modules
│   └── styles/                 # CSS stylesheets
│       ├── foundation/        # Base styles (colors, typography, layout)
│       ├── components/        # Component-specific styles
│       └── *.css             # Feature-specific styles
├── config/                      # Configuration files
│   └── CSXS/                   # Adobe CEP configuration
├── reference/                   # Reference implementations
│   ├── typescript-clean-version/  # TypeScript/Svelte reference
│   └── reusable-mascot-system/   # Standalone mascot system
├── docs/                        # Documentation
├── package.json                 # Node.js dependencies
└── .gitignore                  # Git ignore rules
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
