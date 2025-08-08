'use client'

import { useState, useEffect } from 'react'

export default function DynamicLoadingText() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  
  const analysisSteps = [
    "Sedang menganalisis mobil...",
    "Sedang memeriksa eksterior mobil...",
    "Sedang mengecek kondisi mesin...",
    "Sedang mengecek interior...",
    "Sedang menganalisis foto...",
    "Sedang menghitung skor kondisi...",
    "Sedang menyiapkan rekomendasi...",
    "Hampir selesai..."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false)
      
      setTimeout(() => {
        // Change text
        setCurrentStep((prev) => (prev + 1) % analysisSteps.length)
        // Fade in
        setIsVisible(true)
      }, 200) // Wait 200ms for fade out to complete
      
    }, 2500) // Change text every 2.5 seconds
    
    return () => clearInterval(interval)
  }, [analysisSteps.length])

  return (
    <div className="mt-4 text-center">
      <p 
        className={`text-blue-600 font-medium transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {analysisSteps[currentStep]}
      </p>
      <p className="text-blue-500 text-xs mt-2 italic">
        Proses ini biasanya membutuhkan 10-30 detik
      </p>
    </div>
  )
}