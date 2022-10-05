const Router = require('koa-router')
const router = new Router()

const { operateTable } = require('../../dataBase/index')


// @ts-ignore
router.post('/get', async(ctx) => {
  let { wechat_uid= '', pageNum=1, pageSize=10 } = ctx.request.body
  let sql = `select * from pdd_goods_list where wechat_uid='${wechat_uid}' limit ${pageNum-1},${pageSize}`
  if(wechat_uid === "oF-RA6fbdaY0mXnMW5lzgWVlpOXM" || wechat_uid === "oBHe40ybW1KyGblscxI4uTaGExWo"){
    sql = `select * from pdd_goods_list order by pgd_id desc limit ${pageNum-1},${pageSize}`
  }
  let orderList = await operateTable(sql)
  ctx.body = {
    data: orderList,
    code: 200
  }
})
module.exports = router