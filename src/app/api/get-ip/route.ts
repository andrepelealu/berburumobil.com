import { NextRequest, NextResponse } from 'next/server'
import { getClientIP } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    
    return NextResponse.json({ 
      ip: ip || 'unknown',
      success: true 
    })
  } catch (error) {
    console.error('Error getting client IP:', error)
    return NextResponse.json({ 
      ip: 'unknown',
      success: false,
      error: 'Failed to get IP address'
    })
  }
}