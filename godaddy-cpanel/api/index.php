<?php
/**
 * JAYAKESH KERALA HAIR OIL — GODADDY NATIVE PHP BACKEND API
 * Zero external dependencies. Runs 24/7 inside GoDaddy cPanel (PHP + SQLite or MySQL).
 */

error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
ini_set('display_errors', '0');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

function jk_json($data, $status = 200) {
  http_response_code($status);
  header('Content-Type: application/json; charset=UTF-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function jk_body() {
  $raw = file_get_contents('php://input');
  if (!$raw) return $_POST ?: [];
  $decoded = json_decode($raw, true);
  return is_array($decoded) ? $decoded : [];
}

function jk_uuid() {
  return bin2hex(random_bytes(16));
}

function jk_now() {
  return gmdate('Y-m-d\TH:i:s\Z');
}

function jk_base_url() {
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  $proto = $https ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? 'jayakesh.in';
  return $proto . '://' . $host;
}

/* ---------- Database Connection & Auto-Migration ---------- */
function jk_db() {
  static $pdo = null;
  if ($pdo !== null) return $pdo;

  $isMysql = defined('DB_MYSQL_NAME') && DB_MYSQL_NAME !== '';
  if ($isMysql) {
    $dsn = 'mysql:host=' . DB_MYSQL_HOST . ';dbname=' . DB_MYSQL_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_MYSQL_USER, DB_MYSQL_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
  } else {
    $dir = __DIR__ . '/storage';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $pdo = new PDO('sqlite:' . $dir . '/jayakesh.sqlite', null, null, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA journal_mode = WAL;');
  }

  $pkText = $isMysql ? 'VARCHAR(120) PRIMARY KEY' : 'TEXT PRIMARY KEY';
  $uniqText = $isMysql ? 'VARCHAR(64) UNIQUE NOT NULL' : 'TEXT UNIQUE NOT NULL';

  $tables = [
    "CREATE TABLE IF NOT EXISTS settings (`key` $pkText, `value` TEXT NOT NULL, updated_at VARCHAR(40) NOT NULL)",
    "CREATE TABLE IF NOT EXISTS products (
      id $pkText, name TEXT NOT NULL, subtitle TEXT, size VARCHAR(60) NOT NULL,
      price INT NULL, compare_price INT NULL, stock INT DEFAULT 100, active INT DEFAULT 1,
      coming_soon INT DEFAULT 0, hue_shift INT DEFAULT 0, image TEXT, description TEXT,
      benefits_json TEXT, highlights_json TEXT, sort_order INT DEFAULT 0, updated_at VARCHAR(40) NOT NULL
    )",
    "CREATE TABLE IF NOT EXISTS orders (
      id $pkText, order_number $uniqText, customer_name TEXT NOT NULL, customer_phone VARCHAR(40) NOT NULL,
      customer_email VARCHAR(180) NOT NULL, address_line TEXT NOT NULL, landmark TEXT,
      city VARCHAR(120) NOT NULL, state VARCHAR(120) NOT NULL, pincode VARCHAR(20) NOT NULL,
      notes TEXT, items_json LONGTEXT NOT NULL, subtotal INT NOT NULL, discount INT DEFAULT 0,
      coupon_code VARCHAR(60), shipping_fee INT DEFAULT 0, cod_fee INT DEFAULT 0, total INT NOT NULL,
      payment_method VARCHAR(30) NOT NULL, payment_status VARCHAR(50) NOT NULL, upi_utr VARCHAR(80),
      order_status VARCHAR(40) NOT NULL, courier_name VARCHAR(120), tracking_number VARCHAR(120),
      tracking_url TEXT, admin_notes TEXT, timeline_json LONGTEXT NOT NULL,
      created_at VARCHAR(40) NOT NULL, updated_at VARCHAR(40) NOT NULL
    )",
    "CREATE TABLE IF NOT EXISTS coupons (
      code $pkText, type VARCHAR(20) NOT NULL, value INT NOT NULL, min_order INT DEFAULT 0,
      max_discount INT DEFAULT 0, usage_limit INT DEFAULT 0, used_count INT DEFAULT 0,
      active INT DEFAULT 1, created_at VARCHAR(40) NOT NULL
    )",
    "CREATE TABLE IF NOT EXISTS reviews (
      id $pkText, product_id VARCHAR(80) NOT NULL, order_number VARCHAR(64),
      customer_name VARCHAR(160) NOT NULL, customer_email VARCHAR(180), city VARCHAR(120),
      rating INT NOT NULL, title VARCHAR(200), comment TEXT NOT NULL,
      verified_buyer INT DEFAULT 0, status VARCHAR(30) NOT NULL, created_at VARCHAR(40) NOT NULL
    )",
    "CREATE TABLE IF NOT EXISTS inquiries (
      id $pkText, ticket_number VARCHAR(40) NOT NULL, name VARCHAR(160) NOT NULL,
      email VARCHAR(180) NOT NULL, phone VARCHAR(40) NOT NULL, subject VARCHAR(240) NOT NULL,
      message TEXT NOT NULL, status VARCHAR(30) NOT NULL, admin_reply TEXT,
      created_at VARCHAR(40) NOT NULL, updated_at VARCHAR(40) NOT NULL
    )",
    "CREATE TABLE IF NOT EXISTS notifications (
      id $pkText, type VARCHAR(40) NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
      link TEXT, meta_json TEXT, is_read INT DEFAULT 0, created_at VARCHAR(40) NOT NULL
    )",
    "CREATE TABLE IF NOT EXISTS email_logs (
      id $pkText, recipient VARCHAR(200) NOT NULL, subject TEXT NOT NULL,
      template_type VARCHAR(60) NOT NULL, related_id VARCHAR(80), provider VARCHAR(40) NOT NULL,
      status VARCHAR(40) NOT NULL, error_msg TEXT, html_body LONGTEXT, created_at VARCHAR(40) NOT NULL
    )",
  ];

  foreach ($tables as $sql) {
    if (!$isMysql) {
      $sql = str_replace('LONGTEXT', 'TEXT', $sql);
    }
    $pdo->exec($sql);
  }

  // Seed default settings & products once
  $cnt = (int)$pdo->query("SELECT COUNT(*) FROM settings")->fetchColumn();
  $now = jk_now();
  if ($cnt === 0) {
    $defaults = [
      'store_name' => 'Jayakesh Kerala Hair Oil',
      'whatsapp' => '917011083799',
      'phone' => '+91 70110 83799',
      'support_email' => 'care@jayakesh.in',
      'admin_notify_email' => 'itmealanbiju@gmail.com',
      'address' => 'Kerala, India',
      'instagram' => '',
      'upi_id' => '',
      'upi_payee_name' => 'Jayakesh Kerala Hair Oil',
      'cod_enabled' => 'true',
      'upi_enabled' => 'true',
      'shipping_fee' => '49',
      'free_shipping_min' => '499',
      'cod_fee' => '0',
      'gst_number' => '',
      'auto_approve_reviews' => 'false',
      'announcement_bar' => 'Handmade Kerala Herbal Hair Oil · Free Pan-India Shipping on orders ₹499+',
      'video_url' => '',
    ];
    $st = $pdo->prepare("INSERT INTO settings (`key`, `value`, updated_at) VALUES (?, ?, ?)");
    foreach ($defaults as $k => $v) $st->execute([$k, $v, $now]);
  }

  if ((int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn() === 0) {
    $seedProducts = [
      ['jk-200', 'Jayakesh Kerala Hair Oil', 'Traditional Handmade Herbal Infusion', '200 ml', 399, 499, 100, 1, 0, 0, '/assets/bottle.png', 'Jayakesh Kerala Hair Oil is a handmade herbal hair oil, made in the Kerala tradition with pure herbal ingredients and no harmful chemicals.', json_encode(['Helps reduce hair fall', 'Promotes healthy hair growth', 'Nourishes the scalp', 'Strengthens hair']), json_encode(['Handmade', 'No harmful chemicals', 'Pure herbal ingredients']), 1, $now],
      ['jk-soon-1', 'New Herbal Care', 'Coming soon', '100 ml', 249, null, 0, 1, 1, 40, '/assets/bottle.png', 'Upcoming handmade herbal creation from Jayakesh.', '[]', '["Coming soon"]', 2, $now],
      ['jk-soon-2', 'Intensive Scalp Ritual', 'Coming soon', '200 ml', 449, null, 0, 1, 1, -35, '/assets/bottle.png', 'Upcoming handmade herbal creation from Jayakesh.', '[]', '["Coming soon"]', 3, $now],
      ['jk-soon-3', 'Gentle Herbal Cleanser', 'Coming soon', '200 ml', 349, null, 0, 1, 1, 110, '/assets/bottle.png', 'Upcoming handmade herbal creation from Jayakesh.', '[]', '["Coming soon"]', 4, $now],
    ];
    $ps = $pdo->prepare("INSERT INTO products (id,name,subtitle,size,price,compare_price,stock,active,coming_soon,hue_shift,image,description,benefits_json,highlights_json,sort_order,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    foreach ($seedProducts as $sp) $ps->execute($sp);
  }

  if ((int)$pdo->query("SELECT COUNT(*) FROM coupons")->fetchColumn() === 0) {
    $pdo->prepare("INSERT INTO coupons (code,type,value,min_order,max_discount,usage_limit,used_count,active,created_at) VALUES (?,?,?,?,?,?,?,?,?)")
        ->execute(['WELCOME10', 'percent', 10, 299, 200, 0, 0, 1, $now]);
  }

  return $pdo;
}

/* ---------- Data Helpers ---------- */
function jk_get_settings($pdo) {
  $rows = $pdo->query("SELECT `key`, `value` FROM settings")->fetchAll();
  $out = [];
  foreach ($rows as $r) $out[$r['key']] = $r['value'];
  return $out;
}

function jk_save_setting($pdo, $k, $v) {
  $now = jk_now();
  $chk = $pdo->prepare("SELECT COUNT(*) FROM settings WHERE `key` = ?");
  $chk->execute([$k]);
  if ((int)$chk->fetchColumn() > 0) {
    $pdo->prepare("UPDATE settings SET `value` = ?, updated_at = ? WHERE `key` = ?")->execute([(string)$v, $now, $k]);
  } else {
    $pdo->prepare("INSERT INTO settings (`key`, `value`, updated_at) VALUES (?, ?, ?)")->execute([$k, (string)$v, $now]);
  }
}

function jk_public_settings($s) {
  return [
    'store_name' => $s['store_name'] ?? 'Jayakesh Kerala Hair Oil',
    'whatsapp' => $s['whatsapp'] ?? '917011083799',
    'phone' => $s['phone'] ?? '+91 70110 83799',
    'support_email' => $s['support_email'] ?? 'care@jayakesh.in',
    'address' => $s['address'] ?? 'Kerala, India',
    'instagram' => $s['instagram'] ?? '',
    'upi_id' => $s['upi_id'] ?? '',
    'upi_payee_name' => $s['upi_payee_name'] ?? 'Jayakesh Kerala Hair Oil',
    'cod_enabled' => ($s['cod_enabled'] ?? 'true') === 'true',
    'upi_enabled' => ($s['upi_enabled'] ?? 'true') === 'true',
    'shipping_fee' => (int)($s['shipping_fee'] ?? 49),
    'free_shipping_min' => (int)($s['free_shipping_min'] ?? 499),
    'cod_fee' => (int)($s['cod_fee'] ?? 0),
    'gst_number' => $s['gst_number'] ?? '',
    'announcement_bar' => $s['announcement_bar'] ?? '',
    'video_url' => $s['video_url'] ?? '',
  ];
}

function jk_fmt_product($r) {
  if (!$r) return null;
  return [
    'id' => $r['id'],
    'name' => $r['name'],
    'subtitle' => $r['subtitle'] ?? '',
    'size' => $r['size'],
    'price' => $r['price'] === null ? null : (int)$r['price'],
    'compare_price' => $r['compare_price'] === null ? null : (int)$r['compare_price'],
    'stock' => (int)($r['stock'] ?? 0),
    'active' => (bool)((int)$r['active']),
    'coming_soon' => (bool)((int)$r['coming_soon']),
    'hue_shift' => (int)($r['hue_shift'] ?? 0),
    'image' => $r['image'] ?: '/assets/bottle.png',
    'description' => $r['description'] ?? '',
    'benefits' => json_decode($r['benefits_json'] ?: '[]', true) ?: [],
    'highlights' => json_decode($r['highlights_json'] ?: '[]', true) ?: [],
    'sort_order' => (int)($r['sort_order'] ?? 0),
    'updated_at' => $r['updated_at'],
  ];
}

function jk_fmt_order($r) {
  if (!$r) return null;
  return [
    'id' => $r['id'],
    'order_number' => $r['order_number'],
    'customer_name' => $r['customer_name'],
    'customer_phone' => $r['customer_phone'],
    'customer_email' => $r['customer_email'],
    'address_line' => $r['address_line'],
    'landmark' => $r['landmark'] ?? '',
    'city' => $r['city'],
    'state' => $r['state'],
    'pincode' => $r['pincode'],
    'notes' => $r['notes'] ?? '',
    'items' => json_decode($r['items_json'] ?: '[]', true) ?: [],
    'subtotal' => (int)$r['subtotal'],
    'discount' => (int)$r['discount'],
    'coupon_code' => $r['coupon_code'] ?? '',
    'shipping_fee' => (int)$r['shipping_fee'],
    'cod_fee' => (int)$r['cod_fee'],
    'total' => (int)$r['total'],
    'payment_method' => $r['payment_method'],
    'payment_status' => $r['payment_status'],
    'upi_utr' => $r['upi_utr'] ?? '',
    'order_status' => $r['order_status'],
    'courier_name' => $r['courier_name'] ?? '',
    'tracking_number' => $r['tracking_number'] ?? '',
    'tracking_url' => $r['tracking_url'] ?? '',
    'admin_notes' => $r['admin_notes'] ?? '',
    'timeline' => json_decode($r['timeline_json'] ?: '[]', true) ?: [],
    'created_at' => $r['created_at'],
    'updated_at' => $r['updated_at'],
  ];
}

function jk_log_email($pdo, $recipient, $subject, $tpl, $relId, $provider, $status, $err, $html) {
  $st = $pdo->prepare("INSERT INTO email_logs (id,recipient,subject,template_type,related_id,provider,status,error_msg,html_body,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)");
  $st->execute([jk_uuid(), $recipient, $subject, $tpl, $relId, $provider, $status, $err, $html, jk_now()]);
}

function jk_notify($pdo, $settings, $type, $title, $msg, $link = '') {
  $pdo->prepare("INSERT INTO notifications (id,type,title,message,link,meta_json,is_read,created_at) VALUES (?,?,?,?,?,'{}',0,?)")
      ->execute([jk_uuid(), $type, $title, $msg, $link, jk_now()]);

  $tgToken = trim($settings['telegram_bot_token'] ?? '');
  $tgChat  = trim($settings['telegram_chat_id'] ?? '');
  if ($tgToken !== '' && $tgChat !== '' && function_exists('curl_init')) {
    $ch = curl_init("https://api.telegram.org/bot{$tgToken}/sendMessage");
    curl_setopt_array($ch, [
      CURLOPT_POST => true,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
      CURLOPT_POSTFIELDS => json_encode(['chat_id' => $tgChat, 'text' => "🌿 $title\n$msg"]),
      CURLOPT_TIMEOUT => 5,
    ]);
    @curl_exec($ch);
    curl_close($ch);
  }
}

function jk_upi_payload($settings, $amount, $note = 'Jayakesh Order') {
  $upiId = trim($settings['upi_id'] ?? '');
  $payee = trim($settings['upi_payee_name'] ?? 'Jayakesh Kerala Hair Oil');
  if ($upiId === '') return ['configured' => false, 'upiId' => '', 'payeeName' => $payee, 'uri' => '', 'qrSvg' => ''];
  $q = ['pa' => $upiId, 'pn' => $payee, 'cu' => 'INR', 'tn' => substr($note, 0, 50)];
  if ($amount > 0) $q['am'] = number_format((float)$amount, 2, '.', '');
  $uri = 'upi://pay?' . http_build_query($q, '', '&', PHP_QUERY_RFC3986);
  return ['configured' => true, 'upiId' => $upiId, 'payeeName' => $payee, 'uri' => $uri, 'qrSvg' => ''];
}

/* ---------- Admin Auth ---------- */
function jk_b64u_enc($s) { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function jk_b64u_dec($s) { return base64_decode(strtr($s, '-_', '+/')); }

function jk_sign_token($email) {
  $payload = json_encode(['sub' => $email, 'role' => 'admin', 'exp' => (time() + 7 * 86400) * 1000]);
  $b64 = jk_b64u_enc($payload);
  $sig = jk_b64u_enc(hash_hmac('sha256', $b64, JK_ADMIN_SECRET, true));
  return $b64 . '.' . $sig;
}

function jk_check_admin() {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
  if ($hdr === '' && function_exists('getallheaders')) {
    $all = getallheaders();
    $hdr = $all['Authorization'] ?? $all['authorization'] ?? '';
  }
  $tok = '';
  if (stripos($hdr, 'Bearer ') === 0) $tok = trim(substr($hdr, 7));
  elseif (!empty($_COOKIE['jk_admin_token'])) $tok = $_COOKIE['jk_admin_token'];
  if (strpos($tok, '.') === false) return null;
  list($b64, $sig) = explode('.', $tok, 2);
  $expected = jk_b64u_enc(hash_hmac('sha256', $b64, JK_ADMIN_SECRET, true));
  if (!hash_equals($expected, $sig)) return null;
  $data = json_decode(jk_b64u_dec($b64), true);
  if (!$data || ($data['role'] ?? '') !== 'admin' || ($data['exp'] ?? 0) < time() * 1000) return null;
  return $data;
}

function jk_require_admin() {
  $adm = jk_check_admin();
  if (!$adm) jk_json(['error' => 'Unauthorized. Please sign in to the Admin Portal.'], 401);
  return $adm;
}

/* ---------- Coupon Helper ---------- */
function jk_eval_coupon($pdo, $code, $subtotal) {
  $st = $pdo->prepare("SELECT * FROM coupons WHERE UPPER(code) = UPPER(?)");
  $st->execute([trim($code)]);
  $c = $st->fetch();
  if (!$c || !(int)$c['active']) return [false, 0, null, 'Invalid or inactive coupon code'];
  if ((int)$c['usage_limit'] > 0 && (int)$c['used_count'] >= (int)$c['usage_limit']) {
    return [false, 0, null, 'Coupon usage limit reached'];
  }
  if ($subtotal < (int)$c['min_order']) {
    return [false, 0, null, 'Minimum order of ₹' . (int)$c['min_order'] . ' required'];
  }
  $disc = $c['type'] === 'flat' ? (int)$c['value'] : (int)round(($subtotal * (int)$c['value']) / 100);
  if ((int)$c['max_discount'] > 0 && $disc > (int)$c['max_discount']) $disc = (int)$c['max_discount'];
  $disc = min($disc, $subtotal);
  return [true, $disc, $c, ''];
}

/* ---------- Router ---------- */
$pdo = jk_db();
$settings = jk_get_settings($pdo);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

if ($uriPath === '/sitemap.xml') {
  $base = jk_base_url();
  $today = gmdate('Y-m-d');
  header('Content-Type: application/xml; charset=UTF-8');
  echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    . "<url><loc>{$base}/</loc><lastmod>{$today}</lastmod><priority>1.0</priority></url>"
    . "<url><loc>{$base}/#/shop</loc><lastmod>{$today}</lastmod><priority>0.9</priority></url>"
    . "<url><loc>{$base}/#/ingredients</loc><lastmod>{$today}</lastmod><priority>0.8</priority></url>"
    . "<url><loc>{$base}/#/about</loc><lastmod>{$today}</lastmod><priority>0.8</priority></url>"
    . "<url><loc>{$base}/#/track</loc><lastmod>{$today}</lastmod><priority>0.7</priority></url>"
    . "<url><loc>{$base}/#/contact</loc><lastmod>{$today}</lastmod><priority>0.7</priority></url></urlset>";
  exit;
}

// Public endpoints
if ($uriPath === '/api/health') {
  $drv = (defined('DB_MYSQL_NAME') && DB_MYSQL_NAME !== '') ? 'mysql' : 'sqlite';
  jk_json(['ok' => true, 'service' => 'jayakesh-godaddy-php', 'storage' => ['driver' => $drv, 'persistent' => true, 'warning' => null]]);
}

if ($uriPath === '/api/store' && $method === 'GET') {
  $prods = array_map('jk_fmt_product', $pdo->query("SELECT * FROM products WHERE active = 1 ORDER BY sort_order ASC, id ASC")->fetchAll());
  $revs = $pdo->query("SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC")->fetchAll();
  foreach ($revs as &$rv) { $rv['rating'] = (int)$rv['rating']; $rv['verified_buyer'] = (bool)((int)$rv['verified_buyer']); }
  jk_json(['settings' => jk_public_settings($settings), 'products' => $prods, 'reviews' => $revs]);
}

if ($uriPath === '/api/upi-qr' && $method === 'GET') {
  $amt = (float)($_GET['amount'] ?? 0);
  $note = (string)($_GET['note'] ?? 'Jayakesh Order');
  jk_json(jk_upi_payload($settings, $amt, $note));
}

if ($uriPath === '/api/coupons/validate' && $method === 'POST') {
  $b = jk_body();
  $code = strtoupper(trim($b['code'] ?? ''));
  $sub = (int)($b['subtotal'] ?? 0);
  list($ok, $disc, $c, $reason) = jk_eval_coupon($pdo, $code, $sub);
  if (!$ok) jk_json(['error' => $reason], 400);
  $msg = $c['type'] === 'flat' ? ("₹{$disc} discount applied!") : ("{$c['value']}% off (₹{$disc}) applied!");
  jk_json(['valid' => true, 'code' => $c['code'], 'type' => $c['type'], 'value' => (int)$c['value'], 'discount' => $disc, 'message' => $msg]);
}

if ($uriPath === '/api/orders' && $method === 'POST') {
  $b = jk_body();
  $name = trim($b['name'] ?? '');
  $phone = trim($b['phone'] ?? '');
  $digits = preg_replace('/\D/', '', $phone);
  $email = trim($b['email'] ?? '');
  $addr = trim($b['address'] ?? '');
  $landmark = trim($b['landmark'] ?? '');
  $city = trim($b['city'] ?? '');
  $state = trim($b['state'] ?? 'Kerala');
  $pin = trim($b['pincode'] ?? '');
  $notes = trim($b['notes'] ?? '');
  $payMethod = ($b['payment_method'] ?? 'cod') === 'upi' ? 'upi' : 'cod';
  $utr = trim($b['upi_utr'] ?? '');
  $cpCode = strtoupper(trim($b['coupon_code'] ?? ''));
  $rawItems = is_array($b['items'] ?? null) ? $b['items'] : [];

  $errors = [];
  if (strlen($name) < 2) $errors['name'] = 'Enter your full name';
  if (strlen($digits) < 10) $errors['phone'] = 'Enter a valid 10-digit mobile number';
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Enter a valid email address';
  if (strlen($addr) < 6) $errors['address'] = 'Enter complete delivery address';
  if (strlen($city) < 2) $errors['city'] = 'Enter your city';
  if (!preg_match('/^\d{6}$/', $pin)) $errors['pincode'] = 'Enter a valid 6-digit PIN code';
  if (empty($rawItems)) $errors['items'] = 'Cart is empty';
  if (!empty($errors)) jk_json(['error' => 'Please check the highlighted delivery fields.', 'errors' => $errors], 400);

  $pubSet = jk_public_settings($settings);
  $verified = [];
  $subtotal = 0;
  $pst = $pdo->prepare("SELECT * FROM products WHERE id = ?");
  foreach ($rawItems as $it) {
    $pst->execute([$it['id'] ?? '']);
    $p = jk_fmt_product($pst->fetch());
    if (!$p || !$p['active'] || $p['coming_soon']) jk_json(['error' => 'Product unavailable'], 400);
    $qty = max(1, min(20, (int)($it['qty'] ?? 1)));
    if ($p['stock'] < $qty) jk_json(['error' => "Only {$p['stock']} units available in stock."], 400);
    $unit = (int)$p['price'];
    $subtotal += $unit * $qty;
    $verified[] = ['id' => $p['id'], 'name' => $p['name'], 'size' => $p['size'], 'price' => $unit, 'qty' => $qty, 'image' => $p['image']];
  }

  $disc = 0; $appliedCp = '';
  if ($cpCode !== '') {
    list($okCp, $dVal, $cpRow) = jk_eval_coupon($pdo, $cpCode, $subtotal);
    if ($okCp) { $disc = $dVal; $appliedCp = $cpRow['code']; }
  }
  $afterDisc = max(0, $subtotal - $disc);
  $shipFee = ($pubSet['free_shipping_min'] > 0 && $afterDisc >= $pubSet['free_shipping_min']) ? 0 : $pubSet['shipping_fee'];
  $codFee = $payMethod === 'cod' ? $pubSet['cod_fee'] : 0;
  $total = $afterDisc + $shipFee + $codFee;
  $payStatus = $payMethod === 'upi' ? ($utr !== '' ? 'upi_verification_pending' : 'awaiting_upi') : 'cod_pending';

  $ordId = jk_uuid();
  $ordNum = 'JK-' . gmdate('ymd') . '-' . strtoupper(bin2hex(random_bytes(2)));
  $now = jk_now();
  $timeline = [[
    'status' => 'placed',
    'label' => 'Order placed',
    'note' => $payMethod === 'upi' ? ($utr ? "UPI UTR submitted ($utr)" : 'Awaiting UPI payment') : 'Cash on Delivery selected',
    'at' => $now,
  ]];

  $ins = $pdo->prepare("INSERT INTO orders (id,order_number,customer_name,customer_phone,customer_email,address_line,landmark,city,state,pincode,notes,items_json,subtotal,discount,coupon_code,shipping_fee,cod_fee,total,payment_method,payment_status,upi_utr,order_status,courier_name,tracking_number,tracking_url,admin_notes,timeline_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
  $ins->execute([$ordId, $ordNum, $name, $phone, $email, $addr, $landmark, $city, $state, $pin, $notes, json_encode($verified), $subtotal, $disc, $appliedCp, $shipFee, $codFee, $total, $payMethod, $payStatus, $utr, 'placed', '', '', '', '', json_encode($timeline), $now, $now]);

  foreach ($verified as $vi) {
    $pdo->prepare("UPDATE products SET stock = CASE WHEN stock >= ? THEN stock - ? ELSE 0 END WHERE id = ?")->execute([$vi['qty'], $vi['qty'], $vi['id']]);
  }
  if ($appliedCp !== '') {
    $pdo->prepare("UPDATE coupons SET used_count = used_count + 1 WHERE code = ?")->execute([$appliedCp]);
  }

  $stOrd = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
  $stOrd->execute([$ordId]);
  $order = jk_fmt_order($stOrd->fetch());

  $mailRes = jk_send_order_placed($pdo, $settings, $order, jk_base_url());
  jk_notify($pdo, $settings, 'new_order', "New Order {$order['order_number']} (₹{$order['total']})", "{$order['customer_name']} from {$order['city']} placed a " . strtoupper($payMethod) . " order.", "#orders:{$order['order_number']}");

  $upi = $payMethod === 'upi' ? jk_upi_payload($settings, $order['total'], "Order {$order['order_number']}") : null;
  jk_json(['ok' => true, 'order' => $order, 'upi' => $upi, 'emailStatus' => $mailRes['customerResult']['provider'] ?? 'logged'], 201);
}

if (preg_match('#^/api/orders/([^/]+)/utr$#', $uriPath, $m) && $method === 'POST') {
  $ordNum = urldecode($m[1]);
  $b = jk_body();
  $utr = trim($b['upi_utr'] ?? '');
  if (strlen($utr) < 6) jk_json(['error' => 'Enter a valid 12-digit UPI UTR reference.'], 400);
  $st = $pdo->prepare("SELECT * FROM orders WHERE UPPER(order_number) = UPPER(?)");
  $st->execute([$ordNum]);
  $row = $st->fetch();
  if (!$row) jk_json(['error' => 'Order not found'], 404);
  $ord = jk_fmt_order($row);
  $tl = $ord['timeline'];
  $tl[] = ['status' => $ord['order_status'], 'label' => 'UPI reference updated', 'note' => "UTR: $utr", 'at' => jk_now()];
  $newPaySt = $ord['payment_status'] === 'paid' ? 'paid' : 'upi_verification_pending';
  $pdo->prepare("UPDATE orders SET upi_utr = ?, payment_status = ?, timeline_json = ?, updated_at = ? WHERE id = ?")
      ->execute([$utr, $newPaySt, json_encode($tl), jk_now(), $ord['id']]);
  $st->execute([$ordNum]);
  $updated = jk_fmt_order($st->fetch());
  jk_notify($pdo, $settings, 'payment_utr', "UPI UTR Submitted — {$updated['order_number']}", "UTR: $utr for ₹{$updated['total']}");
  jk_json(['ok' => true, 'order' => $updated]);
}

if ($uriPath === '/api/orders/track' && $method === 'GET') {
  $ordNum = trim($_GET['order'] ?? '');
  $contact = trim($_GET['contact'] ?? $_GET['phone'] ?? '');
  if ($ordNum === '') jk_json(['error' => 'Enter Order ID'], 400);
  $st = $pdo->prepare("SELECT * FROM orders WHERE UPPER(order_number) = UPPER(?)");
  $st->execute([$ordNum]);
  $order = jk_fmt_order($st->fetch());
  if (!$order) jk_json(['error' => 'No order found with that Order ID.'], 404);

  $isAdmin = (bool)jk_check_admin();
  if (!$isAdmin) {
    $inDigits = preg_replace('/\D/', '', $contact);
    $ordDigits = preg_replace('/\D/', '', $order['customer_phone']);
    $phMatch = strlen($inDigits) >= 10 && substr($ordDigits, -10) === substr($inDigits, -10);
    $emMatch = strtolower($order['customer_email']) === strtolower($contact);
    if (!$phMatch && !$emMatch) jk_json(['error' => 'Phone number or email does not match this Order ID.'], 403);
    unset($order['admin_notes']);
  }
  $upi = ($order['payment_method'] === 'upi' && $order['payment_status'] !== 'paid')
    ? jk_upi_payload($settings, $order['total'], "Order {$order['order_number']}") : null;
  jk_json(['ok' => true, 'order' => $order, 'settings' => jk_public_settings($settings), 'upi' => $upi]);
}

if ($uriPath === '/api/contact' && $method === 'POST') {
  $b = jk_body();
  $name = trim($b['name'] ?? ''); $email = trim($b['email'] ?? '');
  $phone = trim($b['phone'] ?? ''); $subject = trim($b['subject'] ?? ''); $msg = trim($b['message'] ?? '');
  $errs = [];
  if (strlen($name) < 2) $errs['name'] = 'Enter your name';
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errs['email'] = 'Enter valid email';
  if (strlen(preg_replace('/\D/', '', $phone)) < 10) $errs['phone'] = 'Enter valid phone';
  if (strlen($subject) < 3) $errs['subject'] = 'Enter subject';
  if (strlen($msg) < 10) $errs['message'] = 'Write at least 10 characters';
  if (!empty($errs)) jk_json(['error' => 'Please check the form fields.', 'errors' => $errs], 400);

  $id = jk_uuid();
  $ticket = 'INQ-' . strtoupper(bin2hex(random_bytes(3)));
  $now = jk_now();
  $pdo->prepare("INSERT INTO inquiries (id,ticket_number,name,email,phone,subject,message,status,admin_reply,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'open','',?,?)")
      ->execute([$id, $ticket, $name, $email, $phone, $subject, $msg, $now, $now]);

  $cfg = jk_mail_config($settings);
  $ackHtml = jk_email_shell($cfg['storeName'], 'INQUIRY RECEIVED', "We've received your message.", "<p>Hello <strong>" . jk_esc($name) . "</strong>, thank you for contacting Jayakesh (Ticket <strong>$ticket</strong>). We will reply shortly.</p>", $cfg['phone']);
  jk_dispatch_email($pdo, $settings, $email, "We received your message [$ticket] | {$cfg['storeName']}", $ackHtml, $cfg['supportEmail'], 'inquiry_customer_ack', $ticket);

  $admHtml = jk_email_shell($cfg['storeName'], 'NEW INQUIRY', $subject, "<p><strong>From:</strong> " . jk_esc($name) . " ($email · $phone)</p><p>" . nl2br(jk_esc($msg)) . "</p>", $cfg['phone']);
  jk_dispatch_email($pdo, $settings, $cfg['adminNotifyEmail'], "📩 Inquiry [$ticket]: $subject", $admHtml, $email, 'inquiry_admin_alert', $ticket);

  jk_notify($pdo, $settings, 'inquiry', "New Inquiry: $subject", "$name ($phone) sent ticket $ticket");
  jk_json(['ok' => true, 'ticket_number' => $ticket], 201);
}

if ($uriPath === '/api/reviews' && $method === 'GET') {
  $revs = $pdo->query("SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC")->fetchAll();
  jk_json(['reviews' => $revs]);
}

if ($uriPath === '/api/reviews' && $method === 'POST') {
  $b = jk_body();
  $cName = trim($b['name'] ?? $b['customer_name'] ?? '');
  $cEmail = trim($b['email'] ?? '');
  $ordNum = trim($b['order_number'] ?? '');
  $city = trim($b['city'] ?? '');
  $rating = max(1, min(5, (int)($b['rating'] ?? 5)));
  $comment = trim($b['comment'] ?? '');
  if (strlen($cName) < 2 || strlen($comment) < 8) jk_json(['error' => 'Please enter your name and review.'], 400);

  $chk = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE (UPPER(order_number) = UPPER(?) AND ? <> '') OR (LOWER(customer_email) = LOWER(?) AND ? <> '')");
  $chk->execute([$ordNum, $ordNum, $cEmail, $cEmail]);
  $verified = ((int)$chk->fetchColumn() > 0) ? 1 : 0;
  $auto = ($settings['auto_approve_reviews'] ?? 'false') === 'true';
  $stVal = $auto ? 'approved' : 'pending';

  $pdo->prepare("INSERT INTO reviews (id,product_id,order_number,customer_name,customer_email,city,rating,title,comment,verified_buyer,status,created_at) VALUES (?,?,?,?,?,?,?,'',?,?,?,?)")
      ->execute([jk_uuid(), 'jk-200', $ordNum, $cName, $cEmail, $city, $rating, $comment, $verified, $stVal, jk_now()]);
  jk_notify($pdo, $settings, 'review', "New {$rating}★ Review from $cName", substr($comment, 0, 90));
  jk_json(['ok' => true, 'autoApproved' => $auto, 'message' => $auto ? 'Thank you! Your review is live.' : 'Thank you! Submitted for verification.'], 201);
}

/* ---------- Admin Routes ---------- */
if ($uriPath === '/api/admin/login' && $method === 'POST') {
  $b = jk_body();
  $em = strtolower(trim($b['email'] ?? ''));
  $pw = (string)($b['password'] ?? '');
  $validEmails = [strtolower(JK_ADMIN_EMAIL), 'admin@jayakesh.com', 'admin', 'itmealanbiju@gmail.com'];
  $emOk = ($em === '' || in_array($em, $validEmails, true));
  $pwOk = false;
  if (!empty($settings['admin_password_hash'])) {
    $pwOk = password_verify($pw, $settings['admin_password_hash']);
  }
  if (!$pwOk) $pwOk = hash_equals(JK_ADMIN_PASSWORD, $pw);
  if (!$emOk || !$pwOk) jk_json(['error' => 'Invalid admin credentials.'], 401);

  $tok = jk_sign_token(JK_ADMIN_EMAIL);
  setcookie('jk_admin_token', $tok, time() + 7 * 86400, '/', '', isset($_SERVER['HTTPS']), true);
  jk_json(['ok' => true, 'token' => $tok, 'email' => JK_ADMIN_EMAIL]);
}

if ($uriPath === '/api/admin/logout' && $method === 'POST') {
  setcookie('jk_admin_token', '', time() - 3600, '/');
  jk_json(['ok' => true]);
}

if ($uriPath === '/api/admin/me' && $method === 'GET') {
  $adm = jk_require_admin();
  $all = $pdo->query("SELECT order_status, total, created_at FROM orders")->fetchAll();
  $todayPfx = gmdate('Y-m-d');
  $rev = 0; $pend = 0; $ship = 0; $deliv = 0; $today = 0;
  foreach ($all as $o) {
    if ($o['order_status'] !== 'cancelled') $rev += (int)$o['total'];
    if (in_array($o['order_status'], ['placed', 'confirmed', 'packed'], true)) $pend++;
    if ($o['order_status'] === 'shipped') $ship++;
    if ($o['order_status'] === 'delivered') $deliv++;
    if (strpos($o['created_at'], $todayPfx) === 0) $today++;
  }
  $mCfg = jk_mail_config($settings);
  $drv = (defined('DB_MYSQL_NAME') && DB_MYSQL_NAME !== '') ? 'mysql' : 'sqlite';
  jk_json([
    'ok' => true,
    'admin' => $adm,
    'stats' => [
      'totalOrders' => count($all),
      'totalRevenue' => $rev,
      'pendingOrders' => $pend,
      'shippedOrders' => $ship,
      'deliveredOrders' => $deliv,
      'todayOrders' => $today,
      'pendingReviews' => (int)$pdo->query("SELECT COUNT(*) FROM reviews WHERE status='pending'")->fetchColumn(),
      'openInquiries' => (int)$pdo->query("SELECT COUNT(*) FROM inquiries WHERE status='open'")->fetchColumn(),
      'unreadNotifications' => (int)$pdo->query("SELECT COUNT(*) FROM notifications WHERE is_read=0")->fetchColumn(),
      'storage' => ['driver' => $drv, 'persistent' => true, 'warning' => null],
    ],
    'emailStatus' => [
      'activeProvider' => $mCfg['activeProvider'],
      'adminNotifyEmail' => $mCfg['adminNotifyEmail'],
      'from' => $mCfg['from'],
    ],
  ]);
}

if ($uriPath === '/api/admin/orders' && $method === 'GET') {
  jk_require_admin();
  $sql = "SELECT * FROM orders WHERE 1=1";
  $p = [];
  if (!empty($_GET['status']) && $_GET['status'] !== 'all') { $sql .= " AND order_status = ?"; $p[] = $_GET['status']; }
  if (!empty($_GET['search'])) {
    $q = '%' . strtolower(trim($_GET['search'])) . '%';
    $sql .= " AND (LOWER(order_number) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(customer_email) LIKE ? OR customer_phone LIKE ?)";
    array_push($p, $q, $q, $q, $q);
  }
  $sql .= " ORDER BY created_at DESC LIMIT 250";
  $st = $pdo->prepare($sql); $st->execute($p);
  jk_json(['orders' => array_map('jk_fmt_order', $st->fetchAll())]);
}

if (preg_match('#^/api/admin/orders/([^/]+)$#', $uriPath, $m) && $method === 'GET') {
  jk_require_admin();
  $st = $pdo->prepare("SELECT * FROM orders WHERE id = ? OR UPPER(order_number) = UPPER(?)");
  $st->execute([$m[1], $m[1]]);
  $ord = jk_fmt_order($st->fetch());
  if (!$ord) jk_json(['error' => 'Order not found'], 404);
  jk_json(['order' => $ord]);
}

if (preg_match('#^/api/admin/orders/([^/]+)$#', $uriPath, $m) && $method === 'PATCH') {
  jk_require_admin();
  $b = jk_body();
  $st = $pdo->prepare("SELECT * FROM orders WHERE id = ? OR UPPER(order_number) = UPPER(?)");
  $st->execute([$m[1], $m[1]]);
  $before = jk_fmt_order($st->fetch());
  if (!$before) jk_json(['error' => 'Order not found'], 404);

  $nextStatus = $b['order_status'] ?? $before['order_status'];
  $nextPay = $b['payment_status'] ?? $before['payment_status'];
  $nextUtr = isset($b['upi_utr']) ? trim($b['upi_utr']) : $before['upi_utr'];
  $nextCourier = isset($b['courier_name']) ? trim($b['courier_name']) : $before['courier_name'];
  $nextTrackNo = isset($b['tracking_number']) ? trim($b['tracking_number']) : $before['tracking_number'];
  $nextTrackUrl = isset($b['tracking_url']) ? trim($b['tracking_url']) : $before['tracking_url'];
  $nextNotes = isset($b['admin_notes']) ? trim($b['admin_notes']) : $before['admin_notes'];

  $tl = $before['timeline'];
  if ($nextStatus !== $before['order_status']) {
    $note = '';
    if ($nextStatus === 'shipped' && ($nextCourier || $nextTrackNo)) {
      $note = "Dispatched via $nextCourier" . ($nextTrackNo ? " (AWB: $nextTrackNo)" : '');
    }
    $tl[] = ['status' => $nextStatus, 'label' => ucfirst($nextStatus), 'note' => $note, 'at' => jk_now()];
  }

  $pdo->prepare("UPDATE orders SET order_status=?, payment_status=?, upi_utr=?, courier_name=?, tracking_number=?, tracking_url=?, admin_notes=?, timeline_json=?, updated_at=? WHERE id=?")
      ->execute([$nextStatus, $nextPay, $nextUtr, $nextCourier, $nextTrackNo, $nextTrackUrl, $nextNotes, json_encode($tl), jk_now(), $before['id']]);

  $st->execute([$before['id'], $before['id']]);
  $updated = jk_fmt_order($st->fetch());
  $mailRes = null;
  if (!empty($b['notify_customer']) || $nextStatus !== $before['order_status']) {
    $mailRes = jk_send_order_status($pdo, $settings, $updated, jk_base_url());
  }
  jk_json(['ok' => true, 'order' => $updated, 'emailResult' => $mailRes]);
}

if (preg_match('#^/api/admin/orders/([^/]+)/resend-email$#', $uriPath, $m) && $method === 'POST') {
  jk_require_admin();
  $st = $pdo->prepare("SELECT * FROM orders WHERE id = ? OR UPPER(order_number) = UPPER(?)");
  $st->execute([$m[1], $m[1]]);
  $ord = jk_fmt_order($st->fetch());
  if (!$ord) jk_json(['error' => 'Order not found'], 404);
  $res = jk_send_order_placed($pdo, $settings, $ord, jk_base_url());
  jk_json(['ok' => true, 'result' => $res]);
}

if ($uriPath === '/api/admin/products' && $method === 'GET') {
  jk_require_admin();
  $prods = array_map('jk_fmt_product', $pdo->query("SELECT * FROM products ORDER BY sort_order ASC, id ASC")->fetchAll());
  jk_json(['products' => $prods]);
}

if ($uriPath === '/api/admin/products' && $method === 'POST') {
  jk_require_admin();
  $b = jk_body();
  $id = trim($b['id'] ?? '') ?: ('jk-' . strtolower(bin2hex(random_bytes(3))));
  $price = ($b['price'] === '' || $b['price'] === null) ? null : max(0, (int)$b['price']);
  $cmp = ($b['compare_price'] ?? '') === '' ? null : max(0, (int)$b['compare_price']);
  $stock = max(0, (int)($b['stock'] ?? 100));
  $active = !empty($b['active']) ? 1 : 0;
  $soon = !empty($b['coming_soon']) ? 1 : 0;
  $img = trim($b['image'] ?? '/assets/bottle.png');
  $desc = trim($b['description'] ?? '');
  $ben = json_encode($b['benefits'] ?? []);
  $hi = json_encode($b['highlights'] ?? []);
  $now = jk_now();

  $chk = $pdo->prepare("SELECT COUNT(*) FROM products WHERE id = ?");
  $chk->execute([$id]);
  if ((int)$chk->fetchColumn() > 0) {
    $pdo->prepare("UPDATE products SET name=?, size=?, price=?, compare_price=?, stock=?, active=?, coming_soon=?, image=?, description=?, benefits_json=?, highlights_json=?, updated_at=? WHERE id=?")
        ->execute([trim($b['name'] ?? 'Product'), trim($b['size'] ?? '200 ml'), $price, $cmp, $stock, $active, $soon, $img, $desc, $ben, $hi, $now, $id]);
  } else {
    $pdo->prepare("INSERT INTO products (id,name,subtitle,size,price,compare_price,stock,active,coming_soon,hue_shift,image,description,benefits_json,highlights_json,sort_order,updated_at) VALUES (?,?,'',?,?,?,?,?,?,0,?,?,?,?,10,?)")
        ->execute([$id, trim($b['name'] ?? 'Product'), trim($b['size'] ?? '200 ml'), $price, $cmp, $stock, $active, $soon, $img, $desc, $ben, $hi, $now]);
  }
  jk_json(['ok' => true]);
}

if (preg_match('#^/api/admin/products/([^/]+)$#', $uriPath, $m) && $method === 'DELETE') {
  jk_require_admin();
  if ($m[1] === 'jk-200') jk_json(['error' => 'Flagship product cannot be deleted.'], 400);
  $pdo->prepare("DELETE FROM products WHERE id = ?")->execute([$m[1]]);
  jk_json(['ok' => true]);
}

if ($uriPath === '/api/admin/settings' && $method === 'GET') {
  jk_require_admin();
  $safe = $settings;
  unset($safe['admin_password_hash']);
  if (!empty($safe['smtp_pass'])) $safe['smtp_pass'] = '••••••••••••';
  if (!empty($safe['resend_api_key'])) $safe['resend_api_key'] = 're_••••••••••••';
  $mc = jk_mail_config($settings);
  jk_json(['settings' => $safe, 'mailDiagnostics' => ['activeProvider' => $mc['activeProvider'], 'from' => $mc['from'], 'adminNotifyEmail' => $mc['adminNotifyEmail']]]);
}

if ($uriPath === '/api/admin/settings' && $method === 'PUT') {
  jk_require_admin();
  $b = jk_body();
  if (!empty($b['new_admin_password'])) {
    if (strlen($b['new_admin_password']) < 6) jk_json(['error' => 'Password must be at least 6 characters'], 400);
    jk_save_setting($pdo, 'admin_password_hash', password_hash($b['new_admin_password'], PASSWORD_DEFAULT));
    unset($b['new_admin_password']);
  }
  foreach ($b as $k => $v) {
    if (($k === 'smtp_pass' || $k === 'resend_api_key') && strpos((string)$v, '••') !== false) continue;
    jk_save_setting($pdo, $k, $v);
  }
  jk_json(['ok' => true]);
}

if ($uriPath === '/api/admin/coupons' && $method === 'GET') {
  jk_require_admin();
  $rows = $pdo->query("SELECT * FROM coupons ORDER BY created_at DESC")->fetchAll();
  foreach ($rows as &$r) { $r['active'] = (bool)((int)$r['active']); $r['value'] = (int)$r['value']; $r['min_order'] = (int)$r['min_order']; $r['max_discount'] = (int)$r['max_discount']; $r['used_count'] = (int)$r['used_count']; }
  jk_json(['coupons' => $rows]);
}

if ($uriPath === '/api/admin/coupons' && $method === 'POST') {
  jk_require_admin();
  $b = jk_body();
  $code = strtoupper(trim($b['code'] ?? ''));
  if ($code === '') jk_json(['error' => 'Code required'], 400);
  $pdo->prepare("DELETE FROM coupons WHERE UPPER(code) = UPPER(?)")->execute([$code]);
  $pdo->prepare("INSERT INTO coupons (code,type,value,min_order,max_discount,usage_limit,used_count,active,created_at) VALUES (?,?,?,?,?,0,0,1,?)")
      ->execute([$code, ($b['type'] ?? 'percent') === 'flat' ? 'flat' : 'percent', max(1, (int)($b['value'] ?? 10)), max(0, (int)($b['min_order'] ?? 0)), max(0, (int)($b['max_discount'] ?? 0)), jk_now()]);
  jk_json(['ok' => true]);
}

if (preg_match('#^/api/admin/coupons/([^/]+)$#', $uriPath, $m) && $method === 'DELETE') {
  jk_require_admin();
  $pdo->prepare("DELETE FROM coupons WHERE UPPER(code) = UPPER(?)")->execute([urldecode($m[1])]);
  jk_json(['ok' => true]);
}

if ($uriPath === '/api/admin/reviews' && $method === 'GET') {
  jk_require_admin();
  $rows = $pdo->query("SELECT * FROM reviews ORDER BY created_at DESC")->fetchAll();
  foreach ($rows as &$r) { $r['rating'] = (int)$r['rating']; $r['verified_buyer'] = (bool)((int)$r['verified_buyer']); }
  jk_json(['reviews' => $rows]);
}

if (preg_match('#^/api/admin/reviews/([^/]+)$#', $uriPath, $m) && $method === 'PATCH') {
  jk_require_admin();
  $b = jk_body();
  if (!empty($b['status'])) $pdo->prepare("UPDATE reviews SET status = ? WHERE id = ?")->execute([$b['status'], $m[1]]);
  jk_json(['ok' => true]);
}

if (preg_match('#^/api/admin/reviews/([^/]+)$#', $uriPath, $m) && $method === 'DELETE') {
  jk_require_admin();
  $pdo->prepare("DELETE FROM reviews WHERE id = ?")->execute([$m[1]]);
  jk_json(['ok' => true]);
}

if ($uriPath === '/api/admin/inquiries' && $method === 'GET') {
  jk_require_admin();
  jk_json(['inquiries' => $pdo->query("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 200")->fetchAll()]);
}

if (preg_match('#^/api/admin/inquiries/([^/]+)$#', $uriPath, $m) && $method === 'PATCH') {
  jk_require_admin();
  $b = jk_body();
  $pdo->prepare("UPDATE inquiries SET status = ?, updated_at = ? WHERE id = ?")->execute([$b['status'] ?? 'resolved', jk_now(), $m[1]]);
  jk_json(['ok' => true]);
}

if ($uriPath === '/api/admin/notifications' && $method === 'GET') {
  jk_require_admin();
  $rows = $pdo->query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 40")->fetchAll();
  foreach ($rows as &$r) $r['is_read'] = (bool)((int)$r['is_read']);
  $unread = (int)$pdo->query("SELECT COUNT(*) FROM notifications WHERE is_read = 0")->fetchColumn();
  jk_json(['unreadCount' => $unread, 'items' => $rows]);
}

if ($uriPath === '/api/admin/notifications/read' && $method === 'POST') {
  jk_require_admin();
  $pdo->exec("UPDATE notifications SET is_read = 1 WHERE is_read = 0");
  jk_json(['ok' => true]);
}

if ($uriPath === '/api/admin/emails' && $method === 'GET') {
  jk_require_admin();
  $rows = $pdo->query("SELECT id,recipient,subject,template_type,related_id,provider,status,error_msg,created_at FROM email_logs ORDER BY created_at DESC LIMIT 80")->fetchAll();
  jk_json(['logs' => $rows]);
}

if (preg_match('#^/api/admin/emails/([^/]+)$#', $uriPath, $m) && $m[1] !== 'test' && $method === 'GET') {
  jk_require_admin();
  $st = $pdo->prepare("SELECT * FROM email_logs WHERE id = ?");
  $st->execute([$m[1]]);
  jk_json(['log' => $st->fetch()]);
}

if ($uriPath === '/api/admin/emails/test' && $method === 'POST') {
  jk_require_admin();
  $b = jk_body();
  $cfg = jk_mail_config($settings);
  $to = trim($b['to'] ?? $cfg['adminNotifyEmail']);
  $html = jk_email_shell($cfg['storeName'], 'SYSTEM DIAGNOSTIC', 'GoDaddy Email Active!', '<p>Your <strong>Jayakesh</strong> backend email engine is active via <strong>' . strtoupper($cfg['activeProvider']) . '</strong>!</p>', $cfg['phone']);
  $res = jk_dispatch_email($pdo, $settings, $to, '✅ Test Email Successful | ' . $cfg['storeName'], $html, $cfg['supportEmail'], 'diagnostic_test', 'TEST');
  jk_json(['ok' => $res['ok'], 'result' => $res]);
}

jk_json(['error' => 'API route not found: ' . $uriPath], 404);
