import io
with io.open('c:/Users/hp zbook/Desktop/LM/index.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'nav-new-chat' in line or 'Main.clearChat()' in line:
            print(f'Line: {i}')
