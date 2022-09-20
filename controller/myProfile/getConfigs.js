const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')

router.get('/get', async(ctx) => {
  let query = `db.collection('configs').get()`
  let productList = await callCloudDataBase('databasequery', query)
  let resultList = []
  if(productList.errmsg == 'ok' && productList.data.length > 0){
    let tempRes = productList.data
    resultList = tempRes.map(items => {
      return JSON.parse(items)
    })
  }
  ctx.body = {
    resultList,
    code: 200
  }
})

module.exports = router