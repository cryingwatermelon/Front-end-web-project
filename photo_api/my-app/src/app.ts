import configureOpenAPI from '@/lib/config-open-api'
import createApp from '@/lib/create-app'
import index from '@/routes/index.route'
import photo from '@/routes/photo/photo.index'
import tasks from '@/routes/tasks/tasks.index'
import { jwt } from 'hono/jwt'

import env from '../env'

const myapp = createApp()

//第二种写法
configureOpenAPI(myapp)
myapp.use('/photo/*', jwt({ secret: env.SECRET }))
const app = myapp.route('/', index).route('/', photo).route('/tasks', tasks)
// app.use('/photo/uploadFile', multipart())
export type AppType = typeof app
export default app
