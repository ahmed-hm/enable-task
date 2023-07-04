import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn({ email, password }: SignInDto) {
    const user = await this.userService.findByEmail({ email /* populateRole: true, selectPassword: true */ });

    await this.validatePassword(password, user);

    await user.populate({
      path: 'role',
      select: 'type permission',
    });
    const token = await this.generateToken(user.toObject());

    return { user, token };
  }

  private async validatePassword(password: string, user: User): Promise<void> {
    const isValid = await compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException({
        message: 'Invalid password',
      });
    }
  }

  private async generateToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      { ...user, password: undefined },
      { expiresIn: '1d', secret: this.configService.get<string>('JWT_SECRET_KEY') },
    );
  }
}
