const { requestPddApi } = require('./pingduoduoApi')
let url = require('url');
let querystring = require("querystring");
let moment = require('moment')

/**
 * 拼多多商品转链接
 */
const changeUrl = async(source_url, userId) => {
  let params = {
    custom_parameters: JSON.stringify({ uid:"bobokeji",userId }),
    pid: "22681512_214789967",
    source_url: source_url
  }
  let res = await requestPddApi('pdd.ddk.goods.zs.unit.url.gen', params)
  return res
}
exports.changeUrl = changeUrl


/**
 * 获取商品详情
 */
const getGoodsDetail = async (urlPrama, userId) => {
  let changeRes = await changeUrl(urlPrama, userId)
  let urlWithGoodSign = changeRes?.goods_zs_unit_generate_response?.url
  let pddUrl = changeRes?.goods_zs_unit_generate_response?.url

  let goodSignObj = getParamsFromUrl(urlWithGoodSign)
  let params = {
    custom_parameters: JSON.stringify({ uid:"bobokeji",userId }),
    pid: "22681512_214789967",
    goods_sign: goodSignObj.goods_sign
  }
  let res = await requestPddApi('pdd.ddk.goods.detail', params)
  let formatData = res?.goods_detail_response?.goods_details[0]
  if(formatData){
    formatData = {
      coupon_remain_quantity: formatData.coupon_remain_quantity, // 优惠券剩余数量
      promotion_rate: formatData.promotion_rate, // 佣金比例，千分比
      goods_name: formatData.goods_name, // 商品名称
      predict_promotion_rate: formatData.predict_promotion_rate, // 比价行为预判定佣金，当值为0时即为比价订单
      goods_image_url: formatData.goods_image_url, // 多多进宝商品主图
      coupon_discount: formatData.coupon_discount/100, // 优惠券面额，单位为分
      min_group_price: formatData.min_group_price/100, // 最低价sku的拼团价，单位为分
      min_normal_price: formatData.min_normal_price/100, // 最低价sku的单买价，单位为分
      extra_coupon_amount: formatData.extra_coupon_amount/100, // 额外优惠券
      coupon_min_order_amount: formatData.coupon_min_order_amount/100, //优惠券门槛金额，单位为分
      coupon_total_quantity: formatData.coupon_total_quantity, // 优惠券总数量
      has_coupon: formatData.has_coupon, // 商品是否有优惠券 true-有，false-没有
      urlWithGoodSign: pddUrl  // 优惠券领取下单跳转链接
    }
  }
  return formatData
}

// 提取链接中的参数信息
const getParamsFromUrl = (urlPrama) => {
  let paramsString = url.parse(urlPrama).query
  let paramsObj = querystring.parse(paramsString)
  return paramsObj
}

// 生成商品的推广链接
const generatePromotionUrl = async(goodsSign, userId) => {
  let params = {
    custom_parameters: JSON.stringify({ uid:"bobokeji", userId }),
    generate_authority_url: false,
    generate_short_url: true,
    goods_sign_list: JSON.stringify([goodsSign]),
    p_id: '22681512_214789967'
  }
  let res = await requestPddApi('pdd.ddk.goods.promotion.url.generate', params)
  return res?.goods_promotion_url_generate_response?.goods_promotion_url_list
}
exports.getGoodsDetail = getGoodsDetail

// getGoodsDetail('https://mobile.yangkeduo.com/goods.html?goods_id=125928349395&page_from=24&pxq_secret_key=3LLZUBEI2GJE6IY52X4YPQXTVOBP2NPORWDBDOV52UU42MSH62AQ&share_uin=I4WFO5QBPLBDIOEFCQ6TDZRRXY_GEXDA&refer_share_id=96cf977709cc4e9eb1bb82e803d7962b&refer_share_uin=I4WFO5QBPLBDIOEFCQ6TDZRRXY_GEXDA&refer_share_channel=copy_link&refer_share_form=text','shenxiaobotest')

/**
 * 用最后更新时间查询推广订单接口
 */
const incrementList = async(start_update_time, end_update_time) => {
  let params = {
    start_update_time: start_update_time,
    end_update_time: end_update_time,
    page_size: 50,
    query_order_type: 1,
    page: 1
  }
  try{
    let res = await requestPddApi('pdd.ddk.order.list.increment.get', params)
    let { order_list } = res?.order_list_get_response
    return { order_list }
  }catch(error){
    return error
  }
  
}
exports.incrementList = incrementList


