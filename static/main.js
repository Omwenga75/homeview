// HomeView Interactive Scripts

const HV_CONFIG = {
    USE_MOCK: false,
    API_BASE: ''  // Empty = relative URLs (works on localhost and Vercel)
};

// --- Managers ---

const AuthManager = {
    async signup(name, email, password, role = 'tenant') {
        if (!HV_CONFIG.USE_MOCK) {
            try {
                const response = await fetch(`${HV_CONFIG.API_BASE}/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });
                const data = await response.json();
                if (!response.ok) return { success: false, message: data.detail || data.error || 'Signup failed' };
                return this.login(email, password);
            } catch (err) {
                return { success: false, message: 'Backend unavailable. Using local storage...' };
            }
        }

        const users = JSON.parse(localStorage.getItem('hv_users') || '[]');
        if (users.find(u => u.email === email)) return { success: false, message: 'Email already exists' };
        
        const newUser = { 
            id: Date.now().toString(), 
            name, 
            email, 
            password, 
            role, 
            bio: '', 
            phone: '',
            joinedAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('hv_users', JSON.stringify(users));
        return await this.login(email, password);
    },

    async updateProfile(data) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return { success: false, message: 'Not logged in' };

        if (!HV_CONFIG.USE_MOCK) {
            try {
                const response = await fetch(`${HV_CONFIG.API_BASE}/auth/profile/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok) {
                    const updatedUser = result.user || result;
                    localStorage.setItem('hv_current_user', JSON.stringify(updatedUser));
                    return { success: true };
                }
            } catch (err) { console.error("Profile update failed:", err); }
        }

        const users = JSON.parse(localStorage.getItem('hv_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            localStorage.setItem('hv_users', JSON.stringify(users));
            localStorage.setItem('hv_current_user', JSON.stringify(users[userIndex]));
            return { success: true };
        }
        return { success: false, message: 'User not found' };
    },

    async login(email, password) {
        if (!HV_CONFIG.USE_MOCK) {
            try {
                const response = await fetch(`${HV_CONFIG.API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const result = await response.json();
                if (response.ok) {
                    const user = result.user || result;
                    localStorage.setItem('hv_current_user', JSON.stringify(user));
                    let redirect = 'index.html';
                    if (user.role === 'admin') redirect = 'admin-dashboard.html';
                    else if (user.role === 'caretaker') redirect = 'caretaker-dashboard.html';
                    return { success: true, redirect };
                }
                return { success: false, message: result.detail || result.error || 'Login failed' };
            } catch (err) {
                console.warn("Backend login failed, trying local...");
            }
        }

        const users = JSON.parse(localStorage.getItem('hv_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('hv_current_user', JSON.stringify(user));
            // Determine redirect URL based on role
            let redirect = 'index.html';
            if (user.role === 'admin') redirect = 'admin-dashboard.html';
            else if (user.role === 'caretaker') redirect = 'caretaker-dashboard.html';
            
            return { success: true, redirect };
        }
        return { success: false, message: 'Invalid credentials' };
    },

    logout() {
        localStorage.removeItem('hv_current_user');
        window.location.href = 'index.html';
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('hv_current_user'));
    },

    async syncSession() {
        const user = this.getCurrentUser();
        if (user && !HV_CONFIG.USE_MOCK) {
            try {
                const response = await fetch(`${HV_CONFIG.API_BASE}/auth/profile/${user.id}`);
                const result = await response.json();
                if (response.ok) {
                    const updatedUser = result.user || result;
                    localStorage.setItem('hv_current_user', JSON.stringify(updatedUser));
                    return updatedUser;
                }
            } catch (err) { console.warn("Session sync failed:", err); }
        }
        return user;
    },

    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    // Seed admin if not exists
    initAdmin() {
        const users = JSON.parse(localStorage.getItem('hv_users') || '[]');
        if (!users.find(u => u.role === 'admin')) {
            users.push({
                id: 'admin_root',
                name: 'System Administrator',
                email: 'admin@homeview.com',
                password: 'admin123',
                role: 'admin',
                bio: 'Global Platform Governance',
                phone: '+254 700 000 000',
                joinedAt: new Date().toISOString()
            });
            localStorage.setItem('hv_users', JSON.stringify(users));
        }
    }
};

AuthManager.initAdmin();

const PropertyManager = {
    isUnlocked(propertyId) {
        const user = AuthManager.getCurrentUser();
        if (!user) return false;
        // Admins and caretakers always have location access — no payment needed
        if (user.role === 'admin' || user.role === 'caretaker') return true;
        const unlocked = JSON.parse(localStorage.getItem(`hv_unlocked_${user.id}`) || '[]');
        return unlocked.includes(propertyId);
    },

    unlock(propertyId) {
        const user = AuthManager.getCurrentUser();
        if (!user) return;
        const unlocked = JSON.parse(localStorage.getItem(`hv_unlocked_${user.id}`) || '[]');
        if (!unlocked.includes(propertyId)) {
            unlocked.push(propertyId);
            localStorage.setItem(`hv_unlocked_${user.id}`, JSON.stringify(unlocked));
        }
    }
};

const PaymentManager = {
    async simulateSTKPush(phoneNumber, amount) {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                if (window.updatePaymentProgress) window.updatePaymentProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve({ success: true });
                }
            }, 150);
        });
    }
};

const MessageManager = {
    save(name, email, message) {
        const messages = JSON.parse(localStorage.getItem('hv_admin_messages') || '[]');
        const newMessage = {
            id: Date.now(),
            name,
            email,
            message,
            date: new Date().toISOString(),
            status: 'unread'
        };
        messages.push(newMessage);
        localStorage.setItem('hv_admin_messages', JSON.stringify(messages));
        return { success: true };
    },
    getAll() {
        return JSON.parse(localStorage.getItem('hv_admin_messages') || '[]');
    }
};

const ImageManager = {
    _dbName: 'HomeViewImages',
    _storeName: 'profilePictures',
    _dbVersion: 1,
    _cache: {}, // In-memory cache for instant access after first load

    // Open (or create) the IndexedDB database
    _openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this._dbName, this._dbVersion);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this._storeName)) {
                    db.createObjectStore(this._storeName, { keyPath: 'userId' });
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    // Helper to compress/resize image before saving
    _compressImage(dataUrl, maxWidth = 400) {
        return new Promise((resolve) => {
            const img = new Image();
            
            // Set a safety timeout
            const timeout = setTimeout(() => {
                console.warn("Compression timed out, using raw image.");
                resolve(dataUrl);
            }, 3000);

            img.onload = () => {
                clearTimeout(timeout);
                try {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                } catch (err) {
                    console.error("Canvas compression failed:", err);
                    resolve(dataUrl);
                }
            };

            img.onerror = () => {
                clearTimeout(timeout);
                console.warn("Image load failed for compression, using raw.");
                resolve(dataUrl);
            };

            img.src = dataUrl;
        });
    },

    // Save profile picture permanently to IndexedDB and sync with backend
    async saveProfilePicture(userId, rawDataUrl) {
        try {
            // 0. Compress image first to ensure it fits in storage limits
            const dataUrl = await this._compressImage(rawDataUrl);

            // 1. Save locally to IndexedDB first
            try {
                const db = await this._openDB();
                await new Promise((resolve, reject) => {
                    const tx = db.transaction(this._storeName, 'readwrite');
                    const store = tx.objectStore(this._storeName);
                    store.put({ userId, dataUrl, updatedAt: new Date().toISOString() });
                    tx.oncomplete = () => {
                        this._cache[userId] = dataUrl;
                        resolve();
                    };
                    tx.onerror = (e) => reject(e.target.error);
                });
            } catch (idbErr) {
                console.warn("IndexedDB save failed, falling back to localStorage:", idbErr);
                localStorage.setItem(`hv_profile_pic_${userId}`, dataUrl);
                this._cache[userId] = dataUrl;
            }

            // 2. Update current user object in session (for immediate UI updates)
            const currentUser = AuthManager.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                currentUser.profile_pic = dataUrl;
                localStorage.setItem('hv_current_user', JSON.stringify(currentUser));
                
                // Also update in users list (mock database)
                if (HV_CONFIG.USE_MOCK) {
                    const users = JSON.parse(localStorage.getItem('hv_users') || '[]');
                    const idx = users.findIndex(u => u.id === userId);
                    if (idx !== -1) {
                        users[idx].profile_pic = dataUrl;
                        localStorage.setItem('hv_users', JSON.stringify(users));
                    }
                }
            }

            // 3. Sync with backend if not in mock mode
            if (!HV_CONFIG.USE_MOCK) {
                try {
                    await fetch(`${HV_CONFIG.API_BASE}/auth/profile-pic/${userId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ profile_pic: dataUrl })
                    });
                } catch (err) {
                    console.warn("Backend sync failed, but local save succeeded:", err);
                }
            }
            return true;
        } catch (e) {
            console.error("Failed to save profile picture:", e);
            alert("Failed to save image. Please try again.");
            return false;
        }
    },

    // Get profile picture from cache or IndexedDB
    async getProfilePicture(userId) {
        // Return from cache instantly if available
        if (this._cache[userId]) return this._cache[userId];

        try {
            const db = await this._openDB();
            return new Promise((resolve) => {
                const tx = db.transaction(this._storeName, 'readonly');
                const store = tx.objectStore(this._storeName);
                const request = store.get(userId);
                request.onsuccess = () => {
                    const result = request.result;
                    if (result && result.dataUrl) {
                        this._cache[userId] = result.dataUrl; // Populate cache
                        resolve(result.dataUrl);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => resolve(null);
            });
        } catch (e) {
            return null;
        }
    },

    // Migrate any existing localStorage pictures to IndexedDB (runs once)
    async _migrateFromLocalStorage() {
        const user = AuthManager.getCurrentUser();
        if (!user) return;
        const lsKey = `hv_profile_pic_${user.id}`;
        const oldPic = localStorage.getItem(lsKey);
        if (oldPic) {
            const existing = await this.getProfilePicture(user.id);
            if (!existing) {
                await this.saveProfilePicture(user.id, oldPic);
            }
            localStorage.removeItem(lsKey); // Clean up old storage
        }
    },

    // Apply profile picture to all relevant elements on the page
    async applyProfilePictureToElements() {
        const user = AuthManager.getCurrentUser();
        if (!user) return;

        // Migrate old localStorage data on first run
        await this._migrateFromLocalStorage();

        // 1. Try to get from user object (synced from backend)
        let pic = user.profile_pic;

        // 2. Fallback to local IndexedDB
        if (!pic) {
            pic = await this.getProfilePicture(user.id);
        }
        
        if (!pic) return;

        // Apply to dashboard main avatar
        document.querySelectorAll('.profile-avatar-large').forEach(el => {
            el.innerHTML = `<img src="${pic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            el.style.background = 'none';
        });
        
        // Apply to header user nav avatar
        const userProfileNav = document.querySelector('#userProfileToggle span:first-child');
        if (userProfileNav && (userProfileNav.querySelector('svg') || userProfileNav.querySelector('img') || userProfileNav.classList.contains('user-dp'))) {
            userProfileNav.innerHTML = `<img src="${pic}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; display:inline-block; vertical-align:middle;">`;
            userProfileNav.style.background = 'none';
        }

        // Apply to public pages user-dp and any other general DP containers
        document.querySelectorAll('.user-dp').forEach(el => {
            // Avoid double-wrapping or clearing if it's the nav trigger itself
            if (el.id === 'userProfileToggle') return; 
            el.innerHTML = `<img src="${pic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            el.style.background = 'none';
        });
    },

    // Start observing DOM changes to automatically apply pictures to new elements
    _observer: null,
    initAutoApply() {
        if (this._observer) return;
        
        this._observer = new MutationObserver((mutations) => {
            // Debounce or just check for relevant changes
            let shouldApply = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    shouldApply = true;
                    break;
                }
            }
            if (shouldApply) this.applyProfilePictureToElements();
        });

        this._observer.observe(document.body, { childList: true, subtree: true });
        this.applyProfilePictureToElements();
    }
};

