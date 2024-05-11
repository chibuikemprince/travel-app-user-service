import { Controller, Get, Req, UseGuards, Request } from '@nestjs/common';
import { Request as HttpRrequest } from 'express';
import { GoogleAuthService } from 'src/users/services/google/google.service';
import { UsersService } from 'src/users/services/users/users.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from 'src/users/guards/auth/auth.guard';

@Controller('auth')
export class UsersController {
  constructor(
    private googleAuthService: GoogleAuthService,
    private userService: UsersService,
  ) {}

  @Get('/google/init')
  async googleAuth() {
    return {
      status: 'success',
      data: [
        {
          url: this.googleAuthService.generateAuthUrl(),
        },
      ],
      message: 'Google sign in url fetched successfully',
      statusCode: 200,
    };
  }

  // ...
  @Get('/google/settoken')
  async googleSetToken(@Req() req: HttpRrequest) {
    return this.googleAuthCallback(req);
  }

  @Get('/google/signin')
  async googleSignIn(@Req() req: HttpRrequest) {
    return this.googleAuthCallback(req);
  }

  // create controller to getUSerProfile

  async googleAuthCallback(@Req() req: HttpRrequest) {
    try {
      const { code } = req.query;
      const tokens = await this.googleAuthService.getTokens(code as string);
      const userInfo = await this.googleAuthService.getUserInfo();

      const saveOrUpdateDB = await this.userService.createOrUpdate({
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
        accessTokenId: tokens.id_token,
        name: userInfo.name,
        email: userInfo.email,
        profileUrl: userInfo.picture,
      });
      return {
        status: 'success',
        data: [saveOrUpdateDB],
        message: 'Google Signup was successfully.',
        statusCode: 201,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          data: [],
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            'An error occurred during Google authentication. ' + error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    try {
      const email = req.email;
      const userProfile = await this.userService.getUserByEmail(email);
      return {
        message: 'profile fetched successfully.',
        data: [{ ...userProfile, token: req.token }],
        status: 'success',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          data: [],
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            'An error occurred while getting the user profile. ' +
            error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // ...
}

//callback
