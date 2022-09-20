
exports.getResponse = (xmlJson) => {
  const template = `<xml>
    <ToUserName><![CDATA[${xmlJson.FromUserName}]]></ToUserName>
    <FromUserName><![CDATA[${xmlJson.ToUserName}]]></FromUserName>
    <CreateTime>${new Date().getTime()}</CreateTime>`

  let newsItems = ''
  let counts = 0
  if(xmlJson.type==='news'){
    counts = xmlJson.sendMsg.length
    xmlJson.sendMsg.forEach(element => {
      newsItems +=`<item>
        <Title><![CDATA[${element.title}]]></Title>
        <Description><![CDATA[${element.description}]]></Description>
        <Url><![CDATA[${element.url}]]></Url>
      </item>`
    });
  }

  const respTypeMap = {
    text: `<MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${xmlJson.sendMsg}]]></Content>`,
    news: `<MsgType><![CDATA[news]]></MsgType><ArticleCount>${counts}</ArticleCount><Articles>${newsItems}</Articles>`
  }


  return template + respTypeMap[xmlJson.type]+ '</xml>'
}

