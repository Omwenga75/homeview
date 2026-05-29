import os, glob, re

bottom_nav = '''    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
        <a href="index.html" class="bottom-nav-item">
            <span class="bottom-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </span>
            <span>Home</span>
        </a>
        <a href="listings.html" class="bottom-nav-item active">
            <span class="bottom-nav-icon">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <span>Houses</span>
        </a>
        <a href="tenant-dashboard.html" class="bottom-nav-item">
            <span class="bottom-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </span>
            <span>Saved</span>
        </a>
        <a href="contact.html" class="bottom-nav-item">
            <span class="bottom-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </span>
            <span>Messages</span>
        </a>
        <a href="tenant-dashboard.html" class="bottom-nav-item">
            <span class="bottom-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </span>
            <span>Profile</span>
        </a>
    </nav>'''

for filepath in glob.glob('static/*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace bottom nav
    content = re.sub(r'(<!-- Bottom Navigation -->\s*)?<nav class="bottom-nav">.*?</nav>', bottom_nav, content, flags=re.DOTALL)
    
    # Remove drawer close
    content = re.sub(r'<button class="drawer-close"[^>]*>.*?</button>\s*', '', content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
print('Updated HTML files')
