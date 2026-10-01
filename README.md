# EtsyShop Monorepo

Full-stack Etsy-inspired e-commerce platform built with TypeScript, Node.js/Express, and React + Vite. Designed according to Melkor Factory monorepo standards targeting **Render** for API deployment and **Vercel** for frontend deployment.

## Architecture

```
EtsyShop/
├── apps/
│   ├── api/             # Express + Node.js backend (Target: Render)
│   │   ├── src/
│   │   │   ├── app.ts   # Express app definition & routes (/api/health, /api/products)
│   │   │   ├── index.ts # HTTP server listener
│   │   │   └── __tests__/ # Vitest health endpoint tests
│   └── web/             # React + Vite frontend (Target: Vercel)
│       └── src/         # Storefront UI, shopping cart, API health indicator
├── packages/
│   └── shared/          # Shared TypeScript contracts (Product, Order, ApiResponse, etc.)
├── render.yaml          # Render web service blueprint for api
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

# Or run separately:
npm run dev:api  # Express API runs on http://localhost:10000
npm run dev:web  # React Storefront runs on http://localhost:3000
```

## Deployment Targets

- **API Backend**: Deployable directly to Render using `render.yaml`. Provides `/api/health` for automated uptime checks.
- **Web Frontend**: Deployable to Vercel using `vercel.json` pointing to `apps/web/dist`.
