const rq = require('request-promise')
const APPID = "wxeaf5105d22aa147c"
const APPSCRET = "5e34129695410a0f9909af3df484853b"
const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSCRET}`
const fs = require('fs')
const fileName = __dirname + '/' + 'accessToken_gzh.json'

const updateToken = async ()=>{
  let token = await rq(url)
  console.log('token===>', token)
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
    console.log('是否过期===>', new Date().getTime() - lastUpdateTime.getTime() > 7200 * 1000)
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

// updateToken()
// 每55分钟更新一次token
// setInterval(()=>{
//   updateToken()
// }, (7200-300)*1000)

module.exports = getAccess_token