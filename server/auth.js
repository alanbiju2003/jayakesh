const crypto = require("crypto");

function getSecret() {
  return process.env.ADMIN_SECRET || "jayakesh-default-admin-secret-key-2026";
}

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(plain), salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function verifyPasswordHash(plain, stored) {
  if (!stored || !stored.startsWith("scrypt$")) return false;
  const [, salt, hashHex] = stored.split("$");
  if (!salt || !hashHex) return false;
  const derived = crypto.scryptSync(String(plain), salt, 64);
  const expected = Buffer.from(hashHex, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a || ""), "utf8");
  const bufB = Buffer.from(String(b || ""), "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function signAdminToken(email) {
  const payload = {
    sub: email,
    role: "admin",
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const b64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", getSecret()).update(b64).digest("base64url");
  if (!safeCompare(sig, expectedSig)) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    if (!payload || payload.role !== "admin" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx > 0) {
      const k = pair.slice(0, idx).trim();
      const v = decodeURIComponent(pair.slice(idx + 1).trim());
      out[k] = v;
    }
  });
  return out;
}

function extractToken(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies.jk_admin_token || null;
}

function requireAdmin(req, res, next) {
  const token = extractToken(req);
  const decoded = verifyAdminToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized. Please sign in to the Admin Portal." });
  }
  req.admin = decoded;
  next();
}

module.exports = {
  hashPassword,
  verifyPasswordHash,
  safeCompare,
  signAdminToken,
  verifyAdminToken,
  extractToken,
  requireAdmin,
};
