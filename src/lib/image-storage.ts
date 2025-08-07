import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export class ImageStorageService {
  private static bucket = 'car-images'
  private static bucketInitialized = false

  /**
   * Ensure bucket exists before any operations
   */
  private static async ensureBucketExists(): Promise<void> {
    if (this.bucketInitialized) return
    
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error('Error checking buckets:', listError)
        throw listError
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucket)
      
      if (!bucketExists) {
        console.log(`Creating storage bucket: ${this.bucket}`)
        const { error: createError } = await supabase.storage.createBucket(this.bucket, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
        })
        
        if (createError) {
          console.error('Error creating bucket:', createError)
          throw createError
        }
        
        console.log(`✅ Storage bucket '${this.bucket}' created successfully`)
      }
      
      this.bucketInitialized = true
    } catch (error) {
      console.error('Failed to ensure bucket exists:', error)
      throw error
    }
  }
  
  /**
   * Download image from URL and upload to Supabase Storage
   */
  static async downloadAndStoreImage(imageUrl: string, carId: string, imageIndex: number): Promise<string> {
    try {
      // Ensure bucket exists before attempting upload
      await this.ensureBucketExists()
      // Download image from original URL with retry logic
      let response: Response
      let attempt = 0
      const maxAttempts = 3
      
      while (attempt < maxAttempts) {
        try {
          response = await fetch(imageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
              'Referer': this.getRefererForUrl(imageUrl),
            },
            signal: AbortSignal.timeout(15000)
          })
          
          if (response.ok) {
            break
          } else if (attempt === maxAttempts - 1) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
          }
        } catch (error) {
          attempt++
          if (attempt === maxAttempts) {
            throw error
          }
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }

      const imageBuffer = await response!.arrayBuffer()
      const contentType = response!.headers.get('content-type') || 'image/jpeg'
      
      // Upload to Supabase Storage with retry logic for filename conflicts
      const timestamp = Date.now()
      const fileExtension = this.getFileExtension(contentType, imageUrl)
      let uploadData, uploadError
      let uploadAttempt = 0
      const maxUploadAttempts = 3
      
      while (uploadAttempt < maxUploadAttempts) {
        // Generate unique filename with random component and attempt number
        const randomId = Math.random().toString(36).substring(2, 8)
        const fileName = `${carId}/img_${imageIndex}_${timestamp}_${randomId}_a${uploadAttempt}.${fileExtension}`

        const result = await supabase.storage
          .from(this.bucket)
          .upload(fileName, imageBuffer, {
            contentType,
            cacheControl: '3600',
            upsert: true // Allow overwriting if file exists
          })
          
        uploadData = result.data
        uploadError = result.error
        
        // If successful or non-conflict error, break the loop
        if (!uploadError || !uploadError.message.includes('already exists')) {
          break
        }
        
        uploadAttempt++
        // Short delay before retry
        await new Promise(resolve => setTimeout(resolve, 100 * uploadAttempt))
      }

      if (uploadError) {
        throw new Error(`Failed to upload to Supabase after ${maxUploadAttempts} attempts: ${uploadError.message}`)
      }

      // Get public URL using the final successful filename
      const finalFileName = uploadData?.path || `${carId}/img_${imageIndex}_${timestamp}.${fileExtension}`
      const { data: publicUrlData } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(finalFileName)

      return publicUrlData.publicUrl

    } catch (error) {
      console.error('Error storing image:', error)
      throw error
    }
  }

  /**
   * Download and store multiple images
   */
  static async downloadAndStoreImages(imageUrls: string[], carId: string): Promise<string[]> {
    const storedUrls: string[] = []
    const maxConcurrent = 3 // Limit concurrent downloads
    let totalAttempts = 0
    let successfulUploads = 0

    for (let i = 0; i < imageUrls.length; i += maxConcurrent) {
      const batch = imageUrls.slice(i, i + maxConcurrent)
      const batchPromises = batch.map((url, batchIndex) => {
        totalAttempts++
        return this.downloadAndStoreImage(url, carId, i + batchIndex).catch(error => {
          console.error(`Failed to store image ${i + batchIndex}:`, error.message)
          return null // Return null for failed uploads
        })
      })

      const batchResults = await Promise.all(batchPromises)
      const successfulBatchResults = batchResults.filter(url => url !== null) as string[]
      successfulUploads += successfulBatchResults.length
      storedUrls.push(...successfulBatchResults)
    }

    console.log(`Image storage summary: ${successfulUploads}/${totalAttempts} images stored successfully`)
    
    if (storedUrls.length === 0 && imageUrls.length > 0) {
      throw new Error(`Failed to store any images out of ${imageUrls.length} attempts. Check Supabase configuration and network connectivity.`)
    }

    return storedUrls
  }

  /**
   * Get appropriate referer header based on image URL
   */
  private static getRefererForUrl(imageUrl: string): string {
    if (imageUrl.includes('fbcdn.net')) {
      return 'https://www.facebook.com/'
    } else if (imageUrl.includes('icarcdn.com')) {
      return 'https://www.mobil123.com/'
    } else if (imageUrl.includes('apollo.olx.co.id')) {
      return 'https://www.olx.co.id/'
    }
    return 'https://www.google.com/'
  }

  /**
   * Get file extension from content type or URL
   */
  private static getFileExtension(contentType: string, url: string): string {
    // Try to get extension from content type
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg'
    if (contentType.includes('png')) return 'png'
    if (contentType.includes('webp')) return 'webp'
    if (contentType.includes('gif')) return 'gif'

    // Fallback to URL extension
    const urlExtension = url.split('.').pop()?.toLowerCase()
    if (urlExtension && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(urlExtension)) {
      return urlExtension
    }

    // Default to jpg
    return 'jpg'
  }

  /**
   * List stored images for a car
   */
  static async listCarImages(carId: string): Promise<{ name: string; url: string }[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .list(carId)

      if (error) {
        console.error('Error listing files:', error)
        return []
      }

      if (data && data.length > 0) {
        return data.map(file => ({
          name: file.name,
          url: supabase.storage.from(this.bucket).getPublicUrl(`${carId}/${file.name}`).data.publicUrl
        }))
      }

      return []
    } catch (error) {
      console.error('Error listing car images:', error)
      return []
    }
  }

  /**
   * Get all stored car folders
   */
  static async listAllCarFolders(): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .list('', {
          limit: 100,
          offset: 0
        })

      if (error) {
        console.error('Error listing folders:', error)
        return []
      }

      return data?.map(item => item.name).filter(name => name) || []
    } catch (error) {
      console.error('Error listing car folders:', error)
      return []
    }
  }

  /**
   * Clean up old images for a car (optional cleanup method)
   */
  static async cleanupCarImages(carId: string): Promise<void> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .list(carId)

      if (error) {
        console.error('Error listing files for cleanup:', error)
        return
      }

      if (data && data.length > 0) {
        const filesToDelete = data.map(file => `${carId}/${file.name}`)
        
        const { error: deleteError } = await supabase.storage
          .from(this.bucket)
          .remove(filesToDelete)

        if (deleteError) {
          console.error('Error deleting old files:', deleteError)
        } else {
          console.log(`✅ Cleaned up ${filesToDelete.length} images for car ${carId}`)
        }
      }
    } catch (error) {
      console.error('Error in cleanup:', error)
    }
  }

  /**
   * Initialize storage bucket (run once during setup)
   */
  static async initializeBucket(): Promise<void> {
    try {
      // Reset the initialization flag to force a fresh check
      this.bucketInitialized = false
      await this.ensureBucketExists()
      console.log('✅ Storage bucket initialized successfully')
    } catch (error) {
      console.error('❌ Error initializing bucket:', error)
      throw error
    }
  }
}