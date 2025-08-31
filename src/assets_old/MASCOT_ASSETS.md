# Mascot WebM Asset Inventory

This extension uses a transparent WebM video mascot with multiple scenario poses.

## Required Pose Files
| Scenario  | Expected File Path                    | Loop | Notes |
|----------|----------------------------------------|------|-------|
| idle     | src/assets/Idle.webm                   | yes  | Base idle animation |
| thinking | src/assets/problem solving.webm        | yes  | Shown during generation / processing |
| success  | src/assets/completion.webm             | no   | 3s celebration on completion |
| solution | src/assets/solution.webm               | no   | 3s lightbulb animation |
| explain  | src/assets/explain.webm                | no   | 3s explanatory gesture |
| debug    | src/assets/debug.webm                  | yes  | Continuous debugging motion |
| settings | src/assets/settings.webm               | no   | 2.5s configuration animation |

## Current Repository State (at last automation edit)
Present files detected:
- Idle.webm
- ae-mascot-animated.gif (fallback GIF)
- ae-mascot.png (static image)

Missing WebM pose files (must add to restore full animation set):
- problem solving.webm
- completion.webm
- solution.webm
- explain.webm
- debug.webm
- settings.webm

## Adding Missing Assets
Place each missing `.webm` file into `src/assets/` using exactly the filenames above (case-sensitive on some platforms). Transparent alpha WebM (VP9 with alpha) recommended.

After adding, reload the extension; the runtime `validateAssets()` in `mascot-animator.js` will automatically pick them up and `window.listMissingMascotAssets()` should return an empty array.

## Diagnostic Helpers
In DevTools console:
- `listMissingMascotAssets()` → lists any poses still missing.
- `testMascotAnimations()` → cycles through all scenarios (falls back to idle for missing ones).
- `checkMascotHealth()` → prints video element status.

## Notes
If a file is missing the system falls back to `Idle.webm` for that scenario to avoid errors. Add the proper file to restore unique animation.
