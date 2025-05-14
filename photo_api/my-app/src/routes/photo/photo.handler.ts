import type { AppRouteHandler } from '@/lib/types'
import type qiniu from 'qiniu'
import type { StatObjectResult } from 'qiniu/StorageResponseInterface'
import type {
  addImageRoute,
  bubuListRoute,
  deleteImageRoute,
  LoginRoute,
  patchUserInfoRoute,
  registerRoute,
  searchByTagRoute,
  updateImageInfoRoute,
  uploadImageFileRoute,
  userInfoRoute,
} from './photo.routes'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { db } from '@/db'
import { bubu, users } from '@/db/schema'
import qn, { DEFAULT_BUCKET, extractFilenameFromUrl, reName } from '@/lib/qiniu'
import { eq, like } from 'drizzle-orm'
import Jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import * as HttpStatusCode from 'stoker/http-status-codes'
import env from '../../../env'

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
      HttpStatusCode.NOT_FOUND,
    )
  }

  if (password !== user.password) {
    return c.json(
      { message: 'Password is incorrect' },
      HttpStatusCode.BAD_REQUEST,
    )
  }

  const token = Jwt.sign({ username: user.username }, env.SECRET, {
    expiresIn: '2h',
  })
  return c.json({ token }, HttpStatusCode.OK)
}

export const getUserInfo: AppRouteHandler<userInfoRoute> = async (c) => {
  const payload = await c.get('jwtPayload')
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
      HttpStatusCode.OK,
    )
  }
  return c.json({ message: 'Not found' }, HttpStatusCode.NOT_FOUND)
}

export const updateUserInfo: AppRouteHandler<patchUserInfoRoute> = async (
  c,
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
      HttpStatusCode.UNPROCESSABLE_ENTITY,
    )
  }
  return c.json({ message: 'Register succeed' }, HttpStatusCode.OK)
}

export const bubuList: AppRouteHandler<bubuListRoute> = async (c) => {
  const bubu = await db.query.bubu.findMany()
  const data = bubu.map((item) => {
    return {
      ...item,
      tags: JSON.parse(item.tags) as string[],
    }
  })
  return c.json(data, HttpStatusCode.OK)
}

export const addImage: AppRouteHandler<addImageRoute> = async (c) => {
  const { name, source, category, tags } = c.req.valid('json')
  const tagsString = JSON.stringify(tags)
  const [image] = await db
    .insert(bubu)
    .values({ name, source, category, tags: tagsString, id: nanoid(10) })
    .returning()
  if (!image) {
    return c.json(
      { message: 'Upload failed' },
      HttpStatusCode.UNPROCESSABLE_ENTITY,
    )
  }
  return c.json(HttpStatusCode.NO_CONTENT)
}

export const deleteImage: AppRouteHandler<deleteImageRoute> = async (c) => {
  const { id } = c.req.valid('param')
  // 根据id拿到七牛云图片链接
  const [image] = await db.delete(bubu).where(eq(bubu.id, id)).returning()
  const { imgUrl } = image.source
  const key = extractFilenameFromUrl(imgUrl)
  console.log('key', key)
  // 根据url去七牛云查找
  const result: Promise<qiniu.httpc.ResponseWrapper<StatObjectResult>> = qn.getFileInfo('bubu0507')
  console.log('result', (await result).data)
  // qn.deleteFile(result.data result.key)
  if (!image) {
    return c.json({ message: 'Delete failed' }, HttpStatusCode.NOT_FOUND)
  }
  return c.json(HttpStatusCode.NO_CONTENT)
}

export const searchImageByTag: AppRouteHandler<searchByTagRoute> = async (
  c,
) => {
  const { keyword } = c.req.valid('param')
  const images = await db
    .select()
    .from(bubu)
    .where(like(bubu.tags, `%${keyword}%`))
  if (!images) {
    return c.json({ message: 'Not found' }, HttpStatusCode.NOT_FOUND)
  }
  const data = images.map((item) => {
    return {
      ...item,
      tags: JSON.parse(item.tags) as string[],
    }
  })
  return c.json(data, HttpStatusCode.OK)
}

export const updateImageInfo: AppRouteHandler<updateImageInfoRoute> = async (
  c,
) => {
  const { id } = c.req.valid('param')
  const update = c.req.valid('json')
  const exist = await db.query.bubu.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id)
    },
  })
  if (!exist) {
    return c.json({ message: 'Id is not exist' }, HttpStatusCode.NOT_FOUND)
  }
  const [image] = await db
    .update(bubu)
    .set({
      ...update,
      tags: JSON.stringify(update.tags),
    })
    .where(eq(bubu.id, id))
    .returning()
  if (!image) {
    return c.json(
      { message: 'Update failed' },
      HttpStatusCode.UNPROCESSABLE_ENTITY,
    )
  }
  return c.json(HttpStatusCode.NO_CONTENT)
}

export const uploadImageFile: AppRouteHandler<uploadImageFileRoute> = async (c) => {
  const body = await c.req.parseBody()
  const file = body.file as File

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const filePath = await qn.getFilePath(reName(file.name))
  await fs.writeFileSync(filePath, buffer)
  const fileName = reName(file.name)

  try {
    const result = await qn.uploadFile(fileName, filePath)
    if (result.data?.error) {
      throw new Error(result.data.error)
    }
    console.log('result.data?.key', result.data?.key)
    const url = qn.getFileUrl(result.data?.key || fileName)
    fs.rmSync(filePath, { force: true })
    return c.json({ url }, HttpStatusCode.OK)
  }
  catch (error) {
    console.error('error', error)
    return c.json({
      error: {
        issues: [{
          code: 'custom',
          path: ['file'],
          message: error instanceof Error ? error.message : 'Upload failed',
        }],
        name: 'ZodError',
      },
      success: false,
    }, HttpStatusCode.UNPROCESSABLE_ENTITY)
  }
}

export const deleteFile: AppRouteHandler<deleteImageRoute> = async (c) => {
  const { id } = c.req.valid('param')
}
