import { Controller, OnModuleInit } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import * as amqp from 'amqplib';
//import { GoogleAuthService } from '../email/sendemail.service';
import { ElasticEmailService } from '../email/elastic-email-service';

@Controller()
export class AppController implements OnModuleInit {
  private client;

  constructor(private EmailService: ElasticEmailService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URI],
        queue: 'user_notifications',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      console.log('Connecting to RabbitMQ channel');

      const connection = await amqp.connect(process.env.RABBITMQ_URI);
      const channel = await connection.createChannel();

      const queue = 'user_notifications';

      await channel.assertQueue(queue, {
        durable: true,
      });

      console.log(
        ' [*] Waiting for messages in %s. To exit press CTRL+C',
        queue,
      );

      channel.consume(
        queue,
        async (msg) => {
          if (msg !== null) {
            console.log(' [x] Received %s', msg.content.toString());
            // const data = msg.content.data;
            const data = JSON.parse(msg.content.toString());
            const userEmail = data.data.userEmail;
            await this.EmailService.sendEmail(
              userEmail,
              `TravelApp - ${data.data.type.charAt(0).toUpperCase() + data.data.type.slice(1)} Booking Successful`,
              `Hi,\n\nYour ${data.data.type} booking was successful. Thank you for choosing our service. We wish you a pleasant journey.\n\nBest regards,\nTravelApp Team`,
            );

            channel.ack(msg);
          }
        },
        {
          noAck: false,
        },
      );
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
    }
  }
}
