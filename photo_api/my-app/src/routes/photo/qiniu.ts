import dayjs from 'dayjs'
import qiniu from 'qiniu'
import env from '../../../env'

export const getToken=()=>{
const bucket='bubu0507'
//鉴权对象mac
const accessKey = env.QINIU_ACCESS_KEY
const secretKey = env.QINIU_SECRET_KEY
const mac=new qiniu.auth.digest.Mac(accessKey, secretKey)

const options = {
  scope: bucket,
}; 
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);
return uploadToken
}

//上传图片重命名
export const reName=(tag:string)=>{
 const date=dayjs().valueOf()
  const name=`${tag}${date}`
  return name
}