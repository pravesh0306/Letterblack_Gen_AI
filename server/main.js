const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class LocalServerOrchestrator {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      path: '/socket.io/',
      cors: {
        origin: (origin, callback) => {
          // Allow WebContainer origins and localhost
          if (!origin || 
              origin.includes('localhost') || 
              origin.includes('webcontainer-api.io') ||
              origin.includes('local-credentialless')) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ["GET", "POST"]
      }
    });
    
    this.services = {
      mainServer: { status: 'running', port: 3001, process: null },
      lmStudio: { status: 'disconnected', port: 1234, process: null, url: 'http://localhost:1234' },
      comfyUI: { status: 'disconnected', port: 8188, process: null, url: 'http://localhost:8188' },
      fileProcessor: { status: 'disconnected', port: 3002, process: null }
    };
    
    this.connectedClients = new Set();
    this.healthCheckInterval = null;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
    this.startHealthChecks();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  setupRoutes() {
    // Service management endpoints
    this.app.get('/api/services/status', (req, res) => {
      res.json(this.services);
    });

    this.app.post('/api/services/:serviceName/start', async (req, res) => {
      const { serviceName } = req.params;
      try {
        await this.startService(serviceName);
        res.json({ success: true, message: `${serviceName} started` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/services/:serviceName/stop', async (req, res) => {
      const { serviceName } = req.params;
      try {
        await this.stopService(serviceName);
        res.json({ success: true, message: `${serviceName} stopped` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // File processing endpoints
    this.app.post('/api/files/process', async (req, res) => {
      try {
        const result = await this.processFiles(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Asset confirmation endpoints
    this.app.post('/api/assets/confirm', async (req, res) => {
      try {
        const result = await this.confirmAssets(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      this.connectedClients.add(socket.id);
      
      // Send current service status
      socket.emit('services:status', this.services);
      
      socket.on('services:start', async (serviceName) => {
        try {
          await this.startService(serviceName);
        } catch (error) {
          socket.emit('services:error', { service: serviceName, error: error.message });
        }
      });

      socket.on('services:stop', async (serviceName) => {
        try {
          await this.stopService(serviceName);
        } catch (error) {
          socket.emit('services:error', { service: serviceName, error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        this.connectedClients.delete(socket.id);
      });
    });
  }

  async startService(serviceName) {
    const service = this.services[serviceName];
    if (!service) throw new Error(`Service ${serviceName} not found`);

    switch (serviceName) {
      case 'lmStudio':
        return this.startLMStudio();
      case 'comfyUI':
        return this.startComfyUI();
      case 'fileProcessor':
        return this.startFileProcessor();
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  async stopService(serviceName) {
    const service = this.services[serviceName];
    if (!service) throw new Error(`Service ${serviceName} not found`);

    if (service.process) {
      service.process.kill();
      service.process = null;
    }
    
    service.status = 'stopped';
    this.broadcastServiceUpdate(serviceName, service);
  }

  async startLMStudio() {
    try {
      // Check if LM Studio is already running
      const response = await axios.get('http://localhost:1234/v1/models', { timeout: 5000 });
      this.services.lmStudio.status = 'connected';
      this.broadcastServiceUpdate('lmStudio', this.services.lmStudio);
      return;
    } catch (error) {
      // LM Studio not running, attempt to start it
    }

    const lmStudioPaths = [
      'C:\\Users\\%USERNAME%\\AppData\\Local\\LM Studio\\LM Studio.exe',
      '/Applications/LM Studio.app/Contents/MacOS/LM Studio',
      'lm-studio' // If in PATH
    ];

    for (const lmPath of lmStudioPaths) {
      try {
        const process = spawn(lmPath, ['--server'], { detached: true });
        this.services.lmStudio.process = process;
        this.services.lmStudio.status = 'starting';
        this.broadcastServiceUpdate('lmStudio', this.services.lmStudio);
        
        // Wait for startup
        await this.waitForService('http://localhost:1234/v1/models', 30000);
        this.services.lmStudio.status = 'connected';
        this.broadcastServiceUpdate('lmStudio', this.services.lmStudio);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not start LM Studio. Please ensure it is installed.');
  }

  async startComfyUI() {
    const comfyPaths = [
      'python ComfyUI/main.py',
      'python3 ComfyUI/main.py',
      './ComfyUI/main.py'
    ];

    for (const command of comfyPaths) {
      try {
        const process = spawn('cmd', ['/c', command], { 
          shell: true, 
          detached: true,
          cwd: process.cwd()
        });
        
        this.services.comfyUI.process = process;
        this.services.comfyUI.status = 'starting';
        this.broadcastServiceUpdate('comfyUI', this.services.comfyUI);
        
        // Wait for ComfyUI to start
        await this.waitForService('http://localhost:8188', 45000);
        this.services.comfyUI.status = 'connected';
        this.broadcastServiceUpdate('comfyUI', this.services.comfyUI);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not start ComfyUI. Please ensure it is installed and Python is available.');
  }

  async startFileProcessor() {
    try {
      const process = spawn('node', ['file-processor.js'], {
        cwd: path.join(__dirname, 'services'),
        detached: true
      });
      
      this.services.fileProcessor.process = process;
      this.services.fileProcessor.status = 'starting';
      this.broadcastServiceUpdate('fileProcessor', this.services.fileProcessor);
      
      await this.waitForService('http://localhost:3002/health', 10000);
      this.services.fileProcessor.status = 'connected';
      this.broadcastServiceUpdate('fileProcessor', this.services.fileProcessor);
    } catch (error) {
      throw new Error('Could not start File Processor service');
    }
  }

  async waitForService(url, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        await axios.get(url, { timeout: 5000 });
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error(`Service at ${url} did not start within ${timeout}ms`);
  }

  startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllServices();
    }, 10000); // Check every 10 seconds
  }

  async checkAllServices() {
    for (const [serviceName, service] of Object.entries(this.services)) {
      if (serviceName === 'mainServer') continue;
      
      const previousStatus = service.status;
      
      try {
        if (service.url) {
          await axios.get(service.url.includes('/v1/models') ? service.url : `${service.url}/health`, { 
            timeout: 5000 
          });
          service.status = 'connected';
        }
      } catch (error) {
        service.status = 'disconnected';
      }
      
      if (previousStatus !== service.status) {
        this.broadcastServiceUpdate(serviceName, service);
      }
    }
  }

  broadcastServiceUpdate(serviceName, serviceData) {
    this.io.emit('services:update', { 
      service: serviceName, 
      data: serviceData,
      timestamp: new Date().toISOString()
    });
  }

  async processFiles(fileData) {
    // File processing logic
    return {
      success: true,
      processedFiles: fileData.files?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  async confirmAssets(assetData) {
    // Asset confirmation logic
    return {
      success: true,
      confirmedAssets: assetData.assets?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  start(port = 3001) {
    this.server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Local Server Orchestrator running on port ${port}`);
      console.log(`📊 WebSocket server ready for real-time monitoring`);
      console.log(`🔧 Service management API available at http://localhost:${port}/api`);
      
      // Auto-start essential services
      this.autoStartServices();
    });
  }

  async autoStartServices() {
    console.log('🔄 Auto-starting essential services...');
    
    // Start services in sequence with proper dependencies
    const startupSequence = ['fileProcessor', 'lmStudio', 'comfyUI'];
    
    for (const serviceName of startupSequence) {
      try {
        console.log(`Starting ${serviceName}...`);
        await this.startService(serviceName);
        console.log(`✅ ${serviceName} started successfully`);
      } catch (error) {
        console.log(`❌ Failed to start ${serviceName}: ${error.message}`);
      }
    }
  }

  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Stop all managed services
    Object.entries(this.services).forEach(([name, service]) => {
      if (service.process) {
        service.process.kill();
      }
    });
    
    this.server.close();
  }
}

// Start the orchestrator
const orchestrator = new LocalServerOrchestrator();
orchestrator.start(3001);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Local Server Orchestrator...');
  orchestrator.stop();
  process.exit(0);
});

module.exports = LocalServerOrchestrator;