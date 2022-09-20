
const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')


router.post("/updataInageClass", async (ctx) => {
  let params = ctx.request.body
  let query = `db.collection('configs').where({
    configName: 'configs'
  }).update({
    data: {
      picContent: '${params}'
    }
  })`
  let result = await callCloudDataBase("databaseupdate", query)
  
  ctx.body = {
    result,
    code: 200
  }
})

module.exports = router