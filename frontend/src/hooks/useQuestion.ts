import { useAtom } from 'jotai'
import { standardAnswersAtom, currentQuestionAtom } from '@/store/atoms'
import { useCallback } from 'react'

export function useQuestion() {
  const [standardAnswers, setStandardAnswers] = useAtom(standardAnswersAtom)
  const [currentQuestion, setCurrentQuestion] = useAtom(currentQuestionAtom)

  const fetchQuestion = useCallback(async (questionId: number) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`)
      if (!response.ok) throw new Error('Failed to fetch question')
      
      const data = await response.json()
      
      // Update current question
      setCurrentQuestion(data.question)
      
      // If standard answers exist, update them in the atom
      if (data.standardAnswers) {
        setStandardAnswers(data.standardAnswers)
      }

      return data
    } catch (error) {
      console.error('Error fetching question:', error)
      throw error
    }
  }, [setCurrentQuestion, setStandardAnswers])

  return {
    currentQuestion,
    standardAnswers,
    fetchQuestion
  }
} 