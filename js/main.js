const Main = {
  chats: [],
  currentChatId: null,
  messages: [],
  uploadedFiles: [],
  currentModel: 'default-pro',
  currentMode: 'general',
  isLoading: false,
  totalStorage: 0,
  stats: { msgs: 0, chats: 0, tokens: 0 },

  systemPrompts: {
    general: 'أنت مساعد ذكاء اصطناعي احترافي (AI Agent Pro). أجب بالعربية الفصحى أو العامية حسب سياق المستخدم. استخدم Markdown بوضوح. يمكن تلوين الواجهة للمستخدم عبر [SET_COLOR:blue|green|red|purple|cyan] وتغيير المظهر عبر [SET_THEME:dark|light|oled]. لتوليد صورة اعرض وصفاً بالإنجليزية داخل [IMAGE: English description]. لا تكتب أكواداً إلا إذا طُلب منك ذلك صراحة.',
    code: 'أنت مهندس برمجيات كبير. عند طلب موقع أو تطبيق: اسأل عن المتطلبات إن كانت غامضة، ثم قدّم ملفات كاملة في أكواد منفصلة مع اسم الملف في أول سطر التعليق المناسب للغة. استخدم HTML/CSS/JS حديثاً، تصميماً متجاوباً (Grid/Flexbox)، وبدون كود ضارر أو اعتماد على مصادر غير موثوقة. لا تُجبر المستخدم على توقيع أو علامة تجارية في الكود.',
    translate: 'أنت مترجم محترف. ترجم بدقة مع المصطلحات التقنية. لا تضع الترجمة داخل سلاسل أكواد Markdown إلا إذا كان المصدر نفسه كوداً.',
    analyze: 'أنت محلل بيانات. قدّم تحليلاً منظماً، قوائم، وجداول Markdown عند الحاجة، واستنتاجات عملية.',
    creative: 'أنت كاتب إبداعي. اكتب بوضوح ولياقة ولغة جذابة مناسبة للجمهور.'
  },

  ALL_MODELS: {
    openai: {
      name: 'OpenAI', icon: 'sparkles', color: 'var(--text)', bg: 'rgba(255,255,255,0.1)', url: 'https://api.openai.com/v1/chat/completions',
      models: [
        { id: 'gpt-5.5-pro', name: 'GPT-5.5 Pro', actualId: 'gpt-5.5-pro', desc: 'أحدث وأذكى نموذج', isFree: false },
        { id: 'gpt-5.5', name: 'GPT-5.5', actualId: 'gpt-5.5', desc: 'سريع وقوي', isFree: false },
        { id: 'gpt-5.4-pro', name: 'GPT-5.4 Pro', actualId: 'gpt-5.4-pro', desc: 'قدرات عالية', isFree: false },
        { id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini', actualId: 'gpt-5.4-mini', desc: 'سريع جداً للردود', isFree: true },
        { id: 'gpt-4o', name: 'GPT-4o', actualId: 'gpt-4o', desc: 'كفاءة ممتازة', isFree: true }
      ]
    },
    gemini: {
      name: 'Google Gemini', icon: 'zap', color: 'var(--accent)', bg: 'rgba(59,130,246,0.1)', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      models: [
        { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', actualId: 'gemini-3.1-pro-preview', desc: 'تحليل دقيق وعميق', isFree: false },
        { id: 'gemini-3.0-pro', name: 'Gemini 3.0 Pro', actualId: 'gemini-3-pro-preview', desc: 'قدرات ممتازة', isFree: false },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', actualId: 'gemini-2.5-pro', desc: 'استقرار تام', isFree: false },
        { id: 'gemini-3.1-flash', name: 'Gemini 3.1 Flash Lite', actualId: 'gemini-3.1-flash-lite-preview', desc: 'سريع جداً', isFree: true },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', actualId: 'gemini-2.5-flash', desc: 'أداء متوازن', isFree: true }
      ]
    },
    anthropic: {
      name: 'Anthropic Claude', icon: 'book', color: 'var(--yellow)', bg: 'rgba(245,158,11,0.1)', url: 'https://api.anthropic.com/v1/messages',
      models: [
        { id: 'claude-4-opus', name: 'Claude 4.0 Opus', actualId: 'claude-4-opus-20260229', desc: 'أقصى قدرات التحليل', isFree: false },
        { id: 'claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', actualId: 'claude-3-7-sonnet-20250219', desc: 'كتابة وتحليل متوازن', isFree: false },
        { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', actualId: 'claude-3-5-haiku-20241022', desc: 'سريع واقتصادي', isFree: true }
      ]
    },
    groq: {
      name: 'Meta / Groq', icon: 'box', color: 'var(--red)', bg: 'rgba(239,68,68,0.1)', url: 'https://api.groq.com/openai/v1/chat/completions',
      models: [
        { id: 'llama-4-405b', name: 'Llama 4 405B', actualId: 'llama-3.3-70b-versatile', desc: 'استنتاج هائل', isFree: false },
        { id: 'llama-4-90b', name: 'Llama 4 90B', actualId: 'llama-3.3-70b-versatile', desc: 'مفتوح المصدر وقوي', isFree: false },
        { id: 'llama-4-8b', name: 'Llama 4 8B', actualId: 'llama-3.1-8b-instant', desc: 'أسرع استجابة ممكنة', isFree: true },
        { id: 'llama-vision', name: 'Llama 3.2 Vision', actualId: 'llama-3.2-11b-vision-preview', desc: 'صور وملفات متعددة الوسائط', isFree: true },
        { id: 'gemma-3-27b', name: 'Gemma 3 27B', actualId: 'gemma2-9b-it', desc: 'من جوجل عبر Groq', isFree: true }
      ]
    },
    mistral: {
      name: 'Mistral AI', icon: 'wind', color: 'var(--orange)', bg: 'rgba(249,115,22,0.1)', url: 'https://api.mistral.ai/v1/chat/completions',
      models: [
        { id: 'mistral-large-2', name: 'Mistral Large 2', actualId: 'mistral-large-latest', desc: 'أقوى نماذج ميسترال', isFree: false },
        { id: 'pixtral-12b', name: 'Pixtral 12B', actualId: 'pixtral-12b-2409', desc: 'رؤية وتحليل', isFree: false },
        { id: 'mistral-small', name: 'Mistral Small', actualId: 'mistral-small-latest', desc: 'سريع للردود اليومية', isFree: true }
      ]
    },
    local: {
      name: 'محلي · رابط فقط (Ollama / LM Studio)',
      icon: 'hard-drive',
      color: 'var(--cyan)',
      bg: 'rgba(6,182,212,0.12)',
      url: 'http://127.0.0.1:11434/v1/chat/completions',
      models: [
        { id: 'local-llama32', name: 'Llama 3.2', actualId: 'llama3.2', desc: 'تثبيت Ollama: ollama pull llama3.2', isFree: true },
        { id: 'local-qwen', name: 'Qwen 2.5', actualId: 'qwen2.5', desc: 'ollama pull qwen2.5', isFree: true },
        { id: 'local-mistral', name: 'Mistral', actualId: 'mistral', desc: 'ollama pull mistral', isFree: true },
        { id: 'local-codellama', name: 'CodeLlama', actualId: 'codellama', desc: 'مناسب للبرمجة', isFree: true },
        { id: 'local-gemma', name: 'Gemma 2', actualId: 'gemma2', desc: 'ollama pull gemma2', isFree: true },
        { id: 'local-custom', name: 'نموذج مخصص', actualId: '__custom__', desc: 'اكتب الاسم في الإعدادات أسفلًا', isFree: true }
      ]
    }
  },

  init() {
    if (localStorage.getItem('ai_logged_in') !== 'true') {
      window.location.href = 'login.html';
      return;
    }
    this.loadData();
    this.setupIdleLock();
    this.newChat();
    this.setupInput();
    this.setupScrollWatcher();
    this.setupReadingProgress();
    this.setupNetworkMonitor();
    this.recoverInput();
    this.syncUserAvatar();
    const msgRoot = document.getElementById('messages');
    if (msgRoot) {
      msgRoot.addEventListener('click', (e) => {
        const btn = e.target.closest('.code-container-premium .code-action-btn');
        if (btn) {
          e.preventDefault();
          Main.copyCode(btn);
        }
      });
    }
    if (typeof marked !== 'undefined') marked.setOptions({ breaks: true });
  },

  setupIdleLock() {
    let timer;
    const reset = () => {
      clearTimeout(timer);
      const m = parseInt(localStorage.getItem('idle_lock_minutes') || '0', 10);
      if (!m || m <= 0) return;
      timer = setTimeout(() => {
        localStorage.removeItem('ai_logged_in');
        window.location.href = 'login.html';
      }, m * 60000);
    };
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(ev =>
      document.addEventListener(ev, reset, { passive: true }));
    reset();
  },

  syncUserAvatar() {
    try {
      const raw = localStorage.getItem('ai_user');
      if (!raw) return;
      const u = JSON.parse(raw);
      const av = document.querySelector('.nav-avatar');
      if (av && u.avatar) av.textContent = u.avatar;
    } catch (e) {}
  },

  loadData() {
    try {
      if (!localStorage.getItem('v2026_upgraded')) {
        localStorage.removeItem('ai_chats_pro');
        localStorage.setItem('v2026_upgraded', 'true');
        this.chats = [];
      } else {
        this.chats = JSON.parse(localStorage.getItem('ai_chats_pro') || '[]');
      }
      this.stats = JSON.parse(localStorage.getItem('ai_stats_pro') || '{"msgs":0,"chats":0,"tokens":0}');
      this.updateStatsUI();

      const elKey = localStorage.getItem('elevenlabs_api_key');
      if (elKey && document.getElementById('elevenlabs-key-input')) document.getElementById('elevenlabs-key-input').value = elKey;

      const customPrompt = localStorage.getItem('custom_prompt');
      if (customPrompt) document.getElementById('custom-system-prompt').value = customPrompt;

      const aiTone = localStorage.getItem('ai_tone');
      if (aiTone && document.getElementById('ai-tone')) document.getElementById('ai-tone').value = aiTone;

      const fontSize = localStorage.getItem('font_size');
      if (fontSize) {
        if (document.getElementById('font-size-select')) document.getElementById('font-size-select').value = fontSize;
        document.body.style.fontSize = fontSize;
      }
      const idleM = localStorage.getItem('idle_lock_minutes');
      const idleEl = document.getElementById('idle-lock-minutes');
      if (idleM && idleEl) idleEl.value = idleM;

      const persist = localStorage.getItem('persist');
      const pt = document.getElementById('persist-toggle');
      if (pt != null && persist != null) pt.checked = persist !== 'false';
      const ascroll = localStorage.getItem('autoscroll');
      const autoscEl = document.getElementById('autoscroll-toggle');
      if (autoscEl != null && ascroll != null) autoscEl.checked = ascroll !== 'false';

      const tempSaved = localStorage.getItem('temperature');
      const tempSlider = document.getElementById('temp-slider');
      const tempVal = document.getElementById('temp-val');
      if (tempSaved && tempSlider) {
        tempSlider.value = tempSaved;
        if (tempVal) tempVal.textContent = tempSaved;
      }
      const maxTokSaved = localStorage.getItem('max_tokens');
      const maxTokSel = document.getElementById('max-tokens');
      if (maxTokSaved && maxTokSel) maxTokSel.value = maxTokSaved;

      const localUrl = localStorage.getItem('local_ai_base_url');
      const localModel = localStorage.getItem('local_ai_model');
      const elLu = document.getElementById('local-ai-url');
      const elLm = document.getElementById('local-ai-model');
      if (elLu && localUrl) elLu.value = localUrl;
      if (elLm && localModel) elLm.value = localModel;

    } catch (e) { console.error('Error loading data', e); }
  },

  setupReadingProgress() {
    const msgRoot = document.getElementById('messages');
    const bar = document.getElementById('reading-progress-bar');
    if (!msgRoot || !bar) return;
    const update = () => {
      const max = msgRoot.scrollHeight - msgRoot.clientHeight;
      const p = max <= 0 ? 100 : Math.min(100, Math.round((msgRoot.scrollTop / max) * 100));
      bar.style.width = p + '%';
    };
    msgRoot.addEventListener('scroll', update, { passive: true });
    new MutationObserver(update).observe(msgRoot, { childList: true, subtree: true });
    update();
  },

  saveData() {
    if (localStorage.getItem('persist') !== 'false') {
      localStorage.setItem('ai_chats_pro', JSON.stringify(this.chats.slice(0, 50))); // Keep last 50
    }
    localStorage.setItem('ai_stats_pro', JSON.stringify(this.stats));
  },

  clearAllData() {
    if (confirm('تحذير: سيتم مسح جميع المحادثات والإعدادات. هل أنت متأكد؟')) {
      localStorage.clear();
      window.location.reload();
    }
  },

  clearStorage() {
    this.uploadedFiles = [];
    this.totalStorage = 0;
    this.updateStorageUI();
    const fl = document.getElementById('file-list');
    if (fl) fl.innerHTML = '';
    document.getElementById('attachments-preview').style.display = 'none';
    UI.toast('تم مسح الملفات المؤقتة لتوفير المساحة', 'success');
  },

  handleFileSelection(file) {
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        this.uploadedFiles.push({
          id: 'file_' + Date.now() + Math.random(),
          name: file.name || 'Pasted_Image.jpg',
          type: file.type,
          size: file.size,
          content: dataUrl
        });
        this.renderAttachments();
        this.totalStorage += file.size || 0;
        this.updateStorageUI();
      };
      img.src = URL.createObjectURL(file);
    } else {
      const reader = new FileReader();
      const textLike = (file.type && file.type.startsWith('text/')) ||
        /\.(txt|md|csv|json|html|htm|css|js|ts|py|xml|svg|yaml|yml)$/i.test(file.name || '');
      reader.onload = (e) => {
        this.uploadedFiles.push({
          id: 'file_' + Date.now() + Math.random(),
          name: file.name || 'file',
          type: file.type || (textLike ? 'text/plain' : 'application/octet-stream'),
          size: file.size,
          content: e.target.result
        });
        this.renderAttachments();
        this.totalStorage += file.size || 0;
        this.updateStorageUI();
      };
      if (textLike) reader.readAsText(file);
      else reader.readAsDataURL(file);
    }
  },

  removeFile(id) {
    const file = this.uploadedFiles.find(f => f.id === id);
    if (file) {
      this.totalStorage -= file.size;
      this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== id);
      this.renderAttachments();
      this.updateStorageUI();
    }
  },

  renderAttachments() {
    const previewEl = document.getElementById('attachments-preview');
    if (!previewEl) return;
    
    if (this.uploadedFiles.length === 0) {
      previewEl.style.display = 'none';
      previewEl.innerHTML = '';
      return;
    }
    
    previewEl.style.display = 'flex';
    previewEl.innerHTML = this.uploadedFiles.map(f => {
      if (f.type.startsWith('image/')) {
        return `
          <div class="attachment-item">
            <button class="remove-btn" onclick="Main.removeFile('${f.id}')"><i data-lucide="x" style="width:12px;height:12px"></i></button>
            <img src="${f.content}" alt="Attachment">
          </div>
        `;
      } else if (f.type.startsWith('audio/')) {
        return `
          <div class="attachment-item">
            <button class="remove-btn" onclick="Main.removeFile('${f.id}')"><i data-lucide="x" style="width:12px;height:12px"></i></button>
            <div class="file-icon"><i data-lucide="music" style="width:24px;height:24px;color:var(--accent)"></i><span>${this.escHtml(String(f.name || '').substring(0, 10))}…</span></div>
          </div>
        `;
      } else {
        return `
          <div class="attachment-item">
            <button class="remove-btn" onclick="Main.removeFile('${f.id}')"><i data-lucide="x" style="width:12px;height:12px"></i></button>
            <div class="file-icon"><i data-lucide="file" style="width:24px;height:24px;color:var(--text)"></i><span>${this.escHtml(String(f.name || '').substring(0, 10))}…</span></div>
          </div>
        `;
      }
    }).join('');
    lucide.createIcons();
  },

  newChat() {
    // Prevent creating multiple empty chats
    const currentChat = this.chats.find(c => c.id === this.currentChatId);
    if (currentChat && currentChat.messages.length === 0) {
      document.getElementById('chat-input').focus();
      return;
    }

    const id = 'chat_' + Date.now();
    const chat = { id, title: 'محادثة جديدة', messages: [], timestamp: Date.now(), starred: false };
    this.chats.unshift(chat);
    this.currentChatId = id;
    this.messages = [];

    this.stats.chats++;
    this.saveData();

    this.renderChatList();
    this.renderMessages();
    this.updateStatsUI();
    const ht = document.getElementById('header-title');
    if (ht) ht.textContent = 'مساعد الذكاء الاصطناعي';
    document.getElementById('welcome-screen').style.display = 'flex';
  },

  loadChat(id) {
    const chat = this.chats.find(c => c.id === id);
    if (!chat) return;
    this.currentChatId = id;
    this.messages = chat.messages || [];

    const ht2 = document.getElementById('header-title');
    if (ht2) ht2.textContent = chat.title;
    const starBtn = document.getElementById('star-btn');
    if (starBtn) {
      if (chat.starred) starBtn.classList.add('starred');
      else starBtn.classList.remove('starred');
    }

    this.renderChatList();
    this.renderMessages();

    if (this.messages.length > 0) {
      document.getElementById('welcome-screen').style.display = 'none';
    }

    if (window.innerWidth <= 768) UI.toggleSidebar();
  },

  starChat() {
    const chat = this.chats.find(c => c.id === this.currentChatId);
    if (!chat) return;
    chat.starred = !chat.starred;
    document.getElementById('star-btn').classList.toggle('starred', chat.starred);
    this.renderChatList();
    this.saveData();
    UI.toast(chat.starred ? 'تم التمييز بنجمة' : 'تم إزالة التمييز', 'info');
  },

  clearChat() {
    if (this.messages.length && !confirm('هل تريد مسح الرسائل؟')) return;
    this.messages = [];
    const chat = this.chats.find(c => c.id === this.currentChatId);
    if (chat) { chat.messages = []; this.saveData(); }
    this.renderMessages();
    UI.toast('تم تفريغ المحادثة', 'info');
  },

  renderChatList() {
    const list = document.getElementById('chat-list');
    if (!this.chats.length) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3)">لا توجد محادثات سابقة</div>';
      return;
    }

    let html = '';
    this.chats.forEach(c => {
      const isActive = c.id === this.currentChatId ? 'active' : '';
      const preview = c.messages.length ? c.messages[c.messages.length - 1].content.substring(0, 40) + '...' : 'ابدأ محادثة جديدة...';
      html += `
        <div class="chat-item ${isActive}" onclick="Main.loadChat('${c.id}')">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div class="chat-item-title">${c.starred ? '<i data-lucide="star" style="width:12px;height:12px;color:var(--yellow);display:inline-block;vertical-align:middle;margin-left:4px;"></i> ' : ''}${this.escHtml(c.title)}</div>
            <button class="icon-btn text-danger" style="width:24px;height:24px;padding:0" onclick="event.stopPropagation(); Main.deleteChat('${c.id}')">
              <i data-lucide="trash" style="width:12px;height:12px"></i>
            </button>
          </div>
          <div class="chat-item-preview">${this.escHtml(preview)}</div>
        </div>
      `;
    });
    list.innerHTML = html;
    lucide.createIcons();
  },

  deleteChat(id) {
    this.chats = this.chats.filter(c => c.id !== id);
    this.saveData();
    if (this.currentChatId === id) this.newChat();
    else this.renderChatList();
    UI.toast('تم حذف المحادثة', 'info');
  },

  searchHistory(query) {
    if (!query) { this.renderChatList(); return; }
    const q = query.toLowerCase();
    const filtered = this.chats.filter(c => c.title.toLowerCase().includes(q));
    const list = document.getElementById('chat-list');
    list.innerHTML = filtered.map(c => `
      <div class="chat-item ${c.id === this.currentChatId ? 'active' : ''}" onclick="Main.loadChat('${c.id}')">
        <div class="chat-item-title">${this.escHtml(c.title)}</div>
      </div>
    `).join('');
  },

  // ---- MESSAGING ----

  setupInput() {
    const input = document.getElementById('chat-input');
    
    const updatePlaceholder = () => {
      if (window.innerWidth <= 768) {
        input.placeholder = 'رسالة...';
      } else {
        input.placeholder = 'اكتب هنا... (Enter للإرسال، Shift+Enter لسطر جديد)';
      }
    };
    window.addEventListener('resize', updatePlaceholder);
    updatePlaceholder();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    input.addEventListener('paste', (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          Main.handleFileSelection(blob);
          e.preventDefault();
        }
      }
    });

    // Command Palette Shortcut (Ctrl+K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('collapsed')) {
          UI.toggleSidebar();
        }
        document.getElementById('history-search')?.focus();
        UI.toast('تم فتح قائمة الأوامر (Command Palette)', 'info');
      }
    });

    input.addEventListener('input', () => {
      const oldHeight = input.offsetHeight;
      input.style.height = 'auto';
      const newHeight = Math.min(input.scrollHeight, 200);
      input.style.height = newHeight + 'px';

      const diff = newHeight - oldHeight;
      if (diff > 0) {
        const msgContainer = document.getElementById('messages');
        msgContainer.scrollTop += diff;
      }

      const len = input.value.length;
      document.getElementById('char-count').textContent = `${len} / 8000`;
      document.getElementById('char-count').style.color = len > 7500 ? 'var(--red)' : 'var(--text3)';
    });
  },

  getApiConfig() {
    let family = 'groq';
    let actualModelId = this.currentModel;
    let apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    if (this.currentModel === 'default-pro') {
      actualModelId = 'llama-3.3-70b-versatile';
      family = 'groq';
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    } else {
      for (const [provider, data] of Object.entries(this.ALL_MODELS)) {
        const found = data.models.find(m => m.id === this.currentModel);
        if (found) {
          family = provider;
          if (found.actualId === '__custom__') {
            actualModelId = (document.getElementById('local-ai-model')?.value || localStorage.getItem('local_ai_model') || 'llama3.2').trim();
          } else {
            actualModelId = found.actualId;
          }
          apiUrl = data.url;
          break;
        }
      }
    }

    if (family === 'local') {
      let base = (document.getElementById('local-ai-url')?.value || localStorage.getItem('local_ai_base_url') || apiUrl).trim();
      if (!/^https?:\/\//i.test(base)) base = 'http://127.0.0.1:11434/v1/chat/completions';
      return { apiUrl: base, apiKey: '', actualModelId, family: 'local' };
    }

    const keys = JSON.parse(localStorage.getItem(`api_keys_${family}`) || '[]');
    const apiKey = keys[0] || '';

    if (family === 'gemini') {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${apiKey}`;
    }

    const customUrl = document.getElementById('custom-base-url')?.value || localStorage.getItem('custom_cloud_url');
    if (customUrl && customUrl.trim() !== '') apiUrl = customUrl.trim();

    return { apiUrl, apiKey, actualModelId, family };
  },

  buildAuthHeaders(family, apiKey) {
    const h = { 'Content-Type': 'application/json' };
    if (family === 'local') return h;
    if (family === 'gemini') return h;
    if (apiKey && String(apiKey).trim()) h['Authorization'] = `Bearer ${apiKey}`;
    return h;
  },

  extractSearchKeywords(text) {
    const t = (text || '').trim();
    if (!t) return 'technology';
    const stop = new Set(['ما', 'من', 'في', 'على', 'أن', 'إلى', 'هل', 'كيف', 'لماذا', 'the', 'a', 'an', 'is', 'what', 'how', 'why', 'and', 'or']);
    const words = t.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(w => w.length > 1 && !stop.has(w.toLowerCase()));
    return (words.slice(0, 6).join(' ') || t.slice(0, 48)).trim();
  },

  async fetchOpenLibrarySnippets(query) {
    try {
      const q = encodeURIComponent(String(query).slice(0, 100));
      const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=4`, { referrerPolicy: 'no-referrer' });
      if (!res.ok) return [];
      const data = await res.json();
      const docs = data.docs || [];
      return docs.map(d => {
        const title = d.title || '';
        const authors = (d.author_name && d.author_name[0]) ? d.author_name[0] : '';
        const key = d.key || '';
        const url = key ? `https://openlibrary.org${key}` : 'https://openlibrary.org';
        return `مصدر (مكتبة مفتوحة): ${title}${authors ? ' — ' + authors : ''}\nالرابط: ${url}`;
      });
    } catch (e) {
      return [];
    }
  },

  pendingVoiceBlob: null,
  pendingVoiceUrl: null,

  async sendMessage() {
    if (this.isLoading) return;
    const input = document.getElementById('chat-input');
    let text = input.value.trim();

    if (!text && !this.uploadedFiles.length && !this.pendingVoiceBlob) return;

    // Natural Language Model Switching
    const textLower = text.toLowerCase();
    let modelSwitched = false;
    if (textLower.includes('استخدم gpt-4') || textLower.includes('use gpt-4')) {
      UI.selectModel('gpt-4o', 'GPT-4o'); modelSwitched = true;
    } else if (textLower.includes('استخدم gpt-5') || textLower.includes('use gpt-5')) {
      UI.selectModel('gpt-5.4-mini', 'GPT-5.4 Mini'); modelSwitched = true;
    } else if (textLower.includes('استخدم gemini') || textLower.includes('use gemini')) {
      UI.selectModel('gemini-2.5-pro', 'Gemini 2.5 Pro'); modelSwitched = true;
    } else if (textLower.includes('استخدم claude') || textLower.includes('use claude')) {
      UI.selectModel('claude-3-7-sonnet', 'Claude 3.7 Sonnet'); modelSwitched = true;
    } else if (textLower.includes('استخدم llama') || textLower.includes('use llama')) {
      UI.selectModel('llama-4-90b', 'Llama 4 90B'); modelSwitched = true;
    }

    let displayHtml = text ? this.escHtml(text) : '';

    let imagesHtml = '';
    let otherFilesHtml = '';
    let payloadContent = null;
    let hasImages = false;

    if (this.uploadedFiles.length > 0) {
      hasImages = this.uploadedFiles.some(f => f.type.startsWith('image/'));
      
      this.uploadedFiles.forEach(f => {
        if (f.type.startsWith('image/')) {
          imagesHtml += `<img src="${f.content}" alt="Uploaded Image" style="width:100%; max-width:300px; border-radius:20px; display:block; margin-bottom:8px;">`;
        } else if (f.type.startsWith('audio/')) {
          otherFilesHtml += `<audio controls src="${f.content}" style="width:100%; max-width:300px; height:40px; border-radius:20px; margin-bottom:8px;"></audio>`;
        } else {
          otherFilesHtml += `<div class="attachment-chip"><i data-lucide="file" style="width:12px;height:12px"></i> ${this.escHtml(f.name)}</div>`;
        }
      });
    }

    // Handle pending voice
    let voiceHtml = '';
    if (this.pendingVoiceBlob) {
      if (!text) text = this.pendingVoiceTranscript; // Assign transcript to text for AI payload
      if (!text || text.trim() === '') {
        UI.toast('لم يتم التعرف على الصوت. الرجاء التحدث بوضوح.', 'error');
        this.isLoading = false;
        document.getElementById('send-btn').disabled = false;
        return;
      }
      const mins = Math.floor(this.voiceSeconds / 60).toString().padStart(2, '0');
      const secs = (this.voiceSeconds % 60).toString().padStart(2, '0');
      const bars = Array.from({ length: 24 }, () => `<div class="bar" style="height:${4 + Math.random() * 24}px"></div>`).join('');

      voiceHtml = `
      <div class="voice-preview-bar paused" style="margin-bottom: 8px;">
        <button class="voice-play-btn" onclick="Main.playAudioMsg(this, '${this.pendingVoiceUrl}')">
          <i data-lucide="play" style="width:16px;height:16px"></i>
        </button>
        <div class="voice-wave-bars">${bars}</div>
        <span class="voice-duration">${mins}:${secs}</span>
      </div>`;
      this.clearVoicePreview();
    }

    // Construct the display HTML (Images top, Voice middle, Text bottom)
    let filesContainer = '';
    if (imagesHtml || otherFilesHtml || voiceHtml) {
      filesContainer = `<div class="msg-files" style="display:flex; flex-direction:column; gap:8px; margin-bottom:8px;">${imagesHtml}${otherFilesHtml}${voiceHtml}</div>`;
      displayHtml = filesContainer + displayHtml;
    }

    let fullPayload = text;
    if (this.uploadedFiles.length > 0) {
      if (hasImages) {
        payloadContent = [{ type: 'text', text: fullPayload }];
        this.uploadedFiles.forEach(f => {
          if (f.type.startsWith('image/')) {
            payloadContent.push({
              type: 'image_url',
              image_url: { url: f.content }
            });
          }
        });
        
        const { family, actualModelId } = this.getApiConfig();
        if (family !== 'local') {
          if (family === 'groq' && !actualModelId.includes('vision')) {
            UI.selectModel('llama-vision', 'Llama 3.2 Vision');
          } else if (family === 'openai' && !actualModelId.includes('gpt-4') && !actualModelId.includes('gpt-5')) {
            UI.selectModel('gpt-4o', 'GPT-4o');
          } else if (family === 'gemini' && !actualModelId.includes('pro') && !actualModelId.includes('flash')) {
            UI.selectModel('gemini-2.5-pro', 'Gemini 2.5 Pro');
          } else if (family === 'anthropic' && !actualModelId.includes('sonnet') && !actualModelId.includes('opus')) {
            UI.selectModel('claude-3-7-sonnet', 'Claude 3.7 Sonnet');
          }
        }
      }

      // Append text context for non-image files if any
      const otherFiles = this.uploadedFiles.filter(f => !f.type.startsWith('image/'));
      if (otherFiles.length > 0) {
        const fileContexts = otherFiles.map(f => `[ملف مرفق: ${f.name}]\n${f.content || 'Binary data attached'}`).join('\n\n');
        fullPayload += `\n\n--- المرفقات ---\n${fileContexts}`;
        if (payloadContent) payloadContent[0].text = fullPayload;
      }
    }

    input.value = '';
    input.style.height = 'auto';
    sessionStorage.removeItem('draft_input');
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('attachments-preview').style.display = 'none';
    document.getElementById('attachments-preview').innerHTML = '';

    const userMsg = { role: 'user', content: fullPayload, display: displayHtml, time: this.now(), files: this.uploadedFiles.map(f => f.name), payloadContent: payloadContent };
    this.messages.push(userMsg);
    this.appendMessage(userMsg, true);

    this.uploadedFiles = [];

    const chat = this.chats.find(c => c.id === this.currentChatId);
    if (chat && chat.title === 'محادثة جديدة') {
      chat.title = text ? text.substring(0, 30) + '...' : 'محادثة تحتوي ملفات';
      const ht3 = document.getElementById('header-title');
      if (ht3) ht3.textContent = chat.title;
      this.renderChatList();
    }

    this.stats.msgs++;
    this.updateStatsUI();

    this.isLoading = true;
    document.getElementById('send-btn').disabled = true;
    const typingUI = this.showTyping();

    try {
      const customSys = document.getElementById('custom-system-prompt').value;
      let baseSys = customSys || this.systemPrompts[this.currentMode] || this.systemPrompts['general'];

      const tone = document.getElementById('ai-tone')?.value || 'default';
      if (tone === 'formal') baseSys += '\n\n**تعليمات إضافية:** يرجى الرد بنبرة رسمية، احترافية، وموضوعية تماماً.';
      else if (tone === 'casual') baseSys += '\n\n**تعليمات إضافية:** يرجى الرد بنبرة ودية، بسيطة، وقريبة للقلب كأنك تتحدث مع صديق.';
      else if (tone === 'humorous') baseSys += '\n\n**تعليمات إضافية:** يرجى الرد بنبرة فكاهية، مرحة، وبها بعض السخرية اللطيفة.';
      else if (tone === 'academic') baseSys += '\n\n**تعليمات إضافية:** يرجى الرد بنبرة أكاديمية، دقيقة، مبنية على الحقائق والمصادر.';

      const apiMessages = [{ role: 'system', content: baseSys }, ...this.messages.map(m => ({ role: m.role, content: m.payloadContent || m.content }))];

      const webToggle = document.getElementById('web-search-toggle');
      const isWebSearch = webToggle && webToggle.classList.contains('active');
      if (isWebSearch) {
        UI.toast('جاري تجميع مصادر مجانية من الويب...', 'info');
        let searchQuery = text;

        try {
          const cfg = this.getApiConfig();
          if (cfg.apiKey && cfg.apiKey.trim() !== '') {
            const queryRes = await fetch(cfg.apiUrl, {
              method: 'POST',
              headers: this.buildAuthHeaders(cfg.family, cfg.apiKey),
              body: JSON.stringify({
                model: cfg.actualModelId,
                messages: [
                  { role: 'system', content: 'You are a search query generator. Extract the main keywords from the user prompt for encyclopedia search. Output ONLY the keywords (max 6 words). No quotes, no explanations.' },
                  { role: 'user', content: text }
                ],
                temperature: 0.3,
                max_tokens: 24
              })
            });
            if (queryRes.ok) {
              const queryData = await queryRes.json();
              const raw = queryData.choices?.[0]?.message?.content;
              if (raw) searchQuery = raw.trim().replace(/['"]/g, '');
            }
          } else {
            searchQuery = this.extractSearchKeywords(text);
          }
          UI.toast(`جاري البحث عن: ${searchQuery}`, 'info');
        } catch (e) {
          console.error('Failed to optimize search query', e);
          searchQuery = this.extractSearchKeywords(text);
        }

        try {
          const [arRes, enRes, libSnips] = await Promise.all([
            fetch(`https://ar.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json&origin=*`),
            fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json&origin=*`),
            this.fetchOpenLibrarySnippets(searchQuery)
          ]);
          const [arData, enData] = await Promise.all([arRes.json(), enRes.json()]);
          let results = [];
          if (arData.query && arData.query.search.length > 0) {
            arData.query.search.slice(0, 3).forEach(r => {
              results.push(`المصدر: https://ar.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}\nالمعلومات: ${r.snippet.replace(/<[^>]+>/g, '')}`);
            });
          }
          if (enData.query && enData.query.search.length > 0) {
            enData.query.search.slice(0, 2).forEach(r => {
              results.push(`المصدر: https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, '_'))}\nالمعلومات: ${r.snippet.replace(/<[^>]+>/g, '')}`);
            });
          }
          libSnips.forEach(s => results.push(s));
          if (results.length > 0) {
            const context = results.join('\n\n');
            apiMessages[apiMessages.length - 1].content = `يرجى الإجابة على السؤال التالي وتلخيص المعلومات المستخرجة من الويب (ويكيبيديا ومكتبة Open Library — روابط فقط، بدون مفتاح API). في نهاية إجابتك أضف حسب المصادر:\n[SOURCES_JSON: [{"title":"اسم المصدر", "url":"رابط المصدر", "icon":"globe"}]]\n\nالسؤال: "${text}"\n\nمعلومات من الويب:\n${context}`;
          } else {
            UI.toast('لم يُعثر على نتائج ويب؛ سيُرسل السؤال بدون سياق خارجي.', 'info');
          }
        } catch (e) {
          console.error('Web search failed', e);
        }
      }

      const temp = parseFloat(document.getElementById('temp-slider')?.value) || 0.7;
      const maxTok = parseInt(document.getElementById('max-tokens')?.value) || 4096;

      const { apiUrl, apiKey, actualModelId, family } = this.getApiConfig();

      const needsCloudKey = family !== 'local';
      if (needsCloudKey && (!apiKey || apiKey.trim() === '')) {
        typingUI.remove();
        const noKeyMsg = { role: 'assistant', content: `[UI_WIDGET:API_KEY_REQ:${family}]`, time: this.now() };
        this.messages.push(noKeyMsg);
        this.appendMessage(noKeyMsg, true);
        this.isLoading = false;
        document.getElementById('send-btn').disabled = false;
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: this.buildAuthHeaders(family, apiKey),
        body: JSON.stringify({
          model: actualModelId,
          messages: apiMessages,
          temperature: temp,
          max_tokens: maxTok
        })
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      const aiContent = data.choices[0].message.content;

      if (data.usage && typeof data.usage.total_tokens === 'number') {
        this.stats.tokens += Math.round(data.usage.total_tokens / 1000);
      }

      let chatText = aiContent;

      // Strict Auto-extract multiple code blocks logic & Tab Overwriting
      if (aiContent.includes('```')) {
        const blocks = [...aiContent.matchAll(/```([a-z0-9+#]*)[^\n]*\n([\s\S]*?)```/gi)];
        if (blocks.length > 0) {
          let isCodeMode = (this.currentMode === 'code' || Editor.isOpen);
          let shouldOpenEditor = isCodeMode;
          let tabsToProcess = [];

          blocks.forEach((match, index) => {
            let lang = match[1] ? match[1].toLowerCase() : 'text';
            let code = match[2];

            // Try to extract filename from the first line (e.g. // script.js, <!-- index.html -->, # main.py)
            let name = '';
            let lines = code.split('\n');
            let firstLine = lines[0].trim();
            let nameMatch = firstLine.match(/^(?:\/\/|<!--|#|\/\*)\s*([a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+)/);
            if (nameMatch) {
              name = nameMatch[1];
              shouldOpenEditor = true; // If it has a filename, it's definitely a file
            } else {
              let ext = { html: 'html', css: 'css', javascript: 'js', typescript: 'ts', python: 'py' }[lang] || 'txt';
              name = `file_${Date.now()}_${index}.${ext}`;
              if (lang === 'html') name = 'index.html';
              if (lang === 'css') name = 'style.css';
              if (lang === 'javascript' || lang === 'js') name = 'script.js';
            }

            tabsToProcess.push({ name, lang, code });
          });

          if (shouldOpenEditor) {
            if (!Editor.isOpen && window.innerWidth > 768) Editor.toggleSplitScreen();

            // If we are opening the editor, remove the code from the chat text to keep it clean
            if (shouldOpenEditor) {
              chatText = chatText.replace(/```([a-z0-9+#]*)[^\n]*\n([\s\S]*?)```/gi, '').trim();
              if (!chatText) chatText = 'جاري كتابة الأكواد في المحرر الآن...';
            }

            let targetTabId = null;
            let activeCodeToType = '';

            tabsToProcess.forEach((t, index) => {
              const existingTab = Editor.tabs.find(tab => tab.name === t.name);
              if (existingTab) {
                existingTab.content = t.code; // Background tabs get instant code
                existingTab.lang = t.lang;
                targetTabId = existingTab.id;
                if (index === 0) activeCodeToType = t.code;
              } else {
                const tabId = 'tab_' + Date.now() + '_' + index;
                Editor.tabs.push({ id: tabId, name: t.name, lang: t.lang, content: t.code });
                targetTabId = tabId;
                if (index === 0) activeCodeToType = t.code;
              }
            });

            if (targetTabId) {
              // Clear the active tab content temporarily so we can type it out
              let activeTab = Editor.tabs.find(t => t.id === targetTabId);
              activeTab.content = ''; 
              Editor.switchTab(targetTabId);
              
              // Typing effect inside the editor
              let editorEl = document.getElementById('code-editor');
              let i = 0;
              editorEl.value = '';
              let chunkSize = 3; // type 3 chars at a time for speed
              
              const typeInterval = setInterval(() => {
                if (i >= activeCodeToType.length || Editor.activeTab !== targetTabId) {
                  clearInterval(typeInterval);
                  if (Editor.activeTab === targetTabId) {
                    editorEl.value = activeCodeToType;
                    activeTab.content = activeCodeToType;
                    Editor.updateStatus();
                    Editor.updateLineNumbers();
                  }
                  return;
                }
                editorEl.value += activeCodeToType.substring(i, i + chunkSize);
                i += chunkSize;
                activeTab.content = editorEl.value; // sync with tab
                Editor.updateStatus();
                if (i % 30 === 0) Editor.updateLineNumbers(); // update lines occasionally
                editorEl.scrollTop = editorEl.scrollHeight; // scroll to bottom
              }, 10);
            }
            UI.toast(`تم التقاط الأكواد! جاري الكتابة...`, 'success');
          }
        }
      }

      const aiMsg = { role: 'assistant', content: chatText, time: this.now() };
      this.messages.push(aiMsg);

      typingUI.remove();
      this.appendMessage(aiMsg, true);

    } catch (err) {
      typingUI.remove();
      let family = 'groq';
      if (this.currentModel.startsWith('local-')) family = 'local';
      else if (this.currentModel.startsWith('gpt') || this.currentModel.startsWith('o1')) family = 'openai';
      else if (this.currentModel.startsWith('gemini')) family = 'gemini';
      else if (this.currentModel.startsWith('claude')) family = 'anthropic';
      else if (this.currentModel.startsWith('mistral') || this.currentModel.startsWith('pixtral')) family = 'mistral';

      if (family !== 'local' && (err.message === 'مفتاح API غير متوفر' || (!this.getApiConfig().apiKey))) {
        const errMsg = { role: 'assistant', content: `[UI_WIDGET:API_KEY_REQ:${family}]`, time: this.now() };
        this.messages.push(errMsg);
        this.appendMessage(errMsg, true);
      } else if (err.message.includes('401')) {
        const errMsg = { role: 'assistant', content: `[UI_WIDGET:API_KEY_REQ:${family}:EXPIRED]`, time: this.now() };
        this.messages.push(errMsg);
        this.appendMessage(errMsg, true);
      } else {
        const errMsg = { role: 'assistant', content: `خطأ في الاتصال: ${err.message}. قد يكون النموذج غير متاح حالياً أو هناك ضغط على الشبكة.`, time: this.now() };
        this.messages.push(errMsg);
        this.appendMessage(errMsg, true);
      }
      UI.toast('\u062d\u062f\u062b \u062e\u0637\u0623 \u0641\u064a \u062c\u0644\u0628 \u0627\u0644\u0631\u062f', 'error');
    }

    if (chat) chat.messages = this.messages;
    this.saveData();
    this.isLoading = false;
    document.getElementById('send-btn').disabled = false;
  },

  appendMessage(msg, animate) {
    const container = document.getElementById('messages');
    const isUser = msg.role === 'user';

    const div = document.createElement('div');
    div.className = `msg-wrap ${isUser ? 'user' : ''}`;

    // Formatting
    let htmlContent = '';

    // Generative UI parsing
    if (!isUser && msg.content && msg.content.includes('[UI_WIDGET:API_KEY_REQ:')) {
      const match = msg.content.match(/\[UI_WIDGET:API_KEY_REQ:([^\]]+)\]/);
      if (match) {
        const modelFamily = match[1].split(':')[0];
        let link = 'https://console.groq.com/keys';
        let keyName = 'Groq';
        let placeholder = 'gsk_...';
        let steps = '1. \u0627\u0630\u0647\u0628 \u0625\u0644\u0649 <a href="https://console.groq.com/keys" target="_blank">Groq Console</a><br>2. \u0623\u0646\u0634\u0626 \u0645\u0641\u062a\u0627\u062d API \u062c\u062f\u064a\u062f (\u0645\u062c\u0627\u0646\u064a)<br>3. \u0627\u0646\u0633\u062e\u0647 \u0648\u0627\u0644\u0635\u0642\u0647 \u0647\u0646\u0627';
        if (modelFamily === 'openai') { link = 'https://platform.openai.com/api-keys'; keyName = 'OpenAI'; placeholder = 'sk-...'; steps = '1. \u0627\u0630\u0647\u0628 \u0625\u0644\u0649 <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a><br>2. \u0623\u0646\u0634\u0626 \u0645\u0641\u062a\u0627\u062d API \u062c\u062f\u064a\u062f<br>3. \u0627\u0646\u0633\u062e\u0647 \u0648\u0627\u0644\u0635\u0642\u0647 \u0647\u0646\u0627'; }
        if (modelFamily === 'gemini') { link = 'https://aistudio.google.com/app/apikey'; keyName = 'Google Gemini'; placeholder = 'AIza...'; steps = '1. \u0627\u0630\u0647\u0628 \u0625\u0644\u0649 <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a><br>2. \u0623\u0646\u0634\u0626 \u0645\u0641\u062a\u0627\u062d API (\u0645\u062c\u0627\u0646\u064a)<br>3. \u0627\u0646\u0633\u062e\u0647 \u0648\u0627\u0644\u0635\u0642\u0647 \u0647\u0646\u0627'; }
        if (modelFamily === 'anthropic') { link = 'https://console.anthropic.com/settings/keys'; keyName = 'Anthropic'; placeholder = 'sk-ant-api...'; steps = '1. \u0627\u0630\u0647\u0628 \u0625\u0644\u0649 <a href="https://console.anthropic.com/settings/keys" target="_blank">Anthropic Console</a><br>2. \u0623\u0646\u0634\u0626 \u0645\u0641\u062a\u0627\u062d API<br>3. \u0627\u0646\u0633\u062e\u0647 \u0648\u0627\u0644\u0635\u0642\u0647 \u0647\u0646\u0627'; }
        if (modelFamily === 'mistral') { link = 'https://console.mistral.ai/api-keys/'; keyName = 'Mistral'; placeholder = '...'; steps = '1. \u0627\u0630\u0647\u0628 \u0625\u0644\u0649 <a href="https://console.mistral.ai/api-keys/" target="_blank">Mistral Console</a><br>2. \u0623\u0646\u0634\u0626 \u0645\u0641\u062a\u0627\u062d<br>3. \u0627\u0646\u0633\u062e\u0647 \u0648\u0627\u0644\u0635\u0642\u0647 \u0647\u0646\u0627'; }

        const isExpired = match[1].includes('EXPIRED');
        const uid = 'key_' + Date.now();

        htmlContent = `
          <div class="api-key-inline-widget">
            <div class="widget-header">
              <div class="widget-icon"><i data-lucide="${isExpired ? 'alert-triangle' : 'key'}" style="width:22px;height:22px"></i></div>
              <div>
                <div class="widget-title">${isExpired ? '\u0627\u0644\u0645\u0641\u062a\u0627\u062d \u0645\u0646\u062a\u0647\u064a \u0623\u0648 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d' : '\u0645\u0637\u0644\u0648\u0628 \u0645\u0641\u062a\u0627\u062d API \u0644\u0640 ' + keyName}</div>
                <div class="widget-desc">${isExpired ? '\u064a\u0631\u062c\u0649 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0641\u062a\u0627\u062d \u0644\u0644\u0645\u062a\u0627\u0628\u0639\u0629' : '\u0623\u062f\u062e\u0644 \u0627\u0644\u0645\u0641\u062a\u0627\u062d \u0644\u0644\u0628\u062f\u0621 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 ' + keyName}</div>
              </div>
            </div>
            ${isExpired ? '<div class="widget-error"><i data-lucide="x-circle" style="width:16px;height:16px"></i> \u0627\u0644\u0645\u0641\u062a\u0627\u062d \u0627\u0644\u0633\u0627\u0628\u0642 \u0644\u0645 \u064a\u0639\u062f \u064a\u0639\u0645\u0644. \u0642\u062f \u064a\u0643\u0648\u0646 \u0645\u0646\u062a\u0647\u064a \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0629 \u0623\u0648 \u062a\u062c\u0627\u0648\u0632 \u0627\u0644\u062d\u062f.</div>' : ''}
            <div class="widget-steps">${steps}</div>
            <div class="widget-input-row">
              <input type="password" id="${uid}" class="widget-input" placeholder="${placeholder}">
              <button class="widget-confirm-btn" onclick="Main.saveInlineKey('${modelFamily}', document.getElementById('${uid}').value, this)">\u062a\u0623\u0643\u064a\u062f</button>
            </div>
          </div>
        `;
      }
    } else {
      if (!isUser && msg.content) {
        if (msg.content.includes('[SET_THEME:')) {
          const tMatch = msg.content.match(/\[SET_THEME:([^\]]+)\]/);
          if (tMatch) setTimeout(() => UI.setTheme(tMatch[1]), 10);
          msg.content = msg.content.replace(/\[SET_THEME:[^\]]+\]/g, '');
        }
        if (msg.content.includes('[SET_COLOR:')) {
          const cMatch = msg.content.match(/\[SET_COLOR:([^\]]+)\]/);
          if (cMatch) setTimeout(() => UI.setAccentColor(cMatch[1]), 10);
          msg.content = msg.content.replace(/\[SET_COLOR:[^\]]+\]/g, '');
        }
        if (msg.content.includes('[IMAGE:')) {
          msg.content = msg.content.replace(/\[IMAGE:([^\]]+)\]/g, (match, prompt) => {
            const encodedPrompt = encodeURIComponent(prompt.trim());
            const imgUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true`;
            return `\n\n<div style="margin-top:16px; border-radius:12px; overflow:hidden; border:1px solid var(--border);"><img src="${imgUrl}" alt="Generated Image" style="width:100%; height:auto; display:block;"></div>\n\n`;
          });
        }
        if (msg.content.includes('[SOURCES_JSON:')) {
          msg.content = msg.content.replace(/\[SOURCES_JSON:\s*(\[.*?\])\s*\]/g, (match, jsonStr) => {
            try {
              const sources = JSON.parse(jsonStr);
              if (!Array.isArray(sources) || sources.length === 0) return '';
              let html = '<div class="sources-container" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.05);">';
              sources.forEach(s => {
                html += `<a href="${s.url}" target="_blank" class="source-card" style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); padding:8px 12px; border-radius:12px; text-decoration:none; color:var(--text); font-size:12px; transition:all 0.2s;">
                           <i data-lucide="${s.icon || 'globe'}" style="width:14px;height:14px;color:var(--accent);"></i>
                           <span style="font-weight:600;">${s.title}</span>
                         </a>`;
              });
              html += '</div>';
              return html;
            } catch (e) { return ''; }
          });
        }
      }
      htmlContent = isUser ? (msg.display || this.escHtml(msg.content)) : this.formatAI(msg.content || '');
    }

    // Attachments UI
    let filesHtml = '';
    if (msg.files && msg.files.length && (!isUser || !msg.display)) {
      filesHtml = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">` +
        msg.files.map(f => `<span class="attachment-chip"><i data-lucide="paperclip" style="width:12px;height:12px"></i>${this.escHtml(f)}</span>`).join('') +
        `</div>`;
    }
    const safeContent = encodeURIComponent(msg.content || '');
    const copyBtnHtml = !isUser ? `<button class="msg-copy-btn" onclick="Main.copyMessage(decodeURIComponent('${safeContent}'), this)" title="نسخ"><i data-lucide="copy" style="width:14px;height:14px"></i></button>` : '';

    const isVoiceOnly = isUser && msg.display && msg.display.includes('voice-preview-bar') && !msg.display.includes('<div style="margin-bottom:8px;">');
    const bubbleClass = isVoiceOnly ? 'msg-bubble user voice-only' : (isUser ? 'msg-bubble user' : 'msg-bubble ai');

    div.innerHTML = `
      <div class="msg-avatar ${isUser ? 'user' : 'ai'}">
        ${isUser ? 'أ' : '<i data-lucide="bot" style="width:20px;height:20px"></i>'}
      </div>
      <div class="msg-body">
        <div class="${bubbleClass}">
          ${copyBtnHtml}
          ${filesHtml}
          ${htmlContent}
        </div>
        <div class="msg-meta">
          <span class="msg-time">${msg.time}</span>
          ${!isUser ? `
          <div class="msg-actions">
            <button class="msg-action-btn" title="أعجبني" onclick="UI.toast('شكرًا لتقييمك الإيجابي!', 'success')"><i data-lucide="thumbs-up" style="width:14px;height:14px"></i></button>
            <button class="msg-action-btn" title="لم يعجبني" onclick="UI.toast('تم تسجيل التقييم لتطوير النظام', 'info')"><i data-lucide="thumbs-down" style="width:14px;height:14px"></i></button>
            <button class="msg-action-btn" title="نسخ" onclick="Main.copyBubbleText(this)"><i data-lucide="copy" style="width:14px;height:14px"></i></button>
            <button class="msg-action-btn" title="قراءة الصوت" onclick="Main.speak(this)"><i data-lucide="volume-2" style="width:14px;height:14px"></i></button>
            <button class="msg-action-btn" title="إعادة التوليد" onclick="Main.regenerate()"><i data-lucide="refresh-cw" style="width:14px;height:14px"></i></button>
          </div>` : ''}
        </div>
      </div>
    `;

    container.appendChild(div);
    lucide.createIcons();

    // Apply highlight js to new blocks
    div.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));

    // Auto-scroll
    if (localStorage.getItem('autoscroll') !== 'false') {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  },

  formatAI(text) {
    let processed = text.replace(/```([a-z0-9+#]*)[^\n]*\n([\s\S]*?)```/gi, (match, lang, code) => {
      lang = lang ? lang.toLowerCase() : 'text';
      let icon = 'file-code';
      let color = '#fff';
      if (lang === 'html') { icon = 'file-code-2'; color = '#E34F26'; }
      else if (lang === 'css') { icon = 'palette'; color = '#1572B6'; }
      else if (lang === 'javascript' || lang === 'js') { icon = 'file-json'; color = '#F7DF1E'; }
      else if (lang === 'python' || lang === 'py') { icon = 'terminal'; color = '#3776AB'; }

      return `<div class="code-container-premium"><div class="code-header-premium"><div class="code-lang-badge"><i data-lucide="${icon}" style="width:14px;height:14px;color:${color}"></i> ${lang}</div><div class="code-actions-premium"><button type="button" class="code-action-btn"><i data-lucide="copy" style="width:12px;height:12px"></i> نسخ</button></div></div><pre><code class="language-${lang}">${this.escHtml(code)}</code></pre></div>`;
    });
    const html = marked.parse(processed);
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html, {
        ADD_ATTR: ['target', 'rel', 'class'],
        ALLOW_DATA_ATTR: false,
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|data:image\/png|data:image\/jpeg|data:image\/gif|data:image\/webp):)/i
      });
    }
    return html;
  },

  showTyping() {
    const container = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'msg-wrap';
    div.innerHTML = `
      <div class="msg-avatar ai"><i data-lucide="bot" style="width:20px;height:20px"></i></div>
      <div class="msg-body">
        <div class="typing-indicator">
          <span style="font-size:13px;color:var(--text3);margin-left:8px;">يفكر...</span>
          <div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>
        </div>
      </div>
    `;
    container.appendChild(div);
    lucide.createIcons();
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    return div;
  },

  renderMessages() {
    const container = document.getElementById('messages');
    const welcome = document.getElementById('welcome-screen');
    container.innerHTML = '';
    container.appendChild(welcome);

    if (this.messages.length === 0) {
      welcome.style.display = 'flex';
    } else {
      welcome.style.display = 'none';
      this.messages.forEach(m => this.appendMessage(m, false));
    }
  },

  // ---- FILES ----

  handleFiles(files) {
    Array.from(files || []).forEach(file => {
      this.handleFileSelection(file);
      UI.toast(`تم إرفاق الملف: ${file.name}`, 'success');
    });
  },

  // ---- VOICE / TTS ----

  isListening: false,
  mediaRecorder: null,
  audioChunks: [],
  pendingVoiceTranscript: '',
  voiceTimerInterval: null,
  voiceSeconds: 0,

  async toggleVoice() {
    const btn = document.getElementById('voice-btn');

    if (this.isListening) {
      this.isListening = false;
      if (this.mediaRecorder) this.mediaRecorder.stop();
      btn.style.color = 'var(--text3)';
      btn.classList.remove('recording-pulse');
      clearInterval(this.voiceTimerInterval);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.pendingVoiceTranscript = '';
      this.voiceSeconds = 0;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      let recognition = null;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (e) => {
          let transcript = '';
          for (let i = 0; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
          }
          this.pendingVoiceTranscript = transcript;
        };
        recognition.start();
      }

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (recognition) { try { recognition.stop(); } catch (e) { } }
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        this.pendingVoiceBlob = audioBlob;
        this.pendingVoiceUrl = audioUrl;

        this.showVoicePreview(audioUrl);
      };

      this.mediaRecorder.start();
      this.isListening = true;
      btn.style.color = 'var(--red)';
      btn.classList.add('recording-pulse');
      UI.toast('جاري التسجيل... اضغط مرة أخرى للإيقاف', 'info');

      this.voiceTimerInterval = setInterval(() => {
        this.voiceSeconds++;
        const mins = Math.floor(this.voiceSeconds / 60).toString().padStart(2, '0');
        const secs = (this.voiceSeconds % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('voice-timer');
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;
      }, 1000);

    } catch (e) {
      UI.toast('لم نتمكن من الوصول للميكروفون', 'error');
    }
  },

  showVoicePreview(audioUrl) {
    const previewArea = document.getElementById('attachments-preview');
    previewArea.style.display = 'flex';
    const mins = Math.floor(this.voiceSeconds / 60).toString().padStart(2, '0');
    const secs = (this.voiceSeconds % 60).toString().padStart(2, '0');
    const bars = Array.from({ length: 24 }, () => `<div class="bar" style="height:${4 + Math.random() * 24}px"></div>`).join('');

    previewArea.innerHTML = `
      <div class="voice-preview-bar paused" id="voice-preview">
        <button class="voice-play-btn" onclick="Main.playVoicePreview(this)">
          <i data-lucide="play" style="width:16px;height:16px"></i>
        </button>
        <div class="voice-wave-bars">${bars}</div>
        <span class="voice-duration">${mins}:${secs}</span>
        <button class="voice-cancel-btn" onclick="Main.clearVoicePreview()">
          <i data-lucide="x" style="width:14px;height:14px"></i>
        </button>
      </div>
    `;
    lucide.createIcons();

    // Removed auto insertion to chat input as per user request
    if (this.pendingVoiceTranscript) {
      console.log('Voice transcript ready:', this.pendingVoiceTranscript);
    }
  },

  playVoicePreview(btn) {
    this.playAudioMsg(btn, this.pendingVoiceUrl);
  },

  playAudioMsg(btn, url) {
    if (!url) return;
    const parent = btn.closest('.voice-preview-bar');
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      if (this.currentAudio.src.includes(url) || url.includes(this.currentAudio.src)) {
        this.currentAudio = null;
        btn.innerHTML = '<i data-lucide="play" style="width:16px;height:16px"></i>';
        if (parent) parent.classList.add('paused');
        lucide.createIcons();
        return;
      }
      document.querySelectorAll('.voice-preview-bar').forEach(b => {
        b.classList.add('paused');
        const pBtn = b.querySelector('.voice-play-btn');
        if (pBtn) pBtn.innerHTML = '<i data-lucide="play" style="width:16px;height:16px"></i>';
      });
    }
    this.currentAudio = new Audio(url);
    this.currentAudio.play();
    btn.innerHTML = '<i data-lucide="pause" style="width:16px;height:16px"></i>';
    if (parent) parent.classList.remove('paused');
    lucide.createIcons();
    this.currentAudio.onended = () => {
      btn.innerHTML = '<i data-lucide="play" style="width:16px;height:16px"></i>';
      if (parent) parent.classList.add('paused');
      lucide.createIcons();
    };
  },

  clearVoicePreview() {
    this.pendingVoiceBlob = null;
    this.pendingVoiceUrl = null;
    this.pendingVoiceTranscript = '';
    const previewArea = document.getElementById('attachments-preview');
    previewArea.style.display = 'none';
    previewArea.innerHTML = '';
  },

  currentAudio: null,
  async speak(btnEl) {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.currentAudio = null;
      btnEl.innerHTML = '<i data-lucide="volume-2" style="width:14px;height:14px"></i>';
      lucide.createIcons();
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      btnEl.innerHTML = '<i data-lucide="volume-2" style="width:14px;height:14px"></i>';
      lucide.createIcons();
      return;
    }

    const text = btnEl.closest('.msg-body').querySelector('.msg-bubble').innerText;
    const elKey = localStorage.getItem('elevenlabs_api_key') || document.getElementById('elevenlabs-key-input')?.value;

    document.querySelectorAll('.msg-action-btn[title="قراءة الصوت"]').forEach(b => {
      b.innerHTML = '<i data-lucide="volume-2" style="width:14px;height:14px"></i>';
    });

    btnEl.innerHTML = '<i data-lucide="square" style="width:14px;height:14px;color:var(--red)"></i>';
    lucide.createIcons();

    if (elKey) {
      UI.toast('جاري تحضير الصوت السينمائي...', 'info');
      try {
        const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: { 'Accept': 'audio/mpeg', 'xi-api-key': elKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.5 } })
        });
        if (!res.ok) throw new Error('فشل ElevenLabs');
        const blob = await res.blob();
        this.currentAudio = new Audio(URL.createObjectURL(blob));
        this.currentAudio.onended = () => {
          btnEl.innerHTML = '<i data-lucide="volume-2" style="width:14px;height:14px"></i>';
          lucide.createIcons();
        };
        this.currentAudio.play();
      } catch (err) {
        UI.toast('خطأ في ElevenLabs، سيتم استخدام النطق العادي', 'error');
        this.fallbackSpeak(text, btnEl);
      }
    } else {
      this.fallbackSpeak(text, btnEl);
    }
  },

  fallbackSpeak(text, btnEl) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.onend = () => {
      if (btnEl) btnEl.innerHTML = '<i data-lucide="volume-2" style="width:14px;height:14px"></i>';
      lucide.createIcons();
    };
    window.speechSynthesis.speak(utterance);
    UI.toast('جاري القراءة...', 'info');
  },

  // ---- UTILS ----

  setMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll('.input-tag').forEach(el => el.classList.remove('active'));
    document.getElementById('tag-' + mode)?.classList.add('active');

    document.querySelectorAll('.tool-card').forEach(el => el.classList.remove('active'));
    document.getElementById('tool-' + mode)?.classList.add('active');
    
    document.querySelectorAll('.mobile-tool-item').forEach(el => el.classList.remove('active'));
    document.getElementById('m-tag-' + mode)?.classList.add('active');
  },

  quickPrompt(text) {
    document.getElementById('chat-input').value = text;
    this.sendMessage();
  },

  async regenerate() {
    if (this.messages.length < 2) return;

    // Find the last AI message
    let lastAiIndex = -1;
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'assistant') {
        lastAiIndex = i;
        break;
      }
    }

    if (lastAiIndex === -1) return;

    // Remove the last AI message
    this.messages.splice(lastAiIndex, 1);
    this.renderMessages();

    // Now trigger the API call again with the remaining history
    this.isLoading = true;
    document.getElementById('send-btn').disabled = true;
    const typingUI = this.showTyping();

    try {
      const customSys = document.getElementById('custom-system-prompt').value;
      let baseSys = customSys || this.systemPrompts[this.currentMode] || this.systemPrompts['general'];
      const tone = document.getElementById('ai-tone')?.value || 'default';
      if (tone === 'formal') baseSys += '\n\n**تعليمات إضافية:** يرجى الرد بنبرة رسمية، احترافية، وموضوعية تماماً.';
      else if (tone === 'casual') baseSys += '\n\n**تعليمات إضافية:** يرجى الرد بنبرة ودية وبسيطة.';
      else if (tone === 'humorous') baseSys += '\n\n**تعليمات إضافية:** يرجى الرد بنبرة فكاهية لطيفة.';
      else if (tone === 'academic') baseSys += '\n\n**تعليمات إضافية:** يرجى الرد بنبرة أكاديمية دقيقة.';

      const apiMessages = [{ role: 'system', content: baseSys }, ...this.messages.map(m => ({
        role: m.role,
        content: m.payloadContent || m.content
      }))];

      const temp = parseFloat(document.getElementById('temp-slider')?.value) || 0.7;
      const maxTok = parseInt(document.getElementById('max-tokens')?.value) || 4096;

      const { apiUrl, apiKey, actualModelId, family } = this.getApiConfig();
      const needsCloudKey = family !== 'local';
      if (needsCloudKey && (!apiKey || apiKey.trim() === '')) {
        typingUI.remove();
        const noKeyMsg = { role: 'assistant', content: `[UI_WIDGET:API_KEY_REQ:${family}]`, time: this.now() };
        this.messages.push(noKeyMsg);
        this.appendMessage(noKeyMsg, true);
        this.isLoading = false;
        document.getElementById('send-btn').disabled = false;
        return;
      }

      const chatRes = await fetch(apiUrl, {
        method: 'POST',
        headers: this.buildAuthHeaders(family, apiKey),
        body: JSON.stringify({ model: actualModelId, messages: apiMessages, temperature: temp, max_tokens: maxTok })
      });

      if (!chatRes.ok) throw new Error(`HTTP Error: ${chatRes.status}`);
      const chatData = await chatRes.json();
      let aiContent = chatData.choices[0].message.content;

      if (chatData.usage && typeof chatData.usage.total_tokens === 'number') {
        this.stats.tokens += Math.round(chatData.usage.total_tokens / 1000);
        this.updateStatsUI();
      }

      const aiMsg = { role: 'assistant', content: aiContent, time: this.now() };
      this.messages.push(aiMsg);
      typingUI.remove();
      this.appendMessage(aiMsg, true);
      this.saveData();

    } catch (err) {
      typingUI.remove();
      UI.toast('حدث خطأ أثناء إعادة التوليد', 'error');
    }

    this.isLoading = false;
    document.getElementById('send-btn').disabled = false;
  },

  copyBubbleText(btnEl) {
    const text = btnEl.closest('.msg-body').querySelector('.msg-bubble').innerText;
    navigator.clipboard.writeText(text);
    UI.toast('تم النسخ', 'success');
  },

  copyCode(btnEl) {
    const text = btnEl.closest('.code-container-premium').querySelector('code').innerText;
    navigator.clipboard.writeText(text);
    btnEl.innerHTML = '<i data-lucide="check" style="width:12px;height:12px"></i> تم';
    lucide.createIcons();
    setTimeout(() => {
      btnEl.innerHTML = '<i data-lucide="copy" style="width:12px;height:12px"></i> نسخ';
      lucide.createIcons();
    }, 2000);
  },

  sendCodeToEditor(btnEl, lang) {
    const code = btnEl.closest('.code-container-premium').querySelector('code').innerText;
    let ext = { html: 'html', css: 'css', javascript: 'js', js: 'js', typescript: 'ts', python: 'py', py: 'py' }[lang] || 'txt';
    let name = `file_${Date.now()}.${ext}`;
    
    // Check if there is an active tab we can overwrite
    if (Editor.tabs.length > 0) {
      const activeTab = Editor.tabs.find(t => t.id === Editor.activeTab);
      if (activeTab) {
        activeTab.content = code;
        activeTab.lang = lang;
        Editor.switchTab(Editor.activeTab);
        UI.toast('تم تحديث الملف الحالي في المحرر', 'success');
        if (!Editor.isOpen) Editor.toggleSplitScreen();
        return;
      }
    }
    
    // Create new tab
    Editor.createTab(name, code, lang);
    if (!Editor.isOpen) Editor.toggleSplitScreen();
    UI.toast('تم إرسال الكود لملف جديد في المحرر', 'success');
  },

  downloadCodeBlock(btnEl, lang) {
    const code = btnEl.closest('.code-container-premium').querySelector('code').innerText;
    let ext = { html: 'html', css: 'css', javascript: 'js', js: 'js', typescript: 'ts', python: 'py', py: 'py' }[lang] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `code_block_${Date.now()}.${ext}`;
    a.click();
    UI.toast('تم التحميل بنجاح', 'success');
  },

  copyLink() {
    navigator.clipboard.writeText(window.location.href + '?chat=' + this.currentChatId);
    UI.toast('تم نسخ رابط المحادثة', 'success');
    UI.toggleShare();
  },

  copyText() {
    const txt = this.messages.map(m => `[${m.role}]: ${m.display || m.content}`).join('\n\n');
    navigator.clipboard.writeText(txt);
    UI.toast('تم نسخ نص المحادثة كاملة', 'success');
    UI.toggleShare();
  },

  exportChat(type) {
    const element = document.getElementById('messages');

    if (type === 'json') {
      const payload = {
        exportedAt: new Date().toISOString(),
        chatId: this.currentChatId,
        messages: this.messages.map(m => ({
          role: m.role,
          content: typeof m.display === 'string' ? m.display : m.content,
          time: m.time || null
        }))
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `chat_${this.currentChatId}.json`;
      a.click();
      UI.toast('تم تنزيل JSON', 'success');
      UI.toggleShare();
      return;
    }

    if (type === 'pdf') {
      UI.toast('جاري تحضير ملف PDF...', 'info');
      html2pdf().from(element).set({
        margin: 10,
        filename: `chat_${this.currentChatId}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save().then(() => UI.toast('تم تحميل ملف PDF', 'success'));
    } else {
      const text = this.messages.map(m => `## ${m.role === 'user' ? '👤 المستخدم' : '🤖 الذكاء الاصطناعي'}\n\n${m.display || m.content}`).join('\n\n---\n\n');
      const blob = new Blob([text], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `chat_${this.currentChatId}.md`;
      a.click();
      UI.toast('تم تحميل ملف Markdown', 'success');
    }
    UI.toggleShare();
  },

  searchMessages(q) {
    if (!q) { this.renderMessages(); return; }
    const filtered = this.messages.filter(m => (m.display || m.content).toLowerCase().includes(q.toLowerCase()));

    const container = document.getElementById('messages');
    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3)">لا يوجد نتائج مطابقة في هذه المحادثة</div>';
      return;
    }
    filtered.forEach(m => this.appendMessage(m, false));
  },

  updateStatsUI() {
    const msgsEl = document.getElementById('stat-msgs');
    if (msgsEl) msgsEl.textContent = this.stats.msgs;
    const chatsEl = document.getElementById('stat-chats');
    if (chatsEl) chatsEl.textContent = this.stats.chats;
    const s = this.stats;
    document.getElementById('stats-msgs') && (document.getElementById('stats-msgs').textContent = s.msgs);
    document.getElementById('stats-tokens') && (document.getElementById('stats-tokens').textContent = s.tokens + 'k');
    const estCost = ((s.tokens) * 0.001).toFixed(3);
    if (document.getElementById('stats-cost')) {
      document.getElementById('stats-cost').textContent = '$' + estCost;
    }
  },

  updateStorageUI() {
    const pct = Math.min((this.totalStorage / (50 * 1024 * 1024)) * 100, 100);
    if (document.getElementById('storage-fill')) document.getElementById('storage-fill').style.width = pct + '%';
    if (document.getElementById('storage-used')) document.getElementById('storage-used').textContent = `${this.formatSize(this.totalStorage)} / 50 MB`;
    if (document.getElementById('storage-pct')) document.getElementById('storage-pct').textContent = pct.toFixed(1) + '%';
  },

  now() {
    return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  },

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  scrollToBottom() {
    const msgs = document.getElementById('messages');
    msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' });
  },

  setupScrollWatcher() {
    const msgs = document.getElementById('messages');
    const btn = document.getElementById('scroll-bottom-btn');
    if (!msgs || !btn) return;

    msgs.addEventListener('scroll', () => {
      const distFromBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight;
      btn.style.display = distFromBottom > 200 ? 'flex' : 'none';
    });
  },

  copyMessage(text, btnEl) {
    navigator.clipboard.writeText(text).then(() => {
      btnEl.classList.add('copied');
      btnEl.innerHTML = '<i data-lucide="check" style="width:14px;height:14px"></i>';
      lucide.createIcons();
      setTimeout(() => {
        btnEl.classList.remove('copied');
        btnEl.innerHTML = '<i data-lucide="copy" style="width:14px;height:14px"></i>';
        lucide.createIcons();
      }, 2000);
    });
  },

  saveInlineKey(family, value, btnEl) {
    if (!value || value.trim() === '') {
      UI.toast('يرجى إدخال المفتاح', 'error');
      return;
    }
    const keys = JSON.parse(localStorage.getItem(`api_keys_${family}`) || '[]');
    if (!keys.includes(value.trim())) {
      keys.unshift(value.trim());
      localStorage.setItem(`api_keys_${family}`, JSON.stringify(keys));
    }

    // Also update settings input if it exists
    const inputId = 'new-key-' + family;
    const el = document.getElementById(inputId);
    if (el) el.value = value.trim();

    UI.toast('تم تفعيل المفتاح بنجاح! جاري إرسال طلبك...', 'success');
    btnEl.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> تم الحفظ';
    btnEl.style.background = 'var(--green)';
    btnEl.style.color = '#fff';
    lucide.createIcons();

    setTimeout(() => {
      this.regenerate();
    }, 500);
  },

  setupNetworkMonitor() {
    let bar = document.getElementById('network-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'network-bar';
      bar.className = 'network-bar';
      bar.innerHTML = '<i data-lucide="wifi-off" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-left:6px"></i> لا يوجد اتصال بالإنترنت';
      document.body.prepend(bar);
      lucide.createIcons();
    }

    const update = () => {
      bar.classList.toggle('show', !navigator.onLine);
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  },

  recoverInput() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const saved = sessionStorage.getItem('draft_input');
    if (saved) input.value = saved;

    input.addEventListener('input', () => {
      sessionStorage.setItem('draft_input', input.value);
    });
  }
};

window.addEventListener('DOMContentLoaded', () => Main.init());
