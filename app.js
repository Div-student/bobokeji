const Koa = require('koa')
const app = new Koa()
const koaBody = require('koa-body')
const views = require('koa-views')

/**静态资源目录设置 */
const path = require('path')
const staticFiles = require('koa-static')
app.use(staticFiles(path.join(__dirname + '/public')))
console.log("path.join(__dirname + 'public')===>", path.join(__dirname + '/public'))


app.use(views('./views', {map: {"html":"ejs"}}))

const Router = require('koa-router')
var bodyParser = require('koa-bodyparser');
const xml = require('./utils/xml')
const { jsonToXml } = require('./controller/taobaoke/test')
const { getResponse } = require('./controller/weixinapi/responceClint')
const { createTaolijing } = require('./controller/taobaoke/createTaolijing')
const { sendMsgToClient } = require('./controller/weixinapi/sendMsgToClient')
const { creatUserInfor } = require('./controller/pddPromotion/creatUserInfo')
const { getGoodsDetail } = require('./controller/duoduoke/pddPromotionApi')
const { coverJDurl } = require('./controller/jdPromotion/changeJDUrl')


const router = new Router()

app.use(koaBody({
  multipart: true, // 开启文件上传
  formidable: {
    maxFileSize: 200*1024*1024,    // 设置上传文件大小最大限制，默认2M
    keepExtensions: true // 保留文件拓展名
  }
}))
app.use(router.routes())
app.use(router.allowedMethods())
app.use(bodyParser())


