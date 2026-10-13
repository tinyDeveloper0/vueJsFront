import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as doLogin } from '@/api/authApi'

import {
  clearSession,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from '@/auth/session'

import type { User } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(getAccessToken())
  const user = ref<User | null>(getStoredUser<User>())

  const isAuthenticated = computed(() => {
    return !!accessToken.value
  })

  async function login(username: string, password: string): Promise<void> {
    const response = await doLogin({
      username,
      password,
    })

    if (!response) {
      throw new Error('something went wrong!')
    }

    if (response.error) {
      throw new Error(response.error)
    }

    accessToken.value = response.token

    setAccessToken(response.token)

    const loggedInUser: User = {
      id: response.id,
      fullName: response.fullName,
      username: response.username,
    }

    user.value = loggedInUser

    setStoredUser(loggedInUser)
  }

  function logout(): void {
    accessToken.value = null
    user.value = null

    clearSession()
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    login,
    logout,
  }
})
