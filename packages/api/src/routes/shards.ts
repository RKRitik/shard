import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getDb } from '../db';

export default async function shardRoutes(fastify: FastifyInstance) {
    // GET /api/shards - List all shards
    fastify.get('/shards', async (request: FastifyRequest, reply: FastifyReply) => {
        const db = await getDb();
        const shards = await db`SELECT * from shards`;
        fastify.log.info('fetched shards: ' + JSON.stringify(shards));
        return { shards }
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
        try {
            fastify.log.info('Publishing shard: ' + request.body.namespace + ', ' + request.body.package + ', ' + request.body.shard + ', ' + request.body.version);
            const { namespace, package: pkg, shard, version } = request.body;
            if (!namespace || !pkg || !shard || !version) {
                return { success: false, error: 'Error: Missing required fields' }
            }
            const db = await getDb();
            const createdShard = await db`INSERT INTO shards (namespace, package, shard, version) VALUES (${namespace}, ${pkg}, ${shard}, ${version})`;
            fastify.log.info('createdShard: ' + JSON.stringify(createdShard));
            return { success: true, shard: createdShard }
        }
        catch (error) {
            fastify.log.error('❌ Error publishing shard:' + error)
            return { success: false, error: 'Failed to publish shard' }
        }
    })
}