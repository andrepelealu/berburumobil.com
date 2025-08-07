'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Beranda', href: '/', current: false, isExternal: true },
    { name: 'Blog', href: '/blog', current: false, isExternal: true },
    { name: 'Cara Kerja', href: '#how-it-works', current: false, isExternal: false },
    { name: 'Harga', href: '#pricing', current: false, isExternal: false },
    { name: 'Area Layanan', href: '#service-area', current: false, isExternal: false },
  ]

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
      setMobileMenuOpen(false)
    }
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">🚗</span>
                <span className="ml-2 text-xl font-bold text-gray-900">BerburuMobil</span>
              </Link>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            {navigation.map((item) => (
              item.isExternal ? (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer"
                >
                  {item.name}
                </a>
              )
            ))}
            <a
              href="#booking-form"
              onClick={(e) => handleSmoothScroll(e, '#booking-form')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              Mulai Inspeksi
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              item.isExternal ? (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 text-base font-medium cursor-pointer"
                >
                  {item.name}
                </a>
              )
            ))}
            <a
              href="#booking-form"
              onClick={(e) => handleSmoothScroll(e, '#booking-form')}
              className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 text-base font-medium mx-3 mt-4 rounded-md text-center cursor-pointer"
            >
              Mulai Inspeksi
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}