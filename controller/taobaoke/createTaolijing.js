const dtkSdk = require('dtk-nodejs-api-sdk');
const getProductInfo = require('./test.js')

const ApiClient = require('./taobaoSdk/index').ApiClient;


/*
 *  @checkSign: 1 默认老版本验签  2 新版验签
 *  @appKey: 用户填写 appkey
 *  @appSecret: 用户填写 appSecret
 */ 
const alimamaAppKey = '31324479'
const alimamaAppSecret = 'b4cfa8cd9c1a159110bcbf0a6f1c97c0'
const sdk = new dtkSdk({appKey:'5ee62b32658a6',appSecret:'f1506316f0e0358b941c3606423db75f',checkSign:2});
const tkl = '78￥jCFE2FRJvXt￥'

// 直接调用淘宝联盟的sdk 不再使用大淘口接口（经常出问题，客服还不理人）

var client = new ApiClient({
  'appkey':alimamaAppKey,
  'appsecret':alimamaAppSecret,
  'url':'http://gw.api.taobao.com/router/rest'
});

let requestTaoBaoApi = function(uri, params){
  return new Promise((resolve, reject)=>{
    client.execute(uri, params, (error, response) => {
      if (!error) resolve(response);
      else reject(error);
    })
  })
}

let queryDataoke = (uri, params) => {
  return new Promise((resolve, reject) => {
    sdk.request(uri,{
      method:"GET",
      form: params
    }).then(res => {resolve(res)}, error => {
      reject(error)
    })
  })
}

let formateTime =  (time,fmt) =>{
    let currentTime = new Date(time)
    var o = {
      "M+": currentTime.getMonth() + 1, //月份
      "d+": currentTime.getDate(), //日
      "h+": currentTime.getHours(), //小时
      "m+": currentTime.getMinutes(), //分
      "s+": currentTime.getSeconds(), //秒
      "q+": Math.floor((currentTime.getMonth() + 3) / 3), //季度
      "S": currentTime.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (currentTime.getFullYear() + ""));
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
    }
    return fmt;
  }

// 获取商品Id 并创建淘礼金
let createTaoLingjing = async (content) => {
  try{
    let res = await getProductInfo.jsonToXml(content)
    console.log('res===>', res)
    if(res.title){
      let couponPrice = res.amount
      let actualPrice = res.price
      let commissionRate = res.commissionRate
      let returnMoney = Number(((actualPrice * commissionRate)*0.9).toFixed(2))
      console.log('优惠券', couponPrice)
      console.log('券后价', actualPrice)
      console.log('返现比率', commissionRate)
      console.log('最终返现', returnMoney)
      if(returnMoney<=1){
        console.log('(actualPrice*commissionRate)*0.9===>', (actualPrice*commissionRate)*0.9)
        return {}
      }

      let createTaolijingParam = {
        'security_level':'0',
        'use_start_time':'',
        'use_end_time_mode':'1',
        'use_end_time':'1',
        'send_end_time': formateTime(new Date().getTime()+(24*60*60*1000), 'yy-MM-dd hh:mm:ss'), // 发放截止时间，格式为yyyy-MM-dd HH:mm:ss发放截止时间，示例： 2018-09-01 00:00:00,
        'send_start_time': formateTime(new Date().getTime()+(10*1000), 'yy-MM-dd hh:mm:ss'), // 发放开始时间，格式为yyyy-MM-dd HH:mm:ss示例：发放开始时间 2018-09-01 00:00:00,
        'per_face': returnMoney, // 单个淘礼金面额，支持两位小数，单位元
        'security_switch':'true',
        'user_total_win_num_limit':'1', // 单用户累计中奖次数上限，最小值为1
        'name':'波波科技淘淘', // 淘礼金名称，最大10个字符
        'total_num':'1', 
        'item_id': res.goodsId, // 宝贝商品id
        'campaign_type':'定向：DX；营销：MKT',
        'adzone_id':'105356700419'
      }

      try{
        console.log('createTaolijingParam===>',createTaolijingParam)
        // 创建淘礼金并且获取领取淘礼金链接
        let result = await requestTaoBaoApi('taobao.tbk.dg.vegas.tlj.create',createTaolijingParam)
        console.log('result===>', result)
        let taolijinUrl = result.result.model.send_url
        console.log('taolijinUrl===>', taolijinUrl)
        // 将淘礼金链接转换成淘口令
        let taokoulin = await requestTaoBaoApi('taobao.tbk.tpwd.create',{ url: taolijinUrl })
        console.log('taokoulin===>', taokoulin)

        let taolijingres ={}
        if(result.code == "-1"){
          taolijingres = result
        }else {
          taolijingres = {
            couponPrice: couponPrice,
            returnMoney: returnMoney,
            longTpwd: taokoulin.data.model,
            tpwd: taokoulin.data.password_simple,
            sendUrl: taolijinUrl
          }
        }
        return taolijingres
      }catch(e){
        console.log("创建淘礼金失败===>",e)
        return {}
      }
    }else{
      return {}
    }
  }catch(error){
    console.log(error)
  }
}

exports.createTaolijing = tkls => {
  return new Promise((resolve, rejected)=>{
    let resDate = createTaoLingjing(tkls)
    resolve(resDate)
  })
}



