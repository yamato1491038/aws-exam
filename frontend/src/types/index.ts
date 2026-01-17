export type DomainId = 'domain1' | 'domain2' | 'domain3' | 'domain4'
export type QuestionType = 'single' | 'multiple'

export interface Category {
  id: DomainId
  name: string
  weight: number
}

export interface Question {
  questionId: string
  question: string
  questionType: QuestionType
  choices: string[]
  correctAnswers: string[]
  explanation: string
  category: DomainId
}

export interface Answer {
  PK: string
  SK: string
  questionId: string
  questionText: string
  questionType: QuestionType
  choices: string[]
  userAnswers: string[]
  correctAnswers: string[]
  isCorrect: boolean
  explanation: string
  category: DomainId
  createdAt: string
}

export interface Stats {
  totalAnswers: number
  correctAnswers: number
  accuracy: number
  categoryStats: {
    [key in DomainId]?: {
      total: number
      correct: number
      accuracy: number
    }
  }
}
