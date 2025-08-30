class APISettingsStorage {
	static init(container) {
		if (!container) return;
		// Load saved values
		const savedKey = localStorage.getItem('ai_api_key') || '';
		const savedModel = localStorage.getItem('ai_model') || 'gemini-2.5-flash-preview-05-20';
		container.innerHTML = `
			<div style="padding:16px;color:#fff;max-width:340px;">
				<label for="api-key-input" style="display:block;margin-bottom:6px;">API Key</label>
				<input id="api-key-input" type="password" value="${savedKey}" style="width:100%;margin-bottom:12px;padding:6px;border-radius:4px;border:1px solid #555;background:#222;color:#fff;">
				<label for="model-select" style="display:block;margin-bottom:6px;">Model</label>
				<select id="model-select" style="width:100%;margin-bottom:12px;padding:6px;border-radius:4px;border:1px solid #555;background:#222;color:#fff;">
					<option value="gemini-2.5-flash-preview-05-20" ${savedModel==='gemini-2.5-flash-preview-05-20'?'selected':''}>gemini-2.5-flash-preview-05-20</option>
					<option value="other-model">Other Model</option>
				</select>
				<button id="save-api-settings-btn" style="background:#007acc;color:#fff;padding:8px 16px;border:none;border-radius:4px;cursor:pointer;">Save</button>
				<span id="api-settings-status" style="display:block;margin-top:10px;color:#0f0;"></span>
			</div>
		`;
		// Save logic
		const keyInput = container.querySelector('#api-key-input');
		const modelSelect = container.querySelector('#model-select');
		const saveBtn = container.querySelector('#save-api-settings-btn');
		const statusSpan = container.querySelector('#api-settings-status');
		saveBtn.onclick = function() {
			localStorage.setItem('ai_api_key', keyInput.value);
			localStorage.setItem('ai_model', modelSelect.value);
			statusSpan.textContent = 'Settings saved!';
			setTimeout(()=>{statusSpan.textContent='';}, 2000);
		};
	}
}
window.APISettingsStorage = APISettingsStorage;
