import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  X, 
  Minimize2, 
  Maximize2, 
  Send,
  Bot,
  User,
  Sparkles,
  Code,
  Download,
  Terminal,
  Upload,
  Settings,
  Plus,
  Copy,
  Play,
  FileText,
  Link,
  Zap
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'code' | 'node' | 'download' | 'terminal';
    data?: any;
  };
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onNodeAdd?: (nodeType: string, position: { x: number; y: number }) => void;
  position?: { x: number; y: number };
  embedded?: boolean;
}

export function AIAssistant({ isOpen, onClose, onNodeAdd, position = { x: 20, y: 20 }, embedded = false }: AIAssistantProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);
  const [activeTab, setActiveTab] = useState<'chat' | 'settings' | 'terminal'>('chat');
  const [isTyping, setIsTyping] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you create workflow nodes, generate code, and answer questions about your project.',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [apiSettings, setApiSettings] = useState({
    openaiKey: '',
    anthropicKey: '',
    customEndpoint: '',
    timeout: 30000
  });
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    '$ Welcome to AI Workflow Terminal',
    '$ Type "help" for available commands'
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    apiEndpoint: 'http://localhost:1234/v1'
  });
  
  const assistantRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((message: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: message.content,
      timestamp: new Date(),
      metadata: message.metadata
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    
    setIsDragging(true);
    const rect = assistantRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [isMaximized]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isMaximized) return;
    
    e.preventDefault();
    requestAnimationFrame(() => {
      setCurrentPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    });
  }, [isDragging, isMaximized, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let assistantMessage: Message;
      const input = inputValue.toLowerCase();

      if (input.includes('code') || input.includes('generate')) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'Here\'s a code snippet for your workflow:',
          timestamp: new Date(),
          metadata: {
            type: 'code',
            data: {
              language: 'javascript',
              code: `// AI Workflow Node
function processData(input) {
  const result = input
    .filter(item => item.isValid)
    .map(item => ({
      ...item,
      processed: true,
      timestamp: new Date()
    }));
  
  return result;
}`
            }
          }
        };
      } else {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'I can help you with workflow creation, code generation, and node setup. What would you like to work on?',
          timestamp: new Date()
        };
      }

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  }, [inputValue]);

  const generateAIResponse = async (input: string, messageHistory: any[], model: string | null) => {
    const isNodeRequest = /create|add|generate|make.*node|workflow/i.test(input);
    const isCodeRequest = /code|script|function|class/i.test(input);
    
    if (isNodeRequest) {
      return await generateNodeSuggestion(input);
    } else if (isCodeRequest) {
      return await generateCodeResponse(input, model);
    } else {
      return await generateGeneralResponse(input, messageHistory, model);
    }
  };

  const generateNodeSuggestion = async (input: string) => {
    const nodeTypes = ['llm', 'image', 'audio', 'data', 'code'];
    const suggestedType = nodeTypes.find(type => input.toLowerCase().includes(type)) || 'llm';
    
    const nodeConfig = {
      llm: { name: 'Language Model', description: 'Process text with AI models', color: '#4a9eff' },
      image: { name: 'Image Generator', description: 'Create and process images', color: '#8b5cf6' },
      audio: { name: 'Audio Processor', description: 'Handle audio generation and processing', color: '#00d4aa' },
      data: { name: 'Data Transformer', description: 'Process and transform data', color: '#ff8c42' },
      code: { name: 'Code Executor', description: 'Execute custom code logic', color: '#6b7280' }
    };

    const config = nodeConfig[suggestedType as keyof typeof nodeConfig];
    
    return {
      role: 'assistant' as const,
      content: `I'll help you create a ${config.name} node. This node will ${config.description.toLowerCase()}.`,
      metadata: {
        type: 'node_suggestion',
        nodeType: suggestedType,
        nodeConfig: config,
        actions: ['Create Node', 'Configure Properties', 'Add to Canvas']
      }
    };
  };

  const generateCodeResponse = async (input: string, model: string | null) => {
    if (!model) {
      return {
        role: 'assistant' as const,
        content: 'Please select an LM Studio model first to generate code.',
        metadata: { type: 'error', error: 'No model selected' }
      };
    }

    try {
      const response = await fetch(`${settings.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a helpful coding assistant. Provide clean, well-commented code with explanations.' },
            { role: 'user', content: input }
          ],
          temperature: 0.3,
          max_tokens: 1024
        })
      });

      const data = await response.json();
      return {
        role: 'assistant' as const,
        content: data.choices?.[0]?.message?.content || 'No code generated',
        metadata: {
          type: 'code',
          model,
          tokens: data.usage?.total_tokens,
          language: detectLanguage(input)
        }
      };
    } catch (error) {
      throw error;
    }
  };

  const generateGeneralResponse = async (input: string, messageHistory: any[], model: string | null) => {
    if (!model) {
      return {
        role: 'assistant' as const,
        content: 'I can help you with workflow creation, node configuration, and AI assistance. Please select an LM Studio model for advanced AI responses, or ask me about:\n\n• Creating workflow nodes\n• Configuring AI models\n• Building automation workflows\n• Code generation and debugging',
        metadata: { type: 'help' }
      };
    }

    try {
      const response = await fetch(`${settings.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an AI assistant specialized in workflow automation, node-based programming, and creative AI tools. Help users build efficient workflows and understand AI capabilities.' },
            ...messageHistory.slice(-5).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 512
        })
      });

      const data = await response.json();
      return {
        role: 'assistant' as const,
        content: data.choices?.[0]?.message?.content || 'No response received',
        metadata: {
          model,
          tokens: data.usage?.total_tokens,
          processingTime: Date.now()
        }
      };
    } catch (error) {
      throw error;
    }
  };

  const detectLanguage = (input: string) => {
    if (/python|py|def |import /i.test(input)) return 'python';
    if (/javascript|js|function|const |let /i.test(input)) return 'javascript';
    if (/typescript|ts|interface|type /i.test(input)) return 'typescript';
    if (/html|<div|<span/i.test(input)) return 'html';
    if (/css|\.class|#id/i.test(input)) return 'css';
    return 'javascript';
  };

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  if (!isOpen) return null;

  if (embedded) {
    return (
      <div className="h-full flex flex-col bg-[#1a1a1a] rounded">
        {/* Embedded Header */}
        <div className="flex items-center justify-between p-2 border-b border-[#333333] bg-gradient-to-r from-[#4a9eff] to-[#8b5cf6] text-white rounded-t">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-2 h-2" />
            </div>
            <span className="text-xs font-semibold">AI Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 w-4 h-4 p-0"
          >
            <X className="w-2 h-2" />
          </Button>
        </div>

        {/* Embedded Messages */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2" style={{ maxHeight: '180px' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-[#4a9eff]' 
                  : 'bg-gradient-to-r from-[#8b5cf6] to-[#4a9eff]'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-2 h-2 text-white" />
                ) : (
                  <Sparkles className="w-2 h-2 text-white" />
                )}
              </div>
              <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-2 rounded text-xs ${
                  message.type === 'user'
                    ? 'bg-[#4a9eff] text-white'
                    : 'bg-[#2a2a2a] text-white'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-[#8b5cf6] to-[#4a9eff] rounded-full flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
              <div className="bg-[#2a2a2a] rounded p-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-[#707070] rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-[#707070] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-[#707070] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Embedded Input */}
        <div className="p-2 border-t border-[#333333]">
          <div className="flex space-x-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 h-5 text-xs"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="h-5 w-8 text-xs"
            >
              <Send className="w-2 h-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const assistantStyle = isMaximized
    ? { top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }
    : { 
        left: currentPosition.x, 
        top: currentPosition.y, 
        width: isMinimized ? '240px' : '320px',
        height: isMinimized ? '40px' : '400px'
      };

  return (
    <div
      ref={assistantRef}
      className={`fixed bg-[#2a2a2a] rounded border border-[#404040] z-50 transition-all duration-300 ${
        isDragging ? 'cursor-grabbing' : 'cursor-default'
      }`}
      style={assistantStyle}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-2 border-b border-[#404040] bg-gradient-to-r from-[#4a9eff] to-[#8b5cf6] text-white rounded-t ${
          !isMaximized ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-3 h-3" />
          </div>
          <div>
            <h3 className="font-semibold text-xs">AI Assistant</h3>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs opacity-80">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/20 w-5 h-5 p-0"
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(!isMaximized)}
            className="text-white hover:bg-white/20 w-5 h-5 p-0"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 w-5 h-5 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <>
          {/* Tab Navigation */}
          <div className="flex border-b border-[#404040]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-2 py-1 text-xs font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-[#4a9eff]/20 text-[#4a9eff] border-b border-[#4a9eff]'
                  : 'text-[#b0b0b0] hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3 mr-1 inline" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex-1 px-2 py-1 text-xs font-medium transition-colors ${
                activeTab === 'terminal'
                  ? 'bg-[#4a9eff]/20 text-[#4a9eff] border-b border-[#4a9eff]'
                  : 'text-[#b0b0b0] hover:text-white'
              }`}
            >
              <Terminal className="w-3 h-3 mr-1 inline" />
              Terminal
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-2 py-1 text-xs font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#4a9eff]/20 text-[#4a9eff] border-b border-[#4a9eff]'
                  : 'text-[#b0b0b0] hover:text-white'
              }`}
            >
              <Settings className="w-3 h-3 mr-1 inline" />
              Settings
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-2 space-y-2"
                style={{ maxHeight: '280px' }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-[#4a9eff]' 
                        : message.type === 'system'
                        ? 'bg-[#808080]'
                        : 'bg-gradient-to-r from-[#8b5cf6] to-[#4a9eff]'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-3 h-3 text-white" />
                      ) : message.type === 'system' ? (
                        <Zap className="w-3 h-3 text-white" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-xs ${
                      message.type === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`inline-block p-2 rounded text-xs ${
                        message.type === 'user'
                          ? 'bg-[#4a9eff] text-white'
                          : message.type === 'system'
                          ? 'bg-[#3a3a3a] text-[#b0b0b0]'
                          : 'bg-[#3a3a3a] text-white'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {message.metadata && message.metadata.type === 'code' && (
                          <div className="mt-2 pt-2 border-t border-[#404040]">
                            <div className="bg-[#1a1a1a] rounded p-2 text-[#00d4aa] font-mono text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[#808080]">
                                  {message.metadata.data.language}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(message.metadata.data.code)}
                                  className="text-[#808080] hover:text-white w-4 h-4 p-0"
                                >
                                  <Copy className="w-2 h-2" />
                                </Button>
                              </div>
                              <pre className="whitespace-pre-wrap text-xs">
                                {message.metadata.data.code}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-[#808080] mt-0.5">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-[#8b5cf6] to-[#4a9eff] rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-[#3a3a3a] rounded p-2">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-[#808080] rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-[#808080] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-[#808080] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-2 border-t border-[#404040]">
                <div className="flex space-x-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 h-6"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="h-6 w-12"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Terminal Tab */}
          {activeTab === 'terminal' && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-2 bg-[#1a1a1a] text-[#00d4aa] font-mono text-xs">
                {terminalHistory.map((line, index) => (
                  <div key={index} className="mb-0.5">
                    {line}
                  </div>
                ))}
              </div>
              <div className="p-2 bg-[#1a1a1a] border-t border-[#404040]">
                <div className="flex items-center space-x-1 text-[#00d4aa] font-mono text-xs">
                  <span>$</span>
                  <input
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-[#00d4aa]"
                    placeholder="Enter command..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <div>
                <h3 className="text-xs font-medium mb-2">API Configuration</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">OpenAI API Key</label>
                    <Input
                      type="password"
                      value={apiSettings.openaiKey}
                      onChange={(e) => setApiSettings(prev => ({ ...prev, openaiKey: e.target.value }))}
                      placeholder="sk-..."
                      className="h-6"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Custom Endpoint</label>
                    <Input
                      value={apiSettings.customEndpoint}
                      onChange={(e) => setApiSettings(prev => ({ ...prev, customEndpoint: e.target.value }))}
                      placeholder="https://api.example.com"
                      className="h-6"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#404040]">
                <Button variant="primary" className="w-full h-6 text-xs">
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}