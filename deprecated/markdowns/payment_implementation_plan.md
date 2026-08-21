# Payment Integration — Implementation Plan

> **Related Document:** [payment_feasibility_analysis.md](./payment_feasibility_analysis.md)  
> **Created:** 2026-03-20  
> **Status:** Proposed  
> **Branch:** `feature/payment-integration` (all work happens here, `main` stays untouched)

---

## ⚙️ Core Concept: Admin Payment Mode Toggle

The entire payment system is controlled by a **single switch in the Admin Panel**. This decides how the customer-facing checkout behaves.

### How the Toggle Works

```
┌──────────────────────────────────────────────────────────────┐
│  Admin Panel → Settings Tab                                  │
│                                                              │
│  Payment Mode                                                │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  📱 WhatsApp     │  │  💳 Direct Pay   │                  │
│  │  (Current)       │  │  (Razorpay)      │                  │
│  └──────────────────┘  └──────────────────┘                  │
│        ● ON                 ○ OFF           ← radio toggle   │
│                                                              │
│  When Direct Pay is ON, also configure:                      │
│  ┌─────────────────────────────────────────┐                 │
│  │ ☑ Send order confirmation email         │                 │
│  │ ☑ Send order confirmation SMS           │                 │
│  │ ☐ Also keep WhatsApp as fallback option │                 │
│  └─────────────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

### Database: New Column in `site_settings`

```sql
-- Add payment mode toggle to site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS checkout_mode TEXT DEFAULT 'whatsapp',
    -- 'whatsapp' = current behavior (cart → WhatsApp message)
    -- 'direct'   = Razorpay payment gateway + email/SMS confirmations
ADD COLUMN IF NOT EXISTS checkout_whatsapp_fallback BOOLEAN DEFAULT true,
    -- When direct mode is ON, also show "Order via WhatsApp" as secondary option
ADD COLUMN IF NOT EXISTS checkout_send_email BOOLEAN DEFAULT true,
    -- Send order confirmation email on successful payment
ADD COLUMN IF NOT EXISTS checkout_send_sms BOOLEAN DEFAULT true;
    -- Send order confirmation SMS on successful payment
```

### Frontend Behavior Based on Toggle

| `checkout_mode` | Cart Footer Shows | What Happens on Click |
|---|---|---|
| `whatsapp` | **"Order from WhatsApp"** (current green button) | Opens WhatsApp with pre-formatted order message — exactly as it works today |
| `direct` | **"💳 Pay Now"** (primary) + optional **"💬 WhatsApp"** (secondary, if fallback ON) | Opens checkout form → Razorpay payment modal → email/SMS confirmation |

The frontend reads `checkout_mode` from `site_settings` (already fetched on page load via `window.currentSiteSettings`) and conditionally renders the cart footer:

```javascript
// In cart footer rendering logic
const mode = window.currentSiteSettings?.checkout_mode || 'whatsapp';

if (mode === 'direct') {
    // Show "Pay Now" as primary button
    // Show "Order via WhatsApp" only if checkout_whatsapp_fallback is true
} else {
    // Show only "Order from WhatsApp" — current behavior, no changes
}
```

> **Key point:** When toggle is set to `whatsapp`, the website behaves exactly as it does today. Zero risk.

---

## Phase 1: Database & Backend (Week 1–2)

### 1.1 Create `orders` Table in Supabase

```sql
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- Customer Info (guest checkout, no account required)
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,

    -- Delivery
    delivery_address JSONB,          -- { line1, line2, city, pincode, landmark }
    delivery_notes TEXT,

    -- Order Content (snapshot of cart at time of order)
    items JSONB NOT NULL,            -- [{ product_id, name, variant, qty, unit_price }]
    item_total NUMERIC NOT NULL,     -- sum of item prices
    shipping_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,   -- item_total + shipping

    -- Payment
    payment_method TEXT DEFAULT 'online',  -- 'online' | 'cod' | 'whatsapp'
    payment_status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,

    -- Fulfillment
    fulfillment_status TEXT DEFAULT 'received', -- 'received' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
    tracking_info TEXT,

    -- Notifications sent
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,

    -- Metadata
    source TEXT DEFAULT 'website'     -- 'website' | 'whatsapp' | 'admin'
);

