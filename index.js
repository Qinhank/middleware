const express = require('express')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
const bodyParser = require('body-parser')
const app = new express()
const { back2json, dealUrl, sendRequest, address } = require('./core')

// 开启跨域
app.use(cors())

// 解析post数据
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 判断是否为指定路由
const customizedRoutes = require('./config')

//设置get、post的统一处理方法
const deal = async (req, res) => {
  const urlArr = req.url.split('/')
  // 判断数组的第二个数据是否是定制路由
  const key = urlArr&&urlArr[1]?urlArr[1]:''
  const hasRoute = customizedRoutes.filter(_ => _.name===key)
  if(urlArr && key && hasRoute.length>0) {
    let hasFile = hasRoute[0].hasFile
    let name = hasRoute[0].name
    let fn = hasRoute[0].fn
    // 如果存在文件，则直接读取文件并使用
    if(hasFile) {
      const {
        address: addressConfig,
        port = 80,
        mock = false,
        customized = [],
        customMethod,
        token = 'authorization'
      } = require(`./routes/${name}`)
      const customs = customized.map(_ => _.url)
      // 如果是定制路由，则全部交由路由自己处理，否则则使用统一处理函数
      if(customs.indexOf(dealUrl(req.url)) > -1) {
        const item = customized[customs.indexOf(dealUrl(req.url))]
        if(req.method==item.method) {
          return item.cb(req, res)
        } else {
          return back2json({ success: false, msg: '当前接口不存在或已删除', code: 404 })
        }
      } else {
        const url = `${addressConfig?addressConfig:address}:${port}/${dealUrl(req.url)}`
        const result = await sendRequest(url, req.method, req.body, {
          customMethod,
          headers: {
            [token]: req.headers[token]||'',
            'content-type': 'application/json'
          }
        })
        return result
      }
    } else {
      return await fn(req, res)
    }
  } else {
    return back2json({ success: false, msg: '当前接口不存在或已删除', code: 404 })
  }
}

const proxys = customizedRoutes.filter(_ => _.proxy)

// 顶层判断为是否直接做代理而不做处理，格式为api/proxy/xxx
proxys.map(_ => {
  const name = `/proxy/${_.name}`
  app.use(name, createProxyMiddleware({
    target: _.proxy,
    changeOrigin: true,
    secure: false,
    pathRewrite: { [name]: '' }
  }))
})

app.use(async (ctx, res, next) => {
  const urlArr = ctx.url.split('/')
  if(ctx.url!=='/' && urlArr && urlArr.length) {
    const key = urlArr[2]
    const proxyIndex = proxys.map(_ => _.name).indexOf(key)
    // 判断是否为proxy路由
    if(urlArr[1]==='proxy') {
      if(proxyIndex>-1) {
        next()
      } else {
        res.send(back2json(false, '当前无此代理接口，请检查'))
      }
    } else {
      const data = await deal(ctx,res)
      res.send(data)
    }
  } else {
    res.send(
      `<div style="display: flex;flex-direction: column;align-items: center;justify-content: center;height: 100%;"><h1>必派前端中间件</h1>
      <p>用于必派公司前端团队的前后端中间件</p></div>`
    )
  }
})

app.listen(3495)