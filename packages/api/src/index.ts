import 'dotenv/config'

import { buildApp } from './app'
import { config } from './config/env'

async function start() {
  const app = await buildApp()

  try {
    await app.listen({ port: config.port, host: config.host })
    app.log.info(`Server listening on ${app.server.address()}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()