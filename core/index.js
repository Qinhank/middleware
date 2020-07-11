const axios = require('axios')

const request = axios.create({
  timeout: 6000 // 请求超时时间
})

// 统一的返回数据格式
const back2json = ({success=false, msg='', data=null, code=200}) => {
  return {
    code,
    success,
    msg,
    data
  }
}

// 解析get方法的url参数
const urlParse = (url) => {
  let obj = {};
  let reg = /[?&][^?&]+=[^?&]+/g;
  let arr = url.match(reg);
  if (arr) {
    arr.forEach((item) => {
      let tempArr = item.substring(1).split('=');
      let key = decodeURIComponent(tempArr[0]);
      let val = decodeURIComponent(tempArr[1]);
      obj[key] = val;
    });
  }
  return obj;
}

// 处理返回信息，还是加个状态码比较稳妥
const dealErrorData = (param={}) => {
  const { response={} } = param
  const { status = 400 } = response
  switch(status) {
    case 400:
      return back2json({ success: false, msg: '当前请求发生错误', code: 400 })
    case 401:
      return back2json({ success: false, msg: '当前请求未授权', code: 401 })
    case 404:
      return back2json({ success: false, msg: '当前接口不存在或已删除', code: 404 })
    case 413:
      return back2json({ success: false, msg: '当前请求实体过大', code: 413 })
    case 500:
      return back2json({ success: false, msg: '服务器发生内部错误', code: 500 })
    case 503:
      return back2json({ success: false, msg: '当前服务不可用', code: 503 })
    default:
      return back2json({ success: false, msg: '当前请求发生错误', code: 400 })
  }
}

// 统一处理发送的请求
const sendRequest = (url, method, data={}, opt={}) => {
  const { customMethod } = opt
  return new Promise(function(res) {
    try {
      request({
        url,
        method,
        data,
        maxContentLength: 100000000,
        maxBodyLength: 1000000000,
        ...opt
      })
      .then(r => {
        // 需要在这里处理常见的请求错误
        if(r.status===200) {
          // 非自定义模式则采用统一处理，自定义模式则全部交由路由自己处理
          if(customMethod && typeof customMethod === 'function') {
            customMethod(r, res)
          } else {
            const { unlogin, meta, data } = r.data
            if(unlogin) {
              res({ unlogin: true, msg: '当前未登录，请先登录' })
            } else {
              if(meta && meta.success) {
                res(back2json({ success: true, msg: '请求数据成功', data, code: 200 }))
              } else {
                // 但凡业务类型或后端返回成功但实际业务未成功的，统一返回60开头的状态码
                res(back2json({ success: false, msg: meta && meta.message?meta.message:'返回的数据有误', code: 601 }))
              }
            }
          }
        } else {
          res(dealErrorData(r))
        }
      })
      .catch(r => {
        console.log(r)
        res(dealErrorData(r))
      })
    } catch (err) {
      res(back2json({ success: false, msg: '服务发生不可预期的错误', code: 500 }))
    }
  })
}

// 处理url
const dealUrl = path => {
  let arr = path.split('/')
  if(arr && arr.length) {
    arr.splice(0,2)
    return arr.join('/')
  } else {
    console.error('无法解析path路径')
  }
}

// 全局的基本地址，用于区别本地环境还是线上环境
const address = process.env.NODE_ENV === 'production'?'http://127.0.0.1':'http://192.168.0.253'
// const address = 'http://39.99.217.131'

module.exports = { request, dealUrl, address, sendRequest, back2json }