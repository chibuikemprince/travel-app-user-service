import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../db/user.schema';
import { CreateUserDto } from '../../dto/createUser';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createOrUpdate(createUserDto: CreateUserDto) {
    const user = await this.userModel
      .findOne({ email: createUserDto.email })
      .lean();

    const jwtToken = jwt.sign(
      {
        accessToken: createUserDto.accessToken,
        refreshToken: createUserDto.refreshToken,
        email: createUserDto.email,
        tokenId: createUserDto.accessTokenId,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    if (user) {
      await this.userModel.findOneAndUpdate(
        { email: createUserDto.email },
        createUserDto,
        { new: true },
      );

      //throw new Error('User with this email already exists');
      return {
        message: 'Sign in successful',
        status: 'success',
        data: [{ token: jwtToken }],

        statusCode: HttpStatus.OK,
      };
    }
    await new this.userModel(createUserDto).save();
    return {
      message: 'Registration successful.',
      status: 'success',
      data: [{ token: jwtToken }],
      statusCode: HttpStatus.OK,
    };
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email }).lean();
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get user by email');
    }
  }
}
