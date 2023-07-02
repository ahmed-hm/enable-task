import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { TransformObjectId } from 'src/shared/decorators';
import { BaseEntity } from 'src/shared/entities';

export class User extends BaseEntity {
  @IsString()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  username: string;

  @TransformObjectId()
  manager: Types.ObjectId;

  @TransformObjectId()
  department: Types.ObjectId;
}
