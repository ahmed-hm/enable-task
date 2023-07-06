import { ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, HydratedDocumentFromSchema, Types } from 'mongoose';
import { CustomResponsePayload } from 'src/shared/response';
import { assertReturn } from 'src/shared/utils';
import { UserJWTToken } from '../auth/types';
import { DepartmentService } from '../department/department.service';
import { RoleEnum } from '../role/types';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { IUserModel, UserSchema, USER_MODEL_NAME } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(USER_MODEL_NAME) private readonly userModel: IUserModel,
    @Inject(forwardRef(() => DepartmentService)) private readonly departmentService: DepartmentService,
  ) {}

  async create({ managedDepartment, ...createUserDto }: CreateUserDto): Promise<CustomResponsePayload<HydratedDocumentFromSchema<UserSchema>>> {
    const user = await this.userModel.create(createUserDto);

    if (managedDepartment) {
      await this.updateDepartmentManager({ newManager: user, departmentId: managedDepartment._id });
    }

    user.set({ managedDepartment });
    await user.save();

    return { data: user };
  }

  async findAll(
    { page, limit, search }: FindAllUsersDto,
    { role, managedDepartment }: UserJWTToken,
  ): Promise<CustomResponsePayload<HydratedDocumentFromSchema<UserSchema>[]>> {
    const [docs, total] = await Promise.all([
      this.userModel
        .find({
          ...(search && { $text: { $search: search, $caseSensitive: false } }),
          ...(role.type !== RoleEnum.SUPER_ADMIN && { 'department._id': new Types.ObjectId(managedDepartment._id) }),
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(...(search ? [{ score: { $meta: 'textScore' as const } }] : ['_id'])),
      this.userModel.countDocuments({
        ...(search && { $text: { $search: search, $caseSensitive: false } }),
        ...(role.type !== RoleEnum.SUPER_ADMIN && { 'department._id': new Types.ObjectId(managedDepartment._id) }),
      }),
    ]);

    return { page, pages: Math.ceil(total / limit), limit, total, data: docs };
  }

  async findOne(user: Partial<User>): Promise<CustomResponsePayload<HydratedDocumentFromSchema<UserSchema>>>;
  async findOne(id: Types.ObjectId): Promise<CustomResponsePayload<HydratedDocumentFromSchema<UserSchema>>>;
  async findOne(idOrUser: Types.ObjectId | Partial<User>): Promise<CustomResponsePayload<HydratedDocumentFromSchema<UserSchema>>> {
    if (idOrUser instanceof Types.ObjectId) {
      const user = await this.userModel.findById(idOrUser);

      return { data: user };
    } else {
      const { role, managedDepartment, department, email } = idOrUser;

      const user = await this.userModel.findOne({
        ...(role && { 'role._id': role._id }),
        ...(managedDepartment && { 'managedDepartment._id': managedDepartment._id }),
        ...(department && { 'department._id': department._id }),
        ...(email && { email: email.toLowerCase() }),
      });

      return { data: user };
    }
  }

  async update(id: Types.ObjectId, updateUserDto: UpdateUserDto): Promise<CustomResponsePayload<HydratedDocumentFromSchema<UserSchema>>> {
    const { data: user } = await this.findOne(id);

    assertReturn({ data: user }, 'User not found');

    user.set(updateUserDto);
    await user.save();

    return { data: user };
  }

  async updateMany(filter: FilterQuery<HydratedDocumentFromSchema<UserSchema>>, updateUserDto: Partial<UpdateUserDto>): Promise<void> {
    await this.userModel.updateMany(filter, updateUserDto);
  }

  async remove(id: Types.ObjectId): Promise<CustomResponsePayload<HydratedDocumentFromSchema<UserSchema>>> {
    const { data: user } = await this.findOne(id);

    assertReturn({ data: user }, 'User not found');

    if (user.managedDepartment) {
      throw new ForbiddenException({
        message: 'User is a manager of a department, cannot be deleted',
        errors: { id: 'User is a manager of a department, cannot be deleted' },
      });
    }

    await user.deleteOne();

    return { data: user };
  }

  private async updateDepartmentManager({
    newManager = null,
    departmentId = null,
  }: {
    newManager?: HydratedDocumentFromSchema<UserSchema>;
    departmentId?: Types.ObjectId;
  }) {
    const { data: department } = await this.departmentService.findOne(departmentId);
    department.set({ manager: newManager._id });

    const oldManager = await this.userModel.findById(department.manager._id);
    oldManager?.set({ managedDepartment: null });

    await Promise.all([oldManager?.save(), department.save()]);
  }
}
