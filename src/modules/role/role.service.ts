import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CustomResponsePayload } from 'src/shared/response';
import { CreateRoleDto } from './dto/create-role.dto';
import { FindAllRolesDto } from './dto/find-all-roles.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IRoleModel, ROLE_MODEL_NAME } from './schemas/role.schema';

@Injectable()
export class RoleService {
  constructor(@InjectModel(ROLE_MODEL_NAME) private readonly roleModel: IRoleModel) {}

  async create(createRoleDto: CreateRoleDto) {
    return await this.roleModel.create(createRoleDto);
  }

  async findAll({ limit, page, role }: FindAllRolesDto): Promise<CustomResponsePayload> {
    const [docs, total] = await Promise.all([
      this.roleModel
        .find({ ...(role && { role }) })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort('_id'),
      this.roleModel.countDocuments({ ...(role && { role }) }),
    ]);

    return { page, pages: Math.ceil(total / limit), limit, total, data: docs };
  }

  async findOne(id: Types.ObjectId) {
    const role = this.roleModel.findById(id);

    if (!role) {
      throw new NotFoundException({
        message: 'Role not found',
        errors: { id: 'Role not found' },
      });
    }

    return role;
  }

  async update(id: Types.ObjectId, { permission }: UpdateRoleDto) {
    const role = await this.findOne(id);

    role.set({ permission });
    await role.save();

    return role;
  }

  async remove(id: Types.ObjectId) {
    const role = await this.findOne(id);

    await role.deleteOne();

    return role;
  }
}
