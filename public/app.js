/* =====================================================================
   JAYAKESH KERALA HAIR OIL — PRODUCTION STOREFRONT APPLICATION
   ===================================================================== */

const IMG_BOTTLE = "/assets/bottle.png";
const ASSETS = {
  coconut: "/assets/coconut.jpg",
  hibiscus: "/assets/hibiscus.jpg",
};

const INDIAN_STATES = [
  "Kerala", "Tamil Nadu", "Karnataka", "Maharashtra", "Delhi", "Telangana",
  "Andhra Pradesh", "Gujarat", "West Bengal", "Uttar Pradesh", "Rajasthan",
  "Madhya Pradesh", "Punjab", "Haryana", "Bihar", "Odisha", "Assam", "Goa",
  "Chhattisgarh", "Jharkhand", "Uttarakhand", "Himachal Pradesh", "Chandigarh",
  "Puducherry", "Jammu and Kashmir", "Ladakh", "Tripura", "Meghalaya",
  "Manipur", "Nagaland", "Arunachal Pradesh", "Mizoram", "Sikkim",
  "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
];

const INGREDIENTS = [
  { name: "Coconut Oil", img: "@coconut", tint: ["#fff6e6", "#f5dfb8"], benefits: ["Nourishes and conditions hair.", "Helps reduce hair protein loss and breakage.", "Helps prevent dryness and improve softness."] },
  { name: "Kalonji", sub: "Black Seed", art: "kalonji", tint: ["#ece9f7", "#d5cdee"], benefits: ["Provides antioxidant protection.", "Helps condition hair and nourish the scalp.", "Contains fatty acids that support hair health."] },
  { name: "Methi", sub: "Fenugreek Seeds", art: "methi", tint: ["#fff1cf", "#f3d68e"], benefits: ["Helps condition hair and improve softness.", "Contains plant compounds with antioxidant properties.", "Traditionally used to support scalp and hair health."] },
  { name: "Hibiscus", img: "@hibiscus", tint: ["#fde2e6", "#f9c4cd"], benefits: ["Helps condition hair and improve manageability.", "Contains antioxidants that help protect against oxidative stress.", "Traditionally used to support healthy-looking hair."] },
  { name: "Tulsi", sub: "Holy Basil", art: "tulsi", tint: ["#e3f4d5", "#bfe3a3"], benefits: ["Contains natural antimicrobial compounds.", "Provides antioxidant protection.", "Helps support scalp health."] },
  { name: "Aloe Vera", art: "aloe", tint: ["#e0f5ea", "#b6e6cf"], benefits: ["Helps moisturise and condition hair.", "Soothes and hydrates the scalp.", "Helps improve hair softness and manageability."] },
  { name: "Kali Mirch", sub: "Black Pepper", art: "pepper", tint: ["#f1e8e0", "#dccbb9"], benefits: ["Contains antioxidant compounds.", "Provides naturally occurring plant phytochemicals.", "Contains compounds with anti-inflammatory properties."] },
  { name: "Vitamin E", art: "vitamine", tint: ["#fff0d0", "#ffd98a"], benefits: ["Provides antioxidant protection.", "Helps protect the oil from oxidation and rancidity.", "Helps condition and nourish the scalp."] },
  { name: "Tea Leaves", art: "tea", tint: ["#e8f1d6", "#c9dfa0"], benefits: ["Rich in natural polyphenols and antioxidants.", "Contains catechins and caffeine.", "Helps protect against oxidative stress."] },
];

const FOUNDERS = [
  {
    name: "Jaya",
    initials: "J",
    role: "Co-Founder",
    photo: "/founders/jaya.jpg",
    intro: "Jaya is a co-founder of Jayakesh, the Kerala hair oil that is handmade with pure herbal ingredients and no harmful chemicals.",
    story: [],
    quote: "",
  },
  {
    name: "Ashmit Thomas",
    initials: "AT",
    role: "Co-Founder",
    photo: "/founders/ashmit.jpg",
    intro: "Ashmit Thomas is the other co-founder of Jayakesh, building the brand together with Jaya.",
    story: [],
    quote: "",
  },
];

