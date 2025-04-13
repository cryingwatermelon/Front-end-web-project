import type { AppType } from '@/app'
import { hc } from 'hono/client'
const client: any = hc<AppType>('http://localhost:9999')
client.tasks.$get().then((res: any) => {
  console.log(res)
})
