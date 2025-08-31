import React, { useRef, useEffect, useState } from 'react';
import { Node, Connection } from '../types/workflow';

interface MinimapProps {
  nodes: Node[];
  connections: Connection[];
  viewport: { x: number; y: number; zoom: number };
  onNavigate: (x: number, y: number) => void;
}

export function Minimap({ nodes, connections, viewport, onNavigate }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const MINIMAP_WIDTH = 200;
  const MINIMAP_HEIGHT = 150;
  const SCALE_FACTOR = 0.1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Set canvas size
    canvas.width = MINIMAP_WIDTH;
    canvas.height = MINIMAP_HEIGHT;

    // Calculate bounds
    if (nodes.length === 0) return;

    const bounds = nodes.reduce((acc, node) => ({
      minX: Math.min(acc.minX, node.position.x),
      minY: Math.min(acc.minY, node.position.y),
      maxX: Math.max(acc.maxX, node.position.x + 200),
      maxY: Math.max(acc.maxY, node.position.y + 120)
    }), {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    });

    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    
    const scaleX = (MINIMAP_WIDTH - 20) / contentWidth;
    const scaleY = (MINIMAP_HEIGHT - 20) / contentHeight;
    const scale = Math.min(scaleX, scaleY, SCALE_FACTOR);

    const offsetX = (MINIMAP_WIDTH - contentWidth * scale) / 2;
    const offsetY = (MINIMAP_HEIGHT - contentHeight * scale) / 2;

    // Draw connections
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    connections.forEach(connection => {
      const sourceNode = nodes.find(n => n.id === connection.sourceNode);
      const targetNode = nodes.find(n => n.id === connection.targetNode);
      
      if (sourceNode && targetNode) {
        const startX = offsetX + (sourceNode.position.x - bounds.minX) * scale + 100 * scale;
        const startY = offsetY + (sourceNode.position.y - bounds.minY) * scale + 60 * scale;
        const endX = offsetX + (targetNode.position.x - bounds.minX) * scale;
        const endY = offsetY + (targetNode.position.y - bounds.minY) * scale + 60 * scale;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const x = offsetX + (node.position.x - bounds.minX) * scale;
      const y = offsetY + (node.position.y - bounds.minY) * scale;
      const radius = 40 * scale;

      // Node circle
      ctx.fillStyle = node.type === 'llm' ? '#3b82f6' : 
                     node.type === 'image' ? '#8b5cf6' :
                     node.type === 'audio' ? '#10b981' :
                     node.type === 'data' ? '#f59e0b' : '#6b7280';
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Node border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Draw viewport indicator
    const viewportX = offsetX + (-viewport.x / viewport.zoom - bounds.minX) * scale;
    const viewportY = offsetY + (-viewport.y / viewport.zoom - bounds.minY) * scale;
    const viewportWidth = (window.innerWidth / viewport.zoom) * scale;
    const viewportHeight = (window.innerHeight / viewport.zoom) * scale;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);

    // Semi-transparent fill for viewport
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(viewportX, viewportY, viewportWidth, viewportHeight);

  }, [nodes, connections, viewport]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.type !== 'mousedown') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert minimap coordinates to world coordinates
    if (nodes.length === 0) return;

    const bounds = nodes.reduce((acc, node) => ({
      minX: Math.min(acc.minX, node.position.x),
      minY: Math.min(acc.minY, node.position.y),
      maxX: Math.max(acc.maxX, node.position.x + 200),
      maxY: Math.max(acc.maxY, node.position.y + 120)
    }), {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    });

    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    
    const scaleX = (MINIMAP_WIDTH - 20) / contentWidth;
    const scaleY = (MINIMAP_HEIGHT - 20) / contentHeight;
    const scale = Math.min(scaleX, scaleY, SCALE_FACTOR);

    const offsetX = (MINIMAP_WIDTH - contentWidth * scale) / 2;
    const offsetY = (MINIMAP_HEIGHT - contentHeight * scale) / 2;

    const worldX = bounds.minX + (x - offsetX) / scale;
    const worldY = bounds.minY + (y - offsetY) / scale;

    onNavigate(worldX, worldY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-[#1a1a1a] rounded border border-[#333333] p-2">
      <div className="text-xs font-medium text-[#808080] mb-2">Overview</div>
      <canvas
        ref={canvasRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className="cursor-pointer border border-[#333333] rounded"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="text-xs text-[#808080] mt-1 text-center">
        Click to navigate
      </div>
    </div>
  );
}