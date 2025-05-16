import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import dayjs from 'dayjs'
import qiniu from 'qiniu'
import env from '../../env'

export const DEFAULT_BUCKET = 'bubu0507'
const TOKEN_EXPIRE_TIME = 7200
const UPLOAD_DIR = 'upload'
class Qiniu {
  private mac: qiniu.auth.digest.Mac
  private putPolicy: qiniu.rs.PutPolicy
  private config: qiniu.conf.Config
  private bucketManager: qiniu.rs.BucketManager
  private token: string = ''

  constructor(private bucket: string) {
    const accessKey = env.QINIU_ACCESS_KEY
    const secretKey = env.QINIU_SECRET_KEY
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

    const options = {
      scope: bucket,
      expires: TOKEN_EXPIRE_TIME,
    }
    this.putPolicy = new qiniu.rs.PutPolicy(options)
    this.config = new qiniu.conf.Config()
    this.config.useHttpsDomain = true
    this.config.regionsProvider = qiniu.httpc.Region.fromRegionId('z1')
    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config)
  }

  getToken() {
    if (this.token) {
      return this.token
    }

    this.token = this.putPolicy.uploadToken(this.mac)
    setTimeout(() => {
      this.token = ''
    }, TOKEN_EXPIRE_TIME * 1000)

    return this.token
  }

  getFileInfo(key: string) {
    return this.bucketManager.stat(this.bucket, key)
  }

  uploadFile(key: string, filePath: string) {
    const formUploader = new qiniu.form_up.FormUploader(this.config)
    const putExtra = new qiniu.form_up.PutExtra()
    const token = this.getToken()
    return formUploader.putFile(token, key, filePath, putExtra)
  }

  deleteFile(DEFAULT_BUCKET: string, key: string) {
    return this.bucketManager.delete(DEFAULT_BUCKET, key).then(({ data, resp }) => {
      if (resp.statusCode === 200) {
        console.info('data', data)
      }
      else {
        console.info('resp.statusCode', resp.statusCode)
        console.info('resp.data', data)
      }
    }).catch((err) => {
      console.error('err', err)
    })
  }

  getFileUrl(key: string) {
    return `${env.DOMAIN}/${key}`
  }

  async getFilePath(key: string) {
    if (!await fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }
    const filePath = path.join(process.cwd(), UPLOAD_DIR, key)
    return filePath
  }

  // 数据流分片上传
  uploadStream(key: string, stream: NodeJS.ReadableStream, streamLength: number, recordFilePath: string) {
    const resumeUploader = new qiniu.resume_up.ResumeUploader(this.config)
    const putExtra = new qiniu.resume_up.PutExtra()
    putExtra.resumeKey = recordFilePath
    putExtra.version = 'v2'
    const token = this.getToken()
    // 当使用分片上传 v2 时，默认分片大小为 4MB，也可自定义分片大小，单位为 Bytes。例如设置为 6MB
    // putExtra.partSize = 6 * 1024 * 1024
    resumeUploader.putStream(token, key, stream, streamLength, putExtra).then(({ data, resp }) => {
      if (resp.statusCode === 200) {
        console.info('data', data)
      }
      else {
        console.info('resp.statusCode', resp.statusCode)
        console.info('resp.data', data)
      }
    },
    ).catch((err) => {
      console.error('上传错误:', err)
    })
  }
}

const qn = new Qiniu(DEFAULT_BUCKET)

export default qn

// 上传图片重命名
export function reName(tag: string) {
  const date = dayjs().valueOf()
  const name = `${date}_${tag}`
  return name
}

// 提取 URL 中的文件名
/**
 * 从 URL 中提取文件名
 * @param url 完整的 URL 链接
 * @returns 提取到的文件名
 */
export function extractFilenameFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    const pathname = parsedUrl.pathname
    return decodeURIComponent(pathname.substring(pathname.lastIndexOf('/') + 1))
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    console.error('无效的 URL:', url)
    return ''
  }
}
