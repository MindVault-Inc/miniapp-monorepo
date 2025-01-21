"use client"

import AchievementCard from "@/components/ui/AchievementCard"

export default function AchievementsPage() {
  // Example achievements data - would typically come from your API
  const achievements = [
    {
      title: "Ideology Explorer",
      description: "Completed the Ideology Test",
      date: "March 15, 2024"
    },
    {
      title: "Quick Learner",
      description: "Completed 5 tests in a week",
      date: "March 10, 2024"
    },
    {
      title: "Deep Thinker",
      description: "Spent over 30 minutes on a single test",
      date: "March 5, 2024"
    }
  ]

  return (
    <div className="flex flex-col items-center p-4 md:p-6 mt-16 md:mt-14">
      <div className="w-full max-w-7xl px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-spaceGrotesk mb-2">
            Your Achievements
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your progress and unlock new achievements
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {achievements.map((achievement, index) => (
            <AchievementCard
              key={index}
              title={achievement.title}
              description={achievement.description}
              date={achievement.date}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 