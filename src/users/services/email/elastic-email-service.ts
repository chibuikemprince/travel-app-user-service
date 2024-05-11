import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ElasticEmailService {
  private apiKey: string = process.env.ELASTIC_EMAIL_TOKEN;

  async sendEmail(to: string, subject: string, body: string) {
    const params = new URLSearchParams();
    params.append('apikey', this.apiKey);
    params.append('from', process.env.SENDER_EMAIL_ACCOUNT);
    params.append('to', to);
    params.append('subject', subject);
    params.append('bodyHtml', body);

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    try {
      const response = await axios.post(
        'https://api.elasticemail.com/v2/email/send',
        params,
        config,
      );
      console.log('Email sent: ' + JSON.stringify(response.data));
    } catch (error) {
      console.error('Error sending email: ', error);
    }
  }
}
