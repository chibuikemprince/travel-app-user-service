import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleAuthService {
  private oauth2Client: OAuth2Client;
  private clientId: string = process.env.GOOGLE_AUTH_CLIENT_ID;
  private clientSecret: string = process.env.GOOGLE_AUTH_CLIENT_SECRET;
  private clientRedirectUri: string = process.env.GOOGLE_AUTH_REDIRECT_URI;
  constructor(private userService: UsersService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.clientRedirectUri,
    );
  }

  generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    console.log({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      clientRedirectUri: this.clientRedirectUri,
    });
    return url;
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  async getUserInfo() {
    const oauth2 = google.oauth2({
      auth: this.oauth2Client,
      version: 'v2',
    });

    const res = await oauth2.userinfo.get();
    return res.data;
  }

  async verifyToken(token: string, tokenId): Promise<boolean> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: tokenId,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();

      return !!payload;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      const { tokens } = await this.oauth2Client.getToken(refreshToken);
      return tokens.access_token || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
