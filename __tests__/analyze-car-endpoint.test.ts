import { NextRequest } from 'next/server'
import { POST } from '@/app/api/analyze-car/route'

// Mock dependencies
jest.mock('@/lib/scrapers')
jest.mock('@/lib/supabase')

describe('/api/analyze-car Endpoint - Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
    process.env.OPENAI_API_KEY = 'test-openai-key'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  
    delete process.env.OPENAI_API_KEY
  })

  describe('Response Time Performance', () => {
    test('completes analysis within acceptable time limit', async () => {
      // Mock scraper to return car data quickly
      const { scrapeCarFromUrl } = require('@/lib/scrapers')
      scrapeCarFromUrl.mockResolvedValue({
        title: 'Honda Jazz 2015 AT',
        price: 'Rp 150.000.000',
        year: '2015',
        mileage: '50.000 km',
        location: 'Jakarta Selatan',
        description: 'Mobil terawat, kondisi bagus',
        images: [
          'https://apollo.olx.co.id/v1/files/test1-ID/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/test2-ID/image;s=780x0;q=60',
          'https://apollo.olx.co.id/v1/files/test3-ID/image;s=780x0;q=60'
        ],
        specs: {}
      })

      // Mock AI analysis to return quickly
      const { analyzeImagesWithAI } = require('@/lib/scrapers')
      analyzeImagesWithAI.mockResolvedValue({
        score: 85,
        findings: ['Kondisi bagus', 'Cat masih baik'],
        recommendation: 'Mobil layak dibeli',
        confidence: 90,
        riskLevel: 'LOW',
        detailedAnalysis: {
          exterior: ['Kondisi cat baik'],
          interior: ['Interior bersih'],
          engine: ['Perlu inspeksi langsung'],
          overall: 'Mobil dalam kondisi baik'
        },
        backgroundStorageCarId: 'test-car-id',
        backgroundStorageStatus: 'processing'
      })

      // Mock database save
      const { DatabaseService } = require('@/lib/supabase')
      DatabaseService.getCarAnalysisByUrl.mockResolvedValue(null) // No cached data
      DatabaseService.saveCarAnalysis.mockResolvedValue({ id: 'test-id' })

      const request = new NextRequest('http://localhost:3000/api/analyze-car', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.olx.co.id/item/honda-jazz-2015-at'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const startTime = Date.now()
      const response = await POST(request)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      // Should complete within 15 seconds (much faster than previous 30s timeout)
      expect(responseTime).toBeLessThan(15000)
      
      // Should return successful response
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('carInfo')
      expect(data).toHaveProperty('score')
      expect(data).toHaveProperty('backgroundStorageCarId')
      expect(data._freshAnalysis).toBe(true)
    })

    test('returns cached results immediately when available', async () => {
      // Mock cached analysis
      const { DatabaseService } = require('@/lib/supabase')
      DatabaseService.getCarAnalysisByUrl.mockResolvedValue({
        car_data: {
          title: 'Honda Jazz 2015',
          price: 'Rp 150.000.000',
          year: '2015',
          mileage: '50.000 km',
          location: 'Jakarta',
          description: 'Mobil terawat',
          images: ['image1.jpg', 'image2.jpg'],
          specs: {}
        },
        ai_analysis: {
          score: 80,
          findings: ['Cached analysis'],
          recommendation: 'From cache',
          confidence: 85,
          riskLevel: 'LOW'
        },
        created_at: '2024-01-01T00:00:00Z'
      })

      const request = new NextRequest('http://localhost:3000/api/analyze-car', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.olx.co.id/item/honda-jazz-cached'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const startTime = Date.now()
      const response = await POST(request)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      // Cached response should be very fast (< 1 second)
      expect(responseTime).toBeLessThan(1000)
      
      const data = await response.json()
      expect(data._cached).toBe(true)
      expect(data._cacheDate).toBeDefined()
    })
  })

  describe('Response Structure Validation', () => {
    test('returns complete response structure for fresh analysis', async () => {
      // Setup mocks
      const { scrapeCarFromUrl, analyzeImagesWithAI } = require('@/lib/scrapers')
      const { DatabaseService } = require('@/lib/supabase')

      scrapeCarFromUrl.mockResolvedValue({
        title: 'Honda Jazz 2015',
        price: 'Rp 150.000.000',
        year: '2015',
        mileage: '50.000 km',
        location: 'Jakarta',
        description: 'Test car',
        images: ['image1.jpg', 'image2.jpg'],
        specs: { transmission: 'AT' }
      })

      analyzeImagesWithAI.mockResolvedValue({
        score: 85,
        findings: ['Good condition', 'Well maintained'],
        recommendation: 'Recommended for purchase',
        confidence: 90,
        riskLevel: 'LOW',
        scamRisk: {
          level: 'LOW',
          indicators: ['Good photos'],
          priceAnalysis: 'Fair price',
          photoQuality: 'High quality'
        },
        detailedAnalysis: {
          exterior: ['Good paint'],
          interior: ['Clean interior'],
          engine: ['Engine check needed'],
          photoQuality: ['High resolution'],
          overall: 'Good overall condition'
        },
        backgroundStorageCarId: 'bg-storage-id',
        backgroundStorageStatus: 'processing'
      })

      DatabaseService.getCarAnalysisByUrl.mockResolvedValue(null)
      DatabaseService.saveCarAnalysis.mockResolvedValue({ id: 'saved-id' })

      const request = new NextRequest('http://localhost:3000/api/analyze-car', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.olx.co.id/item/test-car'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      // Validate complete response structure
      expect(data).toEqual({
        carInfo: {
          title: 'Honda Jazz 2015',
          price: 'Rp 150.000.000',
          year: '2015',
          mileage: '50.000 km',
          location: 'Jakarta',
          description: 'Test car',
          images: ['image1.jpg', 'image2.jpg'],
          specs: { transmission: 'AT' }
        },
        score: 85,
        findings: ['Good condition', 'Well maintained'],
        recommendation: 'Recommended for purchase',
        confidence: 90,
        riskLevel: 'LOW',
        scamRisk: {
          level: 'LOW',
          indicators: ['Good photos'],
          priceAnalysis: 'Fair price',
          photoQuality: 'High quality'
        },
        detailedAnalysis: {
          exterior: ['Good paint'],
          interior: ['Clean interior'],
          engine: ['Engine check needed'],
          photoQuality: ['High resolution'],
          overall: 'Good overall condition'
        },
        analysis: {
          exterior: {
            score: 85,
            findings: ['Good condition', 'Well maintained'].slice(0, 2)
          },
          interior: {
            score: 80, // score - 5
            findings: expect.any(Array)
          },
          engine: {
            score: 75, // score - 10  
            findings: expect.arrayContaining([
              'Perlu inspeksi teknisi untuk kondisi mesin',
              'Analisis visual terbatas dari foto'
            ])
          }
        },
        estimatedValue: {
          min: expect.any(Number),
          max: expect.any(Number),
          fair: expect.any(Number)
        },
        backgroundStorageCarId: 'bg-storage-id',
        backgroundStorageStatus: 'processing',
        _cached: false,
        _freshAnalysis: true,
        _debug: {
          imagesStoredInSupabase: false,
          supabaseCarId: null,
          storedImageCount: 0,
          viewStoredImagesUrl: null
        }
      })
    })

    test('handles background storage failures gracefully', async () => {
      // Setup mocks with background storage failure
      const { scrapeCarFromUrl, analyzeImagesWithAI } = require('@/lib/scrapers')
      const { DatabaseService } = require('@/lib/supabase')

      scrapeCarFromUrl.mockResolvedValue({
        title: 'Honda Jazz 2015',
        price: 'Rp 150.000.000',
        year: '2015',
        mileage: '50.000 km',
        location: 'Jakarta',
        description: 'Test car',
        images: ['image1.jpg'],
        specs: {}
      })

      // Mock AI analysis with background storage that will fail
      analyzeImagesWithAI.mockImplementation(async () => {
        // Simulate the background process failing (but not blocking the response)
        setImmediate(() => {
          throw new Error('Background storage failed')
        })
        
        return {
          score: 75,
          findings: ['Analysis completed despite storage issues'],
          recommendation: 'AI analysis successful',
          confidence: 80,
          riskLevel: 'MEDIUM',
          detailedAnalysis: {
            exterior: ['Good'],
            interior: ['Fair'],
            engine: ['Unknown'],
            overall: 'Analysis complete'
          },
          backgroundStorageCarId: 'failed-storage-id',
          backgroundStorageStatus: 'processing'
        }
      })

      DatabaseService.getCarAnalysisByUrl.mockResolvedValue(null)
      DatabaseService.saveCarAnalysis.mockRejectedValue(new Error('DB save failed'))

      const request = new NextRequest('http://localhost:3000/api/analyze-car', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.olx.co.id/item/storage-fail-test'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      
      // Should still return 200 even if background processes fail
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.score).toBe(75)
      expect(data.backgroundStorageCarId).toBe('failed-storage-id')
    })
  })

  describe('Error Handling', () => {
    test('handles scraping failures gracefully', async () => {
      const { scrapeCarFromUrl } = require('@/lib/scrapers')
      scrapeCarFromUrl.mockRejectedValue(new Error('Scraping failed'))

      const request = new NextRequest('http://localhost:3000/api/analyze-car', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.olx.co.id/item/broken-page'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    test('validates URL before processing', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze-car', {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://facebook.com/marketplace/item'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('URL tidak didukung untuk analisis AI')
    })

    test('requires URL in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze-car', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('URL diperlukan')
    })
  })
})