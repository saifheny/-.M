import io

fixes = {
    621: "    let apiUrl = 'https://api.openai.com/v1';",
    625: "      apiUrl = 'https://api.groq.com/openai/v1';",
    650: "      if (!/^https?:\\/\\//.test(base)) base = 'http://' + base;",
    659: "      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${actualModelId}:generateContent`;",
    732: "      const res = await fetch(`https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`);",
    832: "          const bars = Array.from({ length: 30 }, () => `<div class=\"voice-wave-bar\" style=\"height:${4 + Math.random() * 16}px\"></div>`).join('');",
    833: "          attachmentsHtml += `<div class=\"voice-message-premium\" onclick=\"Main.playAudioMsg(this, '${f.content}')\">",
    834: "            <button class=\"voice-play-pause\"><i data-lucide=\"play\" style=\"width:16px;height:16px;margin-left:2px;\"></i></button>",
    840: "            attachmentsHtml += `<div style=\"font-size:13px; color:var(--text); margin-top:8px; padding:10px 14px; background:var(--bg3); border-radius:12px; border-right:4px solid var(--accent);\"><i>\"${this.escHtml(f.voiceTranscript)}\"</i></div>`;",
    843: "          attachmentsHtml += `<img src=\"${f.content}\" alt=\"Attachment\" style=\"width:100%; max-width:300px; border-radius:16px; display:block; margin-bottom:8px;\">`;",
    845: "          attachmentsHtml += `<div class=\"attachment-chip\"><i data-lucide=\"file\" style=\"width:12px;height:12px\"></i> ${this.escHtml(f.name)}</div>`;",
    852: "    if (attachmentsHtml) displayHtml = `<div class=\"msg-attachments-wrap\">${attachmentsHtml}</div>` + displayHtml;",
    878: "          const searchContext = filtered.map(r => `[المصدر: ${r.source}] ${r.title}\\n${r.content}\\nرابط: ${r.url}`).join('\\n\\n');",
    881: "          content: `--- نتائج البحث المباشر (2026) ---\\n${searchContext}\\n\\nأجب بدقة بناءً على المعلومات أعلاه.`",
    891: "            apiMessages.push({ role: 'system', content: `--- من الذاكرة ---\\n${recalled.map(f => f.content).join('\\n')}` });",
    898: "              fileContext += `[محتوى الملف: ${f.name}]\\n${content}\\n\\n`;",
    905: "        const noKeyMsg = { role: 'assistant', content: `[UI_WIDGET:API_KEY_REQ:${family}]`, time: this.now() };",
    921: "    const url = `${apiUrl}/${encodedPrompt}?model=${actualModelId}&json=false&search=true`;",
    970: "          link = 'https://platform.openai.com/api-keys';",
    972: "          steps = '1. سجل دخولك في <a href=\"https://platform.openai.com/api-keys\" target=\"_blank\" style=\"color:var(--accent)\">موقع OpenAI</a><br>2. اضغط على Create new secret key<br>3. انسخ المفتاح والصقه هنا';",
    974: "          link = 'https://aistudio.google.com/app/apikey';",
    977: "          steps = '1. اذهب إلى <a href=\"https://aistudio.google.com/app/apikey\" target=\"_blank\" style=\"color:var(--accent)\">Google AI Studio</a><br>2. اضغط على Create API key<br>3. انسخ المفتاح من المشروع';",
    979: "          link = 'https://console.anthropic.com/settings/keys';",
    981: "          steps = '1. افتح <a href=\"https://console.anthropic.com/settings/keys\" target=\"_blank\" style=\"color:var(--accent)\">منصة Anthropic</a><br>2. قم بتوليد مفتاح جديد والصقه هنا';",
    983: "          link = 'https://console.groq.com/keys';",
    986: "          steps = '1. ادخل إلى <a href=\"https://console.groq.com/keys\" target=\"_blank\" style=\"color:var(--accent)\">Groq Console</a><br>2. أنشئ مفتاحاً مجانياً والصقه للبدء بسرعة خيالية';",
    988: "          link = 'https://platform.deepseek.com/';",
    990: "          steps = '1. اذهب إلى <a href=\"https://platform.deepseek.com/\" target=\"_blank\" style=\"color:var(--accent)\">DeepSeek Platform</a><br>2. استخرج المفتاح من قسم الـ API Keys';",
}

with io.open('c:/Users/hp zbook/Desktop/LM/js/main.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line_num, new_content in fixes.items():
    idx = line_num - 1
    if 0 <= idx < len(lines):
        lines[idx] = new_content + '\\n'

with io.open('c:/Users/hp zbook/Desktop/LM/js/main.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Lines fixed.')
