const Editor = {
  isOpen: false,
  tabs: [],
  activeTab: null,

  init() {
    this.renderTabs();
    this.setupTextarea();
  },

  toggleSplitScreen() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('editor-panel');
    const resizer = document.getElementById('resizer');
    
    if (this.isOpen) {
      panel.classList.add('open');
      if (window.innerWidth > 768) {
        resizer.style.display = 'block';
      }
      document.querySelectorAll('.editor-toggle-btn').forEach(btn => btn.classList.add('active'));
      UI.toast('تم فتح محرر الكود', 'info');
      if (this.tabs.length === 0) {
        this.renderEmptyState();
      } else {
        this.updateLineNumbers();
      }
    } else {
      panel.classList.remove('open');
      resizer.style.display = 'none';
      document.querySelectorAll('.editor-toggle-btn').forEach(btn => btn.classList.remove('active'));
      this.closePreview();
    }
  },

  setupTextarea() {
    const editor = document.getElementById('code-editor');
    
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
        this.updateStatus();
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        this.toggleSearch();
      }
    });

    editor.addEventListener('input', () => {
      this.updateStatus();
      this.updateLineNumbers();
      this.saveCurrentTab();
    });
    
    editor.addEventListener('scroll', () => {
      document.getElementById('editor-lines-gutter').scrollTop = editor.scrollTop;
    });

    editor.addEventListener('click', () => this.updateStatus());
    editor.addEventListener('keyup', () => this.updateStatus());
  },

  renderEmptyState() {
    const editorEl = document.getElementById('code-editor');
    const gutter = document.getElementById('editor-lines-gutter');
    editorEl.value = '';
    editorEl.style.display = 'none';
    gutter.style.display = 'none';
    
    let emptyEl = document.getElementById('editor-empty');
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.id = 'editor-empty';
      emptyEl.className = 'editor-empty-state';
      editorEl.parentNode.appendChild(emptyEl);
    }
    emptyEl.style.display = 'flex';
    emptyEl.innerHTML = `
      <div class="empty-icon"><i data-lucide="file-code" style="width:28px;height:28px;color:var(--text3)"></i></div>
      <h3>لا توجد ملفات مفتوحة</h3>
      <p>اطلب من الذكاء الاصطناعي كتابة كود أو أنشئ ملفاً جديداً</p>
      <button class="toolbar-btn primary" onclick="Editor.addNewTab()" style="margin-top:8px;">
        <i data-lucide="plus" style="width:14px;height:14px"></i> ملف جديد
      </button>
    `;
    lucide.createIcons();
    this.renderTabs();
    
    const breadcrumb = document.getElementById('breadcrumb-path');
    if (breadcrumb) breadcrumb.textContent = 'لا يوجد ملف';
    document.getElementById('editor-lang-status').textContent = '-';
    document.getElementById('editor-cursor-pos').textContent = '-';
    document.getElementById('editor-chars').textContent = '0';
  },

  hideEmptyState() {
    const emptyEl = document.getElementById('editor-empty');
    if (emptyEl) emptyEl.style.display = 'none';
    const editorEl = document.getElementById('code-editor');
    const gutter = document.getElementById('editor-lines-gutter');
    editorEl.style.display = '';
    gutter.style.display = '';
  },

  updateLineNumbers() {
    const editor = document.getElementById('code-editor');
    const gutter = document.getElementById('editor-lines-gutter');
    const linesCount = editor.value.split('\n').length;
    let numbersHtml = '';
    for (let i = 1; i <= linesCount; i++) {
      numbersHtml += i + '<br>';
    }
    gutter.innerHTML = numbersHtml;
  },

  updateStatus() {
    const editor = document.getElementById('code-editor');
    const text = editor.value;
    const lines = text.split('\n');
    const pos = editor.selectionStart;
    
    let line = 1, col = 1, counted = 0;
    for (let i = 0; i < lines.length; i++) {
      if (counted + lines[i].length + 1 > pos) { 
        line = i + 1; 
        col = pos - counted + 1; 
        break; 
      }
      counted += lines[i].length + 1;
    }
    
    document.getElementById('editor-cursor-pos').textContent = `سطر ${line}، عمود ${col}`;
    document.getElementById('editor-chars').textContent = `${text.length} حرف`;
  },

  saveCurrentTab() {
    const tab = this.tabs.find(t => t.id === this.activeTab);
    if (tab) {
      tab.content = document.getElementById('code-editor').value;
    }
  },

  addNewTab() {
    this.hideEmptyState();
    const id = 'tab_' + Date.now();
    this.tabs.push({ id, name: 'untitled.js', lang: 'javascript', content: '' });
    this.switchTab(id);
    UI.toast('تم إضافة ملف جديد', 'info');
  },

  createTab(name, content, lang) {
    this.hideEmptyState();
    const id = 'tab_' + Date.now() + Math.floor(Math.random() * 1000);
    this.tabs.push({ id, name: name || 'untitled.txt', lang: lang || 'text', content: content || '' });
    this.switchTab(id);
  },

  closeTab(id) {
    this.tabs = this.tabs.filter(t => t.id !== id);
    if (this.tabs.length === 0) {
      this.activeTab = null;
      this.renderEmptyState();
      return;
    }
    if (this.activeTab === id) {
      this.switchTab(this.tabs[0].id);
    } else {
      this.renderTabs();
    }
  },

  closeAllTabs() {
    if (confirm('هل أنت متأكد من إغلاق جميع الملفات؟')) {
      this.tabs = [];
      this.activeTab = null;
      this.renderEmptyState();
      UI.toast('تم إغلاق الجميع', 'info');
    }
  },

  renameTab(id) {
    const tab = this.tabs.find(t => t.id === id);
    if (!tab) return;
    const newName = prompt('اسم الملف الجديد:', tab.name);
    if (newName && newName.trim()) {
      tab.name = newName.trim();
      const extMap = { py: 'python', js: 'javascript', ts: 'typescript', html: 'html', css: 'css', json: 'json', java: 'java', cpp: 'cpp', md: 'markdown' };
      const ext = newName.split('.').pop().toLowerCase();
      if (extMap[ext]) tab.lang = extMap[ext];
      this.renderTabs();
      if (this.activeTab === id) {
        document.getElementById('lang-select').value = tab.lang;
        document.getElementById('editor-lang-status').textContent = tab.lang.toUpperCase();
        const breadcrumb = document.getElementById('breadcrumb-path');
        if (breadcrumb) breadcrumb.textContent = `src / ${tab.name}`;
      }
    }
  },

  switchTab(id) {
    this.saveCurrentTab();
    this.hideEmptyState();
    this.activeTab = id;
    const tab = this.tabs.find(t => t.id === id);
    if (tab) {
      document.getElementById('code-editor').value = tab.content;
      document.getElementById('lang-select').value = tab.lang;
      document.getElementById('editor-lang-status').textContent = tab.lang.toUpperCase();
      
      const breadcrumb = document.getElementById('breadcrumb-path');
      if (breadcrumb) {
        breadcrumb.textContent = `src / ${tab.name}`;
      }
      
      this.updateLineNumbers();
      this.updateStatus();
    }
    this.renderTabs();
  },

  renderTabs() {
    const container = document.getElementById('editor-tabs');
    if (this.tabs.length === 0) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = this.tabs.map(t => {
      let icon = 'file-code';
      let color = 'var(--text3)';
      if(t.lang === 'html') { icon = 'file-code-2'; color = '#E34F26'; }
      else if(t.lang === 'css') { icon = 'palette'; color = '#1572B6'; }
      else if(t.lang === 'javascript') { icon = 'file-json'; color = '#F7DF1E'; }
      else if(t.lang === 'python') { icon = 'terminal'; color = '#3776AB'; }
      else if(t.lang === 'typescript') { icon = 'file-type'; color = '#3178C6'; }
      return `
      <div class="editor-tab ${t.id === this.activeTab ? 'active' : ''}" onclick="Editor.switchTab('${t.id}')" ondblclick="Editor.renameTab('${t.id}')">
        <i data-lucide="${icon}" style="width:16px;height:16px;color:${color}"></i>
        ${Main.escHtml(t.name)}
        <span class="icon-btn" style="width:16px;height:16px;padding:0;margin-right:8px" onclick="event.stopPropagation(); Editor.closeTab('${t.id}')">
          <i data-lucide="x" style="width:12px;height:12px"></i>
        </span>
      </div>
    `}).join('');
    lucide.createIcons();
  },

  changeLang(lang) {
    document.getElementById('editor-lang-status').textContent = lang.toUpperCase();
    const tab = this.tabs.find(t => t.id === this.activeTab);
    if (tab) {
      tab.lang = lang;
      const exts = { python:'py', javascript:'js', typescript:'ts', html:'html', css:'css', sql:'sql', bash:'sh', json:'json', java:'java', cpp:'cpp', markdown:'md' };
      tab.name = `${tab.name.split('.')[0]}.${exts[lang] || lang}`;
      this.renderTabs();
    }
  },

  formatCode() {
    UI.toast('تم التنسيق التلقائي بنجاح', 'success');
  },

  runCode() {
    if (this.tabs.length === 0) { UI.toast('لا توجد ملفات!', 'error'); return; }

    const htmlTab = this.tabs.find(t => t.lang === 'html');
    const cssTab = this.tabs.find(t => t.lang === 'css');
    const jsTab = this.tabs.find(t => t.lang === 'javascript');

    if (htmlTab || cssTab || jsTab) {
      this.openFullPreview();
    } else {
      const code = document.getElementById('code-editor').value.trim();
      if (!code) { UI.toast('الكود فارغ!', 'error'); return; }
      const lang = document.getElementById('lang-select').value;
      if (lang === 'javascript') {
        try {
          let output = '';
          const oldLog = console.log;
          console.log = (...args) => { output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\n'; };
          eval(code);
          console.log = oldLog;
          if (output) UI.toast('النتيجة: ' + output.substring(0, 100), 'success');
          else UI.toast('تم التشغيل بنجاح (بدون مخرجات)', 'success');
        } catch (e) { UI.toast('خطأ: ' + e.message, 'error'); }
      } else {
        document.getElementById('chat-input').value = `شغّل أو حاكي الكود التالي:\n\`\`\`${lang}\n${code}\n\`\`\``;
        Main.sendMessage();
        if (window.innerWidth <= 768) this.toggleSplitScreen();
      }
    }
  },

  closePreview() {
    const overlay = document.getElementById('editor-preview-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  explainCode() { this.sendToAI('اشرح هذا الكود بالتفصيل بالعربية:'); },
  optimizeCode() { this.sendToAI('حسّن هذا الكود من ناحية الأداء والقراءة:'); },
  fixCode() { this.sendToAI('اكتشف وأصلح الأخطاء في هذا الكود إن وجدت:'); },

  optimizeAll() {
    if (this.tabs.length === 0) { UI.toast('لا توجد ملفات!', 'error'); return; }
    this.saveCurrentTab();
    let allCode = this.tabs.map(t => `--- ${t.name} (${t.lang}) ---\n${t.content}`).join('\n\n');
    document.getElementById('chat-input').value = `حسّن جميع الأكواد التالية واكتب كل كود منها في code block منفصل مع ذكر اللغة:\n\n${allCode}`;
    Main.sendMessage();
    UI.toast('جاري تحسين كل الأكواد...', 'info');
  },

  sendSelectionToChat() {
    const editor = document.getElementById('code-editor');
    const selected = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    if (!selected) { UI.toast('حدد جزءاً من الكود أولاً', 'error'); return; }
    const tab = this.tabs.find(t => t.id === this.activeTab);
    const lang = tab ? tab.lang : 'text';
    document.getElementById('chat-input').value = `عدّل الكود التالي:\n\`\`\`${lang}\n${selected}\n\`\`\`\n`;
    document.getElementById('chat-input').focus();
    UI.toast('تم نسخ الكود المحدد للشات', 'info');
  },

  sendToAI(promptText) {
    const code = document.getElementById('code-editor').value.trim();
    if (!code) { UI.toast('الكود فارغ!', 'error'); return; }
    const lang = document.getElementById('lang-select').value;
    document.getElementById('chat-input').value = `${promptText}\n\`\`\`${lang}\n${code}\n\`\`\``;
    Main.sendMessage();
    if(window.innerWidth <= 768) this.toggleSplitScreen(); 
  },

  copyEditor() {
    const code = document.getElementById('code-editor').value;
    if (!code) { UI.toast('لا يوجد كود للنسخ', 'error'); return; }
    navigator.clipboard.writeText(code).then(() => UI.toast('تم نسخ الكود!', 'success'));
  },

  downloadCode() {
    const code = document.getElementById('code-editor').value;
    if (!code) { UI.toast('لا يوجد كود للتحميل', 'error'); return; }
    const tab = this.tabs.find(t => t.id === this.activeTab);
    const blob = new Blob([code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = tab ? tab.name : 'code.txt';
    a.click();
    UI.toast('تم تحميل الملف', 'success');
  },

  downloadAll() {
    if (this.tabs.length === 0) { UI.toast('لا توجد ملفات!', 'error'); return; }
    this.saveCurrentTab();
    this.tabs.forEach(tab => {
      const blob = new Blob([tab.content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = tab.name;
      a.click();
    });
    UI.toast(`تم تحميل ${this.tabs.length} ملفات`, 'success');
  },

  clearEditor() {
    if (confirm('هل تريد مسح الكود الحالي؟')) {
      document.getElementById('code-editor').value = '';
      this.updateLineNumbers();
      this.updateStatus();
      this.saveCurrentTab();
      UI.toast('تم المسح', 'info');
    }
  },

  toggleSearch() {
    const panel = document.getElementById('search-replace-panel');
    if (panel) {
      panel.classList.toggle('show');
      if (panel.classList.contains('show')) {
        document.getElementById('search-input').focus();
      }
    }
  },

  findNext() {
    const searchVal = document.getElementById('search-input').value;
    const editor = document.getElementById('code-editor');
    if (!searchVal) return;
    const text = editor.value;
    const startPos = editor.selectionEnd;
    let idx = text.indexOf(searchVal, startPos);
    if (idx === -1) idx = text.indexOf(searchVal, 0);
    if (idx !== -1) {
      editor.focus();
      editor.setSelectionRange(idx, idx + searchVal.length);
      this.updateStatus();
    } else {
      UI.toast('لم يتم العثور على التطابق', 'info');
    }
  },

  replaceText() {
    const searchVal = document.getElementById('search-input').value;
    const replaceVal = document.getElementById('replace-input').value;
    const editor = document.getElementById('code-editor');
    if (!searchVal) return;
    if (editor.selectionStart !== editor.selectionEnd && editor.value.substring(editor.selectionStart, editor.selectionEnd) === searchVal) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + replaceVal + editor.value.substring(end);
      editor.setSelectionRange(start, start + replaceVal.length);
      this.saveCurrentTab();
      this.updateLineNumbers();
    }
    this.findNext();
  },

  openFullPreview() {
    if (this.tabs.length === 0) { UI.toast('لا توجد ملفات!', 'error'); return; }
    this.saveCurrentTab();

    const htmlTab = this.tabs.find(t => t.lang === 'html');
    const cssTab = this.tabs.find(t => t.lang === 'css');
    const jsTab = this.tabs.find(t => t.lang === 'javascript');

    if (!htmlTab && !cssTab && !jsTab) { UI.toast('لا توجد ملفات ويب للمعاينة', 'error'); return; }

    const htmlCode = htmlTab ? htmlTab.content : '<html><body></body></html>';
    const cssCode = cssTab ? `<style>${cssTab.content}</style>` : '';
    const jsCode = jsTab ? `<script>${jsTab.content}<\/script>` : '';

    let fullDoc = htmlCode;
    if (!fullDoc.includes('<head>')) {
      fullDoc = `<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">${cssCode}</head><body>${fullDoc}${jsCode}</body></html>`;
    } else {
      fullDoc = fullDoc.replace('</head>', `${cssCode}</head>`);
      fullDoc = fullDoc.replace('</body>', `${jsCode}</body>`);
    }

    const overlay = document.getElementById('fullscreen-preview');
    const iframe = document.getElementById('fp-iframe');
    iframe.srcdoc = fullDoc;
    overlay.classList.add('active');
    document.getElementById('fp-title').textContent = htmlTab ? htmlTab.name : 'معاينة الموقع';
    lucide.createIcons();
    UI.toast('تم فتح المعاينة بملء الشاشة', 'info');
  },

  closeFullPreview() {
    const overlay = document.getElementById('fullscreen-preview');
    overlay.classList.remove('active');
    this.regionSelectActive = false;
    const regionBtn = document.getElementById('fp-region-btn');
    if (regionBtn) regionBtn.classList.remove('active');
    document.getElementById('fp-region-overlay').style.display = 'none';
  },

  refreshPreview() {
    this.saveCurrentTab();
    const htmlTab = this.tabs.find(t => t.lang === 'html');
    const cssTab = this.tabs.find(t => t.lang === 'css');
    const jsTab = this.tabs.find(t => t.lang === 'javascript');

    const htmlCode = htmlTab ? htmlTab.content : '<html><body></body></html>';
    const cssCode = cssTab ? `<style>${cssTab.content}</style>` : '';
    const jsCode = jsTab ? `<script>${jsTab.content}<\/script>` : '';

    let fullDoc = htmlCode;
    if (!fullDoc.includes('<head>')) {
      fullDoc = `<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">${cssCode}</head><body>${fullDoc}${jsCode}</body></html>`;
    } else {
      fullDoc = fullDoc.replace('</head>', `${cssCode}</head>`);
      fullDoc = fullDoc.replace('</body>', `${jsCode}</body>`);
    }

    document.getElementById('fp-iframe').srcdoc = fullDoc;
    UI.toast('تم تحديث المعاينة', 'success');
  },

  regionSelectActive: false,
  regionStart: null,

  toggleRegionSelect() {
    this.regionSelectActive = !this.regionSelectActive;
    const overlay = document.getElementById('fp-region-overlay');
    const btn = document.getElementById('fp-region-btn');
    const rect = document.getElementById('fp-region-rect');

    if (this.regionSelectActive) {
      overlay.style.display = 'block';
      btn.classList.add('active');
      rect.style.display = 'none';
      UI.toast('حدد المنطقة المراد تعديلها بالسحب', 'info');

      overlay.onmousedown = (e) => {
        this.regionStart = { x: e.offsetX, y: e.offsetY };
        rect.style.display = 'block';
        rect.style.left = e.offsetX + 'px';
        rect.style.top = e.offsetY + 'px';
        rect.style.width = '0px';
        rect.style.height = '0px';
      };
      overlay.onmousemove = (e) => {
        if (!this.regionStart) return;
        const w = e.offsetX - this.regionStart.x;
        const h = e.offsetY - this.regionStart.y;
        rect.style.left = (w < 0 ? e.offsetX : this.regionStart.x) + 'px';
        rect.style.top = (h < 0 ? e.offsetY : this.regionStart.y) + 'px';
        rect.style.width = Math.abs(w) + 'px';
        rect.style.height = Math.abs(h) + 'px';
      };
      overlay.onmouseup = (e) => {
        if (!this.regionStart) return;
        const endX = e.offsetX;
        const endY = e.offsetY;
        const region = {
          x: Math.min(this.regionStart.x, endX),
          y: Math.min(this.regionStart.y, endY),
          w: Math.abs(endX - this.regionStart.x),
          h: Math.abs(endY - this.regionStart.y)
        };
        this.regionStart = null;

        if (region.w > 20 && region.h > 20) {
          const chatInput = document.getElementById('fp-chat-input');
          chatInput.placeholder = `عدّل المنطقة (${region.x},${region.y} → ${region.x + region.w},${region.y + region.h})...`;
          chatInput.focus();
          chatInput.dataset.region = JSON.stringify(region);
          UI.toast('تم تحديد المنطقة! اكتب التعديل المطلوب', 'success');
        } else {
          rect.style.display = 'none';
        }
      };

      overlay.ontouchstart = (e) => {
        const t = e.touches[0];
        const r = overlay.getBoundingClientRect();
        this.regionStart = { x: t.clientX - r.left, y: t.clientY - r.top };
        rect.style.display = 'block';
        rect.style.left = this.regionStart.x + 'px';
        rect.style.top = this.regionStart.y + 'px';
      };
      overlay.ontouchmove = (e) => {
        if (!this.regionStart) return;
        e.preventDefault();
        const t = e.touches[0];
        const r = overlay.getBoundingClientRect();
        const cx = t.clientX - r.left;
        const cy = t.clientY - r.top;
        rect.style.left = Math.min(cx, this.regionStart.x) + 'px';
        rect.style.top = Math.min(cy, this.regionStart.y) + 'px';
        rect.style.width = Math.abs(cx - this.regionStart.x) + 'px';
        rect.style.height = Math.abs(cy - this.regionStart.y) + 'px';
      };
      overlay.ontouchend = (e) => {
        this.regionStart = null;
        const chatInput = document.getElementById('fp-chat-input');
        chatInput.focus();
        UI.toast('تم تحديد المنطقة! اكتب التعديل', 'success');
      };

    } else {
      overlay.style.display = 'none';
      btn.classList.remove('active');
      rect.style.display = 'none';
      overlay.onmousedown = null;
      overlay.onmousemove = null;
      overlay.onmouseup = null;
    }
  },

  togglePreviewChat() {
    const chatbar = document.getElementById('fp-chatbar');
    const btn = document.getElementById('fp-toggle-chat');
    chatbar.classList.toggle('hidden');
    const isHidden = chatbar.classList.contains('hidden');
    btn.innerHTML = `<i data-lucide="${isHidden ? 'chevron-up' : 'chevron-down'}" style="width:16px;height:16px"></i>`;
    lucide.createIcons();
  },

  sendPreviewMessage() {
    const input = document.getElementById('fp-chat-input');
    const text = input.value.trim();
    if (!text) return;

    let prompt = text;
    if (input.dataset.region) {
      const region = JSON.parse(input.dataset.region);
      prompt = `عدّل المنطقة التي إحداثياتها تقريباً (x:${region.x}, y:${region.y}, عرض:${region.w}, ارتفاع:${region.h}) في الموقع. التعديل المطلوب: ${text}`;
      delete input.dataset.region;
      input.placeholder = 'اكتب تعديلاتك هنا...';
      document.getElementById('fp-region-rect').style.display = 'none';
    }

    this.saveCurrentTab();
    let allCode = this.tabs.map(t => `--- ${t.name} (${t.lang}) ---\n${t.content}`).join('\n\n');
    document.getElementById('chat-input').value = `${prompt}\n\nالأكواد الحالية:\n${allCode}`;
    Main.sendMessage();
    input.value = '';
    UI.toast('جاري تطبيق التعديل...', 'info');
  }
};

window.addEventListener('DOMContentLoaded', () => Editor.init());
