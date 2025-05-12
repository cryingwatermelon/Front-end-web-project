"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qiniu_1 = __importDefault(require("qiniu"));
const QINIU_ACCESS_KEY = "sDMnSQENrjGPf5wassYDP7ijznuje6tPM2iqcsKq";
const QINIU_SECRET_KEY = "51M6wjZVrQEnZMe2_tpkTe2aJKiQAkscfPwKQs_V";
const mac = new qiniu_1.default.auth.digest.Mac(QINIU_ACCESS_KEY, QINIU_SECRET_KEY);
const bucket = 'bubu0507';
const options = {
    scope: bucket,
    expire: 7200,
    callbackUrl: "http://svuzwd4n0.hb-bkt.clouddn.com",
    callbackBody: "key=$(key)&hash=$(etag)&bucket=$(bucket)&fsize=$(fsize)&name=$(x:name)",
};
const putPolicy = new qiniu_1.default.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);
const config = new qiniu_1.default.conf.Config();
// 空间对应的区域，若不配置将自动查询
config.regionsProvider = qiniu_1.default.httpc.Region.fromRegionId("z1");
const formUploader = new qiniu_1.default.form_up.FormUploader(config);
const putExtra = new qiniu_1.default.form_up.PutExtra();
const key = "test.txt";
formUploader
    .put(uploadToken, key, "hello world", putExtra)
    .then(({ data, resp }) => {
    if (resp.statusCode === 200) {
        console.log(data);
    }
    else {
        console.log(resp.statusCode);
        console.log(data);
    }
})
    .catch((err) => {
    console.log("failed", err);
});
