import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Trash2, 
  Edit, 
  MoreVertical,
  Settings,
  Download,
  Upload,
  Filter
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function ChatSidebar() {
  const {
    sessions,
    currentSession,
    createSession,
    deleteSession,
    setCurrentSession,
    updateSessionTitle,
    searchQuery,
    searchMessages,
    clearSearch,
    toggleSettings
  } = useChatStore();

  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateSession = () => {
    const sessionId = createSession();
    setCurrentSession(sessionId);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteSession(sessionId);
    }
  };

  const handleEditSession = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSession(sessionId);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (sessionId: string) => {
    if (editTitle.trim()) {
      updateSessionTitle(sessionId, editTitle.trim());
    }
    setEditingSession(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditTitle('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupedSessions = sessions.reduce((groups, session) => {
    const date = formatDate(session.updatedAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(session);
    return groups;
  }, {} as Record<string, typeof sessions>);

  return (
    <div className="w-80 bg-[#1a1a1a] border-r border-[#333333] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">AI Chat</h2>
          <Button variant="ghost" size="sm" onClick={toggleSettings}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          variant="primary"
          onClick={handleCreateSession}
          className="w-full mb-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#707070]" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => {
              const query = e.target.value;
              if (query) {
                searchMessages(query);
              } else {
                clearSearch();
              }
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedSessions).length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-[#707070] mx-auto mb-2" />
            <p className="text-sm text-[#a0a0a0]">No chats yet</p>
            <p className="text-xs text-[#707070]">Start a new conversation</p>
          </div>
        ) : (
          Object.entries(groupedSessions).map(([date, sessionGroup]) => (
            <div key={date}>
              <div className="px-4 py-2 text-xs font-medium text-[#a0a0a0] bg-[#0f0f0f] sticky top-0">
                {date}
              </div>
              {sessionGroup.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setCurrentSession(session.id)}
                  className={`group flex items-center space-x-3 p-3 cursor-pointer hover:bg-[#2a2a2a] transition-colors ${
                    currentSession === session.id ? 'bg-[#2a2a2a] border-r-2 border-[#007ACC]' : ''
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#707070] flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    {editingSession === session.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveEdit(session.id)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(session.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="w-full bg-[#333333] border border-[#555555] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#007ACC]"
                        autoFocus
                      />
                    ) : (
                      <>
                        <h3 className="font-medium text-sm truncate">{session.title}</h3>
                        <p className="text-xs text-[#a0a0a0] truncate">
                          {session.messages.length} messages
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditSession(session.id, session.title, e)}
                      className="w-6 h-6 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="w-6 h-6 p-0 text-[#ff4444] hover:text-[#ff6666]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#333333]">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="flex-1">
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}