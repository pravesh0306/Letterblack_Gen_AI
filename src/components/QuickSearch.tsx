import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Zap } from 'lucide-react';
import { Node } from '../types/workflow';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface QuickSearchProps {
  open: boolean;
  onClose: () => void;
  nodes: Node[];
  onNodeSelect: (node: Node) => void;
}

export function QuickSearch({ open, onClose, nodes, onNodeSelect }: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredNodes = nodes.filter(node =>
    node.id.toLowerCase().includes(query.toLowerCase()) ||
    node.type.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredNodes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredNodes[selectedIndex]) {
        onNodeSelect(filteredNodes[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleNodeClick = (node: Node) => {
    onNodeSelect(node);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-[#1a1a1a] rounded border border-[#333333] w-96 max-h-80 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-[#333333]">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-[#707070]" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search nodes... (Shift + Space)"
              className="flex-1 h-6 border-none bg-transparent focus:ring-0"
            />
            <Button variant="ghost" size="sm" onClick={onClose} className="w-5 h-5 p-0">
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {filteredNodes.length === 0 ? (
            <div className="p-4 text-center text-[#707070] text-xs">
              {query ? 'No nodes found' : 'Start typing to search nodes...'}
            </div>
          ) : (
            <div className="p-1">
              {filteredNodes.map((node, index) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-[#4a9eff] text-white'
                      : 'hover:bg-[#2a2a2a] text-[#a0a0a0]'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    node.type === 'llm' ? 'bg-[#4a9eff]' :
                    node.type === 'image' ? 'bg-[#8b5cf6]' :
                    node.type === 'audio' ? 'bg-[#00d4aa]' :
                    node.type === 'data' ? 'bg-[#ff8c42]' : 'bg-[#6b7280]'
                  }`}>
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{node.type.toUpperCase()} Node</div>
                    <div className="text-xs opacity-70">{node.id}</div>
                  </div>
                  <div className="text-xs opacity-50">
                    {Math.round(node.position.x)}, {Math.round(node.position.y)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-[#333333] text-xs text-[#707070] flex items-center justify-between">
          <span>↑↓ Navigate • Enter Select • Esc Close</span>
          <span>{filteredNodes.length} results</span>
        </div>
      </div>
    </div>
  );
}