import qiniu from 'qiniu'
import env from './env'


const mac=new qiniu.auth.digest.Mac(env.QINIU_ACCESS_KEY,env.QINIU_SECRET_KEY)

const bucket='bubu0507'
const options={
    scope:bucket,
    expire:14400,
    callbackUrl: "http://svuzwd4n0.hb-bkt.clouddn.com",
    callbackBody:
    "key=$(key)&hash=$(etag)&bucket=$(bucket)&fsize=$(fsize)&name=$(x:name)",
}
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

console.log('uploadToken',uploadToken)
const config = new qiniu.conf.Config();
// 空间对应的区域，若不配置将自动查询
config.regionsProvider = qiniu.httpc.Region.fromRegionId("z1");

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();
const key = "test.txt";
formUploader
  .put(uploadToken, key, "hello world", putExtra)
  .then(({ data, resp }) => {
    if (resp.statusCode === 200) {
      console.log(data);
    } else {
      console.log(resp.statusCode);
      console.log(data);
    }
  })
  .catch((err) => {
    console.log("failed", err);
  });