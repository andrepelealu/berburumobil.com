// Test business logic functions
describe('Business Logic', () => {
  describe('Price Calculation', () => {
    const calculateTotalAmount = (serviceType: string, addObd: boolean): number => {
      let total = serviceType === 'standard' ? 500000 : 750000
      if (addObd) total += 100000
      return total
    }

    test('calculates standard service price correctly', () => {
      expect(calculateTotalAmount('standard', false)).toBe(500000)
    })

    test('calculates express service price correctly', () => {
      expect(calculateTotalAmount('express', false)).toBe(750000)
    })

    test('adds OBD scan cost correctly', () => {
      expect(calculateTotalAmount('standard', true)).toBe(600000) // 500k + 100k
      expect(calculateTotalAmount('express', true)).toBe(850000)  // 750k + 100k
    })

    test('defaults to express price for unknown service types', () => {
      expect(calculateTotalAmount('unknown', false)).toBe(750000)
    })
  })

  describe('Booking ID Generation', () => {
    const generateBookingId = (): string => {
      const now = new Date()
      const timestamp = now.getFullYear().toString().substr(-2) + 
                       (now.getMonth() + 1).toString().padStart(2, '0') + 
                       now.getDate().toString().padStart(2, '0')
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      return `BM${timestamp}${random}`
    }

    test('generates booking ID with correct format', () => {
      const bookingId = generateBookingId()
      expect(bookingId).toMatch(/^BM\d{9}$/) // BM + 6 digits date + 3 digits random
      expect(bookingId).toHaveLength(11)
      expect(bookingId.startsWith('BM')).toBe(true)
    })

    test('generates unique booking IDs', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generateBookingId())
      }
      // Should have close to 100 unique IDs (allowing for small collision chance)
      expect(ids.size).toBeGreaterThan(90)
    })

    test('includes current date in booking ID', () => {
      const bookingId = generateBookingId()
      const now = new Date()
      const expectedDatePart = now.getFullYear().toString().substr(-2) + 
                              (now.getMonth() + 1).toString().padStart(2, '0') + 
                              now.getDate().toString().padStart(2, '0')
      
      expect(bookingId.substring(2, 8)).toBe(expectedDatePart)
    })
  })

  describe('Service Area Validation', () => {
    const isServiceAreaSupported = (location: string): boolean => {
      const supportedAreas = [
        'jakarta', 'bogor', 'depok', 'tangerang', 'bekasi',
        'bandung', 'surabaya', 'medan', 'semarang', 'yogyakarta'
      ]
      
      const normalizedLocation = location.toLowerCase().trim()
      return supportedAreas.some(area => normalizedLocation.includes(area))
    }

    test('accepts supported service areas', () => {
      expect(isServiceAreaSupported('Jakarta Selatan')).toBe(true)
      expect(isServiceAreaSupported('Bandung Utara')).toBe(true)
      expect(isServiceAreaSupported('Surabaya')).toBe(true)
    })

    test('rejects unsupported areas', () => {
      expect(isServiceAreaSupported('Bali')).toBe(false)
      expect(isServiceAreaSupported('Manado')).toBe(false)
      expect(isServiceAreaSupported('Pontianak')).toBe(false)
    })

    test('handles case-insensitive matching', () => {
      expect(isServiceAreaSupported('JAKARTA')).toBe(true)
      expect(isServiceAreaSupported('jakarta')).toBe(true)
      expect(isServiceAreaSupported('Jakarta')).toBe(true)
    })

    test('handles partial matching', () => {
      expect(isServiceAreaSupported('Kota Jakarta')).toBe(true)
      expect(isServiceAreaSupported('Tangerang Selatan')).toBe(true)
    })
  })

  describe('Time Slot Validation', () => {
    const isValidTimeSlot = (timeSlot: string): boolean => {
      const validSlots = [
        '09:00-12:00',
        '13:00-16:00', 
        '16:00-18:00'
      ]
      
      return validSlots.includes(timeSlot)
    }

    test('accepts valid time slots', () => {
      expect(isValidTimeSlot('09:00-12:00')).toBe(true)
      expect(isValidTimeSlot('13:00-16:00')).toBe(true)
      expect(isValidTimeSlot('16:00-18:00')).toBe(true)
    })

    test('rejects invalid time slots', () => {
      expect(isValidTimeSlot('08:00-11:00')).toBe(false)
      expect(isValidTimeSlot('19:00-22:00')).toBe(false)
      expect(isValidTimeSlot('invalid-time')).toBe(false)
    })

    test('handles empty time slot', () => {
      expect(isValidTimeSlot('')).toBe(false)
    })
  })
})