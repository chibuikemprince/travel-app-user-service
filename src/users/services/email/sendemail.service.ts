import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

@Injectable()
export class GoogleAuthService {
  private clientId: string = process.env.GOOGLE_AUTH_CLIENT_ID;
  private clientSecret: string = process.env.GOOGLE_AUTH_CLIENT_SECRET;
  private clientRedirectUri: string = process.env.GOOGLE_AUTH_REDIRECT_URI;
  private refreshToken: string = process.env.GOOGLE_AUTH_REFRESH_TOKEN;

  async sendEmail(to: string, subject: string, text: string) {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      this.clientId,
      this.clientSecret,
      this.clientRedirectUri,
    );

    oauth2Client.setCredentials({
      refresh_token: this.refreshToken,
    });

    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SENDER_EMAIL_ACCOUNT,
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        refreshToken: this.refreshToken,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL_ACCOUNT,
      to,
      subject,
      text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}
