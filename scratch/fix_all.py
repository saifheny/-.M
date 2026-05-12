"""
Comprehensive fix script for AI Agent Pro.
1. Remove corrupted UTF-16 bytes from CSS files
2. Rewrite the layout section at the bottom of style.css
3. Remove the nav bar from index.html  
4. Fix mobile.css corruption and add proper mobile layout
5. Fix header/search-bar positioning issues
"""
import re

# ============================================================
# 1. FIX style.css
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'r', encoding='utf-8', errors='replace') as f:
    css = f.read()

# Remove all null bytes and corrupted data from line 4773 onwards
# Find the last valid closing brace of the @media (max-width: 1023px) block
# and truncate everything after it
marker = '@media (max-width: 1023px) {\n  .app-layout {\n    flex-direction: column;\n  }\n  .sidebar {\n    position: fixed;\n    top: 16px;\n    bottom: 16px;\n    right: 16px;\n    width: 300px;\n    z-index: 1000;\n  }\n  .sidebar.collapsed {\n    transform: translateX(120%);\n    opacity: 0;\n    pointer-events: none;\n  }\n}'

# Find where corruption starts (null bytes)
clean_end = css.find('\x00')
if clean_end > 0:
    css = css[:clean_end].rstrip()

# Also remove any \r\x00 patterns
css = css.replace('\r\x00', '')
css = css.replace('\x00', '')

# Remove the entire broken layout section at the bottom and rewrite it
# Find "/* Layout Wrapper */" and everything after
layout_marker = '/* Layout Wrapper */'
layout_idx = css.find(layout_marker)
if layout_idx > 0:
    css = css[:layout_idx].rstrip()

# Remove the old .header block entirely and the .header-title that follows
# Since user wants NO top bar, we hide .header
old_header = """.header {
  height: var(--header-h);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  flex-shrink: 0;
  z-index: 1000; /* Higher than search and messages */
  position: sticky;
  top: 0;
  background: var(--bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  opacity: 0.98;
}"""
css = css.replace(old_header, """.header {
  display: none !important;
}""")

# Fix .messages padding - remove any reference to --header-h since header is gone
css = css.replace('padding-top: calc(var(--header-h) + 16px);', '')

# Fix body - ensure proper height
css = css.replace(
    """html,
body {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  overscroll-behavior: none;
}""",
    """html,
body {
  width: 100%;
  max-width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
  overscroll-behavior: none;
  -webkit-text-size-adjust: 100%;
}"""
)

# Fix .main to be a proper flex child
css = css.replace(
    """.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  position: relative;
}""",
    """.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  position: relative;
  height: 100%;
}"""
)

# Fix .nav - remove border-left since it's on the right side visually
# and ensure it takes full height
css = css.replace(
    """.nav {
  width: var(--nav-w);
  background: var(--bg1);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  flex-shrink: 0;
  z-index: 50;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}""",
    """.nav {
  width: var(--nav-w);
  background: var(--bg1);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  flex-shrink: 0;
  z-index: 50;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}"""
)

# Fix .chat-panel to take full height and not clip input
css = css.replace(
    """.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  transition: all var(--transition-smooth);
  background: var(--bg);
  position: relative;
}""",
    """.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: var(--bg);
  position: relative;
}"""
)

# Fix .messages to be scrollable within chat-panel
css = css.replace(
    """.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 180px;
  transform: translateZ(0); /* Fix black flashing */
}""",
    """.messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 20px;
  transform: translateZ(0);
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
  contain: layout style;
}"""
)

# Fix .search-bar-panel position  
css = css.replace(
    """.search-bar-panel {
  background: var(--bg1);
  border-bottom: 1px solid var(--border);
  padding: 12px 24px;
  position: absolute;
  top: var(--header-h);
  left: 0;
  right: 0;
  z-index: 9;
  box-shadow: var(--shadow-md);
}""",
    """.search-bar-panel {
  background: var(--bg1);
  border-bottom: 1px solid var(--border);
  padding: 12px 24px;
  position: relative;
  z-index: 9;
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}"""
)

# Fix .input-wrap to stay at the bottom of chat-panel
input_wrap_fix = """
.input-wrap {
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}
"""

# Check if .input-wrap already exists
if '.input-wrap {' not in css:
    css += '\n' + input_wrap_fix

