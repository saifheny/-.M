import io, re

with io.open('c:/Users/hp zbook/Desktop/LM/js/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

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

content = content.replace("replace(/" + "\n\n" + "/g", "replace(/\\n\\n/g")

with io.open('c:/Users/hp zbook/Desktop/LM/js/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done fixing common splits")
