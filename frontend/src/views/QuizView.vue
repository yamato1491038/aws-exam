<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import type { DomainId } from '@/types'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()

const selectedDomain = ref<DomainId | null>(null)

const categories = [
  { id: 'domain1' as DomainId, name: '複雑な組織に対応するソリューションの設計', weight: 26 },
  { id: 'domain2' as DomainId, name: '新しいソリューションのための設計', weight: 29 },
  { id: 'domain3' as DomainId, name: '既存のソリューションの継続的な改善', weight: 25 },
  { id: 'domain4' as DomainId, name: 'ワークロードの移行とモダナイゼーションの加速', weight: 20 }
]

const showCategorySelect = computed(() => !quizStore.currentQuestion && !quizStore.loading)

onMounted(() => {
  const domainId = route.params.domainId as DomainId | undefined
  if (domainId && ['domain1', 'domain2', 'domain3', 'domain4'].includes(domainId)) {
    startQuiz(domainId)
  }
})

async function startQuiz(domainId: DomainId) {
  selectedDomain.value = domainId
  await quizStore.generateQuestion(domainId)
}

function handleChoiceClick(choice: string) {
  if (!quizStore.isAnswered) {
    quizStore.selectAnswer(choice)
  }
}

function getChoiceClass(choice: string): string {
  const base = 'w-full text-left p-4 rounded-lg border-2 transition '
  const prefix = choice.split('.')[0].trim()

  if (!quizStore.isAnswered) {
    const isSelected = quizStore.selectedAnswers.includes(prefix)
    return base + (isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300')
  }

  // 回答後
  const isCorrect = quizStore.currentQuestion?.correctAnswers.includes(prefix)
  const isSelected = quizStore.selectedAnswers.includes(prefix)

  if (isCorrect) {
    return base + 'border-green-500 bg-green-50'
  }
  if (isSelected && !isCorrect) {
    return base + 'border-red-500 bg-red-50'
  }
  return base + 'border-gray-200 opacity-60'
}

function nextQuestion() {
  if (selectedDomain.value) {
    quizStore.generateQuestion(selectedDomain.value)
  }
}

function changeCategory() {
  quizStore.reset()
  selectedDomain.value = null
  router.push('/quiz')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Category Selection -->
    <div v-if="showCategorySelect" class="bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold mb-6">カテゴリを選択</h1>
      <div class="grid md:grid-cols-2 gap-4">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="startQuiz(cat.id)"
          class="text-left p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold">{{ cat.id.replace('domain', 'ドメイン ') }}</span>
            <span class="text-sm text-gray-500">{{ cat.weight }}%</span>
          </div>
          <p class="text-gray-600 text-sm">{{ cat.name }}</p>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="quizStore.loading" class="bg-white rounded-lg shadow p-8 text-center">
      <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">問題を生成中...</p>
    </div>

    <!-- Error -->
    <div v-else-if="quizStore.error" class="bg-white rounded-lg shadow p-8 text-center">
      <div class="text-red-500 text-4xl mb-4">!</div>
      <p class="text-red-600 mb-4">{{ quizStore.error }}</p>
      <button
        @click="changeCategory"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        カテゴリ選択に戻る
      </button>
    </div>

    <!-- Question -->
    <div v-else-if="quizStore.currentQuestion" class="space-y-6">
      <!-- Question Header -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm text-gray-500">
            {{ quizStore.currentQuestion.category.replace('domain', 'ドメイン ') }}
          </span>
          <span class="text-sm px-3 py-1 rounded-full" :class="
            quizStore.currentQuestion.questionType === 'single'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          ">
            {{ quizStore.currentQuestion.questionType === 'single' ? '択一' : '複数選択' }}
          </span>
        </div>
        <h2 class="text-lg font-medium whitespace-pre-wrap">
          {{ quizStore.currentQuestion.question }}
        </h2>
      </div>

      <!-- Choices -->
      <div class="space-y-3">
        <button
          v-for="choice in quizStore.currentQuestion.choices"
          :key="choice"
          @click="handleChoiceClick(choice)"
          :class="getChoiceClass(choice)"
        >
          {{ choice }}
        </button>
      </div>

      <!-- Submit Button -->
      <div v-if="!quizStore.isAnswered" class="flex justify-center">
        <button
          @click="quizStore.submitAnswer()"
          :disabled="quizStore.selectedAnswers.length === 0"
          class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          回答する
        </button>
      </div>

      <!-- Result & Explanation -->
      <div v-else class="space-y-4">
        <!-- Result -->
        <div
          class="p-4 rounded-lg text-center font-bold text-lg"
          :class="quizStore.isCorrect() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
        >
          {{ quizStore.isCorrect() ? '正解!' : '不正解' }}
        </div>

        <!-- Explanation -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="font-bold mb-3">解説</h3>
          <div class="text-gray-700 whitespace-pre-wrap">
            {{ quizStore.currentQuestion.explanation }}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-center gap-4">
          <button
            @click="changeCategory"
            class="px-6 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400"
          >
            カテゴリ選択
          </button>
          <button
            @click="nextQuestion"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            次の問題
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
