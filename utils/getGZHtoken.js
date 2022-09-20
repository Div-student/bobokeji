const rq = require('request-promise')
// 生产环境使用
// const APPID = "wxeaf5105d22aa147c"
// const APPSCRET = "5e34129695410a0f9909af3df484853b"

// 测试公众号
const APPID = "wxeaf6f9a5e5b669b8"
const APPSCRET = "6386bad5201d9797b0fa53a96ecead06"
const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSCRET}`
const fs = require('fs')
const fileName = __dirname + '/' + 'accessToken_gzh.json'

const updateToken = async ()=>{
  let token = await rq(url)
  let tokenRes = JSON.parse(token)
  if(tokenRes.access_token){
    tokenRes.lastUpdateTime = new Date()
    fs.writeFileSync(fileName, JSON.stringify(tokenRes))
  }else{
    updateToken()
  }
}

let updatedToken = ''
const getAccess_token = async ()=> {
  let tokenRes = '', tokenResult = ''
  try {
    tokenRes = await fs.readFileSync(fileName, 'utf8')
    tokenResult = JSON.parse(tokenRes)
    let lastUpdateTime = new Date(tokenResult["lastUpdateTime"])
    console.log('是否过期===>', new Date().getTime() - lastUpdateTime.getTime() > 7200 * 1000)
    if(new Date().getTime() - lastUpdateTime.getTime() > 7200 * 1000){
      await updateToken()
      await getAccess_token()
    }else{
      updatedToken = tokenResult["access_token"]
    }
    return updatedToken
  } catch (error) {
    await updateToken()
    await getAccess_token()
  }
}

module.exports = getAccess_token