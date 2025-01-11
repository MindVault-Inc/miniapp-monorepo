import React from 'react';
import AchievementCard from '@/components/ui/AchievementCard';  

const AchievementsPage = () => {
  const level = {
    current: 37,
    max: 100,
    title: "Conscious Explorer"
  };

  const achievements = [
    {
      title: "Ideology Explorer",
      description: "Completed the Ideology Test",
      date: "Jan 5, 2024",
      obtained: true
    },
    {
      title: "Streak Keeper",
      description: "Logged in for 7 days in a row",
      date: "Jan 9, 2024",
      obtained: true
    },
    {
      title: "Personality Explorer",
      description: "Coming Soon",
      obtained: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Achievements</h1>
          <p className="text-gray-600 mb-6">
            Celebrate your progress and discover what's next on your journey
          </p>
          
          {/* Level Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-700">
              <span className="font-medium">{level.title}</span>
              <span>{level.current}/{level.max} points</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${(level.current / level.max) * 100}%`,
                  backgroundColor: "#55BCB3"
                }}
              />
            </div>
            <p className="text-sm text-gray-500">
              Reach the next level to unlock new badges and exclusive content!
            </p>
          </div>
        </div>

        {/* Achievement Cards */}
        <div className="space-y-4">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className={`transition-all duration-300 ${
                !achievement.obtained && 'opacity-60'
              }`}
            >
              <AchievementCard
                title={achievement.title}
                description={achievement.description}
                date={achievement.obtained ? achievement.date : "Locked"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;