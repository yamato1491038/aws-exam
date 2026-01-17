<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function startQuiz() {
  if (authStore.isAuthenticated) {
    router.push('/quiz')
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="text-center py-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        AWS SAP 試験練習
      </h1>
      <p class="text-lg text-gray-600 mb-8">
        Solutions Architect Professional の問題をAIが生成。<br>
        カテゴリ別に学習して、合格を目指そう。
      </p>
      <button
        @click="startQuiz"
        class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        問題を始める
      </button>
    </section>

    <!-- Categories -->
    <section class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">出題カテゴリ</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold">ドメイン 1</span>
            <span class="text-sm text-gray-500">26%</span>
          </div>
          <p class="text-gray-600 text-sm">複雑な組織に対応するソリューションの設計</p>
        </div>
        <div class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold">ドメイン 2</span>
            <span class="text-sm text-gray-500">29%</span>
          </div>
          <p class="text-gray-600 text-sm">新しいソリューションのための設計</p>
        </div>
        <div class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold">ドメイン 3</span>
            <span class="text-sm text-gray-500">25%</span>
          </div>
          <p class="text-gray-600 text-sm">既存のソリューションの継続的な改善</p>
        </div>
        <div class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold">ドメイン 4</span>
            <span class="text-sm text-gray-500">20%</span>
          </div>
          <p class="text-gray-600 text-sm">ワークロードの移行とモダナイゼーションの加速</p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="grid md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <div class="text-3xl mb-4">🤖</div>
        <h3 class="font-bold mb-2">AI問題生成</h3>
        <p class="text-gray-600 text-sm">
          Claude Sonnet 4.5 が毎回オリジナルの問題を生成
        </p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <div class="text-3xl mb-4">📊</div>
        <h3 class="font-bold mb-2">学習履歴</h3>
        <p class="text-gray-600 text-sm">
          回答履歴を保存してカテゴリ別の成績を確認
        </p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <div class="text-3xl mb-4">📝</div>
        <h3 class="font-bold mb-2">詳細解説</h3>
        <p class="text-gray-600 text-sm">
          各選択肢の正誤理由を含む詳細な解説付き
        </p>
      </div>
    </section>
  </div>
</template>
