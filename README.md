# Jayakesh Kerala Hair Oil (`jayakesh.in`)

**100% Pure Frontend E-Commerce Storefront** — Zero backend servers, zero monthly hosting fees, running 24/7 on **GitHub Pages** with your custom GoDaddy domain **`jayakesh.in`**.

## Key Features
- **Fast Static Assets (`assets/*`)**: Extracted crisp PNG/JPG images instead of heavy inline base64 blobs.
- **Single-File Store Config (`config.js`)**: Edit bottle price, MRP, stock status, shipping rules, promo coupons (`WELCOME10`, `KERALA50`), UPI ID, WhatsApp number, and verified customer reviews directly in `config.js`.
- **Full Cart + Coupons + Checkout**: Supports **Cash on Delivery (COD)** and **Dynamic Offline UPI QR (`qr-gen.js`) + UTR Reference**.
- **Instant Order & Inquiry Emails (Serverless)**: Sends formatted order notifications (with clickable Printable Invoice & WhatsApp Customer links) straight to `itmealanbiju@gmail.com` via `FormSubmit.co` (plus CC to customer).
- **Client-Side Printable / PDF Invoices (`invoice.html`)**: Self-contained URL-encoded & `localStorage` invoices that open and print cleanly on any phone or laptop without a database.
- **My Orders (`#/orders`)**: Customers can view past orders, download invoices, or check live delivery status on WhatsApp in one tap.

## How to Update Prices, UPI ID, or Reviews
Open [`config.js`](./config.js) on GitHub → click the **Pencil (Edit)** icon → change `price`, `upiId`, `coupons`, or `reviews` → click **Commit changes**. Your live website updates automatically in ~30 seconds!

## Go Live on `jayakesh.in` (₹0 Forever)
Follow the step-by-step instructions in [`DEPLOY_GODADDY_GUIDE.md`](./DEPLOY_GODADDY_GUIDE.md).
