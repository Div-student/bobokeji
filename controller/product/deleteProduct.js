const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')

router.post("/delete", async (ctx) => {
  const requestParams = ctx.request.body
  let promiseArray = []
  requestParams.productIdList.forEach(id => {
    let query = `db.collection('products').where({
      productId:'${id}'
    }).remove()`
    promiseArray.push(callCloudDataBase('databasedelete', query))
  });
  let resId = await Promise.all(promiseArray)
  ctx.body = {
    resId,
    code: 200
  }
})

module.exports = router