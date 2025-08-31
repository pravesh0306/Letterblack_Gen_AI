import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Download, Upload, GitBranch, Settings, Terminal, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

const TEMPLATES = {
  photoshop: `// Photoshop CEP Panel Template
#target photoshop

function createLayer() {
    var doc = app.activeDocument;
    var layer = doc.artLayers.add();
    layer.name = "New Layer";
    layer.blendMode = BlendMode.NORMAL;
    return layer;
}

// Export function for CEP
function exportForCEP() {
    return {
        createLayer: createLayer
    };
}`,

  aftereffects: `// After Effects ExtendScript Template
#target aftereffects

function createComp() {
    var comp = app.project.items.addComp(
        "New Composition",
        1920, 1080,
        1.0, 30, false
    );
    return comp;
}

function addTextLayer(comp, text) {
    var textLayer = comp.layers.addText(text);
    return textLayer;
}`,

  javascript: `// Modern JavaScript ES2022 Template
class WorkflowManager {
    constructor() {
        this.nodes = new Map();
        this.connections = new Set();
    }

    async addNode(type, data) {
        const node = {
            id: crypto.randomUUID(),
            type,
            data,
            timestamp: Date.now()
        };
        
        this.nodes.set(node.id, node);
        return node;
    }

    connect(sourceId, targetId) {
        const connection = { sourceId, targetId };
        this.connections.add(connection);
        return connection;
    }
}

export default WorkflowManager;`,

  python: `# Python 3.9+ Template for 3D Processing
import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class Vertex:
    x: float
    y: float
    z: float

class Model3D:
    def __init__(self, name: str):
        self.name = name
        self.vertices: List[Vertex] = []
        self.faces: List[List[int]] = []
        
    def add_vertex(self, x: float, y: float, z: float) -> int:
        vertex = Vertex(x, y, z)
        self.vertices.append(vertex)
        return len(self.vertices) - 1
        
    def add_face(self, vertex_indices: List[int]) -> None:
        if len(vertex_indices) >= 3:
            self.faces.append(vertex_indices)
            
    def get_bounds(self) -> Dict[str, float]:
        if not self.vertices:
            return {"min_x": 0, "max_x": 0, "min_y": 0, "max_y": 0, "min_z": 0, "max_z": 0}
            
        xs = [v.x for v in self.vertices]
        ys = [v.y for v in self.vertices]
        zs = [v.z for v in self.vertices]
        
        return {
            "min_x": min(xs), "max_x": max(xs),
            "min_y": min(ys), "max_y": max(ys),
            "min_z": min(zs), "max_z": max(zs)
        }`
};

export function DevelopmentEnvironment() {
  const [activeTemplate, setActiveTemplate] = useState<keyof typeof TEMPLATES>('javascript');
  const [code, setCode] = useState(TEMPLATES.javascript);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([
    '$ Development Environment Ready',
    '$ IntelliSense: Enabled',
    '$ Git: Connected to repository',
    '$ CEP Panel Preview: Available'
  ]);

  const handleTemplateChange = (template: keyof typeof TEMPLATES) => {
    setActiveTemplate(template);
    setCode(TEMPLATES[template]);
  };

  const runCode = () => {
    const output = `$ Running ${activeTemplate} code...`;
    setTerminalOutput(prev => [...prev, output, '$ Execution completed successfully']);
    setShowTerminal(true);
  };

  const saveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template.${activeTemplate === 'python' ? 'py' : 'js'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0d]">
      {/* Toolbar */}
      <div className="h-12 bg-[#1a1a1a] border-b border-[#333333] flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <select
            value={activeTemplate}
            onChange={(e) => handleTemplateChange(e.target.value as keyof typeof TEMPLATES)}
            className="px-3 py-1 bg-[#2a2a2a] border border-[#333333] rounded text-sm"
          >
            <option value="javascript">JavaScript ES2022</option>
            <option value="python">Python 3.9+</option>
            <option value="photoshop">Photoshop ExtendScript</option>
            <option value="aftereffects">After Effects ExtendScript</option>
          </select>

          <div className="w-px h-6 bg-[#333333]" />

          <Button variant="primary" size="sm" onClick={runCode}>
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>

          <Button variant="ghost" size="sm" onClick={saveCode}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>

          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <GitBranch className="w-4 h-4 mr-1" />
            main
          </Button>

          <Button 
            variant={showTerminal ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setShowTerminal(!showTerminal)}
          >
            <Terminal className="w-4 h-4 mr-1" />
            Terminal
          </Button>

          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className={`flex-1 ${showTerminal ? 'h-1/2' : ''}`}>
        <Editor
          height="100%"
          language={activeTemplate === 'python' ? 'python' : 'javascript'}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            fontSize: 16,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true }
          }}
        />
      </div>

      {/* Terminal */}
      {showTerminal && (
        <div className="h-1/2 bg-[#0a0a0a] border-t border-[#333333] flex flex-col">
          <div className="h-8 bg-[#1a1a1a] border-b border-[#333333] flex items-center px-3">
            <Terminal className="w-4 h-4 mr-2 text-[#00d4aa]" />
            <span className="text-sm font-medium">Terminal</span>
            <div className="ml-auto flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-6 h-6 p-0"
                onClick={() => setTerminalOutput([])}
              >
                Clear
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-6 h-6 p-0"
                onClick={() => setShowTerminal(false)}
              >
                ×
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 font-mono text-sm text-[#00d4aa]">
            {terminalOutput.map((line, index) => (
              <div key={index} className="mb-1">{line}</div>
            ))}
            <div className="flex items-center">
              <span className="text-[#00d4aa]">$ </span>
              <input 
                type="text" 
                className="flex-1 bg-transparent border-none outline-none text-[#00d4aa] ml-1"
                placeholder="Enter command..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="h-6 bg-[#1a1a1a] border-t border-[#333333] flex items-center justify-between px-3 text-xs text-[#a0a0a0]">
        <div className="flex items-center space-x-4">
          <span>Line 1, Column 1</span>
          <span>UTF-8</span>
          <span>{activeTemplate === 'python' ? 'Python' : 'JavaScript'}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>IntelliSense: Ready</span>
          <span>Git: Clean</span>
          <span>CEP: Connected</span>
        </div>
      </div>
    </div>
  );
}