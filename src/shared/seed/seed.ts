import { Logger } from '@nestjs/common';
import { IDepartmentModel } from 'src/modules/department/schema/department.schema';
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

export async function seedDepartments(departmentModel: IDepartmentModel) {
  const departments = seed.department.map(async (department) => await departmentModel.create(department));

  await Promise.all(departments);
}

export async function seedAll(roleModel: any, userModel: IUserModel, departmentModel: IDepartmentModel) {
  const logger = new Logger('Seed Data');

  logger.log('starting role seed');
  await seedRoles(roleModel);
  logger.log('finished role seed');

  logger.log('starting user seed');
  await seedUsers(userModel);
  logger.log('finished user seed');

  logger.log('Starting department seed');
  await seedDepartments(departmentModel);
  logger.log('Finished department seed');
}
