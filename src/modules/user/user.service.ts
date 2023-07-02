import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { IUserModel, UserModelName } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(UserModelName) private readonly userModel: IUserModel) {}

  async create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }
}
