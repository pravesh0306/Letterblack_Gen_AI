import React, { forwardRef, useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Grid, Bot, Map, RotateCcw, Move } from 'lucide-react';
import { Button } from './ui/Button';
import { WorkflowNode } from './WorkflowNode';
import { Connection } from './Connection';
import { AIAssistant } from './AIAssistant';
import { Minimap } from './Minimap';
import { ContextMenu, useContextMenu } from './ContextMenu';
import { Node, Connection as ConnectionType } from '../types/workflow';

interface CanvasProps {
  nodes: Node[];
  connections: ConnectionType[];
  selectedNode: Node | null;
  onNodeAdd: (nodeType: string, position: { x: number; y: number }) => void;
  onNodeSelect: (node: Node | null) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionAdd: (connection: ConnectionType) => void;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({
  nodes,
  connections,
  selectedNode,
  onNodeAdd,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete,
  onConnectionAdd
}, ref) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const [connectionInProgress, setConnectionInProgress] = useState<{
    sourceNode: string;
    sourceOutput: string;
  } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Listen for center on node events
  useEffect(() => {
    const handleCenterOnNode = (e: CustomEvent) => {
      const { position } = e.detail;
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setPan({
          x: rect.width / 2 - position.x * zoom,
          y: rect.height / 2 - position.y * zoom
        });
      }
    };

    window.addEventListener('centerOnNode', handleCenterOnNode as EventListener);
    return () => window.removeEventListener('centerOnNode', handleCenterOnNode as EventListener);
  }, [zoom]);

  // Enhanced zoom with smooth transitions and bounds
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    // Scroll wheel always zooms
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(zoom + delta, 0.1), 5);
    
    // Zoom towards mouse position
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomFactor = newZoom / zoom;
      const newPanX = mouseX - (mouseX - pan.x) * zoomFactor;
      const newPanY = mouseY - (mouseY - pan.y) * zoomFactor;
      
      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  }, [zoom, pan]);

  // Enhanced mouse interactions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    hideContextMenu(); // Hide context menu on any click
    
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    } else if (e.button === 0 && e.target === canvasRef.current) {
      onNodeSelect(null);
      setSelectedConnection(null);
    }
  }, [pan, onNodeSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && dragStart) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isPanning, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragStart(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleZoomFit();
            break;
          case 'f':
            e.preventDefault();
            handleZoomFit(); // Ctrl+F for Fit to View
            break;
          case 'g':
            e.preventDefault();
            setShowGrid(!showGrid);
            break;
          case 'm':
            e.preventDefault();
            setShowMinimap(!showMinimap);
            break;
          case 'n':
            if (e.shiftKey) {
              e.preventDefault();
              // Quick node creation with AI assistance
              const position = { x: 200, y: 200 };
              setIsAIAssistantOpen(true);
            }
            break;
        }
      }
      
      if (e.key === ' ') {
        e.preventDefault();
        // Space bar for panning mode
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGrid, showMinimap]);

  // Enhanced zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleZoomFit = useCallback(() => {
    if (nodes.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    // Calculate bounding box of all nodes
    const padding = 80; // Increased padding for better visual spacing
    const bounds = nodes.reduce((acc, node) => ({
      minX: Math.min(acc.minX, node.position.x - 50), // Account for node radius
      minY: Math.min(acc.minY, node.position.y - 50),
      maxX: Math.max(acc.maxX, node.position.x + 50),
      maxY: Math.max(acc.maxY, node.position.y + 50)
    }), {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    });

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      
      const contentWidth = bounds.maxX - bounds.minX;
      const contentHeight = bounds.maxY - bounds.minY;
      
      const scaleX = (rect.width - padding * 2) / contentWidth;
      const scaleY = (rect.height - padding * 2) / contentHeight;
      const newZoom = Math.min(scaleX, scaleY, 1.5); // Allow slight zoom in for better visibility
      
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      
      setZoom(newZoom);
      setPan({
        x: rect.width / 2 - centerX * newZoom,
        y: rect.height / 2 - centerY * newZoom
      });
    }
  }, [nodes]);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Drag and drop functionality
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('application/node-type');
    if (nodeType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      };
      onNodeAdd(nodeType, position);
    }
  }, [pan, zoom, onNodeAdd]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Connection handling
  const handleConnectionStart = useCallback((nodeId: string, outputId: string) => {
    setConnectionInProgress({ sourceNode: nodeId, sourceOutput: outputId });
  }, []);

  const handleConnectionEnd = useCallback((nodeId: string, inputId: string) => {
    if (connectionInProgress) {
      const newConnection: ConnectionType = {
        id: `conn_${Date.now()}`,
        sourceNode: connectionInProgress.sourceNode,
        sourceOutput: connectionInProgress.sourceOutput,
        targetNode: nodeId,
        targetInput: inputId
      };
      onConnectionAdd(newConnection);
      setConnectionInProgress(null);
    }
  }, [connectionInProgress, onConnectionAdd]);

  const handleConnectionSelect = useCallback((connectionId: string) => {
    setSelectedConnection(connectionId);
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Minimap navigation
  const handleMinimapClick = useCallback((x: number, y: number) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setPan({
        x: rect.width / 2 - x * zoom,
        y: rect.height / 2 - y * zoom
      });
    }
  }, [zoom]);

  // Canvas right-click context menu
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: (e.clientX - canvasRect.left - pan.x) / zoom,
        y: (e.clientY - canvasRect.top - pan.y) / zoom
      };

      const menuItems = [
        {
          id: 'add-node',
          label: 'Add Node',
          action: () => {
            // Quick add LLM node
            onNodeAdd('llm', position);
          }
        },
        {
          id: 'add-image-node',
          label: 'Add Image Node',
          action: () => onNodeAdd('image', position)
        },
        {
          id: 'add-data-node',
          label: 'Add Data Node',
          action: () => onNodeAdd('data', position)
        },
        {
          id: 'separator1',
          label: '',
          action: () => {},
          separator: true
        },
        {
          id: 'select-all',
          label: 'Select All',
          action: () => {
            // Select all nodes
            nodes.forEach(node => onNodeSelect(node));
          }
        },
        {
          id: 'clear-selection',
          label: 'Clear Selection',
          action: () => {
            onNodeSelect(null);
            setSelectedConnection(null);
          }
        },
        {
          id: 'separator2',
          label: '',
          action: () => {},
          separator: true
        },
        {
          id: 'zoom-fit',
          label: 'Zoom to Fit',
          action: handleZoomFit
        },
        {
          id: 'reset-view',
          label: 'Reset View',
          action: handleResetView
        }
      ];

      showContextMenu(e, menuItems);
    }
  }, [pan, zoom, nodes, onNodeSelect, showContextMenu, handleZoomFit, handleResetView]);
  // Enhanced grid pattern with better visibility
  const gridPattern = showGrid ? {
    backgroundImage: `
      radial-gradient(circle, rgba(74, 74, 74, 0.3) 1px, transparent 1px),
      radial-gradient(circle, rgba(74, 74, 74, 0.15) 1px, transparent 1px)
    `,
    backgroundSize: `${20 * zoom}px ${20 * zoom}px, ${100 * zoom}px ${100 * zoom}px`,
    backgroundPosition: `${pan.x}px ${pan.y}px, ${pan.x}px ${pan.y}px`
  } : {};

  return (
    <div className="flex-1 relative overflow-hidden bg-[#0d0d0d]">
      <div
        ref={canvasRef}
        className="w-full h-full cursor-default select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onContextMenu={handleCanvasContextMenu}
        style={gridPattern}
      >
        <div
          ref={viewportRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            position: 'relative',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Render connections */}
          {connections.map((connection) => (
            <Connection
              key={`connection-${connection.id}`}
              connection={connection}
              nodes={nodes}
              selected={selectedConnection === connection.id}
              onSelect={() => handleConnectionSelect(connection.id)}
            />
          ))}

          {/* Render nodes */}
          {nodes.map((node) => (
            <WorkflowNode
              key={`node-${node.id}`}
              node={node}
              selected={selectedNode?.id === node.id}
              onSelect={() => onNodeSelect(node)}
              onUpdate={(updates) => onNodeUpdate(node.id, updates)}
              onDelete={() => onNodeDelete(node.id)}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              style={{ zIndex: 10 }}
            />
          ))}

          {/* Connection preview line */}
          {connectionInProgress && (
            <div className="absolute top-0 left-0 pointer-events-none">
              <svg className="w-full h-full overflow-visible">
                <line
                  x1={0}
                  y1={0}
                  x2={100}
                  y2={100}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Canvas Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-30">
        <div className="bg-[#1a1a1a] rounded border border-[#333333] p-1 space-y-1">
          <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In (Ctrl/Cmd +)">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out (Ctrl/Cmd -)">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomFit} title="Fit to Screen (Ctrl/Cmd 0)">
            <Maximize className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResetView} title="Reset View">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="w-full h-px bg-[#333333] my-1" />
          <Button 
            variant={showGrid ? "primary" : "ghost"} 
            size="sm" 
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid (Ctrl/Cmd G)"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button 
            variant={showMinimap ? "primary" : "ghost"} 
            size="sm" 
            onClick={() => setShowMinimap(!showMinimap)}
            title="Toggle Minimap (Ctrl/Cmd M)"
          >
            <Map className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Assistant Toggle */}
      <div className="absolute bottom-6 left-6 z-30">
        <Button
          variant={isAIAssistantOpen ? "primary" : "secondary"}
          size="sm"
          onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
          className="bg-[#1a1a1a] border border-[#333333]"
        >
          <Bot className="w-4 h-4 mr-2" />
          AI Assistant
        </Button>
      </div>

      {/* Enhanced Zoom Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] px-3 py-1 rounded border border-[#333333] z-30">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <div className="w-px h-4 bg-[#333333]" />
          <div className="flex items-center space-x-1 text-xs text-[#808080]">
            <Move className="w-3 h-3" />
            <span>Pan: Space + Drag</span>
          </div>
        </div>
      </div>

      {/* Minimap */}
      {showMinimap && (
        <div className="absolute top-6 right-6 z-30">
          <Minimap
            nodes={nodes}
            connections={connections}
            viewport={{ x: pan.x, y: pan.y, zoom }}
            onNavigate={handleMinimapClick}
          />
        </div>
      )}

      {/* Context Menu */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenu.items}
        onClose={hideContextMenu}
        visible={contextMenu.visible}
      />

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onNodeAdd={onNodeAdd}
        position={{ x: 100, y: 100 }}
      />

      {/* Keyboard Shortcuts Help */}
      <div className="absolute top-12 left-6 bg-[#1a1a1a] rounded border border-[#333333] p-2 text-xs text-[#808080] max-w-xs opacity-80 hover:opacity-100 transition-opacity z-20">
        <div className="font-medium mb-2">Keyboard Shortcuts</div>
        <div className="space-y-1">
          <div>Zoom: <kbd className="px-1 py-0.5 bg-[#2a2a2a] rounded">Ctrl/Cmd + ±</kbd></div>
          <div>Fit All: <kbd className="px-1 py-0.5 bg-[#2a2a2a] rounded">Ctrl/Cmd + F</kbd></div>
          <div>Reset: <kbd className="px-1 py-0.5 bg-[#2a2a2a] rounded">Ctrl/Cmd + 0</kbd></div>
          <div>Grid: <kbd className="px-1 py-0.5 bg-[#2a2a2a] rounded">Ctrl/Cmd + G</kbd></div>
          <div>Pan: <kbd className="px-1 py-0.5 bg-[#2a2a2a] rounded">Space + Drag</kbd></div>
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';