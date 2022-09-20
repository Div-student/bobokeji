const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')

router.post('/update', async(ctx) => {
  let params = ctx.request.body
  let update = `db.collection('order').where({
    _id:'${params._id}'
  }).update({
    data: ${JSON.stringify({
      verify: true
    })}
  })`
  let resId = await callCloudDataBase('databaseupdate', update)
  ctx.body = {
    resId,
    code: 200
  }
})

module.exports = router