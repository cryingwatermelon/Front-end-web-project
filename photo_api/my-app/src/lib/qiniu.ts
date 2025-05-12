import dayjs from 'dayjs'
import qiniu from 'qiniu'
import env from '../../env'

const DEFAULT_BUCKET = 'bubu0507'
const TOKEN_EXPIRE_TIME = 3600

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

  getFileUrl(key: string) {
    return `${env.DOMAIN}/${key}`
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
