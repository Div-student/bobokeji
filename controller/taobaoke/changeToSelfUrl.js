const Router = require('koa-router')
const router = new Router()
const rq = require('request-promise')
const APIKEY = 'pQYpJpObRk'; // 淘口令apikey

router.get('/changeToSelfUrl', async(ctx) => {
  const requestParams = ctx.query
  console.log('requestParams====>', requestParams)
  let param = {
    method: 'POST',
    uri: `https://api.taokouling.com/tkl/viptkljm`,
    body: {
      apikey: APIKEY,
      tkl: "$zE4tXlACOSe$"
    },
    json: true
  }
  let tkl = "4fu😄質4$zE4tXlACOSe$://,打開/"
  let url = `https://api.taokouling.com/tkl/viptkljm?apikey=${APIKEY}&tkl=${encodeURIComponent(tkl)}`
  
  let orderList = await rq(url)
  
  console.log('orderList====>', orderList)
})

module.exports = router