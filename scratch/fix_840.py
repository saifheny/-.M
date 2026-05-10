import io, re

with io.open('c:/Users/hp zbook/Desktop/LM/js/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix literal '\n' that are unescaped inside strings in the code.
# The user's IDE found errors. We can fix them via regex.
# For single quote:
# Find `'` followed by exactly one newline followed by `'`
content = re.sub(r"'\n'", r"'\\n'", content)

# Find `'\n` at the end of a line followed by `'` on the next line.
# Actually, the python script earlier did `content.replace('\\n', '\n')`.
# So '\\n' became '\n'.
# Let's replace any `\n` that is between two strings like `' \n '`?
# In line 840 it was:
# text += '\n' + f.voiceTranscript;

content = content.replace("text += '\n'", "text += '\\n'")

# Let's see what other errors there are. We'll fix them one by one.

with io.open('c:/Users/hp zbook/Desktop/LM/js/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done fixing 840")
