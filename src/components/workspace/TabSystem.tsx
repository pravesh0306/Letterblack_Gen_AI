import React from 'react';
import { X, Plus } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../ui/Button';

export function TabSystem() {
  const { tabs, activeTab, setActiveTab, removeTab } = useWorkspaceStore();

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length > 1) {
      removeTab(tabId);
      if (activeTab === tabId) {
        const remainingTabs = tabs.filter(t => t.id !== tabId);
        setActiveTab(remainingTabs[0]?.id || '');
      }
    }
  };

  return (
    <div className="h-8 bg-[#1a1a1a] border-b border-[#333333] flex items-center">
      <div className="flex-1 flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-1 cursor-pointer border-r border-[#333333] min-w-0 group ${
              tab.active 
                ? 'bg-[#007ACC] text-white' 
                : 'text-[#a0a0a0] hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <span className="text-xs font-medium truncate">{tab.title}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => handleTabClose(e, tab.id)}
                className="opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded p-0.5 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0 text-[#a0a0a0] hover:text-white"
        title="Add Tab"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}