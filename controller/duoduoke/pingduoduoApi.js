
const rq = require('request-promise')
const { createHash } = require('crypto')
// https://open.pinduoduo.com/application/app/detail?id=159204 拼多多开发平台
const CLIENT_SECRET = '875c44ed4da0743e1076e21a807ef9785e95f633' // 绑定到多多进宝平台的应用密钥
const CLIENT_ID = '920bf4395b82438499c3c92141a4e6f6'  // 绑定到多多进宝平台的应用密钥


// 组装md5入参签名
const getMd5Sign = (paramObj) => {
  // 所有入参安装key值做字典排序
  let sortKeys = Object.keys(paramObj).sort()

  // 所有入参按照key-value的顺序无缝拼接成字符串，并且在字符串的首尾都拼接上client_secret
  let concateString = CLIENT_SECRET
  sortKeys.forEach(res => concateString += (res + paramObj[res]) )
  concateString = concateString + CLIENT_SECRET
  // 使用MD5加密
  const hashResut = createHash('md5').update(concateString).digest('hex')
  // 将md5加密字符串转换成大写
  let uppperCaseString = hashResut.toUpperCase()
  return uppperCaseString
}

const requestPddApi = async (functionName, data)=>{
  let tempParams = {
    'type': functionName,
    'client_id': CLIENT_ID,
    'timestamp': new Date().getTime(),
    ...data
  }
  let signRes = getMd5Sign(tempParams)

  let params = {
    method: 'POST',
    uri: `https://gw-api.pinduoduo.com/api/router`,
    body: {...tempParams, 'sign': signRes},
    json: true
  }
  let result = await rq(params)
  return result
}

exports.requestPddApi = requestPddApi
