"use client";

import { ProfileCard } from "@/components/ui/ProfileCard";
import QuizCard from "@/components/ui/QuizCard";
import { AchievementButton } from "@/components/ui/AchievementButton"

export default function Home() {
  return (
    <div className="flex flex-col items-center p-4 md:p-6 mt-6 md:mt-14 overflow-x-hidden">
      <div className="w-full max-w-7xl px-4">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-spaceGrotesk mb-2">
            Welcome back!
          </h1>
          <p className="text-md font-bold md:text-base text-muted-foreground">
            Track your progress and continue your journey of self-discovery.
          </p>
        </div>

        <div className="flex flex-col gap-6 items-center w-full">
          <div className="w-full flex justify-center">
            <ProfileCard className="w-full max-w-[365px] transform transition-all duration-300 hover:scale-105" />
          </div>
          
          <div className="w-full flex justify-center">
            <QuizCard />
          </div>

          <div className="w-full flex justify-center">
            <AchievementButton />
          </div>
          
        </div>
      </div>
    </div>
  );
}
