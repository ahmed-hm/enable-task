import { Body, Controller, Post } from '@nestjs/common';
import { CustomResponse } from 'src/shared/response';
import { CreateUserDto } from './dto/create-user.dto';
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
}
