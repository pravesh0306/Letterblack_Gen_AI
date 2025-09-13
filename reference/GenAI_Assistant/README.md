# Gen.AI After Effects CEP Extension (Streamlined)

## Status (2025-08-21)
- Stable, simplified panel with VS Code-style UI
- Real AI calls via `js/modules/ai-providers.js`
- Compact interactive code blocks (Copy / Apply / Save) with inline SVG icons
- Auto-scroll and toast notifications working

## Key Features
- VS Code–style panel UI
- Multi-provider AI assistance (Gemini, Groq, etc.)
- Image & (placeholder for video) context support
- Reusable Mascot System (welcome, thinking, notifications)
- Script / Expression editor with Run & Apply
- Settings persistence (localStorage)
- Lightweight packaging stub

## Minimal file set kept
- `index.html`
- `CSXS/manifest.xml`
- `host/main.jsx` (ExtendScript bridge)
- `assets/icon.svg`, `assets/ae-mascot.png`
- `css/:` `vscode-theme.css`, `core.css`, `header.css`, `layout.css`, `chat.css`, `code-display.css`, `script.css`, `settings.css`, `tabs.css`, `api-feedback.css`
- `js/libs:` `CSInterface.js`, `utility.js`
- `js/modules:` `ai-providers.js`, `ai_module.js`, `chat_memory.js`, `simple-project-context.js`, `simple-settings-manager.js`, `simple-youtube-helper.js`, `simple-toast.js`
- `js/simple-main.js`

## Installation (CEP)
1. Locate Adobe CEP extensions directory:
	- Windows: `%APPDATA%/Adobe/CEP/extensions` or `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions`
	- macOS: `~/Library/Application Support/Adobe/CEP/extensions`
2. Create folder `Gen_AI_Assist` (or match the `ExtensionBundleId` in `CSXS/manifest.xml`).
3. Copy project files into that folder.
4. Ensure `PlayerDebugMode` is enabled for development:
	- Windows registry: `HKEY_CURRENT_USER\Software\Adobe\CSXS.<version>\PlayerDebugMode` = `1`
	- macOS: `defaults write com.adobe.CSXS.<version> PlayerDebugMode 1`
5. Launch After Effects and open via `Window > Extensions > Gen.AI Assist`.

## Usage
1. Open Settings tab.
2. Select provider and paste API key.
3. (Optional) Add additional project context.
4. Toggle Mascot Assistant on/off.
5. Start chatting—mascot shows thinking state.
6. Use generated scripts/expressions in Script Editor; Run or Apply.

## Mascot System
- Integrated from `Reusable_Mascot_System/`.
- Provides: welcome animation, thinking indicator, notifications.
- Toggle via Settings: "Enable Mascot Assistant".
- API (global if enabled): `window.MascotAnimator` (instance injected internally).

## Developer Tooling
Requires Node (>=18) if you want lint/format/package helpers.

Setup:
```sh
npm install
```

Scripts:
```sh
npm run lint       # ESLint check
npm run format     # Prettier write
npm run build      # Placeholder (add bundler if needed)
npm run package    # Creates dist/ build stamp (expand later)
```

## Packaging (Planned Enhancement)
Current `scripts/package-cep.js` just stamps a file. Future improvements:
1. Copy whitelisted runtime assets to `dist/`.
2. Generate zip: `Gen_AI_Assist_v<version>.zip`.
3. (Optional) Replace version string in `CSXS/manifest.xml`.

## Roadmap
- Add Vite build for module bundling & optional TS.
- Add unit tests (Jest) for prompt builder & settings manager.
- Expand YouTube/video analysis.
- Unified notification wrapper (toast + mascot).
- Proper packaging/zip pipeline.

## Notes
- If icons/styles don’t update, close and reopen the panel to clear CEP cache.
- To test UI: In DevTools console, run `testEnhancedCodeBlocks()` or `testButtonFunctions()`.
- For debugging CEP, open the panel then use `CEP HTML Engine` in Chrome DevTools (or `--enable-logging`).

## License
- Internal project; no external redistribution.
