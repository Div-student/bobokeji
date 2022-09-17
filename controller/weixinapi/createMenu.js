const rq = require('request-promise')
const access_token = require('../../utils/getGZHtoken.js')

const createMenu = async () => {
  const ACCESS_TOKEN = await access_token()
  let queryBody =  {
    "button":[
      {	
      "type":"click",
      "name":"吃饭票",
      "key":"fanpiao"
     },
     {	
        "name":"购物票",
        "sub_button":[
          {	
            "type":"view",
            "name":"优选优惠",
            "url":"https://www.bobozhaoquan.cn/index.php?r=index/wap"
          },
          {	
            "type":"view",
            "name":"解析返现",
            "url":"https://wechatbi.bobozhaoquan.cn/index"
          },
          {	
            "type":"view",
            "name":"内测申请",
            "url":"https://3971-113-116-34-21.ngrok.io/userInfor"
          },
        ]
      }
    ]
}
  let params = {
    method: 'POST',
    uri: `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${ACCESS_TOKEN}`,
    body: queryBody,
    json: true
  }
  let menuList = await rq(params)
  console.log('创建结果==》', menuList)
}

const deleteMenu = async () => {
  const ACCESS_TOKEN = await access_token()
  let url = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${ACCESS_TOKEN}`
  let deletRes = await rq(url)
  console.log('删除菜单结果', deletRes)
}

// deleteMenu()

createMenu()