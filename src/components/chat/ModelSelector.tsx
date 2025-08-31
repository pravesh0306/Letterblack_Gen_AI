import React, { useEffect, useState } from 'react';
import { ChevronDown, RefreshCw, Server, Zap, HardDrive, Clock } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/Button';
import { LocalModel } from '../../types/chat';

export function ModelSelector() {
  const {
    localModels,
    selectedModel,
    modelLoading,
    modelError,
    setSelectedModel,
    loadLocalModels,
    clearModelError,
    modelSelectorOpen,
    toggleModelSelector
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLocalModels();
  }, []);

  const filteredModels = localModels.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedModelData = localModels.find(m => m.id === selectedModel);

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getModelStatusColor = (status: LocalModel['status']) => {
    switch (status) {
      case 'available': return 'text-[#28a745]';
      case 'loading': return 'text-[#ffc107]';
      case 'error': return 'text-[#dc3545]';
      default: return 'text-[#707070]';
    }
  };

  return (
    <div className="relative">
      {/* Model Selector Button */}
      <Button
        variant="ghost"
        onClick={toggleModelSelector}
        className="flex items-center space-x-2 px-3 py-2 bg-[#2a2a2a] border border-[#333333] rounded-lg hover:bg-[#3a3a3a] transition-colors"
      >
        <Server className="w-4 h-4" />
        <span className="text-sm">
          {selectedModelData ? selectedModelData.name : 'Select Model'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${modelSelectorOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Model Selector Dropdown */}
      {modelSelectorOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-[#333333]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Local Models</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearModelError();
                  loadLocalModels();
                }}
                disabled={modelLoading}
                className="w-6 h-6 p-0"
              >
                <RefreshCw className={`w-3 h-3 ${modelLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1 bg-[#2a2a2a] border border-[#333333] rounded text-sm text-white placeholder-[#707070] focus:outline-none focus:ring-1 focus:ring-[#007ACC]"
            />
          </div>

          {/* Model List */}
          <div className="max-h-64 overflow-y-auto">
            {modelLoading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-[#007ACC] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-[#707070]">Loading models...</p>
              </div>
            ) : modelError ? (
              <div className="p-4">
                <div className="text-center mb-3">
                  <Server className="w-8 h-8 text-[#dc3545] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#dc3545] mb-2">Connection Failed</p>
                </div>
                <div className="bg-[#2a2a2a] border border-[#dc3545] rounded p-3 mb-3">
                  <p className="text-xs text-[#dc3545] leading-relaxed">{modelError}</p>
                </div>
                <div className="text-xs text-[#a0a0a0] space-y-1">
                  <p>• Start LM Studio application</p>
                  <p>• Load a model in LM Studio</p>
                  <p>• Ensure API server is running</p>
                </div>
                <Button
                  onClick={() => {
                    clearModelError();
                    loadLocalModels();
                  }}
                  className="w-full mt-3 bg-[#007ACC] hover:bg-[#005a9e] text-white text-xs py-2"
                >
                  Retry Connection
                </Button>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="p-4 text-center">
                <Server className="w-8 h-8 text-[#707070] mx-auto mb-2" />
                <p className="text-sm text-[#707070]">No models found</p>
                <p className="text-xs text-[#707070] mt-1">
                  Make sure LM Studio is running and models are loaded
                </p>
              </div>
            ) : (
              filteredModels.map((model) => (
                <div
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    toggleModelSelector();
                  }}
                  className={`p-3 cursor-pointer hover:bg-[#2a2a2a] transition-colors border-b border-[#333333] last:border-b-0 ${
                    selectedModel === model.id ? 'bg-[#007ACC]/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{model.name}</h4>
                        <span className={`text-xs ${getModelStatusColor(model.status)}`}>
                          ●
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-[#a0a0a0]">
                        <div className="flex items-center space-x-1">
                          <HardDrive className="w-3 h-3" />
                          <span>{formatFileSize(model.size)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>{model.performance.tokensPerSecond} t/s</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        {model.capabilities.map((capability) => (
                          <span
                            key={capability}
                            className="px-1.5 py-0.5 bg-[#333333] rounded text-xs"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                      
                      {model.lastUsed && (
                        <div className="flex items-center space-x-1 mt-1 text-xs text-[#707070]">
                          <Clock className="w-3 h-3" />
                          <span>Last used {model.lastUsed.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {selectedModel === model.id && (
                      <div className="w-2 h-2 bg-[#007ACC] rounded-full ml-2 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#333333] bg-[#0f0f0f]">
            <div className="flex items-center justify-between text-xs text-[#707070]">
              <span>{filteredModels.length} models available</span>
              <span>LM Studio: Connected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}