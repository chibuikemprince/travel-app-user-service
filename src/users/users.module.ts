import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { GoogleAuthService } from './services/google/google.service';
import { UsersService } from './services/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './db/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],

  controllers: [UsersController],
  providers: [GoogleAuthService, UsersService],
})
export class UsersModule {}
