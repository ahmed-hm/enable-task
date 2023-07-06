import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hashSync } from 'bcryptjs';
import { HydratedDocumentFromSchema, Types } from 'mongoose';
import { RoleEnum } from '../role/types';
import { UserSchema } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  const mockAuthorizedUser: Partial<HydratedDocumentFromSchema<UserSchema>> = {
    _id: new Types.ObjectId('64a27b8af50be6424ede3dfb'),
    firstName: 'John',
    lastName: 'Doe',
    username: 'JohnDoe',
    email: 'John@gmail.com',
    password: hashSync('123456', 10),
    role: { _id: new Types.ObjectId('64a27b8af50be6424ede3df8'), type: RoleEnum.SUPER_ADMIN },
    populate: jest.fn().mockReturnValue({
      _id: new Types.ObjectId('64a27b8af50be6424ede3dfb'),
      firstName: 'John',
      lastName: 'Doe',
      username: 'JohnDoe',
      email: 'John@gmail.com',
      password: hashSync('123456', 10),
      role: { _id: { _id: new Types.ObjectId('64a27b8af50be6424ede3df8'), type: RoleEnum.SUPER_ADMIN, permission: {} } },
      toJSON: jest.fn().mockReturnValue({
        _id: new Types.ObjectId('64a27b8af50be6424ede3dfb'),
        firstName: 'John',
        lastName: 'Doe',
        username: 'JohnDoe',
        email: 'John@gmail.com',
        role: { _id: new Types.ObjectId('64a27b8af50be6424ede3df8'), type: RoleEnum.SUPER_ADMIN },
      }),
    }),
  };

  const mockUnauthorizedUser: Partial<HydratedDocumentFromSchema<UserSchema>> = {
    ...mockAuthorizedUser,
    password: hashSync('1234567', 10),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return {
            get: jest.fn().mockReturnValue('secret'),
          };
        }
        if (token === JwtService) {
          return {
            signAsync: jest.fn().mockReturnValue('token'),
          };
        }
        if (token === UserService) {
          return {
            findOne: jest.fn().mockReturnValue({ data: mockAuthorizedUser }),
          };
        }
      })
      .compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('authorized user should be able to sign in', async () => {
    const signInDto = {
      email: mockAuthorizedUser.email,
      password: mockAuthorizedUser.password,
    };

    const result = await authService.signIn({ ...signInDto, password: '123456' });

    expect(result?.data?.token).toBeDefined();
    expect(result?.data?.token).toEqual('token');
  });

  it('unauthorized user should not be able to sign in', async () => {
    expect.assertions(2);
    const signInDto = {
      email: mockUnauthorizedUser.email,
      password: mockUnauthorizedUser.password,
    };
    
    try {
      await authService.signIn({ ...signInDto, password: '1234567' });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toEqual('Invalid password');
    }
  });
});
