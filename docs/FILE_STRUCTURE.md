# LetterBlack Gen AI - CEP Extension File Structure

## Current Structure (August 31, 2025)

```
LetterBlack_Gen_AI/                    # Root project directory
├── config/                           # CEP Extension configuration
│   └── CSXS/
│       └── manifest.xml              # Adobe CEP manifest
├── src/                              # CEP Extension source code
│   ├── index.html                    # Main extension UI entry point
│   ├── assets/                       # Extension assets
│   │   ├── ae-mascot-animated.gif    # Mascot animations
│   │   ├── ae-mascot-animated.mp4    
│   │   ├── *.webm files              # Animation states
│   │   ├── mascot-animator.js
│   │   ├── mascot-assets.json
│   │   └── icon.svg                  # Extension icon
│   ├── js/                           # JavaScript modules
│   │   ├── ai/                       # AI integration
│   │   │   ├── ai-module.js
│   │   │   ├── ai-providers.js
│   │   │   ├── chat-memory.js
│   │   │   └── smart-ai-suggestion-engine.js
│   │   ├── core/                     # Core functionality
│   │   │   ├── main.js
│   │   │   ├── constants.js
│   │   │   ├── enhanced-main.js
│   │   │   └── module-monitor.js
│   │   ├── ui/                       # UI components
│   │   │   ├── component-loader.js
│   │   │   ├── tab-switching.js
│   │   │   └── ui-animator.js
│   │   └── utils/                    # Utility functions
│   │       ├── project-tools.js
│   │       ├── simple-file-upload.js
│   │       └── simple-toast.js
│   ├── styles/                       # CSS stylesheets
│   │   ├── foundation/               # Base styles
│   │   │   ├── colors.css
│   │   │   ├── typography.css
│   │   │   └── layout-modern.css
│   │   ├── themes/                   # VS Code themes
│   │   │   └── vscode-theme.css      # Main theme file
│   │   └── *.css                     # Component styles
│   └── css/                          # Legacy CSS (to be organized)
├── docs/                             # Project documentation
│   ├── CSS_COMPATIBILITY.md
│   ├── FILE_STRUCTURE.md
│   └── WORKSPACE_ORGANIZATION.md
├── reference/                        # Clean reference implementations
│   └── src/                          # Reference code examples
├── package.json                      # CEP extension metadata
├── DEVELOPMENT.md                    # Development guide
├── README.md                         # Project overview
├── CHANGELOG.md                      # Version history
└── .gitignore                        # Git ignore rules
│   │       ├── CSInterface.js
│   │       └── utility.js
│   ├── advanced-main.jsx             # Advanced React entry point
│   └── main.jsx                      # Simple entry point
├── config/                           # Configuration files
│   ├── package.json
│   └── package-lock.json
├── reference/                        # Reference materials
│   ├── typescript-clean-version/     # TypeScript implementation
│   └── reusable-mascot-system/       # Standalone mascot system
├── docs/                            # Documentation
│   ├── README.md
│   ├── DEVELOPMENT.md
│   ├── MASCOT_ASSETS.md
│   └── FILE_STRUCTURE.md (this file)
└── .gitignore
```

## Key Improvements Made

### ✅ **Eliminated Redundancy**
- Removed nested `Adobe_AI_Generations/Adobe_AI_Generations/` structure
- Consolidated duplicate asset folders (saved ~13MB)
- Single source of truth for all files

### ✅ **Logical Organization**
- **src/**: All active application code
- **reference/**: TypeScript and alternative implementations
- **config/**: Build and configuration files
- **docs/**: All documentation

### ✅ **Modular CSS Architecture**
- **foundation/**: Base design system
- **components/**: Feature-specific styles
- **themes/**: Customizable themes

### ✅ **Organized JavaScript**
- **modules/**: Core business logic (33+ modules)
- **components/**: Reusable UI components
- **libs/**: External dependencies

### ✅ **Asset Management**
- Centralized mascot assets in `src/assets/mascot/`
- Preserved all animation states and configurations
- Updated all path references in application

## Status
- ✅ File structure organized and optimized
- ✅ All path references updated in index.html
- ✅ Duplicate assets removed (13MB saved)
- ✅ Modular architecture maintained
- ✅ Reference materials preserved
- ✅ Development workflow streamlined

## Next Steps
1. Update any remaining hardcoded paths in JavaScript modules
2. Consider adding build scripts for optimization
3. Set up automated file organization rules
