import configureOpenAPI from '@/lib/config-open-api'
import createApp from '@/lib/create-app'
import index from '@/routes/index.route'
import photo from '@/routes/photo/photo.index'
import tasks from '@/routes/tasks/tasks.index'
import { jwt } from 'hono/jwt'
import env from '../env'

const myapp = createApp()

// 第二种写法
configureOpenAPI(myapp)
myapp.route('/', index)
myapp.route('/tasks', tasks)

myapp.use('/photo/*', jwt({ secret: env.SECRET }))
myapp.route('/photo', photo)

export type AppType = typeof myapp
export default myapp
