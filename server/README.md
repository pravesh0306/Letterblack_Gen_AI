# Local Server Orchestrator

A comprehensive local development server architecture that manages multiple backend services with real-time connection monitoring.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend UI (React)                      │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ Connection      │    │ Main Workspace                  │ │
│  │ Status Monitor  │    │ (Canvas, Chat, Creative Apps)   │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │ WebSocket + HTTP
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Local Server Orchestrator (Node.js)           │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ Service Manager │    │ Real-time Monitor               │ │
│  │ - Auto-start    │    │ - Health checks                 │ │
│  │ - Dependencies  │    │ - Status broadcast              │ │
│  │ - Process mgmt  │    │ - Reconnection logic            │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Managed Services                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │ LM Studio   │ │ ComfyUI     │ │ File Processor Service  │ │
│  │ Port: 1234  │ │ Port: 8188  │ │ Port: 3002              │ │
│  │ AI Models   │ │ Image Gen   │ │ Asset Management        │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install main server dependencies
npm install

# Install service dependencies
npm run install-services
```

### 2. Start the Orchestrator
```bash
# Start main server (auto-starts other services)
npm start

# Or for development with auto-reload
npm run dev
```

### 3. Verify Services
- **Main Server**: http://localhost:3001
- **LM Studio**: http://localhost:1234
- **ComfyUI**: http://localhost:8188
- **File Processor**: http://localhost:3002

## 📊 Service Management

### Auto-Start Sequence
1. **File Processor Service** (Port 3002)
2. **LM Studio** (Port 1234) 
3. **ComfyUI** (Port 8188)

### Health Monitoring
- **Interval**: Every 10 seconds
- **Timeout**: 5 seconds per service
- **Reconnection**: Automatic with exponential backoff

### API Endpoints

#### Service Control
```bash
# Get all service status
GET /api/services/status

# Start a service
POST /api/services/{serviceName}/start

# Stop a service
POST /api/services/{serviceName}/stop
```

#### File Processing
```bash
# Process uploaded files
POST /api/files/process

# Confirm assets
POST /api/assets/confirm
```

## 🔧 Configuration

### Service Paths
Edit `main.js` to configure service paths:

```javascript
// LM Studio paths (auto-detected)
const lmStudioPaths = [
  'C:\\Users\\%USERNAME%\\AppData\\Local\\LM Studio\\LM Studio.exe',
  '/Applications/LM Studio.app/Contents/MacOS/LM Studio',
  'lm-studio'
];

// ComfyUI paths
const comfyPaths = [
  'python ComfyUI/main.py',
  'python3 ComfyUI/main.py',
  './ComfyUI/main.py'
];
```

### Port Configuration
```javascript
this.services = {
  mainServer: { port: 3001 },
  lmStudio: { port: 1234 },
  comfyUI: { port: 8188 },
  fileProcessor: { port: 3002 }
};
```

## 🔌 WebSocket Events

### Client → Server
- `services:start` - Start a service
- `services:stop` - Stop a service
- `services:refresh` - Refresh status

### Server → Client
- `services:status` - Initial status data
- `services:update` - Service status change
- `services:error` - Service error notification

## 🛠️ Development

### Adding New Services
1. Add service configuration to `services` object
2. Implement start/stop logic in `startService()`/`stopService()`
3. Add health check URL to `checkAllServices()`
4. Update UI service icons and names

### Custom File Processing
Extend `file-processor.js`:
```javascript
async processCustomFormat(file) {
  // Your custom processing logic
  return {
    processed: true,
    customData: {}
  };
}
```

## 🔍 Troubleshooting

### Common Issues

**Services won't start:**
- Check if ports are already in use
- Verify installation paths
- Check console logs for detailed errors

**Connection issues:**
- Ensure firewall allows local connections
- Check if services are running on correct ports
- Verify WebSocket connection in browser dev tools

**File processing errors:**
- Check upload directory permissions
- Verify file size limits
- Ensure supported file formats

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* npm start
```

## 📈 Monitoring

The UI provides real-time monitoring with:
- **Service Status**: Connected/Disconnected/Starting/Error
- **Health Indicators**: Green/Yellow/Red status
- **Last Update Times**: When each service was last checked
- **Error Messages**: Detailed error information
- **Manual Controls**: Start/Stop individual services

## 🔒 Security Notes

- Services run locally only
- No external network access required
- File uploads limited to safe formats
- Process isolation for each service
- Graceful shutdown handling

## 📝 License

MIT License - See LICENSE file for details