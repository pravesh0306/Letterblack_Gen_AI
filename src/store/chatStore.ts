import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Message, ChatSession, LocalModel, AppSettings, FileAttachment } from '../types/chat';

interface ChatStore {
  // Chat Sessions
  sessions: ChatSession[];
  currentSession: string | null;
  
  // Models
  localModels: LocalModel[];
  selectedModel: string | null;
  modelLoading: boolean;
  modelError: string | null;
  
  // UI State
  sidebarOpen: boolean;
  settingsOpen: boolean;
  modelSelectorOpen: boolean;
  fileUploadOpen: boolean;
  
  // Messages
  messages: Message[];
  isTyping: boolean;
  
  // Files
  attachments: FileAttachment[];
  uploadProgress: Record<string, number>;
  
  // Settings
  settings: AppSettings;
  
  // Search
  searchQuery: string;
  searchResults: Message[];
  
  // Actions
  createSession: (title?: string) => string;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  editMessage: (messageId: string, content: string) => void;
  
  setSelectedModel: (modelId: string) => void;
  loadLocalModels: () => Promise<void>;
  clearModelError: () => void;
  
  addAttachment: (file: File) => Promise<string>;
  removeAttachment: (attachmentId: string) => void;
  processAttachment: (attachmentId: string) => Promise<void>;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  searchMessages: (query: string) => void;
  clearSearch: () => void;
  
  toggleSidebar: () => void;
  toggleSettings: () => void;
  toggleModelSelector: () => void;
  toggleFileUpload: () => void;
  
  setTyping: (typing: boolean) => void;
  
  exportChat: (sessionId: string, format: 'pdf' | 'txt' | 'md') => Promise<void>;
  importChat: (file: File) => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial State
      sessions: [],
      currentSession: null,
      localModels: [],
      selectedModel: null,
      modelLoading: false,
      modelError: null,
      sidebarOpen: true,
      settingsOpen: false,
      modelSelectorOpen: false,
      fileUploadOpen: false,
      messages: [],
      isTyping: false,
      attachments: [],
      uploadProgress: {},
      searchQuery: '',
      searchResults: [],
      settings: {
        theme: 'dark',
        defaultModel: '',
        autoSave: true,
        showTypingIndicators: true,
        enableClipboardPaste: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB
        apiEndpoint: 'http://localhost:1234/v1',
        shortcuts: {
          'ctrl+n': 'new-chat',
          'ctrl+k': 'search',
          'ctrl+/': 'shortcuts',
          'ctrl+,': 'settings',
          'ctrl+shift+n': 'create-node',
          'ctrl+shift+c': 'generate-code'
        }
      },

      // Session Actions
      createSession: (title = 'New Chat') => {
        const sessionId = `session_${Date.now()}`;
        const newSession: ChatSession = {
          id: sessionId,
          title,
          messages: [],
          model: get().selectedModel || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          settings: {
            temperature: 0.7,
            maxTokens: 2048
          }
        };
        
        set(state => ({
          sessions: [...state.sessions, newSession],
          currentSession: sessionId,
          messages: []
        }));
        
        return sessionId;
      },