-- RLS Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow guest order creation"
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read all orders"
ON public.orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Customer read own order"
ON public.orders FOR SELECT USING (true);  -- Tighten later with customer auth

CREATE POLICY "Admin update orders"
ON public.orders FOR UPDATE TO authenticated USING (true);
```

### 1.2 Create Supabase Edge Function: `create-order`

**Purpose:** Securely create a Razorpay order with server-validated prices.

**Logic:**
1. Receive `{ items: [{ product_id, variant_index, qty }], customer: { name, phone, email, address } }`
2. Fetch each product's price from `products` table (never trust client prices)
3. Calculate `item_total` and `total_amount` server-side
4. Call Razorpay `POST /v1/orders` with the validated amount
5. Insert row into `orders` table with status `pending`
6. Return `{ razorpay_order_id, order_id, amount }` to frontend

**Environment Variables Required:**
- `RAZORPAY_KEY_ID` — Public key (also used on frontend)
- `RAZORPAY_KEY_SECRET` — Secret key (server-only, NEVER exposed)

### 1.3 Create Supabase Edge Function: `verify-payment`

**Purpose:** Verify Razorpay payment signature, then trigger email + SMS.

**Logic:**
1. Receive `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
2. Validate signature using HMAC SHA256
3. If valid → Update `orders.payment_status` to `paid`
4. If invalid → Return error, mark as `failed`
5. **Read `checkout_send_email` and `checkout_send_sms` from `site_settings`**
6. If email enabled → call `send-order-email` function
7. If SMS enabled → call `send-order-sms` function

---

## Phase 2: Frontend Checkout (Week 2–3)

### 2.1 Add Checkout Form

A modal/drawer (consistent with existing cart drawer pattern) with fields:

| Field | Required | Notes |
|---|---|---|
| Full Name | ✅ | |
| Phone Number | ✅ | Pre-validate 10-digit Indian mobile |
| Email | Conditional | **Required when email notifications are ON** (read from settings) |
| Address Line 1 | ✅ | Street / House |
| Address Line 2 | ❌ | Landmark |
| City | ✅ | |
| Pincode | ✅ | 6-digit validation |
| Delivery Notes | ❌ | Special instructions |

### 2.2 Integrate Razorpay Checkout.js

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

```javascript
// 1. Call Edge Function to create order
const res = await fetch('SUPABASE_EDGE_FN_URL/create-order', {
    method: 'POST',
    body: JSON.stringify({ items: cart, customer: formData })
});
const { razorpay_order_id, order_id, amount } = await res.json();

// 2. Open Razorpay modal
const rzp = new Razorpay({
    key: 'RAZORPAY_KEY_ID',
    amount, currency: 'INR',
    name: 'Telugu Delicacies',
    order_id: razorpay_order_id,
    handler: async (response) => {
        // 3. Verify payment → triggers email/SMS on server
        await fetch('SUPABASE_EDGE_FN_URL/verify-payment', {
            method: 'POST',
            body: JSON.stringify(response)
        });
        showOrderConfirmation(order_id);
        clearMainCart();
    },
    prefill: { name: formData.name, email: formData.email, contact: formData.phone },
    theme: { color: '#0077B6' }
});
rzp.open();
```

### 2.3 Toggle-Aware Cart Footer

The cart footer renders differently based on admin toggle:

```
WHEN checkout_mode = 'whatsapp' (default):
┌─────────────────────────────────┐
│  💬  Order from WhatsApp        │  ← Current behavior, unchanged
└─────────────────────────────────┘

WHEN checkout_mode = 'direct':
┌─────────────────────────────────┐
│  💳  Pay Now (UPI / Cards)      │  ← Primary button
├─────────────────────────────────┤
│  💬  Order via WhatsApp         │  ← Only if checkout_whatsapp_fallback = true
└─────────────────────────────────┘
```

