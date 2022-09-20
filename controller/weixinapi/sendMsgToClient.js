const rq = require('request-promise')
const access_token = require('../../utils/getGZHtoken')

const sendMsgToClient = async(type, xmlJson) => {
  const ACCESS_TOKEN = await access_token()
  console.log('ACCESS_TOKEN===>', ACCESS_TOKEN)
  let objMap = {
    'news': 'articles',
    'text': 'content'
  }
  let temp = {
    "touser": xmlJson.FromUserName,
    "msgtype": type,
    [type]: {[objMap[type]]:xmlJson.sendMsg}
  }
  console.log('temp===>', temp)
  let params = {
    method: 'POST',
    uri: `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${ACCESS_TOKEN}`,
    body: temp,
    json: true
  }
  let result = await rq(params)
  return result
}

exports.sendMsgToClient = sendMsgToClient