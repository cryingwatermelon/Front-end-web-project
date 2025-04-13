import { serve } from '@hono/node-server'
import env from '../env'
import app from './app'

const port = env.PORT
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
