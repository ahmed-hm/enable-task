import { IUserModel } from 'src/modules/user/schema/user.schema';
import * as seed from './seed.json';

export async function seedUsers(userModel: IUserModel) {

  const users = seed.user.map(async (user) => await userModel.create(user));

  await Promise.all([...users]);
}
