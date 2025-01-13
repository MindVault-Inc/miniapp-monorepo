import { ClockIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilledButton } from '@/components/ui/FilledButton'
import { ArrowRight } from 'lucide-react'

export default function QuizCard() {
  return (
    <div
      className={cn(
        "w-[280px] h-[160px] bg-gradient-to-br from-[#DA9540] via-[#E5AB5C] to-[#F1C17A] rounded-[16px] relative overflow-hidden flex flex-col mx-auto",
        "sm:w-[320px] transform hover:scale-105 hover:-translate-y-1 hover:rotate-1",
        "shadow-[0_10px_20px_rgba(0,0,0,0.2),_0_6px_6px_rgba(0,0,0,0.25)]",
        "hover:shadow-[0_14px_28px_rgba(0,0,0,0.25),_0_10px_10px_rgba(0,0,0,0.22)]",
        "transition-all duration-300"
      )}
    >
      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        <div className="text-center text-white text-base sm:text-lg font-medium font-spaceGrotesk leading-tight mb-3">
          Keep your streak alive! <br/>Complete a quiz today
        </div>
        <div className="space-y-3">
          <div className="w-full bg-white/20 backdrop-blur-md rounded-[12px] p-2">
            <div className="flex items-center justify-between">
              <div className="text-white text-xs sm:text-sm font-medium font-spaceGrotesk leading-tight ml-2">
                DAILY QUESTIONNAIRE
              </div>
              <ClockIcon className="text-accent-red w-5 h-5 animate-pulse" />
            </div>
          </div>
          <FilledButton 
            variant="default"
            size="sm"
            icon={ArrowRight}
            className="w-full h-8 text-xs transform transition-all duration-300 hover:scale-105"
          >
            Start Quiz
          </FilledButton>
        </div>
      </div>
    </div>
  )
}

