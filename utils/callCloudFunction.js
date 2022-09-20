const rq = require('request-promise')
const access_token = require('./getToken.js')
const ENV = 'bobokeji-dev'

const callCoundFunction = async (functionName, data)=>{
  const ACCESS_TOKEN = await access_token()
  let params = {
    method: 'POST',
    uri: `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${ACCESS_TOKEN}&env=${ENV}&name=${functionName}`,
    body: {...data},
    json: true
  }
  let orderList = await rq(params)
  return orderList
}

module.exports = callCoundFunction