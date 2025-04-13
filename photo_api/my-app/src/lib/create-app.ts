import { OpenAPIHono } from '@hono/zod-openapi'
import { pinoLogger } from 'hono-pino'
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares'
import defaultHook from 'stoker/openapi/default-hook'
import env from '../../env'

import type { AppBindings, AppOpenAPI } from './types'
export function createRouter() {
  const app = new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  })
  return app
}

export default function createApp() {
  // const app = new OpenAPIHono<AppBindings>({ strict: false }).use(
  //   pinoLogger({
  //     pino: {
  //       level: env.LOG_LEVEL || 'info',
  //       transport: {
  //         target: env.NODE_ENV === 'production' ? '' : 'pino-pretty',
  //       },
  //     },
  //     http: {
  //       reqId: () => crypto.randomUUID(),
  //     },
  //   })
  // )
  const app = createRouter()
  app.use(
    pinoLogger({
      pino: {
        level: env.LOG_LEVEL || 'info',
        transport: {
          target: env.NODE_ENV === 'production' ? '' : 'pino-pretty',
        },
      },
      http: {
        reqId: () => crypto.randomUUID(),
      },
    })
  )
  app.use(serveEmojiFavicon('🍉'))
  app.notFound(notFound)
  app.onError(onError)
  return app
}

export function createTestApp(router: AppOpenAPI) {
  const testApp = createApp()
  testApp.route('/', router)
  return testApp
}
