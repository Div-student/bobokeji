const rq = require('request-promise')
const access_token = require('./getToken.js')
const ENV = 'bobokeji-dev'


/*
* 1. 文件上传 operator: uploadfile          dataFlag: path
* 2. 文件下载 operator: batchdownloadfile   dataFlag: file_list
* 3. 文件删除 operator: batchdeletefile    dataFlag: fileid_list
**/

const callCloudFile = async (operator, dataFlag, file_list) => {
  const ACCESS_TOKEN = await access_token()
  let params = {
    method: 'POST',
    uri: `https://api.weixin.qq.com/tcb/${operator}?access_token=${ACCESS_TOKEN}`,
    body: {
      env: ENV,
      [dataFlag]: file_list
    },
    json: true
  }
  let res = await rq(params)
  return res
}

module.exports = callCloudFile