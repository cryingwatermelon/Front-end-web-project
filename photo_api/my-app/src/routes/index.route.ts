import { db } from '@/db'
import { loginSchema, tokenSchema } from '@/db/schema'
import { notFoundSchema, unAuthorizedSchema } from '@/lib/constants'
import { createRouter } from '@/lib/create-app'
import { createRoute } from '@hono/zod-openapi'
import { jwt } from 'hono/jwt'
import Jwt from 'jsonwebtoken'
import * as HttpStatusCode from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import createMessageObjectSchema from 'stoker/openapi/schemas/create-message-object'
import { z } from 'zod'
import env from '../../env'

const app = createRouter()

app.openapi(
  createRoute({
    tags: ['Index'],
    method: 'get',
    path: '/',
    // responses: {
    //   200: {
    //     description: 'Hello World',
    //     content: {
    //       'application/json': {
    //         schema: z.object({
    //           message: z.string(),
    //         }),
    //       },
    //     },
    //   },
    // },
    responses: {
      [HttpStatusCode.OK]: jsonContent(
        // z.object({
        //   message: z.string(),
        // }),
        createMessageObjectSchema('hello world'),
        'Tasks API index', // description
      ),
    },
  }),
  (c) => {
    return c.json(
      {
        message: 'Test Get API',
      },
      HttpStatusCode.OK,
    )
  },
)
const fakeDB = [
  {
    username: 'admin',
    password: '67890',
  },
]

app.openapi(
  createRoute({
    path: '/testlogin',
    method: 'post',
    responses: {
      [HttpStatusCode.OK]: jsonContent(
        z.object({
          message: z.string(),
        }),
        'You are authorized',
      ),
    },
    request: {
      body: jsonContent(
        z.object({
          username: z.string().min(1, 'Username is required'),
          password: z.string().min(1, 'Password is required'),
        }),
        'The login account information',
      ),
    },
  }),
  async (c) => {
    try {
      const { username, password } = await c.req.json()
      // 验证用户输入
      if (!username || !password) {
        return c.json({
          message: 'username or password is required',
        })
      }
      // 去数据库中查找
      const user = fakeDB.find(
        user => user.username === username && user.password === password,
      )
      if (!user) {
        return c.json({
          message: 'username or password is incorrect',
        })
      }
      // 生成token
      const token = jwt({ secret: env.SECRET })
      return c.json({
        message: 'return token successfully',
        token,
      })
    }
    catch {
      return c.json({
        message: 'Invalid request',
      })
    }
  },
)
app.openapi(
  createRoute({
    path: '/login',
    method: 'post',
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
  }),
  async (c) => {
    const { username, password } = await c.req.json()
    const user = await db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.username, username)
      },
    })
    if (!user) {
      return c.json(
        {
          message: 'User not found',
        },
        HttpStatusCode.NOT_FOUND,
      )
    }

    if (password !== user.password) {
      return c.json(
        { message: 'Password is incorrect' },
        HttpStatusCode.BAD_REQUEST,
      )
    }
    const token = Jwt.sign({ username: user.username }, env.SECRET, {
      expiresIn: '2h',
    })
    return c.json({ token }, HttpStatusCode.OK)
  },
)
export default app
