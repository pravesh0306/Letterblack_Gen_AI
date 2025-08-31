// storage/demo.js
// Simple demonstration of the chat storage system

const chatStore = require("./chatStore");

async function runDemo() {
  console.log("🚀 Chat Storage Demo");
  console.log("==================");

  try {
    // 1. Initialize storage
    console.log("\n1. Initializing storage...");
    chatStore.ensureDirs();
    const paths = chatStore.getPaths();
    console.log(`📁 Storage location: ${paths.logsDir}`);

    // 2. Create a conversation
    console.log("\n2. Creating conversation...");
    const conversationId = chatStore.createConversation("Demo Conversation");
    console.log(`✅ Created conversation: ${conversationId}`);

    // 3. Add some messages
    console.log("\n3. Adding messages...");
    
    await chatStore.appendMessage(conversationId, {
      role: "user",
      text: "Hello! Can you help me with After Effects expressions?",
      meta: {
        model: "gemini-2.5-flash",
        aeContext: {
          projectName: "Demo Project",
          comp: "Main Comp"
        }
      }
    });

    await chatStore.appendMessage(conversationId, {
      role: "assistant", 
      text: "Of course! I'd be happy to help you with After Effects expressions. What specific effect or animation are you trying to achieve?",
      meta: {
        model: "gemini-2.5-flash",
        tokens: 156,
        latencyMs: 850
      }
    });

    await chatStore.appendMessage(conversationId, {
      role: "user",
      text: "I want to create a wiggle expression for a text layer that responds to audio levels.",
      meta: {
        model: "gemini-2.5-flash",
        aeContext: {
          selectedLayer: "Text Layer 1",
          property: "Position"
        }
      }
    });

    console.log("✅ Added 3 messages to conversation");

    // 4. Load and display the conversation
    console.log("\n4. Loading conversation...");
    const conversation = chatStore.getConversation(conversationId);
    
    if (conversation) {
      console.log(`📖 Conversation: "${conversation.title}"`);
      console.log(`🕒 Created: ${conversation.createdAt}`);
      console.log(`💬 Messages: ${conversation.messages.length}`);
      
      conversation.messages.forEach((msg, index) => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        console.log(`   ${index + 1}. [${time}] ${msg.role}: ${msg.text.substring(0, 50)}...`);
      });
    }

    // 5. Get storage statistics
    console.log("\n5. Storage statistics...");
    const stats = chatStore.getStorageStats();
    console.log(`📊 Active file size: ${(stats.activeFileSize / 1024).toFixed(2)} KB`);
    console.log(`🗃️ Archive files: ${stats.archiveCount}`);
    console.log(`💾 Total storage: ${(stats.totalSize / 1024).toFixed(2)} KB`);

    // 6. List all conversations
    console.log("\n6. All conversations...");
    const conversations = chatStore.getConversationList();
    conversations.forEach(conv => {
      console.log(`   • ${conv.title} (${conv.messageCount} messages) - ${new Date(conv.updatedAt).toLocaleDateString()}`);
    });

    // 7. Demonstrate secret redaction
    console.log("\n7. Testing secret redaction...");
    await chatStore.appendMessage(conversationId, {
      role: "system",
      text: "API configuration message",
      meta: {
        apiKey: "secret-api-key-123",
        token: "bearer-token-xyz",
        publicData: "this should remain visible"
      }
    });
    
    // Verify redaction worked
    const updatedConv = chatStore.getConversation(conversationId);
    const lastMessage = updatedConv.messages[updatedConv.messages.length - 1];
    console.log(`🔒 API key redacted: ${lastMessage.meta.apiKey}`);
    console.log(`🔒 Token redacted: ${lastMessage.meta.token}`);
    console.log(`👁️ Public data preserved: ${lastMessage.meta.publicData}`);

    console.log("\n🎉 Demo completed successfully!");
    console.log(`\n📂 You can find your chat files at:\n   ${paths.logsDir}`);

  } catch (error) {
    console.error("❌ Demo failed:", error.message);
  }
}

// Export for testing
module.exports = { runDemo };

// Run demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}
