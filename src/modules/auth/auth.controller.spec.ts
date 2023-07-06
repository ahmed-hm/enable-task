import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const signInDto: SignInDto = {
    email: 'John@gmail.com',
    password: '123456',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return {
            signIn: jest.fn().mockReturnValue({ data: { token: 'token' } }),
          };
        }
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('user should be able to sign in', async () => {
    const result = await controller.signin(signInDto);

    expect(result?.payload?.data).toBeDefined();
    expect(result?.payload?.data).toEqual({ token: 'token' });
  });
});
