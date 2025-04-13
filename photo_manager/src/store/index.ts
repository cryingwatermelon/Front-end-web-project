import type { UserInfo } from '@/types/user'

// import { refresh } from '@/utils/user'

export const useAppStore = defineStore(
  'app',
  () => {
    const appName = ref('图片管理器')

    return {
      appName,
    }
  },
  {
    persist: {
      paths: ['appName'],
    },
  },
)

export const useUserStore = defineStore('user', () => {
  function saveToken(token: string) {
    localStorage.setItem('token', token)
    // Object.assign(token, { token })
  }
  function clearToken() {
    localStorage.removeItem('token')
  }

  function getToken() {
    return localStorage.getItem('token')!
  }

  // async function refreshToken() {
  //   try {
  //     const response = await refresh()
  //     const newToken = (response as { data: { token: string } }).data.token
  //     saveToken(newToken)
  //     return newToken
  //   }
  //   catch (error) {
  //     console.error('Failed to refresh token', error)
  //     clearToken()
  //     throw error
  //   }
  // }
  return {
    // token,
    // refreshToken,
    getToken,
    saveToken,
    clearToken,
  }
})

export const useUserInfoStore = defineStore('userInfo', () => {
  const avatar_url = ref('')
  const email = ref('')

  const saveUserInfo = (userInfo: UserInfo) => {
    // console.log('saveUserInfo', userInfo)
    avatar_url.value = userInfo.avatar_url
    email.value = userInfo.email
  }
  return {
    avatar_url,
    email,
    saveUserInfo,
  }
})
