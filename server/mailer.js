const nodemailer = require("nodemailer");
const db = require("./db");

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function money(n) {
  if (n === null || n === undefined) return "To be confirmed";
  return "₹" + Number(n).toLocaleString("en-IN");
}

async function resolveMailConfig() {
  const s = await db.getSettings();
  const resendKey = (s.resend_api_key || process.env.RESEND_API_KEY || "").trim();
  const smtpHost = (s.smtp_host || process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const smtpPort = Number(s.smtp_port || process.env.SMTP_PORT || 465);
  const smtpSecure =
    (s.smtp_secure || process.env.SMTP_SECURE || String(smtpPort === 465)).toLowerCase() !== "false";
  const smtpUser = (s.smtp_user || process.env.SMTP_USER || "").trim();
  const smtpPass = (s.smtp_pass || process.env.SMTP_PASS || "").trim();

  const fromRaw = (
    s.email_from ||
    process.env.EMAIL_FROM ||
    (smtpUser ? `${s.store_name || "Jayakesh"} <${smtpUser}>` : "Jayakesh Kerala Hair Oil <orders@jayakesh.in>")
  ).trim();

  const adminNotifyEmail = (
    s.admin_notify_email ||
    process.env.ADMIN_NOTIFY_EMAIL ||
    smtpUser ||
    process.env.ADMIN_EMAIL ||
    ""
  ).trim();

  let activeProvider = "preview";
  if (resendKey) activeProvider = "resend";
  else if (smtpUser && smtpPass) activeProvider = "smtp";

  return {
    storeName: s.store_name || "Jayakesh Kerala Hair Oil",
    whatsapp: s.whatsapp || "917011083799",
    phone: s.phone || "+91 70110 83799",
    supportEmail: s.support_email || adminNotifyEmail || "care@jayakesh.in",
    address: s.address || "Kerala, India",
    resendKey,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPass,
    from: fromRaw,
    adminNotifyEmail,
    activeProvider,
  };
}

async function dispatchEmail({ to, subject, html, replyTo, templateType = "general", relatedId = "" }) {
  const cfg = await resolveMailConfig();
  if (!to || !String(to).includes("@")) {
    await db.logEmail({
      recipient: String(to || "none"),
      subject,
      template_type: templateType,
      related_id: relatedId,
      provider: cfg.activeProvider,
      status: "skipped",
      error_msg: "No valid recipient email configured",
      html_body: html,
    });
    return { ok: false, skipped: true, reason: "No recipient email" };
  }

  // Provider 1: Resend HTTP API (Custom GoDaddy Domain Email)
  if (cfg.resendKey) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: cfg.from,
          to: [to],
          subject,
          html,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data.message || data.error || `Resend HTTP ${resp.status}`);
      }
      await db.logEmail({
        recipient: to,
        subject,
        template_type: templateType,
        related_id: relatedId,
        provider: "resend",
        status: "sent",
        html_body: html,
      });
      return { ok: true, provider: "resend", id: data.id };
    } catch (err) {
      // If SMTP is also configured, try falling back to SMTP!
      if (!cfg.smtpUser || !cfg.smtpPass) {
        await db.logEmail({
          recipient: to,
          subject,
          template_type: templateType,
          related_id: relatedId,
          provider: "resend",
          status: "failed",
          error_msg: err.message,
          html_body: html,
        });
        return { ok: false, provider: "resend", error: err.message };
      }
    }
  }

  // Provider 2: Gmail / Custom SMTP via Nodemailer
  if (cfg.smtpUser && cfg.smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: cfg.smtpHost,
        port: cfg.smtpPort,
        secure: cfg.smtpSecure,
        auth: {
          user: cfg.smtpUser,
          pass: cfg.smtpPass.replace(/\s+/g, ""), // Gmail app passwords often copied with spaces
        },
      });

      const fromAddr = cfg.from.includes("@") ? cfg.from : `${cfg.storeName} <${cfg.smtpUser}>`;
      await transporter.sendMail({
        from: fromAddr,
        to,
        subject,
        html,
        ...(replyTo ? { replyTo } : {}),
      });

      await db.logEmail({
        recipient: to,
        subject,
        template_type: templateType,
        related_id: relatedId,
        provider: "smtp",
        status: "sent",
        html_body: html,
      });
      return { ok: true, provider: "smtp" };
    } catch (err) {
      await db.logEmail({
        recipient: to,
        subject,
        template_type: templateType,
        related_id: relatedId,
        provider: "smtp",
        status: "failed",
        error_msg: err.message,
        html_body: html,
      });
      return { ok: false, provider: "smtp", error: err.message };
    }
  }

  // Preview / Outbox Log Mode (when neither Resend nor Gmail SMTP is set yet)
  await db.logEmail({
    recipient: to,
    subject,
    template_type: templateType,
    related_id: relatedId,
    provider: "preview",
    status: "queued_preview",
    error_msg: "Email saved to Admin Outbox (configure Gmail App Password or Resend API Key in Admin -> Email Settings to send live emails).",
    html_body: html,
  });
  return { ok: true, provider: "preview", preview: true };
}

