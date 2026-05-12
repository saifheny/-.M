import re

# 1. Fix index.html
with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the chat list ID
html = html.replace('id="chat-history-list"', 'id="chat-list"')
html = html.replace('id="history-list"', 'id="chat-list"')

# Revert the hardcoded "سيف" and use generic elements for JS to update
user_footer = """
    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="UI.showModal('account-modal')" style="cursor:pointer; display:flex; align-items:center; gap:12px; width:100%; padding:10px;">
        <div class="nav-avatar" style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #6366f1, #a855f7); display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:18px;">U</div>
        <div style="display:flex; flex-direction:column; flex:1;">
          <span id="sidebar-user-name" style="color:#fff; font-size:14px; font-weight:700;">المستخدم</span>
          <span style="color:rgba(255,255,255,0.5); font-size:11px;">الحساب والإعدادات</span>
        </div>
        <i data-lucide="settings" style="width:16px; height:16px; color:rgba(255,255,255,0.4);"></i>
      </div>
    </div>
"""

# Find the current footer and replace
html = re.sub(r'<div class="sidebar-footer">.*?</div>\s*</aside>', user_footer + "\n  </aside>", html, flags=re.DOTALL)

with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Fix js/main.js to dynamically set the name
with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_sync = """      const nameEl = document.getElementById('account-name-edit');
      if (nameEl && !isGuest) nameEl.textContent = u.name || 'المستخدم';"""

new_sync = """      const nameEl = document.getElementById('account-name-edit');
      if (nameEl && !isGuest) nameEl.textContent = u.name || 'المستخدم';
      
      const sidebarNameEl = document.getElementById('sidebar-user-name');
      if (sidebarNameEl) sidebarNameEl.textContent = isGuest ? 'زائر' : (u.name || 'المستخدم');"""

if "sidebar-user-name" not in js:
    js = js.replace(old_sync, new_sync)

with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'w', encoding='utf-8') as f:
    f.write(js)


# 3. Fix style.css for chat-list (which was renamed) and search bar aesthetics
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Fix the CSS target for the chat list
css = css.replace('#chat-history-list', '#chat-list')
css = css.replace('#history-list', '#chat-list')

# Ensure search bar in sidebar looks clean and not ugly
search_fix = """
/* Clean Search Bar inside Sidebar */
.sidebar-header input[type="text"] {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  padding: 10px 35px 10px 12px !important;
  color: #fff !important;
  font-size: 13px !important;
  outline: none !important;
  transition: all 0.2s ease !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1) !important;
}

.sidebar-header input[type="text"]:focus {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(99, 102, 241, 0.5) !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), inset 0 2px 4px rgba(0,0,0,0.1) !important;
}

.chat-item {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  padding: 12px !important;
  border-radius: 12px !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  color: #fff !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  margin-bottom: 4px !important;
  text-align: right !important;
  direction: rtl !important;
  position: relative !important;
}

.chat-item:hover {
  background: rgba(255, 255, 255, 0.04) !important;
}

.chat-item.active {
  background: rgba(59, 130, 246, 0.1) !important;
  border-color: rgba(59, 130, 246, 0.2) !important;
}

.chat-item-title {
  font-weight: 600 !important;
  font-size: 14px !important;
  color: rgba(255,255,255,0.9) !important;
  margin-bottom: 4px !important;
}

.chat-item-preview {
  font-size: 11px !important;
  color: rgba(255,255,255,0.5) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  width: 100% !important;
}

.chat-item-actions {
  position: absolute !important;
  left: 8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  opacity: 0 !important;
  transition: opacity 0.2s !important;
}

.chat-item:hover .chat-item-actions {
  opacity: 1 !important;
}
"""

if ".chat-item-title" not in css:
    css += search_fix
else:
    # Append anyway to override
    css += search_fix

with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("[OK] User name logic restored dynamically. History list restored. Search bar fixed.")
