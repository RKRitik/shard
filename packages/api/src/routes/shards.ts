import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getDb } from '../db';
import { getBlobFromS3, uploadBlobToS3 } from '../storage';

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
                return reply.status(500).send({ success: false, error: 'Error: No file uploaded' });
            }
            const namespace = getFieldValue(data.fields?.namespace) as string;
            const package_ = getFieldValue(data.fields?.package) as string;
            const shard = getFieldValue(data.fields?.shard) as string;
            const version = getFieldValue(data.fields?.version) as string;
            if (!namespace || !package_ || !shard || !version || !data) {
                return reply.status(400).send({ success: false, error: 'Error: Missing required fields' });
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
            return reply.status(500).send({ success: false, error: 'Failed to publish shard' });
        }
    })

    // GET /api/shard - Get a shard
    fastify.post('/shard', async (request: FastifyRequest, reply: FastifyReply) => {
        const key = JSON.parse(request.body as any)?.key;
        fastify.log.info('key: ' + key);
        if (!key) {
            return reply.status(400).send({ success: false, error: 'Error: Missing required field: key' });
        }
        const shardBlob = await getBlobFromS3(key);
        if (!shardBlob?.Body) {
            return reply.status(404).send({ success: false, error: 'Shard not found' });
        }
        const filename = key.split('/').pop() || 'shard.bin';
        reply
            .header('Content-Type', shardBlob.ContentType || 'application/octet-stream')
            .header('Content-Length', shardBlob.ContentLength?.toString() || '')
            .header('Content-Disposition', `attachment; filename="${filename}"`); // This triggers download dialog

        return reply.send(shardBlob.Body);
    })
}

const getFieldValue = (field: any): string | undefined => {
    if (!field) return undefined;
    if (Array.isArray(field)) {
        return field[0]?.value;
    }
    return field.value;
};