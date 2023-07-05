import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { HydratedDocumentFromSchema } from 'mongoose';
import { DecodedJWT } from 'src/shared/decorators';
import { IdDto } from 'src/shared/dto';
import { CustomResponse } from 'src/shared/response';
import { assertReturn } from 'src/shared/utils';
import { Permission } from '../auth/gaurds';
import { UserJWTToken } from '../auth/types';
import { ResourceEnum, ResourceOperationEnum } from '../role/types';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSchema } from './schema/user.schema';
import { UserService } from './user.service';

@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permission({ resource: ResourceEnum.USER, resourceOperation: ResourceOperationEnum.CREATE })
  async create(@Body() createUserDto: CreateUserDto): Promise<CustomResponse<HydratedDocumentFromSchema<UserSchema>>> {
    const payload = await this.userService.create(createUserDto);

    return new CustomResponse<HydratedDocumentFromSchema<UserSchema>>({
      payload,
      message: 'User created successfully',
      statusCode: 201,
    });
  }

  @Get()
  @Permission({ resource: ResourceEnum.USER, resourceOperation: ResourceOperationEnum.READ })
  async findAll(
    @Query() findAllUsersDto: FindAllUsersDto,
    @DecodedJWT() user: UserJWTToken,
  ): Promise<CustomResponse<HydratedDocumentFromSchema<UserSchema>[]>> {
    const payload = await this.userService.findAll(findAllUsersDto, user);

    return new CustomResponse<HydratedDocumentFromSchema<UserSchema>[]>({
      payload,
      message: 'Users retrieved successfully',
    });
  }

  @Get(':id')
  @Permission({ resource: ResourceEnum.USER, resourceOperation: ResourceOperationEnum.READ })
  async findOne(@Param() { id }: IdDto): Promise<CustomResponse<HydratedDocumentFromSchema<UserSchema>>> {
    const payload = await this.userService.findOne(id);

    assertReturn(payload, 'User not found');

    return new CustomResponse<HydratedDocumentFromSchema<UserSchema>>({
      payload,
      message: 'User retrieved successfully',
    });
  }

  @Patch(':id')
  @Permission({ resource: ResourceEnum.USER, resourceOperation: ResourceOperationEnum.UPDATE })
  async update(@Param() { id }: IdDto, @Body() updateUserDto: UpdateUserDto): Promise<CustomResponse<HydratedDocumentFromSchema<UserSchema>>> {
    const payload = await this.userService.update(id, updateUserDto);

    return new CustomResponse<HydratedDocumentFromSchema<UserSchema>>({
      payload,
      message: 'User updated successfully',
    });
  }

  @Delete(':id')
  @Permission({ resource: ResourceEnum.USER, resourceOperation: ResourceOperationEnum.DELETE })
  async remove(@Param() { id }: IdDto): Promise<CustomResponse<HydratedDocumentFromSchema<UserSchema>>> {
    const payload = await this.userService.remove(id);

    return new CustomResponse<HydratedDocumentFromSchema<UserSchema>>({
      payload,
      message: 'User deleted successfully',
    });
  }
}
