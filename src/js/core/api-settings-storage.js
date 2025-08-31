class APISettingsStorage {
	static init(container) {
		if (!container) return;
		// Load saved values
		const savedKey = localStorage.getItem('ai_api_key') || '';
		const savedModel = localStorage.getItem('ai_model') || 'gemini-2.5-flash-preview-05-20';
		container.innerHTML = `
			<div class="api-settings-modal">
				<label for="api-key-input" class="api-settings-label">API Key</label>
				<input id="api-key-input" type="password" value="${savedKey}" class="api-settings-input">
				<label for="model-select" class="api-settings-label">Model</label>
				<select id="model-select" class="api-settings-input">
					<option value="gemini-2.5-flash-preview-05-20" ${savedModel==='gemini-2.5-flash-preview-05-20'?'selected':''}>gemini-2.5-flash-preview-05-20</option>
					<option value="other-model">Other Model</option>
				</select>
				<button id="save-api-settings-btn" class="api-settings-button">Save</button>
				<span id="api-settings-status" class="api-settings-status"></span>
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
