
const data = window.SITE_DATA || {};
const config = data.config || {};
const products = data.products || [];
const benefits = data.benefits || [];
const testimonials = data.testimonials || [];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: config.currency || 'USD'
});

const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => [...parent.querySelectorAll(sel)];

function discountPct(original, sale){
  return Math.round(((original - sale) / original) * 100);
}
function saveAmount(original, sale){
  return original - sale;
}
function waLink(message){
  const phone = config.whatsapp || '';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message || config.whatsappMessageDefault || 'Hola')}`;
}
function productCard(p){
  const pct = discountPct(p.precio_original, p.precio_oferta);
  const save = saveAmount(p.precio_original, p.precio_oferta);
  const badgeClass = (p.etiqueta || '').toLowerCase().includes('más vendido') ? 'best' : 'sale';
  const msg = `Hola, quiero comprar: ${p.nombre}.`;
  return `
    <article class="card">
      <div class="card-media">
        <span class="badge ${badgeClass}">${p.etiqueta || 'Oferta'}</span>
        <span class="discount-pill">-${pct}%</span>
        <img src="${p.imagen}" alt="${p.nombre}">
      </div>
      <div class="card-body">
        <div class="category">${p.categoria}</div>
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <div class="prices">
          <span class="current-price">${currency.format(p.precio_oferta)}</span>
          <span class="old-price">${currency.format(p.precio_original)}</span>
        </div>
        <div class="save-pill">Ahorras ${currency.format(save)}</div>
        <a class="btn btn-primary" href="${waLink(msg)}" target="_blank" rel="noopener">💬 Comprar por WhatsApp</a>
      </div>
    </article>
  `;
}
function renderProducts(list, selector){
  const el = $(selector);
  if (!el) return;
  el.innerHTML = list.map(productCard).join('');
}
function renderBenefits(){
  const el = $('#benefits-grid');
  el.innerHTML = benefits.map(b => `
    <article class="benefit">
      <div class="benefit-icon">${b.icon}</div>
      <h3>${b.title}</h3>
      <p>${b.text}</p>
    </article>
  `).join('');
}
function renderTestimonials(){
  const el = $('#testimonials-grid');
  el.innerHTML = testimonials.map(t => `
    <article class="testimonial">
      <div class="stars">★★★★★</div>
      <p>“${t.text}”</p>
      <div class="person">
        <div class="avatar">${t.name.charAt(0)}</div>
        <div><strong>${t.name}</strong><small>${t.city}</small></div>
      </div>
    </article>
  `).join('');
}
function renderFilters(){
  const el = $('#filters');
  const categories = ['Todos', ...new Set(products.map(p => p.categoria))];
  el.innerHTML = categories.map((c, i) =>
    `<button class="filter-btn ${i===0 ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');

  el.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    $$('.filter-btn', el).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    const filtered = cat === 'Todos' ? products : products.filter(p => p.categoria === cat);
    renderProducts(filtered, '#productos-grid');
  });
}
function renderGeneralWhatsApp(){
  $$('[data-wa-general]').forEach(a => {
    a.href = waLink(config.whatsappMessageDefault);
    a.target = '_blank';
    a.rel = 'noopener';
  });
}
function mobileMenu(){
  const toggle = $('.menu-toggle');
  const mobileNav = $('.mobile-nav');
  if (!toggle || !mobileNav) return;
  toggle.addEventListener('click', () => mobileNav.classList.toggle('show'));
  $$('a', mobileNav).forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('show')));
}

renderProducts(products.filter(p => p.destacado).slice(0, 3), '#featured-grid');
renderProducts(products.filter(p => (p.etiqueta || '').toLowerCase().includes('oferta') || discountPct(p.precio_original, p.precio_oferta) >= 25).slice(0, 3), '#offers-grid');
renderProducts(products, '#productos-grid');
renderBenefits();
renderTestimonials();
renderFilters();
renderGeneralWhatsApp();
mobileMenu();
