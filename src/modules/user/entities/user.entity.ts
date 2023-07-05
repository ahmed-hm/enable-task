import { IsEmail, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SubDepartment } from 'src/modules/department/entities/sub-department.entity';
import { SubRole } from 'src/modules/role/entities/sub-role.entity';
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

  @IsOptional()
  @IsObject()
  @ValidateNested()
  managedDepartment?: SubDepartment;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  department?: SubDepartment;

  @IsObject()
  @ValidateNested()
  role: SubRole;
}
