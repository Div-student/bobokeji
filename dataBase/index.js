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

// operateTable("SELECT * FROM user") // 查询 Math.floor(currentTime/1000)
// operateTable("delete FROM user where user_logo_url= 'www.baidu.com'") // 删除
// operateTable(`update sync_flag set lastsync_time=${new Date().getTime()} where sync_type='JD'`) // 更新
// insertTable('sync_flag',["lastsync_time", "sync_type"], [{lastsync_time: new Date('2022-10-06 13:30:00').getTime()}]) // 新增