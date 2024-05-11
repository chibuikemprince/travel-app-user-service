import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './users/services/rabbitmq/flight-bookings';
import { GoogleAuthService } from './users/services/email/sendemail.service';
import { ElasticEmailService } from './users/services/email/elastic-email-service';
import { config } from 'dotenv';
config();

console.log({ db: process.env.DB });
@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB),
    ClientsModule.register([
      {
        name: 'FLIGHT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI],
          queue: 'user_notifications',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [GoogleAuthService, ElasticEmailService],
})
export class AppModule {}
