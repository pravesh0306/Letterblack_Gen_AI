import React, { useState, useRef, useCallback } from 'react';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  position: 'left' | 'right';
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function ResizablePanel({
  children,
  defaultWidth = 200,
  minWidth = 150,
  maxWidth = 400,
  position,
  collapsed,
  onToggle,
  className = ''
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaX = position === 'left' ? e.clientX - startXRef.current : startXRef.current - e.clientX;
      const newWidth = Math.min(Math.max(startWidthRef.current + deltaX, minWidth), maxWidth);
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, position, minWidth, maxWidth, isResizing]);

  if (collapsed) {
    return (
      <div className={`w-8 bg-[#1a1a1a] border-${position === 'left' ? 'r' : 'l'} border-[#333333] flex flex-col items-center py-2 ${className}`}>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-[#262626] rounded transition-colors"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`bg-[#1a1a1a] border-${position === 'left' ? 'r' : 'l'} border-[#333333] flex flex-col relative ${className}`}
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        className={`absolute top-0 ${position === 'left' ? '-right-1' : '-left-1'} w-2 h-full cursor-col-resize group hover:bg-blue-500/20 transition-colors z-10`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {/* Panel Header */}
      <div className="flex items-center justify-between p-2 border-b border-[#333333]">
        <h2 className="text-xs font-semibold">Panel</h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-[#262626] rounded transition-colors"
        >
          <Minimize2 className="w-3 h-3" />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}