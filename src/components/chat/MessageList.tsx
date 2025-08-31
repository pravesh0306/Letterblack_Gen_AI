import React, { useEffect, useRef, useState } from 'react';
import { Edit, Trash2, Copy, MoreVertical, User, Bot, CheckCircle, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/Button';
import { Message } from '../../types/chat';

interface MessageItemProps {
  message: Message;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onCopy: (content: string) => void;
}

function MessageItem({ message, onEdit, onDelete, onCopy }: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { updateMessage } = useChatStore();

  const handleSaveEdit = () => {
    updateMessage(message.id, { content: editContent, editing: false });
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    updateMessage(message.id, { editing: false });
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div
      className={`group flex space-x-3 p-4 hover:bg-[#1a1a1a] transition-colors ${
        message.role === 'assistant' ? 'bg-[#0f0f0f]' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.role === 'user' 
          ? 'bg-[#007ACC]' 
          : 'bg-gradient-to-r from-[#8b5cf6] to-[#007ACC]'
      }`}>
        {message.role === 'user' ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium text-sm">
            {message.role === 'user' ? 'You' : 'Assistant'}
          </span>
          <span className="text-xs text-[#707070]">
            {formatTimestamp(message.timestamp)}
          </span>
          {message.metadata?.model && (
            <span className="text-xs text-[#707070] bg-[#2a2a2a] px-2 py-0.5 rounded">
              {message.metadata.model}
            </span>
          )}
          {message.metadata?.error && (
            <XCircle className="w-4 h-4 text-[#ff4444]" title={message.metadata.error} />
          )}
        </div>

        {/* Message Content */}
        {message.editing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 bg-[#2a2a2a] border border-[#333333] rounded text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#007ACC]"
              rows={3}
            />
            <div className="flex space-x-2">
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
            
            {/* AI Action Buttons */}
            {message.metadata?.type === 'node_suggestion' && (
              <div className="mt-3 p-3 bg-[#2a2a2a] rounded border border-[#333333]">
                <h4 className="text-sm font-medium mb-2">Suggested Node: {message.metadata.nodeConfig?.name}</h4>
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      // Add node to canvas
                      const position = { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };
                      // This would need to be passed down as a prop
                      console.log('Creating node:', message.metadata.nodeType, 'at', position);
                    }}
                  >
                    Create Node
                  </Button>
                  <Button variant="ghost" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center space-x-3 p-2 bg-[#2a2a2a] rounded border border-[#333333]"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{attachment.name}</div>
                  <div className="text-xs text-[#707070]">
                    {(attachment.size / 1024).toFixed(1)} KB • {attachment.type}
                  </div>
                </div>
                {attachment.processed ? (
                  <CheckCircle className="w-4 h-4 text-[#28a745]" />
                ) : (
                  <div className="w-4 h-4 border-2 border-[#007ACC] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        {message.metadata && (
          <div className="mt-2 text-xs text-[#707070] space-x-4">
            {message.metadata.tokens && (
              <span>{message.metadata.tokens} tokens</span>
            )}
            {message.metadata.processingTime && (
              <span>{message.metadata.processingTime}ms</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && !message.editing && (
        <div className="flex items-start space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(message.content)}
            className="w-6 h-6 p-0"
            title="Copy message"
          >
            <Copy className="w-3 h-3" />
          </Button>
          {message.role === 'user' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(message.id)}
              className="w-6 h-6 p-0"
              title="Edit message"
            >
              <Edit className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(message.id)}
            className="w-6 h-6 p-0 text-[#ff4444] hover:text-[#ff6666]"
            title="Delete message"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function MessageList() {
  const { messages, isTyping, updateMessage, deleteMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleEdit = (messageId: string) => {
    updateMessage(messageId, { editing: true });
  };

  const handleDelete = (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-[#707070] mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
          <p className="text-[#a0a0a0]">Send a message to begin chatting with AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCopy={handleCopy}
          />
        ))}
        
        {isTyping && (
          <div className="flex space-x-3 p-4 bg-[#0f0f0f]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#007ACC] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm mb-1">Assistant</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#707070] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#707070] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-[#707070] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}