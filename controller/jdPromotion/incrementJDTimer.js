const dtkSdk = require('dtk-nodejs-api-sdk');
let moment = require('moment')
const schedule = require("node-schedule")
const { insertTable, operateTable } = require('../../dataBase/index')

/*
 *  @checkSign: 1 默认老版本验签  2 新版验签
 *  @appKey: 用户填写 appkey
 *  @appSecret: 用户填写 appSecret
 */ 
const sdk = new dtkSdk({appKey:'5ee62b32658a6',appSecret:'f1506316f0e0358b941c3606423db75f',checkSign:2});
const JDKEY = 'e4209eac5db9f8e26932a3492116dfbbc42b4f807e7b14c618e9106a2e284862f4ec12341a7c65c4' // https://union.jd.com/myTools/myApi

// 封装 promise
let queryApi = (uri,start_time, end_time) => {
  return new Promise((resolve, reject) => {
    sdk.request(uri,{
      method:"GET",
      form:{type:3, key:JDKEY, startTime:start_time, endTime:end_time, version:"v1.0.0"}
    }).then(res => {resolve(res)}, error => {
      reject(error)
    })
  })
}


// 根据最后更新时间获取京东订单
let getJDlist = async (start_time, end_time) => {
  let url = `https://openapi.dataoke.com/api/dels/jd/order/get-official-order-list`
  let jdListData = []
  let orederSn = []
  let orderSnMap = {}
  try{
    let statTime = new Date().getTime()
    let res = await queryApi(url, start_time, end_time)
    // console.log('京东商品转链接口耗时===>', new Date().getTime() - statTime)
    
    if(res.data && res.data.length>0){
      jdListData = res.data.map(result => {
        orederSn.push(result.orderId)
        orderSnMap[result.orderId] = {
          price: result.price, 
          skuName: result.skuName, 
          skuNum: result.skuNum, 
          finalRate: result.finalRate, 
          commissionRate: result.commissionRate, 
          estimateFee: result.estimateFee,
          actualFee: result.actualFee,
          actualCosPrice: result.actualCosPrice,
          estimateCosPrice: result.estimateCosPrice,
          orderId: result.orderId,
          validCode: result.validCode,
          orderTime: result.orderTime,
          finishTime: result.finishTime,
          subUnionId: result.subUnionId,
          positionId: result.positionId,
        }
        return {
          price: result.price, // 商品单价
          skuName: result.skuName, // 商品名称
          skuNum: result.skuNum, // 商品数量
          finalRate: result.finalRate, // 最终分佣比例
          commissionRate: result.commissionRate, // 佣金比例(投放的广告主计划比例)
          estimateFee: result.estimateFee, // 推客的预估佣金（预估计佣金额佣金比例最终比例），如订单完成前发生退款，此金额也会更新。
          actualFee: result.actualFee, // 推客分得的实际佣金（实际计佣金额佣金比例最终比例）。如订单完成后发生退款，此金额会更新。
          actualCosPrice: result.actualCosPrice, // 实际计算佣金的金额。订单完成后，会将误扣除的运费券金额更正。如订单完成后发生退款，此金额会更新。
          estimateCosPrice: result.estimateCosPrice, // 预估计佣金额：由订单的实付金额拆分至每个商品的预估计佣金额，不包括运费，以及京券、东券、E卡、余额等虚拟资产支付的金额。该字段仅为预估值，实际佣金以actualCosPrice为准进行计算
          orderId: result.orderId, // 订单号
          validCode: result.validCode, // sku维度的有效码（-1：未知,2.无效-拆单,3.无效-取消,4.无效-京东帮帮主订单,5.无效-账号异常,6.无效-赠品类目不返佣,7.无效-校园订单,8.无效-企业订单,9.无效-团购订单,11.无效-乡村推广员下单,13.无效-违规订单,14.无效-来源与备案网址不符,15.待付款,16.已付款,17.已完成（购买用户确认收货）,20.无效-此复购订单对应的首购订单无效,21.无效-云店订单
          orderTime: result.orderTime, // 下单时间,格式yyyy-MM-dd HH:mm:ss
          finishTime: result.finishTime, // 完成时间（购买用户确认收货时间）,格式yyyy-MM-dd HH:mm:ss
          subUnionId: result.subUnionId, // 子渠道标识，在转链时可自定义传入，格式要求：字母、数字或下划线，最多支持80个字符(我们这里传入的是微信公众号的openID)
          positionId: result.positionId, // 新增推广位id （若无subUnionId权限，可入参该参数用来确定不同用户下单情况）
        }
      });
    }
  }catch(error){
    console.log(error)
  }
  return {jdListData, orederSn, orderSnMap}
}

// 更新表中订单数据
let updateJDlist = async ()=>{

  let currentTime = new Date().getTime()
  // 查询上一次同步时间
  let lastModifyRes = await operateTable(`select * from sync_flag where sync_type = 'JD'`)
  
  let start_time = moment(lastModifyRes[0]?.lastsync_time).format('yyyy-MM-DD HH:mm:ss')
  let end_time = moment(currentTime).format('yyyy-MM-DD HH:mm:ss')
  // let start_time = '2022-12-28 23:38:00'
  // let end_time = '2022-12-28 23:39:00'
  // 查询订单号是否已入库，如果已入库则更新对应的订单
  console.log('start_time', start_time, end_time)
  let {jdListData, orederSn, orderSnMap} = await getJDlist(start_time, end_time)
  console.log('京东商品转链接口耗时===>jdListData', jdListData)
  if(orederSn.length>0){
    let sqlInParma = orederSn.join(',')
    let sqlPrams = `select finishTime, validCode, estimateFee, orderId, actualFee, actualCosPrice from jd_goods_list where orderId in (${sqlInParma})`
    let resultData = await operateTable(sqlPrams)

    let updatSnList = [] // 需要更新的订单编号
    // 更新表中的订单数据
    for(let element of resultData){
      if(orderSnMap[element.orderId]){
        updatSnList.push(element.orderId)
        let updateSql = `update jd_goods_list set finishTime='${orderSnMap[element.orderId].finishTime || " "}',
        validCode='${orderSnMap[element.orderId].validCode}',
        estimateFee='${orderSnMap[element.orderId].estimateFee || 0}',
        actualFee='${orderSnMap[element.orderId].actualFee || 0}',
        estimateCosPrice='${orderSnMap[element.orderId].estimateCosPrice || 0}',
        actualCosPrice='${orderSnMap[element.orderId].actualCosPrice || 0}' where orderId='${element.orderId}'`
        await operateTable(updateSql)
      }
    }

    // 过滤掉已经更新的订单,其他订单新增到表中
    let jdList = jdListData.filter( items => !updatSnList.includes(items.orderId.toString()))
    if(jdList.length > 0){
      await insertTable('jd_goods_list',[
        "price",'skuName','skuNum','finalRate','commissionRate','estimateFee','actualFee',
        'actualCosPrice','orderId','validCode','orderTime','finishTime','subUnionId', 'positionId','estimateCosPrice'
      ], jdList)
    }
  }
}

exports.updateJDlist = updateJDlist
// updateJDlist()


