// Minimal safe storage helper used to guard against missing localStorage (headless/jsdom)
(function(){
    function makeStore(){
        const data = Object.create(null);
        return {
            getItem(k){ return Object.prototype.hasOwnProperty.call(data,k) ? data[k] : null; },
            setItem(k,v){ data[k] = String(v); },
            removeItem(k){ delete data[k]; },
            clear(){ for(const k in data) delete data[k]; }
        };
    }

    try {
        if(typeof window !== 'undefined'){
            if(typeof window.localStorage === 'undefined'){
                window.localStorage = makeStore();
            }
            if(typeof window.sessionStorage === 'undefined'){
                window.sessionStorage = makeStore();
            }

            // Provide a safe wrapper API as well
            window.safeStorage = window.safeStorage || {
                get(key, fallback=null){
                    try{ const v = window.localStorage.getItem(key); return v===null?fallback:JSON.parse(v); }catch(e){ return fallback; }
                },
                set(key, value){ try{ window.localStorage.setItem(key, JSON.stringify(value)); }catch(e){} },
                remove(key){ try{ window.localStorage.removeItem(key); }catch(e){} },
                clear(){ try{ window.localStorage.clear(); }catch(e){} }
            };
        }
    } catch(e) { /* ignore */ }
})();
