import React, { useState } from 'react';
import { ChevronRight, Settings, Eye, Code, Play, MessageSquare, Bot } from 'lucide-react';
import { Node } from '../types/workflow';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ResizablePanel } from './ResizablePanel';
import { AIAssistant } from './AIAssistant';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  collapsed: boolean;
  onToggle: () => void;
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void;
  onNodeAdd?: (nodeType: string, position: { x: number; y: number }) => void;
}

export function PropertiesPanel({ selectedNode, collapsed, onToggle, onNodeUpdate, onNodeAdd }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'ai'>('config');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const panelContent = (
    <>
      <div className="p-2 border-b border-[#404040]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold">Properties</h2>
          {!collapsed && (
            <Button variant="ghost" size="sm" onClick={onToggle} className="w-5 h-5 p-0">
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}
        </div>

        {!collapsed && (
          <div className="flex space-x-1 bg-[#3a3a3a] rounded p-0.5">
            <Button
              variant={activeTab === 'config' ? 'primary' : 'ghost'}
              size="sm"
              className="flex-1 text-xs h-5"
              onClick={() => setActiveTab('config')}
            >
              <Settings className="w-3 h-3 mr-1" />
              Config
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'primary' : 'ghost'}
              size="sm"
              className="flex-1 text-xs h-5"
              onClick={() => setActiveTab('preview')}
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
            <Button
              variant={activeTab === 'ai' ? 'primary' : 'ghost'}
              size="sm"
              className="flex-1 text-xs h-4"
              onClick={() => setActiveTab('ai')}
            >
              <Bot className="w-3 h-3 mr-1" />
              AI
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'config' && !selectedNode ? (
          <div className="p-2 text-center">
            <p className="text-xs text-[#808080]">
              Select a node to view properties
            </p>
          </div>
        ) : activeTab === 'config' && selectedNode && !collapsed ? (
          <div className="p-2">
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium mb-1">Node Name</label>
                <Input
                  defaultValue={`${selectedNode.type} Node`}
                  placeholder="Enter node name"
                  className="h-6 w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea
                  className="w-full h-16 px-2 py-1 border border-[#333333] rounded bg-[#1a1a1a] text-white text-xs resize-none transition-colors focus:ring-1 focus:ring-[#4a9eff] focus:border-transparent"
                  placeholder="Describe what this node does"
                />
              </div>

              {selectedNode.type === 'llm' && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1">Model</label>
                    <select className="w-full h-6 px-2 py-1 border border-[#333333] rounded bg-[#1a1a1a] text-white text-xs transition-colors focus:ring-1 focus:ring-[#4a9eff] focus:border-transparent">
                      <option>GPT-4</option>
                      <option>GPT-3.5 Turbo</option>
                      <option>Claude 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Temperature</label>
                    <Input type="number" min="0" max="2" step="0.1" defaultValue="0.7" className="h-6 w-full" />
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-[#333333]">
                <Button variant="primary" className="w-full h-6 text-xs">
                  <Play className="w-3 h-3 mr-1" />
                  Test Node
                </Button>
              </div>
            </div>
          </div>
        ) : activeTab === 'preview' && selectedNode && !collapsed ? (
          <div className="p-2">
            <div className="space-y-2">
              <div className="bg-[#2a2a2a] rounded p-2 border border-[#333333]">
                <h3 className="text-xs font-medium mb-1">Output Preview</h3>
                <div className="text-xs text-[#a0a0a0]">
                  {selectedNode.type === 'llm' && (
                    <p>Generated text will appear here...</p>
                  )}
                  {selectedNode.type === 'image' && (
                    <div className="w-full h-12 bg-[#1a1a1a] rounded flex items-center justify-center">
                      <span className="text-[#707070]">Image preview</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'ai' && !collapsed ? (
          <div className="p-2">
            <div className="space-y-2">
              <Button
                variant={isAIAssistantOpen ? 'primary' : 'secondary'}
                className="w-full h-6 text-xs"
                onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                {isAIAssistantOpen ? 'Close AI Chat' : 'Open AI Chat'}
              </Button>

              {isAIAssistantOpen && (
                <div className="bg-[#1a1a1a] rounded border border-[#333333] h-64">
                  <AIAssistant
                    isOpen={true}
                    onClose={() => setIsAIAssistantOpen(false)}
                    onNodeAdd={onNodeAdd}
                    position={{ x: 0, y: 0 }}
                    embedded={true}
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <ResizablePanel
      position="right"
      collapsed={collapsed}
      onToggle={onToggle}
      defaultWidth={200}
      minWidth={150}
      maxWidth={300}
    >
      {panelContent}
    </ResizablePanel>
  );
}