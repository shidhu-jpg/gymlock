// ===== GymSathi.online =====
const WHATSAPP_NUMBER = "919876543210"; // TODO: replace with the store's real WhatsApp number
const FREE_DELIVERY_MIN = 999;
const DELIVERY_FEE = 79;

const PRODUCTS = [
  { id: "on-gsw", brand: "Optimum Nutrition", name: "Gold Standard Whey", size: "2.27kg", cat: "whey", img: "prod-1", rating: 4.8, reviews: "2.1k", price: 5499, mrp: 6499, badge: ["best", "Best Seller"] },
  { id: "mt-nitro", brand: "Muscletech", name: "Nitro Tech Whey", size: "2.27kg", cat: "whey", img: "prod-2", rating: 4.7, reviews: "1.3k", price: 4299, mrp: 5699, badge: ["off", "24% OFF"] },
  { id: "mp-creatine", brand: "MyProtein", name: "Creatine Monohydrate", size: "250g", cat: "creatine", img: "prod-3", rating: 4.6, reviews: "980", price: 1199, mrp: 1599 },
  { id: "an-mass", brand: "Applied Nutrition", name: "Mass Gainer", size: "3kg", cat: "mass", img: "prod-4", rating: 4.5, reviews: "620", price: 2999, mrp: 3799, badge: ["pop", "Popular"] },
  { id: "cellucor-c4", brand: "Cellucor", name: "C4 Pre-Workout", size: "300g", cat: "preworkout", img: "prod-5", rating: 4.6, reviews: "1.1k", price: 2299, mrp: 2849, badge: ["off", "18% OFF"] },
  { id: "on-fishoil", brand: "Optimum Nutrition", name: "Fish Oil Omega-3", size: "100 Softgels", cat: "vitamins", img: "prod-6", rating: 4.7, reviews: "890", price: 899, mrp: 1199 },
  { id: "gs-multi", brand: "GymSathi Essentials", name: "Daily Multivitamin", size: "60 Tablets", cat: "vitamins", img: "cat-5", rating: 4.5, reviews: "410", price: 599, mrp: 799 },
  { id: "gs-bcaa", brand: "Scitron", name: "BCAA 2:1:1", size: "250g", cat: "amino", img: "cat-6", rating: 4.4, reviews: "350", price: 1349, mrp: 1699 },
  { id: "gs-ashwa", brand: "Nutrabay", name: "Ashwagandha Extract", size: "60 Capsules", cat: "wellness", img: "cat-7", rating: 4.5, reviews: "520", price: 449, mrp: 599 },
  { id: "gs-shaker", brand: "GymSathi", name: "Pro Shaker Bottle", size: "700ml", cat: "accessories", img: "cat-8", rating: 4.6, reviews: "760", price: 349, mrp: 499 },
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const inr = (n) => "₹" + n.toLocaleString("en-IN");

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------- Products ---------- */
let currentFilter = "all";
let currentQuery = "";

function renderProducts() {
  const q = currentQuery.trim().toLowerCase();
  const list = PRODUCTS.filter((p) =>
    (currentFilter === "all" || p.cat === currentFilter) &&
    (!q || `${p.brand} ${p.name} ${p.cat}`.toLowerCase().includes(q))
  );
  $("#products").innerHTML = list.map((p) => `
    <article class="product">
      ${p.badge ? `<span class="badge badge--${p.badge[0]}">${p.badge[1]}</span>` : ""}
      <div class="product__img"><img src="assets/img/${p.img}.jpg" alt="${p.brand} ${p.name}" loading="lazy" /></div>
      <p class="product__brand">${p.brand}</p>
      <h3 class="product__name">${p.name}</h3>
      <p class="product__size">(${p.size})</p>
      <div class="product__rating"><b>★ ${p.rating}</b><span>(${p.reviews})</span></div>
      <div class="product__price"><strong>${inr(p.price)}</strong><s>${inr(p.mrp)}</s></div>
      <button class="btn btn--green" data-add="${p.id}">Add to Cart</button>
    </article>`).join("");
  $("#emptyMsg").hidden = list.length > 0;
  $("#products").scrollLeft = 0;
}

function setFilter(filter) {
  currentFilter = filter;
  $$("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.filter === filter));
  $$(".nav a[data-filter]").forEach((a) => a.classList.toggle("active", a.dataset.filter === filter));
  renderProducts();
}

$$("[data-filter]").forEach((el) =>
  el.addEventListener("click", () => {
    if (el.dataset.filter) setFilter(el.dataset.filter);
    closeMenu();
  })
);

$("#searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  currentQuery = $("#searchInput").value;
  setFilter("all");
  $("#best").scrollIntoView();
});
$("#searchInput").addEventListener("input", (e) => {
  if (!e.target.value) { currentQuery = ""; renderProducts(); }
});
$("#clearSearch").addEventListener("click", () => {
  currentQuery = "";
  $("#searchInput").value = "";
  setFilter("all");
});

/* ---------- Horizontal scrollers ---------- */
$$("[data-scroll]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const track = $(btn.dataset.scroll);
    track.scrollBy({ left: track.clientWidth * 0.8 * Number(btn.dataset.dir), behavior: "smooth" });
  })
);

/* ---------- Cart ---------- */
let cart = {};
try { cart = JSON.parse(localStorage.getItem("gymsathi-cart")) || {}; } catch { cart = {}; }

function saveCart() {
  try { localStorage.setItem("gymsathi-cart", JSON.stringify(cart)); } catch {}
}

