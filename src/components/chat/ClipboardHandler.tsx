import React, { useEffect, useState } from 'react';
import { Clipboard, X, Check } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/Button';

export function ClipboardHandler() {
  const { settings } = useChatStore();
  const [clipboardContent, setClipboardContent] = useState<string | null>(null);
  const [showClipboardPrompt, setShowClipboardPrompt] = useState(false);

  useEffect(() => {
    if (!settings.enableClipboardPaste) return;

    const handlePaste = async (e: ClipboardEvent) => {
      // Only handle paste when not in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      // Handle text content
      const text = clipboardData.getData('text/plain');
      if (text && text.length > 50) {
        setClipboardContent(text);
        setShowClipboardPrompt(true);
        return;
      }

      // Handle image content
      const items = Array.from(clipboardData.items);
      const imageItem = items.find(item => item.type.startsWith('image/'));
      
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          // Handle image file
          console.log('Image pasted:', file);
          // Could add to attachments here
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [settings.enableClipboardPaste]);

  const handleAcceptClipboard = () => {
    if (clipboardContent) {
      // Add clipboard content to input or as attachment
      const inputElement = document.querySelector('textarea') as HTMLTextAreaElement;
      if (inputElement) {
        const currentValue = inputElement.value;
        const newValue = currentValue ? `${currentValue}\n\n${clipboardContent}` : clipboardContent;
        inputElement.value = newValue;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    setShowClipboardPrompt(false);
    setClipboardContent(null);
  };

  const handleRejectClipboard = () => {
    setShowClipboardPrompt(false);
    setClipboardContent(null);
  };

  if (!showClipboardPrompt || !clipboardContent) return null;

  return (
    <div className="fixed bottom-20 right-4 bg-[#1a1a1a] border border-[#333333] rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-start space-x-3">
        <Clipboard className="w-5 h-5 text-[#007ACC] flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1">Clipboard Content Detected</h4>
          <p className="text-xs text-[#a0a0a0] mb-2">
            Add clipboard content to your message?
          </p>
          <div className="bg-[#2a2a2a] rounded p-2 mb-3 max-h-20 overflow-y-auto">
            <p className="text-xs text-[#e0e0e0] whitespace-pre-wrap">
              {clipboardContent.length > 200 
                ? `${clipboardContent.substring(0, 200)}...` 
                : clipboardContent
              }
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAcceptClipboard}
              className="flex-1"
            >
              <Check className="w-3 h-3 mr-1" />
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRejectClipboard}
              className="flex-1"
            >
              <X className="w-3 h-3 mr-1" />
              Ignore
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}