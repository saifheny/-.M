const UI = {
  theme: 'dark',
  accentColor: null,
  sidebarOpen: false,
  toolsOpen: false,

  allThemes: ['theme-dark', 'theme-light', 'theme-oled', 'theme-high-contrast', 'theme-vscode', 'theme-github', 'theme-sublime'],
  allAccents: ['accent-blue', 'accent-green', 'accent-purple', 'accent-red', 'accent-cyan'],

  init() {
    lucide.createIcons();
    this.loadTheme();
    this.setupDropZone();
    this.initApiManagers();
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
    const btn = document.getElementById('search-header-btn');
    const isVisible = bar.style.display !== 'none';
    bar.style.display = isVisible ? 'none' : 'block';
    btn.classList.toggle('active', !isVisible);
    if (!isVisible) document.getElementById('msg-search').focus();
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

  switchSettingsTab(tabId) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.modal-body[id^="settings-body-"]').forEach(b => b.style.display = 'none');
    
    event.target.classList.add('active');
    document.getElementById('settings-body-' + tabId).style.display = 'block';
  },

  toggleApiVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
      input.type = 'text';
      icon.setAttribute('data-lucide', 'eye-off');
    } else {
      input.type = 'password';
      icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
  },

  selectModel(modelId, name, optId) {
    Main.currentModel = modelId;
    const nameDisplay = document.getElementById('model-name-display');
    if (nameDisplay) nameDisplay.textContent = name;
    
    document.querySelectorAll('.model-api-card').forEach(el => el.classList.remove('selected'));
    
    if (optId) {
      const optEl = document.getElementById(optId);
      if (optEl) {
        optEl.classList.add('selected');
        if (window.innerWidth <= 768) {
           optEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    
    // Also update in-chat select if it exists
    const chatSelect = document.getElementById('in-chat-model');
    if (chatSelect && chatSelect.value !== modelId) {
      chatSelect.value = modelId;
    }
    
    this.toast(`تم تغيير النموذج إلى ${name}`, 'success');
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
    localStorage.setItem('groq_api_key', document.getElementById('api-key-input').value);
    localStorage.setItem('openai_api_key', document.getElementById('openai-key-input')?.value || '');
    localStorage.setItem('elevenlabs_api_key', document.getElementById('elevenlabs-key-input')?.value || '');
    localStorage.setItem('custom_prompt', document.getElementById('custom-system-prompt').value);
    localStorage.setItem('temperature', document.getElementById('temp-slider').value);
    localStorage.setItem('max_tokens', document.getElementById('max-tokens').value);
    localStorage.setItem('persist', document.getElementById('persist-toggle').checked);
    localStorage.setItem('autoscroll', document.getElementById('autoscroll-toggle').checked);
    
    this.toast('تم حفظ الإعدادات بنجاح', 'success');
    this.closeModal('settings-modal');
  },

  toast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
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
    UI.showModal('model-modal');
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
