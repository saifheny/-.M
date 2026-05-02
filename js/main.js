const Main = {
  chats: [], currentChatId: null, messages: [], uploadedFiles:[],
  currentModel: 'gpt-4o', currentMode: 'general', isLoading: false,
  totalStorage: 0, stats: { msgs: 0, chats: 0, tokens: 0 },
  
  systemPrompts: {
    general: 'أنت AI Agent Pro، مساعد ذكي متطور لعام 2026. يمكنك التحكم بالواجهة عبر: [SET_COLOR:blue/green/red] ولتغيير المظهر [SET_THEME:dark/light/oled]. لتوليد الصور أضف:[IMAGE: description in english]. أجب باحترافية واستخدم Markdown.',
    code: 'أنت مهندس برمجيات خبير. اكتب كوداً موثقاً ونظيفاً وضع الكود في code blocks مع ذكر لغة البرمجة دائماً.',
    translate: 'أنت مترجم محترف للغات. ترجم بدقة مع مراعاة السياق الثقافي والمصطلحات التقنية.',
    analyze: 'أنت خبير بيانات. حلل البيانات المقدمة بدقة واعرض النتائج في قوائم أو جداول.',
    creative: 'أنت كاتب ومفكر إبداعي. أبدع في نسج القصص وكتابة المقالات بطريقة شيقة.'
  },

  ALL_MODELS: {
    'OpenAI':[
      { id: 'gpt-4o', name: 'GPT-4 Omni' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ],
    'Google':[
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
    ],
    'Anthropic':[
      { id: 'claude-3-opus', name: 'Claude 3 Opus' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' }
    ],
    'Meta (Groq)':[
      { id: 'llama-3-70b', name: 'Llama 3 70B' },
      { id: 'llama-3-8b', name: 'Llama 3 8B' }
    ],
    'Mistral':[
      { id: 'mistral-large', name: 'Mistral Large' }
    ],
    'Cohere':[
      { id: 'command-r-plus', name: 'Command R+' }
    ],
    'HuggingFace':[
      { id: 'zephyr-7b', name: 'Zephyr 7B' }
    ]
  },

  init() {
    this.loadData();
    this.populateModels();
    this.newChat();
    this.setupInput();
    this.setupScrollWatcher();
    this.recoverInput();
  },

  populateModels() {
    const select = document.getElementById('chat-model-select');
    if(!select) return;
    let html = '';
    for(const [provider, models] of Object.entries(this.ALL_MODELS)) {
       html += `<optgroup label="${provider}">`;
       models.forEach(m => { html += `<option value="${m.id}">${m.name}</option>`; });
       html += `</optgroup>`;
    }
    select.innerHTML = html;
    const saved = localStorage.getItem('selected_model');
    if(saved) {
      this.currentModel = saved;
      select.value = saved;
    } else {
      select.value = this.currentModel;
    }
  },

  setModel(modelId) {
    this.currentModel = modelId;
    localStorage.setItem('selected_model', modelId);
    UI.toast(`تم التبديل إلى النموذج ${modelId}`, 'success');
  },

  loadData() {
    try {
      this.chats = JSON.parse(localStorage.getItem('ai_chats_pro') || '[]');
      this.stats = JSON.parse(localStorage.getItem('ai_stats_pro') || '{"msgs":0,"chats":0,"tokens":0}');
      this.updateStatsUI();
      const customPrompt = localStorage.getItem('custom_prompt');
      if (customPrompt) document.getElementById('custom-system-prompt').value = customPrompt;
    } catch(e) { console.error("Error loading data", e); }
  },

  saveData() {
    if (localStorage.getItem('persist') !== 'false') {
      localStorage.setItem('ai_chats_pro', JSON.stringify(this.chats.slice(0, 50)));
    }
    localStorage.setItem('ai_stats_pro', JSON.stringify(this.stats));
  },

  clearAllData() {
    if(confirm('سيتم مسح جميع المحادثات والإعدادات. هل أنت متأكد؟')) {
      localStorage.clear();
      window.location.reload();
    }
  },

  newChat() {
    const currentChat = this.chats.find(c => c.id === this.currentChatId);
    if (currentChat && currentChat.messages.length === 0) { document.getElementById('chat-input').focus(); return; }
    const id = 'chat_' + Date.now();
    const chat = { id, title: 'محادثة جديدة', messages:[], timestamp: Date.now(), starred: false };
    this.chats.unshift(chat);
    this.currentChatId = id; this.messages =[]; this.stats.chats++; this.saveData();
    this.renderChatList(); this.renderMessages(); this.updateStatsUI();
    const ht = document.getElementById('current-chat-title');
    if (ht) ht.textContent = 'محادثة جديدة';
    document.getElementById('welcome-screen').style.display = 'flex';
  },

  loadChat(id) {
    const chat = this.chats.find(c => c.id === id);
    if (!chat) return;
    this.currentChatId = id; this.messages = chat.messages ||[];
    const ht = document.getElementById('current-chat-title');
    if (ht) ht.textContent = chat.title;
    const starBtn = document.getElementById('star-btn');
    if (starBtn) starBtn.classList.toggle('starred', chat.starred);
    this.renderChatList(); this.renderMessages();
    if (this.messages.length > 0) document.getElementById('welcome-screen').style.display = 'none';
    if (window.innerWidth <= 768) UI.toggleSidebar();
  },

  starChat() {
    const chat = this.chats.find(c => c.id === this.currentChatId);
    if (!chat) return;
    chat.starred = !chat.starred;
    document.getElementById('star-btn').classList.toggle('starred', chat.starred);
    this.renderChatList(); this.saveData();
    UI.toast(chat.starred ? 'تم التمييز بنجمة' : 'تم إزالة التمييز', 'info');
  },

  renderChatList() {
    const list = document.getElementById('chat-list');
    if (!this.chats.length) { list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3)">لا توجد محادثات سابقة</div>'; return; }
    let html = '';
    this.chats.forEach(c => {
      const isActive = c.id === this.currentChatId ? 'active' : '';
      const preview = c.messages.length ? c.messages[c.messages.length-1].content.substring(0, 40) + '...' : 'ابدأ محادثة جديدة...';
      html += `<div class="chat-item ${isActive}" onclick="Main.loadChat('${c.id}')"><div style="display:flex; justify-content:space-between; align-items:center;"><div class="chat-item-title">${c.starred ? '<i data-lucide="star" style="width:12px;height:12px;color:var(--yellow);display:inline-block;vertical-align:middle;margin-left:4px;"></i> ' : ''}${this.escHtml(c.title)}</div><button class="icon-btn text-danger" style="width:24px;height:24px;padding:0" onclick="event.stopPropagation(); Main.deleteChat('${c.id}')"><i data-lucide="trash" style="width:12px;height:12px"></i></button></div><div class="chat-item-preview">${this.escHtml(preview)}</div></div>`;
    });
    list.innerHTML = html;
    lucide.createIcons();
  },

  deleteChat(id) {
    this.chats = this.chats.filter(c => c.id !== id); this.saveData();
    if (this.currentChatId === id) this.newChat(); else this.renderChatList();
    UI.toast('تم حذف المحادثة', 'info');
  },

  searchHistory(query) {
    if (!query) { this.renderChatList(); return; }
    const q = query.toLowerCase();
    const filtered = this.chats.filter(c => c.title.toLowerCase().includes(q));
    document.getElementById('chat-list').innerHTML = filtered.map(c => `<div class="chat-item ${c.id === this.currentChatId ? 'active' : ''}" onclick="Main.loadChat('${c.id}')"><div class="chat-item-title">${this.escHtml(c.title)}</div></div>`).join('');
  },

  setupInput() {
    const input = document.getElementById('chat-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 200) + 'px';
      document.getElementById('char-count').textContent = `${input.value.length} / 8000`;
    });
  },

  getApiConfig(modelId) {
    const modelsMap = {
      'gpt-4o': { p: 'openai', url: 'https://api.openai.com/v1/chat/completions', id: 'gpt-4o' },
      'gpt-4-turbo': { p: 'openai', url: 'https://api.openai.com/v1/chat/completions', id: 'gpt-4-turbo' },
      'gpt-3.5-turbo': { p: 'openai', url: 'https://api.openai.com/v1/chat/completions', id: 'gpt-3.5-turbo' },
      'gemini-1.5-pro': { p: 'google', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', id: 'gemini-1.5-pro' },
      'gemini-1.5-flash': { p: 'google', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', id: 'gemini-1.5-flash' },
      'claude-3-opus': { p: 'anthropic', url: 'https://api.anthropic.com/v1/messages', id: 'claude-3-opus-20240229' },
      'claude-3-5-sonnet': { p: 'anthropic', url: 'https://api.anthropic.com/v1/messages', id: 'claude-3-5-sonnet-20240620' },
      'llama-3-70b': { p: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', id: 'llama3-70b-8192' },
      'llama-3-8b': { p: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', id: 'llama3-8b-8192' },
      'mistral-large': { p: 'mistral', url: 'https://api.mistral.ai/v1/chat/completions', id: 'mistral-large-latest' },
      'command-r-plus': { p: 'cohere', url: 'https://api.cohere.ai/v1/chat', id: 'command-r-plus' },
      'zephyr-7b': { p: 'huggingface', url: 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta/v1/chat/completions', id: 'HuggingFaceH4/zephyr-7b-beta' }
    };

    if (modelId === 'default') {
      if (localStorage.getItem('api_key_groq')) return this.getApiConfig('llama-3-70b');
      if (localStorage.getItem('api_key_openai')) return this.getApiConfig('gpt-3.5-turbo');
      if (localStorage.getItem('api_key_google')) return this.getApiConfig('gemini-1.5-flash');
      return { actualModelId: 'mock', apiKey: null, family: 'mock' };
    }

    let mapped = modelsMap[modelId];
    if(!mapped) mapped = modelsMap['gpt-3.5-turbo'];

    return {
      apiUrl: mapped.url, apiKey: localStorage.getItem(`api_key_${mapped.p}`),
      actualModelId: mapped.id, family: mapped.p
    };
  },

  async callApi(modelId, messages, temp, maxTok) {
    const config = this.getApiConfig(modelId);
    
    if (modelId === 'default' && (!config.apiKey || config.family === 'mock')) {
       return new Promise((resolve) => {
         setTimeout(() => {
           resolve("💡 **النموذج الافتراضي (محاكاة):** يبدو أن جميع النماذج فشلت أو لم تقم بإضافة مفاتيح API بعد.\n\nيرجى الذهاب إلى **الإعدادات > الشركات (API)** لإضافة مفتاح واحد على الأقل لفتح القدرات الكاملة للمنصة (مثل مفتاح OpenAI أو Google أو Groq المجاني).");
         }, 1000);
       });
    }

    if (!config.apiKey) throw new Error(`يرجى إضافة مفتاح الـ API الخاص بـ ${config.family.toUpperCase()} من الإعدادات.`);

    let bodyParams = { model: config.actualModelId, messages: messages, temperature: temp, max_tokens: maxTok };
    let headers = { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' };

    if (config.family === 'anthropic') {
        const sysMsg = messages.find(m => m.role === 'system')?.content || '';
        bodyParams = { model: config.actualModelId, system: sysMsg, messages: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })), max_tokens: maxTok, temperature: temp };
        delete headers['Authorization']; headers['x-api-key'] = config.apiKey; headers['anthropic-version'] = '2023-06-01'; headers['anthropic-dangerous-direct-browser-access'] = 'true';
    }

    if(config.family === 'huggingface') {
       bodyParams = { model: config.actualModelId, messages: messages, max_tokens: maxTok, temperature: temp };
    }

    const response = await fetch(config.apiUrl, { method: 'POST', headers: headers, body: JSON.stringify(bodyParams) });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let reason = response.statusText;
        if(response.status === 401) reason = 'المفتاح غير صحيح أو منتهي الصلاحية';
        else if(response.status === 402) reason = 'رصيد الحساب غير كافٍ للتشغيل';
        else if(response.status === 429) reason = 'تم تجاوز حد الطلبات المسموح به (Rate Limit)';
        else if(response.status === 403) reason = 'غير مصرح للوصول (قد يمنع المزود الاتصال المباشر من المتصفح CORS)';
        throw new Error(errData.error?.message || reason);
    }

    const data = await response.json();
    if(data.usage) this.stats.tokens += Math.round((data.usage.total_tokens || 0) / 1000);

    if (config.family === 'anthropic') return data.content[0].text;
    else return data.choices[0].message.content;
  },

  async sendMessage() {
    if (this.isLoading) return;
    const input = document.getElementById('chat-input');
    let text = input.value.trim();
    if (!text && !this.uploadedFiles.length) return;

    // Check for inline model command
    const modelCommandRegex = /^استخدم\s+(.+)$/i;
    const match = text.match(modelCommandRegex);
    if(match) {
       const requestedModel = match[1].toLowerCase();
       let found = null;
       for(const [prov, models] of Object.entries(this.ALL_MODELS)) {
          for(const m of models) {
             if(m.name.toLowerCase().includes(requestedModel) || m.id.toLowerCase().includes(requestedModel) || prov.toLowerCase().includes(requestedModel)) { found = m.id; break; }
          }
          if(found) break;
       }
       if(found) {
           this.setModel(found);
           document.getElementById('chat-model-select').value = found;
           this.appendMessage({role: 'assistant', content: `✅ تم التحويل بنجاح إلى نموذج: **${found}**`, time: this.now()}, true);
           input.value = '';
           if(text === match[0]) return;
       }
    }

    let fullPayload = text;
    if (this.uploadedFiles.length > 0) {
      const fileContexts = this.uploadedFiles.map(f => `[مرفق: ${f.name}]\n${f.content || ''}`).join('\n\n');
      fullPayload += `\n\n--- المرفقات ---\n${fileContexts}`;
    }

    input.value = ''; input.style.height = 'auto'; sessionStorage.removeItem('draft_input');
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('attachments-preview').style.display = 'none';

    const userMsg = { role: 'user', content: fullPayload, display: text, time: this.now(), files: this.uploadedFiles.map(f => f.name) };
    this.messages.push(userMsg); this.appendMessage(userMsg, true);
    this.uploadedFiles =[];
    
    const chat = this.chats.find(c => c.id === this.currentChatId);
    if (chat && chat.title === 'محادثة جديدة') {
      chat.title = text ? text.substring(0, 30) + '...' : 'محادثة جديدة';
      const ht = document.getElementById('current-chat-title');
      if (ht) ht.textContent = chat.title;
      this.renderChatList();
    }

    this.stats.msgs++; this.updateStatsUI();
    this.isLoading = true; document.getElementById('send-btn').disabled = true;
    const typingUI = this.showTyping();

    const customSys = document.getElementById('custom-system-prompt').value;
    const baseSys = customSys || this.systemPrompts[this.currentMode] || this.systemPrompts['general'];
    const apiMessages =[{ role: 'system', content: baseSys }, ...this.messages.map(m => ({ role: m.role, content: m.content }))];

    const temp = parseFloat(document.getElementById('temp-slider')?.value) || 0.7;
    const maxTok = parseInt(document.getElementById('max-tokens')?.value) || 4096;

    let targetModel = this.currentModel;
    try {
        let aiContent = await this.callApi(targetModel, apiMessages, temp, maxTok);
        aiContent = this.extractCodeBlocks(aiContent);
        const aiMsg = { role: 'assistant', content: aiContent, time: this.now() };
        this.messages.push(aiMsg);
        typingUI.remove();
        this.appendMessage(aiMsg, true);
    } catch (err) {
        typingUI.remove();
        const errDiv = {role: 'assistant', content: `⚠️ **فشل الاتصال بالنموذج ${targetModel}:**\n${err.message}\n\n*جاري التحويل للنموذج الافتراضي...*`, time: this.now()};
        this.messages.push(errDiv); this.appendMessage(errDiv, true);
        
        try {
            const typingUI2 = this.showTyping();
            let aiContentFallback = await this.callApi('default', apiMessages, temp, maxTok);
            aiContentFallback = this.extractCodeBlocks(aiContentFallback);
            const aiMsg = { role: 'assistant', content: aiContentFallback, time: this.now() };
            this.messages.push(aiMsg);
            typingUI2.remove();
            this.appendMessage(aiMsg, true);
        } catch(fallbackErr) {
            const finalErr = {role: 'assistant', content: `❌ **عذراً، جميع المحاولات فشلت.**\nيرجى التأكد من إضافة مفاتيح الـ API في الإعدادات، أو التأكد من اتصالك بالإنترنت.`, time: this.now()};
            this.messages.push(finalErr); this.appendMessage(finalErr, true);
        }
    }

    if (chat) chat.messages = this.messages;
    this.saveData(); this.isLoading = false; document.getElementById('send-btn').disabled = false;
  },

  extractCodeBlocks(content) {
    if (content.includes('```')) {
      const blocks =[...content.matchAll(/```(\w*)\n([\s\S]*?)```/g)];
      if (blocks.length > 0) {
        let cleanContent = content.replace(/```(\w*)\n([\s\S]*?)```/g, '').trim();
        if (!cleanContent) cleanContent = 'تم كتابة الأكواد وتحديثها في المحرر لك!';
        if (!Editor.isOpen && window.innerWidth > 768) Editor.toggleSplitScreen();
        blocks.forEach((match, index) => {
          const lang = match[1] || 'text'; const code = match[2];
          let ext = { html: 'html', css: 'css', javascript: 'js', python: 'py' }[lang] || 'txt';
          let name = `file${Date.now()}.${ext}`;
          if (lang === 'html') name = 'index.html'; if (lang === 'css') name = 'style.css'; if (lang === 'javascript') name = 'script.js';
          const existingTab = Editor.tabs.find(t => t.name === name);
          if (existingTab) { existingTab.content = code; existingTab.lang = lang; Editor.activeTab = existingTab.id; } 
          else { const tabId = 'tab_' + Date.now() + '_' + index; Editor.tabs.push({ id: tabId, name: name, lang: lang, content: code }); Editor.activeTab = tabId; }
        });
        Editor.switchTab(Editor.activeTab);
        UI.toast(`تم إرسال الأكواد للمحرر`, 'success');
        return cleanContent;
      }
    }
    return content;
  },

  appendMessage(msg, animate) {
    const container = document.getElementById('messages');
    const isUser = msg.role === 'user';
    const div = document.createElement('div');
    div.className = `msg-wrap ${isUser ? 'user' : ''}`;
    
    let htmlContent = '';
    if (!isUser && msg.content) {
      if (msg.content.includes('[SET_THEME:')) {
        const tMatch = msg.content.match(/\[SET_THEME:([^\]]+)\]/);
        if (tMatch) setTimeout(() => UI.setTheme(tMatch[1]), 10);
        msg.content = msg.content.replace(/\[SET_THEME:[^\]]+\]/g, '');
      }
      if (msg.content.includes('[IMAGE:')) {
        msg.content = msg.content.replace(/\[IMAGE:([^\]]+)\]/g, (m, p) => `\n\n<div style="border-radius:12px; overflow:hidden; border:1px solid var(--border);"><img src="https://image.pollinations.ai/prompt/${encodeURIComponent(p.trim())}?width=800&height=800&nologo=true" style="width:100%; height:auto; display:block;"></div>\n\n`);
      }
    }
    
    htmlContent = isUser ? this.escHtml(msg.display || msg.content) : this.formatAI(msg.content || '');
    let filesHtml = msg.files && msg.files.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">` + msg.files.map(f => `<span class="attachment-chip"><i data-lucide="paperclip" style="width:12px;height:12px"></i>${this.escHtml(f)}</span>`).join('') + `</div>` : '';
    const safeContent = encodeURIComponent(msg.content || '');
    const copyBtnHtml = !isUser ? `<button class="msg-copy-btn" onclick="navigator.clipboard.writeText(decodeURIComponent('${safeContent}')); UI.toast('تم النسخ', 'success')"><i data-lucide="copy" style="width:14px;height:14px"></i></button>` : '';

    div.innerHTML = `
      <div class="msg-avatar ${isUser ? 'user' : 'ai'}">${isUser ? 'أ' : '<i data-lucide="bot" style="width:20px;height:20px"></i>'}</div>
      <div class="msg-body">
        <div class="msg-bubble ${isUser ? 'user' : 'ai'}">${copyBtnHtml}${filesHtml}${htmlContent}</div>
        <div class="msg-meta">
          <span class="msg-time">${msg.time}</span>
          ${!isUser ? `<div class="msg-actions"><button class="msg-action-btn" title="نسخ" onclick="navigator.clipboard.writeText(decodeURIComponent('${safeContent}')); UI.toast('تم النسخ', 'success')"><i data-lucide="copy" style="width:14px;height:14px"></i></button></div>` : ''}
        </div>
      </div>
    `;
    container.appendChild(div); lucide.createIcons();
    div.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    if(localStorage.getItem('autoscroll') !== 'false') container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  },

  formatAI(text) {
    let processed = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="msg-code-block"><div class="code-header"><span class="code-lang">${lang || 'text'}</span><div class="code-actions"><button class="code-btn" onclick="navigator.clipboard.writeText(this.closest('.msg-code-block').querySelector('code').innerText); UI.toast('تم نسخ الكود', 'success')"><i data-lucide="copy" style="width:12px;height:12px"></i> نسخ</button></div></div><pre><code class="language-${lang}">${this.escHtml(code)}</code></pre></div>`;
    });
    return marked.parse(processed);
  },

  showTyping() {
    const container = document.getElementById('messages');
    const div = document.createElement('div'); div.className = 'msg-wrap';
    div.innerHTML = `<div class="msg-avatar ai"><i data-lucide="bot" style="width:20px;height:20px"></i></div><div class="msg-body"><div class="typing-indicator"><span style="font-size:13px;color:var(--text3);margin-left:8px;">يفكر...</span><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;
    container.appendChild(div); lucide.createIcons();
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    return div;
  },

  renderMessages() {
    const container = document.getElementById('messages');
    const welcome = document.getElementById('welcome-screen');
    container.innerHTML = ''; container.appendChild(welcome);
    if (this.messages.length === 0) welcome.style.display = 'flex';
    else { welcome.style.display = 'none'; this.messages.forEach(m => this.appendMessage(m, false)); }
  },

  handleFiles(files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        this.uploadedFiles.push({ name: file.name, size: file.size, content: e.target.result });
        document.getElementById('attachments-preview').style.display = 'flex';
        document.getElementById('attachments-preview').innerHTML += `<div class="attachment-chip"><i data-lucide="file" style="width:14px;height:14px"></i> ${this.escHtml(file.name)}</div>`;
        lucide.createIcons(); UI.toast(`تم إرفاق ${file.name}`, 'success');
      };
      if (file.type.startsWith('image/')) reader.readAsDataURL(file); else reader.readAsText(file);
    });
  },

  setMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll('.input-tag').forEach(el => el.classList.remove('active'));
    document.getElementById('tag-' + mode)?.classList.add('active');
  },

  quickPrompt(text) { document.getElementById('chat-input').value = text; this.sendMessage(); },
  updateStatsUI() {},
  now() { return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }); },
  escHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); },
  scrollToBottom() { const msgs = document.getElementById('messages'); msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' }); },
  setupScrollWatcher() {
    const msgs = document.getElementById('messages'), btn = document.getElementById('scroll-bottom-btn');
    if (!msgs || !btn) return;
    msgs.addEventListener('scroll', () => { btn.style.display = (msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight > 200) ? 'flex' : 'none'; });
  },
  recoverInput() {
    const input = document.getElementById('chat-input'); if (!input) return;
    const saved = sessionStorage.getItem('draft_input'); if (saved) input.value = saved;
    input.addEventListener('input', () => { sessionStorage.setItem('draft_input', input.value); });
  }
};
window.addEventListener('DOMContentLoaded', () => Main.init());
