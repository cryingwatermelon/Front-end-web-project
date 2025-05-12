import { db } from '@/db'
import { bubu, users } from '@/db/schema'
import type { AppRouteHandler } from '@/lib/types'
import { eq, like } from 'drizzle-orm'
import fs from 'fs'
import Jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import path from 'path'
import process from 'process'
import qiniu from 'qiniu'
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
  uploadImageFileRoute,
  userInfoRoute,
} from './photo.routes'
import { getToken, reName } from './qiniu'

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
  const data = images.map((item) => {
    return {
      ...item,
      tags: JSON.parse(item.tags) as string[],
    }
  })
  return c.json(data, HttpStatusCode.OK)
}

export const updateImageInfo: AppRouteHandler<updateImageInfoRoute> = async (
  c
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
      HttpStatusCode.UNPROCESSABLE_ENTITY
    )
  }
  return c.json(HttpStatusCode.NO_CONTENT)
}



export const uploadImageFile:AppRouteHandler<uploadImageFileRoute>=async (c)=>{
  const body = await c.req.parseBody()
  const file=body['file'] as File

  const arrayBuffer=await file.arrayBuffer()
  const buffer=Buffer.from(arrayBuffer)
  const filePath=path.join(process.cwd(), 'upload', reName(file.name))
  await fs.writeFileSync(filePath, buffer)
  //获取七牛云token
  const uploadToken =getToken()
  console.log('uploadToken',uploadToken)

  //官方文档写法
  const config=new qiniu.conf.Config()
  config.useHttpsDomain = true;
  const accessKey = env.QINIU_ACCESS_KEY
  const secretKey = env.QINIU_SECRET_KEY
  const mac=new qiniu.auth.digest.Mac(accessKey, secretKey) 
  config.regionsProvider=qiniu.httpc.Region.fromRegionId('z1')
  const bucketManager = new qiniu.rs.BucketManager(mac, config);
  const bucket='bubu0507'
  const key='bubu.gif'
bucketManager
  .stat(bucket, key)
  .then(({ data, resp }) => {
    if (resp.statusCode === 200) {
      console.log(data.hash);
      console.log(data.fsize);
      console.log(data.mimeType);
      console.log(data.putTime);
      console.log(data.type);
    } else {
      console.log(resp.statusCode);
      console.log(data);
    }
  })
  .catch((err) => {
    console.log("failed", err);
  });
}
  // const formUploader = new qiniu.form_up.FormUploader(config);
//   const putExtra = new qiniu.form_up.PutExtra()
//   formUploader.putFile(uploadToken,'avatar.png', filePath, putExtra)
//   .then(({ data, resp }) => {
//     if (resp.statusCode === 200) {
//       console.log(data);
//       fs.rmSync(filePath)
//     } else {
//       console.log(resp.statusCode);
//       console.log(data);
//     }
//   })
//   .catch((err) => {
//     console.log("failed", err);
//   });
//     console.log('file',file)
//   return c.json({size:file.size},HttpStatusCode.OK)
// }

  //上传图片到七牛云
  // const domain='https://upload-z1.qiniup.com'
  // const name=reName(file.name)
  // const formData=new FormData()
  // formData.append('file',file)
  // formData.append('token',uploadToken)
  // formData.append('key',name)
  // const result= fetch(domain,{
  //   method:'POST',
  //   body:formData,
  //   headers:{
  //     'Content-Type':'multipart/form-data'
  //   }
  // }).then (response=>{
  //   if(!response.ok){
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }
  // })
  //   console.log('result',result)

  // formUploader
  // .put(uploadToken, key, file.toString(), putExtra)
  // .then(({ data, resp }) => {
  //   if (resp.statusCode === 200) {
  //     console.log(data);
  //   } else {
  //   console.log('resp.statusCode',resp.statusCode)
  //   console.log('data',data);
  //   }
  // })
  // .catch((err) => {
  //   console.log("failed", err);
  // });