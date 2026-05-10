import io, re

with io.open('c:/Users/hp zbook/Desktop/LM/js/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any single/double quoted string that got split across lines because of the literal \n replacement.
# A regex to find an opening quote, some text, a real newline, some text, and the closing quote, without another quote in between.
# But it's safer to just do common split strings.

content = content.replace("('" + "\n" + "')", "('\\n')")
content = content.replace("('" + "\n\n" + "')", "('\\n\\n')")
content = content.replace("(\"" + "\n" + "\")", "(\"\\n\")")
content = content.replace("(\"" + "\n\n" + "\")", "(\"\\n\\n\")")

content = content.replace("indexOf('" + "\n" + "')", "indexOf('\\n')")
content = content.replace("split('" + "\n" + "')", "split('\\n')")
content = content.replace("split(\"" + "\n" + "\")", "split(\"\\n\")")

content = content.replace("/" + "\n" + "/g", "/\\n/g")
content = content.replace("/" + "\n" + "/", "/\\n/")
content = content.replace("/^" + "\n" + "/", "/^\\n/")
content = content.replace("/[^" + "\n" + "]/", "/[^\\n]/")

# Replace \n\n in markdown rules:
content = content.replace("replace(/" + "\n\n" + "/g", "replace(/\\n\\n/g")

with io.open('c:/Users/hp zbook/Desktop/LM/js/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done fixing common splits")
