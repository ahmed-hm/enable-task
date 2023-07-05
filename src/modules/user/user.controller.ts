import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IdDto } from 'src/shared/dto';
import { CustomResponse } from 'src/shared/response';
import { Permission } from '../auth/gaurds';
import { ResourceEnum, ResourceOperationEnum } from '../role/types';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permission({ resource: ResourceEnum.USER, resourceOperation: ResourceOperationEnum.CREATE })
  async create(@Body() createUserDto: CreateUserDto): Promise<CustomResponse<User>> {
    const user = await this.userService.create(createUserDto);

    return new CustomResponse<User>({
      payload: { data: user },
      message: 'User created successfully',
      statusCode: 201,
    });
  }

  @Get()
  @Permission({ resource: ResourceEnum.USER, resourceOperation: ResourceOperationEnum.READ })
  async findAll(@Query() findAllUsersDto: FindAllUsersDto): Promise<CustomResponse<User>> {
    const payload = await this.userService.findAll(findAllUsersDto);

    return new CustomResponse<User>({ payload, message: 'Users retrieved successfully' });
  }

  @Get(':id')
  @Permission({ resource: ResourceEnum.USER, resourceOperation: ResourceOperationEnum.READ })
  async findOne(@Param() { id }: IdDto): Promise<CustomResponse<User>> {
    const user = await this.userService.findOne(id);

    return new CustomResponse<User>({
      payload: { data: user },
      message: 'User retrieved successfully',
    });
  }

  @Patch(':id')
  @Permission({ resource: ResourceEnum.USER, resourceOperation: ResourceOperationEnum.UPDATE })
  async update(@Param() { id }: IdDto, @Body() updateUserDto: UpdateUserDto): Promise<CustomResponse<User>> {
    const user = await this.userService.update(id, updateUserDto);

    return new CustomResponse<User>({
      payload: { data: user },
      message: 'User updated successfully',
    });
  }

  @Delete(':id')
  @Permission({ resource: ResourceEnum.USER, resourceOperation: ResourceOperationEnum.DELETE })
  async remove(@Param() { id }: IdDto): Promise<CustomResponse<User>> {
    const user = await this.userService.remove(id);

    return new CustomResponse<User>({
      payload: { data: user },
      message: 'User deleted successfully',
    });
  }
}
