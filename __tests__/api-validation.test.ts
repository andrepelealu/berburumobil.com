// Test API validation functions
describe('API Input Validation', () => {
  describe('Booking Data Validation', () => {
    const validateBookingData = (data: any): { isValid: boolean; errors: string[] } => {
      const errors: string[] = []
      
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
        errors.push('Nama tidak valid')
      }
      
      if (!data.whatsapp || typeof data.whatsapp !== 'string' || !/^\d+$/.test(data.whatsapp.replace(/[^\d]/g, ''))) {
        errors.push('Nomor WhatsApp tidak valid')
      }
      
      if (!data.location || typeof data.location !== 'string' || data.location.trim().length < 2) {
        errors.push('Lokasi tidak valid')
      }
      
      if (!['standard', 'express'].includes(data.serviceType)) {
        errors.push('Jenis layanan tidak valid')
      }
      
      if (data.carUrl && typeof data.carUrl !== 'string') {
        errors.push('URL mobil tidak valid')
      }
      
      return {
        isValid: errors.length === 0,
        errors
      }
    }

    test('validates correct booking data', () => {
      const validData = {
        name: 'John Doe',
        whatsapp: '08123456789',
        location: 'Jakarta Selatan',
        serviceType: 'standard',
        carUrl: 'https://www.olx.co.id/item/honda-jazz'
      }
      
      const result = validateBookingData(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('rejects invalid name', () => {
      const invalidData = {
        name: 'J', // Too short
        whatsapp: '08123456789',
        location: 'Jakarta Selatan',
        serviceType: 'standard'
      }
      
      const result = validateBookingData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Nama tidak valid')
    })

    test('rejects invalid WhatsApp number', () => {
      const invalidData = {
        name: 'John Doe',
        whatsapp: 'invalid-number',
        location: 'Jakarta Selatan',
        serviceType: 'standard'
      }
      
      const result = validateBookingData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Nomor WhatsApp tidak valid')
    })

    test('rejects invalid service type', () => {
      const invalidData = {
        name: 'John Doe',
        whatsapp: '08123456789',
        location: 'Jakarta Selatan',
        serviceType: 'premium' // Invalid service type
      }
      
      const result = validateBookingData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Jenis layanan tidak valid')
    })

    test('handles missing required fields', () => {
      const invalidData = {}
      
      const result = validateBookingData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Nama tidak valid')
      expect(result.errors).toContain('Nomor WhatsApp tidak valid')
      expect(result.errors).toContain('Lokasi tidak valid')
      expect(result.errors).toContain('Jenis layanan tidak valid')
    })
  })

  describe('URL Analysis Validation', () => {
    const validateAnalysisUrl = (url: string): { isValid: boolean; error?: string } => {
      if (!url || typeof url !== 'string') {
        return { isValid: false, error: 'URL diperlukan' }
      }

      const sanitizedUrl = url.trim().substring(0, 1000)
      
      try {
        const parsedUrl = new URL(sanitizedUrl)
        const allowedDomains = ['olx.co.id', 'www.olx.co.id', 'mobil123.com', 'www.mobil123.com']
        
        if (!allowedDomains.some(domain => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain))) {
          return { 
            isValid: false, 
            error: 'URL tidak didukung untuk analisis AI' 
          }
        }
        
        if (parsedUrl.protocol !== 'https:') {
          return { isValid: false, error: 'URL harus menggunakan HTTPS' }
        }
        
        return { isValid: true }
      } catch {
        return { isValid: false, error: 'Format URL tidak valid' }
      }
    }

    test('accepts valid OLX URLs', () => {
      const result = validateAnalysisUrl('https://www.olx.co.id/item/honda-jazz-2015')
      expect(result.isValid).toBe(true)
    })

    test('accepts valid Mobil123 URLs', () => {
      const result = validateAnalysisUrl('https://www.mobil123.com/mobil-bekas/honda-jazz')
      expect(result.isValid).toBe(true)
    })

    test('rejects unsupported domains', () => {
      const result = validateAnalysisUrl('https://facebook.com/marketplace')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('URL tidak didukung untuk analisis AI')
    })

    test('rejects HTTP URLs', () => {
      const result = validateAnalysisUrl('http://www.olx.co.id/item/honda-jazz')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('URL harus menggunakan HTTPS')
    })

    test('rejects malformed URLs', () => {
      const result = validateAnalysisUrl('not-a-url')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Format URL tidak valid')
    })

    test('handles empty URL', () => {
      const result = validateAnalysisUrl('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('URL diperlukan')
    })
  })
})