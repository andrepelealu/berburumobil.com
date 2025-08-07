'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface BlogArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  car_info: {
    title: string
    price: string
    year: string
    location: string
  }
  keywords: string[]
  created_at: string
  word_count: number
}

export default function BlogPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/blog/articles')
      const data = await response.json()
      
      if (response.ok) {
        setArticles(data.articles)
      } else {
        setError(data.error || 'Gagal memuat artikel')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat artikel')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat artikel...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">❌ {error}</div>
            <button 
              onClick={fetchArticles}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog Inspeksi Mobil
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Artikel terbaru tentang jual beli mobil bekas, tips inspeksi, dan panduan lengkap 
            untuk pembeli mobil bekas di Jakarta, Bogor, Depok, Tangerang, dan Bekasi (Jabodetabek)
          </p>
        </div>

        {/* SEO Keywords Section */}
        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            🎯 Topik Utama Kami
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              'Jasa Inspeksi Mobil Jakarta',
              'Jual Beli Mobil Bekas',
              'Tips Membeli Mobil Bekas',
              'Inspeksi Mobil Profesional',
              'Mobil Bekas Berkualitas',
              'Jasa Inspeksi Jabodetabek',
              'Panduan Mobil Bekas'
            ].map((keyword) => (
              <span
                key={keyword}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Belum Ada Artikel
            </h3>
            <p className="text-gray-600 mb-6">
              Artikel SEO akan dibuat secara otomatis ketika ada analisis mobil baru.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              🔍 Mulai Analisis Mobil
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                    <span>🚗</span>
                    <span>{article.car_info.year}</span>
                    <span>•</span>
                    <span>{article.car_info.price}</span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.keywords.slice(0, 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>📅 {formatDate(article.created_at)}</span>
                    <span>📄 {article.word_count} kata</span>
                  </div>
                  
                  <Link
                    href={`/blog/${article.slug}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Baca Selengkapnya →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Butuh Inspeksi Mobil Profesional?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Dapatkan analisis AI dan panduan lengkap untuk membeli mobil bekas dengan aman
          </p>
          <Link
            href="/"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-flex items-center gap-2"
          >
            🔍 Mulai Inspeksi Sekarang
          </Link>
        </div>
      </div>
    </div>
  </div>
  )
}