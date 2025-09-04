// Basic host script for LetterBlack GenAI Extension
// This script runs in the Adobe After Effects host environment

function LetterBlackHost() {
    this.version = "1.0.0";
    this.extensionId = "com.letterblack.genai";
}

LetterBlackHost.prototype = {
    // Initialize the host script
    init: function() {
        try {
            // Log initialization
            $.writeln("LetterBlack GenAI Host Script initialized");

            // Return success
            return true;
        } catch (error) {
            $.writeln("Error initializing LetterBlack GenAI Host: " + error.toString());
            return false;
        }
    },

    // Get extension information
    getInfo: function() {
        return {
            name: "LetterBlack GenAI",
            version: this.version,
            id: this.extensionId
        };
    }
};

// Create global instance
var letterBlackHost = new LetterBlackHost();

// Initialize on load
letterBlackHost.init();

// Global functions for extension communication
function getSelectedLayersInfo() {
    try {
        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            var selectedLayers = comp.selectedLayers;
            var layersInfo = [];

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                layersInfo.push({
                    name: layer.name,
                    index: layer.index,
                    type: layer.constructor.name,
                    hasVideo: layer.hasVideo,
                    hasAudio: layer.hasAudio,
                    enabled: layer.enabled
                });
            }

            return JSON.stringify(layersInfo);
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        $.writeln("Error getting selected layers: " + error.toString());
        return JSON.stringify([]);
    }
}

function getProjectFilesInfo() {
    try {
        var project = app.project;
        var filesInfo = [];

        // Get all footage items
        for (var i = 1; i <= project.numItems; i++) {
            var item = project.item(i);
            if (item instanceof FootageItem) {
                filesInfo.push({
                    name: item.name,
                    file: item.file ? item.file.fsName : null,
                    type: item.typeName,
                    width: item.width,
                    height: item.height,
                    duration: item.duration,
                    frameRate: item.frameRate
                });
            }
        }

        return JSON.stringify(filesInfo);
    } catch (error) {
        $.writeln("Error getting project files: " + error.toString());
        return JSON.stringify([]);
    }
}

function getSelectedLayersEffects() {
    try {
        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            var selectedLayers = comp.selectedLayers;
            var effectsInfo = [];

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                var layerEffects = [];

                if (layer.property("Effects")) {
                    var effects = layer.property("Effects");
                    for (var j = 1; j <= effects.numProperties; j++) {
                        var effect = effects.property(j);
                        var effectProps = [];

                        // Get effect properties
                        for (var k = 1; k <= effect.numProperties; k++) {
                            var prop = effect.property(k);
                            if (prop.propertyType === PropertyType.PROPERTY) {
                                effectProps.push({
                                    name: prop.name,
                                    value: prop.value.toString()
                                });
                            }
                        }

                        layerEffects.push({
                            name: effect.name,
                            matchName: effect.matchName,
                            properties: effectProps
                        });
                    }
                }

                effectsInfo.push({
                    name: layer.name,
                    index: layer.index,
                    effects: layerEffects
                });
            }

            return JSON.stringify(effectsInfo);
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        $.writeln("Error getting effects info: " + error.toString());
        return JSON.stringify([]);
    }
}
