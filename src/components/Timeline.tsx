import React, { useState, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from './ui/Button';
import { Slider } from './ui/Slider';

interface TimelineProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface TimelineItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'text';
  startTime: number;
  duration: number;
  color: string;
}

export function Timeline({ collapsed, onToggle }: TimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(120); // 2 minutes
  const [volume, setVolume] = useState(75);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sample timeline items
  const [timelineItems] = useState<TimelineItem[]>([
    {
      id: 'item1',
      name: 'LM Studio Output',
      type: 'text',
      startTime: 0,
      duration: 30,
      color: '#dc2626'
    },
    {
      id: 'item2',
      name: 'ComfyUI Generation',
      type: 'image',
      startTime: 25,
      duration: 45,
      color: '#dc2626'
    },
    {
      id: 'item3',
      name: 'Audio Processing',
      type: 'audio',
      startTime: 60,
      duration: 35,
      color: '#dc2626'
    },
    {
      id: 'item4',
      name: 'Final Render',
      type: 'video',
      startTime: 90,
      duration: 30,
      color: '#dc2626'
    }
  ]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * totalDuration;
    
    setCurrentTime(Math.max(0, Math.min(newTime, totalDuration)));
  }, [totalDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getItemPosition = (item: TimelineItem) => {
    const left = (item.startTime / totalDuration) * 100;
    const width = (item.duration / totalDuration) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  if (collapsed) {
    return (
      <div className="h-8 bg-[#1a1a1a] border-t border-[#333333] flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handlePlayPause} className="w-6 h-6 p-0">
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
          <span className="text-xs text-[#a0a0a0]">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
          <div className="w-32 h-1 bg-[#333333] rounded-full relative">
            <div 
              className="h-full bg-[#dc2626] rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={onToggle} className="w-6 h-6 p-0">
          <Maximize2 className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-48 bg-[#1a1a1a] border-t border-[#333333] flex flex-col">
      {/* Timeline Header */}
      <div className="h-10 bg-[#2a2a2a] border-b border-[#333333] flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-semibold">Timeline</h3>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleStop} className="w-6 h-6 p-0">
              <Square className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
              <SkipBack className="w-3 h-3" />
            </Button>
            <Button variant="primary" size="sm" onClick={handlePlayPause} className="w-6 h-6 p-0">
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
              <SkipForward className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-[#a0a0a0]" />
            <div className="w-16">
              <Slider
                value={volume}
                onChange={setVolume}
                min={0}
                max={100}
                className="h-1"
              />
            </div>
          </div>
          
          <span className="text-xs text-[#a0a0a0] font-mono">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
          
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
            <Settings className="w-3 h-3" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onToggle} className="w-6 h-6 p-0">
            <Minimize2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex">
        {/* Track Labels */}
        <div className="w-32 bg-[#2a2a2a] border-r border-[#333333] flex flex-col">
          <div className="h-8 border-b border-[#333333] flex items-center px-3">
            <span className="text-xs font-medium text-[#a0a0a0]">Tracks</span>
          </div>
          {['Text Output', 'Image Gen', 'Audio', 'Video'].map((track, index) => (
            <div key={track} className="h-8 border-b border-[#333333] flex items-center px-3">
              <span className="text-xs text-[#a0a0a0]">{track}</span>
            </div>
          ))}
        </div>

        {/* Timeline Tracks */}
        <div className="flex-1 relative">
          {/* Time Ruler */}
          <div className="h-8 bg-[#2a2a2a] border-b border-[#333333] relative">
            {Array.from({ length: 13 }, (_, i) => i * 10).map((time) => (
              <div
                key={time}
                className="absolute top-0 h-full flex flex-col justify-center"
                style={{ left: `${(time / totalDuration) * 100}%` }}
              >
                <div className="w-px h-2 bg-[#555555]" />
                <span className="text-xs text-[#a0a0a0] mt-1">{formatTime(time)}</span>
              </div>
            ))}
          </div>

          {/* Timeline Items */}
          <div 
            ref={timelineRef}
            className="flex-1 relative cursor-pointer"
            onClick={handleTimelineClick}
          >
            {timelineItems.map((item, trackIndex) => (
              <div
                key={item.id}
                className={`absolute h-8 rounded border-2 transition-all duration-200 ${
                  selectedItems.includes(item.id) 
                    ? 'border-white shadow-lg' 
                    : 'border-transparent hover:border-[#555555]'
                }`}
                style={{
                  ...getItemPosition(item),
                  top: `${(trackIndex % 4) * 32 + 32}px`,
                  backgroundColor: item.color,
                  opacity: 0.8
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItems(prev => 
                    prev.includes(item.id) 
                      ? prev.filter(id => id !== item.id)
                      : [...prev, item.id]
                  );
                }}
              >
                <div className="h-full flex items-center px-2">
                  <span className="text-xs font-medium text-white truncate">
                    {item.name}
                  </span>
                </div>
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            >
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Footer */}
      <div className="h-6 bg-[#2a2a2a] border-t border-[#333333] flex items-center justify-between px-4">
        <div className="flex items-center space-x-4 text-xs text-[#a0a0a0]">
          <span>{timelineItems.length} items</span>
          <span>{selectedItems.length} selected</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-[#a0a0a0]">
          <span>FPS: 30</span>
          <span>•</span>
          <span>Sample Rate: 48kHz</span>
        </div>
      </div>
    </div>
  );
}