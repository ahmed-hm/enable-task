import { IsObject, ValidateNested } from 'class-validator';
import { ResourceEnum } from '../types/resource.enum';
import { ResourceOperation } from './resource-operation.entity';

export class Permission implements Record<ResourceEnum, ResourceOperation> {
  @IsObject()
  @ValidateNested()
  USER: ResourceOperation;

  @IsObject()
  @ValidateNested()
  ROLE: ResourceOperation;

  @IsObject()
  @ValidateNested()
  DEPARTMENT: ResourceOperation;
}
