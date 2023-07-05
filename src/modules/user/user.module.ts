import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentModule } from '../department/department.module';
import { USER_MODEL_NAME } from './schema/user.schema';
import { userSchemaFactory } from './schema/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const UserMongooseDynamicModule = MongooseModule.forFeature([{ name: USER_MODEL_NAME, schema: userSchemaFactory() }]);

@Module({
  imports: [UserMongooseDynamicModule, forwardRef(() => DepartmentModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, UserMongooseDynamicModule],
})
export class UserModule {}
