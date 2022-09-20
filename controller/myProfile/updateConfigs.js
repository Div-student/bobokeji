const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')

router.post('/update', async(ctx) => {
  let params = ctx.request.body
  let query = `db.collection('configs').where({
    _id:'${params._id}'
  }).update({
    data: ${JSON.stringify(params)}
  })`
  let resId = await callCloudDataBase('databaseupdate', query)
  console.log('更新===》', params)
  ctx.body = {
    resId,
    code: 200
  }
})

module.exports = router