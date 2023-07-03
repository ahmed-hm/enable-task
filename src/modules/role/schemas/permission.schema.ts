import { Schema } from 'mongoose';
import { Permission } from '../entities/permission.entity';
import { ResourceOperationSchema } from './resource-operation.schema';

export const PermissionSchema = new Schema<Permission>(
  {
    USER: { type: ResourceOperationSchema, required: true },
    ROLE: { type: ResourceOperationSchema, required: true },
    DEPARTMENT: { type: ResourceOperationSchema, required: true },
  },
  { _id: false },
);
