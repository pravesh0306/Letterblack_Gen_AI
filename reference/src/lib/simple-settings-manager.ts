import { ApiSettingsStorage } from './api-settings-storage';
// Assuming MultiKeyRotationUI is defined elsewhere and will be available on the window object
// import { MultiKeyRotationUI } from './multi-key-rotation-ui'; 

// Define the structure of the settings object
interface Settings {
    provider: string;
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    contextMemory: string;
    mascotEnabled: boolean;
}

class SimpleSettingsManager {
    private apiStorage: ApiSettingsStorage;
    private settings: Settings;
    private contextSaveTimeout: number | undefined;

    constructor() {
        console.log('🏗️ Initializing SimpleSettingsManager...');
        this.apiStorage = new ApiSettingsStorage();
        this.settings = this.getDefaults();
        this.loadSettings().then(() => {
            if (typeof document !== 'undefined') {
                this.initializeUI();
            }
        });
    }

    async loadSettings(): Promise<Settings> {
        try {
            const loadedSettings = await this.apiStorage.loadSettings();
            this.settings = { ...this.getDefaults(), ...loadedSettings };
            return this.settings;
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = this.getDefaults();
            return this.settings;
        }
    }

    private getDefaults(): Settings {
        return {
            provider: 'google',
            apiKey: '',
            model: 'gemini-1.5-flash-latest',
            temperature: 0.7,
            maxTokens: 2048,
            contextMemory: '',
            mascotEnabled: true
        };
    }

    async saveSettings(): Promise<boolean> {
        try {
            const success = await this.apiStorage.saveSettings(this.settings);
            if (success) {
                this.showFeedback('Settings saved successfully', 'success');
            }
            return success;
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showFeedback('Failed to save settings', 'error');
            return false;
        }
    }

    private initializeUI(): void {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }

    private setupUI(): void {
        this.populateProviderOptions();
        this.populateModelOptions();
        this.bindUIElements();
    }

    private bindUIElements(): void {
        const providerSelect = document.getElementById('api-provider') as HTMLSelectElement;
        const apiKeyInput = document.getElementById('api-key-setting') as HTMLInputElement;
        const modelSelect = document.getElementById('model-select-setting') as HTMLSelectElement;
        const memoryTextarea = document.getElementById('memory-textarea') as HTMLTextAreaElement;
        const mascotCheckbox = document.getElementById('mascot-enabled-setting') as HTMLInputElement;
        const saveButton = document.querySelector('.settings-actions .toolbar-btn.primary') as HTMLButtonElement;

        if (providerSelect) {
            providerSelect.value = this.settings.provider;
            providerSelect.addEventListener('change', (e) => {
                this.settings.provider = (e.target as HTMLSelectElement).value;
                this.populateModelOptions();
                this.saveSettings();
            });
        }

        if (apiKeyInput) {
            apiKeyInput.value = this.settings.apiKey;
            apiKeyInput.addEventListener('input', (e) => {
                this.settings.apiKey = (e.target as HTMLInputElement).value;
                setTimeout(() => this.saveSettings(), 500);
            });
        }

        if (modelSelect) {
            modelSelect.value = this.settings.model;
            modelSelect.addEventListener('change', (e) => {
                this.settings.model = (e.target as HTMLSelectElement).value;
                this.saveSettings();
            });
        }
        
        if (memoryTextarea) {
            memoryTextarea.value = this.settings.contextMemory || '';
            memoryTextarea.addEventListener('input', (e) => {
                this.settings.contextMemory = (e.target as HTMLTextAreaElement).value;
                window.clearTimeout(this.contextSaveTimeout);
                this.contextSaveTimeout = window.setTimeout(() => this.saveSettings(), 1000);
            });
        }

        if (mascotCheckbox) {
            mascotCheckbox.checked = this.settings.mascotEnabled;
            mascotCheckbox.addEventListener('change', (e) => {
                this.settings.mascotEnabled = (e.target as HTMLInputElement).checked;
                this.saveSettings();
                document.dispatchEvent(new CustomEvent('mascot:toggle', { detail: { enabled: this.settings.mascotEnabled } }));
            });
        }

        if (saveButton) {
            saveButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveAndTest();
            });
        }
    }

    private populateProviderOptions(): void {
        const providerSelect = document.getElementById('api-provider') as HTMLSelectElement;
        if (!providerSelect) return;

        providerSelect.innerHTML = '';
        const providers = [
            { value: 'google', label: 'Google Gemini' },
            { value: 'openai', label: 'OpenAI GPT' },
            { value: 'anthropic', label: 'Anthropic Claude' },
            { value: 'xai', label: 'xAI Grok' },
            { value: 'openrouter', label: 'OpenRouter' },
            { value: 'ollama', label: 'Ollama (Local)' },
            { value: 'local', label: 'Local Model' }
        ];

        providers.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider.value;
            option.textContent = provider.label;
            providerSelect.appendChild(option);
        });

        providerSelect.value = this.settings.provider;
    }

    private populateModelOptions(): void {
        const modelSelect = document.getElementById('model-select-setting') as HTMLSelectElement;
        if (!modelSelect) return;

        const currentProvider = this.settings.provider;
        modelSelect.innerHTML = '';

        const modelsByProvider: { [key: string]: { value: string, label: string }[] } = {
            google: [
                { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Latest)' },
                { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Latest)' },
            ],
            openai: [
                { value: 'gpt-4o', label: 'GPT-4o' },
                { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
            ],
            // ... other providers
        };

        const models = modelsByProvider[currentProvider] || [{ value: 'default', label: 'Default Model' }];
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.label;
            modelSelect.appendChild(option);
        });

        const currentModel = this.settings.model;
        if (models.some(m => m.value === currentModel)) {
            modelSelect.value = currentModel;
        } else {
            modelSelect.value = models[0].value;
            this.settings.model = models[0].value;
        }
    }

    async testConnection(): Promise<void> {
        // This method would depend on the AIModule, which will be converted next.
        // For now, we'll just show feedback.
        this.showFeedback('Test Connection functionality will be implemented with AIModule.', 'info');
    }

    async saveAndTest(): Promise<void> {
        this.updateSettingsFromForm();
        const saved = await this.saveSettings();
        if (saved) {
            await this.testConnection();
        }
    }

    private updateSettingsFromForm(): void {
        const providerSelect = document.getElementById('api-provider') as HTMLSelectElement;
        const apiKeyInput = document.getElementById('api-key-setting') as HTMLInputElement;
        const modelSelect = document.getElementById('model-select-setting') as HTMLSelectElement;
        
        if (providerSelect) this.settings.provider = providerSelect.value;
        if (apiKeyInput) this.settings.apiKey = apiKeyInput.value;
        if (modelSelect) this.settings.model = modelSelect.value;
    }

    private showFeedback(message: string, type: 'info' | 'success' | 'error' | 'warning'): void {
        console.log(`💬 Settings Feedback (${type}): ${message}`);
        // Integration with a real toast/notification system would go here.
        // For example: window.simpleToast.show(message, type);
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

export default new SimpleSettingsManager();