# Adobe AI Generations - File Structure

## Organized Structure (August 30, 2025)

```
Adobe_AI_Generations/
├── src/                              # Main application source
│   ├── index.html                    # Primary application file
│   ├── assets/                       # Static assets
│   │   └── mascot/                   # Mascot animations and assets
│   │       ├── ae-mascot-animated.gif (4MB)
│   │       ├── ae-mascot-animated.mp4 (8.7MB)
│   │       ├── *.webm files          # Animation states
│   │       ├── mascot-animator.js
│   │       └── mascot-assets.json
│   ├── styles/                       # CSS organization
│   │   ├── foundation/               # Base styles
│   │   │   ├── colors.css
│   │   │   ├── typography.css
│   │   │   ├── layout-modern.css
│   │   │   └── icons.css
│   │   ├── components/               # Component-specific styles
│   │   │   ├── buttons.css
│   │   │   ├── panels.css
│   │   │   ├── forms.css
│   │   │   └── navigation.css
│   │   └── themes/                   # Theme files
│   │       ├── vscode-theme.css
│   │       └── design-system.css
│   ├── scripts/                      # JavaScript organization
│   │   ├── modules/                  # Core functionality modules
│   │   │   ├── ai-module.js
│   │   │   ├── constants.js
│   │   │   ├── enhanced-performance-system.js
│   │   │   ├── module-monitor.js
│   │   │   └── [30+ other modules]
│   │   ├── components/               # UI components
│   │   │   ├── mascot.js
│   │   │   └── component-loader.js
│   │   └── libs/                     # External libraries
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
