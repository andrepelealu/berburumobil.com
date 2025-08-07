import { NextRequest, NextResponse } from 'next/server'
import { ImageStorageService } from '@/lib/image-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const carId = searchParams.get('carId')
    
    if (carId) {
      // Get images for specific car
      const images = await ImageStorageService.listCarImages(carId)
      
      return NextResponse.json({
        success: true,
        carId,
        images,
        count: images.length
      })
    } else {
      // List all car folders
      const folders = await ImageStorageService.listAllCarFolders()
      
      return NextResponse.json({
        success: true,
        message: 'All stored car image folders',
        folders,
        count: folders.length,
        note: 'Use ?carId=<folder_name> to see images for a specific car'
      })
    }
    
  } catch (error) {
    console.error('Error retrieving stored images:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to retrieve stored images from Supabase'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const carId = searchParams.get('carId')
    
    if (!carId) {
      return NextResponse.json({
        success: false,
        error: 'carId parameter is required for deletion'
      }, { status: 400 })
    }
    
    // Clean up images for the specified car
    await ImageStorageService.cleanupCarImages(carId)
    
    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up images for car: ${carId}`,
      carId
    })
    
  } catch (error) {
    console.error('Error cleaning up images:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to clean up images'
    }, { status: 500 })
  }
}