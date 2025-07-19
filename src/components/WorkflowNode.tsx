import React, { useState, useRef } from 'react';
import { 
  MessageSquare, 
  Image, 
  Music, 
  Database, 
  Code, 
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  Play,
  Copy as Duplicate,
  Edit,
  Trash2
} from 'lucide-react';
import { Node } from '../types/workflow';
import { Button } from './ui/Button';
import { useContextMenu } from './ContextMenu';

interface WorkflowNodeProps {
  node: Node;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Node>) => void;
  onDelete: () => void;
  onConnectionStart?: (nodeId: string, outputId: string) => void;
  onConnectionEnd?: (nodeId: string, inputId: string) => void;
}

const nodeTypeConfig = {
  llm: { 
    icon: MessageSquare, 
    color: '#dc2626', 
    label: 'LM Studio',
    size: 'large',
    status: 'healthy',
    description: 'Local Language Model'
  },
  image: { 
    icon: Image, 
    color: '#dc2626', 
    label: 'ComfyUI',
    size: 'medium',
    status: 'healthy',
    description: 'Image Generation'
  },
  audio: { 
    icon: Music, 
    color: '#dc2626', 
    label: 'Audio',
    size: 'medium',
    status: 'healthy'
  },
  data: { 
    icon: Database, 
    color: '#dc2626', 
    label: 'Data',
    size: 'small',
    status: 'warning'
  },
  code: { 
    icon: Code, 
    color: '#dc2626', 
    label: 'Code',
    size: 'medium',
    status: 'healthy'
  },
};

const sizeConfig = {
  small: { width: 60, height: 60, iconSize: 16 },
  medium: { width: 80, height: 80, iconSize: 20 },
  large: { width: 100, height: 100, iconSize: 24 }
};

export function WorkflowNode({ 
  node, 
  selected, 
  onSelect, 
  onUpdate, 
  onDelete,
  onConnectionStart,
  onConnectionEnd 
}: WorkflowNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { showContextMenu } = useContextMenu();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const contextMenuItems = [
      {
        label: 'Edit Node',
        icon: Edit,
        onClick: () => {
          // Handle edit action
          console.log('Edit node:', node.id);
        }
      },
      {
        label: 'Duplicate',
        icon: Duplicate,
        onClick: () => {
          // Handle duplicate action
          // Create duplicate node
          const newPosition = {
            x: node.position.x + 50,
            y: node.position.y + 50
          };
          const newNode = {
            ...node,
            id: `${node.type}_${Date.now()}`,
            position: newPosition
          };
          onUpdate(newNode);
        }
      },
      {
        label: 'Delete',
        icon: Trash2,
        onClick: () => {
          onDelete();
        }
      }
    ];
    
    showContextMenu(e.clientX, e.clientY, contextMenuItems);
  };

  const config = nodeTypeConfig[node.type as keyof typeof nodeTypeConfig] || nodeTypeConfig.code;
  const size = sizeConfig[config.size as keyof typeof sizeConfig];
  const Icon = config.icon;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      onUpdate({
        position: {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleConnectionPointClick = (type: 'input' | 'output', id: string) => {
    if (type === 'output' && onConnectionStart) {
      onConnectionStart(node.id, id);
    } else if (type === 'input' && onConnectionEnd) {
      onConnectionEnd(node.id, id);
    }
  };

  const getStatusColor = () => {
    switch (config.status) {
      case 'healthy': return '#dc2626';
      case 'warning': return '#dc2626';
      case 'error': return '#dc2626';
      default: return '#dc2626';
    }
  };

  return (
    <div
      ref={nodeRef}
      className="absolute group cursor-move"
      style={{
        left: node.position.x - size.width / 2,
        top: node.position.y - size.height / 2,
        width: size.width,
        height: size.height
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => {
        setShowTooltip(false);
        handleMouseUp();
      }}
      onContextMenu={handleContextMenu}
      style={{ zIndex: 10 }}
    >
      {/* Connection Points */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Input connection point */}
        <div
          className="absolute w-3 h-3 bg-[#dc2626] border-2 border-white rounded-full cursor-pointer pointer-events-auto opacity-80 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
          style={{
            left: -6,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          onClick={() => handleConnectionPointClick('input', 'default')}
        />
        
        {/* Output connection point */}
        <div
          className="absolute w-3 h-3 bg-[#dc2626] border-2 border-white rounded-full cursor-pointer pointer-events-auto opacity-80 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
          style={{
            right: -6,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          onClick={() => handleConnectionPointClick('output', 'default')}
        />
      </div>

      {/* Main Node Circle */}
      <div
        className={`w-full h-full rounded-full border-2 transition-all duration-200 relative overflow-hidden ${
          selected 
            ? 'border-white' 
            : 'border-[#666666] hover:border-[#888888]'
        }`}
        style={{
          backgroundColor: '#dc2626',
          background: `radial-gradient(circle at 30% 30%, #dc2626, #b91c1c)`,
          borderColor: selected ? '#ffffff' : '#4a4a4a'
        }}
      >
        {/* Node content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon 
            className="text-white drop-shadow-lg" 
            size={size.iconSize}
          />
        </div>

        {/* Status dot */}
        <div
          className="absolute top-1 right-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: '#00ff00' }}
        />

        {/* Selection indicator */}
        {selected && (
          <div className="absolute inset-0 rounded-full border-2 border-white opacity-75 animate-pulse" />
        )}
      </div>

      {/* Node Label */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-center">
        <div className="text-xs text-white font-medium whitespace-nowrap">
          {config.label}
        </div>
        <div className="text-xs text-[#808080] whitespace-nowrap">
          {node.id.slice(-4)}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#1a1a1a] border border-[#4a4a4a] rounded px-2 py-1 text-xs text-white whitespace-nowrap z-50">
          <div className="font-medium">{config.label} Node</div>
          <div className="text-[#808080]">Status: {config.status}</div>
          <div className="text-[#808080]">ID: {node.id}</div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-[#4a4a4a]" />
        </div>
      )}

      {/* Delete button for selected nodes */}
      {selected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-[#ff4444] hover:bg-[#ff6666] rounded-full flex items-center justify-center text-white text-xs transition-colors duration-200"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}