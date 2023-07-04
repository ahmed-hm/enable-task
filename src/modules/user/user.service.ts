import { Injectable, NotFoundException } from '@nestjs/common';
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

    return { page, pages: Math.ceil(total / limit), limit, total, data: docs };
  }

  async findOne(id: Types.ObjectId) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        errors: { id: 'User not found' },
      });
    }

    return user;
  }

  async findByEmail({ email, selectPassword = false, populateRole = false }) {
    return this.userModel.findOne({ email: email.toLowerCase() }).select(selectPassword ? '+password' : undefined);
  }

  async update(id: Types.ObjectId, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    user.set(updateUserDto);
    await user.save();

    return user;
  }

  async remove(id: Types.ObjectId) {
    const user = await this.findOne(id);

    await user.deleteOne();

    return user;
  }
}
