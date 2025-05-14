import {
  ImageIdParamsSchema,
  insertPhotoSchema,
  keywordParamsSchema,
  loginSchema,
  patchImageInfoSchema,
  patchUserInfoSchema,
  registerSchema,
  selectPhotoSchema,
  tokenSchema,
  uploadImageFileResultSchema,
  uploadImageFileSchema,
  userInfoSchema,
} from '@/db/schema'
import { notFoundSchema, unAuthorizedSchema } from '@/lib/constants'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCode from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { createErrorSchema } from 'stoker/openapi/schemas'

const tags = ['photo']
export const login = createRoute({
  path: '/login',
  method: 'post',
  tags,
  request: {
    body: jsonContentRequired(loginSchema, 'The login account information'),
  },
  responses: {
    [HttpStatusCode.OK]: jsonContent(tokenSchema, 'Login successful'),
    [HttpStatusCode.BAD_REQUEST]: jsonContent(
      unAuthorizedSchema,
      'username or password is incorrect',
    ),
    [HttpStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, 'user not found'),
  },
})

export const list = createRoute({
  path: '/list',
  method: 'get',
  tags,
  request: {
    headers: tokenSchema,
    body: jsonContentRequired(tokenSchema, 'token in localStorage'),
  },
  responses: {
    [HttpStatusCode.OK]: jsonContent(tokenSchema, 'Logout Successfully'),
    [HttpStatusCode.BAD_REQUEST]: jsonContent(
      notFoundSchema,
      'User is not exist',
    ),
  },
})
export type LoginRoute = typeof login

export const userInfo = createRoute({
  path: '/userInfo',
  tags,
  method: 'get',
  request: {},
  responses: {
    [HttpStatusCode.OK]: jsonContent(userInfoSchema, 'User information'),
    [HttpStatusCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Can not find any info through given username ',
    ),
  },
})

export const updateUserInfo = createRoute({
  path: '/userInfo',
  method: 'patch',
  tags,
  request: {
    body: jsonContentRequired(
      patchUserInfoSchema,
      'The updated user information',
    ),
  },
  responses: {
    [HttpStatusCode.NO_CONTENT]: { description: 'update successfully' },
    [HttpStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, 'User not found'),
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchUserInfoSchema),
      'The validation errors',
    ),
  },
})
export const register = createRoute({
  path: '/register',
  method: 'post',
  tags,
  request: {
    body: jsonContentRequired(
      registerSchema,
      'The register account information',
    ),
  },
  responses: {
    [HttpStatusCode.NO_CONTENT]: {
      description: 'Register successfully',
    },
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(registerSchema),
      'The username is already exist',
    ),
  },
})
export type userInfoRoute = typeof userInfo
export type patchUserInfoRoute = typeof updateUserInfo
export type registerRoute = typeof register

export const bubuList = createRoute({
  path: '/bubuList',
  tags,
  method: 'get',
  request: {},
  responses: {
    [HttpStatusCode.OK]: jsonContent(
      z.array(selectPhotoSchema),
      'The list of bubu images',
    ),
    [HttpStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, 'No images found'),
  },
})
export type bubuListRoute = typeof bubuList

export const uploadImage = createRoute({
  path: '/upload',
  tags,
  method: 'post',
  request: {
    body: jsonContentRequired(insertPhotoSchema, 'The image to upload'),
  },
  responses: {
    [HttpStatusCode.NO_CONTENT]: { description: 'Upload successfully' },
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertPhotoSchema),
      'The image is already exist',
    ),
  },
})

export type addImageRoute = typeof uploadImage
export const deleteImage = createRoute({
  path: '/{id}',
  tags,
  method: 'delete',
  request: {
    params: ImageIdParamsSchema,
  },
  responses: {
    [HttpStatusCode.NO_CONTENT]: { description: 'Delete successfully' },
    [HttpStatusCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'The image Id is not exist',
    ),
  },
})
export type deleteImageRoute = typeof deleteImage

export const searchByTag = createRoute({
  path: '/{keyword}',
  tags,
  method: 'post',
  request: {
    params: keywordParamsSchema,
  },
  responses: {
    [HttpStatusCode.OK]: jsonContent(
      z.array(selectPhotoSchema),
      'The list of images with the given tag',
    ),
    [HttpStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, 'No images found'),
  },
})
export type searchByTagRoute = typeof searchByTag

export const updateImageInfo = createRoute({
  path: '/update/{id}',
  tags,
  method: 'patch',
  request: {
    params: ImageIdParamsSchema,
    body: jsonContentRequired(
      patchImageInfoSchema,
      'The updated image information',
    ),
  },
  responses: {
    [HttpStatusCode.NO_CONTENT]: { description: 'update successfully' },
    [HttpStatusCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Image ID not exist',
    ),
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchImageInfoSchema),
      'The Image update information is invalid',
    ),
  },
})
export type updateImageInfoRoute = typeof updateImageInfo

// 图片上传接口
export const uploadImageFile = createRoute({
  path: '/',
  method: 'post',
  tags,
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: uploadImageFileSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCode.OK]: jsonContent(uploadImageFileResultSchema, 'The image file upload successfully'),
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(uploadImageFileSchema), 'The image file is invalid'),
  },
})
export type uploadImageFileRoute = typeof uploadImageFile

// 从七牛云中删除图片
// export const deleteImageFile = createRoute({
//   path: '/{id}',
//   method: 'delete',
//   tags,
//   request: {
//     params: ImageIdParamsSchema,
//   },
//   responses: {
//     [HttpStatusCode.OK]: { description: 'Delete successfully' },
//     [HttpStatusCode.NOT_FOUND]: jsonContent(
//       notFoundSchema,
//       'The image ID is not exist',
//     ),
//   },
// })
// export type deleteImageFileRoute = typeof deleteImageFile