app.use(async ctx => {
  let startTime = new Date().getTime()
  let {signature, echostr, timestamp, nonce } = ctx.query
  if(ctx.method === "GET"){
    ctx.body = echostr;
  }else if(ctx.method === "POST") {
    console.log('ctx.request.body==>', ctx.request.body)
    let xmlDataJson = await xml.xmlToJson(ctx.request.body)
    let temp = xmlDataJson.xml
    let xmlJson = {}
    for(let res in temp){
      xmlJson[res] = temp[res][0]
    }
    if(temp.MsgType[0]==='text'){ // 普通事件
      let autoJsLearn = /^(学习|资料)+[0-9]*$/
      let autoMatch = xmlJson.Content.match(autoJsLearn)
      let pddEXP = /(\bgoodsid\b|\bpxq_secret_key\b)/
      let jdEXP = /(\bjd\.com\b)/
      let isPDDlind = pddEXP.test(xmlJson.Content)
      let isJDlink = jdEXP.test(xmlJson.Content)

      let sendMsg = '亲，该商家无活动'
      let returnMoney = ''
      let amount = ''
      if(xmlJson.Content === '申请内测'){
        xmlJson.type = 'text'
        xmlJson.sendMsg = `拼夕夕内测申请成功，下单后即可查看返现订单！`
        let createRes = await creatUserInfor(xmlJson.FromUserName)

        if(createRes === 'hasPermission'){
          xmlJson.sendMsg = `你已拥有内测名额，无需重复申请！`
        }
        let resMsg = getResponse(xmlJson)
        ctx.body = resMsg

        // 发送拼多多返现教程图文消息
        xmlJson.sendMsg = [
          {
            "title":"拼夕夕内测返现教程",
            "description":"支持小于1元返现、下单即可查看返现",
            "picurl":"https://mmbiz.qpic.cn/mmbiz_png/3FcHC1peJGeZNjSnqtYiaaWRLkRicxIbzoEY3SU8zs3eKgLAIQuhMVoaTyAXPHL6jCictx7ia3YzEKk5jVRu7Ehm5Q/0?wx_fmt=png",
            "url":"https://mp.weixin.qq.com/s/moynPRM2l3sAhfC42sDWnA"
          }
        ]
        sendMsgToClient('news', xmlJson)
        
      }else if(autoMatch !==null){
        xmlJson.type = 'text'
        xmlJson.sendMsg = `
        一、舔狗神器的资料和源码：\n
        百度网盘链接:https://pan.baidu.com/s/1gQ_QRCCvhzlEhHF01LabJw 提取码:30qy \n
       
        百度网盘:https://pan.baidu.com/s/1g35kZu_O5cLKeksp5a92NA 提取码:641n \n
       
        二、自动收能量源码: \n
        github源码： https://github.com/Div-student/antEnergy \n
       
        三、公众号实战开发课程资料：\n 
        链接: https://pan.baidu.com/s/1CkB7DjPxvpDwVAyvABBshw?pwd=tpp3 提取码: tpp3 
        `
        let resMsg = getResponse(xmlJson)
        ctx.body = resMsg
      }else if(isPDDlind){ // 拼多多商品解析
        ctx.body = 'success'
        getGoodsDetail(xmlJson.Content, xmlJson.FromUserName).then((pddRes)=>{
          if(pddRes && pddRes.promotion_rate > 0){
            amount = pddRes.has_coupon?`优惠券: ${pddRes.coupon_discount.toFixed(2)}\n`:''
            returnMoney = ((pddRes.min_group_price - pddRes.coupon_discount)*(pddRes.promotion_rate/1000)).toFixed(2)
            sendMsg = amount + `券后价格: ${(pddRes.min_group_price - pddRes.coupon_discount).toFixed(2)}\n额外返现: ${returnMoney}\n------------------\n<a href="${pddRes.urlWithGoodSign}">点击领取返现</a> -> 拼多多下单
            \n*********************
            \n<a href="https://wechatbi.bobozhaoquan.cn/userInfor?resultData=${xmlJson.FromUserName}">点击查看我的订单</a>
            `
          }
          xmlJson.type = 'text'
          xmlJson.sendMsg = sendMsg
          sendMsgToClient('text', xmlJson)
        })
      }else if(isJDlink){
        ctx.body = 'success'
        await creatUserInfor(xmlJson.FromUserName)
        // 提取字符串中的网址
        const reg = /(https?|http):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
        const strValue = xmlJson.Content.match(reg);
        coverJDurl(strValue[0], xmlJson.FromUserName).then(jDInfor => {
          amount = jDInfor.amount?`优惠券: ${jDInfor.amount}\n`:''
          if(jDInfor.commission > 0){
            returnMoney = (jDInfor.commission*0.9).toFixed(2)
            sendMsg = `商品名称: ${jDInfor.title.substr(0,10)}...\n${amount}券后价格: ${jDInfor.price}\n额外返现: ${returnMoney}\n------------------\n<a href="${jDInfor.shortUrl || jDInfor.longUrl}">点击领券下单</a>
            \n*********************
            \n<a href="https://wechatbi.bobozhaoquan.cn/JDList?resultData=${xmlJson.FromUserName}">点击查看我的订单</a>`
          }
          xmlJson.type = 'text'
          xmlJson.sendMsg = sendMsg
          sendMsgToClient('text', xmlJson)
        })
      }else{
        ctx.body = 'success'
        let taobaokeInfor = jsonToXml(xmlJson.Content).then(taobaokeInfor => {
          amount = taobaokeInfor.amount?`优惠券: ${taobaokeInfor.amount}\n`:''
          if(taobaokeInfor.commissionRate > 0){
            returnMoney = ((taobaokeInfor.price)*(taobaokeInfor.commissionRate)*0.9).toFixed(2)
            sendMsg = amount + `券后价格: ${taobaokeInfor.price}\n额外返现: ${returnMoney}\n------------------\n${ taobaokeInfor.tpwd + taobaokeInfor.title }Tao@ba0下单`
          }
          xmlJson.type = 'text'
          xmlJson.sendMsg = sendMsg
          sendMsgToClient('text', xmlJson)
        })
      }
    }else if(temp.MsgType[0] === 'event'){
      if(temp.Event[0] === "CLICK"){
        xmlJson.type = 'news'
        xmlJson.sendMsg = [{
          title:"干饭人聚集地，每日🧧必领",
          description: "每日饿了么、美团随机🧧，饭前必领, 每日一次, 当天有效",
          picurl: 'https://mmbiz.qpic.cn/mmbiz_png/3FcHC1peJGeZNjSnqtYiaaWRLkRicxIbzoEY3SU8zs3eKgLAIQuhMVoaTyAXPHL6jCictx7ia3YzEKk5jVRu7Ehm5Q/0?wx_fmt=png',
          url: 'https://mp.weixin.qq.com/s/5D-3kcmxuRB3fzV_xJrEMw'
        }]
        let resMsg = getResponse(xmlJson)
        ctx.body = resMsg
      }else if(temp.Event[0] === "subscribe"){
        xmlJson.type = 'text'
        xmlJson.sendMsg = `❤️谢谢你长得这么好看还关注我❤️\n
        <a href="https://mp.weixin.qq.com/s/SF_gYOA9_AbcQPv8535pgA">淘宝返现操作指南</a>\n
        <a href="https://mp.weixin.qq.com/s/hRhiX80HfpYqYe1xWgFTsQ">拼夕夕返现操作指南</a>\n
        <a href="https://mp.weixin.qq.com/s/NV840qYhzhBN7JTxW5ynPA">京东返现操作指南</a>`
        let resMsg = getResponse(xmlJson)
        ctx.body = resMsg
      }
    }
  }
})

