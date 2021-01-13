import {exec} from 'child_process'
import schedule from 'node-schedule'

schedule.scheduleJob('*/30 * * * *', function () {
  execWithStdout('yarn sell')
})

schedule.scheduleJob('0 21 * * *', function () {
  execWithStdout('yarn buy')
})

function execWithStdout(cmd: string) {
  const p = exec(cmd)
  p.stdout?.pipe(process.stdout)
  p.stderr?.pipe(process.stdout)
}
