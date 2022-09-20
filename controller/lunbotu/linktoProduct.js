const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')

router.get("/linkToProduct", async (ctx) => {
  const requestParams = ctx.query
  let query = `db.collection('lunbotu').where({
    _id:'${requestParams.picId}'
  }).update({
    data: {
      productId: '${requestParams.productId}'
    }
  })`
  let resId = await callCloudDataBase('databaseupdate', query)

  ctx.body = {
    resId,
    code: 200
  }
})

module.exports = router