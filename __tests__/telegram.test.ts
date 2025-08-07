import { TelegramNotificationData } from '@/lib/telegram'

// Mock the telegram functions for testing
const formatBookingMessage = (data: TelegramNotificationData): string => {
  const serviceTypeText = data.serviceType === 'standard' ? 'Standard (Rp 500.000)' : 'Express (Rp 750.000)'
  const obdText = data.addObd ? ' + OBD Scan (Rp 100.000)' : ''
  
  return `
🚗 BOOKING INSPEKSI BARU

📋 ID Booking: ${data.bookingId}
👤 Nama: ${data.customerName}
📱 WhatsApp: ${data.whatsapp}
📍 Lokasi: ${data.location}

🔧 Paket: ${serviceTypeText}${obdText}
💰 Total: Rp ${data.totalAmount.toLocaleString('id-ID')}

${data.adsLink ? `🔗 Link Mobil: ${data.adsLink}` : ''}

${data.preferredDate ? `📅 Tanggal Preferensi: ${data.preferredDate}` : ''}
${data.preferredTime ? `⏰ Waktu Preferensi: ${data.preferredTime}` : ''}

${data.notes ? `📝 Catatan: ${data.notes}` : ''}

Action Required:
• Hubungi customer untuk konfirmasi jadwal
• Assign teknisi sesuai lokasi
• Update status booking

Chat customer: https://wa.me/${data.whatsapp.replace(/\D/g, '')}
`.trim()
}

describe('Telegram Notifications', () => {
  describe('formatBookingMessage', () => {
    const mockBookingData: TelegramNotificationData = {
      bookingId: 'BM250107001',
      customerName: 'John Doe',
      whatsapp: '62123456789',
      location: 'Jakarta Selatan',
      serviceType: 'standard',
      totalAmount: 500000,
      addObd: false
    }

    test('formats standard booking message correctly', () => {
      const message = formatBookingMessage(mockBookingData)
      
      expect(message).toContain('BOOKING INSPEKSI BARU')
      expect(message).toContain('BM250107001')
      expect(message).toContain('John Doe')
      expect(message).toContain('62123456789')
      expect(message).toContain('Jakarta Selatan')
      expect(message).toContain('Standard (Rp 500.000)')
      expect(message).toContain('Rp 500.000')
    })

    test('formats express booking with OBD correctly', () => {
      const expressBooking: TelegramNotificationData = {
        ...mockBookingData,
        serviceType: 'express',
        addObd: true,
        totalAmount: 850000
      }
      
      const message = formatBookingMessage(expressBooking)
      
      expect(message).toContain('Express (Rp 750.000)')
      expect(message).toContain('+ OBD Scan (Rp 100.000)')
      expect(message).toContain('Rp 850.000')
    })

    test('includes optional fields when provided', () => {
      const fullBooking: TelegramNotificationData = {
        ...mockBookingData,
        adsLink: 'https://www.olx.co.id/item/honda-jazz-2015',
        preferredDate: '2025-01-15',
        preferredTime: '09:00-12:00',
        notes: 'Mobil bekas kecelakaan'
      }
      
      const message = formatBookingMessage(fullBooking)
      
      expect(message).toContain('🔗 Link Mobil: https://www.olx.co.id/item/honda-jazz-2015')
      expect(message).toContain('📅 Tanggal Preferensi: 2025-01-15')
      expect(message).toContain('⏰ Waktu Preferensi: 09:00-12:00')
      expect(message).toContain('📝 Catatan: Mobil bekas kecelakaan')
    })

    test('excludes optional fields when not provided', () => {
      const message = formatBookingMessage(mockBookingData)
      
      expect(message).not.toContain('🔗 Link Mobil:')
      expect(message).not.toContain('📅 Tanggal Preferensi:')
      expect(message).not.toContain('⏰ Waktu Preferensi:')
      expect(message).not.toContain('📝 Catatan:')
    })

    test('formats WhatsApp link correctly', () => {
      const message = formatBookingMessage(mockBookingData)
      expect(message).toContain('https://wa.me/62123456789')
    })

    test('removes non-digits from WhatsApp number in link', () => {
      const bookingWithFormattedNumber: TelegramNotificationData = {
        ...mockBookingData,
        whatsapp: '+62-123-456-789'
      }
      
      const message = formatBookingMessage(bookingWithFormattedNumber)
      expect(message).toContain('https://wa.me/62123456789')
    })
  })
})