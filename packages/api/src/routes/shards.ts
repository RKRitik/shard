import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getDb } from '../db';
import { uploadBlobToS3 } from '../storage';

export default async function shardRoutes(fastify: FastifyInstance) {
    // GET /api/shards - List all shards
    fastify.get('/shards', async (request: FastifyRequest, reply: FastifyReply) => {
        const db = await getDb();
        const shards = await db`SELECT * from shards`;
        fastify.log.info('fetched shards: ' + JSON.stringify(shards));
        return { shards }
    })

    // POST /api/publish - Publish a shard
    fastify.post('/publish', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const data = await request.file();
            if (!data) {
                return { success: false, error: 'Error: No file uploaded' }
            }
            const namespace = getFieldValue(data.fields?.namespace) as string;
            const package_ = getFieldValue(data.fields?.package) as string;
            const shard = getFieldValue(data.fields?.shard) as string;
            const version = getFieldValue(data.fields?.version) as string;
            if (!namespace || !package_ || !shard || !version || !data) {
                return { success: false, error: 'Error: Missing required fields' }
            }
            const fileKey = `${namespace}/${package_}/${shard}/${version}.bin`;
            const uploaded = await uploadBlobToS3(fileKey, data);
            if (!uploaded) {
                return { success: false, error: 'Failed to upload shard to S3' }
            }
            const db = await getDb();
            const createdShard = await db`INSERT INTO shards (namespace, package, shard, version, s3_id) VALUES (${namespace}, ${package_}, ${shard}, ${version}, ${fileKey})`;
            fastify.log.info('createdShard: ' + JSON.stringify(createdShard));
            return { success: true, shard: createdShard }
        }
        catch (error) {
            fastify.log.error('❌ Error publishing shard:' + error)
            return { success: false, error: 'Failed to publish shard' }
        }
    })
}

const getFieldValue = (field: any): string | undefined => {
    if (!field) return undefined;
    if (Array.isArray(field)) {
        return field[0]?.value;
    }
    return field.value;
};