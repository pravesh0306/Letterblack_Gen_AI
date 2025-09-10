// Tutorial Session Manager
// Manages step-by-step tutorial progression derived from YouTube analysis or AI output
(function(){
    const STORAGE_KEY = 'ae_tutorial_sessions';

    class TutorialSessionManager {
        constructor(){
            this.sessions = this._load();
            this.activeSessionId = null;
        }

        _load(){
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : {};
            } catch(e){
                console.warn('TutorialSession load failed:', e.message);
                return {};
            }
        }

        _persist(){
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions)); } catch(e){ console.warn('Persist tutorial sessions failed:', e.message); }
        }

        startSession(id, meta){
            if(!id) {return;}
            const existing = this.sessions[id] || {};
            const steps = Array.isArray(meta?.steps) ? meta.steps.map((s,i)=>({
                id: s.id || `step-${i+1}`,
                index: i,
                title: s.title || s.name || `Step ${i+1}`,
                description: s.description || s.text || '',
                script: s.script || s.code || null,
                expression: s.expression || null,
                status: existing.steps?.[i]?.status || 'pending'
            })) : [];

            this.sessions[id] = {
                id,
                title: meta?.title || existing.title || 'Tutorial',
                created: existing.created || new Date().toISOString(),
                updated: new Date().toISOString(),
                steps,
                currentIndex: existing.currentIndex && existing.currentIndex < steps.length ? existing.currentIndex : 0
            };
            this.activeSessionId = id;
            this._persist();
            return this.sessions[id];
        }

        getActive(){
            if(!this.activeSessionId) {return null;}
            return this.sessions[this.activeSessionId] || null;
        }

        setActive(id){
            if(this.sessions[id]) {this.activeSessionId = id;}
        }

        getCurrentStep(){
            const sess = this.getActive();
            if(!sess) {return null;}
            return sess.steps[sess.currentIndex] || null;
        }

        next(){
            const sess = this.getActive();
            if(!sess) {return null;}
            if(sess.currentIndex < sess.steps.length - 1){
                sess.currentIndex++;
                sess.updated = new Date().toISOString();
                this._persist();
            }
            return this.getCurrentStep();
        }

        prev(){
            const sess = this.getActive();
            if(!sess) {return null;}
            if(sess.currentIndex > 0){
                sess.currentIndex--;
                sess.updated = new Date().toISOString();
                this._persist();
            }
            return this.getCurrentStep();
        }

        goTo(index){
            const sess = this.getActive();
            if(!sess) {return null;}
            if(index >=0 && index < sess.steps.length){
                sess.currentIndex = index;
                sess.updated = new Date().toISOString();
                this._persist();
            }
            return this.getCurrentStep();
        }

        markCompleted(index){
            const sess = this.getActive();
            if(!sess) {return;}
            const step = sess.steps[index];
            if(step){
                step.status = 'completed';
                sess.updated = new Date().toISOString();
                this._persist();
            }
        }

        restart(){
            const sess = this.getActive();
            if(!sess) {return null;}
            sess.steps.forEach(s=>{ s.status='pending'; });
            sess.currentIndex = 0;
            sess.updated = new Date().toISOString();
            this._persist();
            return this.getCurrentStep();
        }
    }

    window.TutorialSessionManager = TutorialSessionManager;
})();

