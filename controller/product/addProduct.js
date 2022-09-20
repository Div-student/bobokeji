const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')

router.post('/add', async(ctx) => {
  let params = ctx.request.body
  let query = `db.collection('products').add({
    data: ${JSON.stringify(params)}
  })`
  let resId = await callCloudDataBase('databaseadd', query)
  ctx.body = {
    resId,
    code: 200
  }
})

module.exports = router