import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  getCurrentUser,
  type SignInInput,
  type SignUpInput
} from 'aws-amplify/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ username: string; email: string } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  async function checkAuth() {
    try {
      const currentUser = await getCurrentUser()
      user.value = {
        username: currentUser.username,
        email: currentUser.signInDetails?.loginId || ''
      }
    } catch {
      user.value = null
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const input: SignInInput = { username: email, password }
      await signIn(input)
      await checkAuth()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'ログインに失敗しました'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const input: SignUpInput = {
        username: email,
        password,
        options: {
          userAttributes: { email }
        }
      }
      await signUp(input)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '登録に失敗しました'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function confirmRegistration(email: string, code: string) {
    loading.value = true
    error.value = null
    try {
      await confirmSignUp({ username: email, confirmationCode: code })
    } catch (e) {
      error.value = e instanceof Error ? e.message : '確認に失敗しました'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await signOut()
      user.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    checkAuth,
    login,
    register,
    confirmRegistration,
    logout
  }
})
