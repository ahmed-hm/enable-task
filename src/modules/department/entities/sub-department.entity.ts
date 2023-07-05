import { PickType } from '@nestjs/swagger';
import { Department } from './department.entity';

export class SubDepartment extends PickType(Department, ['_id', 'name']) {}
