import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Category, Question, DomainId } from '@/types'
import * as api from '@/services/api'

export const useQuizStore = defineStore('quiz', () => {
  const categories = ref<Category[]>([])
  const currentQuestion = ref<Question | null>(null)
  const selectedAnswers = ref<string[]>([])
  const isAnswered = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      categories.value = await api.getCategories()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'カテゴリの取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  async function generateQuestion(domainId: DomainId) {
    loading.value = true
    error.value = null
    isAnswered.value = false
    selectedAnswers.value = []
    currentQuestion.value = null

    try {
      currentQuestion.value = await api.generateQuestion(domainId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '問題の生成に失敗しました'
    } finally {
      loading.value = false
    }
  }

  function selectAnswer(choice: string) {
    if (isAnswered.value || !currentQuestion.value) return

    // "A. AWS Control Tower..." → "A" を抽出
    const prefix = choice.split('.')[0].trim()

    if (currentQuestion.value.questionType === 'single') {
      selectedAnswers.value = [prefix]
    } else {
      const index = selectedAnswers.value.indexOf(prefix)
      if (index === -1) {
        selectedAnswers.value.push(prefix)
      } else {
        selectedAnswers.value.splice(index, 1)
      }
    }
  }

  function isAnswerSelected(choice: string): boolean {
    const prefix = choice.split('.')[0].trim()
    return selectedAnswers.value.includes(prefix)
  }

  async function submitAnswer() {
    if (!currentQuestion.value || selectedAnswers.value.length === 0) return

    isAnswered.value = true

    try {
      await api.saveAnswer({
        questionId: currentQuestion.value.questionId,
        questionText: currentQuestion.value.question,
        questionType: currentQuestion.value.questionType,
        choices: currentQuestion.value.choices,
        userAnswers: selectedAnswers.value,
        correctAnswers: currentQuestion.value.correctAnswers,
        explanation: currentQuestion.value.explanation,
        category: currentQuestion.value.category
      })
    } catch (e) {
      console.error('Failed to save answer:', e)
    }
  }

  function isCorrect(): boolean {
    if (!currentQuestion.value) return false
    const correct = currentQuestion.value.correctAnswers
    return (
      selectedAnswers.value.length === correct.length &&
      selectedAnswers.value.every(a => correct.includes(a))
    )
  }

  function reset() {
    currentQuestion.value = null
    selectedAnswers.value = []
    isAnswered.value = false
    error.value = null
  }

  return {
    categories,
    currentQuestion,
    selectedAnswers,
    isAnswered,
    loading,
    error,
    fetchCategories,
    generateQuestion,
    selectAnswer,
    isAnswerSelected,
    submitAnswer,
    isCorrect,
    reset
  }
})
