# Chat Storage System Documentation

## Overview

The chat storage system provides robust, OS-correct, persistent storage for chat history in the Adobe After Effects CEP extension. It stores data in proper user data directories and includes features like automatic rotation, atomic writes, and secret redaction.

## Architecture

### Storage Locations

The system automatically detects the OS and stores data in appropriate locations:

**Windows:**
```
C:\Users\<USERNAME>\AppData\Roaming\Letterblack\AEChatExtension\
├── ChatLogs/
│   ├── chat_history.json           # Active conversation log
│   ├── chat_history.20250831.json  # Rotated archive
│   └── chat_history.20250831.1.json # Additional archives
└── settings.json                   # User preferences
```

**macOS:**
```
~/Library/Application Support/Letterblack/AEChatExtension/
├── ChatLogs/
│   ├── chat_history.json
│   └── [archived files]
└── settings.json
```

### Data Schema

All chat data follows this JSON structure:

```json
{
  "version": 1,
  "conversations": [
    {
      "id": "uuid-v4",
      "createdAt": "2025-08-31T09:00:00.000Z",
      "updatedAt": "2025-08-31T09:05:00.000Z",
      "title": "Default Thread",
      "messages": [
        {
          "id": "uuid-v4",
          "role": "user|assistant|system",
          "text": "Message content",
          "meta": {
            "model": "gpt-4o|gemini|local",
            "tokens": 123,
            "latencyMs": 350,
            "aeContext": {
              "projectName": "My Project",
              "comp": "Main Comp"
            }
          },
          "timestamp": "2025-08-31T09:01:02.345Z"
        }
      ]
    }
  ]
}
```

## Core Components

### 1. ChatStore (`storage/chatStore.js`)

The main storage module with the following APIs:

**Core Functions:**
- `getPaths()` - Get OS-appropriate file paths
- `ensureDirs()` - Create directories if they don't exist
- `loadChat()` - Load chat data from disk
- `saveChat(data)` - Save chat data with atomic writes
- `rotateIfNeeded(maxBytes)` - Rotate log files when they get too large

**Conversation Management:**
- `createConversation(title)` - Create new conversation
- `appendMessage(conversationId, message)` - Add message to conversation
- `getConversation(id)` - Get specific conversation
- `getConversationList()` - Get list of all conversations

**Utilities:**
- `clearAll()` - Clear all history (with backup)
- `exportToFile(path)` - Export data to specific file
- `getStorageStats()` - Get storage usage statistics

### 2. Storage Integration (`js/storage-integration.js`)

UI integration layer that:
- Automatically initializes storage on page load
- Wires up UI elements (send button, clear button, etc.)
- Handles message display and conversation switching
- Provides toast notifications for user feedback
- Integrates with existing AI modules

### 3. Test Suite (`storage/chatStore.test.js`)

Comprehensive test coverage including:
- Directory creation and path resolution
- Data structure validation
- Message creation and persistence
- Secret redaction
- File rotation
- Performance testing (100 messages)

## Features

### Security & Reliability

**Atomic Writes:**
- All writes use temp files + rename for atomic operations
- Prevents data corruption if write is interrupted

**Secret Redaction:**
- Automatically redacts `apiKey`, `token`, `password`, `secret` fields
- Protects sensitive information from being stored

**Error Handling:**
- Graceful fallbacks for corrupted data
- User-visible error messages via toast notifications
- Console logging for debugging

### Performance

**Write Queue:**
- Prevents concurrent write conflicts
- Processes writes sequentially
- Background write operations don't block UI

**File Rotation:**
- Automatically rotates files when they exceed 2MB (configurable)
- Maintains archived conversations for history
- Prevents single file from becoming too large

### User Experience

**Cross-Platform:**
- Works on Windows and macOS
- Uses appropriate user data directories
- No admin permissions required

**Data Persistence:**
- Survives browser restarts
- Survives computer reboots
- Persists until manually cleared

**Export/Import:**
- Export individual conversations
- Export all chat history
- JSON format for easy processing

## Integration Guide

### 1. Basic Usage

```javascript
// Storage is automatically initialized
const chatStore = require("../storage/chatStore");

// Create a conversation
const conversationId = chatStore.createConversation("My Chat");

// Add messages
await chatStore.appendMessage(conversationId, {
  role: "user",
  text: "Hello, AI!",
  meta: { model: "gpt-4" }
});

// Load all data
const chatData = chatStore.loadChat();
```

### 2. UI Integration

The storage system is automatically wired to:
- Send button (`#send-button`)
- Chat input (`#chat-input`)
- Clear history button (`#clear-history-btn`)
- Chat messages container (`#chat-messages`)

### 3. Event Handling

```javascript
// Access the global storage manager
window.chatStorageManager.initialize().then(() => {
  console.log("Storage ready!");
});

// Get storage information
const info = window.chatStorageManager.getStorageInfo();
console.log(`${info.conversationCount} conversations stored`);
```

## Configuration

### File Size Limits

Default rotation limit is 2MB. Change by calling:
```javascript
chatStore.rotateIfNeeded(5_000_000); // 5MB limit
```

### Storage Paths

Override for testing:
```javascript
// In test environment
const originalGetPaths = chatStore.getPaths;
chatStore.getPaths = () => ({
  base: "/path/to/test/dir",
  logsDir: "/path/to/test/dir/ChatLogs",
  active: "/path/to/test/dir/ChatLogs/chat_history.json",
  settings: "/path/to/test/dir/settings.json"
});
```

## Troubleshooting

### Common Issues

**Permission Errors:**
- Check that user has write access to AppData/Library directories
- Ensure no other process has files locked

**Data Corruption:**
- Storage system auto-recovers from corrupted files
- Check console for error messages
- Backup files are automatically created

**Performance Issues:**
- Monitor file sizes with `getStorageStats()`
- Force rotation with `rotateIfNeeded(1)` for testing
- Check console for write queue backlog

### Debugging

Enable verbose logging:
```javascript
// Check storage paths
console.log(chatStore.getPaths());

// Check storage statistics
console.log(chatStore.getStorageStats());

// Test write operations
chatStore.saveChat(chatStore.getDefaultData())
  .then(() => console.log("Write successful"))
  .catch(err => console.error("Write failed:", err));
```

## Testing

Run the test suite:
```bash
npm run test-storage
```

This tests:
- ✅ Directory creation on first run
- ✅ Conversation creation and message appending
- ✅ File rotation when size limit exceeded
- ✅ Secret redaction in stored data
- ✅ Data persistence across reloads
- ✅ Performance with 100 messages (< 5ms per message)

## Migration

### From localStorage

If you have existing localStorage chat data, you can migrate it:

```javascript
// Get old data
const oldData = JSON.parse(localStorage.getItem('ae_chat_history') || '[]');

// Convert to new format
if (oldData.length > 0) {
  const conversationId = chatStore.createConversation("Migrated Chat");
  
  for (const oldMessage of oldData) {
    await chatStore.appendMessage(conversationId, {
      role: oldMessage.type === 'user' ? 'user' : 'assistant',
      text: oldMessage.text,
      meta: { migrated: true }
    });
  }
  
  // Clear old data
  localStorage.removeItem('ae_chat_history');
}
```

## Security Notes

1. **No secrets in logs** - API keys are automatically redacted
2. **User data only** - No writes to CEP installation directories
3. **Atomic operations** - Corruption-resistant file operations
4. **Local storage** - Data never leaves the user's machine

## Support

For issues or questions:
1. Check the console for error messages
2. Run the test suite to verify functionality
3. Check file permissions in user data directories
4. Contact: pravesh.pandey@letterblack.ae
