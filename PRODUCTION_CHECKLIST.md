# 🚀 Production Deployment Checklist

## Environment Setup
- [ ] Update `.env.production` with real production values:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` - Production Supabase project URL
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production Supabase anon key
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` - Production Supabase service role key
  - [ ] `OPENAI_API_KEY` - Production OpenAI API key
  - [ ] `TELEGRAM_BOT_TOKEN` - Production Telegram bot token
  - [ ] `TELEGRAM_CHAT_ID` - Production Telegram chat ID
  - [ ] `NEXT_PUBLIC_APP_URL` - Production domain URL

## Database Setup
- [ ] Run database migrations in Supabase:
  ```sql
  -- Apply schema from supabase-schema.sql
  -- Apply blog migrations from supabase-blog-migration.sql
  -- Apply booking RLS fix from supabase/migrations/
  ```
- [ ] Enable Row Level Security policies
- [ ] Create storage bucket: `car-images`
- [ ] Set up bucket policies for public read access

## Performance Optimization
- [ ] Build and test application locally:
  ```bash
  npm run build
  npm start
  ```
- [ ] Verify all API endpoints work
- [ ] Test booking flow end-to-end
- [ ] Test AI analysis with real URLs
- [ ] Verify Telegram notifications

## Security
- [ ] Environment variables properly secured
- [ ] No debug logs in production
- [ ] API rate limiting configured
- [ ] CORS policies set correctly
- [ ] Service role key never exposed to frontend

## Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Monitor API response times
- [ ] Track booking conversion rates
- [ ] Monitor Telegram notification delivery

## Final Checks
- [ ] All test files removed
- [ ] Debug code removed
- [ ] Console logs cleaned up
- [ ] Performance tested
- [ ] Mobile responsiveness verified
- [ ] SEO metadata complete

## Deployment Commands
```bash
# Vercel
vercel --prod

# Or manual build
npm run build
npm run start
```

## Post-Deployment
- [ ] Verify live site functionality
- [ ] Test booking form submission
- [ ] Confirm AI analysis works
- [ ] Check Telegram notifications
- [ ] Monitor error logs
- [ ] Test on mobile devices