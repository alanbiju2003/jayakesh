/* =====================================================================
   JAYAKESH STORE CONFIGURATION (Pure Frontend — Edit & Commit Anytime)
   =====================================================================
   Change prices, shipping, UPI ID, coupons, contact details, or reviews
   below. Save (or commit on GitHub) and your live site updates automatically.
   ===================================================================== */

window.JAYAKESH_CONFIG = {
  storeName: "Jayakesh Kerala Hair Oil",
  tagline: "Legacy in every drop",
  domain: "https://jayakesh.in",

  // Top announcement bar (leave "" to hide)
  announcementBar: "Handmade Kerala Herbal Hair Oil · Free Pan-India Delivery on Orders ₹499+",

  // Contact & WhatsApp (digits only with country code for whatsapp)
  whatsapp: "917011083799",
  phone: "+91 70110 83799",
  supportEmail: "itmealanbiju@gmail.com",
  address: "Kerala, India",
  instagram: "", // e.g. "https://www.instagram.com/jayakesh" (leave "" to hide)
  gstNumber: "", // Optional GSTIN to show on printable invoices

  // Instant Order & Contact Email Notifications (100% Free Serverless)
  // Every new website order, contact message, or customer review submission
  // sends an instant formatted email to `ownerNotifyEmail` via FormSubmit.co
  // (and CC's the customer's email automatically once activated).
  // NOTE: On the VERY FIRST test order/message from https://jayakesh.in, check
  // itmealanbiju@gmail.com (and Spam) and click FormSubmit's 1-time "Activate" button.
  ownerNotifyEmail: "itmealanbiju@gmail.com",
  ccCustomerOnOrder: true,
  web3formsKey: "", // Optional: paste a free key from https://web3forms.com if preferred over FormSubmit

  // Checkout & Payment Settings
  codEnabled: true,
  upiEnabled: true,
  upiId: "", // e.g. "7011083799@upi" or "yourname@okaxis" — shows live scannable UPI QR at checkout when set!
  upiPayeeName: "Jayakesh Kerala Hair Oil",
  autoOpenWhatsAppOnOrder: false, // Set true if you also want WhatsApp to pop open automatically on order submit

  // Shipping & Charges (in INR)
  shippingFee: 49,       // Standard delivery charge below freeShippingMin
  freeShippingMin: 499,  // Orders >= ₹499 get FREE shipping (2+ bottles ship free!)
  codFee: 0,             // Extra COD handling charge (0 = Free COD)

  // Optional Brand Video (place jayakesh-video.mp4 in the root folder or set a URL)
  videoFile: "jayakesh-video.mp4",
  videoSrc: "",

  // Products Catalog
  // Tip: Set `price: null` on a product if you ever want "Price on request" mode.
  products: [
    {
      id: "jk-200",
      name: "Jayakesh Kerala Hair Oil",
      size: "200 ml",
      price: 399,        // Selling price in INR (edit anytime, e.g. 299, 349, 399)
      comparePrice: 499, // MRP / strike-through price (set null or 0 to hide)
      inStock: true,
      image: "assets/bottle.png",
      desc: "Jayakesh Kerala Hair Oil is a handmade herbal hair oil, made in the Kerala tradition with pure herbal ingredients and no harmful chemicals.",
      benefits: [
        "Helps reduce hair fall",
        "Promotes healthy hair growth",
        "Nourishes the scalp",
        "Strengthens hair"
      ],
      highlights: [
        "Handmade",
        "No harmful chemicals",
        "Pure herbal ingredients"
      ]
    }
  ],

  // Discount Coupons (Code in UPPERCASE)
  coupons: {
    WELCOME10: {
      type: "percent",   // "percent" or "flat"
      value: 10,         // 10% off
      minOrder: 299,
      maxDiscount: 200,
      label: "10% Welcome Discount"
    },
    KERALA50: {
      type: "flat",
      value: 50,         // Flat ₹50 off on 2+ bottles
      minOrder: 699,
      maxDiscount: 50,
      label: "Flat ₹50 Off"
    }
  },

  // Co-Founders (About Page)
  founders: [
    {
      name: "Jaya",
      initials: "J",
      role: "Co-Founder",
      photo: "founders/jaya.jpg",
      intro: "Jaya is a co-founder of Jayakesh, the Kerala hair oil that is handmade with pure herbal ingredients and no harmful chemicals.",
      story: [],
      quote: ""
    },
    {
      name: "Ashmit Thomas",
      initials: "AT",
      role: "Co-Founder",
      photo: "founders/ashmit.jpg",
      intro: "Ashmit Thomas is the other co-founder of Jayakesh, building the brand together with Jaya.",
      story: [],
      quote: ""
    }
  ],

  // Authorised Customer Reviews
  // Add genuine customer reviews received via email here:
  // { name: "Anjali M.", city: "Kochi", rating: 5, text: "Amazing traditional scent and texture!", verified: true }
  reviews: []
};
