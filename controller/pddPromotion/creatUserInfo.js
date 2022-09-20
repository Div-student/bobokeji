

const { insertTable, operateTable } = require('../../dataBase/index')

const creatUserInfor = async(wechat_uid) => {
  // 查询表中用户是否已存在
  let sql = `select * from user where wechat_uid='${wechat_uid}'`
  let orderList = await operateTable(sql)
  let res = ''
  if(orderList.length > 0){
    res = 'hasPermission'
  }else{
    let results = await insertTable('user', ["wechat_uid"], [{ wechat_uid}])
    res = 'insertSuccess'
  }
  return res
}
exports.creatUserInfor = creatUserInfor