---
last_updated: 2026-07-25T13:34:51Z
status: active
---

# Project Context

## Project Overview
Beauty marketplace customer landing page - a modern, responsive two-sided marketplace for beauty, skincare, and personal care products. Clean, premium, minimalist aesthetic with soft pastels, rose gold, and off-white color palette.

## Key Decisions
| Date | Decision | By | Rationale |
|------|----------|-----|-----------|

## Constraints

### Zarinpal domain cutover (config only — no code edits)
The gateway return URL is built from ONE backend variable, mirroring the
`ZARINPAL_USE_SANDBOX` single-switch pattern. Nothing in the payment path
hardcodes a host.

- Variable: `PUBLIC_SITE_URL` (alias also honoured: `ZARINPAL_CALLBACK_BASE_URL`).
- Value: the public site origin only, e.g. `https://glowmarket.ir`.
- Callback is composed as `<origin>/payment/callback` (path lives in
  `services/zarinpal.py::CALLBACK_PATH`).
- Resolution order: env variable -> request `Origin` header / body hint ->
  otherwise a loud readable error. Today still works with the variable unset.
- Normalization: trims whitespace and quotes, strips trailing slashes and any
  path/query, and ignores blank values, so `//payment/callback` cannot occur.
- A non-absolute or non-http(s) value is rejected rather than sent to the
  gateway, because a broken callback strands buyers after they have paid.
- Inspect live state (no secrets exposed) via
  `GET /api/v1/payment/zarinpal/config` -> `site_origin_configured`, `callback_url`.

**Go-live sequence (order matters):**
1. Point the `.ir` domain at the published site and confirm it loads.
2. Set `PUBLIC_SITE_URL` to the new domain origin.
3. Re-verify a full sandbox payment on the new domain (check `config` shows the
   new `callback_url`, then complete one sandbox purchase end to end).
4. Register the same domain / callback URL in the Zarinpal merchant panel.
5. Only then set `ZARINPAL_USE_SANDBOX` to false to go live.


