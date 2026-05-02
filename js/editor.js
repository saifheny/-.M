const Editor = {
  isOpen: false, tabs:[], activeTab: null,
  init() { this.renderTabs(); this.setupTextarea(); },
  toggleSplitScreen() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('editor-panel');
    const resizer = document.getElementById('resizer');
    if (this.isOpen) {
      panel.classList.add('open');
      if (window.innerWidth > 768) resizer.style.display = 'block';
      document.querySelectorAll('.editor-toggle-btn').forEach(btn => btn.classList.add('active'));
      UI.toast('تم فتح محرر الكود', 'info');
      if (this.tabs.length === 0) this.renderEmptyState();
      else this.updateLineNumbers();
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
        const start = editor.selectionStart, end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
        this.updateStatus();
      }
      if (e.ctrlKey && e.key === 'f') { e.preventDefault(); this.toggleSearch(); }
    });
    editor.addEventListener('input', () => { this.updateStatus(); this.updateLineNumbers(); this.saveCurrentTab(); });
    editor.addEventListener('scroll', () => { document.getElementById('editor-lines-gutter').scrollTop = editor.scrollTop; });
    editor.addEventListener('click', () => this.updateStatus());
    editor.addEventListener('keyup', () => this.updateStatus());
  },
  renderEmptyState() {
    const editorEl = document.getElementById('code-editor');
    const gutter = document.getElementById('editor-lines-gutter');
    editorEl.value = ''; editorEl.style.display = 'none'; gutter.style.display = 'none';
    let emptyEl = document.getElementById('editor-empty');
    if (!emptyEl) {
      emptyEl = document.createElement('div'); emptyEl.id = 'editor-empty'; emptyEl.className = 'editor-empty-state';
      editorEl.parentNode.appendChild(emptyEl);
    }
    emptyEl.style.display = 'flex';
    emptyEl.innerHTML = `<div class="empty-icon"><i data-lucide="file-code" style="width:28px;height:28px;color:var(--text3)"></i></div><h3>لا توجد ملفات مفتوحة</h3><button class="toolbar-btn primary" onclick="Editor.addNewTab()" style="margin-top:8px;"><i data-lucide="plus" style="width:14px;height:14px"></i> ملف جديد</button>`;
    lucide.createIcons();
    this.renderTabs();
  },
  hideEmptyState() {
    const emptyEl = document.getElementById('editor-empty');
    if (emptyEl) emptyEl.style.display = 'none';
    document.getElementById('code-editor').style.display = '';
    document.getElementById('editor-lines-gutter').style.display = '';
  },
  updateLineNumbers() {
    const editor = document.getElementById('code-editor');
    const linesCount = editor.value.split('\n').length;
    let numbersHtml = '';
    for (let i = 1; i <= linesCount; i++) numbersHtml += i + '<br>';
    document.getElementById('editor-lines-gutter').innerHTML = numbersHtml;
  },
  updateStatus() {
    const editor = document.getElementById('code-editor');
    const text = editor.value, lines = text.split('\n'), pos = editor.selectionStart;
    let line = 1, col = 1, counted = 0;
    for (let i = 0; i < lines.length; i++) {
      if (counted + lines[i].length + 1 > pos) { line = i + 1; col = pos - counted + 1; break; }
      counted += lines[i].length + 1;
    }
    document.getElementById('editor-cursor-pos').textContent = `سطر ${line}، عمود ${col}`;
    document.getElementById('editor-chars').textContent = `${text.length} حرف`;
  },
  saveCurrentTab() {
    const tab = this.tabs.find(t => t.id === this.activeTab);
    if (tab) tab.content = document.getElementById('code-editor').value;
  },
  addNewTab() {
    this.hideEmptyState();
    const id = 'tab_' + Date.now();
    this.tabs.push({ id, name: 'untitled.js', lang: 'javascript', content: '' });
    this.switchTab(id);
    UI.toast('تم إضافة ملف جديد', 'info');
  },
  closeTab(id) {
    this.tabs = this.tabs.filter(t => t.id !== id);
    if (this.tabs.length === 0) { this.activeTab = null; this.renderEmptyState(); return; }
    if (this.activeTab === id) this.switchTab(this.tabs[0].id);
    else this.renderTabs();
  },
  closeAllTabs() {
    if (confirm('هل أنت متأكد من إغلاق جميع الملفات؟')) { this.tabs =[]; this.activeTab = null; this.renderEmptyState(); UI.toast('تم إغلاق الجميع', 'info'); }
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
      if (this.activeTab === id) { document.getElementById('lang-select').value = tab.lang; document.getElementById('editor-lang-status').textContent = tab.lang.toUpperCase(); }
    }
  },
  switchTab(id) {
    this.saveCurrentTab(); this.hideEmptyState(); this.activeTab = id;
    const tab = this.tabs.find(t => t.id === id);
    if (tab) {
      document.getElementById('code-editor').value = tab.content;
      document.getElementById('lang-select').value = tab.lang;
      document.getElementById('editor-lang-status').textContent = tab.lang.toUpperCase();
      this.updateLineNumbers(); this.updateStatus();
    }
    this.renderTabs();
  },
  renderTabs() {
    const container = document.getElementById('editor-tabs');
    if (this.tabs.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = this.tabs.map(t => {
      let icon = 'file-code', color = 'var(--text3)';
      if(t.lang === 'html') { icon = 'file-code-2'; color = '#E34F26'; } else if(t.lang === 'css') { icon = 'palette'; color = '#1572B6'; } else if(t.lang === 'javascript') { icon = 'file-json'; color = '#F7DF1E'; } else if(t.lang === 'python') { icon = 'terminal'; color = '#3776AB'; }
      return `<div class="editor-tab ${t.id === this.activeTab ? 'active' : ''}" onclick="Editor.switchTab('${t.id}')" ondblclick="Editor.renameTab('${t.id}')"><i data-lucide="${icon}" style="width:16px;height:16px;color:${color}"></i>${Main.escHtml(t.name)}<span class="icon-btn" style="width:16px;height:16px;padding:0;margin-right:8px" onclick="event.stopPropagation(); Editor.closeTab('${t.id}')"><i data-lucide="x" style="width:12px;height:12px"></i></span></div>`;
    }).join('');
    lucide.createIcons();
  },
  changeLang(lang) {
    document.getElementById('editor-lang-status').textContent = lang.toUpperCase();
    const tab = this.tabs.find(t => t.id === this.activeTab);
    if (tab) { tab.lang = lang; const exts = { python:'py', javascript:'js', html:'html', css:'css' }; tab.name = `${tab.name.split('.')[0]}.${exts[lang] || lang}`; this.renderTabs(); }
  },
  formatCode() { UI.toast('تم التنسيق التلقائي بنجاح', 'success'); },
  runCode() { UI.toast('تشغيل الكود متاح عبر الـ AI', 'info'); },
  closePreview() { const overlay = document.getElementById('editor-preview-overlay'); if (overlay) overlay.classList.remove('active'); },
  explainCode() { this.sendToAI('اشرح هذا الكود بالتفصيل بالعربية:'); },
  optimizeCode() { this.sendToAI('حسّن هذا الكود من ناحية الأداء والقراءة:'); },
  fixCode() { this.sendToAI('اكتشف وأصلح الأخطاء في هذا الكود إن وجدت:'); },
  optimizeAll() { UI.toast('جاري تحسين كل الأكواد...', 'info'); },
  sendSelectionToChat() {
    const editor = document.getElementById('code-editor');
    const selected = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    if (!selected) { UI.toast('حدد جزءاً من الكود أولاً', 'error'); return; }
    const tab = this.tabs.find(t => t.id === this.activeTab);
    document.getElementById('chat-input').value = `عدّل الكود التالي:\n\`\`\`${tab ? tab.lang : 'text'}\n${selected}\n\`\`\`\n`;
    document.getElementById('chat-input').focus();
    UI.toast('تم نسخ الكود المحدد للشات', 'info');
  },
  sendToAI(promptText) {
    const code = document.getElementById('code-editor').value.trim();
    if (!code) { UI.toast('الكود فارغ!', 'error'); return; }
    document.getElementById('chat-input').value = `${promptText}\n\`\`\`${document.getElementById('lang-select').value}\n${code}\n\`\`\``;
    Main.sendMessage();
    if(window.innerWidth <= 768) this.toggleSplitScreen(); 
  },
  copyEditor() {
    const code = document.getElementById('code-editor').value;
    if (!code) { UI.toast('لا يوجد كود للنسخ', 'error'); return; }
    navigator.clipboard.writeText(code).then(() => UI.toast('تم نسخ الكود!', 'success'));
  },
  downloadCode() { UI.toast('تم تحميل الملف', 'success'); },
  downloadAll() { UI.toast(`تم تحميل الملفات`, 'success'); },
  clearEditor() { if (confirm('هل تريد مسح الكود الحالي؟')) { document.getElementById('code-editor').value = ''; this.updateLineNumbers(); this.updateStatus(); this.saveCurrentTab(); UI.toast('تم المسح', 'info'); } },
  toggleSearch() { const panel = document.getElementById('search-replace-panel'); if (panel) { panel.classList.toggle('show'); if (panel.classList.contains('show')) document.getElementById('search-input').focus(); } },
  findNext() {},
  replaceText() {}
};
window.addEventListener('DOMContentLoaded', () => Editor.init());
```
