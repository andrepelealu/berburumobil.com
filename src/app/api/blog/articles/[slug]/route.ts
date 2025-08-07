import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    let article = null
    
    try {
      // Try to get from database
      article = await DatabaseService.getBlogArticleBySlug(slug)
    } catch (dbError) {
      console.log('Database not available, using mock articles:', (dbError as Error).message)
    }
    
    // If no article from database, try mock articles
    if (!article) {
      article = getMockArticleBySlug(slug)
    }
    
    if (!article) {
      return NextResponse.json(
        { error: 'Artikel tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      article
    })
  } catch (error) {
    console.error('Error fetching blog article:', error)
    return NextResponse.json(
      { error: 'Gagal memuat artikel' },
      { status: 500 }
    )
  }
}

function getMockArticleBySlug(slug: string) {
  const mockArticles = {
    'panduan-lengkap-membeli-honda-jazz-bekas-tips-inspeksi-mobil-jakarta': {
      id: 'demo-1',
      title: 'Panduan Lengkap Membeli Honda Jazz Bekas - Tips Inspeksi Mobil Jakarta',
      slug: 'panduan-lengkap-membeli-honda-jazz-bekas-tips-inspeksi-mobil-jakarta',
      content: `<h2>Mengapa Memilih Honda Jazz Bekas?</h2>
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
      
      <p>Jangan ragu untuk menggunakan layanan inspeksi AI kami yang telah terbukti membantu ribuan pembeli mobil bekas di Jakarta dan sekitarnya.</p>`,
      excerpt: 'Tips lengkap membeli Honda Jazz bekas dengan aman melalui inspeksi profesional di Jakarta. Hindari penipuan dan pastikan kondisi mobil sebelum membeli.',
      car_info: {
        title: 'Honda Jazz RS 2017',
        price: 'Rp 189.000.000',
        year: '2017',
        location: 'Jakarta',
        url: 'https://www.olx.co.id/item/honda-jazz-demo',
        images: [
          'https://apollo.olx.co.id/v1/files/eyJmbiI6InNvdHQ5aDh0MTIzLnBuZyIsInciOlt7ImZuIjoiZWNwNjZ2dGo0dDAuanBnIn1dfQ/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/eyJmbiI6InNvdHQ5aDh0MTIzYi5wbmciLCJ3IjpbeyJmbiI6ImVjcDY2dnRqNHQwLmpwZyJ9XX0/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/eyJmbiI6InNvdHQ5aDh0MTIzYy5wbmciLCJ3IjpbeyJmbiI6ImVjcDY2dnRqNHQwLmpwZyJ9XX0/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/eyJmbiI6InNvdHQ5aDh0MTIzZC5wbmciLCJ3IjpbeyJmbiI6ImVjcDY2dnRqNHQwLmpwZyJ9XX0/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/eyJmbiI6InNvdHQ5aDh0MTIzZS5wbmciLCJ3IjpbeyJmbiI6ImVjcDY2dnRqNHQwLmpwZyJ9XX0/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/eyJmbiI6InNvdHQ5aDh0MTIzZi5wbmciLCJ3IjpbeyJmbiI6ImVjcDY2dnRqNHQwLmpwZyJ9XX0/image;s=780x0;q=60'
        ]
      },
      keywords: [
        'jasa inspeksi mobil jakarta',
        'honda jazz bekas',
        'mobil bekas berkualitas',
        'tips membeli mobil bekas',
        'inspeksi mobil profesional'
      ],
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      word_count: 1200,
      seo_score: 85
    },
    'jasa-inspeksi-mobil-profesional-jabodetabek-analisis-ai': {
      id: 'demo-2',
      title: 'Jasa Inspeksi Mobil Profesional Jabodetabek - Analisis AI Gratis',
      slug: 'jasa-inspeksi-mobil-profesional-jabodetabek-analisis-ai',
      content: `<h2>Revolusi Inspeksi Mobil dengan Teknologi AI</h2>
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
      
      <p>Hubungi kami sekarang untuk konsultasi gratis dan booking inspeksi mobil di seluruh wilayah Jabodetabek!</p>`,
      excerpt: 'Dapatkan jasa inspeksi mobil profesional di Jabodetabek dengan teknologi AI. Analisis gratis untuk mobil bekas dari OLX, Facebook Marketplace, dan platform lainnya.',
      car_info: {
        title: 'Toyota Avanza 2019',
        price: 'Rp 165.000.000',
        year: '2019',
        location: 'Tangerang',
        url: 'https://www.olx.co.id/item/toyota-avanza-demo',
        images: [
          'https://apollo.olx.co.id/v1/files/eyJmbiI6ImF2YW56YTlnMXIxOC5qcGciLCJ3IjpbeyJmbiI6ImVjcDY2dnRqNHQwLmpwZyJ9XX0/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/eyJmbiI6ImF2YW56YTlnMXIxOGIuanBnIiwidyI6W3siZm4iOiJlY3A2NnZ0ajR0MC5qcGcifV19/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/eyJmbiI6ImF2YW56YTlnMXIxOGMuanBnIiwidyI6W3siZm4iOiJlY3A2NnZ0ajR0MC5qcGcifV19/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/eyJmbiI6ImF2YW56YTlnMXIxOGQuanBnIiwidyI6W3siZm4iOiJlY3A2NnZ0ajR0MC5qcGcifV19/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/eyJmbiI6ImF2YW56YTlnMXIxOGUuanBnIiwidyI6W3siZm4iOiJlY3A2NnZ0ajR0MC5qcGcifV19/image;s=780x0;q=60'
        ]
      },
      keywords: [
        'jasa inspeksi jabodetabek',
        'inspeksi mobil profesional',
        'analisis ai mobil',
        'mobil bekas tangerang',
        'jasa inspeksi mobil jakarta'
      ],
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      word_count: 1100,
      seo_score: 88
    }
  }
  
  return (mockArticles as Record<string, unknown>)[slug] || null
}