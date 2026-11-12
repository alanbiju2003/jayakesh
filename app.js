/* =====================================================================
   JAYAKESH KERALA HAIR OIL — Pure Frontend Storefront Engine (app.js)
   Zero Backend Server Required · Runs 24/7 on GitHub Pages (jayakesh.in)
   ===================================================================== */

(function () {
  "use strict";

  const CFG = Object.assign(
    {
      storeName: "Jayakesh Kerala Hair Oil",
      tagline: "Legacy in every drop",
      domain: "https://jayakesh.in",
      whatsapp: "917011083799",
      phone: "+91 70110 83799",
      supportEmail: "ashmitthomas2821@gmail.com",
      ownerNotifyEmail: "ashmitthomas2821@gmail.com",
      ccCustomerOnOrder: true,
      web3formsKey: "",
      address: "Kerala, India",
      instagram: "",
      gstNumber: "",
      codEnabled: true,
      upiEnabled: true,
      upiId: "",
      upiPayeeName: "Jayakesh Kerala Hair Oil",
      autoOpenWhatsAppOnOrder: false,
      shippingFee: 49,
      freeShippingMin: 499,
      codFee: 0,
      videoFile: "jayakesh-video.mp4",
      videoSrc: "",
      products: [],
      coupons: {},
      founders: [],
      reviews: []
    },
    window.JAYAKESH_CONFIG || {}
  );

  const IMG = "assets/bottle.png";
  const LOGO_REST = "assets/logo-rest.png";
  const ASSETS = {
    coconut: "assets/coconut.jpg",
    onion: "assets/onion.jpg",
    hibiscus: "assets/hibiscus.jpg",
    kalonji: "assets/kalonji.jpg",
    methi: "assets/methi.jpg",
    tulsi: "assets/tulsi.jpg",
    aloe: "assets/aloe.jpg",
    pepper: "assets/pepper.jpg",
    tea: "assets/tea.jpg"
  };

  const DEFAULT_PRODUCT = {
    id: "jk-200",
    name: "Jayakesh Kerala Hair Oil",
    size: "200 ml",
    price: 399,
    comparePrice: 499,
    inStock: true,
    image: IMG,
    desc: "Jayakesh Kerala Hair Oil is a handmade hair oil crafted in the Kerala tradition with pure natural ingredients and ZERO chemicals.",
    benefits: [
      "Helps reduce hair fall",
      "Promotes healthy hair growth",
      "Nourishes the scalp",
      "Strengthens hair"
    ],
    highlights: ["Handmade", "ZERO chemicals", "Pure natural ingredients"]
  };

  const DEFAULT_FOUNDERS = [
    {
      name: "Ashmit Thomas",
      initials: "AT",
      role: "Founder",
      photo: "founders/ashmit.jpg",
      intro: "Ashmit Thomas is the Founder of Jayakesh, leading the vision to bring authentic handmade Kerala hair oil crafted with pure natural ingredients and ZERO chemicals to every home.",
      story: [],
      quote: ""
    },
    {
      name: "Jaya Shaji",
      initials: "JS",
      role: "Co-Founder",
      photo: "founders/jaya.jpg",
      intro: "Jaya Shaji is the Co-Founder of Jayakesh, rooted in Kerala's traditional handmade hair-oil craft with pure natural ingredients and ZERO chemicals.",
      story: [],
      quote: ""
    },
    {
      name: "Ashmi Thomas",
      initials: "AT",
      role: "Co-Founder",
      photo: "founders/ashmi.jpg",
      intro: "Ashmi Thomas is the Co-Founder of Jayakesh, building and growing the brand together with Ashmit Thomas and Jaya Shaji.",
      story: [],
      quote: ""
    }
  ];

  const PRODUCTS = Array.isArray(CFG.products) && CFG.products.length ? CFG.products : [DEFAULT_PRODUCT];
  const P = PRODUCTS[0];
  const FOUNDERS = Array.isArray(CFG.founders) && CFG.founders.length ? CFG.founders : DEFAULT_FOUNDERS;
  const REVIEWS = Array.isArray(CFG.reviews) ? CFG.reviews.slice() : [];

  const INDIAN_STATES = [
    "Kerala", "Tamil Nadu", "Karnataka", "Maharashtra", "Delhi", "Telangana",
    "Andhra Pradesh", "Gujarat", "West Bengal", "Uttar Pradesh", "Rajasthan",
    "Madhya Pradesh", "Punjab", "Haryana", "Bihar", "Odisha", "Assam", "Goa",
    "Chhattisgarh", "Jharkhand", "Uttarakhand", "Himachal Pradesh", "Tripura",
    "Meghalaya", "Manipur", "Nagaland", "Arunachal Pradesh", "Mizoram", "Sikkim",
    "Chandigarh", "Puducherry", "Jammu & Kashmir", "Ladakh",
    "Andaman & Nicobar Islands", "Dadra & Nagar Haveli and Daman & Diu", "Lakshadweep"
  ];

  /* ---------- 9 Natural Ingredients & Botanical SVG Illustrations ---------- */
  const INGREDIENTS = [
    {
      name: "Coconut Oil",
      img: "@coconut",
      tint: ["#1a3b18", "#071d0c"],
      benefits: [
        "Nourishes and conditions hair deeply.",
        "Helps reduce hair protein loss and breakage.",
        "Helps prevent dryness and improve softness."
      ]
    },
    {
      name: "Onion",
      sub: "Red Onion",
      img: "@onion",
      art: "onion",
      tint: ["#263614", "#09200e"],
      benefits: [
        "Rich in natural sulphur compounds that support strong hair.",
        "Helps nourish hair follicles and invigorate the scalp.",
        "Provides natural antioxidants for healthy-looking hair."
      ]
    },
    {
      name: "Hibiscus",
      img: "@hibiscus",
      tint: ["#163c1d", "#071d0c"],
      benefits: [
        "Helps condition hair and improve manageability.",
        "Contains antioxidants that help protect against oxidative stress.",
        "Traditionally used in Kerala to support lustrous hair."
      ]
    },
    {
      name: "Kalonji",
      sub: "Black Seed",
      img: "@kalonji",
      art: "kalonji",
      tint: ["#12381b", "#061b0b"],
      benefits: [
        "Provides natural antioxidant protection.",
        "Helps condition hair and nourish the scalp.",
        "Contains essential fatty acids that support hair health."
      ]
    },
    {
      name: "Methi",
      sub: "Fenugreek Seeds",
      img: "@methi",
      art: "methi",
      tint: ["#2c3510", "#0a210e"],
      benefits: [
        "Helps condition hair and improve natural shine.",
        "Contains plant compounds with antioxidant properties.",
        "Traditionally used to support scalp and root strength."
      ]
    },
    {
      name: "Tulsi",
      sub: "Holy Basil",
      img: "@tulsi",
      art: "tulsi",
      tint: ["#15421f", "#071e0d"],
      benefits: [
        "Contains natural purifying compounds.",
        "Provides antioxidant protection.",
        "Helps maintain a clean, healthy scalp."
      ]
    },
    {
      name: "Aloe Vera",
      img: "@aloe",
      art: "aloe",
      tint: ["#134422", "#061d0c"],
      benefits: [
        "Helps moisturise and condition hair.",
        "Soothes and hydrates the scalp.",
        "Helps improve hair softness and manageability."
      ]
    },
    {
      name: "Kali Mirch",
      sub: "Black Pepper",
      img: "@pepper",
      art: "pepper",
      tint: ["#243313", "#081f0d"],
      benefits: [
        "Contains natural antioxidant compounds.",
        "Provides naturally occurring plant phytochemicals.",
        "Traditionally used to stimulate and warm the scalp."
      ]
    },
    {
      name: "Tea Leaves",
      img: "@tea",
      art: "tea",
      tint: ["#1b3f19", "#071d0c"],
      benefits: [
        "Rich in natural polyphenols and antioxidants.",
        "Contains catechins and natural caffeine.",
        "Helps protect hair and scalp against oxidative stress."
      ]
    }
  ];

  const sv = (inner, defs = "") => `<svg viewBox="0 0 200 200" aria-hidden="true"><defs>${defs}</defs>${inner}</svg>`;
  const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const ART = {
    onion: sv(
      `<g stroke="#6abf4b" stroke-width="4.5" stroke-linecap="round" fill="none">
        <path d="M88 52C84 32 76 18 68 10"/>
        <path d="M94 50C95 28 97 16 101 8"/>
        <path d="M100 52C106 32 114 20 124 13"/>
      </g>
      <path d="M94 46C60 72 42 100 46 132C50 158 70 172 94 174C118 172 138 158 142 132C146 100 128 72 94 46Z" fill="url(#og)"/>
      <path d="M94 50C74 78 66 106 69 136C71 154 81 167 94 172" stroke="#f3c37a" stroke-width="1.8" opacity=".45" fill="none"/>
      <path d="M94 50C114 78 122 106 119 136C117 154 107 167 94 172" stroke="#f3c37a" stroke-width="1.8" opacity=".45" fill="none"/>
      <path d="M94 52V172" stroke="#f3c37a" stroke-width="1.5" opacity=".35" fill="none"/>
      <g stroke="#d89b28" stroke-width="1.8" stroke-linecap="round">
        <path d="M88 174L83 184"/><path d="M94 175V186"/><path d="M100 174L105 184"/>
      </g>
      <g transform="translate(142 142)">
        <circle cx="0" cy="0" r="32" fill="#f5e6c8" stroke="#9e3b4e" stroke-width="4"/>
        <circle cx="0" cy="0" r="23" fill="none" stroke="#c05668" stroke-width="2.2" opacity=".75"/>
        <circle cx="0" cy="0" r="14" fill="none" stroke="#d89b28" stroke-width="2.2" opacity=".85"/>
        <circle cx="0" cy="0" r="5.5" fill="#f0b840"/>
      </g>`,
      grad("og", "#b84a58", "#6d1d2a")
    ),
    kalonji: sv(
      [[58, 72, 20], [100, 52, -30], [142, 74, 40], [78, 112, -10], [122, 116, 25], [52, 144, 60], [100, 150, -45], [148, 142, 10], [100, 96, 70]]
        .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(2.3)"><path d="M0-9C6-4 6 5 0 9C-6 5-6-4 0-9Z" fill="#1b1d1a" stroke="#d89b28" stroke-width=".45"/><path d="M-1.5-5C1-2 1 2-1.5 5" stroke="#e6b85c" stroke-width=".9" fill="none" stroke-linecap="round"/></g>`)
        .join("")
    ),
    methi: sv(
      [[56, 70, 15], [98, 54, -25], [140, 72, 30], [72, 108, -20], [116, 112, 20], [152, 112, -10], [52, 146, 40], [96, 148, -30], [140, 150, 15]]
        .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(1.9)"><rect x="-9" y="-6" width="18" height="12" rx="5" fill="url(#mg)"/><path d="M-6 0H6" stroke="#7a4c0d" stroke-width="1.6" stroke-linecap="round"/></g>`)
        .join("") +
        `<g fill="#6dc254"><ellipse cx="160" cy="46" rx="16" ry="7" transform="rotate(-35 160 46)"/><ellipse cx="176" cy="66" rx="14" ry="6" transform="rotate(10 176 66)"/><ellipse cx="148" cy="28" rx="12" ry="5.5" transform="rotate(-70 148 28)"/></g>`,
      grad("mg", "#f0b840", "#b0761c")
    ),
    tulsi: sv(
      `<path d="M100 190C98 140 102 96 100 44" stroke="#58b84f" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        [150, 118, 86]
          .map((y) =>
            [1, -1]
              .map((s) => `<g transform="translate(100 ${y}) scale(${s} 1) rotate(-28)"><ellipse cx="34" cy="0" rx="34" ry="14" fill="url(#tg)"/><path d="M4 0H66" stroke="#d8f0b8" stroke-width="1.6" opacity=".85"/></g>`)
              .join("")
          )
          .join("") +
        `<ellipse cx="100" cy="40" rx="11" ry="24" fill="url(#tg)"/><g fill="#f0b840"><circle cx="100" cy="22" r="4"/><circle cx="94" cy="30" r="3"/><circle cx="106" cy="30" r="3"/></g>`,
      grad("tg", "#6cd05e", "#27702f")
    ),
    aloe: sv(
      [[-62, 0.8], [62, 0.8], [-38, 0.95], [38, 0.95], [-16, 1.05], [16, 1.05], [0, 1.1]]
        .map(([a, s]) => `<g transform="translate(100 176) rotate(${a}) scale(${s})"><path d="M0 0C-17-30-15-80 0-124C15-80 17-30 0 0Z" fill="url(#ag2)"/><path d="M0-10V-104" stroke="#d9f2be" stroke-width="2" opacity=".6"/><g fill="#f0b840" opacity=".8"><circle cx="-4" cy="-40" r="1.6"/><circle cx="4" cy="-62" r="1.6"/><circle cx="-3" cy="-84" r="1.4"/></g></g>`)
        .join("") + `<path d="M166 138C156 156 154 164 166 169C178 164 176 156 166 138Z" fill="#f0b840" stroke="#d89b28" stroke-width="1.5"/>`,
      grad("ag2", "#7fd460", "#2f8a3a")
    ),
    pepper: sv(
      [[68, 122, 20], [110, 128, 19], [88, 86, 18], [134, 90, 17], [152, 130, 18], [100, 164, 19], [60, 160, 17]]
        .map(([x, y, r]) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="url(#pg)" stroke="#d89b28" stroke-width=".6" stroke-opacity=".5"/>${[[-6, -4], [5, 6], [-3, 8], [7, -7], [0, 0]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.5" fill="#706252" opacity=".85"/>`).join("")}<ellipse cx="${x - r / 3}" cy="${y - r / 2.4}" rx="${r / 4}" ry="${r / 6}" fill="#f5d27a" opacity=".4"/></g>`)
        .join(""),
      `<radialGradient id="pg" cx=".35" cy=".3"><stop offset="0" stop-color="#6a5c4c"/><stop offset="1" stop-color="#191510"/></radialGradient>`
    ),
    tea: sv(
      [[-64, 0.85], [64, 0.85], [-34, 1], [34, 1], [0, 1.08]]
        .map(([a, s]) => `<g transform="translate(100 168) rotate(${a}) scale(${s})"><path d="M0 0C-26-30-22-82 0-116C22-82 26-30 0 0Z" fill="url(#tl)"/><path d="M0-6V-104" stroke="#e4f2b8" stroke-width="1.8" opacity=".78"/>${[-30, -52, -74].map((y) => `<path d="M0 ${y}L-11 ${y - 10}M0 ${y}L11 ${y - 10}" stroke="#e4f2b8" stroke-width="1.2" opacity=".65"/></g>`).join("")}`)
        .join("") + `<path d="M100 168C98 176 99 184 100 190" stroke="#7cb844" stroke-width="4" stroke-linecap="round"/>`,
      grad("tl", "#89be42", "#3a6a1c")
    )
  };

  /* ---------- DOM & Format Helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  const money = (n) => (n === null || n === undefined ? "Price on request" : "₹" + Math.round(Number(n)).toLocaleString("en-IN"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const WA_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Z"/></svg>';
  const IG_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';

  const tel = (p) => "tel:" + String(p || "").replace(/[^\d+]/g, "");
  const igLink = (cls = "btn btn-ghost") =>
    CFG.instagram ? `<a class="${cls}" href="${esc(CFG.instagram)}" target="_blank" rel="noopener noreferrer">${IG_ICON} Instagram</a>` : "";

  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
  }

  /* ---------- Base64URL Invoice Token Encoder ---------- */
  function encodeOrderToken(order) {
    try {
      const slim = {
        id: order.id,
        dt: order.createdAt,
        pm: order.paymentMethod,
        utr: order.utr || "",
        cp: order.coupon || "",
        it: order.items.map((x) => ({ n: x.name, s: x.size, q: x.qty, p: x.price })),
        sub: order.totals.subtotal,
        disc: order.totals.discount,
        ship: order.totals.shipping,
        cod: order.totals.codFee,
        tot: order.totals.total,
        c: {
          n: order.customer.name,
          p: order.customer.phone,
          e: order.customer.email,
          a: order.customer.address,
          ct: order.customer.city,
          st: order.customer.state,
          pin: order.customer.pincode
        }
      };
      const json = JSON.stringify(slim);
      const bytes = new TextEncoder().encode(json);
      let bin = "";
      bytes.forEach((b) => { bin += String.fromCharCode(b); });
      return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
      return "";
    }
  }

  function siteBaseUrl() {
    if (location.protocol === "http:" || location.protocol === "https:") {
      const dir = location.pathname.replace(/\/[^/]*$/, "");
      return location.origin + dir;
    }
    return (CFG.domain || "https://jayakesh.in").replace(/\/$/, "");
  }

  function invoiceHref(order, absolute = false) {
    const token = order.token || encodeOrderToken(order);
    const rel = `invoice.html?order=${encodeURIComponent(order.id)}${token ? "&d=" + token : ""}`;
    return absolute ? `${siteBaseUrl()}/${rel}` : rel;
  }

  /* ---------- WhatsApp Helpers ---------- */
  const waLink = (msg, phoneOverride) => {
    const num = String(phoneOverride || CFG.whatsapp || "").replace(/\D/g, "");
    return (num ? `https://wa.me/${num}` : "https://wa.me/") + "?text=" + encodeURIComponent(msg);
  };

  const inquiry = (t) => "Hello Jayakesh, " + (t || "I have a question about Jayakesh Kerala Hair Oil.");

  function quickCartWaMsg() {
    const totals = calcTotals("COD");
    const rows = cart.map((i) => {
      const prod = getProduct(i.id);
      return `• ${prod.name} (${prod.size}) × ${i.qty} — ${prod.price === null ? "price on request" : money(prod.price * i.qty)}`;
    });
    return [
      "Hello Jayakesh, I would like to order:",
      ...rows,
      totals.subtotal !== null ? `Subtotal: ${money(totals.subtotal)}` : "",
      totals.discount > 0 ? `Coupon (${appliedCoupon}): -${money(totals.discount)}` : "",
      totals.total !== null ? `Payable Total: ${money(totals.total)}` : ""
    ].filter(Boolean).join("\n");
  }

  function fullOrderWaMsg(order) {
    const lines = [
      `🛒 *New Order #${order.id}*`,
      `Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`,
      "",
      "*Items:*",
      ...order.items.map((x) => `• ${x.name} (${x.size}) × ${x.qty} — ${x.price === null ? "To confirm" : money(x.price * x.qty)}`),
      ""
    ];
    if (order.totals.total !== null) {
      lines.push(`Subtotal: ${money(order.totals.subtotal)}`);
      if (order.totals.discount > 0) lines.push(`Discount (${order.coupon}): -${money(order.totals.discount)}`);
      lines.push(`Shipping: ${order.totals.shipping === 0 ? "FREE" : money(order.totals.shipping)}`);
      if (order.totals.codFee > 0) lines.push(`COD Fee: ${money(order.totals.codFee)}`);
      lines.push(`*Total Payable: ${money(order.totals.total)}*`);
    } else {
      lines.push("*Total: To be confirmed*");
    }
    lines.push(
      "",
      `*Payment:* ${order.paymentMethod === "UPI" ? "UPI" + (order.utr ? ` (UTR: ${order.utr})` : " (QR/Link requested)") : "Cash on Delivery (COD)"}`,
      "",
      "*Delivery Address:*",
      `${order.customer.name}`,
      `Phone: ${order.customer.phone}`,
      `Email: ${order.customer.email}`,
      `${order.customer.address}`,
      `${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`
    );
    if (order.customer.notes) lines.push(`Notes: ${order.customer.notes}`);
    lines.push("", `📄 Invoice: ${invoiceHref(order, true)}`);
    return lines.join("\n");
  }

  /* ---------- Serverless Email Engine (FormSubmit.co / Web3Forms) ---------- */
  async function sendOwnerEmail(payload) {
    const notifyEmail = String(CFG.ownerNotifyEmail || "").trim();
    const w3Key = String(CFG.web3formsKey || "").trim();

    if (w3Key) {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.assign({ access_key: w3Key }, payload))
      });
      if (!res.ok) throw new Error("Email service returned " + res.status);
      return res.json();
    }

    if (!notifyEmail) return { skipped: true };

    const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(notifyEmail), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(
        Object.assign(
          {
            _template: "table",
            _captcha: "false"
          },
          payload
        )
      )
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Notification request failed");
    return data;
  }

  /* ---------- Cart, Coupons & Orders Storage ---------- */
  function getProduct(id) {
    return PRODUCTS.find((x) => x.id === id) || P;
  }

  let cart = [];
  let appliedCoupon = "";
  try {
    const raw = JSON.parse(localStorage.getItem("jk-cart") || "[]");
    if (Array.isArray(raw)) {
      cart = raw
        .filter((x) => x && Number(x.qty) > 0)
        .map((x) => ({ id: x.id || P.id, qty: Math.min(20, Math.max(1, Math.floor(Number(x.qty)))) }));
    }
    appliedCoupon = String(localStorage.getItem("jk-coupon") || "").toUpperCase();
  } catch (e) {}

  function getMyOrders() {
    try {
      const list = JSON.parse(localStorage.getItem("jk-my-orders") || "[]");
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveOrderLocal(order) {
    try {
      const list = getMyOrders().filter((o) => o && o.id !== order.id);
      list.unshift(order);
      localStorage.setItem("jk-my-orders", JSON.stringify(list.slice(0, 50)));
    } catch (e) {}
  }

  function getSavedCustomer() {
    try {
      return JSON.parse(localStorage.getItem("jk-customer") || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveCustomerLocal(c) {
    try {
      localStorage.setItem(
        "jk-customer",
        JSON.stringify({
          name: c.name,
          phone: c.phone,
          email: c.email,
          address: c.address,
          city: c.city,
          state: c.state,
          pincode: c.pincode
        })
      );
    } catch (e) {}
  }

  const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);

  function evaluateCoupon(code, subtotal) {
    const key = String(code || "").trim().toUpperCase();
    if (!key || subtotal === null) return { valid: false, discount: 0, code: "" };
    const rule = (CFG.coupons || {})[key];
    if (!rule) return { valid: false, discount: 0, code: key, reason: "Invalid coupon code" };
    if (rule.minOrder && subtotal < rule.minOrder) {
      return { valid: false, discount: 0, code: key, reason: `Minimum order ${money(rule.minOrder)} required for ${key}` };
    }
    let disc = rule.type === "percent" ? Math.round((subtotal * Number(rule.value || 0)) / 100) : Math.round(Number(rule.value || 0));
    if (rule.maxDiscount) disc = Math.min(disc, Number(rule.maxDiscount));
    disc = Math.min(disc, subtotal);
    return { valid: true, discount: disc, code: key, label: rule.label || key };
  }

  function calcTotals(payMethod = "COD") {
    const hasNull = cart.some((i) => getProduct(i.id).price === null);
    if (!cart.length || hasNull) {
      return { subtotal: null, discount: 0, shipping: 0, codFee: 0, total: null, couponValid: false };
    }
    const subtotal = cart.reduce((s, i) => s + getProduct(i.id).price * i.qty, 0);
    const cp = evaluateCoupon(appliedCoupon, subtotal);
    const discount = cp.valid ? cp.discount : 0;
    const afterDisc = Math.max(0, subtotal - discount);
    const shipping = CFG.freeShippingMin && afterDisc >= CFG.freeShippingMin ? 0 : Number(CFG.shippingFee || 0);
    const codFee = payMethod === "COD" ? Number(CFG.codFee || 0) : 0;
    const total = afterDisc + shipping + codFee;
    return { subtotal, discount, shipping, codFee, total, couponValid: cp.valid, couponReason: cp.reason || "" };
  }

  function saveCart() {
    try {
      localStorage.setItem("jk-cart", JSON.stringify(cart));
      localStorage.setItem("jk-coupon", appliedCoupon);
    } catch (e) {}
    paintCart();
  }

  function addToCart(id = P.id, qty = 1, open = true) {
    const prod = getProduct(id);
    if (prod.inStock === false) {
      toast("Currently out of stock");
      return;
    }
    const found = cart.find((i) => i.id === prod.id);
    if (found) found.qty = Math.min(20, found.qty + qty);
    else cart.push({ id: prod.id, qty: Math.min(20, qty) });
    saveCart();
    if (open) openDrawer(true);
    else toast(`Added ${prod.name} to cart`);
  }

  function setItemQty(id, q) {
    const n = Math.floor(Number(q));
    if (n <= 0) cart = cart.filter((i) => i.id !== id);
    else {
      const f = cart.find((i) => i.id === id);
      if (f) f.qty = Math.min(20, n);
    }
    saveCart();
    const rn = route().name;
    if (rn === "cart" || rn === "checkout") render();
  }

  /* ---------- Cart Line & Drawer UI ---------- */
  function lineItemsHtml() {
    return cart
      .map((item) => {
        const prod = getProduct(item.id);
        return `<div class="line-item">
          <img src="${esc(prod.image || IMG)}" alt="${esc(prod.name)}">
          <div>
            <strong>${esc(prod.name)}</strong>
            <div style="font-size:.84rem;color:var(--muted)">${esc(prod.size)} · ${money(prod.price)}</div>
            <div class="qty" style="margin-top:.42rem">
              <button type="button" data-id="${esc(prod.id)}" data-q="${item.qty - 1}" aria-label="Decrease quantity">−</button>
              <output>${item.qty}</output>
              <button type="button" data-id="${esc(prod.id)}" data-q="${item.qty + 1}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:700;color:var(--ochre-bright)">${prod.price === null ? "—" : money(prod.price * item.qty)}</div>
            <button type="button" class="icon-btn" data-id="${esc(prod.id)}" data-q="0" aria-label="Remove item" title="Remove">🗑</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function shippingHintHtml(totals) {
    if (totals.subtotal === null || !CFG.freeShippingMin) return "";
    const afterDisc = Math.max(0, totals.subtotal - totals.discount);
    if (afterDisc >= CFG.freeShippingMin) {
      return `<div class="ship-banner">🎉 You unlocked FREE Pan-India delivery!</div>`;
    }
    const diff = CFG.freeShippingMin - afterDisc;
    return `<div class="ship-banner">Add <strong>${money(diff)}</strong> more for <strong>FREE Shipping</strong>!</div>`;
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
      body.innerHTML = `<div style="padding:3.2rem 0;text-align:center;color:var(--muted)">
        <p style="margin-bottom:1.1rem">Your cart is empty.</p>
        <a class="btn btn-primary btn-sm" href="#/shop" onclick="document.getElementById('scrim').click()">Browse shop</a>
      </div>`;
      foot.innerHTML = "";
      return;
    }

    const totals = calcTotals("COD");
    body.innerHTML = shippingHintHtml(totals) + lineItemsHtml();
    foot.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:.9rem;color:var(--muted)">
        <span>Shipping</span><span>${totals.subtotal === null ? "Confirmed on order" : totals.shipping === 0 ? '<strong style="color:var(--lime)">FREE</strong>' : money(totals.shipping)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1.1rem;color:var(--ochre-bright)">
        <span>Estimated Total</span><span>${money(totals.total)}</span>
      </div>
      <a class="btn btn-primary" href="#/checkout">Proceed to Checkout</a>
      <a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="${esc(waLink(quickCartWaMsg()))}">${WA_ICON} Order on WhatsApp</a>
      <a class="btn btn-ghost btn-sm" href="#/cart">View full cart &amp; coupons</a>`;
  }

  function openDrawer(v) {
    $("#drawer").classList.toggle("open", v);
    $("#scrim").classList.toggle("open", v);
  }

  $("#drawerBody").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-q]");
    if (btn) setItemQty(btn.dataset.id || P.id, +btn.dataset.q);
  });
  $("#scrim").onclick = $("#drawerClose").onclick = () => openDrawer(false);
  $("#cartBtn").onclick = () => openDrawer(true);

  function closeMenu() {
    $("#mm").classList.remove("open");
    document.body.style.overflow = "";
  }
  $("#burger").onclick = () => {
    $("#mm").classList.add("open");
    document.body.style.overflow = "hidden";
  };
  $("#mmClose").onclick = closeMenu;
  $("#mm").addEventListener("click", (e) => {
    if (e.target.tagName === "A") closeMenu();
  });

  /* ---------- Review Modal ---------- */
  function openReviewModal(v) {
    const m = $("#reviewModal");
    if (m) m.classList.toggle("open", v);
  }
  if ($("#rvClose")) $("#rvClose").onclick = () => openReviewModal(false);
  if ($("#reviewModal")) {
    $("#reviewModal").addEventListener("click", (e) => {
      if (e.target.id === "reviewModal") openReviewModal(false);
    });
  }
  if ($("#starsPick")) {
    $("#starsPick").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-star]");
      if (!btn) return;
      const val = Number(btn.dataset.star);
      $("#rvRating").value = val;
      $$("#starsPick button").forEach((b) => b.classList.toggle("active", Number(b.dataset.star) <= val));
    });
  }
  if ($("#reviewForm")) {
    $("#reviewForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      const msg = $("#rvMsg");
      const btn = $("#rvSubmitBtn");
      if ((fd.name || "").trim().length < 2 || (fd.text || "").trim().length < 8) {
        msg.className = "alert bad";
        msg.textContent = "Please enter your name and at least a short review.";
        return;
      }
      btn.disabled = true;
      btn.textContent = "Sending...";
      msg.className = "";
      msg.textContent = "";

      const snippet = JSON.stringify({
        name: fd.name.trim(),
        city: (fd.city || "").trim(),
        rating: Number(fd.rating || 5),
        text: fd.text.trim(),
        verified: Boolean((fd.orderId || "").trim())
      });

      try {
        await sendOwnerEmail({
          _subject: `⭐ New Customer Review (${fd.rating}★) — ${fd.name.trim()}`,
          Type: "Customer Review Submission",
          Customer_Name: fd.name.trim(),
          City: (fd.city || "").trim() || "—",
          Order_ID: (fd.orderId || "").trim() || "Not provided",
          Rating: `${fd.rating} / 5 Stars`,
          Review_Text: fd.text.trim(),
          Config_Snippet_To_Approve: snippet
        });
      } catch (err) {
        // Silent fallback
      }
      btn.disabled = false;
      btn.textContent = "Submit review";
      e.target.reset();
      $$("#starsPick button").forEach((b) => b.classList.add("active"));
      $("#rvRating").value = "5";
      msg.className = "alert ok";
      msg.innerHTML = "Thank you! Your review has been sent to our team for verification.";
      toast("Review submitted — thank you!");
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      openDrawer(false);
      closeMenu();
      openReviewModal(false);
    }
  });

  /* ---------- Reusable UI Components ---------- */
  const head = (eyebrow, title, intro) =>
    `<section class="page-head"><div class="wrap"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${intro ? `<p class="lead" style="margin-top:1.4rem">${intro}</p>` : ""}</div></section>`;

  function priceDisplayHtml(prod = P) {
    if (prod.price === null) return `<div class="price">Price on request</div>`;
    const hasMrp = prod.comparePrice && Number(prod.comparePrice) > Number(prod.price);
    const savePct = hasMrp ? Math.round(((prod.comparePrice - prod.price) / prod.comparePrice) * 100) : 0;
    return `<div class="price">${money(prod.price)}${hasMrp ? `<span class="mrp">${money(prod.comparePrice)}</span><span class="save-pill">Save ${savePct}%</span>` : ""}</div>`;
  }

  function buyBox(prod = P) {
    const inStock = prod.inStock !== false;
    return `<div>
      <div class="stock-dot ${inStock ? "" : "out"}">${inStock ? "In Stock · Fresh Handmade Batch" : "Currently Out of Stock"}</div>
      ${priceDisplayHtml(prod)}
      <div class="chips"><span class="chip">${esc(prod.size)}</span><span class="chip">ZERO chemicals</span><span class="chip">Pan-India Delivery</span>${CFG.codEnabled ? '<span class="chip">COD Available</span>' : ""}</div>
      <div class="row-actions">
        <div class="qty" role="group" aria-label="Quantity">
          <button type="button" data-act="dec" aria-label="Decrease quantity">−</button>
          <output data-qty>1</output>
          <button type="button" data-act="inc" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="btn btn-dark" data-act="add" ${inStock ? "" : "disabled"}>${inStock ? "Add to cart" : "Out of stock"}</button>
      </div>
      <div class="row-actions" style="margin-top:.8rem">
        ${inStock ? `<button type="button" class="btn btn-primary" data-act="buy">Buy now</button>` : ""}
        <a class="btn btn-wa" data-wa target="_blank" rel="noopener noreferrer" href="${esc(waLink(`Hello Jayakesh, I would like to order ${prod.name} (${prod.size}) × 1.`))}">${WA_ICON} WhatsApp order</a>
      </div>
      <div class="trust-strip">
        <span>✓ ZERO chemicals</span>
        <span>✓ Free Shipping ₹${CFG.freeShippingMin}+</span>
        <span>✓ Instant Order Invoice</span>
      </div>
    </div>`;
  }

  const ingSrc = (g) => (g.img && g.img[0] === "@" ? ASSETS[g.img.slice(1)] : g.img || "");
  const ingCards = () =>
    `<div class="ing-grid" data-ing>${INGREDIENTS.map(
      (g, i) => `<button type="button" class="ing reveal" style="transition-delay:${i * 60}ms" aria-pressed="false" aria-label="${esc(g.name)}${g.sub ? " (" + esc(g.sub) + ")" : ""}. Tap to flip the card.">
        <span class="inner">
          <span class="face front" style="--t1:${(g.tint || [])[0] || "#143d1d"};--t2:${(g.tint || [])[1] || "#071e0d"}">
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

  const soonCards = () =>
    [40, -35, 110]
      .map(
        (h) => `<article class="pcard soon" aria-label="New product, coming soon">
          <div class="pimg"><img src="${IMG}" alt="" style="filter:blur(9px) saturate(.7) hue-rotate(${h}deg);opacity:.65"><span class="soon-badge">Coming soon</span></div>
          <div class="pbody"><span class="skel" style="width:70%"></span><span class="skel" style="width:42%"></span><span class="btn btn-dark btn-sm" aria-disabled="true" style="opacity:.45;pointer-events:none">Coming soon</span></div>
        </article>`
      )
      .join("");

  const founderHtml = (f, i) =>
    `<article class="founder ${i % 2 ? "rev" : ""}">
      <div class="fphoto reveal"><span class="mono">${esc(f.initials)}</span>${f.photo ? `<img src="${esc(f.photo)}" alt="${esc(f.name)}, ${esc(f.role)} of Jayakesh" onerror="this.remove()">` : ""}</div>
      <div class="reveal">
        <p class="eyebrow">${esc(f.role)}</p>
        <h3>${esc(f.name)}</h3>
        <div class="gline"></div>
        <p class="lead" style="margin-top:1.2rem">${esc(f.intro)}</p>
        ${(f.story || []).map((p) => `<p class="lead" style="margin-top:1rem">${esc(p)}</p>`).join("")}
        ${f.quote ? `<blockquote class="fquote">“${esc(f.quote)}”</blockquote>` : ""}
      </div>
    </article>`;

  let ri = 0;
  function reviewsHtml() {
    const writeBtn = `<div style="margin-top:1.4rem;text-align:center"><button type="button" class="btn btn-primary btn-sm" data-open-review="1">★ Write a customer review</button></div>`;
    if (!REVIEWS.length) {
      return `<div class="empty">
        <div class="rating-stars" aria-hidden="true" style="margin-bottom:.6rem">★★★★★</div>
        <p style="font-size:1.08rem;font-weight:700;color:var(--text)">Tried Jayakesh Kerala Hair Oil?</p>
        <p style="font-size:.92rem;margin-top:.4rem">Be among the first customers to share your genuine experience with us.</p>
        ${writeBtn}
      </div>`;
    }
    const r = REVIEWS[ri % REVIEWS.length];
    return `<div id="sliderWrap">
      <div class="slider" id="slider">
        <figure class="slide" style="margin:0">
          ${r.rating ? `<div class="rating-stars" aria-label="${r.rating} out of 5 stars">${"★".repeat(r.rating)}</div>` : ""}
          <blockquote style="margin:1rem 0;font-family:var(--serif);font-size:1.65rem;line-height:1.3;color:var(--text)">“${esc(r.text)}”</blockquote>
          <figcaption style="font-weight:700;color:var(--ochre-soft)">
            ${esc(r.name)}${r.city ? ` <span style="font-weight:400;color:var(--muted)">· ${esc(r.city)}</span>` : ""}
            ${r.verified ? `<span class="verified-badge">✓ Verified Buyer</span>` : ""}
          </figcaption>
        </figure>
        ${REVIEWS.length > 1 ? `<div style="display:flex;gap:.5rem;margin-top:1rem;justify-content:center"><button type="button" class="icon-btn" data-rv="-1" aria-label="Previous review">‹</button><button type="button" class="icon-btn" data-rv="1" aria-label="Next review">›</button></div>` : ""}
      </div>
      ${writeBtn}
    </div>`;
  }

  function field(id, label, tag, attrs = "", val = "") {
    if (tag === "textarea") {
      return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" name="${id}" ${attrs}>${esc(val)}</textarea><span class="err" id="${id}-err" role="alert"></span></div>`;
    }
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" value="${esc(val)}" ${attrs}><span class="err" id="${id}-err" role="alert"></span></div>`;
  }

  function stateSelectField(selectedState) {
    const cur = selectedState || "Kerala";
    return `<div class="field">
      <label for="state">State / UT</label>
      <select id="state" name="state" autocomplete="address-level1">
        ${INDIAN_STATES.map((s) => `<option value="${esc(s)}" ${s === cur ? "selected" : ""}>${esc(s)}</option>`).join("")}
      </select>
      <span class="err" id="state-err" role="alert"></span>
    </div>`;
  }

  function buildUpiUri(amount) {
    const pa = String(CFG.upiId || "").trim();
    if (!pa) return "";
    const pn = encodeURIComponent(CFG.upiPayeeName || CFG.storeName || "Jayakesh");
    const am = amount && Number(amount) > 0 ? `&am=${Number(amount).toFixed(2)}` : "";
    return `upi://pay?pa=${encodeURIComponent(pa)}&pn=${pn}${am}&cu=INR&tn=${encodeURIComponent("Jayakesh Hair Oil Order")}`;
  }

  const legalPage = (title, body) =>
    head("Store Policy", title) + `<section class="section"><div class="wrap prose">${body}</div></section>`;

  /* ---------- Route Views ---------- */
  const views = {
    home: () => `
      <section class="hero">
        <div class="hero-bg" data-px="-0.12"><i></i></div>
        <div class="wrap grid">
          <div>
            <p class="eyebrow">Jayakesh · Kerala Hair Oil</p>
            <h1 style="margin:1rem 0">
              <span class="line"><span style="animation-delay:1.8s">Legacy</span></span>
              <span class="line"><span class="gold" style="animation-delay:1.95s">in every drop.</span></span>
            </h1>
            <p class="lead">Handmade with pure natural ingredients and ZERO chemicals. A traditional Kerala hair oil crafted to nourish your scalp and strengthen your hair.</p>
            <div class="ctas">
              <a href="#/shop" class="btn btn-primary">Shop now</a>
              <a href="#/ingredients" class="btn btn-ghost">Explore the ingredients</a>
            </div>
          </div>
          <div class="stage" id="stage" data-px="0.06">
            <div class="ring r2" data-d="-14"></div>
            <div class="ring" data-d="-14"></div>
            <div class="halo" data-d="30"></div>
            <div class="floor" data-d="24"></div>
            <div class="float" style="height:92%;display:grid;place-items:center;position:relative">
              <img id="bottle" class="bottle" src="${IMG}" alt="Jayakesh Kerala Hair Oil 200 ml bottle" width="887" height="1774" style="height:100%;width:auto">
            </div>
          </div>
        </div>
        <div class="scroll-hint">Scroll</div>
      </section>

      <div class="marquee" aria-hidden="true">
        <div class="track">${Array(4).fill("<span>Handmade ✦</span><span>ZERO chemicals ✦</span><span>Pure natural ingredients ✦</span><span>Legacy in every drop ✦</span>").join("")}</div>
      </div>

      <section class="section">
        <div class="wrap showcase">
          <div class="pic reveal"><img src="${esc(P.image || IMG)}" alt="${esc(P.name)} ${esc(P.size)}" width="887" height="1774"></div>
          <div class="reveal">
            <p class="eyebrow">The flagship bottle</p>
            <h2 style="margin-top:.4rem">${esc(P.name)}</h2>
            <p class="lead" style="margin:1.2rem 0">${esc(P.desc)}</p>
            <div class="chips">${P.highlights.map((h) => `<span class="chip">${esc(h)}</span>`).join("")}</div>
            <ul style="margin:0 0 1.5rem;padding-left:1.2rem;color:var(--muted)">${P.benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
            ${buyBox(P)}
          </div>
        </div>
      </section>

      <section class="section dark">
        <div class="wrap">
          <p class="eyebrow">Benefits</p>
          <h2 style="margin-top:.4rem">Care, rooted in tradition.</h2>
          <div class="cards">
            ${[
              ["🍃", "Helps reduce hair fall", "Made to care for your hair every day."],
              ["🌱", "Promotes healthy hair growth", "A traditional oil for healthier-looking hair."],
              ["💧", "Nourishes the scalp", "Rich natural oil that nourishes where hair begins."],
              ["🛡️", "Strengthens hair", "Helps hair feel stronger and look healthier."]
            ]
              .map(
                (b, i) => `<article class="card reveal" style="transition-delay:${i * 100}ms"><div class="ico" style="font-size:1.6rem">${b[0]}</div><h3>${b[1]}</h3><p>${b[2]}</p></article>`
              )
              .join("")}
          </div>
          <p style="margin-top:2rem;font-size:.8rem;opacity:.65">Individual results may vary.</p>
        </div>
      </section>

      <section class="section dark" style="padding-top:0">
        <div class="wrap">
          <p class="eyebrow">The film</p>
          <h2 style="margin:.4rem 0 2.5rem">Made the Kerala way.</h2>
          <div class="video-wrap">
            ${CFG.videoSrc ? `<video src="${esc(CFG.videoSrc)}" controls playsinline preload="metadata" poster="${IMG}"></video>` : `<div class="film" id="film" role="img" aria-label="Animated sequence of the Jayakesh bottle"><div class="scene" id="scene"></div><span class="note">Handmade in Kerala</span></div>`}
          </div>
        </div>
      </section>

      <section class="section ochre-band">
        <div class="wrap">
          <p class="eyebrow">Ingredients &amp; their benefits</p>
          <h2 style="margin-top:.4rem">Pure natural ingredients.</h2>
          <p class="lead" style="margin-top:1rem">Nine time-tested natural ingredients behind Jayakesh. Watch each card turn to reveal what it brings — or tap any card to flip it.</p>
          ${ingCards()}
        </div>
      </section>

      <section class="section">
        <div class="wrap">
          <p class="eyebrow">Why Jayakesh</p>
          <h2 style="margin-top:.4rem">Simple. Honest. Traditional.</h2>
          <div class="cards">
            ${[
              ["✋", "Handmade", "Prepared by hand, in the Kerala tradition."],
              ["🚫", "ZERO chemicals", "Crafted with ZERO chemicals — pure, honest care."],
              ["🥥", "Pure natural ingredients", "Coconut, onion, and botanical ingredients at its heart."],
              ["✨", "Everyday ritual", "A nourishing oil ritual for your scalp and hair."]
            ]
              .map(
                (b, i) => `<article class="card light reveal" style="transition-delay:${i * 80}ms"><div class="ico" style="font-size:1.5rem">${b[0]}</div><h3>${b[1]}</h3><p>${b[2]}</p></article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section alt">
        <div class="wrap" style="max-width:860px">
          <p class="eyebrow">Customer reviews</p>
          <h2 style="margin:.4rem 0 2rem">In their words.</h2>
          ${reviewsHtml()}
        </div>
      </section>`,

    shop: () =>
      head("Shop", "Our products", "Handmade Kerala hair oil crafted with pure natural ingredients and ZERO chemicals.") +
      `<section class="section"><div class="wrap pgrid">
        ${PRODUCTS.map(
          (prod) => `<article class="pcard">
            <a href="#/product" class="pimg" aria-label="View ${esc(prod.name)}"><img src="${esc(prod.image || IMG)}" alt="${esc(prod.name)} ${esc(prod.size)}" width="887" height="1774"></a>
            <div class="pbody">
              <h2 style="font-size:1.7rem"><a href="#/product">${esc(prod.name)}</a></h2>
              <p style="color:var(--muted)">${esc(prod.size)} · <strong style="color:var(--ochre-bright)">${money(prod.price)}</strong>${prod.comparePrice && prod.comparePrice > prod.price ? ` <span style="text-decoration:line-through;font-size:.88rem">${money(prod.comparePrice)}</span>` : ""}</p>
              <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                <button type="button" class="btn btn-primary btn-sm" data-act="add1" data-pid="${esc(prod.id)}">Add to cart</button>
                <a class="btn btn-ghost btn-sm" href="#/product">View details</a>
              </div>
            </div>
          </article>`
        ).join("")}
        ${soonCards()}
      </div></section>`,

    product: () =>
      head(esc(P.size), esc(P.name), "Handmade Kerala hair oil crafted with pure natural ingredients and ZERO chemicals.") +
      `<section class="section"><div class="wrap showcase">
        <div class="pic"><img src="${esc(P.image || IMG)}" alt="${esc(P.name)} ${esc(P.size)} bottle" width="887" height="1774"></div>
        <div>
          <p class="lead" style="margin-bottom:1rem">${esc(P.desc)}</p>
          <h2 style="font-size:1.6rem;margin:1.4rem 0 .5rem">Benefits</h2>
          <ul style="padding-left:1.2rem;color:var(--muted);margin:0">${P.benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
          <h2 style="font-size:1.6rem;margin:1.4rem 0 .5rem">What it is</h2>
          <div class="chips">${P.highlights.map((h) => `<span class="chip">${esc(h)}</span>`).join("")}</div>
          <h2 style="font-size:1.6rem;margin:1.4rem 0 .5rem">Ingredients</h2>
          <ul style="padding-left:1.2rem;color:var(--muted);margin:0;columns:2">${INGREDIENTS.map((g) => `<li>${esc(g.name)}</li>`).join("")}</ul>
          <div style="margin-top:1.8rem">${buyBox(P)}</div>
          <p style="margin-top:1.2rem;font-size:.8rem;color:var(--muted)">How to use: Massage gently onto scalp and hair roots. Leave for at least 30–60 minutes (or overnight) before washing with a mild cleanser. Individual results may vary.</p>
        </div>
      </div></section>`,

    ingredients: () =>
      head("Ingredients", "Explore the ingredients", "Handmade with pure natural ingredients and ZERO chemicals. Tap any card to flip it.") +
      `<section class="section ochre-band" style="padding-top:3rem"><div class="wrap">${ingCards()}</div></section>`,

    about: () => {
      const s = [
        ["Our story", "Born from Kerala's hair-care tradition.", "Jayakesh Kerala Hair Oil follows the time-honoured tradition of Kerala hair oils, prepared carefully by hand."],
        ["Our mission", "Honest natural care.", "To offer an authentic hair oil made with pure natural ingredients and ZERO chemicals."],
        ["Our vision", "Tradition that lasts.", "To keep a time-tested way of caring for hair and scalp alive, one bottle at a time."],
        ["Product development", "Handmade, start to finish.", "Every bottle of Jayakesh is handmade in small batches, with coconut, onion, and traditional ingredients at its heart."],
        ["Commitment to quality", "Pure by intention.", "Pure natural ingredients, ZERO chemicals, and complete honesty in every drop."]
      ];
      return (
        head("About us", "Legacy in every drop", "Jayakesh is a Kerala hair oil, handmade with pure natural ingredients and ZERO chemicals.") +
        `<section class="section"><div class="wrap split"><p class="statement reveal">“A hair oil made the way it has always been made: by hand, from pure natural ingredients, with ZERO chemicals.”</p><div class="reveal" style="background:radial-gradient(circle at 50% 45%,rgba(216,155,40,.26),var(--green-950) 72%);border:1px solid var(--border);border-radius:32px;padding:2rem;display:grid;place-items:center"><img src="${IMG}" alt="Jayakesh bottle" width="887" height="1774" style="height:440px;width:auto;filter:drop-shadow(0 30px 32px rgba(0,0,0,.7))"></div></div></section>` +
        `<section class="section ochre-band" aria-labelledby="founders"><div class="wrap"><p class="eyebrow">Leadership</p><h2 id="founders" style="margin:.4rem 0 3.5rem">Our Founders. <span class="gold">One legacy.</span></h2><div class="founders">${FOUNDERS.map(founderHtml).join("")}</div></div></section>` +
        s.map((x, i) => `<section class="section ${i % 2 ? "dark" : ""}" style="padding:clamp(3.5rem,8vw,6rem) 0"><div class="wrap split"><div class="reveal"><p class="eyebrow">${x[0]}</p><h2 style="margin-top:.4rem">${x[1]}</h2></div><p class="lead reveal">${x[2]}</p></div></section>`).join("") +
        `<section class="section alt"><div class="wrap"><p class="eyebrow">Brand values</p><div class="cards">${["Tradition", "Purity", "Craftsmanship", "Honesty"].map((v) => `<div class="card light reveal"><h3>${v}</h3></div>`).join("")}</div></div></section>`
      );
    },

    contact: () =>
      head("Contact", "We'd love to hear from you", "Questions about Jayakesh Kerala Hair Oil, bulk inquiries, or order help? Send us a message below or chat on WhatsApp.") +
      `<section class="section"><div class="wrap checkout">
        <form class="form" id="contactForm" novalidate>
          ${field("name", "Your name", "input", 'autocomplete="name" required')}
          <div class="two">
            ${field("email", "Email address", "input", 'type="email" autocomplete="email" required')}
            ${field("phone", "Phone / WhatsApp", "input", 'type="tel" autocomplete="tel" required')}
          </div>
          ${field("subject", "Subject", "input", 'placeholder="Order question, product inquiry..." required')}
          ${field("message", "Message", "textarea", 'rows="5" required')}
          <div class="row-actions">
            <button type="submit" class="btn btn-primary" id="contactBtn">Send message</button>
            <a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="${esc(waLink(inquiry()))}">${WA_ICON} Chat on WhatsApp</a>
          </div>
          <p id="formMsg"></p>
        </form>
        <aside class="summary" style="position:static">
          <h2 style="font-size:1.8rem;margin-bottom:1rem">Direct reach</h2>
          <div style="display:grid;gap:.9rem">
            ${CFG.phone ? `<a href="${tel(CFG.phone)}">📞 ${esc(CFG.phone)}</a>` : ""}
            ${CFG.supportEmail ? `<a href="mailto:${esc(CFG.supportEmail)}">✉️ ${esc(CFG.supportEmail)}</a>` : ""}
            ${CFG.address ? `<p>📍 ${esc(CFG.address)}</p>` : ""}
            <p style="font-size:.86rem;color:var(--muted)">Support hours: Mon–Sat, 9:30 AM – 7:00 PM IST</p>
            <a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="${esc(waLink(inquiry()))}">${WA_ICON} Instant WhatsApp Support</a>
            ${igLink()}
          </div>
        </aside>
      </div></section>`,

    cart: () => {
      if (!cartCount()) {
        return head("Cart", "Your cart") + `<section class="section"><div class="wrap" style="max-width:760px"><div class="empty"><p style="margin-bottom:1rem">Your shopping cart is empty.</p><a class="btn btn-primary" href="#/shop">Shop Jayakesh</a></div></div></section>`;
      }
      const totals = calcTotals("COD");
      return (
        head("Cart", "Your shopping cart") +
        `<section class="section"><div class="wrap checkout">
          <div>
            ${shippingHintHtml(totals)}
            <div style="margin-top:.8rem">${lineItemsHtml()}</div>
          </div>
          <aside class="summary">
            <h2 style="font-size:1.6rem;margin-bottom:.6rem">Order summary</h2>
            <div class="coupon-row">
              <input id="couponInput" placeholder="Promo code (e.g. WELCOME10)" value="${esc(appliedCoupon)}">
              <button type="button" class="btn btn-dark btn-sm" id="applyCouponBtn">Apply</button>
            </div>
            <div id="couponFeedback" style="font-size:.8rem;color:${totals.couponValid ? "var(--lime)" : appliedCoupon ? "#ff8a80" : "var(--ochre-soft)"};min-height:1rem">
              ${appliedCoupon ? (totals.couponValid ? `✓ Coupon ${esc(appliedCoupon)} applied (−${money(totals.discount)})` : esc(totals.couponReason || "Invalid coupon")) : "Tip: Use WELCOME10 for 10% off!"}
            </div>
            <div class="totals-list">
              ${renderTotalsRows(totals)}
            </div>
            <div style="display:grid;gap:.7rem;margin-top:1.3rem">
              <a class="btn btn-primary" href="#/checkout">Proceed to Checkout</a>
              <a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="${esc(waLink(quickCartWaMsg()))}">${WA_ICON} Order via WhatsApp</a>
            </div>
          </aside>
        </div></section>`
      );
    },

    checkout: () => {
      if (!cartCount()) {
        return head("Checkout", "Delivery details") + `<section class="section"><div class="wrap"><div class="empty"><p style="margin-bottom:1rem">Your cart is empty.</p><a class="btn btn-primary" href="#/shop">Shop now</a></div></div></section>`;
      }
      const saved = getSavedCustomer();
      const defaultPay = CFG.codEnabled ? "COD" : "UPI";
      const totals = calcTotals(defaultPay);
      const upiUri = buildUpiUri(totals.total);
      const qrSvg = upiUri && window.jkQrSvg ? window.jkQrSvg(upiUri) : "";

      return (
        head("Checkout", "Complete your order", "Fast Pan-India delivery · Instant printable order invoice & email confirmation.") +
        `<section class="section"><div class="wrap"><div class="checkout">
          <form class="form" id="orderForm" novalidate>
            <h2 style="font-size:1.7rem">1. Delivery Address</h2>
            ${field("name", "Full name", "input", 'autocomplete="name" required placeholder="Enter recipient full name"', saved.name || "")}
            <div class="two">
              ${field("phone", "10-digit Mobile / WhatsApp", "input", 'type="tel" inputmode="tel" autocomplete="tel" required placeholder="+91 98765 43210"', saved.phone || "")}
              ${field("email", "Email (for order receipt & invoice)", "input", 'type="email" autocomplete="email" required placeholder="you@example.com"', saved.email || "")}
            </div>
            ${field("address", "House / Flat, Street, Landmark", "textarea", 'rows="3" autocomplete="street-address" required placeholder="House name / Flat No., Street, Area, Landmark"', saved.address || "")}
            <div class="two">
              ${field("city", "City / Town", "input", 'autocomplete="address-level2" required', saved.city || "")}
              ${stateSelectField(saved.state || "Kerala")}
            </div>
            <div class="two">
              ${field("pincode", "6-digit PIN code", "input", 'inputmode="numeric" maxlength="6" autocomplete="postal-code" required placeholder="682001"', saved.pincode || "")}
              ${field("notes", "Delivery notes (optional)", "input", 'placeholder="Preferred time or instructions"', "")}
            </div>

            <h2 style="font-size:1.7rem;margin-top:.8rem">2. Payment Method</h2>
            <div class="pay-methods" id="payMethods">
              ${CFG.codEnabled ? `<label class="pay-opt ${defaultPay === "COD" ? "active" : ""}">
                <input type="radio" name="paymentMethod" value="COD" ${defaultPay === "COD" ? "checked" : ""}>
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <div style="font-size:.85rem;color:var(--muted)">Pay in cash or UPI when the parcel arrives at your doorstep.${CFG.codFee > 0 ? ` (+${money(CFG.codFee)} COD fee)` : " No extra COD fee."}</div>
                </div>
              </label>` : ""}
              ${CFG.upiEnabled ? `<label class="pay-opt ${defaultPay === "UPI" ? "active" : ""}">
                <input type="radio" name="paymentMethod" value="UPI" ${defaultPay === "UPI" ? "checked" : ""}>
                <div style="width:100%">
                  <strong>UPI / QR Pay (GPay, PhonePe, Paytm)</strong>
                  <div style="font-size:.85rem;color:var(--muted)">Zero convenience fee · Fast priority dispatch.</div>
                  <div class="upi-box ${defaultPay === "UPI" ? "" : "hidden"}" id="upiBox">
                    ${upiUri ? `
                      <div style="font-weight:700;color:var(--ochre-bright)">Scan to pay <span data-upi-amt>${money(totals.total)}</span></div>
                      <div class="upi-qr-svg" id="upiQrMount">${qrSvg}</div>
                      <div style="font-size:.82rem;color:var(--muted);margin-bottom:.7rem">UPI ID: <strong style="color:var(--ochre-soft)">${esc(CFG.upiId)}</strong></div>
                      <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-bottom:.9rem">
                        <a class="btn btn-primary btn-sm" id="upiDeepLink" href="${esc(upiUri)}">Open UPI App</a>
                        <button type="button" class="btn btn-ghost btn-sm" data-copy="${esc(CFG.upiId)}">Copy UPI ID</button>
                      </div>
                      <div class="field" style="text-align:left">
                        <label for="utr">12-Digit UPI Reference / UTR No. (after paying)</label>
                        <input id="utr" name="utr" inputmode="numeric" maxlength="18" placeholder="Enter 12-digit UTR number">
                        <span class="err" id="utr-err" role="alert"></span>
                      </div>
                    ` : `
                      <p style="font-size:.9rem;color:var(--ochre-soft);font-weight:600">Place your order below — our official UPI QR / Payment Link will be sent to your Email &amp; WhatsApp immediately for quick payment before dispatch.</p>
                    `}
                  </div>
                </div>
              </label>` : ""}
            </div>

            <button type="submit" class="btn btn-primary" id="placeOrderBtn" style="margin-top:.8rem;width:100%;padding:1.15rem">
              Place Order · <span data-btn-total>${money(totals.total)}</span>
            </button>
            <p id="formMsg"></p>
          </form>

          <aside class="summary" id="checkoutSummary">
            <h2 style="font-size:1.6rem;margin-bottom:.5rem">Order summary</h2>
            ${shippingHintHtml(totals)}
            <div style="margin-top:.5rem">${lineItemsHtml()}</div>
            <div class="coupon-row">
              <input id="couponInput" placeholder="Coupon code (WELCOME10)" value="${esc(appliedCoupon)}">
              <button type="button" class="btn btn-dark btn-sm" id="applyCouponBtn">Apply</button>
            </div>
            <div id="couponFeedback" style="font-size:.8rem;color:${totals.couponValid ? "var(--lime)" : appliedCoupon ? "#ff8a80" : "var(--muted)"};min-height:1rem">
              ${appliedCoupon ? (totals.couponValid ? `✓ ${esc(appliedCoupon)} applied (−${money(totals.discount)})` : esc(totals.couponReason)) : "Have a promo code? Try WELCOME10"}
            </div>
            <div class="totals-list" id="checkoutTotals">
              ${renderTotalsRows(totals)}
            </div>
          </aside>
        </div></div></section>`
      );
    },

    "order-success": () => {
      const params = new URLSearchParams((location.hash.split("?")[1] || ""));
      const oid = params.get("order") || "";
      const mailState = params.get("mail") || "sent";
      const order = getMyOrders().find((o) => o.id === oid) || getMyOrders()[0];

      if (!order) {
        return head("Order Status", "No recent order found") + `<section class="section"><div class="wrap"><div class="empty"><p style="margin-bottom:1rem">We couldn't find that order in this browser.</p><a class="btn btn-primary" href="#/orders">View My Orders</a></div></div></section>`;
      }

      const waUrl = waLink(fullOrderWaMsg(order));
      const invUrl = invoiceHref(order, false);

      return (
        head("Thank you!", `Order #${esc(order.id)} Placed`, "Your order receipt and printable invoice are ready below.") +
        `<section class="section"><div class="wrap" style="max-width:840px">
          <div class="tracker-card">
            <div class="order-head">
              <div>
                <span class="eyebrow">Order Reference</span>
                <h2 style="font-size:1.9rem;margin-top:.2rem">${esc(order.id)}</h2>
                <div style="font-size:.86rem;color:var(--muted);margin-top:.2rem">Placed on ${esc(new Date(order.createdAt).toLocaleString("en-IN"))}</div>
              </div>
              <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                <button type="button" class="btn btn-dark btn-sm" data-copy="${esc(order.id)}">Copy Order ID</button>
                <a class="btn btn-primary btn-sm" href="${esc(invUrl)}" target="_blank" rel="noopener">📄 Print / Download Invoice</a>
              </div>
            </div>

            <div class="steps-bar" aria-label="Order progress">
              <div class="step-node current"><div class="step-dot">✓</div><div class="step-lbl">Order Placed</div></div>
              <div class="step-node"><div class="step-dot">2</div><div class="step-lbl">Confirmed</div></div>
              <div class="step-node"><div class="step-dot">3</div><div class="step-lbl">Handmade Batch</div></div>
              <div class="step-node"><div class="step-dot">4</div><div class="step-lbl">Shipped</div></div>
              <div class="step-node"><div class="step-dot">5</div><div class="step-lbl">Delivered</div></div>
            </div>

            <div class="alert ok" style="margin-bottom:1.3rem">
              ${mailState === "sent"
                ? `<strong>Order notification sent!</strong> Our team has been notified by email${CFG.ccCustomerOnOrder ? ` (with a copy to <strong>${esc(order.customer.email)}</strong>)` : ""}. For fastest dispatch updates, also tap <strong>Confirm on WhatsApp</strong> below.`
                : `<strong>Order saved!</strong> Tap <strong>Confirm on WhatsApp</strong> below so our team can dispatch your bottle right away.`}
            </div>

            <div class="two" style="margin:1.3rem 0;background:var(--green-950);border:1px solid var(--border-soft);padding:1.2rem;border-radius:16px">
              <div>
                <p class="eyebrow" style="margin-bottom:.35rem">Delivery To</p>
                <strong>${esc(order.customer.name)}</strong>
                <p style="font-size:.9rem;color:var(--muted)">${esc(order.customer.address)}<br>${esc(order.customer.city)}, ${esc(order.customer.state)} - ${esc(order.customer.pincode)}<br>📞 ${esc(order.customer.phone)}</p>
              </div>
              <div>
                <p class="eyebrow" style="margin-bottom:.35rem">Payment &amp; Summary</p>
                <p style="font-size:.92rem"><strong>Method:</strong> ${order.paymentMethod === "UPI" ? "UPI" + (order.utr ? ` (UTR: ${esc(order.utr)})` : "") : "Cash on Delivery (COD)"}</p>
                <p style="font-size:.92rem;margin-top:.3rem"><strong>Items:</strong> ${order.items.map((x) => `${esc(x.name)} × ${x.qty}`).join(", ")}</p>
                <p style="font-size:1.15rem;font-weight:800;color:var(--ochre-bright);margin-top:.5rem">Total: ${money(order.totals.total)}</p>
              </div>
            </div>

            <div class="row-actions">
              <a class="btn btn-wa" href="${esc(waUrl)}" target="_blank" rel="noopener noreferrer">${WA_ICON} Confirm / Track on WhatsApp</a>
              <a class="btn btn-primary" href="${esc(invUrl)}" target="_blank" rel="noopener">View Tax / Order Invoice</a>
              <a class="btn btn-ghost" href="#/orders">My Orders</a>
            </div>
          </div>
        </div></section>`
      );
    },

    orders: () => {
      const list = getMyOrders();
      return (
        head("My Orders", "Orders & Invoices", "View receipts, download printable invoices, or check live delivery status on WhatsApp.") +
        `<section class="section"><div class="wrap" style="max-width:900px">
          <div class="order-card" style="margin-bottom:2rem">
            <h2 style="font-size:1.5rem">Have an Order ID? Check live dispatch status</h2>
            <form id="trackLookupForm" style="display:flex;gap:.6rem;flex-wrap:wrap">
              <input id="trackInput" placeholder="Enter Order ID (e.g. JK-261112-4821)" style="flex:1;min-width:220px;padding:.85rem 1rem;border-radius:12px;border:1px solid var(--border);font:inherit;background:var(--green-950);color:var(--text)">
              <button type="submit" class="btn btn-wa btn-sm">${WA_ICON} Check Status on WhatsApp</button>
            </form>
          </div>

          ${!list.length
            ? `<div class="empty">
                <p style="font-weight:700;color:var(--text)">No orders placed from this browser yet.</p>
                <p style="font-size:.9rem;margin:.4rem 0 1.2rem">Once you place an order, your receipts and downloadable invoices appear right here automatically.</p>
                <a class="btn btn-primary" href="#/shop">Shop Jayakesh Hair Oil</a>
              </div>`
            : `<div style="display:grid;gap:1.25rem">
                ${list
                  .map(
                    (o) => `<article class="order-card">
                      <div class="order-head">
                        <div>
                          <strong style="font-size:1.15rem;color:var(--ochre-bright)">${esc(o.id)}</strong>
                          <span style="font-size:.84rem;color:var(--muted);margin-left:.6rem">${esc(new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }))}</span>
                        </div>
                        <span class="status-pill">${o.paymentMethod === "UPI" ? "UPI Order" : "COD Order"} · ${money(o.totals.total)}</span>
                      </div>
                      <div style="font-size:.93rem;color:var(--muted)">
                        <strong style="color:var(--text)">Items:</strong> ${o.items.map((x) => `${esc(x.name)} (${esc(x.size)}) × ${x.qty}`).join(", ")}<br>
                        <strong style="color:var(--text)">Deliver to:</strong> ${esc(o.customer.name)}, ${esc(o.customer.city)}, ${esc(o.customer.state)} - ${esc(o.customer.pincode)}
                      </div>
                      <div class="row-actions">
                        <a class="btn btn-primary btn-sm" href="${esc(invoiceHref(o, false))}" target="_blank" rel="noopener">📄 Printable Invoice</a>
                        <a class="btn btn-wa btn-sm" href="${esc(waLink(`Hello Jayakesh, please share the delivery status for my Order #${o.id} (${o.customer.name}).`))}" target="_blank" rel="noopener noreferrer">${WA_ICON} Track on WhatsApp</a>
                      </div>
                    </article>`
                  )
                  .join("")}
              </div>`
          }
        </div></section>`
      );
    },

    privacy: () =>
      legalPage(
        "Privacy Policy",
        `<h2>1. Information We Collect</h2>
        <p>When you place an order or submit an inquiry on <strong>jayakesh.in</strong>, we collect only the details necessary to fulfil your order and support you: your name, phone number, email address, shipping address, and order items.</p>
        <h2>2. How We Use Your Information</h2>
        <p>Your information is used strictly to confirm, pack, and deliver your Jayakesh Kerala Hair Oil order, generate your order invoice, and respond to your support messages.</p>
        <h2>3. Local Browser Storage</h2>
        <p>Your shopping cart and order receipt history ("My Orders") are stored locally in your own browser's <code>localStorage</code> for your convenience. You can clear them anytime by clearing browser site data.</p>
        <h2>4. Communications (Email &amp; WhatsApp)</h2>
        <p>Order notifications and contact inquiries are delivered securely to our store team via encrypted HTTPS email relay and/or official WhatsApp Click-to-Chat when initiated by you. We never sell or rent customer data to third parties.</p>
        <h2>5. Contact Us</h2>
        <p>To request correction or deletion of your order details, contact us at <a href="mailto:${esc(CFG.supportEmail)}">${esc(CFG.supportEmail)}</a> or WhatsApp <strong>${esc(CFG.phone)}</strong>.</p>`
      ),

    terms: () =>
      legalPage(
        "Terms & Conditions",
        `<h2>1. Overview</h2>
        <p>Welcome to <strong>Jayakesh Kerala Hair Oil</strong> (<code>jayakesh.in</code>). By browsing or placing an order on this website, you agree to these Terms &amp; Conditions.</p>
        <h2>2. Handmade Natural Product</h2>
        <p>Jayakesh Kerala Hair Oil is a traditional handmade hair care formulation crafted with natural ingredients and ZERO chemicals. Natural batch-to-batch variations in aroma or tint are normal signs of authentic ingredients. Always perform a patch test before first use and discontinue use if irritation occurs.</p>
        <h2>3. Orders &amp; Pricing</h2>
        <p>All prices are listed in Indian Rupees (INR). Orders placed via Cash on Delivery (COD) or UPI are verified via email/phone/WhatsApp prior to dispatch. We reserve the right to cancel fraudulent or unserviceable PIN code orders.</p>
        <h2>4. Intellectual Property</h2>
        <p>The Jayakesh brand name, logo, bottle artwork, and site content are the property of Jayakesh and its founders. Unauthorised reproduction is prohibited.</p>`
      ),

    shipping: () =>
      legalPage(
        "Shipping & Returns Policy",
        `<h2>1. Pan-India Shipping</h2>
        <p>We ship across India to all serviceable PIN codes. Orders above <strong>${money(CFG.freeShippingMin)}</strong> qualify for <strong>FREE shipping</strong>; standard shipping of <strong>${money(CFG.shippingFee)}</strong> applies to smaller orders.</p>
        <h2>2. Dispatch &amp; Delivery Timeline</h2>
        <p>Fresh handmade batches are typically packed and dispatched within <strong>24–48 business hours</strong> of order confirmation. Standard delivery takes <strong>3–5 business days</strong> within Kerala &amp; South India, and <strong>5–8 business days</strong> across the rest of India.</p>
        <h2>3. Damaged or Wrong Item Replacement</h2>
        <p>Because hair oil is a personal-care hygiene product, opened or used bottles cannot be returned. However, if your bottle arrives leaked, damaged in transit, or incorrect, share an unboxing photo/video on WhatsApp (<strong>${esc(CFG.phone)}</strong>) or email within <strong>48 hours of delivery</strong> for a free replacement or full refund.</p>
        <h2>4. Order Cancellations</h2>
        <p>You may cancel an order free of charge anytime before it is handed over to our courier partner by messaging us on WhatsApp with your Order ID.</p>`
      ),

    notfound: () =>
      head("404", "Page not found") + `<section class="section"><div class="wrap"><a class="btn btn-primary" href="#/">Back to home</a></div></section>`
  };

  function renderTotalsRows(totals) {
    return `
      <div class="row"><span>Subtotal</span><span>${money(totals.subtotal)}</span></div>
      ${totals.discount > 0 ? `<div class="row" style="color:var(--lime);font-weight:700"><span>Coupon (${esc(appliedCoupon)})</span><span>−${money(totals.discount)}</span></div>` : ""}
      <div class="row"><span>Delivery</span><span>${totals.subtotal === null ? "To confirm" : totals.shipping === 0 ? '<strong style="color:var(--lime)">FREE</strong>' : money(totals.shipping)}</span></div>
      ${totals.codFee > 0 ? `<div class="row"><span>COD Fee</span><span>${money(totals.codFee)}</span></div>` : ""}
      <div class="row grand"><span>Total Payable</span><span>${money(totals.total)}</span></div>`;
  }

  const titles = {
    home: "Jayakesh Kerala Hair Oil | Handmade Kerala Hair Oil",
    shop: "Shop Kerala Hair Oil | Jayakesh",
    product: "Jayakesh Kerala Hair Oil 200 ml | Jayakesh",
    ingredients: "Explore the Ingredients | Jayakesh",
    about: "About Us & Founders | Jayakesh",
    contact: "Contact Us | Jayakesh",
    cart: "Shopping Cart | Jayakesh",
    checkout: "Secure Checkout | Jayakesh",
    "order-success": "Order Confirmed | Jayakesh",
    orders: "My Orders & Invoices | Jayakesh",
    privacy: "Privacy Policy | Jayakesh",
    terms: "Terms & Conditions | Jayakesh",
    shipping: "Shipping & Returns | Jayakesh",
    notfound: "Page Not Found | Jayakesh"
  };

  /* ---------- Router ---------- */
  function route() {
    const raw = (location.hash.replace(/^#\/?/, "") || "home").split("?")[0];
    return { name: views[raw] ? raw : "notfound" };
  }

  let sceneTimer = null;
  let ingTimers = [];
  let ingObs = null;

  function render() {
    const { name } = route();
    clearInterval(sceneTimer);
    ingTimers.forEach(clearTimeout);
    ingTimers = [];
    if (ingObs) ingObs.disconnect();

    const app = $("#app");
    app.innerHTML = `<div class="view">${views[name]()}</div>`;
    document.title = titles[name] || CFG.storeName;

    $$("#nav a").forEach((a) => {
      const target = "#/" + (name === "home" ? "" : name);
      a.setAttribute("aria-current", a.getAttribute("href") === target ? "page" : "false");
    });

    initView(name);
  }

  /* ---------- Scroll Progress, Word Reveal & 3D Tilt ---------- */
  let pxEls = [];
  function onScroll() {
    $("#header").classList.toggle("solid", window.scrollY > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    $("#progress").style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
    if (reduce) return;
    const vh = window.innerHeight;
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
      Array.from(node.childNodes).forEach((c) => {
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
    if (reduce || !window.matchMedia("(hover: hover)").matches) return;
    $$(".pcard:not(.soon), .showcase .pic, .card").forEach((el) => {
      el.classList.add("tilt");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(2) + "deg");
        el.style.setProperty("--rx", (-((e.clientY - r.top) / r.height - 0.5) * 10).toFixed(2) + "deg");
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ---------- View Initializers ---------- */
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

    // Ingredient cards flip
    const ingGrid = $("[data-ing]");
    if (ingGrid) {
      const cards = $$(".ing", ingGrid);
      cards.forEach((c) => {
        c.addEventListener("click", () => c.setAttribute("aria-pressed", c.classList.toggle("flip")));
        const im = $("img", c);
        if (im) {
          im.addEventListener(
            "error",
            () => {
              if (im.dataset.art && ART[im.dataset.art]) im.outerHTML = ART[im.dataset.art];
              else im.remove();
            },
            { once: true }
          );
        }
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
              }, 2600 + i * 550)
            )
          );
        },
        { threshold: 0.25 }
      );
      ingObs.observe(ingGrid);
    }

    // Product buy box controls
    let qty = 1;
    $$("[data-act]").forEach((b) =>
      b.addEventListener("click", () => {
        const a = b.dataset.act;
        const out = $("[data-qty]");
        const wa = $("[data-wa]");
        if (a === "dec" || a === "inc") {
          qty = Math.max(1, Math.min(20, qty + (a === "inc" ? 1 : -1)));
          if (out) out.textContent = qty;
          if (wa) wa.href = waLink(`Hello Jayakesh, I would like to order ${P.name} (${P.size}) × ${qty}.`);
        }
        if (a === "add") addToCart(P.id, qty, true);
        if (a === "add1") addToCart(b.dataset.pid || P.id, 1, true);
        if (a === "buy") {
          cart = [{ id: P.id, qty }];
          saveCart();
          location.hash = "#/checkout";
        }
      })
    );

    // Line-item qty buttons inside main views
    $$("main .line-item [data-q]").forEach((b) =>
      b.addEventListener("click", () => setItemQty(b.dataset.id || P.id, +b.dataset.q))
    );

    // Copy buttons
    $$("[data-copy]").forEach((b) =>
      b.addEventListener("click", () => {
        const txt = b.dataset.copy;
        if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(() => {});
        toast("Copied: " + txt);
      })
    );

    // Review slider & modal button
    $$("[data-open-review]").forEach((b) => b.addEventListener("click", () => openReviewModal(true)));
    $$("[data-rv]").forEach((b) =>
      b.addEventListener("click", () => {
        ri = (ri + +b.dataset.rv + REVIEWS.length) % REVIEWS.length;
        const wrap = $("#sliderWrap");
        if (wrap) {
          wrap.outerHTML = reviewsHtml();
          initView("rv");
        }
      })
    );

    // Coupon apply button
    const applyBtn = $("#applyCouponBtn");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        const inp = $("#couponInput");
        const code = (inp ? inp.value : "").trim().toUpperCase();
        if (!code) {
          appliedCoupon = "";
          saveCart();
          toast("Coupon cleared");
          render();
          return;
        }
        const sub = cart.reduce((s, i) => s + (getProduct(i.id).price || 0) * i.qty, 0);
        const res = evaluateCoupon(code, sub);
        appliedCoupon = code;
        saveCart();
        if (res.valid) toast(`Coupon ${code} applied! Saved ${money(res.discount)}`);
        else toast(res.reason || "Invalid coupon code");
        render();
      });
    }

    // Track lookup form on My Orders
    const trackForm = $("#trackLookupForm");
    if (trackForm) {
      trackForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const val = ($("#trackInput").value || "").trim().toUpperCase();
        if (!val) {
          toast("Please enter your Order ID");
          return;
        }
        const match = getMyOrders().find((o) => o.id.toUpperCase() === val);
        if (match) {
          location.hash = `#/order-success?order=${encodeURIComponent(match.id)}`;
          return;
        }
        window.open(waLink(`Hello Jayakesh, please share the live status of my Order #${val}.`), "_blank", "noopener");
      });
    }

    initMotion(io);
    if (name === "home") initHome();
    if (name === "contact" && $("#contactForm")) initContactForm($("#contactForm"));
    if (name === "checkout" && $("#orderForm")) initCheckoutForm($("#orderForm"));
  }

  let heroPointerBound = false;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  function initHome() {
    const stage = $("#stage");
    if (!reduce && stage) {
      stage.style.perspective = "1200px";
      const loop = () => {
        const st = $("#stage");
        const bt = $("#bottle");
        if (!st || !bt) { raf = 0; return; }
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        bt.style.transform = `rotateY(${(cx * 16).toFixed(2)}deg) rotateX(${(-cy * 10).toFixed(2)}deg)`;
        $$("[data-d]", st).forEach((el) => {
          el.style.transform = `translate(${(cx * +el.dataset.d * -1).toFixed(1)}px, ${(cy * 18).toFixed(1)}px)`;
        });
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
      };
      if (!heroPointerBound) {
        heroPointerBound = true;
        window.addEventListener(
          "pointermove",
          (e) => {
            if (!$("#stage")) return;
            tx = (e.clientX / window.innerWidth) * 2 - 1;
            ty = (e.clientY / window.innerHeight) * 2 - 1;
            if (!raf) raf = requestAnimationFrame(loop);
          },
          { passive: true }
        );
      }
    }

    // Optional local video file auto-detection
    const vw = $(".video-wrap");
    if (vw && !CFG.videoSrc && CFG.videoFile && location.protocol !== "file:") {
      const v = document.createElement("video");
      v.controls = true;
      v.playsInline = true;
      v.preload = "metadata";
      v.poster = IMG;
      v.setAttribute("aria-label", "Jayakesh brand film");
      v.style.cssText = "width:100%;height:100%;object-fit:cover";
      v.addEventListener("loadedmetadata", () => {
        clearInterval(sceneTimer);
        if (vw.isConnected) {
          vw.innerHTML = "";
          vw.appendChild(v);
        }
      });
      v.src = CFG.videoFile;
    }

    const scene = $("#scene");
    if (scene) {
      const S = [
        ["Handmade.", "50% 30%", 1.5],
        ["ZERO chemicals.", "50% 60%", 1.15],
        ["Legacy in every drop.", "50% 50%", 0.9]
      ];
      let i = 0;
      const show = () => {
        if (!scene.isConnected) return;
        const s = S[i++ % 3];
        scene.style.animation = "none";
        void scene.offsetWidth;
        scene.style.animation = "";
        scene.innerHTML = `<div class="bg" style="position:absolute;inset:0;display:grid;place-items:center;opacity:.55;transform:scale(${s[2]})"><img src="${IMG}" alt="" style="height:125%;width:auto;object-fit:cover;object-position:${s[1]}"></div><p class="cap">${s[0]}</p>`;
      };
      show();
      if (!reduce) sceneTimer = setInterval(show, 3600);
    }
  }

  /* ---------- Validation & Form Handlers ---------- */
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
  const cleanPhone = (s) => String(s || "").replace(/\D/g, "");

  function showErrors(form, errs) {
    $$(".field", form).forEach((f) => {
      const inp = $("input,textarea,select", f);
      const er = $(".err", f);
      if (!inp || !er) return;
      const m = errs[inp.name || inp.id];
      er.textContent = m || "";
      if (m) inp.setAttribute("aria-invalid", "true");
      else inp.removeAttribute("aria-invalid");
    });
    if (Object.keys(errs).length) {
      const first = $('[aria-invalid="true"]', form);
      if (first) first.focus();
      return false;
    }
    return true;
  }

  function initContactForm(form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      const errs = {};
      if ((d.name || "").trim().length < 2) errs.name = "Enter your name";
      if (!isEmail(d.email)) errs.email = "Enter a valid email address";
      if (cleanPhone(d.phone).length < 10) errs.phone = "Enter a valid 10-digit phone number";
      if ((d.subject || "").trim().length < 3) errs.subject = "Enter a subject";
      if ((d.message || "").trim().length < 10) errs.message = "Please write at least 10 characters";

      const msg = $("#formMsg");
      msg.className = "";
      msg.textContent = "";
      if (!showErrors(form, errs)) return;

      const btn = $("#contactBtn");
      btn.disabled = true;
      btn.textContent = "Sending message...";

      const waBackup = waLink(
        [
          "Hello Jayakesh, I have an inquiry:",
          `*Subject:* ${d.subject.trim()}`,
          `*Name:* ${d.name.trim()}`,
          `*Phone:* ${d.phone.trim()}`,
          `*Email:* ${d.email.trim()}`,
          "",
          d.message.trim()
        ].join("\n")
      );

      let sentOk = false;
      try {
        await sendOwnerEmail({
          _subject: `✉️ Jayakesh Inquiry: ${d.subject.trim()} (${d.name.trim()})`,
          _replyto: d.email.trim(),
          Name: d.name.trim(),
          Phone: d.phone.trim(),
          Email: d.email.trim(),
          Subject: d.subject.trim(),
          Message: d.message.trim(),
          Reply_on_WhatsApp: `https://wa.me/91${cleanPhone(d.phone).slice(-10)}`
        });
        sentOk = true;
      } catch (err) {
        sentOk = false;
      }

      btn.disabled = false;
      btn.textContent = "Send message";

      if (sentOk) {
        form.reset();
        msg.className = "alert ok";
        msg.innerHTML = `<strong>Message sent!</strong> Thank you for reaching out — we will reply to your email/WhatsApp shortly. Need an instant reply? <a href="${esc(waBackup)}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;color:var(--ochre-bright);font-weight:700">Send on WhatsApp too →</a>`;
        toast("Inquiry sent!");
      } else {
        window.open(waBackup, "_blank", "noopener");
        msg.className = "alert ok";
        msg.innerHTML = `WhatsApp has opened with your message ready to send. <a href="${esc(waBackup)}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;color:var(--ochre-bright);font-weight:700">Open WhatsApp again</a>`;
      }
    });
  }

  function initCheckoutForm(form) {
    const updatePayUI = () => {
      const checked = $('input[name="paymentMethod"]:checked', form);
      const method = checked ? checked.value : "COD";
      $$(".pay-opt", form).forEach((lbl) => {
        const r = $('input[type="radio"]', lbl);
        lbl.classList.toggle("active", r && r.checked);
      });
      const upiBox = $("#upiBox");
      if (upiBox) upiBox.classList.toggle("hidden", method !== "UPI");

      const totals = calcTotals(method);
      const totalsEl = $("#checkoutTotals");
      if (totalsEl) totalsEl.innerHTML = renderTotalsRows(totals);
      const btnTot = $("[data-btn-total]");
      if (btnTot) btnTot.textContent = money(totals.total);
      const upiAmt = $("[data-upi-amt]");
      if (upiAmt) upiAmt.textContent = money(totals.total);

      const uri = buildUpiUri(totals.total);
      if (uri && $("#upiQrMount") && window.jkQrSvg) {
        $("#upiQrMount").innerHTML = window.jkQrSvg(uri);
      }
      if (uri && $("#upiDeepLink")) {
        $("#upiDeepLink").href = uri;
      }
    };

    $$('input[name="paymentMethod"]', form).forEach((r) => r.addEventListener("change", updatePayUI));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      const method = d.paymentMethod || "COD";
      const errs = {};

      if ((d.name || "").trim().length < 2) errs.name = "Enter recipient full name";
      if (cleanPhone(d.phone).length < 10) errs.phone = "Enter a valid 10-digit mobile number";
      if (!isEmail(d.email)) errs.email = "Enter a valid email address";
      if ((d.address || "").trim().length < 8) errs.address = "Enter complete house/street address";
      if ((d.city || "").trim().length < 2) errs.city = "Enter city or town";
      if (!/^\d{6}$/.test((d.pincode || "").trim())) errs.pincode = "Enter a valid 6-digit PIN code";
      if (method === "UPI" && CFG.upiId && (d.utr || "").trim() && !/^\d{10,18}$/.test((d.utr || "").trim())) {
        errs.utr = "Enter a valid 12-digit numeric UTR reference";
      }

      const msg = $("#formMsg");
      msg.className = "";
      msg.textContent = "";
      if (!showErrors(form, errs)) return;

      const btn = $("#placeOrderBtn");
      btn.disabled = true;
      btn.textContent = "Confirming your order...";

      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const rand = Math.floor(1000 + Math.random() * 9000);
      const orderId = `JK-${yy}${mm}${dd}-${rand}`;

      const totals = calcTotals(method);
      const items = cart.map((i) => {
        const prod = getProduct(i.id);
        return {
          id: prod.id,
          name: prod.name,
          size: prod.size,
          qty: i.qty,
          price: prod.price
        };
      });

      const customer = {
        name: d.name.trim(),
        phone: d.phone.trim(),
        email: d.email.trim(),
        address: d.address.trim(),
        city: d.city.trim(),
        state: d.state || "Kerala",
        pincode: d.pincode.trim(),
        notes: (d.notes || "").trim()
      };

      saveCustomerLocal(customer);

      const order = {
        id: orderId,
        createdAt: now.toISOString(),
        paymentMethod: method,
        utr: (d.utr || "").trim(),
        coupon: totals.couponValid ? appliedCoupon : "",
        items,
        totals,
        customer
      };
      order.token = encodeOrderToken(order);

      saveOrderLocal(order);

      if (CFG.autoOpenWhatsAppOnOrder) {
        window.open(waLink(fullOrderWaMsg(order)), "_blank", "noopener");
      }

      let mailStatus = "sent";
      try {
        const custDigits = cleanPhone(customer.phone).slice(-10);
        const emailPayload = {
          _subject: `🛒 New Order ${order.id} — ${money(totals.total)} (${customer.name})`,
          _replyto: customer.email,
          Order_ID: order.id,
          Order_Date: now.toLocaleString("en-IN"),
          Items: items.map((x) => `${x.name} (${x.size}) × ${x.qty} = ${money(x.price * x.qty)}`).join(" | "),
          Subtotal: money(totals.subtotal),
          Discount: totals.discount > 0 ? `-${money(totals.discount)} (${order.coupon})` : "₹0",
          Shipping: totals.shipping === 0 ? "FREE" : money(totals.shipping),
          Total_Payable: money(totals.total),
          Payment_Method: method === "UPI" ? `UPI${order.utr ? " (UTR: " + order.utr + ")" : ""}` : "Cash on Delivery (COD)",
          Customer_Name: customer.name,
          Customer_Phone: customer.phone,
          Customer_Email: customer.email,
          Delivery_Address: `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
          Delivery_Notes: customer.notes || "—",
          WhatsApp_Customer: `https://wa.me/91${custDigits}?text=${encodeURIComponent(`Hello ${customer.name}, thank you for your Jayakesh Order #${order.id} (${money(totals.total)})! Your order is confirmed.`)}`,
          Printable_Invoice: invoiceHref(order, true)
        };
        if (CFG.ccCustomerOnOrder && customer.email) {
          emailPayload._cc = customer.email;
        }
        await sendOwnerEmail(emailPayload);
      } catch (err) {
        mailStatus = "local";
      }

      cart = [];
      appliedCoupon = "";
      saveCart();
      toast(`Order ${order.id} placed!`);
      location.hash = `#/order-success?order=${encodeURIComponent(order.id)}&mail=${mailStatus}`;
    });
  }

  /* ---------- Boot & Curtain Transitions ---------- */
  (function boot() {
    // Intro loader animation (waits for PNG load + decode before starting timeline)
    const L = $("#loader");
    if (L) {
      const leaf = $(".leaf", L);
      const rest = $(".rest", L);
      const sh = $(".shine", L);
      if (sh) sh.style.webkitMaskImage = sh.style.maskImage = `url("${LOGO_REST}")`;

      const waitImg = (img) =>
        new Promise((resolve) => {
          if (!img) return resolve();
          const finish = () => {
            if (img.decode) img.decode().catch(() => {}).finally(resolve);
            else resolve();
          };
          if (img.complete && img.naturalWidth > 0) finish();
          else {
            img.addEventListener("load", finish, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }
        });

      let started = false;
      const startIntro = () => {
        if (started) return;
        started = true;
        requestAnimationFrame(() => {
          void L.offsetWidth;
          L.classList.add("go");
          setTimeout(() => L.classList.add("gone"), 4200);
        });
      };

      Promise.race([
        Promise.all([waitImg(leaf), waitImg(rest)]),
        new Promise((r) => setTimeout(r, 2500))
      ]).then(startIntro);

      // Ultimate safety net if browser tab was backgrounded
      setTimeout(() => L.classList.add("gone"), 7500);
    }

    $("#yr").textContent = new Date().getFullYear();
    $("#waFloat").href = waLink(inquiry());
    $("#footContact").innerHTML = [
      `<li><a href="${esc(waLink(inquiry()))}" target="_blank" rel="noopener noreferrer">WhatsApp Order &amp; Chat</a></li>`,
      CFG.phone ? `<li><a href="${tel(CFG.phone)}">${esc(CFG.phone)}</a></li>` : "",
      CFG.supportEmail ? `<li><a href="mailto:${esc(CFG.supportEmail)}">${esc(CFG.supportEmail)}</a></li>` : "",
      CFG.instagram ? `<li><a href="${esc(CFG.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a></li>` : "",
      CFG.address ? `<li>${esc(CFG.address)}</li>` : ""
    ]
      .filter(Boolean)
      .join("");

    window.addEventListener("scroll", onScroll, { passive: true });

    let navBusy = false;
    let navAgain = false;
    function go() {
      if (reduce) {
        render();
        window.scrollTo(0, 0);
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
        duration: 480,
        easing: ease,
        fill: "forwards"
      })
        .finished.then(() => {
          render();
          window.scrollTo(0, 0);
          return c.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], {
            duration: 580,
            easing: ease,
            fill: "forwards"
          }).finished;
        })
        .then(() => {
          c.getAnimations().forEach((a) => a.cancel());
          c.style.display = "none";
          navBusy = false;
          if (navAgain) {
            navAgain = false;
            render();
            window.scrollTo(0, 0);
          }
        })
        .catch(() => {
          c.style.display = "none";
          navBusy = false;
          render();
          window.scrollTo(0, 0);
        });
    }

    window.addEventListener("hashchange", go);
    paintCart();
    render();
  })();
})();
