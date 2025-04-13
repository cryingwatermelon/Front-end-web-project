import service from './request'

import type { RegisterData, UpdateUserInfo, UserData } from '@/types/user'

export const login = function (data: UserData) {
  return service.request({
    url: '/login',
    method: 'post',
    data,
  })
}

export const logout = function (token: string) {
  return service.request({
    url: '/logout',
    method: 'post',
    headers: {
      Authorization: token,
    },
  })
}

// export async function refresh() {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         data: {
//           token: 'new-mock-token',
//         },
//       })
//     }, 1000)
//   })
// }
export const getTasksList = function () {
  return service.request({
    url: '/tasks',
    method: 'get',
  })
}

export const getUserInfo = function () {
  return service.request({
    url: '/photo/userInfo',
    method: 'get',
  })
}

export const updateUserInfo = function (data: UpdateUserInfo) {
  return service.request({
    url: '/photo/userInfo',
    method: 'patch',
    data,
  })
}

export const register = function (data: RegisterData) {
  return service.request({
    url: '/register',
    method: 'post',
    data,
  })
}
