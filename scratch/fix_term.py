import io
with io.open('c:/Users/hp zbook/Desktop/LM/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """        </div>
        
        <div class="editor-terminal" id="editor-terminal" style="display:none; height:30%; border-top:1px solid var(--border); background:#050505; flex-direction:column;">
          <div class="terminal-header" style="display:flex; justify-content:space-between; align-items:center; padding:4px 12px; background:var(--bg2); border-bottom:1px solid var(--border); font-family:'JetBrains Mono', monospace; font-size:11px;">
            <span style="color:#10B981;"><i data-lucide="terminal" style="width:12px;height:12px;margin-left:4px;"></i>Terminal - Web Shell</span>
            <div style="display:flex;gap:8px;">
              <button onclick="Terminal.clear()" style="background:none;border:none;color:var(--text3);cursor:pointer;"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>
              <button onclick="UI.closeTerminal()" style="background:none;border:none;color:var(--text3);cursor:pointer;"><i data-lucide="x" style="width:12px;height:12px;"></i></button>
            </div>
          </div>
          <div class="terminal-body" id="terminal-body" style="flex:1; overflow-y:auto; padding:8px 12px; font-family:'JetBrains Mono', monospace; font-size:13px; color:#A3A3A3; line-height:1.5;" onclick="document.getElementById('terminal-input').focus()">
            <div id="terminal-output">
              <div style="color:#3B82F6;">AI Agent Pro Terminal v2.0</div>
              <div style="color:#A3A3A3;">Type 'help' for available commands.</div>
            </div>
            <div style="display:flex; align-items:center; margin-top:4px;">
              <span style="color:#10B981; margin-left:8px;">user@ai-agent:~$</span>
              <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" style="flex:1; background:transparent; border:none; outline:none; color:#fff; font-family:'JetBrains Mono', monospace; font-size:13px;" onkeydown="Terminal.handleInput(event)">
            </div>
          </div>
        </div>

        <div class="editor-status">"""

content = content.replace('        </div>\n        <div class="editor-status">', replacement)

with io.open('c:/Users/hp zbook/Desktop/LM/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
