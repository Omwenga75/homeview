import glob
import re

for f in glob.glob('static/*.html'):
    if 'index.html' in f: continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove class="logo" from profileNavLink
    content = content.replace('<div class="logo" id="profileNavLink"', '<div id="profileNavLink"')
    
    # Remove standard header logo blocks
    content = re.sub(
        r'<div class="logo"(?: style="margin: 0;")?>\s*<span class="icon">🏠</span>\s*<span class="text">HomeView</span>\s*</div>',
        '',
        content
    )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
