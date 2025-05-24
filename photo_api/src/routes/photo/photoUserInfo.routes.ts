import {
  loginSchema,
  patchUserInfoSchema,
  registerSchema,
  tokenSchema,
  userInfoSchema,
} from '@/db/schema'
import { notFoundSchema, unAuthorizedSchema } from '@/lib/constants'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCode from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { createErrorSchema } from 'stoker/openapi/schemas'

const tags = ['users']
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
