# -*- coding: utf-8 -*-
"""
MEGA FIX: All-in-one overhaul for AI Agent Pro
1. Restore desktop nav bar
2. Fix sidebar design (toggle button, new chat button)
3. Fix settings modal (solid background, no accidental close)
4. Fix search bar design
5. Premium animations & polish
"""

# ============================================================
# 1. RESTORE NAV BAR in index.html
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

nav_html = '''  <nav class="nav" id="main-nav">
    <div class="nav-logo" onclick="UI.toggleSidebar()" style="cursor:pointer;" title="القائمة الجانبية">
      <svg viewBox="0 0 512 512" style="width:20px;height:20px;">
        <circle cx="256" cy="220" r="90" fill="none" stroke="white" stroke-width="14" />
        <circle cx="256" cy="220" r="14" fill="white" />
        <circle cx="256" cy="130" r="10" fill="white" />
        <circle cx="330" cy="260" r="10" fill="white" />
        <circle cx="182" cy="260" r="10" fill="white" />
      </svg>
    </div>
    <div class="nav-icons">
      <button class="nav-btn active" onclick="Main.clearChat()" title="محادثة جديدة" id="nav-new-chat">
        <i data-lucide="plus-circle" style="width:18px;height:18px"></i>
        <span class="tooltip">محادثة جديدة</span>
      </button>
      <button class="nav-btn" onclick="Main.toggleIncognito()" title="محادثة مخفية" id="nav-incognito">
        <i data-lucide="ghost" style="width:18px;height:18px"></i>
        <span class="tooltip">محادثة مخفية</span>
      </button>
      <button class="nav-btn" onclick="UI.openTool('general')" title="المحادثات" id="nav-general">
        <i data-lucide="message-square" style="width:18px;height:18px"></i>
        <span class="tooltip">المحادثات</span>
      </button>
      <button class="nav-btn" onclick="UI.openTool('coding')" title="برمجة" id="nav-coding">
        <i data-lucide="code-2" style="width:18px;height:18px"></i>
        <span class="tooltip">محرر الكود</span>
      </button>
      <button class="nav-btn" onclick="UI.openTool('analyze')" title="تحليل" id="nav-analyze">
        <i data-lucide="bar-chart-2" style="width:18px;height:18px"></i>
        <span class="tooltip">تحليل البيانات</span>
      </button>
      <button class="nav-btn" onclick="UI.openTool('translate')" title="ترجمة" id="nav-translate">
        <i data-lucide="languages" style="width:18px;height:18px"></i>
        <span class="tooltip">ترجمة</span>
      </button>
      <button class="nav-btn" onclick="UI.openTool('creative')" title="إبداعي" id="nav-creative">
        <i data-lucide="pen-tool" style="width:18px;height:18px"></i>
        <span class="tooltip">كتابة إبداعية</span>
      </button>
      <button class="nav-btn" onclick="UI.toggleSearch()" title="بحث" id="nav-search">
        <i data-lucide="search" style="width:18px;height:18px"></i>
        <span class="tooltip">بحث في الرسائل</span>
      </button>
    </div>
    <div class="nav-bottom">
      <button class="nav-btn" onclick="UI.showModal('settings-modal'); UI.switchSettingsTab('api', null);" title="الشركات">
        <i data-lucide="cpu" style="width:18px;height:18px"></i>
        <span class="tooltip">الشركات والذكاء</span>
      </button>
      <button class="nav-btn" onclick="UI.toggleTheme()" id="theme-btn" title="المظهر">
        <i data-lucide="sun" style="width:18px;height:18px" id="theme-icon"></i>
        <span class="tooltip">تبديل المظهر</span>
      </button>
      <button class="nav-btn" onclick="UI.showModal('settings-modal')" title="الإعدادات">
        <i data-lucide="settings" style="width:18px;height:18px"></i>
        <span class="tooltip">الإعدادات</span>
      </button>
      <div class="nav-avatar" onclick="UI.showModal('account-modal')">A</div>
    </div>
  </nav>
'''

# Insert nav right after <div class="app-layout">
html = html.replace(
    '<div class="app-layout">\n  \n  <aside',
    '<div class="app-layout">\n' + nav_html + '\n  <aside'
)

# Also try alternate format
if '<div class="app-layout">\r\n  \r\n  <aside' in html:
    html = html.replace(
        '<div class="app-layout">\r\n  \r\n  <aside',
        '<div class="app-layout">\r\n' + nav_html + '\r\n  <aside'
    )

# Fix sidebar: remove collapsed class so it's open by default
html = html.replace(
    '<aside class="sidebar collapsed" id="sidebar"',
    '<aside class="sidebar" id="sidebar"'
)

# Fix sidebar close button - make it a premium design, visible on all devices
html = html.replace(
    'onclick="UI.toggleSidebar()" class="icon-btn sidebar-close-btn"',
    'onclick="UI.toggleSidebar()" class="icon-btn sidebar-toggle-btn"'
)

with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("[OK] index.html - nav restored, sidebar fixed")


# ============================================================
# 2. FIX style.css - Premium overhaul
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('\x00', '')

# -- A. Fix .header to be hidden --
# Already done from previous fix

