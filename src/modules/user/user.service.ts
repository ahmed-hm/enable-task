import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CustomResponsePayload } from 'src/shared/response';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { IUserModel, USER_MODEL_NAME } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(USER_MODEL_NAME) private readonly userModel: IUserModel) {}

  async create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  async findAll({ page, limit, search }: FindAllUsersDto): Promise<CustomResponsePayload<User>> {
    const [docs, total] = await Promise.all([
      this.userModel
        .find({ ...(search && { $text: { $search: search, $caseSensitive: false } }) })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(...(search ? [{ score: { $meta: 'textScore' as const } }] : ['_id'])),
      this.userModel.countDocuments({ ...(search && { $text: { $search: search, $caseSensitive: false } }) }),
    ]);

    return { page, pages: Math.ceil(total / limit), limit, total, data: docs.map((doc) => doc.toObject()) };
  }

  async findOne(id: Types.ObjectId) {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async update(id: Types.ObjectId, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }
}
