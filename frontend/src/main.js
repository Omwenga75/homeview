// Mock Data for demonstration
const properties = [
  {
    id: 1,
    title: "Emerald Luxury 2-Bedroom",
    location: "Westlands, Nairobi",
    price: 45000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    badge: "Featured"
  },
  {
    id: 2,
    title: "Modern Studio Apartment",
    location: "Kilimani, Nairobi",
    price: 25000,
    beds: 1,
    baths: 1,
    sqft: 600,
    image: "https://images.unsplash.com/photo-1502672260266-1c1e5240980c?auto=format&fit=crop&q=80&w=800",
    badge: "New"
  },
  {
    id: 3,
    title: "Sapphire Penthouse Suite",
    location: "Kileleshwa, Nairobi",
    price: 85000,
    beds: 4,
    baths: 4,
    sqft: 3500,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    badge: "Premium"
  },
  {
    id: 4,
    title: "Garden View 1-Bedroom",
    location: "Lavington, Nairobi",
    price: 35000,
    beds: 1,
    baths: 1,
    sqft: 800,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800",
    badge: ""
  },
  {
    id: 5,
    title: "Executive 3-Bedroom Townhouse",
    location: "Karen, Nairobi",
    price: 120000,
    beds: 3,
    baths: 3,
    sqft: 2500,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
    badge: "Featured"
  },
  {
    id: 6,
    title: "Cozy Ruaka Bedsitter",
    location: "Ruaka, Nairobi",
    price: 12000,
    beds: 1,
    baths: 1,
    sqft: 400,
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800",
    badge: "Affordable"
  }
];

function renderProperties() {
  const grid = document.getElementById('propertyGrid');
  if (!grid) return;

  grid.innerHTML = properties.map(prop => `
    <article class="property-card">
      ${prop.badge ? `<div class="property-badge">${prop.badge}</div>` : ''}
      <div style="overflow: hidden;">
        <img src="${prop.image}" alt="${prop.title}" class="property-image" loading="lazy">
      </div>
      <div class="property-content">
        <div class="property-price">KES ${prop.price.toLocaleString()} <span style="font-size: 0.875rem; color: var(--color-text-muted); font-weight: 400;">/mo</span></div>
        <h3 class="property-title" title="${prop.title}">${prop.title}</h3>
        <div class="property-location">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${prop.location}
        </div>
        <div class="property-meta">
          <div class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            ${prop.beds} Beds
          </div>
          <div class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v6h18V2H3zm15 12h3v8H3v-8h3m9-2a3 3 0 1 0-6 0v2h6v-2z"></path></svg>
            ${prop.baths} Baths
          </div>
          <div class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            ${prop.sqft} sqft
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderProperties();
});
