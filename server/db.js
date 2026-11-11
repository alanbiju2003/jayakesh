const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PG_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

let driver = null; // "postgres" | "sqlite"
let pgPool = null;
let sqliteDb = null;
let initPromise = null;

function toPgSql(sql) {
  let idx = 0;
  return sql.replace(/\?/g, () => `$${++idx}`);
}

async function rawQuery(sql, params = []) {
  if (driver === "postgres") {
    const res = await pgPool.query(toPgSql(sql), params);
    return { rows: res.rows || [], rowCount: res.rowCount || 0 };
  }
  const trimmed = sql.trim().toUpperCase();
  const stmt = sqliteDb.prepare(sql);
  if (trimmed.startsWith("SELECT") || trimmed.includes("RETURNING")) {
    const rows = stmt.all(...params);
    return { rows, rowCount: rows.length };
  }
  const info = stmt.run(...params);
  return { rows: [], rowCount: Number(info.changes || 0) };
}

async function rawExec(sql) {
  if (driver === "postgres") {
    await pgPool.query(sql);
  } else {
    sqliteDb.exec(sql);
  }
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT,
    size TEXT NOT NULL,
    price INTEGER,
    compare_price INTEGER,
    stock INTEGER DEFAULT 100,
    active INTEGER DEFAULT 1,
    coming_soon INTEGER DEFAULT 0,
    hue_shift INTEGER DEFAULT 0,
    image TEXT,
    description TEXT,
    benefits_json TEXT,
    highlights_json TEXT,
    sort_order INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    address_line TEXT NOT NULL,
    landmark TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    notes TEXT,
    items_json TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    discount INTEGER DEFAULT 0,
    coupon_code TEXT,
    shipping_fee INTEGER DEFAULT 0,
    cod_fee INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    upi_utr TEXT,
    order_status TEXT NOT NULL,
    courier_name TEXT,
    tracking_number TEXT,
    tracking_url TEXT,
    admin_notes TEXT,
    timeline_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status)`,
  `CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    value INTEGER NOT NULL,
    min_order INTEGER DEFAULT 0,
    max_discount INTEGER DEFAULT 0,
    usage_limit INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    order_number TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    city TEXT,
    rating INTEGER NOT NULL,
    title TEXT,
    comment TEXT NOT NULL,
    verified_buyer INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    ticket_number TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    admin_reply TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    meta_json TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_type TEXT NOT NULL,
    related_id TEXT,
    provider TEXT NOT NULL,
    status TEXT NOT NULL,
    error_msg TEXT,
    html_body TEXT,
    created_at TEXT NOT NULL
  )`,
];

const DEFAULT_SETTINGS = {
  store_name: "Jayakesh Kerala Hair Oil",
  whatsapp: "917011083799",
  phone: "+91 70110 83799",
  support_email: process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || "care@jayakesh.in",
  admin_notify_email: process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || "",
  address: "Kerala, India",
  instagram: "",
  upi_id: "",
  upi_payee_name: "Jayakesh Kerala Hair Oil",
  cod_enabled: "true",
  upi_enabled: "true",
  shipping_fee: "49",
  free_shipping_min: "499",
  cod_fee: "0",
  gst_number: "",
  auto_approve_reviews: "false",
  announcement_bar: "Handmade Kerala Herbal Hair Oil · Free Pan-India Shipping on orders ₹499+",
  video_url: "",
  telegram_bot_token: "",
  telegram_chat_id: "",
  notify_webhook_url: "",
};

const SEED_PRODUCTS = [
  {
    id: "jk-200",
    name: "Jayakesh Kerala Hair Oil",
    subtitle: "Traditional Handmade Herbal Infusion",
    size: "200 ml",
    price: 399,
    compare_price: 499,
    stock: 100,
    active: 1,
    coming_soon: 0,
    hue_shift: 0,
    image: "/assets/bottle.png",
    description:
      "Jayakesh Kerala Hair Oil is a handmade herbal hair oil, made in the Kerala tradition with pure herbal ingredients and no harmful chemicals.",
    benefits: [
      "Helps reduce hair fall",
      "Promotes healthy hair growth",
      "Nourishes the scalp",
      "Strengthens hair",
    ],
    highlights: ["Handmade", "No harmful chemicals", "Pure herbal ingredients"],
    sort_order: 1,
  },
  {
    id: "jk-soon-1",
    name: "New Herbal Care",
    subtitle: "Coming soon",
    size: "100 ml",
    price: 249,
    compare_price: null,
    stock: 0,
    active: 1,
    coming_soon: 1,
    hue_shift: 40,
    image: "/assets/bottle.png",
    description: "Upcoming handmade herbal creation from Jayakesh.",
    benefits: [],
    highlights: ["Coming soon"],
    sort_order: 2,
  },
  {
    id: "jk-soon-2",
    name: "Intensive Scalp Ritual",
    subtitle: "Coming soon",
    size: "200 ml",
    price: 449,
    compare_price: null,
    stock: 0,
    active: 1,
    coming_soon: 1,
    hue_shift: -35,
    image: "/assets/bottle.png",
    description: "Upcoming handmade herbal creation from Jayakesh.",
    benefits: [],
    highlights: ["Coming soon"],
    sort_order: 3,
  },
  {
    id: "jk-soon-3",
    name: "Gentle Herbal Cleanser",
    subtitle: "Coming soon",
    size: "200 ml",
    price: 349,
    compare_price: null,
    stock: 0,
    active: 1,
    coming_soon: 1,
    hue_shift: 110,
    image: "/assets/bottle.png",
    description: "Upcoming handmade herbal creation from Jayakesh.",
    benefits: [],
    highlights: ["Coming soon"],
    sort_order: 4,
  },
];

async function initDb() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (PG_URL) {
      const { Pool } = require("pg");
      const isLocalPg = PG_URL.includes("localhost") || PG_URL.includes("127.0.0.1");
      pgPool = new Pool({
        connectionString: PG_URL,
        ssl: isLocalPg ? false : { rejectUnauthorized: false },
        max: 5,
      });
      driver = "postgres";
    } else {
      const { DatabaseSync } = require("node:sqlite");
      const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      const dbDir = isServerless ? "/tmp" : path.join(__dirname, "..", "data");
      fs.mkdirSync(dbDir, { recursive: true });
      const dbFile = path.join(dbDir, "jayakesh.db");
      sqliteDb = new DatabaseSync(dbFile);
      sqliteDb.exec("PRAGMA journal_mode = WAL;");
      driver = "sqlite";
    }

    for (const stmt of SCHEMA_STATEMENTS) {
      await rawExec(stmt);
    }

    const now = new Date().toISOString();

    // Seed settings (only missing keys)
    const existingSettings = await rawQuery("SELECT key FROM settings");
    const existingKeys = new Set(existingSettings.rows.map((r) => r.key));
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      if (!existingKeys.has(k)) {
        await rawQuery(
          "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT (key) DO NOTHING",
          [k, String(v ?? ""), now]
        );
      }
    }

    // Seed products if empty
    const prodCount = await rawQuery("SELECT COUNT(*) AS cnt FROM products");
    const cnt = Number(prodCount.rows[0]?.cnt || 0);
    if (cnt === 0) {
      for (const p of SEED_PRODUCTS) {
        await rawQuery(
          `INSERT INTO products (
            id, name, subtitle, size, price, compare_price, stock, active, coming_soon,
            hue_shift, image, description, benefits_json, highlights_json, sort_order, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            p.name,
            p.subtitle,
            p.size,
            p.price,
            p.compare_price,
            p.stock,
            p.active,
            p.coming_soon,
            p.hue_shift,
            p.image,
            p.description,
            JSON.stringify(p.benefits || []),
            JSON.stringify(p.highlights || []),
            p.sort_order,
            now,
          ]
        );
      }
    }

    // Seed welcome coupon if empty
    const couponCount = await rawQuery("SELECT COUNT(*) AS cnt FROM coupons");
    if (Number(couponCount.rows[0]?.cnt || 0) === 0) {
      await rawQuery(
        `INSERT INTO coupons (code, type, value, min_order, max_discount, usage_limit, used_count, active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ["WELCOME10", "percent", 10, 299, 200, 0, 0, 1, now]
      );
    }
  })();
  return initPromise;
}

function getStorageInfo() {
  const isVercel = Boolean(process.env.VERCEL);
  return {
    driver,
    persistent: driver === "postgres" || !isVercel,
    warning:
      driver === "sqlite" && isVercel
        ? "Running on temporary /tmp SQLite on Vercel. Connect Neon Postgres in Vercel -> Storage -> Create Database to set DATABASE_URL for permanent 24/7 cloud storage."
        : null,
  };
}

function parseJsonSafe(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function formatProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle || "",
    size: row.size,
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    compare_price:
      row.compare_price === null || row.compare_price === undefined
        ? null
        : Number(row.compare_price),
    stock: Number(row.stock ?? 0),
    active: Boolean(Number(row.active)),
    coming_soon: Boolean(Number(row.coming_soon)),
    hue_shift: Number(row.hue_shift || 0),
    image: row.image || "/assets/bottle.png",
    description: row.description || "",
    benefits: parseJsonSafe(row.benefits_json, []),
    highlights: parseJsonSafe(row.highlights_json, []),
    sort_order: Number(row.sort_order || 0),
    updated_at: row.updated_at,
  };
}

function formatOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    order_number: row.order_number,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    customer_email: row.customer_email,
    address_line: row.address_line,
    landmark: row.landmark || "",
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    notes: row.notes || "",
    items: parseJsonSafe(row.items_json, []),
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    coupon_code: row.coupon_code || "",
    shipping_fee: Number(row.shipping_fee || 0),
    cod_fee: Number(row.cod_fee || 0),
    total: Number(row.total || 0),
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    upi_utr: row.upi_utr || "",
    order_status: row.order_status,
    courier_name: row.courier_name || "",
    tracking_number: row.tracking_number || "",
    tracking_url: row.tracking_url || "",
    admin_notes: row.admin_notes || "",
    timeline: parseJsonSafe(row.timeline_json, []),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getSettings() {
  await initDb();
  const { rows } = await rawQuery("SELECT key, value FROM settings");
  const out = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    out[r.key] = r.value;
  }
  return out;
}

async function getPublicSettings() {
  const s = await getSettings();
  return {
    store_name: s.store_name,
    whatsapp: s.whatsapp,
    phone: s.phone,
    support_email: s.support_email,
    address: s.address,
    instagram: s.instagram,
    upi_id: s.upi_id,
    upi_payee_name: s.upi_payee_name,
    cod_enabled: s.cod_enabled === "true",
    upi_enabled: s.upi_enabled === "true",
    shipping_fee: Number(s.shipping_fee || 0),
    free_shipping_min: Number(s.free_shipping_min || 0),
    cod_fee: Number(s.cod_fee || 0),
    gst_number: s.gst_number || "",
    announcement_bar: s.announcement_bar || "",
    video_url: s.video_url || "",
  };
}

async function updateSettings(patch) {
  await initDb();
  const now = new Date().toISOString();
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    await rawQuery(
      "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at",
      [k, String(v ?? ""), now]
    );
  }
  return getSettings();
}

async function listProducts({ includeInactive = false } = {}) {
  await initDb();
  const sql = includeInactive
    ? "SELECT * FROM products ORDER BY sort_order ASC, created_at DESC"
    : "SELECT * FROM products WHERE active = 1 ORDER BY sort_order ASC";
  // Fallback if created_at column doesn't exist on products
  const safeSql = includeInactive
    ? "SELECT * FROM products ORDER BY sort_order ASC, id ASC"
    : "SELECT * FROM products WHERE active = 1 ORDER BY sort_order ASC, id ASC";
  const { rows } = await rawQuery(safeSql);
  return rows.map(formatProduct);
}

async function getProduct(id) {
  await initDb();
  const { rows } = await rawQuery("SELECT * FROM products WHERE id = ?", [id]);
  return formatProduct(rows[0]);
}

async function upsertProduct(data) {
  await initDb();
  const now = new Date().toISOString();
  const id = (data.id || `jk-${Date.now().toString(36)}`).trim();
  const existing = await getProduct(id);
  const p = {
    id,
    name: String(data.name ?? existing?.name ?? "Jayakesh Product").trim(),
    subtitle: String(data.subtitle ?? existing?.subtitle ?? "").trim(),
    size: String(data.size ?? existing?.size ?? "200 ml").trim(),
    price:
      data.price === "" || data.price === null
        ? null
        : data.price !== undefined
          ? Math.max(0, Math.round(Number(data.price)))
          : existing?.price ?? 399,
    compare_price:
      data.compare_price === "" || data.compare_price === null
        ? null
        : data.compare_price !== undefined
          ? Math.max(0, Math.round(Number(data.compare_price)))
          : existing?.compare_price ?? null,
    stock:
      data.stock !== undefined ? Math.max(0, Math.round(Number(data.stock))) : existing?.stock ?? 100,
    active: data.active !== undefined ? (data.active ? 1 : 0) : existing?.active === false ? 0 : 1,
    coming_soon:
      data.coming_soon !== undefined
        ? data.coming_soon
          ? 1
          : 0
        : existing?.coming_soon
          ? 1
          : 0,
    hue_shift:
      data.hue_shift !== undefined ? Number(data.hue_shift || 0) : existing?.hue_shift ?? 0,
    image: String(data.image ?? existing?.image ?? "/assets/bottle.png").trim(),
    description: String(data.description ?? existing?.description ?? "").trim(),
    benefits: Array.isArray(data.benefits) ? data.benefits : existing?.benefits || [],
    highlights: Array.isArray(data.highlights) ? data.highlights : existing?.highlights || [],
    sort_order:
      data.sort_order !== undefined ? Number(data.sort_order || 0) : existing?.sort_order ?? 10,
  };

  await rawQuery(
    `INSERT INTO products (
      id, name, subtitle, size, price, compare_price, stock, active, coming_soon,
      hue_shift, image, description, benefits_json, highlights_json, sort_order, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      subtitle = EXCLUDED.subtitle,
      size = EXCLUDED.size,
      price = EXCLUDED.price,
      compare_price = EXCLUDED.compare_price,
      stock = EXCLUDED.stock,
      active = EXCLUDED.active,
      coming_soon = EXCLUDED.coming_soon,
      hue_shift = EXCLUDED.hue_shift,
      image = EXCLUDED.image,
      description = EXCLUDED.description,
      benefits_json = EXCLUDED.benefits_json,
      highlights_json = EXCLUDED.highlights_json,
      sort_order = EXCLUDED.sort_order,
      updated_at = EXCLUDED.updated_at`,
    [
      p.id,
      p.name,
      p.subtitle,
      p.size,
      p.price,
      p.compare_price,
      p.stock,
      p.active,
      p.coming_soon,
      p.hue_shift,
      p.image,
      p.description,
      JSON.stringify(p.benefits),
      JSON.stringify(p.highlights),
      p.sort_order,
      now,
    ]
  );
  return getProduct(p.id);
}

async function deleteProduct(id) {
  await initDb();
  await rawQuery("DELETE FROM products WHERE id = ?", [id]);
}

function generateOrderNumber() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `JK-${yy}${mm}${dd}-${rand}`;
}

async function createOrder(payload) {
  await initDb();
  const id = crypto.randomUUID();
  let orderNumber = generateOrderNumber();
  const existing = await rawQuery("SELECT id FROM orders WHERE order_number = ?", [orderNumber]);
  if (existing.rows.length > 0) {
    orderNumber = `${orderNumber}${Math.floor(Math.random() * 9 + 1)}`;
  }

  const now = new Date().toISOString();
  const timeline = [
    {
      status: "placed",
      label: "Order placed",
      note:
        payload.payment_method === "upi"
          ? payload.upi_utr
            ? `UPI payment reference submitted (UTR: ${payload.upi_utr})`
            : "Awaiting UPI payment confirmation"
          : "Cash on Delivery selected",
      at: now,
    },
  ];

  await rawQuery(
    `INSERT INTO orders (
      id, order_number, customer_name, customer_phone, customer_email,
      address_line, landmark, city, state, pincode, notes,
      items_json, subtotal, discount, coupon_code, shipping_fee, cod_fee, total,
      payment_method, payment_status, upi_utr, order_status,
      courier_name, tracking_number, tracking_url, admin_notes,
      timeline_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderNumber,
      payload.customer_name,
      payload.customer_phone,
      payload.customer_email,
      payload.address_line,
      payload.landmark || "",
      payload.city,
      payload.state,
      payload.pincode,
      payload.notes || "",
      JSON.stringify(payload.items),
      payload.subtotal,
      payload.discount || 0,
      payload.coupon_code || "",
      payload.shipping_fee || 0,
      payload.cod_fee || 0,
      payload.total,
      payload.payment_method,
      payload.payment_status,
      payload.upi_utr || "",
      "placed",
      "",
      "",
      "",
      "",
      JSON.stringify(timeline),
      now,
      now,
    ]
  );

  // Decrement stock for each item
  for (const item of payload.items) {
    await rawQuery(
      "UPDATE products SET stock = CASE WHEN stock >= ? THEN stock - ? ELSE 0 END WHERE id = ?",
      [item.qty, item.qty, item.id]
    );
  }

  // Increment coupon used_count if applied
  if (payload.coupon_code) {
    await rawQuery("UPDATE coupons SET used_count = used_count + 1 WHERE code = ?", [
      payload.coupon_code.toUpperCase(),
    ]);
  }

  return getOrderByNumber(orderNumber);
}

async function getOrderByNumber(orderNumber) {
  await initDb();
  const { rows } = await rawQuery("SELECT * FROM orders WHERE UPPER(order_number) = UPPER(?)", [
    String(orderNumber || "").trim(),
  ]);
  return formatOrder(rows[0]);
}

async function getOrderById(id) {
  await initDb();
  const { rows } = await rawQuery("SELECT * FROM orders WHERE id = ? OR UPPER(order_number) = UPPER(?)", [
    id,
    id,
  ]);
  return formatOrder(rows[0]);
}

async function listOrders({ status, search, limit = 200 } = {}) {
  await initDb();
  let sql = "SELECT * FROM orders WHERE 1=1";
  const params = [];
  if (status && status !== "all") {
    sql += " AND order_status = ?";
    params.push(status);
  }
  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    sql +=
      " AND (LOWER(order_number) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(customer_email) LIKE ? OR customer_phone LIKE ?)";
    params.push(q, q, q, q);
  }
  sql += " ORDER BY created_at DESC LIMIT ?";
  params.push(Number(limit) || 200);
  const { rows } = await rawQuery(sql, params);
  return rows.map(formatOrder);
}

