// Mock User State
const currentUser = {
  name: "Nelson Omwenga",
  role: "admin", // Can be 'admin', 'caretaker', 'user'
  avatar: "https://ui-avatars.com/api/?name=Admin+User&background=4F46E5&color=fff"
};

// Config for Roles
const roleConfig = {
  admin: {
    title: "Administrator",
    nav: [
      { id: "overview", label: "Overview", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },
      { id: "properties", label: "Properties", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' },
      { id: "users", label: "Users & Roles", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' },
      { id: "payments", label: "Payments (M-Pesa)", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>' },
    ],
    stats: [
      { label: "Total Revenue", value: "KES 4.2M", icon: "M" },
      { label: "Active Properties", value: "1,245", icon: "P" },
      { label: "Pending Verifications", value: "32", icon: "V" }
    ]
  },
  caretaker: {
    title: "Caretaker",
    nav: [
      { id: "overview", label: "Overview", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },
      { id: "my_properties", label: "My Listings", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' },
      { id: "inquiries", label: "Inquiries", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' },
    ],
    stats: [
      { label: "My Properties", value: "14", icon: "P" },
      { label: "Total Views", value: "840", icon: "V" },
      { label: "New Inquiries", value: "5", icon: "I" }
    ]
  }
};

// Mock Properties
const propertiesData = [
  { id: "PRP-101", title: "Emerald Luxury 2-Bedroom", location: "Westlands", price: 45000, status: "approved" },
  { id: "PRP-102", title: "Modern Studio Apartment", location: "Kilimani", price: 25000, status: "approved" },
  { id: "PRP-103", title: "Sunset Villas Plot", location: "Karen", price: 150000, status: "pending" },
  { id: "PRP-104", title: "Cozy Ruaka Bedsitter", location: "Ruaka", price: 12000, status: "rejected" }
];

document.addEventListener('DOMContentLoaded', () => {
  // Initialize User Info
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userRole').textContent = roleConfig[currentUser.role].title;
  
  // Render Navigation
  const navContainer = document.getElementById('sidebarNav');
  navContainer.innerHTML = roleConfig[currentUser.role].nav.map((item, index) => `
    <a href="#" class="nav-item ${index === 0 ? 'active' : ''}" data-target="${item.id}View">
      ${item.icon}
      ${item.label}
    </a>
  `).join('');

  // Handle Navigation Clicks
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      // Update active nav
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      // Update view (mock logic since we don't have all views defined in HTML yet)
      const targetId = item.getAttribute('data-target');
      views.forEach(v => v.classList.remove('active'));
      const targetView = document.getElementById(targetId);
      if (targetView) {
        targetView.classList.add('active');
      } else {
        // Fallback to overview if view doesn't exist yet
        document.getElementById('overviewView').classList.add('active');
      }
    });
  });

  // Render Stats
  const statsGrid = document.getElementById('statsGrid');
  statsGrid.innerHTML = roleConfig[currentUser.role].stats.map(stat => `
    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
      </div>
      <div class="stat-info">
        <h3>${stat.value}</h3>
        <p>${stat.label}</p>
      </div>
    </div>
  `).join('');

  // Render Properties Table
  const tableBody = document.getElementById('propertiesTableBody');
  tableBody.innerHTML = propertiesData.map(prop => `
    <tr>
      <td>
        <div style="font-weight: 500; color: var(--color-text)">${prop.title}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted)">ID: ${prop.id}</div>
      </td>
      <td>${prop.location}</td>
      <td>${prop.price.toLocaleString()}</td>
      <td>
        <span class="status-badge status-${prop.status}">
          ${prop.status.charAt(0).toUpperCase() + prop.status.slice(1)}
        </span>
      </td>
      <td class="action-links">
        <a href="#">Edit</a>
        <a href="#" style="color: #EF4444">Delete</a>
      </td>
    </tr>
  `).join('');

  // Mock Activity List
  const activityList = document.getElementById('activityList');
  activityList.innerHTML = `
    <li class="activity-item">
      <div class="activity-avatar">N</div>
      <div class="activity-text">
        <p>New caretaker verification request</p>
        <span>2 mins ago</span>
      </div>
    </li>
    <li class="activity-item">
      <div class="activity-avatar" style="background: var(--color-accent)">M</div>
      <div class="activity-text">
        <p>M-Pesa payment received for PRP-101</p>
        <span>15 mins ago</span>
      </div>
    </li>
    <li class="activity-item">
      <div class="activity-avatar" style="background: #F59E0B">P</div>
      <div class="activity-text">
        <p>Property PRP-103 submitted for review</p>
        <span>1 hour ago</span>
      </div>
    </li>
  `;
});
