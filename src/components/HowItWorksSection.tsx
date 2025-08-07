'use client'

import { 
  LinkIcon, 
  CloudArrowDownIcon, 
  CpuChipIcon, 
  DocumentTextIcon, 
  CreditCardIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline'
import LazyImage from './LazyImage'
import { useScrollRevealMultiple } from '@/hooks/useScrollReveal'

const steps = [
  {
    id: 1,
    title: 'Paste Link Mobil',
    description: 'Tempel link mobil dari OLX atau Mobil123 (Facebook: gunakan inspeksi manual)',
    icon: LinkIcon,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Sistem Crawl Data',
    description: 'Sistem otomatis mengambil informasi mobil: harga, tahun, kilometer, lokasi',
    icon: CloudArrowDownIcon,
    color: 'bg-green-500'
  },
  {
    id: 3,
    title: 'Analisis AI',
    description: 'AI menganalisis foto-foto mobil dan memberikan scoring kondisi 0-100',
    icon: CpuChipIcon,
    color: 'bg-purple-500'
  },
  {
    id: 4,
    title: 'Laporan Instan',
    description: 'Dapatkan laporan AI gratis dengan rekomendasi inspeksi lebih lanjut',
    icon: DocumentTextIcon,
    color: 'bg-orange-500'
  },
  {
    id: 5,
    title: 'Booking Gratis',
    description: 'Pilih paket inspeksi dan booking tanpa pembayaran - bayar cash kepada teknisi',
    icon: CreditCardIcon,
    color: 'bg-red-500'
  },
  {
    id: 6,
    title: 'Teknisi Datang',
    description: 'Teknisi berpengalaman melakukan inspeksi mendalam dan berikan laporan lengkap',
    icon: UserGroupIcon,
    color: 'bg-indigo-500'
  }
]

export default function HowItWorksSection() {
  useScrollRevealMultiple({ threshold: 0.1, rootMargin: '50px' })
  
  return (
    <section id="how-it-works" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <LazyImage
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Proses workflow inspeksi mobil bekas BerburuMobil - langkah demi langkah analisis AI hingga laporan teknisi"
          className="w-full h-full object-cover opacity-3"
        />
        <div className="absolute inset-0 bg-gray-50/98"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 hover-scale">
            Cara Kerja BerburuMobil
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Proses simpel dalam 6 langkah untuk mendapatkan mobil bekas terbaik dengan kepercayaan penuh
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative scroll-reveal" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover-lift hover-glow transition-all duration-300 transform hover-shimmer">
                <div className="flex items-start">
                  <div className={`${step.color} p-3 rounded-lg flex-shrink-0 animate-float`} style={{ animationDelay: `${index * 0.5}s` }}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 rounded-full mr-3 hover:bg-gray-200 transition-colors">
                        Langkah {step.id}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gray-300 animate-pulse"></div>
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-gray-300 rounded-full transform rotate-45 animate-bounce-soft"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center scroll-reveal">
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100 hover-glow hover-lift">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 animate-float">
              ⚡ Analisis AI Gratis Sebelum Inspeksi
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Hemat waktu dan uang dengan mendapatkan prediksi kondisi mobil terlebih dahulu. 
              Jika scoring AI menunjukkan masalah serius, Anda bisa mempertimbangkan pilihan lain.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center text-green-600 hover-scale">
                <span className="text-2xl mr-2 animate-bounce-soft">🎯</span>
                <span className="font-medium">Akurasi 85%+</span>
              </div>
              <div className="flex items-center text-green-600 hover-scale">
                <span className="text-2xl mr-2 animate-bounce-soft" style={{ animationDelay: '0.3s' }}>⚡</span>
                <span className="font-medium">Hasil Instan</span>
              </div>
              <div className="flex items-center text-green-600 hover-scale">
                <span className="text-2xl mr-2 animate-bounce-soft" style={{ animationDelay: '0.6s' }}>💰</span>
                <span className="font-medium">100% Gratis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}