async function updateOrder(idOrNumber, patch) {
  await initDb();
  const existing = await getOrderById(idOrNumber);
  if (!existing) return null;

  const now = new Date().toISOString();
  const nextStatus = patch.order_status ?? existing.order_status;
  const nextPaymentStatus = patch.payment_status ?? existing.payment_status;
  const nextUtr = patch.upi_utr !== undefined ? String(patch.upi_utr).trim() : existing.upi_utr;
  const nextCourier =
    patch.courier_name !== undefined ? String(patch.courier_name).trim() : existing.courier_name;
  const nextTrackingNum =
    patch.tracking_number !== undefined
      ? String(patch.tracking_number).trim()
      : existing.tracking_number;
  const nextTrackingUrl =
    patch.tracking_url !== undefined ? String(patch.tracking_url).trim() : existing.tracking_url;
  const nextAdminNotes =
    patch.admin_notes !== undefined ? String(patch.admin_notes).trim() : existing.admin_notes;

  const timeline = Array.isArray(existing.timeline) ? [...existing.timeline] : [];
  const statusLabels = {
    placed: "Order placed",
    confirmed: "Order confirmed",
    packed: "Hand-packed & ready for dispatch",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  if (nextStatus !== existing.order_status) {
    let note = patch.timeline_note || "";
    if (!note && nextStatus === "shipped" && (nextCourier || nextTrackingNum)) {
      note = `Dispatched via ${nextCourier || "Courier"}${nextTrackingNum ? ` (AWB: ${nextTrackingNum})` : ""}`;
    }
    timeline.push({
      status: nextStatus,
      label: statusLabels[nextStatus] || nextStatus,
      note,
      at: now,
    });
  } else if (patch.upi_utr && patch.upi_utr !== existing.upi_utr) {
    timeline.push({
      status: existing.order_status,
      label: "UPI reference updated",
      note: `UTR: ${nextUtr}`,
      at: now,
    });
  } else if (nextPaymentStatus !== existing.payment_status) {
    timeline.push({
      status: existing.order_status,
      label: `Payment marked ${nextPaymentStatus.replace(/_/g, " ")}`,
      note: patch.timeline_note || "",
      at: now,
    });
  }

  await rawQuery(
    `UPDATE orders SET
      order_status = ?,
      payment_status = ?,
      upi_utr = ?,
      courier_name = ?,
      tracking_number = ?,
      tracking_url = ?,
      admin_notes = ?,
      timeline_json = ?,
      updated_at = ?
    WHERE id = ?`,
    [
      nextStatus,
      nextPaymentStatus,
      nextUtr,
      nextCourier,
      nextTrackingNum,
      nextTrackingUrl,
      nextAdminNotes,
      JSON.stringify(timeline),
      now,
      existing.id,
    ]
  );

  return getOrderById(existing.id);
}

async function listCoupons() {
  await initDb();
  const { rows } = await rawQuery("SELECT * FROM coupons ORDER BY created_at DESC");
  return rows.map((r) => ({
    ...r,
    value: Number(r.value),
    min_order: Number(r.min_order || 0),
    max_discount: Number(r.max_discount || 0),
    usage_limit: Number(r.usage_limit || 0),
    used_count: Number(r.used_count || 0),
    active: Boolean(Number(r.active)),
  }));
}

async function getCoupon(code) {
  await initDb();
  if (!code) return null;
  const { rows } = await rawQuery("SELECT * FROM coupons WHERE UPPER(code) = UPPER(?)", [
    String(code).trim(),
  ]);
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    ...r,
    value: Number(r.value),
    min_order: Number(r.min_order || 0),
    max_discount: Number(r.max_discount || 0),
    usage_limit: Number(r.usage_limit || 0),
    used_count: Number(r.used_count || 0),
    active: Boolean(Number(r.active)),
  };
}

