# BerburuMobil - Car Inspection Service Landing Page

A complete, production-ready landing page for a car inspection service in Indonesia. Built with Next.js, TypeScript, and TailwindCSS.

## Features

- 🚗 **AI Car Analysis**: Free instant analysis from car listing URLs (OLX, Facebook Marketplace, Mobil123)
- 👨‍🔧 **Professional Inspection**: Book technician inspection with real-time updates
- 💳 **Secure Payment**: Midtrans integration with multiple payment methods
- 📱 **Mobile-First Design**: Responsive design optimized for mobile users
- 🎯 **SEO Optimized**: Schema.org structured data, meta tags, and Indonesian localization
- ⚡ **Fast Performance**: Built with Next.js 15 and optimized for speed

## Business Model

- **Target**: People buying used cars from online marketplaces
- **Primary Service**: Professional car inspection with AI pre-screening
- **Pricing**: 
  - Standard Inspection: Rp 500,000 (2-3 days)
  - Express Inspection: Rp 750,000 (same day)
  - OBD Scan Add-on: +Rp 100,000
- **Coverage**: Greater Jakarta area (Jabodetabek)

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Icons**: Heroicons
- **Payment**: Midtrans integration
- **SEO**: Schema.org structured data
- **AI Analysis**: Real web scraping with OpenAI Vision API integration

## Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🚀 **Real Web Scraping Implementation**

The application now includes **real web scraping** functionality that actually extracts car data from:

### ✅ **Supported Platforms**
- **OLX Indonesia** - Full scraping with Puppeteer
- **Facebook Marketplace** - Basic scraping (limited by authentication)
- **Mobil123** - Full scraping with Cheerio

### 🔧 **How It Works**
1. **User submits car URL** from any supported platform
2. **System detects platform** and uses appropriate scraper
3. **Extracts real data**: title, price, year, mileage, location, images, specs
4. **AI Analysis**: Analyzes photos and provides condition scoring
5. **Returns actual data** instead of mock information

### 📋 **Scraped Data Includes**
- ✅ Car title and model
- ✅ Actual listing price
- ✅ Year and mileage
- ✅ Seller location
- ✅ Car description
- ✅ Photo URLs for AI analysis
- ✅ Technical specifications (transmission, fuel type, etc.)

### 🤖 **AI Integration**
- Real photo analysis using OpenAI Vision API
- Condition scoring (0-100) based on images
- Risk assessment and recommendations
- Market value estimation

### 🗄️ **Supabase Database Integration**
- **Real-time data storage** for all car analyses and bookings
- **PostgreSQL database** with proper schema and relationships
- **Row Level Security** for data protection
- **Analytics tracking** for business insights
- **Booking management** with payment status tracking
- **Inspection reports** storage and retrieval

## Key Components

### Landing Page Sections
- **Hero Section**: Main CTA with car URL input for AI analysis
- **How It Works**: 6-step process explanation
- **Pricing**: Three service packages with clear pricing
- **Example Report**: Sample AI analysis and customer testimonials
- **Service Area**: Coverage map for Jabodetabek
- **Booking Form**: Two-step booking with AI analysis and payment

### API Routes
- `/api/analyze-car`: Car URL analysis with mock AI scoring
- `/api/create-booking`: Booking creation with Midtrans payment

## Environment Variables

Required environment variables (see `.env.example`):

### **Supabase Configuration**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

### **Payment & AI**
- `MIDTRANS_SERVER_KEY`: Your Midtrans server key
- `MIDTRANS_CLIENT_KEY`: Your Midtrans client key  
- `OPENAI_API_KEY`: OpenAI API key for real AI analysis

## Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema**:
   ```sql
   -- Copy and paste the contents of supabase-schema.sql
   -- into your Supabase SQL Editor and run it
   ```

3. **Get your environment variables** from your Supabase project settings:
   - Project URL
   - Anonymous key  
   - Service role key

4. **Set up Row Level Security** policies (included in schema)

5. **Optional**: Enable realtime for live booking updates

## SEO Features

- Optimized meta tags for Indonesian market
- Schema.org LocalBusiness structured data
- Geographic targeting for Jakarta area
- Indonesian language optimization
- Mobile-first responsive design

## Payment Integration

The app includes Midtrans payment gateway integration supporting:
- Credit/Debit cards
- Bank transfers
- E-wallets (GoPay, OVO, Dana)
- Convenience store payments

## Deployment

The app is ready for deployment on Vercel:

```bash
npm run build
```

## Customization

### Adding Real AI Analysis
Replace the mock AI analysis in `/api/analyze-car/route.ts` with:
1. Web scraping logic for OLX, Facebook Marketplace, Mobil123
2. OpenAI Vision API integration for photo analysis
3. Car valuation algorithms

### Database Integration
Add database models for:
- Customer bookings
- Inspection reports
- Technician schedules
- Payment tracking

### WhatsApp Integration
Integrate WhatsApp Business API for:
- Booking notifications
- Customer support
- Progress updates

## License

This project is created for educational and business purposes. Feel free to use and modify according to your needs.

---

**Created with ❤️ for the Indonesian automotive market**
