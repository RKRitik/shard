import { FastifyInstance } from 'fastify'
import shardRoutes from "./shards"
import healthRoutes from "./health"

export async function registerRoutes(app: FastifyInstance) {
  // Health check
  await app.register(healthRoutes)
  
  // Shard routes
  await app.register(shardRoutes, { prefix: '/api' })
}