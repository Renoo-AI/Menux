# MenuxPRO Roadmap

> A focused, practical roadmap for launching MenuxPRO with real cafés.

---

## Founder Summary

MenuxPRO is a QR-based digital menu platform for restaurants. The goal is simple:

**Get to first paying café, prove the product works, then iterate based on real feedback.**

This roadmap deliberately avoids feature creep. No AI, no AR, no POS integrations, no inventory management—until we have traction.

The best product is one that real restaurants use daily, not one with 100 features nobody asked for.

---

## P0 — Required Before First Café Demo

> Cannot demo without these. Period.

### Security & Configuration
| # | Item | Status |
|---|------|--------|
| 1 | Firebase env variables configured | ✅ Done |
| 2 | Superadmin custom claims set | ✅ Done |
| 3 | Firestore rules tested | ⚠️ Needs verification |
| 4 | Admin/staff route protection verified | ✅ Done |
| 5 | No secrets, .db files, or temp files in export | ✅ Done |

### Core Functionality
| # | Item | Status |
|---|------|--------|
| 6 | Public menu loads fast on mobile | ✅ Done |
| 7 | Table ordering works end-to-end | ✅ Done |
| 8 | Cashier dashboard stable | ✅ Done |
| 9 | Order status lifecycle (CREATED → ACCEPTED → READY → SERVED) | ✅ Done |
| 10 | Call waiter / Request bill | ✅ Done |

### Branding & Plans
| # | Item | Status |
|---|------|--------|
| 11 | Plan limits enforced (FREE/BASIC/PRO/MAX) | ✅ Done |
| 12 | Watermark for FREE plan | ✅ Done |
| 13 | Custom branding for PAID plans | ✅ Done |

### SEO & Assets
| # | Item | Status |
|---|------|--------|
| 14 | Favicon and app icons | ✅ Done |
| 15 | Open Graph images | ✅ Done |
| 16 | manifest.webmanifest | ✅ Done |
| 17 | robots.txt and sitemap.xml | ✅ Done |
| 18 | Meta tags per restaurant | ✅ Done |

### Export Readiness
| # | Item | Status |
|---|------|--------|
| 19 | Final export checklist verified | ✅ Done |
| 20 | Build passes | ✅ Done |
| 21 | Lint passes | ✅ Done |

---

## P1 — After First Café Demo

> Polish what we have. Fix friction. Add quality-of-life.

### Customer Experience
| # | Item | Why |
|---|------|-----|
| 1 | Push notifications | Know when order is ready |
| 2 | Returning customer (localStorage) | "Welcome back" experience |
| 3 | Loyalty points (PAID only) | Retention for paying restaurants |
| 4 | Review after meal (PAID only) | Feedback loop |

### Staff Tools
| # | Item | Why |
|---|------|-----|
| 5 | Waiter mode polish | Better table service flow |
| 6 | Owner daily report email | Know what happened today |

### Restaurant Management
| # | Item | Why |
|---|------|-----|
| 7 | Menu preview mode | See what customers see |
| 8 | Bulk menu import (PDF/Excel) | Faster onboarding |
| 9 | Image optimization | Faster load times |
| 10 | Error monitoring (Sentry) | Know when things break |

---

## P2 — After 3-5 Paying Clients

> Scale with real revenue. Add enterprise-ready features.

### Internationalization
| # | Item | Why |
|---|------|-----|
| 1 | Full FR/AR/EN multi-language | Tourist-friendly menus |

### Operations
| # | Item | Why |
|---|------|-----|
| 2 | Better analytics dashboard | Data-driven decisions |
| 3 | Kitchen display mode (KDS) | High-volume kitchens |
| 4 | PWA install prompt | App-like experience |
| 5 | Custom domain support | Branding for PRO/MAX |

### Multi-Location
| # | Item | Why |
|---|------|-----|
| 6 | Multi-branch support | Chain restaurants |

### Plans & Limits
| # | Item | Why |
|---|------|-----|
| 7 | Advanced plan limits | Granular monetization |
| 8 | Backup/export tools | Data portability |

---

## P3 — Future Only

> Do NOT build until there is clear demand and paying customers asking for it.

- AI-powered dish recommendations
- AR menu preview (3D food models)
- Voice ordering
- GraphQL API
- POS integrations (Toast, Square, Lightspeed)
- Delivery integrations (UberEats, DoorDash)
- Supplier management
- Inventory management
- Dynamic pricing
- AI demand forecasting
- White-label reseller platform
- Reservation system
- Staff scheduling
- Recipe costing
- Waitlist management

**Why wait?** These are expensive to build and maintain. They require deep domain expertise and integrations. Build them only when real restaurants with real money ask for them.

---

## What NOT To Build Yet

| Category | Why Wait |
|----------|----------|
| **AI/ML features** | Requires large dataset we don't have |
| **POS integrations** | Each POS is a multi-month project |
| **Delivery platforms** | API costs, revenue share negotiations |
| **Inventory management** | Complex domain, needs industry expertise |
| **AR/Voice** | Novelty features, not core value |
| **White-label** | Need product-market fit first |

**Remember:** Every feature is a maintenance burden. The goal is a lean, stable product that does ONE thing well: **QR menu ordering.**

---

## Release Phases

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 0: LAUNCH (NOW)                                          │
│  ─────────────────────                                          │
│  • P0 items complete                                            │
│  • Deploy to production                                         │
│  • Onboard first café (free or discounted)                      │
│  • Daily monitoring, fix bugs fast                              │
│                                                                 │
│  Success metric: First real order from real customer            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: VALIDATE (1-3 months)                                 │
│  ────────────────────────────                                   │
│  • 1-3 cafés using daily                                        │
│  • Collect feedback weekly                                      │
│  • Fix friction points                                          │
│  • Implement top 3-5 P1 features                                │
│                                                                 │
│  Success metric: First paying customer                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: SCALE (3-6 months)                                    │
│  ─────────────────────────────                                  │
│  • 3-5 paying clients                                           │
│  • Revenue covers costs                                         │
│  • Implement P2 features based on demand                        │
│  • Consider first hire                                          │
│                                                                 │
│  Success metric: $1K+ MRR                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: GROW (6-12 months)                                    │
│  ─────────────────────────                                      │
│  • 10+ paying clients                                           │
│  • Clear feature requests                                       │
│  • Evaluate P3 items based on demand                            │
│  • Consider funding or bootstrapped growth                      │
│                                                                 │
│  Success metric: Sustainable business                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Next Action

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🎯 DEPLOY TO PRODUCTION AND ONBOARD FIRST CAFÉ                  ║
║                                                                   ║
║   1. Set production Firebase environment variables                ║
║   2. Deploy to Vercel/production hosting                          ║
║   3. Set superadmin custom claim in Firebase                     ║
║   4. Create first restaurant via admin panel                      ║
║   5. Print QR code, stick on table                                ║
║   6. Watch real customers order                                   ║
║   7. Fix what breaks                                              ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

**There is no perfect. There is only shipped.**

---

*Last updated: 2025-05-09*
