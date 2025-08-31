import React from 'react';
import { X, Moon, Sun, Monitor, Keyboard, Database, Zap } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function SettingsPanel() {
  const { settings, updateSettings, settingsOpen, toggleSettings } = useChatStore();

  if (!settingsOpen) return null;

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    updateSettings({ theme });
  };

  const shortcuts = [
    { key: 'Ctrl + Enter', action: 'Send message' },
    { key: 'Ctrl + N', action: 'New chat' },
    { key: 'Ctrl + K', action: 'Focus input' },
    { key: 'Ctrl + /', action: 'Show shortcuts' },
    { key: 'Ctrl + ,', action: 'Open settings' },
    { key: 'Shift + Space', action: 'Quick search' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <h2 className="text-lg font-semibold">Settings</h2>
          <Button variant="ghost" size="sm" onClick={toggleSettings}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="p-4 space-y-6">
            {/* Appearance */}
            <section>
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                Appearance
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <div className="flex space-x-2">
                    {[
                      { value: 'light', icon: Sun, label: 'Light' },
                      { value: 'dark', icon: Moon, label: 'Dark' },
                      { value: 'auto', icon: Monitor, label: 'Auto' }
                    ].map(({ value, icon: Icon, label }) => (
                      <Button
                        key={value}
                        variant={settings.theme === value ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handleThemeChange(value as any)}
                        className="flex items-center space-x-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* AI Model Settings */}
            <section>
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                AI Model
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">API Endpoint</label>
                  <Input
                    value={settings.apiEndpoint}
                    onChange={(e) => updateSettings({ apiEndpoint: e.target.value })}
                    placeholder="http://localhost:1234/v1"
                  />
                  <p className="text-xs text-[#a0a0a0] mt-1">
                    LM Studio default endpoint
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Default Model</label>
                  <Input
                    value={settings.defaultModel}
                    onChange={(e) => updateSettings({ defaultModel: e.target.value })}
                    placeholder="Select from available models"
                  />
                </div>
              </div>
            </section>

            {/* File Handling */}
            <section>
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                File Handling
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Maximum File Size (MB)
                  </label>
                  <Input
                    type="number"
                    value={settings.maxFileSize / 1024 / 1024}
                    onChange={(e) => updateSettings({ 
                      maxFileSize: parseInt(e.target.value) * 1024 * 1024 
                    })}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableClipboard"
                    checked={settings.enableClipboardPaste}
                    onChange={(e) => updateSettings({ enableClipboardPaste: e.target.checked })}
                    className="w-4 h-4 text-[#007ACC] bg-[#2a2a2a] border-[#333333] rounded focus:ring-[#007ACC]"
                  />
                  <label htmlFor="enableClipboard" className="text-sm">
                    Enable clipboard paste detection
                  </label>
                </div>
              </div>
            </section>

            {/* Chat Behavior */}
            <section>
              <h3 className="text-sm font-medium mb-3">Chat Behavior</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoSave"
                    checked={settings.autoSave}
                    onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                    className="w-4 h-4 text-[#007ACC] bg-[#2a2a2a] border-[#333333] rounded focus:ring-[#007ACC]"
                  />
                  <label htmlFor="autoSave" className="text-sm">
                    Auto-save conversations
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showTyping"
                    checked={settings.showTypingIndicators}
                    onChange={(e) => updateSettings({ showTypingIndicators: e.target.checked })}
                    className="w-4 h-4 text-[#007ACC] bg-[#2a2a2a] border-[#333333] rounded focus:ring-[#007ACC]"
                  />
                  <label htmlFor="showTyping" className="text-sm">
                    Show typing indicators
                  </label>
                </div>
              </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section>
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Keyboard className="w-4 h-4 mr-2" />
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm">{shortcut.action}</span>
                    <kbd className="px-2 py-1 bg-[#2a2a2a] border border-[#333333] rounded text-xs font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#333333] flex justify-end space-x-2">
          <Button variant="ghost" onClick={toggleSettings}>
            Cancel
          </Button>
          <Button variant="primary" onClick={toggleSettings}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}