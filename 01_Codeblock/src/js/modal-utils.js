// Modal Dialog Utilities for CEP Panel
// Replaces native browser prompts with integrated UI modals

class ModalUtils {
    constructor() {
        this.activeModal = null;
        this.createModalContainer();
    }
    
    createModalContainer() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('modal-container')) {
            const container = document.createElement('div');
            container.id = 'modal-container';
            container.innerHTML = `
                <div class="modal-overlay" id="modal-overlay">
                    <div class="modal-dialog" id="modal-dialog">
                        <div class="modal-header">
                            <h3 class="modal-title" id="modal-title">Title</h3>
                            <button class="modal-close" id="modal-close">&times;</button>
                        </div>
                        <div class="modal-body" id="modal-body">
                            Content goes here
                        </div>
                        <div class="modal-footer" id="modal-footer">
                            <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
                            <button class="btn btn-primary" id="modal-confirm">OK</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(container);
            
            // Add modal styles
            this.addModalStyles();
            
            // Bind close events
            this.bindModalEvents();
        }
    }
    
    addModalStyles() {
        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 10000;
                    backdrop-filter: blur(2px);
                }
                
                .modal-dialog {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #2d2d30;
                    border: 1px solid #464647;
                    border-radius: 8px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                    min-width: 320px;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow: hidden;
                    animation: modalFadeIn 0.2s ease-out;
                }
                
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translate(-50%, -60%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #464647;
                    background: #383838;
                }
                
                .modal-title {
                    margin: 0;
                    color: #cccccc;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    color: #cccccc;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                }
                
                .modal-close:hover {
                    background: #464647;
                }
                
                .modal-body {
                    padding: 20px;
                    color: #cccccc;
                    overflow-y: auto;
                    max-height: 60vh;
                }
                
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 16px 20px;
                    border-top: 1px solid #464647;
                    background: #383838;
                }
                
                .modal-input {
                    width: 100%;
                    padding: 8px 12px;
                    background: #1e1e1e;
                    border: 1px solid #464647;
                    border-radius: 4px;
                    color: #cccccc;
                    font-family: inherit;
                    margin-bottom: 12px;
                }
                
                .modal-input:focus {
                    outline: none;
                    border-color: #0e639c;
                }
                
                .modal-textarea {
                    width: 100%;
                    min-height: 80px;
                    resize: vertical;
                    padding: 8px 12px;
                    background: #1e1e1e;
                    border: 1px solid #464647;
                    border-radius: 4px;
                    color: #cccccc;
                    font-family: inherit;
                    margin-bottom: 12px;
                }
                
                .modal-textarea:focus {
                    outline: none;
                    border-color: #0e639c;
                }
                
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 14px;
                    transition: background-color 0.2s;
                }
                
                .btn-primary {
                    background: #0e639c;
                    color: white;
                }
                
                .btn-primary:hover {
                    background: #1177bb;
                }
                
                .btn-secondary {
                    background: #464647;
                    color: #cccccc;
                }
                
                .btn-secondary:hover {
                    background: #525253;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    bindModalEvents() {
        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        
        const closeModal = () => this.hideModal();
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // ESC key support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                closeModal();
            }
        });
    }
    
    showModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.style.display = 'flex';
        this.activeModal = true;
        
        // Focus first input if available
        setTimeout(() => {
            const firstInput = overlay.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    hideModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.style.display = 'none';
        this.activeModal = false;
    }
    
    // Promisified prompt replacement
    prompt(title, message, defaultValue = '', placeholder = '') {
        return new Promise((resolve) => {
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const confirmBtn = document.getElementById('modal-confirm');
            const cancelBtn = document.getElementById('modal-cancel');
            
            titleEl.textContent = title;
            bodyEl.innerHTML = `
                <p>${message}</p>
                <input type="text" class="modal-input" id="modal-input" 
                       value="${defaultValue}" placeholder="${placeholder}">
            `;
            
            const input = document.getElementById('modal-input');
            
            const handleConfirm = () => {
                const value = input.value.trim();
                this.hideModal();
                resolve(value || null);
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                input.removeEventListener('keypress', handleKeyPress);
            };
            
            const handleCancel = () => {
                this.hideModal();
                resolve(null);
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                input.removeEventListener('keypress', handleKeyPress);
            };
            
            const handleKeyPress = (e) => {
                if (e.key === 'Enter') handleConfirm();
            };
            
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            input.addEventListener('keypress', handleKeyPress);
            
            this.showModal();
        });
    }
    
    // Promisified confirm replacement
    confirm(title, message) {
        return new Promise((resolve) => {
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const confirmBtn = document.getElementById('modal-confirm');
            const cancelBtn = document.getElementById('modal-cancel');
            
            titleEl.textContent = title;
            bodyEl.innerHTML = `<p>${message}</p>`;
            
            const handleConfirm = () => {
                this.hideModal();
                resolve(true);
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };
            
            const handleCancel = () => {
                this.hideModal();
                resolve(false);
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };
            
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            
            this.showModal();
        });
    }
    
    // Alert replacement
    alert(title, message) {
        return new Promise((resolve) => {
            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const confirmBtn = document.getElementById('modal-confirm');
            const footerEl = document.getElementById('modal-footer');
            
            titleEl.textContent = title;
            bodyEl.innerHTML = `<p>${message}</p>`;
            
            // Hide cancel button for alerts
            footerEl.innerHTML = '<button class="btn btn-primary" id="modal-ok">OK</button>';
            const okBtn = document.getElementById('modal-ok');
            
            const handleOk = () => {
                this.hideModal();
                resolve();
                okBtn.removeEventListener('click', handleOk);
            };
            
            okBtn.addEventListener('click', handleOk);
            
            this.showModal();
        });
    }
}

// Global modal instance
window.modalUtils = new ModalUtils();
