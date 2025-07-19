import React, { useState, useRef, useCallback } from 'react';
import { Trash2, Copy, Lock, Unlock, Group, Ungroup, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../ui/Button';

interface SelectionBoxProps {
  onSelectionComplete: (bounds: DOMRect) => void;
}

function SelectionBox({ onSelectionComplete }: SelectionBoxProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setIsSelecting(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPos({ x, y });
  }, [isSelecting]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;

    const bounds = new DOMRect(
      Math.min(startPos.x, currentPos.x),
      Math.min(startPos.y, currentPos.y),
      Math.abs(currentPos.x - startPos.x),
      Math.abs(currentPos.y - startPos.y)
    );

    if (bounds.width > 10 && bounds.height > 10) {
      onSelectionComplete(bounds);
    }

    setIsSelecting(false);
  }, [isSelecting, startPos, currentPos, onSelectionComplete]);

  const selectionStyle = isSelecting ? {
    left: Math.min(startPos.x, currentPos.x),
    top: Math.min(startPos.y, currentPos.y),
    width: Math.abs(currentPos.x - startPos.x),
    height: Math.abs(currentPos.y - startPos.y)
  } : {};

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {isSelecting && (
        <div
          className="absolute border-2 border-[#007ACC] bg-[#007ACC]/10 pointer-events-none"
          style={selectionStyle}
        />
      )}
    </div>
  );
}

export function SelectionSystem() {
  const { 
    selectedModels, 
    models, 
    selectModel, 
    selectMultiple, 
    clearSelection, 
    selectAll,
    removeModel 
  } = useWorkspaceStore();

  const handleSelectionComplete = useCallback((bounds: DOMRect) => {
    // This would calculate which models are within the selection bounds
    // For now, we'll simulate selecting random models
    const selectedIds = models
      .filter(() => Math.random() > 0.5)
      .map(m => m.id)
      .slice(0, 3);
    
    selectMultiple(selectedIds);
  }, [models, selectMultiple]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'a':
          e.preventDefault();
          selectAll();
          break;
        case 'd':
          e.preventDefault();
          clearSelection();
          break;
        case 'Delete':
        case 'Backspace':
          selectedModels.forEach(removeModel);
          clearSelection();
          break;
      }
    }
  }, [selectedModels, selectAll, clearSelection, removeModel]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <SelectionBox onSelectionComplete={handleSelectionComplete} />
      
      {/* Selection Counter */}
      {selectedModels.length > 0 && (
        <div className="absolute top-4 left-4 bg-[#007ACC] text-white px-3 py-1 rounded-full text-sm font-medium">
          {selectedModels.length} selected
        </div>
      )}

      {/* Context Menu */}
      {selectedModels.length > 0 && (
        <div className="absolute top-16 left-4 bg-[#1a1a1a] border border-[#333333] rounded shadow-lg p-1 min-w-48">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Copy className="w-4 h-4 mr-2" />
            Duplicate ({selectedModels.length})
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Group className="w-4 h-4 mr-2" />
            Group
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Lock className="w-4 h-4 mr-2" />
            Lock
          </Button>
          <div className="border-t border-[#333333] my-1" />
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <AlignLeft className="w-4 h-4 mr-2" />
            Align Left
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <AlignCenter className="w-4 h-4 mr-2" />
            Align Center
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <AlignRight className="w-4 h-4 mr-2" />
            Align Right
          </Button>
          <div className="border-t border-[#333333] my-1" />
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs text-[#DC3545] hover:bg-[#DC3545]/20"
            onClick={() => {
              selectedModels.forEach(removeModel);
              clearSelection();
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </>
  );
}