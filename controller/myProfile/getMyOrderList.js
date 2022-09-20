const Router = require('koa-router')
const router = new Router()

const callCloudFunction = require('../../utils/callCloudFunction.js')

// @ts-ignore
router.get('/list', async(ctx) => {
  const requestParams = ctx.query
  let data = {
    openid: requestParams.openId,
    $url: "getMyOrderList",
    pageNumb: Number(requestParams.pageNumb),
    pageCount: Number(requestParams.pageCount)
  }
  let orderList = await callCloudFunction("getProductInfo", data)
  ctx.body = {
    data:JSON.parse(orderList.resp_data),
    code: 200
  }
})
module.exports = router