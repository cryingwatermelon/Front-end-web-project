import type { tasksType } from '@/db/schema'
import { execSync } from 'node:child_process'
import createApp, { createTestApp } from '@/lib/create-app'
import { testClient } from 'hono/testing'
import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest'
import env from '../../../env'
import router from './tasks.index'

if (env.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV must be test')
}
describe('tasks list', async () => {
  beforeAll(async () => {
    execSync('pnpm drizzle-kit push')
  })
  // afterAll(async () => {
  //   fs.rmSync('test.db', { force: true })
  // })
  it('responds with an array', async () => {
    const testRouter = createTestApp(router)
    const response = await testRouter.request('/tasks')
    const result: tasksType[] = await response.json()
    console.info(result)
    expectTypeOf(result).toBeArray()
  })
  it('responds with an array(testClient)', async () => {
    const client: any = await testClient(createApp().route('/', router))
    console.info('client', client)
    const response = await client.tasks.$get()
    console.info('response', response)
    const json = await response.json()
    console.info('json', json)
  })
  it('validates the id param(testClient)', async () => {
    const client: any = await testClient(
      createApp().route('/tasks/{id}', router),
    )
    const response = await client.tasks[':id'].$get({
      params: {
        id: 'whatever',
      },
    })
    expect(response.status).toBe(422)
  })
  it('validates the body when creating', async () => {
    const client: any = await testClient(createApp().route('/tasks', router))
    const response = await client.tasks.$post({
      body: {
        name: 'Task 1',
        description: 'Task 1 description',
        status: 'completed',
      },
    })
    console.info('response', response)
    expect(response.status).toBe(422)
  })
})