// 微信公众号后端页面渲染--解析返现
router.get('/index', async ctx => {
  await ctx.render('index',{
    'kouling': '2￥nR0lXL0fBl3￥/',
    'ticketCount': '4'
  })
})

// 微信公众号后端页面渲染--个人中心
router.get('/userInfor', async ctx => {
  await ctx.render('userInfor',{
    'kouling': '2￥nR0lXL0fBl3￥/',
    'ticketCount': '4'
  })
})

// 微信公众号后端页面渲染--登录注册
router.get('/login', async ctx => {
  await ctx.render('login',{
    'kouling': '2￥nR0lXL0fBl3￥/',
    'ticketCount': '4'
  })
})

// 微信公众号后端页面渲染--京东订单列表
router.get('/JDList', async ctx => {
  await ctx.render('JDList',{})
})



// 添加淘礼金接口
router.post('/creatTaoLiJing', async ctx => {
  let searchContent = ctx.request.body.content
  let taolijingInfo = {
    taokouling: '2￥nR0lXL0fBl3￥/',
    price: "100"
  }
  if(searchContent){
    taolijingInfo = await createTaolijing(searchContent)
    console.log('taolijingInfo===>', taolijingInfo)
  }
  ctx.body = taolijingInfo
})

/**
 * 拼多多推广相关接口
 */
// 根据用户的wechat_uid获取订单列表 api: /pddOrderList/get
const getPddOrderList = require('./controller/pddPromotion/getOrderList')
router.use('/pddOrderList', getPddOrderList.routes())

// 查询用户信息 api: /userInfor/get
const getUserInfor = require('./controller/pddPromotion/getUserInfo')
router.use('/userInfor', getUserInfor.routes())

// 用户登录 api: /userInfor/login
const verifyLogin = require('./controller/pddPromotion/verifyLogin')
router.use('/userInfor', verifyLogin.routes())

// 绑定邀请码 api: /bindInvitationCode/bindCode
const bindInvitationCode = require('./controller/pddPromotion/bindInvitationCode')
router.use('/bindInvitationCode', bindInvitationCode.routes())

// 手动同步拼多多订单 api: /manuaulGetOrderList/get
const manuaulGetOrderList = require('./controller/pddPromotion/manuaulGetOrderList')
router.use('/manuaulGetOrderList', manuaulGetOrderList.routes())


/**
 * 京东相关接口
 */
// 根据用户的wechat_uid获取JD订单列表 api: /jdOrderList/get
const getJdOrderList = require('./controller/jdPromotion/getOrderList')
router.use('/jdOrderList', getJdOrderList.routes())

/*---------------淘宝联盟相关api--------------*/
// 更新全局配置 api: /taobaoke/changeToSelfUrl
const changeToSelfUrl = require('./controller/taobaoke/changeToSelfUrl')
router.use('/taobaoke', changeToSelfUrl.routes())

app.listen(8888)
console.log('The server is on localhost:8888')