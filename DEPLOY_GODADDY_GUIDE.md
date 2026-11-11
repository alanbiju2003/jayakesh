# Jayakesh Kerala Hair Oil (`jayakesh.in`) — Direct GoDaddy Deployment Guide

Everything (Storefront, Full PHP Backend API, Automatic SQLite/MySQL Database, Order Tracking, Invoices, UPI QR, Customer/Admin Order Emails, and `/admin` Portal) is packaged into a **single GoDaddy-native upload file**:

- **`c:\Users\Acer\Desktop\JAYAKESH\jayakesh-godaddy-cpanel.zip`** *(2.13 MB — Zero Vercel, Zero external servers!)*

---

## Important Note About GoDaddy Domains vs. GoDaddy Hosting

In your GoDaddy DNS table, row 1 currently shows:
`a | @ | Parked`

Why it says **`Parked`**: Buying the domain `jayakesh.in` on GoDaddy only registers the domain name — GoDaddy does **not** include free web server hosting automatically with a domain purchase.

You have **two ways** to host this `jayakesh-godaddy-cpanel.zip` package (neither uses Vercel!):

---

## Option 1 — Deploy 100% Inside GoDaddy Only (GoDaddy Web Hosting / cPanel)

*(Use this if you have or activate GoDaddy Linux Web Hosting / cPanel on your GoDaddy account)*

1. Log in to **[GoDaddy My Products](https://account.godaddy.com/products)**.
2. Under **Web Hosting**, click **Manage** next to your hosting plan → Click **cPanel Admin**. *(When you assign `jayakesh.in` as the hosting domain in GoDaddy, GoDaddy automatically replaces `Parked` with your GoDaddy server IP and issues SSL!)*
3. In cPanel, open **File Manager** → Click **`public_html`** on the left.
4. Click **Upload** (top bar) → Select **`c:\Users\Acer\Desktop\JAYAKESH\jayakesh-godaddy-cpanel.zip`**.
5. Go back to `public_html`, right-click **`jayakesh-godaddy-cpanel.zip`** → Click **Extract** → Extract to `/public_html` → Delete the `.zip` file afterward.
6. *(Optional — Free `@jayakesh.in` Sending)*: In GoDaddy cPanel → **Email Accounts** → Create `orders@jayakesh.in`. GoDaddy's native PHP `mail()` will immediately send Order Confirmation & Admin Alert emails from `orders@jayakesh.in` with zero external keys!
7. Open **`https://jayakesh.in`** and **`https://jayakesh.in/admin`**:
   - **Login Email:** `admin@jayakesh.in`
   - **Default Password:** `Jayakesh@Admin2026` *(change immediately in Settings!)*

---

## Option 2 — If You Want ₹0/Month FREE Hosting (No GoDaddy Hosting Fee & No Vercel)

Because `jayakesh-godaddy-cpanel.zip` uses standard **Apache `.htaccess` + PHP + SQLite/MySQL**, you can upload the **exact same `jayakesh-godaddy-cpanel.zip`** for **₹0/month free** on **InfinityFree** or **Cloudflare**:

1. Create a free account at **[InfinityFree.com](https://www.infinityfree.com)** (Free PHP 8 + MySQL cPanel hosting, ₹0/month, commercial sites allowed).
2. Click **Create Account** → **Custom Domain** → Enter **`jayakesh.in`**.
3. In GoDaddy → Domain **`jayakesh.in`** → **DNS → Nameservers → Change**, enter the 2 InfinityFree nameservers (`ns1.infinityfree.com` & `ns2.infinityfree.com`), then activate **Free SSL Certificate** inside InfinityFree.
4. Open InfinityFree **File Manager** → open **`htdocs`** → Upload & Extract **`jayakesh-godaddy-cpanel.zip`**.
5. Open **`https://jayakesh.in/admin`** → **Store & Mail Setup** → Enter `itmealanbiju@gmail.com` + your 16-character [Google App Password](https://myaccount.google.com/apppasswords) (or free [Resend.com](https://resend.com) API key) for automated emails!
