import { IsEnum, IsObject, Validate, ValidateNested } from 'class-validator';
import { BaseEntity } from 'src/shared/entities';
import { RoleEnum } from '../types';
import { Permission } from './permission.entity';

export class Role extends BaseEntity {
  @IsEnum(RoleEnum)
  type: RoleEnum;

  @IsObject()
  @ValidateNested()
  permission: Permission;
}
