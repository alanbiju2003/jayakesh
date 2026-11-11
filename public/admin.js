/* =====================================================================
   JAYAKESH ADMIN PORTAL — LIVE ORDERS, NOTIFICATIONS, EMAILS & SETTINGS
   ===================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
const money = (n) => (n === null || n === undefined ? "—" : "₹" + Number(n).toLocaleString("en-IN"));

let token = localStorage.getItem("jk_admin_token") || "";
let currentTab = "overview";
let adminStats = null;
let emailDiag = null;
let lastUnreadCount = null;
let pollTimer = null;

function toast(msg) {
  const el = $("#admToast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

// Gentle two-note chime via Web Audio API when a new order arrives
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [587.33, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.14, ctx.currentTime + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.14);
      osc.stop(ctx.currentTime + i * 0.14 + 0.36);
    });
  } catch {}
}

async function api(url, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    showLogin();
    throw new Error(data.error || "Session expired. Please sign in again.");
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function showLogin() {
  clearInterval(pollTimer);
  $("#adminApp").classList.add("hidden");
  $("#loginView").classList.remove("hidden");
}

function showDashboard() {
  $("#loginView").classList.add("hidden");
  $("#adminApp").classList.remove("hidden");
  refreshHeaderStats();
  switchTab(currentTab);
  clearInterval(pollTimer);
  pollTimer = setInterval(pollUpdates, 20000);
}

$("#loginForm").onsubmit = async (e) => {
  e.preventDefault();
  const errEl = $("#loginErr");
  errEl.textContent = "";
  const fd = Object.fromEntries(new FormData(e.target));
  try {
    const data = await api("/api/admin/login", { method: "POST", body: fd });
    token = data.token;
    localStorage.setItem("jk_admin_token", token);
    showDashboard();
  } catch (err) {
    errEl.textContent = err.message;
  }
};

$("#logoutBtn").onclick = async () => {
  await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
  token = "";
  localStorage.removeItem("jk_admin_token");
  showLogin();
};

function openDrawer(html) {
  $("#drawerContent").innerHTML = html;
  $("#drawerBackdrop").classList.add("open");
}
function closeDrawer() {
  $("#drawerBackdrop").classList.remove("open");
}
$("#drawerBackdrop").addEventListener("click", (e) => {
  if (e.target.id === "drawerBackdrop") closeDrawer();
});

/* ---------- Notifications & Live Polling ---------- */
$("#enablePushBtn").onclick = async () => {
  playChime();
  if (!("Notification" in window)) {
    toast("Audio alerts active! (Browser popups unsupported here)");
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    $("#enablePushBtn").textContent = "🔔 Alerts Active";
    toast("Desktop & sound order alerts enabled!");
  } else {
    toast("Notification permission declined in browser settings");
  }
};

async function refreshHeaderStats() {
  try {
    const me = await api("/api/admin/me");
    adminStats = me.stats;
    emailDiag = me.emailStatus;

    const setBadge = (id, count) => {
      const el = $(id);
      if (!el) return;
      el.textContent = count;
      el.classList.toggle("hidden", !count || count <= 0);
    };
    setBadge("#navPendingCnt", adminStats.pendingOrders);
    setBadge("#navRevCnt", adminStats.pendingReviews);
    setBadge("#navInqCnt", adminStats.openInquiries);
    setBadge("#notifBadge", adminStats.unreadNotifications);

    const banner = $("#storageBanner");
    if (adminStats.storage?.warning) {
      banner.textContent = "⚠️ " + adminStats.storage.warning;
      banner.classList.remove("hidden");
    } else {
      banner.classList.add("hidden");
    }
  } catch {}
}

async function pollUpdates() {
  try {
    const nData = await api("/api/admin/notifications?limit=15");
    if (lastUnreadCount !== null && nData.unreadCount > lastUnreadCount) {
      playChime();
      const newest = nData.items[0];
      if (newest && "Notification" in window && Notification.permission === "granted") {
        new Notification(newest.title, { body: newest.message, icon: "/assets/favicon.png" });
      }
      toast("🔔 " + (newest ? newest.title : "New store activity!"));
      if (currentTab === "overview" || currentTab === "orders") switchTab(currentTab);
    }
    lastUnreadCount = nData.unreadCount;
    refreshHeaderStats();
  } catch {}
}

