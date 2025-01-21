"use client"

import { ActionCard } from "@/components/ui/ActionCard"
import { ArrowUpRight } from "lucide-react"

export default function ResultsPage() {
  const testResults = [
    {
      title: "Ideology Test",
      backgroundColor: "#42888D",
      iconBgColor: "#2C5154",
      Icon: ArrowUpRight,
      isEnabled: true
    },
    {
      title: "Personality Test",
      backgroundColor: "#E36C59",
      iconBgColor: "#2C5154",
      Icon: ArrowUpRight,
      isEnabled: false
    },
    {
      title: "Emotional Int Test",
      backgroundColor: "#778BAD",
      iconBgColor: "#2C5154",
      Icon: ArrowUpRight,
      isEnabled: false
    },
    {
      title: "Values Test",
      backgroundColor: "#DA9540",
      iconBgColor: "#2C5154",
      Icon: ArrowUpRight,
      isEnabled: false
    },
    {
      title: " ",
      backgroundColor: "#D9D9D9",
      iconBgColor: "#2C5154",
      Icon: ArrowUpRight,
      isEnabled: false
    },
    {
      title: " ",
      backgroundColor: "#D9D9D9",
      iconBgColor: "#2C5154",
      Icon: ArrowUpRight,
      isEnabled: false
    }
  ]

  return (
    <div className="flex flex-col items-center">
      <div className="w-full bg-brand-tertiary rounded-b-[50px] shadow-lg pb-8 sm:pb-14 mb-6 sm:mb-8">
        <div className="w-full max-w-2xl mx-auto px-4 pt-16 sm:pt-20">
          <h1 className="text-center text-white text-3xl sm:text-4xl md:text-5xl font-bold font-spaceGrotesk leading-tight sm:leading-[50px] mb-3 sm:mb-4">
            Tests Results
          </h1>
          <p className="text-center text-[#C9CDCE] text-lg font-normal font-spaceGrotesk leading-[25px]">
            Insights based on <span className="font-bold">your results</span>
          </p>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 gap-6 justify-items-center max-w-[400px] mx-auto">
          {testResults.map((test, index) => (
            <ActionCard
              key={index}
              title={test.isEnabled ? test.title : `${test.title} (Coming Soon)`}
              backgroundColor={test.backgroundColor}
              iconBgColor={test.iconBgColor}
              Icon={test.Icon}
              className={`transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                !test.isEnabled && "opacity-30 cursor-not-allowed"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 