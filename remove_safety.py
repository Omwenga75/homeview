import glob, re
import os

for f in glob.glob('static/*.html'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '<li><a href="#">Safety</a></li>' in content:
        content = re.sub(r'[ \t]*<li><a href="#">Safety</a></li>\r?\n?', '', content)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Removed Safety from {f}")