      deleteSession: (sessionId) => set(state => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        currentSession: state.currentSession === sessionId ? null : state.currentSession,
        messages: state.currentSession === sessionId ? [] : state.messages
      })),

      setCurrentSession: (sessionId) => {
        const session = get().sessions.find(s => s.id === sessionId);
        set({
          currentSession: sessionId,
          messages: session?.messages || [],
          selectedModel: session?.model || get().selectedModel
        });
      },

      updateSessionTitle: (sessionId, title) => set(state => ({
        sessions: state.sessions.map(s => 
          s.id === sessionId ? { ...s, title, updatedAt: new Date() } : s
        )
      })),

      // Message Actions
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: `msg_${Date.now()}`,
          timestamp: new Date()
        };

        set(state => {
          const updatedMessages = [...state.messages, newMessage];
          const updatedSessions = state.sessions.map(s =>
            s.id === state.currentSession
              ? { ...s, messages: updatedMessages, updatedAt: new Date() }
              : s
          );

          return {
            messages: updatedMessages,
            sessions: updatedSessions
          };
        });
      },

      updateMessage: (messageId, updates) => set(state => {
        const updatedMessages = state.messages.map(m =>
          m.id === messageId ? { ...m, ...updates } : m
        );
        
        return {
          messages: updatedMessages,
          sessions: state.sessions.map(s =>
            s.id === state.currentSession
              ? { ...s, messages: updatedMessages, updatedAt: new Date() }
              : s
          )
        };
      }),

      deleteMessage: (messageId) => set(state => {
        const updatedMessages = state.messages.filter(m => m.id !== messageId);
        
        return {
          messages: updatedMessages,
          sessions: state.sessions.map(s =>
            s.id === state.currentSession
              ? { ...s, messages: updatedMessages, updatedAt: new Date() }
              : s
          )
        };
      }),

      editMessage: (messageId, content) => {
        get().updateMessage(messageId, { content, editing: false });
      },

      // Model Actions
      setSelectedModel: (modelId) => set({ selectedModel: modelId }),

      clearModelError: () => set({ modelError: null }),

      loadLocalModels: async () => {
        set({ modelLoading: true, modelError: null });
        
        try {
          // Simulate LM Studio API call
          const response = await fetch(`${get().settings.apiEndpoint}/models`);
          const models = await response.json();
          
          const localModels: LocalModel[] = models.data?.map((model: any) => ({
            id: model.id,
            name: model.id,
            path: model.path || '',
            size: model.size || 0,
            type: model.type || 'llm',
            capabilities: model.capabilities || ['text-generation'],
            performance: {
              tokensPerSecond: model.performance?.tokensPerSecond || 0,
              memoryUsage: model.performance?.memoryUsage || 0,
              contextLength: model.performance?.contextLength || 4096
            },
            status: 'available' as const
          })) || [];

          set({ localModels, modelLoading: false, modelError: null });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          set({ 
            modelLoading: false, 
            modelError: `Failed to connect to LM Studio. Please ensure LM Studio is running on ${get().settings.apiEndpoint}. Error: ${errorMessage}`,
            localModels: []
          });
        }
      },

      // File Actions
      addAttachment: async (file) => {
        const attachmentId = `att_${Date.now()}`;
        const attachment: FileAttachment = {
          id: attachmentId,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          processed: false
        };

        set(state => ({
          attachments: [...state.attachments, attachment]
        }));

        // Process file content
        await get().processAttachment(attachmentId);
        
        return attachmentId;
      },

      removeAttachment: (attachmentId) => set(state => ({
        attachments: state.attachments.filter(a => a.id !== attachmentId)
      })),

      processAttachment: async (attachmentId) => {
        const attachment = get().attachments.find(a => a.id === attachmentId);
        if (!attachment) return;

        try {
          // Process different file types
          let content = '';
          
          if (attachment.type.startsWith('text/')) {
            const response = await fetch(attachment.url);
            content = await response.text();
          } else if (attachment.type === 'application/pdf') {
            // PDF processing would go here
            content = 'PDF content extraction not implemented';
          }

          get().updateAttachment(attachmentId, { content, processed: true });
        } catch (error) {
          get().updateAttachment(attachmentId, { 
            error: 'Failed to process file',
            processed: true 
          });
        }
      },

      updateAttachment: (attachmentId, updates) => set(state => ({
        attachments: state.attachments.map(a =>
          a.id === attachmentId ? { ...a, ...updates } : a
        )
      })),

      // Settings Actions
      updateSettings: (newSettings) => set(state => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // Search Actions
      searchMessages: (query) => {
        const messages = get().messages;
        const results = messages.filter(m =>
          m.content.toLowerCase().includes(query.toLowerCase())
        );
        
        set({ searchQuery: query, searchResults: results });
      },

      clearSearch: () => set({ searchQuery: '', searchResults: [] }),

      // UI Actions
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSettings: () => set(state => ({ settingsOpen: !state.settingsOpen })),
      toggleModelSelector: () => set(state => ({ modelSelectorOpen: !state.modelSelectorOpen })),
      toggleFileUpload: () => set(state => ({ fileUploadOpen: !state.fileUploadOpen })),
      setTyping: (typing) => set({ isTyping: typing }),

      // Export/Import Actions
      exportChat: async (sessionId, format) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Implementation would depend on format
        console.log(`Exporting session ${sessionId} as ${format}`);
      },

      importChat: async (file) => {
        // Implementation for importing chat files
        console.log('Importing chat from file:', file.name);
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          // Convert ISO date strings back to Date objects
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return new Date(value);
          }
          return value;
        }
      }),
      partialize: (state) => ({
        sessions: state.sessions,
        settings: state.settings,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
);