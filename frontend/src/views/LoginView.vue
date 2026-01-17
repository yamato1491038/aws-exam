<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mode = ref<'login' | 'register' | 'confirm'>('login')
const email = ref('')
const password = ref('')
const confirmCode = ref('')

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    // エラーはストアで処理
  }
}

async function handleRegister() {
  try {
    await authStore.register(email.value, password.value)
    mode.value = 'confirm'
  } catch {
    // エラーはストアで処理
  }
}

async function handleConfirm() {
  try {
    await authStore.confirmRegistration(email.value, confirmCode.value)
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch {
    // エラーはストアで処理
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="bg-white rounded-lg shadow p-8">
      <h1 class="text-2xl font-bold text-center mb-6">
        {{ mode === 'login' ? 'ログイン' : mode === 'register' ? '新規登録' : 'メール確認' }}
      </h1>

      <!-- Error Message -->
      <div v-if="authStore.error" class="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
        {{ authStore.error }}
      </div>

      <!-- Login Form -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {{ authStore.loading ? '処理中...' : 'ログイン' }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-else-if="mode === 'register'" @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            パスワード（8文字以上、大文字・小文字・数字を含む）
          </label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {{ authStore.loading ? '処理中...' : '登録' }}
        </button>
      </form>

      <!-- Confirm Form -->
      <form v-else @submit.prevent="handleConfirm" class="space-y-4">
        <p class="text-gray-600 text-sm mb-4">
          {{ email }} に確認コードを送信しました。
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            確認コード
          </label>
          <input
            v-model="confirmCode"
            type="text"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {{ authStore.loading ? '処理中...' : '確認' }}
        </button>
      </form>

      <!-- Toggle -->
      <div class="mt-6 text-center">
        <button
          v-if="mode === 'login'"
          @click="mode = 'register'"
          class="text-blue-600 hover:underline"
        >
          アカウントを作成
        </button>
        <button
          v-else-if="mode === 'register'"
          @click="mode = 'login'"
          class="text-blue-600 hover:underline"
        >
          ログインに戻る
        </button>
      </div>
    </div>
  </div>
</template>
