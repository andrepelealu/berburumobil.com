import { NextRequest, NextResponse } from 'next/server'
import { scrapeCarFromUrl, analyzeImagesWithAI, type CarData } from '@/lib/scrapers'
import { DatabaseService } from '@/lib/supabase'
import { trackAIAnalysis, getClientIP, getPlatformFromUrl } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let sanitizedUrl = ''
  
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL diperlukan' }, { status: 400 })
    }

    // Sanitize and validate URL
    sanitizedUrl = url.trim().substring(0, 1000)
    
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
    const cacheStartTime = Date.now()
    try {
      // Only try cache lookup if Supabase is properly configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase')) {
        
        const cachedAnalysis = await DatabaseService.getCarAnalysisByUrl(sanitizedUrl)
        const _cacheTime = Date.now() - cacheStartTime
        
        if (cachedAnalysis) {
          const totalTime = Date.now() - startTime
          
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
            _cacheDate: cachedAnalysis.created_at,
            _responseTime: `${(totalTime/1000).toFixed(2)}s`
          }
          
          return NextResponse.json(result)
        }
      }
    } catch (_cacheError) {
      // Continue with fresh analysis if cache fails
    }
    
    // Scrape car data from the provided URL
    const scrapeStartTime = Date.now()
    const carData = await scrapeCarFromUrl(sanitizedUrl)
    const _scrapeTime = Date.now() - scrapeStartTime
    
    // Analyze images with AI
    const aiStartTime = Date.now()
    const aiAnalysis = await analyzeImagesWithAI(carData.images, carData.title)
    const _aiAnalysisTime = Date.now() - aiStartTime
    
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
    const dbStartTime = Date.now()
    try {
      const userIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

      const _savedAnalysis = await DatabaseService.saveCarAnalysis({
        car_url: sanitizedUrl,
        car_data: carData,
        ai_score: aiAnalysis.score,
        ai_analysis: finalAnalysis,
        user_ip: userIp
      })

      const _dbSaveTime = Date.now() - dbStartTime

      // Generate SEO blog article asynchronously in background (all environments)
      // This runs independently and doesn't affect user response time
      const isRealAiAnalysis = aiAnalysis.confidence > 0 && 
                               !aiAnalysis.recommendation.includes('DATA SIMULASI') &&
                               !aiAnalysis.recommendation.includes('ANALISIS SIMULASI')
      
      // Always generate blog articles when analysis is successful
      if (isRealAiAnalysis) {
        // Trigger background blog generation via webhook (non-blocking)
        const host = request.headers.get('host')
        const protocol = request.headers.get('x-forwarded-proto') || 'http'
        const baseUrl = host ? `${protocol}://${host}` : 'http://localhost:3000'
        
        fetch(`${baseUrl}/api/generate-blog-background`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            carUrl: sanitizedUrl,
            carData,
            aiAnalysis
          })
        }).catch(() => {
          // Silent failure for background blog generation
        })
      }

    } catch (_dbError) {
      const _dbSaveTime = Date.now() - dbStartTime
      // Continue without failing the request - silent database failure
    }

    const totalTime = Date.now() - startTime
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
      _responseTime: `${(totalTime/1000).toFixed(2)}s`,
      // Add storage information for debugging/inspection
      _debug: {
        imagesStoredInSupabase: false,
        supabaseCarId: null,
        storedImageCount: 0,
        viewStoredImagesUrl: null
      }
    }
    
    // Performance tracking removed for production
    
    // Track AI analysis in analytics
    try {
      const clientIP = getClientIP(request)
      const platform = getPlatformFromUrl(sanitizedUrl)
      const userAgent = request.headers.get('user-agent') || undefined
      
      await trackAIAnalysis(
        sanitizedUrl,
        platform,
        true, // success
        totalTime,
        result.score,
        result.confidence,
        undefined, // no error message
        userAgent,
        clientIP || undefined
      )
    } catch (_analyticsError) {
      // Silent analytics failure
    }
    
    return NextResponse.json(result)
  } catch (error) {
    const totalTime = Date.now() - startTime
    // Log only critical errors for production monitoring
    console.error('Car analysis failed:', error instanceof Error ? error.message : 'Unknown error')
    
    // Track failed AI analysis in analytics
    try {
      const clientIP = getClientIP(request)
      const platform = getPlatformFromUrl(sanitizedUrl || '')
      const userAgent = request.headers.get('user-agent') || undefined
      const errorMessage = error instanceof Error ? error.message : 'Gagal menganalisis mobil'
      
      await trackAIAnalysis(
        sanitizedUrl || 'unknown',
        platform,
        false, // failed
        totalTime,
        undefined, // no score
        undefined, // no confidence
        errorMessage,
        userAgent,
        clientIP || undefined
      )
    } catch (_analyticsError) {
      // Silent analytics failure
    }
    
    // Return user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Gagal menganalisis mobil'
    return NextResponse.json({ 
      error: errorMessage,
      details: 'Pastikan link valid dan dapat diakses. Beberapa platform mungkin memerlukan akses khusus.',
      _responseTime: `${(totalTime/1000).toFixed(2)}s`
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

// Blog generation moved to separate webhook endpoint for Vercel compatibility