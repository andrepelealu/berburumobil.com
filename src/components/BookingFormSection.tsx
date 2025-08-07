'use client'

import { useState, useEffect } from 'react'
import { PhoneIcon, CalendarIcon, LinkIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CarInfo {
  title?: string
  price?: string
  year?: string
  mileage?: string
}

interface AIAnalysis {
  carInfo?: CarInfo
  score?: number
  recommendation?: string
  confidence?: number
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
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
  // Error handling properties
  error?: boolean
  errorMessage?: string
  errorDetails?: string
  isUnsupportedUrl?: boolean
  // Cache properties
  _cached?: boolean
  _freshAnalysis?: boolean
  _cacheDate?: string
}

export default function BookingFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    carUrl: '',
    adsLink: '',
    carDetails: '',
    serviceType: 'standard',
    addObd: false,
    preferredDate: '',
    preferredTime: '',
    location: '',
    notes: ''
  })

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingResult, setBookingResult] = useState<{
    success: boolean
    bookingId?: string
    message?: string
    error?: string
    totalAmount?: number
    booking?: {
      id: string
      customerName: string
      whatsapp: string
      serviceType: string
      adsLink: string
      preferredDate: string
      preferredTime: string
      location: string
      totalAmount: number
    }
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAiSection, setShowAiSection] = useState(false)

  // Handle URL input from hero section
  useEffect(() => {
    const handleHeroUrlSubmitted = (event: CustomEvent) => {
      const url = event.detail?.url
      if (url) {
        setFormData(prev => ({
          ...prev,
          carUrl: url,
          adsLink: url // Also fill ads link for booking
        }))
        setShowAiSection(true) // Auto-expand AI section
      }
    }

    const handlePackageSelected = (event: CustomEvent) => {
      const { packageId } = event.detail
      if (packageId) {
        setFormData(prev => ({
          ...prev,
          serviceType: packageId === 'express' ? 'express' : 'standard'
        }))
      }
    }

    // Check for stored URL on component mount
    const storedUrl = sessionStorage.getItem('heroCarUrl')
    if (storedUrl) {
      setFormData(prev => ({
        ...prev,
        carUrl: storedUrl,
        adsLink: storedUrl
      }))
      sessionStorage.removeItem('heroCarUrl')
      setShowAiSection(true)
    }

    // Check for selected package on component mount
    const selectedPackage = sessionStorage.getItem('selectedPackage')
    if (selectedPackage) {
      setFormData(prev => ({
        ...prev,
        serviceType: selectedPackage === 'express' ? 'express' : 'standard'
      }))
      sessionStorage.removeItem('selectedPackage')
    }

    window.addEventListener('heroUrlSubmitted', handleHeroUrlSubmitted as EventListener)
    window.addEventListener('packageSelected', handlePackageSelected as EventListener)

    return () => {
      window.removeEventListener('heroUrlSubmitted', handleHeroUrlSubmitted as EventListener)
      window.removeEventListener('packageSelected', handlePackageSelected as EventListener)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleAnalyzeUrl = async () => {
    if (!formData.carUrl.trim()) return
    
    setIsAnalyzing(true)
    setAiAnalysis(null) // Clear previous results
    
    try {
      const response = await fetch('/api/analyze-car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.carUrl })
      })
      
      const result = await response.json()
      
      if (!response.ok || result.error) {
        // Handle API error (400, 500, etc.)
        const isUnsupportedUrl = response.status === 400 && (
          result.error?.includes('tidak didukung') || 
          result.error?.includes('URL tidak valid') ||
          result.error?.includes('tidak sesuai dengan format')
        )
        
        setAiAnalysis({
          error: true,
          errorMessage: isUnsupportedUrl ? 
            'URL tidak didukung untuk analisis AI' : 
            result.error || 'Gagal menganalisis mobil',
          errorDetails: isUnsupportedUrl ? 
            'Hanya link dari OLX.co.id dan Mobil123.com yang didukung untuk analisis AI otomatis.' :
            result.details,
          isUnsupportedUrl
        })
        return
      }
      
      setAiAnalysis(result)
    } catch (error) {
      setAiAnalysis({
        error: true,
        errorMessage: 'Terjadi kesalahan saat menganalisis mobil',
        errorDetails: 'Silakan coba lagi atau hubungi customer service'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateTotal = () => {
    let total = formData.serviceType === 'standard' ? 500000 : 750000
    if (formData.addObd) total += 100000
    return total
  }

  const handleBooking = async () => {
    setIsSubmitting(true)
    
    try {
      const bookingData = {
        ...formData,
        aiAnalysis,
        totalAmount: calculateTotal()
      }

      const response = await fetch('/api/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      const result = await response.json()
      
      if (result.success) {
        setBookingResult(result)
        setShowConfirmation(true)
      } else {
        throw new Error(result.error || 'Failed to create booking')
      }
    } catch (error) {
      alert('Gagal membuat booking. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="booking-form" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Booking Inspeksi Mobil Profesional
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Dapatkan inspeksi teknisi berpengalaman untuk mobil dari platform manapun
          </p>
          <div className="bg-blue-50 rounded-lg p-4 max-w-3xl mx-auto">
            <p className="text-blue-800 mb-3">
              ⚡ <strong>Analisis AI Gratis:</strong> Tersedia untuk mobil dari <strong>OLX</strong> dan <strong>Mobil123</strong>
            </p>
            <p className="text-blue-700 text-sm">
              🔧 <strong>Inspeksi Manual:</strong> Mendukung semua platform (Facebook Marketplace, Instagram, CarGurus, dll.)
            </p>
          </div>
        </div>

        {/* Optional AI Analysis Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              ⚡ Analisis AI Gratis (Opsional)
            </h3>
            <button
              onClick={() => setShowAiSection(!showAiSection)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showAiSection ? '🔽 Tutup' : '🔼 Buka Analisis AI'}
            </button>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm">
            Dapatkan scoring kondisi mobil (0-100) untuk mobil dari <strong>OLX</strong> dan <strong>Mobil123</strong>
          </p>

          {showAiSection && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LinkIcon className="h-4 w-4 inline mr-2" />
                  Link Mobil (Hanya OLX dan Mobil123)
                </label>
                <input
                  type="url"
                  name="carUrl"
                  value={formData.carUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.olx.co.id/item/... atau https://www.mobil123.com/..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Platform lain (Facebook, Instagram, dll.) tidak didukung untuk analisis AI
                </p>
              </div>

              <button
                onClick={handleAnalyzeUrl}
                disabled={!formData.carUrl.trim() || isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
              >
                {isAnalyzing ? 'Menganalisis...' : '🤖 Analisis AI Sekarang'}
              </button>
            </div>
          )}
        </div>

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            {aiAnalysis.error ? (
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-4">
                  ❌ Analisis AI Gagal
                </h3>
                
                {aiAnalysis.isUnsupportedUrl ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XMarkIcon className="w-8 h-8 text-red-600" />
                      </div>
                      <h4 className="text-lg font-bold text-red-900 mb-2">
                        URL Tidak Didukung untuk Analisis AI
                      </h4>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-red-800 mb-3">
                        <strong>❌ Platform yang Anda masukkan tidak didukung untuk analisis AI.</strong>
                      </p>
                      <p className="text-red-700 text-sm mb-4">
                        {aiAnalysis.errorMessage}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-bold text-green-900 mb-2">✅ Platform Didukung AI:</h5>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• OLX.co.id</li>
                          <li>• Mobil123.com</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-bold text-blue-900 mb-2">🔧 Solusi Terbaik:</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Gunakan <strong>inspeksi manual</strong></li>
                          <li>• Lebih akurat dari AI</li>
                          <li>• Mendukung semua platform</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <p className="text-yellow-800 font-medium mb-2">
                        💡 Langsung booking inspeksi manual di bawah - hasilnya lebih akurat!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium mb-2">{aiAnalysis.errorMessage}</p>
                    {aiAnalysis.errorDetails && (
                      <p className="text-red-700 text-sm">{aiAnalysis.errorDetails}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  ✅ Hasil Analisis AI
                </h3>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Informasi Mobil</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong className="text-gray-900">Model:</strong> {aiAnalysis.carInfo?.title || 'Honda Jazz RS 2018'}</p>
                      <p><strong className="text-gray-900">Harga:</strong> {aiAnalysis.carInfo?.price || 'Rp 175.000.000'}</p>
                      <p><strong className="text-gray-900">Tahun:</strong> {aiAnalysis.carInfo?.year || '2018'}</p>
                      <p><strong className="text-gray-900">KM:</strong> {aiAnalysis.carInfo?.mileage || '45.000 km'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🔍 AI Condition Score</h4>
                    <div className="flex items-center mb-3">
                      <span className={`text-4xl font-bold mr-3 ${
                        (aiAnalysis.score || 78) >= 85 ? 'text-green-600' :
                        (aiAnalysis.score || 78) >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {aiAnalysis.score || 78}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-600">/100</span>
                        {aiAnalysis.confidence && (
                          <span className="text-xs text-gray-500">
                            Confidence: {aiAnalysis.confidence}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className={`h-3 rounded-full ${
                          (aiAnalysis.score || 78) >= 85 ? 'bg-green-500' :
                          (aiAnalysis.score || 78) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${aiAnalysis.score || 78}%` }}
                      ></div>
                    </div>
                    
                    {/* Cache indicator */}
                    {aiAnalysis._cached && (
                      <div className="flex items-center text-xs text-gray-500 mb-3 bg-gray-50 px-2 py-1 rounded">
                        <span className="mr-1">⚡</span>
                        <span>Hasil tersimpan (analisis sebelumnya)</span>
                        {aiAnalysis._cacheDate && (
                          <span className="ml-1">
                            • {new Date(aiAnalysis._cacheDate).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                    )}
                    {aiAnalysis._freshAnalysis && (
                      <div className="flex items-center text-xs text-blue-600 mb-3 bg-blue-50 px-2 py-1 rounded">
                        <span className="mr-1">🆕</span>
                        <span>Analisis baru</span>
                      </div>
                    )}
                    {aiAnalysis.riskLevel && (
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        aiAnalysis.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                        aiAnalysis.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Risk Level: {aiAnalysis.riskLevel}
                      </div>
                    )}
                  </div>
                </div>

                {aiAnalysis.scamRisk && (
                  <div className={`mt-6 p-4 rounded-lg border-2 ${
                    aiAnalysis.scamRisk.level === 'VERY_HIGH' || aiAnalysis.scamRisk.level === 'HIGH' ? 
                      'bg-red-50 border-red-300' :
                    aiAnalysis.scamRisk.level === 'MEDIUM' ? 
                      'bg-yellow-50 border-yellow-300' :
                      'bg-green-50 border-green-300'
                  }`}>
                    <h5 className={`font-semibold mb-2 ${
                      aiAnalysis.scamRisk.level === 'VERY_HIGH' || aiAnalysis.scamRisk.level === 'HIGH' ? 
                        'text-red-900' :
                      aiAnalysis.scamRisk.level === 'MEDIUM' ? 
                        'text-yellow-900' :
                        'text-green-900'
                    }`}>
                      🚨 Analisis Risiko Penipuan: {
                        aiAnalysis.scamRisk.level === 'VERY_HIGH' ? 'SANGAT TINGGI' :
                        aiAnalysis.scamRisk.level === 'HIGH' ? 'TINGGI' :
                        aiAnalysis.scamRisk.level === 'MEDIUM' ? 'SEDANG' :
                        aiAnalysis.scamRisk.level === 'LOW' ? 'RENDAH' : 'SANGAT RENDAH'
                      }
                    </h5>
                    
                    {aiAnalysis.scamRisk.indicators.length > 0 && (
                      <div className="mb-3">
                        <strong className="text-sm">⚠️ Indikator Risiko:</strong>
                        <ul className={`list-disc list-inside text-sm mt-1 ${
                          aiAnalysis.scamRisk.level === 'VERY_HIGH' || aiAnalysis.scamRisk.level === 'HIGH' ? 
                            'text-red-800' :
                          aiAnalysis.scamRisk.level === 'MEDIUM' ? 
                            'text-yellow-800' :
                            'text-green-800'
                        }`}>
                          {aiAnalysis.scamRisk.indicators.map((indicator, index) => (
                            <li key={index}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <strong>💰 Analisis Harga:</strong>
                        <p className={`mt-1 ${
                          aiAnalysis.scamRisk.level === 'VERY_HIGH' || aiAnalysis.scamRisk.level === 'HIGH' ? 
                            'text-red-700' :
                          aiAnalysis.scamRisk.level === 'MEDIUM' ? 
                            'text-yellow-700' :
                            'text-green-700'
                        }`}>{aiAnalysis.scamRisk.priceAnalysis}</p>
                      </div>
                      <div>
                        <strong>📷 Kualitas Foto:</strong>
                        <p className={`mt-1 ${
                          aiAnalysis.scamRisk.level === 'VERY_HIGH' || aiAnalysis.scamRisk.level === 'HIGH' ? 
                            'text-red-700' :
                          aiAnalysis.scamRisk.level === 'MEDIUM' ? 
                            'text-yellow-700' :
                            'text-green-700'
                        }`}>{aiAnalysis.scamRisk.photoQuality}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">🤖 Rekomendasi AI:</h5>
                  <p className="text-blue-800 text-sm">
                    {aiAnalysis.recommendation || 'Mobil dalam kondisi baik berdasarkan analisis foto. Disarankan untuk inspeksi teknisi untuk memastikan kondisi mesin dan komponen dalam.'}
                  </p>
                </div>

                {aiAnalysis.detailedAnalysis && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-900 mb-2">🚗 Eksterior</h5>
                      <ul className="text-sm text-green-800 space-y-1">
                        {aiAnalysis.detailedAnalysis.exterior.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="font-semibold text-purple-900 mb-2">🪑 Interior</h5>
                      <ul className="text-sm text-purple-800 space-y-1">
                        {aiAnalysis.detailedAnalysis.interior.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-600 mr-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h5 className="font-semibold text-orange-900 mb-2">⚙️ Mesin & Teknis</h5>
                      <ul className="text-sm text-orange-800 space-y-1">
                        {aiAnalysis.detailedAnalysis.engine.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-600 mr-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {aiAnalysis.detailedAnalysis.photoQuality && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-900 mb-2">📷 Kualitas Foto</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {aiAnalysis.detailedAnalysis.photoQuality.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-600 mr-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {aiAnalysis.detailedAnalysis?.overall && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-900 mb-2">📋 Kesimpulan Keseluruhan</h5>
                    <p className="text-sm text-gray-700">{aiAnalysis.detailedAnalysis.overall}</p>
                  </div>
                )}

                {/* Enhanced CTA based on AI Analysis with Updated Thresholds */}
                <div className={`mt-6 p-4 rounded-lg border-2 ${
                  (aiAnalysis.score || 75) <= 60 ? 'bg-red-50 border-red-300' :
                  (aiAnalysis.score || 75) <= 75 ? 'bg-yellow-50 border-yellow-300' :
                  (aiAnalysis.score || 75) <= 85 ? 'bg-blue-50 border-blue-300' :
                  'bg-green-50 border-green-300'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {(aiAnalysis.score || 75) <= 60 ? '🚨' :
                       (aiAnalysis.score || 75) <= 75 ? '⚠️' :
                       (aiAnalysis.score || 75) <= 85 ? '🔍' : '✅'}
                    </div>
                    <div className="flex-1">
                      <h5 className={`font-bold mb-2 ${
                        (aiAnalysis.score || 75) <= 60 ? 'text-red-900' :
                        (aiAnalysis.score || 75) <= 75 ? 'text-yellow-900' :
                        (aiAnalysis.score || 75) <= 85 ? 'text-blue-900' :
                        'text-green-900'
                      }`}>
                        {(aiAnalysis.score || 75) <= 60 ? 'RISIKO TINGGI - Inspeksi WAJIB!' :
                         (aiAnalysis.score || 75) <= 75 ? 'PERLU KEHATI-HATIAN - Inspeksi Disarankan' :
                         (aiAnalysis.score || 75) <= 85 ? 'Inspeksi Teknisi untuk Keamanan Maksimal' :
                         'KONDISI BAIK - Inspeksi untuk Ketenangan Pikiran'}
                      </h5>
                      <p className={`text-sm mb-3 ${
                        (aiAnalysis.score || 75) <= 60 ? 'text-red-800' :
                        (aiAnalysis.score || 75) <= 75 ? 'text-yellow-800' :
                        (aiAnalysis.score || 75) <= 85 ? 'text-blue-800' :
                        'text-green-800'
                      }`}>
                        {(aiAnalysis.score || 75) <= 60 ? 
                          'AI mendeteksi risiko tinggi pada mobil ini. JANGAN membeli tanpa inspeksi teknisi profesional!' :
                         (aiAnalysis.score || 75) <= 75 ? 
                          'AI mendeteksi beberapa area yang perlu perhatian. Inspeksi teknisi sangat direkomendasikan.' :
                         (aiAnalysis.score || 75) <= 85 ?
                          'Kondisi terlihat cukup baik dari analisis foto. Inspeksi teknisi akan memastikan tidak ada masalah tersembunyi.' :
                          'Kondisi mobil terlihat sangat baik! Inspeksi teknisi memberikan jaminan kualitas dan ketenangan pikiran.'}
                      </p>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className={`font-medium ${
                          (aiAnalysis.score || 75) <= 60 ? 'text-red-700' :
                          (aiAnalysis.score || 75) <= 75 ? 'text-yellow-700' :
                          (aiAnalysis.score || 75) <= 85 ? 'text-blue-700' :
                          'text-green-700'
                        }`}>
                          ✅ Inspeksi 120+ poin • ✅ Laporan detail • ✅ Garansi hasil • ✅ Teknisi bersertifikat
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Booking Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📋 Booking Inspeksi Teknisi Profesional
          </h3>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm text-center">
              🚗 <strong>Mendukung Semua Platform:</strong> OLX, Mobil123, Instagram, CarGurus, dan platform lainnya
            </p>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="h-4 w-4 inline mr-2" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="08123456789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon className="h-4 w-4 inline mr-2" />
                    Link Iklan Mobil yang Ingin Diinspeksi
                  </label>
                  <input
                    type="url"
                    name="adsLink"
                    value={formData.adsLink}
                    onChange={handleInputChange}
                    placeholder="https://www.olx.co.id/item/... atau Facebook Marketplace, Mobil123, dll"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    📍 Link mobil untuk booking inspeksi (dari platform manapun)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paket Inspeksi
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                  >
                    <option value="standard">Standard - Rp 500.000 (2-3 hari)</option>
                    <option value="express">Express - Rp 750.000 (same day)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi Inspeksi
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Jakarta Selatan"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-2" />
                    Tanggal Preferensi
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Preferensi
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                  >
                    <option value="">Pilih waktu</option>
                    <option value="09:00-12:00">Pagi (09:00-12:00)</option>
                    <option value="13:00-16:00">Siang (13:00-16:00)</option>
                    <option value="16:00-18:00">Sore (16:00-18:00)</option>
                  </select>
                </div>
              </div>

              <div className="mb-8">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="addObd"
                    checked={formData.addObd}
                    onChange={handleInputChange}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Tambah OBD Scan (+Rp 100.000) - Untuk mobil 2010+ atau bekas kecelakaan
                  </span>
                </label>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Biaya:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

          <div className="flex justify-center">
            <button
              onClick={handleBooking}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-8 rounded-lg transition duration-300 flex items-center justify-center min-w-[300px]"
            >
              <CheckIcon className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Memproses...' : '🚗 Booking Inspeksi Sekarang'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ✅ Booking gratis • Kami akan menghubungi untuk konfirmasi jadwal • Pembayaran saat inspeksi
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-2">
              📞 Butuh Bantuan?
            </h3>
            <p className="text-green-800 mb-4">
              Hubungi customer service kami via WhatsApp untuk konsultasi gratis
            </p>
            <a
              href="https://wa.me/6282234007743?text=Halo,%20saya%20ingin%20konsultasi%20tentang%20inspeksi%20mobil"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              <PhoneIcon className="h-4 w-4 mr-2" />
              Chat WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Confirmation Popup Modal */}
      {showConfirmation && bookingResult && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 Booking Berhasil!
                </h2>
                <p className="text-gray-600">
                  {bookingResult.message}
                </p>
              </div>

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">📋 Detail Booking</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Booking:</span>
                    <span className="font-medium text-blue-600">{bookingResult.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-medium text-gray-900">{bookingResult.booking?.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">WhatsApp:</span>
                    <span className="font-medium text-gray-900">{bookingResult.booking?.whatsapp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paket:</span>
                    <span className="font-medium text-gray-900 capitalize">{bookingResult.booking?.serviceType}</span>
                  </div>
                  {bookingResult.booking?.adsLink && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Link Mobil:</span>
                      <a 
                        href={bookingResult.booking.adsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline truncate max-w-[200px]"
                      >
                        {bookingResult.booking.adsLink}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Total Biaya:</span>
                    <span className="font-bold text-green-600">
                      Rp {bookingResult.totalAmount?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">🚀 Langkah Selanjutnya</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-0.5 font-medium">1️⃣</span>
                    <span className="text-gray-800">Kami akan menghubungi Anda via WhatsApp dalam 1-2 jam untuk konfirmasi jadwal inspeksi</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-0.5 font-medium">2️⃣</span>
                    <span className="text-gray-800">Teknisi kami akan datang sesuai jadwal yang disepakati</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-0.5 font-medium">3️⃣</span>
                    <span className="text-gray-800">Pembayaran dilakukan cash kepada teknisi setelah inspeksi selesai</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-0.5 font-medium">4️⃣</span>
                    <span className="text-gray-800">Dapatkan laporan lengkap dan konsultasi gratis selama 7-14 hari</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/6282234007743?text=Halo,%20saya%20sudah%20booking%20inspeksi%20dengan%20ID:%20${bookingResult.bookingId}%20dan%20ingin%20konfirmasi%20jadwal`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 text-center"
                >
                  📱 Chat WhatsApp Sekarang
                </a>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-300"
                >
                  Tutup
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowConfirmation(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}