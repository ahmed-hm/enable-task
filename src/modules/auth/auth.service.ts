import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { MergeType } from 'mongoose';
import { CustomResponsePayload } from 'src/shared/response';
import { assertReturn } from 'src/shared/utils';
import { Role } from '../role/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private jwtService: JwtService, private readonly configService: ConfigService) {}

  async signIn({ email, password }: SignInDto): Promise<CustomResponsePayload<{ token: string }>> {
    const { data: user } = await this.userService.findOne({ email });

    assertReturn({ data: user }, 'User not found');

    await this.validatePassword(password, user);

    const populatedUser = await user.populate<{
      role: { _id: Pick<Role, 'type' | 'permission'> };
    }>([{ path: 'role._id', select: 'type permission' }]);

    const plainUser = { ...populatedUser.toJSON(), role: populatedUser.role._id };

    const token = await this.generateToken(plainUser);

    return { data: { token } };
  }

  private async validatePassword(password: string, user: User): Promise<void> {
    const isValid = await compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException({
        message: 'Invalid password',
      });
    }
  }

  private async generateToken(user: MergeType<User, { role: Pick<Role, 'type' | 'permission'> }>): Promise<string> {
    return this.jwtService.signAsync({ ...user, password: undefined }, { expiresIn: '1d', secret: this.configService.get<string>('JWT_SECRET_KEY') });
  }
}
