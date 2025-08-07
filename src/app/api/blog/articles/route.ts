import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let articles = []
    
    try {
      // Try to get articles from database
      articles = await DatabaseService.getBlogArticles(limit, offset)
    } catch (dbError) {
      console.log('Database not available, using mock articles:', (dbError as Error).message)
    }
    
    // If no articles from database, provide mock articles
    if (articles.length === 0) {
      articles = getMockArticles().slice(offset, offset + limit)
    }
    
    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        page,
        limit,
        hasMore: articles.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching blog articles:', error)
    return NextResponse.json(
      { error: 'Gagal memuat artikel blog' },
      { status: 500 }
    )
  }
}

function getMockArticles() {
  return [
    {
      id: 'demo-1',
      title: 'Panduan Lengkap Membeli Honda Jazz Bekas - Tips Inspeksi Mobil Jakarta',
      slug: 'panduan-lengkap-membeli-honda-jazz-bekas-tips-inspeksi-mobil-jakarta',
      excerpt: 'Tips lengkap membeli Honda Jazz bekas dengan aman melalui inspeksi profesional di Jakarta. Hindari penipuan dan pastikan kondisi mobil sebelum membeli.',
      car_info: {
        title: 'Honda Jazz RS 2017',
        price: 'Rp 189.000.000',
        year: '2017',
        location: 'Jakarta',
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
        'tips membeli mobil bekas'
      ],
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      word_count: 1200,
      seo_score: 85
    },
    {
      id: 'demo-2', 
      title: 'Jasa Inspeksi Mobil Profesional Jabodetabek - Analisis AI Gratis',
      slug: 'jasa-inspeksi-mobil-profesional-jabodetabek-analisis-ai',
      excerpt: 'Dapatkan jasa inspeksi mobil profesional di Jabodetabek dengan teknologi AI. Analisis gratis untuk mobil bekas dari OLX, Facebook Marketplace, dan platform lainnya.',
      car_info: {
        title: 'Toyota Avanza 2019',
        price: 'Rp 165.000.000', 
        year: '2019',
        location: 'Tangerang',
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
        'mobil bekas tangerang'
      ],
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      word_count: 1100,
      seo_score: 88
    }
  ]
}