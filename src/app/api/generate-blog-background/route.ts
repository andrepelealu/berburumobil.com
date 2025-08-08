import { NextRequest, NextResponse } from 'next/server'
import { generateBlogArticleInternal } from '@/lib/blog-generator'

export const maxDuration = 45; // Dedicated timeout for blog generation

export async function POST(request: NextRequest) {
  try {
    const { carUrl, carData, aiAnalysis } = await request.json()

    if (!carUrl || !carData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required data' 
      }, { status: 400 })
    }

    // Generate blog article
    const result = await generateBlogArticleInternal({
      carUrl,
      carData,
      aiAnalysis
    })

    return NextResponse.json({
      success: result.success,
      articleSlug: result.article?.slug,
      error: result.error
    })

  } catch (error) {
    console.error('Background blog generation failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ 
      success: false, 
      error: 'Blog generation failed' 
    }, { status: 500 })
  }
}