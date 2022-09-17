/* 
* 多多进宝授权管理
*/
const { requestPddApi } = require('./pingduoduoApi')

// 查询账号授权情况
const queryAuthority = async() => {
  let res = await requestPddApi('pdd.ddk.member.authority.query', { pid:'22681512_214789967' })
  console.log("res==>", res)
}

// 生成授权链接
const getAuthourityUrl = async() => {
  let res = await requestPddApi('pdd.ddk.rp.prom.url.generate', {
    channel_type: 10, 
    p_id_list: JSON.stringify(['22681512_214789967']),
    custom_parameters: JSON.stringify({uid:"bobokeji"})
  })
  console.log("res==>", res.rp_promotion_url_generate_response.url_list[0])
}

queryAuthority()
// getAuthourityUrl()