# Mascot WebM Asset Inventory

This extension uses a transparent WebM video mascot with multiple scenario poses.

## Required Pose Files
| Scenario  | Expected File Path         | Loop | Notes |
|----------|-----------------------------|------|-------|
| idle     | assets/Idle.webm            | yes  | Base idle animation |
| thinking | assets/problem-solving.webm | yes  | Shown during generation / processing |
| success  | assets/completion.webm      | no   | 3s celebration on completion |
| solution | assets/solution.webm        | no   | 3s lightbulb animation |
| explain  | assets/explain.webm         | no   | 3s explanatory gesture |
| debug    | assets/debug.webm           | yes  | Continuous debugging motion |
| settings | assets/settings.webm        | no   | 2.5s configuration animation |

## Current Repository State
Present files detected:
- Idle.webm
- problem-solving.webm
- completion.webm
- solution.webm
- explain.webm
- debug.webm
- settings.webm
- ae-mascot-animated.gif (fallback GIF)
- ae-mascot.png (static image)

Missing WebM pose files: none

## Adding Missing Assets
Place each `.webm` file into `src/assets/` (source) using the filenames above (case-sensitive on some platforms). During build, assets are copied to `build/assets/`. Transparent alpha WebM (VP9 with alpha) recommended.

After adding, reload the extension; the runtime `validateAssets()` in `mascot-animator.js` will automatically pick them up and `window.listMissingMascotAssets()` should return an empty array.

## Diagnostic Helpers
In DevTools console:
- `listMissingMascotAssets()` → lists any poses still missing.
- `testMascotAnimations()` → cycles through all scenarios (falls back to idle for missing ones).
- `checkMascotHealth()` → prints video element status.

## Preview Mascot Changes in After Effects (npm scripts)
Use the project’s npm scripts to deploy and preview updates:

```bash
npm run install-extension   # Build and deploy to CEP folder
# After deployment: Restart AE, then Window > Extensions > LetterBlack_Gen_AI
```

## Notes
If a file is missing the system falls back to `Idle.webm` for that scenario to avoid errors. Add the proper file to restore unique animation.
