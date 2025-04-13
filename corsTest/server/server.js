const express = require('express')
// const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
const app = express()

// const students = [
//   { id: '001', name: 'Alice' },
//   { id: '001', name: 'Bob' },
//   { id: '001', name: 'Charlie' },
// ]

//手动添加
// app.options('/students', (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
//   res.setHeader('Access-Control-Allow-Methods', 'GET')
//   res.setHeader('Access-Control-Allow-Headers', 'school,city')
//   res.setHeader('Access-Control-Max-Age', '7200')
//   res.send()
// })

//通过封装好的库实现
// app.use(
//   cors({
//     origin: 'http://127.0.0.1:5500',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
//     allowedHeaders: ['school', 'city'],
//     exposedHeaders: ['school', 'city'],
//   })
// )
// const corsOptions = {
//   origin: 'http://127.0.0.1:5500',
//   methods: 'GET',
//   headers: 'school,city',
// }
// app.get('/students', (req, res) => {
//   res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
//   res.send(students)
// })

//jsonp
const teachers = [
  { id: '001', name: 'Alice' },
  { id: '002', name: 'Bob' },
  { id: '003', name: 'Charlie' },
]
app.get('/teachers', (req, res) => {
  const { callback } = req.query.callback //获取callback参数
  if (callback) {
    res.send(`${callback}(${JSON.stringify(teachers)})`) //返回jsonp格式数据
  } else {
    res.json(teachers) //返回json格式数据
  }
  // res.send(`callback(${JSON.stringify(teachers)})`)
})

//自己配置代理服务器
app.use(express.static('./public'))
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://www.toutiao.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  })
)
app.listen(8081, () => {
  console.log('Server is running on port 8081')
})
