import { exec } from 'child_process'
import { SimpleIntervalJob, Task, ToadScheduler } from "toad-scheduler"

function execWithStdout(cmd: string) {
  const p = exec(cmd)
  p.stdout?.pipe(process.stdout)
  p.stderr?.pipe(process.stdout)
}

const task = new Task('simple-task', () => {
  console.log(new Date())
  execWithStdout('yarn sell')
  execWithStdout('yarn buy')
})

const job = new SimpleIntervalJob({ minutes: 15 }, task)
new ToadScheduler()
  .addSimpleIntervalJob(job)
