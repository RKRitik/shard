import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getDb } from '../db';

export default async function shardRoutes(fastify: FastifyInstance) {
    // GET /api/shards - List all shards
    fastify.get('/shards', async (request: FastifyRequest, reply: FastifyReply) => {
        const db = await getDb();
        fastify.log.info(db)
        return { shards: [] }
    })

    // POST /api/publish - Publish a shard
    fastify.post('/publish', async (request: FastifyRequest<{
        Body: {
            namespace: string
            package: string
            shard: string
            version: string
        }
    }>, reply: FastifyReply) => {
        const { namespace, package: pkg, shard, version } = request.body

        return { success: true, namespace, package: pkg, shard, version }
    })
}