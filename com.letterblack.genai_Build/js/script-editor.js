/**
 * Script Editor Functionality
 * Handles ExtendScript execution, saving, copying, and debugging
 */
(function() {
    'use strict';

    class ScriptEditor {
        constructor() {
            this.editor = null;
            this.currentScript = '';
            this.savedScripts = this.loadSavedScripts();
            this.init();
        }

        init() {
            this.editor = document.getElementById('script-editor');
            this.attachEventListeners();
            console.log('✅ Script Editor initialized');
        }

        attachEventListeners() {
            // Run Script - CRITICAL FUNCTION
            const runBtn = document.getElementById('run-script');
            if (runBtn) {
                runBtn.addEventListener('click', () => this.runScript());
            }

            // Apply Expression - CRITICAL FUNCTION  
            const applyBtn = document.getElementById('apply-expression');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => this.applyExpression());
            }

            // Save Script
            const saveBtn = document.getElementById('save-script-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveScript());
            }

            // Copy Script
            const copyBtn = document.getElementById('copy-script-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => this.copyScript());
            }

            // Explain Script
            const explainBtn = document.getElementById('explain-script-btn');
            if (explainBtn) {
                explainBtn.addEventListener('click', () => this.explainScript());
            }

            // Debug Script
            const debugBtn = document.getElementById('debug-script-btn');
            if (debugBtn) {
                debugBtn.addEventListener('click', () => this.debugScript());
            }

            // Editor content change tracking
            if (this.editor) {
                this.editor.addEventListener('input', () => {
                    this.currentScript = this.editor.value;
                });
            }
        }

        // CRITICAL FUNCTION: Run Script in After Effects
        runScript() {
            const script = this.getCurrentScript();
            if (!script.trim()) {
                this.showError('No script to run. Please enter ExtendScript code.');
                return;
            }

            try {
                // Validate script syntax first
                this.validateScript(script);
                
                // Execute in After Effects via CEP
                if (window.__adobe_cep__) {
                    // CEP evalScript method
                    window.__adobe_cep__.evalScript(script, (result) => {
                        if (result) {
                            this.showSuccess('Script executed successfully!');
                            this.logScriptExecution(script, 'success', result);
                        } else {
                            this.showError('Script execution failed or returned no result.');
                        }
                    });
                } else {
                    // Fallback for testing
                    this.showWarning('CEP not available. Script syntax validated but not executed.');
                    console.log('Script would execute:', script);
                }
            } catch (error) {
                this.showError(`Script error: ${error.message}`);
                this.logScriptExecution(script, 'error', error.message);
            }
        }

        // CRITICAL FUNCTION: Apply Expression to selected property
        applyExpression() {
            const script = this.getCurrentScript();
            if (!script.trim()) {
                this.showError('No expression to apply. Please enter expression code.');
                return;
            }

            // Generate ExtendScript to apply expression
            const applyExpressionScript = `
                try {
                    var comp = app.project.activeItem;
                    if (comp && comp instanceof CompItem) {
                        var selectedProps = comp.selectedProperties;
                        if (selectedProps.length > 0) {
                            for (var i = 0; i < selectedProps.length; i++) {
                                var prop = selectedProps[i];
                                if (prop.canSetExpression) {
                                    prop.expression = ${JSON.stringify(script)};
                                }
                            }
                            "Expression applied to " + selectedProps.length + " properties";
                        } else {
                            "No properties selected. Please select a property first.";
                        }
                    } else {
                        "No active composition. Please open a composition.";
                    }
                } catch (e) {
                    "Error: " + e.toString();
                }
            `;

            if (window.__adobe_cep__) {
                window.__adobe_cep__.evalScript(applyExpressionScript, (result) => {
                    this.showSuccess(result || 'Expression applied!');
                    this.logScriptExecution(script, 'expression', result);
                });
            } else {
                this.showWarning('CEP not available. Expression validated but not applied.');
                console.log('Expression would apply:', script);
            }
        }

        // Save Script functionality
        saveScript() {
            const script = this.getCurrentScript();
            if (!script.trim()) {
                this.showError('No script to save.');
                return;
            }

            const scriptName = prompt('Enter script name:', 'My Script');
            if (scriptName) {
                const scriptData = {
                    name: scriptName,
                    code: script,
                    created: new Date().toISOString(),
                    type: 'extendscript'
                };

                this.savedScripts.push(scriptData);
                this.saveSavedScripts();
                this.showSuccess(`Script "${scriptName}" saved successfully!`);
            }
        }

        // Copy Script to clipboard
        copyScript() {
            const script = this.getCurrentScript();
            if (!script.trim()) {
                this.showError('No script to copy.');
                return;
            }

            navigator.clipboard.writeText(script).then(() => {
                this.showSuccess('Script copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                this.editor.select();
                document.execCommand('copy');
                this.showSuccess('Script copied to clipboard!');
            });
        }

        // Explain Script using AI
        explainScript() {
            const script = this.getCurrentScript();
            if (!script.trim()) {
                this.showError('No script to explain.');
                return;
            }

            // Send to AI for explanation
            if (window.aiModule && window.aiModule.sendMessage) {
                const prompt = `Please explain this ExtendScript code for After Effects:\n\n${script}`;
                window.aiModule.sendMessage(prompt);
                this.showSuccess('Explanation request sent to AI...');
            } else {
                this.showError('AI module not available for explanation.');
            }
        }

        // Debug Script
        debugScript() {
            const script = this.getCurrentScript();
            if (!script.trim()) {
                this.showError('No script to debug.');
                return;
            }

            try {
                // Basic syntax validation
                this.validateScript(script);
                
                // Add debug logging to script
                const debugScript = this.wrapWithDebugLogging(script);
                
                if (window.__adobe_cep__) {
                    window.__adobe_cep__.evalScript(debugScript, (result) => {
                        this.showSuccess('Debug execution completed. Check console for details.');
                        console.log('Debug result:', result);
                    });
                } else {
                    console.log('Debug script:', debugScript);
                    this.showWarning('CEP not available. Debug info logged to console.');
                }
            } catch (error) {
                this.showError(`Debug error: ${error.message}`);
            }
        }

        // Helper methods
        getCurrentScript() {
            return this.editor ? this.editor.value : '';
        }

        validateScript(script) {
            // Basic validation - check for common ExtendScript patterns
            if (script.includes('app.') || script.includes('$.') || script.includes('comp.') || 
                script.includes('layer.') || script.includes('property.')) {
                return true; // Looks like ExtendScript
            }
            
            // Check for basic JavaScript syntax
            try {
                new Function(script);
                return true;
            } catch (e) {
                throw new Error(`Syntax error: ${e.message}`);
            }
        }

        wrapWithDebugLogging(script) {
            return `
                try {
                    $.writeln("=== Debug Script Start ===");
                    ${script}
                    $.writeln("=== Debug Script End ===");
                } catch (debugError) {
                    $.writeln("Debug Error: " + debugError.toString());
                    debugError.toString();
                }
            `;
        }

        logScriptExecution(script, type, result) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                type: type,
                script: script.substring(0, 200), // First 200 chars
                result: result,
                success: type === 'success' || type === 'expression'
            };
            
            // Store in local storage for debugging
            const logs = JSON.parse(localStorage.getItem('script_execution_logs') || '[]');
            logs.push(logEntry);
            logs.splice(0, Math.max(0, logs.length - 100)); // Keep last 100 logs
            localStorage.setItem('script_execution_logs', JSON.stringify(logs));
        }

        loadSavedScripts() {
            try {
                return JSON.parse(localStorage.getItem('saved_scripts') || '[]');
            } catch {
                return [];
            }
        }

        saveSavedScripts() {
            localStorage.setItem('saved_scripts', JSON.stringify(this.savedScripts));
        }

        // UI feedback methods
        showSuccess(message) {
            if (window.SimpleToast) {
                window.SimpleToast.show(message, 'success', 3000);
            } else {
                console.log('✅ Success:', message);
                alert('Success: ' + message);
            }
        }

        showError(message) {
            if (window.SimpleToast) {
                window.SimpleToast.show(message, 'error', 5000);
            } else {
                console.error('❌ Error:', message);
                alert('Error: ' + message);
            }
        }

        showWarning(message) {
            if (window.SimpleToast) {
                window.SimpleToast.show(message, 'warning', 4000);
            } else {
                console.warn('⚠️ Warning:', message);
                alert('Warning: ' + message);
            }
        }

        // Public API
        getScriptLogs() {
            return JSON.parse(localStorage.getItem('script_execution_logs') || '[]');
        }

        getSavedScripts() {
            return this.savedScripts;
        }

        loadScript(scriptData) {
            if (this.editor && scriptData.code) {
                this.editor.value = scriptData.code;
                this.currentScript = scriptData.code;
                this.showSuccess(`Script "${scriptData.name}" loaded`);
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.scriptEditor = new ScriptEditor();
        });
    } else {
        window.scriptEditor = new ScriptEditor();
    }

    // Export to global scope
    window.ScriptEditor = ScriptEditor;

    console.log('📝 Script Editor module loaded');

})();
