<?php
/**
 * JAYAKESH GODADDY EMAIL & NOTIFICATION ENGINE
 * Supports:
 *   1. Resend HTTPS API (if resend_api_key configured in /admin)
 *   2. Direct SSL/TLS Authenticated SMTP (Gmail App Password / GoDaddy SMTP)
 *   3. GoDaddy Native PHP mail() (works automatically on GoDaddy cPanel!)
 */

function jk_esc($s) {
  return htmlspecialchars((string)($s ?? ''), ENT_QUOTES, 'UTF-8');
}

function jk_money($n) {
  if ($n === null || $n === '') return 'To be confirmed';
  return '₹' . number_format((float)$n, 0, '.', ',');
}

function jk_mail_config($settings) {
  $storeName = !empty($settings['store_name']) ? $settings['store_name'] : 'Jayakesh Kerala Hair Oil';
  $resendKey = trim($settings['resend_api_key'] ?? '');
  $smtpHost  = trim(!empty($settings['smtp_host']) ? $settings['smtp_host'] : 'smtp.gmail.com');
  $smtpPort  = (int)(!empty($settings['smtp_port']) ? $settings['smtp_port'] : 465);
  $smtpUser  = trim($settings['smtp_user'] ?? '');
  $smtpPass  = str_replace(' ', '', trim($settings['smtp_pass'] ?? ''));

  $hostDomain = preg_replace('/^www\./i', '', $_SERVER['HTTP_HOST'] ?? 'jayakesh.in');
  $hostDomain = preg_replace('/:\d+$/', '', $hostDomain);
  if ($hostDomain === 'localhost' || strpos($hostDomain, '127.') === 0) {
    $hostDomain = 'jayakesh.in';
  }

  $defaultFrom = $smtpUser ? ($storeName . ' <' . $smtpUser . '>') : ($storeName . ' <orders@' . $hostDomain . '>');
  $from = !empty($settings['email_from']) ? trim($settings['email_from']) : $defaultFrom;
  $adminEmail = trim($settings['admin_notify_email'] ?? ($smtpUser ?: 'itmealanbiju@gmail.com'));
  $supportEmail = trim($settings['support_email'] ?? ('care@' . $hostDomain));

  $provider = 'php_mail';
  if ($resendKey !== '') $provider = 'resend';
  elseif ($smtpUser !== '' && $smtpPass !== '') $provider = 'smtp';
  elseif (!function_exists('mail')) $provider = 'preview';

  return [
    'storeName' => $storeName,
    'whatsapp' => $settings['whatsapp'] ?? '917011083799',
    'phone' => $settings['phone'] ?? '+91 70110 83799',
    'supportEmail' => $supportEmail,
    'adminNotifyEmail' => $adminEmail,
    'from' => $from,
    'resendKey' => $resendKey,
    'smtpHost' => $smtpHost,
    'smtpPort' => $smtpPort,
    'smtpUser' => $smtpUser,
    'smtpPass' => $smtpPass,
    'activeProvider' => $provider,
  ];
}

