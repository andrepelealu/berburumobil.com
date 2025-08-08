import axios from 'axios'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'
import { cleanCarData, extractYearFromTitle, cleanAndFormatPrice } from './utils'
import { ImageStorageService } from './image-storage'
import crypto from 'crypto'

export interface CarData {
  title: string
  price: string
  year: string
  mileage: string
  location: string
  description: string
  images: string[]
  specs?: {
    transmission?: string
    fuelType?: string
    color?: string
    engine?: string
  }
}

export async function scrapeCarFromUrl(url: string): Promise<CarData> {
  // Strict URL validation - only allow detail pages from supported platforms
  const supportedPatterns = [
    // OLX detail pages only
    { pattern: /^https?:\/\/(www\.)?olx\.co\.id\/item\/.+$/i, platform: 'OLX' },
    // Mobil123 detail pages only  
    { pattern: /^https?:\/\/(www\.)?mobil123\.com\/(dijual|mobil-bekas)\/.+$/i, platform: 'Mobil123' }
  ]
  
  const matchedPlatform = supportedPatterns.find(p => p.pattern.test(url))
  
  if (!matchedPlatform) {
    throw new Error(
      `🚫 URL tidak didukung! Saat ini kami hanya dapat menganalisis mobil dari:\n\n` +
      `✅ OLX: https://www.olx.co.id/item/[listing-id]\n` +
      `✅ Mobil123: https://www.mobil123.com/dijual/[car-details]\n\n` +
      `❌ Facebook Marketplace sementara tidak tersedia karena keterbatasan teknis.\n\n` +
      `🔧 SOLUSI: Untuk mobil di Facebook Marketplace, kami menyediakan layanan INSPEKSI LANGSUNG oleh teknisi berpengalaman. Inspeksi manual ini jauh lebih akurat daripada analisis otomatis!\n\n` +
      `💡 Hubungi kami untuk jadwal inspeksi profesional ke lokasi mobil.`
    )
  }
  
  const domain = new URL(url).hostname.toLowerCase()
  
  if (domain.includes('olx')) {
    return await scrapeOLX(url)
  } else if (domain.includes('mobil123')) {
    return await scrapeMobil123(url)
  } else {
    // This should not happen due to validation above, but keeping as fallback
    throw new Error(
      `🚫 Platform tidak didukung: ${domain}\n\n` +
      `✅ Gunakan link dari OLX atau Mobil123 saja\n` +
      `🔧 Untuk platform lain, gunakan layanan inspeksi manual kami`
    )
  }
}

