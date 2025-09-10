// Chat Auto-Scroll Enhancement
// Ensures proper scrolling behavior and message boundaries

(function() {
    'use strict';

    // Enhanced auto-scroll function
    function autoScrollToBottom(container, smooth = true) {
        if (!container) {return;}

        const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;

        if (smooth) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            container.scrollTop = container.scrollHeight;
        }
    }

    // Message boundary enforcement
    function enforceMessageBoundaries() {
        const chatMessages = document.querySelector('#chat-messages');
        if (!chatMessages) {return;}

        // Set explicit boundaries
        chatMessages.style.maxHeight = 'calc(100vh - 250px)';
        chatMessages.style.minHeight = '300px';
        chatMessages.style.overflowY = 'auto';
        chatMessages.style.overflowX = 'hidden';

        // Ensure proper word wrapping for all messages
        const messages = chatMessages.querySelectorAll('.message-content');
        messages.forEach(message => {
            message.style.wordBreak = 'break-word';
            message.style.overflowWrap = 'break-word';
            message.style.maxWidth = '100%';
            message.style.whiteSpace = 'pre-wrap';
        });
    }

    // Enhanced message appender with auto-scroll
    function appendMessage(type, content, timestamp = null) {
        const chatMessages = document.querySelector('#chat-messages');
        if (!chatMessages) {return;}

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;

        // Ensure proper text wrapping
        contentDiv.style.wordBreak = 'break-word';
        contentDiv.style.overflowWrap = 'break-word';
        contentDiv.style.maxWidth = '100%';

        messageDiv.appendChild(contentDiv);

        if (timestamp !== false) {
            const timestampDiv = document.createElement('div');
            timestampDiv.className = 'message-timestamp';
            timestampDiv.textContent = timestamp || new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            messageDiv.appendChild(timestampDiv);
        }

        chatMessages.appendChild(messageDiv);

        // Auto-scroll to new message
        setTimeout(() => autoScrollToBottom(chatMessages), 100);

        return messageDiv;
    }

    // Resize observer for dynamic height adjustment
    function setupResizeObserver() {
        const chatMessages = document.querySelector('#chat-messages');
        if (!chatMessages || !window.ResizeObserver) {return;}

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                // Maintain scroll position at bottom when window resizes
                autoScrollToBottom(entry.target, false);
            }
        });

        resizeObserver.observe(chatMessages);
    }

    // Initialize on DOM ready
    function initChatScrolling() {
        enforceMessageBoundaries();
        setupResizeObserver();

        // Auto-scroll on any new content
        const chatMessages = document.querySelector('#chat-messages');
        if (chatMessages) {
            const observer = new MutationObserver(() => {
                autoScrollToBottom(chatMessages);
            });

            observer.observe(chatMessages, {
                childList: true,
                subtree: true
            });
        }
    }

    // Expose utilities globally
    window.ChatScrollUtils = {
        autoScrollToBottom,
        enforceMessageBoundaries,
        appendMessage,
        initChatScrolling
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatScrolling);
    } else {
        initChatScrolling();
    }

})();