function jk_smtp_send($host, $port, $user, $pass, $fromHeader, $to, $subject, $html, $replyTo = '') {
  $remote = ($port === 465 ? 'ssl://' : '') . $host . ':' . $port;
  $errno = 0; $errstr = '';
  $fp = @stream_socket_client($remote, $errno, $errstr, 12);
  if (!$fp) return [false, "SMTP connect failed: $errstr ($errno)"];
  stream_set_timeout($fp, 12);

  $read = function() use ($fp) {
    $data = '';
    while ($line = fgets($fp, 515)) {
      $data .= $line;
      if (isset($line[3]) && $line[3] === ' ') break;
    }
    return $data;
  };
  $cmd = function($c) use ($fp, $read) {
    fwrite($fp, $c . "\r\n");
    return $read();
  };

  $read();
  $cmd('EHLO jayakesh.in');
  if ($port === 587) {
    $cmd('STARTTLS');
    @stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
    $cmd('EHLO jayakesh.in');
  }
  $cmd('AUTH LOGIN');
  $cmd(base64_encode($user));
  $authResp = $cmd(base64_encode($pass));
  if (strpos($authResp, '235') !== 0) {
    fclose($fp);
    return [false, 'SMTP authentication failed: ' . trim($authResp)];
  }

  $fromEmail = $user;
  if (preg_match('/<([^>]+)>/', $fromHeader, $m)) $fromEmail = $m[1];

  $cmd("MAIL FROM:<$fromEmail>");
  $cmd("RCPT TO:<$to>");
  $cmd("DATA");

  $encodedSub = '=?UTF-8?B?' . base64_encode($subject) . '?=';
  $headers = [
    "Date: " . date('r'),
    "From: $fromHeader",
    "To: <$to>",
    "Subject: $encodedSub",
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];
  if ($replyTo) $headers[] = "Reply-To: $replyTo";

  $payload = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($html)) . "\r\n.";
  $sendResp = $cmd($payload);
  $cmd("QUIT");
  fclose($fp);

  if (strpos($sendResp, '250') !== 0) {
    return [false, 'SMTP send rejected: ' . trim($sendResp)];
  }
  return [true, ''];
}

function jk_dispatch_email($pdo, $settings, $to, $subject, $html, $replyTo = '', $templateType = 'general', $relatedId = '') {
  $cfg = jk_mail_config($settings);
  $to = trim((string)$to);
  if ($to === '' || strpos($to, '@') === false) {
    jk_log_email($pdo, $to ?: 'none', $subject, $templateType, $relatedId, $cfg['activeProvider'], 'skipped', 'No valid recipient configured', $html);
    return ['ok' => false, 'provider' => $cfg['activeProvider']];
  }

  // 1. Resend HTTPS API
  if ($cfg['resendKey'] !== '' && function_exists('curl_init')) {
    $ch = curl_init('https://api.resend.com/emails');
    $body = ['from' => $cfg['from'], 'to' => [$to], 'subject' => $subject, 'html' => $html];
    if ($replyTo) $body['reply_to'] = $replyTo;
    curl_setopt_array($ch, [
      CURLOPT_POST => true,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $cfg['resendKey'],
        'Content-Type: application/json',
      ],
      CURLOPT_POSTFIELDS => json_encode($body),
      CURLOPT_TIMEOUT => 12,
    ]);
    $resp = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $cerr = curl_error($ch);
    curl_close($ch);
    if ($code >= 200 && $code < 300) {
      jk_log_email($pdo, $to, $subject, $templateType, $relatedId, 'resend', 'sent', '', $html);
      return ['ok' => true, 'provider' => 'resend'];
    }
    if ($cfg['smtpUser'] === '') {
      jk_log_email($pdo, $to, $subject, $templateType, $relatedId, 'resend', 'failed', $cerr ?: (string)$resp, $html);
      return ['ok' => false, 'provider' => 'resend', 'error' => $cerr ?: (string)$resp];
    }
  }

  // 2. Authenticated SMTP (Gmail / Custom)
  if ($cfg['smtpUser'] !== '' && $cfg['smtpPass'] !== '') {
    list($ok, $err) = jk_smtp_send($cfg['smtpHost'], $cfg['smtpPort'], $cfg['smtpUser'], $cfg['smtpPass'], $cfg['from'], $to, $subject, $html, $replyTo);
    if ($ok) {
      jk_log_email($pdo, $to, $subject, $templateType, $relatedId, 'smtp', 'sent', '', $html);
      return ['ok' => true, 'provider' => 'smtp'];
    }
    // Fall back to GoDaddy native PHP mail() if external port 465 is blocked on shared cPanel!
  }

  // 3. GoDaddy Native cPanel PHP mail()
  if (function_exists('mail')) {
    $encodedSub = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $hdrs = "MIME-Version: 1.0\r\n";
    $hdrs .= "Content-type: text/html; charset=UTF-8\r\n";
    $hdrs .= "From: " . $cfg['from'] . "\r\n";
    if ($replyTo) $hdrs .= "Reply-To: " . $replyTo . "\r\n";
    $sent = @mail($to, $encodedSub, $html, $hdrs);
    if ($sent) {
      jk_log_email($pdo, $to, $subject, $templateType, $relatedId, 'php_mail', 'sent', '', $html);
      return ['ok' => true, 'provider' => 'php_mail'];
    }
  }

  jk_log_email($pdo, $to, $subject, $templateType, $relatedId, 'preview', 'queued_preview', 'Saved in Admin Outbox. Create orders@jayakesh.in in GoDaddy Email or add Resend/SMTP key in Settings.', $html);
  return ['ok' => true, 'provider' => 'preview', 'preview' => true];
}

