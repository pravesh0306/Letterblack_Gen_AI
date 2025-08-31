import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Wifi, WifiOff, Minus, Plus } from 'lucide-react';
import { Button } from './ui/Button';

interface ScalableLayoutProps {
  children: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  onScaleChange?: (scale: number) => void;
}

export function ScalableLayout({ 
  children, 
  leftPanel, 
  rightPanel, 
  onScaleChange 
}: ScalableLayoutProps) {
  const [viewportScale, setViewportScale] = useState(1);
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [wifiStrength, setWifiStrength] = useState(3);
  
  const layoutRef = useRef<HTMLDivElement>(null);
  const leftResizeRef = useRef<HTMLDivElement>(null);
  const rightResizeRef = useRef<HTMLDivElement>(null);

  // WiFi signal simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setWifiStrength(Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Viewport scale handling (affects view only, not layout)
  const handleViewportScaleChange = useCallback((newScale: number) => {
    const clampedScale = Math.min(Math.max(newScale, 0.5), 2);
    setViewportScale(clampedScale);
    onScaleChange?.(clampedScale);
  }, [onScaleChange]);

  // Left panel resize handling
  const handleLeftMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  }, []);

  const handleLeftMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingLeft) return;
    
    const newWidth = Math.min(Math.max(e.clientX, 200), 500);
    setLeftPanelWidth(newWidth);
  }, [isResizingLeft]);

  const handleLeftMouseUp = useCallback(() => {
    setIsResizingLeft(false);
  }, []);

  // Right panel resize handling
  const handleRightMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  }, []);

  const handleRightMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRight || !layoutRef.current) return;
    
    const layoutRect = layoutRef.current.getBoundingClientRect();
    const newWidth = Math.min(Math.max(layoutRect.right - e.clientX, 200), 500);
    setRightPanelWidth(newWidth);
  }, [isResizingRight]);

  const handleRightMouseUp = useCallback(() => {
    setIsResizingRight(false);
  }, []);

  // Mouse event listeners
  useEffect(() => {
    if (isResizingLeft) {
      document.addEventListener('mousemove', handleLeftMouseMove);
      document.addEventListener('mouseup', handleLeftMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleLeftMouseMove);
        document.removeEventListener('mouseup', handleLeftMouseUp);
      };
    }
  }, [isResizingLeft, handleLeftMouseMove, handleLeftMouseUp]);

  useEffect(() => {
    if (isResizingRight) {
      document.addEventListener('mousemove', handleRightMouseMove);
      document.addEventListener('mouseup', handleRightMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleRightMouseMove);
        document.removeEventListener('mouseup', handleRightMouseUp);
      };
    }
  }, [isResizingRight, handleRightMouseMove, handleRightMouseUp]);

  // WiFi icon component
  const WifiIcon = () => {
    const getWifiIcon = () => {
      if (wifiStrength === 0) return <WifiOff className="w-4 h-4" />;
      return <Wifi className="w-4 h-4" />;
    };

    const getSignalColor = () => {
      if (wifiStrength === 0) return 'text-red-400';
      if (wifiStrength <= 2) return 'text-yellow-400';
      return 'text-green-400';
    };

    return (
      <div className={`flex items-center space-x-2 ${getSignalColor()}`}>
        {getWifiIcon()}
        <div className="flex space-x-0.5">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-1 rounded-sm transition-all duration-300 ${
                bar <= wifiStrength ? 'bg-current' : 'bg-gray-600'
              }`}
              style={{ height: `${bar * 3 + 2}px` }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-[#0d0d0d] text-white overflow-hidden">
      {/* Header with Logo and Controls */}
      <header className="relative h-16 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border-b border-[#333333] flex items-center justify-between px-6">
        {/* Logo Container */}
        <div className="flex items-center">
          <img 
            src="/letterblack_logo.png" 
            alt="Letterblack Logo" 
            className="h-8 w-auto"
          />
        </div>

        {/* WiFi Status */}
        <div className="flex items-center">
          <WifiIcon />
        </div>

        {/* Empty space for balance */}
        <div></div>
      </header>

      {/* Main Layout - Fixed dimensions, only content scales */}
      <div 
        ref={layoutRef}
        className="flex-1 flex overflow-hidden"
      >
        {leftPanel && (
          <div 
            className="bg-[#1a1a1a] border-r border-[#333333] flex-shrink-0 relative"
            style={{ width: leftPanelWidth }}
          >
            {leftPanel}
            <div
              ref={leftResizeRef}
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-[#444444] transition-colors"
              onMouseDown={handleLeftMouseDown}
            />
          </div>
        )}
        
        {/* Main content area with viewport scaling */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="w-full h-full origin-center transition-transform duration-200"
            style={{ 
              transform: `scale(${viewportScale})`,
              transformOrigin: 'center center'
            }}
          >
            {children}
          </div>
        </div>
        
        {rightPanel && (
          <div 
            className="bg-[#1a1a1a] border-l border-[#333333] flex-shrink-0 relative"
            style={{ width: rightPanelWidth }}
          >
            <div
              ref={rightResizeRef}
              className="absolute top-0 left-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-[#444444] transition-colors"
              onMouseDown={handleRightMouseDown}
            />
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  );
}