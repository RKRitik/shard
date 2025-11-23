export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
      url: process.env.DATABASE_URL || '',
    },
    storage: {
      provider: process.env.STORAGE_PROVIDER || 's3',
      url: process.env.STORAGE_URL || '',
    },
  }