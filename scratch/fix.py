import io
with io.open("c:/Users/hp zbook/Desktop/LM/index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

replacement = """        <div class="tool-card" onclick="Editor.toggleSplitScreen(); UI.toggleSidebar();">
          <div class="tool-icon bg-blue text-accent"><i data-lucide="code-2" style="width:18px;height:18px"></i></div>
          <div class="tool-info">
            <div class="tool-name">محرر الأكواد المتقدم</div>
            <div class="tool-desc">مساحة التطوير المدمجة</div>
          </div>
        </div>
        <div class="tool-card" onclick="UI.openTerminal(); UI.toggleSidebar();">
          <div class="tool-icon" style="background:rgba(6,182,212,0.15); color:#06b6d4;"><i data-lucide="terminal" style="width:18px;height:18px"></i></div>
          <div class="tool-info">
            <div class="tool-name">التيرمينال (Terminal)</div>
            <div class="tool-desc">أداة التحكم المتقدمة</div>
          </div>
        </div>
        <div class="tool-card" onclick="Main.toggleWebSearch(); UI.toggleSidebar();">
          <div class="tool-icon" style="background:rgba(16,185,129,0.15); color:#10b981;"><i data-lucide="globe" style="width:18px;height:18px"></i></div>
          <div class="tool-info">
            <div class="tool-name">البحث في الويب</div>
            <div class="tool-desc">البحث المباشر من الإنترنت</div>
          </div>
        </div>
"""

new_lines = lines[:230] + [replacement] + lines[251:]

with io.open("c:/Users/hp zbook/Desktop/LM/index.html", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
