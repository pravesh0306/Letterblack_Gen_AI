// Project Organizer Module
// Scans and organizes AE projects: unused assets, layer grouping, naming, health check

class ProjectOrganizer {
    static init(container) {
        if (container) {
            container.innerHTML = '<div class="module-status">Project Tools Module Loaded.<br>Scan, organize, and run health checks on your AE project.</div>';
        }
    }

    constructor(csInterface) {
        this.csInterface = csInterface || (window.CSInterface ? new CSInterface() : null);
    }

    // Scan for unused assets (footage not used in any comp)
    scanUnusedAssets(callback) {
        if (!this.csInterface) return callback('CEP interface not available');
        const script = `
            var unused = [];
            try {
                for (var i = 1; i <= app.project.rootFolder.numItems; i++) {
                    var item = app.project.rootFolder.item(i);
                    if (item instanceof FootageItem && item.usedIn.length === 0) {
                        unused.push(item.name);
                    }
                }
                JSON.stringify({status:'success', unused:unused});
            } catch(e) {
                JSON.stringify({status:'error', message:e.toString()});
            }
        `;
        this.csInterface.evalScript(script, result => {
            try {
                const res = JSON.parse(result);
                callback(null, res);
            } catch (e) {
                callback('Failed to parse result');
            }
        });
    }

    // Scan for layer types in active comp
    scanLayerTypes(callback) {
        if (!this.csInterface) return callback('CEP interface not available');
        const script = `
            var types = {Text:0, Shape:0, Footage:0, Null:0, Other:0};
            try {
                var comp = app.project.activeItem;
                if (comp && comp instanceof CompItem) {
                    for (var i=1; i<=comp.numLayers; i++) {
                        var l = comp.layer(i);
                        if (l instanceof TextLayer) types.Text++;
                        else if (l instanceof ShapeLayer) types.Shape++;
                        else if (l.nullLayer) types.Null++;
                        else if (l.source && l.source instanceof FootageItem) types.Footage++;
                        else types.Other++;
                    }
                }
                JSON.stringify({status:'success', types:types});
            } catch(e) {
                JSON.stringify({status:'error', message:e.toString()});
            }
        `;
        this.csInterface.evalScript(script, result => {
            try {
                const res = JSON.parse(result);
                callback(null, res);
            } catch (e) {
                callback('Failed to parse result');
            }
        });
    }

    // Scan for naming issues (layers/comps with default names)
    scanNamingIssues(callback) {
        if (!this.csInterface) return callback('CEP interface not available');
        const script = `
            var issues = [];
            try {
                var comp = app.project.activeItem;
                if (comp && comp instanceof CompItem) {
                    for (var i=1; i<=comp.numLayers; i++) {
                        var l = comp.layer(i);
                        if (/^Layer \d+$/.test(l.name) || /^Comp \d+$/.test(l.name)) {
                            issues.push(l.name);
                        }
                    }
                }
                JSON.stringify({status:'success', issues:issues});
            } catch(e) {
                JSON.stringify({status:'error', message:e.toString()});
            }
        `;
        this.csInterface.evalScript(script, result => {
            try {
                const res = JSON.parse(result);
                callback(null, res);
            } catch (e) {
                callback('Failed to parse result');
            }
        });
    }

    // Health check: missing files, unused assets, broken expressions
    runHealthCheck(callback) {
        if (!this.csInterface) return callback('CEP interface not available');
        const script = `
            var report = {missing:[], unused:[], brokenExpressions:[]};
            try {
                // Missing files
                for (var i=1; i<=app.project.rootFolder.numItems; i++) {
                    var item = app.project.rootFolder.item(i);
                    if (item instanceof FootageItem && item.missingFootage) {
                        report.missing.push(item.name);
                    }
                    if (item instanceof FootageItem && item.usedIn.length === 0) {
                        report.unused.push(item.name);
                    }
                }
                // Broken expressions
                var comp = app.project.activeItem;
                if (comp && comp instanceof CompItem) {
                    for (var i=1; i<=comp.numLayers; i++) {
                        var l = comp.layer(i);
                        for (var p=1; p<=l.numProperties; p++) {
                            var prop = l.property(p);
                            if (prop.canSetExpression && prop.expressionEnabled && prop.expressionError) {
                                report.brokenExpressions.push(l.name + ':' + prop.name);
                            }
                        }
                    }
                }
                JSON.stringify({status:'success', report:report});
            } catch(e) {
                JSON.stringify({status:'error', message:e.toString()});
            }
        `;
        this.csInterface.evalScript(script, result => {
            try {
                const res = JSON.parse(result);
                callback(null, res);
            } catch (e) {
                callback('Failed to parse result');
            }
        });
    }
}

window.ProjectOrganizer = ProjectOrganizer;
