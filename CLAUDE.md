# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SISDAT Forecast is an enterprise-grade web application for strategic energy demand forecasting in Ecuador's electrical sector. It processes historical energy consumption data from 18 electrical companies across 5 sectors and generates AI-powered demand projections through 2050.

**Tech Stack:** Next.js 15 (App Router), React 18, TypeScript, Prisma (SQLite dev/PostgreSQL prod), Tailwind CSS, Recharts, Leaflet maps

## Development Commands

### Build & Development
```bash
npm run dev              # Start dev server on 0.0.0.0:3000
npm run build            # Production build
npm run start            # Start production server
npm run preview          # Build and start production server
npm run clean            # Remove build artifacts (.next, out, dist)
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking (no emit)
```

### Testing
```bash
npm test                 # Run Jest unit tests
npm run test:watch       # Jest in watch mode
npm run test:coverage    # Jest with coverage report
npm run test:ci          # CI-optimized test run

npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Playwright UI mode
npm run test:e2e:headed  # Playwright headed mode
npm run test:e2e:report  # View Playwright report
```

### Database (Prisma)
```bash
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes to DB (dev)
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio GUI
npm run db:migrate       # Create and run migrations (dev)
npm run db:deploy        # Deploy migrations (production)
```

### Component Development
```bash
npm run storybook        # Start Storybook on port 6006
npm run build-storybook  # Build static Storybook
```

## Architecture

### Application Structure

**Next.js App Router** (`src/app/`):
- Pages use file-based routing with `page.tsx` files
- API routes in `src/app/api/[endpoint]/route.ts` (Next.js 15 format)
- Key routes: `/dashboard`, `/login`, `/login-apple`, `/multi-horizon-demo`

**Components** (`src/components/`):
- `auth/` - Authentication forms (standard and Apple-style), layouts
- `charts/` - Recharts visualizations (sector data, residential/industrial/commercial projections)
- `dashboard/` - Dashboard layout components (Header, Sidebar, MetricCard)
- `electrical/` - Electrical system diagrams (single-line, interactive)
- `map/` - Map components (Leaflet-based, transmission stations)
- `projections/` - Multi-horizon projection cards and demos
- `ui/` - Reusable UI primitives (Button, Input, Card, Pagination, etc.)
- `tabs/` - Dashboard tab content (Overview, Projections, Documentation, TransmissionMap, etc.)

**State Management**:
- Custom React hooks in `src/hooks/` for data fetching (no global state library)
- Hooks follow naming: `use[DataType]Data.ts` (e.g., `useResidentialData`, `useDashboardMetrics`)

**Data Layer** (`src/lib/`):
- `db.ts` - Prisma client singleton
- `env.ts` - Environment variable validation and access
- `data/` - Static/mock data for development
- `forecasting/` - ML forecasting engines:
  - `EnhancedModelRegistry.ts` - Model selection logic
  - `MultiHorizonIntegrator.ts` - Multi-horizon projection integration
  - `IPFReconciliationEngine.ts` - IPF (Iterative Proportional Fitting) reconciliation
  - `TechnicalLossesEngine.ts` - Technical loss projections
  - `TypicalLoadProfilesEngine.ts` - Load profile clustering
- `validations/` - Zod schemas for form validation
- `performance/` - Performance optimization utilities

**Database Schema** (`prisma/schema.prisma`):
- SQLite for development, PostgreSQL for production
- Key models: `Company`, `EnergyRecord`, `TransmissionStation`, `MultiHorizonProjection`, `TypicalLoadProfile`, `TechnicalLossProjection`
- Sector-specific models: `ResidentialData`, `IndustrialData`, `CommercialData`, `OthersData`, `PublicLightingData`
- Each sector model has energy/power predictions from multiple ML models (Prophet, GRU, WaveNet, GBR)

### Key Architectural Patterns

**API Routes**: Follow Next.js 15 App Router conventions:
```typescript
// src/app/api/[route]/route.ts
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({...}); }
```

**Data Fetching**: Client-side SWR pattern via custom hooks:
```typescript
// In hooks: fetch -> loading/error states -> return data
const { data, loading, error } = useResidentialData(companyId);
```

