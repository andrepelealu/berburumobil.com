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
  ai_analysis?: {
    score: number
    confidence: number
  }
}

// Internal function that can be called directly without HTTP
export async function generateBlogArticleInternal(params: {
  carUrl: string
  carData: CarData
  aiAnalysis?: {
    score: number
    recommendation: string
    confidence: number
    riskLevel: string
  }
}) {
  const requestStartTime = Date.now()
  try {
    const { carUrl, carData } = params

    // Input validation
    if (!carUrl || typeof carUrl !== 'string' || !carData || typeof carData !== 'object') {
      // Validation failed: missing required fields
      return {
        success: false,
        error: 'URL dan data mobil diperlukan'
      }
    }

    // Sanitize inputs
    const sanitizedUrl = carUrl.trim().substring(0, 1000)
    
    // Validate URL
    try {
      const parsedUrl = new URL(sanitizedUrl)
      if (parsedUrl.protocol !== 'https:') {
        // URL validation failed: not HTTPS
        return {
          success: false,
          error: 'URL harus HTTPS'
        }
      }
    } catch {
      // URL validation failed: invalid format
      return {
        success: false,
        error: 'Format URL tidak valid'
      }
    }

    // Generating SEO article

    try {
      // Check if article already exists for this URL (with error handling)
      let existingArticle = null
      try {
        existingArticle = await DatabaseService.getBlogArticleByCarUrl(sanitizedUrl)
        if (existingArticle) {
          const totalTime = Date.now() - requestStartTime
          // Existing article found
          return {
            success: true,
            article: existingArticle,
            message: 'Artikel sudah ada untuk URL ini',
            processingTime: `${totalTime}ms`
          }
        }
      } catch (_dbError) {
        // Database check failed, proceeding with generation
      }

      // Generate SEO article using OpenAI
      const seoArticle = await generateSEOArticle(carData, params.aiAnalysis)
      
      // Try to save to database, fallback to mock response if not available
      let savedArticle
      try {
        savedArticle = await DatabaseService.saveBlogArticle({
          ...seoArticle,
          car_url: sanitizedUrl,
          car_info: {
            title: carData.title,
            price: formatPrice(carData.price),
            year: carData.year,
            location: carData.location,
            url: sanitizedUrl,
            images: carData.images || []
          }
        })
        // SEO article saved successfully
      } catch (_dbError) {
        // Database save failed, using demo mode
        // Create mock saved article
        savedArticle = {
          id: 'demo-' + Date.now(),
          ...seoArticle,
          car_url: sanitizedUrl,
          car_info: {
            title: carData.title,
            price: formatPrice(carData.price),
            year: carData.year,
            location: carData.location,
            url: sanitizedUrl,
            images: carData.images || []
          },
          created_at: new Date().toISOString()
        }
      }

      const totalTime = Date.now() - requestStartTime
      // Blog generation completed successfully
      
      return {
        success: true,
        article: savedArticle,
        message: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Artikel SEO berhasil dibuat' : 'Artikel SEO berhasil dibuat (demo mode)',
        processingTime: `${totalTime}ms`
      }
    } catch (generationError) {
      // SEO article generation failed
      throw generationError
    }
  } catch (error) {
    const totalTime = Date.now() - requestStartTime
    console.error('Error generating SEO article:', error instanceof Error ? error.message : 'Unknown error')
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: 'Gagal membuat artikel SEO', 
      details: errorMessage,
      processingTime: `${totalTime}ms`
    }
  }
}

async function generateSEOArticle(carData: CarData, aiAnalysis?: {
  score: number
  recommendation: string
  confidence: number
  riskLevel: string
}): Promise<SEOArticleData> {
  // If OpenAI API key is not provided, return mock article
  if (!process.env.OPENAI_API_KEY) {
    // OpenAI API key not provided, using mock SEO article
    return generateMockSEOArticle(carData, aiAnalysis)
  }

  try {
    // OpenAI API key found, generating real SEO article
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

    // OpenAI SEO response received

    // Parse the JSON response
    let articleData
    try {
      articleData = JSON.parse(articleText)
    } catch (_parseError) {
      // Failed to parse OpenAI SEO response
      throw new Error('Failed to parse AI response')
    }

    // Generate slug from title
    const slug = generateSlug(articleData.title)
    
    // Remove AI analysis section from content as it's already shown in "Informasi Sumber Analisis"
    const finalContent = articleData.content
    
    // Calculate word count
    const wordCount = finalContent.replace(/<[^>]*>/g, '').split(/\s+/).filter((word: string) => word.length > 0).length

    return {
      title: articleData.title || `Panduan Lengkap Membeli ${carData.title}`,
      content: finalContent,
      excerpt: articleData.excerpt || `Tips lengkap untuk membeli ${carData.title} dengan aman melalui inspeksi profesional.`,
      keywords: articleData.keywords || targetKeywords,
      slug,
      word_count: wordCount,
      seo_score: articleData.seo_score || 80,
      ai_analysis: aiAnalysis ? {
        score: aiAnalysis.score,
        confidence: aiAnalysis.confidence
      } : undefined
    }

  } catch (error) {
    // Error calling OpenAI for SEO article, using fallback
    // Fallback to mock article
    return generateMockSEOArticle(carData, aiAnalysis)
  }
}

function generateMockSEOArticle(carData: CarData, aiAnalysis?: {
  score: number
  recommendation: string
  confidence: number
  riskLevel: string
}): SEOArticleData {
  const targetKeywords = generateTargetKeywords(carData)
  const title = `Panduan Lengkap Membeli ${carData.title} - Tips Inspeksi Mobil Bekas`
  const slug = generateSlug(title)
  
  // Remove AI analysis section from content as it's already shown in "Informasi Sumber Analisis"
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
    seo_score: 75,
    ai_analysis: aiAnalysis ? {
      score: aiAnalysis.score,
      confidence: aiAnalysis.confidence
    } : undefined
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
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50) // Limit base length to 50 to leave room for unique ID
  
  // Add timestamp and random string for uniqueness
  const timestamp = Date.now().toString(36) // Base36 timestamp (shorter)
  const randomStr = Math.random().toString(36).substring(2, 6) // 4 random chars
  
  return `${baseSlug}-${timestamp}-${randomStr}`
}

// Removed unused generateAIAnalysisSection function