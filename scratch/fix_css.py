import os

file_path = r'c:\Users\hp zbook\Desktop\LM\css\style.css'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Filter out my previous messy overrides if any (marked by comments)
new_lines = []
skip = False
for line in lines:
    if '/* Mobile Overrides May 2026 */' in line or '/* Mobile Optimization 2026 */' in line:
        skip = True
    if not skip:
        new_lines.append(line)
    if skip and '}' in line and line.strip() == '}':
        skip = False

# Add clean, stable mobile overrides
mobile_css = """
/* --- 2026 Stable Mobile UI Overrides --- */
@media (max-width: 768px) {
  :root {
    --nav-w: 0px;
    --sidebar-w: 100%;
  }
  
  body {
    flex-direction: column;
  }

  .nav {
    display: none !important;
  }

  .mobile-header {
    display: flex !important;
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 60px;
    background: var(--bg-panel);
    backdrop-filter: blur(20px);
    z-index: 1000;
    padding: 0 16px;
    align-items: center;
    border-bottom: 1px solid var(--border);
  }

  .main {
    margin-top: 60px;
    height: calc(100vh - 60px);
  }

  .input-wrap {
    padding: 12px !important;
    background: transparent !important;
    bottom: 0 !important;
  }

  .input-box {
    max-width: 100% !important;
    margin: 0 !important;
    border-radius: 24px !important;
  }

  .input-row {
    padding: 8px 12px !important;
  }

  #chat-input {
    font-size: 15px !important;
  }

  .messages {
    padding: 16px !important;
    padding-bottom: 100px !important;
  }

  .sidebar {
    width: 100% !important;
    right: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
    border-radius: 0 !important;
    transform: translateX(100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  /* Voice button next to send */
  .icon-btn.voice-btn {
    order: 2;
    background: rgba(255,255,255,0.05);
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
  }
  
  .send-btn-white {
    order: 3;
    width: 36px !important;
    height: 36px !important;
  }
}
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
    f.write(mobile_css)
