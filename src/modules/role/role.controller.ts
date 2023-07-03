import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IdDto } from 'src/shared/dto';
import { CustomResponse } from 'src/shared/response';
import { FindAllRolesDto } from './dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto): Promise<CustomResponse<Role>> {
    const role = await this.roleService.create(createRoleDto);

    return new CustomResponse<Role>({
      payload: { data: role.toObject() },
      message: 'Role created successfully',
      statusCode: 201,
    });
  }

  @Get()
  async findAll(@Query() findAllRolesDto: FindAllRolesDto): Promise<CustomResponse<Role>> {
    const role = await this.roleService.findAll(findAllRolesDto);

    return new CustomResponse<Role>({ payload: role, message: 'Roles retrieved successfully' });
  }

  @Get(':id')
  async findOne(@Param() { _id }: IdDto): Promise<CustomResponse<Role>> {
    const role = await this.roleService.findOne(_id);

    return new CustomResponse<Role>({
      payload: { data: role.toObject() },
      message: 'Role retrieved successfully',
    });
  }

  @Patch(':id')
  async update(@Param() { _id }: IdDto, @Body() updateRoleDto: UpdateRoleDto): Promise<CustomResponse<Role>> {
    const role = await this.roleService.update(_id, updateRoleDto);

    return new CustomResponse<Role>({
      payload: { data: role.toObject() },
      message: 'Role updated successfully',
    });
  }

  @Delete(':id')
  async remove(@Param() { _id }: IdDto): Promise<CustomResponse<Role>> {
    const role = await this.roleService.remove(_id);

    return new CustomResponse<Role>({
      payload: { data: role.toObject() },
      message: 'Role deleted successfully',
    });
  }
}
