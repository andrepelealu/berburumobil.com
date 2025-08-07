import Link from 'next/link'
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">BerburuMobil</h3>
            <p className="text-gray-300 mb-6">
              Jasa inspeksi mobil bekas terpercaya dengan teknologi AI dan teknisi profesional. 
              Pastikan mobil impian Anda dalam kondisi terbaik.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <span className="sr-only">WhatsApp</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.567-.01-.297 0-.677.112-.915.461-.239.35-.914.895-.914 2.183 0 1.288.935 2.532 1.066 2.706.13.174 1.843 2.819 4.466 3.956.625.270 1.112.431 1.491.551.627.199 1.197.171 1.648.104.502-.076 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.865 3.488"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Layanan</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-300 hover:text-white transition duration-300">Inspeksi Standard</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition duration-300">Inspeksi Express</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition duration-300">OBD Scan</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition duration-300">Analisis AI</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition duration-300">Konsultasi</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Perusahaan</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-300 hover:text-white transition duration-300">Tentang Kami</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition duration-300">Tim Teknisi</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition duration-300">Karir</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition duration-300">Mitra</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition duration-300">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">WhatsApp:</p>
                  <a href="https://wa.me/6282234007743" className="text-white hover:text-blue-400 transition duration-300">
                    +62 822-3400-7743
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Email:</p>
                  <a href="mailto:info@berburumobil.com" className="text-white hover:text-blue-400 transition duration-300">
                    info@berburumobil.com
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Alamat:</p>
                  <p className="text-white">
                    Jln. Geofisika No. 1<br />
                    BSD Tangerang 15321
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap gap-6 mb-4 md:mb-0">
              <Link href="#" className="text-gray-300 hover:text-white text-sm transition duration-300">
                Syarat & Ketentuan
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white text-sm transition duration-300">
                Kebijakan Privasi
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white text-sm transition duration-300">
                FAQ
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white text-sm transition duration-300">
                Bantuan
              </Link>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 BerburuMobil. All rights reserved.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-300 text-sm">
              🔒 <strong>Pembayaran Aman</strong> - Didukung oleh Midtrans dengan enkripsi SSL 256-bit
            </p>
            <div className="flex justify-center mt-3 space-x-4">
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">VISA</span>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">Mastercard</span>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">BCA</span>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">Mandiri</span>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">GoPay</span>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">OVO</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}