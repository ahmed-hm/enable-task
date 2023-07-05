import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocumentFromSchema, Types } from 'mongoose';
import { PaginationDto } from 'src/shared/dto';
import { CustomResponsePayload } from 'src/shared/response';
import { UserJWTToken } from '../auth/types';
import { RoleEnum } from '../role/types';
import { UserService } from '../user/user.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentSchema, DEPARTMENT_MODEL_NAME, IDepartmentModel } from './schema/department.schema';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(DEPARTMENT_MODEL_NAME)
    private readonly departmentModel: IDepartmentModel,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<CustomResponsePayload<HydratedDocumentFromSchema<DepartmentSchema>>> {
    const department = await this.departmentModel.create(createDepartmentDto);

    await this.updateManager({ newDepartment: CreateDepartmentDto });

    return { data: department };
  }

  async findAll({ limit, page }: PaginationDto): Promise<CustomResponsePayload<HydratedDocumentFromSchema<DepartmentSchema>[]>> {
    const [docs, total] = await Promise.all([
      this.departmentModel
        .find()
        .limit(limit)
        .skip(limit * page),
      this.departmentModel.countDocuments(),
    ]);

    return { page, pages: Math.ceil(total / limit), limit, total, data: docs };
  }

  async findOne(id: Types.ObjectId): Promise<CustomResponsePayload<HydratedDocumentFromSchema<DepartmentSchema>>> {
    const department = await this.departmentModel.findById(id);

    if (!department) {
      throw new NotFoundException({
        message: 'Department not found',
        errors: { id: 'Department not found' },
      });
    }

    return { data: department };
  }

  async update(
    id: Types.ObjectId,
    updateDepartmentDto: UpdateDepartmentDto,
    user: UserJWTToken,
  ): Promise<CustomResponsePayload<HydratedDocumentFromSchema<DepartmentSchema>>> {
    const { data: department } = await this.findOne(id);

    if (user.role.type !== RoleEnum.SUPER_ADMIN && user.department.toString() !== department._id.toString()) {
      throw new ForbiddenException({
        message: 'You are not allowed to update this department',
        errors: { id: 'You are not allowed to update this department' },
      });
    }

    if (updateDepartmentDto.manager && department.manager.toString() !== updateDepartmentDto.manager.toString())
      await this.updateManager({ newDepartment: updateDepartmentDto, oldDepartment: department });

    department.set(updateDepartmentDto);

    await department.save();

    return { data: department };
  }

  async remove(id: Types.ObjectId): Promise<CustomResponsePayload<HydratedDocumentFromSchema<DepartmentSchema>>> {
    const { data: department } = await this.findOne(id);

    await department.deleteOne();

    await this.updateManager({ oldDepartment: department });
    await this.userService.updateMany({ 'department._id': department._id }, { department: null });

    return { data: department };
  }

  private async updateManager({
    newDepartment = null,
    oldDepartment = null,
  }: {
    newDepartment?: UpdateDepartmentDto;
    oldDepartment?: HydratedDocumentFromSchema<DepartmentSchema>;
  }) {
    const [{ data: newManager } = { data: null }, { data: oldManager } = { data: null }] = await Promise.all([
      this.userService.findOne(newDepartment.manager),
      this.userService.findOne(oldDepartment.manager),
    ]);

    if (newDepartment && !newManager) throw new NotFoundException({ message: 'Manager not found', errors: { manager: 'Manager not found' } });

    newManager?.set({ managedDepartment: { name: newDepartment.name, _id: oldDepartment._id } });
    oldManager?.set({ managedDepartment: null });

    await Promise.all([newManager?.save(), oldManager?.save()]);
  }
}