# Now append the CLEAN layout section
clean_layout = """

/* ===== Layout Wrapper ===== */
.app-layout {
  display: flex;
  flex-direction: row;
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg);
}

/* ===== Desktop Layout (>=1024px) ===== */
@media (min-width: 1024px) {
  .nav {
    display: flex !important;
  }
  .sidebar {
    position: relative !important;
    top: auto !important;
    bottom: auto !important;
    right: auto !important;
    left: auto !important;
    transform: none !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    border-left: 1px solid var(--border) !important;
    background: var(--bg1) !important;
    width: 280px !important;
    display: flex !important;
    flex-shrink: 0 !important;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.2s ease !important;
    overflow: hidden !important;
    height: 100% !important;
  }
  .sidebar.collapsed {
    width: 0 !important;
    min-width: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    border-left: none !important;
    padding: 0 !important;
  }
  .main {
    flex: 1 !important;
    min-width: 0 !important;
    position: relative !important;
    height: 100% !important;
  }
  .mobile-only,
  .mobile-float-btn,
  .floating-top-controls,
  .mobile-float-model,
  .mobile-header {
    display: none !important;
  }
}

/* ===== Mobile Layout (<1024px) ===== */
@media (max-width: 1023px) {
  .app-layout {
    flex-direction: column !important;
    height: 100dvh !important;
    width: 100vw !important;
  }
  .nav {
    display: none !important;
  }
  .sidebar {
    position: fixed !important;
    top: 0 !important;
    bottom: 0 !important;
    right: 0 !important;
    left: auto !important;
    width: 85vw !important;
    max-width: 340px !important;
    z-index: 9999 !important;
    border-radius: 16px 0 0 16px !important;
    background: var(--bg1) !important;
    box-shadow: -8px 0 40px rgba(0,0,0,0.5) !important;
  }
  .sidebar.collapsed {
    transform: translateX(120%) !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  .sidebar:not(.collapsed) {
    transform: translateX(0) !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }
  .main {
    flex: 1 !important;
    min-width: 0 !important;
    height: 100% !important;
    overflow: hidden !important;
  }
}
"""

css += clean_layout

with open(r'c:\Users\hp zbook\Desktop\LM\css\style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("[OK] style.css fixed")


# ============================================================
# 2. FIX mobile.css - remove corrupted bytes at the end
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\css\mobile.css', 'r', encoding='utf-8', errors='replace') as f:
    mobile_css = f.read()

# Remove null bytes
clean_end = mobile_css.find('\x00')
if clean_end > 0:
    mobile_css = mobile_css[:clean_end].rstrip()
mobile_css = mobile_css.replace('\r\x00', '')
mobile_css = mobile_css.replace('\x00', '')

# Fix the first breakpoint (should already be 1023px from earlier)
# Make sure .main has proper padding for mobile floating controls
# Ensure .main doesn't have excessive padding-top
mobile_css = mobile_css.replace(
    '  padding-top: calc(var(--safe-top) + 64px);',
    '  padding-top: calc(var(--safe-top) + 60px);'
)

with open(r'c:\Users\hp zbook\Desktop\LM\css\mobile.css', 'w', encoding='utf-8') as f:
    f.write(mobile_css)

print("[OK] mobile.css fixed")


# ============================================================
# 3. FIX index.html - remove the <nav> element entirely
# ============================================================
with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the entire <nav class="nav" id="main-nav"> ... </nav> block
nav_start = html.find('<nav class="nav" id="main-nav">')
nav_end = html.find('</nav>', nav_start)
if nav_start > 0 and nav_end > nav_start:
    nav_end += len('</nav>')
    html = html[:nav_start] + html[nav_end:]
    print("[OK] <nav> removed from index.html")

# Remove the .header div from .chat-panel if it exists
header_start = html.find('<div class="header">')
if header_start > 0:
    # Find the matching closing </div>
    depth = 0
    i = header_start
    while i < len(html):
        if html[i:i+4] == '<div':
            depth += 1
        elif html[i:i+6] == '</div>':
            depth -= 1
            if depth == 0:
                html = html[:header_start] + html[i+6:]
                print("[OK] .header div removed from index.html")
                break
        i += 1

# Make sure floating-top-controls has mobile-only class
html = html.replace(
    '<div class="floating-top-controls" id="floating-controls">',
    '<div class="floating-top-controls mobile-only" id="floating-controls">'
)

# Fix the unclosed <div class="float-model"> - it's missing </div>
# The structure is broken: float-model contains a button that should be a sibling
html = html.replace(
    '''    <div class="float-model" onclick="UI.showModal('model-picker-modal')" title="\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0646\u0645\u0648\u0630\u062c">
      <span class="mobile-model-dot"></span>
      <span id="mobile-current-model">GPT-5.5</span>
    <button type="button" class="mobile-float-btn float-right" onclick="UI.toggleSidebar()" aria-label="\u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a"
      style="right:14px; pointer-events:auto;"><i data-lucide="menu" style="width:22px;height:22px"></i></button>
  </div>''',
    '''    <div class="float-model" onclick="UI.showModal('model-picker-modal')" title="\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0646\u0645\u0648\u0630\u062c">
      <span class="mobile-model-dot"></span>
      <span id="mobile-current-model">GPT-5.5</span>
    </div>
    <button type="button" class="mobile-float-btn float-right" onclick="UI.toggleSidebar()" aria-label="\u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a"
      style="right:14px; pointer-events:auto;"><i data-lucide="menu" style="width:22px;height:22px"></i></button>
  </div>'''
)

with open(r'c:\Users\hp zbook\Desktop\LM\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("[OK] index.html fixed")
print("\n[DONE] All fixes applied successfully!")
