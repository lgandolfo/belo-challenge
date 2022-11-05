const ormConfig = {
  type: 'postgres',
  host: process.env.DB_HOST_URL,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.{ts,js}'],
  migrations: ['dist/db/migrations/**/*.js'],
  logger: 'file',
  synchronize: true,
};

module.exports = ormConfig;
