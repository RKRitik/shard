import 'dotenv/config'
import { getDb } from "..";
import { join } from 'path'
import { readFileSync } from 'fs'

async function runMigration() {
    try {
        const db = await getDb()

        const migrationPath = join(__dirname, '001_create_shards.sql')
        const migrationSQL = readFileSync(migrationPath, 'utf-8')

        console.log('Running migration: 001_create_shards.sql...')
        await db.unsafe(migrationSQL)

        console.log('✅ Migration completed successfully!')

        // Verify table was created
        const tables = await db`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'shards'
    `

        if (tables.length > 0) {
            console.log('✅ Shards table verified!')
        }
        process.exit(0)
    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

runMigration()