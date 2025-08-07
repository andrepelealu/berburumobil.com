import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BerburuMobil - Jasa Inspeksi Mobil Bekas Terpercaya | Analisis AI + Teknisi Profesional",
  description: "Dapatkan analisis AI gratis untuk mobil bekas dari OLX, Facebook Marketplace, Mobil123. Booking inspeksi langsung dengan teknisi berpengalaman. Mulai dari Rp 500.000.",
  keywords: "inspeksi mobil bekas, jasa inspeksi mobil, analisis kondisi mobil, OLX, Facebook Marketplace, Mobil123, teknisi mobil Jakarta, cek kondisi mobil",
  authors: [{ name: "BerburuMobil Team" }],
  creator: "BerburuMobil",
  publisher: "BerburuMobil",
  robots: "index, follow",
  openGraph: {
    title: "BerburuMobil - Jasa Inspeksi Mobil Bekas Terpercaya",
    description: "Analisis AI gratis + inspeksi teknisi profesional untuk mobil bekas. Mulai dari Rp 500.000.",
    type: "website",
    locale: "id_ID",
    siteName: "BerburuMobil",
  },
  twitter: {
    card: "summary_large_image",
    title: "BerburuMobil - Jasa Inspeksi Mobil Bekas Terpercaya",
    description: "Analisis AI gratis + inspeksi teknisi profesional untuk mobil bekas. Mulai dari Rp 500.000.",
  },
  verification: {
    google: "your-google-site-verification-code",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "BerburuMobil",
  "description": "Jasa inspeksi mobil bekas terpercaya dengan teknologi AI dan teknisi profesional",
  "url": "https://berburumobil.com",
  "telephone": "+62-812-3456-7890",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jalan Sudirman No. 123",
    "addressLocality": "Jakarta Selatan",
    "postalCode": "12190",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -6.2088,
    "longitude": 106.8456
  },
  "openingHours": "Mo-Su 08:00-20:00",
  "priceRange": "Rp 500,000 - Rp 850,000",
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": -6.2088,
      "longitude": 106.8456
    },
    "geoRadius": "50000"
  },
  "areaServed": [
    "Jakarta",
    "Bekasi", 
    "Tangerang",
    "Depok",
    "Bogor"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Paket Inspeksi Mobil",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Inspeksi Standard",
          "description": "Inspeksi menyeluruh dalam 2-3 hari kerja"
        },
        "price": "500000",
        "priceCurrency": "IDR"
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "Inspeksi Express",
          "description": "Inspeksi prioritas dalam hari yang sama"
        },
        "price": "750000",
        "priceCurrency": "IDR"
      }
    ]
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Budi Santoso"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "Berkat BerburuMobil, saya terhindar dari membeli mobil bekas dengan masalah tersembunyi. Teknisinya sangat detail dan profesional!"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127",
    "bestRating": "5"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="canonical" href="https://berburumobil.com" />
        <meta name="geo.region" content="ID-JK" />
        <meta name="geo.placename" content="Jakarta" />
        <meta name="geo.position" content="-6.2088;106.8456" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
