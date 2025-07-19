import React, { useState } from 'react';
import { 
  X, 
  Search, 
  MessageSquare, 
  Image, 
  Music, 
  Database, 
  Code,
  Filter,
  Star
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface NodeLibraryProps {
  open: boolean;
  onClose: () => void;
  onNodeAdd: (nodeType: string, position: { x: number; y: number }) => void;
}

const nodeCategories = {
  llm: {
    label: 'Language Models',
    icon: MessageSquare,
    color: 'blue',
    nodes: [
      { type: 'llm', name: 'LM Studio Chat', description: 'Interactive chat with local language models' },
      { type: 'llm', name: 'Text Generator', description: 'Generate text using LM Studio models' },
      { type: 'llm', name: 'Code Assistant', description: 'AI-powered code generation and review' },
      { type: 'llm', name: 'Document Analyzer', description: 'Analyze and extract insights from documents' },
      { type: 'llm', name: 'Workflow Planner', description: 'AI-assisted workflow planning and optimization' }
    ]
  },
  image: {
    label: 'Image Processing',
    icon: Image,
    color: 'purple',
    nodes: [
      { type: 'image', name: 'ComfyUI Generator', description: 'Generate images using ComfyUI workflows' },
      { type: 'image', name: 'Image Editor', description: 'Edit and manipulate images' },
      { type: 'image', name: 'Style Transfer', description: 'Apply artistic styles using AI models' },
      { type: 'image', name: 'Upscaler', description: 'Enhance image resolution with AI' },
      { type: 'image', name: 'Background Remover', description: 'Remove backgrounds automatically' }
    ]
  },
  audio: {
    label: 'Audio Processing',
    icon: Music,
    color: 'green',
    nodes: [
      { type: 'audio', name: 'Speech to Text', description: 'Convert speech to text' },
      { type: 'audio', name: 'Text to Speech', description: 'Convert text to speech' },
      { type: 'audio', name: 'Audio Generator', description: 'Generate music and sounds' },
      { type: 'audio', name: 'Audio Enhancer', description: 'Enhance audio quality' }
    ]
  },
  data: {
    label: 'Data Processing',
    icon: Database,
    color: 'orange',
    nodes: [
      { type: 'data', name: 'Data Source', description: 'Connect to data sources' },
      { type: 'data', name: 'Data Transformer', description: 'Transform and clean data' },
      { type: 'data', name: 'Data Analyzer', description: 'Analyze data patterns' },
      { type: 'data', name: 'Data Export', description: 'Export data to various formats' }
    ]
  },
  code: {
    label: 'Custom Code',
    icon: Code,
    color: 'gray',
    nodes: [
      { type: 'code', name: 'JavaScript', description: 'Execute custom JavaScript code' },
      { type: 'code', name: 'Python', description: 'Execute custom Python code' },
      { type: 'code', name: 'API Call', description: 'Make HTTP API requests' },
      { type: 'code', name: 'Webhook', description: 'Receive webhook data' }
    ]
  }
};

export function NodeLibrary({ open, onClose, onNodeAdd }: NodeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('application/node-type', nodeType);
  };

  const filteredCategories = Object.entries(nodeCategories).reduce((acc, [key, category]) => {
    const filteredNodes = category.nodes.filter(node =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredNodes.length > 0 && (!selectedCategory || selectedCategory === key)) {
      acc[key] = { ...category, nodes: filteredNodes };
    }

    return acc;
  }, {} as typeof nodeCategories);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg w-[800px] h-[600px] flex flex-col border border-[#dc2626]/30">
        {/* Header */}
        <div className="p-6 border-b border-[#dc2626]/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Node Library</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#dc2626]/70" />
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#2a2a2a] border-[#dc2626]/30 text-white"
              />
            </div>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex space-x-2 mt-4">
            <Button
              variant={selectedCategory === null ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? 'bg-[#dc2626] hover:bg-[#dc2626]/80' : ''}
            >
              All
            </Button>
            {Object.entries(nodeCategories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className={selectedCategory === key ? 'bg-[#dc2626] hover:bg-[#dc2626]/80' : ''}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {Object.entries(filteredCategories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <div key={key}>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded bg-[#dc2626] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-white">{category.label}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {category.nodes.map((node, index) => (
                      <div
                        key={`${key}-${index}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, node.type)}
                        className="p-4 bg-[#2a2a2a] rounded-lg border border-[#dc2626]/30 hover:border-[#dc2626] cursor-grab active:cursor-grabbing transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-white">{node.name}</h4>
                          <Star className="w-4 h-4 text-[#dc2626]/70 hover:text-[#dc2626] cursor-pointer" />
                        </div>
                        <p className="text-xs text-[#a0a0a0] mb-3">
                          {node.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-1 text-xs bg-[#dc2626]/20 text-[#dc2626] rounded">
                            {category.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onNodeAdd(node.type, { x: 100, y: 100 });
                              onClose();
                            }}
                            className="text-[#dc2626] hover:bg-[#dc2626]/20"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#dc2626]/30">
          <p className="text-sm text-[#a0a0a0]">
            Drag nodes to the canvas or click "Add" to place them. You can also search for specific functionality above.
          </p>
        </div>
      </div>
    </div>
  );
}