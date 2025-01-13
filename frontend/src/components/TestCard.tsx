'use client'

interface Achievement {
  id: string
  title: string
  description: string
}

interface TestCardProps {
  totalQuestions: number
  answeredQuestions: number
  achievements: Achievement[]
  onCardClick: () => void
}

export function TestCard({
  totalQuestions,
  answeredQuestions,
  achievements,
  onCardClick,
}: TestCardProps) {
  const progress = Math.round((answeredQuestions / totalQuestions) * 100)

  return (
    <div 
      className="w-full max-w-sm cursor-pointer bg-gradient-to-br from-[#387478] to-[#2C5154] text-white transition-all duration-300 rounded-3xl overflow-hidden transform hover:scale-105 hover:-translate-y-1 hover:rotate-1 shadow-[0_10px_20px_rgba(0,0,0,0.2),_0_6px_6px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.25),_0_10px_10px_rgba(0,0,0,0.22)]"
      onClick={onCardClick}
    >
      <div className="absolute inset-0 bg-black opacity-20 rounded-3xl transform translate-y-2 blur-md"></div>
      <div className="relative z-10">
        <div className="p-6 relative">
          <h2 className="text-center text-3xl font-bold mb-4 tracking-tight">Ideology Test</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Progress</span>
                <span className="text-[#E36C59] font-bold">{progress}%</span>
              </div>
              <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#E36C59] transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={answeredQuestions}
                  aria-valuemin={0}
                  aria-valuemax={totalQuestions}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#E36C59]">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
                <span>Achievements</span>
              </div>
              <div className="flex gap-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110"
                    title={`${achievement.title} - ${achievement.description}`}
                  >
                    <span className="text-xs font-bold">{achievement.title.charAt(0)}</span>
                    <span className="sr-only">{achievement.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

