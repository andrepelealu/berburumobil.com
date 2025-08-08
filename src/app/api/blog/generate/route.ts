import { NextRequest, NextResponse } from 'next/server'
import { generateBlogArticleInternal } from '@/lib/blog-generator'

export async function POST(request: NextRequest) {
  try {
    // Blog generation request received
    
    const { carUrl, carData } = await request.json()

    const result = await generateBlogArticleInternal({ carUrl, carData })
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Blog API error:', error instanceof Error ? error.message : 'Unknown error')
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal memproses request blog', 
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    )
  }
}

