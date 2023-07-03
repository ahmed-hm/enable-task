import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { TransformObjectId } from '../decorators';

export class BaseEntity<T = any> {
  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ type: String, format: 'ObjectId' })
  @TransformObjectId()
  _id: Types.ObjectId;

  @IsDate()
  @IsOptional()
  createdAt: Date;

  @IsDate()
  @IsOptional()
  updatedAt: Date;
}
