
# -*- coding: utf-8 -*-
"""
FINAL RECOVERY & PREMIUM OVERHAUL
- Fix Black Screen Issue
- Fix History Visibility
- Set Name to "Seif" (سيف)
- Fix Layout Overlap
- Premium Search & Sidebar
"""

import re

# 1. Fix Name and Sidebar in index.html
with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the Footer with "Seif" and fix the toggle button
footer_fix = """
    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="UI.showModal('account-modal')" style="cursor:pointer; display:flex; align-items:center; gap:12px; width:100%; padding:10px;">
        <div class="user-avatar" style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #6366f1, #a855f7); display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:18px;">س</div>
        <div style="display:flex; flex-direction:column; flex:1;">
          <span style="color:#fff; font-size:14px; font-weight:700;">سيف</span>
          <span style="color:rgba(255,255,255,0.5); font-size:11px;">إعدادات الحساب</span>
        </div>
        <i data-lucide="settings" style="width:16px; height:16px; color:rgba(255,255,255,0.4);"></i>
      </div>
    </div>
"""

# Replace the entire footer area
html = re.sub(r'<div class="sidebar-footer">.*?</div>\s*</aside>', footer_fix + "\n  </aside>", html, flags=re.DOTALL)

# Fix the History List ID to match JS
html = html.replace('id="history-list"', 'id="chat-history-list"')

with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Fix CSS - The Black Screen and Overlap
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Fix the black screen issue (usually caused by transform or overflow conflicts)
black_screen_fix = """
/* Fix Black Screen & Visibility */
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
}

/* Sidebar History Items - Prevent Stacking */
#chat-history-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  padding: 10px !important;
}

.history-item {
  display: flex !important;
  align-items: center !important;
  padding: 12px !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #fff !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  margin-bottom: 4px !important;
  text-align: right !important;
  direction: rtl !important;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  transform: translateX(-5px) !important;
}

/* Search bar cleanup */
.search-bar-inner {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
"""

css += black_screen_fix
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("[OK] Recovery Successful. Name set to Seif. Layout fixed.")
