import { UnprocessableEntityException } from '@nestjs/common';
import { validate } from 'class-validator';
import { Model, Schema } from 'mongoose';
import { USER_MODEL_NAME } from 'src/modules/user/schema/user.schema';
import { Department } from '../entities/department.entity';

export const DEPARTMENT_MODEL_NAME = Department.name;
export interface IDepartmentModel extends Model<Department> {}
export type DepartmentSchema = typeof departmentSchema;
const departmentSchema = new Schema<Department>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: false, trim: true },
  manager: { type: Schema.Types.ObjectId, ref: () => USER_MODEL_NAME },
});

export function departmentSchemaFactory() {
  departmentSchema.index({ name: 1 }, { unique: true });
  departmentSchema.index({ manager: 1 });

  departmentSchema.pre('validate', async function () {
    const department = new Department(this.toObject());

    const validationErrors = await validate(department);

    if (validationErrors.length) {
      throw new UnprocessableEntityException({
        message: 'Input data validation failed',
        errors: JSON.stringify(validationErrors, null, 2),
      });
    }
  });

  return departmentSchema;
}
