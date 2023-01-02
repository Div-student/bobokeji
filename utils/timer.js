const schedule = require("node-schedule")
const { operateTable } = require('../dataBase/index')
const { getIncrementTimer } = require('../controller/duoduoke/incrementGoodsTimer')
const { updateJDlist } = require('../controller/jdPromotion/incrementJDTimer')

const timerTrigger = async()=>{
  await getIncrementTimer()
  await updateJDlist()
  let currentTime = new Date().getTime()
  // 记录本次更新时间JD 和 PDD
  operateTable(`update sync_flag set lastsync_time=${currentTime} where sync_type='JD'`)
}

schedule.scheduleJob('*/5 * * * *', timerTrigger)