async function scrapeOLX(url: string): Promise<CarData> {
  try {
    // Try Cheerio first (faster, less resource intensive)
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000
      })

      const $ = cheerio.load(response.data)
      
      // Extract basic info using common selectors
      const title = $('h1, [data-cy="ad_title"], .ad-title, title').first().text().trim() || 
                   $('meta[property="og:title"]').attr('content') || 'Tidak ditemukan'
      
      // Enhanced price extraction for OLX - Updated approach
      let price = 'Tidak ditemukan'
      
      // Try multiple OLX-specific selectors in order of specificity
      const priceSelectors = [
        '[data-aut-id="itemPrice"]',
        '[data-testid="ad-price"]', 
        '.notranslate[data-aut-id="itemPrice"]',
        '[data-testid="price"]',
        '.rui-2Pidb',
        '.price',
        '.ad-price',
        '[class*="Price"]',
        '[class*="price"]',
        'span[class*="price"]',
        'div[class*="price"]'
      ]

      for (const selector of priceSelectors) {
        const priceElement = $(selector)
        if (priceElement.length > 0) {
          const priceText = priceElement.text().trim()
          if (priceText && (priceText.includes('Rp') || priceText.includes('RP')) && /\d/.test(priceText)) {
            price = priceText
            break
          }
        }
      }

      // If still not found, search in meta tags
      if (price === 'Tidak ditemukan') {
        const ogPrice = $('meta[property="product:price:amount"]').attr('content') ||
                       $('meta[property="og:price:amount"]').attr('content')
        if (ogPrice) {
          price = `Rp ${ogPrice}`
        }
      }

      // Broader search if still not found
      if (price === 'Tidak ditemukan') {
        $('*').each((_, element) => {
          const text = $(element).text().trim()
          // Look for price patterns: Rp followed by numbers
          if (text.match(/^(Rp|RP)\s*[\d,\.]+/) && text.length < 100) {
            // Verify it's not part of a larger text block
            const elementText = $(element).text().trim()
            if (elementText.length < 50 && !elementText.includes('\n')) {
              price = text
              return false // break
            }
          }
        })
      }

      // Clean and format the price
      price = cleanAndFormatPrice(price)

      const location = $('[data-cy="ad_location"], .location, .ad-location, [class*="location"]').first().text().trim() || 'Tidak ditemukan'
      
      const description = $('[data-cy="ad_description"], .description, .ad-description, [class*="description"]').first().text().trim() || 
                         $('meta[property="og:description"]').attr('content') || 'Tidak ditemukan'

      // Enhanced OLX image extraction - prioritize JSON data from slider
      const images: string[] = []
      const pageContent = response.data
      
      // Method 1: Extract from JSON image arrays (most accurate for OLX car listings)
      const jsonMatches = pageContent.match(/"images":\s*\[[^\]]+\]/g) || []
      const uniqueImageIds = new Set<string>()
      
      // Filter arrays to skip promo/profile images - focus on arrays with multiple car images
      const carImageArrays: string[] = []
      
      jsonMatches.forEach((match: string, index: number) => {
        try {
          const imagesStr = match.replace('"images":', '')
          const imageObjects = JSON.parse(imagesStr)
          
          // Skip arrays with single images (likely profile/promo) or portrait images
          if (imageObjects.length === 1) {
            const img = imageObjects[0]
            if (img.height > img.width) { // Portrait orientation = likely not car image
              return
            }
          }
          
          // Keep arrays with multiple images or single landscape images
          if (imageObjects.length >= 3 || (imageObjects.length === 1 && imageObjects[0].width > imageObjects[0].height)) {
            carImageArrays.push(match)
          }
        } catch {
          // Skip invalid JSON arrays
        }
      })
      
      
      carImageArrays.forEach((match, index) => {
        try {
          // Extract image objects from the JSON
          const imagesStr = match.replace('"images":', '')
          const imageObjects = JSON.parse(imagesStr)
          
          imageObjects.forEach((img: { external_id?: string }) => {
            if (img.external_id && img.external_id.includes('-ID')) {
              uniqueImageIds.add(img.external_id)
            }
          })
        } catch {
          // Skip invalid JSON array
        }
      })
      
      // Generate high-quality URLs from JSON image IDs
      const jsonImages: string[] = []
      Array.from(uniqueImageIds).forEach(imageId => {
        const highQualityUrl = `https://apollo.olx.co.id/v1/files/${imageId}/image;s=780x0;q=60`
        jsonImages.push(highQualityUrl)
      })
      
      images.push(...jsonImages)
      
      // Method 2: Fallback - Extract individual external_id patterns
      if (images.length === 0) {
        const externalIdMatches = pageContent.match(/"external_id":\s*"[^"]+"/g) || []
        const fallbackIds = new Set<string>()
        
        externalIdMatches.forEach((match: string) => {
          const id = match.match(/"external_id":\s*"([^"]+)"/)?.[1]
          if (id && id.includes('-ID')) {
            fallbackIds.add(id)
          }
        })
        
        Array.from(fallbackIds).forEach(imageId => {
          const highQualityUrl = `https://apollo.olx.co.id/v1/files/${imageId}/image;s=780x0;q=60`
          images.push(highQualityUrl)
        })
      }
      
      // Method 3: Extract from slick-slide figure elements (legacy support)
      if (images.length === 0) {
        $('.slick-slide figure img, .slick-slide figure source, figure.slick-slide img').each((_, element) => {
          const $el = $(element)
          const src = $el.attr('src') || $el.attr('data-src') || $el.attr('srcset')?.split(' ')[0]
          
          if (src && src.includes('apollo.olx.co.id')) {
            // Extract file ID and ensure high quality
            const fileIdMatch = src.match(/\/files\/([a-fA-F0-9\-]+-ID)\//)
            if (fileIdMatch) {
              const fileId = fileIdMatch[1]
              const highQualityUrl = `https://apollo.olx.co.id/v1/files/${fileId}/image;s=780x0;q=60`
              if (!images.includes(highQualityUrl)) {
                images.push(highQualityUrl)
              }
            }
          }
        })
      }
      
      // Method 4: General Apollo CDN extraction as final fallback
      if (images.length === 0) {
        const apolloUrls = pageContent.match(/https:\/\/apollo\.olx\.co\.id\/v1\/files\/[a-fA-F0-9\-]+(?:-ID)?\/image[^"'\s]*/g) || []
        
        const uniqueFileIds = new Set<string>()
        apolloUrls.forEach((url: string) => {
          const fileIdMatch = url.match(/\/files\/([a-fA-F0-9\-]+-ID)\//)
          if (fileIdMatch) {
            const fileId = fileIdMatch[1]
            if (!uniqueFileIds.has(fileId)) {
              uniqueFileIds.add(fileId)
              const highQualityUrl = `https://apollo.olx.co.id/v1/files/${fileId}/image;s=780x0;q=60`
              images.push(highQualityUrl)
            }
          }
        })
      }

      if (title !== 'Tidak ditemukan' || price !== 'Tidak ditemukan') {
        const carData = {
          title,
          price,
          year: extractYearFromTitle(title),
          mileage: 'Tidak ditemukan',
          location,
          description,
          images: images.slice(0, 20),
          specs: {}
        }
        return cleanCarData(carData) as unknown as CarData
      }
    } catch (cheerioError) {
      // Fallback to Puppeteer if Cheerio fails
    }

    // Fallback to Puppeteer if Cheerio fails
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForTimeout(3000) // Wait for dynamic content
      
      const carData = await page.evaluate(() => {
        const getTextContent = (selectors: string[]): string => {
          for (const selector of selectors) {
            const element = document.querySelector(selector)
            if (element?.textContent?.trim()) {
              return element.textContent.trim()
            }
          }
          return ''
        }

        const getImages = (): string[] => {
          const images: string[] = []
          const pageContent = document.documentElement.innerHTML
          
          // Method 1: Extract from JSON image arrays (most accurate for OLX)
          const jsonMatches = pageContent.match(/"images":\s*\[[^\]]+\]/g) || []
          const uniqueImageIds = new Set<string>()
          
          // Filter arrays to skip promo/profile images - focus on arrays with multiple car images
          const carImageArrays: string[] = []
          
          jsonMatches.forEach((match: string, index: number) => {
            try {
              const imagesStr = match.replace('"images":', '')
              const imageObjects = JSON.parse(imagesStr)
              
              // Skip arrays with single images (likely profile/promo) or portrait images
              if (imageObjects.length === 1) {
                const img = imageObjects[0]
                if (img.height > img.width) { // Portrait orientation = likely not car image
                  return
                }
              }
              
              // Keep arrays with multiple images or single landscape images
              if (imageObjects.length >= 3 || (imageObjects.length === 1 && imageObjects[0].width > imageObjects[0].height)) {
                carImageArrays.push(match)
              }
            } catch {
              // Skip arrays that can't be parsed
            }
          })
          
          carImageArrays.forEach(match => {
            try {
              // Extract image objects from the JSON
              const imagesStr = match.replace('"images":', '')
              const imageObjects = JSON.parse(imagesStr)
              
              imageObjects.forEach((img: { external_id?: string }) => {
                if (img.external_id && img.external_id.includes('-ID')) {
                  uniqueImageIds.add(img.external_id)
                }
              })
            } catch {
              // Continue to fallback methods if JSON parsing fails
            }
          })
          
          // Generate high-quality URLs from JSON image IDs
          Array.from(uniqueImageIds).forEach(imageId => {
            const highQualityUrl = `https://apollo.olx.co.id/v1/files/${imageId}/image;s=780x0;q=60`
            images.push(highQualityUrl)
          })
          
          // Method 2: Fallback - Extract individual external_id patterns
          if (images.length === 0) {
            const externalIdMatches = pageContent.match(/"external_id":\s*"[^"]+"/g) || []
            const fallbackIds = new Set<string>()
            
            externalIdMatches.forEach((match: string) => {
              const idMatch = match.match(/"external_id":\s*"([^"]+)"/)
              if (idMatch) {
                const id = idMatch[1]
                if (id && id.includes('-ID')) {
                  fallbackIds.add(id)
                }
              }
            })
            
            Array.from(fallbackIds).forEach(imageId => {
              const highQualityUrl = `https://apollo.olx.co.id/v1/files/${imageId}/image;s=780x0;q=60`
              images.push(highQualityUrl)
            })
          }
          
          // Method 3: Extract unique file IDs from any Apollo CDN URLs 
          if (images.length === 0) {
            const uniqueFileIds = new Set<string>()
            
            // Extract all Apollo file IDs (unique identifiers)
            const fileIdMatches = pageContent.match(/[a-fA-F0-9]{13,}-ID/g) || []
            fileIdMatches.forEach(fileId => {
              uniqueFileIds.add(fileId)
            })
            
            // If we found unique file IDs, construct high-quality URLs
            if (uniqueFileIds.size > 0) {
              uniqueFileIds.forEach(fileId => {
                const highQualityUrl = `https://apollo.olx.co.id/v1/files/${fileId}/image;s=780x0;q=60`
                images.push(highQualityUrl)
              })
            }
          }
          
          // Method 4: Traditional img tag extraction as final fallback
          if (images.length === 0) {
            const imgElements = document.querySelectorAll('img')
            imgElements.forEach(img => {
              const src = img.src || img.getAttribute('data-src')
              if (src && src.includes('apollo.olx.co.id') && !images.includes(src)) {
                // Extract file ID and ensure high quality
                const fileIdMatch = src.match(/\/files\/([a-fA-F0-9\-]+-ID)\//)
                if (fileIdMatch) {
                  const fileId = fileIdMatch[1]
                  const highQualityUrl = `https://apollo.olx.co.id/v1/files/${fileId}/image;s=780x0;q=60`
                  if (!images.includes(highQualityUrl)) {
                    images.push(highQualityUrl)
                  }
                }
              }
            })
          }
          
          return images.slice(0, 20) // Return up to 20 images
        }

        const title = getTextContent(['h1', '[data-cy="ad_title"]', '.ad-title']) || 
                      document.title.split('|')[0].trim() || 'Tidak ditemukan'
        
        // Enhanced price extraction for Puppeteer
        let price = 'Tidak ditemukan'
        const priceSelectors = [
          '[data-aut-id="itemPrice"]',
          '[data-testid="ad-price"]',
          '.notranslate[data-aut-id="itemPrice"]',
          '[data-testid="price"]',
          '.rui-2Pidb',
          '.price',
          '.ad-price',
          '[class*="Price"]',
          '[class*="price"]'
        ]
        
        for (const selector of priceSelectors) {
          const priceText = getTextContent([selector])
          if (priceText && (priceText.includes('Rp') || priceText.includes('RP')) && /\d/.test(priceText)) {
            price = priceText
            // Price found via Puppeteer
            break
          }
        }
        
        // Check meta tags
        if (price === 'Tidak ditemukan') {
          const metaPrice = document.querySelector('meta[property="product:price:amount"]')?.getAttribute('content') ||
                           document.querySelector('meta[property="og:price:amount"]')?.getAttribute('content')
          if (metaPrice) {
            price = `Rp ${metaPrice}`
            // Price found in meta tags
          }
        }
        
        // If still not found, search for any element containing Rp
        if (price === 'Tidak ditemukan') {
          const allElements = document.querySelectorAll('*')
          for (const element of allElements) {
            const text = element.textContent?.trim() || ''
            if (text.match(/^(Rp|RP)\s*[\d,\.]+/) && text.length < 100) {
              const elementText = element.textContent?.trim() || ''
              if (elementText.length < 50 && !elementText.includes('\n')) {
                price = text
                // Price found via broad search
                break
              }
            }
          }
        }

        return {
          title,
          price,
          location: getTextContent(['[data-cy="ad_location"]', '.location', '.ad-location']) || 'Tidak ditemukan',
          description: getTextContent(['[data-cy="ad_description"]', '.description', '.ad-description']) || 'Tidak ditemukan',
          images: getImages()
        }
      })

      await browser.close()

      const result = {
        title: carData.title,
        price: cleanAndFormatPrice(carData.price),
        year: extractYearFromTitle(carData.title),
        mileage: 'Tidak ditemukan',
        location: carData.location,
        description: carData.description,
        images: carData.images,
        specs: {}
      }

      return cleanCarData(result) as unknown as CarData
    } catch (puppeteerError) {
      await browser.close()
      throw puppeteerError
    }

  } catch (error) {
    console.error('Error scraping OLX:', error)
    
    // Return fallback data with URL info instead of throwing error
    const urlParts = url.split('/')
    const possibleTitle = urlParts[urlParts.length - 1].replace(/-/g, ' ').replace('.html', '')
    
    const fallbackData = {
      title: possibleTitle || 'Data tidak dapat diambil dari OLX',
      price: 'Hubungi penjual',
      year: extractYearFromTitle(possibleTitle) || 'Tidak ditemukan',
      mileage: 'Tidak ditemukan',
      location: 'Tidak ditemukan',
      description: 'Tidak dapat mengambil deskripsi. Silakan cek link langsung.',
      images: [],
      specs: {}
    }

    return cleanCarData(fallbackData) as unknown as CarData
  }
}

