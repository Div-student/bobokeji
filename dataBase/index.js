const { DATABASECONFIG } = require('./config')
const mysql = require('mysql2');

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: DATABASECONFIG.HOST,
  database: DATABASECONFIG.DATABASE,
  port: DATABASECONFIG.PORT,
  user: DATABASECONFIG.USER,
  password: DATABASECONFIG.PASSWORD
});

const promisePool = pool.promise()

// 查询数据
const operateTable = async (sql) => {
  const res = await promisePool.query(sql)
  return res[0]
}
exports.operateTable = operateTable

// 插入数据，删除数据， 更新数据
const insertTable = async (tableName, fieds, Values) => {
  let fiedsString = ''
  let valuestrings = []

  Values.forEach(re => {
    let tempArray = []
    fieds.forEach(item => {
      tempArray.push(`'${re[item]}'`)
    })
    valuestrings.push(`(${tempArray.join(',')})`)
  });
  let sql = `insert into ${tableName}(${fieds.join(',')}) values${valuestrings.join(',')}`
  try{
    const res = await promisePool.query(sql)
    return 'insert success'
  }catch(err){
    throw new Error(err)
  }
}
exports.insertTable = insertTable

// operateTable("SELECT * FROM user") // 查询
// operateTable("delete FROM pdd_goods_list where order_receive_time = 0") // 删除
// operateTable(`update pdd_goods_list set wechat_uid='oF-RA6fbdaY0mXnMW5lzgWVlpOXM' where order_receive_time=0`)
// insertTable('sync_flag',["lastsync_time"], [{lastsync_time: Math.floor(new Date('2022-09-11 06:00:00').getTime()/1000) - 1000}])