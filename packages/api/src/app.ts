import Fastify from 'fastify'
import { config } from './config/env'
import { registerRoutes } from './routes/index'
import { registerPlugins } from './plugins'

export async function buildApp() {
  const app = Fastify({
    logger: config.nodeEnv === 'development',
  })

  // Register plugins
  await registerPlugins(app)

  // Register routes
  await registerRoutes(app)



  return app
}