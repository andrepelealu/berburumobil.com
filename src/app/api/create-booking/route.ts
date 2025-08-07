import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'
import { sendTelegramNotification } from '@/lib/telegram'

function formatWhatsAppNumber(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '')
  
  // Convert Indonesian local format (08) to international (62)
  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.substring(1)
  }
  
  // Ensure it starts with 62 for Indonesian numbers
  if (!cleaned.startsWith('62') && cleaned.length >= 10) {
    cleaned = '62' + cleaned
  }
  
  return cleaned
}

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()
    
    // Input validation
    if (!bookingData.name || typeof bookingData.name !== 'string' || bookingData.name.trim().length < 2) {
      return NextResponse.json({ error: 'Nama tidak valid' }, { status: 400 })
    }
    if (!bookingData.whatsapp || typeof bookingData.whatsapp !== 'string' || !/^\d+$/.test(bookingData.whatsapp.replace(/[^\d]/g, ''))) {
      return NextResponse.json({ error: 'Nomor WhatsApp tidak valid' }, { status: 400 })
    }
    if (!bookingData.location || typeof bookingData.location !== 'string' || bookingData.location.trim().length < 2) {
      return NextResponse.json({ error: 'Lokasi tidak valid' }, { status: 400 })
    }
    if (!['standard', 'express'].includes(bookingData.serviceType)) {
      return NextResponse.json({ error: 'Jenis layanan tidak valid' }, { status: 400 })
    }
    if (bookingData.carUrl && typeof bookingData.carUrl !== 'string') {
      return NextResponse.json({ error: 'URL mobil tidak valid' }, { status: 400 })
    }
    
    // Sanitize inputs
    const sanitizedData = {
      name: bookingData.name.trim().substring(0, 100),
      whatsapp: bookingData.whatsapp.replace(/[^\d]/g, ''),
      location: bookingData.location.trim().substring(0, 200),
      serviceType: bookingData.serviceType,
      carUrl: bookingData.carUrl ? bookingData.carUrl.trim().substring(0, 500) : '',
      adsLink: bookingData.adsLink ? bookingData.adsLink.trim().substring(0, 500) : '',
      notes: bookingData.notes ? bookingData.notes.trim().substring(0, 1000) : '',
      addObd: Boolean(bookingData.addObd),
      preferredDate: bookingData.preferredDate || '',
      preferredTime: bookingData.preferredTime || ''
    }
    
    // Generate unique booking ID
    const bookingId = generateBookingId()
    
    // Format WhatsApp number
    const formattedWhatsApp = formatWhatsAppNumber(sanitizedData.whatsapp)
    
    // Calculate total amount for reference
    const totalAmount = calculateTotalAmount(sanitizedData.serviceType, sanitizedData.addObd)
    
    // Create booking in database with confirmed status (no payment needed)
    const bookingPayload = {
      booking_id: bookingId,
      customer_name: sanitizedData.name,
      whatsapp: formattedWhatsApp,
      car_url: sanitizedData.carUrl,
      service_type: sanitizedData.serviceType,
      add_obd: sanitizedData.addObd,
      preferred_date: sanitizedData.preferredDate,
      preferred_time: sanitizedData.preferredTime,
      location: sanitizedData.location,
      total_amount: totalAmount,
      notes: sanitizedData.notes,
      payment_status: 'pending' as const, // Will be updated manually by admin
      inspection_status: 'pending' as const
    }

    const booking = await DatabaseService.createBooking(bookingPayload)
    
    // Send Telegram notification in background (don't wait for response)
    sendTelegramNotification({
      bookingId: booking.booking_id,
      customerName: booking.customer_name,
      whatsapp: booking.whatsapp,
      serviceType: booking.service_type,
      adsLink: sanitizedData.adsLink, // Use sanitized data
      location: booking.location,
      preferredDate: booking.preferred_date,
      preferredTime: booking.preferred_time,
      totalAmount: booking.total_amount,
      addObd: booking.add_obd,
      notes: booking.notes
    }).catch(telegramError => {
      // Silent fail - notification happens in background
    })
    
    return NextResponse.json({
      success: true,
      bookingId: booking.booking_id,
      status: 'confirmed',
      message: 'Booking berhasil dibuat! Kami akan menghubungi Anda segera untuk konfirmasi jadwal.',
      totalAmount,
      booking: {
        id: booking.booking_id,
        customerName: booking.customer_name,
        whatsapp: formattedWhatsApp,
        serviceType: booking.service_type,
        adsLink: sanitizedData.adsLink, // Use sanitized data
        preferredDate: booking.preferred_date,
        preferredTime: booking.preferred_time,
        location: booking.location,
        totalAmount: booking.total_amount
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Gagal membuat booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function calculateTotalAmount(serviceType: string, addObd: boolean): number {
  let total = serviceType === 'standard' ? 500000 : 750000
  if (addObd) total += 100000
  return total
}


function generateBookingId() {
  const now = new Date()
  const timestamp = now.getFullYear().toString().substr(-2) + 
                   (now.getMonth() + 1).toString().padStart(2, '0') + 
                   now.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `BM${timestamp}${random}`
}