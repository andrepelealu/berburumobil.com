'use client'

import LazyImage from './LazyImage'
import { useScrollRevealMultiple } from '@/hooks/useScrollReveal'

export default function FeatureShowcase() {
  useScrollRevealMultiple({ threshold: 0.1, rootMargin: '50px' })
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 scroll-reveal">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 hover-scale">
            🔧 Proses Inspeksi Profesional
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Teknisi berpengalaman menggunakan peralatan canggih untuk memastikan kondisi mobil Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center scroll-reveal hover-lift">
            <div className="relative mb-6 overflow-hidden rounded-xl group">
              <LazyImage
                src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2032&q=80"
                alt="Jasa inspeksi mobil Jakarta - teknisi profesional memeriksa kondisi mesin, oli, radiator sistem pendinginan mobil bekas"
                className="w-full h-48 object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-blue-600/10 rounded-xl group-hover:bg-blue-600/20 transition-all duration-300"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Inspeksi Mesin
            </h3>
            <p className="text-gray-600 text-sm">
              Pemeriksaan menyeluruh kondisi mesin, oli, dan sistem pendinginan
            </p>
          </div>

          <div className="text-center scroll-reveal hover-lift">
            <div className="relative mb-6 overflow-hidden rounded-xl group">
              <LazyImage
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80"
                alt="Jasa inspeksi mobil Jakarta Bekasi Tangerang - cek kondisi interior kabin dashboard jok sistem elektronik mobil bekas"
                className="w-full h-48 object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-green-600/10 rounded-xl group-hover:bg-green-600/20 transition-all duration-300"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Check Interior
            </h3>
            <p className="text-gray-600 text-sm">
              Evaluasi kondisi kabin, jok, dashboard, dan fitur elektronik
            </p>
          </div>

          <div className="text-center scroll-reveal hover-lift">
            <div className="relative mb-6 overflow-hidden rounded-xl group">
              <LazyImage
                src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
                alt="Jasa inspeksi mobil Jakarta profesional - analisis kondisi eksterior cat body ban velg sistem kelistrikan mobil bekas"
                className="w-full h-48 object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-purple-600/10 rounded-xl group-hover:bg-purple-600/20 transition-all duration-300"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Cek Eksterior
            </h3>
            <p className="text-gray-600 text-sm">
              Analisis cat, body, ban, dan sistem kelistrikan luar
            </p>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 scroll-reveal hover-glow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="scroll-reveal">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 animate-float">
                📱 Teknologi AI + Keahlian Manusia
              </h3>
              <p className="text-gray-700 mb-6">
                Kombinasi sempurna antara analisis AI untuk screening awal dan inspeksi manual 
                oleh teknisi berpengalaman untuk hasil yang akurat dan komprehensif.
              </p>
              <div className="space-y-3">
                <div className="flex items-center hover-scale">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-gray-700">AI scoring 120+ parameter kondisi mobil</span>
                </div>
                <div className="flex items-center hover-scale">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <span className="text-gray-700">Teknisi inspeksi fisik dan test drive</span>
                </div>
                <div className="flex items-center hover-scale">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  <span className="text-gray-700">Laporan digital dengan foto dan video</span>
                </div>
              </div>
            </div>
            <div className="relative scroll-reveal">
              <LazyImage
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2006&q=80"
                alt="Jasa inspeksi mobil Jakarta dengan teknologi AI - laporan digital analisis kondisi mobil bekas scoring akurat BerburuMobil"
                className="w-full h-64 object-cover rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}