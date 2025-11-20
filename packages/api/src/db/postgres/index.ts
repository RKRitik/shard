import { config } from "../../config/env";
import postgres from 'postgres'

export async function initPostgres() {
    if (!config.database.url) {
        throw new Error('DATABASE_URL is not set')
    }
    return postgres(config.database.url, {
        max: 1, //max pool size
        idle_timeout: 20,
        connect_timeout: 10
    })
}