// Facebook scraping has been removed - only OLX and Mobil123 are supported

async function scrapeMobil123(url: string): Promise<CarData> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    })

    const $ = cheerio.load(response.data)

    const getTextContent = (selector: string): string => {
      return $(selector).text().trim() || ''
    }

    const getImageUrls = (): string[] => {
      const images: string[] = []
      const seenUrls = new Set<string>()
      
      
      // Method 1: Look for gallery images with data-src attributes (most reliable)
      $('[data-src*="gallery_"], img[data-src*="gallery_"]').each((_, img) => {
        const src = $(img).attr('data-src') || $(img).attr('src')
        if (src && src.includes('gallery_') && src.includes('icarcdn.com') && !seenUrls.has(src)) {
          const fullSrc = src.startsWith('//') ? 'https:' + src : src
          images.push(fullSrc)
          seenUrls.add(src)
        }
      })
      
      
      // Method 2: All data-src images that look like car photos
      if (images.length < 5) {
        $('[data-src*="icarcdn.com"]').each((_, img) => {
          const src = $(img).attr('data-src')
          if (src && 
              src.includes('icarcdn.com') && 
              !src.includes('logo') && 
              !src.includes('icon') && 
              !src.includes('safety_tips') &&
              !src.includes('profile_pic') &&
              (src.includes('gallery_') || src.includes('main-s_')) &&
              !seenUrls.has(src)) {
            const fullSrc = src.startsWith('//') ? 'https:' + src : src
            images.push(fullSrc)
            seenUrls.add(src)
          }
        })
      }
      
      // Method 3: Regular src attributes as fallback
      if (images.length === 0) {
        $('img[src*="icarcdn.com"]').each((_, img) => {
          const src = $(img).attr('src')
          if (src && 
              src.includes('icarcdn.com') && 
              !src.includes('logo') && 
              !src.includes('icon') && 
              !src.includes('safety_tips') &&
              !seenUrls.has(src)) {
            images.push(src)
            seenUrls.add(src)
          }
        })
      }
      
      // Filter to high-quality gallery images and remove duplicates
      const galleryImages = images.filter(url => 
        url.includes('gallery_') && 
        !url.includes('thumb-') && 
        url.includes('.webp')
      )
      
      return galleryImages.slice(0, 20) // Return up to 20 high-quality images
    }

    const title = getTextContent('h1, .listing-title, .car-title, .title-txt, [data-testid="listing-title"]') || 'Tidak ditemukan'
    
    // Enhanced price extraction for Mobil123
    let price = getTextContent('.price, .listing-price, .car-price, .price-value, [data-testid="listing-price"]') || 'Tidak ditemukan'
    
    // If no price found with standard selectors, try broader search
    if (price === 'Tidak ditemukan') {
      // Look for price in script data or meta tags
      const priceScript = $('script:contains("price")').text()
      if (priceScript) {
        const priceMatch = priceScript.match(/["']price["']:\s*["']?([^"',}]+)["']?/i) ||
                          priceScript.match(/Rp\s*[\d,\.]+/i)
        if (priceMatch) {
          price = priceMatch[0].includes('Rp') ? priceMatch[0] : `Rp ${priceMatch[1]}`
        }
      }
      
      // Try meta tags
      if (price === 'Tidak ditemukan') {
        const metaPrice = $('meta[property="product:price:amount"], meta[name="price"]').attr('content')
        if (metaPrice) {
          price = `Rp ${metaPrice}`
        }
      }
    }
    
    const location = getTextContent('.location, .listing-location, .car-location, .dealer-location, [data-testid="dealer-location"]') || 'Tidak ditemukan'
    const description = getTextContent('.description, .listing-description, .car-description, .listing-desc, [data-testid="listing-description"]') || 
                       $('meta[name="description"]').attr('content') || 'Tidak ditemukan'

    // Extract specifications
    const mileage = getTextContent('.specs .mileage, [data-label="Odometer"], .odometer') || 
                   $('.specs li:contains("km"), .specifications li:contains("km")').text() || 'Tidak ditemukan'
    
    const transmission = getTextContent('.specs .transmission, [data-label="Transmission"]') ||
                        $('.specs li:contains("Manual"), .specs li:contains("Automatic")').text() || 'Tidak ditemukan'

    const mobilData = {
      title,
      price,
      year: extractYearFromTitle(title),
      mileage,
      location,
      description,
      images: getImageUrls(),
      specs: {
        transmission,
        fuelType: getTextContent('.specs .fuel, [data-label="Fuel Type"]') || 'Tidak ditemukan',
        color: getTextContent('.specs .color, [data-label="Color"]') || 'Tidak ditemukan'
      }
    }

    return cleanCarData(mobilData) as unknown as CarData

  } catch (error) {
    console.error('Error scraping Mobil123:', error)
    throw new Error('Gagal mengambil data dari Mobil123. Pastikan link valid dan coba lagi.')
  }
}


export async function analyzeImagesWithAI(images: string[], carTitle: string): Promise<{
  score: number
  findings: string[]
  recommendation: string
  confidence: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  scamRisk?: {
    level: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
    indicators: string[]
    priceAnalysis: string
    photoQuality: string
  }
  detailedAnalysis?: {
    exterior: string[]
    interior: string[]
    engine: string[]
    photoQuality?: string[]
    overall: string
  }
}> {
  // If OpenAI API key is not provided, return mock analysis in Indonesian
  if (!process.env.OPENAI_API_KEY) {
    const mockScore = Math.floor(Math.random() * 30) + 70 // 70-100
    return {
      score: mockScore,
      findings: [
        '🔍 ANALISIS SIMULASI - OpenAI API key belum dikonfigurasi',
        'Analisis berdasarkan gambar yang tersedia dari OLX',
        'Eksterior terlihat dalam kondisi yang dapat diterima',
        'Diperlukan inspeksi langsung untuk memastikan kondisi mekanis dan kelistrikan'
      ],
      recommendation: mockScore > 85 
        ? '⚠️ DATA SIMULASI: Mobil terlihat dalam kondisi sangat baik berdasarkan foto. Tetap disarankan melakukan inspeksi teknisi profesional untuk memastikan kondisi mesin dan komponen tersembunyi.'
        : mockScore > 75 
        ? '⚠️ DATA SIMULASI: Mobil dalam kondisi baik dengan beberapa tanda penggunaan wajar. Inspeksi teknisi sangat direkomendasikan sebelum keputusan pembelian.'
        : '⚠️ DATA SIMULASI: Terdapat beberapa area yang memerlukan perhatian khusus. Inspeksi menyeluruh oleh teknisi berpengalaman sangat wajib sebelum pembelian.',
      confidence: 85,
      riskLevel: mockScore > 85 ? 'LOW' : mockScore > 75 ? 'MEDIUM' : 'HIGH',
      detailedAnalysis: {
        exterior: ['🔍 DATA SIMULASI: Kondisi eksterior tidak dapat dianalisis tanpa konfigurasi OpenAI API key'],
        interior: ['🔍 DATA SIMULASI: Kondisi interior perlu diperiksa secara langsung oleh inspector'],
        engine: ['🔍 DATA SIMULASI: Kondisi mesin dan sistem mekanis memerlukan pemeriksaan teknisi ahli'],
        overall: '⚠️ ANALISIS SIMULASI: Untuk mendapatkan analisis AI yang sesungguhnya dan akurat, silakan konfigurasi OpenAI API key terlebih dahulu'
      }
      // No storage info for mock analysis - removed invalid properties
    }
  }

  // Filter and prioritize high-quality images (move outside try block for scope)
  const validImages = images.filter(img => 
    img && 
    img.startsWith('http') && 
    !img.includes('placeholder') && 
    !img.includes('icon') &&
    !img.includes('logo') &&
    !img.includes('avatar') &&
    !img.includes('profile')
  )
  
  // Prioritize unique, high-quality images (remove duplicates and select best)
  const uniqueImages = [...new Set(validImages)]
  
  // Take up to 15 images for comprehensive analysis with fast parallel processing
  const selectedImages = uniqueImages.slice(0, 15)
  
  // Variables to track for background storage
  let carId: string | undefined = undefined

  try {
    const { OpenAI } = await import('openai')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    if (selectedImages.length === 0) {
      return fallbackAnalysis(carTitle, 0)
    }

    // Generate unique car ID for background image storage
    const timestamp = Date.now()
    const randomComponent = Math.random().toString(36).substring(2, 8)
    const processId = process.pid || Math.floor(Math.random() * 10000)
    carId = crypto.createHash('md5').update(`${carTitle}_${timestamp}_${randomComponent}_${processId}`).digest('hex').substring(0, 16)
    
    // Start background image storage (don't wait for it)
    setImmediate(() => {
        ImageStorageService.downloadAndStoreImages(selectedImages, carId!)
        .then(storedUrls => {
          // Background storage completed silently
        })
        .catch(error => {
          // Background image storage failed silently
        })
    })

    // Download and convert images to base64 in parallel for immediate AI analysis
    const imageProcessStartTime = Date.now()
    const base64Images = await downloadImagesAsBase64(selectedImages)
    const imageProcessTime = Date.now() - imageProcessStartTime
    
    // Image processing completed

    if (base64Images.length === 0) {
      // No images processed, using fallback analysis
      return fallbackAnalysis(carTitle, 0)
    }

    // Create the enhanced vision analysis prompt with strict JSON formatting in Indonesian
    const prompt = `Anda adalah seorang inspector mobil berpengalaman di Indonesia. Analisis ${selectedImages.length} foto mobil untuk ${carTitle} dengan DETAIL dan OBJEKTIF.

INSTRUKSI PENILAIAN SEIMBANG:
- Dengan ${selectedImages.length} foto, Anda memiliki data yang cukup untuk penilaian akurat
- Berikan skor REALISTIS berdasarkan kondisi yang terlihat
- Skor tinggi (80-90) BISA diberikan jika kondisinya benar-benar baik dengan foto lengkap
- Skor rendah (40-60) hanya jika ada masalah nyata atau foto sangat terbatas
- Lebih banyak foto = tingkat kepercayaan lebih tinggi
- Tetap OBJEKTIF - jangan terlalu pesimis atau optimis

DETEKSI PENIPUAN - Periksa indikator ini:
1. HARGA: Apakah harga wajar untuk tahun/kondisi tersebut?
2. FOTO: Apakah foto berkualitas baik menunjukkan berbagai sudut?
3. DETAIL: Apakah ada foto interior, eksterior, mesin, dashboard?
4. KONSISTENSI: Apakah semua foto dari mobil yang sama?
5. KELENGKAPAN: Dengan ${selectedImages.length} foto, apakah cukup untuk penilaian?

PENTING: Anda HARUS merespons dengan format JSON yang valid SAJA. Tidak ada teks tambahan sebelum atau sesudah JSON.

Kembalikan HANYA struktur JSON ini (dalam Bahasa Indonesia):
{
  "score": 75,
  "confidence": 80,
  "riskLevel": "MEDIUM",
  "scamRisk": {
    "level": "LOW",
    "indicators": ["Daftar indikator penipuan spesifik yang ditemukan"],
    "priceAnalysis": "Analisis kewajaran harga untuk kondisi yang terlihat",
    "photoQuality": "Penilaian kualitas dan kelengkapan ${selectedImages.length} foto"
  },
  "findings": [
    "Temuan 1 (kondisi yang jelas terlihat)",
    "Temuan 2 (area yang perlu perhatian)",
    "Temuan 3 (keunggulan yang terlihat)",
    "Temuan 4 (rekomendasi berdasarkan analisis)"
  ],
  "recommendation": "Rekomendasi yang seimbang dan objektif",
  "detailedAnalysis": {
    "exterior": ["Analisis eksterior detail dari foto yang tersedia"],
    "interior": ["Analisis interior berdasarkan foto yang ada"],
    "engine": ["Analisis mesin/area teknis jika terlihat"],
    "photoQuality": ["Evaluasi kualitas dan cakupan ${selectedImages.length} foto"],
    "overall": "Kesimpulan seimbang berdasarkan semua foto yang dianalisis"
  }
}

KRITERIA PENILAIAN SEIMBANG (dengan ${base64Images.length} foto berkualitas tinggi):
- Skor 90-98: Kondisi luar biasa, foto sangat komprehensif (12-15 foto berkualitas tinggi)
- Skor 85-89: Kondisi sangat baik, foto sangat lengkap (10-11 foto berkualitas)
- Skor 75-84: Kondisi baik, foto memadai, hanya masalah kecil (6-9 foto)
- Skor 65-74: Kondisi cukup, beberapa kekhawatiran atau foto tidak lengkap (4-5 foto)
- Skor 50-64: Perlu perhatian, ada masalah atau foto terbatas (2-3 foto)
- Skor 30-49: Kondisi buruk atau hanya 1 foto yang dapat diproses

EVALUASI JUMLAH FOTO:
- ${base64Images.length} foto berkualitas tinggi: ${
  base64Images.length >= 12 ? 'Cakupan LUAR BIASA - kepercayaan sangat tinggi' :
  base64Images.length >= 10 ? 'Cakupan SANGAT BAIK - kepercayaan tinggi' :
  base64Images.length >= 6 ? 'Cakupan BAIK - kepercayaan menengah-tinggi' :
  base64Images.length >= 4 ? 'Cakupan MEMADAI - kepercayaan menengah' :
  base64Images.length >= 2 ? 'Cakupan TERBATAS - kepercayaan rendah' :
  'Cakupan SANGAT TERBATAS - kepercayaan sangat rendah'
}

FOKUS ANALISIS:
- Manfaatkan SEMUA ${base64Images.length} foto berkualitas tinggi untuk penilaian komprehensif
- Identifikasi area yang terlihat jelas vs yang tidak ditampilkan
- Beri kredit untuk foto berkualitas dan sudut yang baik
- Waspada terhadap tanda bahaya tapi jangan paranoid
- Berikan rekomendasi seimbang antara kondisi yang terlihat vs kebutuhan inspeksi

PENTING: Kembalikan HANYA objek JSON. Tidak ada teks penjelasan, tidak ada format markdown, tidak ada blok kode. Hanya JSON murni yang dapat diparse langsung.`

    // Prepare image content for OpenAI using base64 data
    const imageContent = base64Images.map(base64 => ({
      type: "image_url" as const,
      image_url: {
        url: `data:image/jpeg;base64,${base64}`,
        detail: "high" as const
      }
    }))

    // Sending images to OpenAI Vision API
    const openaiStartTime = Date.now()
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Anda inspector mobil profesional Indonesia. Respons HANYA JSON valid. Bahasa Indonesia."
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...imageContent
          ]
        }
      ],
      max_tokens: 1200, // Reduced tokens for faster response
      temperature: 0.2, // Lower temperature for consistency
      response_format: { type: "json_object" }
    })
    
    const openaiTime = Date.now() - openaiStartTime
    // OpenAI API call completed

    const analysisText = response.choices[0]?.message?.content
    if (!analysisText) {
      throw new Error('No analysis received from OpenAI')
    }


    // Parse the JSON response with improved error handling
    let analysisData
    try {
      // Clean the response text first
      let cleanedText = analysisText.trim()
      
      // Remove any markdown code block formatting
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      // Extract JSON from the response (look for the most complete JSON object)
      const jsonMatches = cleanedText.match(/\{[\s\S]*\}/g)
      let jsonString = cleanedText
      
      if (jsonMatches && jsonMatches.length > 0) {
        // Use the largest/most complete JSON match
        jsonString = jsonMatches.reduce((longest, current) => 
          current.length > longest.length ? current : longest
        )
      }
      
      analysisData = JSON.parse(jsonString)
      
    } catch (parseError) {
      // Failed to parse OpenAI JSON response - using fallback
      // Fallback to text analysis
      return parseTextAnalysis(analysisText, carTitle)
    }

    // Validate and return structured data with balanced scoring
    const rawScore = analysisData.score || 65 // Balanced default
    // Enhanced balanced scoring for up to 15 high-quality processed images
    const balancedScore = base64Images.length >= 12 
      ? Math.max(35, Math.min(98, rawScore)) // 12-15 photos: allow up to 98 (comprehensive coverage)
      : base64Images.length >= 10 
      ? Math.max(30, Math.min(95, rawScore)) // 10-11 photos: allow up to 95 (very good coverage)
      : base64Images.length >= 6 
      ? Math.max(30, Math.min(90, rawScore)) // 6-9 photos: allow up to 90 (good coverage)
      : base64Images.length >= 4 
      ? Math.max(25, Math.min(85, rawScore)) // 4-5 photos: allow up to 85 (adequate coverage)
      : base64Images.length >= 2 
      ? Math.max(20, Math.min(80, rawScore)) // 2-3 photos: allow up to 80 (limited coverage)
      : Math.max(15, Math.min(70, rawScore)) // 1 photo: max 70 (very limited coverage)
    
    const finalResult = {
      score: balancedScore,
      findings: Array.isArray(analysisData.findings) ? analysisData.findings.slice(0, 4) : [
        '⚠️ Analisis terbatas berdasarkan foto yang tersedia dari OLX',
        '🔍 Kondisi sebenarnya perlu verifikasi langsung di lokasi',
        '⚡ Area tersembunyi tidak dapat diperiksa melalui foto',
        '🔧 Inspeksi teknisi profesional sangat direkomendasikan'
      ],
      recommendation: analysisData.recommendation || `⚠️ Berdasarkan analisis foto ${carTitle}, terdapat keterbatasan dalam penilaian visual. SANGAT DISARANKAN untuk menggunakan jasa inspeksi teknisi profesional sebelum memutuskan pembelian.`,
      confidence: Math.max(1, Math.min(100, analysisData.confidence || (
        base64Images.length >= 12 ? 98 : // 12-15 high-quality photos: very high confidence
        base64Images.length >= 10 ? 95 : // 10-11 photos: high confidence  
        base64Images.length >= 6 ? 90 :  // 6-9 photos: good confidence
        base64Images.length >= 4 ? 85 :  // 4-5 photos: moderate confidence
        base64Images.length >= 2 ? 75 :  // 2-3 photos: low confidence
        60                              // 1 photo: very low confidence
      ))), // Enhanced photo-based confidence for processed images
      riskLevel: ['LOW', 'MEDIUM', 'HIGH'].includes(analysisData.riskLevel) ? analysisData.riskLevel : 'MEDIUM',
      scamRisk: analysisData.scamRisk ? {
        level: ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'].includes(analysisData.scamRisk.level) 
          ? analysisData.scamRisk.level : 'MEDIUM',
        indicators: Array.isArray(analysisData.scamRisk.indicators) 
          ? analysisData.scamRisk.indicators : ['Perlu verifikasi lebih lanjut dengan penjual'],
        priceAnalysis: analysisData.scamRisk.priceAnalysis || 'Analisis harga memerlukan data pasar terkini Indonesia',
        photoQuality: analysisData.scamRisk.photoQuality || 'Kualitas foto perlu evaluasi lebih detail'
      } : {
        level: 'MEDIUM',
        indicators: ['Data terbatas untuk analisis risiko penipuan'],
        priceAnalysis: 'Perlu verifikasi harga pasar mobil bekas Indonesia',
        photoQuality: 'Foto kurang lengkap untuk penilaian komprehensif'
      },
      detailedAnalysis: analysisData.detailedAnalysis ? {
        exterior: Array.isArray(analysisData.detailedAnalysis.exterior) 
          ? analysisData.detailedAnalysis.exterior : ['Bagian eksterior perlu inspeksi detail secara langsung'],
        interior: Array.isArray(analysisData.detailedAnalysis.interior) 
          ? analysisData.detailedAnalysis.interior : ['Kondisi interior perlu pemeriksaan langsung'],
        engine: Array.isArray(analysisData.detailedAnalysis.engine) 
          ? analysisData.detailedAnalysis.engine : ['Kondisi mesin tidak dapat dipastikan dari foto saja'],
        photoQuality: Array.isArray(analysisData.detailedAnalysis.photoQuality) 
          ? analysisData.detailedAnalysis.photoQuality : ['Foto terbatas untuk penilaian lengkap kondisi mobil'],
        overall: analysisData.detailedAnalysis.overall || 
          '⚠️ PENTING: Analisis berdasarkan foto memiliki keterbatasan signifikan. Kondisi sesungguhnya mobil hanya dapat dipastikan melalui inspeksi fisik oleh teknisi berpengalaman. Jangan membuat keputusan pembelian hanya berdasarkan foto dari listing OLX.'
      } : {
        exterior: ['⚠️ Foto eksterior tidak lengkap untuk penilaian menyeluruh kondisi bodi'],
        interior: ['⚠️ Foto interior tidak tersedia atau tidak cukup jelas'],
        engine: ['⚠️ Kondisi mesin dan sistem mekanis tidak dapat dievaluasi dari foto'],
        photoQuality: ['📷 Kualitas dan kelengkapan foto tidak memadai untuk analisis akurat'],
        overall: '🚨 RISIKO TINGGI: Foto sangat terbatas. Inspeksi teknisi profesional WAJIB sebelum pembelian!'
      },
      // Add storage information for background process
      backgroundStorageCarId: carId,
      backgroundStorageStatus: 'processing'
    }
    
    const totalAnalysisTime = Date.now() - imageProcessStartTime
    // AI analysis completed successfully
    
    return finalResult

  } catch (error) {
    console.error('AI Analysis failed:', error instanceof Error ? error.message : 'Unknown error')
    
    // Background storage may still be processing
    
    return fallbackAnalysis(carTitle, selectedImages?.length || 0)
  }
}

