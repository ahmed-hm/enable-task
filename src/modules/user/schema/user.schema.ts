import { UnprocessableEntityException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { validate } from 'class-validator';
import { Model, Schema } from 'mongoose';
import { User } from '../entities/user.entity';

export const UserModelName = User.name;
export interface IUserModel extends Model<User> {}
export const UserSchema = new Schema<User>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    manager: { type: Schema.Types.ObjectId, ref: UserModelName },
  },
  { timestamps: true },
);

export function UserSchemaFactory(): Schema {
  UserSchema.index({ email: 1 }, { unique: true });
  UserSchema.index({ username: 1 }, { unique: true });
  UserSchema.index({ manager: 1 });
  UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text', username: 'text' });

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
