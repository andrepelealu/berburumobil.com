'use client'

import { CheckIcon, ClockIcon, CogIcon } from '@heroicons/react/24/outline'
import LazyImage from './LazyImage'
import { useScrollRevealMultiple } from '@/hooks/useScrollReveal'

const pricingPlans = [
  {
    id: 'standard',
    name: 'Inspeksi Standard',
    price: 'Rp 500.000',
    originalPrice: null,
    badge: 'Populer',
    description: 'Inspeksi menyeluruh dalam 2-3 hari kerja',
    features: [
      'Pemeriksaan mesin & transmisi',
      'Cek kondisi interior & eksterior', 
      'Test drive komprehensif',
      'Laporan foto lengkap',
      'Rekomendasi harga wajar',
      'Garansi 7 hari konsultasi'
    ],
    icon: CheckIcon,
    buttonText: 'Pilih Standard',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
  },
  {
    id: 'express',
    name: 'Inspeksi Express',
    price: 'Rp 750.000',
    originalPrice: 'Rp 850.000',
    badge: 'Same Day',
    description: 'Inspeksi prioritas dalam hari yang sama',
    features: [
      'Semua fitur Standard',
      'Inspeksi same day (6-8 jam)',
      'Prioritas jadwal teknisi',
      'Laporan digital real-time',
      'Konsultasi langsung via WhatsApp',
      'Garansi 14 hari konsultasi'
    ],
    icon: ClockIcon,
    buttonText: 'Pilih Express',
    buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white'
  },
  {
    id: 'obd',
    name: 'Tambahan OBD Scan',
    price: '+ Rp 100.000',
    originalPrice: null,
    badge: 'Add-on',
    description: 'Scan komputer mobil untuk deteksi error tersembunyi',
    features: [
      'Scan sistem ECU mobil',
      'Deteksi error code tersembunyi',
      'Cek performa engine real-time',
      'Analisis emisi gas buang',
      'Laporan digital detail',
      'Rekomendasi perbaikan'
    ],
    icon: CogIcon,
    buttonText: 'Tambah OBD Scan',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white'
  }
]

export default function PricingSection() {
  useScrollRevealMultiple({ threshold: 0.1, rootMargin: '50px' })
  
  return (
    <section id="pricing" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <LazyImage
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2083&q=80"
          alt="Jasa inspeksi mobil Jakarta harga terjangkau - paket Standard Express OBD scan BerburuMobil mulai 500 ribu"
          className="w-full h-full object-cover opacity-2"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/98 to-gray-50/95"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Paket Inspeksi Terpercaya
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pilih paket inspeksi sesuai kebutuhan Anda. Semua paket sudah termasuk teknisi berpengalaman dan laporan lengkap.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div 
              key={plan.id} 
              className={`relative bg-white rounded-2xl shadow-lg border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 transform animate-fade-in-up ${
                plan.badge === 'Populer' ? 'border-blue-500' : 'border-gray-200'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold ${
                  plan.badge === 'Populer' ? 'bg-blue-500 text-white' :
                  plan.badge === 'Same Day' ? 'bg-orange-500 text-white' :
                  'bg-purple-500 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <div className={`inline-flex p-3 rounded-full mb-4 ${
                    plan.id === 'standard' ? 'bg-blue-100' :
                    plan.id === 'express' ? 'bg-orange-100' :
                    'bg-purple-100'
                  }`}>
                    <plan.icon className={`h-8 w-8 ${
                      plan.id === 'standard' ? 'text-blue-600' :
                      plan.id === 'express' ? 'text-orange-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through ml-2">
                        {plan.originalPrice}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => {
                    // Store selected package in sessionStorage
                    sessionStorage.setItem('selectedPackage', plan.id)
                    sessionStorage.setItem('selectedPackagePrice', plan.price)
                    
                    // Scroll to booking form
                    const bookingForm = document.getElementById('booking-form')
                    if (bookingForm) {
                      bookingForm.scrollIntoView({ behavior: 'smooth' })
                      
                      // Trigger custom event to notify booking form
                      window.dispatchEvent(new CustomEvent('packageSelected', { 
                        detail: { 
                          packageId: plan.id,
                          packageName: plan.name,
                          price: plan.price 
                        } 
                      }))
                    }
                  }}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition duration-300 ${plan.buttonClass}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>


        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              💡 Rekomendasi Kami
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              <strong>Inspeksi Standard</strong> cocok untuk pembelian normal. 
              Pilih <strong>Express</strong> jika mobil sedang hot atau ada pembeli lain yang mengincar.
              Tambahkan <strong>OBD Scan</strong> untuk mobil tahun 2010+ atau yang pernah mengalami kecelakaan.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-lg p-4 border">
                <span className="text-2xl mb-2 block">🛡️</span>
                <h4 className="font-semibold text-gray-900">Garansi Uang Kembali</h4>
                <p className="text-sm text-gray-600">Jika tidak puas dengan layanan</p>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <span className="text-2xl mb-2 block">📱</span>
                <h4 className="font-semibold text-gray-900">Update Real-time</h4>
                <p className="text-sm text-gray-600">Foto progress via WhatsApp</p>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <span className="text-2xl mb-2 block">🎯</span>
                <h4 className="font-semibold text-gray-900">Laporan Akurat</h4>
                <p className="text-sm text-gray-600">Detail kondisi & estimasi biaya</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}