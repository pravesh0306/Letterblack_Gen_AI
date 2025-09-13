// Production logging wrapper
class ProductionLogger {
    constructor() {
        this.isDev = window.location.hostname === 'localhost' || 
                    window.location.search.includes('debug=true');
    }
    
    log(...args) {
        if (this.isDev) console.log(...args);
    }
    
    warn(...args) {
        if (this.isDev) console.warn(...args);
    }
    
    error(...args) {
        console.error(...args); // Always show errors
    }
}

window.logger = new ProductionLogger();
