const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

class FileProcessorService {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        try {
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        } catch (error) {
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    this.upload = multer({ 
      storage,
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
      fileFilter: (req, file, cb) => {
        // Accept common creative file formats
        const allowedTypes = /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|psd|ai|sketch|fig|blend|obj|fbx|gltf)$/i;
        if (allowedTypes.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file type'));
        }
      }
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        service: 'file-processor',
        timestamp: new Date().toISOString()
      });
    });

    // File upload and processing
    this.app.post('/process', this.upload.array('files', 10), async (req, res) => {
      try {
        const processedFiles = [];
        
        for (const file of req.files || []) {
          const processed = await this.processFile(file);
          processedFiles.push(processed);
        }

        res.json({
          success: true,
          processedFiles,
          totalFiles: processedFiles.length
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Asset confirmation
    this.app.post('/confirm-assets', async (req, res) => {
      try {
        const { assets } = req.body;
        const confirmed = await this.confirmAssets(assets);
        
        res.json({
          success: true,
          confirmedAssets: confirmed
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // File metadata extraction
    this.app.get('/metadata/:filename', async (req, res) => {
      try {
        const metadata = await this.extractMetadata(req.params.filename);
        res.json(metadata);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async processFile(file) {
    const metadata = {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      processedAt: new Date().toISOString()
    };

    // Add file-type specific processing
    if (file.mimetype.startsWith('image/')) {
      metadata.type = 'image';
      metadata.processing = await this.processImage(file);
    } else if (file.mimetype.startsWith('video/')) {
      metadata.type = 'video';
      metadata.processing = await this.processVideo(file);
    } else {
      metadata.type = 'document';
      metadata.processing = await this.processDocument(file);
    }

    return metadata;
  }

  async processImage(file) {
    // Image processing logic (resize, optimize, extract EXIF, etc.)
    return {
      dimensions: { width: 1920, height: 1080 }, // Placeholder
      format: path.extname(file.originalname).slice(1),
      optimized: true,
      thumbnailGenerated: true
    };
  }

  async processVideo(file) {
    // Video processing logic (extract frames, metadata, etc.)
    return {
      duration: 120, // Placeholder
      format: path.extname(file.originalname).slice(1),
      frameRate: 30,
      resolution: '1920x1080'
    };
  }

  async processDocument(file) {
    // Document processing logic
    return {
      format: path.extname(file.originalname).slice(1),
      processed: true
    };
  }

  async confirmAssets(assets) {
    const confirmed = [];
    
    for (const asset of assets || []) {
      try {
        const filePath = path.join(__dirname, '../uploads', asset.filename);
        const stats = await fs.stat(filePath);
        
        confirmed.push({
          ...asset,
          confirmed: true,
          size: stats.size,
          lastModified: stats.mtime
        });
      } catch (error) {
        confirmed.push({
          ...asset,
          confirmed: false,
          error: 'File not found'
        });
      }
    }
    
    return confirmed;
  }

  async extractMetadata(filename) {
    try {
      const filePath = path.join(__dirname, '../uploads', filename);
      const stats = await fs.stat(filePath);
      
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: path.extname(filename)
      };
    } catch (error) {
      throw new Error('File not found');
    }
  }

  start(port = 3002) {
    this.app.listen(port, () => {
      console.log(`📁 File Processor Service running on port ${port}`);
    });
  }
}

// Start the service
const fileProcessor = new FileProcessorService();
fileProcessor.start(3002);

module.exports = FileProcessorService;