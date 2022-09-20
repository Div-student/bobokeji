
const Router = require('koa-router')
const router = new Router()

const callCloudDataBase = require('../../utils/callCloudDataBase.js')
const callCloudFile = require('../../utils/callCloudFile.js')


router.get("/query", async (ctx) => {
  let params = ctx.query
  let query = ''
  if(params.className=="全部" || !params.className){
    query = `db.collection('images').skip('0').limit('100').get()`
  }else{
    query = `db.collection('images').where({
      className: '${params.className}'
    }).skip('0').limit('100').get()`
  }
  let result = await callCloudDataBase("databasequery", query)
  
  let fileIds = []
  let imageList = result.data.map(item => {
    let temItem = JSON.parse(item)
    fileIds.push({
      "fileid": temItem.fileId,
			"max_age": 7200
    })
    return temItem
  })

  let resultList = await callCloudFile('batchdownloadfile', "file_list", fileIds)
  let mapImage = {}
  if(resultList.file_list && resultList.file_list.length > 0){
    resultList.file_list.forEach(element => {
      mapImage[element.fileid] = element.download_url
    });
  }

  imageList.forEach(item => {
    if(mapImage[item.fileId]){
      item.download_url = mapImage[item.fileId]
    }
  })
  
  ctx.body = {
    imageList,
    code: 200
  }
})

module.exports = router