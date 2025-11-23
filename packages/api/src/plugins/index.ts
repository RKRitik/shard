import { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";


export async function registerPlugins(app: FastifyInstance) {
    // cors plugin
    await app.register(multipart);
}