**Forecasting Models**: Multi-model approach:
- Short-term (0-2 years): Prophet, GRU, WaveNet, GBR
- Medium-term (2-5 years): SARIMAX, Econometric, Ensemble
- Long-term (5-15 years): Hybrid Bottom-Up/Top-Down
- Model selection based on data quality, horizon, and sector

**Security**: Implemented in `next.config.js`:
- CSP headers, HSTS, X-Frame-Options, X-Content-Type-Options
- reCAPTCHA on authentication forms
- Rate limiting configured via environment variables

## Important Implementation Notes

### TypeScript Strictness
- `strict: true` in `tsconfig.json` - all code must pass strict type checking
- Class properties must be initialized or marked with `!` assertion
- Zod schemas with `.default()` must provide complete default objects (not empty `{}`)

### Path Aliases
- Use `@/` for imports from `src/`: `import { Component } from '@/components/ui/Button'`

### Environment Variables
- Development: `.env.local` (create from `.env.example`)
- Production: `.env.production` (create from `.env.production.example`)
- Required vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Optional: `SENTRY_DSN`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `REDIS_URL`

### Service Worker & PWA
- PWA-enabled with service worker in `public/sw.js`
- Known issue: ChunkLoadError in dev mode due to HMR + SW caching
- Fix: Visit `/clear-sw.html` to clear cache or disable SW in DevTools
- Production: SW caches `/_next/static/` only

### Database Workflow
1. Modify `prisma/schema.prisma`
2. Development: `npm run db:push` (syncs without migrations)
3. Production: `npm run db:migrate` (creates migration), then `npm run db:deploy`
4. Always run `npm run db:generate` after schema changes

### Testing Philosophy
- Unit tests: Jest + React Testing Library (`src/components/**/__tests__/`)
- E2E tests: Playwright (`e2e/` directory)
- Coverage target: >80% overall, >90% for critical paths
- Storybook for component documentation and visual testing

## Common Development Workflows

### Adding a New Data Sector
1. Add model to `prisma/schema.prisma`
2. Run `npm run db:push`
3. Create API route: `src/app/api/[sector]-data/route.ts`
4. Create hook: `src/hooks/use[Sector]Data.ts`
5. Create chart component: `src/components/charts/[Sector]DataChart.tsx`
6. Add to dashboard tab

### Adding a Forecasting Model
1. Add model enum to `src/lib/forecasting/EnhancedModelRegistry.ts`
2. Implement model logic or API integration
3. Update `MultiHorizonProjection` schema with new model field
4. Add model selection logic in `EnhancedModelRegistry`
5. Update UI to display new model predictions

### Troubleshooting Build Issues
- TypeScript errors: `npm run type-check` to identify issues
- Prisma client outdated: `npm run db:generate`
- Circular dependencies: Check imports in `src/lib/` modules
- Service Worker conflicts: Clear via `/clear-sw.html` or DevTools

## Performance Considerations

- **Code Splitting**: Dynamic imports enabled for heavy components (maps, charts)
- **Image Optimization**: Use Next.js `<Image>` component, formats: WebP/AVIF
- **Bundle Optimization**: Tree-shaking enabled, optimizePackageImports for recharts/lucide-react
- **Caching**: API responses cached with revalidation, configurable via `CACHE_MAX_AGE`
- **Database**: Connection pooling configured in `DATABASE_URL`, use indexes on frequent queries

## Deployment

**Recommended Platform**: Vercel (zero-config)

**Pre-deployment Checklist**:
1. `npm run type-check` - no TypeScript errors
2. `npm run lint` - no ESLint errors
3. `npm run build` - successful production build
4. `npm test` - all tests passing
5. Environment variables configured in deployment platform
6. Database migrations deployed: `npm run db:deploy`

**Health Check**: `/api/health` endpoint returns system status, DB connectivity, memory usage

**Monitoring**: Sentry configured for error tracking and performance monitoring (configure `NEXT_PUBLIC_SENTRY_DSN`)

## Additional Documentation

- `DEPLOYMENT.md` - Detailed deployment guide (Vercel, Docker, PM2)
- `TESTING.md` - Comprehensive testing procedures and checklists
- `IMPROVEMENTS.md` - Recent improvements and optimization history
- `README.md` - Project overview and getting started
- `SECURITY_IMPLEMENTATION.md` - Security features and best practices
