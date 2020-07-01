/** 
 * javascript comment 
 * @Author: hankqin 
 * @Date: 2020-05-30 10:13:59 
 * @Desc: 安卓APK版本管理项目接口配置 
 */

const { sendRequest, back2json } = require('../../core')

module.exports = {
  // address: 'http://webapi.bk.apal.com.cn',
  port: '84',
  mock: false,
  customized: [ // 定制路由，用于接口的合并等需要自定义的操作
    {
      url: 'merge/getAllApkDetail',
      method: 'GET',
      cb: async (req, res, token) => {
        const { data: apks } = req.query
        const apkArr = apks.split(',')
        let obj = {}
        const data = await Promise.all(apkArr.map(_ => {
          return sendRequest('http://192.168.0.253:84/api/v1.0/androidVersion/getVersionByApk', 'GET', {}, {
            params: {
              apk: _
            },
            headers: {
              [token]: req.headers[token]||'',
              'content-type': 'application/json'
            }
          })
        }))
        if ( data && data.length ) {
          data.map(( _, i ) => {
            obj[apkArr[i]] = _.data
          })
        }
        
        return back2json({ success: true, msg: '请求数据成功', data: obj, code: 200 })
      }
    },
  ]
}