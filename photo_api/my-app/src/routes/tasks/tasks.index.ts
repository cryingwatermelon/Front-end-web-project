import { createRouter } from '@/lib/create-app'
import * as handler from '@/routes/tasks/tasks.handler'
import * as routes from '@/routes/tasks/tasks.routes'
const router = createRouter()
router.openapi(routes.list, handler.list)
router.openapi(routes.create, handler.create)
router.openapi(routes.getOne, handler.getOne)
router.openapi(routes.patch, handler.patch)
router.openapi(routes.remove, handler.remove)
export default router
