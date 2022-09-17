const Router = require('koa-router')
const router = new Router()

const { operateTable } = require('../../dataBase/index')


// @ts-ignore
router.post('/bindCode', async(ctx) => {
  let { user_account= '', user_password= '', wechat_uid='' } = ctx.request.body
  let bandFlag = ''
  // 校验用户名和密码
  let regx = /^[\u4e00-\u9fa5_\-a-zA-Z0-9]+$/
  let passwordRex = regx.test(user_password)
  let userAccountRex = regx.test(user_account)
  if(passwordRex && userAccountRex){
    // 查询wechat_uid是否已存在关联的用户名
    let sql = `select * from user where wechat_uid='${wechat_uid}'`
    let userList = await operateTable(sql)
    
    if(userList.length === 0 ){
      bandFlag = 'invalideCode'
    }else if(userList.length > 0 && userList[0].user_account){
      bandFlag = 'hasbinded'
    }else{
      // 查询用户名是否已存在
      let userCountList = await operateTable(`select * from user where user_account='${user_account}'`)
      if(userCountList.length>0){
        bandFlag = 'existedAccount'
      }else{
        let bindsql = `update user set user_account='${user_account}',user_password='${user_password}' where wechat_uid='${wechat_uid}'`
        let bindRes = await operateTable(bindsql)
        bandFlag = 'bindSucces'
      }
    }
  }else{
    bandFlag = 'fomateFailed'
  }
  ctx.body = {
    bandFlag: bandFlag,
    code: 200
  }
})

module.exports = router