// ExtendScript Bridge for After Effects
// This file enables communication between the CEP panel and After Effects

// Basic project info function
function getProjectInfo() {
    try {
        var result = {
            projectName: app.project.displayName || "Untitled Project",
            projectPath: app.project.file ? app.project.file.fsName : null,
            activeComp: app.project.activeItem ? app.project.activeItem.name : null,
            numComps: app.project.numItems,
            version: app.version
        };
        return JSON.stringify(result);
    } catch (e) {
        return JSON.stringify({ error: e.toString() });
    }
}

// Apply expression to selected properties - FIXED SIGNATURE
function applyExpression(expression) {
    try {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            return JSON.stringify({ 
                status: "error", 
                message: "No active composition" 
            });
        }
        
        var selectedProps = comp.selectedProperties;
        if (selectedProps.length === 0) {
            return JSON.stringify({ 
                status: "error", 
                message: "No properties selected" 
            });
        }
        
        app.beginUndoGroup("Apply Expression");
        
        for (var i = 0; i < selectedProps.length; i++) {
            if (selectedProps[i].canSetExpression) {
                selectedProps[i].expression = expression;
            }
        }
        
        app.endUndoGroup();
        return JSON.stringify({ 
            status: "success", 
            data: "Expression applied to " + selectedProps.length + " properties"
        });
    } catch (e) {
        return JSON.stringify({ 
            status: "error", 
            message: e.toString() 
        });
    }
}

// Apply expression to selected properties - LEGACY FUNCTION NAME
function applyExpressionToSelected(expression) {
    return applyExpression(expression);
}

// Create a new text layer
function createTextLayer(text) {
    try {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            return JSON.stringify({ error: "No active composition" });
        }
        
        app.beginUndoGroup("Create Text Layer");
        
        var textLayer = comp.layers.addText(text || "New Text Layer");
        textLayer.moveToBeginning();
        
        app.endUndoGroup();
        return JSON.stringify({ success: true, layerName: textLayer.name });
    } catch (e) {
        return JSON.stringify({ error: e.toString() });
    }
}
