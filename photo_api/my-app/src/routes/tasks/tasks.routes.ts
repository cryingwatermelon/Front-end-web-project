import {
  insertTasksSchema,
  patchTasksSchema,
  selectTasksSchema,
} from '@/db/schema'
import { notFoundSchema } from '@/lib/constants'
import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCode from 'stoker/http-status-codes'
import {
  jsonContent,
  jsonContentOneOf,
  jsonContentRequired,
} from 'stoker/openapi/helpers'
import { createErrorSchema, IdParamsSchema } from 'stoker/openapi/schemas'
const tags = ['tasks']
// const targetUrl = 'http://localhost:9999/tasks'
export const list = createRoute({
  path: '/tasks',
  method: 'get',
  tags,
  responses: {
    [HttpStatusCode.OK]: jsonContent(
      z.array(selectTasksSchema),
      'The list of todo tasks'
    ),
    [HttpStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, 'No tasks found'),
  },
})

export const create = createRoute({
  path: '/tasks',
  method: 'post',
  tags,
  request: {
    body: jsonContentRequired(insertTasksSchema, 'The task to create'),
  },
  responses: {
    [HttpStatusCode.OK]: jsonContent(selectTasksSchema, 'The created task'),
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      // z.object({}),
      createErrorSchema(insertTasksSchema),
      'The validation error(s)'
    ),
  },
})

export const getOne = createRoute({
  path: '/tasks/{id}',
  method: 'get',
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCode.OK]: jsonContent(selectTasksSchema, 'The requested task'),
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id'
    ),
    [HttpStatusCode.NOT_FOUND]: jsonContent(
      // z
      //   .object({
      //     message: z.string(),
      //   })
      //   .openapi({ example: { message: 'Task not found' } }),
      notFoundSchema,
      'Task not found'
    ),
  },
})

//更新部分资源
export const patch = createRoute({
  path: '/tasks/{id}',
  method: 'patch',
  tags,
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(patchTasksSchema, 'The task updates'),
  },
  responses: {
    [HttpStatusCode.OK]: jsonContent(selectTasksSchema, 'The updated task'),
    [HttpStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, 'Task not found'),
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(patchTasksSchema), createErrorSchema(IdParamsSchema)],
      'The validation error(s)'
    ),
    //这样写是anyof
    // [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
    //   createErrorSchema(patchTasksSchema).or(createErrorSchema(IdParamsSchema)),
    //   'The validation error(s)'
    // ),
  },
})

export const remove = createRoute({
  path: '/tasks/{id}',
  method: 'delete',
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCode.NO_CONTENT]: {
      description: 'Task deleted',
    },
    [HttpStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, 'Task not found'),
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid Id error'
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
