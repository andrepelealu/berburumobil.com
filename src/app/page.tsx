import { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FeatureShowcase from '@/components/FeatureShowcase'
import HowItWorksSection from '@/components/HowItWorksSection'
import PricingSection from '@/components/PricingSection'
import ExampleReportSection from '@/components/ExampleReportSection'
import ServiceAreaSection from '@/components/ServiceAreaSection'
import BookingFormSection from '@/components/BookingFormSection'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Jasa Inspeksi Mobil Jakarta Terpercaya | BerburuMobil - Analisis AI + Teknisi Profesional',
  description: 'Jasa inspeksi mobil Jakarta, Bekasi, Tangerang, Depok, Bogor terpercaya. Analisis AI gratis + teknisi profesional untuk mobil bekas. Mulai Rp 500.000.',
  keywords: 'jasa inspeksi mobil jakarta, inspeksi mobil bekas jakarta, teknisi mobil jakarta, inspeksi mobil bekasi, inspeksi mobil tangerang, inspeksi mobil depok, analisis AI mobil, OLX mobil123 inspection',
  openGraph: {
    title: 'Jasa Inspeksi Mobil Jakarta Terpercaya | BerburuMobil',
    description: 'Jasa inspeksi mobil Jakarta Bekasi Tangerang dengan teknisi profesional. Analisis AI gratis + laporan lengkap mulai Rp 500.000.',
    type: 'website',
    locale: 'id_ID',
  },
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeatureShowcase />
      <HowItWorksSection />
      <PricingSection />
      <ExampleReportSection />
      <ServiceAreaSection />
      <BookingFormSection />
      <Footer />
    </main>
  )
}
