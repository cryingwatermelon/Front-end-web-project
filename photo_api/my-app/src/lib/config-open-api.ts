import { apiReference } from '@scalar/hono-api-reference'
import packageJson from '../../package.json'
import type { AppOpenAPI } from './types'

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      version: packageJson.version,
      title: packageJson.name,
    },
  })
  app.get(
    '/reference',
    apiReference({
      theme: 'kepler',
      layout: 'classic',
      defaultHttpClient: {
        targetKey: 'javascript',
        clientKey: 'fetch',
      },
      darkMode: true,
      spec: {
        url: '/doc',
      },
    })
  )
}
