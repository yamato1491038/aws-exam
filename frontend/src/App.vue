<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkAuth()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <RouterLink to="/" class="text-xl font-bold text-gray-900">
            AWS SAP 試験練習
          </RouterLink>
          <nav class="flex items-center gap-4">
            <template v-if="authStore.isAuthenticated">
              <RouterLink to="/quiz" class="text-gray-600 hover:text-gray-900">
                問題
              </RouterLink>
              <RouterLink to="/history" class="text-gray-600 hover:text-gray-900">
                履歴
              </RouterLink>
              <button
                @click="authStore.logout()"
                class="text-gray-600 hover:text-gray-900"
              >
                ログアウト
              </button>
            </template>
            <template v-else>
              <RouterLink to="/login" class="text-gray-600 hover:text-gray-900">
                ログイン
              </RouterLink>
            </template>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
