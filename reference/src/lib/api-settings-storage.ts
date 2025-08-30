import { CSInterface } from '@cep/csinterface';

// Define the structure of the settings object
interface ApiSettings {
    provider: string;
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    contextMemory: string;
    mascotEnabled: boolean;
    lastUpdated?: string;
}

export class ApiSettingsStorage {
    private readonly isInCEP: boolean;
    private settingsFile: string | null = null;
    private isInitialized: boolean = false;

    constructor() {
        this.isInCEP = typeof window.CSInterface !== 'undefined';
        
        if (this.isInCEP) {
            this.initializeSettingsFile();
        } else {
            console.log('🔑 Running in browser - using localStorage for API settings');
            this.isInitialized = true; // Ready to use localStorage
        }
    }

    private initializeSettingsFile(): void {
        const csInterface = new CSInterface();
        
        const script = `
            try {
                var userDocuments = Folder.myDocuments;
                var storageFolder = new Folder(userDocuments.fullName + "/Adobe/After Effects/AI_Prepro_Library");
                
                if (!storageFolder.exists) {
                    storageFolder.create();
                }
                
                var settingsFile = new File(storageFolder.fullName + "/api_settings.json");
                
                if (!settingsFile.exists) {
                    var defaultSettings = {
                        "provider": "google",
                        "apiKey": "",
                        "model": "gemini-1.5-flash-latest",
                        "temperature": 0.7,
                        "maxTokens": 2048,
                        "contextMemory": "",
                        "mascotEnabled": true,
                        "lastUpdated": new Date().toISOString()
                    };
                    
                    settingsFile.open('w');
                    settingsFile.write(JSON.stringify(defaultSettings, null, 2));
                    settingsFile.close();
                }
                
                settingsFile.fullName;
            } catch (error) {
                "ERROR: " + error.toString();
            }
        `;

        csInterface.evalScript(script, (result) => {
            if (result.startsWith('ERROR:')) {
                console.error('❌ Failed to initialize API settings file:', result);
            } else {
                this.settingsFile = result;
                this.isInitialized = true;
                console.log('🔑 API settings file initialized:', result);
            }
        });
    }

    async saveSettings(settings: Partial<ApiSettings>): Promise<boolean> {
        if (!this.isInitialized) {
            console.error('❌ API settings storage not initialized');
            return false;
        }

        if (!this.isInCEP) {
            return this.saveToLocalStorage(settings);
        }

        return new Promise((resolve) => {
            const settingsWithTimestamp = {
                ...settings,
                lastUpdated: new Date().toISOString()
            };
            
            const jsonData = JSON.stringify(settingsWithTimestamp, null, 2);
            const script = `
                try {
                    var file = new File("${this.settingsFile}");
                    file.open('w');
                    file.write('${jsonData.replace(/'/g, "\'"').replace(/"/g, '\"')}');
                    file.close();
                    "SUCCESS";
                } catch (error) {
                    "ERROR: " + error.toString();
                }
            `;

            new CSInterface().evalScript(script, (result) => {
                if (result === 'SUCCESS') {
                    console.log('✅ API settings saved to file');
                    resolve(true);
                } else {
                    console.error('❌ Failed to save API settings:', result);
                    resolve(false);
                }
            });
        });
    }

    async loadSettings(): Promise<ApiSettings> {
        if (!this.isInitialized) {
            console.log('🔑 API settings not ready, returning defaults');
            return this.getDefaultSettings();
        }

        if (!this.isInCEP) {
            return this.loadFromLocalStorage();
        }

        return new Promise((resolve) => {
            const script = `
                try {
                    var file = new File("${this.settingsFile}");
                    if (!file.exists) {
                        '${JSON.stringify(this.getDefaultSettings())}';
                    } else {
                        file.open('r');
                        var content = file.read();
                        file.close();
                        content;
                    }
                } catch (error) {
                    '${JSON.stringify(this.getDefaultSettings())}';
                }
            `;

            new CSInterface().evalScript(script, (result) => {
                try {
                    const settings = JSON.parse(result);
                    console.log('📖 API settings loaded from file');
                    resolve(settings);
                } catch (error) {
                    console.error('❌ Failed to parse API settings, using defaults');
                    resolve(this.getDefaultSettings());
                }
            });
        });
    }

    private getDefaultSettings(): ApiSettings {
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

    private saveToLocalStorage(settings: Partial<ApiSettings>): Promise<boolean> {
        try {
            const currentSettings = this.loadFromLocalStorage();
            const newSettings = { ...currentSettings, ...settings };
            localStorage.setItem('ae_ai_api_settings', JSON.stringify(newSettings));
            console.log('💾 API settings saved to localStorage');
            return Promise.resolve(true);
        } catch (error) {
            console.error('❌ localStorage save failed:', error);
            return Promise.resolve(false);
        }
    }

    private loadFromLocalStorage(): Promise<ApiSettings> {
        try {
            const data = localStorage.getItem('ae_ai_api_settings');
            const settings = data ? JSON.parse(data) : this.getDefaultSettings();
            console.log('📖 API settings loaded from localStorage');
            return Promise.resolve(settings);
        } catch (error) {
            console.error('❌ localStorage load failed:', error);
            return Promise.resolve(this.getDefaultSettings());
        }
    }

    async clearSettings(): Promise<boolean> {
        const defaultSettings = this.getDefaultSettings();
        return this.saveSettings(defaultSettings);
    }

    openSettingsFolder(): void {
        if (!this.isInCEP || !this.settingsFile) {
            console.log('🔑 Settings location: Browser LocalStorage');
            return;
        }

        const script = `
            try {
                var file = new File("${this.settingsFile}");
                var folder = file.parent;
                folder.execute();
                "SUCCESS";
            } catch (error) {
                "ERROR: " + error.toString();
            }
        `;
        new CSInterface().evalScript(script, (result) => {
            if (result === 'SUCCESS') {
                console.log('📂 Settings folder opened');
            } else {
                console.error('❌ Failed to open settings folder:', result);
            }
        });
    }

    getSettingsPath(): string {
        return this.settingsFile || 'Browser LocalStorage';
    }
}

export default new ApiSettingsStorage();