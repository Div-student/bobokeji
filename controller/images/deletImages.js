
const Router = require('koa-router')
const router = new Router()

const callCloudFile = require('../../utils/callCloudFile.js')
const callCloudFunction = require('../../utils/callCloudFunction.js')


router.post("/delete", async (ctx) => {
  let params = ctx.request.body
  let data = {
    $url: "bacthDeleteImgs",
    fileIds: params
  }
  let orderList = await callCloudFunction("https",data)
  let cloudFileList = await callCloudFile("batchdeletefile", "fileid_list", params)
  
  
  ctx.body = {
    orderList,
    cloudFileList,
    code: 200
  }
})

module.exports = router