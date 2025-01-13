import { cn } from "@/lib/utils"

export function AchievementButton({ hasNewAchievement = true }) {
  return (
    <button
      className={cn(
        "w-[320px] h-[50px] relative bg-brand-secondary rounded-[20px]",
        "sm:w-[365px]",
        "shadow-[0px_4px_4px_rgba(0,0,0,0.25)]",
        "flex items-center justify-center",
        "transform transition-all duration-300 hover:scale-105"
      )}
    >
      <div className="absolute left-6">
        {hasNewAchievement && (
          <div className="w-3 h-3 rounded-full bg-accent-red" />
        )}
      </div>
      <span className="text-neutral-black text-base sm:text-lg font-medium font-spaceGrotesk">
        Latest Achievement
      </span>
    </button>
  )
} 