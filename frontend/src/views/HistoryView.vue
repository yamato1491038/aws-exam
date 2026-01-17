<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as api from '@/services/api'
import type { Answer, Stats, DomainId } from '@/types'

const answers = ref<Answer[]>([])
const stats = ref<Stats | null>(null)
const loading = ref(false)
const lastKey = ref<string | null>(null)
const selectedCategory = ref<DomainId | 'all'>('all')
const expandedAnswer = ref<string | null>(null)

const categoryNames: Record<DomainId, string> = {
  domain1: '複雑な組織に対応するソリューションの設計',
  domain2: '新しいソリューションのための設計',
  domain3: '既存のソリューションの継続的な改善',
  domain4: 'ワークロードの移行とモダナイゼーションの加速'
}

const filteredAnswers = computed(() => {
  if (selectedCategory.value === 'all') return answers.value
  return answers.value.filter(a => a.category === selectedCategory.value)
})

onMounted(async () => {
  await Promise.all([fetchAnswers(), fetchStats()])
})

async function fetchAnswers() {
  loading.value = true
  try {
    const result = await api.getAnswers()
    answers.value = result.items
    lastKey.value = result.lastKey
  } catch (e) {
    console.error('Failed to fetch answers:', e)
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    stats.value = await api.getStats()
  } catch (e) {
    console.error('Failed to fetch stats:', e)
  }
}

async function loadMore() {
  if (!lastKey.value) return
  loading.value = true
  try {
    const result = await api.getAnswers(20, lastKey.value)
    answers.value.push(...result.items)
    lastKey.value = result.lastKey
  } finally {
    loading.value = false
  }
}

function toggleExpand(sk: string) {
  expandedAnswer.value = expandedAnswer.value === sk ? null : sk
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">学習履歴</h1>

    <!-- Stats -->
    <div v-if="stats" class="bg-white rounded-lg shadow p-6">
      <h2 class="font-bold mb-4">全体統計</h2>
      <div class="grid grid-cols-3 gap-4 text-center mb-6">
        <div>
          <div class="text-3xl font-bold text-blue-600">{{ stats.totalAnswers }}</div>
          <div class="text-sm text-gray-500">回答数</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-green-600">{{ stats.correctAnswers }}</div>
          <div class="text-sm text-gray-500">正解数</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-purple-600">{{ stats.accuracy }}%</div>
          <div class="text-sm text-gray-500">正答率</div>
        </div>
      </div>

      <!-- Category Stats -->
      <h3 class="font-semibold mb-3">カテゴリ別</h3>
      <div class="space-y-2">
        <div
          v-for="(catStats, catId) in stats.categoryStats"
          :key="catId"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex-1">
            <div class="text-sm font-medium">{{ categoryNames[catId as DomainId] }}</div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-500">{{ catStats?.correct }}/{{ catStats?.total }}</span>
            <span
              class="px-2 py-1 rounded text-sm font-semibold"
              :class="(catStats?.accuracy ?? 0) >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
            >
              {{ catStats?.accuracy }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">フィルター:</span>
      <select
        v-model="selectedCategory"
        class="border rounded-lg px-3 py-1.5 text-sm"
      >
        <option value="all">すべて</option>
        <option v-for="(name, id) in categoryNames" :key="id" :value="id">
          {{ name }}
        </option>
      </select>
    </div>

    <!-- Answer List -->
    <div v-if="loading && answers.length === 0" class="text-center py-8">
      <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <div v-else-if="filteredAnswers.length === 0" class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
      回答履歴がありません
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="answer in filteredAnswers"
        :key="answer.SK"
        class="bg-white rounded-lg shadow overflow-hidden"
      >
        <!-- Header -->
        <button
          @click="toggleExpand(answer.SK)"
          class="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div class="flex items-center gap-3">
            <span
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              :class="answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ answer.isCorrect ? '○' : '×' }}
            </span>
            <div class="text-left">
              <div class="font-medium line-clamp-1">{{ answer.questionText.slice(0, 80) }}...</div>
              <div class="text-xs text-gray-500">{{ formatDate(answer.createdAt) }}</div>
            </div>
          </div>
          <svg
            class="w-5 h-5 text-gray-400 transition"
            :class="{ 'rotate-180': expandedAnswer === answer.SK }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Expanded Content -->
        <div v-if="expandedAnswer === answer.SK" class="border-t p-4 bg-gray-50">
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-sm text-gray-500 mb-1">問題</h4>
              <p class="whitespace-pre-wrap">{{ answer.questionText }}</p>
            </div>
            <div>
              <h4 class="font-semibold text-sm text-gray-500 mb-1">選択肢</h4>
              <ul class="space-y-1">
                <li
                  v-for="choice in answer.choices"
                  :key="choice"
                  class="p-2 rounded"
                  :class="{
                    'bg-green-100': answer.correctAnswers.includes(choice.charAt(0)),
                    'bg-red-100': answer.userAnswers.includes(choice.charAt(0)) && !answer.correctAnswers.includes(choice.charAt(0))
                  }"
                >
                  {{ choice }}
                  <span v-if="answer.userAnswers.includes(choice.charAt(0))" class="text-sm text-gray-500">
                    ← あなたの回答
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-sm text-gray-500 mb-1">解説</h4>
              <p class="whitespace-pre-wrap text-sm">{{ answer.explanation }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="lastKey" class="text-center">
        <button
          @click="loadMore"
          :disabled="loading"
          class="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {{ loading ? '読み込み中...' : 'さらに読み込む' }}
        </button>
      </div>
    </div>
  </div>
</template>
