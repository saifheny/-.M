const UI = {
  theme: 'dark',
  accentColor: null,
  sidebarOpen: false,
  toolsOpen: false,
  _paletteFiltered: [],
  _cmdPaletteIndex: 0,
  allThemes: ['theme-dark', 'theme-light', 'theme-oled', 'theme-high-contrast', 'theme-vscode', 'theme-github', 'theme-sublime'],
  allAccents: ['accent-blue', 'accent-green', 'accent-purple', 'accent-red', 'accent-cyan'],
  init() {
    lucide.createIcons();
    this.loadTheme();
    this.setupDropZone();
    this.initApiManagers();
    if (!localStorage.getItem('welcome_seen')) {
      this.showModal('welcome-api-modal');
    }
    this.renderModelsModal();
    this.setupCommandPalette();
    document.addEventListener('click', (e) => {
      const sheet = document.getElementById('mobile-tools-sheet');
      const btn = document.getElementById('mobile-tools-btn');
      if (sheet && sheet.classList.contains('show') && !sheet.contains(e.target) && (!btn || !btn.contains(e.target))) {
        this.toggleMobileTools();
      }
    });
  },
  toggleTheme() {
    const themes = ['dark', 'light', 'oled'];
    const idx = themes.indexOf(this.theme);
    const next = themes[(idx + 1) % themes.length];
    this.setTheme(next);
  },
  setTheme(name) {
    this.theme = name;
    this.allThemes.forEach(t => document.body.classList.remove(t));
    document.body.classList.add('theme-' + name);
    const iconMap = { dark: 'sun', light: 'moon', oled: 'monitor', 'high-contrast': 'contrast', vscode: 'code-2', github: 'github', sublime: 'palette' };
    const iconEl = document.getElementById('theme-icon');
    if (iconEl) { iconEl.setAttribute('data-lucide', iconMap[name] || 'sun'); }
    localStorage.setItem('theme', name);
    lucide.createIcons();
    const picker = document.getElementById('theme-picker');
    if (picker) {
      picker.querySelectorAll('.theme-option').forEach(el => {
        el.classList.toggle('active', el.dataset.theme === name);
      });
    }
  },
  setAccentColor(color) {
    this.allAccents.forEach(a => document.body.classList.remove(a));
    if (color) {
      document.body.classList.add('accent-' + color);
      this.accentColor = color;
      localStorage.setItem('accentColor', color);
    } else {
      this.accentColor = null;
      localStorage.removeItem('accentColor');
    }
    const picker = document.getElementById('accent-picker');
    if (picker) {
      picker.querySelectorAll('.accent-dot').forEach(el => {
        el.classList.toggle('active', el.dataset.color === color);
      });
    }
  },
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed', !this.sidebarOpen);
  },
  toggleToolsPanel() {
    this.toggleSidebar(); 
  },
  toggleMobileMenu() {
    this.toggleSidebar();
  },
  toggleMobileTools() {
    const sheet = document.getElementById('mobile-tools-sheet');
    const overlay = document.getElementById('sheet-overlay');
    if (!sheet) return;
    const isShowing = sheet.classList.toggle('show');
    if (overlay) overlay.classList.toggle('show', isShowing);
  },
  loadTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    this.setTheme(saved);
    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) this.setAccentColor(savedAccent);
  },
  openTool(toolId) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-' + toolId)?.classList.add('active');
    if (toolId === 'coding') {
      Editor.toggleSplitScreen();
    } else {
      Main.setMode(toolId);
      if (window.innerWidth <= 768 && this.sidebarOpen) this.toggleSidebar();
    }
  },
  toggleSearch() {
    const bar = document.getElementById('search-bar');
    if (!bar) return;
    const isVisible = bar.style.display !== 'none';
    bar.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      const searchInput = document.getElementById('msg-search');
      if (searchInput) searchInput.focus();
    }
  },
  toggleShare() {
    document.getElementById('share-panel').classList.toggle('open');
  },
  showModal(id) {
    document.getElementById(id).classList.add('open');
    if (id === 'prompts-modal') this.renderPrompts();
  },
  closeModal(id) {
    document.getElementById(id).classList.remove('open');
  },
  closeModalOutside(e, id) {
    if (e.target.id === id) this.closeModal(id);
  },
  switchSettingsTab(tabId, el) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.modal-body[id^="settings-body-"]').forEach(b => { b.style.display = 'none'; });
    const tabBtn = el || document.querySelector('.settings-tab[data-tab="' + tabId + '"]');
    if (tabBtn) tabBtn.classList.add('active');
    const pane = document.getElementById('settings-body-' + tabId);
    if (pane) pane.style.display = 'block';
  },
  selectModel(modelId, name, optId) {
    Main.currentModel = modelId;
    const nameDisplay = document.getElementById('model-name-display');
    if (nameDisplay) nameDisplay.textContent = name;
    const currentModelDisplay = document.getElementById('current-model-display');
    if (currentModelDisplay) currentModelDisplay.textContent = name;
    const mobileModel = document.getElementById('mobile-current-model');
    if (mobileModel) mobileModel.textContent = name;
    
    // Dynamic Glow Effect
    const companyColors = {
      openai: { color: '#10A37F' },
      gemini: { color: '#4285F4' },
      anthropic: { color: '#CCA98C' },
      groq: { color: '#EF4444' },
      mistral: { color: '#F9A826' },
      local: { color: '#06B6D4' },
      deepseek: { color: '#60A5FA' },
      alibaba: { color: '#8B5CF6' },
      xai: { color: '#FFFFFF' },
      perplexity: { color: '#2DD4BF' },
      'default-pro': { color: '#8B5CF6' }
    };
    
    let glowColor = companyColors['default-pro'].color;
    if (modelId !== 'default-pro') {
      for (const [providerKey, providerData] of Object.entries(Main.ALL_MODELS)) {
        if (providerData.models.some(m => m.id === modelId)) {
          glowColor = companyColors[providerKey]?.color || glowColor;
          break;
        }
      }
    }
    document.documentElement.style.setProperty('--accent', glowColor);
    
    document.querySelectorAll('.model-option').forEach(el => el.style.border = '1px solid transparent');
    const selectedOpt = document.querySelector(`.model-option[data-model="${modelId}"]`);
    if (selectedOpt) selectedOpt.style.border = '1px solid var(--accent)';
    this.toast(`تم تغيير النموذج إلى ${name}`, 'success');
  },
  skipWelcome() {
    localStorage.setItem('welcome_seen', 'true');
    this.closeModal('welcome-api-modal');
  },
  saveWelcomeKeys() {
    const openai = document.getElementById('welcome-openai-key').value.trim();
    const gemini = document.getElementById('welcome-gemini-key').value.trim();
    const groq = document.getElementById('welcome-groq-key').value.trim();
    const mistral = document.getElementById('welcome-mistral-key').value.trim();
    if (openai) localStorage.setItem('api_keys_openai', JSON.stringify([openai]));
    if (gemini) localStorage.setItem('api_keys_gemini', JSON.stringify([gemini]));
    if (groq) localStorage.setItem('api_keys_groq', JSON.stringify([groq]));
    if (mistral) localStorage.setItem('api_keys_mistral', JSON.stringify([mistral]));
    localStorage.setItem('welcome_seen', 'true');
    this.closeModal('welcome-api-modal');
    this.initApiManagers();
    this.toast('تم حفظ المفاتيح بنجاح!', 'success');
  },
  toggleCompanyPanel(providerId) {
    const panels = document.querySelectorAll('.company-panel');
    panels.forEach(p => {
      if (p.id !== 'panel-' + providerId) p.style.display = 'none';
    });
    const panel = document.getElementById('panel-' + providerId);
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  },
  loadApiKeys(provider) {
    const keys = JSON.parse(localStorage.getItem(`api_keys_${provider}`) || '[]');
    const list = document.getElementById(`keys-list-${provider}`);
    if (!list) return;
    if (keys.length === 0) {
      list.innerHTML = `<div style="font-size: 12px; color: var(--text3); padding: 8px 0;">لا توجد مفاتيح محفوظة. أدخل مفتاحاً جديداً بالأسفل.</div>`;
      return;
    }
    list.innerHTML = keys.map((k, idx) => `
      <div class="api-key-item">
        <span>${k.substring(0, 8)}...${k.slice(-4)} ${idx === 0 ? '<span class="badge-green" style="font-size:10px;padding:2px 6px;">الافتراضي</span>' : ''}</span>
        <button onclick="UI.removeApiKey('${provider}', ${idx})" title="حذف المفتاح">
          <i data-lucide="trash" style="width:14px;height:14px;"></i>
        </button>
      </div>
    `).join('');
    lucide.createIcons();
  },
  addApiKey(provider, inputId) {
    const input = document.getElementById(inputId);
    const key = input.value.trim();
    if (!key) return;
    const keys = JSON.parse(localStorage.getItem(`api_keys_${provider}`) || '[]');
    if (!keys.includes(key)) {
      keys.push(key);
      localStorage.setItem(`api_keys_${provider}`, JSON.stringify(keys));
    }
    input.value = '';
    this.loadApiKeys(provider);
    this.toast('تمت إضافة مفتاح API بنجاح', 'success');
    if (provider === 'openai') this.selectModel('gpt-5.5', 'GPT-5.5');
    else if (provider === 'gemini') this.selectModel('gemini-3.1-pro', 'Gemini 3.1 Pro');
    else if (provider === 'anthropic') this.selectModel('claude-sonnet-4.6', 'Claude Sonnet 4.6');
    else if (provider === 'groq') this.selectModel('llama-4-maverick', 'Llama 4 Maverick');
    else if (provider === 'mistral') this.selectModel('mistral-large', 'Mistral Large');
    else if (provider === 'deepseek') this.selectModel('deepseek-v3', 'DeepSeek V3');
    else if (provider === 'alibaba') this.selectModel('qwen-max-2025', 'Qwen Max 2.5');
    else if (provider === 'xai') this.selectModel('grok-3', 'Grok 3');
    else if (provider === 'perplexity') this.selectModel('sonar-pro', 'Sonar Pro');
  },
  removeApiKey(provider, index) {
    let keys = JSON.parse(localStorage.getItem(`api_keys_${provider}`) || '[]');
    keys.splice(index, 1);
    localStorage.setItem(`api_keys_${provider}`, JSON.stringify(keys));
    this.loadApiKeys(provider);
    this.toast('تم حذف المفتاح', 'info');
  },
  // toggleMobileTools now handled by new sheet logic
  initApiManagers() {
    this.loadApiKeys('openai');
    this.loadApiKeys('gemini');
    this.loadApiKeys('anthropic');
    this.loadApiKeys('groq');
    this.loadApiKeys('mistral');
    this.loadApiKeys('deepseek');
    this.loadApiKeys('alibaba');
    this.loadApiKeys('xai');
    this.loadApiKeys('perplexity');
  },
  toggleZenMode() {
    document.body.classList.toggle('zen-mode');
    const isZen = document.body.classList.contains('zen-mode');
    this.toast(isZen ? 'وضع التركيز المطلق' : 'العودة للوضع العادي', 'info');
  },
  toggleApiVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.setAttribute('data-lucide', 'eye-off');
    } else {
      input.type = 'password';
      if (icon) icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
  },
  saveSettings() {
    const lu = document.getElementById('local-ai-url');
    const lm = document.getElementById('local-ai-model');
    if (lu) localStorage.setItem('local_ai_base_url', lu.value.trim());
    if (lm) localStorage.setItem('local_ai_model', lm.value.trim());
    localStorage.setItem('elevenlabs_api_key', document.getElementById('elevenlabs-key-input')?.value || '');
    localStorage.setItem('custom_prompt', document.getElementById('custom-system-prompt').value);
    localStorage.setItem('ai_tone', document.getElementById('ai-tone').value);
    localStorage.setItem('font_size', document.getElementById('font-size-select').value);
    localStorage.setItem('temperature', document.getElementById('temp-slider').value);
    localStorage.setItem('max_tokens', document.getElementById('max-tokens').value);
    localStorage.setItem('persist', document.getElementById('persist-toggle').checked);
    localStorage.setItem('autoscroll', document.getElementById('autoscroll-toggle').checked);
    const idleSel = document.getElementById('idle-lock-minutes');
    if (idleSel) localStorage.setItem('idle_lock_minutes', idleSel.value);
    this.toast('تم حفظ الإعدادات بنجاح', 'success');
    this.closeModal('settings-modal');
  },
  commandPaletteItems() {
    return [
      { label: 'محادثة جديدة', keys: 'Ctrl+N', run: () => Main.newChat() },
      { label: 'فتح الإعدادات', keys: 'Ctrl+,', run: () => UI.showModal('settings-modal') },
      { label: 'شركات ومفاتيح API', keys: '', run: () => { UI.showModal('settings-modal'); UI.switchSettingsTab('api', null); } },
      { label: 'ذكاء محلي ومعاملات النموذج', keys: '', run: () => { UI.showModal('settings-modal'); UI.switchSettingsTab('ai', null); } },
      { label: 'اختيار النموذج', keys: 'Ctrl+M', run: () => UI.showModal('model-picker-modal') },
      { label: 'القائمة الجانبية', keys: 'Ctrl+B', run: () => UI.toggleSidebar() },
      { label: 'تبديل المظهر', keys: 'Ctrl+D', run: () => UI.toggleTheme() },
      { label: 'وضع التركيز Zen', keys: 'Ctrl+Shift+Z', run: () => UI.toggleZenMode() },
      { label: 'محرر الأكواد', keys: '', run: () => Editor.toggleSplitScreen() },
      { label: 'مشاركة أو تصدير المحادثة', keys: '', run: () => UI.toggleShare() },
      { label: 'بحث داخل الرسائل', keys: '', run: () => UI.toggleSearch() },
      { label: 'مكتبة الأوامر الجاهزة', keys: '', run: () => UI.showModal('prompts-modal') },
      { label: 'اختصارات لوحة المفاتيح', keys: 'Ctrl+/', run: () => UI.showModal('shortcuts-modal') }
    ];
  },
  openCommandPalette() {
    const el = document.getElementById('command-palette');
    if (!el) return;
    el.classList.add('open');
    const inp = document.getElementById('cmd-palette-input');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
    this._cmdPaletteIndex = 0;
    this.renderCommandPalette('');
    lucide.createIcons();
  },
  closeCommandPalette() {
    document.getElementById('command-palette')?.classList.remove('open');
  },
  renderCommandPalette(query) {
    const list = document.getElementById('cmd-palette-list');
    if (!list) return;
    const q = (query || '').trim().toLowerCase();
    const all = this.commandPaletteItems();
    this._paletteFiltered = all.filter(it =>
      !q || it.label.toLowerCase().includes(q) || (it.keys && it.keys.toLowerCase().includes(q))
    );
    if (this._cmdPaletteIndex >= this._paletteFiltered.length) this._cmdPaletteIndex = Math.max(0, this._paletteFiltered.length - 1);
    list.innerHTML = this._paletteFiltered.map((it, idx) => `
      <div class="cmd-palette-item ${idx === this._cmdPaletteIndex ? 'active' : ''}" data-palette-idx="${idx}">
        <span>${Main.escHtml(it.label)}</span>
        ${it.keys ? `<kbd>${Main.escHtml(it.keys)}</kbd>` : ''}
      </div>
    `).join('');
    list.querySelectorAll('[data-palette-idx]').forEach(row => {
      row.addEventListener('mousedown', e => {
        e.preventDefault();
        const i = parseInt(row.getAttribute('data-palette-idx'), 10);
        this.runCommandPaletteIndex(i);
      });
    });
    lucide.createIcons();
  },
  runCommandPaletteIndex(idx) {
    const it = this._paletteFiltered[idx];
    if (!it || typeof it.run !== 'function') return;
    this.closeCommandPalette();
    it.run();
  },
  runCommandPaletteActive() {
    this.runCommandPaletteIndex(this._cmdPaletteIndex);
  },
  setupCommandPalette() {
    const inp = document.getElementById('cmd-palette-input');
    if (!inp) return;
    inp.addEventListener('input', () => {
      this._cmdPaletteIndex = 0;
      this.renderCommandPalette(inp.value);
    });
    inp.addEventListener('keydown', e => {
      const n = this._paletteFiltered.length;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this._cmdPaletteIndex = n ? Math.min(n - 1, this._cmdPaletteIndex + 1) : 0;
        this.renderCommandPalette(inp.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this._cmdPaletteIndex = Math.max(0, this._cmdPaletteIndex - 1);
        this.renderCommandPalette(inp.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.runCommandPaletteActive();
      }
    });
  },
  toast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = `toast ${type}`;
    const icons = { success: 'check-circle', error: 'x-circle', info: 'info' };
    div.innerHTML = `<div class="toast-icon"><i data-lucide="${icons[type] || 'info'}" style="width:14px;height:14px"></i></div><span>${Main.escHtml(msg)}</span><button class="toast-close" onclick="this.parentElement.remove()" aria-label="إغلاق"><i data-lucide="x" style="width:12px;height:12px"></i></button>`;
    container.appendChild(div);
    lucide.createIcons();
    setTimeout(() => div.classList.add('show'), 30);
    setTimeout(() => {
      div.classList.remove('show');
      setTimeout(() => div.remove(), 350);
    }, 2500);
  },
  isResizing: false,
  startX: 0,
  startW: 0,
  startResize(e) {
    this.isResizing = true;
    this.startX = e.clientX;
    this.startW = document.getElementById('editor-panel').offsetWidth;
    document.body.classList.add('resizing');
    document.getElementById('resizer').classList.add('active');
    document.addEventListener('mousemove', this.doResize);
    document.addEventListener('mouseup', this.stopResize);
  },
  doResize(e) {
    if (!UI.isResizing) return;
    const dx = UI.startX - e.clientX; 
    const newW = Math.max(300, Math.min(UI.startW + dx, window.innerWidth * 0.8));
    document.getElementById('editor-panel').style.width = newW + 'px';
  },
  stopResize() {
    UI.isResizing = false;
    document.body.classList.remove('resizing');
    document.getElementById('resizer').classList.remove('active');
    document.removeEventListener('mousemove', UI.doResize);
    document.removeEventListener('mouseup', UI.stopResize);
  },
  setupDropZone() {
    const overlay = document.getElementById('drop-overlay');
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      overlay.classList.add('active');
    });
    window.addEventListener('dragleave', (e) => {
      if (e.clientX === 0 || e.clientY === 0) {
        overlay.classList.remove('active');
      }
    });
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      overlay.classList.remove('active');
      if(e.dataTransfer.files.length) {
        Main.handleFiles(e.dataTransfer.files);
      }
    });
  },
  renderModelsModal(filterText = '') {
    const container = document.getElementById('dynamic-models-container');
    if (!container) return;
    const companyColors = {
      openai: { glow: '#10A37F' },
      gemini: { glow: '#4285F4' },
      anthropic: { glow: '#CCA98C' },
      groq: { glow: '#EF4444' },
      mistral: { glow: '#F9A826' },
      local: { glow: '#06B6D4' },
      deepseek: { glow: '#60A5FA' },
      alibaba: { glow: '#8B5CF6' },
      xai: { glow: '#FFFFFF' },
      perplexity: { glow: '#2DD4BF' }
    };
    let html = '';
    const query = filterText.toLowerCase();

    if (!query) {
      html += `
        <div class="models-grid-premium">
          <div class="model-card-floating pro-banner-card" onclick="UI.selectModel('default-pro', 'AI Agent Pro'); UI.closeModal('model-picker-modal');" data-model="default-pro">
            <div class="model-card-sparks"></div>
            <div class="model-card-glow" style="background: radial-gradient(circle at 50% 50%, rgba(139,92,246,0.3), transparent 80%);"></div>
            <div class="model-card-content" style="align-items:center;justify-content:center;">
              <div style="background:rgba(139,92,246,0.2);padding:4px 12px;border-radius:20px;font-size:10px;font-weight:800;color:#A78BFA;margin-bottom:8px;border:1px solid rgba(139,92,246,0.3);">النظام الأساسي</div>
              <div class="model-card-title-main" style="font-size:28px;">AI Agent Pro</div>
              <div class="model-card-desc-main" style="font-size:14px;color:rgba(255,255,255,0.8);">أذكى وأسرع تجربة بمعايير 2026</div>
            </div>
          </div>
      `;
    } else {
      html += `<div class="models-grid-premium">`;
    }

    for (const [providerKey, providerData] of Object.entries(Main.ALL_MODELS)) {
      const filteredModels = providerData.models.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.desc.toLowerCase().includes(query) ||
        providerData.name.toLowerCase().includes(query)
      );

      if (filteredModels.length === 0) continue;

      const colors = companyColors[providerKey] || companyColors.local;
      html += `
        <div style="grid-column: 1 / -1; margin: 24px 0 12px; display: flex; align-items: center; gap: 12px;">
          <div style="width:32px;height:32px;border-radius:10px;background:${providerData.bg};display:flex;align-items:center;justify-content:center;color:${providerData.color};">
            <i data-lucide="${providerData.icon}" style="width:18px;height:18px;"></i>
          </div>
          <h3 style="margin:0;font-size:16px;font-weight:900;">${providerData.name}</h3>
        </div>
      `;
      filteredModels.forEach(m => {
        const isLocal = providerKey === 'local';
        const badge = m.isFree ? '<span class="badge-green">FREE</span>' : '<span class="badge-purple">PRO</span>';
        const clickAction = (isLocal || !m.isFree) 
          ? `UI.showModelInstructions('${providerKey}', '${m.id}', '${m.name}')`
          : `UI.selectModel('${m.id}', '${m.name}'); document.getElementById('model-search-input').value=''; UI.closeModal('model-picker-modal');`;
        
        html += `
          <div class="model-card-floating" onclick="${clickAction}" data-model="${m.id}">
            <div class="model-card-sparks"></div>
            <div class="model-card-glow" style="background:radial-gradient(circle at 20% 80%, ${colors.glow}20, transparent 65%);"></div>
            <div class="model-card-content">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div class="model-card-title-main">${m.name}</div>
                ${badge}
              </div>
              <div class="model-card-desc-main">${m.desc}</div>
            </div>
          </div>`;
      });
    }
    
    if (html === '<div class="models-grid-premium">') {
      html += `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:var(--text3);">لا توجد نتائج تطابق بحثك</div>`;
    }
    
    html += `</div>`;
    container.innerHTML = html;
    lucide.createIcons();
  },
  showModelInstructions(provider, modelId, modelName) {
    const titleEl = document.getElementById('inst-modal-title');
    const bodyEl = document.getElementById('inst-modal-body');
    if (!titleEl || !bodyEl) return;
    titleEl.textContent = `تفعيل نموذج ${modelName}`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (provider === 'local') {
      if (isMobile) {
        bodyEl.innerHTML = `
          <div style="text-align:center; margin-bottom:20px;">
            <div style="width:60px; height:60px; background:rgba(6,182,212,0.1); border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto;">
              <i data-lucide="smartphone" style="width:30px; height:30px; color:#06B6D4;"></i>
            </div>
          </div>
          <p>لتشغيل النماذج المحلية على <strong>الموبايل</strong>:</p>
          <ol style="padding-right:20px;">
            <li>قم بتحميل تطبيق <strong>Termux</strong> أو <strong>Layla</strong> من المتجر.</li>
            <li>إذا كنت تستخدم <strong>Layla</strong>، قم بتحميل النموذج مباشرة من التطبيق وفعل خيار "API Server".</li>
            <li>انسخ رابط الـ API (غالباً <code>http://127.0.0.1:11434</code> أو الرابط الذي يعرضه التطبيق).</li>
            <li>عد للإعدادات هنا واربط هذا العنوان.</li>
          </ol>
          <div style="background:var(--bg3); padding:12px; border-radius:12px; font-size:12px; margin-top:16px;">
            ملاحظة: النماذج المحلية تتطلب ذاكرة وصول عشوائي (RAM) لا تقل عن 8 جيجابايت لتجربة مقبولة.
          </div>
        `;
      } else {
        bodyEl.innerHTML = `
          <div class="local-tabs" style="display:flex; gap:12px; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:12px;">
            <button class="btn-outline active" style="flex:1; border-color:var(--accent); color:var(--text);" onclick="document.getElementById('lm-studio-guide').style.display='none'; document.getElementById('ollama-guide').style.display='block'; this.style.borderColor='var(--accent)'; this.nextElementSibling.style.borderColor='var(--border)';">Ollama</button>
            <button class="btn-outline" style="flex:1; border-color:var(--border); color:var(--text);" onclick="document.getElementById('ollama-guide').style.display='none'; document.getElementById('lm-studio-guide').style.display='block'; this.style.borderColor='var(--accent)'; this.previousElementSibling.style.borderColor='var(--border)';">LM Studio</button>
          </div>
          
          <div id="ollama-guide">
            <div style="width:100%; height:160px; background:var(--bg3); border-radius:12px; margin-bottom:16px; border:1px solid var(--border); overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center;">
              <i data-lucide="terminal" style="width:48px; height:48px; color:var(--accent); opacity:0.5;"></i>
              <div style="position:absolute; bottom:12px; left:12px; right:12px; background:rgba(0,0,0,0.8); padding:8px 12px; border-radius:8px; font-family:monospace; color:#A78BFA; font-size:12px; text-align:left;">$ ollama run ${modelId.replace('local-','')}</div>
            </div>
            <p style="font-weight:700; margin-bottom:12px;">خطوات تفعيل Ollama:</p>
            <ol style="padding-right:20px; line-height:1.8; color:var(--text2); font-size:14px;">
              <li>حمل <strong>Ollama</strong> من <a href="https://ollama.com" target="_blank" rel="noopener" style="color:var(--accent)">ollama.com</a> وثبته.</li>
              <li>افتح موجه الأوامر (Terminal/CMD) وقم بتشغيل النموذج بكتابة الأمر الموضح أعلاه.</li>
              <li>تأكد من السماح للاتصالات الخارجية بتعيين <code style="background:var(--bg3); padding:2px 6px; border-radius:4px;">OLLAMA_ORIGINS="*"</code> في متغيرات البيئة.</li>
              <li>الرابط الافتراضي للاتصال هو: <code style="background:rgba(59,130,246,0.1); color:var(--blue); padding:2px 6px; border-radius:4px;">http://localhost:11434/v1</code></li>
            </ol>
          </div>

          <div id="lm-studio-guide" style="display:none;">
            <div style="width:100%; height:160px; background:var(--bg3); border-radius:12px; margin-bottom:16px; border:1px solid var(--border); overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center;">
              <i data-lucide="server" style="width:48px; height:48px; color:var(--green); opacity:0.5;"></i>
              <div style="position:absolute; bottom:12px; left:12px; right:12px; background:rgba(0,0,0,0.8); padding:8px 12px; border-radius:8px; font-family:monospace; color:#34D399; font-size:12px; text-align:left;">Local Server: ON | Port: 1234</div>
            </div>
            <p style="font-weight:700; margin-bottom:12px;">خطوات تفعيل LM Studio:</p>
            <ol style="padding-right:20px; line-height:1.8; color:var(--text2); font-size:14px;">
              <li>افتح برنامج <strong>LM Studio</strong> وانتقل إلى علامة التبويب <i data-lucide="server" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> Local Server.</li>
              <li>قم بتحميل النموذج المراد استخدامه من واجهة البرنامج.</li>
              <li>تأكد من تفعيل <strong>CORS</strong> في إعدادات السيرفر.</li>
              <li>اضغط على <strong>Start Server</strong>.</li>
              <li>الرابط الافتراضي للاتصال هو: <code style="background:rgba(16,185,129,0.1); color:var(--green); padding:2px 6px; border-radius:4px;">http://localhost:1234/v1</code></li>
            </ol>
          </div>
        `;
      }
    } else {
      bodyEl.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
          <div style="width:60px; height:60px; background:rgba(59,130,246,0.1); border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto;">
            <i data-lucide="key" style="width:30px; height:30px; color:#3B82F6;"></i>
          </div>
        </div>
        <p>هذا النموذج يتطلب مفتاح API خاص بك للعمل. اتبع الخطوات التالية:</p>
        <ol style="padding-right:20px;">
          <li>اذهب إلى لوحة تحكم الشركة المزودة (مثل OpenAI أو Google Cloud).</li>
          <li>أنشئ مفتاح API جديد وقم بنسخه.</li>
          <li>اذهب إلى إعدادات AI Agent Pro -> قسم "الشركات".</li>
          <li>ابحث عن الشركة المطلوبة واضغط على "إضافة مفتاح API".</li>
          <li>الصق المفتاح واحفظ التغييرات.</li>
        </ol>
      `;
    }
    this.closeModal('model-picker-modal');
    this.showModal('model-instructions-modal');
    lucide.createIcons();
  },
  PROMPTS_DATA: [
    { id: 1, cat: 'برمجة', title: 'مراجعة كود شاملة', prompt: 'قم بإجراء Code Review شامل للكود التالي، استخرج الثغرات الأمنية، واقترح تحسينات للأداء:\n\n[ضع الكود هنا]', icon: 'code-2' },
    { id: 2, cat: 'برمجة', title: 'شرح كود معقد', prompt: 'اشرح لي كيف يعمل هذا الكود خطوة بخطوة بطريقة مبسطة:\n\n[ضع الكود هنا]', icon: 'terminal' },
    { id: 3, cat: 'برمجة', title: 'كتابة Unit Tests', prompt: 'قم بكتابة اختبارات وحدة (Unit Tests) شاملة لهذا الكود باستخدام [إطار العمل]:\n\n[ضع الكود هنا]', icon: 'test-tube' },
    { id: 4, cat: 'برمجة', title: 'تحويل بين اللغات', prompt: 'حول الكود التالي من لغة [اللغة الحالية] إلى لغة [اللغة المطلوبة]:\n\n[ضع الكود هنا]', icon: 'repeat' },
    { id: 5, cat: 'برمجة', title: 'تحسين SQL Query', prompt: 'حلل استعلام SQL التالي واقترح تحسينات لسرعة التنفيذ وإضافة الفهارس المناسبة:\n\n[ضع الاستعلام هنا]', icon: 'database' },
    { id: 6, cat: 'برمجة', title: 'كتابة Regex', prompt: 'اكتب تعبير نمطي (Regex) يقوم بـ [الوصف، مثال: استخراج الإيميلات من نص معقد].', icon: 'hash' },
    { id: 7, cat: 'برمجة', title: 'توثيق الكود', prompt: 'أضف تعليقات توضيحية (JSDoc/Docstrings) احترافية لهذا الكود:\n\n[ضع الكود هنا]', icon: 'file-text' },
    { id: 8, cat: 'برمجة', title: 'إصلاح Bug', prompt: 'هذا الكود يعطي خطأ [اسم الخطأ]. ابحث عن السبب واقترح إصلاحاً:\n\n[ضع الكود هنا]', icon: 'bug' },
    { id: 9, cat: 'إبداعي', title: 'قصة قصيرة خيالية', prompt: 'اكتب قصة قصيرة خيالية تدور أحداثها في [المكان] وتتحدث عن [الموضوع].', icon: 'book' },
    { id: 10, cat: 'إبداعي', title: 'صياغة بريد رسمي', prompt: 'قم بصياغة بريد إلكتروني احترافي إلى [الجهة] بخصوص [الموضوع]، بأسلوب مهذب ومقنع.', icon: 'mail' },
    { id: 11, cat: 'إبداعي', title: 'تحسين السوشيال ميديا', prompt: 'أعد كتابة النص التالي ليكون أكثر جاذبية وتشويقاً ومناسباً لمنشورات [Instagram/Twitter/LinkedIn]:\n\n[ضع نصك هنا]', icon: 'share-2' },
    { id: 12, cat: 'إبداعي', title: 'تأليف سيناريو', prompt: 'اكتب سيناريو لمشهد قصير يجمع بين شخصيتين يتناقشان حول [الموضوع].', icon: 'film' },
    { id: 13, cat: 'إبداعي', title: 'كتابة مقال SEO', prompt: 'اكتب مقالاً مفصلاً حول [الموضوع] مع التركيز على الكلمات المفتاحية [الكلمات] وتوزيع العناوين بشكل متوافق مع SEO.', icon: 'search' },
    { id: 14, cat: 'إبداعي', title: 'توليد أفكار فيديو', prompt: 'اقترح 10 أفكار إبداعية لمقاطع فيديو قصيرة (Reels/TikTok) حول مجال [المجال].', icon: 'video' },
    { id: 15, cat: 'إبداعي', title: 'كتابة وصف منتج', prompt: 'اكتب وصفاً جذاباً لمنتج [اسم المنتج] يركز على الفوائد ويحث القارئ على الشراء.', icon: 'shopping-bag' },
    { id: 16, cat: 'تعليم', title: 'تبسيط المفاهيم', prompt: 'اشرح لي مفهوم [المفهوم، مثال: الحوسبة الكمية] كما لو كنت طفلاً في العاشرة من عمره.', icon: 'graduation-cap' },
    { id: 17, cat: 'تعليم', title: 'تلخيص كتاب', prompt: 'لخص لي أهم 5 نقاط أو دروس مستفادة من كتاب [اسم الكتاب].', icon: 'layers' },
    { id: 18, cat: 'تعليم', title: 'خطة تعلم لغة', prompt: 'ضع لي خطة دراسية مكثفة لمدة 30 يوماً لتعلم أساسيات لغة [اللغة].', icon: 'languages' },
    { id: 19, cat: 'تعليم', title: 'تحضير للامتحان', prompt: 'اعطني 10 أسئلة محتملة مع إجاباتها للتحضير لامتحان في مادة [المادة].', icon: 'help-circle' },
    { id: 20, cat: 'تعليم', title: 'تحليل تاريخي', prompt: 'ما هي الأسباب الرئيسية التي أدت إلى [الحدث التاريخي] وما هي نتائجها بعيدة المدى؟', icon: 'landmark' },
    { id: 21, cat: 'تسويق', title: 'تحليل SWOT', prompt: 'قم بإجراء تحليل SWOT (نقاط القوة، الضعف، الفرص، التهديدات) لمشروع [اسم المشروع].', icon: 'bar-chart' },
    { id: 22, cat: 'تسويق', title: 'خطة محتوى أسبوعية', prompt: 'صمم جدولاً لمحتوى أسبوعي (7 أيام) لبراند متخصص في [المجال].', icon: 'calendar' },
    { id: 23, cat: 'تسويق', title: 'صياغة عرض سعر', prompt: 'اكتب مسودة احترافية لعرض سعر (Proposal) لعميل يرغب في خدمة [الخدمة].', icon: 'briefcase' },
    { id: 24, cat: 'تسويق', title: 'توليد أسماء مشاريع', prompt: 'اقترح 20 اسماً مبتكراً وغير مستخدم لمشروع جديد في مجال [المجال].', icon: 'lightbulb' },
    { id: 25, cat: 'تسويق', title: 'استراتيجية نمو', prompt: 'اقترح 5 استراتيجيات تسويقية لزيادة مبيعات [منتج/خدمة] في السوق العربي.', icon: 'trending-up' },
    { id: 26, cat: 'تحليل', title: 'تحليل مشاعر النص', prompt: 'حلل نبرة ومشاعر النص التالي وصنفه (إيجابي، سلبي، محايد):\n\n[ضع النص هنا]', icon: 'smile' },
    { id: 27, cat: 'تحليل', title: 'استخراج الكلمات المفتاحية', prompt: 'استخرج أهم الكلمات المفتاحية والمواضيع الرئيسية من النص التالي:\n\n[ضع النص هنا]', icon: 'key' },
    { id: 28, cat: 'تحليل', title: 'مقارنة بين خيارين', prompt: 'قارن بين [الخيار 1] و [الخيار 2] من حيث التكلفة، الأداء، وسهولة الاستخدام.', icon: 'columns' },
    { id: 29, cat: 'تحليل', title: 'التنبؤ بالنتائج', prompt: 'بناءً على المعطيات التالية [المعطيات]، ما هي التوقعات المنطقية للنتائج القادمة؟', icon: 'binary' },
    { id: 30, cat: 'شخصي', title: 'جدول غذائي صحي', prompt: 'صمم لي جدولاً غذائياً أسبوعياً متوازناً يحتوي على [عدد] سعرة حرارية يومياً.', icon: 'utensils' },
    { id: 31, cat: 'شخصي', title: 'تمارين رياضية منزلية', prompt: 'اقترح لي برنامج تمارين رياضية منزلية لمدة 20 دقيقة لا يحتاج لمعدات.', icon: 'activity' },
    { id: 32, cat: 'شخصي', title: 'تنظيم الوقت', prompt: 'ساعدني في تنظيم يومي المزدحم، لدي المهام التالية: [قائمة المهام].', icon: 'clock' },
    { id: 33, cat: 'شخصي', title: 'أفكار هدايا', prompt: 'اقترح 5 أفكار لهدايا غير تقليدية لشخص يهتم بـ [الاهتمامات] وميزانيتي [المبلغ].', icon: 'gift' },
    { id: 34, cat: 'شخصي', title: 'نصيحة سفر', prompt: 'أخطط لزيارة [المدينة] لمدة 3 أيام، اقترح لي أفضل مسار سياحي.', icon: 'map' },
    { id: 35, cat: 'برمجة', title: 'تحويل JSON لـ TypeScript', prompt: 'حول كائن JSON التالي إلى واجهة (Interface) في TypeScript:\n\n[ضع الـ JSON هنا]', icon: 'shuffle' },
    { id: 36, cat: 'برمجة', title: 'شرح ميزات Git', prompt: 'اشرح الفرق بين git merge و git rebase ومتى يجب استخدام كل منهما.', icon: 'git-branch' },
    { id: 37, cat: 'برمجة', title: 'بناء هيكل تطبيق', prompt: 'اقترح هيكلية المجلدات (Folder Structure) المثالية لمشروع [تقنية، مثال: Next.js].', icon: 'folder' },
    { id: 38, cat: 'إبداعي', title: 'كتابة خطاب حفل', prompt: 'اكتب خطاباً مؤثراً لحفل [نوع الحفل، مثال: تخرج] يركز على الأمل والمستقبل.', icon: 'mic' },
    { id: 39, cat: 'إبداعي', title: 'وصف مشهد روائي', prompt: 'صف مشهد غروب الشمس في مدينة مستقبلية بأسلوب أدبي رفيع.', icon: 'sun' },
    { id: 40, cat: 'تسويق', title: 'صياغة إعلان فيسبوك', prompt: 'اكتب نص إعلان فيسبوك جذاب لخدمة [الخدمة] مع دعوة لاتخاذ إجراء (CTA).', icon: 'megaphone' },
    { id: 41, cat: 'تعليم', title: 'تلخيص ورقة بحثية', prompt: 'لخص لي النتائج الرئيسية لهذه الورقة البحثية:\n\n[ضع النص أو الرابط]', icon: 'file-text' },
    { id: 42, cat: 'تحليل', title: 'نقد فني/أدبي', prompt: 'قدم نقداً بناءً للعمل التالي [العمل] من الناحية الجمالية والموضوعية.', icon: 'eye' },
    { id: 43, cat: 'شخصي', title: 'تعلم مهارة جديدة', prompt: 'ما هي أفضل الموارد (كتب، كورسات) لتعلم [المهارة] من الصفر؟', icon: 'star' },
    { id: 44, cat: 'تسويق', title: 'كتابة Newsletter', prompt: 'اكتب بريداً إخبارياً (Newsletter) أسبوعياً لمتابعي مدونة [المجال].', icon: 'send' },
    { id: 45, cat: 'تعليم', title: 'حقائق مذهلة', prompt: 'أخبرني بـ 10 حقائق علمية مذهلة عن [الموضوع] لم أكن أعرفها.', icon: 'info' },
    { id: 46, cat: 'برمجة', title: 'إعداد Dockerfile', prompt: 'اكتب Dockerfile احترافي لتطبيق [اللغة/الإطار].', icon: 'box' },
    { id: 47, cat: 'برمجة', title: 'تحليل لوغاريتمات', prompt: 'اشرح الـ Time Complexity (Big O) لهذا الكود:\n\n[ضع الكود]', icon: 'timer' },
    { id: 48, cat: 'إبداعي', title: 'كتابة كلمات أغنية', prompt: 'اكتب كلمات أغنية قصيرة بأسلوب [نوع الموسيقى] تتحدث عن [الموضوع].', icon: 'music' },
    { id: 49, cat: 'تحليل', title: 'استراتيجية تفاوض', prompt: 'ساعدني في الاستعداد لتفاوض حول [الموضوع]، ما هي أقوى نقاطي؟', icon: 'users' },
    { id: 50, cat: 'شخصي', title: 'تأمل واسترخاء', prompt: 'اكتب لي نصاً قصيراً لجلسة تأمل موجهة تركز على تقليل التوتر.', icon: 'wind' },
    { id: 51, cat: 'تعليم', title: 'كيف تعمل الأشياء؟', prompt: 'اشرح لي ميكانيكية عمل [الآلة/الجهاز] بأسلوب تقني مبسط.', icon: 'settings' },
    { id: 52, cat: 'تسويق', title: 'تحليل المنافسين', prompt: 'كيف يمكنني تمييز مشروعي [اسم المشروع] عن المنافسين في السوق؟', icon: 'target' }
  ],
  renderPrompts(filter = '') {
    const container = document.getElementById('prompts-container');
    if (!container) return;
    let filtered = this.PROMPTS_DATA;
    if (filter) {
      const q = filter.toLowerCase();
      filtered = this.PROMPTS_DATA.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.cat.toLowerCase().includes(q) || 
        p.prompt.toLowerCase().includes(q)
      );
    }
    const catColors = {
      'برمجة': { glow: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
      'إبداعي': { glow: '#F472B6', bg: 'rgba(244,114,182,0.1)' },
      'تعليم': { glow: '#34D399', bg: 'rgba(52,211,153,0.1)' },
      'تسويق': { glow: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
      'تحليل': { glow: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
      'شخصي': { glow: '#F87171', bg: 'rgba(248,113,113,0.1)' }
    };
    let html = '';
    html += `
      <div style="margin-bottom:24px; position:sticky; top:0; background:transparent; padding:12px 0; z-index:10;">
        <div style="position:relative; display:flex; align-items:center;">
          <input type="text" placeholder="ابحث في 50+ أمر ذكي..." oninput="UI.renderPrompts(this.value)" 
                 style="width:100%; height:48px; background:rgba(0,0,0,0.4); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:0 16px 0 44px; color:white; font-size:14px;">
          <i data-lucide="search" style="position:absolute; left:16px; width:18px; height:18px; color:rgba(255,255,255,0.4);"></i>
        </div>
      </div>
    `;
    if (filtered.length === 0) {
      html += '<div style="text-align:center;padding:40px;color:var(--text3);">لا توجد نتائج تطابق بحثك</div>';
    } else {
      const groups = {};
      filtered.forEach(p => {
        if (!groups[p.cat]) groups[p.cat] = [];
        groups[p.cat].push(p);
      });
      for (const [cat, items] of Object.entries(groups)) {
        const colors = catColors[cat] || { glow: '#fff', bg: 'rgba(255,255,255,0.05)' };
        html += `
          <div style="margin-bottom:28px;">
            <h4 style="margin:0 0 16px 0; font-size:13px; color:${colors.glow}; text-transform:uppercase; letter-spacing:1.5px; display:flex; align-items:center; gap:10px; font-weight:900;">
              <span style="width:8px; height:8px; border-radius:50%; background:${colors.glow}; box-shadow:0 0 8px ${colors.glow};"></span> ${cat}
            </h4>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap:12px;">
              ${items.map(p => {
                const safePrompt = p.prompt.replace(/\\n/g, '\\\\n').replace(/"/g, '&quot;');
                return `
                <div class="prompt-card-premium" 
                     onclick="UI.insertPromptToInput(\`${safePrompt}\`)"
                     ondblclick="UI.openPromptEditor(\`${safePrompt}\`)"
                     style="background:${colors.bg}; border:1px solid rgba(255,255,255,0.05); position:relative; overflow:hidden;">
                  <div style="position:absolute; inset:0; background:radial-gradient(circle at bottom right, ${colors.glow}15, transparent 70%);"></div>
                  <div class="prompt-card-icon" style="background:${colors.glow}20; color:${colors.glow};"><i data-lucide="${p.icon}" style="width:16px;height:16px"></i></div>
                  <div class="prompt-card-info" style="position:relative; z-index:2;">
                    <div class="prompt-card-title">${p.title}</div>
                    <div class="prompt-card-desc">${p.prompt.substring(0, 45)}...</div>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>
        `;
      }
    }
    container.innerHTML = html;
    lucide.createIcons();
  },
  insertPromptToInput(text) {
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = text;
      input.focus();
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
      UI.closeModal('prompts-modal');
      UI.toast('تم إدراج الأمر في صندوق الكتابة', 'info');
    }
  },
  openPromptEditor(text) {
    const area = document.getElementById('prompt-edit-area');
    if (area) {
      area.value = text;
      this.closeModal('prompts-modal');
      this.showModal('prompt-edit-modal');
    }
  },
  insertEditedPrompt() {
    const area = document.getElementById('prompt-edit-area');
    if (area) {
      this.insertPromptToInput(area.value);
      this.closeModal('prompt-edit-modal');
    }
  },
};
window.addEventListener('DOMContentLoaded', () => UI.init());
document.addEventListener('click', e => {
  const share = document.getElementById('share-panel');
  if (share && !share.contains(e.target) && !e.target.closest('[onclick="UI.toggleShare()"]')) {
    share.classList.remove('open');
  }
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    UI.openCommandPalette();
    return;
  }
  if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
    e.preventDefault();
    UI.toggleZenMode();
  }
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    Main.newChat();
  }
  if (e.ctrlKey && e.key === ',') {
    e.preventDefault();
    UI.showModal('settings-modal');
  }
  if (e.ctrlKey && e.key === 'm') {
    e.preventDefault();
    UI.showModal('model-picker-modal');
  }
  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault();
    UI.toggleSidebar();
  }
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    UI.toggleTheme();
  }
  if (e.ctrlKey && e.key === '/') {
    e.preventDefault();
    UI.showModal('shortcuts-modal');
  }
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    if (document.body.classList.contains('zen-mode')) UI.toggleZenMode();
  }
});
UI.deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  UI.deferredInstallPrompt = e;
});
UI.isInstalledPWA = function() {
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true;
  if (window.navigator.standalone === true) return true;
  return false;
};
UI.checkPWAInstall = function() {
  if (UI.isInstalledPWA()) return;
  if (document.querySelector('.modal-overlay.open')) {
    setTimeout(() => UI.checkPWAInstall(), 10000);
    return;
  }
  const skipped = localStorage.getItem('pwa_skip_ts');
  if (skipped) {
    const elapsed = Date.now() - parseInt(skipped);
    if (elapsed < 24 * 60 * 60 * 1000) return;
  }
  const gate = document.getElementById('pwa-install-gate');
  if (!gate) return;
  gate.style.display = 'flex';
  const ua = navigator.userAgent.toLowerCase();
  const manual = document.getElementById('pwa-install-manual');
  if (!UI.deferredInstallPrompt) {
    if (manual) manual.style.display = 'block';
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.style.display = 'none';
  }
  if (/iphone|ipad|ipod/.test(ua)) {
    const el = document.getElementById('pwa-manual-ios');
    if (el) el.style.display = 'block';
  } else if (/android/.test(ua)) {
    const el = document.getElementById('pwa-manual-android');
    if (el) el.style.display = 'block';
  } else {
    const el = document.getElementById('pwa-manual-desktop');
    if (el) el.style.display = 'block';
  }
  try { lucide.createIcons(); } catch(e) {}
};
UI.triggerPWAInstall = function() {
  if (UI.deferredInstallPrompt) {
    UI.deferredInstallPrompt.prompt();
    UI.deferredInstallPrompt.userChoice.then((result) => {
      if (result.outcome === 'accepted') {
        const gate = document.getElementById('pwa-install-gate');
        if (gate) gate.style.display = 'none';
        UI.toast('تم تثبيت التطبيق بنجاح', 'success');
      } else {
        const manual = document.getElementById('pwa-install-manual');
        if (manual) manual.style.display = 'block';
      }
      UI.deferredInstallPrompt = null;
    });
  } else {
    const manual = document.getElementById('pwa-install-manual');
    if (manual) manual.style.display = 'block';
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.style.display = 'none';
  }
};
UI.skipPWAInstall = function() {
  localStorage.setItem('pwa_skip_ts', Date.now().toString());
  const gate = document.getElementById('pwa-install-gate');
  if (gate) gate.style.display = 'none';
};
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => UI.checkPWAInstall(), 8000);
});
window.addEventListener('appinstalled', () => {
  const gate = document.getElementById('pwa-install-gate');
  if (gate) gate.style.display = 'none';
  localStorage.removeItem('pwa_skip_ts');
  UI.toast('تم تثبيت التطبيق بنجاح', 'success');
});
