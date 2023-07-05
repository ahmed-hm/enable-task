import { Schema } from 'mongoose';
import { SubDepartment } from '../entities/sub-department.entity';
import { DEPARTMENT_MODEL_NAME } from './department.schema';

const subDepartmentSchema = new Schema<SubDepartment>(
  {
    _id: { type: Schema.Types.ObjectId, required: true, ref: () => DEPARTMENT_MODEL_NAME },
    name: { type: String, required: true, trim: true },
  },
  { _id: false },
);

export function subDepartmentSchemaFactory() {
  return subDepartmentSchema;
}
