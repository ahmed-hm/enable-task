import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModelName, UserSchema } from './schema/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const UserMongooseDynamicModule = MongooseModule.forFeature([{ name: UserModelName, schema: UserSchema }]);

@Module({
  imports: [UserMongooseDynamicModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, UserMongooseDynamicModule],
})
export class UserModule {}
