const Router = require('koa-router')
const router = new Router()

const { operateTable } = require('../../dataBase/index')


// @ts-ignore
router.post('/get', async(ctx) => {
  let { wechat_uid= '', pageNum=1, pageSize=10 } = ctx.request.body
  // 查询用户微信公众的openID对应的user_id
  let userSql = `select * from user where wechat_uid='${wechat_uid}'`
  let userInfo = await operateTable(userSql)
  let orderList = []
  if(userInfo.length > 0){
    let sql = `select * from jd_goods_list where positionId='${userInfo[0].user_id}' order by record_id desc limit ${pageNum-1},${pageSize}`
    if(wechat_uid === "oF-RA6fbdaY0mXnMW5lzgWVlpOXM" || wechat_uid === "oBHe40ybW1KyGblscxI4uTaGExWo"){
      sql = `select * from jd_goods_list order by record_id desc limit ${pageNum-1},${pageSize}`
    }
    orderList = await operateTable(sql)
  }
  ctx.body = {
    data: orderList,
    code: 200
  }
})
module.exports = router