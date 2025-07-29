import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as fs from 'fs';

dotenv.config({ path: 'development.env' });

const useSSL = process.env.USE_SSL === 'true';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/**/*.entity.{ts,js}'],
  migrations: ['src/migrations/*.{ts,js}'],
  migrationsTableName: 'migrations',
  ...(useSSL && {
    ssl: {
      ca: fs.readFileSync(
        process.env.RDS_CA_PATH || '/home/ec2-user/ap-southeast-1-bundle.pem'
      ).toString(),
    },
  }),
 
});
