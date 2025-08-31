import React from 'react';
import { Connection as ConnectionType, Node } from '../types/workflow';
import { useContextMenu } from './ContextMenu';
import { Trash2, Settings, Edit } from 'lucide-react';

interface ConnectionProps {
  connection: ConnectionType;
  nodes: Node[];
  selected?: boolean;
  onSelect?: () => void;
}

export function Connection({ connection, nodes, selected = false, onSelect }: ConnectionProps) {
  const sourceNode = nodes.find(n => n.id === connection.sourceNode);
  const targetNode = nodes.find(n => n.id === connection.targetNode);
  const { showContextMenu } = useContextMenu();

  if (!sourceNode || !targetNode) return null;

  // Calculate connection points from center of nodes
  const startX = sourceNode.position.x;
  const startY = sourceNode.position.y;
  const endX = targetNode.position.x;
  const endY = targetNode.position.y;

  // Calculate the angle and distance
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Node radius (approximate)
  const nodeRadius = 40;
  
  // Adjust start and end points to be on the edge of circles
  const adjustedStartX = startX + Math.cos(angle) * nodeRadius;
  const adjustedStartY = startY + Math.sin(angle) * nodeRadius;
  const adjustedEndX = endX - Math.cos(angle) * nodeRadius;
  const adjustedEndY = endY - Math.sin(angle) * nodeRadius;

  // Create smooth curve path
  const controlOffset = Math.min(distance * 0.3, 100);
  const controlX1 = adjustedStartX + Math.cos(angle) * controlOffset;
  const controlY1 = adjustedStartY + Math.sin(angle) * controlOffset;
  const controlX2 = adjustedEndX - Math.cos(angle) * controlOffset;
  const controlY2 = adjustedEndY - Math.sin(angle) * controlOffset;

  const path = `M ${adjustedStartX} ${adjustedStartY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${adjustedEndX} ${adjustedEndY}`;

  // Calculate path length for animation
  const pathLength = distance - (nodeRadius * 2);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSelect) onSelect(); // Select the connection
    
    const menuItems = [
      {
        id: 'edit',
        label: 'Edit Connection',
        icon: Edit,
        action: () => {
          console.log('Edit connection:', connection.id);
        }
      },
      {
        id: 'settings',
        label: 'Connection Settings',
        icon: Settings,
        action: () => {
          console.log('Connection settings:', connection.id);
        }
      },
      {
        id: 'separator1',
        label: '',
        action: () => {},
        separator: true
      },
      {
        id: 'delete',
        label: 'Delete Connection',
        icon: Trash2,
        action: () => {
          // This would need to be passed down as a prop
          console.log('Delete connection:', connection.id);
        }
      }
    ];

    showContextMenu(e, menuItems);
  };
  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible'
      }}
    >
      <defs>
        {/* Arrow marker */}
        <marker
          id={`arrow-${connection.id}`}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L8,3 z"
            fill={selected ? "#ffffff" : "#dc2626"}
            className="transition-colors duration-200"
          />
        </marker>

        {/* Dotted pattern */}
        <pattern
          id={`dots-${connection.id}`}
          patternUnits="userSpaceOnUse"
          width="10"
          height="2"
        >
          <circle cx="1" cy="1" r="0.5" fill={selected ? "#ffffff" : "#6a6a6a"} />
        </pattern>
      </defs>
      
      {/* Connection path */}
      <g>
        {/* Invisible thick line for easier selection */}
        <path
          d={path}
          stroke="transparent"
          strokeWidth="12"
          fill="none"
          className="pointer-events-auto cursor-pointer"
          onClick={onSelect}
          onContextMenu={handleContextMenu}
        />
        
        {/* Main dotted connection line */}
        <path
          d={path}
          stroke={selected ? "#ffffff" : "#dc2626"}
          strokeWidth={selected ? "4" : "3"}
          fill="none"
          strokeDasharray="none"
          markerEnd={`url(#arrow-${connection.id})`}
          className="transition-all duration-200 pointer-events-auto cursor-pointer connection-line drop-shadow-lg"
          onClick={onSelect}
          onContextMenu={handleContextMenu}
        />

        {/* Data flow animation dots */}
        {[0, 0.2, 0.4, 0.6, 0.8].map((offset, index) => (
          <circle
            key={index}
            r="4"
            fill="#dc2626"
            className="opacity-90 data-flow-dot drop-shadow-lg"
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={path}
              begin={`${offset * 2}s`}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;1;0"
              dur="2s"
              repeatCount="indefinite"
              begin={`${offset * 2}s`}
            />
          </circle>
        ))}

        {/* Connection metrics label */}
        {selected && (
          <g>
            <rect
              x={(adjustedStartX + adjustedEndX) / 2 - 20}
              y={(adjustedStartY + adjustedEndY) / 2 - 8}
              width="40"
              height="16"
              rx="8"
              fill="#1a1a1a"
              stroke="#4a4a4a"
            />
            <text
              x={(adjustedStartX + adjustedEndX) / 2}
              y={(adjustedStartY + adjustedEndY) / 2 + 3}
              textAnchor="middle"
              className="text-xs font-medium fill-white"
            >
              {Math.round(distance)}ms
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}