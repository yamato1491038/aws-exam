import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signIn,
  signOut,
  confirmSignIn,
  getCurrentUser
} from 'aws-amplify/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ username: string; email: string } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const needsNewPassword = ref(false)

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

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    needsNewPassword.value = false
    try {
      const result = await signIn({ username: email, password })

      if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        needsNewPassword.value = true
        return false // パスワード変更が必要
      }

      await checkAuth()
      return true // ログイン完了
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'ログインに失敗しました'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function setNewPassword(newPassword: string) {
    loading.value = true
    error.value = null
    try {
      await confirmSignIn({ challengeResponse: newPassword })
      needsNewPassword.value = false
      await checkAuth()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'パスワード設定に失敗しました'
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
    needsNewPassword,
    isAuthenticated,
    checkAuth,
    login,
    setNewPassword,
    logout
  }
})
