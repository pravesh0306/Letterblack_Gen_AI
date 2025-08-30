import { CSInterface } from '@cep/csinterface';

const CHAT_HISTORY_KEY = 'ae_assistant_chat_history';
const CHAT_FOLDER = 'conversation_history';

interface ChatMessage {
    type: 'user' | 'assistant' | 'system';
    text: string;
    timestamp: string;
    id: number;
    sessionId: string;
}

interface SessionInfo {
    sessionId: string;
    lastUpdated: string;
    messageCount: number;
}

interface SessionData {
    messages: ChatMessage[];
    sessionInfo: SessionInfo;
}

export class ChatMemory {
    private maxHistorySize = 100;
    private contextWindowSize = 10;
    private currentSessionId: string;
    private saveToFiles = true;
    private conversationFolderPath: string | null = null;
    private csInterface: CSInterface | null = null;

    constructor() {
        this.currentSessionId = this.generateSessionId();
        if (typeof window !== 'undefined' && (window as any).CSInterface) {
            this.csInterface = new CSInterface();
            this.initializeConversationFolder();
        } else {
            this.saveToFiles = false;
        }
    }

    private generateSessionId(): string {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS
        return `chat_${dateStr}_${timeStr}`;
    }

    private initializeConversationFolder(): void {
        if (!this.csInterface) return;
        try {
            const extensionPath = this.csInterface.getSystemPath('extension');
            this.conversationFolderPath = `${extensionPath}/${CHAT_FOLDER}`;
            
            this.csInterface.evalScript(`
                var folder = new Folder('${this.conversationFolderPath}');
                if (!folder.exists) { folder.create(); }
                'Conversation folder initialized';
            `, (result) => {
                console.log('💬 Chat folder initialized:', this.conversationFolderPath);
            });
        } catch (error) {
            console.warn('Failed to initialize conversation folder:', error);
            this.saveToFiles = false;
        }
    }

    public addMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'sessionId'>): void {
        try {
            const history = this.getHistory();
            const messageObj: ChatMessage = {
                ...message,
                timestamp: new Date().toISOString(),
                id: Date.now() + Math.random(),
                sessionId: this.currentSessionId
            };
            
            history.push(messageObj);
            
            if (history.length > this.maxHistorySize) {
                history.splice(0, history.length - this.maxHistorySize);
            }
            
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
            
            if (this.saveToFiles) {
                this.saveConversationToFile(messageObj);
            }
        } catch (error) {
            console.error('ChatMemory.addMessage error:', error);
        }
    }

    private saveConversationToFile(messageObj: ChatMessage): void {
        if (!this.csInterface || !this.conversationFolderPath) return;

        const fileName = `${this.currentSessionId}.json`;
        const filePath = `${this.conversationFolderPath}/${fileName}`;
        
        const script = `
            (function() {
                var file = new File('${filePath}');
                var sessionData = { messages: [], sessionInfo: {} };
                if (file.exists) {
                    file.open('r');
                    try { sessionData = JSON.parse(file.read()); } catch (e) {}
                    file.close();
                }
                sessionData.messages.push(${JSON.stringify(messageObj)});
                sessionData.sessionInfo = {
                    sessionId: '${this.currentSessionId}',
                    lastUpdated: '${new Date().toISOString()}',
                    messageCount: sessionData.messages.length
                };
                file.open('w');
                file.write(JSON.stringify(sessionData, null, 2));
                file.close();
                return 'Message saved to file';
            })();
        `;

        this.csInterface.evalScript(script, (result) => {
            if (result !== 'Message saved to file') {
                console.warn('Failed to save message to file:', result);
            }
        });
    }

    public getHistory(): ChatMessage[] {
        try {
            const raw = localStorage.getItem(CHAT_HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.error('ChatMemory.getHistory error:', error);
            return [];
        }
    }

    public getRecentHistory(limit?: number): ChatMessage[] {
        const history = this.getHistory();
        const contextLimit = limit ?? this.contextWindowSize;
        return history.slice(-contextLimit);
    }

    public getContextString(limit = 6): string {
        const recentHistory = this.getRecentHistory(limit);
        if (recentHistory.length === 0) return '';

        return '\n=== CONVERSATION CONTEXT ===\n' +
               recentHistory.map(msg => `${msg.type.toUpperCase()}: ${msg.text.substring(0, 300)}`).join('\n') +
               '\n=== END CONTEXT ===\n\n';
    }

    public startNewSession(): void {
        this.currentSessionId = this.generateSessionId();
        console.log('📝 Started new chat session:', this.currentSessionId);
    }

    public async getAvailableSessions(): Promise<SessionInfo[]> {
        if (!this.csInterface || !this.conversationFolderPath) return [];

        const script = `
            (function() {
                var folder = new Folder('${this.conversationFolderPath}');
                var sessions = [];
                if (folder.exists) {
                    var files = folder.getFiles('*.json');
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        file.open('r');
                        try {
                            var data = JSON.parse(file.read());
                            if(data.sessionInfo) sessions.push(data.sessionInfo);
                        } catch (e) {}
                        file.close();
                    }
                }
                return JSON.stringify(sessions);
            })();
        `;

        return new Promise((resolve) => {
            this.csInterface!.evalScript(script, (result) => {
                try {
                    const sessions: SessionInfo[] = JSON.parse(result as string);
                    resolve(sessions.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()));
                } catch (error) {
                    console.error('Error parsing sessions:', error);
                    resolve([]);
                }
            });
        });
    }

    public async loadSession(sessionId: string): Promise<SessionData | null> {
        if (!this.csInterface || !this.conversationFolderPath) return null;

        const filePath = `${this.conversationFolderPath}/${sessionId}.json`;
        const script = `
            (function() {
                var file = new File('${filePath}');
                return file.exists ? (file.open('r'), file.read()) : null;
            })();
        `;

        return new Promise((resolve) => {
            this.csInterface!.evalScript(script, (result) => {
                if (result && result !== 'null') {
                    try {
                        const sessionData: SessionData = JSON.parse(result as string);
                        // Update local storage with loaded session
                        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessionData.messages));
                        this.currentSessionId = sessionId;
                        resolve(sessionData);
                    } catch (error) {
                        console.error('Error loading session:', error);
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }

    public clearHistory(): void {
        try {
            localStorage.removeItem(CHAT_HISTORY_KEY);
        } catch (error) {
            console.error('ChatMemory.clearHistory error:', error);
        }
    }
}

export default new ChatMemory();