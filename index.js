import { readFileSync } from 'fs'
import { outputFileSync, pathExistsSync } from 'fs-extra/esm'
import axios from 'axios'

const loadTargets = () => {
  const file = 'targets'
  if (!pathExistsSync(file)) {
    outputFileSync(file, '123')
  }
  return readFileSync(file, 'utf-8')
    .split('\n')
    .filter(Boolean)
}

const ping = async (url) => {
  return await axios.get(url)
}

const pingAllTargets = async () => {
  console.log(new Date().toLocaleString())

  const promises = await Promise.allSettled(
    loadTargets().map(ping)
  )

  promises.forEach(({ value, reason }, index) => {
    const paddedIndex = String(index)
      .padStart(Math.floor(Math.log10(promises.length - 1)) + 1, ' ')
    const url = (value ?? reason)?.request.res.responseUrl

    if (value) {
      const { status } = value
      console.log(`${paddedIndex}. ✅[${status}] ${url}`)
    } else {
      const { status } = reason.response
      console.log(`${paddedIndex}. ❌[${status}] ${url}`)
    }
  })
  console.log()
}

const run = async () => {
  const interval = 1000 * 60 * 20
  setInterval(pingAllTargets, interval)
  pingAllTargets()
}

run()
