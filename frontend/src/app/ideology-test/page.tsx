"use client"

import { useState } from 'react'
import { FilledButton } from "@/components/ui/FilledButton"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { useRouter } from 'next/navigation'

const answers = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Disagree",
  "Strongly Disagree"
]

export default function IdeologyTest() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const totalQuestions = 70
  const progress = (currentQuestion / totalQuestions) * 100

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-brand-tertiary px-4 py-14 flex flex-col items-center">
      <div className="w-full max-w-md">

        <FilledButton
          variant="default"
          size="sm"
          className="mb-8"
          onClick={() => router.push('/tests')}
        >
          Leave Test
        </FilledButton>


        <h1 className="text-center text-white text-3xl font-bold font-spaceGrotesk mb-6">
          Question {currentQuestion} of {totalQuestions}
        </h1>


        <div className="flex justify-center mb-8">
          <ProgressBar progress={progress} variant="warning" />
        </div>


        <div className="text-center text-white text-2xl font-bold font-spaceGrotesk mb-10">
          The government should regulate the economy to reduce inequality.
        </div>


        <div className="space-y-4 mb-12">
          {answers.map((answer, index) => (
            <FilledButton
              key={index}
              variant="secondary"
              size="lg"
              className="w-full bg-[#387478] hover:bg-[#387478]/90 
                       rounded-[30px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] text-white 
                       text-base font-bold font-spaceGrotesk"
            >
              {answer}
            </FilledButton>
          ))}
        </div>


        <div className="flex justify-between">
          <FilledButton
            variant="default"
            size="sm"
            onClick={handlePrevious}
            disabled={currentQuestion === 1}
          >
            Previous
          </FilledButton>

          <FilledButton
            variant="default"
            size="sm"
            onClick={handleNext}
            disabled={currentQuestion === totalQuestions}
          >
            Next
          </FilledButton>
        </div>
      </div>
    </div>
  )
} 