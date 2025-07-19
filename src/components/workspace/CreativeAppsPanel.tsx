import React, { useState } from 'react';
import { 
  Palette, 
  Video, 
  Image, 
  Film, 
  Box, 
  Monitor,
  ExternalLink,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Save,
  FolderOpen,
  Download
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CreativeAppsPanelProps {
  appType: string;
}

const appConfigs = {
  photoshop: {
    name: 'Adobe Photoshop',
    icon: Palette,
    color: '#31A8FF',
    description: 'Photo editing and digital art',
    features: ['Layers', 'Brushes', 'Filters', 'Color Correction'],
    shortcuts: [
      { key: 'Ctrl+N', action: 'New Document' },
      { key: 'Ctrl+O', action: 'Open File' },
      { key: 'Ctrl+S', action: 'Save' },
      { key: 'Ctrl+Z', action: 'Undo' },
      { key: 'B', action: 'Brush Tool' },
      { key: 'V', action: 'Move Tool' }
    ]
  },
  'after-effects': {
    name: 'Adobe After Effects',
    icon: Video,
    color: '#9999FF',
    description: 'Motion graphics and visual effects',
    features: ['Compositions', 'Keyframes', 'Effects', 'Expressions'],
    shortcuts: [
      { key: 'Ctrl+N', action: 'New Composition' },
      { key: 'Ctrl+I', action: 'Import' },
      { key: 'Space', action: 'Play/Pause' },
      { key: 'Ctrl+K', action: 'Composition Settings' },
      { key: 'P', action: 'Position' },
      { key: 'R', action: 'Rotation' }
    ]
  },
  illustrator: {
    name: 'Adobe Illustrator',
    icon: Image,
    color: '#FF9A00',
    description: 'Vector graphics and illustration',
    features: ['Vector Paths', 'Typography', 'Gradients', 'Artboards'],
    shortcuts: [
      { key: 'Ctrl+N', action: 'New Document' },
      { key: 'V', action: 'Selection Tool' },
      { key: 'A', action: 'Direct Selection' },
      { key: 'P', action: 'Pen Tool' },
      { key: 'T', action: 'Type Tool' },
      { key: 'Ctrl+G', action: 'Group' }
    ]
  },
  premiere: {
    name: 'Adobe Premiere Pro',
    icon: Film,
    color: '#9999FF',
    description: 'Video editing and production',
    features: ['Timeline', 'Effects', 'Color Grading', 'Audio Mixing'],
    shortcuts: [
      { key: 'Ctrl+N', action: 'New Project' },
      { key: 'Ctrl+I', action: 'Import Media' },
      { key: 'Space', action: 'Play/Pause' },
      { key: 'C', action: 'Razor Tool' },
      { key: 'V', action: 'Selection Tool' },
      { key: 'Ctrl+M', action: 'Export Media' }
    ]
  },
  blender: {
    name: 'Blender',
    icon: Box,
    color: '#F5792A',
    description: '3D modeling, animation, and rendering',
    features: ['Modeling', 'Animation', 'Rendering', 'Sculpting'],
    shortcuts: [
      { key: 'Tab', action: 'Edit Mode' },
      { key: 'G', action: 'Grab/Move' },
      { key: 'R', action: 'Rotate' },
      { key: 'S', action: 'Scale' },
      { key: 'X', action: 'Delete' },
      { key: 'Shift+A', action: 'Add Object' }
    ]
  },
  davinci: {
    name: 'DaVinci Resolve',
    icon: Monitor,
    color: '#233A54',
    description: 'Professional video editing and color grading',
    features: ['Edit', 'Color', 'Fairlight', 'Deliver'],
    shortcuts: [
      { key: 'Ctrl+N', action: 'New Project' },
      { key: 'Space', action: 'Play/Pause' },
      { key: 'B', action: 'Blade Tool' },
      { key: 'A', action: 'Arrow Tool' },
      { key: 'Ctrl+R', action: 'Render' },
      { key: 'Ctrl+S', action: 'Save' }
    ]
  }
};

export function CreativeAppsPanel({ appType }: CreativeAppsPanelProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'shortcuts' | 'tools'>('overview');
  const config = appConfigs[appType as keyof typeof appConfigs];

  if (!config) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-center">
          <Monitor className="w-16 h-16 text-[#707070] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Creative App Not Found</h2>
          <p className="text-[#a0a0a0]">The requested application is not configured</p>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0d]">
      {/* Header */}
      <div className="h-12 bg-[#1a1a1a] border-b border-[#333333] flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{ backgroundColor: config.color }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">{config.name}</h2>
            <p className="text-xs text-[#a0a0a0]">{config.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm">
            <ExternalLink className="w-4 h-4 mr-1" />
            Launch App
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="h-10 bg-[#1a1a1a] border-b border-[#333333] flex items-center px-4">
        <div className="flex space-x-1 bg-[#2a2a2a] rounded p-0.5">
          <Button
            variant={activeSection === 'overview' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('overview')}
            className="text-xs h-6"
          >
            Overview
          </Button>
          <Button
            variant={activeSection === 'shortcuts' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('shortcuts')}
            className="text-xs h-6"
          >
            Shortcuts
          </Button>
          <Button
            variant={activeSection === 'tools' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('tools')}
            className="text-xs h-6"
          >
            Quick Tools
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* App Status */}
            <div className="bg-[#1a1a1a] rounded border border-[#333333] p-4">
              <h3 className="font-medium mb-3">Application Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0a0a0]">Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm">Ready</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0a0a0]">Version</span>
                    <span className="text-sm">2024</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0a0a0]">License</span>
                    <span className="text-sm text-green-400">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0a0a0]">Last Used</span>
                    <span className="text-sm">Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-[#1a1a1a] rounded border border-[#333333] p-4">
              <h3 className="font-medium mb-3">Key Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {config.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#4a9eff] rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1a1a1a] rounded border border-[#333333] p-4">
              <h3 className="font-medium mb-3">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="ghost" size="sm" className="flex flex-col items-center p-3 h-auto">
                  <FolderOpen className="w-5 h-5 mb-1" />
                  <span className="text-xs">Open File</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex flex-col items-center p-3 h-auto">
                  <Save className="w-5 h-5 mb-1" />
                  <span className="text-xs">New Project</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex flex-col items-center p-3 h-auto">
                  <Download className="w-5 h-5 mb-1" />
                  <span className="text-xs">Export</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'shortcuts' && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded border border-[#333333] p-4">
              <h3 className="font-medium mb-3">Essential Shortcuts</h3>
              <div className="space-y-2">
                {config.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm">{shortcut.action}</span>
                    <kbd className="px-2 py-1 bg-[#2a2a2a] border border-[#333333] rounded text-xs font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'tools' && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded border border-[#333333] p-4">
              <h3 className="font-medium mb-3">Quick Tools</h3>
              <div className="grid grid-cols-4 gap-3">
                <Button variant="ghost" size="sm" className="flex flex-col items-center p-3 h-auto">
                  <Play className="w-5 h-5 mb-1" />
                  <span className="text-xs">Play</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex flex-col items-center p-3 h-auto">
                  <Pause className="w-5 h-5 mb-1" />
                  <span className="text-xs">Pause</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex flex-col items-center p-3 h-auto">
                  <RotateCcw className="w-5 h-5 mb-1" />
                  <span className="text-xs">Undo</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex flex-col items-center p-3 h-auto">
                  <Save className="w-5 h-5 mb-1" />
                  <span className="text-xs">Save</span>
                </Button>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded border border-[#333333] p-4">
              <h3 className="font-medium mb-3">Recent Files</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer">
                  <div className="w-8 h-8 bg-[#333333] rounded flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Project_001.psd</div>
                    <div className="text-xs text-[#a0a0a0]">Modified 2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer">
                  <div className="w-8 h-8 bg-[#333333] rounded flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Design_Final.ai</div>
                    <div className="text-xs text-[#a0a0a0]">Modified yesterday</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}