async function upsertCoupon(data) {
  await initDb();
  const code = String(data.code || "").trim().toUpperCase();
  const now = new Date().toISOString();
  await rawQuery(
    `INSERT INTO coupons (code, type, value, min_order, max_discount, usage_limit, used_count, active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (code) DO UPDATE SET
       type = EXCLUDED.type,
       value = EXCLUDED.value,
       min_order = EXCLUDED.min_order,
       max_discount = EXCLUDED.max_discount,
       usage_limit = EXCLUDED.usage_limit,
       active = EXCLUDED.active`,
    [
      code,
      data.type === "flat" ? "flat" : "percent",
      Math.max(1, Math.round(Number(data.value || 10))),
      Math.max(0, Math.round(Number(data.min_order || 0))),
      Math.max(0, Math.round(Number(data.max_discount || 0))),
      Math.max(0, Math.round(Number(data.usage_limit || 0))),
      0,
      data.active === false ? 0 : 1,
      now,
    ]
  );
  return getCoupon(code);
}

async function deleteCoupon(code) {
  await initDb();
  await rawQuery("DELETE FROM coupons WHERE UPPER(code) = UPPER(?)", [String(code).trim()]);
}

async function listReviews({ approvedOnly = true } = {}) {
  await initDb();
  const sql = approvedOnly
    ? "SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC"
    : "SELECT * FROM reviews ORDER BY created_at DESC";
  const { rows } = await rawQuery(sql);
  return rows.map((r) => ({
    ...r,
    rating: Number(r.rating || 5),
    verified_buyer: Boolean(Number(r.verified_buyer)),
  }));
}

