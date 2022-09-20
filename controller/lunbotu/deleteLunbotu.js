const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')

router.get("/delete", async (ctx) => {

  // 1.删除数据表里的数据
  const requestParams = ctx.query
  let query = `db.collection('lunbotu').where({
    url:'${requestParams.fileid}'
  }).remove()`
  let resId = await callCloudDataBase('databasedelete', query)

  ctx.body = {
    resId,
    code: 200
  }
})

module.exports = router