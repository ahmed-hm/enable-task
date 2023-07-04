import { OmitType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from 'src/shared/dto/base-query.dto';
import { RoleEnum } from '../types';

export class FindAllRolesDto extends OmitType(BaseQueryDto, ['search']) {
  @IsOptional()
  @IsArray()
  @IsEnum(RoleEnum, { each: true })
  role?: RoleEnum[];
}