function jk_email_shell($storeName, $badge, $headline, $bodyHtml, $footerContact) {
  $b = jk_esc($badge);
  $h = jk_esc($headline);
  $s = jk_esc($storeName);
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
    . '<body style="margin:0;padding:0;background:#f4efe2;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#14261a;line-height:1.6;">'
    . '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe2;padding:26px 12px;"><tr><td align="center">'
    . '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e5dec9;">'
    . '<tr><td style="background:linear-gradient(145deg,#06210d,#0f4a1f);padding:30px;text-align:center;color:#fbf8f0;">'
    . '<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8fe24f;font-weight:700;margin-bottom:8px;">' . $b . '</div>'
    . '<h1 style="margin:0;font-family:Georgia,serif;font-weight:500;font-size:27px;color:#fbf8f0;">' . $h . '</h1></td></tr>'
    . '<tr><td style="padding:28px;">' . $bodyHtml . '</td></tr>'
    . '<tr><td style="background:#06210d;color:#d6d1c4;padding:20px;text-align:center;font-size:12px;">'
    . '<div style="color:#8fe24f;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:5px;">' . $s . '</div>'
    . '<div>Handmade · Pure Herbal Ingredients · Legacy in Every Drop</div>'
    . '<div style="margin-top:6px;color:#a8b3a2;">' . jk_esc($footerContact) . '</div>'
    . '</td></tr></table></td></tr></table></body></html>';
}

function jk_items_table($order) {
  $rows = '';
  foreach (($order['items'] ?? []) as $it) {
    $lineAmt = ((float)($it['price'] ?? 0)) * ((int)($it['qty'] ?? 1));
    $rows .= '<tr><td style="padding:9px 0;border-bottom:1px solid #eee8d8;"><strong>' . jk_esc($it['name']) . '</strong>'
      . '<div style="font-size:12px;color:#5d6b58;">' . jk_esc($it['size'] ?? '') . ' × ' . (int)$it['qty'] . '</div></td>'
      . '<td align="right" style="padding:9px 0;border-bottom:1px solid #eee8d8;font-weight:600;">' . jk_money($lineAmt) . '</td></tr>';
  }
  $discRow = ($order['discount'] ?? 0) > 0
    ? '<tr><td style="padding:4px 0;color:#17642b;">Discount</td><td align="right" style="padding:4px 0;color:#17642b;">−' . jk_money($order['discount']) . '</td></tr>'
    : '';
  $shipTxt = ((int)($order['shipping_fee'] ?? 0) === 0) ? '<strong style="color:#17642b;">FREE</strong>' : jk_money($order['shipping_fee']);

  return '<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">'
    . $rows
    . '<tr><td style="padding:8px 0 4px;color:#5d6b58;">Subtotal</td><td align="right">' . jk_money($order['subtotal']) . '</td></tr>'
    . $discRow
    . '<tr><td style="padding:4px 0;color:#5d6b58;">Shipping</td><td align="right">' . $shipTxt . '</td></tr>'
    . '<tr><td style="padding:12px 0 0;border-top:2px solid #0f4a1f;font-size:16px;font-weight:700;color:#0a3416;">Total</td>'
    . '<td align="right" style="padding:12px 0 0;border-top:2px solid #0f4a1f;font-size:18px;font-weight:800;color:#0a3416;">' . jk_money($order['total']) . '</td></tr></table>';
}

