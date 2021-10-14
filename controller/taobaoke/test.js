const dtkSdk = require('dtk-nodejs-api-sdk');

/*
 *  @checkSign: 1 默认老版本验签  2 新版验签
 *  @appKey: 用户填写 appkey
 *  @appSecret: 用户填写 appSecret
 */ 

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

let showTokenInfor = {
  title: "", // 商品标题
  startFee: "", // 商品原始价格
  price: "", // 商品折后价格
  amount: "", // 优惠券金额

  commissionRate: 0, // 商品佣金比例
  tpwd: "", // 转换后的淘口令
  longTpwd: "", // 转换后的长口令
  couponStartTime: "", // 优惠券生效开始日期
  couponEndTime: "" // 优惠券结束日期
}

// 获取转换后的淘口令 佣金比例 
let getTwd = async (content) => {
  let url = `https://openapi.dataoke.com/api/tb-service/twd-to-twd?content=${encodeURIComponent(content)}&version=v1.0.0`
  try{
    let res = await queryApi(url)
    if(res.data){
      let prd = res.data
      showTokenInfor.tpwd = prd.tpwd
      showTokenInfor.longTpwd = prd.longTpwd
      showTokenInfor.couponStartTime = prd.couponStartTime
      showTokenInfor.couponEndTime = prd.couponEndTime
      showTokenInfor.commissionRate = Number(prd.maxCommissionRate)/100
    }else{
      showTokenInfor.commissionRate = 0
    }
  }catch(error){
    console.log(error)
  }
}

// 获取商品价格 优惠圈价格 商品名称 
let productDetail = (content) => {
  return new Promise( async(resolve, rejected)=>{
    let proUrl = `https://openapi.dataoke.com/api/tb-service/parse-content?content=${encodeURIComponent(content)}&version=v1.0.0`
    try{
      let res = await queryApi(proUrl)
      if(res.data && res.data.originInfo){
        let proInfor = res.data.originInfo
        showTokenInfor.title = proInfor.title
        showTokenInfor.startFee = proInfor.startFee
        showTokenInfor.price = proInfor.price
        showTokenInfor.amount = proInfor.amount
      }
      resolve()
    }catch(error){
      rejected()
      console.log(error)
    }
  })
}

Promise.all([productDetail(tkl), getTwd(tkl)]).then(res=>{
  console.log('showTokenInfor====>', showTokenInfor)
})


exports.jsonToXml = tkls => {
  return new Promise((resolve, rejected)=>{
    Promise.all([productDetail(tkls), getTwd(tkls)]).then(res=>{
      resolve(showTokenInfor)
    })
  })
}






