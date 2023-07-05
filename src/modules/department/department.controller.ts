import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { HydratedDocumentFromSchema } from 'mongoose';
import { DecodedJWT } from 'src/shared/decorators';
import { IdDto, PaginationDto } from 'src/shared/dto';
import { CustomResponse } from 'src/shared/response';
import { Permission } from '../auth/gaurds';
import { UserJWTToken } from '../auth/types';
import { ResourceEnum, ResourceOperationEnum } from '../role/types';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';
import { DepartmentSchema } from './schema/department.schema';

@Controller('department')
@ApiBearerAuth()
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Permission({ resource: ResourceEnum.DEPARTMENT, resourceOperation: ResourceOperationEnum.CREATE })
  async create(@Body() createDepartmentDto: CreateDepartmentDto): Promise<CustomResponse<HydratedDocumentFromSchema<DepartmentSchema>>> {
    const payload = await this.departmentService.create(createDepartmentDto);

    return new CustomResponse<HydratedDocumentFromSchema<DepartmentSchema>>({
      payload,
      message: 'Department created successfully',
      statusCode: 201,
    });
  }

  @Get()
  @Permission({ resource: ResourceEnum.DEPARTMENT, resourceOperation: ResourceOperationEnum.READ })
  async findAll(@Query() paginationDto: PaginationDto): Promise<CustomResponse<HydratedDocumentFromSchema<DepartmentSchema>[]>> {
    const payload = await this.departmentService.findAll(paginationDto);

    return new CustomResponse<HydratedDocumentFromSchema<DepartmentSchema>[]>({
      payload,
      message: 'Departments retrieved successfully',
    });
  }

  @Get(':id')
  @Permission({ resource: ResourceEnum.DEPARTMENT, resourceOperation: ResourceOperationEnum.READ })
  async findOne(@Param() { id }: IdDto): Promise<CustomResponse<Department>> {
    const payload = await this.departmentService.findOne(id);

    return new CustomResponse<HydratedDocumentFromSchema<DepartmentSchema>>({
      payload,
      message: 'Department retrieved successfully',
    });
  }

  @Patch(':id')
  @Permission({ resource: ResourceEnum.DEPARTMENT, resourceOperation: ResourceOperationEnum.UPDATE })
  async update(
    @Param() { id }: IdDto,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @DecodedJWT() user: UserJWTToken,
  ): Promise<CustomResponse<HydratedDocumentFromSchema<DepartmentSchema>>> {
    const payload = await this.departmentService.update(id, updateDepartmentDto, user);

    return new CustomResponse<HydratedDocumentFromSchema<DepartmentSchema>>({
      payload,
      message: 'Department updated successfully',
    });
  }

  @Delete(':id')
  @Permission({ resource: ResourceEnum.DEPARTMENT, resourceOperation: ResourceOperationEnum.DELETE })
  async remove(@Param() { id }: IdDto): Promise<CustomResponse<HydratedDocumentFromSchema<DepartmentSchema>>> {
    const payload = await this.departmentService.remove(id);

    return new CustomResponse<HydratedDocumentFromSchema<DepartmentSchema>>({
      payload,
      message: 'Department deleted successfully',
    });
  }
}
