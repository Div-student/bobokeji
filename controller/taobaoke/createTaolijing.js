const dtkSdk = require('dtk-nodejs-api-sdk');

/*
 *  @checkSign: 1 默认老版本验签  2 新版验签
 *  @appKey: 用户填写 appkey
 *  @appSecret: 用户填写 appSecret
 */ 
const alimamaAppKey = '31324479'
const alimamaAppSecret = 'b4cfa8cd9c1a159110bcbf0a6f1c97c0'
const sdk = new dtkSdk({appKey:'5ee62b32658a6',appSecret:'f1506316f0e0358b941c3606423db75f',checkSign:2});
const tkl = '8.0 hihi:/哈cuQlXNipCQO啊  王饱饱燕麦片早餐即食冲饮麦片水果坚果泡酸奶果粒混合干吃谷物'

// 封装 promise
let queryApi = (uri) => {
  return new Promise((resolve, reject) => {
    sdk.request(uri,{
      method:"GET",
      form:{pageId:"1", pageSize:20, version:"v1.0.0"}
    }).then(res => {resolve(res)}, error => {
      reject(error)
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
  let url = `https://openapi.dataoke.com/api/dels/kit/contentParse?content=${encodeURIComponent(content)}&version=v1.0.0`
  try{
    let res = await queryApi(url)
    
    if(res.data){
      let couponPrice = res.data.couponPrice
      let actualPrice = res.data.actualPrice
      let commissionRate = res.data.commissionRate
      let returnMoney = Number(((actualPrice * commissionRate/100)*0.9).toFixed(2))
      console.log('优惠券', couponPrice)
      console.log('券后价', actualPrice)
      console.log('返现比率', commissionRate)
      console.log('最终返现', returnMoney)
      if(returnMoney<=1){
        console.log('(actualPrice*commissionRate/100)*0.9===>', (actualPrice*commissionRate/100)*0.9)
        return {}
      }
      let params = {
        version: ' v1.0.0',
        alimamaAppKey: alimamaAppKey,
        alimamaAppSecret: alimamaAppSecret,
        itemId: res.data.itemId, // 宝贝商品id
        name:'波波科技', // 淘礼金名称，最大10个字符
        perFace: returnMoney, // 单个淘礼金面额，支持两位小数，单位元
        totalNum: 1, // 淘礼金总个数
        winNumLimit: 1, // 单用户累计中奖次数上限，最小值为1
        sendStartTime: formateTime(new Date().getTime()+(10*1000), 'yy-MM-dd hh:mm:ss'), // 发放开始时间，格式为yyyy-MM-dd HH:mm:ss示例：发放开始时间 2018-09-01 00:00:00
        sendEndTime: formateTime(new Date().getTime()+(24*60*60*1000), 'yy-MM-dd hh:mm:ss') // 发放截止时间，格式为yyyy-MM-dd HH:mm:ss发放截止时间，示例： 2018-09-01 00:00:00
      }
      let urlc = `https://openapi.dataoke.com/api/dels/taobao/kit/create-tlj`
      try{
        let result = await queryDataoke(urlc, params)
        let taolijingres = {
          couponPrice: couponPrice,
          returnMoney: returnMoney,
          longTpwd: result.data.longTpwd,
          tpwd: result.data.tpwd,
          sendUrl: result.data.sendUrl
        }
        return taolijingres
      }catch(e){
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