// Conservative fallback analysis when OpenAI fails - in Indonesian
function fallbackAnalysis(carTitle: string, imageCount: number = 0) {
  // Enhanced scoring based on image count, still conservative without AI
  const baseScore = imageCount >= 15 ? 55 : // 15+ photos: 55-70 range
                   imageCount >= 10 ? 50 : // 10-14 photos: 50-65 range
                   imageCount >= 8 ? 48 :  // 8-9 photos: 48-63 range
                   imageCount >= 5 ? 45 :  // 5-7 photos: 45-60 range
                   40                      // <5 photos: 40-55 range
  const score = Math.floor(Math.random() * 15) + baseScore
  return {
    score,
    findings: [
      `⚠️ Analisis terbatas untuk ${carTitle} dari foto OLX`,
      '🔍 Foto tidak dapat dianalisis dengan AI - data sangat terbatas',
      '⚡ Banyak aspek kondisi mobil tidak dapat diperiksa dari foto',
      '🔧 WAJIB menggunakan inspeksi teknisi profesional sebelum membeli'
    ],
    recommendation: `🚨 PERINGATAN: Tanpa analisis AI yang proper untuk ${carTitle}, risiko pembelian sangat tinggi. JANGAN membeli tanpa inspeksi teknisi profesional terlebih dahulu. Banyak masalah tersembunyi yang tidak dapat terdeteksi dari foto listing OLX.`,
    confidence: Math.max(20, Math.min(60, 
      imageCount >= 15 ? 55 : // 15+ photos: higher fallback confidence
      imageCount >= 10 ? 50 : // 10-14 photos
      imageCount >= 8 ? 45 :  // 8-9 photos  
      imageCount >= 5 ? 35 :  // 5-7 photos
      25                     // <5 photos
    )), // Enhanced photo-based confidence for fallback
    riskLevel: 'HIGH' as 'LOW' | 'MEDIUM' | 'HIGH', // Always high risk without proper analysis
    scamRisk: {
      level: 'HIGH' as 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH',
      indicators: [
        'Tidak dapat melakukan analisis penipuan tanpa AI vision',
        'Kualitas foto tidak dapat diverifikasi secara otomatis',
        'Risiko tinggi tanpa analisis visual yang komprehensif'
      ],
      priceAnalysis: 'Tidak dapat memverifikasi kewajaran harga mobil tanpa analisis gambar',
      photoQuality: 'Tidak dapat menilai kualitas dan keaslian foto tanpa AI vision'
    },
    detailedAnalysis: {
      exterior: ['🚨 Kondisi eksterior tidak dapat dianalisis tanpa AI vision'],
      interior: ['🚨 Interior tidak dapat diperiksa dari foto - risiko sangat tinggi'],
      engine: ['🚨 Kondisi mesin tidak diketahui - inspeksi teknisi WAJIB'],
      photoQuality: ['📷 Tidak dapat menilai kualitas foto tanpa AI vision'],
      overall: '🚨 BAHAYA: Tanpa analisis AI, Anda membeli secara buta. Kemungkinan besar ada masalah tersembunyi pada mobil. Inspeksi teknisi profesional MUTLAK diperlukan sebelum keputusan pembelian!'
    }
  }
}

