
const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')


router.get("/getInageClass", async (ctx) => {
  
  let query = `db.collection('configs').skip('0').limit('1').get()`
  let result = await callCloudDataBase("databasequery", query)
  let configList = ''
  if(result.data && result.data.length > 0){
    configList = JSON.parse(result.data[0])
  }
  
  ctx.body = {
    configList,
    code: 200
  }
})

module.exports = router