// Telegram Bot Integration for booking notifications

export interface TelegramNotificationData {
  bookingId: string
  customerName: string
  whatsapp: string
  serviceType: string
  adsLink?: string
  location: string
  preferredDate?: string
  preferredTime?: string
  totalAmount: number
  addObd: boolean
  notes?: string
}

export async function sendTelegramNotification(data: TelegramNotificationData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return { success: false, error: 'Telegram not configured' }
  }

  const message = formatBookingMessage(data)

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    })

    const result = await response.json()

    if (result.ok) {
      return { success: true, messageId: result.result.message_id }
    } else {
      return { success: false, error: result.description }
    }
  } catch (error) {
    return { success: false, error: 'Network error' }
  }
}

function formatBookingMessage(data: TelegramNotificationData): string {
  const serviceTypeText = data.serviceType === 'standard' ? 'Standard (Rp 500.000)' : 'Express (Rp 750.000)'
  const obdText = data.addObd ? ' + OBD Scan (Rp 100.000)' : ''
  
  return `
🚗 <b>BOOKING INSPEKSI BARU</b>

📋 <b>ID Booking:</b> ${data.bookingId}
👤 <b>Nama:</b> ${data.customerName}
📱 <b>WhatsApp:</b> ${data.whatsapp}
📍 <b>Lokasi:</b> ${data.location}

🔧 <b>Paket:</b> ${serviceTypeText}${obdText}
💰 <b>Total:</b> Rp ${data.totalAmount.toLocaleString('id-ID')}

${data.adsLink ? `🔗 <b>Link Mobil:</b> ${data.adsLink}` : ''}

${data.preferredDate ? `📅 <b>Tanggal Preferensi:</b> ${data.preferredDate}` : ''}
${data.preferredTime ? `⏰ <b>Waktu Preferensi:</b> ${data.preferredTime}` : ''}

${data.notes ? `📝 <b>Catatan:</b> ${data.notes}` : ''}

<b>Action Required:</b>
• Hubungi customer untuk konfirmasi jadwal
• Assign teknisi sesuai lokasi
• Update status booking

Chat customer: https://wa.me/${data.whatsapp.replace(/\D/g, '')}
`.trim()
}