import { Injectable } from '@nestjs/common';
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

    return { page, pages: Math.ceil(total / limit), limit, total, data: docs.map((doc) => doc.toObject()) };
  }

  async findOne(id: Types.ObjectId) {
    return this.roleModel.findById(id);
  }

  async update(id: Types.ObjectId, { permission }: UpdateRoleDto) {
    return this.roleModel.findByIdAndUpdate(id, { permission }, { new: true });
  }

  async remove(id: Types.ObjectId) {
    return this.roleModel.findByIdAndDelete(id);
  }
}
