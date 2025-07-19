import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { Timeline } from './components/Timeline';
import { PropertiesPanel } from './components/PropertiesPanel';
import { BottomPanel } from './components/BottomPanel';
import { NodeLibrary } from './components/NodeLibrary';
import { ChatInterface } from './components/chat/ChatInterface';
import { ChatSidebar } from './components/chat/ChatSidebar';
import { SettingsPanel } from './components/chat/SettingsPanel';
import { QuickSearch } from './components/QuickSearch';
import { CreativeAppsPanel } from './components/workspace/CreativeAppsPanel';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ScalableLayout } from './components/ScalableLayout';
import { useChatStore } from './store/chatStore';
import { useWorkflowStore } from './store/workflowStore';
import { Node } from './types/workflow';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [propertiesPanelCollapsed, setPropertiesPanelCollapsed] = useState(false);
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(true);
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);
  const [nodeLibraryOpen, setNodeLibraryOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [layoutScale, setLayoutScale] = useState(1);

  const { 
    nodes, 
    connections, 
    selectedNode, 
    addNode, 
    updateNode, 
    deleteNode, 
    addConnection, 
    selectNode 
  } = useWorkflowStore();

  // Initialize with sample nodes and connections
  React.useEffect(() => {
    if (nodes.length === 0) {
      // Add sample nodes
      const sampleNodes = [
        {
          id: 'llm_1',
          type: 'llm',
          position: { x: 400, y: 300 },
          data: { name: 'LM Studio Chat' },
          inputs: [{ id: 'input', type: 'text', label: 'Input' }],
          outputs: [{ id: 'output', type: 'text', label: 'Output' }]
        },
        {
          id: 'image_1',
          type: 'image',
          position: { x: 600, y: 200 },
          data: { name: 'ComfyUI Generator' },
          inputs: [{ id: 'prompt', type: 'text', label: 'Prompt' }],
          outputs: [{ id: 'image', type: 'image', label: 'Image' }]
        },
        {
          id: 'data_1',
          type: 'data',
          position: { x: 500, y: 400 },
          data: { name: 'Data Processor' },
          inputs: [{ id: 'input', type: 'any', label: 'Input' }],
          outputs: [{ id: 'output', type: 'any', label: 'Output' }]
        }
      ];

      // Add sample connections
      const sampleConnections = [
        {
          id: 'conn_1',
          sourceNode: 'llm_1',
          sourceOutput: 'output',
          targetNode: 'image_1',
          targetInput: 'prompt'
        },
        {
          id: 'conn_2',
          sourceNode: 'llm_1',
          sourceOutput: 'output',
          targetNode: 'data_1',
          targetInput: 'input'
        }
      ];

      sampleNodes.forEach(node => addNode(node));
      sampleConnections.forEach(connection => addConnection(connection));
    }
  }, [nodes.length, addNode, addConnection]);
  const { 
    sidebarOpen: chatSidebarOpen, 
    toggleSidebar: toggleChatSidebar,
    createSession,
    setCurrentSession,
    sessions,
    currentSession
  } = useChatStore();

  const handleNodeAdd = (nodeType: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${nodeType}_${Date.now()}`,
      type: nodeType,
      position,
      data: {},
      inputs: [{ id: 'input', type: 'any', label: 'Input' }],
      outputs: [{ id: 'output', type: 'any', label: 'Output' }]
    };
    addNode(newNode);
  };

  const handleNodeSelect = (node: Node | null) => {
    selectNode(node?.id || null);
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        setQuickSearchOpen(true);
      }
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        setChatMode(!chatMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatMode]);

  // Initialize chat if needed
  React.useEffect(() => {
    if (chatMode && sessions.length === 0) {
      const sessionId = createSession('Welcome Chat');
      setCurrentSession(sessionId);
    } else if (chatMode && !currentSession && sessions.length > 0) {
      setCurrentSession(sessions[0].id);
    }
  }, [chatMode, sessions, currentSession, createSession, setCurrentSession]);

  return (
    <ScalableLayout
      leftPanel={
        chatMode ? (
          chatSidebarOpen ? <ChatSidebar /> : null
        ) : (
          null
        )
      }
      rightPanel={
        !chatMode ? (
          <PropertiesPanel
            selectedNode={selectedNodeData || null}
            collapsed={propertiesPanelCollapsed}
            onToggle={() => setPropertiesPanelCollapsed(!propertiesPanelCollapsed)}
            onNodeUpdate={updateNode}
            onNodeAdd={handleNodeAdd}
          />
        ) : null
      }
      onScaleChange={setLayoutScale}
    >
      <div className="h-full flex flex-col bg-[#0d0d0d] text-white overflow-hidden">
        <ConnectionStatus />
        <Header 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onToggleNodeLibrary={() => setNodeLibraryOpen(!nodeLibraryOpen)}
          onToggleBottomPanel={() => setBottomPanelCollapsed(!bottomPanelCollapsed)}
          onToggleChat={() => setChatMode(!chatMode)}
          chatMode={chatMode}
        />
        
        <div className="flex-1 overflow-hidden relative">
          {/* Transparent Left Panel in Workspace */}
          {!chatMode && (
            <div className="absolute top-4 left-4 z-30 bg-[#1a1a1a]/85 backdrop-blur-sm border border-[#dc2626]/30 rounded-lg shadow-lg">
              <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
              />
            </div>
          )}
          
          {chatMode ? (
            <ChatInterface />
          ) : (
            <Canvas
              nodes={nodes}
              connections={connections}
              selectedNode={selectedNodeData || null}
              onNodeAdd={handleNodeAdd}
              onNodeSelect={handleNodeSelect}
              onNodeUpdate={updateNode}
              onNodeDelete={deleteNode}
              onConnectionAdd={addConnection}
            />
          )}
        </div>
        
        {!chatMode && (
          <Timeline 
            collapsed={timelineCollapsed}
            onToggle={() => setTimelineCollapsed(!timelineCollapsed)}
          />
        )}
        
        <NodeLibrary
          open={nodeLibraryOpen}
          onClose={() => setNodeLibraryOpen(false)}
          onNodeAdd={handleNodeAdd}
        />
        
        <QuickSearch
          open={quickSearchOpen}
          onClose={() => setQuickSearchOpen(false)}
          nodes={nodes}
          onNodeSelect={handleNodeSelect}
        />
        
        <SettingsPanel />
      </div>
    </ScalableLayout>
  );
}

export default App;