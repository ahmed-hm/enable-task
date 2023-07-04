import { IUserModel } from 'src/modules/user/schema/user.schema';
import * as seed from './seed.json';

export async function seedRoles(roleModel: any) {
  const roles = seed.role.map(async (role) => await roleModel.create(role));

  await Promise.all(roles);
}

export async function seedUsers(userModel: IUserModel) {
  const users = seed.user.map(async (user) => await userModel.create(user));

  await Promise.all(users);
}
