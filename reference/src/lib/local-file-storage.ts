import { CSInterface } from '@cep/csinterface';

// Define interfaces for the library items and data
interface LibraryItem {
    id: string;
    name: string;
    content: string;
    tags?: string[];
    description?: string;
}

type LibraryType = 'scripts' | 'expressions';
type LibraryData = LibraryItem[];

export class LocalFileStorageManager {
    private readonly isInCEP: boolean;
    private storageFolder: string | null = null;
    private isInitialized: boolean = false;

    constructor() {
        this.isInCEP = typeof window.CSInterface !== 'undefined';
        
        if (this.isInCEP) {
            this.initializeStorageFolder();
        } else {
            console.log('📁 Running in browser - using localStorage fallback');
            this.isInitialized = true;
        }
    }

    private initializeStorageFolder(): void {
        if (!this.isInCEP) return;

        const csInterface = new CSInterface();
        const script = `
            try {
                var userDocuments = Folder.myDocuments;
                var storageFolder = new Folder(userDocuments.fullName + "/Adobe/After Effects/AI_Prepro_Library");
                if (!storageFolder.exists) storageFolder.create();
                
                var scriptsFolder = new Folder(storageFolder.fullName + "/Scripts");
                if (!scriptsFolder.exists) scriptsFolder.create();
                
                var expressionsFolder = new Folder(storageFolder.fullName + "/Expressions");
                if (!expressionsFolder.exists) expressionsFolder.create();

                var backupsFolder = new Folder(storageFolder.fullName + "/Backups");
                if (!backupsFolder.exists) backupsFolder.create();
                
                storageFolder.fullName;
            } catch (e) { "ERROR: " + e.toString(); }
        `;
        
        csInterface.evalScript(script, (result) => {
            if (result.startsWith('ERROR:')) {
                console.error('❌ Failed to create storage folder:', result);
            } else {
                this.storageFolder = result;
                this.isInitialized = true;
                console.log('✅ Local storage initialized:', this.storageFolder);
                this.createWelcomeFile();
            }
        });
    }

    private createWelcomeFile(): void {
        if (!this.isInCEP || !this.storageFolder) return;

        const welcomeContent = `# AI Prepro Extension Library...`; // Content omitted for brevity
        this.writeFile('README.md', welcomeContent);
    }

    async saveLibrary(type: LibraryType, data: LibraryData): Promise<boolean> {
        if (!this.isInitialized) {
            console.error('❌ Storage not initialized');
            return false;
        }
        if (!this.isInCEP) {
            return this.saveToLocalStorage(type, data);
        }

        return new Promise((resolve) => {
            const fileName = `${type}_library.json`;
            const jsonData = JSON.stringify(data, null, 2);
            this.createBackup(type, data);
            
            const script = `
                try {
                    var file = new File("${this.storageFolder}/${fileName}");
                    file.open('w');
                    file.write('${jsonData.replace(/\\/g, '\\\\').replace(/'/g, "\'" )}');
                    file.close();
                    "SUCCESS";
                } catch (e) { "ERROR: " + e.toString(); }
            `;
            new CSInterface().evalScript(script, (result) => {
                if (result === 'SUCCESS') {
                    console.log(`✅ ${type} library saved`);
                    resolve(true);
                } else {
                    console.error(`❌ Failed to save ${type} library:`, result);
                    resolve(false);
                }
            });
        });
    }

    async loadLibrary(type: LibraryType): Promise<LibraryData> {
        if (!this.isInitialized) {
            return [];
        }
        if (!this.isInCEP) {
            return this.loadFromLocalStorage(type);
        }

        return new Promise((resolve) => {
            const fileName = `${type}_library.json`;
            const script = `
                try {
                    var file = new File("${this.storageFolder}/${fileName}");
                    file.open('r');
                    var content = file.read();
                    file.close();
                    content;
                } catch (e) { "[]"; }
            `;
            new CSInterface().evalScript(script, (result) => {
                try {
                    const data = JSON.parse(result);
                    console.log(`📖 Loaded ${data.length} ${type} items`);
                    resolve(data);
                } catch (e) {
                    console.error(`❌ Failed to parse ${type} library:`, e);
                    resolve([]);
                }
            });
        });
    }

    async exportItem(type: LibraryType, item: LibraryItem, format: 'jsx' | 'js' = 'jsx'): Promise<boolean> {
        if (!this.isInCEP) {
            // Browser fallback
            const extension = type === 'scripts' ? `.${format}` : '.txt';
            const blob = new Blob([item.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${item.name}${extension}`;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        }

        return new Promise((resolve) => {
            const folderName = type === 'scripts' ? 'Scripts' : 'Expressions';
            const extension = type === 'scripts' ? `.${format}` : '.txt';
            const fileName = `${item.name.replace(/[^a-zA-Z0-9_-]/g, '_')}${extension}`;
            const filePath = `${this.storageFolder}/${folderName}/${fileName}`;

            const script = `
                try {
                    var file = new File("${filePath}");
                    file.open('w');
                    file.write('${item.content.replace(/\\/g, '\\\\').replace(/'/g, "\'" )}');
                    file.close();
                    "SUCCESS: " + file.fullName;
                } catch (e) { "ERROR: " + e.toString(); }
            `;
            new CSInterface().evalScript(script, (result) => {
                if (result.startsWith('SUCCESS:')) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    private createBackup(type: LibraryType, data: LibraryData): void {
        if (!this.isInCEP || !this.storageFolder) return;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `${type}_library_backup_${timestamp}.json`;
        this.writeFile(`Backups/${backupFileName}`, JSON.stringify(data, null, 2));
    }

    private writeFile(fileName: string, content: string): void {
        if (!this.isInCEP || !this.storageFolder) return;
        const script = `
            try {
                var file = new File("${this.storageFolder}/${fileName}");
                file.open('w');
                file.write('${content.replace(/\\/g, '\\\\').replace(/'/g, "\'" )}');
                file.close();
                "SUCCESS";
            } catch (e) { "ERROR: " + e.toString(); }
        `;
        new CSInterface().evalScript(script, (result) => {
            if (result !== 'SUCCESS') console.error(`Write failed for ${fileName}`);
        });
    }

    getStoragePath(): string {
        return this.storageFolder || 'Browser LocalStorage';
    }

    private saveToLocalStorage(type: LibraryType, data: LibraryData): Promise<boolean> {
        try {
            localStorage.setItem(`ae_${type}_library`, JSON.stringify(data));
            return Promise.resolve(true);
        } catch (e) {
            return Promise.resolve(false);
        }
    }

    private loadFromLocalStorage(type: LibraryType): Promise<LibraryData> {
        try {
            const data = localStorage.getItem(`ae_${type}_library`);
            return Promise.resolve(data ? JSON.parse(data) : []);
        } catch (e) {
            return Promise.resolve([]);
        }
    }

    openStorageFolder(): void {
        if (!this.isInCEP || !this.storageFolder) return;
        const script = `new Folder("${this.storageFolder}").execute();`;
        new CSInterface().evalScript(script);
    }
}

export default new LocalFileStorageManager();