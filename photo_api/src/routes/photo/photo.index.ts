import { createRouter } from '@/lib/create-app'
import * as routes from '@/routes/photo/photo.routes'
import * as usersRoutes from '@/routes/photo/photoUserInfo.routes'
import {
  addImage,
  bubuList,
  deleteImage,
  searchImageByTag,
  updateImageInfo,
  uploadImageFile,
} from './photo.handler'

import { getUserInfo, login, register, updateUserInfo } from './photoUserInfo.handler'

const photo_router = createRouter()
photo_router.openapi(usersRoutes.login, login)
photo_router.openapi(usersRoutes.userInfo, getUserInfo)
photo_router.openapi(usersRoutes.updateUserInfo, updateUserInfo)
photo_router.openapi(usersRoutes.register, register)
photo_router.openapi(routes.bubuList, bubuList)
photo_router.openapi(routes.uploadImage, addImage)
photo_router.openapi(routes.deleteImage, deleteImage)
photo_router.openapi(routes.searchByTag, searchImageByTag)
photo_router.openapi(routes.updateImageInfo, updateImageInfo)
photo_router.openapi(routes.uploadImageFile, uploadImageFile)
export default photo_router
