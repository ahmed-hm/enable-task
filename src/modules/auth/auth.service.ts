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
    const user = await this.userService.findByEmail(email);
    await this.validatePassword(password, user);

    const token = await this.generateToken(user);

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
      { email: user.email, _id: user._id },
      { expiresIn: '1d', secret: this.configService.get<string>('JWT_SECRET_KEY') },
    );
  }
}
