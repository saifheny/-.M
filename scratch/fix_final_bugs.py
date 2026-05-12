import re

# ============================================================
# 1. Update index.html
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add tools to Desktop Sidebar
# Find the desktop nav bar
nav_target = """      <button class="nav-btn" onclick="UI.openTool('creative')" title="إبداعي" id="nav-creative">
        <i data-lucide="sparkles" style="width:20px;height:20px"></i>
      </button>"""
new_nav_items = """      <button class="nav-btn" onclick="UI.openTool('creative')" title="إبداعي" id="nav-creative">
        <i data-lucide="sparkles" style="width:20px;height:20px"></i>
      </button>
      
      <!-- New Added Tools -->
      <button class="nav-btn" onclick="UI.openTool('coding')" title="مساعد البرمجة" id="nav-coding">
        <i data-lucide="code" style="width:20px;height:20px"></i>
      </button>
      <button class="nav-btn" onclick="Main.checkLoginAndUpload()" title="رفع ملفات" id="nav-upload">
        <i data-lucide="upload-cloud" style="width:20px;height:20px"></i>
      </button>"""
if "nav-coding" not in html and nav_target in html:
    html = html.replace(nav_target, new_nav_items)
elif 'onclick="UI.openTool(\'coding\')"' not in html:
    # Try another hook
    html = html.replace(nav_target, new_nav_items)

# Fix Account Modal for Guest
# Find logout button
logout_btn = """<button class="settings-row"
          style="background:var(--bg3); border-radius:16px; width:100%; color:var(--red); font-size:15px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px; border:none; cursor:pointer; padding:16px;"
          onclick="UI.showModal('logout-modal'); UI.closeModal('account-modal');">
          <i data-lucide="log-out" style="width:20px; height:20px;"></i>
          تسجيل الخروج
        </button>"""
guest_logout_btn = """<button class="settings-row" id="dynamic-logout-btn"
          style="background:var(--bg3); border-radius:16px; width:100%; color:var(--red); font-size:15px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px; border:none; cursor:pointer; padding:16px;"
          onclick="Main.handleLogoutClick()">
          <i data-lucide="log-out" style="width:20px; height:20px;"></i>
          تسجيل الخروج
        </button>"""
if 'dynamic-logout-btn' not in html:
    html = html.replace(logout_btn, guest_logout_btn)

with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# ============================================================
# 2. Update css/style.css
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Force messages visibility to fix the black screen issue and remove "contain: layout style;"
css = css.replace("contain: layout style;", "/* contain: layout style; removed to fix rendering bugs */")

black_screen_fix = """
/* CRITICAL BLACK SCREEN FIX */
.messages {
  opacity: 1 !important;
  visibility: visible !important;
  display: flex !important;
  background: transparent !important;
}
.chat-panel {
  background: var(--bg) !important;
  z-index: 1 !important;
}
"""
if "/* CRITICAL BLACK SCREEN FIX */" not in css:
    css += "\n" + black_screen_fix

with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# ============================================================
# 3. Update js/main.js
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add logic for checkLoginAndUpload and handleLogoutClick
new_methods = """
  checkLoginAndUpload() {
    const isGuest = localStorage.getItem('ai_user') === 'guest';
    if (isGuest) {
      UI.toast('يرجى تسجيل الدخول أو إنشاء حساب لرفع الملفات', 'error');
      return;
    }
    document.getElementById('file-upload').click();
  },
  handleLogoutClick() {
    const isGuest = localStorage.getItem('ai_user') === 'guest';
    if (isGuest) {
      UI.toast('أنت تستخدم كضيف، قم بإنشاء حساب للوصول لجميع الميزات', 'info');
      // Prompt user to go to login page
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      UI.showModal('logout-modal');
      UI.closeModal('account-modal');
    }
  },
"""
if "checkLoginAndUpload()" not in js:
    # Insert it right before "isListening: false,"
    js = js.replace("isListening: false,", new_methods + "  isListening: false,")

with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("[OK] Fixed logic for Guest, Added Desktop Sidebar tools, Applied aggressive CSS fixes for Black Screen.")
