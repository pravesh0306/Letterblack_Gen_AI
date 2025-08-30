// constants.ts
// Central place for magic numbers / timeouts / sizing thresholds.

interface AppConstants {
  readonly INIT_DELAY_MS: number;
  readonly BOTTOM_PANEL: {
    readonly DEFAULT_HEIGHT: number;
    readonly MIN_HEIGHT: number;
    readonly MAX_HEIGHT_RATIO: number;
  };
  readonly CHAR_LIMIT: number;
  readonly PRESET_SCALE: {
    readonly GRID_ENABLE_THRESHOLD: number;
    readonly GRID_DISABLE_THRESHOLD: number;
  };
}

export const APP_CONSTANTS: AppConstants = Object.freeze({
  INIT_DELAY_MS: 1000,
  BOTTOM_PANEL: {
    DEFAULT_HEIGHT: 300,
    MIN_HEIGHT: 140,
    MAX_HEIGHT_RATIO: 0.8
  },
  CHAR_LIMIT: 1000,
  PRESET_SCALE: {
    GRID_ENABLE_THRESHOLD: 0.9,
    GRID_DISABLE_THRESHOLD: 1.1
  }
});