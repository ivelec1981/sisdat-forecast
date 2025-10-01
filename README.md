# SISDAT Forecast 🔌

**Strategic Energy Demand Forecasting System for Ecuador's Electrical Sector**

A comprehensive web application that analyzes historical energy consumption patterns and generates AI-powered demand projections for Ecuador's electrical companies through 2050.

## 🎯 Overview

SISDAT Forecast empowers Ecuador's electrical sector with data-driven insights by processing monthly demand data from 18 major electrical companies across 5 key sectors, enabling strategic planning and infrastructure development decisions.

## ✨ Key Features

- **📊 Historical Analysis**: 5+ years of monthly demand data visualization
- **🤖 ML Projections**: Multiple forecasting models with confidence intervals  
- **🏢 Multi-Company Support**: Centralized platform for 18 electrical companies
- **📈 Sector Insights**: Comparative analysis across residential, commercial, and industrial sectors
- **📋 Automated Reporting**: Export capabilities for strategic planning
- **🔐 Enterprise Access**: Role-based permissions for different organizational levels

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Vercel Postgres
- **ML/Analytics**: Custom forecasting algorithms
- **Deployment**: Vercel Platform
- **Charts**: Recharts, Chart.js
- **UI Components**: Lucide React, Custom components

## 📊 Data Scope

- **Historical Data**: Monthly consumption patterns (2020-2025)
- **Projections**: AI-powered forecasts through 2050
- **Coverage**: 18 companies, 5 sectors, nationwide infrastructure
- **Storage**: ~34.5 MB optimized monthly datasets
- **Updates**: Monthly data refresh cycle

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/sisdat-forecast.git
cd sisdat-forecast
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or  
pnpm install
# or
bun install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your environment variables:
```env
# Database
POSTGRES_URL="your-postgres-connection-string"
POSTGRES_URL_NON_POOLING="your-non-pooling-connection-string"

# NextAuth (if authentication required)
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
npm run db:push
npm run db:seed
```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 📁 Project Structure

```
sisdat-forecast/
├── app/                    # Next.js 15 App Router
│   ├── dashboard/          # Dashboard pages
│   ├── reports/            # Reports and analytics
│   ├── api/                # API routes
│   └── globals.css         # Global styles
├── components/             # Reusable React components
│   ├── ui/                 # UI primitives
│   ├── charts/             # Chart components
│   └── forms/              # Form components
├── lib/                    # Utility functions
│   ├── database/           # Database utilities
│   ├── ml/                 # ML algorithms
│   └── utils.ts            # General utilities
├── public/                 # Static assets
└── sql/                    # Database schemas and migrations
```

## 🎯 Use Cases

- **Strategic Planning**: Long-term infrastructure investment decisions
- **Capacity Management**: Peak demand forecasting and grid optimization  
- **Regulatory Compliance**: Standardized reporting for ARCONEL
- **Market Analysis**: Sector-wise growth trend identification

## 🏢 Target Users

- **Electrical Companies**: Technical directors, analysts, and operators
- **Regulatory Bodies**: ARCONEL oversight and planning teams
- **Government**: Energy policy and infrastructure planning
- **Consultants**: Market analysis and advisory services

## 📈 Performance & Scale

- **Database Size**: ~34.5 MB (optimized for Vercel Postgres Hobby)
- **Multi-User Support**: 50+ concurrent users
- **Response Time**: <2s for complex forecasting queries
- **Deployment**: Zero-downtime deployments via Vercel

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes
npm run db:seed      # Seed initial data
npm run db:studio    # Open database studio

# Utilities
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🐛 Troubleshooting

### Service Worker Issues (ChunkLoadError, Failed to fetch)

If you encounter errors like:
- `Failed to fetch` for `_next/static/chunks/*` files
- `ChunkLoadError: Loading chunk failed`
- `TypeError: Failed to fetch` in `sw.js`

**Quick Fix:**

1. Visit `http://localhost:3000/clear-sw.html`
2. Click "Limpiar Todo y Recargar" (Clear All and Reload)
3. Refresh your browser

**Manual Fix:**

```bash
# In DevTools Console (F12)
# 1. Unregister all service workers
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
})

# 2. Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})

# 3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
```

**Why this happens:**

The Service Worker caches assets for offline functionality (PWA). In development, dynamic imports and hot module replacement can conflict with the cache. The updated Service Worker now:

- Skips `/_next/` routes in development (no caching)
- Caches `/_next/static/` only in production
- Auto-updates every 60 seconds
- Reloads page when new SW version activates

**Prevention:**

- Use `clear-sw.html` tool after major updates
- Keep Service Worker disabled in DevTools during active development
- Run `npm run build` before testing PWA features

## 🚀 Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy SISDAT Forecast is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
   - Import your GitHub repository in Vercel
   - Configure environment variables
   - Deploy automatically

3. **Set up Vercel Postgres**
   - Enable Postgres in your Vercel dashboard
   - Update environment variables
   - Run initial database migration

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Alternative Deployment Options

- **Docker**: Dockerfile included for containerized deployment
- **Self-hosted**: Compatible with any Node.js hosting provider
- **Cloud Platforms**: AWS, Google Cloud, DigitalOcean

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-org/sisdat-forecast/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/sisdat-forecast/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/sisdat-forecast/discussions)

## 🙏 Acknowledgments

- [ARCONEL](https://www.regulacionelectrica.gob.ec/) - Regulatory framework and guidance
- [Next.js](https://nextjs.org) - React framework
- [Vercel](https://vercel.com) - Hosting and database platform
- Ecuador's electrical companies - Data and domain expertise

---

Built with 💡 for Ecuador's sustainable energy future

**Made by [Your Team/Organization] | [Contact Info]**
