import { Body, Controller, Post } from '@nestjs/common';
import { CustomResponse } from 'src/shared/response';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { IsPublic } from './gaurds';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('sign-in')
  async signin(@Body() signInDto: SignInDto): Promise<CustomResponse<{ user: User; token: string }>> {
    const { user, token } = await this.authService.signIn(signInDto);

    return new CustomResponse<{ user: User; token: string }>({
      payload: { data: { user, token } },
      message: 'User signed in successfully',
    });
  }
}
