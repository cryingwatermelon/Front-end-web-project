import { createRouter } from '@/lib/create-app'
import * as routes from '@/routes/photo/photo.routes'
import {
  bubuList,
  getUserInfo,
  login,
  register,
  updateUserInfo,
} from './photo.handler'
const photo_router = createRouter()
photo_router.openapi(routes.login, login)
photo_router.openapi(routes.userInfo, getUserInfo)
photo_router.openapi(routes.updateUserInfo, updateUserInfo)
photo_router.openapi(routes.register, register)
photo_router.openapi(routes.bubuList, bubuList)
export default photo_router