---

## Phase 3: Admin Orders Panel (Week 3–4)

### 3.1 Payment Mode Toggle in Settings

Add to the existing Settings tab in `admin.html`:

- **Radio toggle:** WhatsApp / Direct Pay
- **Checkboxes** (visible only when Direct Pay is selected):
  - ☑ Send order confirmation email
  - ☑ Send order confirmation SMS  
  - ☐ Keep WhatsApp as fallback option
- On save → updates `site_settings` row in Supabase

### 3.2 Add Orders Tab to `admin.html`

**Features:**
- **Orders Table:** Date, Customer, Items, Total, Payment Status, Fulfillment Status
- **Filters:** By payment status, fulfillment status, date range
- **Actions per order:**
  - Update fulfillment status (received → preparing → shipped → delivered)
  - View full order details (modal)
  - Resend email / SMS confirmation
  - Send WhatsApp message to customer
  - Process refund (Razorpay Refund API)
- **Dashboard Stats:** Today's orders, revenue, pending payments

### 3.3 Create Edge Function: `admin-update-order`

Authenticated endpoint for admin to update order status, process refunds, resend notifications.

---

## Phase 4: Email & SMS Notifications (Week 3–4, parallel with Phase 3)

### 4.1 Email Notifications

**Recommended Service:** [Resend](https://resend.com) — modern email API, generous free tier, easy Supabase integration.

| Trigger | Email Sent To | Content |
|---|---|---|
| Payment successful | Customer email | Order confirmation with items, total, estimated delivery |
| Order shipped | Customer email | Shipping update with tracking info |
| Refund processed | Customer email | Refund confirmation with amount |
| New order received | Admin email | Alert with order summary |

**Supabase Edge Function: `send-order-email`**

```typescript
// Called by verify-payment after successful payment
import { Resend } from 'resend';
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

await resend.emails.send({
    from: 'orders@telugudelicacies.com',   // Requires domain verification
    to: customerEmail,
    subject: `Order Confirmed #${orderId} — Telugu Delicacies`,
    html: generateOrderEmailHTML(order)     // Branded HTML template
});
```

**Email Template Content:**
- Telugu Delicacies logo + brand colors
- Order ID and date
- Itemized list with quantities and prices
- Total amount paid
- Delivery address
- Estimated delivery time
- Contact info for support
- "Track your order" link (future enhancement)

**Cost:**
| Service | Free Tier | Paid Plan |
|---|---|---|
| **Resend** | 3,000 emails/month, 100/day | $20/mo for 50K emails |
| **SendGrid** | 100 emails/day | Pay as you go |
| **AWS SES** | None (but ~₹0.08/email) | Very cheap at scale |

> Resend's free tier (3,000/month) is more than enough for current volumes.

### 4.2 SMS Notifications

**Recommended Service:** [MSG91](https://msg91.com) — India-focused, DLT-compliant, affordable.

| Trigger | SMS Sent To | Content |
|---|---|---|
| Payment successful | Customer phone | Short confirmation: "Order #XYZ confirmed! ₹500 paid. Delivery in 2-3 days. Telugu Delicacies" |
| Order shipped | Customer phone | "Your order #XYZ has been shipped! Track: [link]. Telugu Delicacies" |
| New order received | Admin phone | "New order #XYZ received — ₹500. Check admin panel." |

**Supabase Edge Function: `send-order-sms`**

```typescript
// Called by verify-payment after successful payment
const response = await fetch('https://control.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
        'authkey': Deno.env.get('MSG91_AUTH_KEY'),
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        template_id: Deno.env.get('MSG91_ORDER_TEMPLATE_ID'),
        short_url: '0',
        recipients: [{
            mobiles: `91${customerPhone}`,
            order_id: orderId,
            amount: totalAmount
        }]
    })
});
```

**India SMS Compliance (DLT Registration):**
- Register as a "Telemarketer" on [TRAI DLT portal](https://www.vilpower.in/) — **mandatory** for sending SMS in India
- Register sender ID (e.g., `TELUGD`) and message templates
- MSG91 handles the DLT routing once templates are approved
- Approval takes 2-5 business days

**Cost:**
| Service | Rate per SMS | Notes |
|---|---|---|
| **MSG91** | ₹0.14 – ₹0.20 | India-focused, DLT-compliant, great API |
| **Twilio** | ₹0.27 – ₹0.50 | Global, pricier for India |
| **Kaleyra** | ₹0.15 – ₹0.25 | Good for India, decent docs |

**Environment Variables for Notifications:**
```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=orders@telugudelicacies.com
MSG91_AUTH_KEY=xxxxxxxxxxxx
MSG91_ORDER_TEMPLATE_ID=xxxxxxxxxxxx
MSG91_SHIP_TEMPLATE_ID=xxxxxxxxxxxx
ADMIN_EMAIL=admin@telugudelicacies.com
ADMIN_PHONE=919618519191
```

---

## Phase 5: Optional Enhancements (Week 4+)

| Feature | Priority | Notes |
|---|---|---|
| **Guest Order Tracking Page** | Medium | `/order-status?id=xxx` — customer enters phone + order ID |
| **Customer Accounts** | Low | Extend Supabase Auth to customers for order history |
| **COD Option** | Medium | Creates order with `payment_method: 'cod'`, `payment_status: 'pending'` |
| **Delivery Charge Calculator** | Low | Pincode-based shipping rates. Start with flat rate |
| **Inventory Auto-Deduction** | High | On payment → deduct stock via Edge Function |

---

## Razorpay Account Setup Checklist

- [ ] Register at [dashboard.razorpay.com](https://dashboard.razorpay.com)
- [ ] Complete KYC (PAN, bank account, FSSAI license, GST if applicable)
- [ ] Get Test Mode API keys (`key_id` + `key_secret`)
- [ ] Build and test entire flow in Test Mode
- [ ] Apply for Live Mode activation
- [ ] Get Live API keys and switch
- [ ] Configure webhook URL → Supabase Edge Function for payment events

## Notification Setup Checklist

- [ ] **Email:** Register at [resend.com](https://resend.com) → Verify `telugudelicacies.com` domain → Get API key
- [ ] **SMS:** Register at [msg91.com](https://msg91.com) → Complete DLT registration on [TRAI portal](https://www.vilpower.in/) → Register sender ID + templates → Get auth key
- [ ] Add all API keys to Supabase Edge Function environment variables
- [ ] Test email delivery (check spam folder)
- [ ] Test SMS delivery (check DLT template approval)

---

## Files That Will Be Modified/Created

| File | Action | Purpose |
|---|---|---|
| `database/create_orders_table.sql` | **NEW** | Orders table schema |
| `database/add_checkout_mode_to_settings.sql` | **NEW** | Payment toggle columns in `site_settings` |
| `supabase/functions/create-order/index.ts` | **NEW** | Server-side order + Razorpay order creation |
| `supabase/functions/verify-payment/index.ts` | **NEW** | Payment verification + triggers email/SMS |
| `supabase/functions/send-order-email/index.ts` | **NEW** | Email via Resend API |
| `supabase/functions/send-order-sms/index.ts` | **NEW** | SMS via MSG91 API |
| `supabase/functions/admin-update-order/index.ts` | **NEW** | Admin order management |
| `index.html` | **MODIFY** | Add Razorpay script, checkout UI |
| `sales.html` | **MODIFY** | Add Razorpay script, checkout UI |
| `script.js` | **MODIFY** | Toggle-aware checkout flow |
| `styles.css` | **MODIFY** | Checkout form styles |
| `admin.html` | **MODIFY** | Add Payment Mode toggle + Orders tab |
| `admin.js` | **MODIFY** | Toggle save logic + orders management |
| `legal.html` content (in Supabase) | **MODIFY** | Update Privacy Policy & Terms for payment data |
