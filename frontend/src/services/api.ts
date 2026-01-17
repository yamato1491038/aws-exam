import { fetchAuthSession } from 'aws-amplify/auth'
import type { Category, Question, Answer, Stats, DomainId } from '@/types'

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || ''

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    if (token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  } catch {
    // 未認証時は空ヘッダー
  }
  return { 'Content-Type': 'application/json' }
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_ENDPOINT}/categories`, {
    headers: await getAuthHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}

export async function generateQuestion(domainId: DomainId): Promise<Question> {
  const response = await fetch(`${API_ENDPOINT}/questions/generate`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ domainId })
  })
  if (!response.ok) throw new Error('Failed to generate question')
  return response.json()
}

export async function saveAnswer(answer: {
  questionId: string
  questionText: string
  questionType: 'single' | 'multiple'
  choices: string[]
  userAnswers: string[]
  correctAnswers: string[]
  explanation: string
  category: DomainId
}): Promise<Answer> {
  const response = await fetch(`${API_ENDPOINT}/answers`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(answer)
  })
  if (!response.ok) throw new Error('Failed to save answer')
  return response.json()
}

export async function getAnswers(limit = 20, lastKey?: string): Promise<{
  items: Answer[]
  lastKey: string | null
}> {
  const params = new URLSearchParams({ limit: limit.toString() })
  if (lastKey) params.set('lastKey', lastKey)

  const response = await fetch(`${API_ENDPOINT}/answers?${params}`, {
    headers: await getAuthHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch answers')
  return response.json()
}

export async function getStats(): Promise<Stats> {
  const response = await fetch(`${API_ENDPOINT}/answers/stats`, {
    headers: await getAuthHeaders()
  })
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}
