
# -*- coding: utf-8 -*-
"""
Focus: MOBILE SIDEBAR OVERHAUL
- Premium Glassmorphism
- Ultra-smooth animations
- Refined layout for chat history
- High-end aesthetics
"""

import re

# ============================================================
# 1. Update style.css for Mobile Sidebar Aesthetics
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

sidebar_premium_css = """
/* --- Premium Mobile Sidebar Overhaul --- */
@media (max-width: 1023px) {
  .sidebar {
    background: rgba(10, 10, 12, 0.8) !important;
    backdrop-filter: blur(25px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
    border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
    width: 85vw !important;
    max-width: 320px !important;
    display: flex !important;
    flex-direction: column !important;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
    box-shadow: -20px 0 50px rgba(0, 0, 0, 0.5) !important;
    padding: 0 !important;
  }

  .sidebar-header {
    background: rgba(255, 255, 255, 0.03) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    padding: 20px 16px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 15px !important;
  }

  /* Chat History Items - Ultra Clean */
  .history-item {
    margin: 4px 12px !important;
    padding: 12px 16px !important;
    border-radius: 14px !important;
    background: transparent !important;
    border: 1px solid transparent !important;
    transition: all 0.2s ease !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    color: rgba(255, 255, 255, 0.7) !important;
  }

  .history-item:active, .history-item.active {
    background: rgba(59, 130, 246, 0.1) !important;
    border-color: rgba(59, 130, 246, 0.2) !important;
    color: #fff !important;
  }

  .history-item i {
    color: var(--accent) !important;
    opacity: 0.8;
  }

  /* Floating New Chat Button in Sidebar */
  .sidebar-new-chat {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
    color: white !important;
    padding: 14px !important;
    border-radius: 16px !important;
    font-weight: 700 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 10px !important;
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3) !important;
    margin: 0 16px 10px 16px !important;
    border: none !important;
    cursor: pointer !important;
  }

  .sidebar-footer {
    padding: 16px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
    background: rgba(0, 0, 0, 0.2) !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
  }

  .sidebar-user {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    width: 100% !important;
  }

  .user-avatar {
    width: 38px !important;
    height: 38px !important;
    border-radius: 50% !important;
    background: linear-gradient(45deg, #f59e0b, #ef4444) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-weight: bold !important;
    color: white !important;
    border: 2px solid rgba(255, 255, 255, 0.1) !important;
  }
}
"""

css += sidebar_premium_css

with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# ============================================================
# 2. Update index.html for refined Sidebar structure
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Refine Sidebar structure
new_sidebar_html = """
  <aside class="sidebar collapsed" id="sidebar">
    <div class="sidebar-header">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:800; font-size:18px; color:#fff; letter-spacing:-0.5px;">AI Agent Pro</span>
        <button onclick="UI.toggleSidebar()" class="sidebar-toggle-btn" style="background:rgba(255,255,255,0.05); border:none; width:32px; height:32px; border-radius:10px; color:#fff; display:flex; align-items:center; justify-content:center;">
          <i data-lucide="chevron-right" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <button onclick="Main.newChat(); UI.toggleSidebar();" class="sidebar-new-chat">
        <i data-lucide="plus" style="width:20px;height:20px;"></i>
        <span>محادثة جديدة</span>
      </button>
      <div style="position:relative; margin-top:5px;">
        <i data-lucide="search" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:rgba(255,255,255,0.4);"></i>
        <input type="text" placeholder="بحث في التاريخ..." oninput="Main.searchHistory(this.value)" 
               style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 35px 10px 12px; color:#fff; font-size:13px; outline:none;">
      </div>
    </div>

    <div id="history-list" style="flex:1; overflow-y:auto; padding:10px 0;">
      <!-- History items will be injected here -->
    </div>

    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="UI.showModal('account-modal')">
        <div class="user-avatar">A</div>
        <div style="display:flex; flex-direction:column;">
          <span style="color:#fff; font-size:13px; font-weight:600;">المستخدم</span>
          <span style="color:rgba(255,255,255,0.4); font-size:11px;">عرض الحساب</span>
        </div>
        <i data-lucide="settings" style="margin-right:auto; width:16px; height:16px; color:rgba(255,255,255,0.4);"></i>
      </div>
    </div>
  </aside>
"""

# Replace the old aside block
# Using a more flexible regex to find the aside block
html = re.sub(r'<aside.*?</aside>', new_sidebar_html, html, flags=re.DOTALL)

with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("[OK] Sidebar Overhaul Completed!")
