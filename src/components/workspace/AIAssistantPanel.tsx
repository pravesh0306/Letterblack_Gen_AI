import React, { useState, useRef, useEffect } from 'react';
import { Bot, Lightbulb, AlertTriangle, Zap, Send, Mic, MicOff } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AISuggestion {
  id: string;
  type: 'workflow' | 'optimization' | 'error' | 'template';
  title: string;
  description: string;
  confidence: number;
  actions: string[];
}

export function AIAssistantPanel() {
  const { aiAnalyses, addAIAnalysis, selectedModels, models } = useWorkspaceStore();
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate AI analysis based on user actions
  useEffect(() => {
    const analyzeWorkflow = () => {
      if (selectedModels.length > 5) {
        const analysis = {
          id: `analysis_${Date.now()}`,
          type: 'optimization' as const,
          content: `You have ${selectedModels.length} models selected. Consider grouping them for better organization.`,
          confidence: 0.85,
          actions: ['Group Selection', 'Create Collection'],
          timestamp: new Date()
        };
        addAIAnalysis(analysis);
      }

      if (models.length > 20) {
        const analysis = {
          id: `analysis_${Date.now()}`,
          type: 'workflow' as const,
          content: 'Your workspace has many models. Consider using the file manager to organize them into folders.',
          confidence: 0.9,
          actions: ['Open File Manager', 'Create Folders'],
          timestamp: new Date()
        };
        addAIAnalysis(analysis);
      }
    };

    const timer = setTimeout(analyzeWorkflow, 2000);
    return () => clearTimeout(timer);
  }, [selectedModels.length, models.length, addAIAnalysis]);

  // Generate suggestions based on current context
  useEffect(() => {
    const newSuggestions: AISuggestion[] = [
      {
        id: 'opt1',
        type: 'optimization',
        title: 'Optimize Rendering',
        description: 'Reduce polygon count for better performance',
        confidence: 0.92,
        actions: ['Apply LOD', 'Simplify Mesh']
      },
      {
        id: 'workflow1',
        type: 'workflow',
        title: 'Batch Export',
        description: 'Export all selected models in multiple formats',
        confidence: 0.88,
        actions: ['Setup Export', 'Choose Formats']
      },
      {
        id: 'template1',
        type: 'template',
        title: 'Material Template',
        description: 'Apply consistent materials across models',
        confidence: 0.75,
        actions: ['Create Template', 'Apply to Selection']
      }
    ];

    setSuggestions(newSuggestions);
  }, [selectedModels]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userAnalysis = {
      id: `user_${Date.now()}`,
      type: 'workflow' as const,
      content: `User: ${inputValue}`,
      confidence: 1.0,
      timestamp: new Date()
    };

    addAIAnalysis(userAnalysis);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: `ai_${Date.now()}`,
        type: 'workflow' as const,
        content: `AI: I can help you with that. Based on your request about "${inputValue}", I recommend checking the 3D viewer settings and ensuring your models are properly optimized.`,
        confidence: 0.85,
        actions: ['Open Settings', 'Check Models'],
        timestamp: new Date()
      };
      addAIAnalysis(aiResponse);
    }, 1000);

    setInputValue('');
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'optimization': return <Zap className="w-4 h-4 text-[#FFC107]" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-[#DC3545]" />;
      case 'workflow': return <Lightbulb className="w-4 h-4 text-[#007ACC]" />;
      default: return <Bot className="w-4 h-4 text-[#28A745]" />;
    }
  };

  return (
    <div className="w-80 bg-[#1a1a1a] border-l border-[#333333] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#333333]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-[#007ACC] to-[#8b5cf6] rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-[#a0a0a0]">Analyzing workspace</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="p-3 border-b border-[#333333]">
        <h4 className="text-xs font-medium text-[#a0a0a0] mb-2">Smart Suggestions</h4>
        <div className="space-y-2">
          {suggestions.slice(0, 3).map((suggestion) => (
            <div key={suggestion.id} className="bg-[#2a2a2a] rounded p-2">
              <div className="flex items-start space-x-2">
                {getIconForType(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-medium truncate">{suggestion.title}</h5>
                    <span className="text-xs text-[#a0a0a0]">{Math.round(suggestion.confidence * 100)}%</span>
                  </div>
                  <p className="text-xs text-[#a0a0a0] mt-1">{suggestion.description}</p>
                  <div className="flex space-x-1 mt-2">
                    {suggestion.actions.map((action, index) => (
                      <Button key={index} variant="ghost" size="sm" className="text-xs h-5 px-2">
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {aiAnalyses.slice(-10).map((analysis) => (
          <div key={analysis.id} className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-[#2a2a2a] rounded-full flex items-center justify-center flex-shrink-0">
              {getIconForType(analysis.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-[#2a2a2a] rounded p-2">
                <p className="text-xs text-white">{analysis.content}</p>
                {analysis.actions && analysis.actions.length > 0 && (
                  <div className="flex space-x-1 mt-2">
                    {analysis.actions.map((action, index) => (
                      <Button key={index} variant="primary" size="sm" className="text-xs h-5 px-2">
                        {action}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-[#707070] mt-1">
                {analysis.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#333333]">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask AI for help..."
            className="flex-1 h-8 text-xs"
          />
          <Button
            variant={isListening ? 'primary' : 'ghost'}
            size="sm"
            onClick={toggleVoiceInput}
            className="w-8 h-8 p-0"
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="w-8 h-8 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-xs text-[#707070] mt-2">
          Response time: &lt;500ms • Voice commands available
        </div>
      </div>
    </div>
  );
}