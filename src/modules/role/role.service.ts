import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocumentFromSchema, Types } from 'mongoose';
import { CustomResponsePayload } from 'src/shared/response';
import { assertReturn } from 'src/shared/utils';
import { UserService } from '../user/user.service';
import { ROLE_MODEL_NAME } from './constants';
import { CreateRoleDto } from './dto/create-role.dto';
import { FindAllRolesDto } from './dto/find-all-roles.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IRoleModel, RoleSchema } from './schemas/role.schema';

@Injectable()
export class RoleService {
  constructor(@InjectModel(ROLE_MODEL_NAME) private readonly roleModel: IRoleModel, private readonly userService: UserService) {}

  async create(createRoleDto: CreateRoleDto): Promise<CustomResponsePayload<HydratedDocumentFromSchema<RoleSchema>>> {
    const role = await this.roleModel.create(createRoleDto);

    return { data: role };
  }

  async findAll({ limit, page }: FindAllRolesDto): Promise<CustomResponsePayload<HydratedDocumentFromSchema<RoleSchema>[]>> {
    const [docs, total] = await Promise.all([
      this.roleModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort('_id'),
      this.roleModel.countDocuments(),
    ]);

    return { page, pages: Math.ceil(total / limit), limit, total, data: docs };
  }

  async findOne(id: Types.ObjectId): Promise<CustomResponsePayload<HydratedDocumentFromSchema<RoleSchema>>> {
    const role = await this.roleModel.findById(id);

    return { data: role };
  }

  async update(id: Types.ObjectId, { permission }: UpdateRoleDto): Promise<CustomResponsePayload<HydratedDocumentFromSchema<RoleSchema>>> {
    const { data: role } = await this.findOne(id);

    assertReturn({ data: role }, 'Role not found');

    role.set({ permission });
    await role.save();

    return { data: role };
  }

  async remove(id: Types.ObjectId): Promise<CustomResponsePayload<HydratedDocumentFromSchema<RoleSchema>>> {
    const { data: role } = await this.findOne(id);

    assertReturn({ data: role }, 'Role not found');

    await this.ensureRoleIsNotUsed(role);

    await role.deleteOne();

    return { data: role };
  }

  private async ensureRoleIsNotUsed(role: HydratedDocumentFromSchema<RoleSchema>) {
    const { data: user } = await this.userService.findOne({ role });

    if (user) {
      throw new ForbiddenException({
        message: 'Cannot delete role with users',
        errors: { id: 'Cannot delete role with users' },
      });
    }
  }
}
