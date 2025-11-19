async function initDatabase() {
   return {
        name: 'test',
        version: 1,
        description: 'test database',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
}
let dbInstance: Awaited<ReturnType<typeof initDatabase>> | null = null

export async function getDb() {
    if (!dbInstance) {
        dbInstance = await initDatabase()
    }
    return dbInstance
}