import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInstance, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { TransformObjectId } from 'src/shared/decorators';
import { BaseEntity } from 'src/shared/entities';

export class User extends BaseEntity {
  @IsString()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  username: string;

  @ApiProperty({ type: String, format: 'ObjectId' })
  @IsOptional()
  @IsInstance(Types.ObjectId)
  @TransformObjectId()
  manager?: Types.ObjectId;

  @ApiProperty({ type: String, format: 'ObjectId' })
  @IsOptional()
  @IsInstance(Types.ObjectId)
  @TransformObjectId()
  department?: Types.ObjectId;

  @ApiProperty({ type: String, format: 'ObjectId' })
  @IsInstance(Types.ObjectId)
  @TransformObjectId()
  role: Types.ObjectId;
}