function cartLines() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ p: PRODUCTS.find((x) => x.id === id), qty }))
    .filter((l) => l.p && l.qty > 0);
}

function renderCart() {
  const lines = cartLines();
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.p.price, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;

  const badge = $("#cartCount");
  if (badge.textContent !== String(count)) {
    badge.textContent = count;
    badge.classList.remove("bump");
    void badge.offsetWidth;
    badge.classList.add("bump");
  }

  $("#cartItems").innerHTML = lines.length
    ? lines.map(({ p, qty }) => `
      <div class="cart-item">
        <img src="assets/img/${p.img}.jpg" alt="" />
        <div>
          <h4>${p.brand} ${p.name}</h4>
          <div class="price">${inr(p.price)} · ${p.size}</div>
          <div class="qty">
            <button data-qty="${p.id}" data-d="-1" aria-label="Decrease">−</button>
            <span>${qty}</span>
            <button data-qty="${p.id}" data-d="1" aria-label="Increase">+</button>
          </div>
        </div>
        <button class="remove" data-remove="${p.id}" aria-label="Remove"><svg><use href="#i-trash"/></svg></button>
      </div>`).join("")
    : `<p class="cart-empty">Your cart is empty.<br />Add some gains! 💪</p>`;

  $("#cartSubtotal").textContent = inr(subtotal);
  $("#cartDelivery").textContent = subtotal === 0 ? "—" : delivery ? inr(delivery) : "FREE";
  $("#cartTotal").textContent = inr(subtotal + delivery);
  $("#freeNote").textContent = subtotal > 0 && subtotal < FREE_DELIVERY_MIN
    ? `Add ${inr(FREE_DELIVERY_MIN - subtotal)} more for FREE delivery`
    : subtotal > 0 ? "🎉 You've unlocked FREE delivery" : "";
  $("#checkoutBtn").disabled = lines.length === 0;
}

function addToCart(id, btn) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  const p = PRODUCTS.find((x) => x.id === id);
  toast(`${p.name} added to cart`);
  if (btn) {
    btn.textContent = "Added ✓";
    btn.classList.add("added");
    setTimeout(() => { btn.textContent = "Add to Cart"; btn.classList.remove("added"); }, 1200);
  }
}

document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) return addToCart(add.dataset.add, add);
  const q = e.target.closest("[data-qty]");
  if (q) {
    cart[q.dataset.qty] = Math.max(0, (cart[q.dataset.qty] || 0) + Number(q.dataset.d));
    if (!cart[q.dataset.qty]) delete cart[q.dataset.qty];
    saveCart();
    return renderCart();
  }
  const rm = e.target.closest("[data-remove]");
  if (rm) {
    delete cart[rm.dataset.remove];
    saveCart();
    return renderCart();
  }
  const t = e.target.closest("[data-toast]");
  if (t) { e.preventDefault(); toast(t.dataset.toast); }
});

/* ---------- Drawers ---------- */
const overlay = $("#overlay");
function openPanel(panel) {
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}
function closePanels() {
  $$(".drawer, .mobile-menu").forEach((p) => { p.classList.remove("open"); p.setAttribute("aria-hidden", "true"); });
  overlay.hidden = true;
  document.body.style.overflow = "";
}
function closeMenu() { if ($("#mobileMenu").classList.contains("open")) closePanels(); }

$("#cartBtn").addEventListener("click", () => openPanel($("#cart")));
$("#cartClose").addEventListener("click", closePanels);
$("#menuBtn").addEventListener("click", () => openPanel($("#mobileMenu")));
$("#menuClose").addEventListener("click", closePanels);
overlay.addEventListener("click", closePanels);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanels(); });

// Mobile menu reuses the desktop nav links
$("#mobileNav").append(...$$(".nav a").map((a) => {
  const c = a.cloneNode(true);
  c.classList.remove("active");
  c.addEventListener("click", () => { if (c.dataset.filter) setFilter(c.dataset.filter); closePanels(); });
  return c;
}));

/* ---------- WhatsApp ---------- */
const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
$$(".js-wa").forEach((a) => {
  a.href = waLink("Hi GymSathi! I need help choosing the right supplement.");
  a.target = "_blank";
  a.rel = "noopener";
});

$("#checkoutBtn").addEventListener("click", () => {
  const lines = cartLines();
  if (!lines.length) return;
  const subtotal = lines.reduce((s, l) => s + l.qty * l.p.price, 0);
  const delivery = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  const msg = [
    "Hi GymSathi! I'd like to place an order:",
    "",
    ...lines.map((l, i) => `${i + 1}. ${l.p.brand} ${l.p.name} (${l.p.size}) × ${l.qty} = ${inr(l.qty * l.p.price)}`),
    "",
    `Subtotal: ${inr(subtotal)}`,
    `Delivery: ${delivery ? inr(delivery) : "FREE"}`,
    `Total: ${inr(subtotal + delivery)}`,
    "",
    "Name:",
    "Address:",
    "Pincode:",
    "Payment: COD / UPI",
  ].join("\n");
  window.open(waLink(msg), "_blank", "noopener");
});

/* ---------- Newsletter ---------- */
$("#newsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  toast("Thanks for subscribing! Watch your inbox for offers.");
});

/* ---------- Reveal on scroll ---------- */
const revealTargets = $$(".section, .offer, .trust, .why, .newsletter");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.08 });
  revealTargets.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}

$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
