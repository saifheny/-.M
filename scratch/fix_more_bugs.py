import re

# ============================================================
# 1. Update js/main.js to fix loadChat (black screen)
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix the loadChat function so it handles empty messages without leaving a black screen
old_load_chat_end = """    this.renderMessages();
    if (this.messages.length > 0) {
      document.getElementById('welcome-screen').style.display = 'none';
    }
    this.updateNavUI();
    if (window.innerWidth <= 768) UI.toggleSidebar();"""

new_load_chat_end = """    this.renderMessages();
    const welcome = document.getElementById('welcome-screen');
    if (welcome) {
      welcome.style.display = this.messages.length > 0 ? 'none' : 'flex';
    }
    this.updateNavUI();
    if (window.innerWidth <= 768) UI.toggleSidebar();"""

js = js.replace(old_load_chat_end, new_load_chat_end)

with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'w', encoding='utf-8') as f:
    f.write(js)

# ============================================================
# 2. Update style.css
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Increase sidebar width slightly from 230px to 260px based on feedback
css = css.replace('width: 230px;', 'width: 260px;')
css = css.replace('width: 230px !important;', 'width: 260px !important;')
css = css.replace('max-width: 180px !important;', 'max-width: 200px !important;')

# Apply styling for the 3 circular icons in mobile header
custom_css = """
/* Styling for the 3 top header icons on mobile to look like ChatGPT (black glowing circles) */
.mobile-header-circle-btn {
  width: 38px !important;
  height: 38px !important;
  border-radius: 50% !important;
  background: rgba(0, 0, 0, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #fff !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05), 0 2px 5px rgba(0,0,0,0.3) !important;
}

/* Ensure the app name is top, user name bottom */
.desktop-only .sidebar-app-name {
  font-weight: 800;
  font-size: 18px;
  color: #fff;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
  display: block;
}

/* Make chat item three dots visible on desktop too (not just hover) */
.chat-item-actions {
  opacity: 1 !important;
  position: relative !important;
  left: auto !important;
  transform: none !important;
}
.chat-item {
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
}
.chat-item-content {
  flex: 1 !important;
  min-width: 0 !important;
}
"""

if ".mobile-header-circle-btn" not in css:
    css += custom_css

with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# ============================================================
# 3. Update index.html
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Modify Mobile Header to use the new circular classes and fix Desktop Header to show App Name
old_sidebar_header = """    <!-- DESKTOP HEADER (Search Only) -->
    <div class="sidebar-header desktop-only" style="padding: 16px 16px 8px 16px;">
      <div style="position:relative;">
        <i data-lucide="search" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:rgba(255,255,255,0.4);"></i>
        <input type="text" placeholder="بحث في التاريخ..." oninput="Main.searchHistory(this.value)" 
               style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 35px 10px 12px; color:#fff; font-size:13px; outline:none;">
      </div>
    </div>

    <!-- MOBILE HEADER (Back, Name, Search, New Chat) -->
    <div class="sidebar-header mobile-only" style="padding: calc(var(--safe-top) + 16px) 16px 8px 16px; display:flex; flex-direction:column; gap:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; width: 100%;">
        <!-- Right: Back/Close -->
        <button onclick="UI.toggleSidebar()" class="icon-btn sidebar-no-hover" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; color:#fff; background:transparent; border:none; margin:0; padding:0;">
          <i data-lucide="chevron-right" style="width:22px;height:22px;"></i>
        </button>
        <!-- Center: Name -->
        <span id="sidebar-user-name" style="font-weight:700; font-size:16px; color:#fff;">المستخدم</span>
        <!-- Left: Search & New Chat -->
        <div style="display:flex; gap:8px;">
          <button onclick="document.getElementById('mobile-search-container').style.display = document.getElementById('mobile-search-container').style.display === 'none' ? 'block' : 'none';" class="icon-btn sidebar-no-hover" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; color:#fff; background:transparent; border:none; margin:0; padding:0;">
            <i data-lucide="search" style="width:20px;height:20px;"></i>
          </button>
          <button onclick="Main.newChat(); UI.toggleSidebar();" class="icon-btn sidebar-no-hover" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; color:#fff; background:transparent; border:none; margin:0; padding:0;">
            <i data-lucide="plus" style="width:22px;height:22px;"></i>
          </button>
        </div>
      </div>"""

