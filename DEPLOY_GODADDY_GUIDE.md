# Deploy `jayakesh.in` Live 24/7 for ₹0 (Pure Frontend: GitHub Pages + GoDaddy DNS)

No backend server, no Vercel, and no paid GoDaddy web hosting needed. Follow these 3 quick steps once:

---

## Step 1: Turn On Free GitHub Pages (30 Seconds)
1. Open your GitHub repository: **https://github.com/alanbiju2003/jayakesh/settings/pages**
2. Under **Build and deployment → Source**, keep **Deploy from a branch**.
3. Under **Branch**, select **`main`** and folder **`/ (root)`**, then click **Save**.
4. *(Note: The `CNAME` file in this repo already sets your custom domain to `jayakesh.in` automatically!)*

---

## Step 2: Update GoDaddy DNS Records for `jayakesh.in` (2 Minutes)
Open **GoDaddy → My Products → `jayakesh.in` → DNS → DNS Records**:

1. **Delete the Parked `A` record**:
   - Find the row `a | @ | Parked | 600 seconds` → click **Delete** (if GoDaddy doesn't show Delete on `Parked`, go to the **Forwarding** tab, turn off forwarding/parking, or just add the 4 `A` records below and GoDaddy will replace `Parked`).

2. **Add these 4 `A` records** (Click **Add New Record** 4 times):

   | Type | Name | Value / Data | TTL |
   | :--- | :--- | :--- | :--- |
   | **A** | `@` | `185.199.108.153` | 1 Hour (or 600s) |
   | **A** | `@` | `185.199.109.153` | 1 Hour (or 600s) |
   | **A** | `@` | `185.199.110.153` | 1 Hour (or 600s) |
   | **A** | `@` | `185.199.111.153` | 1 Hour (or 600s) |

3. **Edit the `www` CNAME record**:
   - Find `cname | www | jayakesh.in.` → click **Edit** → change **Value / Data** to:
     ```
     alanbiju2003.github.io
     ```
   - Click **Save**.

4. **Leave all other rows untouched** (`ns37`/`ns38.domaincontrol.com.`, `soa`, `_domainconnect`, `_dmarc`).

5. **Enable Free SSL (`https://jayakesh.in`)**:
   - Wait 5–15 minutes for GoDaddy DNS to propagate, then refresh **https://github.com/alanbiju2003/jayakesh/settings/pages** and tick ✅ **Enforce HTTPS**.

---

## Step 3: Activate Instant Order Emails (One-Time Click)
1. Once **`https://jayakesh.in`** opens, place **1 test order** on the website.
2. Open **`itmealanbiju@gmail.com`** (check **Inbox** and **Spam/Promotions**) for an email from **FormSubmit**.
3. Click the **Activate Form** button inside that email once.
4. Done! Every future website order, contact message, and customer review will automatically email **`itmealanbiju@gmail.com`** (with Printable Invoice & WhatsApp links) and CC the customer!
