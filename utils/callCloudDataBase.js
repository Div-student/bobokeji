const rq = require('request-promise')
const access_token = require('./getToken.js')
const ENV = 'bobokeji-dev'


/*
* 1. databasequery 查询数据库
* 2. databaseupdate 更新数据库
* 3. databasedelete 删除数据库
* 4. databaseadd    新增数据库
**/
const callCloudDataBase = async (operator, query) => {
  const ACCESS_TOKEN = await access_token()
  let params = {
    method: 'POST',
    uri: `https://api.weixin.qq.com/tcb/${operator}?access_token=${ACCESS_TOKEN}`,
    body: {
      env: ENV,
      query: query
    },
    json: true
  }
  let res = await rq(params)
  return res
}

module.exports = callCloudDataBase