const rq = require('request-promise')
const access_token = require('./getGZHtoken.js')

const fs = require('fs')
const fileName = __dirname + '/' + 'ticket_gzh.json'

const updateTicket = async ()=>{
  const ACCESS_TOKEN = await access_token()
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${ACCESS_TOKEN}&type=wx_card`
  let ticket = ''
  try{
    ticket = await rq(url)
  }catch(err){
    console.log('err=>', err)
  }
  let tokenRes = JSON.parse(ticket)
  console.log('ticket====>', ticket)
  if(tokenRes.ticket){
    tokenRes.lastUpdateTime = new Date()
    fs.writeFileSync(fileName, JSON.stringify(tokenRes))
  }else{
    updateTicket()
  }
}

const getTicket_token = async ()=> {
  let tokenRes = '', tokenResult = ''
  try {
    tokenRes = await fs.readFileSync(fileName, 'utf8')
    tokenResult = JSON.parse(tokenRes)
    let lastUpdateTime = new Date(tokenResult["lastUpdateTime"])
    console.log('ticket是否过期==>', new Date().getTime() - lastUpdateTime.getTime() > 7200 * 1000)
    if(new Date().getTime() - lastUpdateTime.getTime() > 7200 * 1000){
      await updateTicket()
      await getTicket_token()
    }
    console.log('获取到的ticket===>', tokenResult["ticket"])
    return tokenResult["ticket"]
  } catch (error) {
    await updateTicket()
    await getTicket_token()
  }
}

// updateTicket()

// 每55分钟更新一次token
// setInterval(()=>{
//   updateTicket()
// }, (7200-300)*1000)

module.exports = getTicket_token