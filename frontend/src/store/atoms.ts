import { atom } from 'jotai'

interface StandardAnswer {
  std_answer_id: number
  answer: string
}

interface Question {
  question_id: number
  question: string
  std_answer: boolean
  sort_order: number
  area: {
    area_id: number
    area_name: string
  }
}

// Atom to store standard answers
export const standardAnswersAtom = atom<StandardAnswer[]>([])

// Atom to store current question
export const currentQuestionAtom = atom<Question | null>(null) 