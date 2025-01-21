"use client"

import SearchBar from "@/components/ui/SearchBar"
import { TestCard } from "@/components/TestCard"

export default function TestsPage() {
  const handleSearch = (query: string) => {
    // Implement search logic here
    console.log('Searching for:', query)
  }

  // Example test data - this would typically come from your API
  const testData = {
    totalQuestions: 20,
    answeredQuestions: 8,
    achievements: [
      { id: "1", title: "Quick Thinker", description: "Completed test in record time" },
      { id: "2", title: "Explorer", description: "Started your first test" }
    ]
  }

  return (
    <div className="flex flex-col items-center p-4 md:p-6 mt-16 md:mt-14">
      <div className="w-full max-w-7xl px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-spaceGrotesk mb-4">
            Available Tests
          </h1>
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search for tests..."
            className="mb-6"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TestCard
            totalQuestions={testData.totalQuestions}
            answeredQuestions={testData.answeredQuestions}
            achievements={testData.achievements}
            onCardClick={() => {/* Handle click */}}
          />
          {/* Add more TestCards as needed */}
        </div>
      </div>
    </div>
  )
} 