function emailShell({ storeName, preheader, badge, headline, bodyHtml, footerContact }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(headline)}</title>
</head>
<body style="margin:0;padding:0;background:#f4efe2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#14261a;line-height:1.6;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader || headline)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe2;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5dec9;box-shadow:0 12px 32px rgba(6,33,13,0.08);">
          <tr>
            <td style="background:linear-gradient(145deg,#06210d,#0f4a1f);padding:32px 30px;text-align:center;color:#fbf8f0;">
              <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8fe24f;font-weight:700;margin-bottom:8px;">${esc(badge || "JAYAKESH · KERALA HAIR OIL")}</div>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:28px;line-height:1.2;color:#fbf8f0;">${esc(headline)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:#06210d;color:#d6d1c4;padding:22px 30px;text-align:center;font-size:12px;">
              <div style="color:#8fe24f;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">${esc(storeName)}</div>
              <div>Handmade · Pure Herbal Ingredients · Legacy in Every Drop</div>
              <div style="margin-top:8px;color:#a8b3a2;">${footerContact}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderOrderItemsTable(order) {
  const rows = (order.items || [])
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee8d8;">
          <strong style="color:#14261a;">${esc(item.name)}</strong>
          <div style="font-size:12px;color:#5d6b58;">${esc(item.size || "")} × ${Number(item.qty)}</div>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #eee8d8;font-weight:600;color:#14261a;">
          ${money(Number(item.price || 0) * Number(item.qty || 1))}
        </td>
      </tr>`
    )
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;font-size:14px;">
    ${rows}
    <tr>
      <td style="padding:8px 0 4px;color:#5d6b58;">Subtotal</td>
      <td align="right" style="padding:8px 0 4px;">${money(order.subtotal)}</td>
    </tr>
    ${
      order.discount > 0
        ? `<tr>
            <td style="padding:4px 0;color:#17642b;">Discount ${order.coupon_code ? `(${esc(order.coupon_code)})` : ""}</td>
            <td align="right" style="padding:4px 0;color:#17642b;">−${money(order.discount)}</td>
          </tr>`
        : ""
    }
    <tr>
      <td style="padding:4px 0;color:#5d6b58;">Shipping</td>
      <td align="right" style="padding:4px 0;">${order.shipping_fee === 0 ? '<span style="color:#17642b;font-weight:700;">FREE</span>' : money(order.shipping_fee)}</td>
    </tr>
    ${
      order.cod_fee > 0
        ? `<tr>
            <td style="padding:4px 0;color:#5d6b58;">COD Handling</td>
            <td align="right" style="padding:4px 0;">${money(order.cod_fee)}</td>
          </tr>`
        : ""
    }
    <tr>
      <td style="padding:12px 0 0;border-top:2px solid #0f4a1f;font-size:16px;font-weight:700;color:#0a3416;">Total</td>
      <td align="right" style="padding:12px 0 0;border-top:2px solid #0f4a1f;font-size:18px;font-weight:800;color:#0a3416;">${money(order.total)}</td>
    </tr>
  </table>`;
}

async function sendOrderPlacedEmails(order, baseUrl) {
  const cfg = await resolveMailConfig();
  const site = (baseUrl || process.env.PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const trackUrl = `${site}/#/track?order=${encodeURIComponent(order.order_number)}&phone=${encodeURIComponent(order.customer_phone)}`;
  const invoiceUrl = `${site}/invoice?order=${encodeURIComponent(order.order_number)}&phone=${encodeURIComponent(order.customer_phone)}`;
  const waSupport = `https://wa.me/${cfg.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello Jayakesh, regarding my order ${order.order_number}`)}`;

  const payLabel =
    order.payment_method === "upi"
      ? `UPI Payment ${order.upi_utr ? `(UTR: ${order.upi_utr})` : "(Verification Pending)"}`
      : "Cash on Delivery (Pay on Arrival)";

  const customerBody = `
    <p style="margin:0 0 14px;font-size:15px;">Namaskaram <strong>${esc(order.customer_name)}</strong>,</p>
    <p style="margin:0 0 18px;color:#4f5e4a;">Thank you for choosing <strong>${esc(cfg.storeName)}</strong>. Your order has been received and our team is preparing your handmade Kerala herbal hair oil.</p>
    
    <div style="background:#fbf8f0;border:1px solid #e5dec9;border-radius:14px;padding:16px 18px;margin-bottom:18px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#b8324f;font-weight:700;">Order Reference</div>
      <div style="font-size:20px;font-weight:800;color:#0a3416;margin-top:2px;">${esc(order.order_number)}</div>
      <div style="font-size:13px;color:#5d6b58;margin-top:4px;">Payment: <strong>${esc(payLabel)}</strong></div>
    </div>

    ${renderOrderItemsTable(order)}

    <div style="background:#f8f9f7;border-radius:14px;padding:14px 16px;font-size:13px;color:#33422f;margin-bottom:22px;">
      <strong style="display:block;color:#0a3416;margin-bottom:4px;text-transform:uppercase;font-size:11px;letter-spacing:1.2px;">Delivery Address</strong>
      ${esc(order.customer_name)} · ${esc(order.customer_phone)}<br>
      ${esc(order.address_line)}${order.landmark ? `, ${esc(order.landmark)}` : ""}<br>
      ${esc(order.city)}, ${esc(order.state)} — <strong>${esc(order.pincode)}</strong>
    </div>

    <div style="text-align:center;margin:24px 0 12px;">
      <a href="${esc(trackUrl)}" style="display:inline-block;background:#0f4a1f;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:700;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;">Track Live Order</a>
      <a href="${esc(invoiceUrl)}" style="display:inline-block;background:#fbf8f0;color:#0f4a1f;border:1px solid #0f4a1f;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;margin-left:8px;">Download Invoice</a>
    </div>
    <p style="text-align:center;font-size:12px;color:#5d6b58;margin-top:16px;">Need help? <a href="${esc(waSupport)}" style="color:#17642b;font-weight:700;">Chat with us on WhatsApp</a></p>
  `;

  const footerContact = `${esc(cfg.phone)} · ${esc(cfg.supportEmail)}`;
  const customerHtml = emailShell({
    storeName: cfg.storeName,
    preheader: `Order ${order.order_number} confirmed! Total: ${money(order.total)}`,
    badge: "ORDER CONFIRMATION",
    headline: "Thank you for your order.",
    bodyHtml: customerBody,
    footerContact,
  });

  const customerResult = await dispatchEmail({
    to: order.customer_email,
    subject: `Order Confirmed #${order.order_number} | ${cfg.storeName}`,
    html: customerHtml,
    replyTo: cfg.supportEmail,
    templateType: "order_confirmation_customer",
    relatedId: order.order_number,
  });

  // Admin New Order Notification Email
  const cleanCustomerPhone = order.customer_phone.replace(/\D/g, "");
  const waCustomerUrl = `https://wa.me/${cleanCustomerPhone.length === 10 ? "91" + cleanCustomerPhone : cleanCustomerPhone}?text=${encodeURIComponent(
    `Hello ${order.customer_name}, thank you for your Jayakesh order #${order.order_number} (${money(order.total)}). Your order is confirmed!`
  )}`;

  const adminBody = `
    <div style="background:#eef8e8;border:1px solid #b9dfa3;border-radius:14px;padding:16px 18px;margin-bottom:18px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#17642b;font-weight:800;">New Store Order Received</div>
      <div style="font-size:22px;font-weight:800;color:#06210d;margin-top:2px;">${esc(order.order_number)} · ${money(order.total)}</div>
      <div style="font-size:13px;color:#33422f;margin-top:4px;">Method: <strong>${esc(payLabel)}</strong></div>
    </div>

    <h3 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#0f4a1f;">Customer & Shipping Details</h3>
    <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;background:#fbf8f0;border-radius:12px;padding:10px;margin-bottom:16px;">
      <tr><td style="color:#5d6b58;width:120px;">Name</td><td><strong>${esc(order.customer_name)}</strong></td></tr>
      <tr><td style="color:#5d6b58;">Phone</td><td><a href="tel:${esc(order.customer_phone)}" style="color:#0f4a1f;font-weight:700;">${esc(order.customer_phone)}</a></td></tr>
      <tr><td style="color:#5d6b58;">Email</td><td><a href="mailto:${esc(order.customer_email)}" style="color:#0f4a1f;">${esc(order.customer_email)}</a></td></tr>
      <tr><td style="color:#5d6b58;">Address</td><td>${esc(order.address_line)}${order.landmark ? `, ${esc(order.landmark)}` : ""}, ${esc(order.city)}, ${esc(order.state)} — <strong>${esc(order.pincode)}</strong></td></tr>
      ${order.notes ? `<tr><td style="color:#5d6b58;">Order Notes</td><td>${esc(order.notes)}</td></tr>` : ""}
      ${order.upi_utr ? `<tr><td style="color:#b8324f;font-weight:700;">UPI UTR Ref</td><td><strong>${esc(order.upi_utr)}</strong></td></tr>` : ""}
    </table>

    ${renderOrderItemsTable(order)}

    <div style="text-align:center;margin-top:24px;">
      <a href="${esc(`${site}/admin`)}" style="display:inline-block;background:#06210d;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:999px;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Open Admin Dashboard</a>
      <a href="${esc(waCustomerUrl)}" style="display:inline-block;background:#1faa59;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;margin-left:8px;">WhatsApp Customer</a>
    </div>
  `;

  const adminHtml = emailShell({
    storeName: cfg.storeName,
    preheader: `New Order ${order.order_number} from ${order.customer_name} (${money(order.total)})`,
    badge: "ADMIN NEW ORDER ALERT",
    headline: `New Order ${order.order_number}`,
    bodyHtml: adminBody,
    footerContact,
  });

  const adminResult = await dispatchEmail({
    to: cfg.adminNotifyEmail,
    subject: `🔔 New Order ${order.order_number} (${money(order.total)}) — ${order.customer_name}`,
    html: adminHtml,
    replyTo: order.customer_email,
    templateType: "order_alert_admin",
    relatedId: order.order_number,
  });

  return { customerResult, adminResult };
}

async function sendOrderStatusEmail(order, baseUrl) {
  const cfg = await resolveMailConfig();
  const site = (baseUrl || process.env.PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const trackUrl = `${site}/#/track?order=${encodeURIComponent(order.order_number)}&phone=${encodeURIComponent(order.customer_phone)}`;

  const statusCopy = {
    confirmed: {
      badge: "ORDER CONFIRMED",
      headline: "Your order is confirmed!",
      msg: "We have verified your order and our herbal kitchen is preparing your fresh bottle of Jayakesh Kerala Hair Oil.",
    },
    packed: {
      badge: "READY FOR DISPATCH",
      headline: "Hand-packed with care.",
      msg: "Your Jayakesh order has been carefully packed and handed over for courier pickup.",
    },
    shipped: {
      badge: "ORDER SHIPPED",
      headline: "Your hair oil is on its way!",
      msg: "Great news — your package has been dispatched and is heading to your doorstep.",
    },
    delivered: {
      badge: "ORDER DELIVERED",
      headline: "Delivered — enjoy your ritual!",
      msg: "Your Jayakesh Kerala Hair Oil has been delivered. We would love to hear how your hair feels after a few weeks — share your review anytime on our website!",
    },
    cancelled: {
      badge: "ORDER UPDATE",
      headline: "Your order has been cancelled.",
      msg: "As requested or updated by support, this order has been marked as cancelled. Reach out to us if you need any assistance.",
    },
  };

  const info = statusCopy[order.order_status] || {
    badge: "ORDER UPDATE",
    headline: `Order ${order.order_number} Updated`,
    msg: `Your order status is now: ${order.order_status.toUpperCase()}`,
  };

  const trackingBlock =
    order.courier_name || order.tracking_number
      ? `<div style="background:#eef8e8;border:1px solid #b9dfa3;border-radius:14px;padding:16px 18px;margin:18px 0;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.4px;color:#17642b;font-weight:700;">Shipment Tracking</div>
          ${order.courier_name ? `<div style="margin-top:4px;">Courier Partner: <strong>${esc(order.courier_name)}</strong></div>` : ""}
          ${order.tracking_number ? `<div>AWB / Tracking No: <strong>${esc(order.tracking_number)}</strong></div>` : ""}
          ${
            order.tracking_url
              ? `<div style="margin-top:10px;"><a href="${esc(order.tracking_url)}" style="display:inline-block;background:#17642b;color:#fff;text-decoration:none;padding:9px 18px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;">Track Courier Package</a></div>`
              : ""
          }
        </div>`
      : "";

  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:15px;">Hello <strong>${esc(order.customer_name)}</strong>,</p>
    <p style="margin:0 0 18px;color:#4f5e4a;">${esc(info.msg)}</p>
    <div style="background:#fbf8f0;border:1px solid #e5dec9;border-radius:14px;padding:14px 18px;margin-bottom:16px;">
      <div>Order: <strong>${esc(order.order_number)}</strong></div>
      <div>Current Status: <strong style="text-transform:uppercase;color:#0f4a1f;">${esc(order.order_status)}</strong></div>
      <div>Payment Status: <strong style="text-transform:uppercase;">${esc(order.payment_status.replace(/_/g, " "))}</strong></div>
    </div>
    ${trackingBlock}
    ${renderOrderItemsTable(order)}
    <div style="text-align:center;margin-top:22px;">
      <a href="${esc(trackUrl)}" style="display:inline-block;background:#0f4a1f;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:700;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;">View Full Order Timeline</a>
    </div>
  `;

  const html = emailShell({
    storeName: cfg.storeName,
    preheader: `${info.headline} (${order.order_number})`,
    badge: info.badge,
    headline: info.headline,
    bodyHtml,
    footerContact: `${esc(cfg.phone)} · ${esc(cfg.supportEmail)}`,
  });

  return dispatchEmail({
    to: order.customer_email,
    subject: `${info.headline} (#${order.order_number}) | ${cfg.storeName}`,
    html,
    replyTo: cfg.supportEmail,
    templateType: `order_status_${order.order_status}`,
    relatedId: order.order_number,
  });
}

