import { PickType } from '@nestjs/swagger';
import { BaseEntity } from '../entities';

export class IdDto extends PickType(BaseEntity, ['_id']) {}
