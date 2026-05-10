import io
import re

with io.open("c:/Users/hp zbook/Desktop/LM/index.html", "r", encoding="utf-8") as f:
    content = f.read()

replacement = """      <div class="sheet-section-title">أدوات إضافية</div>
      <div class="sheet-grid">
        <div class="sheet-item" onclick="Main.toggleWebSearch(); UI.closeBottomSheet();">
          <div class="sheet-item-icon yellow"><i data-lucide="globe"></i></div>
          <div class="sheet-item-label">بحث الويب</div>
        </div>
        <div class="sheet-item" onclick="UI.showModal('prompts-modal'); UI.closeBottomSheet();">
          <div class="sheet-item-icon green"><i data-lucide="library"></i></div>
          <div class="sheet-item-label">الأوامر</div>
        </div>
        <div class="sheet-item" onclick="UI.showModal('settings-modal'); UI.closeBottomSheet();">
          <div class="sheet-item-icon indigo"><i data-lucide="settings"></i></div>
          <div class="sheet-item-label">إعدادات</div>
        </div>
        <div class="sheet-item" onclick="Main.clearChat(); UI.closeBottomSheet();">
          <div class="sheet-item-icon red"><i data-lucide="trash-2"></i></div>
          <div class="sheet-item-label">مسح</div>
        </div>
      </div>"""

content = re.sub(r'<div class="sheet-section-title">أدوات إضافية</div>.*?</div>\s*</div>', replacement, content, flags=re.DOTALL)

with io.open("c:/Users/hp zbook/Desktop/LM/index.html", "w", encoding="utf-8") as f:
    f.write(content)
