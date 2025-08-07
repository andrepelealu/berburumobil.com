'use client'

import { StarIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import LazyImage from './LazyImage'
import { useScrollRevealMultiple } from '@/hooks/useScrollReveal'

const exampleReport = {
  carInfo: {
    title: 'Honda Jazz RS 2018',
    price: 'Rp 175.000.000',
    year: '2018',
    mileage: '45.000 km',
    location: 'Jakarta Selatan'
  },
  aiScore: 78,
  findings: [
    { type: 'good', text: 'Mesin dalam kondisi baik, tidak ada kebocoran oli' },
    { type: 'good', text: 'Interior terawat, tidak ada robekan pada jok' },
    { type: 'warning', text: 'Ban belakang sudah tipis, perlu diganti dalam 3 bulan' },
    { type: 'warning', text: 'Cat bemper depan ada bekas touch-up kecil' }
  ],
  recommendation: 'Mobil layak beli dengan beberapa perbaikan minor. Estimasi biaya tambahan: Rp 2-3 juta.'
}

const testimonials = [
  {
    name: 'Budi Santoso',
    location: 'Jakarta',
    rating: 5,
    text: 'Berkat BerburuMobil, saya terhindar dari membeli mobil bekas dengan masalah tersembunyi. Teknisinya sangat detail dan profesional!',
    carPurchased: 'Toyota Avanza 2019'
  },
  {
    name: 'Sari Wulandari',
    location: 'Bekasi',  
    rating: 5,
    text: 'Analisis AI-nya akurat banget! Scoring 85 dan pas diinspeksi teknisi memang kondisinya bagus. Worth it banget!',
    carPurchased: 'Honda Brio 2020'
  },
  {
    name: 'Ahmad Rizki',
    location: 'Tangerang',
    rating: 5,
    text: 'Layanan express sangat membantu karena saya butuh keputusan cepat. Dalam 6 jam sudah dapat laporan lengkap.',
    carPurchased: 'Daihatsu Xenia 2017'
  }
]

export default function ExampleReportSection() {
  useScrollRevealMultiple({ threshold: 0.1, rootMargin: '50px' })
  
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <LazyImage
          src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80"
          alt="Jasa inspeksi mobil Jakarta BerburuMobil - contoh laporan lengkap analisis AI scoring testimoni pelanggan mobil bekas"
          className="w-full h-full object-cover opacity-3"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/96 to-white/92"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Contoh Laporan Inspeksi
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lihat contoh laporan yang akan Anda dapatkan, lengkap dengan analisis AI dan temuan teknisi profesional
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="animate-fade-in-left">
            <div className="bg-white rounded-2xl shadow-lg p-8 border hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  📋 Laporan Inspeksi
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{exampleReport.carInfo.title}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <span>Harga: {exampleReport.carInfo.price}</span>
                    <span>Tahun: {exampleReport.carInfo.year}</span>
                    <span>KM: {exampleReport.carInfo.mileage}</span>
                    <span>Lokasi: {exampleReport.carInfo.location}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">AI Condition Score</span>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-green-600 mr-2">{exampleReport.aiScore}</span>
                      <span className="text-gray-600">/100</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${exampleReport.aiScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Kondisi Baik - Recommended untuk inspeksi lanjutan</p>
                </div>

                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-900">Temuan AI:</h5>
                  {exampleReport.findings.map((finding, index) => (
                    <div key={index} className="flex items-start">
                      {finding.type === 'good' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 mr-3" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5 mr-3" />
                      )}
                      <span className="text-sm text-gray-700">{finding.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-2">💡 Rekomendasi:</h5>
                  <p className="text-sm text-blue-800">{exampleReport.recommendation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fade-in-right">
            <div className="bg-white rounded-2xl shadow-lg p-8 border hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                ⭐ Testimoni Pelanggan
              </h3>
              
              <div className="space-y-6">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400 mr-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <StarIcon key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {testimonial.name} • {testimonial.location}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">&ldquo;{testimonial.text}&rdquo;</p>
                    <p className="text-xs text-gray-500">
                      Membeli: {testimonial.carPurchased}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">🎯 Tingkat Akurasi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">87%</div>
                  <div className="text-sm opacity-90">Prediksi AI Akurat</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">95%</div>
                  <div className="text-sm opacity-90">Masalah Terdeteksi</div>
                </div>
              </div>
              <p className="text-sm mt-4 opacity-90">
                *Berdasarkan 500+ inspeksi yang telah dilakukan
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition duration-300">
            Dapatkan Analisis Gratis Sekarang
          </button>
          <p className="text-gray-600 mt-3">Mulai dengan paste link mobil bekas Anda</p>
        </div>
      </div>
    </section>
  )
}