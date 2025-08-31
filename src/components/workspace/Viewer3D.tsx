import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Sphere, Environment, PerspectiveCamera } from '@react-three/drei';
import { useDropzone } from 'react-dropzone';
import { Upload, RotateCcw, ZoomIn, ZoomOut, Move, Eye, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { useWorkspaceStore } from '../../store/workspaceStore';

// Sample 3D objects for demonstration
function SampleModel({ position, color, type }: { position: [number, number, number], color: string, type: 'box' | 'sphere' }) {
  const meshRef = useRef<any>();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      {type === 'box' ? <boxGeometry args={[1, 1, 1]} /> : <sphereGeometry args={[0.5, 32, 32]} />}
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <SampleModel position={[-2, 0, 0]} color="#007ACC" type="box" />
      <SampleModel position={[2, 0, 0]} color="#FF6B35" type="sphere" />
      <SampleModel position={[0, 2, 0]} color="#28A745" type="box" />
      <Grid args={[20, 20]} />
    </>
  );
}

export function Viewer3D() {
  const { models, addModel } = useWorkspaceStore();
  const [viewMode, setViewMode] = useState<'perspective' | 'orthographic'>('perspective');
  const [showGrid, setShowGrid] = useState(true);
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high'>('medium');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newModel = {
          id: `model_${Date.now()}`,
          name: file.name,
          format: file.name.split('.').pop() || '',
          size: file.size / (1024 * 1024), // Convert to MB
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
      'model/*': ['.obj', '.fbx', '.stl', '.ply', '.gltf', '.glb', '.3ds', '.dae']
    },
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0d] relative">
      {/* Toolbar */}
      <div className="h-10 bg-[#1a1a1a] border-b border-[#333333] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-xs">
            <Eye className="w-4 h-4 mr-1" />
            {viewMode === 'perspective' ? 'Perspective' : 'Orthographic'}
          </Button>
          <Button 
            variant={showGrid ? 'primary' : 'ghost'} 
            size="sm" 
            onClick={() => setShowGrid(!showGrid)}
            className="text-xs"
          >
            Grid
          </Button>
          <select 
            value={renderQuality}
            onChange={(e) => setRenderQuality(e.target.value as any)}
            className="px-2 py-1 bg-[#2a2a2a] border border-[#333333] rounded text-xs text-white"
          >
            <option value="low">Low Quality</option>
            <option value="medium">Medium Quality</option>
            <option value="high">High Quality</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#a0a0a0]">
            Models: {models.length} | Vertices: {models.reduce((sum, m) => sum + m.metadata.vertices, 0).toLocaleString()}
          </span>
          <Button variant="ghost" size="sm" title="Reset View">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ background: '#0d0d0d' }}
        >
          <Suspense fallback={null}>
            <Scene />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxDistance={50}
              minDistance={1}
            />
            <Environment preset="studio" />
          </Suspense>
        </Canvas>

        {/* Drop Zone Overlay */}
        <div
          {...getRootProps()}
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
            isDragActive 
              ? 'bg-[#007ACC]/20 border-2 border-dashed border-[#007ACC]' 
              : 'pointer-events-none'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive && (
            <div className="text-center">
              <Upload className="w-12 h-12 text-[#007ACC] mx-auto mb-2" />
              <p className="text-lg font-medium text-white">Drop 3D models here</p>
              <p className="text-sm text-[#a0a0a0]">Supports OBJ, FBX, STL, PLY, GLTF, GLB, 3DS, DAE</p>
            </div>
          )}
        </div>

        {/* Navigation Help */}
        <div className="absolute bottom-4 left-4 bg-[#1a1a1a]/90 rounded p-3 text-xs text-[#a0a0a0]">
          <div className="space-y-1">
            <div><kbd className="px-1 py-0.5 bg-[#2a2a2a] rounded">Left Click + Drag</kbd> Rotate</div>
            <div><kbd className="px-1 py-0.5 bg-[#2a2a2a] rounded">Right Click + Drag</kbd> Pan</div>
            <div><kbd className="px-1 py-0.5 bg-[#2a2a2a] rounded">Scroll</kbd> Zoom</div>
          </div>
        </div>

        {/* Performance Monitor */}
        <div className="absolute top-4 right-4 bg-[#1a1a1a]/90 rounded p-2 text-xs text-[#a0a0a0]">
          <div>FPS: 60</div>
          <div>Draw Calls: 12</div>
          <div>Memory: 45MB</div>
        </div>
      </div>
    </div>
  );
}