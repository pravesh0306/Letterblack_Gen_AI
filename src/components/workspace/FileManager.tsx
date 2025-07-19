import React, { useState, useCallback } from 'react';
import { 
  Folder, 
  File, 
  Grid, 
  List, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  ExternalLink,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const SUPPORTED_FORMATS = [
  { ext: 'obj', name: 'Wavefront OBJ', category: 'both', maxSize: 100 },
  { ext: 'fbx', name: 'Autodesk FBX', category: 'both', maxSize: 100 },
  { ext: 'stl', name: 'STL', category: 'both', maxSize: 50 },
  { ext: 'ply', name: 'PLY', category: 'both', maxSize: 50 },
  { ext: 'gltf', name: 'glTF', category: 'both', maxSize: 100 },
  { ext: 'glb', name: 'glTF Binary', category: 'both', maxSize: 100 },
  { ext: '3ds', name: '3D Studio', category: 'import', maxSize: 50 },
  { ext: 'dae', name: 'COLLADA', category: 'both', maxSize: 100 }
];

export function FileManager() {
  const { models, addModel, removeModel, externalApps, openWithExternalApp } = useWorkspaceStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [showFormatLegend, setShowFormatLegend] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newModel = {
          id: `model_${Date.now()}_${Math.random()}`,
          name: file.name,
          format: file.name.split('.').pop()?.toLowerCase() || '',
          size: file.size / (1024 * 1024),
          url: reader.result as string,
          metadata: {
            vertices: Math.floor(Math.random() * 10000),
            faces: Math.floor(Math.random() * 5000),
            materials: Math.floor(Math.random() * 10),
            textures: []
          },
          createdAt: new Date(),
          modifiedAt: new Date()
        };
        addModel(newModel);
      };
      reader.readAsDataURL(file);
    });
  }, [addModel]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/*': SUPPORTED_FORMATS.map(f => `.${f.ext}`)
    },
    maxSize: 100 * 1024 * 1024
  });

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormat === 'all' || model.format === selectedFormat;
    return matchesSearch && matchesFormat;
  });

  const formatCounts = models.reduce((acc, model) => {
    acc[model.format] = (acc[model.format] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0d]">
      {/* Toolbar */}
      <div className="h-12 bg-[#1a1a1a] border-b border-[#333333] flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#707070]" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64 h-8"
            />
          </div>
          
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-3 py-1 bg-[#2a2a2a] border border-[#333333] rounded text-sm"
          >
            <option value="all">All Formats ({models.length})</option>
            {Object.entries(formatCounts).map(([format, count]) => (
              <option key={format} value={format}>
                {format.toUpperCase()} ({count})
              </option>
            ))}
          </select>

          <Button
            variant={showFormatLegend ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowFormatLegend(!showFormatLegend)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Formats
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-[#2a2a2a] rounded">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="primary" size="sm" {...getRootProps()}>
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
        </div>
      </div>

      {/* Format Legend */}
      {showFormatLegend && (
        <div className="bg-[#1a1a1a] border-b border-[#333333] p-4">
          <h3 className="text-sm font-medium mb-3">Supported Formats</h3>
          <div className="grid grid-cols-4 gap-3">
            {SUPPORTED_FORMATS.map((format) => (
              <div key={format.ext} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded ${
                  format.category === 'both' ? 'bg-[#28A745]' :
                  format.category === 'import' ? 'bg-[#007ACC]' : 'bg-[#FFC107]'
                }`} />
                <span className="text-xs font-mono">.{format.ext}</span>
                <span className="text-xs text-[#a0a0a0]">{format.name}</span>
                <span className="text-xs text-[#707070]">({format.maxSize}MB)</span>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-4 mt-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-[#28A745] rounded" />
              <span>Import & Export</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-[#007ACC] rounded" />
              <span>Import Only</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-[#FFC107] rounded" />
              <span>Export Only</span>
            </div>
          </div>
        </div>
      )}

      {/* File Grid/List */}
      <div className="flex-1 overflow-auto p-4">
        <input {...getInputProps()} />
        
        {isDragActive && (
          <div className="absolute inset-0 bg-[#007ACC]/20 border-2 border-dashed border-[#007ACC] flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="w-16 h-16 text-[#007ACC] mx-auto mb-4" />
              <p className="text-xl font-medium">Drop 3D files here</p>
              <p className="text-[#a0a0a0]">Supports {SUPPORTED_FORMATS.length} formats</p>
            </div>
          </div>
        )}

        {filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-[#707070] mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No files found</h3>
            <p className="text-[#a0a0a0] mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Import 3D models to get started'}
            </p>
            <Button variant="primary" {...getRootProps()}>
              <Upload className="w-4 h-4 mr-2" />
              Import Files
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-6 gap-4">
            {filteredModels.map((model) => (
              <div key={model.id} className="bg-[#1a1a1a] rounded border border-[#333333] p-3 hover:border-[#007ACC] transition-colors group">
                <div className="aspect-square bg-[#2a2a2a] rounded mb-2 flex items-center justify-center">
                  <File className="w-8 h-8 text-[#707070]" />
                </div>
                <h4 className="text-sm font-medium truncate mb-1">{model.name}</h4>
                <div className="text-xs text-[#a0a0a0] space-y-1">
                  <div>{model.format.toUpperCase()}</div>
                  <div>{model.size.toFixed(1)} MB</div>
                  <div>{model.metadata.vertices.toLocaleString()} vertices</div>
                </div>
                
                <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="w-6 h-6 p-0" title="Preview">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-6 h-6 p-0" title="Edit">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-6 h-6 p-0 text-[#DC3545]" 
                    title="Delete"
                    onClick={() => removeModel(model.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredModels.map((model) => (
              <div key={model.id} className="flex items-center space-x-3 p-2 hover:bg-[#1a1a1a] rounded group">
                <File className="w-5 h-5 text-[#707070] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium truncate">{model.name}</span>
                    <span className="text-xs text-[#a0a0a0] font-mono">{model.format.toUpperCase()}</span>
                    <span className="text-xs text-[#a0a0a0]">{model.size.toFixed(1)} MB</span>
                    <span className="text-xs text-[#a0a0a0]">{model.metadata.vertices.toLocaleString()} vertices</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {externalApps.filter(app => app.formats.includes(model.format)).map((app) => (
                    <Button
                      key={app.name}
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0"
                      title={`Open with ${app.name}`}
                      onClick={() => openWithExternalApp(model.id, app.name)}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  ))}
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-[#1a1a1a] border-t border-[#333333] flex items-center justify-between px-4 text-xs text-[#a0a0a0]">
        <span>{filteredModels.length} of {models.length} files</span>
        <span>Total size: {models.reduce((sum, m) => sum + m.size, 0).toFixed(1)} MB</span>
      </div>
    </div>
  );
}