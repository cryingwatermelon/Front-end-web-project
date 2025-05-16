import type { AppRouteHandler } from '@/lib/types'
import type {
  addImageRoute,
  bubuListRoute,
  deleteImageRoute,
  searchByTagRoute,
  updateImageInfoRoute,
  uploadImageFileRoute,
} from './photo.routes'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { db } from '@/db'
import { bubu } from '@/db/schema'
import qn, { DEFAULT_BUCKET, extractFilenameFromUrl, reName } from '@/lib/qiniu'
import { eq, like } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import * as HttpStatusCode from 'stoker/http-status-codes'

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
  const targetImage = await db.select().from(bubu).where(eq(bubu.id, id))
  const [image] = await db.delete(bubu).where(eq(bubu.id, id)).returning()
  const source = targetImage[0].source
  const key = extractFilenameFromUrl(source)
  // 根据url拆出的key去七牛云删除
  qn.deleteFile(DEFAULT_BUCKET, key)
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
  // 单文件上传
  try {
    const result = await qn.uploadFile(fileName, filePath)
    if (result.data?.error) {
      throw new Error(result.data.error)
    }
    console.info('result.data?.key', result.data?.key)
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
  // 数据流上传
  // const stat = fs.statSync(filePath)
  // const stream = fs.createReadStream(filePath)
  // const resumeRecordFile = `${filePath}.log`
  // try {
  //   const result = qn.uploadStream(fileName, stream, stat.size, resumeRecordFile)
  //   console.log('result', result)
  //   const url = qn.getFileUrl(fileName)
  //   fs.rmSync(filePath, { force: true })
  //   return c.json({ url }, HttpStatusCode.OK)
  // }
  // catch (error) {
  //   console.error(error)
  //   return c.json({
  //     error: {
  //       issues: [{
  //         code: 'custom',
  //         path: ['file'],
  //         message: error instanceof Error ? error.message : 'Upload failed',
  //       }],
  //       name: 'ZodError',
  //     },
  //     success: false,
  //   }, HttpStatusCode.UNPROCESSABLE_ENTITY)
  // }
}
