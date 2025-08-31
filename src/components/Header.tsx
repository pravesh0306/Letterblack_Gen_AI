import React from 'react';
import { 
  Menu, 
  Layers, 
  MessageSquare, 
  Play, 
  Save, 
  Settings, 
  Users,
  Undo,
  Redo,
  Download,
  Upload,
  Share2,
  Bot,
  MessageCircle
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/Button';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleNodeLibrary: () => void;
  onToggleBottomPanel: () => void;
  onToggleChat?: () => void;
  chatMode?: boolean;
}

export function Header({ onToggleSidebar, onToggleNodeLibrary, onToggleBottomPanel, onToggleChat, chatMode }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-8 gradient-header border-b border-[#333333] flex items-center justify-between px-2 relative z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#333333]/10 to-transparent pointer-events-none"></div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6 relative z-20">
          <Menu className="w-3 h-3" />
        </Button>
        
        <div className="flex items-center space-x-2 relative z-30">
          <div className="w-5 h-5 bg-[var(--accent-blue)] rounded flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white scalable-text">
              Letterblack GenAI
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 relative z-20">
        <Button variant="ghost" size="sm" className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" title="Undo">
          <Undo className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" title="Redo">
          <Redo className="w-3 h-3" />
        </Button>
        
        <div className="w-px h-3 bg-[#333333] mx-1" />
        
        <Button variant="ghost" size="sm" className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" title="Import">
          <Upload className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" title="Export">
          <Download className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" title="Share">
          <Share2 className="w-3 h-3" />
        </Button>
        
        <div className="w-px h-3 bg-[#333333] mx-1" />
        
        <Button variant="ghost" size="sm" className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" title="Save">
          <Save className="w-3 h-3" />
        </Button>
        <Button variant="primary" size="sm" className="px-2 py-1 btn-gradient-primary text-white text-xs h-6">
          <Play className="w-3 h-3 mr-1" />
          Run
        </Button>
      </div>

      <div className="flex items-center space-x-1 relative z-20">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 rounded-full gradient-primary border border-[#333333]"></div>
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00c4aa] border border-[#333333] -ml-1"></div>
          <Button variant="ghost" size="sm" className="p-1 text-[#b0b0b0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" title="Users">
            <Users className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="w-px h-3 bg-[#333333] mx-1" />
        
        <Button variant="ghost" size="sm" onClick={onToggleNodeLibrary} className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" title="Nodes">
          <Layers className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleBottomPanel} className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" title="Console">
          <MessageSquare className="w-3 h-3" />
        </Button>
        {onToggleChat && (
          <Button 
            variant={chatMode ? "primary" : "ghost"} 
            size="sm" 
            onClick={onToggleChat} 
            className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" 
            title="AI Chat (Ctrl+H)"
          >
            <MessageCircle className="w-3 h-3" />
          </Button>
        )}
        <Button variant="ghost" size="sm" className="p-1 text-[#a0a0a0] hover:text-white hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] w-6 h-6" title="Settings">
          <Settings className="w-3 h-3" />
        </Button>
      </div>
    </header>
  );
}