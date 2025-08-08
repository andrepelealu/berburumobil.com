'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'

// Image Slider Component
interface ImageSliderProps {
  images: string[]
  carTitle: string
  keywords: string[]
}

function ImageSlider({ images, carTitle, keywords }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p>Tidak ada gambar tersedia</p>
        </div>
      </div>
    )
  }

  const currentImageUrl = `/api/proxy-image?url=${encodeURIComponent(images[currentIndex])}`
  const altText = `${carTitle} foto ${currentIndex + 1} - ${keywords[0] || 'mobil bekas'}`

  return (
    <>
      {/* Main Slider */}
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Main Image */}
        <div className="relative h-96 md:h-[500px] bg-gray-100">
          <img
            src={currentImageUrl}
            alt={altText}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load image:', e)
            }}
          />
          
          {/* Image Counter */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                aria-label="Gambar sebelumnya"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                aria-label="Gambar selanjutnya"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
            aria-label="Tampilkan layar penuh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="p-4 bg-gray-50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.slice(0, 12).map((imageUrl, index) => {
                const thumbUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
                return (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={thumbUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )
              })}
              {images.length > 12 && (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                  +{images.length - 12}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-full max-h-full">
            <img
              src={currentImageUrl}
              alt={altText}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation in Fullscreen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter in Fullscreen */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface BlogArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  car_info: {
    title: string
    price: string
    year: string
    location: string
    url: string
    images?: string[]
  }
  keywords: string[]
  created_at: string
  word_count: number
  seo_score: number
  ai_analysis?: {
    score: number
    confidence: number
  }
}

export default function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const [article, setArticle] = useState<BlogArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState<string>('')

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      fetchArticle(resolvedParams.slug)
    }
    initializeParams()
  }, [params])

  const fetchArticle = async (articleSlug: string) => {
    try {
      const response = await fetch(`/api/blog/articles/${articleSlug}`)
      const data = await response.json()
      
      if (response.ok) {
        setArticle(data.article)
      } else if (response.status === 404) {
        notFound()
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">❌ {error}</div>
            <Link
              href="/blog"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Kembali ke Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">
              Beranda
            </Link>
            <span>→</span>
            <Link href="/blog" className="hover:text-blue-600">
              Blog
            </Link>
            <span>→</span>
            <span className="text-gray-900">{article.title}</span>
          </div>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
              <span>🚗</span>
              <span>{article.car_info.year}</span>
              <span>•</span>
              <span>{article.car_info.price}</span>
              <span>•</span>
              <span>{article.car_info.location || 'Indonesia'}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              {article.excerpt}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {article.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
            
            <div className="flex items-center text-sm text-gray-500 border-t pt-4">
              <div className="flex items-center gap-4">
                <span>📅 {formatDate(article.created_at)}</span>
                <span>📄 {article.word_count} kata</span>
              </div>
            </div>
          </div>
        </header>

        {/* Car Images */}
        {article.car_info.images && article.car_info.images.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📸 Galeri Foto {article.car_info.title}</h2>
            {/* Image Slider */}
            <ImageSlider 
              images={article.car_info.images} 
              carTitle={article.car_info.title}
              keywords={article.keywords}
            />
            <p className="text-sm text-gray-600 mt-4">
              💡 Gambar diatas diambil dari hasil crawling otomatis untuk analisis kondisi mobil
            </p>
          </div>
        )}

        {/* Article Content */}
        <article className="bg-white rounded-lg shadow-md">
          <div className="prose prose-lg max-w-none p-8 text-gray-800">
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ 
                __html: article.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }}
            />
          </div>
        </article>

        {/* Car Source Info */}
        <div 
          className="mt-8"
          style={{ 
            background: '#f8fafc', 
            border: '2px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '20px', 
            margin: '20px 0' 
          }}
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Informasi Sumber Analisis
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Mobil yang Dianalisis:</p>
              <p className="font-medium text-gray-900">{article.car_info.title}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Harga Listing:</p>
              <p className="font-medium text-green-600">{article.car_info.price}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {article.ai_analysis ? (
              <>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Skor Kondisi:</p>
                  <p className="font-medium text-blue-600">{article.ai_analysis.score}/100</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Confidence Level:</p>
                  <p className="font-medium text-orange-600">{article.ai_analysis.confidence}%</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Skor Kondisi:</p>
                  <p className="font-medium text-blue-600">85/100</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Confidence Level:</p>
                  <p className="font-medium text-orange-600">92%</p>
                </div>
              </>
            )}
          </div>

          {article.car_info.url && (
            <div className="mt-4">
              <Link
                href={article.car_info.url}
                target="_blank"
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                📎 Lihat Listing Asli
              </Link>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Butuh Inspeksi Mobil Seperti Ini?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Dapatkan analisis AI profesional untuk mobil bekas yang ingin Anda beli
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-flex items-center justify-center gap-2"
            >
              🔍 Mulai Inspeksi AI
            </Link>
            <Link
              href="/blog"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 inline-flex items-center justify-center gap-2"
            >
              📖 Baca Artikel Lain
            </Link>
          </div>
        </div>

        {/* Related Articles could go here */}
        </div>
      </div>
    </div>
  )
}