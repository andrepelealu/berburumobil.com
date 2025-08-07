// Test security functions and validation

describe('Security Validation', () => {
  describe('WhatsApp Number Formatting', () => {
    // Import the formatWhatsAppNumber function for testing
    const formatWhatsAppNumber = (phone: string): string => {
      let cleaned = phone.replace(/\D/g, '')
      
      if (cleaned.startsWith('08')) {
        cleaned = '62' + cleaned.substring(1)
      }
      
      if (!cleaned.startsWith('62') && cleaned.length >= 10) {
        cleaned = '62' + cleaned
      }
      
      return cleaned
    }

    test('converts Indonesian format to international', () => {
      expect(formatWhatsAppNumber('08123456789')).toBe('628123456789')
      expect(formatWhatsAppNumber('081234567890')).toBe('6281234567890')
    })

    test('handles existing international format', () => {
      expect(formatWhatsAppNumber('62123456789')).toBe('62123456789')
    })

    test('removes non-digit characters', () => {
      expect(formatWhatsAppNumber('+62-123-456-789')).toBe('62123456789')
      expect(formatWhatsAppNumber('(08) 123-456-789')).toBe('628123456789')
    })

    test('handles edge cases', () => {
      expect(formatWhatsAppNumber('0812345')).toBe('62812345') // Short number
      expect(formatWhatsAppNumber('1234567890')).toBe('621234567890') // No country code
    })
  })

  describe('URL Validation', () => {
    const validateCarUrl = (url: string): boolean => {
      try {
        const parsedUrl = new URL(url)
        const allowedDomains = ['olx.co.id', 'www.olx.co.id', 'mobil123.com', 'www.mobil123.com']
        
        return allowedDomains.some(domain => 
          parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
        ) && parsedUrl.protocol === 'https:'
      } catch {
        return false
      }
    }

    test('accepts valid OLX URLs', () => {
      expect(validateCarUrl('https://www.olx.co.id/item/honda-jazz-2015')).toBe(true)
      expect(validateCarUrl('https://olx.co.id/item/toyota-avanza')).toBe(true)
    })

    test('accepts valid Mobil123 URLs', () => {
      expect(validateCarUrl('https://www.mobil123.com/mobil-bekas/honda-jazz')).toBe(true)
      expect(validateCarUrl('https://mobil123.com/mobil-bekas/toyota')).toBe(true)
    })

    test('rejects invalid domains', () => {
      expect(validateCarUrl('https://facebook.com/marketplace')).toBe(false)
      expect(validateCarUrl('https://malicious-site.com')).toBe(false)
    })

    test('rejects non-HTTPS URLs', () => {
      expect(validateCarUrl('http://www.olx.co.id/item/honda-jazz')).toBe(false)
    })

    test('rejects malformed URLs', () => {
      expect(validateCarUrl('not-a-url')).toBe(false)
      expect(validateCarUrl('')).toBe(false)
    })
  })

  describe('Input Sanitization', () => {
    const sanitizeInput = (input: string, maxLength: number = 100): string => {
      return input.trim().substring(0, maxLength)
    }

    test('trims whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test')
      expect(sanitizeInput('\n\ttest\n\t')).toBe('test')
    })

    test('limits length', () => {
      const longString = 'a'.repeat(150)
      expect(sanitizeInput(longString, 100)).toHaveLength(100)
    })

    test('handles empty input', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput('   ')).toBe('')
    })
  })
})