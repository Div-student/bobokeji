const Router = require('koa-router')
const router = new Router()

const { operateTable } = require('../../dataBase/index')


// @ts-ignore
router.post('/login', async(ctx) => {
  let { user_account= '', user_password= '' } = ctx.request.body
  // 查询账号密码是否匹配
  let sql = `select * from user where user_account='${user_account}' and user_password='${user_password}'`
  let userList = await operateTable(sql)
  let hasPermision = false
  let weUid = ''
  if(userList.length>0){
    hasPermision = true;
    weUid  = userList[0].wechat_uid
  }
  ctx.body = {
    hasPermision: hasPermision,
    weUid: weUid,
    code: 200
  }
})
module.exports = router