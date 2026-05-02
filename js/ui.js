const UI = {
  theme: 'dark', accentColor: null, sidebarOpen: false,
  allThemes:['theme-dark', 'theme-light', 'theme-oled', 'theme-high-contrast', 'theme-vscode', 'theme-github', 'theme-sublime'],
  allAccents:['accent-blue', 'accent-green', 'accent-purple', 'accent-red', 'accent-cyan'],

  init() {
    lucide.createIcons();
    this.loadTheme();
    this.renderProvidersUI();
  },

  renderProvidersUI() {
    const providers =[
      { id: 'openai', name: 'OpenAI (GPT-4, GPT-3.5)', icon: 'sparkles', color: '#10a37f', link: 'https://platform.openai.com/api-keys', format: 'sk-...' },
      { id: 'google', name: 'Google (Gemini Pro/Flash)', icon: 'hexagon', color: '#4285F4', link: 'https://aistudio.google.com/app/apikey', format: 'AIza...' },
      { id: 'anthropic', name: 'Anthropic (Claude 3)', icon: 'cpu', color: '#D97757', link: 'https://console.anthropic.com/settings/keys', format: 'sk-ant-...' },
      { id: 'groq', name: 'Meta / Groq (Llama 3)', icon: 'zap', color: '#F55036', link: 'https://console.groq.com/keys', format: 'gsk_...' },
      { id: 'mistral', name: 'Mistral AI', icon: 'wind', color: '#F7931A', link: 'https://console.mistral.ai/api-keys/', format: '...' },
      { id: 'cohere', name: 'Cohere', icon: 'command', color: '#39594D', link: 'https://dashboard.cohere.com/api-keys', format: '...' },
      { id: 'huggingface', name: 'HuggingFace', icon: 'smile', color: '#FFD21E', link: 'https://huggingface.co/settings/tokens', format: 'hf_...' }
    ];

    const container = document.getElementById('settings-body-providers');
    if(!container) return;

    let html = '';
    providers.forEach(p => {
       const savedKey = localStorage.getItem(`api_key_${p.id}`) || '';
       html += `
       <div class="provider-card">
         <div class="provider-header" onclick="this.parentElement.classList.toggle('expanded')">
           <div style="display:flex; align-items:center; gap: 12px;">
             <div class="provider-icon" style="color:${p.color};"><i data-lucide="${p.icon}" style="width:20px;height:20px;"></i></div>
             <div style="font-weight: 700; font-size: 15px; color: var(--text);">${p.name}</div>
           </div>
           <i data-lucide="chevron-down" style="width: 16px; color: var(--text3);"></i>
         </div>
         <div class="provider-body">
           <div class="provider-instructions">
              <div style="font-weight: 600; margin-bottom: 4px; color: var(--text);">كيف أحصل على المفتاح؟</div>
              <ol style="margin-right: 20px;">
                <li>قم بزيارة صفحة المطورين الرسمية للشركة <a href="${p.link}" target="_blank">من هنا</a>.</li>
                <li>سجل الدخول بحسابك.</li>
                <li>ابحث عن قسم API Keys واضغط <strong>Create Key</strong>.</li>
                <li>انسخ المفتاح والصقه أدناه. <span style="color:var(--yellow); font-size:11px;">(المفاتيح تُحفظ في متصفحك محلياً فقط)</span></li>
              </ol>
           </div>
           <div style="display:flex; gap: 8px;">
             <input type="password" id="key-${p.id}" class="settings-input" placeholder="${p.format}" value="${savedKey}">
             <button class="btn-primary" onclick="UI.saveProviderKey('${p.id}', 'key-${p.id}')">حفظ</button>
           </div>
         </div>
       </div>
       `;
    });
    container.innerHTML = html;
    lucide.createIcons();
  },

  saveProviderKey(providerId, inputId) {
    const input = document.getElementById(inputId);
    const key = input.value.trim();
    if (!key) { this.toast('يرجى إدخال المفتاح', 'error'); return; }
    localStorage.setItem(`api_key_${providerId}`, key);
    this.toast(`تم حفظ مفتاح ${providerId} بنجاح`, 'success');
  },

  toggleTheme() {
    const themes = ['dark', 'light', 'oled'];
    const idx = themes.indexOf(this.theme);
    this.setTheme(themes[(idx + 1) % themes.length]);
  },
  setTheme(name) {
    this.theme = name; this.allThemes.forEach(t => document.body.classList.remove(t)); document.body.classList.add('theme-' + name);
    localStorage.setItem('theme', name);
    document.querySelectorAll('.theme-option').forEach(el => el.classList.toggle('active', el.dataset.theme === name));
  },
  setAccentColor(color) {
    this.allAccents.forEach(a => document.body.classList.remove(a));
    if (color) { document.body.classList.add('accent-' + color); this.accentColor = color; localStorage.setItem('accentColor', color); } 
    else { this.accentColor = null; localStorage.removeItem('accentColor'); }
    document.querySelectorAll('.accent-dot').forEach(el => el.classList.toggle('active', el.dataset.color === color));
  },
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; document.getElementById('sidebar')?.classList.toggle('collapsed', !this.sidebarOpen); },
  toggleToolsPanel() { this.toggleSidebar(); },
  loadTheme() { this.setTheme(localStorage.getItem('theme') || 'dark'); const acc = localStorage.getItem('accentColor'); if (acc) this.setAccentColor(acc); },
  openTool(toolId) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-' + toolId)?.classList.add('active');
    if (toolId === 'coding') Editor.toggleSplitScreen(); else { Main.setMode(toolId); if (window.innerWidth <= 768 && this.sidebarOpen) this.toggleSidebar(); }
  },
  showModal(id) { document.getElementById(id).classList.add('open'); },
  closeModal(id) { document.getElementById(id).classList.remove('open'); },
  closeModalOutside(e, id) { if (e.target.id === id) this.closeModal(id); },
  switchSettingsTab(tabId) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.modal-body[id^="settings-body-"]').forEach(b => b.style.display = 'none');
    event.target.classList.add('active'); document.getElementById('settings-body-' + tabId).style.display = 'block';
  },
  saveSettings() {
    localStorage.setItem('custom_prompt', document.getElementById('custom-system-prompt').value);
    localStorage.setItem('temperature', document.getElementById('temp-slider').value);
    localStorage.setItem('max_tokens', document.getElementById('max-tokens').value);
    this.toast('تم حفظ الإعدادات', 'success'); this.closeModal('settings-modal');
  },
  toast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const div = document.createElement('div'); div.className = `toast ${type}`;
    const icons = { success: 'check-circle', error: 'x-circle', info: 'info' };
    div.innerHTML = `<div class="toast-icon"><i data-lucide="${icons[type] || 'info'}" style="width:14px;height:14px"></i></div><span>${Main.escHtml(msg)}</span>`;
    container.appendChild(div); lucide.createIcons();
    setTimeout(() => div.classList.add('show'), 50); setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 300); }, 3000);
  }
};
window.addEventListener('DOMContentLoaded', () => UI.init());
