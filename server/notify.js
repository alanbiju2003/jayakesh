const db = require("./db");

async function pushExternalAlert(text, meta = {}) {
  try {
    const s = await db.getSettings();
    const tgToken = (s.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN || "").trim();
    const tgChat = (s.telegram_chat_id || process.env.TELEGRAM_CHAT_ID || "").trim();
    const webhookUrl = (s.notify_webhook_url || process.env.NOTIFY_WEBHOOK_URL || "").trim();

    if (tgToken && tgChat) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: tgChat,
          text,
          parse_mode: "HTML",
        }),
      }).catch(() => {});
    }

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text.replace(/<[^>]+>/g, ""),
          text: text.replace(/<[^>]+>/g, ""),
          meta,
        }),
      }).catch(() => {});
    }
  } catch {
    // Non-blocking notification push
  }
}

async function notifyNewOrder(order) {
  const notif = await db.createNotification({
    type: "new_order",
    title: `New Order ${order.order_number} (₹${Number(order.total).toLocaleString("en-IN")})`,
    message: `${order.customer_name} from ${order.city}, ${order.state} placed a ${order.payment_method.toUpperCase()} order.`,
    link: `#orders:${order.order_number}`,
    meta: {
      order_number: order.order_number,
      total: order.total,
      payment_method: order.payment_method,
    },
  });

  await pushExternalAlert(
    `🛒 <b>New Jayakesh Order ${order.order_number}</b>\nAmount: ₹${order.total} (${order.payment_method.toUpperCase()})\nCustomer: ${order.customer_name} (${order.customer_phone})\nCity: ${order.city}, ${order.state} - ${order.pincode}`,
    { event: "new_order", order_number: order.order_number }
  );

  return notif;
}

async function notifyUtrSubmitted(order) {
  const notif = await db.createNotification({
    type: "payment_utr",
    title: `UPI Reference Submitted — ${order.order_number}`,
    message: `${order.customer_name} submitted UTR ${order.upi_utr} for ₹${order.total}. Verify in bank/UPI app.`,
    link: `#orders:${order.order_number}`,
    meta: { order_number: order.order_number, upi_utr: order.upi_utr },
  });

  await pushExternalAlert(
    `💳 <b>UPI UTR Submitted (${order.order_number})</b>\nUTR: <code>${order.upi_utr}</code>\nAmount: ₹${order.total}`,
    { event: "payment_utr", order_number: order.order_number }
  );

  return notif;
}

async function notifyNewInquiry(inquiry) {
  const notif = await db.createNotification({
    type: "inquiry",
    title: `New Inquiry: ${inquiry.subject}`,
    message: `${inquiry.name} (${inquiry.phone}) sent message [${inquiry.ticket_number}].`,
    link: `#inquiries:${inquiry.id}`,
    meta: { ticket_number: inquiry.ticket_number },
  });

  await pushExternalAlert(
    `📩 <b>New Customer Inquiry [${inquiry.ticket_number}]</b>\nFrom: ${inquiry.name} (${inquiry.phone})\nSubject: ${inquiry.subject}`,
    { event: "inquiry", ticket: inquiry.ticket_number }
  );

  return notif;
}

async function notifyNewReview(review) {
  return db.createNotification({
    type: "review",
    title: `New ${review.rating}★ Review from ${review.customer_name}`,
    message: `"${String(review.comment || "").slice(0, 90)}" (${review.status})`,
    link: `#reviews`,
    meta: { id: review.id, rating: review.rating },
  });
}

module.exports = {
  notifyNewOrder,
  notifyUtrSubmitted,
  notifyNewInquiry,
  notifyNewReview,
};

