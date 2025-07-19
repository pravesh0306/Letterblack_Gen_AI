export interface FileFormat {
  extension: string;
  name: string;
  category: 'import' | 'export' | 'both';
  maxSize: number; // in MB
  description: string;
}

export interface Model3D {
  id: string;
  name: string;
  format: string;
  size: number;
  url: string;
  thumbnail?: string;
  metadata: {
    vertices: number;
    faces: number;
    materials: number;
    textures: string[];
  };
  createdAt: Date;
  modifiedAt: Date;
}

export interface Selection {
  id: string;
  items: string[];
  type: 'single' | 'multiple' | 'range';
  timestamp: Date;
}

export interface AIAnalysis {
  id: string;
  type: 'workflow' | 'optimization' | 'error' | 'suggestion';
  content: string;
  confidence: number;
  actions?: string[];
  timestamp: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  models: Model3D[];
  selections: Selection[];
  settings: ProjectSettings;
  createdAt: Date;
  modifiedAt: Date;
}

export interface ProjectSettings {
  renderQuality: 'low' | 'medium' | 'high';
  autoSave: boolean;
  maxFileSize: number;
  defaultExportFormat: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface WorkspaceTab {
  id: string;
  title: string;
  type: '3d-viewer' | 'comfy-ui' | 'development' | 'file-manager' | 'adobe-app' | 'creative-app';
  active: boolean;
  data?: any;
}

export interface ExternalApp {
  name: string;
  path: string;
  formats: string[];
  icon: string;
  detected: boolean;
}