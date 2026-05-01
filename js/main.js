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
    general: 'أنت AI Agent Pro، مساعد ذكي متطور لعام 2026. يمكنك التحكم بالواجهة عبر: [SET_COLOR:blue/green/red] ولتغيير المظهر [SET_THEME:dark/light/oled]. لتوليد الصور مجاناً اكتب فقط: [IMAGE: English prompt describing the image]. أجب باحترافية واستخدم Markdown.',
    code: 'أنت مهندس برمجيات خبير. اكتب كوداً موثقاً ونظيفاً وضع الكود في code blocks مع ذكر لغة البرمجة دائماً.',
    translate: 'أنت مترجم محترف للغات. ترجم بدقة مع مراعاة السياق الثقافي والمصطلحات التقنية.',
    analyze: 'أنت خبير بيانات. حلل البيانات المقدمة بدقة واعرض النتائج في قوائم أو جداول واضحة واستنتج رؤى مفيدة.',
    creative: 'أنت كاتب ومفكر إبداعي. أبدع في نسج القصص وكتابة المقالات بطريقة شيقة وبليغة.'
  },

  ALL_MODELS: {
    'Groq': [
      { id: 'llama-4-90b', name: 'Llama 4 90B' },
      { id: 'llama-4-8b', name: 'Llama 4 8B' },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B' },
      { id: 'gemma-2-27b', name: 'Gemma 2 27B' }
    ],
    'OpenAI': [
      { id: 'gpt-5', name: 'GPT-5' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'o1-preview', name: 'o1 Preview' }
    ],
    'Anthropic': [
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet' },
      { id: 'claude-3-5-opus', name: 'Claude 3.5 Opus' },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku' }
    ],
    'Google': [
      { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2-5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro' }
    ],
    'Mistral': [
      { id: 'mistral-large-2', name: 'Mistral Large 2' },
      { id: 'pixtral-large', name: 'Pixtral Large' }
    ],
    'xAI': [
      { id: 'grok-2', name: 'Grok-2' },
      { id: 'grok-2-vision', name: 'Grok-2 Vision' }
    ]
  },

  init() {
    this.loadData();
    this.newChat();
    this.setupInput();
    this.setupScrollWatcher();
    this.setupNetworkMonitor();
    this.recoverInput();
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
      
      // Load API keys to inputs if saved
      const groqKey = localStorage.getItem('groq_api_key');
      if (groqKey) document.getElementById('api-key-input').value = groqKey;
      
      const elKey = localStorage.getItem('elevenlabs_api_key');
      if (elKey && document.getElementById('elevenlabs-key-input')) document.getElementById('elevenlabs-key-input').value = elKey;
      
      const customPrompt = localStorage.getItem('custom_prompt');
      if (customPrompt) document.getElementById('custom-system-prompt').value = customPrompt;
      
    } catch(e) { console.error("Error loading data", e); }
  },

  saveData() {
    if (localStorage.getItem('persist') !== 'false') {
      localStorage.setItem('ai_chats_pro', JSON.stringify(this.chats.slice(0, 50))); // Keep last 50
    }
    localStorage.setItem('ai_stats_pro', JSON.stringify(this.stats));
  },

  clearAllData() {
    if(confirm('تحذير: سيتم مسح جميع المحادثات والإعدادات. هل أنت متأكد؟')) {
      localStorage.clear();
      window.location.reload();
    }
  },

  clearStorage() {
    this.uploadedFiles = [];
    this.totalStorage = 0;
    this.updateStorageUI();
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('attachments-preview').style.display = 'none';
    UI.toast('تم مسح الملفات المؤقتة لتوفير المساحة', 'success');
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
      const preview = c.messages.length ? c.messages[c.messages.length-1].content.substring(0, 40) + '...' : 'ابدأ محادثة جديدة...';
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
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
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

  async sendMessage() {
    if (this.isLoading) return;
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    
    if (!text && !this.uploadedFiles.length) return;

    let fullPayload = text;
    if (this.uploadedFiles.length > 0) {
      const fileContexts = this.uploadedFiles.map(f => `[ملف مرفق: ${f.name}]\n${f.content || 'Binary data attached'}`).join('\n\n');
      fullPayload += `\n\n--- المرفقات ---\n${fileContexts}`;
    }

    // Reset UI
    input.value = '';
    input.style.height = 'auto';
    sessionStorage.removeItem('draft_input');
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('attachments-preview').style.display = 'none';
    document.getElementById('attachments-preview').innerHTML = '';

    // Add User Message
    const userMsg = { role: 'user', content: fullPayload, display: text, time: this.now(), files: this.uploadedFiles.map(f => f.name) };
    this.messages.push(userMsg);
    this.appendMessage(userMsg, true);
    
    this.uploadedFiles = [];
    
    // Update title logic
    const chat = this.chats.find(c => c.id === this.currentChatId);
    if (chat && chat.title === 'محادثة جديدة') {
      chat.title = text ? text.substring(0, 30) + '...' : 'محادثة تحتوي ملفات';
      const ht3 = document.getElementById('header-title');
      if (ht3) ht3.textContent = chat.title;
      this.renderChatList();
    }

    this.stats.msgs++;
    this.updateStatsUI();

    // Call API
    this.isLoading = true;
    document.getElementById('send-btn').disabled = true;
    const typingUI = this.showTyping();

    try {
      const customSys = document.getElementById('custom-system-prompt').value;
      const baseSys = customSys || this.systemPrompts[this.currentMode] || this.systemPrompts['general'];
      const apiMessages = [{ role: 'system', content: baseSys }, ...this.messages.map(m => ({ role: m.role, content: m.content }))];
      
      // Web Search Logic
      if (this.currentMode === 'web') {
        UI.toast('جاري جلب المعلومات من الويب...', 'info');
        try {
          const searchRes = await fetch(`https://ar.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(text)}&utf8=&format=json&origin=*`);
          const searchData = await searchRes.json();
          if (searchData.query && searchData.query.search.length > 0) {
            const results = searchData.query.search.slice(0, 3).map(r => r.snippet.replace(/<[^>]+>/g, '')).join('\n\n');
            const enhancedPrompt = `قم بتلخيص هذه المعلومات وتكوين إجابة بناءً على هذا السؤال: "${text}"\n\nمعلومات حديثة من الويب:\n${results}`;
            apiMessages[apiMessages.length - 1].content = enhancedPrompt;
          }
        } catch(e) {
          console.error("Web search failed", e);
        }
      }

      const temp = parseFloat(document.getElementById('temp-slider')?.value) || 0.7;
      const maxTok = parseInt(document.getElementById('max-tokens')?.value) || 4096;

      let apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      
      const groqKeys = JSON.parse(localStorage.getItem('api_keys_groq') || '[]');
      const openaiKeys = JSON.parse(localStorage.getItem('api_keys_openai') || '[]');
      const geminiKeys = JSON.parse(localStorage.getItem('api_keys_gemini') || '[]');
      const settingsKey = document.getElementById('api-key-input')?.value;
      
      let apiKey = groqKeys[0] || settingsKey || '';
      
      if (this.currentModel === 'default-pro' || this.currentModel === 'llama-4-90b') {
        apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        apiKey = groqKeys[0] || settingsKey || '';
      }

      if (this.currentModel.startsWith('gpt')) {
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        apiKey = openaiKeys[0] || document.getElementById('openai-key-input')?.value;
      } else if (this.currentModel.startsWith('gemini')) {
        apiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
        apiKey = geminiKeys[0] || document.getElementById('gemini-key-input')?.value;
      }

      const customUrl = document.getElementById('custom-base-url')?.value;
      if (customUrl && customUrl.trim() !== '') {
        apiUrl = customUrl;
      }

      let actualModelId = this.currentModel;
      
      // Map futuristic model IDs to real working models
      if (this.currentModel === 'default-pro') actualModelId = 'llama-3.3-70b-versatile';
      if (this.currentModel === 'llama-4-90b') actualModelId = 'llama-3.3-70b-versatile';
      if (this.currentModel === 'gpt-5') actualModelId = 'gpt-4o';
      if (this.currentModel === 'gemini-2.5-pro') actualModelId = 'gemini-1.5-pro';
      if (this.currentModel === 'gemini-2.5-flash') actualModelId = 'gemini-1.5-flash';
      if (this.currentModel === 'claude-3-7-sonnet') actualModelId = 'claude-3-5-sonnet-20241022';
      if (!apiKey || apiKey.trim() === '') {
        typingUI.remove();
        let family = 'groq';
        if (this.currentModel.startsWith('gpt')) family = 'openai';
        if (this.currentModel.startsWith('gemini')) family = 'gemini';
        
        const noKeyMsg = { role: 'assistant', content: `[UI_WIDGET:API_KEY_REQ:${family}]`, time: this.now() };
        this.messages.push(noKeyMsg);
        this.appendMessage(noKeyMsg, true);
        this.isLoading = false;
        document.getElementById('send-btn').disabled = false;
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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
      
      this.stats.tokens += Math.round(data.usage.total_tokens / 1000); // Record in K
      
      let chatText = aiContent;
      
      // Strict Auto-extract multiple code blocks logic & Tab Overwriting
      if (aiContent.includes('```')) {
        const blocks = [...aiContent.matchAll(/```(\w*)\n([\s\S]*?)```/g)];
        if (blocks.length > 0) {
          
          // Completely remove code blocks from the chat output
          chatText = chatText.replace(/```(\w*)\n([\s\S]*?)```/g, '').trim();
          if (!chatText) chatText = 'تم كتابة الأكواد وتحديثها في المحرر لك!';
          
          if (!Editor.isOpen && window.innerWidth > 768) Editor.toggleSplitScreen();
          
          blocks.forEach((match, index) => {
            const lang = match[1] || 'text';
            const code = match[2];
            
            let ext = { html: 'html', css: 'css', javascript: 'js', typescript: 'ts', python: 'py' }[lang] || 'txt';
            let name = `file${Date.now()}.${ext}`;
            if (lang === 'html') name = 'index.html';
            if (lang === 'css') name = 'style.css';
            if (lang === 'javascript') name = 'script.js';
            
            // Check if tab already exists to overwrite it
            const existingTab = Editor.tabs.find(t => t.name === name);
            if (existingTab) {
                existingTab.content = code;
                existingTab.lang = lang;
                Editor.activeTab = existingTab.id;
            } else {
                const tabId = 'tab_' + Date.now() + '_' + index;
                Editor.tabs.push({ id: tabId, name: name, lang: lang, content: code });
                Editor.activeTab = tabId;
            }
          });
          
          Editor.switchTab(Editor.activeTab);
          UI.toast(`تم تحديث الأكواد في المحرر بنجاح`, 'success');
        }
      }
      
      const aiMsg = { role: 'assistant', content: chatText, time: this.now() };
      this.messages.push(aiMsg);
      
      typingUI.remove();
      this.appendMessage(aiMsg, true);

    } catch (err) {
      typingUI.remove();
      const errMsg = { role: 'assistant', content: `خطأ في الاتصال: ${err.message}. تأكد من صحة مفتاح API والاتصال بالإنترنت.`, time: this.now() };
      this.messages.push(errMsg);
      this.appendMessage(errMsg, true);
      UI.toast('حدث خطأ في جلب الرد', 'error');
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
        const modelFamily = match[1];
        let link = 'https://console.groq.com/keys';
        let keyName = 'Groq';
        if(modelFamily === 'openai') { link = 'platform.openai.com/api-keys'; keyName = 'OpenAI'; }
        if(modelFamily === 'gemini') { link = 'aistudio.google.com/app/apikey'; keyName = 'Gemini'; }
        
        htmlContent = `
          <div class="gen-ui-widget">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <i data-lucide="key" style="width:24px;height:24px;color:var(--yellow)"></i>
              <strong style="font-size:16px;">مطلوب مفتاح API لـ ${keyName}</strong>
            </div>
            <p style="font-size:13px;color:var(--text2);margin-bottom:16px;">يرجى إدخال مفتاح الـ API الخاص بك للمتابعة. يمكنك الحصول على مفتاح مجاني من <a href="${link.startsWith('http') ? link : 'https://'+link}" target="_blank" style="color:var(--blue)">هنا</a>.</p>
            <div style="display:flex;gap:8px;">
              <input type="password" id="inline-key-${modelFamily}" class="settings-input" placeholder="أدخل مفتاح ${keyName} هنا..." style="flex:1;">
              <button class="btn-primary" onclick="Main.saveInlineKey('${modelFamily}', document.getElementById('inline-key-${modelFamily}').value, this)">حفظ وتفعيل</button>
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
      }
      htmlContent = isUser ? (msg.display || this.escHtml(msg.content)) : this.formatAI(msg.content || '');
    }
    
    // Attachments UI
    let filesHtml = '';
    if (msg.files && msg.files.length) {
      filesHtml = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">` + 
                  msg.files.map(f => `<span class="attachment-chip"><i data-lucide="paperclip" style="width:12px;height:12px"></i>${this.escHtml(f)}</span>`).join('') + 
                  `</div>`;
    }
    const safeContent = encodeURIComponent(msg.content || '');
    const copyBtnHtml = !isUser ? `<button class="msg-copy-btn" onclick="Main.copyMessage(decodeURIComponent('${safeContent}'), this)" title="نسخ"><i data-lucide="copy" style="width:14px;height:14px"></i></button>` : '';

    // Build Model Options dynamically
    let modelOptionsHtml = '';
    for (const [provider, models] of Object.entries(this.ALL_MODELS)) {
      modelOptionsHtml += `<optgroup label="${provider}">`;
      models.forEach(m => {
        modelOptionsHtml += `<option value="${m.id}" ${this.currentModel === m.id ? 'selected' : ''}>${m.name}</option>`;
      });
      modelOptionsHtml += `</optgroup>`;
    }

    div.innerHTML = `
      <div class="msg-avatar ${isUser ? 'user' : 'ai'}">
        ${isUser ? 'أ' : '<i data-lucide="bot" style="width:20px;height:20px"></i>'}
      </div>
      <div class="msg-body">
        <div class="msg-bubble ${isUser ? 'user' : 'ai'}">
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
            <select class="settings-select" onchange="UI.selectModel(this.value, this.options[this.selectedIndex].text)" style="width:130px; height:28px; padding:0 8px; font-size:11px; margin-right:8px; border-radius:6px; background:var(--bg3); border:1px solid var(--border); color:var(--text);">
              ${modelOptionsHtml}
            </select>
          </div>` : ''}
        </div>
      </div>
    `;
    
    container.appendChild(div);
    lucide.createIcons();
    
    // Apply highlight js to new blocks
    div.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));

    // Auto-scroll
    if(localStorage.getItem('autoscroll') !== 'false') {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  },

  formatAI(text) {
    // Custom logic to add copy buttons to markdown codeblocks before marked parses them
    let processed = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `
        <div class="msg-code-block">
          <div class="code-header">
            <span class="code-lang">${lang || 'text'}</span>
            <div class="code-actions">
              <button class="code-btn" onclick="Main.copyCode(this)"><i data-lucide="copy" style="width:12px;height:12px"></i> نسخ</button>
              <button class="code-btn" onclick="Main.sendCodeToEditor(this, '${lang}')"><i data-lucide="code-2" style="width:12px;height:12px"></i> للمحرر</button>
            </div>
          </div>
          <pre><code class="language-${lang}">${this.escHtml(code)}</code></pre>
        </div>
      `;
    });
    return marked.parse(processed);
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
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        this.uploadedFiles.push({ name: file.name, size: file.size, content: e.target.result });
        this.totalStorage += file.size;
        this.updateStorageUI();
        this.renderAttachments();
        
        // Add to tool panel files list
        const list = document.getElementById('file-list');
        list.innerHTML += `
          <div class="file-item">
            <i data-lucide="file" style="width:16px;height:16px;color:var(--text3)"></i>
            <div class="file-info"><div class="file-name">${this.escHtml(file.name)}</div><div class="file-size">${this.formatSize(file.size)}</div></div>
          </div>
        `;
        lucide.createIcons();
        UI.toast(`تم رفع ${file.name}`, 'success');
      };
      
      if (file.type.startsWith('image/')) reader.readAsDataURL(file);
      else reader.readAsText(file);
    });
  },

  renderAttachments() {
    const preview = document.getElementById('attachments-preview');
    if(this.uploadedFiles.length === 0) {
      preview.style.display = 'none';
      return;
    }
    preview.style.display = 'flex';
    preview.innerHTML = this.uploadedFiles.map((f, i) => {
      if (f.content && f.content.startsWith('data:image')) {
        return `
          <div class="image-thumb-container">
            <img src="${f.content}" class="image-preview-thumb" alt="Preview">
            <button class="remove-thumb-btn" onclick="Main.uploadedFiles.splice(${i},1); Main.renderAttachments()"><i data-lucide="x" style="width:12px;height:12px"></i></button>
          </div>
        `;
      }
      return `
      <div class="attachment-chip">
        <i data-lucide="file" style="width:14px;height:14px"></i> ${this.escHtml(f.name)}
        <i data-lucide="x" style="width:12px;height:12px;cursor:pointer;color:var(--red)" onclick="Main.uploadedFiles.splice(${i},1); Main.renderAttachments()"></i>
      </div>
    `}).join('');
    lucide.createIcons();
  },

  // ---- VOICE / TTS ----

  isListening: false,
  recognition: null,

  mediaRecorder: null,
  audioChunks: [],

  async toggleVoice() {
    const vis = document.getElementById('voice-visualizer');
    const btn = document.getElementById('voice-btn');
    
    if (this.isListening) {
      // Stop recording
      this.isListening = false;
      if (this.mediaRecorder) this.mediaRecorder.stop();
      vis.style.display = 'none';
      btn.style.color = 'var(--text3)';
      return;
    }

    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };
      
      this.mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Add Audio message to UI
        const userMsg = { role: 'user', content: '[رسالة صوتية]', display: `<audio controls src="${audioUrl}" style="height:36px; max-width:100%; outline:none;"></audio>`, time: this.now() };
        this.messages.push(userMsg);
        this.appendMessage(userMsg, true);
        
        this.isLoading = true;
        document.getElementById('send-btn').disabled = true;
        const typingUI = this.showTyping();
        
        try {
          // 1. Transcribe audio using Groq Whisper
          const groqKeys = JSON.parse(localStorage.getItem('api_keys_groq') || '[]');
          const apiKey = groqKeys[0] || document.getElementById('api-key-input')?.value;
          
          if (!apiKey) throw new Error('مفتاح API للنموذج المختار غير متوفر.');
          
          const formData = new FormData();
          formData.append('file', new File([audioBlob], 'voice.webm', { type: 'audio/webm' }));
          formData.append('model', 'whisper-large-v3');
          
          const transcribeRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            body: formData
          });
          
          if (!transcribeRes.ok) throw new Error('فشل تحليل الصوت');
          const transcribeData = await transcribeRes.json();
          const transcript = transcribeData.text;
          
          // 2. Update user message content silently
          userMsg.content = transcript || '[صوت غير مفهوم]';
          
          // 3. Send to AI
          // Just call the API directly like in sendMessage, or call a helper.
          // To avoid code duplication, we can temporarily put the transcript in chat-input and call sendMessage, but we already appended the user message!
          // So let's just trigger the second half of sendMessage:
          document.getElementById('welcome-screen').style.display = 'none';
          this.stats.msgs++;
          this.updateStatsUI();
          
          // Call API
          const customSys = document.getElementById('custom-system-prompt').value;
          const baseSys = customSys || this.systemPrompts[this.currentMode] || 'أنت مساعد ذكي';
          const apiMessages = [{ role: 'system', content: baseSys }, ...this.messages.map(m => ({ role: m.role, content: m.content }))];
          
          const temp = parseFloat(document.getElementById('temp-slider')?.value) || 0.7;
          const maxTok = parseInt(document.getElementById('max-tokens')?.value) || 4096;

          let apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
          let chatApiKey = apiKey;
          let actualModelId = 'llama-3.3-70b-versatile';
          
          if (this.currentModel.startsWith('gpt')) {
            apiUrl = 'https://api.openai.com/v1/chat/completions';
            const openaiKeys = JSON.parse(localStorage.getItem('api_keys_openai') || '[]');
            chatApiKey = openaiKeys[0] || document.getElementById('openai-key-input')?.value;
            actualModelId = this.currentModel === 'gpt-5' ? 'gpt-4o' : this.currentModel;
          } else if (this.currentModel.startsWith('gemini')) {
            apiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
            const geminiKeys = JSON.parse(localStorage.getItem('api_keys_gemini') || '[]');
            chatApiKey = geminiKeys[0] || document.getElementById('gemini-key-input')?.value;
            actualModelId = this.currentModel === 'gemini-2.5-pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
          }
          
          const customUrl = document.getElementById('custom-base-url')?.value;
          if (customUrl) apiUrl = customUrl;
          
          if (!chatApiKey) throw new Error('مفتاح API للنموذج المختار غير متوفر.');

          const chatRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${chatApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: actualModelId, messages: apiMessages, temperature: temp, max_tokens: maxTok })
          });
          
          if (!chatRes.ok) throw new Error(`HTTP Error: ${chatRes.status}`);
          const chatData = await chatRes.json();
          let aiContent = chatData.choices[0].message.content;
          
          // Auto-extract multiple code blocks logic
          if (aiContent.includes('```')) {
            const blocks = [...aiContent.matchAll(/```(\w*)\n([\s\S]*?)```/g)];
            if (blocks.length > 0) {
              aiContent = aiContent.replace(/```(\w*)\n([\s\S]*?)```/g, '').trim() || 'تم كتابة الأكواد وتحديثها في المحرر لك!';
              if (!Editor.isOpen && window.innerWidth > 768) Editor.toggleSplitScreen();
              blocks.forEach((match, index) => {
                const lang = match[1] || 'text';
                const code = match[2];
                let ext = { html: 'html', css: 'css', javascript: 'js', typescript: 'ts', python: 'py' }[lang] || 'txt';
                let name = `file${Date.now()}.${ext}`;
                const existingTab = Editor.tabs.find(t => t.name === name);
                if (existingTab) { existingTab.content = code; existingTab.lang = lang; Editor.activeTab = existingTab.id; }
                else { const tabId = 'tab_' + Date.now() + '_' + index; Editor.tabs.push({ id: tabId, name, lang, content: code }); Editor.activeTab = tabId; }
              });
              Editor.switchTab(Editor.activeTab);
              UI.toast(`تم تحديث الأكواد في المحرر بنجاح`, 'success');
            }
          }
          
          const aiMsg = { role: 'assistant', content: aiContent, time: this.now() };
          this.messages.push(aiMsg);
          typingUI.remove();
          this.appendMessage(aiMsg, true);
          this.saveData();

        } catch (err) {
          typingUI.remove();
          if(err.message.includes('غير متوفر') || err.message.includes('API')) {
            let family = 'groq';
            if (this.currentModel.startsWith('gpt')) family = 'openai';
            if (this.currentModel.startsWith('gemini')) family = 'gemini';
            const errMsg = { role: 'assistant', content: `[UI_WIDGET:API_KEY_REQ:${family}]`, time: this.now() };
            this.messages.push(errMsg);
            this.appendMessage(errMsg, true);
          } else {
            const errMsg = { role: 'assistant', content: `خطأ أثناء المعالجة الصوتية: ${err.message}`, time: this.now() };
            this.messages.push(errMsg);
            this.appendMessage(errMsg, true);
          }
        }
        
        this.isLoading = false;
        document.getElementById('send-btn').disabled = false;
      };
      
      this.mediaRecorder.start();
      this.isListening = true;
      vis.style.display = 'flex';
      btn.style.color = 'var(--red)';
      UI.toast('جاري تسجيل الصوت...', 'info');
      
    } catch (e) {
      UI.toast('لم نتمكن من الوصول للميكروفون', 'error');
    }
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
  },

  quickPrompt(text) {
    document.getElementById('chat-input').value = text;
    this.sendMessage();
  },

  async regenerate() {
    if(this.messages.length < 2) return;
    
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
      const baseSys = customSys || this.systemPrompts[this.currentMode] || this.systemPrompts['general'];
      const apiMessages = [{ role: 'system', content: baseSys }, ...this.messages.map(m => ({ role: m.role, content: m.content }))];
      
      const temp = parseFloat(document.getElementById('temp-slider')?.value) || 0.7;
      const maxTok = parseInt(document.getElementById('max-tokens')?.value) || 4096;

      let apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      
      const groqKeys = JSON.parse(localStorage.getItem('api_keys_groq') || '[]');
      const openaiKeys = JSON.parse(localStorage.getItem('api_keys_openai') || '[]');
      const geminiKeys = JSON.parse(localStorage.getItem('api_keys_gemini') || '[]');
      const settingsKey = document.getElementById('api-key-input')?.value;
      
      let apiKey = groqKeys[0] || settingsKey || '';
      
      if (this.currentModel === 'default-pro' || this.currentModel === 'llama-4-90b') {
        apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      } else if (this.currentModel.startsWith('gpt') || this.currentModel.startsWith('o1')) {
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        apiKey = openaiKeys[0] || document.getElementById('openai-key-input')?.value || '';
      } else if (this.currentModel.startsWith('gemini')) {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.currentModel}:generateContent?key=${geminiKeys[0] || ''}`;
      }

      let actualModelId = this.currentModel === 'default-pro' ? 'llama3-70b-8192' : this.currentModel;
      if (this.currentModel === 'llama-4-90b') actualModelId = 'llama-3.1-70b-versatile';
      if (this.currentModel === 'gemma-2-27b') actualModelId = 'gemma2-9b-it';
      if (this.currentModel === 'mixtral-8x7b') actualModelId = 'mixtral-8x7b-32768';
      
      const customUrl = document.getElementById('custom-base-url')?.value;
      if (customUrl) apiUrl = customUrl;
      
      if (!apiKey) throw new Error('مفتاح API غير متوفر');

      const chatRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: actualModelId, messages: apiMessages, temperature: temp, max_tokens: maxTok })
      });
      
      if (!chatRes.ok) throw new Error(`HTTP Error: ${chatRes.status}`);
      const chatData = await chatRes.json();
      let aiContent = chatData.choices[0].message.content;
      
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
    const text = btnEl.closest('.msg-code-block').querySelector('code').innerText;
    navigator.clipboard.writeText(text);
    btnEl.innerHTML = '<i data-lucide="check" style="width:12px;height:12px"></i> تم';
    lucide.createIcons();
    setTimeout(() => {
      btnEl.innerHTML = '<i data-lucide="copy" style="width:12px;height:12px"></i> نسخ';
      lucide.createIcons();
    }, 2000);
  },

  sendCodeToEditor(btnEl, lang) {
    const code = btnEl.closest('.msg-code-block').querySelector('code').innerText;
    document.getElementById('code-editor').value = code;
    if(lang) Editor.changeLang(lang);
    Editor.updateLineNumbers();
    if(!Editor.isOpen) Editor.toggleSplitScreen();
    UI.toast('تم إرسال الكود للمحرر', 'success');
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
      const blob = new Blob([text], {type: 'text/markdown'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `chat_${this.currentChatId}.md`;
      a.click();
      UI.toast('تم تحميل ملف Markdown', 'success');
    }
    UI.toggleShare();
  },

  searchMessages(q) {
    if(!q) { this.renderMessages(); return; }
    const filtered = this.messages.filter(m => (m.display || m.content).toLowerCase().includes(q.toLowerCase()));
    
    const container = document.getElementById('messages');
    container.innerHTML = '';
    if(filtered.length === 0) {
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
    const tokensEl = document.getElementById('stat-tokens');
    if (tokensEl) tokensEl.textContent = this.stats.tokens + 'k';
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
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
    const inputId = family === 'groq' ? 'api-key-input' : `${family}-key-input`;
    const el = document.getElementById(inputId);
    if (el) el.value = value.trim();
    
    UI.toast('تم تفعيل المفتاح بنجاح! يمكنك الآن إرسال طلبك مجدداً.', 'success');
    btnEl.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> تم الحفظ';
    btnEl.style.background = 'var(--green)';
    btnEl.style.color = '#fff';
    lucide.createIcons();
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
