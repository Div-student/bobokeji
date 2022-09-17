const Router = require('koa-router')
const router = new Router()

const { operateTable } = require('../../dataBase/index')


// @ts-ignore
router.get('/get', async(ctx) => {
  let { wechat_uid }  = ctx.query
  let sql = `select * from user where wechat_uid='${wechat_uid}'`
  let orderList = await operateTable(sql)
  ctx.body = {
    data: orderList,
    code: 200
  }
})
module.exports = router