// Conservative text-based analysis when JSON parsing fails - in Indonesian
function parseTextAnalysis(text: string, carTitle: string) {
  const score = Math.min(65, extractNumberFromText(text, 'score') || 55) // Cap at 65, default 55
  const confidence = Math.min(70, extractNumberFromText(text, 'confidence') || 50) // Cap confidence
  
  return {
    score: Math.max(20, score), // Minimum 20
    findings: [
      '⚠️ Analisis tidak lengkap - parsing respons AI gagal',
      '🔍 AI tidak dapat memberikan analisis terstruktur untuk foto mobil',
      '⚡ Banyak aspek kondisi mobil tidak dapat dipastikan dari analisis',
      '🔧 Inspeksi teknisi profesional SANGAT DIPERLUKAN untuk keamanan'
    ],
    recommendation: `🚨 PERHATIAN: Analisis AI untuk ${carTitle} tidak dapat dilakukan dengan sempurna. Ini menunjukkan kemungkinan ada masalah dengan kualitas foto atau data dari listing OLX. JANGAN ambil risiko - gunakan jasa inspeksi teknisi profesional sebelum membeli!`,
    confidence: confidence,
    riskLevel: 'HIGH' as 'LOW' | 'MEDIUM' | 'HIGH', // Always high risk when parsing fails
    scamRisk: {
      level: 'HIGH' as 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH',
      indicators: [
        'AI tidak dapat menganalisis foto dengan sempurna',
        'Kemungkinan ada masalah dengan kualitas atau keaslian foto',
        'Data tidak mencukupi untuk analisis risiko penipuan yang akurat'
      ],
      priceAnalysis: 'Tidak dapat melakukan analisis kewajaran harga secara akurat',
      photoQuality: 'Kualitas atau kelengkapan foto bermasalah untuk analisis AI'
    },
    detailedAnalysis: {
      exterior: ['⚠️ Kondisi eksterior tidak dapat dianalisis dengan baik dari foto'],
      interior: ['⚠️ Kondisi interior tidak dapat diperiksa secara detail'],
      engine: ['⚠️ Kondisi mesin tidak dapat dipastikan dari foto yang tersedia'],
      photoQuality: ['📷 Masalah dalam memproses foto untuk analisis komprehensif'],
      overall: '🚨 RISIKO TINGGI: Ketidakmampuan AI untuk menganalisis foto dengan baik menunjukkan ada masalah mendasar dengan listing ini. Jangan membeli tanpa inspeksi fisik menyeluruh oleh teknisi berpengalaman!'
    }
  }
}

