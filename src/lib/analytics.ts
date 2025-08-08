import { createClientSafely } from '@/lib/supabase'

// Generate session ID that persists for the browser session
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-' + Date.now()
  
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Get device and browser info
function getDeviceInfo(userAgent: string) {
  const ua = userAgent.toLowerCase()
  
  let deviceType = 'desktop'
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet'
  }
  
  let browser = 'unknown'
  if (ua.includes('chrome')) browser = 'chrome'
  else if (ua.includes('firefox')) browser = 'firefox'
  else if (ua.includes('safari')) browser = 'safari'
  else if (ua.includes('edge')) browser = 'edge'
  else if (ua.includes('opera')) browser = 'opera'
  
  let os = 'unknown'
  if (ua.includes('windows')) os = 'windows'
  else if (ua.includes('mac')) os = 'macos'
  else if (ua.includes('linux')) os = 'linux'
  else if (ua.includes('android')) os = 'android'
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'ios'
  
  return { deviceType, browser, os }
}

// Get URL parameters
function getUrlParams() {
  if (typeof window === 'undefined') return {}
  
  const urlParams = new URLSearchParams(window.location.search)
  return {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    referrer: document.referrer || null
  }
}

// Get location from IP (free service)
async function getLocationFromIP(ip: string) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    if (response.ok) {
      const data = await response.json()
      return {
        country: data.country_name,
        city: data.city,
        region: data.region
      }
    }
  } catch (error) {
    // Silent failure for geolocation
  }
  return { country: null, city: null, region: null }
}

// Track page visit
export async function trackPageVisit(pagePath: string, userAgent?: string, ipAddress?: string) {
  try {
    const supabase = createClientSafely()
    const sessionId = getSessionId()
    const urlParams = getUrlParams()
    
    let location = { country: null, city: null, region: null }
    if (ipAddress) {
      location = await getLocationFromIP(ipAddress)
    }
    
    const deviceInfo = getDeviceInfo(userAgent || (typeof window !== 'undefined' ? navigator.userAgent : ''))
    
    // Track page visit
    const { error: visitError } = await supabase
      .from('analytics_page_visits')
      .insert({
        session_id: sessionId,
        user_agent: userAgent,
        ip_address: ipAddress,
        country: location.country,
        city: location.city,
        page_path: pagePath,
        referrer: urlParams.referrer,
        utm_source: urlParams.utm_source,
        utm_medium: urlParams.utm_medium,
        utm_campaign: urlParams.utm_campaign,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os
      })
    
    // Track/update session
    const { error: sessionError } = await supabase
      .from('analytics_sessions')
      .upsert({
        session_id: sessionId,
        ip_address: ipAddress,
        user_agent: userAgent,
        country: location.country,
        city: location.city,
        region: location.region,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        referrer: urlParams.referrer,
        utm_source: urlParams.utm_source,
        utm_medium: urlParams.utm_medium,
        utm_campaign: urlParams.utm_campaign,
        last_seen_at: new Date().toISOString()
      }, {
        onConflict: 'session_id',
        ignoreDuplicates: false
      })
    
    // Track daily unique visitor
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const { error: dailyError } = await supabase
      .from('analytics_daily_visitors')
      .upsert({
        date: today,
        session_id: sessionId,
        ip_address: ipAddress,
        country: location.country
      }, {
        onConflict: 'date,session_id',
        ignoreDuplicates: true
      })
    
  } catch (error) {
    // Silent failure - analytics shouldn't break user experience
  }
}

// Track form submission
export async function trackFormSubmission(
  formType: string, 
  formData: Record<string, any>, 
  success: boolean = true, 
  errorMessage?: string,
  userAgent?: string,
  ipAddress?: string
) {
  try {
    const supabase = createClientSafely()
    const sessionId = getSessionId()
    
    let location = { country: null, city: null, region: null }
    if (ipAddress) {
      location = await getLocationFromIP(ipAddress)
    }
    
    // Remove sensitive data from form data
    const sanitizedFormData = { ...formData }
    delete sanitizedFormData.password
    delete sanitizedFormData.whatsapp // Keep for analytics but don't log full number
    if (sanitizedFormData.whatsapp) {
      sanitizedFormData.whatsapp_provided = true
    }
    
    await supabase
      .from('analytics_form_submissions')
      .insert({
        session_id: sessionId,
        form_type: formType,
        ip_address: ipAddress,
        country: location.country,
        city: location.city,
        form_data: sanitizedFormData,
        success,
        error_message: errorMessage
      })
    
  } catch (error) {
    // Silent failure - analytics shouldn't break user experience
  }
}

// Track AI analysis
export async function trackAIAnalysis(
  carUrl: string,
  platform: string,
  success: boolean,
  processingTimeMs?: number,
  aiScore?: number,
  confidenceLevel?: number,
  errorMessage?: string,
  userAgent?: string,
  ipAddress?: string
) {
  try {
    const supabase = createClientSafely()
    const sessionId = getSessionId()
    
    let location = { country: null, city: null, region: null }
    if (ipAddress) {
      location = await getLocationFromIP(ipAddress)
    }
    
    await supabase
      .from('analytics_ai_analysis')
      .insert({
        session_id: sessionId,
        ip_address: ipAddress,
        country: location.country,
        city: location.city,
        car_url: carUrl,
        platform: platform,
        analysis_success: success,
        processing_time_ms: processingTimeMs,
        ai_score: aiScore,
        confidence_level: confidenceLevel,
        error_message: errorMessage
      })
    
  } catch (error) {
    // Silent failure - analytics shouldn't break user experience
  }
}

// Get user's IP address (for server-side usage)
export function getClientIP(request: Request): string | null {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for might contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return null
}

// Utility function to determine platform from URL
export function getPlatformFromUrl(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase()
  
  if (hostname.includes('olx.co.id')) return 'olx'
  if (hostname.includes('mobil123.com')) return 'mobil123'
  if (hostname.includes('facebook.com')) return 'facebook'
  if (hostname.includes('instagram.com')) return 'instagram'
  if (hostname.includes('tokopedia.com')) return 'tokopedia'
  if (hostname.includes('bukalapak.com')) return 'bukalapak'
  
  return 'unknown'
}