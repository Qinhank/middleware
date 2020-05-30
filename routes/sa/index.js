/** 
 * javascript comment 
 * @Author: hankqin 
 * @Date: 2020-05-30 10:11:16 
 * @Desc:  必派运维系统接口配置
 */
module.exports = {
  port: '15000', // 后端接口的端口，地址设为总地址
  mock: false, // 是否打开mock模拟数据，用于并行开发或后端出错时
  // 作为自定义处理后端返回结果的方法
  /*customMethod: (rep, res) => {
    res({ msg: 'test' })
  },*/
  customized: [ // 定制路由，用于接口的合并等需要自定义的操作
    {
      url: 'merge/test',
      method: 'POST',
      cb: (req, res) => {
        return { msg: 'merge' }
      }
    },
  ]
}