import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { StoreModule } from './store/store.module';
import { DeliveryHistoryModule } from './delivery-history/delivery-history.module';
import { LatestDeliveryModule } from './latest-delivery/latest-delivery.module';
import * as fs from 'fs'; // Import fs to read the SSL certificate file
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: 'development.env',
    }),
    // Configure TypeORM with PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to inject ConfigService
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: Number(configService.get<string>('DATABASE_PORT')),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,         // Turn off sync!
        migrationsRun: false,        // Auto-run migrations on app start
        logging: true,             //Show queries
        extra:{
          max: 20, // Set maximum number of connections in the pool
          // ssl:{
          //   ca: fs.readFileSync(configService.get<string>('RDS_CA_PATH')
          //   || '/home/ec2-user/ap-southeast-1-bundle.pem').toString(),
          // }
        },
      }),
      inject: [ConfigService], // Inject ConfigService to use in useFactory
    }),
    ScheduleModule.forRoot(), // Import ScheduleModule for scheduling tasks
    // Import application modules
    AdminModule, StoreModule, DeliveryHistoryModule, LatestDeliveryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
