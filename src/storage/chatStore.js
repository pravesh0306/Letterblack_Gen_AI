// storage/chatStore.js
// Robust, OS-correct chat history storage for CEP panel
const fs = require("fs");
const path = require("path");
const os = require("os");

const VENDOR = "Letterblack";
const APP = "AEChatExtension";

// In-memory write lock to prevent concurrent writes
let isWriting = false;
const writeQueue = [];

/**
 * Get OS-appropriate base data directory
 * Windows: C:\Users\<USER>\AppData\Roaming\Letterblack\AEChatExtension\
 * macOS: ~/Library/Application Support/Letterblack/AEChatExtension/
 */
function getBaseDataDir() {
  const home = os.homedir();
  if (process.platform === "win32") {
    return path.join(home, "AppData", "Roaming", VENDOR, APP);
  }
  return path.join(home, "Library", "Application Support", VENDOR, APP);
}

/**
 * Get all required file paths
 */
function getPaths() {
  const base = getBaseDataDir();
  const logsDir = path.join(base, "ChatLogs");
  return {
    base,
    logsDir,
    active: path.join(logsDir, "chat_history.json"),
    settings: path.join(base, "settings.json")
  };
}

/**
 * Ensure all required directories exist
 */
function ensureDirs() {
  const { base, logsDir } = getPaths();
  [base, logsDir].forEach(p => {
    if (!fs.existsSync(p)) {
      try {
        fs.mkdirSync(p, { recursive: true });
        console.log(`✅ Created directory: ${p}`);
      } catch (error) {
        console.error(`❌ Failed to create directory ${p}:`, error.message);
        throw error;
      }
    }
  });
}

/**
 * Get default chat data structure
 */
function getDefaultData() {
  return {
    version: 1,
    conversations: []
  };
}

/**
 * Safe JSON file reader with error handling
 */
function readJSON(file) {
  try {
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`⚠️ Failed to read JSON from ${file}:`, error.message);
    return null;
  }
}

/**
 * Atomic write: write to temp file, then rename
 * Prevents corruption if write is interrupted
 */
function atomicWrite(file, content) {
  const tmp = file + ".tmp";
  try {
    // Redact any API keys before writing
    const sanitized = redactSecrets(content);
    fs.writeFileSync(tmp, JSON.stringify(sanitized, null, 2), "utf-8");
    fs.renameSync(tmp, file);
    console.log(`✅ Atomic write successful: ${file}`);
  } catch (error) {
    // Clean up temp file if it exists
    if (fs.existsSync(tmp)) {
      try { fs.unlinkSync(tmp); } catch {}
    }
    console.error(`❌ Atomic write failed for ${file}:`, error.message);
    throw error;
  }
}

/**
 * Redact sensitive information before saving
 */
function redactSecrets(data) {
  const sanitized = JSON.parse(JSON.stringify(data)); // Deep clone
  
  if (sanitized.conversations) {
    sanitized.conversations.forEach(conv => {
      if (conv.messages) {
        conv.messages.forEach(msg => {
          if (msg.meta) {
            // Redact common secret fields
            if (msg.meta.apiKey) msg.meta.apiKey = "REDACTED";
            if (msg.meta.token) msg.meta.token = "REDACTED";
            if (msg.meta.password) msg.meta.password = "REDACTED";
            if (msg.meta.secret) msg.meta.secret = "REDACTED";
          }
        });
      }
    });
  }
  
  return sanitized;
}

/**
 * Load chat data from disk
 */
function loadChat() {
  try {
    ensureDirs();
    const { active } = getPaths();
    const data = readJSON(active);
    return data || getDefaultData();
  } catch (error) {
    console.error("❌ Failed to load chat data:", error.message);
    return getDefaultData();
  }
}

/**
 * Save chat data with write queue to prevent concurrent writes
 */
function saveChat(data) {
  return new Promise((resolve, reject) => {
    writeQueue.push({ data, resolve, reject });
    processWriteQueue();
  });
}

/**
 * Process queued writes sequentially
 */
async function processWriteQueue() {
  if (isWriting || writeQueue.length === 0) return;
  
  isWriting = true;
  
  while (writeQueue.length > 0) {
    const { data, resolve, reject } = writeQueue.shift();
    
    try {
      ensureDirs();
      const { active } = getPaths();
      atomicWrite(active, data);
      resolve();
    } catch (error) {
      console.error("❌ Save failed:", error.message);
      reject(error);
    }
  }
  
  isWriting = false;
}

/**
 * Rotate log file if it exceeds size limit
 */
