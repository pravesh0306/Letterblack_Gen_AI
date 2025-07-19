export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    error?: string;
  };
  editing?: boolean;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  content?: string;
  thumbnail?: string;
  processed: boolean;
  error?: string;
}

export interface LocalModel {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  capabilities: string[];
  performance: {
    tokensPerSecond: number;
    memoryUsage: number;
    contextLength: number;
  };
  status: 'available' | 'loading' | 'error';
  lastUsed?: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  defaultModel: string;
  autoSave: boolean;
  showTypingIndicators: boolean;
  enableClipboardPaste: boolean;
  maxFileSize: number;
  apiEndpoint: string;
  shortcuts: Record<string, string>;
}

export interface ClipboardContent {
  type: 'text' | 'image' | 'file';
  content: string | File;
  preview?: string;
}