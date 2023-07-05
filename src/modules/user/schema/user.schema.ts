import { UnprocessableEntityException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { validate } from 'class-validator';
import { Model, Schema } from 'mongoose';
import { subDepartmentSchemaFactory } from 'src/modules/department/schema/sub-department.schema';
import { subRoleSchemaFactory } from 'src/modules/role/schemas/sub-role.schema';
import { commonSchemaOptions } from 'src/shared/utils';
import { User } from '../entities/user.entity';

export const USER_MODEL_NAME = User.name;
export type IUserModel = Model<User>;
export type UserSchema = typeof UserSchema;
const UserSchema = new Schema<User>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: false, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, trim: true },
    username: { type: String, required: true, lowercase: true, trim: true },
    managedDepartment: { type: subDepartmentSchemaFactory() },
    department: { type: subDepartmentSchemaFactory() },
    role: { type: subRoleSchemaFactory(), required: true },
  },
  commonSchemaOptions,
);

export function userSchemaFactory(): Schema {
  UserSchema.index({ email: 1 }, { unique: true });
  UserSchema.index({ username: 1 }, { unique: true });
  UserSchema.index({ managedDepartment: 1 });
  UserSchema.index({ department: 1 });
  UserSchema.index(
    {
      firstName: 'text',
      lastName: 'text',
      email: 'text',
      username: 'text',
      'department.name': 'text',
      'role.type': 'text',
    },
    { default_language: 'none' },
  );

  UserSchema.pre('validate', async function () {
    const user = new User(this.toObject());

    const validationErrors = await validate(user);

    if (validationErrors.length) {
      throw new UnprocessableEntityException({
        message: 'Input data validation failed',
        errors: JSON.stringify(validationErrors, null, 2),
      });
    }
  });

  UserSchema.pre('save', async function () {
    if (this.isModified('password')) {
      this.password = await hash(this.password, 10);
    }
  });

  return UserSchema;
}
