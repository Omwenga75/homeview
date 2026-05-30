import glob
for file in glob.glob('static/*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('class="bottom-nav-item active"', 'class="bottom-nav-item"')
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
