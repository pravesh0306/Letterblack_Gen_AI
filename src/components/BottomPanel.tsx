import React, { useState } from 'react';
import { ChevronUp, Terminal, MessageSquare, Settings, Activity } from 'lucide-react';
import { Button } from './ui/Button';

interface BottomPanelProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function BottomPanel({ collapsed, onToggle }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'chat' | 'settings' | 'metrics'>('chat');

  if (collapsed) {
    return (
      <div className="h-6 bg-[#2a2a2a] border-t border-[#404040] flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-xs text-[#b0b0b0]">Ready</span>
          </div>
          <span className="text-xs text-[#808080]">|</span>
          <span className="text-xs text-[#808080]">5 nodes • 3 connections</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle} className="w-5 h-5 p-0">
          <ChevronUp className="w-3 h-3 rotate-180" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-40 bg-[#2a2a2a] border-t border-[#404040] flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-[#404040]">
        <div className="flex space-x-1 bg-[#3a3a3a] rounded p-0.5">
          <Button
            variant={activeTab === 'logs' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('logs')}
            className="text-xs h-5"
          >
            <Terminal className="w-3 h-3 mr-1" />
            Logs
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chat')}
            className="text-xs h-5"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Quick AI
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('settings')}
            className="text-xs h-5"
          >
            <Settings className="w-3 h-3 mr-1" />
            Settings
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle} className="w-5 h-5 p-0">
          <ChevronUp className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'logs' && (
          <div className="font-mono text-xs space-y-0.5">
            <div className="text-[#808080]">[10:30:25] Workflow initialized</div>
            <div className="text-[#4a9eff]">[10:30:26] Node "LLM-1" started processing</div>
            <div className="text-[#00d4aa]">[10:30:28] Node "LLM-1" completed successfully</div>
            <div className="text-[#4a9eff]">[10:30:29] Node "Image-1" started processing</div>
            <div className="text-[#ff8c42]">[10:30:30] Node "Image-1" warning: Large image size</div>
            <div className="text-[#00d4aa]">[10:30:35] Node "Image-1" completed successfully</div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-2">
            <div className="bg-[#3a3a3a] rounded p-2">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-[#4a9eff] rounded-full flex items-center justify-center">
                  <MessageSquare className="w-2 h-2 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#b0b0b0]">
                    Hi! I'm your AI assistant. How can I help you with your workflow?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-1">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 px-2 py-1 border border-[#404040] rounded bg-[#1a1a1a] text-white text-xs"
              />
              <Button variant="primary" size="sm" className="h-6 text-xs">Send</Button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-2">
            <div>
              <h3 className="text-xs font-medium mb-1">Workflow Settings</h3>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="w-3 h-3" />
                  <span className="text-xs">Auto-save workflow</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="w-3 h-3" />
                  <span className="text-xs">Show execution indicators</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}