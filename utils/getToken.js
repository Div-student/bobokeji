const rq = require('request-promise')
const APPID = "wx5740cfc1ee869efc"
const APPSCRET = "0fac4d47878b00ec933f9f95661e5ffb"
const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSCRET}`
const fs = require('fs')
const fileName = __dirname + '/' + 'access_token.json'

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

const getAccess_token = async ()=> {
  let tokenRes = '', tokenResult = ''
  try {
    tokenRes = await fs.readFileSync(fileName, 'utf8')
    tokenResult = JSON.parse(tokenRes)
    let lastUpdateTime = new Date(tokenResult["lastUpdateTime"])
    if(new Date().getTime() - lastUpdateTime.getTime() > 7200 * 1000){
      await updateToken()
      await getAccess_token()
    }
    return tokenResult["access_token"]
  } catch (error) {
    await updateToken()
    await getAccess_token()
  }
}

// 每55分钟更新一次token
setInterval(()=>{
  updateToken()
}, (7200-300)*1000)

module.exports = getAccess_token