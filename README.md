# Sync Webshop Storefront

The React frontend for sync_webshop. Talks to an ERPNext server running
the `sync_webshop` app purely via its REST API - it never touches ERPNext
directly.

## Multi-server model

This exact codebase gets deployed to every server. What differs per
deployment is just:

1. **`.env`** - which ERPNext server this instance points to
   (`VITE_API_BASE_URL`)
2. **Theme/content** - fetched live from that server's Webshop Theme
   Settings / Webshop Content Settings doctypes, so a non-technical admin
   changes colors, logo, quotes, and banners from the ERPNext desk, not
   by editing this code

To stand up server #2, copy this project, set a new `.env`, and deploy -
no code changes.

## Local development

```bash
npm install
cp .env.example .env
# edit .env: set VITE_API_BASE_URL to your ERPNext server
npm run dev
```

## Checkout security

Checkout calls ERPNext directly and is guest-accessible - there's no API
key or secret anywhere in this project to manage or rotate. The
`sync_webshop_checkout_proxy` service from an earlier revision is no
longer used and can be deleted; it existed only to protect a credential
that no longer exists.

Security instead comes from the `create_order` endpoint being narrowly
scoped in code (it can only create a Customer/Contact and a Sales Order
from cart data, nothing else). Before a real public launch, add basic
abuse protection (rate limiting) at the web server layer, same as any
storefront checkout endpoint.

## Status

- [x] Step 5 - Project scaffold, API client, theming engine, routing
- [x] Step 6 - Landing page real design
- [x] Step 7 - Product listing + detail real design
- [x] Step 8 - Cart + checkout real design, checkout routed through a secure proxy
- [ ] Step 9 - Customer dashboard (needs a new backend "list my orders" endpoint)
