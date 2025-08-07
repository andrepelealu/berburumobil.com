'use client'

import { MapPinIcon, ClockIcon, PhoneIcon } from '@heroicons/react/24/outline'
import LazyImage from './LazyImage'
import { useScrollRevealMultiple } from '@/hooks/useScrollReveal'

const serviceAreas = [
  {
    city: 'Jakarta',
    areas: ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Utara', 'Jakarta Timur'],
    responseTime: '2-4 jam',
    color: 'bg-blue-500'
  },
  {
    city: 'Bekasi',
    areas: ['Bekasi Kota', 'Bekasi Selatan', 'Bekasi Timur', 'Bekasi Barat'],
    responseTime: '3-5 jam', 
    color: 'bg-green-500'
  },
  {
    city: 'Tangerang',
    areas: ['Tangerang Kota', 'Tangerang Selatan', 'Serpong', 'Karawaci'],
    responseTime: '3-5 jam',
    color: 'bg-purple-500'
  },
  {
    city: 'Depok',
    areas: ['Depok Kota', 'Margonda', 'Beji', 'Pancoran Mas'],
    responseTime: '2-4 jam',
    color: 'bg-orange-500'
  },
  {
    city: 'Bogor',
    areas: ['Bogor Kota', 'Cibinong', 'Sentul', 'Parung'],
    responseTime: '4-6 jam',
    color: 'bg-red-500'
  }
]

export default function ServiceAreaSection() {
  useScrollRevealMultiple({ threshold: 0.1, rootMargin: '50px' })
  
  return (
    <section id="service-area" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <LazyImage
          src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Jasa inspeksi mobil Jakarta Bogor Depok Tangerang Bekasi - area layanan Jabodetabek teknisi profesional siap 24 jam"
          className="w-full h-full object-cover opacity-2"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/98 to-gray-50/95"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Area Layanan BerburuMobil
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Melayani seluruh Jabodetabek dengan teknisi terpercaya dan response time terbaik
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {serviceAreas.map((area, index) => (
            <div key={area.city} className="bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 transform animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`${area.color} p-3 rounded-lg mr-4`}>
                    <MapPinIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{area.city}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>Response: {area.responseTime}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Wilayah Layanan:</h4>
                  <div className="flex flex-wrap gap-2">
                    {area.areas.map((location, locationIndex) => (
                      <span 
                        key={locationIndex}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Teknisi Tersedia</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-300 p-6 flex flex-col items-center justify-center text-center animate-pulse-slow">
            <div className="bg-blue-100 p-3 rounded-lg mb-4">
              <PhoneIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Area Lainnya?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Hubungi kami untuk info layanan di wilayah Anda
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300">
              Hubungi Kami
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Response Cepat</h3>
              <p className="text-gray-600">
                Teknisi bergerak maksimal 6 jam setelah booking dikonfirmasi
              </p>
            </div>

            <div>
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coverage Luas</h3>
              <p className="text-gray-600">
                Melayani seluruh Jabodetabek dengan 20+ teknisi tersebar
              </p>
            </div>

            <div>
              <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Support 24/7</h3>
              <p className="text-gray-600">
                Customer service siap membantu via WhatsApp kapan saja
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Ekspansi Wilayah 2024
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Segera hadir di Bandung, Semarang, dan Surabaya!
            </p>
            <div className="flex justify-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Q2 2024</div>
                <div className="text-sm text-gray-600">Bandung</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Q3 2024</div>
                <div className="text-sm text-gray-600">Semarang</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Q4 2024</div>
                <div className="text-sm text-gray-600">Surabaya</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}