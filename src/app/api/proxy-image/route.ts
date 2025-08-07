import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      return new NextResponse('Missing image URL', { status: 400 })
    }

    // Sanitize URL
    const sanitizedUrl = imageUrl.trim().substring(0, 1000)

    // Strict URL validation
    let parsedUrl: URL
    try {
      parsedUrl = new URL(sanitizedUrl)
    } catch {
      return new NextResponse('Invalid URL format', { status: 400 })
    }

    // Only allow HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return new NextResponse('Only HTTPS URLs are allowed', { status: 400 })
    }

    // Strict domain whitelist - exact matches only
    const allowedDomains = [
      'apollo.olx.co.id',
      'img.icarcdn.com',
      'img1.icarcdn.com', 
      'img2.icarcdn.com',
      'img3.icarcdn.com',
      'img4.icarcdn.com',
      'img5.icarcdn.com',
      'mobil123.icarcdn.com'
    ]
    
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      return new NextResponse(`Unsupported domain: ${parsedUrl.hostname}`, { status: 400 })
    }

    // Prevent path traversal
    if (parsedUrl.pathname.includes('..') || parsedUrl.pathname.includes('//')) {
      return new NextResponse('Invalid URL path', { status: 400 })
    }

    // Determine the appropriate referer based on the image domain
    let referer = 'https://www.olx.co.id/'
    let origin = 'https://www.olx.co.id'
    
    if (imageUrl.includes('icarcdn.com')) {
      referer = 'https://www.mobil123.com/'
      origin = 'https://www.mobil123.com'
    } else if (imageUrl.includes('fbcdn.net')) {
      referer = 'https://www.facebook.com/'
      origin = 'https://www.facebook.com'
    }

    // Fetch the image with proper headers
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': referer,
        'Origin': origin,
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      cache: 'force-cache'
    })

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`)
      return new NextResponse('Failed to fetch image', { status: imageResponse.status })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
        'Access-Control-Allow-Origin': '*',
        'Content-Length': imageBuffer.byteLength.toString()
      }
    })

  } catch (error) {
    console.error('Image proxy error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}