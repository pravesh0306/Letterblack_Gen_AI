// ui-bootstrap.js
// Consolidated UI glue (clean, single-file extraction).

(function(){
    'use strict';

    // Helper: safely query
    const $ = (sel, root=document) => root.querySelector(sel);

    // Saved Scripts
    function initSavedScripts(){
        const scriptEditor = $('#script-editor');
        const savedScriptsContainer = document.querySelector('.saved-scripts-container');
        function getSavedScripts(){ try { return JSON.parse(localStorage.getItem('ae_saved_scripts')||'[]'); } catch { return []; } }
        function persistScripts(s){ localStorage.setItem('ae_saved_scripts', JSON.stringify(s)); }
        function render(){ if(!savedScriptsContainer) return; const scripts=getSavedScripts(); savedScriptsContainer.innerHTML=''; if(!scripts.length){ savedScriptsContainer.innerHTML='<p>No saved scripts yet.</p>'; return; } scripts.forEach((script,idx)=>{ const item=document.createElement('div'); item.className='saved-script-item'; item.style.cssText='background:#222;color:#fff;padding:8px;margin-bottom:8px;border-radius:6px;'; const meta=document.createElement('div'); meta.style.cssText='font-size:10px;color:#aaa;margin-bottom:6px;'; meta.textContent=script.date; const pre=document.createElement('pre'); pre.style.whiteSpace='pre-wrap'; pre.textContent=script.text; const btnLoad=document.createElement('button'); btnLoad.textContent='Load'; btnLoad.style.cssText='margin-right:8px;padding:4px 10px;border-radius:4px;background:#007acc;color:#fff;border:none;cursor:pointer;font-size:10px;'; btnLoad.addEventListener('click', ()=>{ if(scriptEditor) scriptEditor.value=script.text; }); const btnDel=document.createElement('button'); btnDel.textContent='Delete'; btnDel.style.cssText='padding:4px 10px;border-radius:4px;background:#c00;color:#fff;border:none;cursor:pointer;font-size:10px;'; btnDel.addEventListener('click', ()=>{ const s=getSavedScripts(); s.splice(idx,1); persistScripts(s); render(); }); item.appendChild(meta); item.appendChild(pre); item.appendChild(btnLoad); item.appendChild(btnDel); savedScriptsContainer.appendChild(item); }); }
        function saveCurrent(){ if(!scriptEditor) return; const content=scriptEditor.value.trim(); if(!content) return; const scripts=getSavedScripts(); scripts.push({ text: content, date: new Date().toLocaleString() }); persistScripts(scripts); render(); }
        const saveBtn = document.getElementById('save-script-btn'); if(saveBtn){ const old = saveBtn.onclick; saveBtn.onclick = function(e){ if(old) old.call(this,e); saveCurrent(); }; }
        // initial render
        render();
    }

    // Script Library panel
    function initScriptLibrary(){
        const scriptEditor = $('#script-editor');
        const runBtn = $('#run-script');
        const applyBtn = $('#apply-expression');
        const saveBtn = $('#save-script-btn');
        const copyBtn = $('#copy-script-btn');
        const explainBtn = $('#explain-script-btn');
        const debugBtn = $('#debug-script-btn');
        function showStatus(msg){ let s = document.getElementById('script-status'); if(!s){ s = document.createElement('div'); s.id='script-status'; s.style.cssText='color:#0f0;margin-top:8px;font-size:11px;'; if(scriptEditor && scriptEditor.parentNode) scriptEditor.parentNode.appendChild(s); }
            s.textContent=msg; setTimeout(()=>{ s.textContent=''; },2000);
        }
        function saveLocal(){ if(scriptEditor) { localStorage.setItem('ae_script_library', scriptEditor.value); showStatus('Script saved!'); } }
        function loadLocal(){ if(scriptEditor) scriptEditor.value = localStorage.getItem('ae_script_library')||''; }
        if(runBtn) runBtn.addEventListener('click', ()=> showStatus('Run: Simulated script execution.'));
        if(applyBtn) applyBtn.addEventListener('click', ()=> showStatus('Apply Expression: Simulated.'));
        if(saveBtn) saveBtn.addEventListener('click', saveLocal);
        if(copyBtn) copyBtn.addEventListener('click', ()=>{ if(scriptEditor){ scriptEditor.select(); document.execCommand('copy'); showStatus('Script copied to clipboard!'); } });
        if(explainBtn) explainBtn.addEventListener('click', ()=> showStatus('Explain: Simulated script explanation.'));
        if(debugBtn) debugBtn.addEventListener('click', ()=> showStatus('Debug: Simulated script debug.'));
        loadLocal();
    }

    // Chat history
    function initChatHistory(){
        const chatMessages = $('#chat-messages');
        const clearBtn = $('#clear-history-btn');
        const exportBtn = $('#export-all-history-btn');
        const startNewBtn = $('#start-new-session-btn');
        function get(){ try { return JSON.parse(localStorage.getItem('ae_chat_history')||'[]'); } catch { return []; } }
        function save(){ if(!chatMessages) return; const msgs = Array.from(chatMessages.querySelectorAll('.message')).map(m=>({ type: m.classList.contains('user')? 'user' : 'system', text: m.querySelector('.message-content')?.innerText || '', timestamp: m.querySelector('.message-timestamp')?.innerText || '' })); localStorage.setItem('ae_chat_history', JSON.stringify(msgs)); }
        function load(){ if(!chatMessages) return; chatMessages.innerHTML=''; get().forEach(msg=>{ const md=document.createElement('div'); md.className=`message ${msg.type}`; const c=document.createElement('div'); c.className='message-content'; c.innerHTML=`<p>${msg.text}</p>`; md.appendChild(c); const ts=document.createElement('div'); ts.className='message-timestamp'; ts.textContent=msg.timestamp; md.appendChild(ts); chatMessages.appendChild(md); }); }
        function clear(){ localStorage.removeItem('ae_chat_history'); if(chatMessages) chatMessages.innerHTML=''; }
        function exp(){ const data = localStorage.getItem('ae_chat_history')||'[]'; const blob = new Blob([data], { type:'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='ae_chat_history.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }
        if(chatMessages){ const obs = new MutationObserver(save); obs.observe(chatMessages,{ childList:true }); }
        load(); if(clearBtn) clearBtn.addEventListener('click', clear); if(exportBtn) exportBtn.addEventListener('click', exp); if(startNewBtn) startNewBtn.addEventListener('click', ()=>{ clear(); load(); });
    }

    // YouTube analyzer with real AI integration
    function initYouTubeAnalyzer(){ 
        const btn = $('#analyze-youtube'); 
        const chatMessages = $('#chat-messages'); 
        
        function append(type,text){ 
            if(!chatMessages) return; 
            const d=document.createElement('div'); 
            d.className=`message ${type}`; 
            const c=document.createElement('div'); 
            c.className='message-content'; 
            c.innerHTML=`<p>${text}</p>`; 
            d.appendChild(c); 
            const ts=document.createElement('div'); 
            ts.className='message-timestamp'; 
            ts.textContent=new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); 
            d.appendChild(ts); 
            chatMessages.appendChild(d); 
            chatMessages.scrollTop = chatMessages.scrollHeight; 
        }
        
        if(btn) {
            btn.addEventListener('click', async ()=>{ 
                const url = prompt('Paste YouTube tutorial URL to analyze:'); 
                if(url && url.trim()){ 
                    append('user', `Analyze YouTube Tutorial: ${url}`); 
                    append('system', '🔎 Analyzing YouTube tutorial...');
                    
                    try {
                        // Use YouTube Helper if available
                        if (window.SimpleYouTubeHelper) {
                            const youtubeHelper = new window.SimpleYouTubeHelper();
                            const analysis = await youtubeHelper.analyzeVideo(url);
                            
                            // Remove loading message
                            const loadingMsg = chatMessages.querySelector('.message:last-child');
                            if (loadingMsg && loadingMsg.textContent.includes('Analyzing')) {
                                loadingMsg.remove();
                            }
                            
                            append('system', `� **Video Analysis:**\n\n${analysis}`);
                        } else {
                            // Remove loading message
                            const loadingMsg = chatMessages.querySelector('.message:last-child');
                            if (loadingMsg && loadingMsg.textContent.includes('Analyzing')) {
                                loadingMsg.remove();
                            }
                            
                            append('system', '❌ YouTube Helper module not loaded. Please refresh the page.');
                        }
                    } catch (error) {
                        // Remove loading message
                        const loadingMsg = chatMessages.querySelector('.message:last-child');
                        if (loadingMsg && loadingMsg.textContent.includes('Analyzing')) {
                            loadingMsg.remove();
                        }
                        
                        console.error('YouTube Analysis Error:', error);
                        append('system', `❌ YouTube analysis failed: ${error.message}`);
                    }
                } 
            }); 
        }
    }

    // Chat composer with real AI integration
    function initChatComposer(){ 
        const input = $('#chat-input'); 
        const sendButton = $('#send-button'); 
        const chatMessages = $('#chat-messages'); 
        const charCount = document.querySelector('.char-count'); 
        const maxLen = input ? parseInt(input.getAttribute('maxlength')) : 1000; 
        
        function update(){ 
            if(!input || !sendButton) return; 
            const val = input.value.trim(); 
            sendButton.disabled = !val; 
            if(charCount) charCount.textContent = `${val.length}/${maxLen}`; 
        }
        
        if(input){ 
            input.addEventListener('input', update); 
            update(); 
        }
        
        function append(type,text){ 
            if(!chatMessages) return; 
            const d=document.createElement('div'); 
            d.className=`message ${type}`; 
            const c=document.createElement('div'); 
            c.className='message-content'; 
            c.innerHTML=`<p>${text}</p>`; 
            d.appendChild(c); 
            const ts=document.createElement('div'); 
            ts.className='message-timestamp'; 
            ts.textContent=new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); 
            d.appendChild(ts); 
            chatMessages.appendChild(d); 
            chatMessages.scrollTop = chatMessages.scrollHeight; 
        }
        
        async function sendMessage(message) {
            // Get settings from localStorage
            const apiKey = localStorage.getItem('ai_api_key') || '';
            const provider = localStorage.getItem('ai_provider') || 'google';
            const model = localStorage.getItem('ai_model') || 'gemini-1.5-flash';
            const contextMemory = localStorage.getItem('ai_context_memory') || '';
            
            // Show typing indicator first
            append('system', '🤖 AI is thinking...');
            
            try {
                // Use AI Module if available
                if (window.AIModule) {
                    const aiModule = new window.AIModule();
                    
                    // Enhanced context building
                    let contextualMessage = message;
                    if (contextMemory) {
                        contextualMessage = `Context: ${contextMemory}\n\nUser: ${message}`;
                        console.log('📋 Added context memory to message');
                    }
                    
                    const response = await aiModule.generateResponse(contextualMessage, {
                        apiKey: apiKey,
                        provider: provider,
                        model: model,
                        temperature: 0.7,
                        maxTokens: 2048,
                        chatHistory: []
                    });
                    
                    // Remove typing indicator
                    const typingMsg = chatMessages.querySelector('.message:last-child');
                    if (typingMsg && typingMsg.textContent.includes('thinking')) {
                        typingMsg.remove();
                    }
                    
                    // Add the response with better formatting
                    if (response) {
                        append('system', response);
                        
                        // Show helpful setup message if this looks like an error
                        if (response.includes('❌') && response.includes('API Key')) {
                            setTimeout(() => {
                                append('system', '💡 **Quick Setup Guide:**\n\n1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)\n2. Create a free API key\n3. Go to Settings tab → paste your key\n4. Click "Save & Test"\n\nThen come back and chat with me! 🚀');
                            }, 1000);
                        }
                    } else {
                        append('system', '❌ No response received from AI provider.');
                    }
                    
                } else {
                    // Remove typing indicator
                    const typingMsg = chatMessages.querySelector('.message:last-child');
                    if (typingMsg && typingMsg.textContent.includes('thinking')) {
                        typingMsg.remove();
                    }
                    
                    append('system', '❌ AI Module not loaded. Please refresh the page.');
                }
            } catch (error) {
                // Remove typing indicator
                const typingMsg = chatMessages.querySelector('.message:last-child');
                if (typingMsg && typingMsg.textContent.includes('thinking')) {
                    typingMsg.remove();
                }
                
                console.error('AI Error:', error);
                append('system', `❌ **Unexpected Error**: ${error.message}\n\n📍 Try refreshing the page or check your internet connection.`);
            }
        }
        
        if(sendButton) {
            sendButton.addEventListener('click', async ()=>{ 
                const val = input.value.trim(); 
                if(!val) return; 
                append('user', val); 
                input.value=''; 
                update(); 
                
                await sendMessage(val);
            }); 
        }
        
        // Handle Enter key
        if(input) {
            input.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const val = input.value.trim();
                    if (!val) return;
                    append('user', val);
                    input.value = '';
                    update();
                    
                    await sendMessage(val);
                }
            });
        }
    }

    // Mascot initialization
    function initMascot(){ try { if(typeof MascotAnimator !== 'undefined'){ const mascot = new MascotAnimator({ mascotGif:'Reusable_Mascot_System/assets/ae-mascot-animated.gif', mascotPng:'Reusable_Mascot_System/assets/ae-mascot.png', mascotVideo:'Reusable_Mascot_System/assets/ae-mascot-animated.mp4', mascotSize:'56px', bubbleStyle:'dark', welcomeDuration:3800, zIndex:9999 }); mascot.showWelcome({ text:'Welcome', message:'LetterBlack_Gen_AI — ready to assist' }); window.__mascot = mascot; } } catch(e){ console.warn('MascotAnimator init failed', e); } }

    // Floating mascot
    function initFloatingMascot(){ const floating = document.getElementById('floating-mascot'); if(!floating) return; let clickCount=0; const animations=['animate-bounce','animate-pulse','animate-spin','animate-bubble']; const tooltips=[ 'Click me for help! 🎯','I\'m here to assist! ✨','Need help with After Effects? 🎬','Let\'s create something amazing! 🚀','Ready to help you code! 💻','Your AI companion! 🤖','Always here to help! 💫' ]; function trigger(){ animations.forEach(a=>floating.classList.remove(a)); const anim = clickCount % 4 === 0 ? 'animate-bubble' : animations[Math.floor(Math.random()*animations.length)]; floating.classList.add(anim); setTimeout(()=>floating.classList.remove(anim),1000); }
        function updateTooltip(){ const t = tooltips[Math.floor(Math.random()*tooltips.length)]; floating.setAttribute('data-tooltip', t); }
        function onClick(){ clickCount++; trigger(); updateTooltip(); if(window.__mascot && typeof window.__mascot.showNotification === 'function'){ const msgs=[ 'Hello! I\'m your AI assistant! 🎉','Ready to help with your After Effects project! 🎬','Click the chat area to start a conversation! 💬','Try the command palette for quick actions! ⚡','Need help? Just ask me anything! 🤔','Let\'s make something awesome together! ✨','Your creative coding companion! 🚀' ]; const msg = msgs[Math.floor(Math.random()*msgs.length)]; window.__mascot.showNotification({ text:'AI Assistant', message:msg, duration:3500 }); } else { console.log(`Floating mascot clicked ${clickCount} times`); } if(clickCount>=5 && clickCount % 5 ===0){ for(let i=0;i<3;i++){ setTimeout(()=>{ floating.classList.add('animate-pulse'); setTimeout(()=>floating.classList.remove('animate-pulse'),300); }, i*200); } } }
        floating.addEventListener('click', onClick); floating.addEventListener('mouseenter', ()=> floating.style.transform='translateY(-5px) scale(1.08)'); floating.addEventListener('mouseleave', ()=> floating.style.transform=''); function randomGentle(){ if(Math.random()<0.4){ const ga=['animate-pulse','animate-bounce']; const a=ga[Math.floor(Math.random()*ga.length)]; floating.classList.add(a); setTimeout(()=>floating.classList.remove(a),1000); } }
        function scheduleNext(){ const delay=8000+Math.random()*4000; setTimeout(()=>{ randomGentle(); scheduleNext(); }, delay); }
        function scheduleTooltip(){ const delay=6000+Math.random()*4000; setTimeout(()=>{ updateTooltip(); scheduleTooltip(); }, delay); }
        scheduleNext(); scheduleTooltip();
    }

    // Boot
    document.addEventListener('DOMContentLoaded', function(){ initSavedScripts(); initScriptLibrary(); initChatHistory(); initYouTubeAnalyzer(); initChatComposer(); initMascot(); initFloatingMascot(); });

})();