async function sendInquiryEmails(inquiry, baseUrl) {
  const cfg = await resolveMailConfig();
  const site = (baseUrl || process.env.PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const footerContact = `${esc(cfg.phone)} · ${esc(cfg.supportEmail)}`;

  const custHtml = emailShell({
    storeName: cfg.storeName,
    preheader: `We received your message (${inquiry.ticket_number})`,
    badge: "INQUIRY RECEIVED",
    headline: "We've received your message.",
    bodyHtml: `
      <p>Hello <strong>${esc(inquiry.name)}</strong>,</p>
      <p style="color:#4f5e4a;">Thank you for writing to <strong>${esc(cfg.storeName)}</strong>. Our team has received your inquiry (Reference: <strong>${esc(inquiry.ticket_number)}</strong>) and will get back to you shortly.</p>
      <div style="background:#fbf8f0;border:1px solid #e5dec9;border-radius:14px;padding:14px 18px;margin:18px 0;">
        <div style="font-size:12px;color:#5d6b58;">Subject: <strong>${esc(inquiry.subject)}</strong></div>
        <p style="margin:8px 0 0;color:#14261a;">${esc(inquiry.message)}</p>
      </div>
    `,
    footerContact,
  });

  const customerResult = await dispatchEmail({
    to: inquiry.email,
    subject: `We received your message [${inquiry.ticket_number}] | ${cfg.storeName}`,
    html: custHtml,
    replyTo: cfg.supportEmail,
    templateType: "inquiry_customer_ack",
    relatedId: inquiry.ticket_number,
  });

  const adminHtml = emailShell({
    storeName: cfg.storeName,
    preheader: `New inquiry from ${inquiry.name}: ${inquiry.subject}`,
    badge: "NEW CUSTOMER INQUIRY",
    headline: inquiry.subject,
    bodyHtml: `
      <p><strong>Ticket:</strong> ${esc(inquiry.ticket_number)}</p>
      <p><strong>From:</strong> ${esc(inquiry.name)} (<a href="mailto:${esc(inquiry.email)}">${esc(inquiry.email)}</a> · <a href="tel:${esc(inquiry.phone)}">${esc(inquiry.phone)}</a>)</p>
      <div style="background:#fbf8f0;border:1px solid #e5dec9;border-radius:14px;padding:16px;margin:16px 0;white-space:pre-wrap;">${esc(inquiry.message)}</div>
      <div style="text-align:center;margin-top:20px;">
        <a href="${esc(`${site}/admin`)}" style="display:inline-block;background:#06210d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:12px;text-transform:uppercase;">View in Admin Dashboard</a>
      </div>
    `,
    footerContact,
  });

  const adminResult = await dispatchEmail({
    to: cfg.adminNotifyEmail,
    subject: `📩 Inquiry [${inquiry.ticket_number}]: ${inquiry.subject} — ${inquiry.name}`,
    html: adminHtml,
    replyTo: inquiry.email,
    templateType: "inquiry_admin_alert",
    relatedId: inquiry.ticket_number,
  });

  return { customerResult, adminResult };
}

async function sendTestEmail(targetEmail, baseUrl) {
  const cfg = await resolveMailConfig();
  const html = emailShell({
    storeName: cfg.storeName,
    preheader: "Your Jayakesh email notification system is working!",
    badge: "SYSTEM DIAGNOSTIC",
    headline: "Email Notifications Active!",
    bodyHtml: `
      <p>Congratulations! Your <strong>${esc(cfg.storeName)}</strong> backend email engine is configured and delivering properly.</p>
      <div style="background:#eef8e8;border:1px solid #b9dfa3;border-radius:14px;padding:14px 18px;margin:16px 0;">
        <div>Active Transport: <strong>${esc(cfg.activeProvider.toUpperCase())}</strong></div>
        <div>Sender From: <strong>${esc(cfg.from)}</strong></div>
        <div>Timestamp: <strong>${new Date().toLocaleString("en-IN")}</strong></div>
      </div>
      <p style="color:#5d6b58;font-size:13px;">Customers will automatically receive branded Order Confirmation & Shipment Tracking emails, and you will receive instant New Order & Inquiry alerts.</p>
    `,
    footerContact: `${esc(cfg.phone)} · ${esc(cfg.supportEmail)}`,
  });

  return dispatchEmail({
    to: targetEmail || cfg.adminNotifyEmail,
    subject: `✅ Test Email Successful | ${cfg.storeName}`,
    html,
    templateType: "diagnostic_test",
    relatedId: "TEST",
  });
}

module.exports = {
  resolveMailConfig,
  dispatchEmail,
  sendOrderPlacedEmails,
  sendOrderStatusEmail,
  sendInquiryEmails,
  sendTestEmail,
};
