import { db } from '@/db'
import { bubu, users } from '@/db/schema'
import type { AppRouteHandler } from '@/lib/types'
import { eq, like } from 'drizzle-orm'
import Jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import * as HttpStatusCode from 'stoker/http-status-codes'
import env from '../../../env'
import type {
  addImageRoute,
  bubuListRoute,
  deleteImageRoute,
  LoginRoute,
  patchUserInfoRoute,
  registerRoute,
  searchByTagRoute,
  updateImageInfoRoute,
  userInfoRoute,
} from './photo.routes'

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { username, password } = await c.req.json()
  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.username, username)
    },
  })
  if (!user) {
    return c.json(
      {
        message: 'User not found',
      },
      HttpStatusCode.NOT_FOUND
    )
  }

  if (password !== user.password) {
    return c.json(
      { message: 'Password is incorrect' },
      HttpStatusCode.BAD_REQUEST
    )
  }

  const token = Jwt.sign({ username: user.username }, env.SECRET, {
    expiresIn: '2h',
  })
  return c.json({ token: token }, HttpStatusCode.OK)
}

export const getUserInfo: AppRouteHandler<userInfoRoute> = async (c) => {
  const payload = await c.get('jwtPayload')
  console.log('payload', payload)
  const result = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.username, payload.username)
    },
  })
  if (result) {
    return c.json(
      {
        username: result.username,
        avatar: result.avatar,
        email: result.email,
      },
      HttpStatusCode.OK
    )
  }
  return c.json({ message: 'Not found' }, HttpStatusCode.NOT_FOUND)
}

export const updateUserInfo: AppRouteHandler<patchUserInfoRoute> = async (
  c
) => {
  const payload = await c.get('jwtPayload')
  const updates = await c.req.valid('json')
  const username = payload.username
  const [user] = await db
    .update(users)
    .set(updates)
    .where(eq(users.username, username))
    .returning()
  if (!user) {
    return c.json({ message: 'User not found' }, HttpStatusCode.NOT_FOUND)
  }
  return c.body(null, HttpStatusCode.NO_CONTENT)
}

export const register: AppRouteHandler<registerRoute> = async (c) => {
  const { username, password, email } = await c.req.valid('json')
  const [user] = await db
    .insert(users)
    .values({ username, password, email })
    .returning()
  if (!user) {
    return c.json(
      { message: 'Register failed' },
      HttpStatusCode.UNPROCESSABLE_ENTITY
    )
  }
  return c.json({ message: 'Register succeed' }, HttpStatusCode.OK)
}

export const bubuList: AppRouteHandler<bubuListRoute> = async (c) => {
  const bubu = await db.query.bubu.findMany()
  return c.json(bubu, HttpStatusCode.OK)
}

export const addImage: AppRouteHandler<addImageRoute> = async (c) => {
  const { name, source, category, tags } = c.req.valid('json')
  const [image] = await db
    .insert(bubu)
    .values({ name, source, category, tags, id: nanoid(10) })
    .returning()
  if (!image) {
    return c.json(
      { message: 'Upload failed' },
      HttpStatusCode.UNPROCESSABLE_ENTITY
    )
  }
  return c.json(HttpStatusCode.NO_CONTENT)
}

export const deleteImage: AppRouteHandler<deleteImageRoute> = async (c) => {
  const { id } = c.req.valid('param')
  const [image] = await db.delete(bubu).where(eq(bubu.id, id)).returning()
  if (!image) {
    return c.json({ message: 'Delete failed' }, HttpStatusCode.NOT_FOUND)
  }
  return c.json(HttpStatusCode.NO_CONTENT)
}

export const searchImageByTag: AppRouteHandler<searchByTagRoute> = async (
  c
) => {
  const { keyword } = c.req.valid('param')
  const images = await db
    .select()
    .from(bubu)
    .where(like(bubu.tags, `%${keyword}%`))
  if (!images) {
    return c.json({ message: 'Not found' }, HttpStatusCode.NOT_FOUND)
  }
  return c.json(images, HttpStatusCode.OK)
}

export const updateImageInfo: AppRouteHandler<updateImageInfoRoute> = async (
  c
) => {
  const { id } = c.req.valid('param')
  const update = c.req.valid('json')
  if (!id) {
    return c.json({ message: 'Id is not found' }, HttpStatusCode.NOT_FOUND)
  }
  const [image] = await db
    .update(bubu)
    .set(update)
    .where(eq(bubu.id, id))
    .returning()
  if (!image) {
    return c.json(
      { message: 'Update failed' },
      HttpStatusCode.UNPROCESSABLE_ENTITY
    )
  }
  return c.json(HttpStatusCode.NO_CONTENT)
}