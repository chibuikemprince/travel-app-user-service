import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthService } from 'src/users/services/google/google.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private googleAuthService: GoogleAuthService,
  ) {
    super();
  }

  async canActivate(context: any) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);

      const { accessToken, refreshToken, email, tokenId } = decodedToken;
      request.token = token;

      const isValid = await this.googleAuthService.verifyToken(
        accessToken,
        tokenId,
      );

      if (!isValid) {
        const newAccessToken =
          await this.googleAuthService.refreshToken(refreshToken);
        if (!newAccessToken) {
          throw new UnauthorizedException('Failed to refresh token');
        }

        const updatedToken = await this.updateJwtContent(token, {
          accessToken: newAccessToken,
        });
        request.headers.authorization = `Bearer ${updatedToken}`;
        request.token = updatedToken;
      }
      request.email = email;

      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid or expired login token');
    }
  }

  async updateJwtContent(token: string, newPayload: object): Promise<string> {
    const decodedToken: any = jwt.decode(token, { complete: true });
    const updatedPayload = { ...decodedToken.payload, ...newPayload };
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.payload.exp - now;
    const updatedToken = jwt.sign(updatedPayload, process.env.JWT_SECRET, {
      expiresIn,
    });
    return updatedToken;
  }
}
