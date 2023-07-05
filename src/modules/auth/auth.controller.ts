import { Body, Controller, Post } from '@nestjs/common';
import { CustomResponse } from 'src/shared/response';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { IsPublic } from './gaurds';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('sign-in')
  async signin(@Body() signInDto: SignInDto): Promise<CustomResponse<{ token: string }>> {
    const payload = await this.authService.signIn(signInDto);

    return new CustomResponse<{ token: string }>({
      payload,
      message: 'User signed in successfully',
    });
  }
}
