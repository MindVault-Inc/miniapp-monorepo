"use client";

import { Avatar, AvatarFallback } from "@/components/ui/base/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/i18n";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  initials: string;
}

const topThree = [
  {
    rank: 1,
    name: "Jennifer",
    points: 760,
    color: "#4ECCA3",
    height: "186px",
    top: "149px",
  },
  {
    rank: 2,
    name: "Alice",
    points: 749,
    color: "#387478",
    height: "175px",
    top: "189px",
  },
  {
    rank: 3,
    name: "William",
    points: 689,
    color: "#E36C59",
    height: "186px",
    top: "216px",
  },
];

const leaderboardEntries: LeaderboardEntry[] = [
  { rank: 1, name: "Jennifer", points: 760, initials: "JE" },
  { rank: 2, name: "Alice", points: 749, initials: "AL" },
  { rank: 3, name: "William", points: 689, initials: "WI" },
  { rank: 4, name: "Lydia", points: 652, initials: "LY" },
  { rank: 5, name: "Erick", points: 620, initials: "ER" },
  { rank: 6, name: "Ryan", points: 577, initials: "RY" },
];

export default function LeaderboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(true); // State for modal visibility
  const router = useRouter(); // Initialize the router
  const { t } = useTranslation();

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    router.back(); // Redirect to the previous page
  };

  return (
    <div className="min-h-screen bg-neutral-bg relative">
      {/* Main Content */}
      <div className="relative filter blur-[2px]">
        <div
          className={cn(
            "bg-brand-tertiary p-10 pt-16 pb-8 rounded-b-[4rem] relative overflow-hidden mb-4",
            "shadow-[0_10px_20px_rgba(0,0,0,0.2),_0_6px_6px_rgba(0,0,0,0.25)]",
            "border-b border-brand-tertiary/20",
          )}
        >
          <div className="relative z-10 text-center max-w-md mx-auto">
            <h1 className="text-4xl font-bold text-slate-100 tracking-tight mb-4">
              {t('leaderboard.title')}
            </h1>

            <div className="relative h-[280px]">
              {topThree.map((entry) => (
                <div
                  key={`${entry.name}-${entry.rank}`}
                  className="absolute left-1/2 transform transition-all duration-300 hover:scale-105"
                  style={{
                    width: "80px",
                    height: entry.height,
                    backgroundColor: entry.color,
                    borderRadius: "30px",
                    boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                    top: entry.top,
                    marginLeft:
                      entry.rank === 1
                        ? "-40px"
                        : entry.rank === 2
                          ? "-120px"
                          : "40px",
                  }}
                >
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <Avatar className="w-12 h-12 border-2 border-white">
                      <AvatarFallback className="bg-neutral-bg text-white">
                        {leaderboardEntries[entry.rank - 1].initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-3xl font-bold">
                    {entry.rank}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 space-y-4 pb-20">
          {leaderboardEntries.map((entry) => (
            <div
              key={`${entry.name}-${entry.rank}`}
              className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span className="w-12 text-center text-[#2C5154] text-2xl font-normal">
                {String(entry.rank).padStart(2, "0")}
              </span>
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-neutral-400 text-white">
                  {entry.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-[#232931] text-xl font-bold">
                  {entry.name}
                </span>
                <span className="text-[#73777C] text-xs font-bold">
                  {entry.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Overlay */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-neutral-bg/60 backdrop-blur-sm flex items-center justify-center pb-20">
          <div
            className={cn(
              "bg-brand-secondary p-8 rounded-3xl text-center max-w-sm mx-4",
              "shadow-[0_14px_28px_rgba(0,0,0,0.25),_0_10px_10px_rgba(0,0,0,0.22)]",
              "border border-brand-tertiary/10 backdrop-blur-sm",
            )}
          >
            <h2 className="text-2xl font-bold text-white mb-3">{t('leaderboard.comingSoon')}</h2>
            <p className="text-slate-200 text-sm">
              {t('leaderboard.comingSoonDescription')}
            </p>
            <button
              type="button"
              className="mt-4 bg-accent-red text-white rounded-lg px-4 py-2"
              onClick={handleCloseModal} // Close the modal and redirect
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
