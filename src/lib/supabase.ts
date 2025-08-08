import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate that we have real Supabase credentials, not placeholder values
function isValidSupabaseConfig(url?: string, key?: string): boolean {
  if (!url || !key) return false
  
  // Check for placeholder values
  if (url.includes('your_supabase') || key.includes('your_supabase')) return false
  if (url === 'your_supabase_project_url_here' || key === 'your_supabase_anon_key_here') return false
  
  // Basic URL validation
  try {
    new URL(url)
    return url.includes('supabase.co') && key.length > 20
  } catch {
    return false
  }
}

// Create client only if we have valid config
let supabase: ReturnType<typeof createClient> | null = null
if (isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
  supabase = createClient(supabaseUrl!, supabaseAnonKey!)
}

export { supabase }

// Helper function to create client safely
export function createClientSafely() {
  if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
    throw new Error('Invalid or missing Supabase configuration')
  }
  return createClient(supabaseUrl!, supabaseAnonKey!)
}

// Helper function to create admin client with service role
function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!isValidSupabaseConfig(supabaseUrl, serviceRoleKey)) {
    throw new Error('Invalid or missing Supabase service role configuration')
  }
  return createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database Types
export interface Database {
  public: {
    Tables: {
      analytics_page_visits: {
        Row: {
          id: string
          session_id: string
          user_agent?: string
          ip_address?: string
          country?: string
          city?: string
          region?: string
          page_path: string
          referrer?: string
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
          device_type?: string
          browser?: string
          os?: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_agent?: string
          ip_address?: string
          country?: string
          city?: string
          region?: string
          page_path: string
          referrer?: string
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
          device_type?: string
          browser?: string
          os?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_agent?: string
          ip_address?: string
          country?: string
          city?: string
          region?: string
          page_path?: string
          referrer?: string
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
          device_type?: string
          browser?: string
          os?: string
          created_at?: string
        }
      }
      analytics_daily_visitors: {
        Row: {
          id: string
          date: string
          session_id: string
          ip_address?: string
          country?: string
          first_visit_at: string
          total_page_views: number
        }
        Insert: {
          id?: string
          date: string
          session_id: string
          ip_address?: string
          country?: string
          first_visit_at?: string
          total_page_views?: number
        }
        Update: {
          id?: string
          date?: string
          session_id?: string
          ip_address?: string
          country?: string
          first_visit_at?: string
          total_page_views?: number
        }
      }
      analytics_form_submissions: {
        Row: {
          id: string
          session_id: string
          form_type: string
          ip_address?: string
          country?: string
          city?: string
          form_data?: Record<string, unknown>
          success: boolean
          error_message?: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          form_type: string
          ip_address?: string
          country?: string
          city?: string
          form_data?: Record<string, unknown>
          success?: boolean
          error_message?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          form_type?: string
          ip_address?: string
          country?: string
          city?: string
          form_data?: Record<string, unknown>
          success?: boolean
          error_message?: string
          created_at?: string
        }
      }
      analytics_ai_analysis: {
        Row: {
          id: string
          session_id: string
          ip_address?: string
          country?: string
          city?: string
          car_url: string
          platform: string
          analysis_success: boolean
          processing_time_ms?: number
          ai_score?: number
          confidence_level?: number
          error_message?: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          ip_address?: string
          country?: string
          city?: string
          car_url: string
          platform: string
          analysis_success?: boolean
          processing_time_ms?: number
          ai_score?: number
          confidence_level?: number
          error_message?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          ip_address?: string
          country?: string
          city?: string
          car_url?: string
          platform?: string
          analysis_success?: boolean
          processing_time_ms?: number
          ai_score?: number
          confidence_level?: number
          error_message?: string
          created_at?: string
        }
      }
      analytics_sessions: {
        Row: {
          id: string
          session_id: string
          ip_address?: string
          user_agent?: string
          country?: string
          city?: string
          region?: string
          device_type?: string
          browser?: string
          os?: string
          referrer?: string
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
          first_seen_at: string
          last_seen_at: string
          total_page_views: number
          session_duration_seconds: number
        }
        Insert: {
          id?: string
          session_id: string
          ip_address?: string
          user_agent?: string
          country?: string
          city?: string
          region?: string
          device_type?: string
          browser?: string
          os?: string
          referrer?: string
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
          first_seen_at?: string
          last_seen_at?: string
          total_page_views?: number
          session_duration_seconds?: number
        }
        Update: {
          id?: string
          session_id?: string
          ip_address?: string
          user_agent?: string
          country?: string
          city?: string
          region?: string
          device_type?: string
          browser?: string
          os?: string
          referrer?: string
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
          first_seen_at?: string
          last_seen_at?: string
          total_page_views?: number
          session_duration_seconds?: number
        }
      }
      car_analyses: {
        Row: {
          id: string
          created_at: string
          car_url: string
          car_data: CarAnalysisData
          ai_score: number
          ai_analysis: AIAnalysisResult
          user_ip?: string
          status: 'success' | 'failed' | 'processing'
        }
        Insert: {
          id?: string
          created_at?: string
          car_url: string
          car_data: CarAnalysisData
          ai_score: number
          ai_analysis: AIAnalysisResult
          user_ip?: string
          status?: 'success' | 'failed' | 'processing'
        }
        Update: {
          id?: string
          created_at?: string
          car_url?: string
          car_data?: CarAnalysisData
          ai_score?: number
          ai_analysis?: AIAnalysisResult
          user_ip?: string
          status?: 'success' | 'failed' | 'processing'
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          booking_id: string
          customer_name: string
          whatsapp: string
          car_url: string
          ads_link?: string
          car_analysis_id?: string
          service_type: 'standard' | 'express'
          add_obd: boolean
          preferred_date?: string
          preferred_time?: string
          location: string
          total_amount: number
          payment_status: 'pending' | 'paid' | 'failed' | 'cancelled'
          payment_url?: string
          midtrans_order_id?: string
          inspection_status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          booking_id: string
          customer_name: string
          whatsapp: string
          car_url: string
          ads_link?: string
          car_analysis_id?: string
          service_type: 'standard' | 'express'
          add_obd?: boolean
          preferred_date?: string
          preferred_time?: string
          location: string
          total_amount: number
          payment_status?: 'pending' | 'paid' | 'failed' | 'cancelled'
          payment_url?: string
          midtrans_order_id?: string
          inspection_status?: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          booking_id?: string
          customer_name?: string
          whatsapp?: string
          car_url?: string
          ads_link?: string
          car_analysis_id?: string
          service_type?: 'standard' | 'express'
          add_obd?: boolean
          preferred_date?: string
          preferred_time?: string
          location?: string
          total_amount?: number
          payment_status?: 'pending' | 'paid' | 'failed' | 'cancelled'
          payment_url?: string
          midtrans_order_id?: string
          inspection_status?: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string
        }
      }
      inspection_reports: {
        Row: {
          id: string
          created_at: string
          booking_id: string
          technician_name?: string
          report_data: InspectionReportData
          photos: string[]
          overall_score: number
          recommendations: string[]
          estimated_repair_cost?: number
          status: 'draft' | 'completed' | 'sent'
        }
        Insert: {
          id?: string
          created_at?: string
          booking_id: string
          technician_name?: string
          report_data: InspectionReportData
          photos?: string[]
          overall_score: number
          recommendations?: string[]
          estimated_repair_cost?: number
          status?: 'draft' | 'completed' | 'sent'
        }
        Update: {
          id?: string
          created_at?: string
          booking_id?: string
          technician_name?: string
          report_data?: InspectionReportData
          photos?: string[]
          overall_score?: number
          recommendations?: string[]
          estimated_repair_cost?: number
          status?: 'draft' | 'completed' | 'sent'
        }
      }
    }
  }
}

