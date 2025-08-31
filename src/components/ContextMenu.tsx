import React, { useEffect, useRef } from 'react';
import { Copy, Cast as Paste, Trash2, Edit, Locate as Duplicate, Group, Ungroup, Lock, Unlock, Settings, Play, Store as Stop, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Minus } from 'lucide-react';
import { Button } from './ui/Button';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  visible: boolean;
}

export function ContextMenu({ x, y, items, onClose, visible }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  // Adjust position to keep menu within viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 32);

  return (
    <div
      ref={menuRef}
      className="fixed bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-lg z-50 py-1 min-w-48"
      style={{
        left: adjustedX,
        top: adjustedY
      }}
    >
      {items.map((item, index) => (
        <div key={item.id}>
          {item.separator && (
            <div className="h-px bg-[#333333] my-1" />
          )}
          <button
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm transition-colors ${
              item.disabled
                ? 'text-[#707070] cursor-not-allowed'
                : 'text-white hover:bg-[#2a2a2a] cursor-pointer'
            }`}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            <span>{item.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

// Context menu hook for easy usage
export function useContextMenu() {
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    items: [],
    visible: false
  });

  const showContextMenu = (
    event: React.MouseEvent,
    items: ContextMenuItem[]
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items,
      visible: true
    });
  };

  const hideContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  };
}