// Helper function to extract numbers from text
function extractNumberFromText(text: string, key: string): number | null {
  const regex = new RegExp(`${key}['":\\s]*([0-9]+)`, 'i')
  const match = text.match(regex)
  return match ? parseInt(match[1]) : null
}

// Fast parallel image download and base64 conversion - optimized for 15 images
async function downloadImagesAsBase64(imageUrls: string[]): Promise<string[]> {
  const sharp = await import('sharp')
  
  // Process images in batches of 5 to prevent overwhelming the server/memory
  const batchSize = 5
  const batches: string[][] = []
  
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    batches.push(imageUrls.slice(i, i + batchSize))
  }
  
  // Processing images in batches
  
  const allResults: string[] = []
  
  // Process batches sequentially, but images within each batch in parallel
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex]
    const batchStartTime = Date.now()
    // Processing batch in parallel
    
    const batchPromises = batch.map(async (url, index) => {
      const globalIndex = batchIndex * batchSize + index
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: AbortSignal.timeout(8000) // 8 second timeout per image (faster)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const buffer = await response.arrayBuffer()
        
        // Optimized processing for faster results
        // Max 600px width, 75% quality JPEG (smaller but still good quality)
        const processedBuffer = await sharp.default(Buffer.from(buffer))
          .resize(600, null, { 
            withoutEnlargement: true,
            fastShrinkOnLoad: true,
            kernel: sharp.kernel.lanczos2 // Faster kernel
          })
          .jpeg({ 
            quality: 75,
            progressive: true,
            mozjpeg: true,
            optimiseScans: true
          })
          .toBuffer()
        
        const base64 = processedBuffer.toString('base64')
        // Image processed successfully
        
        return base64
      } catch (error) {
        // Failed to process image
        return null
      }
    })
    
    // Wait for current batch to complete
    const batchResults = await Promise.all(batchPromises)
    const validBatchResults = batchResults.filter(img => img !== null) as string[]
    allResults.push(...validBatchResults)
    
    const batchTime = Date.now() - batchStartTime
    // Batch processing completed
    
    // Small delay between batches to prevent overwhelming the server
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  // All image processing completed
  
  return allResults
}