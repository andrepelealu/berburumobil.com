# 🚀 Vercel Deployment Guide for BerburuMobil

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **Vercel CLI installed**:
   ```bash
   npm install -g vercel
   ```

2. **GitHub repository** (recommended for automatic deployments)

3. **Environment variables** ready:
   - `OPENAI_API_KEY` - OpenAI API key for AI analysis
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for image storage)
   - `DATABASE_URL` - PostgreSQL/SQLite database connection string
   - `MIDTRANS_SERVER_KEY` - Midtrans payment gateway server key
   - `MIDTRANS_CLIENT_KEY` - Midtrans payment gateway client key

## 🔧 Deployment Steps

### Option 1: Deploy via Vercel CLI (Quick)

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy from project root**:
   ```bash
   vercel --prod
   ```

3. **Set environment variables**:
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add DATABASE_URL
   vercel env add MIDTRANS_SERVER_KEY
   vercel env add MIDTRANS_CLIENT_KEY
   ```

### Option 2: Deploy via GitHub Integration (Recommended)

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Import project to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure project settings

3. **Environment Variables in Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add all required environment variables:
     ```
     OPENAI_API_KEY=sk-...
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
     SUPABASE_SERVICE_ROLE_KEY=eyJ...
     DATABASE_URL=postgresql://...
     MIDTRANS_SERVER_KEY=SB-...
     MIDTRANS_CLIENT_KEY=SB-...
     ```

## ⚙️ Configuration Files

The project includes:

- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `next.config.ts` - Next.js configuration with image domains
- ✅ Environment variables setup for production

### Key Configuration Features:

1. **API Function Timeout**: 30 seconds for scraping operations
2. **Singapore Region**: Optimized for Indonesian users
3. **Image Proxy Caching**: 1-hour cache for proxied images
4. **Automatic Deployments**: On every push to main branch

## 🛠 Environment Variables Details

### Required Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for car analysis | `sk-proj-...` |
| `DATABASE_URL` | Database connection string | `postgresql://...` |
| `MIDTRANS_SERVER_KEY` | Midtrans server key for payments | `SB-Mid-server-...` |
| `MIDTRANS_CLIENT_KEY` | Midtrans client key for payments | `SB-Mid-client-...` |

### Optional Variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `NEXT_PUBLIC_APP_URL` | App base URL | Auto-detected |

## 📝 Database and Storage Setup

### Supabase Setup (Required)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for setup to complete

2. **Set up Image Storage**:
   ```sql
   -- Create storage bucket for car images
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('car-images', 'car-images', true);
   ```

3. **Create Database Tables**:
   ```sql
   CREATE TABLE blog_articles (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     content TEXT NOT NULL,
     excerpt TEXT NOT NULL,
     car_info JSONB NOT NULL,
     keywords TEXT[] NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     word_count INTEGER DEFAULT 0,
     seo_score INTEGER DEFAULT 0
   );
   ```

4. **Get Required Keys**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project Settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project Settings → API → anon public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API → service_role secret key

5. **Update Environment Variables** in Vercel dashboard

## 🌐 Custom Domain Setup

1. **Add domain in Vercel dashboard**:
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `berburumobil.com`)

2. **Update DNS records**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

## 🔍 Post-Deployment Checklist

After deployment, verify:

- [ ] ✅ Homepage loads correctly
- [ ] ✅ OLX car analysis works
- [ ] ✅ Mobil123 car analysis works  
- [ ] ✅ Facebook Marketplace analysis works
- [ ] ✅ Image proxy serves images properly
- [ ] ✅ Blog article generation works
- [ ] ✅ Blog article pages load correctly
- [ ] ✅ AI analysis returns proper results
- [ ] ✅ Price formatting displays correctly
- [ ] ✅ Image sliders work on mobile and desktop
- [ ] ✅ Payment booking flow works (if enabled)

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check TypeScript errors: `npm run build`
   - Verify all dependencies are installed

2. **API Timeouts**:
   - Car scraping may take time (30s timeout configured)
   - Use loading states for better UX

3. **Image Loading Issues**:
   - Verify `next.config.ts` has all required domains
   - Check image proxy API endpoint

4. **Environment Variables**:
   - Ensure all required variables are set in Vercel dashboard
   - Variables are case-sensitive

### Testing Deployment:

```bash
# Test locally first
npm run build
npm start

# Test key functionality
curl https://your-domain.vercel.app/api/analyze-car -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.olx.co.id/item/..."}'
```

## 📊 Performance Optimization

The app includes:
- ✅ Image optimization and caching
- ✅ API response caching
- ✅ Efficient car data scraping
- ✅ Clean production code (debug statements removed)

## 🔄 Continuous Deployment

Once set up with GitHub integration:
1. Make changes to your code
2. Push to `main` branch
3. Vercel automatically builds and deploys
4. New version is live in ~2-3 minutes

---

🎉 **Deployment Complete!** Your BerburuMobil app is now live on Vercel with full car analysis capabilities.