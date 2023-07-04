import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IdDto } from 'src/shared/dto';
import { CustomResponse } from 'src/shared/response';
import { Permission } from '../auth/gaurds';
import { FindAllRolesDto } from './dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { RoleService } from './role.service';
import { ResourceEnum, ResourceOperationEnum } from './types';

@Controller('role')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permission({ resource: ResourceEnum.ROLE, resourceOperation: ResourceOperationEnum.CREATE })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<CustomResponse<Role>> {
    const role = await this.roleService.create(createRoleDto);

    return new CustomResponse<Role>({
      payload: { data: role },
      message: 'Role created successfully',
      statusCode: 201,
    });
  }

  @Get()
  @Permission({ resource: ResourceEnum.ROLE, resourceOperation: ResourceOperationEnum.READ })
  async findAll(@Query() findAllRolesDto: FindAllRolesDto): Promise<CustomResponse<Role>> {
    const role = await this.roleService.findAll(findAllRolesDto);

    return new CustomResponse<Role>({ payload: role, message: 'Roles retrieved successfully' });
  }

  @Get(':id')
  @Permission({ resource: ResourceEnum.ROLE, resourceOperation: ResourceOperationEnum.READ })
  async findOne(@Param() { id }: IdDto): Promise<CustomResponse<Role>> {
    const role = await this.roleService.findOne(id);

    return new CustomResponse<Role>({
      payload: { data: role },
      message: 'Role retrieved successfully',
    });
  }

  @Patch(':id')
  @Permission({ resource: ResourceEnum.ROLE, resourceOperation: ResourceOperationEnum.UPDATE })
  async update(@Param() { id }: IdDto, @Body() updateRoleDto: UpdateRoleDto): Promise<CustomResponse<Role>> {
    const role = await this.roleService.update(id, updateRoleDto);

    return new CustomResponse<Role>({
      payload: { data: role },
      message: 'Role updated successfully',
    });
  }

  @Delete(':id')
  @Permission({ resource: ResourceEnum.ROLE, resourceOperation: ResourceOperationEnum.DELETE })
  async remove(@Param() { id }: IdDto): Promise<CustomResponse<Role>> {
    const role = await this.roleService.remove(id);

    return new CustomResponse<Role>({
      payload: { data: role },
      message: 'Role deleted successfully',
    });
  }
}
