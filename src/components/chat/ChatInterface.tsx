import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MessageList } from './MessageList';
import { FileUploadArea } from './FileUploadArea';
import { ClipboardHandler } from './ClipboardHandler';
import { useHotkeys } from 'react-hotkeys-hook';

export function ChatInterface() {
  const {
    messages,
    currentSession,
    selectedModel,
    isTyping,
    attachments,
    addMessage,
    setTyping,
    settings
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useHotkeys('ctrl+enter', () => handleSendMessage(), { enableOnFormTags: true });
  useHotkeys('ctrl+k', () => inputRef.current?.focus());

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSession]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    if (!selectedModel) {
      alert('Please select a model first');
      return;
    }

    const userMessage = {
      role: 'user' as const,
      content: inputValue,
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    addMessage(userMessage);
    setInputValue('');
    setTyping(true);

    try {
      // Simulate API call to LM Studio
      const response = await fetch(`${settings.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: inputValue }
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant' as const,
        content: data.choices?.[0]?.message?.content || 'No response received',
        metadata: {
          model: selectedModel,
          tokens: data.usage?.total_tokens,
          processingTime: Date.now()
        }
      };

      addMessage(assistantMessage);
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: 'Error: Failed to get response from model',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size <= settings.maxFileSize) {
        // addAttachment(file);
      } else {
        alert(`File ${file.name} is too large. Maximum size is ${settings.maxFileSize / 1024 / 1024}MB`);
      }
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to AI Chat</h2>
          <p className="text-[#a0a0a0] mb-6">Start a new conversation to begin chatting with AI</p>
          <Button 
            variant="primary" 
            onClick={() => useChatStore.getState().createSession()}
          >
            Start New Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0d]">
      <ClipboardHandler />
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>

      {/* File Upload Area */}
      {showFileUpload && (
        <FileUploadArea onClose={() => setShowFileUpload(false)} />
      )}

      {/* Input Area */}
      <div className="border-t border-[#333333] bg-[#1a1a1a] p-4">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center space-x-2 bg-[#2a2a2a] rounded px-3 py-1 text-sm"
              >
                <span className="truncate max-w-32">{attachment.name}</span>
                <button
                  onClick={() => useChatStore.getState().removeAttachment(attachment.id)}
                  className="text-[#ff4444] hover:text-[#ff6666]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-3">
          {/* File Upload Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef as any}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedModel ? "Type your message..." : "Select a model to start chatting"}
              disabled={!selectedModel || isTyping}
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#333333] rounded-lg text-white placeholder-[#707070] resize-none focus:outline-none focus:ring-2 focus:ring-[#007ACC] focus:border-transparent max-h-32"
              rows={1}
              style={{ minHeight: '48px' }}
            />
            
            {isTyping && (
              <div className="absolute bottom-2 left-4 text-xs text-[#707070]">
                AI is typing...
              </div>
            )}
          </div>

          {/* Voice Recording Button */}
          <Button
            variant={isRecording ? "primary" : "ghost"}
            size="sm"
            onClick={toggleRecording}
            className="flex-shrink-0"
          >
            {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>

          {/* Send Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && attachments.length === 0) || !selectedModel || isTyping}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Shortcuts Hint */}
        <div className="mt-2 text-xs text-[#707070] text-center">
          Press Ctrl+Enter to send • Ctrl+K to focus input
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md,.js,.ts,.py,.json,.csv,.png,.jpg,.jpeg,.gif,.webp"
      />
    </div>
  );
}