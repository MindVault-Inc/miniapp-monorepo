'use client'

import type * as React from 'react'
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  progress?: number
  className?: string
  variant?: 'default' | 'success' | 'warning'
}

export function ProgressBar({
  progress = 6.5,
  className = "",
  variant = 'default'
}: ProgressBarProps) {
  const progressBarColors = {
    default: 'bg-accent-red',
    success: 'bg-brand-primary',
    warning: 'bg-accent-orange'
  }

  return (
    <div className={cn("relative h-[21px] w-[337px]", className)}>

      <div 
        className="absolute left-0 top-[4px] h-[12px] w-full rounded-[15px] bg-neutral-bg shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
      />
      
      <div 
        className={cn(
          "absolute left-0 top-[4px] h-[12px] rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]",
          progressBarColors[variant]
        )}
        style={{
          width: `${progress}%`,
          transition: 'width 0.3s ease-in-out'
        }}
      />
      
      {[71, 161, 252].map((left, index) => (
        <svg
          key={index}
          className="absolute h-5 w-5 text-brand-primary"
          style={{ left: `${left}px`, top: index === 2 ? '1px' : '0px' }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 2.005c-.777 0 -1.508 .367 -1.971 .99l-5.362 6.895c-.89 1.136 -.89 3.083 0 4.227l5.375 6.911a2.457 2.457 0 0 0 3.93 -.017l5.361 -6.894c.89 -1.136 .89 -3.083 0 -4.227l-5.375 -6.911a2.446 2.446 0 0 0 -1.958 -.974z" />
        </svg>
      ))}
    </div>
  )
}
