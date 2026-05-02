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

  getApiConfig() {
    let apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    let family = 'groq';
    let apiKey = '';
    
    if (this.currentModel.startsWith('gpt') || this.currentModel.startsWith('o1')) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      family = 'openai';
    } else if (this.currentModel.startsWith('gemini')) {
      apiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
      family = 'gemini';
    } else if (this.currentModel.startsWith('claude')) {
      apiUrl = 'https://api.anthropic.com/v1/messages'; 
      family = 'anthropic';
    }
    
    const keys = JSON.parse(localStorage.getItem(`api_keys_${family}`) || '[]');
    const settingsKey = document.getElementById(`${family === 'groq' ? 'api' : family}-key-input`)?.value;
    apiKey = keys[0] || settingsKey || '';
    
    const customUrl = document.getElementById('custom-base-url')?.value;
    if (customUrl && customUrl.trim() !== '') apiUrl = customUrl;

    let actualModelId = this.currentModel;
    if (this.currentModel === 'default-pro' || this.currentModel === 'llama-4-90b') actualModelId = 'llama-3.3-70b-versatile';
    if (this.currentModel === 'llama-4-8b') actualModelId = 'llama-3.1-8b-instant';
    if (this.currentModel === 'gemma-2-27b') actualModelId = 'gemma2-9b-it';
    if (this.currentModel === 'mixtral-8x7b') actualModelId = 'mixtral-8x7b-32768';
    
    if (this.currentModel === 'gpt-5') actualModelId = 'gpt-4o';
    
    if (this.currentModel === 'gemini-2-5-pro') actualModelId = 'gemini-1.5-pro';
    if (this.currentModel === 'gemini-2-5-flash') actualModelId = 'gemini-1.5-flash';
    
    if (this.currentModel === 'claude-3-7-sonnet') actualModelId = 'claude-3-5-sonnet-20241022';
    
    return { apiUrl, apiKey, actualModelId, family };
  },

  pendingVoiceBlob: null,
  pendingVoiceUrl: null,

  async sendMessage() {
    if (this.isLoading) return;
    const input = document.getElementById('chat-input');
    let text = input.value.trim();
    
    if (!text && !this.uploadedFiles.length && !this.pendingVoiceBlob) return;

    let displayHtml = text;
    
    // Handle pending voice
    if (this.pendingVoiceBlob) {
      if (!text) text = this.pendingVoiceTranscript;
      if (!text || text.trim() === '') {
        UI.toast('لم يتم التعرف على الصوت. الرجاء التحدث بوضوح.', 'error');
        this.isLoading = false;
        document.getElementById('send-btn').disabled = false;
        return;
      }
      const mins = Math.floor(this.voiceSeconds / 60).toString().padStart(2, '0');
      const secs = (this.voiceSeconds % 60).toString().padStart(2, '0');
      const bars = Array.from({length: 24}, () => `<div class="bar" style="height:${4 + Math.random() * 24}px"></div>`).join('');
      
      displayHtml = `
      <div class="voice-preview-bar paused" style="margin: 0;">
        <button class="voice-play-btn" onclick="Main.playAudioMsg(this, '${this.pendingVoiceUrl}')">
          <i data-lucide="play" style="width:16px;height:16px"></i>
        </button>
        <div class="voice-wave-bars">${bars}</div>
        <span class="voice-duration">${mins}:${secs}</span>
      </div>`;
    }
    this.clearVoicePreview();

    let fullPayload = text;
    if (this.uploadedFiles.length > 0) {
      const fileContexts = this.uploadedFiles.map(f => `[ملف مرفق: ${f.name}]\n${f.content || 'Binary data attached'}`).join('\n\n');
      fullPayload += `\n\n--- المرفقات ---\n${fileContexts}`;
    }

    input.value = '';
    input.style.height = 'auto';
    sessionStorage.removeItem('draft_input');
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('attachments-preview').style.display = 'none';
    document.getElementById('attachments-preview').innerHTML = '';

    const userMsg = { role: 'user', content: fullPayload, display: displayHtml, time: this.now(), files: this.uploadedFiles.map(f => f.name) };
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
      const baseSys = customSys || this.systemPrompts[this.currentMode] || this.systemPrompts['general'];
      const apiMessages = [{ role: 'system', content: baseSys }, ...this.messages.map(m => ({ role: m.role, content: m.content }))];
      
      const webToggle = document.getElementById('web-search-toggle');
      const isWebSearch = webToggle && webToggle.classList.contains('active');
      if (isWebSearch) {
        UI.toast('جاري البحث في الويب...', 'info');
        try {
          const [arRes, enRes] = await Promise.all([
            fetch(`https://ar.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(text)}&utf8=&format=json&origin=*`),
            fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(text)}&utf8=&format=json&origin=*`)
          ]);
          const [arData, enData] = await Promise.all([arRes.json(), enRes.json()]);
          let results = '';
          if (arData.query && arData.query.search.length > 0) {
            results += arData.query.search.slice(0, 2).map(r => r.snippet.replace(/<[^>]+>/g, '')).join('\n');
          }
          if (enData.query && enData.query.search.length > 0) {
            results += '\n' + enData.query.search.slice(0, 2).map(r => r.snippet.replace(/<[^>]+>/g, '')).join('\n');
          }
          if (results) {
            apiMessages[apiMessages.length - 1].content = `أجب على السؤال التالي بناءً على هذه المعلومات من الويب. اذكر المصادر:\n\nالسؤال: "${text}"\n\nمعلومات من الويب:\n${results}`;
          }
        } catch(e) {
          console.error('Web search failed', e);
        }
      }

      const temp = parseFloat(document.getElementById('temp-slider')?.value) || 0.7;
      const maxTok = parseInt(document.getElementById('max-tokens')?.value) || 4096;

      const { apiUrl, apiKey, actualModelId, family } = this.getApiConfig();
      
      if (!apiKey || apiKey.trim() === '') {
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
      let family = 'groq';
      if (this.currentModel.startsWith('gpt') || this.currentModel.startsWith('o1')) family = 'openai';
      else if (this.currentModel.startsWith('gemini')) family = 'gemini';
      else if (this.currentModel.startsWith('claude')) family = 'anthropic';
      
      if (err.message === 'مفتاح API غير متوفر') {
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
        const modelFamily = match[1];
        let link = 'https://console.groq.com/keys';
        let keyName = 'Groq';
        let placeholder = 'gsk_...';
        let steps = '1. \u0627\u0630\u0647\u0628 \u0625\u0644\u0649 <a href="https://console.groq.com/keys" target="_blank">Groq Console</a><br>2. \u0623\u0646\u0634\u0626 \u0645\u0641\u062a\u0627\u062d API \u062c\u062f\u064a\u062f (\u0645\u062c\u0627\u0646\u064a)<br>3. \u0627\u0646\u0633\u062e\u0647 \u0648\u0627\u0644\u0635\u0642\u0647 \u0647\u0646\u0627';
        if(modelFamily === 'openai') { link = 'https://platform.openai.com/api-keys'; keyName = 'OpenAI'; placeholder = 'sk-...'; steps = '1. \u0627\u0630\u0647\u0628 \u0625\u0644\u0649 <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a><br>2. \u0623\u0646\u0634\u0626 \u0645\u0641\u062a\u0627\u062d API \u062c\u062f\u064a\u062f<br>3. \u0627\u0646\u0633\u062e\u0647 \u0648\u0627\u0644\u0635\u0642\u0647 \u0647\u0646\u0627'; }
        if(modelFamily === 'gemini') { link = 'https://aistudio.google.com/app/apikey'; keyName = 'Google Gemini'; placeholder = 'AIza...'; steps = '1. \u0627\u0630\u0647\u0628 \u0625\u0644\u0649 <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a><br>2. \u0623\u0646\u0634\u0626 \u0645\u0641\u062a\u0627\u062d API (\u0645\u062c\u0627\u0646\u064a)<br>3. \u0627\u0646\u0633\u062e\u0647 \u0648\u0627\u0644\u0635\u0642\u0647 \u0647\u0646\u0627'; }
        
        const isExpired = msg.content.includes(':EXPIRED');
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
        if (recognition) { try { recognition.stop(); } catch(e) {} }
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
    const bars = Array.from({length: 24}, () => `<div class="bar" style="height:${4 + Math.random() * 24}px"></div>`).join('');
    
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
    
    if (this.pendingVoiceTranscript) {
      document.getElementById('chat-input').value = this.pendingVoiceTranscript;
      document.getElementById('chat-input').dispatchEvent(new Event('input'));
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
        if(parent) parent.classList.add('paused');
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
    if(parent) parent.classList.remove('paused');
    lucide.createIcons();
    this.currentAudio.onended = () => {
      btn.innerHTML = '<i data-lucide="play" style="width:16px;height:16px"></i>';
      if(parent) parent.classList.add('paused');
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

      const { apiUrl, apiKey, actualModelId, family } = this.getApiConfig();
      if (!apiKey || apiKey.trim() === '') {
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
