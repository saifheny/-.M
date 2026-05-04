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
    
    // Check if we should show the welcome API modal
    if (!localStorage.getItem('welcome_seen')) {
      this.showModal('welcome-api-modal');
    }
    
    this.renderModelsModal();
    this.setupCommandPalette();

    // Close mobile tools menu on outside click
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('mobile-tools-menu');
      const btn = document.getElementById('mobile-tools-btn');
      if (menu && menu.classList.contains('show') && !menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
        menu.classList.remove('show');
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
    this.toggleSidebar(); // Just redirect to sidebar since they are merged
  },
  
  toggleMobileMenu() {
    this.toggleSidebar();
  },

  toggleMobileTools() {
    const menu = document.getElementById('mobile-tools-menu');
    if (!menu) return;
    if (menu.classList.contains('show')) {
      menu.classList.remove('show');
    } else {
      menu.classList.add('show');
    }
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
    
    // Auto-select model based on provided key
    if (provider === 'openai') this.selectModel('gpt-4o', 'GPT-4o');
    else if (provider === 'gemini') this.selectModel('gemini-2.5-pro', 'Gemini 2.5 Pro');
    else if (provider === 'anthropic') this.selectModel('claude-3-7-sonnet', 'Claude 3.7 Sonnet');
    else if (provider === 'groq') this.selectModel('llama-4-90b', 'Llama 4 90B');
    else if (provider === 'mistral') this.selectModel('mistral-large-2', 'Mistral Large 2');
  },

  removeApiKey(provider, index) {
    let keys = JSON.parse(localStorage.getItem(`api_keys_${provider}`) || '[]');
    keys.splice(index, 1);
    localStorage.setItem(`api_keys_${provider}`, JSON.stringify(keys));
    this.loadApiKeys(provider);
    this.toast('تم حذف المفتاح', 'info');
  },

  initApiManagers() {
    this.loadApiKeys('groq');
    this.loadApiKeys('openai');
    this.loadApiKeys('gemini');
    this.loadApiKeys('anthropic');
    this.loadApiKeys('mistral');
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
    if (window.innerWidth <= 768) {
      container.innerHTML = ''; // Replace existing toasts on mobile
    }
    const div = document.createElement('div');
    div.className = `toast ${type}`;
    const icons = { success: 'check-circle', error: 'x-circle', info: 'info' };
    div.innerHTML = `<div class="toast-icon"><i data-lucide="${icons[type] || 'info'}" style="width:14px;height:14px"></i></div><span>${Main.escHtml(msg)}</span>`;
    container.appendChild(div);
    lucide.createIcons();
    
    setTimeout(() => div.classList.add('show'), 50);
    setTimeout(() => {
      div.classList.remove('show');
      setTimeout(() => div.remove(), 300);
    }, 3000);
  },

  /* Resizer Logic */
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

  renderModelsModal() {
    const container = document.getElementById('dynamic-models-container');
    if (!container) return;
    
    let html = '';
    
    html += `
      <div style="margin-bottom: 4px;">
        <div class="model-option" onclick="UI.selectModel('default-pro', 'AI Agent Pro'); UI.closeModal('model-picker-modal');" data-model="default-pro" style="background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.3);">
          <div class="model-option-icon" style="background: rgba(139,92,246,0.2); color: var(--purple);"><i data-lucide="star"></i></div>
          <div class="model-info" style="flex: 1;">
            <div class="model-option-name">النموذج التلقائي (AI Agent Pro)</div>
            <div class="model-option-desc">أفضل نموذج متوفر حالياً لإنجاز المهام</div>
          </div>
        </div>
      </div>
    `;

    for (const [providerKey, providerData] of Object.entries(Main.ALL_MODELS)) {
      html += `
        <div class="provider-group" style="background: rgba(0,0,0,0.2); border-radius: 16px; padding: 16px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <div style="width: 28px; height: 28px; border-radius: 8px; background: ${providerData.bg}; display: flex; align-items: center; justify-content: center; color: ${providerData.color};">
              <i data-lucide="${providerData.icon}" style="width: 16px; height: 16px;"></i>
            </div>
            <h3 style="margin: 0; font-size: 15px; font-weight: 700;">${providerData.name}</h3>
          </div>
      `;

      const proModels = providerData.models.filter(m => !m.isFree);
      const freeModels = providerData.models.filter(m => m.isFree);

      if (proModels.length > 0) {
        html += `<div style="font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">النسخة المدفوعة (Pro)</div>`;
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 16px;">`;
        proModels.forEach(m => {
          html += `
            <div class="model-option" onclick="UI.selectModel('${m.id}', '${m.name}'); UI.closeModal('model-picker-modal');" data-model="${m.id}" style="background: var(--bg3);">
              <div class="model-info">
                <div class="model-option-name" style="display: flex; align-items: center; gap: 6px;">
                  ${m.name} <span style="font-size: 9px; background: rgba(239,68,68,0.2); color: var(--red); padding: 2px 6px; border-radius: 4px; font-weight:700;">PRO</span>
                </div>
                <div class="model-option-desc">${m.desc}</div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      if (freeModels.length > 0) {
        html += `<div style="font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">مجانًا (Free)</div>`;
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px;">`;
        freeModels.forEach(m => {
          html += `
            <div class="model-option" onclick="UI.selectModel('${m.id}', '${m.name}'); UI.closeModal('model-picker-modal');" data-model="${m.id}" style="background: var(--bg3);">
              <div class="model-info">
                <div class="model-option-name" style="display: flex; align-items: center; gap: 6px;">
                  ${m.name} <span style="font-size: 9px; background: rgba(16,185,129,0.2); color: var(--green); padding: 2px 6px; border-radius: 4px; font-weight:700;">متاح</span>
                </div>
                <div class="model-option-desc">${m.desc}</div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      html += `</div>`;
    }
    
    container.innerHTML = html;
    lucide.createIcons();
  }
};

window.addEventListener('DOMContentLoaded', () => UI.init());


document.addEventListener('click', e => {
  const share = document.getElementById('share-panel');
  if (share && !share.contains(e.target) && !e.target.closest('[onclick="UI.toggleShare()"]')) {
    share.classList.remove('open');
  }

  // old sidebar logic removed since we use full-dashboard modal now
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

/* ===== PWA MANDATORY INSTALL GATE ===== */
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
  setTimeout(() => UI.checkPWAInstall(), 1500);
});

window.addEventListener('appinstalled', () => {
  const gate = document.getElementById('pwa-install-gate');
  if (gate) gate.style.display = 'none';
  localStorage.removeItem('pwa_skip_ts');
  UI.toast('تم تثبيت التطبيق بنجاح', 'success');
});
