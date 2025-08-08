import { analyzeImagesWithAI, scrapeCarFromUrl } from '@/lib/scrapers'

// Mock dependencies
jest.mock('openai')
jest.mock('@/lib/image-storage', () => ({
  ImageStorageService: {
    downloadAndStoreImages: jest.fn().mockResolvedValue(['stored1.jpg', 'stored2.jpg'])
  }
}))

describe('Analyze Car API - Optimized Version', () => {
  describe('analyzeImagesWithAI - Direct URL Analysis', () => {
    const mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }

    beforeEach(() => {
      jest.clearAllMocks()
      // Mock the setImmediate for background processes
      global.setImmediate = jest.fn((fn) => {
        setTimeout(fn, 0)
        return {} as any
      }) as any
      
      // Reset environment
      process.env.OPENAI_API_KEY = 'test-key'
      
      // Mock OpenAI constructor properly
      const { OpenAI } = require('openai')
      OpenAI.mockImplementation(() => mockOpenAI)
    })

    afterEach(() => {
      delete process.env.OPENAI_API_KEY
    })

    test('returns mock analysis when OpenAI API key is not provided', async () => {
      delete process.env.OPENAI_API_KEY // Remove API key for this test
      
      const images = ['https://example.com/car1.jpg', 'https://example.com/car2.jpg']
      const carTitle = 'Honda Jazz 2015'

      const result = await analyzeImagesWithAI(images, carTitle)

      expect(result).toEqual(expect.objectContaining({
        score: expect.any(Number),
        findings: expect.arrayContaining([
          expect.stringContaining('ANALISIS SIMULASI')
        ]),
        recommendation: expect.stringContaining('DATA SIMULASI'),
        confidence: 85,
        riskLevel: expect.any(String),
        detailedAnalysis: expect.objectContaining({
          exterior: expect.arrayContaining([expect.stringContaining('DATA SIMULASI')]),
          interior: expect.arrayContaining([expect.stringContaining('DATA SIMULASI')]),
          engine: expect.arrayContaining([expect.stringContaining('DATA SIMULASI')]),
          overall: expect.stringContaining('ANALISIS SIMULASI')
        })
      }))

      // Should not call background storage or OpenAI when no API key
      expect(global.setImmediate).not.toHaveBeenCalled()
    })

    test('uses direct image URLs for immediate AI analysis', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'
      
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 85,
              confidence: 90,
              riskLevel: 'LOW',
              findings: ['Kondisi bagus', 'Cat masih baik', 'Interior terawat'],
              recommendation: 'Mobil dalam kondisi baik untuk pembelian',
              scamRisk: {
                level: 'LOW',
                indicators: ['Foto berkualitas baik'],
                priceAnalysis: 'Harga wajar untuk kondisi',
                photoQuality: 'Foto lengkap dan jelas'
              },
              detailedAnalysis: {
                exterior: ['Kondisi cat baik'],
                interior: ['Interior bersih'],
                engine: ['Perlu inspeksi langsung'],
                photoQuality: ['Foto berkualitas tinggi'],
                overall: 'Kondisi mobil terlihat baik'
              }
            })
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      const images = [
        'https://apollo.olx.co.id/v1/files/test1-ID/image;s=780x0;q=60',
        'https://apollo.olx.co.id/v1/files/test2-ID/image;s=780x0;q=60',
        'https://apollo.olx.co.id/v1/files/test3-ID/image;s=780x0;q=60'
      ]
      const carTitle = 'Honda Jazz 2015'

      const result = await analyzeImagesWithAI(images, carTitle)

      // Should call OpenAI with direct URLs
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.arrayContaining([
                { type: 'text', text: expect.stringContaining('Honda Jazz 2015') },
                ...images.map(url => ({
                  type: 'image_url',
                  image_url: { url, detail: 'high' }
                }))
              ])
            })
          ])
        })
      )

      // Should initiate background storage
      expect(global.setImmediate).toHaveBeenCalledWith(expect.any(Function))

      // Should return proper analysis structure
      expect(result).toEqual(expect.objectContaining({
        score: 85,
        confidence: 90,
        riskLevel: 'LOW',
        findings: expect.arrayContaining(['Kondisi bagus']),
        recommendation: 'Mobil dalam kondisi baik untuk pembelian',
        backgroundStorageCarId: expect.any(String),
        backgroundStorageStatus: 'processing'
      }))
    })

    test('handles OpenAI API errors gracefully', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'
      
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('OpenAI API Error'))

      const images = ['https://example.com/car1.jpg']
      const carTitle = 'Honda Jazz 2015'

      const result = await analyzeImagesWithAI(images, carTitle)

      // Should return fallback analysis
      expect(result).toEqual(expect.objectContaining({
        score: expect.any(Number),
        confidence: expect.any(Number),
        riskLevel: 'HIGH',
        findings: expect.arrayContaining([
          expect.stringContaining('Analisis terbatas')
        ]),
        recommendation: expect.stringContaining('PERINGATAN')
      }))
    })

    test('handles JSON parsing errors from OpenAI response', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'
      
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response from OpenAI'
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      const images = ['https://example.com/car1.jpg']
      const carTitle = 'Honda Jazz 2015'

      const result = await analyzeImagesWithAI(images, carTitle)

      // Should return text analysis fallback
      expect(result).toEqual(expect.objectContaining({
        score: expect.any(Number),
        confidence: expect.any(Number),
        riskLevel: 'HIGH',
        recommendation: expect.stringContaining('PERHATIAN')
      }))
    })

    test('processes maximum 15 images for optimal balance', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'
      
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 85,
              confidence: 95,
              riskLevel: 'LOW',
              findings: ['Foto sangat lengkap'],
              recommendation: 'Analisis komprehensif dengan foto lengkap',
              detailedAnalysis: {
                exterior: ['Kondisi bagus'],
                interior: ['Terawat'],
                engine: ['Perlu inspeksi'],
                overall: 'Sangat baik'
              }
            })
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      // Provide 20 images, should only use first 15
      const manyImages = Array.from({ length: 20 }, (_, i) => 
        `https://apollo.olx.co.id/v1/files/test${i}-ID/image;s=780x0;q=60`
      )
      
      const carTitle = 'Honda Jazz 2015'

      const result = await analyzeImagesWithAI(manyImages, carTitle)

      // Should call OpenAI with exactly 15 images
      const openAICall = mockOpenAI.chat.completions.create.mock.calls[0][0]
      const userMessage = openAICall.messages.find((m: any) => m.role === 'user')
      const imageContent = userMessage.content.filter((c: any) => c.type === 'image_url')
      
      expect(imageContent).toHaveLength(15)
      expect(result.confidence).toBe(95) // High confidence due to many images
    })

    test('adjusts confidence based on image count', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'
      
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 75,
              confidence: 70,
              riskLevel: 'MEDIUM',
              findings: ['Foto terbatas'],
              recommendation: 'Perlu foto lebih banyak',
              detailedAnalysis: {
                exterior: ['Terlihat baik'],
                interior: ['Tidak jelas'],
                engine: ['Tidak terlihat'],
                overall: 'Terbatas'
              }
            })
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      // Test with few images
      const fewImages = [
        'https://apollo.olx.co.id/v1/files/test1-ID/image;s=780x0;q=60',
        'https://apollo.olx.co.id/v1/files/test2-ID/image;s=780x0;q=60'
      ]
      
      const result = await analyzeImagesWithAI(fewImages, 'Honda Jazz 2015')

      // Confidence should be adjusted down due to fewer images
      expect(result.confidence).toBeLessThan(70) // Should be capped lower for few images
    })

    test('filters out invalid image URLs', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'
      
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 80,
              confidence: 85,
              riskLevel: 'LOW',
              findings: ['Analisis dari foto valid'],
              recommendation: 'Kondisi baik',
              detailedAnalysis: {
                exterior: ['Bagus'],
                interior: ['Baik'],  
                engine: ['Perlu cek'],
                overall: 'Baik'
              }
            })
          }
        }]
      }

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)

      const mixedImages = [
        'https://apollo.olx.co.id/v1/files/valid1-ID/image;s=780x0;q=60', // Valid
        'placeholder.jpg', // Invalid - placeholder
        'https://apollo.olx.co.id/v1/files/valid2-ID/image;s=780x0;q=60', // Valid
        'logo.png', // Invalid - logo
        '', // Invalid - empty
        'https://apollo.olx.co.id/v1/files/valid3-ID/image;s=780x0;q=60' // Valid
      ]

      const result = await analyzeImagesWithAI(mixedImages, 'Honda Jazz 2015')

      // Should only process 3 valid images
      const openAICall = mockOpenAI.chat.completions.create.mock.calls[0][0]
      const userMessage = openAICall.messages.find((m: any) => m.role === 'user')
      const imageContent = userMessage.content.filter((c: any) => c.type === 'image_url')
      
      expect(imageContent).toHaveLength(3)
      expect(result.score).toBe(80)
    })
  })

  describe('Background Storage Integration', () => {
    test('initiates background storage without blocking response', async () => {
      const mockSetImmediate = jest.fn((callback) => {
        // Don't actually execute the callback to avoid async complications
        return {} as any
      })
      global.setImmediate = mockSetImmediate

      process.env.OPENAI_API_KEY = 'test-api-key'

      const OpenAIModule = require('openai')
      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: JSON.stringify({
                    score: 80,
                    confidence: 85,
                    riskLevel: 'LOW',
                    findings: ['Test finding'],
                    recommendation: 'Test recommendation',
                    detailedAnalysis: {
                      exterior: ['Good'],
                      interior: ['Fair'],
                      engine: ['Unknown'],
                      overall: 'Good'
                    }
                  })
                }
              }]
            })
          }
        }
      }
      OpenAIModule.OpenAI = jest.fn().mockImplementation(() => mockOpenAI)

      const images = ['https://example.com/car1.jpg']
      const carTitle = 'Honda Jazz 2015'

      const startTime = Date.now()
      const result = await analyzeImagesWithAI(images, carTitle)
      const endTime = Date.now()

      // Should complete quickly (not wait for background storage)
      expect(endTime - startTime).toBeLessThan(1000)
      
      // Should have initiated background storage
      expect(mockSetImmediate).toHaveBeenCalledWith(expect.any(Function))
      
      // Should include background storage info
      expect(result.backgroundStorageCarId).toBeDefined()
      expect(result.backgroundStorageStatus).toBe('processing')
    })
  })
})