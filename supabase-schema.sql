-- BerburuMobil Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create car_analyses table
CREATE TABLE car_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  car_url TEXT NOT NULL,
  car_data JSONB NOT NULL,
  ai_score INTEGER NOT NULL CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_analysis JSONB NOT NULL,
  user_ip INET,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'processing'))
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  booking_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  car_url TEXT NOT NULL,
  car_analysis_id UUID REFERENCES car_analyses(id),
  service_type TEXT NOT NULL CHECK (service_type IN ('standard', 'express')),
  add_obd BOOLEAN DEFAULT FALSE,
  preferred_date DATE,
  preferred_time TEXT,
  location TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
  payment_url TEXT,
  midtrans_order_id TEXT,
  inspection_status TEXT DEFAULT 'pending' CHECK (inspection_status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT
);

-- Create inspection_reports table
CREATE TABLE inspection_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  technician_name TEXT,
  report_data JSONB NOT NULL,
  photos TEXT[] DEFAULT '{}',
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  recommendations TEXT[] DEFAULT '{}',
  estimated_repair_cost INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'sent'))
);

-- Blog Articles Table
CREATE TABLE blog_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  keywords TEXT[] DEFAULT '{}',
  car_url TEXT NOT NULL,
  car_info JSONB NOT NULL,
  word_count INTEGER DEFAULT 0,
  seo_score INTEGER DEFAULT 0,
  ai_analysis JSONB,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_car_analyses_created_at ON car_analyses(created_at DESC);
CREATE INDEX idx_car_analyses_car_url ON car_analyses(car_url);
CREATE INDEX idx_bookings_booking_id ON bookings(booking_id);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_inspection_status ON bookings(inspection_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_inspection_reports_booking_id ON inspection_reports(booking_id);

-- Blog articles indexes
CREATE INDEX idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX idx_blog_articles_car_url ON blog_articles(car_url);
CREATE INDEX idx_blog_articles_created_at ON blog_articles(created_at DESC);
CREATE INDEX idx_blog_articles_published ON blog_articles(published);
CREATE INDEX idx_blog_articles_keywords ON blog_articles USING GIN(keywords);

-- Enable Row Level Security (RLS)
ALTER TABLE car_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for car_analyses (public read for analytics)
CREATE POLICY "Allow public read access to car_analyses" ON car_analyses
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to car_analyses" ON car_analyses
  FOR INSERT WITH CHECK (true);

-- RLS Policies for bookings (customers can only see their own)
CREATE POLICY "Allow public insert to bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow customers to view their own bookings" ON bookings
  FOR SELECT USING (
    whatsapp = current_setting('request.jwt.claims', true)::json->>'phone'
    OR 
    auth.uid() IS NOT NULL -- Allow authenticated admin users
  );

CREATE POLICY "Allow admin update to bookings" ON bookings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for inspection_reports (admin only for creation, customer read access)
CREATE POLICY "Allow admin insert to inspection_reports" ON inspection_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow admin update to inspection_reports" ON inspection_reports
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow customers to view reports for their bookings" ON inspection_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = inspection_reports.booking_id 
      AND (
        bookings.whatsapp = current_setting('request.jwt.claims', true)::json->>'phone'
        OR 
        auth.uid() IS NOT NULL
      )
    )
  );

-- RLS Policies for blog_articles (public read access)
CREATE POLICY "Allow public read access to blog_articles" ON blog_articles
  FOR SELECT USING (published = true);

CREATE POLICY "Allow public insert to blog_articles" ON blog_articles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update to blog_articles" ON blog_articles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking ID
CREATE OR REPLACE FUNCTION generate_booking_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BM' || TO_CHAR(NOW(), 'YYMMDD') || LPAD((RANDOM() * 999)::INT::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing (optional)
INSERT INTO car_analyses (car_url, car_data, ai_score, ai_analysis, status) VALUES
(
  'https://www.olx.co.id/item/honda-jazz-rs-2018-sample',
  '{
    "title": "Honda Jazz RS 2018",
    "price": "Rp 175.000.000",
    "year": "2018",
    "mileage": "45.000 km",
    "location": "Jakarta Selatan",
    "description": "Mobil terawat, service record lengkap",
    "images": [],
    "specs": {"transmission": "Manual", "fuelType": "Bensin"}
  }',
  85,
  '{
    "score": 85,
    "findings": ["Kondisi baik", "Terawat"],
    "recommendation": "Layak untuk inspeksi lanjutan",
    "confidence": 85,
    "riskLevel": "LOW",
    "analysis": {
      "exterior": {"score": 85, "findings": ["Cat baik"]},
      "interior": {"score": 80, "findings": ["Interior bersih"]},
      "engine": {"score": 75, "findings": ["Perlu cek mesin"]}
    },
    "estimatedValue": {"min": 165000000, "max": 180000000, "fair": 172500000}
  }',
  'success'
);

-- Create a view for booking statistics (admin only)
CREATE OR REPLACE VIEW booking_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_bookings,
  COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_bookings,
  COUNT(*) FILTER (WHERE service_type = 'express') as express_bookings,
  SUM(total_amount) FILTER (WHERE payment_status = 'paid') as revenue
FROM bookings
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant access to the view for authenticated users
GRANT SELECT ON booking_stats TO authenticated;