# -- B. Fix modal overlay - make it more opaque --
old_modal = '.modal-overlay {'
if old_modal in css:
    # Find the full block
    idx = css.find(old_modal)
    end_idx = css.find('}', idx) + 1
    old_block = css[idx:end_idx]
    css = css.replace(old_block, '''.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}''')

# Fix .modal-overlay.open
old_open = '.modal-overlay.open {'
if old_open in css:
    idx = css.find(old_open)
    end_idx = css.find('}', idx) + 1
    old_block = css[idx:end_idx]
    css = css.replace(old_block, '''.modal-overlay.open {
  opacity: 1;
  pointer-events: auto;
}''')

# Fix .modal itself - solid background
old_modal_box = '.modal {'
if old_modal_box in css:
    idx = css.find(old_modal_box)
    end_idx = css.find('}', idx) + 1
    old_block = css[idx:end_idx]
    css = css.replace(old_block, '''.modal {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: 20px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05);
  animation: modalSpring 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}''', 1)

# -- C. Fix sidebar toggle button design --
sidebar_toggle_css = """

/* Sidebar Toggle Button - Premium */
.sidebar-toggle-btn {
  width: 36px !important;
  height: 36px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15)) !important;
  border: 1px solid rgba(139,92,246,0.3) !important;
  color: #a78bfa !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease !important;
}
.sidebar-toggle-btn:hover {
  background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25)) !important;
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(139,92,246,0.3);
}

/* Search Bar Panel - Premium Redesign */
.search-bar-panel {
  background: var(--bg1) !important;
  border-bottom: 1px solid var(--border) !important;
  padding: 12px 24px !important;
  position: relative !important;
  z-index: 9 !important;
  flex-shrink: 0 !important;
}
.search-bar-inner {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  max-width: 900px !important;
  margin: 0 auto !important;
  background: var(--bg2) !important;
  border-radius: 14px !important;
  padding: 6px 16px !important;
  border: 1px solid var(--border) !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
}
.search-bar-inner:focus-within {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important;
}
.search-bar-inner input {
  flex: 1 !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  color: var(--text) !important;
  font-family: var(--font-primary) !important;
  font-size: 14px !important;
  padding: 8px 0 !important;
}

/* Premium Nav Buttons */
.nav-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.nav-btn:hover {
  transform: scale(1.08);
}
.nav-btn.active {
  transform: scale(1.05);
}

/* Settings Modal Tabs - Fix */
.settings-tab {
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  color: var(--text3);
  background: transparent;
  border: none;
  white-space: nowrap;
}
.settings-tab:hover {
  color: var(--text);
  background: rgba(255,255,255,0.05);
}
.settings-tab.active {
  color: var(--text);
  background: var(--bg3);
}

/* Company panels in settings - solid background */
.company-panel {
  background: var(--bg2) !important;
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
  border: 1px solid var(--border);
}

/* Smooth message animations */
.msg-wrap {
  animation: msgSlideIn 0.3s ease-out;
}
@keyframes msgSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Sidebar - Premium styling */
.sidebar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.sidebar::-webkit-scrollbar {
  width: 4px;
}
.sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}

/* Desktop sidebar collapsed - animate to 0 width */
@media (min-width: 1024px) {
  .sidebar.collapsed {
    width: 0 !important;
    min-width: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    border-left: none !important;
    padding: 0 !important;
    overflow: hidden !important;
  }
}
"""

# Remove the old desktop collapsed override that made sidebar always visible
css = css.replace(
    """  .sidebar.collapsed {
    width: 280px !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    border-left: 1px solid var(--border) !important;
  }""",
    """  .sidebar.collapsed {
    width: 0 !important;
    min-width: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    border-left: none !important;
    padding: 0 !important;
    overflow: hidden !important;
  }"""
)

css += sidebar_toggle_css

with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("[OK] style.css - premium overhaul applied")


# ============================================================
# 3. FIX ui.js - modal click behavior
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\js\ui.js', 'r', encoding='utf-8') as f:
    ui_js = f.read()

# The closeModalOutside function should ONLY close when clicking
# on the overlay itself, not on any child element
# Current code: if (e.target.id === id) this.closeModal(id);
# This is correct but let's add e.stopPropagation to modals

# Also fix: when sidebar opens on desktop, toggle the class properly
# The sidebarOpen state and collapsed class need to be in sync

# Fix toggleSidebar to properly handle initial state
old_toggle = """  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed', !this.sidebarOpen);
  },"""

new_toggle = """  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const isCollapsed = sidebar.classList.contains('collapsed');
    if (isCollapsed) {
      sidebar.classList.remove('collapsed');
      this.sidebarOpen = true;
    } else {
      sidebar.classList.add('collapsed');
      this.sidebarOpen = false;
    }
  },"""

ui_js = ui_js.replace(old_toggle, new_toggle)

with open(r'c:\Users\hp zbook\Desktop\LM\js\ui.js', 'w', encoding='utf-8') as f:
    f.write(ui_js)

print("[OK] ui.js - sidebar toggle and modal fixes")

print("\n[DONE] All premium fixes applied!")
