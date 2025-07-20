import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Server, 
  Database, 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/Button';
import io, { Socket } from 'socket.io-client';

interface ServiceStatus {
  status: 'connected' | 'disconnected' | 'starting' | 'stopping' | 'error';
  port: number;
  process: any;
  url?: string;
  lastUpdate?: string;
  error?: string;
}

interface Services {
  mainServer: ServiceStatus;
  lmStudio: ServiceStatus;
  comfyUI: ServiceStatus;
  fileProcessor: ServiceStatus;
}

export function ConnectionStatus() {
  const [services, setServices] = useState<Services>({
    mainServer: { status: 'disconnected', port: 3001, process: null },
    lmStudio: { status: 'disconnected', port: 1234, process: null },
    comfyUI: { status: 'disconnected', port: 8188, process: null },
    fileProcessor: { status: 'disconnected', port: 3002, process: null }
  });
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'degraded' | 'critical'>('critical');

  useEffect(() => {
    // Dynamically construct the WebSocket server URL for webcontainer compatibility
    const getSocketUrl = () => {
      const hostname = window.location.hostname;
      const protocol = 'http:'; // Force HTTP protocol for WebSocket connection
      
      // Check if we're in a webcontainer environment (hostname contains port pattern)
      if (hostname.includes('--') && hostname.includes('webcontainer')) {
        // Replace the port in the hostname with 3001
        const parts = hostname.split('--');
        if (parts.length >= 3) {
          parts[1] = '3001'; // Replace port with 3001
          const newHostname = parts.join('--');
          return `${protocol}//${newHostname}`;
        }
      }
      
      // Fallback for local development
      return `${protocol}//${hostname}:3001`;
    };

    // Initialize socket connection
    const newSocket = io(getSocketUrl(), {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    newSocket.on('connect', () => {
      console.log('Connected to Local Server Orchestrator');
      setServices(prev => ({
        ...prev,
        mainServer: { ...prev.mainServer, status: 'connected' }
      }));
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Local Server Orchestrator');
      setServices(prev => ({
        ...prev,
        mainServer: { ...prev.mainServer, status: 'disconnected' }
      }));
    });

    newSocket.on('services:status', (servicesData: Services) => {
      setServices(servicesData);
    });

    newSocket.on('services:update', ({ service, data, timestamp }) => {
      setServices(prev => ({
        ...prev,
        [service]: { ...data, lastUpdate: timestamp }
      }));
    });

    newSocket.on('services:error', ({ service, error }) => {
      setServices(prev => ({
        ...prev,
        [service]: { ...prev[service], status: 'error', error }
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    // Calculate overall connection health
    const connectedServices = Object.values(services).filter(s => s.status === 'connected').length;
    const totalServices = Object.keys(services).length;
    
    if (connectedServices === totalServices) {
      setConnectionHealth('healthy');
    } else if (connectedServices >= totalServices / 2) {
      setConnectionHealth('degraded');
    } else {
      setConnectionHealth('critical');
    }
  }, [services]);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'starting':
        return <Clock className="w-3 h-3 text-yellow-400 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="w-3 h-3 text-red-400" />;
      case 'error':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return <WifiOff className="w-3 h-3 text-gray-400" />;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'mainServer':
        return <Server className="w-4 h-4" />;
      case 'lmStudio':
        return <Cpu className="w-4 h-4" />;
      case 'comfyUI':
        return <Database className="w-4 h-4" />;
      case 'fileProcessor':
        return <Database className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const getHealthColor = () => {
    switch (connectionHealth) {
      case 'healthy':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
    }
  };

  const startService = (serviceName: string) => {
    if (socket) {
      socket.emit('services:start', serviceName);
    }
  };

  const stopService = (serviceName: string) => {
    if (socket) {
      socket.emit('services:stop', serviceName);
    }
  };

  const refreshStatus = () => {
    if (socket) {
      socket.emit('services:refresh');
    }
  };

  const getServiceDisplayName = (serviceName: string) => {
    switch (serviceName) {
      case 'mainServer':
        return 'Main Server';
      case 'lmStudio':
        return 'LM Studio';
      case 'comfyUI':
        return 'ComfyUI';
      case 'fileProcessor':
        return 'File Processor';
      default:
        return serviceName;
    }
  };

  return (
    <div className="fixed top-10 left-2 z-40">
      {/* Compact Status Indicator */}
      <div
        className={`flex items-center space-x-2 bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 ${
          isExpanded ? 'rounded-b-none' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Wifi className={`w-4 h-4 ${getHealthColor()}`} />
        <span className="text-xs font-medium">
          {Object.values(services).filter(s => s.status === 'connected').length}/
          {Object.keys(services).length}
        </span>
        <div className={`w-2 h-2 rounded-full ${
          connectionHealth === 'healthy' ? 'bg-green-400' :
          connectionHealth === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
        } animate-pulse`} />
      </div>

      {/* Expanded Status Panel */}
      {isExpanded && (
        <div className="bg-[#1a1a1a] border border-[#333333] border-t-0 rounded-b-lg p-3 min-w-80 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Service Status</h3>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshStatus}
                className="w-6 h-6 p-0"
                title="Refresh Status"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 p-0"
                title="Collapse"
              >
                ×
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(services).map(([serviceName, service]) => (
              <div
                key={serviceName}
                className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded border border-[#333333]"
              >
                <div className="flex items-center space-x-3">
                  {getServiceIcon(serviceName)}
                  <div>
                    <div className="text-sm font-medium">
                      {getServiceDisplayName(serviceName)}
                    </div>
                    <div className="text-xs text-[#a0a0a0]">
                      Port {service.port}
                      {service.lastUpdate && (
                        <span className="ml-2">
                          • {new Date(service.lastUpdate).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    {service.error && (
                      <div className="text-xs text-red-400 mt-1">
                        {service.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusIcon(service.status)}
                  <span className="text-xs capitalize">
                    {service.status}
                  </span>
                  
                  {serviceName !== 'mainServer' && (
                    <div className="flex space-x-1 ml-2">
                      {service.status === 'disconnected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startService(serviceName)}
                          className="w-6 h-6 p-0 text-green-400"
                          title="Start Service"
                        >
                          ▶
                        </Button>
                      )}
                      {(service.status === 'connected' || service.status === 'starting') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => stopService(serviceName)}
                          className="w-6 h-6 p-0 text-red-400"
                          title="Stop Service"
                        >
                          ⏹
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Overall Health Summary */}
          <div className="mt-3 pt-3 border-t border-[#333333]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#a0a0a0]">System Health:</span>
              <span className={`font-medium capitalize ${getHealthColor()}`}>
                {connectionHealth}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}