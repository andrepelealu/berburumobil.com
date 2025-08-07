import { NextRequest, NextResponse } from 'next/server'
import { scrapeCarFromUrl, analyzeImagesWithAI, type CarData } from '@/lib/scrapers'
import { DatabaseService } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL diperlukan' }, { status: 400 })
    }

    // Sanitize and validate URL
    const sanitizedUrl = url.trim().substring(0, 1000)
    
    // Validate URL format and domain
    try {
      const parsedUrl = new URL(sanitizedUrl)
      const allowedDomains = ['olx.co.id', 'www.olx.co.id', 'mobil123.com', 'www.mobil123.com']
      
      if (!allowedDomains.some(domain => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain))) {
        return NextResponse.json({ 
          error: 'URL tidak didukung untuk analisis AI',
          details: 'Hanya link dari OLX.co.id dan Mobil123.com yang didukung untuk analisis AI otomatis.'
        }, { status: 400 })
      }
      
      if (parsedUrl.protocol !== 'https:') {
        return NextResponse.json({ error: 'URL harus menggunakan HTTPS' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Format URL tidak valid' }, { status: 400 })
    }

    // Check if we have a cached analysis for this URL first
    try {
      // Only try cache lookup if Supabase is properly configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase')) {
        
        const cachedAnalysis = await DatabaseService.getCarAnalysisByUrl(sanitizedUrl)
        if (cachedAnalysis) {
          // Return cached result in the same format as fresh analysis
          const result = {
            carInfo: {
              title: cachedAnalysis.car_data.title,
              price: cachedAnalysis.car_data.price,
              year: cachedAnalysis.car_data.year,
              mileage: cachedAnalysis.car_data.mileage,
              location: cachedAnalysis.car_data.location,
              description: cachedAnalysis.car_data.description,
              images: cachedAnalysis.car_data.images,
              specs: cachedAnalysis.car_data.specs
            },
            ...cachedAnalysis.ai_analysis,
            _cached: true,
            _cacheDate: cachedAnalysis.created_at
          }
          
          return NextResponse.json(result)
        }
      }
    } catch (cacheError) {
      console.log('Cache check failed, proceeding with fresh analysis:', cacheError)
    }
    
    // Scrape car data from the provided URL
    const carData = await scrapeCarFromUrl(sanitizedUrl)
    console.log('Scraped car data:', {
      title: carData.title,
      price: carData.price,
      imageCount: carData.images.length,
      images: carData.images.slice(0, 3) // Log first 3 images
    })
    
    // Analyze images with AI
    const aiAnalysis = await analyzeImagesWithAI(carData.images, carData.title)
    console.log('AI Analysis complete:', {
      score: aiAnalysis.score,
      confidence: aiAnalysis.confidence,
      riskLevel: aiAnalysis.riskLevel,
      hasDetailedAnalysis: !!aiAnalysis.detailedAnalysis,
      recommendationLength: aiAnalysis.recommendation?.length || 0
    })
    
    // Combine the data
    const analysisResult = {
      exterior: {
        score: aiAnalysis.score,
        findings: aiAnalysis.findings.slice(0, 2)
      },
      interior: {
        score: Math.max(aiAnalysis.score - 5, 60),
        findings: aiAnalysis.findings.slice(2, 4) || ['Perlu inspeksi langsung']
      },
      engine: {
        score: Math.max(aiAnalysis.score - 10, 50),
        findings: ['Perlu inspeksi teknisi untuk kondisi mesin', 'Analisis visual terbatas dari foto']
      }
    }

    const finalAnalysis = {
      score: aiAnalysis.score,
      findings: aiAnalysis.findings,
      recommendation: aiAnalysis.recommendation,
      confidence: aiAnalysis.confidence,
      riskLevel: aiAnalysis.riskLevel,
      detailedAnalysis: aiAnalysis.detailedAnalysis,
      analysis: analysisResult,
      estimatedValue: calculateEstimatedValue(carData)
    }

    // Save to Supabase database
    try {
      const userIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

      const savedAnalysis = await DatabaseService.saveCarAnalysis({
        car_url: sanitizedUrl,
        car_data: carData,
        ai_score: aiAnalysis.score,
        ai_analysis: finalAnalysis,
        user_ip: userIp
      })

      console.log('Analysis saved to database:', savedAnalysis.id)

      // Generate SEO blog article asynchronously in background (all environments)
      // This runs independently and doesn't affect user response time
      const isRealAiAnalysis = aiAnalysis.confidence > 0 && 
                               !aiAnalysis.recommendation.includes('DATA SIMULASI') &&
                               !aiAnalysis.recommendation.includes('ANALISIS SIMULASI')
      
      if (isRealAiAnalysis || process.env.NODE_ENV === 'development') {
        // Generate blog article asynchronously in background
        // In development, generate for all analysis (even mock data)
        setImmediate(() => {
          generateBlogArticle(url, carData, aiAnalysis).catch(error => {
            console.error('Background blog generation failed:', error)
          })
        })
      }

    } catch (dbError) {
      console.error('Failed to save to database:', dbError)
      // Continue without failing the request
    }

    const result = {
      carInfo: {
        title: carData.title,
        price: carData.price,
        year: carData.year,
        mileage: carData.mileage,
        location: carData.location,
        description: carData.description,
        images: carData.images,
        specs: carData.specs
      },
      ...finalAnalysis,
      _cached: false,
      _freshAnalysis: true,
      // Add storage information for debugging/inspection
      _debug: {
        imagesStoredInSupabase: false,
        supabaseCarId: null,
        storedImageCount: 0,
        viewStoredImagesUrl: null
      }
    }
    
    console.log('Final API response structure:', {
      hasCarInfo: !!result.carInfo,
      score: result.score,
      confidence: result.confidence,
      riskLevel: result.riskLevel,
      recommendationLength: result.recommendation?.length || 0,
      hasDetailedAnalysis: !!result.detailedAnalysis,
      findingsCount: result.findings?.length || 0
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error analyzing car:', error)
    
    // Return user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Gagal menganalisis mobil'
    return NextResponse.json({ 
      error: errorMessage,
      details: 'Pastikan link valid dan dapat diakses. Beberapa platform mungkin memerlukan akses khusus.'
    }, { status: 500 })
  }
}

function calculateEstimatedValue(carData: CarData): {
  min: number
  max: number
  fair: number
} {
  // Extract price from string (remove Rp, dots, commas)
  const priceMatch = carData.price.match(/[\d,\.]+/)
  const basePrice = priceMatch ? 
    parseInt(priceMatch[0].replace(/[,\.]/g, '')) : 150000000

  // Adjust based on year
  const currentYear = new Date().getFullYear()
  const carYear = parseInt(carData.year) || currentYear - 5
  const ageAdjustment = Math.max(0.7, 1 - (currentYear - carYear) * 0.05)

  // Mileage adjustment
  const mileageMatch = carData.mileage.match(/[\d,\.]+/)
  const mileage = mileageMatch ? 
    parseInt(mileageMatch[0].replace(/[,\.]/g, '')) : 50000
  const mileageAdjustment = Math.max(0.8, 1 - (mileage / 100000) * 0.1)

  const adjustedPrice = basePrice * ageAdjustment * mileageAdjustment

  return {
    min: Math.round(adjustedPrice * 0.9),
    max: Math.round(adjustedPrice * 1.1), 
    fair: Math.round(adjustedPrice)
  }
}

async function generateBlogArticle(carUrl: string, carData: CarData, aiAnalysis?: {
  score: number
  recommendation: string
  confidence: number
  riskLevel: string
}) {
  try {
    // Background blog generation - runs silently
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'production' ? 'https://berburumobil.com' : 'http://localhost:3000')
    
    const response = await fetch(`${baseUrl}/api/blog/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        carUrl,
        carData,
        aiAnalysis
      }),
      // Add timeout for background requests
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    // Check response and handle blog generation in all environments
    if (!response.ok) {
      console.error('Background blog generation HTTP error:', response.status)
      return
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Background blog generation returned non-JSON response')
      return
    }

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Background blog article generated:', result.article.slug)
    } else {
      console.error('Background blog generation failed:', result.error)
    }
  } catch (error) {
    // Log errors in all environments for debugging
    console.error('Background blog generation error:', error)
  }
}