-- Blog Articles Migration for BerburuMobil
-- Run this SQL in your Supabase SQL Editor to add blog functionality
-- This migration is separate from the main schema

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create blog_articles table
CREATE TABLE IF NOT EXISTS blog_articles (
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
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_car_url ON blog_articles(car_url);
CREATE INDEX IF NOT EXISTS idx_blog_articles_created_at ON blog_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published ON blog_articles(published);
CREATE INDEX IF NOT EXISTS idx_blog_articles_keywords ON blog_articles USING GIN(keywords);

-- Enable Row Level Security (RLS)
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_articles (public read access)
-- Drop existing policies first (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow public read access to blog_articles" ON blog_articles;
DROP POLICY IF EXISTS "Allow public insert to blog_articles" ON blog_articles;
DROP POLICY IF EXISTS "Allow admin update to blog_articles" ON blog_articles;

-- Create new policies
CREATE POLICY "Allow public read access to blog_articles" ON blog_articles
  FOR SELECT USING (published = true);

CREATE POLICY "Allow public insert to blog_articles" ON blog_articles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update to blog_articles" ON blog_articles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Function to automatically update updated_at timestamp for blog articles
CREATE OR REPLACE FUNCTION update_blog_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for blog_articles updated_at
DROP TRIGGER IF EXISTS update_blog_articles_updated_at ON blog_articles;
CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_articles_updated_at();

-- Insert sample blog articles for testing (optional)
INSERT INTO blog_articles (title, slug, content, excerpt, keywords, car_url, car_info, word_count, seo_score) VALUES
(
  'Panduan Lengkap Membeli Honda Jazz Bekas - Tips Inspeksi Mobil Jakarta',
  'panduan-membeli-honda-jazz-bekas-inspeksi-mobil-jakarta',
  '<h2>Mengapa Memilih Honda Jazz Bekas?</h2>
  <p>Membeli mobil bekas seperti <strong>Honda Jazz RS 2017</strong> memerlukan perhatian khusus, terutama di wilayah <strong>Jakarta</strong> yang memiliki kondisi lalu lintas padat. Dengan harga Rp 189.000.000, mobil ini menawarkan value yang menarik untuk tahun 2017.</p>
  
  <h2>Tips Penting Sebelum Membeli Mobil Bekas</h2>
  <p>Sebagai <strong>jasa inspeksi mobil profesional</strong>, kami merekomendasikan beberapa langkah penting:</p>
  <ul>
    <li>Periksa kondisi mesin dan transmisi secara menyeluruh</li>
    <li>Lakukan test drive di berbagai kondisi jalan Jakarta</li>
    <li>Verifikasi kelengkapan surat-surat kendaraan</li>
    <li>Gunakan jasa inspeksi profesional untuk keamanan maksimal</li>
  </ul>
  
  <h2>Jasa Inspeksi Mobil Terpercaya di Jakarta</h2>
  <p>Untuk wilayah <strong>Jakarta dan sekitarnya</strong>, sangat penting menggunakan <strong>jasa inspeksi mobil</strong> yang berpengalaman. Tim profesional kami menggunakan teknologi AI dan pengalaman bertahun-tahun untuk memberikan analisis komprehensif.</p>
  
  <h2>Analisis Kondisi Honda Jazz RS 2017</h2>
  <p>Berdasarkan analisis mendalam menggunakan teknologi AI, berikut adalah poin-poin penting yang perlu diperhatikan pada Honda Jazz bekas:</p>
  <ul>
    <li>Kondisi eksterior dan cat mobil yang masih original</li>
    <li>Performa mesin 1.5L yang tangguh dan irit</li>
    <li>Kondisi interior yang lapang dan nyaman</li>
    <li>Riwayat perawatan dan service record Honda</li>
  </ul>
  
  <h2>Keuntungan Menggunakan Jasa Inspeksi Profesional</h2>
  <p>Dengan menggunakan <strong>jasa inspeksi mobil Jakarta</strong> yang profesional, Anda mendapatkan:</p>
  <ul>
    <li>Analisis AI gratis untuk kondisi mobil</li>
    <li>Inspeksi fisik oleh teknisi bersertifikat</li>
    <li>Laporan lengkap kondisi mobil</li>
    <li>Garansi kepuasan layanan</li>
  </ul>
  
  <h2>Kesimpulan dan Rekomendasi</h2>
  <p>Membeli <strong>Honda Jazz bekas</strong> bisa menjadi investasi yang tepat jika dilakukan dengan hati-hati. Dengan menggunakan <strong>jasa inspeksi mobil profesional</strong>, Anda dapat membuat keputusan pembelian yang tepat dan terhindar dari kerugian di kemudian hari.</p>
  
  <p>Jangan ragu untuk menggunakan layanan inspeksi AI kami yang telah terbukti membantu ribuan pembeli mobil bekas di Jakarta dan sekitarnya.</p>',
  'Tips lengkap membeli Honda Jazz bekas dengan aman melalui inspeksi profesional di Jakarta. Hindari penipuan dan pastikan kondisi mobil sebelum membeli.',
  ARRAY['jasa inspeksi mobil jakarta', 'honda jazz bekas', 'mobil bekas berkualitas', 'tips membeli mobil bekas', 'inspeksi mobil profesional'],
  'https://www.olx.co.id/item/honda-jazz-demo',
  '{"title": "Honda Jazz RS 2017", "price": "Rp 189.000.000", "year": "2017", "location": "Jakarta", "url": "https://www.olx.co.id/item/honda-jazz-demo"}',
  1200,
  85
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_articles (title, slug, content, excerpt, keywords, car_url, car_info, word_count, seo_score) VALUES
(
  'Jasa Inspeksi Mobil Profesional Jabodetabek - Analisis AI Gratis',
  'jasa-inspeksi-mobil-profesional-jabodetabek-analisis-ai',
  '<h2>Revolusi Inspeksi Mobil dengan Teknologi AI</h2>
  <p>Era digital telah menghadirkan terobosan baru dalam <strong>jasa inspeksi mobil</strong> di wilayah Jabodetabek. Dengan menggabungkan <strong>teknologi AI</strong> dan keahlian teknisi profesional, kini proses inspeksi mobil bekas menjadi lebih akurat dan efisien.</p>
  
  <h2>Keunggulan Jasa Inspeksi Mobil Jabodetabek</h2>
  <p>Sebagai penyedia <strong>jasa inspeksi mobil profesional</strong> terdepan di Jabodetabek, kami menawarkan:</p>
  <ul>
    <li>Analisis AI gratis untuk semua platform (OLX, Facebook Marketplace, Mobil123)</li>
    <li>Teknisi bersertifikat dengan pengalaman 10+ tahun</li>
    <li>Laporan komprehensif dalam 24 jam</li>
    <li>Jangkauan seluruh Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi)</li>
  </ul>
  
  <h2>Proses Inspeksi Mobil Profesional</h2>
  <p>Layanan <strong>inspeksi mobil Jabodetabek</strong> kami mengikuti standar internasional:</p>
  <ol>
    <li><strong>Analisis AI Awal:</strong> Upload link mobil untuk mendapat scoring otomatis</li>
    <li><strong>Booking Inspeksi:</strong> Pilih paket Standard atau Express</li>
    <li><strong>Inspeksi Lapangan:</strong> Teknisi datang ke lokasi dengan peralatan lengkap</li>
    <li><strong>Laporan Digital:</strong> Dapatkan laporan lengkap via WhatsApp</li>
  </ol>
  
  <h2>Wilayah Layanan Jasa Inspeksi</h2>
  <p>Kami melayani <strong>inspeksi mobil profesional</strong> di seluruh wilayah Jabodetabek:</p>
  <ul>
    <li><strong>Jakarta:</strong> Jakarta Pusat, Utara, Selatan, Barat, Timur</li>
    <li><strong>Bogor:</strong> Kota Bogor, Kabupaten Bogor, Cibinong</li>
    <li><strong>Depok:</strong> Seluruh wilayah Depok</li>
    <li><strong>Tangerang:</strong> Tangerang Kota, Tangerang Selatan, Serpong</li>
    <li><strong>Bekasi:</strong> Bekasi Kota, Bekasi Timur, Cikarang</li>
  </ul>
  
  <h2>Mengapa Memilih Jasa Inspeksi Mobil Kami?</h2>
  <p>Keunggulan <strong>jasa inspeksi mobil Jakarta</strong> dan sekitarnya:</p>
  <ul>
    <li>Teknologi AI terdepan untuk analisis awal</li>
    <li>Teknisi berpengalaman dan tersertifikasi</li>
    <li>Harga transparan mulai dari Rp 500.000</li>
    <li>Garansi kepuasan 100%</li>
    <li>Layanan 7 hari seminggu</li>
  </ul>
  
  <h2>Paket Layanan Inspeksi Mobil</h2>
  <p>Tersedia berbagai paket <strong>inspeksi mobil profesional</strong>:</p>
  <ul>
    <li><strong>Paket Standard:</strong> Inspeksi lengkap dalam 2-3 hari kerja</li>
    <li><strong>Paket Express:</strong> Inspeksi prioritas dalam hari yang sama</li>
    <li><strong>Add-on OBD:</strong> Diagnosa komputer mobil untuk deteksi error</li>
  </ul>
  
  <h2>Kesimpulan</h2>
  <p>Investasi dalam <strong>jasa inspeksi mobil bekas</strong> adalah keputusan yang bijak sebelum membeli mobil bekas. Dengan teknologi AI dan keahlian teknisi profesional, kami memastikan Anda mendapatkan mobil bekas berkualitas dengan harga yang tepat.</p>
  
  <p>Hubungi kami sekarang untuk konsultasi gratis dan booking inspeksi mobil di seluruh wilayah Jabodetabek!</p>',
  'Dapatkan jasa inspeksi mobil profesional di Jabodetabek dengan teknologi AI. Analisis gratis untuk mobil bekas dari OLX, Facebook Marketplace, dan platform lainnya.',
  ARRAY['jasa inspeksi jabodetabek', 'inspeksi mobil profesional', 'analisis ai mobil', 'mobil bekas tangerang', 'jasa inspeksi mobil jakarta'],
  'https://www.olx.co.id/item/toyota-avanza-demo',
  '{"title": "Toyota Avanza 2019", "price": "Rp 165.000.000", "year": "2019", "location": "Tangerang", "url": "https://www.olx.co.id/item/toyota-avanza-demo"}',
  1100,
  88
) ON CONFLICT (slug) DO NOTHING;

-- View for blog statistics (admin only)
CREATE OR REPLACE VIEW blog_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_articles,
  COUNT(*) FILTER (WHERE published = true) as published_articles,
  AVG(word_count) as avg_word_count,
  AVG(seo_score) as avg_seo_score
FROM blog_articles
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant access to the view for authenticated users
GRANT SELECT ON blog_stats TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Blog articles migration completed successfully!';
  RAISE NOTICE 'Created table: blog_articles';
  RAISE NOTICE 'Created indexes and RLS policies';
  RAISE NOTICE 'Inserted sample blog articles';
END $$;