new_sidebar_header = """    <!-- DESKTOP HEADER (App Name + Search) -->
    <div class="sidebar-header desktop-only" style="padding: 16px 16px 8px 16px;">
      <span class="sidebar-app-name">AI Agent Pro</span>
      <div style="position:relative;">
        <i data-lucide="search" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:rgba(255,255,255,0.4);"></i>
        <input type="text" placeholder="بحث في التاريخ..." oninput="Main.searchHistory(this.value)" 
               style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 35px 10px 12px; color:#fff; font-size:13px; outline:none;">
      </div>
    </div>

    <!-- MOBILE HEADER (Back, App Name, Search, New Chat) -->
    <div class="sidebar-header mobile-only" style="padding: calc(var(--safe-top) + 16px) 16px 8px 16px; display:flex; flex-direction:column; gap:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; width: 100%;">
        <!-- Right: Back/Close -->
        <button onclick="UI.toggleSidebar()" class="icon-btn sidebar-no-hover mobile-header-circle-btn">
          <i data-lucide="chevron-right" style="width:20px;height:20px;"></i>
        </button>
        <!-- Center: App Name -->
        <span style="font-weight:800; font-size:17px; color:#fff; letter-spacing:-0.5px;">AI Agent Pro</span>
        <!-- Left: Search & New Chat -->
        <div style="display:flex; gap:8px;">
          <button onclick="document.getElementById('mobile-search-container').style.display = document.getElementById('mobile-search-container').style.display === 'none' ? 'block' : 'none';" class="icon-btn sidebar-no-hover mobile-header-circle-btn">
            <i data-lucide="search" style="width:18px;height:18px;"></i>
          </button>
          <button onclick="Main.newChat(); UI.toggleSidebar();" class="icon-btn sidebar-no-hover mobile-header-circle-btn">
            <i data-lucide="plus" style="width:20px;height:20px;"></i>
          </button>
        </div>
      </div>"""

html = html.replace(old_sidebar_header, new_sidebar_header)

# Fix Mobile Tools Sheet (Remove Terminal & Voice, Make Header Transparent)
sheet_header_regex = r'<div class="sheet-header">.*?</div>'
# Make header transparent by adding style directly or class
html = re.sub(r'<div class="sheet-header">', r'<div class="sheet-header" style="background:transparent; border-bottom:none;">', html)

# Remove terminal item from sheet
html = re.sub(r'<div class="sheet-list-item" onclick="UI\.openTerminal\(\); UI\.closeBottomSheet\(\);">.*?</div>\s*</div>\s*</div>', '', html, flags=re.DOTALL)
# The regex above is tricky, let's do a string replacement for the terminal block
terminal_block = """        <div class="sheet-list-item" onclick="UI.openTerminal(); UI.closeBottomSheet();">
          <div class="sheet-list-icon cyan"><i data-lucide="terminal" style="width:20px;height:20px"></i></div>
          <div class="sheet-list-info">
            <div class="sheet-list-title">تيرمينال</div>
            <div class="sheet-list-desc">تنفيذ الأوامر البرمجية</div>
          </div>
          <i data-lucide="chevron-left" style="width:16px;height:16px;color:var(--text3);opacity:0.5"></i>
        </div>"""
html = html.replace(terminal_block, '')

# Remove Voice recording block
voice_block = """        <div class="sheet-list-item" onclick="Main.toggleVoice(); UI.closeBottomSheet();">
          <div class="sheet-list-icon red"><i data-lucide="mic" style="width:20px;height:20px"></i></div>
          <div class="sheet-list-info">
            <div class="sheet-list-title">تسجيل صوتي</div>
            <div class="sheet-list-desc">تحويل الكلام لنص</div>
          </div>
          <i data-lucide="chevron-left" style="width:16px;height:16px;color:var(--text3);opacity:0.5"></i>
        </div>"""
html = html.replace(voice_block, '')

# Web Search block - already there but make sure it's kept. The user asked to put it above, but it's already above prompts.

with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("[OK] Executed targeted bug fixes and layout adjustments.")
