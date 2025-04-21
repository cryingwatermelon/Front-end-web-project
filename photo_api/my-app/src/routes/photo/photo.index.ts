import { createRouter } from '@/lib/create-app'
import * as routes from '@/routes/photo/photo.routes'
import {
  addImage,
  bubuList,
  deleteImage,
  getUserInfo,
  login,
  register,
  searchImageByTag,
  updateImageInfo,
  updateUserInfo,
} from './photo.handler'
const photo_router = createRouter()
photo_router.openapi(routes.login, login)
photo_router.openapi(routes.userInfo, getUserInfo)
photo_router.openapi(routes.updateUserInfo, updateUserInfo)
photo_router.openapi(routes.register, register)
photo_router.openapi(routes.bubuList, bubuList)
photo_router.openapi(routes.uploadImage, addImage)
photo_router.openapi(routes.deleteImage, deleteImage)
photo_router.openapi(routes.searchByTag, searchImageByTag)
photo_router.openapi(routes.updateImageInfo, updateImageInfo)
export default photo_router
