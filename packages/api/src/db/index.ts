import { initPostgres } from "./postgres";

type Database = any; //might be mongo/postgres/mysql/etc.
let dbInstance: Database | null = null

export async function getDb() {
    if (!dbInstance) {
        dbInstance = await initPostgres()
    }
    return dbInstance
}

