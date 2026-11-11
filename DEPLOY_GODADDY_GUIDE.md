# Jayakesh Kerala Hair Oil — Free 24/7 Cloud Backend + GoDaddy Domain Setup Guide

This full-stack e-commerce store runs **24/7 for ₹0/month** with **zero server sleep**, **free automatic HTTPS/SSL**, **permanent cloud database**, **automated Customer & Admin emails**, and **your custom GoDaddy domain**.

---

## Quick Test Locally (Right Now)

```powershell
npm start
```

- **Storefront:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin
  - **Default Email:** `admin@jayakesh.com`
  - **Default Password:** `Jayakesh@Admin2026` *(Change this immediately in Admin → Settings or Vercel Environment Variables!)*

---

## Step 1 — Deploy Backend + Frontend 24/7 Free on Vercel

### Method A: Directly from Terminal (Fastest — No GitHub needed)
Run in `c:\Users\Acer\Desktop\JAYAKESH`:
```powershell
npx vercel --prod
```
Follow the browser login prompt (Sign in with Google/GitHub — Free Hobby plan) and press **Enter** on all defaults.

### Method B: Via GitHub (Auto-deploys whenever you edit code)
1. Create a free private repository on [github.com/new](https://github.com/new).
2. Push this folder:
   ```powershell
   git add .
   git commit -m "Launch Jayakesh full-stack store"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/jayakesh.git
   git push -u origin main
   ```
3. Go to [vercel.com/new](https://vercel.com/new) → Import your `jayakesh` repo → Click **Deploy**.

---

## Step 2 — Connect Permanent 24/7 Free Cloud Database (2 Clicks)

1. Open your project in the **Vercel Dashboard** → Click the **Storage** tab.
2. Click **Create Database** → Choose **Neon (Serverless Postgres)** → Select **Free Plan ($0/mo)** → Click **Create & Connect to Project**.
3. Vercel automatically injects `DATABASE_URL` / `POSTGRES_URL` into your backend.
4. Go to **Deployments** → Click **Redeploy** on the latest deployment so your backend switches to permanent 24/7 Postgres storage (tables and products auto-create automatically on first request!).

---

## Step 3 — Connect Your GoDaddy Domain + Free SSL

1. In **Vercel Dashboard** → **Settings** → **Domains** → Type your GoDaddy domain (e.g. `jayakesh.com`) and click **Add**.
2. Log in to **[GoDaddy Domain Portfolio](https://dcc.godaddy.com/control/portfolio)** → Click your domain → **DNS** → **DNS Records**.
3. Update / Add these two DNS records:

| Type | Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | 600 seconds (or Default) |
| **CNAME** | `www` | `cname.vercel-dns.com` | 1 Hour (or Default) |

*(Note: If GoDaddy already has an existing parked `A` record for `@`, edit or delete the parked one so only `76.76.21.21` remains.)*

4. Within 5–15 minutes, Vercel automatically provisions your free **HTTPS SSL Certificate** and your site + API + `/admin` portal are live 24/7 on `https://yourdomain.com`!
5. In Vercel → **Settings** → **Environment Variables**, set:
   - `PUBLIC_SITE_URL` = `https://yourdomain.com`
   - `ADMIN_EMAIL` = `your@email.com`
   - `ADMIN_PASSWORD` = `YourStrongPasswordHere`
   - `ADMIN_SECRET` = *(any long random phrase)*

---

## Step 4 — Turn On Automated Order & Tracking Emails (₹0 Free)

You can configure emails **directly inside `https://yourdomain.com/admin` → Settings** (no code edits needed!):

### Option A: Instant Free Gmail Setup (500 free emails/day — Takes 2 Minutes)
1. Enable **2-Step Verification** on your Google Account.
2. Visit **[Google App Passwords](https://myaccount.google.com/apppasswords)**.
3. Type `"Jayakesh Store"` → Click **Create** → Copy the **16-character password**.
4. Open `/admin` → **Store & Mail Setup**:
   - **Owner Email to Receive New Order Alerts:** `yourname@gmail.com`
   - **Gmail / SMTP Username:** `yourname@gmail.com`
   - **Gmail 16-Char App Password:** *(paste the 16-char code)*
5. Click **Save**, then go to **Emails & Logs** → **Send Live Test Email**!

### Option B: Custom GoDaddy Domain Email (`orders@yourdomain.com` — 3,000 free emails/month)
1. Create a free account at **[Resend.com](https://resend.com)**.
2. Go to **Domains → Add Domain** → Enter your GoDaddy domain (`yourdomain.com`).
3. Click **"Sign in to GoDaddy"** (Resend supports automatic 1-click GoDaddy DNS verification!) or copy the `TXT` & `MX` records into GoDaddy DNS.
4. Go to **API Keys → Create API Key** → Copy the `re_...` key.
5. Open `/admin` → **Store & Mail Setup**:
   - **Sender "From" Header:** `Jayakesh Kerala Hair Oil <orders@yourdomain.com>`
   - **Resend API Key:** `re_...`
   - **Owner Email to Receive New Order Alerts:** *(your personal email where you read alerts)*
6. Click **Save** and send a test email from **Emails & Logs**!

---

## Step 5 — Set Your Bottle Price & UPI ID

1. Log in to `/admin`.
2. Go to **Products & Price** → Click **Edit** on *Jayakesh Kerala Hair Oil (200 ml)* → Set your exact selling price, MRP, and stock.
3. Go to **Store & Mail Setup** → Enter your **UPI ID** (e.g. `yourname@okicici` or `917011083799@upi`) → Click **Save**. Customers choosing UPI at checkout will now see a live scannable UPI QR code for the exact order total!
