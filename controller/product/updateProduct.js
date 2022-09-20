const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')

router.post('/update', async(ctx) => {
  let params = ctx.request.body
  let query = `db.collection('products').where({
    productId:'${params.productId}'
  }).update({
    data: ${JSON.stringify(params)}
  })`
  console.log('query===>', query)
  let resId = await callCloudDataBase('databaseupdate', query)
  ctx.body = {
    resId,
    code: 200
  }
})

module.exports = router