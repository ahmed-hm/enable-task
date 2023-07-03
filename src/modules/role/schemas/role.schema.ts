import { Model, Schema } from 'mongoose';
import { Role } from '../entities/role.entity';
import { RoleEnum } from '../types';
import { PermissionSchema } from './permission.schema';

export const ROLE_MODEL_NAME = Role.name;
export interface IRoleModel extends Model<Role> {}
export const RoleSchema = new Schema<Role>({
  type: {
    type: String,
    required: true,
    enum: RoleEnum,
  },
  permission: {
    type: PermissionSchema,
    required: true,
  },
});

export function roleSchemaFactory() {
  RoleSchema.index({ type: 1 });

  return RoleSchema;
}
