import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, FileText, Code } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/Button';

interface FileUploadAreaProps {
  onClose: () => void;
}

export function FileUploadArea({ onClose }: FileUploadAreaProps) {
  const { settings, addAttachment } = useChatStore();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.size > settings.maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is ${settings.maxFileSize / 1024 / 1024}MB`);
        continue;
      }

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[file.name] || 0;
            if (currentProgress >= 100) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [file.name]: currentProgress + 10 };
          });
        }, 100);

        await addAttachment(file);
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 1000);
      } catch (error) {
        console.error('Failed to upload file:', error);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  }, [addAttachment, settings.maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md', '.json', '.csv'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/javascript': ['.js'],
      'text/javascript': ['.js'],
      'application/typescript': ['.ts'],
      'text/x-python': ['.py'],
      'application/json': ['.json']
    },
    maxSize: settings.maxFileSize
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.includes('text') || type.includes('json')) return <FileText className="w-4 h-4" />;
    if (type.includes('javascript') || type.includes('python')) return <Code className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const supportedFormats = [
    { category: 'Documents', formats: ['PDF', 'DOC', 'DOCX', 'TXT', 'MD'] },
    { category: 'Images', formats: ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'] },
    { category: 'Code', formats: ['JS', 'TS', 'PY', 'JSON', 'CSV'] }
  ];

  return (
    <div className="border-t border-[#333333] bg-[#1a1a1a] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Upload Files</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="w-6 h-6 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-[#007ACC] bg-[#007ACC]/10'
            : 'border-[#333333] hover:border-[#555555]'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-[#707070] mx-auto mb-2" />
        <p className="text-sm font-medium mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-xs text-[#a0a0a0]">
          or click to browse • Max {settings.maxFileSize / 1024 / 1024}MB per file
        </p>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Uploading...</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-[#333333] rounded-full h-1">
                <div
                  className="bg-[#007ACC] h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supported Formats */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Supported Formats</h4>
        <div className="grid grid-cols-3 gap-3">
          {supportedFormats.map((category) => (
            <div key={category.category} className="space-y-1">
              <h5 className="text-xs font-medium text-[#a0a0a0]">{category.category}</h5>
              <div className="flex flex-wrap gap-1">
                {category.formats.map((format) => (
                  <span
                    key={format}
                    className="px-1.5 py-0.5 bg-[#333333] rounded text-xs"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}