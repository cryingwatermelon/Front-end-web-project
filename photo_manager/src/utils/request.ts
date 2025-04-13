// import axios from 'axios'

// import { login, logout } from './user'

// import { useUserStore } from '@/store'

// const service = axios.create({
//   baseURL: import.meta.env.VITE_BASE_API,
//   timeout: 10000,
// })

// const { getToken, clearToken, saveToken } = useUserStore()
// // 请求拦截器
// service.interceptors.request.use(
//   (config) => {
//     const token = getToken()
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}` // 让每个请求携带token
//     }
//     return config
//   },
//   (error) => {
//     // ...
//     return Promise.reject(error)
//   },
// )

// // 响应拦截器
// service.interceptors.response.use(
//   async (response) => {
//     // ...
//     return response
//   },
//   async (error) => {
//     const { response } = error
//     if (response && response.status === 401) {
//       const router = useRouter()
//       router.push({ name: 'Login' }) // 重定向到登录页
//       // 401表示token过期或者未授权
//       const token = getToken()
//       if (token) {
//         saveToken(token)
//       }
//       // const originalRequest = error.config
//       // if (token && !originalRequest._retry) {
//       //   originalRequest._retry = true
//       //   try {
//       //      const newToken=await refreshToken()
//       //      saveToken(newToken)
//       //      originalRequest.headers.Authorization = `Bearer ${newToken}`
//       //      return service(originalRequest)
//       //   }
//       //   catch (error) {
//       //     clearToken()
//       //     const router = useRouter()
//       //     router.push({ name: 'Login' }) // 重定向到登录页
//       //   }
//       //   else{

//       // }
//       // }
//     }
//     const router = useRouter()
//     router.push({ name: 'Login' })
//     return Promise.reject(error)
//   },
// )

// export default service

import axios from 'axios'

import { useUserStore } from '@/store'

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 10000,
})

service.interceptors.request.use(
  (config) => {
    const { getToken } = useUserStore()
    const token = getToken()
    // console.log('token', token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // ...
    return Promise.reject(error)
    // eslint-disable-next-line style/comma-dangle
  }
)

service.interceptors.response.use(
  (response) => {
    if (response.status === 401) {
      throw new Error('未授权')
    }
    if (response.status === 400) {
      throw new Error('输入不正确')
    }
    return response
  },
  (error) => {
    // ...
    return Promise.reject(error)
    // eslint-disable-next-line style/comma-dangle
  }
)
export default service
