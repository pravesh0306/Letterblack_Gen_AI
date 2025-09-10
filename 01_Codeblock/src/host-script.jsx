// LetterBlack AI Chat v2 - Host Script for After Effects
// This script runs in the After Effects context and handles communication with the extension panel

// Global object to handle extension communication
var letterBlackChat = {
    // Apply code to After Effects
    applyCode: function(code) {
        try {
            // Execute the code in After Effects context
            eval(code);
            return { success: true, message: "Code applied successfully" };
        } catch (error) {
            return { success: false, message: "Error applying code: " + error.toString() };
        }
    },

    // Get current composition info
    getCompInfo: function() {
        try {
            var comp = app.project.activeItem;
            if (comp && comp instanceof CompItem) {
                return {
                    name: comp.name,
                    width: comp.width,
                    height: comp.height,
                    duration: comp.duration,
                    frameRate: comp.frameRate
                };
            }
            return { error: "No active composition" };
        } catch (error) {
            return { error: error.toString() };
        }
    },

    // Get selected layers
    getSelectedLayers: function() {
        try {
            var comp = app.project.activeItem;
            if (comp && comp instanceof CompItem) {
                var selectedLayers = [];
                for (var i = 1; i <= comp.numLayers; i++) {
                    var layer = comp.layer(i);
                    if (layer.selected) {
                        selectedLayers.push({
                            name: layer.name,
                            index: layer.index,
                            type: layer.constructor.name
                        });
                    }
                }
                return selectedLayers;
            }
            return [];
        } catch (error) {
            return { error: error.toString() };
        }
    }
};

// Function called by the extension panel
function applyCodeToAE(code) {
    return letterBlackChat.applyCode(code);
}

function getCompositionInfo() {
    return letterBlackChat.getCompInfo();
}

function getSelectedLayersInfo() {
    return letterBlackChat.getSelectedLayers();
}

// Simple host-side storage for API key (writes a file in the extension folder). For production, use OS keychain.
letterBlackChat.saveAPIKey = function(key) {
    try {
        var folder = Folder(app.project.file ? app.project.file.parent.fsName : Folder.desktop.fsName);
        var f = new File(folder.fsName + '/letterblack_api_key.txt');
        if (f.open('w')) { f.write(key); f.close(); return {success:true}; }
        return {success:false, message:'Unable to open file for writing.'};
    } catch (e) { return {success:false, message:e.toString()}; }
};

letterBlackChat.loadAPIKey = function() {
    try {
        var folder = Folder(app.project.file ? app.project.file.parent.fsName : Folder.desktop.fsName);
        var f = new File(folder.fsName + '/letterblack_api_key.txt');
        if (f.exists && f.open('r')) { var k = f.read(); f.close(); return {success:true, key:k}; }
        return {success:false, message:'No key file found.'};
    } catch (e) { return {success:false, message:e.toString()}; }
};

// Make functions available to the extension
if (typeof $ !== 'undefined') {
    $.global.applyCodeToAE = applyCodeToAE;
    $.global.getCompositionInfo = getCompositionInfo;
    $.global.getSelectedLayersInfo = getSelectedLayersInfo;
    $.global.saveAPIKey = function(key) { return letterBlackChat.saveAPIKey(key); };
    $.global.loadAPIKey = function() { return letterBlackChat.loadAPIKey(); };
}
