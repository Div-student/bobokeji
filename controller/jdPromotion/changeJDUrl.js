const dtkSdk = require('dtk-nodejs-api-sdk');

/*
 *  @checkSign: 1 默认老版本验签  2 新版验签
 *  @appKey: 用户填写 appkey
 *  @appSecret: 用户填写 appSecret
 */ 
const UNIONID = '1000438404' // 京东联盟ID https://union.jd.com/user
const sdk = new dtkSdk({appKey:'5ee62b32658a6',appSecret:'f1506316f0e0358b941c3606423db75f',checkSign:2});
const tkl = '88啊7C4r2byfJvp嘻 https://m.tb.cn/h.f9wuQzx?sm=323733  结义车载吸尘器车用无线充电家用两用汽车内小型大功率强力手持机'

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
  goodsId: "", // 商品ID

  commissionRate: 0, // 商品佣金比例
  commission: 0, // 商品券后佣金
  shortUrl: "", // 转换后商品短链接
  longUrl: "" // 转换后的商品长链接
}

// 解析JD商品ID 1000438404
let getSkuid = async (content) => {
  let url = `https://openapi.dataoke.com/api/dels/jd/kit/parseUrl?url=${content}&version=v1.0.0`
  try{
    let statTime = new Date().getTime()
    let res = await queryApi(url)
    console.log('京东商品转链接口耗时===>', new Date().getTime() - statTime)
    if(res.data){
      let {skuId, itemUrl, hasCoupon} = res.data;
      showTokenInfor.goodsId = skuId;
    }else{
      showTokenInfor.commissionRate = 0
    }
  }catch(error){
    console.log(error)
  }
}

// 获取京东商品详情信息
let productDetail = async (content) => {
  await getSkuid(content)
  let proUrl = `https://openapi.dataoke.com/api/dels/jd/goods/search?skuIds=${showTokenInfor.goodsId}&version=v1.0.0`
  try{
    let statTime = new Date().getTime()
    let res = await queryApi(proUrl)
    console.log('获取京东商品详情信息接口耗时1===>', new Date().getTime() - statTime)
    if(res.data && res.data.list){
      let proInfor = res.data.list[0]
      showTokenInfor.commission = proInfor?.couponCommission
      showTokenInfor.commissionRate = proInfor?.commissionShare
      showTokenInfor.title = proInfor?.skuName
      showTokenInfor.startFee = proInfor?.price
      showTokenInfor.price = proInfor?.lowestCouponPrice
      showTokenInfor.amount = showTokenInfor.startFee - showTokenInfor.price
    }
  }catch(error){
    console.log(error)
  }
}

// 京东商品转链
let changeToSelfUrl = async (content) => {
  let url = `https://openapi.dataoke.com/api/dels/jd/kit/promotion-union-convert?unionId=${UNIONID}&materialId=${content}&version=v1.0.0`
  try{
    let statTime = new Date().getTime()
    let res = await queryApi(url)
    console.log('解析JD商品ID接口耗时===>', new Date().getTime() - statTime)
    if(res.data){
      let { shortUrl, longUrl } = res.data;
      showTokenInfor.longUrl = longUrl;
      showTokenInfor.shortUrl = shortUrl;
    }else{
      showTokenInfor.commissionRate = 0
    }
  }catch(error){
    console.log(error)
  }
}

exports.coverJDurl = tkls => {
  return new Promise((resolve, rejected)=>{
    Promise.all([productDetail(tkls), changeToSelfUrl(tkls)]).then(res=>{
      resolve(showTokenInfor)
    })
  })
}


