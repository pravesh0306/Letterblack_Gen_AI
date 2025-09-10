/**
 * SIMPLIFIED Project Context - Essential functionality only
 * Replaces complex project context with simple, working solution
 */

class SimpleProjectContext {
    constructor() {
        this.projectData = {
            hasProject: false,
            name: 'No Project',
            hasActiveComp: false,
            compName: 'No Composition',
            selectedLayers: [],
            lastError: null
        };
        
        this.csInterface = null;
        if (window.CSInterface) {
            this.csInterface = new CSInterface();
        }
        
        this.logger.debug('📋 Simple Project Context initialized');
    }

    /**
     * Get current After Effects context - simplified version
     */
    async getCurrentContext() {
        if (!this.csInterface) {
            this.logger.warn('CEP interface not available');
            return 'After Effects not connected';
        }

        return new Promise((resolve, reject) => {
            // Simple ExtendScript to get basic project info
            const script = `
                try {
                    var result = {
                        hasProject: !!app.project,
                        projectName: 'No Project',
                        hasActiveComp: false,
                        compName: 'No Composition',
                        selectedLayersCount: 0
                    };
                    
                    if (app.project) {
                        result.projectName = app.project.file ? app.project.file.name : 'Untitled Project';
                        
                        var activeComp = app.project.activeItem;
                        if (activeComp && activeComp instanceof CompItem) {
                            result.hasActiveComp = true;
                            result.compName = activeComp.name;
                            result.selectedLayersCount = activeComp.selectedLayers.length;
                        }
                    }
                    
                    JSON.stringify({status: 'success', data: result});
                } catch (error) {
                    JSON.stringify({status: 'error', message: error.toString()});
                }
            `;

            this.csInterface.evalScript(script, (result) => {
                try {
                    const response = JSON.parse(result);
                    
                    if (response.status === 'success') {
                        this.projectData = {
                            hasProject: response.data.hasProject,
                            name: response.data.projectName,
                            hasActiveComp: response.data.hasActiveComp,
                            compName: response.data.compName,
                            selectedLayers: response.data.selectedLayersCount,
                            lastError: null
                        };
                        
                        // Update UI breadcrumbs
                        this.updateUIBreadcrumbs();
                        
                        // Create context string
                        let context = `Project: ${this.projectData.name}`;
                        if (this.projectData.hasActiveComp) {
                            context += ` | Composition: ${this.projectData.compName}`;
                            if (this.projectData.selectedLayers > 0) {
                                context += ` | Selected Layers: ${this.projectData.selectedLayers}`;
                            }
                        }
                        
                        resolve(context);
                    } else {
                        this.projectData.lastError = response.message;
                        this.logger.warn('Project context error:', response.message);
                        resolve('After Effects project not accessible');
                    }
                } catch (error) {
                    this.logger.error('Failed to parse project context:', error);
                    resolve('After Effects connection error');
                }
            });
        });
    }

    /**
     * Update UI breadcrumbs with current context
     */
    updateUIBreadcrumbs() {
        const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
        const contextIndicator = document.getElementById('context-indicator');
        
        if (breadcrumbItems.length >= 2) {
            // Update project/comp breadcrumbs
            breadcrumbItems[0].textContent = this.projectData.hasProject ? 
                this.projectData.name.replace('.aep', '') : 'No Project';
            
            breadcrumbItems[1].textContent = this.projectData.hasActiveComp ? 
                this.projectData.compName : 'No Comp';
        }
        
        if (contextIndicator) {
            if (this.projectData.hasProject && this.projectData.hasActiveComp) {
                contextIndicator.textContent = 'Context Active';
                contextIndicator.className = 'context-chip active';
            } else {
                contextIndicator.textContent = 'No Context';
                contextIndicator.className = 'context-chip inactive';
            }
        }
    }

    /**
     * Get simple status for display
     */
    getStatus() {
        if (this.projectData.lastError) {
            return { status: 'error', message: this.projectData.lastError };
        }
        
        if (!this.projectData.hasProject) {
            return { status: 'warning', message: 'No After Effects project open' };
        }
        
        if (!this.projectData.hasActiveComp) {
            return { status: 'warning', message: 'No active composition' };
        }
        
        return { status: 'success', message: 'Project context available' };
    }

    /**
     * Refresh context (called when user wants to update)
     */
    async refresh() {
        this.logger.debug('🔄 Refreshing project context...');
        return await this.getCurrentContext();
    }
}

// Export for global use
window.SimpleProjectContext = SimpleProjectContext;
