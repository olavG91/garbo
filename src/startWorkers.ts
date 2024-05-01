import dotenv from 'dotenv'
dotenv.config() // keep this line first in file

// keep this line, otherwise the workers won't be started
import * as workers from './workers'
// start workers
console.log('Starting workers...')
Object.values(workers).forEach((worker) => worker.run())

console.log(
  Object.values(workers)
    .map((worker) => `✅ ${worker.name}`)
    .join('\n')
)