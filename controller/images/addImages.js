
const Router = require('koa-router')
const router = new Router()
const rq = require('request-promise')
const fs = require('fs')

const callCloudDataBase = require('../../utils/callCloudDataBase.js')
const callCloudFile = require('../../utils/callCloudFile.js')


router.post("/add", async (ctx) => {
  
  // 1. 获取上传地址已经上传云存储需要的其他信息
  const requestParams = ctx.request.files.file

  let picClassName = ctx.query.picClass
  let path = `lunbotu/${Date.now()}-${Math.random()}-${requestParams.name}`
  let upLoadBody = await callCloudFile('uploadfile', 'path', path)

  // 2. 把图片文件上传至云存储
  let uploadParams = {
    method: 'POST',
    header: {
      'content-type': 'multipart/form-data'
    },
    uri: upLoadBody.url,
    formData: {
      key: path,
      Signature: upLoadBody.authorization,
      'x-cos-security-token': upLoadBody.token,
      'x-cos-meta-fileid': upLoadBody.cos_file_id,
      file: fs.createReadStream(requestParams.path)
    },
    json: true
  }
  
  await rq(uploadParams)
  
  // 3. 把存入的图片写入数据库
  let query = `db.collection('images').add({
    data: {
      fileId: '${upLoadBody.file_id}',
      className: "${picClassName}"
    }
  })`
  let resList = callCloudDataBase("databaseadd", query)

  ctx.body = {
    resList,
    code: 200
  }
})

module.exports = router