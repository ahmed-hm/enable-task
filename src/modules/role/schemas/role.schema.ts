import { UnprocessableEntityException } from '@nestjs/common';
import { validate } from 'class-validator';
import { Model, Schema } from 'mongoose';
import { commonSchemaOptions } from 'src/shared/utils';
import { Role } from '../entities/role.entity';
import { RoleEnum } from '../types';
import { PermissionSchema } from './permission.schema';

export interface IRoleModel extends Model<Role> {}
export type RoleSchema = typeof RoleSchema;
const RoleSchema = new Schema<Role>(
  {
    type: {
      type: String,
      required: true,
      enum: RoleEnum,
    },
    permission: {
      type: PermissionSchema,
      required: true,
    },
  },
  commonSchemaOptions,
);

export function roleSchemaFactory() {
  RoleSchema.index({ type: 1 }, { unique: true });

  RoleSchema.pre('validate', async function () {
    const role = new Role(this.toObject());

    const validationErrors = await validate(role);

    if (validationErrors.length) {
      throw new UnprocessableEntityException({
        message: 'Input data validation failed',
        errors: JSON.stringify(validationErrors, null, 2),
      });
    }
  });

  return RoleSchema;
}
