'use client'

import { useState, useEffect } from 'react'

interface CarLoadingAnimationProps {
  showText?: boolean
}

export default function CarLoadingAnimation({ showText = true }: CarLoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  
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
    if (!showText) return
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % analysisSteps.length)
    }, 2500) // Change text every 2.5 seconds
    
    return () => clearInterval(interval)
  }, [showText, analysisSteps.length])

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Road/Track */}
        <div className="w-48 h-2 bg-gray-300 rounded-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 animate-pulse"></div>
          {/* Road markings */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-white opacity-60 animate-road-lines"></div>
        </div>
        
        {/* Car Emoticon with animation */}
        <div className="absolute -top-4 left-0 animate-car-drive">
          <div className="text-3xl animate-bounce-gentle">
            🚗
          </div>
        </div>
        
        {/* Exhaust smoke */}
        <div className="absolute -top-2 -left-2 animate-smoke">
          <div className="w-1 h-1 bg-gray-400 rounded-full opacity-60 animate-bounce"></div>
        </div>
      </div>
      
      {showText && (
        <span className="ml-4 text-blue-600 font-medium">
          {analysisSteps[currentStep]}
        </span>
      )}
    </div>
  )
}