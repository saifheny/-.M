import re

# ============================================================
# 1. Update index.html
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1A. Change New Chat button logic
html = html.replace('onclick="Main.clearChat()" title="محادثة جديدة" id="nav-new-chat"', 'onclick="Main.newChat()" title="محادثة جديدة" id="nav-new-chat"')

# 1B. Remove Nav Search icon block
search_nav_block = """      <button class="nav-btn" onclick="UI.toggleSearch()" title="بحث" id="nav-search">
        <i data-lucide="search" style="width:18px;height:18px"></i>
        <span class="tooltip">بحث في الرسائل</span>
      </button>"""
html = html.replace(search_nav_block, '')

# 1C. Replace Sidebar Header with Dual Mobile/Desktop Layout
old_header_regex = r'<div class="sidebar-header".*?</div>\s*</div>' # This might not catch everything.
# Let's extract between <aside...> and <div id="chat-list"
sidebar_start = html.find('<aside class="sidebar"')
if sidebar_start != -1:
    chat_list_start = html.find('<div id="chat-list"', sidebar_start)
    if chat_list_start != -1:
        # The section to replace
        old_section = html[sidebar_start:chat_list_start]
        
        # New structure
        new_header = """<aside class="sidebar" id="sidebar" style="display:flex; flex-direction:column; padding:0; background:#171717;">
    
    <!-- DESKTOP HEADER (Search Only) -->
    <div class="sidebar-header desktop-only" style="padding: 16px 16px 8px 16px;">
      <div style="position:relative;">
        <i data-lucide="search" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:rgba(255,255,255,0.4);"></i>
        <input type="text" placeholder="بحث في التاريخ..." oninput="Main.searchHistory(this.value)" 
               style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 35px 10px 12px; color:#fff; font-size:13px; outline:none;">
      </div>
    </div>

    <!-- MOBILE HEADER (Back, Name, Search, New Chat) -->
    <div class="sidebar-header mobile-only" style="padding: calc(var(--safe-top) + 16px) 16px 8px 16px;">
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
            <i data-lucide="search" style="width:18px;height:18px;"></i>
          </button>
          <button onclick="Main.newChat(); UI.toggleSidebar();" class="icon-btn sidebar-no-hover" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; color:#fff; background:transparent; border:none; margin:0; padding:0;">
            <i data-lucide="plus" style="width:20px;height:20px;"></i>
          </button>
        </div>
      </div>
      
      <!-- Mobile Search Input (Toggled) -->
      <div id="mobile-search-container" style="display:none; position:relative; margin-top:12px;">
        <i data-lucide="search" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:rgba(255,255,255,0.4);"></i>
        <input type="text" placeholder="بحث في التاريخ..." oninput="Main.searchHistory(this.value)" 
               style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 35px 10px 12px; color:#fff; font-size:13px; outline:none;">
      </div>
    </div>

    """
        html = html.replace(old_section, new_header)

with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# ============================================================
# 2. Update style.css
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('\x00', '')

# Reduce desktop width to 230px
css = css.replace('width: 280px;', 'width: 230px;')
css = css.replace('width: 280px !important;', 'width: 230px !important;')

# Apply custom CSS rules
custom_css = """
/* Mobile/Desktop Visibility Utils */
@media (min-width: 1024px) {
  .mobile-only { display: none !important; }
  .desktop-only { display: block !important; }
}
@media (max-width: 1023px) {
  .mobile-only { display: flex !important; } /* or block depending on flex */
  .sidebar-header.mobile-only { display: flex !important; flex-direction: column !important; }
  .desktop-only { display: none !important; }
}

/* Chat Item Truncation for Narrow Sidebar */
.chat-item-title {
  max-width: 180px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* Remove hover glow on mobile sidebar icons */
.sidebar-no-hover {
  transition: none !important;
}
.sidebar-no-hover:hover, .sidebar-no-hover:active {
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

/* Make Chat Item Options (Three Dots) Always Visible on Mobile */
@media (max-width: 1023px) {
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
}
"""

if ".mobile-only {" not in css:
    css += custom_css
else:
    # Just append it to ensure the latest rules apply
    css += custom_css

with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Need to update JS rendering logic for chat items to support the new mobile layout
# since we added a wrapper .chat-item-content in CSS
with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Modify renderChatItemHtml to wrap title and preview in .chat-item-content
old_chat_item = """      <div class="chat-item ${isActive} ${isSelected}" onclick="${isMulti ? `Main.toggleChatSelection('${c.id}')` : `Main.loadChat('${c.id}')`}"
           oncontextmenu="event.preventDefault(); Main.toggleMultiSelect('${c.id}')">
        <div class="chat-item-title">${this.escHtml(c.title)}</div>
        <div class="chat-item-preview">${this.escHtml(preview)}</div>
        
        ${!isMulti ? `"""

new_chat_item = """      <div class="chat-item ${isActive} ${isSelected}" onclick="${isMulti ? `Main.toggleChatSelection('${c.id}')` : `Main.loadChat('${c.id}')`}"
           oncontextmenu="event.preventDefault(); Main.toggleMultiSelect('${c.id}')">
        <div class="chat-item-content" style="flex:1; min-width:0; display:flex; flex-direction:column; align-items:flex-start;">
          <div class="chat-item-title">${this.escHtml(c.title)}</div>
          <div class="chat-item-preview">${this.escHtml(preview)}</div>
        </div>
        
        ${!isMulti ? `"""

if 'class="chat-item-content"' not in js:
    js = js.replace(old_chat_item, new_chat_item)

with open(r'c:\Users\hp zbook\Desktop\LM\js\main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("[OK] UI adjustments applied successfully.")