async function createReview(data) {
  await initDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Check if customer placed a real order matching order_number or email
  let verified = data.verified_buyer ? 1 : 0;
  if (!verified && (data.order_number || data.customer_email)) {
    const { rows } = await rawQuery(
      "SELECT id FROM orders WHERE (UPPER(order_number) = UPPER(?) AND ? <> '') OR (LOWER(customer_email) = LOWER(?) AND ? <> '') LIMIT 1",
      [
        String(data.order_number || "").trim(),
        String(data.order_number || "").trim(),
        String(data.customer_email || "").trim(),
        String(data.customer_email || "").trim(),
      ]
    );
    if (rows.length > 0) verified = 1;
  }

  await rawQuery(
    `INSERT INTO reviews (
      id, product_id, order_number, customer_name, customer_email, city,
      rating, title, comment, verified_buyer, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.product_id || "jk-200",
      String(data.order_number || "").trim(),
      String(data.customer_name || "").trim(),
      String(data.customer_email || "").trim(),
      String(data.city || "").trim(),
      Math.min(5, Math.max(1, Math.round(Number(data.rating || 5)))),
      String(data.title || "").trim(),
      String(data.comment || "").trim(),
      verified,
      data.status || "pending",
      now,
    ]
  );

  const { rows } = await rawQuery("SELECT * FROM reviews WHERE id = ?", [id]);
  return rows[0];
}

async function updateReview(id, patch) {
  await initDb();
  if (patch.status) {
    await rawQuery("UPDATE reviews SET status = ? WHERE id = ?", [patch.status, id]);
  }
  if (patch.verified_buyer !== undefined) {
    await rawQuery("UPDATE reviews SET verified_buyer = ? WHERE id = ?", [
      patch.verified_buyer ? 1 : 0,
      id,
    ]);
  }
  const { rows } = await rawQuery("SELECT * FROM reviews WHERE id = ?", [id]);
  return rows[0];
}

async function deleteReview(id) {
  await initDb();
  await rawQuery("DELETE FROM reviews WHERE id = ?", [id]);
}

async function createInquiry(data) {
  await initDb();
  const id = crypto.randomUUID();
  const ticketNumber = "INQ-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const now = new Date().toISOString();
  await rawQuery(
    `INSERT INTO inquiries (
      id, ticket_number, name, email, phone, subject, message, status, admin_reply, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      ticketNumber,
      data.name,
      data.email,
      data.phone,
      data.subject,
      data.message,
      "open",
      "",
      now,
      now,
    ]
  );
  const { rows } = await rawQuery("SELECT * FROM inquiries WHERE id = ?", [id]);
  return rows[0];
}

