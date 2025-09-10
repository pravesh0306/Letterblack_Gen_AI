const SecureAPISettingsUI = (function(){
  // Simple encrypted storage using Web Crypto and a passphrase
  // This is a pragmatic local option for testing. For production prefer host or server storage.

  async function deriveKey(passphrase, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
    return window.crypto.subtle.deriveKey({name:'PBKDF2', salt: salt, iterations: 100000, hash:'SHA-256'}, keyMaterial, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
  }

  async function encryptKey(passphrase, plaintext) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);
    const enc = new TextEncoder();
    const ct = await window.crypto.subtle.encrypt({name:'AES-GCM', iv}, key, enc.encode(plaintext));
    const payload = {salt: Array.from(salt), iv: Array.from(iv), ct: Array.from(new Uint8Array(ct))};
    localStorage.setItem('lb_secure_api', JSON.stringify(payload));
  }

  async function decryptKey(passphrase) {
    const raw = localStorage.getItem('lb_secure_api');
    if (!raw) return null;
    try {
      const payload = JSON.parse(raw);
      const salt = new Uint8Array(payload.salt);
      const iv = new Uint8Array(payload.iv);
      const ct = new Uint8Array(payload.ct).buffer;
      const key = await deriveKey(passphrase, salt);
      const pt = await window.crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
      const dec = new TextDecoder();
      return dec.decode(pt);
    } catch (e) {
      console.error('Decrypt failed', e);
      return null;
    }
  }

  function showModal() {
    if (document.getElementById('lb-settings-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'lb-settings-modal';
    modal.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#1e1e1e;padding:16px;border:1px solid #333;border-radius:8px;z-index:2000;width:420px;color:#ccc';
    modal.innerHTML = `
      <h3 style="margin:0 0 8px 0;color:#fff">Secure API Settings</h3>
      <p style="font-size:13px;margin:0 0 8px 0">Paste your API key below and choose a passphrase (only stored locally encrypted).</p>
      <input id="lb_api_key" style="width:100%;padding:8px;margin-bottom:8px;background:#2d2d30;border:1px solid #444;color:#ccc" placeholder="API key...">
      <input id="lb_passphrase" type="password" style="width:100%;padding:8px;margin-bottom:8px;background:#2d2d30;border:1px solid #444;color:#ccc" placeholder="Passphrase to encrypt key">
      <div style="text-align:right"><button id="lb_save_btn" class="btn">Save</button> <button id="lb_load_btn" class="btn">Load</button> <button id="lb_close_btn" class="btn">Close</button></div>
      <div id="lb_settings_msg" style="margin-top:8px;font-size:12px;color:#999"></div>
    `;
    document.body.appendChild(modal);
    document.getElementById('lb_close_btn').addEventListener('click', ()=> modal.remove());
    document.getElementById('lb_save_btn').addEventListener('click', async ()=>{
      const key = document.getElementById('lb_api_key').value.trim();
      const pass = document.getElementById('lb_passphrase').value;
      if (!key || !pass) { document.getElementById('lb_settings_msg').textContent = 'Key and passphrase required'; return; }
      await encryptKey(pass, key);
      document.getElementById('lb_settings_msg').textContent = 'Saved encrypted locally.';
    });
    document.getElementById('lb_load_btn').addEventListener('click', async ()=>{
      const pass = document.getElementById('lb_passphrase').value;
      if (!pass) { document.getElementById('lb_settings_msg').textContent = 'Passphrase required to load.'; return; }
      const key = await decryptKey(pass);
      if (!key) { document.getElementById('lb_settings_msg').textContent = 'Failed to decrypt (wrong passphrase?).'; return; }
      document.getElementById('lb_api_key').value = key;
      document.getElementById('lb_settings_msg').textContent = 'Key loaded into the field (still encrypted at rest).';
      // Update runtime config if chat exists
      try {
        if (window.CONFIG) {
          window.CONFIG.GEMINI_API_KEY = key;
          console.log('✅ Updated CONFIG.GEMINI_API_KEY');
        }
        if (window.chat && typeof window.chat === 'object') {
          window.chat.apiKey = key;
          if (typeof window.chat.reloadConfig === 'function') {
            window.chat.reloadConfig();
          }
          console.log('✅ Updated chat.apiKey and reloaded config');
        }
      } catch(e) { console.warn('Could not update runtime config', e); }
      // Optionally push to host (AE)
      const pushBtn = document.getElementById('lb_push_ae');
      if (!pushBtn) {
        const btn = document.createElement('button'); btn.id='lb_push_ae'; btn.className='btn'; btn.textContent='Push to AE';
        btn.style.marginLeft='8px';
        btn.addEventListener('click', ()=>{
          try {
            if (window.CSInterface) {
              const cs = new CSInterface();
              cs.evalScript(`saveAPIKey(\"${key.replace(/\\/g,'\\\\').replace(/\"/g,'\\\"')}\")`, (res)=>{ console.log('AE save result', res); });
            }
          } catch(e) { console.error('Push to AE failed', e); }
        });
        document.querySelector('#lb_settings_msg').parentNode.insertBefore(btn, document.querySelector('#lb_settings_msg').nextSibling);
      }
    });
  }

  function init() {
    const btn = document.getElementById('settingsBtn');
    if (btn) btn.addEventListener('click', showModal);
  }

  return { init, encryptKey, decryptKey };
})();

// Expose to window
if (typeof window !== 'undefined') window.SecureAPISettingsUI = SecureAPISettingsUI;
