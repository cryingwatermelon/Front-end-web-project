import {
  ImageIdParamsSchema,
  insertPhotoSchema,
  keywordParamsSchema,
  patchImageInfoSchema,
  selectPhotoSchema,
  tokenSchema,
  uploadImageFileResultSchema,
  uploadImageFileSchema,
} from '@/db/schema'
import { notFoundSchema } from '@/lib/constants'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCode from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { createErrorSchema } from 'stoker/openapi/schemas'

const tags = ['photo']

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
