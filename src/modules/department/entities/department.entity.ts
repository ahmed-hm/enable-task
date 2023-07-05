import { ApiProperty } from '@nestjs/swagger';
import { IsInstance, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { TransformObjectId } from 'src/shared/decorators';
import { BaseEntity } from 'src/shared/entities';

export class Department extends BaseEntity {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @ApiProperty({ type: String, format: 'ObjectId' })
  @IsInstance(Types.ObjectId)
  @TransformObjectId()
  manager: Types.ObjectId;
}