async function listInquiries() {
  await initDb();
  const { rows } = await rawQuery("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 200");
  return rows;
}

async function updateInquiry(id, patch) {
  await initDb();
  const now = new Date().toISOString();
  await rawQuery(
    "UPDATE inquiries SET status = COALESCE(?, status), admin_reply = COALESCE(?, admin_reply), updated_at = ? WHERE id = ?",
    [patch.status || null, patch.admin_reply !== undefined ? patch.admin_reply : null, now, id]
  );
  const { rows } = await rawQuery("SELECT * FROM inquiries WHERE id = ?", [id]);
  return rows[0];
}

async function createNotification({ type, title, message, link = "", meta = {} }) {
  await initDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await rawQuery(
    `INSERT INTO notifications (id, type, title, message, link, meta_json, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, type, title, message, link, JSON.stringify(meta), now]
  );
  return { id, type, title, message, link, meta, is_read: false, created_at: now };
}

async function listNotifications(limit = 50) {
  await initDb();
  const { rows } = await rawQuery(
    "SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?",
    [Number(limit) || 50]
  );
  const unreadRes = await rawQuery(
    "SELECT COUNT(*) AS cnt FROM notifications WHERE is_read = 0"
  );
  return {
    unreadCount: Number(unreadRes.rows[0]?.cnt || 0),
    items: rows.map((r) => ({
      ...r,
      meta: parseJsonSafe(r.meta_json, {}),
      is_read: Boolean(Number(r.is_read)),
    })),
  };
}

async function markNotificationsRead(id = null) {
  await initDb();
  if (id) {
    await rawQuery("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
  } else {
    await rawQuery("UPDATE notifications SET is_read = 1 WHERE is_read = 0");
  }
}

async function logEmail(entry) {
  await initDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await rawQuery(
    `INSERT INTO email_logs (
      id, recipient, subject, template_type, related_id, provider, status, error_msg, html_body, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      entry.recipient || "",
      entry.subject || "",
      entry.template_type || "general",
      entry.related_id || "",
      entry.provider || "preview",
      entry.status || "logged",
      entry.error_msg || "",
      entry.html_body || "",
      now,
    ]
  );
  return id;
}

