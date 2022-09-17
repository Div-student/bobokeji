const rq = require('request-promise')
const access_token = require('../../utils/getGZHtoken')

const getUserInfor = async(OPENID) => {
  const ACCESS_TOKEN = await access_token()
  let params = {
    method: 'GET',
    uri: `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${ACCESS_TOKEN}&openid=${OPENID}&lang=zh_CN`,
    json: true
  }
  let result = await rq(params)
  return result
}

exports.getUserInfor = getUserInfor
// getUserInfor('oF-RA6fbdaY0mXnMW5lzgWVlpOXM')