function jk_send_order_placed($pdo, $settings, $order, $baseUrl) {
  $cfg = jk_mail_config($settings);
  $trackUrl = $baseUrl . '/#/track?order=' . rawurlencode($order['order_number']) . '&phone=' . rawurlencode($order['customer_phone']);
  $invUrl = $baseUrl . '/invoice?order=' . rawurlencode($order['order_number']) . '&phone=' . rawurlencode($order['customer_phone']);
  $payLabel = $order['payment_method'] === 'upi'
    ? ('UPI Payment ' . (!empty($order['upi_utr']) ? '(UTR: ' . $order['upi_utr'] . ')' : '(Verification Pending)'))
    : 'Cash on Delivery (COD)';

  $custBody = '<p>Namaskaram <strong>' . jk_esc($order['customer_name']) . '</strong>,</p>'
    . '<p style="color:#4f5e4a;">Thank you for ordering from <strong>' . jk_esc($cfg['storeName']) . '</strong>. Your order has been received!</p>'
    . '<div style="background:#fbf8f0;border:1px solid #e5dec9;border-radius:14px;padding:15px;margin:15px 0;">'
    . '<div style="font-size:11px;text-transform:uppercase;color:#b8324f;font-weight:700;">Order Number</div>'
    . '<div style="font-size:20px;font-weight:800;color:#0a3416;">' . jk_esc($order['order_number']) . '</div>'
    . '<div style="font-size:13px;color:#5d6b58;">Payment: <strong>' . jk_esc($payLabel) . '</strong></div></div>'
    . jk_items_table($order)
    . '<div style="background:#f8f9f7;border-radius:12px;padding:14px;font-size:13px;margin-bottom:20px;">'
    . '<strong>Delivery Address:</strong><br>' . jk_esc($order['customer_name']) . ' · ' . jk_esc($order['customer_phone']) . '<br>'
    . jk_esc($order['address_line']) . ', ' . jk_esc($order['city']) . ', ' . jk_esc($order['state']) . ' — <strong>' . jk_esc($order['pincode']) . '</strong></div>'
    . '<div style="text-align:center;"><a href="' . jk_esc($trackUrl) . '" style="display:inline-block;background:#0f4a1f;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:13px;text-transform:uppercase;">Track Live Order</a> '
    . '<a href="' . jk_esc($invUrl) . '" style="display:inline-block;background:#fbf8f0;color:#0f4a1f;border:1px solid #0f4a1f;text-decoration:none;padding:11px 20px;border-radius:999px;font-weight:700;font-size:13px;text-transform:uppercase;">Invoice</a></div>';

  $footer = $cfg['phone'] . ' · ' . $cfg['supportEmail'];
  $custRes = jk_dispatch_email(
    $pdo, $settings, $order['customer_email'],
    'Order Confirmed #' . $order['order_number'] . ' | ' . $cfg['storeName'],
    jk_email_shell($cfg['storeName'], 'ORDER CONFIRMATION', 'Thank you for your order.', $custBody, $footer),
    $cfg['supportEmail'], 'order_confirmation_customer', $order['order_number']
  );

  $admBody = '<div style="background:#eef8e8;border:1px solid #b9dfa3;border-radius:14px;padding:15px;margin-bottom:16px;">'
    . '<div style="font-size:20px;font-weight:800;color:#06210d;">' . jk_esc($order['order_number']) . ' · ' . jk_money($order['total']) . '</div>'
    . '<div>Payment: <strong>' . jk_esc($payLabel) . '</strong></div></div>'
    . '<p><strong>Customer:</strong> ' . jk_esc($order['customer_name']) . ' (<a href="tel:' . jk_esc($order['customer_phone']) . '">' . jk_esc($order['customer_phone']) . '</a> · ' . jk_esc($order['customer_email']) . ')</p>'
    . '<p><strong>Address:</strong> ' . jk_esc($order['address_line']) . ', ' . jk_esc($order['city']) . ', ' . jk_esc($order['state']) . ' - ' . jk_esc($order['pincode']) . '</p>'
    . (!empty($order['upi_utr']) ? '<p><strong>UPI UTR:</strong> <code>' . jk_esc($order['upi_utr']) . '</code></p>' : '')
    . jk_items_table($order)
    . '<div style="text-align:center;margin-top:20px;"><a href="' . jk_esc($baseUrl . '/admin') . '" style="display:inline-block;background:#06210d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:13px;text-transform:uppercase;">Open Admin Portal</a></div>';

  $admRes = jk_dispatch_email(
    $pdo, $settings, $cfg['adminNotifyEmail'],
    '🔔 New Order ' . $order['order_number'] . ' (' . jk_money($order['total']) . ') — ' . $order['customer_name'],
    jk_email_shell($cfg['storeName'], 'ADMIN NEW ORDER ALERT', 'New Order ' . $order['order_number'], $admBody, $footer),
    $order['customer_email'], 'order_alert_admin', $order['order_number']
  );

  return ['customerResult' => $custRes, 'adminResult' => $admRes];
}

