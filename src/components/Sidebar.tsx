import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Search, 
  Folder, 
  FileText, 
  Star, 
  Clock,
  Plus,
  Filter,
  Database,
  Settings,
  Users,
  Activity,
  BarChart3,
  Zap,
  Globe,
  Shield
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ResizablePanel } from './ResizablePanel';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { icon: Activity, label: 'Data Inputs', active: true, hasAlert: true },
    { icon: BarChart3, label: 'Data Views', active: false },
    { icon: Database, label: 'Data Models', active: false },
    { icon: Zap, label: 'Logical Topology', active: false },
    { icon: Settings, label: 'Fielding', active: false },
    { icon: Shield, label: 'Robot Utilities', active: false },
    { icon: Globe, label: 'Service', active: false },
    { icon: Users, label: 'Utilities', active: false },
    { icon: FileText, label: 'Views', active: false },
    { icon: Star, label: 'Others', active: false }
  ];

  const sidebarContent = (
    <>
      <div className="p-2 border-b border-[#dc2626]/30">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-white">Letterblack GenAI</h2>
          {!collapsed && (
            <Button variant="ghost" size="sm" onClick={onToggle} className="w-4 h-4 p-0">
              <ChevronLeft className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        {!collapsed && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#dc2626]/70" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-6 h-6 text-xs border-[#dc2626]/30 focus:border-[#dc2626] focus:ring-[#dc2626]/20"
            />
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors relative ${
                    item.active 
                      ? 'bg-[#dc2626]/20 text-white border-l-2 border-[#dc2626]' 
                      : 'text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.hasAlert && (
                    <div className="absolute right-2 top-1 w-2 h-2 bg-[#dc2626] rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#dc2626]/30 mt-2 pt-2">
            <div className="px-2 py-1">
              <div className="flex items-center space-x-2 text-xs text-[#707070]">
                <div className="w-3 h-3 bg-[#dc2626] rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <span>Workflow Drag Picking Listed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex-1 overflow-y-auto p-1">
          {menuItems.slice(0, 6).map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`flex items-center justify-center p-2 rounded mb-1 cursor-pointer transition-colors relative ${
                  item.active 
                    ? 'bg-[#dc2626]/20 text-white' 
                    : 'text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]'
                }`}
                title={item.label}
              >
                <Icon className="w-3 h-3" />
                {item.hasAlert && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#dc2626] rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <ResizablePanel
      position="left"
      collapsed={collapsed}
      onToggle={onToggle}
      defaultWidth={180}
      minWidth={120}
      maxWidth={250}
    >
      {sidebarContent}
    </ResizablePanel>
  );
}