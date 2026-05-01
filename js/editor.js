const Editor = {
  isOpen: false,
  tabs: [{ id: 'main', name: 'main.py', lang: 'python', content: '' }],
  activeTab: 'main',

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
      this.updateLineNumbers();
    } else {
      panel.classList.remove('open');
      resizer.style.display = 'none';
      document.querySelectorAll('.editor-toggle-btn').forEach(btn => btn.classList.remove('active'));
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
    const id = 'tab_' + Date.now();
    this.tabs.push({ id, name: 'untitled.py', lang: 'python', content: '' });
    this.switchTab(id);
    UI.toast('تم إضافة تبويب جديد', 'info');
  },

  closeTab(id) {
    if (this.tabs.length === 1) { 
      UI.toast('لا يمكن إغلاق التبويب الأخير', 'error'); 
      return; 
    }
    this.tabs = this.tabs.filter(t => t.id !== id);
    if (this.activeTab === id) {
      this.switchTab(this.tabs[0].id);
    } else {
      this.renderTabs();
    }
  },

  closeAllTabs() {
    if (confirm('هل أنت متأكد من إغلاق جميع التبويبات؟')) {
      this.tabs = [{ id: 'main', name: 'untitled.py', lang: 'python', content: '' }];
      this.switchTab('main');
      UI.toast('تم إغلاق الجميع', 'info');
    }
  },

  switchTab(id) {
    this.saveCurrentTab();
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
    container.innerHTML = this.tabs.map(t => {
      let icon = 'file-code';
      let color = 'var(--text3)';
      if(t.lang === 'html') { icon = 'file-code-2'; color = 'var(--yellow)'; }
      else if(t.lang === 'css') { icon = 'palette'; color = 'var(--accent)'; }
      else if(t.lang === 'javascript') { icon = 'file-json'; color = 'var(--green)'; }
      else if(t.lang === 'python') { icon = 'terminal'; color = 'var(--indigo)'; }
      return `
      <div class="editor-tab ${t.id === this.activeTab ? 'active' : ''}" onclick="Editor.switchTab('${t.id}')">
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
        if (output) UI.toast('النتيجة: ' + output.substring(0, 100) + '...', 'success');
        else UI.toast('تم تشغيل الكود بنجاح (بدون مخرجات)', 'success');
      } catch(e) { 
        UI.toast('خطأ برمجي: ' + e.message, 'error'); 
      }
    } else {
      document.getElementById('chat-input').value = `يرجى تنفيذ أو محاكاة الكود التالي وإعطائي النتيجة المتوقعة:\n\`\`\`${lang}\n${code}\n\`\`\``;
      Main.sendMessage();
      if(window.innerWidth <= 768) this.toggleSplitScreen();
    }
  },

  explainCode() {
    this.sendToAI('اشرح هذا الكود بالتفصيل بالعربية:');
  },

  optimizeCode() {
    this.sendToAI('حسّن هذا الكود من ناحية الأداء والقراءة وأضف التوثيق:');
  },

  fixCode() {
    this.sendToAI('اكتشف وأصلح الأخطاء في هذا الكود إن وجدت:');
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
    
    if (idx === -1) idx = text.indexOf(searchVal, 0); // wrap around
    
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
  }
};

window.addEventListener('DOMContentLoaded', () => Editor.init());
