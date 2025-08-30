// preset-layout.ts
// Handles preset/expression layout scaling and search filtering.

class PresetLayout {
    private scaleInput: HTMLInputElement | null;
    private searchInput: HTMLInputElement | null;
    private presetsContainer: HTMLElement | null;
    private root: HTMLElement;

    constructor() {
        this.scaleInput = document.getElementById('preset-scale-range') as HTMLInputElement;
        this.searchInput = document.getElementById('expression-search') as HTMLInputElement;
        this.presetsContainer = document.getElementById('built-in-expression-presets');
        this.root = document.documentElement;

        // Bind methods
        this.handleScale = this.handleScale.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    /**
     * Initializes the preset layout controls and attaches event listeners.
     */
    public init(): void {
        if (this.scaleInput) {
            this.scaleInput.addEventListener('input', this.handleScale);
            // Set initial scale and layout
            this.handleScale();
        } else {
            console.warn('PresetLayout: Scale input not found.');
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleSearch);
        } else {
            console.warn('PresetLayout: Search input not found.');
        }
    }

    /**
     * Handles the scaling of the preset items.
     * Automatically adjusts the layout to grid mode when items are scaled down.
     */
    private handleScale(): void {
        if (!this.scaleInput) return;

        const scaleValue = parseFloat(this.scaleInput.value);
        this.root.style.setProperty('--preset-scale', scaleValue.toString());

        // Automatically switch to grid layout for smaller scales to improve visibility
        if (this.presetsContainer) {
            if (scaleValue < 0.9) {
                this.presetsContainer.classList.add('grid-layout');
            } else if (scaleValue >= 1.1) {
                this.presetsContainer.classList.remove('grid-layout');
            }
        }
    }

    /**
     * Handles the search/filter functionality for presets.
     * Filters presets based on matching text in their title or code content.
     */
    private handleSearch(): void {
        if (!this.searchInput || !this.presetsContainer) return;

        const query = this.searchInput.value.toLowerCase().trim();
        const allPresets = this.presetsContainer.querySelectorAll('.preset-item');

        allPresets.forEach(item => {
            const htmlItem = item as HTMLElement;
            const title = htmlItem.querySelector('.preset-title')?.textContent?.toLowerCase() || '';
            const code = htmlItem.querySelector('.preset-code')?.textContent?.toLowerCase() || '';
            
            const isVisible = title.includes(query) || code.includes(query);
            htmlItem.style.display = isVisible ? '' : 'none';
        });
    }

    /**
     * Cleans up event listeners.
     */
    public destroy(): void {
        if (this.scaleInput) {
            this.scaleInput.removeEventListener('input', this.handleScale);
        }
        if (this.searchInput) {
            this.searchInput.removeEventListener('input', this.handleSearch);
        }
        console.log('PresetLayout listeners cleaned up.');
    }
}

export default new PresetLayout();