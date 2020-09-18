import {ConnectionOptions} from 'typeorm/connection/ConnectionOptions'

module.exports = {
  type: 'sqlite',
  database: `trading_bot_${process.env.TRADING_BOT_ENV}`,
  synchronize: true,
  logging: false,
  entities: [
    'src/db/entity/**/*.ts'
  ],
  migrations: [
    'src/db/migration/**/*.ts'
  ],
  subscribers: [
    'src/db/subscriber/**/*.ts'
  ],
  cli: {
    entitiesDir: 'src/db/entity',
    migrationsDir: 'src/db/migration',
    subscribersDir: 'src/db/subscriber'
  }
} as ConnectionOptions
