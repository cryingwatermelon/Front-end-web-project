import { createRouter } from '@/lib/create-app'
import { createRoute } from '@hono/zod-openapi'
import { jwt } from 'hono/jwt'
import * as HttpStatusCode from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
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
        'Tasks API index' //description
      ),
    },
  }),
  (c) => {
    return c.json(
      {
        message: 'Test Get API',
      },
      HttpStatusCode.OK
    )
  }
)
const fakeDB = [
  {
    username: 'admin',
    password: '123456',
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
        'You are authorized'
      ),
    },
    request: {
      body: jsonContent(
        z.object({
          username: z.string().min(1, 'Username is required'),
          password: z.string().min(1, 'Password is required'),
        }),
        'The login account information'
      ),
    },
  }),
  async (c) => {
    try {
      const { username, password } = await c.req.json()
      //验证用户输入
      if (!username || !password) {
        return c.json({
          message: 'username or password is required',
        })
      }
      //去数据库中查找
      const user = fakeDB.find(
        (user) => user.username === username && user.password === password
      )
      if (!user) {
        return c.json({
          message: 'username or password is incorrect',
        })
      }
      //生成token
      const token = jwt({ secret: env.SECRET })
      return c.json({
        message: 'return token successfully',
        token,
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return c.json({
        message: 'Invalid request',
      })
    }
  }
)
export default app
