/**
 * Utility functions for BerburuMobil application
 */

/**
 * Clean and format price specifically for scraped data
 */
export function cleanAndFormatPrice(price: string): string {
  if (!price || price === 'Tidak ditemukan') {
    return 'Tidak ditemukan'
  }

  // Handle cases where price comes in as different formats
  let cleanPrice = price
    .replace(/^(harga|price):\s*/gi, '')
    .replace(/[{}"\[\]]/g, '')
    .trim()

  // Handle "RP" vs "Rp" case sensitivity
  cleanPrice = cleanPrice.replace(/^RP\s*/i, 'Rp ')

  // If already properly formatted with Indonesian separators, return as is
  // Check for proper Indonesian formatting: Rp 123.456.789 (dots as thousand separators)
  if (cleanPrice.match(/^Rp\s*\d{1,3}(\.\d{3})*$/) && !cleanPrice.includes('{') && !cleanPrice.includes('"')) {
    return cleanPrice
  }

  // Extract the numeric part and format it properly
  const numericMatch = cleanPrice.match(/[\d,\.]+/)
  if (numericMatch) {
    const numericString = numericMatch[0]
    // Handle different separator formats (dots for thousands, commas for thousands)
    let numericValue
    
    if (numericString.includes('.') && numericString.includes(',')) {
      // Format like 175.000,00 or 175,000.00
      if (numericString.lastIndexOf('.') > numericString.lastIndexOf(',')) {
        // Format like 175,000.00 (comma for thousands, dot for decimal)
        numericValue = parseFloat(numericString.replace(/,/g, ''))
      } else {
        // Format like 175.000,00 (dot for thousands, comma for decimal)
        numericValue = parseFloat(numericString.replace(/\./g, '').replace(',', '.'))
      }
    } else if (numericString.includes(',')) {
      // Could be thousands separator or decimal
      const parts = numericString.split(',')
      if (parts.length === 2 && parts[1].length <= 2) {
        // Likely decimal separator
        numericValue = parseFloat(numericString.replace(',', '.'))
      } else {
        // Likely thousands separator
        numericValue = parseInt(numericString.replace(/,/g, ''), 10)
      }
    } else if (numericString.includes('.')) {
      // Could be thousands separator or decimal
      const parts = numericString.split('.')
      if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
        // Likely thousands separator (multiple dots or >2 digits after dot)
        numericValue = parseInt(numericString.replace(/\./g, ''), 10)
      } else {
        // Likely decimal separator
        numericValue = parseFloat(numericString)
      }
    } else {
      // Plain number
      numericValue = parseInt(numericString, 10)
    }
    
    if (!isNaN(numericValue) && numericValue > 0) {
      // Round to nearest integer for display
      const roundedValue = Math.round(numericValue)
      // Format Indonesian style: Rp 175.000.000
      return `Rp ${roundedValue.toLocaleString('id-ID')}`
    }
  }

  // If it already contains Rp and looks reasonable, clean it up
  if (cleanPrice.toLowerCase().includes('rp')) {
    return cleanPrice.replace(/\s+/g, ' ').trim()
  }

  // Handle special cases
  if (cleanPrice.toLowerCase().includes('hubungi') || cleanPrice.toLowerCase().includes('nego')) {
    return cleanPrice
  }

  return cleanPrice || 'Harga tidak tersedia'
}

/**
 * Format Indonesian currency (Rupiah) - Enhanced version
 */
export function formatPrice(price: string | number): string {
  if (typeof price === 'number') {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  if (typeof price !== 'string' || !price) {
    return 'Harga tidak tersedia'
  }

  // Use the enhanced cleaning function first
  return cleanAndFormatPrice(price)
}

/**
 * Clean and format car title
 */
export function formatCarTitle(title: string): string {
  if (!title || typeof title !== 'string') {
    return 'Judul tidak tersedia'
  }

  return title
    .replace(/[{}"\[\]]/g, '') // Remove JSON characters
    .replace(/title:|judul:/gi, '') // Remove title labels
    .trim()
}

/**
 * Clean and format car location
 */
export function formatLocation(location: string): string {
  if (!location || typeof location !== 'string') {
    return 'Lokasi tidak tersedia'
  }

  return location
    .replace(/[{}"\[\]]/g, '') // Remove JSON characters
    .replace(/location:|lokasi:/gi, '') // Remove location labels
    .trim()
}

/**
 * Clean and format mileage
 */
export function formatMileage(mileage: string): string {
  if (!mileage || typeof mileage !== 'string') {
    return 'Tidak ditemukan'
  }

  let cleanMileage = mileage
    .replace(/[{}"\[\]]/g, '') // Remove JSON characters
    .replace(/mileage:|km:/gi, '') // Remove mileage labels
    .trim()

  // Add 'km' if not present
  if (cleanMileage && !cleanMileage.toLowerCase().includes('km') && /\d/.test(cleanMileage)) {
    cleanMileage += ' km'
  }

  return cleanMileage || 'Tidak ditemukan'
}

/**
 * Clean and format year
 */
export function formatYear(year: string): string {
  if (!year || typeof year !== 'string') {
    return 'Tidak ditemukan'
  }

  const cleanYear = year
    .replace(/[{}"\[\]]/g, '') // Remove JSON characters
    .replace(/year:|tahun:/gi, '') // Remove year labels
    .trim()

  // Validate year (should be 4 digits between 1990-2030)
  const yearMatch = cleanYear.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    return yearMatch[0]
  }

  return cleanYear || 'Tidak ditemukan'
}

/**
 * Extract year from car title
 */
export function extractYearFromTitle(title: string): string {
  if (!title) return 'Tidak ditemukan'
  
  const yearMatch = title.match(/\b(19|20)\d{2}\b/)
  return yearMatch ? yearMatch[0] : 'Tidak ditemukan'
}

/**
 * Clean description text
 */
export function formatDescription(description: string): string {
  if (!description || typeof description !== 'string') {
    return 'Deskripsi tidak tersedia'
  }

  return description
    .replace(/[{}"\[\]]/g, '') // Remove JSON characters
    .replace(/description:|deskripsi:/gi, '') // Remove description labels
    .trim()
    .substring(0, 500) // Limit length
}

/**
 * Validate and clean car data
 */
export function cleanCarData(data: Record<string, unknown> | null | undefined): Record<string, unknown> | null | undefined {
  if (!data || typeof data !== 'object') {
    return data
  }

  return {
    ...data,
    title: formatCarTitle(data.title as string),
    price: formatPrice(data.price as string),
    year: formatYear(data.year as string),
    mileage: formatMileage(data.mileage as string),
    location: formatLocation(data.location as string),
    description: formatDescription(data.description as string)
  }
}