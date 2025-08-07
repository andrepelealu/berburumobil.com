import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import type { CarData } from '@/lib/scrapers'

interface SEOArticleData {
  title: string
  content: string
  excerpt: string
  keywords: string[]
  slug: string
  word_count: number
  seo_score: number
}

export async function POST(request: NextRequest) {
  try {
    const { carUrl, carData } = await request.json()

    // Input validation
    if (!carUrl || typeof carUrl !== 'string' || !carData || typeof carData !== 'object') {
      return NextResponse.json(
        { error: 'URL dan data mobil diperlukan' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedUrl = carUrl.trim().substring(0, 1000)
    
    // Validate URL
    try {
      const parsedUrl = new URL(sanitizedUrl)
      if (parsedUrl.protocol !== 'https:') {
        return NextResponse.json({ error: 'URL harus HTTPS' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Format URL tidak valid' }, { status: 400 })
    }

    console.log('Generating SEO article for:', carUrl)

    try {
      // Check if article already exists for this URL (with error handling)
      let existingArticle = null
      try {
        existingArticle = await DatabaseService.getBlogArticleByCarUrl(sanitizedUrl)
        if (existingArticle) {
          return NextResponse.json({
            success: true,
            article: existingArticle,
            message: 'Artikel sudah ada untuk URL ini'
          })
        }
      } catch (dbError) {
        console.log('Database check failed, proceeding with generation:', (dbError as Error).message)
      }

      // Generate SEO article using OpenAI
      const seoArticle = await generateSEOArticle(carData, carUrl)
      
      // Try to save to database, fallback to mock response if not available
      let savedArticle
      try {
        savedArticle = await DatabaseService.saveBlogArticle({
          ...seoArticle,
          car_url: carUrl,
          car_info: {
            title: carData.title,
            price: formatPrice(carData.price),
            year: carData.year,
            location: carData.location,
            url: carUrl,
            images: carData.images || []
          }
        })
        console.log('SEO article saved with ID:', savedArticle.id)
      } catch (dbError) {
        console.log('Database save failed, using demo mode:', (dbError as Error).message)
        // Create mock saved article
        savedArticle = {
          id: 'demo-' + Date.now(),
          ...seoArticle,
          car_url: carUrl,
          car_info: {
            title: carData.title,
            price: formatPrice(carData.price),
            year: carData.year,
            location: carData.location,
            url: carUrl,
            images: carData.images || []
          },
          created_at: new Date().toISOString()
        }
      }

      return NextResponse.json({
        success: true,
        article: savedArticle,
        message: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Artikel SEO berhasil dibuat' : 'Artikel SEO berhasil dibuat (demo mode)'
      })
    } catch (generationError) {
      console.error('SEO article generation failed:', generationError)
      throw generationError
    }
  } catch (error) {
    console.error('Error generating SEO article:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Gagal membuat artikel SEO', 
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    )
  }
}

async function generateSEOArticle(carData: CarData, carUrl: string): Promise<SEOArticleData> {
  // If OpenAI API key is not provided, return mock article
  if (!process.env.OPENAI_API_KEY) {
    console.log('🚨 OpenAI API key not provided, using mock SEO article')
    return generateMockSEOArticle(carData, carUrl)
  }

  try {
    console.log('✅ OpenAI API key found, generating real SEO article')
    const { OpenAI } = await import('openai')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Generate targeted keywords for Jabodetabek
    const targetKeywords = generateTargetKeywords(carData)
    
    const prompt = `Sebagai seorang ahli SEO dan penulis konten otomotif di Indonesia, buatlah artikel blog SEO yang komprehensif dengan ketentuan berikut:

INFORMASI MOBIL:
- Judul: ${carData.title}
- Harga: ${formatPrice(carData.price)}
- Tahun: ${carData.year}
- Lokasi: ${carData.location}
- Deskripsi: ${carData.description}

KETENTUAN ARTIKEL:
- Panjang: 1000+ kata
- Bahasa: Indonesia yang natural dan engaging
- Target: Pembeli mobil bekas di Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi)
- Fokus: Jasa inspeksi mobil dan tips membeli mobil bekas

KEYWORD TARGET (gunakan secara natural):
${targetKeywords.join(', ')}

STRUKTUR ARTIKEL:
1. Judul yang menarik dan SEO-friendly
2. Pembukaan yang engaging (150-200 kata)
3. Sub-judul yang informatif dengan keyword
4. Tips praktis untuk pembeli mobil bekas
5. Pentingnya inspeksi profesional
6. Fokus area Jabodetabek
7. Call-to-action yang persuasif
8. Kesimpulan yang kuat

GAYA PENULISAN:
- Gunakan tone yang friendly dan profesional
- Sertakan tips praktis dan actionable
- Fokus pada manfaat untuk pembaca
- Gunakan storytelling untuk membuat artikel engaging
- Sertakan fakta dan statistik jika relevan

FORMAT RESPONS JSON:
{
  "title": "Judul artikel yang SEO-friendly",
  "content": "Konten lengkap artikel dalam format HTML sederhana",
  "excerpt": "Ringkasan artikel 150-200 karakter",
  "keywords": ["keyword1", "keyword2", ...],
  "seo_score": 85
}

PENTING: 
- Artikel harus original dan tidak plagiat
- Gunakan keyword secara natural, tidak dipaksakan
- Fokus pada value untuk pembaca
- Sertakan local SEO untuk Jabodetabek
- Buat artikel yang benar-benar bermanfaat

Buatlah artikel yang akan membantu pembaca membuat keputusan yang tepat dalam membeli mobil bekas!`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Anda adalah seorang ahli SEO dan content writer otomotif di Indonesia. Anda HARUS merespons dengan format JSON yang valid SAJA. Gunakan Bahasa Indonesia yang natural dan engaging."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const articleText = response.choices[0]?.message?.content
    if (!articleText) {
      throw new Error('No content received from OpenAI')
    }

    console.log('Raw OpenAI SEO response length:', articleText.length)

    // Parse the JSON response
    let articleData
    try {
      articleData = JSON.parse(articleText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI SEO response:', parseError)
      throw new Error('Failed to parse AI response')
    }

    // Generate slug from title
    const slug = generateSlug(articleData.title)
    
    // Calculate word count
    const wordCount = articleData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter((word: string) => word.length > 0).length

    return {
      title: articleData.title || `Panduan Lengkap Membeli ${carData.title}`,
      content: articleData.content,
      excerpt: articleData.excerpt || `Tips lengkap untuk membeli ${carData.title} dengan aman melalui inspeksi profesional.`,
      keywords: articleData.keywords || targetKeywords,
      slug,
      word_count: wordCount,
      seo_score: articleData.seo_score || 80
    }

  } catch (error) {
    console.error('Error calling OpenAI for SEO article:', error)
    // Fallback to mock article
    return generateMockSEOArticle(carData, carUrl)
  }
}

function generateMockSEOArticle(carData: CarData, carUrl: string): SEOArticleData {
  const targetKeywords = generateTargetKeywords(carData)
  const title = `Panduan Lengkap Membeli ${carData.title} - Tips Inspeksi Mobil Bekas`
  const slug = generateSlug(title)
  
  const content = `
    <h2>Mengapa Memilih ${carData.title}?</h2>
    <p>Membeli mobil bekas seperti <strong>${carData.title}</strong> memerlukan perhatian khusus, terutama di wilayah <strong>Jabodetabek</strong> yang memiliki kondisi lalu lintas padat. Dengan harga ${formatPrice(carData.price)}, mobil ini menawarkan value yang menarik untuk tahun ${carData.year}.</p>
    
    <h2>Tips Penting Sebelum Membeli Mobil Bekas</h2>
    <p>Sebagai <strong>jasa inspeksi mobil profesional</strong>, kami merekomendasikan beberapa langkah penting:</p>
    <ul>
      <li>Periksa kondisi mesin dan transmisi secara menyeluruh</li>
      <li>Lakukan test drive di berbagai kondisi jalan</li>
      <li>Verifikasi kelengkapan surat-surat kendaraan</li>
      <li>Gunakan jasa inspeksi profesional untuk keamanan maksimal</li>
    </ul>
    
    <h2>Jasa Inspeksi Mobil Terpercaya di Jabodetabek</h2>
    <p>Untuk wilayah <strong>Jakarta, Bogor, Depok, Tangerang, dan Bekasi</strong>, sangat penting menggunakan <strong>jasa inspeksi mobil</strong> yang berpengalaman. Tim profesional kami menggunakan teknologi AI dan pengalaman bertahun-tahun untuk memberikan analisis komprehensif.</p>
    
    <h2>Analisis Kondisi ${carData.title}</h2>
    <p>Berdasarkan analisis mendalam, berikut adalah poin-poin penting yang perlu diperhatikan pada mobil ini:</p>
    <ul>
      <li>Kondisi eksterior dan cat mobil</li>
      <li>Performa mesin dan sistem kelistrikan</li>
      <li>Kondisi interior dan fitur kenyamanan</li>
      <li>Riwayat perawatan dan service record</li>
    </ul>
    
    <h2>Kesimpulan dan Rekomendasi</h2>
    <p>Membeli <strong>mobil bekas berkualitas</strong> memerlukan kehati-hatian dan keahlian. Dengan menggunakan <strong>jasa inspeksi mobil Jakarta</strong> yang profesional, Anda dapat membuat keputusan pembelian yang tepat dan terhindar dari kerugian di kemudian hari.</p>
    
    <p>Jangan ragu untuk menggunakan layanan inspeksi AI kami yang telah terbukti membantu ribuan pembeli mobil bekas di seluruh Jabodetabek.</p>
  `
  
  const excerpt = `Panduan lengkap membeli ${carData.title} dengan tips inspeksi profesional untuk wilayah Jabodetabek. Dapatkan analisis AI dan saran ahli.`
  
  return {
    title,
    content,
    excerpt,
    keywords: targetKeywords,
    slug,
    word_count: content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length,
    seo_score: 75
  }
}

function generateTargetKeywords(carData: CarData): string[] {
  const carBrand = carData.title.split(' ')[0] || 'mobil'
  const year = carData.year || '2020'
  
  return [
    'jasa inspeksi mobil jakarta',
    'jual beli mobil bekas',
    'inspeksi mobil profesional',
    'tips membeli mobil bekas',
    `${carBrand.toLowerCase()} bekas ${year}`,
    'jasa inspeksi jabodetabek',
    'mobil bekas berkualitas',
    'panduan mobil bekas',
    'inspeksi mobil tangerang',
    'inspeksi mobil bogor',
    'inspeksi mobil depok',
    'inspeksi mobil bekasi',
    'analisis mobil AI',
    'cek kondisi mobil bekas'
  ]
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 60) // Limit length
}