function rotateIfNeeded(maxBytes = 2_000_000) {
  try {
    const { active, logsDir } = getPaths();
    
    if (!fs.existsSync(active)) return false;
    
    const stat = fs.statSync(active);
    if (stat.size < maxBytes) return false;
    
    // Create timestamped backup
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const dst = path.join(logsDir, `chat_history.${stamp}.json`);
    
    // If backup already exists, add time suffix
    let finalDst = dst;
    let counter = 1;
    while (fs.existsSync(finalDst)) {
      finalDst = path.join(logsDir, `chat_history.${stamp}.${counter}.json`);
      counter++;
    }
    
    fs.copyFileSync(active, finalDst);
    atomicWrite(active, getDefaultData());
    
    console.log(`🔄 Rotated chat log: ${finalDst}`);
    return true;
  } catch (error) {
    console.error("❌ Log rotation failed:", error.message);
    return false;
  }
}

/**
 * Create a new conversation
 */
function createConversation(title = "New Conversation") {
  try {
    const data = loadChat();
    const { randomUUID } = require("crypto");
    const id = randomUUID();
    const now = new Date().toISOString();
    
    data.conversations.push({
      id,
      createdAt: now,
      updatedAt: now,
      title,
      messages: []
    });
    
    saveChat(data);
    console.log(`✅ Created conversation: ${title} (${id})`);
    return id;
  } catch (error) {
    console.error("❌ Failed to create conversation:", error.message);
    throw error;
  }
}

/**
 * Append message to existing conversation
 */
async function appendMessage(conversationId, message) {
  try {
    const data = loadChat();
    const conv = data.conversations.find(c => c.id === conversationId);
    
    if (!conv) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    const { randomUUID } = require("crypto");
    const now = new Date().toISOString();
    
    // Validate message structure
    if (!message.role || !message.text) {
      throw new Error("Message must have 'role' and 'text' properties");
    }
    
    const newMessage = {
      id: randomUUID(),
      role: message.role,
      text: message.text,
      meta: message.meta || {},
      timestamp: now
    };
    
    conv.messages.push(newMessage);
    conv.updatedAt = now;
    
    await saveChat(data);
    rotateIfNeeded();
    
    console.log(`✅ Message appended to conversation ${conversationId}`);
    return newMessage;
  } catch (error) {
    console.error("❌ Failed to append message:", error.message);
    throw error;
  }
}

/**
 * Clear all chat history (with backup)
 */
function clearAll() {
  try {
    ensureDirs();
    const { active, logsDir } = getPaths();
    
    // Create timestamped backup before clearing
    if (fs.existsSync(active)) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(logsDir, `chat_history.${stamp}.json`);
      fs.copyFileSync(active, backupPath);
      console.log(`💾 Backup created: ${backupPath}`);
    }
    
    atomicWrite(active, getDefaultData());
    console.log("🗑️ Chat history cleared");
    return true;
  } catch (error) {
    console.error("❌ Failed to clear chat history:", error.message);
    throw error;
  }
}

/**
 * Get conversation by ID
 */
function getConversation(conversationId) {
  try {
    const data = loadChat();
    return data.conversations.find(c => c.id === conversationId) || null;
  } catch (error) {
    console.error("❌ Failed to get conversation:", error.message);
    return null;
  }
}

/**
 * Get all conversations (metadata only, no messages)
 */
function getConversationList() {
  try {
    const data = loadChat();
    return data.conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages.length
    }));
  } catch (error) {
    console.error("❌ Failed to get conversation list:", error.message);
    return [];
  }
}

/**
 * Export chat data to user-specified location
 */
function exportToFile(filePath) {
  try {
    const data = loadChat();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`📤 Chat data exported to: ${filePath}`);
    return true;
  } catch (error) {
    console.error("❌ Export failed:", error.message);
    throw error;
  }
}

/**
 * Get storage statistics
 */
function getStorageStats() {
  try {
    const { active, logsDir } = getPaths();
    const stats = {
      activeFileExists: fs.existsSync(active),
      activeFileSize: 0,
      archiveCount: 0,
      totalSize: 0
    };
    
    if (stats.activeFileExists) {
      stats.activeFileSize = fs.statSync(active).size;
      stats.totalSize += stats.activeFileSize;
    }
    
    if (fs.existsSync(logsDir)) {
      const files = fs.readdirSync(logsDir);
      const archives = files.filter(f => f.startsWith("chat_history.") && f.endsWith(".json"));
      stats.archiveCount = archives.length;
      
      archives.forEach(file => {
        const filePath = path.join(logsDir, file);
        if (fs.existsSync(filePath)) {
          stats.totalSize += fs.statSync(filePath).size;
        }
      });
    }
    
    return stats;
  } catch (error) {
    console.error("❌ Failed to get storage stats:", error.message);
    return null;
  }
}

// Export all functions
module.exports = {
  // Core functions
  getPaths,
  ensureDirs,
  loadChat,
  saveChat,
  rotateIfNeeded,
  
  // Conversation management
  createConversation,
  appendMessage,
  clearAll,
  getConversation,
  getConversationList,
  
  // Utilities
  exportToFile,
  getStorageStats,
  getDefaultData,
  
  // For testing
  _internal: {
    readJSON,
    atomicWrite,
    redactSecrets
  }
};
