'use client'

import { useState, useEffect } from 'react'

interface IdeologyTagProps {
  scale: number // Expecting a number between 0-100
  className?: string
}

function validateScale(scale: number): void {
  if (scale < 0 || scale > 100) {
    throw new RangeError('scale must be between 0 and 100')
  }
}

export default function IdeologyTag({ scale, className = '' }: IdeologyTagProps) {
  // Validate the scale value at runtime
  validateScale(scale);

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Function to determine ideology based on scale
  const getIdeology = (scale: number) => {
    if (scale >= 45 && scale <= 55) return 'centrist'
    if (scale >= 35 && scale < 45) return 'moderate'
    if (scale >= 25 && scale < 35) return 'balanced'
    return 'neutral'
  }

  // Get the appropriate tag based on the scale
  const ideologyValue = getIdeology(scale)

  if (!mounted) {
    return null // Prevent SSR flash
  }

  return (
    <div
      className={`
        inline-flex px-4 py-1.5
        bg-emerald-400 text-emerald-950
        rounded-full font-bold text-sm sm:text-base
        shadow-md hover:shadow-lg transition-shadow duration-300
        ${className}
      `}
    >
      {ideologyValue.charAt(0).toUpperCase() + ideologyValue.slice(1)}
    </div>
  )
}