// Botanical SVG illustrations
const sv = (inner, defs = "") => `<svg viewBox="0 0 200 200" aria-hidden="true"><defs>${defs}</defs>${inner}</svg>`;
const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const ART = {
  kalonji: sv([[58, 72, 20], [100, 52, -30], [142, 74, 40], [78, 112, -10], [122, 116, 25], [52, 144, 60], [100, 150, -45], [148, 142, 10], [100, 96, 70]]
    .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(2.3)"><path d="M0-9C6-4 6 5 0 9C-6 5-6-4 0-9Z" fill="#17171c"/><path d="M-1.5-5C1-2 1 2-1.5 5" stroke="#6b6b78" stroke-width=".9" fill="none" stroke-linecap="round"/></g>`).join("")),
  methi: sv([[56, 70, 15], [98, 54, -25], [140, 72, 30], [72, 108, -20], [116, 112, 20], [152, 112, -10], [52, 146, 40], [96, 148, -30], [140, 150, 15]]
    .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(1.9)"><rect x="-9" y="-6" width="18" height="12" rx="5" fill="url(#mg)"/><path d="M-6 0H6" stroke="#8a5a14" stroke-width="1.6" stroke-linecap="round"/></g>`).join("")
    + `<g fill="#4fa04a"><ellipse cx="160" cy="46" rx="16" ry="7" transform="rotate(-35 160 46)"/><ellipse cx="176" cy="66" rx="14" ry="6" transform="rotate(10 176 66)"/><ellipse cx="148" cy="28" rx="12" ry="5.5" transform="rotate(-70 148 28)"/></g>`, grad("mg", "#e8b04a", "#b0761c")),
  tulsi: sv(`<path d="M100 190C98 140 102 96 100 44" stroke="#2c7a34" stroke-width="5" fill="none" stroke-linecap="round"/>`
    + [150, 118, 86].map((y) => [1, -1].map((s) => `<g transform="translate(100 ${y}) scale(${s} 1) rotate(-28)"><ellipse cx="34" cy="0" rx="34" ry="14" fill="url(#tg)"/><path d="M4 0H66" stroke="#c9ecab" stroke-width="1.6" opacity=".85"/></g>`).join("")).join("")
    + `<ellipse cx="100" cy="40" rx="11" ry="24" fill="url(#tg)"/><g fill="#9b6fd0"><circle cx="100" cy="22" r="4"/><circle cx="94" cy="30" r="3"/><circle cx="106" cy="30" r="3"/></g>`, grad("tg", "#58b84f", "#27702f")),
  aloe: sv([[-62, .8], [62, .8], [-38, .95], [38, .95], [-16, 1.05], [16, 1.05], [0, 1.1]]
    .map(([a, s]) => `<g transform="translate(100 176) rotate(${a}) scale(${s})"><path d="M0 0C-17-30-15-80 0-124C15-80 17-30 0 0Z" fill="url(#ag2)"/><path d="M0-10V-104" stroke="#c9eab0" stroke-width="2" opacity=".6"/><g fill="#d8f0c4" opacity=".7"><circle cx="-4" cy="-40" r="1.6"/><circle cx="4" cy="-62" r="1.6"/><circle cx="-3" cy="-84" r="1.4"/></g></g>`).join("")
    + `<path d="M166 138C156 156 154 164 166 169C178 164 176 156 166 138Z" fill="#c9f3e6" stroke="#79cdb4" stroke-width="1.5"/>`, grad("ag2", "#7ccb5e", "#2f8a3a")),
  pepper: sv([[68, 122, 20], [110, 128, 19], [88, 86, 18], [134, 90, 17], [152, 130, 18], [100, 164, 19], [60, 160, 17]]
    .map(([x, y, r]) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="url(#pg)"/>${[[-6, -4], [5, 6], [-3, 8], [7, -7], [0, 0]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.5" fill="#5a5148" opacity=".8"/>`).join("")}<ellipse cx="${x - r / 3}" cy="${y - r / 2.4}" rx="${r / 4}" ry="${r / 6}" fill="#fff" opacity=".35"/></g>`).join(""),
    `<radialGradient id="pg" cx=".35" cy=".3"><stop offset="0" stop-color="#5b5148"/><stop offset="1" stop-color="#17130f"/></radialGradient>`),
  vitamine: sv(`<g><rect x="28" y="62" width="144" height="58" rx="29" fill="url(#vg)"/><path d="M100 62h43a29 29 0 0 1 0 58h-43z" fill="#e69a14" opacity=".55"/><rect x="40" y="70" width="112" height="13" rx="6.5" fill="#fff" opacity=".4"/></g>`
    + [[70, 30], [100, 20], [130, 30]].map(([x, y]) => `<path d="M${x} ${y - 12}C${x - 8} ${y + 2} ${x - 10} ${y + 8} ${x} ${y + 12}C${x + 10} ${y + 8} ${x + 8} ${y + 2} ${x} ${y - 12}Z" fill="#ffd45a" stroke="#e0a21a" stroke-width="1.4"/>`).join("")
    + `<circle cx="100" cy="152" r="27" fill="#fff" stroke="#f0b429" stroke-width="3.5"/><text x="100" y="167" text-anchor="middle" font-family="Georgia,serif" font-size="42" font-weight="700" fill="#c98a0a">E</text>`, grad("vg", "#ffd96a", "#f0a91c")),
  tea: sv([[-64, .85], [64, .85], [-34, 1], [34, 1], [0, 1.08]]
    .map(([a, s]) => `<g transform="translate(100 168) rotate(${a}) scale(${s})"><path d="M0 0C-26-30-22-82 0-116C22-82 26-30 0 0Z" fill="url(#tl)"/><path d="M0-6V-104" stroke="#d3e8a8" stroke-width="1.8" opacity=".75"/>${[-30, -52, -74].map((y) => `<path d="M0 ${y}L-11 ${y - 10}M0 ${y}L11 ${y - 10}" stroke="#d3e8a8" stroke-width="1.2" opacity=".6"/>`).join("")}</g>`).join("")
    + `<path d="M100 168C98 176 99 184 100 190" stroke="#4d7a25" stroke-width="4" stroke-linecap="round"/>`, grad("tl", "#7fae3c", "#3a6a1c")),
};

// Live Store State (populated from /api/store with instant defaults)
let STORE = {
  settings: {
    store_name: "Jayakesh Kerala Hair Oil",
    whatsapp: "917011083799",
    phone: "+91 70110 83799",
    support_email: "care@jayakesh.com",
    address: "Kerala, India",
    instagram: "",
    upi_id: "",
    upi_payee_name: "Jayakesh Kerala Hair Oil",
    cod_enabled: true,
    upi_enabled: true,
    shipping_fee: 49,
    free_shipping_min: 499,
    cod_fee: 0,
    announcement_bar: "Handmade Kerala Herbal Hair Oil · Free Pan-India Shipping on orders ₹499+",
    video_url: "",
  },
  products: [
    {
      id: "jk-200",
      name: "Jayakesh Kerala Hair Oil",
      size: "200 ml",
      price: 399,
      compare_price: 499,
      stock: 100,
      active: true,
      coming_soon: false,
      image: IMG_BOTTLE,
      description:
        "Jayakesh Kerala Hair Oil is a handmade herbal hair oil, made in the Kerala tradition with pure herbal ingredients and no harmful chemicals.",
      benefits: [
        "Helps reduce hair fall",
        "Promotes healthy hair growth",
        "Nourishes the scalp",
        "Strengthens hair",
      ],
      highlights: ["Handmade", "No harmful chemicals", "Pure herbal ingredients"],
    },
  ],
  reviews: [],
};

let appliedCoupon = null; // { code, discount, message }
let lastPlacedOrder = null;
let lastPlacedUpi = null;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
const money = (n) =>
  n === null || n === undefined ? "Price on request" : "₹" + Number(n).toLocaleString("en-IN");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const WA_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Z"/></svg>';
const IG_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';

const tel = (p) => "tel:" + String(p || "").replace(/[^\d+]/g, "");
const waLink = (msg) =>
  (STORE.settings.whatsapp
    ? `https://wa.me/${STORE.settings.whatsapp.replace(/\D/g, "")}`
    : "https://wa.me/") +
  "?text=" +
  encodeURIComponent(msg);
const inquiry = (t) => "Hello Jayakesh, " + (t || "I have a question about your hair oil.");

let toastTimer;
function showToast(text) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

function mainProduct() {
  return STORE.products.find((p) => !p.coming_soon && p.active) || STORE.products[0];
}
function findProduct(id) {
  return STORE.products.find((p) => p.id === id) || mainProduct();
}

/* ---------- Cart ---------- */
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("jk-cart") || "[]");
} catch {}

function saveCart() {
  try {
    localStorage.setItem("jk-cart", JSON.stringify(cart));
  } catch {}
  paintCart();
}

function cartCount() {
  return cart.reduce((s, i) => s + Number(i.qty || 0), 0);
}

function cartSubtotal() {
  let sum = 0;
  for (const item of cart) {
    const p = findProduct(item.id);
    if (!p || p.price === null) return null;
    sum += Number(p.price) * Number(item.qty);
  }
  return sum;
}

function computeTotals(payMethod = "cod") {
  const subtotal = cartSubtotal() || 0;
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const s = STORE.settings;
  const shipping =
    subtotal === 0
      ? 0
      : s.free_shipping_min > 0 && afterDiscount >= s.free_shipping_min
        ? 0
        : Number(s.shipping_fee || 0);
  const codFee = payMethod === "cod" && subtotal > 0 ? Number(s.cod_fee || 0) : 0;
  return { subtotal, discount, shipping, codFee, total: afterDiscount + shipping + codFee };
}

function addToCart(productId, qty = 1, open = true) {
  const p = findProduct(productId);
  if (!p || p.coming_soon) return;
  if (p.stock <= 0) {
    showToast("Currently out of stock");
    return;
  }
  const f = cart.find((i) => i.id === p.id);
  if (f) f.qty = Math.min(20, p.stock, f.qty + qty);
  else cart.push({ id: p.id, qty: Math.min(20, p.stock, qty) });
  saveCart();
  if (open) openDrawer(true);
  else showToast(`Added ${p.name} to cart`);
}

function setItemQty(productId, q) {
  const p = findProduct(productId);
  const maxQ = Math.min(20, p?.stock || 20);
  if (q <= 0) {
    cart = cart.filter((i) => i.id !== productId);
  } else {
    const f = cart.find((i) => i.id === productId);
    if (f) f.qty = Math.min(maxQ, q);
  }
  if (!cartCount()) appliedCoupon = null;
  saveCart();
  const rName = route().name;
  if (rName === "cart" || rName === "checkout") render();
}

function orderMsg(lines) {
  const rows = lines.map((l) => {
    const p = findProduct(l.id);
    return `• ${p.name} (${p.size}) × ${l.qty} — ${p.price === null ? "price on request" : money(p.price * l.qty)}`;
  });
  const sub = cartSubtotal();
  return [
    "Hello Jayakesh, I would like to order:",
    ...rows,
    sub !== null ? "Subtotal: " + money(sub) : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderCartLines() {
  return cart
    .map((item) => {
      const p = findProduct(item.id);
      return `<div class="line-item">
        <img src="${esc(p.image || IMG_BOTTLE)}" alt="${esc(p.name)}">
        <div>
          <strong>${esc(p.name)}</strong>
          <div style="font-size:.83rem;color:var(--muted)">${esc(p.size)} · ${money(p.price)}</div>
          <div class="qty" style="margin-top:.4rem">
            <button type="button" data-cid="${esc(p.id)}" data-q="${item.qty - 1}" aria-label="Decrease quantity">−</button>
            <output>${item.qty}</output>
            <button type="button" data-cid="${esc(p.id)}" data-q="${item.qty + 1}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700">${p.price === null ? "—" : money(p.price * item.qty)}</div>
          <button type="button" class="icon-btn" data-cid="${esc(p.id)}" data-q="0" aria-label="Remove item" title="Remove">🗑</button>
        </div>
      </div>`;
    })
    .join("");
}

function paintCart() {
  const n = cartCount();
  const b = $("#badge");
  if (b) {
    b.textContent = n;
    b.classList.toggle("hidden", n === 0);
  }
  const body = $("#drawerBody");
  const foot = $("#drawerFoot");
  if (!body || !foot) return;
  if (!n) {
    body.innerHTML = '<p style="padding:3rem 0;text-align:center;color:var(--muted)">Your cart is empty.</p>';
    foot.innerHTML = "";
    return;
  }
  const t = computeTotals("cod");
  const freeMin = STORE.settings.free_shipping_min;
  const awayFromFree = freeMin > 0 && t.subtotal < freeMin ? freeMin - t.subtotal : 0;

  body.innerHTML =
    (awayFromFree > 0
      ? `<p style="margin:.9rem 0 .2rem;padding:.55rem .8rem;background:#eef8e8;color:#175c24;border-radius:10px;font-size:.8rem;font-weight:700;text-align:center">Add ${money(awayFromFree)} more for FREE delivery!</p>`
      : freeMin > 0
        ? `<p style="margin:.9rem 0 .2rem;padding:.55rem .8rem;background:#e1f5d6;color:#14521d;border-radius:10px;font-size:.8rem;font-weight:700;text-align:center">🎉 You unlocked FREE pan-India delivery!</p>`
        : "") + renderCartLines();

  foot.innerHTML = `
    <div style="display:flex;justify-content:space-between;font-weight:700"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
    <small style="color:var(--muted)">${t.shipping === 0 ? "Free shipping unlocked!" : `Shipping ${money(t.shipping)} (Free above ${money(freeMin)})`}</small>
    <a class="btn btn-primary" href="#/checkout">Proceed to Checkout</a>
    <a class="btn btn-ghost btn-sm" href="#/cart">View Full Cart</a>
  `;
}

function openDrawer(v) {
  $("#drawer").classList.toggle("open", v);
  $("#scrim").classList.toggle("open", v);
}
$("#drawerBody").addEventListener("click", (e) => {
  const b = e.target.closest("[data-q]");
  if (b) setItemQty(b.dataset.cid, +b.dataset.q);
});
$("#scrim").onclick = $("#drawerClose").onclick = () => openDrawer(false);
$("#cartBtn").onclick = () => openDrawer(true);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    openDrawer(false);
    $("#mm").classList.remove("open");
    $("#reviewModal").classList.remove("open");
    document.body.style.overflow = "";
  }
});
$("#burger").onclick = () => {
  $("#mm").classList.add("open");
  document.body.style.overflow = "hidden";
};
function closeMenu() {
  $("#mm").classList.remove("open");
  document.body.style.overflow = "";
}
$("#mmClose").onclick = closeMenu;
$("#mm").addEventListener("click", (e) => {
  if (e.target.tagName === "A") closeMenu();
});

/* ---------- Components & Views ---------- */
const head = (eyebrow, title, intro) =>
  `<section class="page-head"><div class="wrap"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${intro ? `<p class="lead" style="margin-top:1.3rem">${intro}</p>` : ""}</div></section>`;

function priceMarkup(p) {
  const hasDiscount = p.compare_price && p.price && p.compare_price > p.price;
  const pct = hasDiscount ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) : 0;
  return `<div class="price-row">
    <div class="price">${money(p.price)}</div>
    ${hasDiscount ? `<span class="mrp">${money(p.compare_price)}</span><span class="save-pill">Save ${pct}%</span>` : ""}
  </div>
  <div class="stock-tag ${p.stock <= 0 ? "out" : ""}"><i></i>${p.stock <= 0 ? "Out of stock" : p.stock <= 10 ? `Only ${p.stock} bottles left in this batch` : "In stock · Fresh handmade batch"}</div>`;
}

function buyBox(p) {
  const out = p.stock <= 0;
  return `<div data-buybox="${esc(p.id)}">
    ${priceMarkup(p)}
    <div class="chips"><span class="chip">${esc(p.size)}</span>${STORE.settings.free_shipping_min > 0 ? `<span class="chip" style="background:#e6f4ea;color:#155c1e">Free shipping ₹${STORE.settings.free_shipping_min}+</span>` : ""}</div>
    <div class="row-actions">
      <div class="qty" role="group" aria-label="Quantity">
        <button type="button" data-act="dec" aria-label="Decrease quantity">−</button>
        <output data-qty>1</output>
        <button type="button" data-act="inc" aria-label="Increase quantity">+</button>
      </div>
      <button type="button" class="btn btn-dark" data-act="add" ${out ? "disabled" : ""}>${out ? "Sold Out" : "Add to Cart"}</button>
    </div>
    <div class="row-actions" style="margin-top:.8rem">
      <button type="button" class="btn btn-primary" data-act="buy" ${out ? "disabled" : ""}>Buy Now</button>
      <a class="btn btn-wa" data-wa target="_blank" rel="noopener noreferrer" href="${esc(waLink(orderMsg([{ id: p.id, qty: 1 }])))}">${WA_ICON} Order via WhatsApp</a>
    </div>
  </div>`;
}

const ingSrc = (g) => (g.img && g.img[0] === "@" ? ASSETS[g.img.slice(1)] : g.img || "");
const ingCards = () =>
  `<div class="ing-grid" data-ing>${INGREDIENTS.map(
    (g, i) => `<button type="button" class="ing reveal" style="transition-delay:${i * 60}ms" aria-pressed="false" aria-label="${esc(g.name)}${g.sub ? " (" + esc(g.sub) + ")" : ""}. Tap to flip.">
      <span class="inner">
        <span class="face front" style="--t1:${(g.tint || [])[0] || "#e6f4d6"};--t2:${(g.tint || [])[1] || "#cfe9b5"}">
          ${ingSrc(g) ? `<img src="${esc(ingSrc(g))}" alt="${esc(g.name)}" loading="lazy" data-art="${esc(g.art || "")}">` : ART[g.art] || ""}
          <h3>${esc(g.name)}${g.sub ? `<small>${esc(g.sub)}</small>` : ""}</h3>
        </span>
        <span class="face back">
          <h3>${esc(g.name)}${g.sub ? `<small>${esc(g.sub)}</small>` : ""}</h3>
          <ul>${g.benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        </span>
      </span>
    </button>`
  ).join("")}</div>`;

const founderHtml = (f, i) =>
  `<article class="founder ${i % 2 ? "rev" : ""}">
    <div class="fphoto reveal">
      <span class="mono">${esc(f.initials)}</span>
      ${f.photo ? `<img src="${esc(f.photo)}" alt="${esc(f.name)}, co-founder of Jayakesh" onerror="this.remove()">` : ""}
    </div>
    <div class="reveal">
      <p class="eyebrow">${esc(f.role)}</p>
      <h3>${esc(f.name)}</h3>
      <div class="gline"></div>
      <p class="lead" style="margin-top:1.2rem">${esc(f.intro)}</p>
      ${f.story.map((p) => `<p class="lead" style="margin-top:1rem">${esc(p)}</p>`).join("")}
      ${f.quote ? `<blockquote class="fquote">“${esc(f.quote)}”</blockquote>` : ""}
    </div>
  </article>`;

let ri = 0;
function reviewsHtml() {
  const list = STORE.reviews || [];
  const writeBtn = `<div style="margin-top:1.4rem;text-align:center"><button type="button" class="btn btn-ghost btn-sm" data-open-review>✍️ Write a Customer Review</button></div>`;
  if (!list.length) {
    return `<div class="empty">
      <p style="font-family:var(--serif);font-size:1.5rem;color:var(--ink)">Tried Jayakesh Kerala Hair Oil?</p>
      <p style="font-size:.95rem;margin-top:.4rem">Share your honest experience with our handmade herbal hair oil.</p>
      <button type="button" class="btn btn-dark btn-sm" style="margin-top:1.1rem" data-open-review>Write the First Review</button>
    </div>`;
  }
  const r = list[ri % list.length];
  return `<div class="slider" id="slider">
    <figure class="slide" style="margin:0">
      <div style="color:var(--oil);font-size:1.2rem" aria-label="${r.rating} out of 5 stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <blockquote style="margin:1rem 0;font-family:var(--serif);font-size:1.65rem;line-height:1.3">“${esc(r.comment)}”</blockquote>
      <figcaption style="font-weight:700;display:flex;align-items:center;flex-wrap:wrap;gap:.3rem">
        <span>${esc(r.customer_name)}${r.city ? `, <span style="font-weight:400;color:var(--muted)">${esc(r.city)}</span>` : ""}</span>
        ${r.verified_buyer ? '<span class="verified-badge">✓ Verified Buyer</span>' : ""}
      </figcaption>
    </figure>
    ${
      list.length > 1
        ? '<div style="display:flex;gap:.5rem;margin-top:1rem;justify-content:center"><button type="button" class="icon-btn" data-rv="-1" aria-label="Previous review">‹</button><button type="button" class="icon-btn" data-rv="1" aria-label="Next review">›</button></div>'
        : ""
    }
    ${writeBtn}
  </div>`;
}

function field(id, label, tag, attrs = "", inner = "") {
  return `<div class="field"><label for="${id}">${label}</label><${tag} id="${id}" name="${id}" ${attrs}>${inner}${tag === "textarea" || tag === "select" ? `</${tag}>` : ""}<span class="err" id="${id}-err" role="alert"></span></div>`;
}

function getQueryParams() {
  const qIdx = location.hash.indexOf("?");
  if (qIdx === -1) return new URLSearchParams();
  return new URLSearchParams(location.hash.slice(qIdx + 1));
}

const views = {
  home: () => {
    const P = mainProduct();
    return `
    <section class="hero"><div class="hero-bg" data-px="-0.12"><i></i></div><div class="wrap grid"><div>
      <p class="eyebrow">Jayakesh · Kerala Hair Oil</p>
      <h1 style="margin:1rem 0"><span class="line"><span style="animation-delay:.3s">Legacy</span></span><span class="line"><span class="gold" style="animation-delay:.48s">in every drop.</span></span></h1>
      <p class="lead">Handmade with pure herbal ingredients and no harmful chemicals. A Kerala hair oil made to care for your scalp and strengthen your hair.</p>
      <div class="ctas"><a href="#/shop" class="btn btn-primary">Shop Now</a><a href="#/ingredients" class="btn btn-ghost">9 Herbal Ingredients</a></div></div>
      <div class="stage" id="stage" data-px="0.06"><div class="ring r2" data-d="-14"></div><div class="ring" data-d="-14"></div><div class="halo" data-d="30"></div><div class="floor" data-d="24"></div>
        <div class="float" style="height:92%;display:grid;place-items:center;position:relative"><img id="bottle" class="bottle" src="${esc(P.image || IMG_BOTTLE)}" alt="${esc(P.name)} ${esc(P.size)} bottle" width="887" height="1774" style="height:100%;width:auto"></div></div>
    </div><div class="scroll-hint">Scroll</div></section>

    <div class="marquee" aria-hidden="true"><div class="track">${Array(4).fill("<span>Handmade ✦</span><span>No harmful chemicals ✦</span><span>Pure herbal ingredients ✦</span><span>Legacy in every drop ✦</span>").join("")}</div></div>

    <section class="section"><div class="wrap showcase"><div class="pic reveal"><img src="${esc(P.image || IMG_BOTTLE)}" alt="${esc(P.name)} ${esc(P.size)}" width="887" height="1774"></div>
      <div class="reveal"><p class="eyebrow">The product</p><h2 style="margin-top:.4rem">${esc(P.name)}</h2><p class="lead" style="margin:1.2rem 0">${esc(P.description)}</p>
      <div class="chips">${(P.highlights || []).map((h) => `<span class="chip">${esc(h)}</span>`).join("")}</div>
      <ul style="margin:0 0 1.4rem;padding-left:1.2rem;color:var(--muted)">${(P.benefits || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      ${buyBox(P)}</div></div></section>

    <section class="section dark"><div class="wrap"><p class="eyebrow">Benefits</p><h2 style="margin-top:.4rem">Care, rooted in tradition.</h2><div class="cards">
      ${[["🍃", "Helps reduce hair fall", "Made to care for your hair every day."], ["🌱", "Promotes healthy hair growth", "A traditional oil for healthier-looking hair."], ["💧", "Nourishes the scalp", "Herbal oil that nourishes where hair begins."], ["🛡️", "Strengthens hair", "Helps hair feel stronger and look healthier."]].map((b, i) => `<article class="card reveal" style="transition-delay:${i * 100}ms"><div class="ico" style="font-size:1.6rem">${b[0]}</div><h3>${b[1]}</h3><p>${b[2]}</p></article>`).join("")}</div>
      <p style="margin-top:2rem;font-size:.8rem;opacity:.6">Individual results may vary.</p></div></section>

    <section class="section dark" style="padding-top:0"><div class="wrap"><p class="eyebrow">The film</p><h2 style="margin:.4rem 0 2.5rem">Made the Kerala way.</h2>
      <div class="video-wrap">${STORE.settings.video_url ? `<video src="${esc(STORE.settings.video_url)}" controls playsinline preload="metadata" poster="${IMG_BOTTLE}"></video>` : `<div class="film" id="film" role="img" aria-label="Animated sequence of the Jayakesh bottle"><div class="scene" id="scene"></div><span class="note">Handmade in small batches</span></div>`}</div></div></section>

    <section class="section paint-pink"><div class="wrap"><p class="eyebrow">Ingredients &amp; their benefits</p><h2 style="margin-top:.4rem">Pure herbal ingredients.</h2><p class="lead" style="margin-top:1rem">Nine natural ingredients behind Jayakesh. Watch each card turn to reveal what it brings — or tap any card to flip it.</p>${ingCards()}</div></section>

    <section class="section"><div class="wrap"><p class="eyebrow">Why Jayakesh</p><h2 style="margin-top:.4rem">Simple. Honest. Traditional.</h2><div class="cards">
      ${[["✋", "Handmade", "Prepared by hand, in the Kerala tradition."], ["🚫", "No harmful chemicals", "Formulated without harmful chemicals."], ["🥥", "Pure herbal ingredients", "Coconut and herbal ingredients at its heart."], ["✨", "Everyday ritual", "A simple oil ritual for your scalp and hair."]].map((b, i) => `<article class="card light reveal" style="transition-delay:${i * 80}ms"><div class="ico" style="font-size:1.5rem">${b[0]}</div><h3>${b[1]}</h3><p>${b[2]}</p></article>`).join("")}</div></div></section>

    <section class="section" style="background:var(--cream-2)"><div class="wrap" style="max-width:860px"><p class="eyebrow">Customer reviews</p><h2 style="margin:.4rem 0 2rem">In their words.</h2><div id="reviewsHost">${reviewsHtml()}</div></div></section>`;
  },

  shop: () => {
    const cards = STORE.products
      .map((p) => {
        if (p.coming_soon) {
          return `<article class="pcard soon" aria-label="${esc(p.name)}, coming soon">
            <div class="pimg"><img src="${esc(p.image || IMG_BOTTLE)}" alt="" style="filter:blur(9px) saturate(.7) hue-rotate(${Number(p.hue_shift || 40)}deg);opacity:.75"><span class="soon-badge">Coming soon</span></div>
            <div class="pbody"><span class="skel" style="width:70%"></span><span class="skel" style="width:42%"></span><span class="btn btn-dark btn-sm" aria-disabled="true" style="opacity:.45;pointer-events:none">Coming soon</span></div>
          </article>`;
        }
        return `<article class="pcard">
          <a href="#/product?id=${encodeURIComponent(p.id)}" class="pimg" aria-label="View ${esc(p.name)}"><img src="${esc(p.image || IMG_BOTTLE)}" alt="${esc(p.name)} ${esc(p.size)}" width="887" height="1774"></a>
          <div class="pbody">
            <div>
              <h2 style="font-size:1.65rem"><a href="#/product?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h2>
              <p style="color:var(--muted);margin-top:.25rem">${esc(p.size)} · <strong style="color:var(--rose-deep)">${money(p.price)}</strong> ${p.compare_price && p.compare_price > p.price ? `<span style="text-decoration:line-through;font-size:.85rem">${money(p.compare_price)}</span>` : ""}</p>
            </div>
            <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem">
              <button type="button" class="btn btn-dark btn-sm" data-add-prod="${esc(p.id)}" ${p.stock <= 0 ? "disabled" : ""}>${p.stock <= 0 ? "Out of Stock" : "Add to Cart"}</button>
              <a class="btn btn-ghost btn-sm" href="#/product?id=${encodeURIComponent(p.id)}">Details</a>
            </div>
          </div>
        </article>`;
      })
      .join("");
    return (
      head("Shop", "Our products", "Handmade Kerala hair oil made with pure herbal ingredients.") +
      `<section class="section"><div class="wrap pgrid">${cards}</div></section>`
    );
  },

  product: () => {
    const id = getQueryParams().get("id");
    const P = id ? findProduct(id) : mainProduct();
    return (
      head(P.size, P.name, P.subtitle || "Handmade Kerala hair oil made with pure herbal ingredients.") +
      `<section class="section"><div class="wrap showcase">
        <div class="pic"><img src="${esc(P.image || IMG_BOTTLE)}" alt="${esc(P.name)} ${esc(P.size)} bottle" width="887" height="1774"></div>
        <div>
          <p class="lead" style="margin-bottom:1rem">${esc(P.description)}</p>
          ${(P.benefits || []).length ? `<h2 style="font-size:1.6rem;margin:1.4rem 0 .5rem">Benefits</h2><ul style="padding-left:1.2rem;color:var(--muted);margin:0">${P.benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
          <h2 style="font-size:1.6rem;margin:1.4rem 0 .5rem">What it is</h2>
          <div class="chips">${(P.highlights || []).map((h) => `<span class="chip">${esc(h)}</span>`).join("")}</div>
          <h2 style="font-size:1.6rem;margin:1.4rem 0 .5rem">Key Herbal Ingredients</h2>
          <ul style="padding-left:1.2rem;color:var(--muted);margin:0;columns:2">${INGREDIENTS.map((g) => `<li>${esc(g.name)}</li>`).join("")}</ul>
          <div style="margin-top:1.6rem">${buyBox(P)}</div>
          <p style="margin-top:1.2rem;font-size:.8rem;color:var(--muted)">Do a patch test before first use. Individual results may vary.</p>
        </div>
      </div></section>
      <section class="section" style="background:var(--cream-2)"><div class="wrap" style="max-width:860px"><p class="eyebrow">Customer reviews</p><h2 style="margin:.4rem 0 2rem">Verified feedback.</h2><div id="reviewsHost">${reviewsHtml()}</div></div></section>`
    );
  },

  ingredients: () =>
    head("Ingredients", "Pure herbal ingredients", "Handmade, with no harmful chemicals. Tap any card to flip it.") +
    `<section class="section paint-pink" style="padding-top:3rem"><div class="wrap">${ingCards()}</div></section>`,

  about: () => {
    const s = [
      ["Our story", "Born from Kerala's hair-care tradition.", "Jayakesh Kerala Hair Oil follows the tradition of herbal hair oils from Kerala, prepared by hand in small batches."],
      ["Our mission", "Honest herbal care.", "To offer an authentic hair oil made with pure herbal ingredients and zero harmful chemicals."],
      ["Our vision", "Tradition that lasts.", "To keep a time-honoured way of caring for hair and scalp alive, one bottle at a time."],
      ["Product development", "Handmade, start to finish.", "Every bottle of Jayakesh is slowly infused with coconut oil and whole botanicals at its heart."],
      ["Commitment to quality", "Pure by intention.", "Pure herbal ingredients, no mineral oil or synthetic parabens, and complete transparency on our label."],
    ];
    return (
      head("About us", "Legacy in every drop", "Jayakesh is a Kerala hair oil, handmade with pure herbal ingredients.") +
      `<section class="section"><div class="wrap split"><p class="statement reveal">“A hair oil made the way it has always been made: by hand, from pure herbal ingredients, with no harmful chemicals.”</p><div class="reveal" style="background:radial-gradient(circle at 50% 45%,#fff,var(--cream-2));border-radius:32px;padding:2rem;display:grid;place-items:center"><img src="${IMG_BOTTLE}" alt="Jayakesh bottle" width="887" height="1774" style="height:440px;width:auto;filter:drop-shadow(0 30px 30px rgba(10,52,22,.3))"></div></div></section>` +
      `<section class="section paint-pink" aria-labelledby="founders"><div class="wrap"><p class="eyebrow">The founders</p><h2 id="founders" style="margin:.4rem 0 3.5rem">Two founders. <span class="gold">One legacy.</span></h2><div class="founders">${FOUNDERS.map(founderHtml).join("")}</div></div></section>` +
      s.map((x, i) => `<section class="section ${i % 2 ? "dark" : ""}" style="padding:clamp(3.5rem,8vw,6rem) 0"><div class="wrap split"><div class="reveal"><p class="eyebrow">${x[0]}</p><h2 style="margin-top:.4rem">${x[1]}</h2></div><p class="lead reveal">${x[2]}</p></div></section>`).join("") +
      `<section class="section" style="background:var(--cream-2)"><div class="wrap"><p class="eyebrow">Brand values</p><div class="cards">${["Tradition", "Purity", "Craftsmanship", "Honesty"].map((v) => `<div class="card light reveal"><h3>${v}</h3></div>`).join("")}</div></div></section>`
    );
  },

  contact: () => {
    const S = STORE.settings;
    const igBtn = S.instagram
      ? `<a class="btn btn-ghost" href="${esc(S.instagram)}" target="_blank" rel="noopener noreferrer">${IG_ICON} Instagram</a>`
      : "";
    return (
      head("Contact", "We'd love to hear from you", "Send us a message directly — you'll get an instant confirmation email — or chat with us on WhatsApp.") +
      `<section class="section"><div class="wrap checkout">
        <form class="form" id="contactForm" novalidate>
          ${field("name", "Your Name *", "input", 'autocomplete="name" required')}
          <div class="two">
            ${field("email", "Email Address *", "input", 'type="email" autocomplete="email" required')}
            ${field("phone", "Phone Number *", "input", 'type="tel" autocomplete="tel" required')}
          </div>
          ${field("subject", "Subject *", "input", 'placeholder="Order question, wholesale inquiry, feedback..." required')}
          ${field("message", "Message *", "textarea", 'rows="5" required')}
          <div class="row-actions" style="margin-top:.2rem">
            <button type="submit" class="btn btn-primary" id="contactSendBtn">Send Message</button>
            <a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="${esc(waLink(inquiry()))}">${WA_ICON} Chat on WhatsApp</a>
          </div>
          <p id="formMsg"></p>
        </form>
        <aside class="summary" style="position:static">
          <h2 style="font-size:1.8rem;margin-bottom:1rem">Direct Support</h2>
          <div style="display:grid;gap:.85rem;font-size:.96rem">
            ${S.phone ? `<a href="${tel(S.phone)}">📞 <strong>${esc(S.phone)}</strong></a>` : ""}
            ${S.support_email ? `<a href="mailto:${esc(S.support_email)}">✉️ <strong>${esc(S.support_email)}</strong></a>` : ""}
            ${S.address ? `<p>📍 ${esc(S.address)}</p>` : ""}
            <hr style="border:0;border-top:1px solid rgba(16,32,15,.1);margin:.4rem 0">
            <p style="font-size:.86rem;color:var(--muted)">Already placed an order? Check live dispatch status anytime:</p>
            <a class="btn btn-dark btn-sm" href="#/track">Track an Order</a>
            ${igBtn}
          </div>
        </aside>
      </div></section>`
    );
  },

  cart: () => {
    if (!cartCount()) {
      return (
        head("Cart", "Your cart") +
        '<section class="section"><div class="wrap" style="max-width:760px"><div class="empty"><p>Your cart is currently empty.</p><a class="btn btn-primary" style="margin-top:1rem" href="#/shop">Browse Products</a></div></div></section>'
      );
    }
    const t = computeTotals("cod");
    return (
      head("Cart", "Your cart") +
      `<section class="section"><div class="wrap" style="max-width:860px">
        <div class="summary" style="position:static">
          <div id="cartPageLines">${renderCartLines()}</div>
          <div class="totals-list">
            <div class="row"><span>Subtotal</span><strong>${money(t.subtotal)}</strong></div>
            <div class="row"><span>Estimated Shipping</span><span>${t.shipping === 0 ? '<strong style="color:#155c1e">FREE</strong>' : money(t.shipping)}</span></div>
            <div class="row grand"><span>Estimated Total</span><span>${money(t.subtotal + t.shipping)}</span></div>
          </div>
          <div class="row-actions" style="margin-top:1.5rem">
            <a class="btn btn-primary" href="#/checkout">Proceed to Checkout</a>
            <a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="${esc(waLink(orderMsg(cart)))}">${WA_ICON} Order on WhatsApp</a>
          </div>
        </div>
      </div></section>`
    );
  },

  checkout: () => {
    if (!cartCount()) {
      return (
        head("Checkout", "Delivery details") +
        '<section class="section"><div class="wrap"><div class="empty"><p>Your cart is empty.</p><a class="btn btn-primary" style="margin-top:1rem" href="#/shop">Shop Now</a></div></div></section>'
      );
    }
    const S = STORE.settings;
    const defaultPay = S.cod_enabled ? "cod" : "upi";
    const t = computeTotals(defaultPay);
    const stateOptions = INDIAN_STATES.map(
      (st) => `<option value="${esc(st)}"${st === "Kerala" ? " selected" : ""}>${esc(st)}</option>`
    ).join("");

    return (
      head("Checkout", "Secure Checkout", "Instant email order confirmation & live shipment tracking.") +
      `<section class="section"><div class="wrap"><div class="checkout">
        <form class="form" id="orderForm" novalidate>
          <h2 style="font-size:1.75rem">1. Delivery Address</h2>
          ${field("name", "Full Name *", "input", 'autocomplete="name" placeholder="Enter recipient full name" required')}
          <div class="two">
            ${field("phone", "10-Digit Mobile Number *", "input", 'type="tel" inputmode="tel" autocomplete="tel" placeholder="+91 98765 43210" required')}
            ${field("email", "Email Address (for Confirmation & Tracking) *", "input", 'type="email" autocomplete="email" placeholder="you@example.com" required')}
          </div>
          ${field("address", "House / Flat / Street Address *", "textarea", 'rows="2" autocomplete="street-address" placeholder="House name/no, street, locality" required')}
          ${field("landmark", "Landmark (Optional)", "input", 'placeholder="Near temple, school, post office..."')}
          <div class="two">
            ${field("city", "City / Town *", "input", 'autocomplete="address-level2" required')}
            ${field("state", "State *", "select", "required", stateOptions)}
          </div>
          <div class="two">
            ${field("pincode", "6-Digit PIN Code *", "input", 'inputmode="numeric" maxlength="6" autocomplete="postal-code" placeholder="682001" required')}
            ${field("notes", "Delivery Notes (Optional)", "input", 'placeholder="Preferred delivery timing, instructions..."')}
          </div>

          <h2 style="font-size:1.75rem;margin-top:.8rem">2. Payment Method</h2>
          <div class="pay-methods" id="payMethods">
            ${
              S.cod_enabled
                ? `<label class="pay-opt ${defaultPay === "cod" ? "active" : ""}">
                    <input type="radio" name="payment_method" value="cod" ${defaultPay === "cod" ? "checked" : ""}>
                    <div>
                      <strong>Cash on Delivery (COD)</strong>
                      <div style="font-size:.85rem;color:var(--muted)">Pay safely by cash or UPI at your doorstep when your bottle arrives.${S.cod_fee > 0 ? ` (+₹${S.cod_fee} COD handling)` : " No extra COD fee."}</div>
                    </div>
                  </label>`
                : ""
            }
            ${
              S.upi_enabled
                ? `<label class="pay-opt ${defaultPay === "upi" ? "active" : ""}">
                    <input type="radio" name="payment_method" value="upi" ${defaultPay === "upi" ? "checked" : ""}>
                    <div>
                      <strong>Pay via UPI QR / GPay / PhonePe / Paytm</strong>
                      <div style="font-size:.85rem;color:var(--muted)">Scan our official UPI QR code for zero-fee instant payment & priority dispatch.</div>
                    </div>
                  </label>`
                : ""
            }
          </div>

          <div class="upi-box ${defaultPay === "upi" ? "" : "hidden"}" id="upiCheckoutBox">
            <div id="upiQrPreview"><p style="font-size:.9rem;color:var(--muted)">Loading UPI QR details...</p></div>
            <div class="field" style="text-align:left;margin-top:.9rem">
              <label for="upi_utr">12-Digit UPI UTR / Reference No. (Optional now — can also add after placing order)</label>
              <input id="upi_utr" name="upi_utr" placeholder="e.g. 431512345678" maxlength="30">
            </div>
          </div>

          <button type="submit" class="btn btn-primary" id="placeOrderBtn" style="margin-top:.6rem;width:100%;font-size:.85rem">
            Place Order · <span id="btnTotalText">${money(t.total)}</span>
          </button>
          <p id="formMsg"></p>
        </form>

        <aside class="summary">
          <h2 style="font-size:1.6rem;margin-bottom:.5rem">Order Summary</h2>
          <div id="checkoutLines">${renderCartLines()}</div>

          <div class="coupon-row">
            <input type="text" id="couponInput" placeholder="Promo code (e.g. WELCOME10)" value="${esc(appliedCoupon?.code || "")}">
            <button type="button" class="btn btn-dark btn-sm" id="applyCouponBtn">${appliedCoupon ? "Update" : "Apply"}</button>
          </div>
          <p id="couponFeedback" style="font-size:.82rem;color:${appliedCoupon ? "#155c1e" : "var(--muted)"}">${esc(appliedCoupon?.message || "")}</p>

          <div class="totals-list" id="checkoutTotals">
            <div class="row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
            ${t.discount > 0 ? `<div class="row" style="color:#155c1e"><span>Discount (${esc(appliedCoupon.code)})</span><span>−${money(t.discount)}</span></div>` : ""}
            <div class="row"><span>Shipping</span><span>${t.shipping === 0 ? '<strong style="color:#155c1e">FREE</strong>' : money(t.shipping)}</span></div>
            ${t.codFee > 0 ? `<div class="row"><span>COD Fee</span><span>${money(t.codFee)}</span></div>` : ""}
            <div class="row grand"><span>Total Payable</span><span>${money(t.total)}</span></div>
          </div>
        </aside>
      </div></div></section>`
    );
  },

  "order-success": () => {
    const params = getQueryParams();
    const ordNum = params.get("order") || lastPlacedOrder?.order_number || "";
    const phone = params.get("phone") || lastPlacedOrder?.customer_phone || "";
    return (
      head("Order Confirmed", `Thank you!`, `Your Jayakesh order ${ordNum ? "#" + esc(ordNum) : ""} has been placed.`) +
      `<section class="section"><div class="wrap" style="max-width:780px">
        <div class="tracker-card" id="orderSuccessCard" data-order="${esc(ordNum)}" data-phone="${esc(phone)}">
          <p style="color:var(--muted)">Loading your confirmed order receipt...</p>
        </div>
      </div></section>`
    );
  },

  track: () => {
    const params = getQueryParams();
    const ordNum = params.get("order") || "";
    const contact = params.get("phone") || params.get("contact") || "";
    return (
      head("Track Order", "Live Order Status", "Enter your Order ID and phone number or email to view real-time preparation & courier updates.") +
      `<section class="section"><div class="wrap" style="max-width:820px">
        <div class="tracker-card">
          <form class="form" id="trackForm" style="grid-template-columns:1fr 1fr auto;align-items:end;gap:.9rem">
            <div class="field"><label for="trkOrder">Order ID *</label><input id="trkOrder" name="order" placeholder="e.g. JK-261111-A1B2" value="${esc(ordNum)}" required></div>
            <div class="field"><label for="trkContact">Phone Number or Email *</label><input id="trkContact" name="contact" placeholder="Mobile or Email used at checkout" value="${esc(contact)}" required></div>
            <button type="submit" class="btn btn-primary" style="height:48px">Track</button>
          </form>
          <style>@media(max-width:720px){#trackForm{grid-template-columns:1fr!important}}</style>
          <div id="trackResult" style="margin-top:1.6rem"></div>
        </div>
      </div></section>`
    );
  },

  privacy: () => {
    const S = STORE.settings;
    return (
      head("Legal", "Privacy Policy") +
      `<section class="section"><div class="wrap prose">
        <p><strong>Effective Date:</strong> January 1, 2026 &middot; <strong>Brand:</strong> ${esc(S.store_name)}</p>
        <h2>1. Information We Collect</h2>
        <p>When you place an order, track a shipment, submit a review, or contact us on ${esc(S.store_name)}, we collect only the details necessary to fulfil your request: your full name, delivery address, PIN code, mobile number, email address, order items, and payment reference (such as a UPI UTR reference number if you pay via UPI).</p>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To process, hand-pack, and deliver your Jayakesh Kerala Hair Oil orders across India.</li>
          <li>To send transactional Order Confirmation, Invoice, and Shipment Tracking emails/updates.</li>
          <li>To respond to customer support inquiries and verify authentic buyer reviews.</li>
        </ul>
        <h2>3. Data Sharing & Security</h2>
        <p>We <strong>never sell or rent</strong> your personal data. Your shipping name, address, and mobile number are shared strictly with our logistics/courier partners solely for delivering your parcel, and with transactional email infrastructure to deliver your receipts.</p>
        <h2>4. Cookies & Local Storage</h2>
        <p>We use browser local storage to keep your shopping cart saved on your device between visits. No invasive third-party ad-tracking cookies are used.</p>
        <h2>5. Contact & Data Requests</h2>
        <p>To request access, correction, or deletion of your personal records, write to us at <a href="mailto:${esc(S.support_email)}" style="text-decoration:underline">${esc(S.support_email)}</a> or call ${esc(S.phone)}.</p>
      </div></section>`
    );
  },

  terms: () => {
    const S = STORE.settings;
    return (
      head("Legal", "Terms & Conditions") +
      `<section class="section"><div class="wrap prose">
        <h2>1. Overview</h2>
        <p>Welcome to <strong>${esc(S.store_name)}</strong>. By accessing this website or placing an order, you agree to be bound by these Terms &amp; Conditions.</p>
        <h2>2. Products & Usage Disclaimer</h2>
        <p>Jayakesh Kerala Hair Oil is a traditional, handmade herbal hair-care oil crafted from natural botanical ingredients. As with any natural herbal formulation, individual results vary. Customers are advised to perform a small patch test prior to full application and discontinue use if any sensitivity occurs.</p>
        <h2>3. Pricing & Order Acceptance</h2>
        <p>All prices are listed in Indian Rupees (INR / ₹) inclusive of applicable taxes unless stated otherwise. Shipping charges are clearly displayed prior to order placement. We reserve the right to verify Cash on Delivery (COD) orders via phone, email, or WhatsApp prior to dispatch to prevent fraudulent/unclaimed shipments.</p>
        <h2>4. Payments</h2>
        <p>We accept Cash on Delivery (COD) and direct UPI QR payments. For UPI QR orders, orders move to priority dispatch upon verification of the UPI transaction reference (UTR).</p>
        <h2>5. Intellectual Property</h2>
        <p>All brand names, artwork, photography, bottle designs, and copy on this website are the property of Jayakesh and may not be reproduced without written permission.</p>
      </div></section>`
    );
  },

  shipping: () => {
    const S = STORE.settings;
    return (
      head("Legal", "Shipping, Cancellations & Returns") +
      `<section class="section"><div class="wrap prose">
        <h2>1. Pan-India Shipping & Timelines</h2>
        <p>Every order of Jayakesh Kerala Hair Oil is freshly packed and dispatched within <strong>24–48 business hours</strong>. Standard delivery takes <strong>2–4 business days within Kerala &amp; South India</strong>, and <strong>4–7 business days across the rest of India</strong>.</p>
        <p>Standard shipping is ${money(S.shipping_fee)}${S.free_shipping_min > 0 ? `, and <strong>FREE on orders of ${money(S.free_shipping_min)} or above</strong>` : ""}. Once shipped, you will receive an email with your Courier Partner and AWB Tracking Number, and can track live status on our <a href="#/track" style="text-decoration:underline">Track Order</a> page.</p>
        <h2>2. Order Cancellations</h2>
        <p>You may cancel an order free of charge anytime <strong>before it has been dispatched</strong> by contacting us via our Contact page or WhatsApp (${esc(S.phone)}) with your Order ID.</p>
        <h2>3. Damaged or Incorrect Items (100% Replacement Guarantee)</h2>
        <p>Because hair oil is a personal-care hygiene product, opened or used bottles cannot be returned. However, if your bottle arrives <strong>leaking, damaged in transit, or incorrect</strong>, please share an unboxing photo/video within <strong>48 hours of delivery</strong> on WhatsApp (${esc(S.phone)}) or <a href="mailto:${esc(S.support_email)}" style="text-decoration:underline">${esc(S.support_email)}</a>, and we will ship a free replacement or issue a full refund immediately.</p>
      </div></section>`
    );
  },

  notfound: () =>
    head("404", "Page not found") +
    '<section class="section"><div class="wrap"><a class="btn btn-dark" href="#/">Back to home</a></div></section>',
};

const titles = {
  home: "Jayakesh Kerala Hair Oil | Handmade Herbal Hair Oil",
  shop: "Shop Kerala Hair Oil | Jayakesh",
  product: "Jayakesh Kerala Hair Oil | Product Details",
  ingredients: "9 Pure Herbal Ingredients | Jayakesh",
  about: "About Jayakesh | Two Founders, One Legacy",
  contact: "Contact Us | Jayakesh",
  cart: "Your Cart | Jayakesh",
  checkout: "Secure Checkout | Jayakesh",
  "order-success": "Order Confirmed | Jayakesh",
  track: "Track Your Order | Jayakesh",
  privacy: "Privacy Policy | Jayakesh",
  terms: "Terms & Conditions | Jayakesh",
  shipping: "Shipping & Returns | Jayakesh",
  notfound: "Page Not Found | Jayakesh",
};

/* ---------- Router & Motion ---------- */
const route = () => {
  const n = (location.hash.replace(/^#\/?/, "") || "home").split("?")[0];
  return { name: views[n] ? n : "notfound" };
};

let sceneTimer;
let ingTimers = [];
let ingObs;
let pxEls = [];

function onScroll() {
  $("#header").classList.toggle("solid", scrollY > 40);
  const h = document.documentElement.scrollHeight - innerHeight;
  $("#progress").style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
  if (reduce) return;
  const vh = innerHeight;
  pxEls.forEach((el) => {
    if (!el.parentElement) return;
    const r = el.parentElement.getBoundingClientRect();
    el.style.setProperty("--py", ((r.top + r.height / 2 - vh / 2) * +el.dataset.px).toFixed(1) + "px");
  });
}

function splitWords(el) {
  let n = 0;
  el.setAttribute("aria-label", el.textContent.trim());
  const walk = (node) =>
    [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const w = document.createElement("span");
          const s = document.createElement("span");
          w.className = "w";
          w.setAttribute("aria-hidden", "true");
          s.textContent = t;
          s.style.setProperty("--i", n++);
          w.appendChild(s);
          frag.appendChild(w);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1) walk(c);
    });
  walk(el);
  el.classList.add("sw");
}

function initMotion(io) {
  $$("main h2, .page-head h1").forEach((h) => {
    splitWords(h);
    if (reduce) h.classList.add("in");
    else io.observe(h);
  });
  pxEls = $$("[data-px]");
  onScroll();
  if (reduce || !matchMedia("(hover: hover)").matches) return;
  $$(".pcard:not(.soon), .showcase .pic, .card").forEach((el) => {
    el.classList.add("tilt");
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 10 + "deg");
      el.style.setProperty("--rx", -((e.clientY - r.top) / r.height - 0.5) * 10 + "deg");
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
    });
  });
}

function renderOrderTimelineBlock(order, upi, isSuccessBanner = false) {
  const steps = [
    { key: "placed", label: "Order Placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "packed", label: "Hand-Packed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];
  const curIdx = steps.findIndex((s) => s.key === order.order_status);
  const isCancelled = order.order_status === "cancelled";

  const stepsHtml = isCancelled
    ? `<div class="alert bad" style="margin:1.4rem 0">This order was marked as <strong>Cancelled</strong>. Contact support if you need assistance.</div>`
    : `<div class="steps-bar">
        ${steps
          .map((st, idx) => {
            const cls = idx < curIdx ? "done" : idx === curIdx ? "current" : "";
            return `<div class="step-node ${cls}">
              <div class="step-dot">${idx < curIdx ? "✓" : idx + 1}</div>
              <div class="step-lbl">${st.label}</div>
            </div>`;
          })
          .join("")}
      </div>`;

  const upiPendingHtml =
    order.payment_method === "upi" && order.payment_status !== "paid"
      ? `<div class="upi-box" style="margin:1.4rem 0">
          <strong style="color:var(--green-900);font-size:1.05rem">Complete Your UPI Payment (${money(order.total)})</strong>
          ${
            upi && upi.configured
              ? `<div class="upi-qr-svg">${upi.qrSvg}</div>
                 <div style="font-size:.86rem;margin-bottom:.6rem">UPI ID: <strong>${esc(upi.upiId)}</strong> <button type="button" class="btn btn-ghost btn-sm" style="padding:.25rem .7rem;min-height:30px;margin-left:.3rem" data-copy="${esc(upi.upiId)}">Copy</button></div>
                 <a class="btn btn-primary btn-sm" href="${esc(upi.uri)}">Open UPI App to Pay ${money(order.total)}</a>`
              : `<p style="font-size:.88rem;color:var(--muted);margin:.5rem 0">Our team has sent payment details to your email, or tap WhatsApp below to pay via UPI.</p>`
          }
          <form id="utrUpdateForm" data-ord="${esc(order.order_number)}" data-ph="${esc(order.customer_phone)}" style="display:flex;gap:.5rem;max-width:420px;margin:1rem auto 0">
            <input name="upi_utr" placeholder="Enter 12-digit UPI UTR Ref" value="${esc(order.upi_utr || "")}" style="flex:1;padding:.65rem .9rem;border-radius:12px;border:1px solid rgba(16,32,15,.22);font:inherit" required>
            <button type="submit" class="btn btn-dark btn-sm">${order.upi_utr ? "Update UTR" : "Submit UTR"}</button>
          </form>
          <p id="utrMsg" style="font-size:.82rem;margin-top:.4rem;color:#155c1e">${order.upi_utr ? `✓ UTR Reference <strong>${esc(order.upi_utr)}</strong> recorded (verification in progress)` : ""}</p>
        </div>`
      : "";

  const shipmentBox =
    order.courier_name || order.tracking_number
      ? `<div class="alert ok" style="margin:1.2rem 0">
          <strong>🚚 Shipment Details:</strong> ${esc(order.courier_name || "Courier")} ${order.tracking_number ? `&middot; AWB / Tracking No: <strong>${esc(order.tracking_number)}</strong>` : ""}
          ${order.tracking_url ? `<div style="margin-top:.6rem"><a class="btn btn-dark btn-sm" href="${esc(order.tracking_url)}" target="_blank" rel="noopener noreferrer">Track Courier Live ↗</a></div>` : ""}
        </div>`
      : "";

  const waShareMsg = [
    `Hello Jayakesh! I placed Order *${order.order_number}* on the website.`,
    `Items: ${(order.items || []).map((i) => `${i.name} (${i.size}) × ${i.qty}`).join(", ")}`,
    `Total: ${money(order.total)} (${order.payment_method.toUpperCase()})`,
    order.upi_utr ? `UPI UTR: ${order.upi_utr}` : "",
    `City: ${order.city}, ${order.state} - ${order.pincode}`,
  ]
    .filter(Boolean)
    .join("\n");

  const invoiceHref = `/invoice?order=${encodeURIComponent(order.order_number)}&phone=${encodeURIComponent(order.customer_phone)}`;

  return `
    ${
      isSuccessBanner
        ? `<div class="alert ok" style="margin-bottom:1.4rem">
            <strong>Order #${esc(order.order_number)} is confirmed!</strong> We have sent an order confirmation email to <strong>${esc(order.customer_email)}</strong>.
          </div>`
        : ""
    }
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;padding-bottom:1rem;border-bottom:1px solid rgba(16,32,15,.1)">
      <div>
        <div style="font-size:.75rem;text-transform:uppercase;letter-spacing:.15em;color:var(--rose-deep);font-weight:700">Order Reference</div>
        <h3 style="font-size:2rem;color:var(--green-900)">${esc(order.order_number)}</h3>
        <div style="font-size:.86rem;color:var(--muted)">Placed on ${new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
      </div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <a class="btn btn-ghost btn-sm" href="${esc(invoiceHref)}" target="_blank" rel="noopener">🧾 Print / Download Invoice</a>
        <a class="btn btn-wa btn-sm" href="${esc(waLink(waShareMsg))}" target="_blank" rel="noopener noreferrer">${WA_ICON} WhatsApp Support</a>
      </div>
    </div>

    ${stepsHtml}
    ${shipmentBox}
    ${upiPendingHtml}

    <div class="two" style="margin-top:1.4rem;align-items:start">
      <div style="background:var(--cream);padding:1.2rem;border-radius:18px">
        <h4 style="margin:0 0 .5rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.14em;color:var(--green-800)">Delivery Address</h4>
        <p style="font-size:.93rem">
          <strong>${esc(order.customer_name)}</strong><br>
          ${esc(order.address_line)}${order.landmark ? `, ${esc(order.landmark)}` : ""}<br>
          ${esc(order.city)}, ${esc(order.state)} — <strong>${esc(order.pincode)}</strong><br>
          📞 ${esc(order.customer_phone)}
        </p>
      </div>
      <div style="background:var(--cream);padding:1.2rem;border-radius:18px">
        <h4 style="margin:0 0 .5rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.14em;color:var(--green-800)">Order Summary (${esc(order.payment_method.toUpperCase())})</h4>
        ${(order.items || [])
          .map(
            (it) => `<div style="display:flex;justify-content:space-between;font-size:.92rem;margin-bottom:.35rem">
              <span>${esc(it.name)} (${esc(it.size)}) × ${it.qty}</span>
              <strong>${money(it.price * it.qty)}</strong>
            </div>`
          )
          .join("")}
        ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:.88rem;color:#155c1e"><span>Discount</span><span>−${money(order.discount)}</span></div>` : ""}
        <div style="display:flex;justify-content:space-between;font-size:.88rem;color:var(--muted)"><span>Shipping</span><span>${order.shipping_fee === 0 ? "FREE" : money(order.shipping_fee)}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:800;margin-top:.45rem;padding-top:.45rem;border-top:1px solid rgba(16,32,15,.1)"><span>Total</span><span>${money(order.total)}</span></div>
      </div>
    </div>

    ${
      (order.timeline || []).length
        ? `<div style="margin-top:1.5rem">
            <h4 style="margin:0 0 .7rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.14em;color:var(--green-800)">Activity Log</h4>
            <div style="display:grid;gap:.55rem">
              ${order.timeline
                .slice()
                .reverse()
                .map(
                  (ev) => `<div style="display:flex;justify-content:space-between;gap:1rem;font-size:.88rem;padding:.55rem .8rem;background:var(--cream);border-radius:10px">
                    <div><strong>${esc(ev.label)}</strong>${ev.note ? ` — <span style="color:var(--muted)">${esc(ev.note)}</span>` : ""}</div>
                    <span style="color:var(--muted);white-space:nowrap;font-size:.8rem">${new Date(ev.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>`
                )
                .join("")}
            </div>
          </div>`
        : ""
    }
  `;
}

function bindUtrAndCopy(container) {
  $$("[data-copy]", container).forEach((btn) => {
    btn.onclick = () => {
      navigator.clipboard?.writeText(btn.dataset.copy);
      showToast("UPI ID copied!");
    };
  });
  const utrForm = $("#utrUpdateForm", container);
  if (utrForm) {
    utrForm.onsubmit = async (e) => {
      e.preventDefault();
      const utr = new FormData(utrForm).get("upi_utr");
      const msgEl = $("#utrMsg", container);
      msgEl.textContent = "Saving UTR...";
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(utrForm.dataset.ord)}/utr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ upi_utr: utr, phone: utrForm.dataset.ph }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save UTR");
        msgEl.innerHTML = `✓ UTR Reference <strong>${esc(data.order.upi_utr)}</strong> saved! Our team has been notified.`;
        showToast("UPI reference submitted!");
      } catch (err) {
        msgEl.style.color = "#b3261e";
        msgEl.textContent = err.message;
      }
    };
  }
}

function bindReviewTriggers() {
  $$("[data-open-review]").forEach((b) => {
    b.onclick = () => {
      $("#rvMsg").textContent = "";
      $("#rvMsg").className = "";
      $("#reviewModal").classList.add("open");
    };
  });
  $$("[data-rv]").forEach((b) => {
    b.onclick = () => {
      const len = STORE.reviews.length;
      if (!len) return;
      ri = (ri + +b.dataset.rv + len) % len;
      const host = $("#reviewsHost");
      if (host) {
        host.innerHTML = reviewsHtml();
        bindReviewTriggers();
      }
    };
  });
}

function initView(name) {
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -80px 0px" }
  );
  $$(".reveal").forEach((el) => (reduce ? el.classList.add("in") : io.observe(el)));

  const ingGrid = $("[data-ing]");
  if (ingGrid) {
    const cards = $$(".ing", ingGrid);
    cards.forEach((c) => {
      c.addEventListener("click", () => c.setAttribute("aria-pressed", c.classList.toggle("flip")));
      const im = $("img", c);
      if (im)
        im.addEventListener(
          "error",
          () => {
            if (im.dataset.art && ART[im.dataset.art]) im.outerHTML = ART[im.dataset.art];
            else im.remove();
          },
          { once: true }
        );
    });
    ingObs = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        ingObs.disconnect();
        cards.forEach((c, i) =>
          ingTimers.push(
            setTimeout(() => {
              c.classList.add("flip");
              c.setAttribute("aria-pressed", "true");
            }, 2600 + i * 520)
          )
        );
      },
      { threshold: 0.25 }
    );
    ingObs.observe(ingGrid);
  }

  // Product Buy Boxes
  $$("[data-buybox]").forEach((box) => {
    const pid = box.dataset.buybox;
    let qty = 1;
    const out = $("[data-qty]", box);
    const wa = $("[data-wa]", box);
    $$("[data-act]", box).forEach((b) => {
      b.onclick = () => {
        const a = b.dataset.act;
        const p = findProduct(pid);
        if (a === "dec" || a === "inc") {
          qty = Math.max(1, Math.min(20, p.stock || 20, qty + (a === "inc" ? 1 : -1)));
          if (out) out.textContent = qty;
          if (wa) wa.href = waLink(orderMsg([{ id: pid, qty }]));
        }
        if (a === "add") addToCart(pid, qty, true);
        if (a === "buy") {
          cart = [{ id: pid, qty }];
          saveCart();
          location.hash = "#/checkout";
        }
      };
    });
  });

  // Shop quick add
  $$("[data-add-prod]").forEach((b) => {
    b.onclick = () => addToCart(b.dataset.addProd, 1, true);
  });

  // Cart / Checkout line item buttons
  $$(".line-item [data-q]").forEach((b) => {
    b.onclick = () => setItemQty(b.dataset.cid, +b.dataset.q);
  });

  bindReviewTriggers();
  initMotion(io);

  if (name === "home") initHome();
  if (name === "contact") initContactForm();
  if (name === "checkout") initCheckoutForm();
  if (name === "order-success") initOrderSuccess();
  if (name === "track") initTrackPage();
}

function initHome() {
  const stage = $("#stage");
  const bottle = $("#bottle");
  if (!reduce && stage && bottle) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e) => {
      if (!$("#bottle")) return;
      tx = (e.clientX / innerWidth) * 2 - 1;
      ty = (e.clientY / innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      if (!$("#bottle")) { raf = 0; return; }
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      bottle.style.transform = `rotateY(${cx * 16}deg) rotateX(${-cy * 10}deg)`;
      $$("[data-d]", stage).forEach(
        (el) => (el.style.transform = `translate(${cx * +el.dataset.d * -1}px, ${cy * 18}px)`)
      );
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener("pointermove", onMove, { passive: true });
  }

  const scene = $("#scene");
  if (scene) {
    const S = [
      ["Handmade.", "50% 30%", 1.45],
      ["Pure herbal ingredients.", "50% 60%", 1.15],
      ["Legacy in every drop.", "50% 50%", 0.9],
    ];
    let i = 0;
    const show = () => {
      const s = S[i++ % 3];
      scene.style.animation = "none";
      void scene.offsetWidth;
      scene.style.animation = "";
      scene.innerHTML = `<div class="bg" style="position:absolute;inset:0;display:grid;place-items:center;opacity:.55;transform:scale(${s[2]})"><img src="${IMG_BOTTLE}" alt="" style="height:125%;width:auto;object-fit:cover;object-position:${s[1]}"></div><p class="cap">${s[0]}</p>`;
    };
    show();
    if (!reduce) sceneTimer = setInterval(show, 3600);
  }
}

function showFieldErrors(form, errors = {}) {
  $$(".field", form).forEach((f) => {
    const inp = $("input,textarea,select", f);
    const err = $(".err", f);
    if (!inp || !err) return;
    const msg = errors[inp.name] || errors[inp.id] || "";
    err.textContent = msg;
    if (msg) inp.setAttribute("aria-invalid", "true");
    else inp.removeAttribute("aria-invalid");
  });
  const first = $('[aria-invalid="true"]', form);
  if (first) first.focus();
}

function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = $("#contactSendBtn");
    const msg = $("#formMsg");
    showFieldErrors(form, {});
    msg.className = "";
    msg.textContent = "";

    const payload = Object.fromEntries(new FormData(form));
    btn.disabled = true;
    btn.textContent = "Sending...";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) showFieldErrors(form, data.errors);
        throw new Error(data.error || "Could not send message.");
      }
      form.reset();
      msg.className = "alert ok";
      msg.innerHTML = `<strong>Message received!</strong> Ticket <strong>${esc(data.ticket_number)}</strong> has been logged and a confirmation email has been sent to you.`;
    } catch (err) {
      msg.className = "alert bad";
      msg.textContent = err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = "Send Message";
    }
  };
}

async function refreshUpiPreview(amount) {
  const host = $("#upiQrPreview");
  if (!host) return;
  try {
    const res = await fetch(`/api/upi-qr?amount=${encodeURIComponent(amount)}&note=${encodeURIComponent("Jayakesh Order")}`);
    const data = await res.json();
    if (data.configured) {
      host.innerHTML = `
        <strong style="color:var(--green-900)">Scan to Pay ${money(amount)}</strong>
        <div class="upi-qr-svg">${data.qrSvg}</div>
        <div style="font-size:.85rem;margin-bottom:.6rem">UPI ID: <strong>${esc(data.upiId)}</strong></div>
        <a class="btn btn-dark btn-sm" href="${esc(data.uri)}">Open GPay / PhonePe / Paytm</a>
      `;
    } else {
      host.innerHTML = `<p style="font-size:.9rem;color:var(--muted)">Place your order below — our UPI payment QR & details will be shared immediately on confirmation & email.</p>`;
    }
  } catch {
    host.innerHTML = "";
  }
}

function initCheckoutForm() {
  const form = $("#orderForm");
  if (!form) return;

  const getSelectedMethod = () => {
    const r = $('input[name="payment_method"]:checked', form);
    return r ? r.value : "cod";
  };

  const repaintCheckoutSummary = () => {
    const method = getSelectedMethod();
    const t = computeTotals(method);
    const box = $("#upiCheckoutBox");
    if (box) box.classList.toggle("hidden", method !== "upi");
    if (method === "upi") refreshUpiPreview(t.total);

    $$(".pay-opt", form).forEach((lbl) => {
      const inp = $("input", lbl);
      lbl.classList.toggle("active", inp && inp.checked);
    });

    const btnTxt = $("#btnTotalText");
    if (btnTxt) btnTxt.textContent = money(t.total);

    const totalsEl = $("#checkoutTotals");
    if (totalsEl) {
      totalsEl.innerHTML = `
        <div class="row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
        ${t.discount > 0 ? `<div class="row" style="color:#155c1e"><span>Discount (${esc(appliedCoupon.code)})</span><span>−${money(t.discount)}</span></div>` : ""}
        <div class="row"><span>Shipping</span><span>${t.shipping === 0 ? '<strong style="color:#155c1e">FREE</strong>' : money(t.shipping)}</span></div>
        ${t.codFee > 0 ? `<div class="row"><span>COD Fee</span><span>${money(t.codFee)}</span></div>` : ""}
        <div class="row grand"><span>Total Payable</span><span>${money(t.total)}</span></div>
      `;
    }
  };

  $$('input[name="payment_method"]', form).forEach((r) => {
    r.onchange = repaintCheckoutSummary;
  });
  if (getSelectedMethod() === "upi") {
    refreshUpiPreview(computeTotals("upi").total);
  }

  // Coupon Apply
  const applyBtn = $("#applyCouponBtn");
  if (applyBtn) {
    applyBtn.onclick = async () => {
      const code = ($("#couponInput")?.value || "").trim().toUpperCase();
      const fb = $("#couponFeedback");
      if (!code) {
        appliedCoupon = null;
        if (fb) fb.textContent = "";
        repaintCheckoutSummary();
        return;
      }
      applyBtn.disabled = true;
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, subtotal: cartSubtotal() || 0 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid coupon");
        appliedCoupon = data;
        if (fb) {
          fb.style.color = "#155c1e";
          fb.textContent = "✓ " + data.message;
        }
        showToast(data.message);
        repaintCheckoutSummary();
      } catch (err) {
        appliedCoupon = null;
        if (fb) {
          fb.style.color = "#b3261e";
          fb.textContent = err.message;
        }
        repaintCheckoutSummary();
      } finally {
        applyBtn.disabled = false;
      }
    };
  }

  // Submit Order
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = $("#placeOrderBtn");
    const msg = $("#formMsg");
    showFieldErrors(form, {});
    msg.className = "";
    msg.textContent = "";

    const fd = Object.fromEntries(new FormData(form));
    fd.items = cart.map((i) => ({ id: i.id, qty: i.qty }));
    fd.coupon_code = appliedCoupon?.code || "";

    btn.disabled = true;
    const prevHtml = btn.innerHTML;
    btn.textContent = "Placing your order...";

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fd),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) showFieldErrors(form, data.errors);
        throw new Error(data.error || "Could not place order.");
      }

      lastPlacedOrder = data.order;
      lastPlacedUpi = data.upi;
      cart = [];
      appliedCoupon = null;
      saveCart();
      // Refresh store stock quietly
      loadStoreData();
      location.hash = `#/order-success?order=${encodeURIComponent(data.order.order_number)}&phone=${encodeURIComponent(data.order.customer_phone)}`;
    } catch (err) {
      msg.className = "alert bad";
      msg.textContent = err.message;
      btn.disabled = false;
      btn.innerHTML = prevHtml;
    }
  };
}

async function initOrderSuccess() {
  const card = $("#orderSuccessCard");
  if (!card) return;
  const ordNum = card.dataset.order;
  const phone = card.dataset.phone;

  if (lastPlacedOrder && lastPlacedOrder.order_number === ordNum) {
    card.innerHTML = renderOrderTimelineBlock(lastPlacedOrder, lastPlacedUpi, true);
    bindUtrAndCopy(card);
    return;
  }
  if (!ordNum) {
    card.innerHTML = `<p>Order reference missing. <a href="#/track" style="text-decoration:underline">Track an order here</a>.</p>`;
    return;
  }
  try {
    const res = await fetch(`/api/orders/track?order=${encodeURIComponent(ordNum)}&phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load order");
    card.innerHTML = renderOrderTimelineBlock(data.order, data.upi, true);
    bindUtrAndCopy(card);
  } catch (err) {
    card.innerHTML = `<p class="alert bad">${esc(err.message)}</p>`;
  }
}

function initTrackPage() {
  const form = $("#trackForm");
  const out = $("#trackResult");
  if (!form || !out) return;

  const lookup = async (ord, contact) => {
    out.innerHTML = `<p style="color:var(--muted)">Looking up order <strong>${esc(ord)}</strong>...</p>`;
    try {
      const res = await fetch(
        `/api/orders/track?order=${encodeURIComponent(ord)}&contact=${encodeURIComponent(contact)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      out.innerHTML = renderOrderTimelineBlock(data.order, data.upi, false);
      bindUtrAndCopy(out);
    } catch (err) {
      out.innerHTML = `<p class="alert bad">${esc(err.message)}</p>`;
    }
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    lookup(String(fd.get("order") || "").trim(), String(fd.get("contact") || "").trim());
  };

  const initOrd = $("#trkOrder")?.value?.trim();
  const initContact = $("#trkContact")?.value?.trim();
  if (initOrd && initContact) {
    lookup(initOrd, initContact);
  }
}

/* ---------- Review Modal Logic ---------- */
$("#closeReviewModal").onclick = () => $("#reviewModal").classList.remove("open");
$("#reviewModal").addEventListener("click", (e) => {
  if (e.target.id === "reviewModal") $("#reviewModal").classList.remove("open");
});
$$("#starPicker button").forEach((b) => {
  b.onclick = () => {
    const val = +b.dataset.star;
    $("#rvRating").value = val;
    $$("#starPicker button").forEach((s) => s.classList.toggle("active", +s.dataset.star <= val));
  };
});
$("#reviewForm").onsubmit = async (e) => {
  e.preventDefault();
  const btn = $("#rvSubmitBtn");
  const msg = $("#rvMsg");
  const payload = Object.fromEntries(new FormData(e.target));
  btn.disabled = true;
  msg.className = "";
  msg.textContent = "";
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not submit review");
    e.target.reset();
    msg.className = "alert ok";
    msg.textContent = data.message;
    if (data.autoApproved) {
      await loadStoreData();
      const host = $("#reviewsHost");
      if (host) {
        host.innerHTML = reviewsHtml();
        bindReviewTriggers();
      }
    }
  } catch (err) {
    msg.className = "alert bad";
    msg.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
};

/* ---------- Render & Page Curtain ---------- */
function syncGlobalChrome() {
  const S = STORE.settings;
  const tb = $("#topbar");
  if (tb) {
    if (S.announcement_bar && S.announcement_bar.trim()) {
      tb.textContent = S.announcement_bar;
      tb.classList.remove("hidden");
      document.body.classList.add("has-topbar");
    } else {
      tb.classList.add("hidden");
      document.body.classList.remove("has-topbar");
    }
  }
  $("#waFloat").href = waLink(inquiry());
  $("#footContact").innerHTML = `
    <li><a href="${esc(waLink(inquiry()))}" target="_blank" rel="noopener noreferrer">WhatsApp Support</a></li>
    ${S.phone ? `<li><a href="${tel(S.phone)}">${esc(S.phone)}</a></li>` : ""}
    ${S.support_email ? `<li><a href="mailto:${esc(S.support_email)}">${esc(S.support_email)}</a></li>` : ""}
    ${S.instagram ? `<li><a href="${esc(S.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a></li>` : ""}
    ${S.address ? `<li>${esc(S.address)}</li>` : ""}
  `;
}

function render() {
  const { name } = route();
  clearInterval(sceneTimer);
  ingTimers.forEach(clearTimeout);
  ingTimers = [];
  if (ingObs) ingObs.disconnect();

  const appEl = $("#app");
  appEl.innerHTML = `<div class="view">${views[name]()}</div>`;
  document.title = titles[name] || titles.home;
  $$("#nav a").forEach((a) =>
    a.setAttribute(
      "aria-current",
      a.getAttribute("href") === "#/" + (name === "home" ? "" : name) ? "page" : "false"
    )
  );
  initView(name);
}

let navBusy = false;
let navAgain = false;
function go() {
  if (reduce) {
    render();
    scrollTo(0, 0);
    openDrawer(false);
    return;
  }
  if (navBusy) {
    navAgain = true;
    return;
  }
  navBusy = true;
  openDrawer(false);
  const c = $("#curtain");
  const ease = "cubic-bezier(.76,0,.24,1)";
  c.style.display = "grid";
  c.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], {
    duration: 460,
    easing: ease,
    fill: "forwards",
  })
    .finished.then(() => {
      render();
      scrollTo(0, 0);
      return c.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], {
        duration: 560,
        easing: ease,
        fill: "forwards",
      }).finished;
    })
    .then(() => {
      c.getAnimations().forEach((a) => a.cancel());
      c.style.display = "none";
      navBusy = false;
      if (navAgain) {
        navAgain = false;
        render();
        scrollTo(0, 0);
      }
    });
}

async function loadStoreData() {
  try {
    const res = await fetch("/api/store");
    if (!res.ok) return;
    const data = await res.json();
    if (data.settings) STORE.settings = { ...STORE.settings, ...data.settings };
    if (Array.isArray(data.products) && data.products.length) STORE.products = data.products;
    if (Array.isArray(data.reviews)) STORE.reviews = data.reviews;
    syncGlobalChrome();
    paintCart();
  } catch {
    // Offline fallback uses embedded defaults
  }
}

/* ---------- Boot ---------- */
(function boot() {
  $("#yr").textContent = new Date().getFullYear();
  syncGlobalChrome();

  // Intro animation: plays once per browser session so repeat page reloads feel instant
  const L = $("#loader");
  if (L) {
    const seen = sessionStorage.getItem("jk-intro-seen");
    if (seen) {
      L.classList.add("gone");
    } else {
      sessionStorage.setItem("jk-intro-seen", "1");
      const sh = $(".shine", L);
      if (sh) sh.style.webkitMaskImage = sh.style.maskImage = 'url("/assets/logo-rest.png")';
      L.classList.add("go");
      setTimeout(() => L.classList.add("gone"), 4100);
    }
  }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("hashchange", go);

  paintCart();
  render();
  loadStoreData().then(() => {
    // Re-render current view once live prices/settings arrive (if user hasn't started typing in a form)
    const activeTag = document.activeElement?.tagName;
    if (activeTag !== "INPUT" && activeTag !== "TEXTAREA" && activeTag !== "SELECT") {
      render();
    }
  });
})();
