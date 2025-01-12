'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// Button Component
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'ghost' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
    const variantStyles = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      ghost: "hover:bg-accent hover:text-accent-foreground"
    }
    return (
      <button
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Card Component
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-[95%] mx-auto ${className}`}
      {...props}
    />
  )
)
Card.displayName = "Card"

// Icon Components
const ArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
)

const Brain = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
)

const FileQuestion = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <path d="M10 10.3c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2"/>
    <path d="M12 17h.01"/>
  </svg>
)

// TestInstructions Component
interface TestInstructionsProps {
  totalQuestions?: number
  currentQuestion?: number
  estimatedTime?: number
}

export default function TestInstructions({
  totalQuestions = 70,
  currentQuestion = 0,
  estimatedTime = 10
}: TestInstructionsProps) {
  const router = useRouter()
  const progress = (currentQuestion / totalQuestions) * 100

  return (
    <div className="min-h-screen bg-[#2C5154] p-2 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI4LDgiLz48L3N2Zz4=')] opacity-20" />
      
      <div className="max-w-[421px] mx-auto relative">
        {/* Back Button */}
        <AnimatePresence>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              variant="ghost"
              className="text-white mb-6 sm:mb-8 hover:bg-white/10 transition-all duration-300 p-3 rounded-full"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back</span>
            </Button>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          className="space-y-5 sm:space-y-7"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <Brain className="h-10 w-10 mx-auto text-[#E36C59]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Uncover Your Political Values
            </h1>
          </div>

          {/* Main Card */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white p-4 sm:p-5 relative overflow-hidden w-full max-w-[421px] mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            
            <div className="relative space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-center text-white">
                Before you start
              </h2>

              <div className="space-y-3">
                {/* Test Description */}
                <div className="flex items-start space-x-3">
                  <FileQuestion className="h-5 w-5 text-[#E36C59] mt-1 flex-shrink-0" />
                  <p className="text-sm text-white/90">
                    This test consists of {totalQuestions} thought-provoking statements designed to explore your political beliefs. Your answers will reflect your position across eight core values.
                  </p>
                </div>

                {/* Honesty Reminder */}
                <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10">
                  <p className="text-center text-sm text-white/90 font-medium">
                    Please respond honestly, based on your true opinions.
                  </p>
                </div>

                {/* Test Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 text-white/90 space-y-1 sm:space-y-0">
                  <p className="text-xs sm:text-sm">
                    Estimated Time:
                    <span className="ml-1 font-semibold text-white">
                      {estimatedTime} min
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm">
                    Progress:
                    <span className="ml-1 font-semibold text-white">
                      {currentQuestion}/{totalQuestions}
                    </span>
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {currentQuestion > 0 && (
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-3">
                  <motion.div 
                    className="h-full bg-[#E36C59]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Start/Continue Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex justify-center mt-6"
          >
            <Button 
              className="w-auto px-5 bg-gradient-to-r from-[#E36C59] to-[#E36C59]/90 hover:from-[#E36C59]/90 hover:to-[#E36C59] text-white py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              onClick={() => router.push('/test/questions')}
            >
              {currentQuestion > 0 ? 'Continue test' : 'Start test'}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

