const schedule = require("node-schedule")
const { incrementList } = require('./pddPromotionApi')
const { insertTable, operateTable } = require('../../dataBase/index')

const getIncrementTimer = async () => {
  let currentTime = new Date().getTime()
  // 查询上一次同步时间
  let lastModifyRes = await operateTable(`select * from sync_flag`)
  
  let start_time = lastModifyRes[0]?.lastsync_time || Math.floor((currentTime - 5*60*1000)/1000)
  let end_time = Math.floor(currentTime/1000)
  // let start_time = Math.floor(new Date('2022-11-18 23:16:00').getTime()/1000)
  // let end_time = Math.floor(new Date('2022-11-18 23:17:00').getTime()/1000)
  console.log('start_timePDD', start_time, end_time)
  let { order_list } = await incrementList(start_time, end_time)
  console.log('order_list===>', order_list)
  let orederSn = []
  let orderSnMap = {}
  let resultList = order_list.map(res => {
    orederSn.push(`'${res.order_sn}'`)
    orderSnMap[res.order_sn] = res
    return{
      "cpa_new": res.cpa_new,
      "wechat_uid": JSON.parse(res.custom_parameters).userId || '',
      "fail_reason": res.fail_reason || '',
      "goods_name": res.goods_name,
      "goods_price": res.goods_price,
      "goods_quantity": res.goods_quantity,
      "goods_sign": res.goods_sign,
      "goods_thumbnail_url": res.goods_thumbnail_url,
      "is_direct": res.is_direct,
      "order_amount": res.order_amount,
      "order_pay_time": res.order_pay_time,
      "order_receive_time": res.order_receive_time || 0,
      "order_sn": res.order_sn,
      "order_status": res.order_status,
      "order_status_desc": res.order_status_desc,
      "price_compare_status": res.price_compare_status,
      "promotion_amount": res.promotion_amount,
      "promotion_rate": res.promotion_rate,
      "type": res.type,
      "order_modify_at": res.order_modify_at
    }
  })

  // 查询订单号是否已入库，如果已入库则更新对应的订单
  if(orederSn.length > 0){
    let sqlInParma = orederSn.join(',')
    let sqlPrams = `select order_status, order_status_desc, order_receive_time, order_sn from pdd_goods_list where order_sn in (${sqlInParma})`

    let resultData = await operateTable(sqlPrams)
    let updatSnList = [] // 需要更新的订单编号
    // 更新表中的订单数据
    for(let element of resultData){
      if(orderSnMap[element.order_sn]){
        updatSnList.push(element.order_sn)
        let updateSql = `update pdd_goods_list set order_status='${orderSnMap[element.order_sn].order_status}',
        order_status_desc='${orderSnMap[element.order_sn].order_status_desc}',
        order_receive_time='${orderSnMap[element.order_sn].order_receive_time || 0}' where order_sn='${element.order_sn}'`
        await operateTable(updateSql)
      }
    }

    // 过滤掉已经更新的订单
    resultList = resultList.filter( items => !updatSnList.includes(items.order_sn))
    if(resultList.length > 0){
      await insertTable('pdd_goods_list',[
        "cpa_new",'wechat_uid','fail_reason','goods_name','goods_price',
        'goods_quantity','goods_sign','goods_thumbnail_url','is_direct','order_amount',
        'order_pay_time','order_receive_time','order_sn','order_status','order_status_desc',
        'price_compare_status', 'promotion_amount', 'promotion_rate', 'type', 'order_modify_at'
      ], resultList)
    }
    
  }

  // 记录本次更新时间
  operateTable(`update sync_flag set lastsync_time=${Math.floor(currentTime/1000)} where sync_id=16`)
}

// 每5分钟执行一次定时任务拉去最想的拼多多订单列表
// setInterval(() => {
//   getIncrementTimer()
// }, 300000);


schedule.scheduleJob('*/3 * * * *',function(){
  getIncrementTimer()
})

// getIncrementTimer()