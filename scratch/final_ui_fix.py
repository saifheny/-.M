import os
import re

def fix_css():
    file_path = r'c:\Users\hp zbook\Desktop\LM\css\style.css'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix input-footer
    content = re.sub(r'\.input-footer\s*\{.*?\}', 
                     '.input-footer { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 12px; min-height: 40px; }', 
                     content, flags=re.DOTALL)
    
    # Fix char-count
    content = re.sub(r'\.char-count\s*\{.*?\}', 
                     '.char-count { color: var(--text3); font-family: "JetBrains Mono", monospace; order: 1; margin-left: auto; }', 
                     content, flags=re.DOTALL)

    # Ensure in-chat-model-selector is also styled
    if '.in-chat-model-selector' not in content:
        content += "\n.in-chat-model-selector { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 12px; background: rgba(255,255,255,0.05); cursor: pointer; transition: all 0.2s; order: 2; }\n"
        content += ".in-chat-model-selector:hover { background: rgba(255,255,255,0.1); }\n"

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_index():
    file_path = r'c:\Users\hp zbook\Desktop\LM\index.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Ensure the model picker text in footer matches current model
    content = content.replace('<span id="current-model-display">Llama 3.3 70B</span>', 
                              '<span id="current-model-display">GPT-5.5</span>')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_css()
fix_index()
print("UI Fixes Applied Successfully")
