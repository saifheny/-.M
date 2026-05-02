--- START OF FILE ui.js ---
const UI = {
  theme: 'dark', accentColor: null, sidebarOpen: false,
  allThemes:['theme-dark', 'theme-light', 'theme-oled', 'theme-high-contrast', 'theme-vscode', 'theme-github', 'theme-sublime'],
  allAccents:['accent-blue', 'accent-green', 'accent-purple', 'accent-red', 'accent-cyan'],

  init() {
    lucide.createIcons();
    this.loadTheme();
    this.renderApiSetupCards();
    this.checkFirstVisit();
  },

  checkFirstVisit() {
    // Check if any API keys exist, if not, open elegant setup
    const keysExist = ['openai', 'google', 'anthropic', 'groq', 'mistral'].some(p => localStorage.getItem(`api_key_${p}`));
    if(!keysExist && !sessionStorage.getItem('api_setup_skipped')) {
      setTimeout(() => this.openApiSetup(), 500);
    }
  },

  openApiSetup() {
    document.getElementById('api-setup-modal').classList.add('open');
    this.renderApiSetupCards();
  },

  closeApiSetup() {
    document.getElementById('api-setup-modal').classList.remove('open');
    sessionStorage.setItem('api_setup_skipped', 'true');
  },

  renderApiSetupCards() {
    const providers =[
      { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, o1, o3-mini', icon: 'sparkles', color: '#10a37f', link: 'https://platform.openai.com/api-keys', format: 'sk-proj-...' },
      { id: 'google', name: 'Google', desc: 'Gemini 2.5 Pro & Flash', icon: 'hexagon', color: '#4285F4', link: 'https://aistudio.google.com/app/apikey', format: 'AIza...' },
      { id: 'anthropic', name: 'Anthropic', desc: 'Claude 3.7 Sonnet', icon: 'cpu', color: '#D97757', link: 'https://console.anthropic.com/settings/keys', format: 'sk-ant-...' },
      { id: 'groq', name: 'Groq (Meta)', desc: 'Llama 4 & Llama 3.3', icon: 'zap', color: '#F55036', link: 'https://console.groq.com/keys', format: 'gsk_...' }
    ];

    const container = document.getElementById('api-cards-grid');
    if(!container) return;

    let html = '';
    providers.forEach(p => {
       const savedKey = localStorage.getItem(`api_key_${p.id}`) || '';
       const isSaved = savedKey !== '';
       html += `
       <div class="api-card ${isSaved ? 'saved' : ''}">
         <div class="api-card-top">
           <div class="api-card-icon" style="color:${p.color}; background:${p.color}15"><i data-lucide="${p.icon}" style="width:24px;height:24px;"></i></div>
           <div class="api-card-title">
             <h4>${p.name}</h4>
             <span>${p.desc}</span>
           </div>
         </div>
         <div class="api-card-instruction">
           احصل على المفتاح من <a href="${p.link}" target="_blank">لوحة التحكم الخاصة بهم</a>
         </div>
         <div class="api-card-input-row">
           <input type="password" id="api-input-${p.id}" placeholder="${p.format}" value="${savedKey}">
           <button onclick="UI.saveProviderKey('${p.id}', 'api-input-${p.id}')">حفظ</button>
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
    this.toast(`تم حفظ وحماية مفتاح ${providerId} محلياً بنجاح`, 'success');
    this.renderApiSetupCards();
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