// --- UI Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // Clear legacy cached/hardcoded houses
    localStorage.removeItem('hv_cached_houses');
    localStorage.removeItem('hv_houses');

    // Navbar Effect - Always applied to match other pages like About Us
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.classList.add('scrolled');
        
        window.addEventListener('scroll', () => {
            navbar.classList.add('scrolled'); // Ensure it stays scrolled
        });
    }

    // Update Auth UI in Navbar
    const updateNavbarAuth = () => {
        const user = AuthManager.getCurrentUser();

        const hour = new Date().getHours();
        let greeting = 'Good evening,';
        if (hour < 12) greeting = 'Good morning,';
        else if (hour < 18) greeting = 'Good afternoon,';

        // Update any .user-greeting containers on the page
        document.querySelectorAll('.user-greeting').forEach(container => {
            const greetingText = container.querySelector('.greeting-text');
            const userNameText = container.querySelector('.user-name, #userName, #navUserName');
            if (greetingText) greetingText.textContent = greeting;
            if (userNameText) {
                userNameText.textContent = user ? user.name.split(' ')[0] : 'Guest';
            }
        });

        // --- index.html: toggle Login/Signup vs DP+Greeting ---
        const loginBtn     = document.getElementById('loginBtn');
        const signupBtn    = document.getElementById('signupBtn');
        const navUserProfile = document.getElementById('navUserProfile');
        const navUserName  = document.getElementById('navUserName');
        const navDashLink  = document.getElementById('navDashboardLink');

        if (loginBtn && signupBtn && navUserProfile) {
            if (user) {
                loginBtn.style.display    = 'none';
                signupBtn.style.display   = 'none';
                navUserProfile.style.display = 'flex';
                if (navUserName) navUserName.textContent = user.name.split(' ')[0];
                if (navDashLink) {
                    if (user.role === 'admin') navDashLink.href = 'admin-dashboard.html';
                    else if (user.role === 'caretaker') navDashLink.href = 'caretaker-dashboard.html';
                    else navDashLink.href = 'tenant-dashboard.html';
                }
                // Apply profile picture to navUserDp
                if (window.ImageManager) ImageManager.initAutoApply();
            } else {
                loginBtn.style.display    = '';
                signupBtn.style.display   = '';
                navUserProfile.style.display = 'none';
            }
        }

        // --- Hero CTA ---
        const heroCTA = document.getElementById('heroCTA');
        if (user && heroCTA) {
            heroCTA.textContent = 'Explore Houses';
            heroCTA.href = 'listings.html';
        }

        // --- Rewrite dashboard links for admin/caretaker roles ---
        // Admins and caretakers should never land on the tenant dashboard.
        // Their "Profile" / "Saved" links point to their own dashboards.
        if (user && (user.role === 'admin' || user.role === 'caretaker')) {
            const dashHref = user.role === 'admin' ? 'admin-dashboard.html' : 'caretaker-dashboard.html';

            // Bottom nav links
            document.querySelectorAll('.bottom-nav-item').forEach(link => {
                if (link.getAttribute('href') === 'tenant-dashboard.html') {
                    link.href = dashHref;
                }
            });

            // Mobile drawer links
            document.querySelectorAll('.drawer-links a').forEach(link => {
                if (link.getAttribute('href') === 'tenant-dashboard.html') {
                    link.href = dashHref;
                }
            });
        }
    };

    // Initial Sync and UI update
    const init = async () => {
        await AuthManager.syncSession();
        updateNavbarAuth();
    };

    init();

    // Nav user profile click → go to dashboard; menu toggle
    const navUserProfile = document.getElementById('navUserProfile');
    const navUserMenu    = document.getElementById('navUserMenu');
    const isDashboard = window.location.pathname.includes('-dashboard.html');

    if (navUserProfile && navUserMenu) {
        navUserProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            navUserMenu.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#navUserProfile')) {
                navUserMenu.classList.remove('active');
            }
        });
    }

    const navLogoutBtn = document.getElementById('navLogoutBtn');
    if (navLogoutBtn) {
        navLogoutBtn.addEventListener('click', () => AuthManager.logout());
    }

    // Legacy dropdown support (kept for safety)
    const userProfileToggle = document.getElementById('userProfileToggle');
    const profileMenu = document.getElementById('profileMenu');

    if (userProfileToggle && profileMenu && !isDashboard) {
        userProfileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const user = AuthManager.getCurrentUser();
            if (user) {
                let redirect = 'tenant-dashboard.html';
                if (user.role === 'admin') redirect = 'admin-dashboard.html';
                else if (user.role === 'caretaker') redirect = 'caretaker-dashboard.html';
                localStorage.setItem('hv_next_view', 'profile');
                window.location.href = redirect;
            } else {
                profileMenu.classList.toggle('active');
            }
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-profile-dropdown')) {
                profileMenu.classList.remove('active');
            }
        });
    }

    const profileNavLink = document.getElementById('profileNavLink');
    if (profileNavLink && !isDashboard) {
        profileNavLink.addEventListener('click', () => {
            const user = AuthManager.getCurrentUser();
            if (user) {
                let redirect = 'tenant-dashboard.html';
                if (user.role === 'admin') redirect = 'admin-dashboard.html';
                else if (user.role === 'caretaker') redirect = 'caretaker-dashboard.html';
                localStorage.setItem('hv_next_view', 'profile');
                window.location.href = redirect;
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    const globalLogoutBtn = document.getElementById('logoutBtn');
    if (globalLogoutBtn) {
        globalLogoutBtn.addEventListener('click', () => {
            AuthManager.logout();
        });
    }

    // Global Image Upload Handler for Dashboard Profile Avatars
    document.addEventListener('click', (e) => {
        const avatarWrapper = e.target.closest('.profile-avatar-wrapper, .profile-avatar-large');
        if (avatarWrapper) {
            console.log("Avatar clicked, initiating upload...");
            e.preventDefault();
            e.stopPropagation();
            
            const user = AuthManager.getCurrentUser();
            if (!user) {
                console.warn("Upload blocked: No user logged in.");
                return;
            }

            let fileInput = document.getElementById('globalProfilePicUpload');
            if (!fileInput) {
                console.log("Creating global file input...");
                fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.id = 'globalProfilePicUpload';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);

                fileInput.addEventListener('change', async (ev) => {
                    const file = ev.target.files[0];
                    if (file) {
                        console.log("File selected:", file.name);
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                            const rawDataUrl = event.target.result;
                            console.log("Saving picture...");
                            const saved = await ImageManager.saveProfilePicture(user.id, rawDataUrl);
                            if (saved) {
                                console.log("Profile picture successfully updated.");
                                // Force an immediate refresh of elements just in case observer is slow
                                ImageManager.applyProfilePictureToElements();
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                    fileInput.value = '';
                });
            }
            fileInput.click();
        }
    });

    // Add CSS for clickable avatars
    const style = document.createElement('style');
    style.textContent = `
        .profile-avatar-wrapper, .profile-avatar-large {
            cursor: pointer !important;
            transition: transform 0.2s ease, filter 0.2s ease;
        }
        .profile-avatar-wrapper:hover, .profile-avatar-large:hover {
            transform: scale(1.02);
            filter: brightness(0.95);
        }
    `;
    document.head.appendChild(style);


    // Highlight Active Link
    const highlightActiveLink = () => {
        const path = window.location.pathname;
        const page = path.split("/").pop() || 'index.html';
        const isIndex = page === 'index.html' || page === '';

        const links = document.querySelectorAll('.nav-links a');
        
        const setActive = (clickedLink) => {
            links.forEach(l => l.classList.remove('active'));
            clickedLink.classList.add('active');
        };

        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Initial load check
            if (isIndex && (href === 'index.html' || href === '#hero' || href === '#')) {
                link.classList.add('active');
            } else if (href === page) {
                link.classList.add('active');
            }

            // Click listener for instant feedback (especially for anchors)
            link.addEventListener('click', () => setActive(link));
        });

        // Dynamic active state highlighting for mobile bottom navigation bar
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (!href) return;
            const linkPage = href.split("/").pop();
            const text = item.textContent.trim().toLowerCase();

            if (isIndex && linkPage === 'index.html') {
                item.classList.add('active');
            } else if (!isIndex) {
                if (linkPage === page) {
                    item.classList.add('active');
                } else if (page === 'property-detail.html' && linkPage === 'listings.html') {
                    // Property detail page is a child of Listings/Houses
                    item.classList.add('active');
                } else if (page.includes('-dashboard.html') && linkPage.includes('-dashboard.html')) {
                    // On dashboard pages, profile should be highlighted (Saved can also be highlighted if needed, but Profile is standard)
                    if (text === 'profile') {
                        item.classList.add('active');
                    }
                }
            }
        });
    };
    highlightActiveLink();

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawerClose = document.getElementById('drawerClose');

    const openMobileDrawer = () => {
        if (mobileSidebar) mobileSidebar.classList.add('open');
        if (drawerBackdrop) drawerBackdrop.classList.add('active');
        document.body.classList.add('mobile-drawer-open');
    };

    const closeMobileDrawer = () => {
        if (mobileSidebar) mobileSidebar.classList.remove('open');
        if (drawerBackdrop) drawerBackdrop.classList.remove('active');
        document.body.classList.remove('mobile-drawer-open');
    };

    if (menuToggle && mobileSidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            openMobileDrawer();
        });
    }

    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', closeMobileDrawer);
    }

    if (drawerClose) {
        drawerClose.addEventListener('click', closeMobileDrawer);
    }

    document.querySelectorAll('.drawer-links a').forEach(link => {
        link.addEventListener('click', closeMobileDrawer);
    });

    // Bottom Nav "More" button — opens the appropriate left drawer
    const bottomNavMoreBtn = document.getElementById('bottomNavMore');
    if (bottomNavMoreBtn) {
        bottomNavMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const dashSidebar = document.querySelector('.dashboard-container .sidebar');
            const mobileDrawerBg = document.getElementById('mobileDrawerBackdrop');
            const mobSidebar = document.getElementById('mobileSidebar');
            const drawerBg = document.getElementById('drawerBackdrop');

            if (dashSidebar) {
                // Dashboard pages — open the dashboard sidebar
                dashSidebar.classList.add('open');
                if (mobileDrawerBg) mobileDrawerBg.classList.add('active');
                document.body.classList.add('mobile-drawer-open');
            } else if (mobSidebar) {
                // Public pages — open the mobile sidebar
                mobSidebar.classList.add('open');
                if (drawerBg) drawerBg.classList.add('active');
                document.body.classList.add('mobile-drawer-open');
            }
        });
    }

    // Dashboard Drawer Toggle (for tenant-dashboard, admin-dashboard, caretaker-dashboard)
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
    const mobileDrawerClose = document.getElementById('mobileDrawerClose');
    const dashboardSidebar = document.querySelector('.dashboard-container .sidebar');

    if (mobileNavToggle && dashboardSidebar) {
        const openDrawer = () => {
            dashboardSidebar.classList.add('open');
            if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.add('active');
            document.body.classList.add('mobile-drawer-open');
        };

        const closeDrawer = () => {
            dashboardSidebar.classList.remove('open');
            if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.remove('active');
            document.body.classList.remove('mobile-drawer-open');
        };

        mobileNavToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dashboardSidebar.classList.contains('open') ? closeDrawer() : openDrawer();
        });

        if (mobileDrawerBackdrop) {
            mobileDrawerBackdrop.addEventListener('click', closeDrawer);
        }

        if (mobileDrawerClose) {
            mobileDrawerClose.addEventListener('click', closeDrawer);
        }

        // Close drawer when a sidebar link is clicked
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', () => {
                closeDrawer();
            });
        });

        // Close drawer when a mobile-link-chip is clicked
        document.querySelectorAll('.mobile-link-chip').forEach(link => {
            link.addEventListener('click', () => {
                closeDrawer();
            });
        });
    }

    // Reveal on Scroll Animation
    const revealElements = document.querySelectorAll('.reveal, .reveal-right, .reveal-delay, .reveal-delay-2');
    const checkReveal = () => {
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < window.innerHeight - 50) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };
    window.addEventListener('scroll', checkReveal);
    checkReveal();

    // Number Counter Animation
    const statsSection = document.getElementById('stats');
    const numberElements = document.querySelectorAll('.stat-item .number');
    let hasAnimated = false;

    if (statsSection && numberElements.length > 0) {
        const fetchStats = async () => {
            let props = 0, hosts = 0, renters = 0;
            if (HV_CONFIG.USE_MOCK) {
                const houses = JSON.parse(localStorage.getItem('hv_houses') || '[]');
                const users = JSON.parse(localStorage.getItem('hv_users') || '[]');
                props = houses.length;
                hosts = users.filter(u => u.role === 'caretaker').length;
                renters = users.filter(u => u.role === 'tenant').length;
            } else {
                try {
                    const res = await fetch(`${HV_CONFIG.API_BASE}/api/stats`);
                    if (res.ok) {
                        const data = await res.json();
                        props = data.properties;
                        hosts = data.hosts;
                        renters = data.renters;
                    }
                } catch (e) {}
            }
            
            if (props > 0) document.getElementById('stat-properties').setAttribute('data-target', props);
            if (hosts > 0) document.getElementById('stat-hosts').setAttribute('data-target', hosts);
            if (renters > 0) document.getElementById('stat-renters').setAttribute('data-target', renters);
            
            if (props > 0 || hosts > 0 || renters > 0) {
                document.getElementById('stat-properties').setAttribute('data-suffix', '');
                document.getElementById('stat-hosts').setAttribute('data-suffix', '');
                document.getElementById('stat-renters').setAttribute('data-suffix', '');
            }
            
            if (hasAnimated) {
                if (props > 0) document.getElementById('stat-properties').textContent = props;
                if (hosts > 0) document.getElementById('stat-hosts').textContent = hosts;
                if (renters > 0) document.getElementById('stat-renters').textContent = renters;
            }
        };
        fetchStats();

        const animateNumbers = () => {
            if (hasAnimated) return;
            hasAnimated = true;

            numberElements.forEach(el => {
                const target = parseFloat(el.getAttribute('data-target'));
                if (Number.isNaN(target)) {
                    el.textContent = el.textContent || '0';
                    return;
                }
                const suffix = el.getAttribute('data-suffix') || '';
                const decimals = parseInt(el.getAttribute('data-decimals') || 0, 10);
                const duration = 2000; // 2 seconds
                const frameRate = 30; 
                const totalFrames = Math.round(duration / (1000 / frameRate));
                const increment = target / totalFrames;
                
                let current = 0;
                let frame = 0;

                const counter = setInterval(() => {
                    frame++;
                    current += increment;
                    
                    if (frame >= totalFrames) {
                        current = target;
                        clearInterval(counter);
                    }
                    
                    el.textContent = current.toFixed(decimals) + suffix;
                }, 1000 / frameRate);
            });
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateNumbers();
            }
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    // Dynamic Role Selector Logic
    const passwordInput = document.getElementById('password');
    const roleGroup = document.getElementById('roleGroup');
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const selectedDisplay = document.getElementById('selectedRoleDisplay');

    if (passwordInput && roleGroup) {
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.length > 0 && !selectedDisplay.textContent) {
                roleGroup.style.display = 'block';
            }
        });

        roleRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const role = radio.value;
                roleGroup.style.display = 'none';
                selectedDisplay.textContent = `Joined as: ${role.charAt(0).toUpperCase() + role.slice(1)}`;
                selectedDisplay.style.display = 'block';
            });
        });
    }

    document.querySelectorAll('[data-password-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.getAttribute('data-password-toggle'));
            if (!input) return;

            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
            btn.textContent = isHidden ? '🙈' : '👁️';
        });
    });

    // Handle Forms
    const loginForm = document.querySelector('.auth-form');
    if (loginForm) {
        // More resilient path detection
        const isSignup = window.location.pathname.includes('signup.html');
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailEl = document.getElementById('email');
            const passwordEl = document.getElementById('password');
            if (!emailEl || !passwordEl) return;

            const email = emailEl.value;
            const password = passwordEl.value;
            
            if (isSignup) {
                const nameEl = document.getElementById('name');
                const roleEl = document.querySelector('input[name="role"]:checked');
                
                if (!nameEl || !nameEl.value) {
                    alert('Please enter your full name');
                    return;
                }
                
                if (!roleEl) {
                    alert('Please select whether you are a Tenant or Caretaker');
                    const rg = document.getElementById('roleGroup');
                    if (rg) rg.style.display = 'block';
                    return;
                }
                
                const res = await AuthManager.signup(nameEl.value, email, password, roleEl.value);
                if (res.success) {
                    alert('Account created successfully!');
                    window.location.href = res.redirect || 'login.html';
                } else {
                    alert(res.message);
                }
            } else {
                const res = await AuthManager.login(email, password);
                if (res.success) window.location.href = res.redirect;
                else alert(res.message);
            }
        });
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (MessageManager.save(name, email, message).success) {
                alert('Message sent successfully! Our team will review it shortly.');
                contactForm.reset();
            }
        });
    }

    // Newsletter Handler
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                const email = emailInput.value.trim().toLowerCase();
                if (!email.endsWith('@gmail.com')) {
                    alert('Please enter a valid Gmail address (ending in @gmail.com).');
                    return;
                }
                alert("You'll receive notifications for newly added houses!");
                newsletterForm.reset();
            }
        });
    }
    
    // Handle Property Unlock Logic
    const unlockBtn = document.getElementById('unlockLocationBtn');

    // Initialize Map
    let map;
    const initMap = () => {
        const mapContainer = document.getElementById('propertyMap');
        if (mapContainer && !map) {
            // Nairobi Westlands Coordinates
            const lat = -1.2658;
            const lng = 36.8077;
            
            map = L.map('propertyMap').setView([lat, lng], 16);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            L.marker([lat, lng]).addTo(map)
                .bindPopup('Emerald Luxury 2-Bedroom')
                .openPopup();
        }
    };

    if (unlockBtn) {
        const checkStatus = () => {
            initMap(); // Always init map, but keep blurred
            const currentPropertyId = window._hvPropertyId || "emerald_luxury_2br";
            if (PropertyManager.isUnlocked(currentPropertyId)) {
                document.querySelector('.location-overlay').style.display = 'none';
                document.getElementById('propertyMap').style.filter = 'none';
                unlockBtn.innerText = "Location Unlocked";
                unlockBtn.classList.remove('btn-primary');
                unlockBtn.classList.add('btn-secondary');
                unlockBtn.disabled = true;
                
                // Show real address
                const locText = document.querySelector('.location');
                if (locText) locText.innerHTML = "45 Rhapta Road, Westlands, Nairobi";
            }
        };
        checkStatus();

        unlockBtn.addEventListener('click', () => {
            if (!AuthManager.isLoggedIn()) {
                window.location.href = 'login.html';
                return;
            }

            // Admins and caretakers get free access — skip payment
            const currentUser = AuthManager.getCurrentUser();
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'caretaker')) {
                const currentPropertyId = window._hvPropertyId || "emerald_luxury_2br";
                PropertyManager.unlock(currentPropertyId);
                location.reload();
                return;
            }
            
            // Show M-Pesa Modal for tenants
            const modal = document.getElementById('paymentModal');
            modal.classList.add('active');
        });
    }

    // Modal Handling
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        const closeBtn = paymentModal.querySelector('.close-modal');
        if (closeBtn) closeBtn.addEventListener('click', () => paymentModal.classList.remove('active'));

        const mpesaForm = document.getElementById('mpesaForm');
        const statusContainer = document.querySelector('.payment-status-container');
        const progressFill = document.querySelector('.progress-bar-fill');
        const statusText = document.getElementById('paymentStatusText');

        window.updatePaymentProgress = (progress) => {
            progressFill.style.width = `${progress}%`;
            if (progress < 40) statusText.innerText = "Initiating STK Push...";
            else if (progress < 80) statusText.innerText = "Waiting for PIN entry...";
            else statusText.innerText = "Finalizing transaction...";
        };

        mpesaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = document.getElementById('mpesaPhone').value;
            
            mpesaForm.style.display = 'none';
            statusContainer.style.display = 'block';
            
            const res = await PaymentManager.simulateSTKPush(phone, 600);
            
            if (res.success) {
                statusText.innerText = "Payment Successful!";
                statusText.style.color = "var(--success)";
                const currentPropertyId = window._hvPropertyId || "emerald_luxury_2br";
                PropertyManager.unlock(currentPropertyId);
                setTimeout(() => {
                    paymentModal.classList.remove('active');
                    location.reload();
                }, 1500);
            }
        });
    }

    // --- Chatbot Assistant Logic ---
    const injectChatbot = () => {
        const chatbotHTML = `
            <div class="chatbot-trigger" id="chatbotTrigger">
                <div class="chatbot-tooltip">Need help? Chat with Tisla!</div>
                <span>💬</span>
            </div>
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="bot-avatar" style="overflow: hidden; padding: 0; background: white;">
                        <img src="tisla_avatar.png" alt="Tisla" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="flex: 1;">
                        <h4>Tisla</h4>
                        <span style="font-size: 0.75rem; opacity: 0.8;">Online | Always here to help</span>
                    </div>
                    <button class="close-chat" id="closeChat" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 1.25rem; opacity: 0.7; transition: opacity 0.2s;">✕</button>
                </div>
                <div class="chat-body" id="chatBody">
                    <div class="chat-bubble bot">Hello! I'm Tisla, your HomeView assistant. How can I help you today?</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" placeholder="Type a message..." id="chatInput">
                    <button id="sendChat">➤</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);

        const trigger = document.getElementById('chatbotTrigger');
        const window = document.getElementById('chatWindow');
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendChat');
        const closeBtn = document.getElementById('closeChat');
        const chatBody = document.getElementById('chatBody');

        if (input && chatBody) {
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    chatBody.scrollTop = chatBody.scrollHeight;
                }, 300); // Wait for mobile keyboard to fully open
            });
        }

        if (trigger && window) {
            trigger.addEventListener('click', () => {
                window.classList.toggle('active');
            });

            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.classList.remove('active');
                });
            }

            const sendMessage = () => {
                const text = input.value.trim();
                if (!text) return;

                // User message
                const userBubble = document.createElement('div');
                userBubble.className = 'chat-bubble user';
                userBubble.textContent = text;
                chatBody.appendChild(userBubble);
                input.value = '';

                // Auto scroll
                chatBody.scrollTop = chatBody.scrollHeight;

                // Bot response logic
                setTimeout(() => {
                    const botBubble = document.createElement('div');
                    botBubble.className = 'chat-bubble bot';
                    
                    const query = text.toLowerCase();
                    let response = "I'm sorry, I didn't quite catch that. For specific inquiries, please visit our Contact Us page or reach out to our support team directly at +254111307585 for immediate assistance!";

                    if (query.includes('price') || query.includes('cost') || query.includes('pay') || query.includes('600')) {
                        response = "Unlocking a precise property location costs exactly KSh. 600. This is a one-time fee per property to ensure secure and verified access for our users.";
                    } else if (query.includes('verify') || query.includes('safe') || query.includes('trust')) {
                        response = "Security is our priority! We manually verify every host and property listing on HomeView to ensure you're always dealing with trusted individuals and real homes.";
                    } else if (query.includes('how') && (query.includes('work') || query.includes('start'))) {
                        response = "It's simple! Browse our listings, and when you find a home you love, you can unlock its exact location via M-Pesa. From there, you can chat directly with the host to finalize your rental.";
                    } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
                        response = "Hello! I'm Tisla, your HomeView assistant. I can help you with pricing, verification, or guiding you through your first property search. What's on your mind?";
                    } else if (query.includes('location') || query.includes('map')) {
                        response = "To protect the privacy of our hosts, exact locations are hidden initially. You can unlock the precise address and a real-time map by clicking the 'Unlock Location' button on any property page.";
                    } else if (query.includes('tisla')) {
                        response = "That's me! I'm Tisla, the intelligent heart of HomeView. I'm here 24/7 to make your property search as smooth as possible.";
                    }

                    botBubble.textContent = response;
                    chatBody.appendChild(botBubble);
                    chatBody.scrollTop = chatBody.scrollHeight;
                }, 1000);
            };

            if (sendBtn) sendBtn.addEventListener('click', sendMessage);
            if (input) input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });

            // Adaptive color logic
            const footer = document.querySelector('footer');
            if (footer) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            trigger.classList.add('alt-color');
                        } else {
                            trigger.classList.remove('alt-color');
                        }
                    });
                }, { threshold: 0.1 });
                observer.observe(footer);
            }
        }
    };
    
    injectChatbot();
});
