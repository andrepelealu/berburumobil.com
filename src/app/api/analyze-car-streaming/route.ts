import { NextRequest } from 'next/server'
import { scrapeCarFromUrl, analyzeImagesWithAI, type CarData } from '@/lib/scrapers'
import { DatabaseService } from '@/lib/supabase'
import { trackAIAnalysis, getClientIP, getPlatformFromUrl } from '@/lib/analytics'
import { generateBlogArticleInternal } from '@/lib/blog-generator'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const startTime = Date.now()
      let sanitizedUrl = ''
      
      try {
        const { url } = await request.json()

        if (!url || typeof url !== 'string') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'URL diperlukan' })}\n\n`))
          controller.close()
          return
        }

        sanitizedUrl = url.trim().substring(0, 1000)
        
        // Send initial status
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'scraping' })}\n\n`))
        
        // Your existing scraping and AI analysis logic...
        const carData = await scrapeCarFromUrl(sanitizedUrl)
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'analyzing' })}\n\n`))
        
        const aiAnalysis = await analyzeImagesWithAI(carData.images, carData.title)
        
        // Send main result
        const result = {
          carInfo: { /* your car info */ },
          ...aiAnalysis
        }
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'complete', result })}\n\n`))
        
        // Now generate blog in background while keeping connection alive
        const isRealAiAnalysis = aiAnalysis.confidence > 0 && 
                               !aiAnalysis.recommendation.includes('DATA SIMULASI')
        
        if (isRealAiAnalysis) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'generating_blog' })}\n\n`))
          
          try {
            await generateBlogArticleInternal({
              carUrl: sanitizedUrl,
              carData,
              aiAnalysis
            })
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'blog_complete' })}\n\n`))
          } catch (error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'blog_failed' })}\n\n`))
          }
        }
        
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' })}\n\n`))
      }
      
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}