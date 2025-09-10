/*
 * LetterBlack GenAI - After Effects Host Script
 * ExtendScript for Adobe After Effects integration
 * Version: 2.0.2
 */

// CEP Host Script for LetterBlack GenAI Extension
#include "json2.js"

// Global namespace for the extension
if (typeof com == "undefined") var com = {};
if (typeof com.letterblack == "undefined") com.letterblack = {};
if (typeof com.letterblack.genai == "undefined") com.letterblack.genai = {};

(function() {
    'use strict';
    
    var genai = com.letterblack.genai;
    
    /**
     * Initialize the host script
     */
    genai.init = function() {
        try {
            // Verify After Effects is available
            if (typeof app === "undefined") {
                return { success: false, error: "After Effects application not available" };
            }
            
            // Set up basic ExtendScript environment
            app.beginUndoGroup("LetterBlack GenAI Initialization");
            
            return { 
                success: true, 
                message: "LetterBlack GenAI Host Script Initialized",
                version: "2.0.2",
                ae_version: app.version
            };
            
        } catch (error) {
            return { 
                success: false, 
                error: "Host initialization failed: " + error.toString() 
            };
        } finally {
            app.endUndoGroup();
        }
    };
    
    /**
     * Get project information
     */
    genai.getProjectInfo = function() {
        try {
            if (!app.project) {
                return { success: false, error: "No project open" };
            }
            
            var project = app.project;
            var info = {
                success: true,
                projectName: project.file ? project.file.name : "Untitled Project",
                numItems: project.numItems,
                activeItem: project.activeItem ? project.activeItem.name : null,
                duration: project.activeItem ? project.activeItem.duration : 0,
                frameRate: project.activeItem ? project.activeItem.frameRate : 30,
                workAreaStart: project.activeItem ? project.activeItem.workAreaStart : 0,
                workAreaDuration: project.activeItem ? project.activeItem.workAreaDuration : 0
            };
            
            return info;
            
        } catch (error) {
            return { 
                success: false, 
                error: "Failed to get project info: " + error.toString() 
            };
        }
    };
    
    /**
     * Execute ExtendScript code
     */
    genai.executeScript = function(scriptCode) {
        try {
            app.beginUndoGroup("LetterBlack GenAI Script Execution");
            
            // Basic security check - prevent dangerous operations
            if (scriptCode.indexOf("$.system") !== -1 || 
                scriptCode.indexOf("system.callSystem") !== -1 ||
                scriptCode.indexOf("File.execute") !== -1) {
                return { 
                    success: false, 
                    error: "Script contains potentially dangerous operations" 
                };
            }
            
            // Execute the script
            var result = eval(scriptCode);
            
            return { 
                success: true, 
                result: result ? result.toString() : "Script executed successfully",
                message: "Script executed successfully"
            };
            
        } catch (error) {
            return { 
                success: false, 
                error: "Script execution failed: " + error.toString(),
                line: error.line || "unknown"
            };
        } finally {
            app.endUndoGroup();
        }
    };
    
    /**
     * Add text layer with specified properties
     */
    genai.addTextLayer = function(text, properties) {
        try {
            if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
                return { success: false, error: "No active composition" };
            }
            
            app.beginUndoGroup("Add Text Layer");
            
            var comp = app.project.activeItem;
            var textLayer = comp.layers.addText(text || "Sample Text");
            var textDocument = textLayer.property("Source Text").value;
            
            // Apply properties if provided
            if (properties) {
                if (properties.fontSize) textDocument.fontSize = properties.fontSize;
                if (properties.fillColor) textDocument.fillColor = properties.fillColor;
                if (properties.font) textDocument.font = properties.font;
            }
            
            textLayer.property("Source Text").setValue(textDocument);
            
            return { 
                success: true, 
                message: "Text layer added successfully",
                layerName: textLayer.name
            };
            
        } catch (error) {
            return { 
                success: false, 
                error: "Failed to add text layer: " + error.toString() 
            };
        } finally {
            app.endUndoGroup();
        }
    };
    
    /**
     * Get selected layers information
     */
    genai.getSelectedLayers = function() {
        try {
            if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
                return { success: false, error: "No active composition" };
            }
            
            var comp = app.project.activeItem;
            var selectedLayers = comp.selectedLayers;
            var layerInfo = [];
            
            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                layerInfo.push({
                    name: layer.name,
                    index: layer.index,
                    enabled: layer.enabled,
                    locked: layer.locked,
                    shy: layer.shy,
                    inPoint: layer.inPoint,
                    outPoint: layer.outPoint,
                    startTime: layer.startTime,
                    stretch: layer.stretch
                });
            }
            
            return { 
                success: true, 
                layers: layerInfo,
                count: selectedLayers.length
            };
            
        } catch (error) {
            return { 
                success: false, 
                error: "Failed to get selected layers: " + error.toString() 
            };
        }
    };
    
    /**
     * Apply expression to selected properties
     */
    genai.applyExpression = function(expression, propertyName) {
        try {
            if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
                return { success: false, error: "No active composition" };
            }
            
            app.beginUndoGroup("Apply Expression");
            
            var comp = app.project.activeItem;
            var selectedLayers = comp.selectedLayers;
            var appliedCount = 0;
            
            if (selectedLayers.length === 0) {
                return { success: false, error: "No layers selected" };
            }
            
            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                
                try {
                    var property = null;
                    
                    // Common property shortcuts
                    switch (propertyName) {
                        case "position":
                            property = layer.property("Transform").property("Position");
                            break;
                        case "scale":
                            property = layer.property("Transform").property("Scale");
                            break;
                        case "rotation":
                            property = layer.property("Transform").property("Rotation");
                            break;
                        case "opacity":
                            property = layer.property("Transform").property("Opacity");
                            break;
                        default:
                            // Try to find property by name
                            property = layer.property(propertyName);
                            break;
                    }
                    
                    if (property && property.canSetExpression) {
                        property.expression = expression;
                        appliedCount++;
                    }
                } catch (layerError) {
                    // Continue with other layers if one fails
                    continue;
                }
            }
            
            return { 
                success: true, 
                message: "Expression applied to " + appliedCount + " properties",
                appliedCount: appliedCount
            };
            
        } catch (error) {
            return { 
                success: false, 
                error: "Failed to apply expression: " + error.toString() 
            };
        } finally {
            app.endUndoGroup();
        }
    };
    
    /**
     * Test function to verify host script is working
     */
    genai.test = function() {
        return { 
            success: true, 
            message: "LetterBlack GenAI Host Script is working correctly",
            timestamp: new Date().toString(),
            ae_build: app.buildNumber
        };
    };
    
})();

// Auto-initialize when script loads
com.letterblack.genai.init();
