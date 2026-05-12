import re

# ============================================================
# 1. Update index.html
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make Mobile Header floating and circular
# Previously it was a block. Let's position it absolutely on top of the sidebar.
old_mobile_header = """    <!-- MOBILE HEADER (Back, App Name, Search, New Chat) -->
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
      </div>
      <!-- Mobile Search Input (Toggled) -->
      <div id="mobile-search-container" style="display:none; position:relative;">
        <i data-lucide="search" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:rgba(255,255,255,0.4);"></i>
        <input type="text" placeholder="بحث في التاريخ..." oninput="Main.searchHistory(this.value)" 
               style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 35px 10px 12px; color:#fff; font-size:13px; outline:none;">
      </div>
    </div>"""

# Replace it with floating elements
new_mobile_header = """    <!-- MOBILE HEADER (Floating) -->
    <div class="mobile-only" style="position: absolute; top: 16px; left: 16px; right: 16px; z-index: 100; display: flex; justify-content: space-between; align-items: center; pointer-events: none;">
      <!-- Right: Back/Close -->
      <button onclick="UI.toggleSidebar()" class="icon-btn mobile-header-circle-btn" style="pointer-events: auto;">
        <i data-lucide="chevron-right" style="width:20px;height:20px;"></i>
      </button>
      
      <!-- Left: Search & New Chat -->
      <div style="display:flex; gap:8px;">
        <button onclick="const el = document.getElementById('mobile-search-container'); el.style.display = el.style.display === 'none' ? 'block' : 'none';" class="icon-btn mobile-header-circle-btn" style="pointer-events: auto;">
          <i data-lucide="search" style="width:18px;height:18px;"></i>
        </button>
        <button onclick="Main.newChat(); UI.toggleSidebar();" class="icon-btn mobile-header-circle-btn" style="pointer-events: auto;">
          <i data-lucide="plus" style="width:20px;height:20px;"></i>
        </button>
      </div>
    </div>
    
    <!-- Mobile Search Input (Toggled) - Positioned below the icons -->
    <div id="mobile-search-container" class="mobile-only" style="display:none; position:absolute; top: 70px; left: 16px; right: 16px; z-index: 99;">
      <div style="position:relative;">
        <!-- Arrow pointing to the search icon -->
        <div style="position:absolute; top:-8px; left:46px; width:0; height:0; border-left:8px solid transparent; border-right:8px solid transparent; border-bottom:8px solid rgba(255,255,255,0.1);"></div>
        <i data-lucide="search" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:rgba(255,255,255,0.4);"></i>
        <input type="text" placeholder="بحث في التاريخ..." oninput="Main.searchHistory(this.value)" 
               style="width:100%; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px 35px 12px 12px; color:#fff; font-size:14px; outline:none; box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(10px);">
      </div>
    </div>
"""

if "<!-- MOBILE HEADER (Floating) -->" not in html:
    html = html.replace(old_mobile_header, new_mobile_header)

# Make sure the chat-list on mobile has enough padding-top so the floating header doesn't cover the first item
html = html.replace('<div id="chat-list" style="flex:1; overflow-y:auto; padding:10px 0;">', '<div id="chat-list" style="flex:1; overflow-y:auto; padding:10px 0; padding-top: 70px;">')

# Fix Laptop Account Modal stretching: it might be because .settings-row is expanding.
# Let's wrap modal body content in a max-width container if it's not already.
html = html.replace('<div class="modal-body" style="padding:0 20px 40px; background:var(--bg);">', '<div class="modal-body" style="padding:0 20px 40px; background:var(--bg); max-width: 480px; margin: 0 auto; width: 100%;">')

with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# ============================================================
# 2. Update css/style.css
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Restore circular glowing background for mobile icons
# Remove the old transparent override
transparent_rule = """/* Styling for the 3 top header icons on mobile to be transparent and floating */
.mobile-header-circle-btn {
  width: 38px !important;
  height: 38px !important;
  background: transparent !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #fff !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
}"""
css = css.replace(transparent_rule, '')

# Make sure the circular rule exists and is strong
circular_rule = """/* Styling for the 3 top header icons on mobile to look like ChatGPT (black glowing circles) */
.mobile-header-circle-btn {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  background: rgba(15, 15, 15, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #fff !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
  backdrop-filter: blur(10px) !important;
  transition: transform 0.2s, background 0.2s !important;
}
.mobile-header-circle-btn:active {
  transform: scale(0.95) !important;
  background: rgba(255,255,255,0.1) !important;
}"""

if "background: rgba(15, 15, 15, 0.8) !important;" not in css:
    css += "\n" + circular_rule

# Remove the potentially dangerous black_screen_fix
dangerous_css = """/* Fix Black Screen & Visibility */
.chat-panel {
  background: var(--bg) !important;
  z-index: 1 !important;
}
.messages {
  background: transparent !important;
  color: var(--text) !important;
  opacity: 1 !important;
  visibility: visible !important;
}
.main {
  background: var(--bg) !important;
}"""
css = css.replace(dangerous_css, '')

with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# ============================================================
# 3. Update js/main.js - Black screen safety fix
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add a safety try-catch inside renderMessages and appendMessage to prevent total crash
old_render_msgs = """  renderMessages() {
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
  },"""

new_render_msgs = """  renderMessages() {
    try {
      const container = document.getElementById('messages');
      const welcome = document.getElementById('welcome-screen');
      if(!container) return;
      container.innerHTML = '';
      if(welcome) container.appendChild(welcome);
      if (this.messages.length === 0) {
        if(welcome) welcome.style.display = 'flex';
      } else {
        if(welcome) welcome.style.display = 'none';
        this.messages.forEach(m => {
          try { this.appendMessage(m, false); } catch(e) { console.error('Failed to append message', e); }
        });
      }
      container.style.visibility = 'visible';
      container.style.opacity = '1';
    } catch(err) {
      console.error('renderMessages error:', err);
    }
  },"""

if "try { this.appendMessage(m, false);" not in js:
    js = js.replace(old_render_msgs, new_render_msgs)

with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("[OK] Executed fixes for mobile UI and black screen bug.")