export interface CarAnalysisData {
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

export interface AIAnalysisResult {
  score: number
  findings: string[]
  recommendation: string
  confidence: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  analysis: {
    exterior: {
      score: number
      findings: string[]
    }
    interior: {
      score: number
      findings: string[]
    }
    engine: {
      score: number
      findings: string[]
    }
  }
  estimatedValue: {
    min: number
    max: number
    fair: number
  }
}

export interface InspectionReportData {
  exterior: {
    bodyCondition: string
    paintCondition: string
    lights: string
    tires: string
    score: number
  }
  interior: {
    seats: string
    dashboard: string
    electronics: string
    aircon: string
    score: number
  }
  engine: {
    engineCondition: string
    transmission: string
    brakes: string
    suspension: string
    score: number
  }
  documents: {
    stnk: boolean
    bpkb: boolean
    faktur: boolean
    serviceRecord: boolean
  }
}

// Helper functions for database operations
export class DatabaseService {
  // Blog Operations
  static async saveBlogArticle(data: {
    title: string
    slug: string
    content: string
    excerpt: string
    keywords: string[]
    car_url: string
    car_info: Record<string, unknown>
    word_count: number
    seo_score: number
    ai_analysis?: {
      score: number
      confidence: number
    }
  }) {
    const supabase = createClientSafely()
    
    // Try to save with ai_analysis first
    const { data: result, error } = await supabase
      .from('blog_articles')
      .insert({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        keywords: data.keywords,
        car_url: data.car_url,
        car_info: data.car_info,
        word_count: data.word_count,
        seo_score: data.seo_score,
        ai_analysis: data.ai_analysis,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    // If it fails (possibly due to missing ai_analysis column), try without it
    if (error && error.message.includes('column "ai_analysis" of relation "blog_articles" does not exist')) {
      // Fallback to save without ai_analysis column
      const fallbackResult = await supabase
        .from('blog_articles')
        .insert({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt,
          keywords: data.keywords,
          car_url: data.car_url,
          car_info: data.car_info,
          word_count: data.word_count,
          seo_score: data.seo_score,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (fallbackResult.error) {
        throw new Error(`Failed to save blog article: ${fallbackResult.error.message}`)
      }
      
      return fallbackResult.data
    }

    if (error) {
      throw new Error(`Failed to save blog article: ${error.message}`)
    }

    return result
  }

  static async getBlogArticles(limit: number = 10, offset: number = 0) {
    const supabase = createClientSafely()
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error('Failed to fetch blog articles')
    }

    return data || []
  }

  static async getBlogArticleBySlug(slug: string) {
    const supabase = createClientSafely()
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error('Failed to fetch blog article')
    }

    return data
  }

  static async getBlogArticleByCarUrl(carUrl: string) {
    const supabase = createClientSafely()
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('car_url', carUrl)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error('Failed to fetch blog article')
    }

    return data
  }

  // Car Analysis Operations
  static async saveCarAnalysis(data: {
    car_url: string
    car_data: CarAnalysisData
    ai_score: number
    ai_analysis: AIAnalysisResult
    user_ip?: string
  }) {
    const supabase = createClientSafely()
    
    const { data: result, error } = await supabase
      .from('car_analyses')
      .insert({
        ...data,
        status: 'success'
      })
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async getCarAnalysis(id: string) {
    const supabase = createClientSafely()
    const { data, error } = await supabase
      .from('car_analyses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Get car analysis by URL (for caching)
  static async getCarAnalysisByUrl(carUrl: string) {
    const supabase = createClientSafely()
    
    const { data, error } = await supabase
      .from('car_analyses')
      .select('*')
      .eq('car_url', carUrl)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      throw error
    }
    
    if (data && data.length > 0) {
      return data[0]
    }
    
    return null
  }

  // Booking Operations
  static async createBooking(bookingData: Database['public']['Tables']['bookings']['Insert']) {
    const adminClient = createAdminClient() // Use service role for RLS bypass
    const { data, error } = await adminClient
      .from('bookings')
      .insert({
        ...bookingData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateBooking(id: string, updates: Database['public']['Tables']['bookings']['Update']) {
    const adminClient = createAdminClient() // Use service role for RLS bypass
    const { data, error } = await adminClient
      .from('bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getBooking(bookingId: string) {
    const supabase = createClientSafely()
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (error) throw error
    return data
  }

  static async getBookingsByStatus(status: Database['public']['Tables']['bookings']['Row']['payment_status']) {
    const supabase = createClientSafely()
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('payment_status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Inspection Report Operations
  static async createInspectionReport(reportData: Database['public']['Tables']['inspection_reports']['Insert']) {
    const supabase = createClientSafely()
    const { data, error } = await supabase
      .from('inspection_reports')
      .insert(reportData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getInspectionReport(bookingId: string) {
    const supabase = createClientSafely()
    const { data, error } = await supabase
      .from('inspection_reports')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (error) throw error
    return data
  }
}