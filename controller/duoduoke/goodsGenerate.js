let { queryDataoke } = require('./pddAuthority');
let url = require('url');
let querystring = require("querystring")

// 拼多多转链
const goodsPromGenerate = async(orgUrl) => {
  let goodsSign = await getGoodsSign(orgUrl)
  let uri = 'https://openapi.dataoke.com/api/dels/pdd/kit/goods-prom-generate'
  let params = {
    pid: '22681512_214789967',
    goodsSign: goodsSign,
    customParameters:{
      uid:"22681512"
    }
  }
  let res = await queryDataoke(uri, params)
}

// 提取链接中的商品goods_id
const getParamsFromUrl = (urlPrama)=>{
  let paramsString = url.parse(urlPrama).query
  let paramsObj = querystring.parse(paramsString)
  return paramsObj
}

// 获取商品的goodsSign
const getGoodsSign = async(orgUrl) => {
  let goodsId = getParamsFromUrl(orgUrl)
  let uri = 'https://openapi.dataoke.com/api/dels/pdd/goods/detail'
  let params = { goodsId: goodsId.goods_id }
  let res = await queryDataoke(uri, params)
  let goodSign = ''
  if(res?.data?.goodsSign){
    goodSign = res.data.goodsSign
  }
  return goodSign
}
// goodsPromGenerate()
// goodsPromGenerate('https://mobile.yangkeduo.com/goods1.html?goods_id=384032316037&page_from=35&pxq_secret_key=3LLZUBEI2GJE6IY52X4YPQXTVN6D3QIHBO4O4OKYLCNOQAK7YLNQ&share_uin=I4WFO5QBPLBDIOEFCQ6TDZRRXY_GEXDA&refer_share_id=fcd465547e14464b81b73329a3b2b132&refer_share_uin=I4WFO5QBPLBDIOEFCQ6TDZRRXY_GEXDA&refer_share_channel=copy_link&refer_share_form=text')
// getGoodsSign()