function jk_send_order_status($pdo, $settings, $order, $baseUrl) {
  $cfg = jk_mail_config($settings);
  $trackUrl = $baseUrl . '/#/track?order=' . rawurlencode($order['order_number']) . '&phone=' . rawurlencode($order['customer_phone']);
  $st = $order['order_status'];
  $headlines = [
    'confirmed' => 'Your order is confirmed!',
    'packed' => 'Hand-packed with care.',
    'shipped' => 'Your hair oil is on its way!',
    'delivered' => 'Delivered — enjoy your ritual!',
    'cancelled' => 'Your order has been cancelled.',
  ];
  $hl = $headlines[$st] ?? ('Order ' . $order['order_number'] . ' Updated');

  $shipBlock = '';
  if (!empty($order['courier_name']) || !empty($order['tracking_number'])) {
    $shipBlock = '<div style="background:#eef8e8;border:1px solid #b9dfa3;border-radius:14px;padding:15px;margin:15px 0;">'
      . '<strong>🚚 Shipment Details</strong><br>'
      . (!empty($order['courier_name']) ? 'Courier: <strong>' . jk_esc($order['courier_name']) . '</strong><br>' : '')
      . (!empty($order['tracking_number']) ? 'AWB / Tracking No: <strong>' . jk_esc($order['tracking_number']) . '</strong><br>' : '')
      . (!empty($order['tracking_url']) ? '<div style="margin-top:8px;"><a href="' . jk_esc($order['tracking_url']) . '" style="background:#17642b;color:#fff;text-decoration:none;padding:8px 16px;border-radius:999px;font-size:12px;font-weight:700;">Track Courier Package</a></div>' : '')
      . '</div>';
  }

  $body = '<p>Hello <strong>' . jk_esc($order['customer_name']) . '</strong>,</p>'
    . '<p>Your order <strong>' . jk_esc($order['order_number']) . '</strong> status is now: <strong style="text-transform:uppercase;color:#0f4a1f;">' . jk_esc($st) . '</strong>.</p>'
    . $shipBlock
    . jk_items_table($order)
    . '<div style="text-align:center;margin-top:20px;"><a href="' . jk_esc($trackUrl) . '" style="display:inline-block;background:#0f4a1f;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:13px;text-transform:uppercase;">View Full Order Timeline</a></div>';

  return jk_dispatch_email(
    $pdo, $settings, $order['customer_email'],
    $hl . ' (#' . $order['order_number'] . ') | ' . $cfg['storeName'],
    jk_email_shell($cfg['storeName'], 'ORDER UPDATE', $hl, $body, $cfg['phone'] . ' · ' . $cfg['supportEmail']),
    $cfg['supportEmail'], 'order_status_' . $st, $order['order_number']
  );
}
