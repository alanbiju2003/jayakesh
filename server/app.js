require("dotenv").config();
const path = require("path");
const express = require("express");
const QRCode = require("qrcode");
const db = require("./db");
const auth = require("./auth");
const mailer = require("./mailer");
const notify = require("./notify");

const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Lightweight in-memory rate limiter for public write endpoints
const rateBuckets = new Map();
function rateLimit(maxPerWindow = 20, windowMs = 10 * 60 * 1000) {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "local";
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const entry = rateBuckets.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count++;
    rateBuckets.set(key, entry);
    if (entry.count > maxPerWindow) {
      return res.status(429).json({ error: "Too many requests. Please wait a few minutes and try again." });
    }
    next();
  };
}

function getBaseUrl(req) {
  if (process.env.PUBLIC_SITE_URL && !process.env.PUBLIC_SITE_URL.includes("localhost")) {
    return process.env.PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

function computeCouponDiscount(coupon, subtotal) {
  if (!coupon || !coupon.active) return { valid: false, discount: 0, reason: "Invalid or inactive coupon code" };
  if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, discount: 0, reason: "This coupon has reached its usage limit" };
  }
  if (subtotal < coupon.min_order) {
    return {
      valid: false,
      discount: 0,
      reason: `Minimum order of ₹${coupon.min_order} required for ${coupon.code}`,
    };
  }
  let discount =
    coupon.type === "flat"
      ? coupon.value
      : Math.round((subtotal * coupon.value) / 100);
  if (coupon.max_discount > 0 && discount > coupon.max_discount) {
    discount = coupon.max_discount;
  }
  discount = Math.min(discount, subtotal);
  return { valid: true, discount, coupon };
}

async function buildUpiPayload(amount, note = "Jayakesh Order") {
  const settings = await db.getSettings();
  const upiId = String(settings.upi_id || "").trim();
  const payeeName = String(settings.upi_payee_name || settings.store_name || "Jayakesh").trim();
  if (!upiId) {
    return { configured: false, upiId: "", payeeName, uri: "", qrSvg: "" };
  }
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    cu: "INR",
    tn: note.slice(0, 50),
  });
  if (amount && Number(amount) > 0) {
    params.set("am", Number(amount).toFixed(2));
  }
  const uri = `upi://pay?${params.toString()}`;
  const qrSvg = await QRCode.toString(uri, {
    type: "svg",
    margin: 1,
    width: 220,
    color: { dark: "#06210d", light: "#ffffff" },
  });
  return { configured: true, upiId, payeeName, uri, qrSvg };
}

// =====================================================================
// PUBLIC STOREFRONT API
// =====================================================================

