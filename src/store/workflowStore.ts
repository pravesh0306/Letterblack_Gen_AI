import { create } from 'zustand';
import { Node, Connection } from '../types/workflow';

interface WorkflowStore {
  nodes: Node[];
  connections: Connection[];
  selectedNode: string | null;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  deleteNode: (nodeId: string) => void;
  addConnection: (connection: Connection) => void;
  deleteConnection: (connectionId: string) => void;
  selectNode: (nodeId: string | null) => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  nodes: [],
  connections: [],
  selectedNode: null,
  
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node]
    })),
    
  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    })),
    
  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      connections: state.connections.filter(
        (conn) => conn.sourceNode !== nodeId && conn.targetNode !== nodeId
      ),
      selectedNode: state.selectedNode === nodeId ? null : state.selectedNode
    })),
    
  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, connection]
    })),
    
  deleteConnection: (connectionId) =>
    set((state) => ({
      connections: state.connections.filter((conn) => conn.id !== connectionId)
    })),
    
  selectNode: (nodeId) =>
    set(() => ({
      selectedNode: nodeId
    })),
    
  clearWorkflow: () =>
    set(() => ({
      nodes: [],
      connections: [],
      selectedNode: null
    })),

  // Enhanced node management
  duplicateNode: (nodeId: string) =>
    set((state) => {
      const nodeToDuplicate = state.nodes.find(n => n.id === nodeId);
      if (!nodeToDuplicate) return state;
      
      const newNode: Node = {
        ...nodeToDuplicate,
        id: `${nodeToDuplicate.type}_${Date.now()}`,
        position: {
          x: nodeToDuplicate.position.x + 50,
          y: nodeToDuplicate.position.y + 50
        }
      };
      
      return {
        nodes: [...state.nodes, newNode]
      };
    }),

  moveNode: (nodeId: string, position: { x: number; y: number }) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      )
    })),

  // Batch operations
  selectMultipleNodes: (nodeIds: string[]) =>
    set(() => ({
      selectedNode: nodeIds.length === 1 ? nodeIds[0] : null
    })),

  deleteMultipleNodes: (nodeIds: string[]) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => !nodeIds.includes(node.id)),
      connections: state.connections.filter(
        (conn) => !nodeIds.includes(conn.sourceNode) && !nodeIds.includes(conn.targetNode)
      ),
      selectedNode: nodeIds.includes(state.selectedNode || '') ? null : state.selectedNode
    }))
}));