import io
with io.open("c:/Users/hp zbook/Desktop/LM/index.html", "r", encoding="utf-8") as f:
    content = f.read()

old_footer = """            <div class="input-footer">
              <div class="in-chat-model-selector" onclick="UI.showModal('model-picker-modal')">
                <i data-lucide="zap" style="width:14px;height:14px;color:var(--accent)"></i>
                <span id="current-model-display">GPT-5.5</span>
                <i data-lucide="chevron-down" style="width:14px;height:14px;opacity:0.5"></i>
              </div>
              <div class="char-count" id="char-count">0 / 8000</div>
            </div>"""
new_footer = """            <div class="input-footer">
              <div class="char-count" id="char-count" style="margin-right:auto;">0 / 8000</div>
            </div>"""
content = content.replace(old_footer, new_footer)

top_selector = """      <div class="chat-panel">
        <div style="position:absolute; top:24px; left:50%; transform:translateX(-50%); z-index:100;" class="floating-model-wrapper">
          <div class="in-chat-model-selector" onclick="UI.showModal('model-picker-modal')" style="background:rgba(15,15,15,0.7); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.1); padding:8px 20px; border-radius:30px; box-shadow:0 8px 32px rgba(0,0,0,0.4); font-size:14px;">
            <i data-lucide="zap" style="width:16px;height:16px;color:var(--accent)"></i>
            <span id="current-model-display">GPT-5.5</span>
            <i data-lucide="chevron-down" style="width:16px;height:16px;opacity:0.5"></i>
          </div>
        </div>"""
content = content.replace('      <div class="chat-panel">', top_selector, 1)

with io.open("c:/Users/hp zbook/Desktop/LM/index.html", "w", encoding="utf-8") as f:
    f.write(content)