app.get("/api/health", async (req, res) => {
  try {
    await db.initDb();
    res.json({
      ok: true,
      service: "jayakesh-backend",
      timestamp: new Date().toISOString(),
      storage: db.getStorageInfo(),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/store", async (req, res) => {
  try {
    const [settings, products, reviews] = await Promise.all([
      db.getPublicSettings(),
      db.listProducts({ includeInactive: false }),
      db.listReviews({ approvedOnly: true }),
    ]);
    res.json({ settings, products, reviews });
  } catch (err) {
    res.status(500).json({ error: "Failed to load store data", details: err.message });
  }
});

app.get("/api/upi-qr", async (req, res) => {
  try {
    const amount = Number(req.query.amount || 0);
    const note = String(req.query.note || "Jayakesh Hair Oil Order");
    const data = await buildUpiPayload(amount, note);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/coupons/validate", async (req, res) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    const subtotal = Number(req.body.subtotal || 0);
    if (!code) return res.status(400).json({ error: "Enter a coupon code" });
    const coupon = await db.getCoupon(code);
    const result = computeCouponDiscount(coupon, subtotal);
    if (!result.valid) {
      return res.status(400).json({ error: result.reason });
    }
    res.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: result.discount,
      message:
        coupon.type === "flat"
          ? `₹${result.discount} discount applied!`
          : `${coupon.value}% off (₹${result.discount}) applied!`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", rateLimit(15, 10 * 60 * 1000), async (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.name || "").trim();
    const phone = String(b.phone || "").trim();
    const cleanDigits = phone.replace(/\D/g, "");
    const email = String(b.email || "").trim();
    const addressLine = String(b.address || "").trim();
    const landmark = String(b.landmark || "").trim();
    const city = String(b.city || "").trim();
    const state = String(b.state || "Kerala").trim();
    const pincode = String(b.pincode || "").trim();
    const notes = String(b.notes || "").trim();
    const paymentMethod = b.payment_method === "upi" ? "upi" : "cod";
    const upiUtr = String(b.upi_utr || "").trim();
    const couponCode = String(b.coupon_code || "").trim().toUpperCase();
    const rawItems = Array.isArray(b.items) ? b.items : [];

    // Validation
    const errors = {};
    if (name.length < 2) errors.name = "Enter your full name";
    if (cleanDigits.length < 10) errors.phone = "Enter a valid 10-digit mobile number";
    if (!isEmail(email)) errors.email = "Enter a valid email address for order confirmation";
    if (addressLine.length < 6) errors.address = "Enter your complete house/street delivery address";
    if (city.length < 2) errors.city = "Enter your city/town";
    if (state.length < 2) errors.state = "Select your state";
    if (!/^\d{6}$/.test(pincode)) errors.pincode = "Enter a valid 6-digit PIN code";
    if (rawItems.length === 0) errors.items = "Your cart is empty";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Please check the highlighted delivery details.", errors });
    }

    const settings = await db.getPublicSettings();
    if (paymentMethod === "cod" && !settings.cod_enabled) {
      return res.status(400).json({ error: "Cash on Delivery is currently unavailable." });
    }
    if (paymentMethod === "upi" && !settings.upi_enabled) {
      return res.status(400).json({ error: "UPI payment is currently unavailable." });
    }

    // Re-verify items & server-side prices from DB
    const verifiedItems = [];
    let subtotal = 0;
    for (const entry of rawItems) {
      const prod = await db.getProduct(entry.id);
      if (!prod || !prod.active || prod.coming_soon) {
        return res.status(400).json({ error: `Product "${entry.id}" is not available for purchase.` });
      }
      const qty = Math.max(1, Math.min(20, Math.round(Number(entry.qty || 1))));
      if (prod.stock <= 0) {
        return res.status(400).json({ error: `${prod.name} is currently out of stock.` });
      }
      if (qty > prod.stock) {
        return res.status(400).json({ error: `Only ${prod.stock} units of ${prod.name} available in stock.` });
      }
      const unitPrice = Number(prod.price || 0);
      subtotal += unitPrice * qty;
      verifiedItems.push({
        id: prod.id,
        name: prod.name,
        size: prod.size,
        price: unitPrice,
        qty,
        image: prod.image,
      });
    }

    let discount = 0;
    let appliedCoupon = "";
    if (couponCode) {
      const c = await db.getCoupon(couponCode);
      const check = computeCouponDiscount(c, subtotal);
      if (check.valid) {
        discount = check.discount;
        appliedCoupon = c.code;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const shippingFee =
      settings.free_shipping_min > 0 && discountedSubtotal >= settings.free_shipping_min
        ? 0
        : settings.shipping_fee;
    const codFee = paymentMethod === "cod" ? settings.cod_fee : 0;
    const total = discountedSubtotal + shippingFee + codFee;

    const paymentStatus =
      paymentMethod === "upi"
        ? upiUtr
          ? "upi_verification_pending"
          : "awaiting_upi"
        : "cod_pending";

    const order = await db.createOrder({
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      address_line: addressLine,
      landmark,
      city,
      state,
      pincode,
      notes,
      items: verifiedItems,
      subtotal,
      discount,
      coupon_code: appliedCoupon,
      shipping_fee: shippingFee,
      cod_fee: codFee,
      total,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      upi_utr: upiUtr,
    });

    const baseUrl = getBaseUrl(req);
    const [mailOutcome, , upiData] = await Promise.all([
      mailer.sendOrderPlacedEmails(order, baseUrl),
      notify.notifyNewOrder(order),
      paymentMethod === "upi" ? buildUpiPayload(order.total, `Order ${order.order_number}`) : Promise.resolve(null),
    ]);

    res.status(201).json({
      ok: true,
      order,
      upi: upiData,
      emailStatus: mailOutcome?.customerResult?.provider || "logged",
    });
  } catch (err) {
    res.status(500).json({ error: "Could not place order. Please try again.", details: err.message });
  }
});

// Allow customer to submit or update UPI UTR right on the Order Confirmation / Tracking screen
app.post("/api/orders/:orderNumber/utr", rateLimit(15, 10 * 60 * 1000), async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    const utr = String(req.body.upi_utr || "").trim();
    const phone = String(req.body.phone || "").replace(/\D/g, "");
    if (utr.length < 6) {
      return res.status(400).json({ error: "Please enter a valid 12-digit UPI UTR / Transaction Reference ID." });
    }
    const existing = await db.getOrderByNumber(orderNumber);
    if (!existing) return res.status(404).json({ error: "Order not found." });

    const existingPhone = existing.customer_phone.replace(/\D/g, "");
    if (phone && !existingPhone.endsWith(phone.slice(-10))) {
      return res.status(403).json({ error: "Phone number does not match this order." });
    }

    const updated = await db.updateOrder(existing.id, {
      upi_utr: utr,
      payment_status: existing.payment_status === "paid" ? "paid" : "upi_verification_pending",
    });

    await notify.notifyUtrSubmitted(updated);
    res.json({ ok: true, order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Live Order Tracking & Invoice lookup (verified by phone digits or email)
app.get("/api/orders/track", async (req, res) => {
  try {
    const orderNumber = String(req.query.order || "").trim();
    const contact = String(req.query.contact || req.query.phone || "").trim();
    if (!orderNumber) {
      return res.status(400).json({ error: "Enter your Order ID (e.g. JK-...)" });
    }
    const order = await db.getOrderByNumber(orderNumber);
    if (!order) {
      return res.status(404).json({ error: "No order found with that Order ID. Please check and try again." });
    }

    // Verify phone last 10 digits or matching email (unless admin is logged in)
    const isAdmin = Boolean(auth.verifyAdminToken(auth.extractToken(req)));
    if (!isAdmin) {
      if (!contact) {
        return res.status(400).json({ error: "Enter the phone number or email used for the order." });
      }
      const cleanInputDigits = contact.replace(/\D/g, "");
      const orderDigits = order.customer_phone.replace(/\D/g, "");
      const phoneMatch =
        cleanInputDigits.length >= 10 &&
        orderDigits.slice(-10) === cleanInputDigits.slice(-10);
      const emailMatch = order.customer_email.toLowerCase() === contact.toLowerCase();
      if (!phoneMatch && !emailMatch) {
        return res.status(403).json({
          error: "Phone number or email does not match this Order ID.",
        });
      }
    }

    const settings = await db.getPublicSettings();
    const upi =
      order.payment_method === "upi" && order.payment_status !== "paid"
        ? await buildUpiPayload(order.total, `Order ${order.order_number}`)
        : null;

    // Strip internal admin_notes before returning publicly
    const { admin_notes, ...publicOrder } = order;
    res.json({ ok: true, order: isAdmin ? order : publicOrder, settings, upi });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Contact Form
app.post("/api/contact", rateLimit(10, 10 * 60 * 1000), async (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.name || "").trim();
    const email = String(b.email || "").trim();
    const phone = String(b.phone || "").trim();
    const subject = String(b.subject || "").trim();
    const message = String(b.message || "").trim();

    const errors = {};
    if (name.length < 2) errors.name = "Enter your name";
    if (!isEmail(email)) errors.email = "Enter a valid email address";
    if (phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a valid phone number";
    if (subject.length < 3) errors.subject = "Enter a subject";
    if (message.length < 10) errors.message = "Please write at least 10 characters";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Please check the form fields.", errors });
    }

    const inquiry = await db.createInquiry({ name, email, phone, subject, message });
    const baseUrl = getBaseUrl(req);
    await Promise.all([
      mailer.sendInquiryEmails(inquiry, baseUrl),
      notify.notifyNewInquiry(inquiry),
    ]);

    res.status(201).json({ ok: true, ticket_number: inquiry.ticket_number });
  } catch (err) {
    res.status(500).json({ error: "Could not submit message. Please try again.", details: err.message });
  }
});

// Public Customer Reviews Submission
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await db.listReviews({ approvedOnly: true });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/reviews", rateLimit(8, 15 * 60 * 1000), async (req, res) => {
  try {
    const b = req.body || {};
    const customer_name = String(b.name || b.customer_name || "").trim();
    const customer_email = String(b.email || b.customer_email || "").trim();
    const order_number = String(b.order_number || "").trim();
    const city = String(b.city || "").trim();
    const rating = Number(b.rating || 5);
    const title = String(b.title || "").trim();
    const comment = String(b.comment || b.text || "").trim();

    if (customer_name.length < 2) {
      return res.status(400).json({ error: "Please enter your name." });
    }
    if (comment.length < 8) {
      return res.status(400).json({ error: "Please write a short review (at least 8 characters)." });
    }

    const settings = await db.getSettings();
    const autoApprove = settings.auto_approve_reviews === "true";

    const review = await db.createReview({
      product_id: b.product_id || "jk-200",
      order_number,
      customer_name,
      customer_email,
      city,
      rating,
      title,
      comment,
      status: autoApprove ? "approved" : "pending",
    });

    await notify.notifyNewReview(review);
    res.status(201).json({
      ok: true,
      autoApproved: autoApprove,
      message: autoApprove
        ? "Thank you! Your review is now live."
        : "Thank you for your review! It has been submitted for verification and will appear shortly.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic SEO Sitemap
app.get("/sitemap.xml", (req, res) => {
  const base = getBaseUrl(req);
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  <url><loc>${base}/#/shop</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${base}/#/product</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>
  <url><loc>${base}/#/ingredients</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>
  <url><loc>${base}/#/about</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>
  <url><loc>${base}/#/track</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>
  <url><loc>${base}/#/contact</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>
</urlset>`;
  res.setHeader("Content-Type", "application/xml");
  res.send(xml);
});

// =====================================================================
// PROTECTED ADMIN API
// =====================================================================

app.post("/api/admin/login", rateLimit(12, 15 * 60 * 1000), async (req, res) => {
  try {
    const email = String(req.body.email || "").trim();
    const password = String(req.body.password || "");
    const settings = await db.getSettings();

    const expectedEmail = (process.env.ADMIN_EMAIL || "admin@jayakesh.in").trim().toLowerCase();
    const expectedPass = process.env.ADMIN_PASSWORD || "Jayakesh@Admin2026";

    const emailOk =
      !email ||
      email.toLowerCase() === expectedEmail ||
      email.toLowerCase() === "admin@jayakesh.com" ||
      email.toLowerCase() === "admin";
    let passOk = false;
    if (settings.admin_password_hash) {
      passOk = auth.verifyPasswordHash(password, settings.admin_password_hash);
    }
    if (!passOk) {
      passOk = auth.safeCompare(password, expectedPass);
    }

    if (!emailOk || !passOk) {
      return res.status(401).json({ error: "Invalid admin credentials." });
    }

    const token = auth.signAdminToken(expectedEmail);
    const isProd = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
    res.setHeader(
      "Set-Cookie",
      `jk_admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${isProd ? "; Secure" : ""}`
    );
    res.json({ ok: true, token, email: expectedEmail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/logout", (req, res) => {
  res.setHeader("Set-Cookie", "jk_admin_token=; Path=/; HttpOnly; Max-Age=0");
  res.json({ ok: true });
});

app.get("/api/admin/me", auth.requireAdmin, async (req, res) => {
  const [stats, mailCfg] = await Promise.all([
    db.getDashboardStats(),
    mailer.resolveMailConfig(),
  ]);
  res.json({
    ok: true,
    admin: req.admin,
    stats,
    emailStatus: {
      activeProvider: mailCfg.activeProvider,
      adminNotifyEmail: mailCfg.adminNotifyEmail,
      from: mailCfg.from,
    },
  });
});

app.get("/api/admin/orders", auth.requireAdmin, async (req, res) => {
  const orders = await db.listOrders({
    status: req.query.status,
    search: req.query.search,
    limit: req.query.limit || 250,
  });
  res.json({ orders });
});

app.get("/api/admin/orders/:id", auth.requireAdmin, async (req, res) => {
  const order = await db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ order });
});

app.patch("/api/admin/orders/:id", auth.requireAdmin, async (req, res) => {
  try {
    const before = await db.getOrderById(req.params.id);
    if (!before) return res.status(404).json({ error: "Order not found" });

    const updated = await db.updateOrder(before.id, req.body || {});
    let emailResult = null;
    const statusChanged = req.body.order_status && req.body.order_status !== before.order_status;
    const shouldNotifyCustomer = req.body.notify_customer === true || statusChanged;

    if (shouldNotifyCustomer && updated.customer_email) {
      emailResult = await mailer.sendOrderStatusEmail(updated, getBaseUrl(req));
    }

    res.json({ ok: true, order: updated, emailResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/orders/:id/resend-email", auth.requireAdmin, async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    const kind = req.body.kind || "confirmation";
    const baseUrl = getBaseUrl(req);
    const result =
      kind === "status"
        ? await mailer.sendOrderStatusEmail(order, baseUrl)
        : await mailer.sendOrderPlacedEmails(order, baseUrl);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/products", auth.requireAdmin, async (req, res) => {
  const products = await db.listProducts({ includeInactive: true });
  res.json({ products });
});

app.post("/api/admin/products", auth.requireAdmin, async (req, res) => {
  try {
    const product = await db.upsertProduct(req.body || {});
    res.json({ ok: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/products/:id", auth.requireAdmin, async (req, res) => {
  if (req.params.id === "jk-200") {
    return res.status(400).json({ error: "Flagship product can be edited or deactivated, not deleted." });
  }
  await db.deleteProduct(req.params.id);
  res.json({ ok: true });
});

app.get("/api/admin/settings", auth.requireAdmin, async (req, res) => {
  const s = await db.getSettings();
  const mailCfg = await mailer.resolveMailConfig();
  // Mask sensitive secrets in GET while indicating if set
  const safe = { ...s };
  delete safe.admin_password_hash;
  if (safe.smtp_pass) safe.smtp_pass = "••••••••••••";
  if (safe.resend_api_key) safe.resend_api_key = "re_••••••••••••";
  res.json({
    settings: safe,
    mailDiagnostics: {
      activeProvider: mailCfg.activeProvider,
      from: mailCfg.from,
      adminNotifyEmail: mailCfg.adminNotifyEmail,
      envSmtpConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
      envResendConfigured: Boolean(process.env.RESEND_API_KEY),
    },
  });
});

app.put("/api/admin/settings", auth.requireAdmin, async (req, res) => {
  try {
    const body = { ...(req.body || {}) };
    if (body.new_admin_password) {
      if (String(body.new_admin_password).length < 6) {
        return res.status(400).json({ error: "New admin password must be at least 6 characters." });
      }
      body.admin_password_hash = auth.hashPassword(body.new_admin_password);
      delete body.new_admin_password;
    }
    // Do not overwrite masked placeholders
    if (body.smtp_pass && body.smtp_pass.includes("••")) delete body.smtp_pass;
    if (body.resend_api_key && body.resend_api_key.includes("••")) delete body.resend_api_key;

    await db.updateSettings(body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/coupons", auth.requireAdmin, async (req, res) => {
  const coupons = await db.listCoupons();
  res.json({ coupons });
});

app.post("/api/admin/coupons", auth.requireAdmin, async (req, res) => {
  if (!req.body.code) return res.status(400).json({ error: "Coupon code is required" });
  const coupon = await db.upsertCoupon(req.body);
  res.json({ ok: true, coupon });
});

app.delete("/api/admin/coupons/:code", auth.requireAdmin, async (req, res) => {
  await db.deleteCoupon(req.params.code);
  res.json({ ok: true });
});

app.get("/api/admin/reviews", auth.requireAdmin, async (req, res) => {
  const reviews = await db.listReviews({ approvedOnly: false });
  res.json({ reviews });
});

app.patch("/api/admin/reviews/:id", auth.requireAdmin, async (req, res) => {
  const review = await db.updateReview(req.params.id, req.body || {});
  res.json({ ok: true, review });
});

app.delete("/api/admin/reviews/:id", auth.requireAdmin, async (req, res) => {
  await db.deleteReview(req.params.id);
  res.json({ ok: true });
});

app.get("/api/admin/inquiries", auth.requireAdmin, async (req, res) => {
  const inquiries = await db.listInquiries();
  res.json({ inquiries });
});

app.patch("/api/admin/inquiries/:id", auth.requireAdmin, async (req, res) => {
  const inquiry = await db.updateInquiry(req.params.id, req.body || {});
  res.json({ ok: true, inquiry });
});

app.get("/api/admin/notifications", auth.requireAdmin, async (req, res) => {
  const data = await db.listNotifications(req.query.limit || 50);
  res.json(data);
});

app.post("/api/admin/notifications/read", auth.requireAdmin, async (req, res) => {
  await db.markNotificationsRead(req.body.id || null);
  res.json({ ok: true });
});

app.get("/api/admin/emails", auth.requireAdmin, async (req, res) => {
  const logs = await db.listEmailLogs(req.query.limit || 80);
  res.json({ logs });
});

app.get("/api/admin/emails/:id", auth.requireAdmin, async (req, res) => {
  const log = await db.getEmailLogById(req.params.id);
  if (!log) return res.status(404).json({ error: "Email log not found" });
  res.json({ log });
});

app.post("/api/admin/emails/test", auth.requireAdmin, async (req, res) => {
  try {
    const result = await mailer.sendTestEmail(req.body.to, getBaseUrl(req));
    res.json({ ok: result.ok, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// STATIC ASSETS & CLEAN PAGE ROUTES (for local / VPS Node server)
// =====================================================================
const publicDir = path.join(__dirname, "..", "public");
app.use(
  "/assets",
  express.static(path.join(publicDir, "assets"), {
    maxAge: "365d",
    immutable: true,
  })
);
app.use(express.static(publicDir));

app.get("/admin", (req, res) => {
  res.sendFile(path.join(publicDir, "admin.html"));
});

app.get("/invoice", (req, res) => {
  res.sendFile(path.join(publicDir, "invoice.html"));
});

module.exports = app;
