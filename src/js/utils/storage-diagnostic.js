/**
 * Storage Diagnostic Tool
 * Checks the status of ChatStorageManager and chatStore
 */

(function() {
    'use strict';

    function diagnoseStorage() {
        console.log('🔍 === STORAGE DIAGNOSTIC ===');
        
        // Check BrowserChatStore class
        console.log('BrowserChatStore class:', typeof window.BrowserChatStore);
        if (window.BrowserChatStore) {
            console.log('BrowserChatStore prototype:', Object.getOwnPropertyNames(window.BrowserChatStore.prototype));
        }
        
        // Check chatStore instance
        console.log('window.chatStore:', window.chatStore);
        console.log('chatStore type:', typeof window.chatStore);
        if (window.chatStore) {
            console.log('chatStore constructor:', window.chatStore.constructor.name);
            console.log('chatStore methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.chatStore)));
        }
        
        // Check ChatStorageManager class
        console.log('ChatStorageManager class available:', typeof ChatStorageManager);
        
        // Check chatStorageManager instance
        console.log('window.chatStorageManager:', window.chatStorageManager);
        console.log('chatStorageManager type:', typeof window.chatStorageManager);
        if (window.chatStorageManager) {
            console.log('chatStorageManager constructor:', window.chatStorageManager.constructor.name);
            console.log('chatStorageManager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.chatStorageManager)));
        }
        
        // Test functionality
        if (window.chatStore) {
            try {
                console.log('Testing chatStore.getConversationList():', window.chatStore.getConversationList());
            } catch (e) {
                console.error('Error calling getConversationList():', e);
            }
        }
        
        if (window.chatStorageManager) {
            try {
                console.log('Testing chatStorageManager.getStorageInfo():', window.chatStorageManager.getStorageInfo());
            } catch (e) {
                console.error('Error calling getStorageInfo():', e);
            }
        }
        
        console.log('=== END STORAGE DIAGNOSTIC ===');
    }
    
    // Make available globally
    window.diagnoseStorage = diagnoseStorage;
    
    // Auto-run after a short delay to ensure all scripts have loaded
    setTimeout(() => {
        console.log('📋 Auto-running storage diagnostic...');
        diagnoseStorage();
    }, 2000);
    
})();
