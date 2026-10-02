# Slow Sunday Boutique (EtsyShop Monorepo)

Full-stack boutique e-commerce monorepo for **Slow Sunday Boutique** — featuring cozy apparel (garment-dyed Comfort Colors tees, hand-embroidered fleece crewnecks), botanical ceramic mugs, washed linen market totes, and botanical home decor.

Built with TypeScript, Node.js/Express, and React + Vite following Melkor Factory monorepo standards. Configured for **Render** (API backend) and **Vercel** (frontend).

## Brand Identity & Aesthetic

- **Brand:** Slow Sunday Boutique
- **Theme:** Cozy, botanical, slow-living goods for women
- **Assets:** Official circular logo stored at `assets/slow_sunday_logo.jpg` and served from `apps/web/public/assets/logo.jpg`.

## Architecture

```
EtsyShop/
├── assets/              # Master brand assets (slow_sunday_logo.jpg)
├── apps/
│   ├── api/             # Express + Node.js backend (Target: Render)
│   │   ├── src/
│   │   │   ├── app.ts   # Express app definition & routes (/api/health, /api/products, /api/orders)
│   │   │   ├── data/    # Slow Sunday Boutique curated inventory
│   │   │   ├── index.ts # HTTP server listener (port 10000)
│   │   │   └── __tests__/ # Vitest health endpoint tests
│   └── web/             # React + Vite frontend (Target: Vercel)
│       ├── public/assets/ # Publicly served brand logo
│       └── src/         # Storefront UI, shopping cart drawer, Render health inspector
├── packages/
│   └── shared/          # Shared TypeScript contracts (Product, Order, ApiResponse, etc.)
├── render.yaml          # Render web service blueprint for api (etsy-shop-api)
├── vercel.json          # Vercel deployment configuration for web
└── package.json         # Root npm workspaces configuration
```

## Quick Start

### Installation
```bash
npm install
```

### Build Everything
```bash
npm run build
```

### Run Tests
```bash
npm run test
```

### Local Development
```bash
# Run both API and Web concurrently
npm run dev

# Or run individually:
npm run dev:api  # Express API runs on http://localhost:10000
npm run dev:web  # React Storefront runs on http://localhost:3000
```

## Deployment Targets

- **API Backend**: Deployable directly to Render using `render.yaml`. Provides `/api/health` for automated uptime checks.
- **Web Frontend**: Deployable to Vercel using `vercel.json` pointing to `apps/web/dist`.
