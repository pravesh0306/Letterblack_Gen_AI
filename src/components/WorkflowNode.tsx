import React, { useState, useRef } from 'react';
import { Edit, Copy, Trash2, X } from 'lucide-react';

// TEMP fallback implementations for missing imports
type ContextMenuItem = {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
};

function useContextMenu() {
  return {
    showContextMenu: (x: number, y: number, items: ContextMenuItem[]) => {
      console.log('Context menu:', { x, y, items });
    },
  };
}

const nodeTypeConfig = {
  code: {
    label: 'Code',
    size: 'default',
    icon: () => <div className="text-white">C</div>,
    status: 'active',
  },
};

const sizeConfig = {
  default: { width: 100, height: 100, iconSize: 24 },
};

type WorkflowNodeProps = {
  node: {
    id: string;
    type: string;
    position: { x: number; y: number };
  };
  selected: boolean;
  onSelect: () => void;
  onUpdate: (update: any) => void;
  onDelete: () => void;
  onConnectionStart?: (id: string, port: string) => void;
  onConnectionEnd?: (id: string, port: string) => void;
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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    showContextMenu(e.clientX, e.clientY, [
      {
        label: 'Edit Node',
        icon: Edit,
        onClick: () => console.log('Edit node:', node.id)
      },
      {
        label: 'Duplicate',
        icon: Copy,
        onClick: () => {
          const newPosition = { x: node.position.x + 50, y: node.position.y + 50 };
          const newNode = { ...node, id: `${node.type}_${Date.now()}`, position: newPosition };
          onUpdate(newNode);
        }
      },
      {
        label: 'Delete',
        icon: Trash2,
        onClick: onDelete
      }
    ]);
  };

  return (
    <div
      ref={nodeRef}
      className="absolute group cursor-move"
      style={{
        left: node.position.x - size.width / 2,
        top: node.position.y - size.height / 2,
        width: size.width,
        height: size.height,
        zIndex: selected ? 20 : 10,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={(e) => {
        setShowTooltip(false);
        handleMouseUp();
      }}
      onContextMenu={handleContextMenu}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-3 h-3 bg-[#dc2626] border-2 border-white rounded-full cursor-pointer pointer-events-auto opacity-80 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
          style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}
          onClick={() => handleConnectionPointClick('input', 'default')}
        />
        <div
          className="absolute w-3 h-3 bg-[#dc2626] border-2 border-white rounded-full cursor-pointer pointer-events-auto opacity-80 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
          style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
          onClick={() => handleConnectionPointClick('output', 'default')}
        />
      </div>

      <div
        className={`w-full h-full rounded-full border-2 transition-all duration-200 relative overflow-hidden ${
          selected ? 'border-white' : 'border-[#666666] hover:border-[#888888]'
        }`}
        style={{
          background: `radial-gradient(circle at 30% 30%, #dc2626, #b91c1c)`,
          borderColor: selected ? '#ffffff' : '#4a4a4a'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="text-white drop-shadow-lg" size={size.iconSize} />
        </div>
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#00ff00' }} />
        {selected && (
          <div className="absolute inset-0 rounded-full border-2 border-white opacity-75 animate-pulse" />
        )}
      </div>

      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-center">
        <div className="text-xs text-white font-medium whitespace-nowrap">{config.label}</div>
        <div className="text-xs text-[#808080] whitespace-nowrap">{node.id.slice(-4)}</div>
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#1a1a1a] border border-[#4a4a4a] rounded px-2 py-1 text-xs text-white whitespace-nowrap z-50">
          <div className="font-medium">{config.label} Node</div>
          <div className="text-[#808080]">Status: {config.status}</div>
          <div className="text-[#808080]">ID: {node.id}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-[#4a4a4a]" />
        </div>
      )}

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