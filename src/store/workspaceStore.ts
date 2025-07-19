import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Model3D, Selection, Project, WorkspaceTab, AIAnalysis, ExternalApp } from '../types/workspace';

interface WorkspaceStore {
  // Project Management
  currentProject: Project | null;
  projects: Project[];
  
  // 3D Models
  models: Model3D[];
  selectedModels: string[];
  
  // UI State
  activeTab: string;
  tabs: WorkspaceTab[];
  sidebarCollapsed: boolean;
  aiPanelOpen: boolean;
  
  // Selection System
  selections: Selection[];
  selectionHistory: Selection[];
  
  // AI Assistant
  aiAnalyses: AIAnalysis[];
  aiSuggestions: string[];
  
  // External Apps
  externalApps: ExternalApp[];
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  addModel: (model: Model3D) => void;
  removeModel: (modelId: string) => void;
  updateModel: (modelId: string, updates: Partial<Model3D>) => void;
  
  // Selection Actions
  selectModel: (modelId: string, multi?: boolean) => void;
  selectMultiple: (modelIds: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Tab Management
  setActiveTab: (tabId: string) => void;
  addTab: (tab: WorkspaceTab) => void;
  removeTab: (tabId: string) => void;
  
  // UI Actions
  toggleSidebar: () => void;
  toggleAIPanel: () => void;
  
  // AI Actions
  addAIAnalysis: (analysis: AIAnalysis) => void;
  clearAIAnalyses: () => void;
  
  // External App Management
  detectExternalApps: () => void;
  openWithExternalApp: (modelId: string, appName: string) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentProject: null,
      projects: [],
      models: [],
      selectedModels: [],
      activeTab: '3d-viewer',
      tabs: [
        { id: '3d-viewer', title: '3D Viewer', type: '3d-viewer', active: true },
        { id: 'comfy-ui', title: 'ComfyUI', type: 'comfy-ui', active: false },
        { id: 'development', title: 'Development', type: 'development', active: false },
        { id: 'file-manager', title: 'File Manager', type: 'file-manager', active: false },
        { id: 'photoshop', title: 'Photoshop', type: 'adobe-app', active: false, data: { app: 'photoshop' } },
        { id: 'after-effects', title: 'After Effects', type: 'adobe-app', active: false, data: { app: 'after-effects' } },
        { id: 'illustrator', title: 'Illustrator', type: 'adobe-app', active: false, data: { app: 'illustrator' } },
        { id: 'premiere', title: 'Premiere Pro', type: 'adobe-app', active: false, data: { app: 'premiere' } },
        { id: 'blender', title: 'Blender', type: 'creative-app', active: false, data: { app: 'blender' } },
        { id: 'davinci', title: 'DaVinci Resolve', type: 'creative-app', active: false, data: { app: 'davinci' } }
      ],
      sidebarCollapsed: false,
      aiPanelOpen: false,
      selections: [],
      selectionHistory: [],
      aiAnalyses: [],
      aiSuggestions: [],
      externalApps: [
        { name: 'Blender', path: '', formats: ['obj', 'fbx', 'gltf', 'dae'], icon: '🎨', detected: false },
        { name: 'Maya', path: '', formats: ['obj', 'fbx', 'ma', 'mb'], icon: '🏗️', detected: false },
        { name: 'Cinema 4D', path: '', formats: ['obj', 'fbx', 'c4d'], icon: '🎬', detected: false }
      ],

      // Project Actions
      setCurrentProject: (project) => set({ currentProject: project }),

      // Model Actions
      addModel: (model) => set((state) => ({
        models: [...state.models, model]
      })),

      removeModel: (modelId) => set((state) => ({
        models: state.models.filter(m => m.id !== modelId),
        selectedModels: state.selectedModels.filter(id => id !== modelId)
      })),

      updateModel: (modelId, updates) => set((state) => ({
        models: state.models.map(m => m.id === modelId ? { ...m, ...updates } : m)
      })),

      // Selection Actions
      selectModel: (modelId, multi = false) => set((state) => {
        const newSelection = multi 
          ? state.selectedModels.includes(modelId)
            ? state.selectedModels.filter(id => id !== modelId)
            : [...state.selectedModels, modelId]
          : [modelId];

        const selection: Selection = {
          id: `sel_${Date.now()}`,
          items: newSelection,
          type: newSelection.length > 1 ? 'multiple' : 'single',
          timestamp: new Date()
        };

        return {
          selectedModels: newSelection,
          selections: [...state.selections, selection],
          selectionHistory: [...state.selectionHistory, selection].slice(-50)
        };
      }),

      selectMultiple: (modelIds) => set((state) => {
        const selection: Selection = {
          id: `sel_${Date.now()}`,
          items: modelIds,
          type: 'multiple',
          timestamp: new Date()
        };

        return {
          selectedModels: modelIds,
          selections: [...state.selections, selection],
          selectionHistory: [...state.selectionHistory, selection].slice(-50)
        };
      }),

      clearSelection: () => set((state) => {
        const selection: Selection = {
          id: `sel_${Date.now()}`,
          items: [],
          type: 'single',
          timestamp: new Date()
        };

        return {
          selectedModels: [],
          selections: [...state.selections, selection],
          selectionHistory: [...state.selectionHistory, selection].slice(-50)
        };
      }),

      selectAll: () => set((state) => {
        const allIds = state.models.map(m => m.id);
        const selection: Selection = {
          id: `sel_${Date.now()}`,
          items: allIds,
          type: 'multiple',
          timestamp: new Date()
        };

        return {
          selectedModels: allIds,
          selections: [...state.selections, selection],
          selectionHistory: [...state.selectionHistory, selection].slice(-50)
        };
      }),

      // Tab Management
      setActiveTab: (tabId) => set((state) => ({
        activeTab: tabId,
        tabs: state.tabs.map(tab => ({ ...tab, active: tab.id === tabId }))
      })),

      addTab: (tab) => set((state) => ({
        tabs: [...state.tabs, tab]
      })),

      removeTab: (tabId) => set((state) => ({
        tabs: state.tabs.filter(tab => tab.id !== tabId)
      })),

      // UI Actions
      toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      })),

      toggleAIPanel: () => set((state) => ({
        aiPanelOpen: !state.aiPanelOpen
      })),

      // AI Actions
      addAIAnalysis: (analysis) => set((state) => ({
        aiAnalyses: [...state.aiAnalyses, analysis].slice(-100)
      })),

      clearAIAnalyses: () => set({ aiAnalyses: [] }),

      // External App Management
      detectExternalApps: () => {
        // This would detect installed applications
        // Implementation would vary by platform
        console.log('Detecting external applications...');
      },

      openWithExternalApp: (modelId, appName) => {
        const model = get().models.find(m => m.id === modelId);
        const app = get().externalApps.find(a => a.name === appName);
        
        if (model && app) {
          console.log(`Opening ${model.name} with ${app.name}`);
          // Implementation would launch external application
        }
      }
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
        sidebarCollapsed: state.sidebarCollapsed,
        externalApps: state.externalApps
      })
    }
  )
);