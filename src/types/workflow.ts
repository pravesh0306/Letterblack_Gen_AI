export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  inputs: Array<{ id: string; type: string; label: string }>;
  outputs: Array<{ id: string; type: string; label: string }>;
}

export interface Connection {
  id: string;
  sourceNode: string;
  sourceOutput: string;
  targetNode: string;
  targetInput: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  connections: Connection[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}