import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IdDto } from 'src/shared/dto';
import { CustomResponse } from 'src/shared/response';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<CustomResponse<User>> {
    const user = await this.userService.create(createUserDto);

    return new CustomResponse<User>({
      payload: { data: user.toObject() },
      message: 'User created successfully',
      statusCode: 201,
    });
  }

  @Get()
  async findAll(@Query() findAllUsersDto: FindAllUsersDto): Promise<CustomResponse<User>> {
    const payload = await this.userService.findAll(findAllUsersDto);

    return new CustomResponse<User>({ payload, message: 'Users retrieved successfully' });
  }

  @Get(':id')
  async findOne(@Param() { _id }: IdDto): Promise<CustomResponse<User>> {
    const user = await this.userService.findOne(_id);

    return new CustomResponse<User>({
      payload: { data: user.toObject() },
      message: 'User retrieved successfully',
    });
  }

  @Patch(':id')
  async update(@Param() { _id }: IdDto, @Body() updateUserDto: UpdateUserDto): Promise<CustomResponse<User>> {
    const user = await this.userService.update(_id, updateUserDto);

    return new CustomResponse<User>({
      payload: { data: user.toObject() },
      message: 'User updated successfully',
    });
  }
}
