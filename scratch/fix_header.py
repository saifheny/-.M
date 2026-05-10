import os

file_path = r'c:\Users\hp zbook\Desktop\LM\index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Remove all mobile-header blocks and replace with one
pattern = re.compile(r'<header class="mobile-header floating-header".*?</header>', re.DOTALL)
new_header = '''<header class="mobile-header floating-header" aria-label="شريط الجوال">
    <button type="button" class="mobile-float-btn" onclick="UI.toggleSidebar()" aria-label="القائمة"><i data-lucide="menu" style="width:24px;height:24px"></i></button>
    <div class="mobile-title" style="flex:1; text-align:center; font-weight:800; font-size:18px;">AI Agent Pro</div>
    <div class="mobile-float-model" onclick="UI.showModal(\'model-picker-modal\')">
      <span class="mobile-model-dot"></span>
      <span id="mobile-current-model">GPT-5.5</span>
      <i data-lucide="chevron-down" style="width:12px;height:12px;color:var(--text3)"></i>
    </div>
    <button type="button" class="mobile-float-btn" onclick="Main.newChat()" aria-label="محادثة جديدة"><i data-lucide="plus" style="width:24px;height:24px"></i></button>
  </header>'''

content = pattern.sub('', content)

# Inject the new header after the script block at the top of the body
script_end = '    });\n  </script>'
if script_end in content:
    content = content.replace(script_end, script_end + '\n\n  ' + new_header)
else:
    # Fallback: just put it at the beginning of the body
    content = content.replace('<body class="theme-dark">', '<body class="theme-dark">\n  ' + new_header)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
