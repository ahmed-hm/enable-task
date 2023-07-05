import { Schema } from 'mongoose';
import { ROLE_MODEL_NAME } from '../constants';
import { SubRole } from '../entities/sub-role.entity';
import { RoleEnum } from '../types';

const SubRoleSchema = new Schema<SubRole>({
  _id: { type: Schema.Types.ObjectId, required: true, ref: ROLE_MODEL_NAME },
  type: {
    type: String,
    required: true,
    enum: RoleEnum,
  },
});

export function subRoleSchemaFactory() {
  return SubRoleSchema;
}