$("#notifBellBtn").onclick = async () => {
  const pop = $("#notifDropdown");
  if (!pop.classList.contains("hidden")) {
    pop.classList.add("hidden");
    return;
  }
  pop.classList.remove("hidden");
  pop.innerHTML = '<p style="padding:.6rem;color:var(--muted)">Loading alerts...</p>';
  try {
    const data = await api("/api/admin/notifications?limit=25");
    lastUnreadCount = data.unreadCount;
    if (!data.items.length) {
      pop.innerHTML = '<p style="padding:1rem;text-align:center;color:var(--muted)">No notifications yet.</p>';
      return;
    }
    pop.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:.3rem .5rem .6rem;border-bottom:1px solid var(--border)">
        <strong>Recent Alerts</strong>
        <button type="button" class="btn btn-outline btn-sm" id="markAllReadBtn">Mark all read</button>
      </div>
      ${data.items
        .map(
          (n) => `<div class="notif-item ${n.is_read ? "" : "unread"}">
            <div style="font-weight:700">${esc(n.title)}</div>
            <div style="color:var(--muted);margin-top:.15rem">${esc(n.message)}</div>
            <div style="font-size:.73rem;color:var(--muted);margin-top:.25rem">${new Date(n.created_at).toLocaleString("en-IN")}</div>
          </div>`
        )
        .join("")}
    `;
    $("#markAllReadBtn").onclick = async () => {
      await api("/api/admin/notifications/read", { method: "POST", body: {} });
      lastUnreadCount = 0;
      refreshHeaderStats();
      pop.classList.add("hidden");
    };
  } catch (err) {
    pop.innerHTML = `<p style="color:#b3261e;padding:.6rem">${esc(err.message)}</p>`;
  }
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".notif-wrap")) $("#notifDropdown")?.classList.add("hidden");
});

/* ---------- Navigation ---------- */
const tabTitles = {
  overview: "Dashboard Overview",
  orders: "Orders & Dispatch Management",
  products: "Products, Pricing & Stock",
  coupons: "Discount & Promo Codes",
  reviews: "Customer Reviews Moderation",
  inquiries: "Customer Support Inquiries",
  emails: "Automated Emails & Outbox Logs",
  settings: "Store, UPI Payment & Email Setup",
};

$$("#sideNav button").forEach((b) => {
  b.onclick = () => switchTab(b.dataset.tab);
});

function switchTab(tab) {
  currentTab = tab;
  $$("#sideNav button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  $("#tabTitle").textContent = tabTitles[tab] || "Dashboard";
  if (tab === "overview") renderOverview();
  if (tab === "orders") renderOrders();
  if (tab === "products") renderProducts();
  if (tab === "coupons") renderCoupons();
  if (tab === "reviews") renderReviews();
  if (tab === "inquiries") renderInquiries();
  if (tab === "emails") renderEmails();
  if (tab === "settings") renderSettings();
}

/* ---------- 1. OVERVIEW ---------- */
async function renderOverview() {
  const host = $("#tabHost");
  host.innerHTML = "<p>Loading store metrics...</p>";
  const [me, ordData] = await Promise.all([
    api("/api/admin/me"),
    api("/api/admin/orders?limit=8"),
  ]);
  const s = me.stats;
  const mail = me.emailStatus;

  const mailPill =
    mail.activeProvider === "preview"
      ? `<span class="tag pending">Preview Mode (Configure Gmail SMTP or Resend in Settings)</span>`
      : `<span class="tag sent">Live (${esc(mail.activeProvider.toUpperCase())})</span>`;

  host.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi"><div class="lbl">Total Revenue</div><div class="val">${money(s.totalRevenue)}</div><div class="sub">Excluding cancelled orders</div></div>
      <div class="kpi"><div class="lbl">Total Orders</div><div class="val">${s.totalOrders}</div><div class="sub">${s.todayOrders} placed today</div></div>
      <div class="kpi"><div class="lbl">To Fulfil / Pack</div><div class="val">${s.pendingOrders}</div><div class="sub">${s.shippedOrders} currently in transit</div></div>
      <div class="kpi"><div class="lbl">Delivered</div><div class="val">${s.deliveredOrders}</div><div class="sub">${s.openInquiries} open inquiries</div></div>
    </div>

    <div class="panel" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
      <div>
        <strong>System Health:</strong>
        <span style="margin-left:.5rem">Database: <span class="tag approved">${esc(s.storage?.driver?.toUpperCase() || "SQLITE")}</span></span>
        <span style="margin-left:.5rem">Email Engine: ${mailPill}</span>
      </div>
      <div style="display:flex;gap:.5rem">
        <button type="button" class="btn btn-outline btn-sm" onclick="switchTab('settings')">⚙️ Configure Emails &amp; UPI</button>
        <button type="button" class="btn btn-sm" onclick="switchTab('orders')">View All Orders →</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head"><h2>Recent Orders</h2></div>
      ${ordersTableMarkup(ordData.orders)}
    </div>
  `;
  bindOrderRowClicks(host);
}

/* ---------- 2. ORDERS ---------- */
function ordersTableMarkup(orders) {
  if (!orders.length) return '<p style="color:var(--muted);padding:1rem 0">No orders found matching this filter.</p>';
  return `<div class="table-wrap"><table>
    <thead>
      <tr>
        <th>Order #</th>
        <th>Date</th>
        <th>Customer</th>
        <th>Location</th>
        <th>Items</th>
        <th>Total</th>
        <th>Payment</th>
        <th>Order Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      ${orders
        .map(
          (o) => `<tr>
            <td><strong>${esc(o.order_number)}</strong></td>
            <td style="font-size:.82rem;color:var(--muted)">${new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
            <td><strong>${esc(o.customer_name)}</strong><div style="font-size:.8rem;color:var(--muted)">${esc(o.customer_phone)}</div></td>
            <td>${esc(o.city)}, ${esc(o.state)}<div style="font-size:.78rem;color:var(--muted)">PIN ${esc(o.pincode)}</div></td>
            <td>${(o.items || []).reduce((a, b) => a + Number(b.qty || 0), 0)} bottle(s)</td>
            <td><strong>${money(o.total)}</strong></td>
            <td><span class="tag ${esc(o.payment_status)}">${esc(o.payment_method.toUpperCase())} · ${esc(o.payment_status.replace(/_/g, " "))}</span>${o.upi_utr ? `<div style="font-size:.74rem;margin-top:2px">UTR: <code>${esc(o.upi_utr)}</code></div>` : ""}</td>
            <td><span class="tag ${esc(o.order_status)}">${esc(o.order_status)}</span></td>
            <td><button type="button" class="btn btn-outline btn-sm" data-manage-order="${esc(o.id)}">Manage</button></td>
          </tr>`
        )
        .join("")}
    </tbody>
  </table></div>`;
}

function bindOrderRowClicks(container) {
  $$("[data-manage-order]", container).forEach((b) => {
    b.onclick = () => openOrderDetail(b.dataset.manageOrder);
  });
}

async function renderOrders() {
  const host = $("#tabHost");
  host.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <select class="inp" id="ordStatusFilter" style="width:auto">
            <option value="all">All Statuses</option>
            <option value="placed">Placed (New)</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input class="inp" id="ordSearch" placeholder="Search Order #, Name, Phone, Email..." style="width:270px">
          <button type="button" class="btn btn-sm" id="ordFilterBtn">Search</button>
        </div>
      </div>
      <div id="ordersListBox"><p>Loading orders...</p></div>
    </div>
  `;

  const load = async () => {
    const status = $("#ordStatusFilter").value;
    const search = $("#ordSearch").value;
    const data = await api(`/api/admin/orders?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`);
    $("#ordersListBox").innerHTML = ordersTableMarkup(data.orders);
    bindOrderRowClicks($("#ordersListBox"));
  };
  $("#ordFilterBtn").onclick = load;
  $("#ordStatusFilter").onchange = load;
  $("#ordSearch").onkeydown = (e) => { if (e.key === "Enter") load(); };
  load();
}

async function openOrderDetail(id) {
  const { order: o } = await api(`/api/admin/orders/${encodeURIComponent(id)}`);
  const cleanPh = o.customer_phone.replace(/\D/g, "");
  const waHref = `https://wa.me/${cleanPh.length === 10 ? "91" + cleanPh : cleanPh}?text=${encodeURIComponent(
    `Hello ${o.customer_name}, update from Jayakesh regarding your order #${o.order_number} (${money(o.total)}): `
  )}`;
  const invHref = `/invoice?order=${encodeURIComponent(o.order_number)}&phone=${encodeURIComponent(o.customer_phone)}`;

  openDrawer(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <div>
        <div style="font-size:.75rem;text-transform:uppercase;color:var(--muted);font-weight:700">Manage Order</div>
        <h2 style="margin:0">${esc(o.order_number)}</h2>
      </div>
      <button type="button" class="btn btn-outline btn-sm" onclick="closeDrawer()">✕ Close</button>
    </div>

    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.2rem">
      <a class="btn btn-outline btn-sm" href="${esc(invHref)}" target="_blank">🖨️ Print Invoice</a>
      <a class="btn btn-wa btn-sm" href="${esc(waHref)}" target="_blank" rel="noopener">💬 WhatsApp Customer</a>
      <button type="button" class="btn btn-outline btn-sm" id="resendConfBtn">✉️ Resend Confirmation Email</button>
    </div>

    <div style="background:#f6f8f5;border-radius:14px;padding:1rem;margin-bottom:1.2rem;font-size:.9rem">
      <strong>${esc(o.customer_name)}</strong> · <a href="tel:${esc(o.customer_phone)}" style="color:var(--green-800);font-weight:700">${esc(o.customer_phone)}</a> · ${esc(o.customer_email)}<br>
      <div style="margin-top:.35rem;color:var(--muted)">
        ${esc(o.address_line)}${o.landmark ? `, ${esc(o.landmark)}` : ""}, ${esc(o.city)}, ${esc(o.state)} — <strong>${esc(o.pincode)}</strong>
      </div>
      ${o.notes ? `<div style="margin-top:.4rem;color:#7a5200"><strong>Customer Note:</strong> ${esc(o.notes)}</div>` : ""}
    </div>

    <div style="margin-bottom:1.2rem">
      ${(o.items || []).map((it) => `<div style="display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--border);font-size:.9rem"><span>${esc(it.name)} (${esc(it.size)}) × <strong>${it.qty}</strong></span><strong>${money(it.price * it.qty)}</strong></div>`).join("")}
      ${o.discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:.3rem 0;color:#157a2c;font-size:.86rem"><span>Discount (${esc(o.coupon_code)})</span><span>−${money(o.discount)}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;padding:.3rem 0;font-size:.86rem;color:var(--muted)"><span>Shipping</span><span>${o.shipping_fee === 0 ? "FREE" : money(o.shipping_fee)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:.5rem 0;font-size:1.08rem;font-weight:800"><span>Grand Total (${esc(o.payment_method.toUpperCase())})</span><span>${money(o.total)}</span></div>
    </div>

    <form id="updateOrderForm" style="display:grid;gap:.9rem">
      <div class="form-grid">
        <div class="fg">
          <label>Order Status</label>
          <select class="inp" name="order_status">
            ${["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"]
              .map((st) => `<option value="${st}" ${o.order_status === st ? "selected" : ""}>${st.toUpperCase()}</option>`)
              .join("")}
          </select>
        </div>
        <div class="fg">
          <label>Payment Status</label>
          <select class="inp" name="payment_status">
            ${["cod_pending", "awaiting_upi", "upi_verification_pending", "paid", "refunded"]
              .map((ps) => `<option value="${ps}" ${o.payment_status === ps ? "selected" : ""}>${ps.replace(/_/g, " ").toUpperCase()}</option>`)
              .join("")}
          </select>
        </div>
      </div>

      <div class="fg">
        <label>UPI UTR / Transaction Reference</label>
        <input class="inp" name="upi_utr" value="${esc(o.upi_utr || "")}" placeholder="12-digit UTR number">
      </div>

      <div class="form-grid">
        <div class="fg">
          <label>Courier Partner (e.g. Delhivery, India Post, DTDC)</label>
          <input class="inp" name="courier_name" value="${esc(o.courier_name || "")}" placeholder="Courier name">
        </div>
        <div class="fg">
          <label>AWB / Tracking Number</label>
          <input class="inp" name="tracking_number" value="${esc(o.tracking_number || "")}" placeholder="Tracking number">
        </div>
      </div>

      <div class="fg">
        <label>Direct Courier Tracking Link (URL)</label>
        <input class="inp" name="tracking_url" value="${esc(o.tracking_url || "")}" placeholder="https://...">
      </div>

      <div class="fg">
        <label>Internal Admin Notes (Private)</label>
        <textarea class="inp" name="admin_notes" rows="2">${esc(o.admin_notes || "")}</textarea>
      </div>

      <label style="display:flex;align-items:center;gap:.5rem;font-size:.88rem;font-weight:600">
        <input type="checkbox" name="notify_customer" checked>
        Automatically send Status &amp; Tracking Update Email to customer (${esc(o.customer_email)})
      </label>

      <button type="submit" class="btn" style="padding:.8rem">Save Order &amp; Notify Customer</button>
    </form>
  `);

  $("#resendConfBtn").onclick = async () => {
    try {
      await api(`/api/admin/orders/${encodeURIComponent(o.id)}/resend-email`, {
        method: "POST",
        body: { kind: "confirmation" },
      });
      toast("Order confirmation email triggered!");
    } catch (err) {
      toast(err.message);
    }
  };

  $("#updateOrderForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd);
    payload.notify_customer = fd.get("notify_customer") === "on";
    try {
      await api(`/api/admin/orders/${encodeURIComponent(o.id)}`, { method: "PATCH", body: payload });
      toast("Order updated!");
      closeDrawer();
      refreshHeaderStats();
      switchTab(currentTab);
    } catch (err) {
      toast(err.message);
    }
  };
}

