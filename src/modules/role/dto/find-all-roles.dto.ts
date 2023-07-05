import { OmitType } from '@nestjs/swagger';
import { BaseQueryDto } from 'src/shared/dto/base-query.dto';

export class FindAllRolesDto extends OmitType(BaseQueryDto, ['search']) {}