async function listEmailLogs(limit = 80) {
  await initDb();
  const { rows } = await rawQuery(
    "SELECT id, recipient, subject, template_type, related_id, provider, status, error_msg, created_at FROM email_logs ORDER BY created_at DESC LIMIT ?",
    [Number(limit) || 80]
  );
  return rows;
}

async function getEmailLogById(id) {
  await initDb();
  const { rows } = await rawQuery("SELECT * FROM email_logs WHERE id = ?", [id]);
  return rows[0] || null;
}

async function getDashboardStats() {
  await initDb();
  const allOrders = await listOrders({ limit: 1000 });
  const todayPrefix = new Date().toISOString().slice(0, 10);

  let totalRevenue = 0;
  let pendingOrders = 0;
  let shippedOrders = 0;
  let deliveredOrders = 0;
  let todayOrders = 0;

  for (const o of allOrders) {
    if (o.order_status !== "cancelled") {
      totalRevenue += Number(o.total || 0);
    }
    if (o.order_status === "placed" || o.order_status === "confirmed" || o.order_status === "packed") {
      pendingOrders++;
    }
    if (o.order_status === "shipped") shippedOrders++;
    if (o.order_status === "delivered") deliveredOrders++;
    if (String(o.created_at || "").startsWith(todayPrefix)) todayOrders++;
  }

  const pendingReviewsRes = await rawQuery(
    "SELECT COUNT(*) AS cnt FROM reviews WHERE status = 'pending'"
  );
  const openInqRes = await rawQuery(
    "SELECT COUNT(*) AS cnt FROM inquiries WHERE status = 'open'"
  );
  const unreadNotifRes = await rawQuery(
    "SELECT COUNT(*) AS cnt FROM notifications WHERE is_read = 0"
  );

  return {
    totalOrders: allOrders.length,
    totalRevenue,
    pendingOrders,
    shippedOrders,
    deliveredOrders,
    todayOrders,
    pendingReviews: Number(pendingReviewsRes.rows[0]?.cnt || 0),
    openInquiries: Number(openInqRes.rows[0]?.cnt || 0),
    unreadNotifications: Number(unreadNotifRes.rows[0]?.cnt || 0),
    storage: getStorageInfo(),
  };
}

module.exports = {
  initDb,
  getStorageInfo,
  getSettings,
  getPublicSettings,
  updateSettings,
  listProducts,
  getProduct,
  upsertProduct,
  deleteProduct,
  createOrder,
  getOrderByNumber,
  getOrderById,
  listOrders,
  updateOrder,
  listCoupons,
  getCoupon,
  upsertCoupon,
  deleteCoupon,
  listReviews,
  createReview,
  updateReview,
  deleteReview,
  createInquiry,
  listInquiries,
  updateInquiry,
  createNotification,
  listNotifications,
  markNotificationsRead,
  logEmail,
  listEmailLogs,
  getEmailLogById,
  getDashboardStats,
};
