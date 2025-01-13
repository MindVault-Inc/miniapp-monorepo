"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motivationalQuotes } from "@/data/motivationalQuotes"

interface User {
  name: string;
  level: string;
  points: number;
  maxPoints: number;
}

interface ProfileCardProps {
  className?: string;
  user?: User;
}

const ProfileAvatar = ({ name }: { name: string }) => {
  const initials = useMemo(() => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [name])

  return (
    <div className="relative">
      <Avatar className="w-16 h-16">
        <AvatarFallback className="bg-white text-brand-secondary text-lg font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}

const LevelProgress = ({ points, maxPoints }: { points: number; maxPoints: number }) => {
  const progress = (points / maxPoints) * 100
  
  return (
    <div className="relative">
      <div className="w-[201px] h-1.5 rounded-full bg-white/30" />
      <div className="absolute top-0 left-0 w-[201px] h-1.5 bg-base-white rounded-full">
        <div 
          className="h-full bg-[#E36C59] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
          aria-valuenow={points}
          aria-valuemin={0}
          aria-valuemax={maxPoints}
          role="progressbar"
        />
      </div>
      <p className="text-white text-[10px] font-medium font-spaceGrotesk text-center mt-1">
        {points}/{maxPoints} points to level up
      </p>
    </div>
  )
}

export function ProfileCard({ 
  className,
  user = {
    name: "John Doe",
    level: "Conscious Explorer",
    points: 45,
    maxPoints: 100
  }
}: ProfileCardProps) {
  const [quote, setQuote] = useState<string>(motivationalQuotes[0])

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
    
    const intervalId = setInterval(() => {
      setQuote(prevQuote => {
        let newQuote
        do {
          newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
        } while (newQuote === prevQuote)
        return newQuote
      })
    }, 10000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className={cn(
      "w-[320px] h-[180px] bg-gradient-to-br from-[#387478] to-[#2C5154] rounded-[20px] relative overflow-hidden shadow-lg flex flex-col mx-auto",
      "sm:w-[365px] transform hover:scale-105 hover:-translate-y-1 hover:rotate-1",
      "shadow-[0_10px_20px_rgba(0,0,0,0.2),_0_6px_6px_rgba(0,0,0,0.25)]",
      "hover:shadow-[0_14px_28px_rgba(0,0,0,0.25),_0_10px_10px_rgba(0,0,0,0.22)]",
      "transition-all duration-300",
      className
    )}>
      <div className="absolute inset-0 bg-black opacity-20 rounded-[20px] transform translate-y-2 blur-md"></div>
      <div className="relative z-10">
        <div className="p-3 h-[50px] flex items-center justify-center">
          <div className="flex flex-col w-full px-4 mt-8">
            <p className="text-white text-xs sm:text-sm font-medium font-spaceGrotesk">
              Hello {user.name.split(' ')[0]}! Let&apos;s see your progress...
            </p>
            <h2 className="text-accent-red text-base sm:text-xl md:text-2xl font-bold font-spaceGrotesk leading-tight line-clamp-2 mt-1.5 max-w-[280px]">
              {quote}
            </h2>
          </div>
        </div>

        <div className="px-4 flex items-center justify-center mt-7">
          <div className="flex items-center justify-center gap-3 w-full">
            <ProfileAvatar name={user.name} />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-white mb-0.5">
                <h3 className="text-xl sm:text-2xl font-bold font-spaceGrotesk leading-[28px]">
                  {user.name}
                </h3>
                <div className="flex items-center gap-1">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    className="h-3.5 w-3.5 text-accent-orange"
                    aria-hidden="true"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M10 2c0 -.88 1.056 -1.331 1.692 -.722c1.958 1.876 3.096 5.995 1.75 9.12l-.08 .174l.012 .003c.625 .133 1.203 -.43 2.303 -2.173l.14 -.224a1 1 0 0 1 1.582 -.153c1.334 1.435 2.601 4.377 2.601 6.27c0 4.265 -3.591 7.705 -8 7.705s-8 -3.44 -8 -7.706c0 -2.252 1.022 -4.716 2.632 -6.301l.605 -.589c.241 -.236 .434 -.43 .618 -.624c1.43 -1.512 2.145 -2.924 2.145 -4.78" />
                  </svg>
                  <span className="text-sm sm:text-base font-medium font-spaceGrotesk">4</span>
                </div>
              </div>

              <p className="text-white text-xs sm:text-sm font-medium font-spaceGrotesk mb-2 text-center">
                Level: {user.level}
              </p>
              
              <LevelProgress points={user.points} maxPoints={user.maxPoints} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
