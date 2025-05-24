import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { createTestApp } from '@/lib/create-app'
import { afterAll, beforeAll, describe, it } from 'vitest'
import env from '../../../env'
import router from '../tasks/tasks.index'

if (env.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV must be test')
}
describe('login test', () => {
  beforeAll(async () => {
    execSync('pnpm drizzle-kit push')
  })
  afterAll(async () => {
    fs.rmSync('test.db', { force: true })
  })
  it('login input', async () => {
    const testRouter = createTestApp(router)
    const response = await testRouter.get('/login')
    const result = await response.get()
    console.info(result)
  })
})
