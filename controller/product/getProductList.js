const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')
const callCloudFile = require('../../utils/callCloudFile.js')

router.get('/get', async(ctx) => {
  let params = ctx.query
  let conditon = {}
  if(params.onShelf){
    conditon.onShelf = params.onShelf
  }
  if(params.productType){
    conditon.productType = params.productType
  }
  if(params.productId){
    conditon.productId = params.productId
  }
  let query = `db.collection('products').where(${JSON.stringify(conditon)}).skip(${params.pageNumb}).limit(${params.pageCount}).get()`
  let productList = await callCloudDataBase('databasequery', query)
  let resultList = []
  let count = 0
  let productImges = []
  if( productList.errmsg=='ok' && productList.data && productList.data.length > 0){
    resultList = productList.data.map(item => {
      let tempItem = JSON.parse(item)
      productImges.push({
        "fileid": tempItem.productImge,
        "max_age": 7200
      })
      return tempItem
    })

    // 获取图片的下载url用于在第三方页面展示
    let resList = await callCloudFile('batchdownloadfile', "file_list", productImges)
    let file_list = resList.file_list
    let fileidMap = {}
    file_list.forEach(items =>{
      if(!fileidMap[items.fileid]){
        fileidMap[items.fileid] = items.download_url
      }
    })
    resultList.forEach(element => {
      if(fileidMap[element.productImge]){
        element.downLoadImgUrl = fileidMap[element.productImge]
      }
    });
    count = productList.pager.Total
  }

  ctx.body = {
    resultList,
    count,
    code: 200
  }
})

module.exports = router