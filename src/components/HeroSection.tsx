'use client'

import { useState, useEffect } from 'react'
import { ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import TypingEffect from './TypingEffect'
import LazyImage from './LazyImage'

export default function HeroSection() {
  const [carUrl, setCarUrl] = useState('')
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    setIsAnimated(true)
  }, [])

  const handleAnalyzeClick = () => {
    const bookingForm = document.getElementById('booking-form')
    if (bookingForm) {
      // Store the URL in sessionStorage to pass to booking form
      if (carUrl.trim()) {
        sessionStorage.setItem('heroCarUrl', carUrl.trim())
      }
      bookingForm.scrollIntoView({ behavior: 'smooth' })
      
      // Trigger custom event to notify booking form
      window.dispatchEvent(new CustomEvent('heroUrlSubmitted', { 
        detail: { url: carUrl.trim() } 
      }))
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <LazyImage
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Jasa inspeksi mobil bekas profesional Jakarta Bogor Depok Tangerang Bekasi dengan teknisi bersertifikat dan analisis AI gratis"
          className="w-full h-full object-cover opacity-5"
          priority={true}
        />
        <div className="absolute inset-0 bg-white/95"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 ${isAnimated ? 'animate-fade-in-down' : ''}`}>
            Inspeksi Mobil Bekas
            <span className="text-blue-600 block mt-2">
              <TypingEffect 
                texts={[
                  "Profesional & Terpercaya",
                  "AI + Teknisi Ahli", 
                  "Jabodetabek Ready",
                  "Analisis Gratis"
                ]}
                className="text-blue-600"
                speed={120}
                deleteSpeed={80}
                delayBetweenTexts={2500}
              />
            </span>
          </h1>
          
          <p className={`text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto ${isAnimated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '0.3s' }}>
            Teknisi bersertifikat • Laporan lengkap • Keputusan tepat
          </p>

          <div className={`flex flex-wrap justify-center gap-4 mb-10 ${isAnimated ? 'animate-scale-in' : ''}`} style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center text-green-600 hover-lift">
              <CheckCircleIcon className="h-5 w-5 mr-2 animate-bounce-soft" />
              <span className="font-medium">Inspeksi 120+ Poin</span>
            </div>
            <div className="flex items-center text-green-600 hover-lift">
              <CheckCircleIcon className="h-5 w-5 mr-2 animate-bounce-soft" style={{ animationDelay: '0.2s' }} />
              <span className="font-medium">Teknisi Bersertifikat</span>
            </div>
            <div className="flex items-center text-green-600 hover-lift">
              <CheckCircleIcon className="h-5 w-5 mr-2 animate-bounce-soft" style={{ animationDelay: '0.4s' }} />
              <span className="font-medium">Laporan Digital</span>
            </div>
          </div>

          <div className={`max-w-2xl mx-auto ${isAnimated ? 'animate-slide-in-bottom' : ''}`} style={{ animationDelay: '0.9s' }}>
            <div className="bg-white rounded-lg shadow-lg p-6 border hover-glow hover-lift">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 animate-float">
                🚗 Analisis Gratis & Booking Inspeksi
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  placeholder="Paste link mobil (OLX, Facebook, Instagram, dll.)"
                  value={carUrl}
                  onChange={(e) => setCarUrl(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500 hover:border-blue-300 transition-all duration-300 focus:scale-105"
                />
                <button
                  onClick={handleAnalyzeClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center min-w-[160px] hover-shimmer hover:scale-105 hover:shadow-lg group"
                >
                  Analisis
                  <ChevronRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-3 animate-pulse-slow">
                ✨ AI gratis OLX & Mobil123 • Inspeksi manual semua platform
              </p>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 ${isAnimated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '1.2s' }}>
          <div className="text-center hover-lift">
            <h3 className="text-3xl font-bold text-blue-600 mb-2 animate-glow">500+</h3>
            <p className="text-gray-600">Mobil Diinspeksi</p>
          </div>
          <div className="text-center hover-lift">
            <h3 className="text-3xl font-bold text-blue-600 mb-2 animate-glow" style={{ animationDelay: '0.3s' }}>98%</h3>
            <p className="text-gray-600">Tingkat Kepuasan</p>
          </div>
          <div className="text-center hover-lift">
            <h3 className="text-3xl font-bold text-blue-600 mb-2 animate-glow" style={{ animationDelay: '0.6s' }}>24 Jam</h3>
            <p className="text-gray-600">Layanan Express</p>
          </div>
        </div>
      </div>
    </section>
  )
}