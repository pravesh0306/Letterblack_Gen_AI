# Changelog

All notable changes to the LetterBlack Gen AI After Effects Extension project will be documented in this file.

## [1.0.0] - 2025-08-31

### 🧹 Major Cleanup & Restructure

#### Removed
- **React Web Application**: Moved all React/TypeScript components to `../web-app-backup/`
  - React components (`src/components/*.tsx`)
  - TypeScript stores (`src/store/*.ts`)
  - React hooks (`src/hooks/*.ts`)
  - TypeScript type definitions (`src/types/*.ts`)
  - Web build tools (Vite, Tailwind, ESLint configs)
  - Node.js server implementation
  - Web-specific dependencies

#### Added
- **Clean CEP Extension Structure**: Focused solely on Adobe CEP extension
- **CEP-specific package.json**: Removed React dependencies, added CEP metadata
- **Installation scripts**: Added npm scripts for CEP extension installation
- **Updated documentation**: README.md now reflects CEP extension focus

#### Changed
- **Project Focus**: From mixed React/CEP project to pure CEP extension
- **File Structure**: Streamlined to CEP extension essentials only
- **Git Ignore**: Updated for CEP development workflow
- **Main Entry**: `src/index.html` is now the primary extension UI

#### Technical Details
- Removed 66 React/web files (~16,396 lines of code)
- Preserved all After Effects ExtendScript functionality
- Maintained AI assistant features and VS Code-style UI
- Kept CEP manifest and configuration intact

### 📁 Current Structure
```
LetterBlack_Gen_AI/
├── src/                    # CEP Extension source
│   ├── index.html         # Main extension UI
│   ├── js/                # JavaScript modules
│   ├── assets/            # Extension assets
│   └── styles/            # CSS stylesheets
├── config/CSXS/           # CEP configuration
├── reference/             # Reference implementations
└── docs/                  # Documentation
```

### 🔄 Migration Notes
- **Web App Users**: React application moved to `../web-app-backup/`
- **CEP Users**: No breaking changes to extension functionality
- **Developers**: Use CEP development workflow instead of web dev tools

---

## Previous Versions

### [0.x.x] - Before 2025-08-31
- Mixed React web application and CEP extension in single repository
- Complex build system with multiple frameworks
- React-based workflow builder with 3D canvas
- TypeScript/Zustand state management
- Vite development server setup
