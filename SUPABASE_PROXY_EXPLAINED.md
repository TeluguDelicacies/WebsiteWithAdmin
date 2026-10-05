# Netlify Reverse Proxy for Supabase (ISP Bypass Guide)

## 📌 Summary: Why This Exists

If you or your customers visit **Telugu Delicacies** while connected to certain Indian home broadband networks (like **ACT Fibernet**, **JioFiber**, or **Airtel Broadband**), you may notice:
* Product cards stuck on **"Loading collections..."**
* Customer reviews displaying **"Unable to load reviews."** in red
* The site immediately starts working properly as soon as you switch to mobile data.

This document explains why this happens and how the Netlify Reverse Proxy completely solves it.

---

## 🔍 The Root Cause: ISP DNS Poisoning

1. **Government IT Act Blocking Orders:**
   Indian Internet Service Providers (ISPs) periodically receive blocking orders under Section 69A of the IT Act. Due to overbroad filtering rules, several major ISPs (most notably **ACT Fibernet**) inadvertently block or sinkhole the entire `*.supabase.co` wildcard domain where project APIs are hosted.

2. **DNS Hijacking by ACT Fibernet:**
   When a device on ACT Wi-Fi asks for the IP of `pfffotghmcofyrvqynbl.supabase.co`:
   * Even if you use Google DNS (`8.8.8.8`), ACT intercepts the unencrypted DNS request on port 53.
   * ACT returns their own sinkhole IP (`123.176.40.69`).
   * When the browser tries to establish an HTTPS connection to this sinkhole IP, the connection is forcibly closed (`SSL_ERROR_SYSCALL`), breaking all database calls.

3. **Why it Works on Mobile Data:**
   Cellular network gateways (like Airtel/Jio 4G/5G mobile data) use different DNS servers and routing policies that do not poison or sinkhole `*.supabase.co`.

---

## 🚀 The Permanent Solution: Netlify Reverse Proxy

Because our website is deployed on **Netlify**, we do not need customers to change their DNS or use VPNs. 

Instead, we route all Supabase database requests through our **own domain** (`telugudelicacies.com/api/supabase`), which Indian ISPs **never block**.

### Request Flow Diagram

```
┌────────────────────────────────────────────────────────┐
│  Visitor's Browser (on ACT Fibernet / Jio / Airtel)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ 1. Requests: https://telugudelicacies.com/api/supabase/rest/v1/...
                            ▼
┌────────────────────────────────────────────────────────┐
│                    ACT Fibernet                        │
│   (Sees "telugudelicacies.com" -> Allowed / No Block)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Netlify Global Edge CDN                  │
│       Matches rule in `public/_redirects`:             │
│       `/api/supabase/* -> https://...supabase.co/:splat 200!`│
└───────────────────────────┬────────────────────────────┘
                            │
                            │ 2. Netlify's server fetches directly from Supabase
                            │    (Global/US datacenter, completely outside Indian ISP filters)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Supabase Cloud Database                  │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Code Changes Made

### 1. `public/_redirects` & `dist/_redirects`
Added the rewrite rules at the very top of the redirects file:
```text
# 0. Supabase API & Storage Proxy (bypasses Indian ISP DNS poisoning / blocking of *.supabase.co)
/storage/*       https://pfffotghmcofyrvqynbl.supabase.co/storage/:splat  200!
/api/supabase/*  https://pfffotghmcofyrvqynbl.supabase.co/:splat         200!
```
* **Status Code `200!`**: Tells Netlify to act as an HTTP proxy (a rewrite), fetching data from Supabase behind the scenes without changing the browser URL.
* **The `/storage/*` rule**: Proxies all uploaded images (logos, hero background, favicons) directly through `telugudelicacies.com/storage/...`.
* **The `/api/supabase/*` rule**: Proxies all database REST API queries and assets through `telugudelicacies.com/api/supabase/...`.

### 2. `lib/supabase.js`
Updated the frontend configuration so that in production, all requests automatically use the proxy URL:
```javascript
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const DIRECT_SUPABASE_URL = 'https://pfffotghmcofyrvqynbl.supabase.co';
const SUPABASE_URL = (isBrowser && !isLocalhost)
    ? `${window.location.origin}/api/supabase`
    : DIRECT_SUPABASE_URL;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 3. `vite.config.js`
Added the same proxy to Vite's local dev server so `npm run dev` stays consistent:
```javascript
server: {
  port: 8000,
  open: false,
  proxy: {
    '/api/supabase': {
      target: 'https://pfffotghmcofyrvqynbl.supabase.co',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/supabase/, '')
    }
  }
}
```

---

## 💰 Cost & Limits on Netlify

* **100% Free:** Netlify Redirect/Proxy (`200` rewrite) is included in the **Free Tier**.
* **Zero Function Usage:** It is processed directly by Netlify's CDN edge router and does **not** count towards your monthly serverless function invocations.
* **Bandwidth:** Requests count toward Netlify's generous **100 GB/month free bandwidth limit**. Because Supabase returns small JSON payloads (~15–30 KB), you can serve millions of page views every month completely free.