/* ---------- 3. PRODUCTS & STOCK ---------- */
async function renderProducts() {
  const host = $("#tabHost");
  const { products } = await api("/api/admin/products");
  host.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2>Store Catalog &amp; Live Inventory</h2>
        <button type="button" class="btn btn-sm" id="addNewProdBtn">+ Add New Product</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Product</th><th>Size</th><th>Selling Price</th><th>MRP (Strike)</th><th>Stock</th><th>Visibility</th><th>Action</th></tr></thead>
        <tbody>
          ${products
            .map(
              (p) => `<tr>
                <td><strong>${esc(p.name)}</strong><div style="font-size:.78rem;color:var(--muted)">ID: ${esc(p.id)}</div></td>
                <td>${esc(p.size)}</td>
                <td><strong>${money(p.price)}</strong></td>
                <td>${money(p.compare_price)}</td>
                <td><strong>${p.coming_soon ? "—" : p.stock}</strong></td>
                <td>${p.coming_soon ? '<span class="tag pending">Coming Soon Card</span>' : p.active ? '<span class="tag approved">Live</span>' : '<span class="tag cancelled">Hidden</span>'}</td>
                <td><button type="button" class="btn btn-outline btn-sm" data-edit-prod="${esc(p.id)}">Edit</button></td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table></div>
    </div>
  `;

  const openProdEditor = (p = {}) => {
    openDrawer(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <h2 style="margin:0">${p.id ? "Edit Product" : "New Product"}</h2>
        <button type="button" class="btn btn-outline btn-sm" onclick="closeDrawer()">✕</button>
      </div>
      <form id="prodEditForm" style="display:grid;gap:.9rem">
        <input type="hidden" name="id" value="${esc(p.id || "")}">
        <div class="fg"><label>Product Name *</label><input class="inp" name="name" value="${esc(p.name || "")}" required></div>
        <div class="form-grid">
          <div class="fg"><label>Pack Size (e.g. 200 ml)</label><input class="inp" name="size" value="${esc(p.size || "200 ml")}" required></div>
          <div class="fg"><label>Available Stock</label><input class="inp" name="stock" type="number" min="0" value="${Number(p.stock ?? 100)}"></div>
        </div>
        <div class="form-grid">
          <div class="fg"><label>Selling Price (₹ INR)</label><input class="inp" name="price" type="number" min="0" value="${p.price ?? 399}" required></div>
          <div class="fg"><label>Compare-at MRP (₹ Optional)</label><input class="inp" name="compare_price" type="number" min="0" value="${p.compare_price ?? ""}" placeholder="e.g. 499"></div>
        </div>
        <div class="fg"><label>Image URL</label><input class="inp" name="image" value="${esc(p.image || "/assets/bottle.png")}"></div>
        <div class="fg"><label>Description</label><textarea class="inp" name="description" rows="3">${esc(p.description || "")}</textarea></div>
        <div class="fg"><label>Benefits (one per line)</label><textarea class="inp" name="benefits_text" rows="3">${esc((p.benefits || []).join("\n"))}</textarea></div>
        <div class="fg"><label>Highlights / Chips (comma separated)</label><input class="inp" name="highlights_text" value="${esc((p.highlights || ["Handmade", "No harmful chemicals", "Pure herbal ingredients"]).join(", "))}"></div>
        <label style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" name="coming_soon" ${p.coming_soon ? "checked" : ""}> Show as blurred "Coming Soon" teaser card</label>
        <label style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" name="active" ${p.active !== false ? "checked" : ""}> Active / Visible on Storefront</label>
        <div style="display:flex;gap:.6rem;margin-top:.4rem">
          <button type="submit" class="btn" style="flex:1">Save Product</button>
          ${p.id && p.id !== "jk-200" ? `<button type="button" class="btn btn-danger" id="delProdBtn">Delete</button>` : ""}
        </div>
      </form>
    `);

    if ($("#delProdBtn")) {
      $("#delProdBtn").onclick = async () => {
        if (!confirm("Delete this product?")) return;
        await api(`/api/admin/products/${encodeURIComponent(p.id)}`, { method: "DELETE" });
        toast("Product removed");
        closeDrawer();
        renderProducts();
      };
    }

    $("#prodEditForm").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd);
      body.coming_soon = fd.get("coming_soon") === "on";
      body.active = fd.get("active") === "on";
      body.benefits = String(body.benefits_text || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
      body.highlights = String(body.highlights_text || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      await api("/api/admin/products", { method: "POST", body });
      toast("Product saved!");
      closeDrawer();
      renderProducts();
    };
  };

  $("#addNewProdBtn").onclick = () => openProdEditor({});
  $$("[data-edit-prod]", host).forEach((b) => {
    b.onclick = () => openProdEditor(products.find((x) => x.id === b.dataset.editProd));
  });
}

/* ---------- 4. COUPONS ---------- */
async function renderCoupons() {
  const host = $("#tabHost");
  const { coupons } = await api("/api/admin/coupons");
  host.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h2>Create / Update Promo Code</h2></div>
      <form id="couponForm" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.8rem;align-items:end">
        <div class="fg"><label>Code *</label><input class="inp" name="code" placeholder="WELCOME10" style="text-transform:uppercase" required></div>
        <div class="fg"><label>Discount Type</label><select class="inp" name="type"><option value="percent">Percentage (%)</option><option value="flat">Flat Amount (₹)</option></select></div>
        <div class="fg"><label>Value *</label><input class="inp" name="value" type="number" min="1" value="10" required></div>
        <div class="fg"><label>Min Order (₹)</label><input class="inp" name="min_order" type="number" min="0" value="299"></div>
        <div class="fg"><label>Max Discount (₹)</label><input class="inp" name="max_discount" type="number" min="0" value="200"></div>
        <button type="submit" class="btn">Save Coupon</button>
      </form>
    </div>

    <div class="panel">
      <div class="panel-head"><h2>Active &amp; Saved Coupons</h2></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Code</th><th>Offer</th><th>Min Order</th><th>Times Used</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          ${coupons
            .map(
              (c) => `<tr>
                <td><strong>${esc(c.code)}</strong></td>
                <td>${c.type === "flat" ? `₹${c.value} OFF` : `${c.value}% OFF`} ${c.max_discount > 0 ? `(up to ₹${c.max_discount})` : ""}</td>
                <td>${money(c.min_order)}</td>
                <td>${c.used_count}</td>
                <td><span class="tag ${c.active ? "approved" : "cancelled"}">${c.active ? "Active" : "Disabled"}</span></td>
                <td><button type="button" class="btn btn-danger btn-sm" data-del-cp="${esc(c.code)}">Delete</button></td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table></div>
    </div>
  `;

  $("#couponForm").onsubmit = async (e) => {
    e.preventDefault();
    await api("/api/admin/coupons", { method: "POST", body: Object.fromEntries(new FormData(e.target)) });
    toast("Coupon saved!");
    renderCoupons();
  };
  $$("[data-del-cp]", host).forEach((b) => {
    b.onclick = async () => {
      await api(`/api/admin/coupons/${encodeURIComponent(b.dataset.delCp)}`, { method: "DELETE" });
      toast("Coupon deleted");
      renderCoupons();
    };
  });
}

/* ---------- 5. REVIEWS ---------- */
async function renderReviews() {
  const host = $("#tabHost");
  const { reviews } = await api("/api/admin/reviews");
  host.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h2>Customer Reviews (${reviews.length})</h2></div>
      ${
        !reviews.length
          ? '<p style="color:var(--muted)">No customer reviews submitted yet.</p>'
          : `<div class="table-wrap"><table>
              <thead><tr><th>Customer</th><th>Rating</th><th>Review</th><th>Verified</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                ${reviews
                  .map(
                    (r) => `<tr>
                      <td><strong>${esc(r.customer_name)}</strong><div style="font-size:.78rem;color:var(--muted)">${esc(r.city || "")} ${r.order_number ? `· #${esc(r.order_number)}` : ""}</div></td>
                      <td style="color:#c9a227;font-weight:700">${"★".repeat(r.rating)}</td>
                      <td style="max-width:360px">${esc(r.comment)}</td>
                      <td>${r.verified_buyer ? '<span class="tag approved">Verified</span>' : "—"}</td>
                      <td><span class="tag ${esc(r.status)}">${esc(r.status)}</span></td>
                      <td style="display:flex;gap:.4rem">
                        ${r.status !== "approved" ? `<button type="button" class="btn btn-sm" data-rv-act="approved" data-id="${esc(r.id)}">Approve</button>` : `<button type="button" class="btn btn-outline btn-sm" data-rv-act="rejected" data-id="${esc(r.id)}">Hide</button>`}
                        <button type="button" class="btn btn-danger btn-sm" data-rv-del="${esc(r.id)}">✕</button>
                      </td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table></div>`
      }
    </div>
  `;

  $$("[data-rv-act]", host).forEach((b) => {
    b.onclick = async () => {
      await api(`/api/admin/reviews/${encodeURIComponent(b.dataset.id)}`, {
        method: "PATCH",
        body: { status: b.dataset.rvAct },
      });
      toast("Review updated");
      refreshHeaderStats();
      renderReviews();
    };
  });
  $$("[data-rv-del]", host).forEach((b) => {
    b.onclick = async () => {
      if (!confirm("Delete this review permanently?")) return;
      await api(`/api/admin/reviews/${encodeURIComponent(b.dataset.rvDel)}`, { method: "DELETE" });
      toast("Review deleted");
      refreshHeaderStats();
      renderReviews();
    };
  });
}

/* ---------- 6. INQUIRIES ---------- */
async function renderInquiries() {
  const host = $("#tabHost");
  const { inquiries } = await api("/api/admin/inquiries");
  host.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h2>Contact Form Inquiries (${inquiries.length})</h2></div>
      ${
        !inquiries.length
          ? '<p style="color:var(--muted)">No inquiries yet.</p>'
          : `<div class="table-wrap"><table>
              <thead><tr><th>Ticket</th><th>Date</th><th>Customer</th><th>Subject &amp; Message</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                ${inquiries
                  .map(
                    (q) => `<tr>
                      <td><strong>${esc(q.ticket_number)}</strong></td>
                      <td style="font-size:.8rem;color:var(--muted)">${new Date(q.created_at).toLocaleDateString("en-IN")}</td>
                      <td><strong>${esc(q.name)}</strong><div style="font-size:.8rem"><a href="mailto:${esc(q.email)}">${esc(q.email)}</a> · ${esc(q.phone)}</div></td>
                      <td style="max-width:380px"><strong>${esc(q.subject)}</strong><div style="font-size:.86rem;color:var(--muted)">${esc(q.message)}</div></td>
                      <td><span class="tag ${esc(q.status)}">${esc(q.status)}</span></td>
                      <td style="display:flex;gap:.4rem">
                        <a class="btn btn-outline btn-sm" href="mailto:${esc(q.email)}?subject=${encodeURIComponent("Re: " + q.subject + " [" + q.ticket_number + "]")}">Reply Email</a>
                        ${q.status === "open" ? `<button type="button" class="btn btn-sm" data-resolve-inq="${esc(q.id)}">Mark Resolved</button>` : ""}
                      </td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table></div>`
      }
    </div>
  `;
  $$("[data-resolve-inq]", host).forEach((b) => {
    b.onclick = async () => {
      await api(`/api/admin/inquiries/${encodeURIComponent(b.dataset.resolveInq)}`, {
        method: "PATCH",
        body: { status: "resolved" },
      });
      toast("Marked resolved");
      refreshHeaderStats();
      renderInquiries();
    };
  });
}

/* ---------- 7. EMAIL OUTBOX & LOGS ---------- */
async function renderEmails() {
  const host = $("#tabHost");
  const { logs } = await api("/api/admin/emails");
  host.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2>Transactional Email Outbox &amp; Diagnostic</h2>
        <form id="testMailForm" style="display:flex;gap:.5rem;flex-wrap:wrap">
          <input class="inp" name="to" type="email" placeholder="Recipient email for test" style="width:240px" required>
          <button type="submit" class="btn btn-sm">Send Live Test Email</button>
        </form>
      </div>
      <p style="font-size:.85rem;color:var(--muted);margin-top:0">Every customer Order Confirmation, Shipment Tracking update, and Admin Alert is logged below. Click <strong>Preview HTML</strong> on any row to inspect the exact formatted email.</p>
      ${
        !logs.length
          ? '<p style="color:var(--muted)">No emails generated yet. Place a test order or send a test email above!</p>'
          : `<div class="table-wrap"><table>
              <thead><tr><th>Time</th><th>Recipient</th><th>Subject</th><th>Provider</th><th>Status</th><th>Preview</th></tr></thead>
              <tbody>
                ${logs
                  .map(
                    (l) => `<tr>
                      <td style="font-size:.8rem;color:var(--muted)">${new Date(l.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td>${esc(l.recipient)}</td>
                      <td><strong>${esc(l.subject)}</strong>${l.error_msg ? `<div style="font-size:.76rem;color:var(--muted)">${esc(l.error_msg)}</div>` : ""}</td>
                      <td><code>${esc(l.provider)}</code></td>
                      <td><span class="tag ${esc(l.status)}">${esc(l.status)}</span></td>
                      <td><button type="button" class="btn btn-outline btn-sm" data-view-mail="${esc(l.id)}">Preview HTML</button></td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table></div>`
      }
    </div>
  `;

  $("#testMailForm").onsubmit = async (e) => {
    e.preventDefault();
    const to = new FormData(e.target).get("to");
    try {
      const res = await api("/api/admin/emails/test", { method: "POST", body: { to } });
      toast(
        res.result?.preview
          ? "Test email generated in Outbox Preview (add Gmail App Password or Resend API key in Settings for live inbox delivery)"
          : `Test email sent via ${res.result?.provider?.toUpperCase()}!`
      );
      renderEmails();
    } catch (err) {
      toast(err.message);
    }
  };

  $$("[data-view-mail]", host).forEach((b) => {
    b.onclick = async () => {
      const { log } = await api(`/api/admin/emails/${encodeURIComponent(b.dataset.viewMail)}`);
      openDrawer(`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem">
          <div>
            <div style="font-size:.75rem;color:var(--muted)">To: ${esc(log.recipient)}</div>
            <strong style="font-size:1.05rem">${esc(log.subject)}</strong>
          </div>
          <button type="button" class="btn btn-outline btn-sm" onclick="closeDrawer()">✕</button>
        </div>
        <iframe style="width:100%;height:78vh;border:1px solid var(--border);border-radius:12px;background:#f4efe2" srcdoc="${esc(log.html_body || "<p>No HTML body</p>")}"></iframe>
      `);
    };
  });
}

/* ---------- 8. STORE, UPI & EMAIL SETTINGS ---------- */
async function renderSettings() {
  const host = $("#tabHost");
  const { settings: s, mailDiagnostics: md } = await api("/api/admin/settings");

  host.innerHTML = `
    <form id="settingsForm" style="display:grid;gap:1.4rem">
      <div class="panel">
        <div class="panel-head"><h2>1. Brand, Contact &amp; Shipping Rules</h2></div>
        <div class="form-grid">
          <div class="fg"><label>Store Name</label><input class="inp" name="store_name" value="${esc(s.store_name || "")}"></div>
          <div class="fg"><label>WhatsApp Order Number (with 91 country code)</label><input class="inp" name="whatsapp" value="${esc(s.whatsapp || "")}"></div>
          <div class="fg"><label>Display Phone Number</label><input class="inp" name="phone" value="${esc(s.phone || "")}"></div>
          <div class="fg"><label>Public Customer Support Email</label><input class="inp" name="support_email" value="${esc(s.support_email || "")}"></div>
          <div class="fg"><label>Business Address (shown on Footer &amp; Invoice)</label><input class="inp" name="address" value="${esc(s.address || "")}"></div>
          <div class="fg"><label>Instagram URL (optional)</label><input class="inp" name="instagram" value="${esc(s.instagram || "")}" placeholder="https://instagram.com/..."></div>
          <div class="fg"><label>Standard Shipping Fee (₹)</label><input class="inp" name="shipping_fee" type="number" min="0" value="${esc(s.shipping_fee || "49")}"></div>
          <div class="fg"><label>Free Shipping Above Order Value (₹, 0 = disabled)</label><input class="inp" name="free_shipping_min" type="number" min="0" value="${esc(s.free_shipping_min || "499")}"></div>
          <div class="fg"><label>COD Extra Fee (₹, 0 = Free COD)</label><input class="inp" name="cod_fee" type="number" min="0" value="${esc(s.cod_fee || "0")}"></div>
          <div class="fg"><label>GSTIN (Optional — turns Invoice into Tax Invoice)</label><input class="inp" name="gst_number" value="${esc(s.gst_number || "")}"></div>
        </div>
        <div class="fg" style="margin-top:1rem"><label>Top Announcement Bar Text (leave blank to hide)</label><input class="inp" name="announcement_bar" value="${esc(s.announcement_bar || "")}"></div>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>2. Checkout Payment Methods (COD &amp; Dynamic UPI QR)</h2></div>
        <div class="form-grid">
          <div class="fg"><label>Merchant / Personal UPI ID (generates live Checkout QR)</label><input class="inp" name="upi_id" value="${esc(s.upi_id || "")}" placeholder="e.g. jayakesh@okicici or 7011083799@upi"></div>
          <div class="fg"><label>UPI Payee Name</label><input class="inp" name="upi_payee_name" value="${esc(s.upi_payee_name || "Jayakesh Kerala Hair Oil")}"></div>
          <div class="fg"><label>Enable Cash on Delivery (COD)</label><select class="inp" name="cod_enabled"><option value="true" ${s.cod_enabled !== "false" ? "selected" : ""}>Enabled</option><option value="false" ${s.cod_enabled === "false" ? "selected" : ""}>Disabled</option></select></div>
          <div class="fg"><label>Enable UPI QR Payment</label><select class="inp" name="upi_enabled"><option value="true" ${s.upi_enabled !== "false" ? "selected" : ""}>Enabled</option><option value="false" ${s.upi_enabled === "false" ? "selected" : ""}>Disabled</option></select></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h2>3. Automated Email Notifications (Gmail SMTP or GoDaddy Domain Resend)</h2>
          <span class="tag ${md.activeProvider === "preview" ? "pending" : "approved"}">Active: ${esc(md.activeProvider.toUpperCase())}</span>
        </div>
        <p style="font-size:.85rem;color:var(--muted);margin-top:0">
          <strong>Option A (Easiest — Free Gmail):</strong> Enter your Gmail address + a 16-character <a href="https://myaccount.google.com/apppasswords" target="_blank" style="text-decoration:underline;color:var(--green-800)">Google App Password</a> below.<br>
          <strong>Option B (Custom GoDaddy Domain e.g. orders@yourdomain.com):</strong> Paste a free API key from <a href="https://resend.com" target="_blank" style="text-decoration:underline;color:var(--green-800)">Resend.com</a> after verifying your GoDaddy DNS.
        </p>
        <div class="form-grid">
          <div class="fg"><label>Owner Email to Receive New Order Alerts *</label><input class="inp" name="admin_notify_email" type="email" value="${esc(s.admin_notify_email || "")}" placeholder="yourname@gmail.com"></div>
          <div class="fg"><label>Sender "From" Header</label><input class="inp" name="email_from" value="${esc(s.email_from || "")}" placeholder="Jayakesh Orders <orders@yourdomain.com>"></div>
          <div class="fg"><label>Gmail / SMTP Username</label><input class="inp" name="smtp_user" value="${esc(s.smtp_user || "")}" placeholder="yourname@gmail.com"></div>
          <div class="fg"><label>Gmail 16-Char App Password</label><input class="inp" name="smtp_pass" type="password" value="${esc(s.smtp_pass || "")}" placeholder="xxxx xxxx xxxx xxxx"></div>
          <div class="fg"><label>SMTP Host (Default: smtp.gmail.com)</label><input class="inp" name="smtp_host" value="${esc(s.smtp_host || "smtp.gmail.com")}"></div>
          <div class="fg"><label>Resend API Key (Optional — for GoDaddy Domain)</label><input class="inp" name="resend_api_key" type="password" value="${esc(s.resend_api_key || "")}" placeholder="re_..."></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>4. Instant Mobile Push Alerts (Optional Free Telegram / Webhook) &amp; Security</h2></div>
        <div class="form-grid">
          <div class="fg"><label>Telegram Bot Token (Optional)</label><input class="inp" name="telegram_bot_token" type="password" value="${esc(s.telegram_bot_token || "")}" placeholder="123456:ABC-DEF..."></div>
          <div class="fg"><label>Telegram Chat ID (Optional)</label><input class="inp" name="telegram_chat_id" value="${esc(s.telegram_chat_id || "")}" placeholder="e.g. 987654321"></div>
          <div class="fg"><label>Auto-Approve Customer Reviews</label><select class="inp" name="auto_approve_reviews"><option value="false" ${s.auto_approve_reviews !== "true" ? "selected" : ""}>No — Require Admin Approval</option><option value="true" ${s.auto_approve_reviews === "true" ? "selected" : ""}>Yes — Publish Immediately</option></select></div>
          <div class="fg"><label>Change Admin Password (leave blank to keep current)</label><input class="inp" name="new_admin_password" type="password" placeholder="Enter new password (min 6 chars)"></div>
        </div>
      </div>

      <div>
        <button type="submit" class="btn" style="padding:.9rem 2rem;font-size:.95rem">💾 Save All Store &amp; Notification Settings</button>
      </div>
    </form>
  `;

  $("#settingsForm").onsubmit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    try {
      await api("/api/admin/settings", { method: "PUT", body });
      toast("Settings saved & live immediately!");
      refreshHeaderStats();
      renderSettings();
    } catch (err) {
      toast(err.message);
    }
  };
}

/* ---------- Boot ---------- */
(async function init() {
  try {
    await api("/api/admin/me");
    showDashboard();
  } catch {
    showLogin();
  }
})();

