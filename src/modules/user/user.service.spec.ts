import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import { UserJWTToken } from '../auth/types';
import { DepartmentService } from '../department/department.service';
import { RoleEnum } from '../role/types';
import { CreateUserDto, FindAllUsersDto, UpdateUserDto } from './dto';
import { IUserModel, USER_MODEL_NAME } from './schema/user.schema';
import { UserMongooseDynamicModule } from './user.module';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let departmentService: DepartmentService;
  let mongoInstance: MongoMemoryServer;
  let testingModule: TestingModule;
  let userModel: IUserModel;
  let managerUserId: Types.ObjectId;
  let nonManagerUserId: Types.ObjectId;
  const createManagerUserDto: CreateUserDto = {
    firstName: 'Jane',
    lastName: 'Doe',
    username: 'JaneDoe',
    email: 'Jane@gmail.com',
    password: '123456',
    role: { _id: new Types.ObjectId('64a27b8af50be6424ede3df9'), type: RoleEnum.DEPARTMENT_MANAGER },
    managedDepartment: { _id: new Types.ObjectId('64a27b8af50be6424ede3e0a'), name: 'IT' },
    department: { _id: new Types.ObjectId('64a27b8af50be6424ede3e0a'), name: 'IT' },
  };
  const createNonManagerUserDto: CreateUserDto = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'JohnDoe',
    email: 'John@gmail.com',
    password: '123456',
    role: { _id: new Types.ObjectId('64a27b8af50be6424ede3df9'), type: RoleEnum.EMPLOYEE },
    department: { _id: new Types.ObjectId('64a27b8af50be6424ede3e0a'), name: 'IT' },
  };

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            mongoInstance = await MongoMemoryServer.create();
            const uri = mongoInstance.getUri();

            return { uri };
          },
        }),
        UserMongooseDynamicModule,
      ],
      providers: [UserService],
    })
      .useMocker((token) => {
        if (token === DepartmentService) {
          return {
            findOne: jest.fn().mockReturnValue({
              data: {},
            }),
          };
        }
      })
      .compile();

    userService = testingModule.get<UserService>(UserService);
    departmentService = testingModule.get<DepartmentService>(DepartmentService);
    userModel = testingModule.get<IUserModel>(getModelToken(USER_MODEL_NAME));
  });

  afterAll(async () => {
    await mongoInstance.stop();
    testingModule.close();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should create user', async () => {
    const departmentServiceSpy = jest.spyOn(departmentService, 'findOne');
    let departmentSetSpy: jest.SpyInstance = jest.fn();
    let departmentSaveSpy: jest.SpyInstance = jest.fn();

    when(departmentService.findOne)
      .calledWith(new Types.ObjectId('64a27b8af50be6424ede3e0a'))
      .mockResolvedValue({
        data: {
          _id: new Types.ObjectId('64a27b8af50be6424ede3e0a'),
          name: 'IT',
          set: departmentSetSpy,
          save: departmentSaveSpy,
          manager: {
            _id: new Types.ObjectId(),
          },
        } as any,
      })
      .defaultResolvedValue({ data: null });

    const { data: managerUser } = await userService.create(createManagerUserDto);
    const { data: nonManagerUser } = await userService.create(createNonManagerUserDto);

    const { password, username, email, ...restOfCreateUserDto } = createManagerUserDto;

    expect(managerUser.toObject()).toEqual(expect.objectContaining(restOfCreateUserDto));
    expect(managerUser.password).not.toBe(createManagerUserDto.password);
    expect(managerUser.email).toBe(createManagerUserDto.email.toLowerCase());
    expect(managerUser.username).toBe(createManagerUserDto.username.toLowerCase());

    expect(departmentServiceSpy).toBeCalledTimes(1);
    expect(departmentSetSpy).toBeCalledTimes(1);
    expect(departmentSaveSpy).toBeCalledTimes(1);

    managerUserId = managerUser._id;
    nonManagerUserId = nonManagerUser._id;
  });

  it('should find user by id', async () => {
    const { data: user } = await userService.findOne(managerUserId);

    expect(user._id).toEqual(managerUserId);
  });

  it('should find user by email', async () => {
    const { data: user } = await userService.findOne({ email: createManagerUserDto.email });

    expect(user.email).toBe(createManagerUserDto.email.toLowerCase());
  });

  it('should find user by department', async () => {
    const { data: user } = await userService.findOne({ department: createManagerUserDto.department });

    expect(user.department._id).toEqual(createManagerUserDto.department._id);
  });

  it('should find user by managedDepartment', async () => {
    const { data: user } = await userService.findOne({ managedDepartment: createManagerUserDto.managedDepartment });

    expect(user.managedDepartment._id).toEqual(createManagerUserDto.managedDepartment._id);
  });

  it('should find all users', async () => {
    const findAllUsersDto: FindAllUsersDto = {
      limit: 10,
      page: 1,
    };

    const userJWTToken: UserJWTToken = {
      _id: new Types.ObjectId('64a27b8af50be6424ede3dfb'),
      firstName: 'John',
      lastName: 'Doe',
      username: 'JohnDoe',
      email: 'John@gmail.com',
      password: '123456',
      role: {
        _id: new Types.ObjectId('64a27b8af50be6424ede3df8'),
        type: RoleEnum.SUPER_ADMIN,
        permission: {
          department: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
          user: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
          role: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { data: users, limit, page, pages, total } = await userService.findAll(findAllUsersDto, userJWTToken);

    expect(users).toHaveLength(2);
    expect(limit).toBe(findAllUsersDto.limit);
    expect(page).toBe(findAllUsersDto.page);
    expect(pages).toBe(1);
    expect(total).toBe(2);
  });

  it('should find searched users', async () => {
    const findAllUsersDto: FindAllUsersDto = {
      search: 'Jane',
      limit: 10,
      page: 1,
    };

    const userJWTToken: UserJWTToken = {
      _id: new Types.ObjectId('64a27b8af50be6424ede3dfb'),
      firstName: 'John',
      lastName: 'Doe',
      username: 'JohnDoe',
      email: 'John@gmail.com',
      password: '123456',
      role: {
        _id: new Types.ObjectId('64a27b8af50be6424ede3df8'),
        type: RoleEnum.SUPER_ADMIN,
        permission: {
          department: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
          user: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
          role: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { data: users, limit, page, pages, total } = await userService.findAll(findAllUsersDto, userJWTToken);

    expect(users).toHaveLength(1);
    expect(limit).toBe(findAllUsersDto.limit);
    expect(page).toBe(findAllUsersDto.page);
    expect(pages).toBe(1);
    expect(total).toBe(1);
  });

  it('should not find any user with wrong search', async () => {
    const findAllUsersDto: FindAllUsersDto = {
      search: 'wrong',
      limit: 10,
      page: 1,
    };

    const userJWTToken: UserJWTToken = {
      _id: new Types.ObjectId('64a27b8af50be6424ede3dfb'),
      firstName: 'John',
      lastName: 'Doe',
      username: 'JohnDoe',
      email: 'John@gmail.com',
      password: '123456',
      role: {
        _id: new Types.ObjectId('64a27b8af50be6424ede3df8'),
        type: RoleEnum.SUPER_ADMIN,
        permission: {
          department: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
          user: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
          role: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { data: users, limit, page, pages, total } = await userService.findAll(findAllUsersDto, userJWTToken);

    expect(users).toHaveLength(0);
    expect(limit).toBe(findAllUsersDto.limit);
    expect(page).toBe(findAllUsersDto.page);
    expect(pages).toBe(0);
    expect(total).toBe(0);
  });

  it('should update user', async () => {
    const updateUserDto: UpdateUserDto = {
      department: { _id: new Types.ObjectId(), name: 'IT' },
    };

    const { data: user } = await userService.update(managerUserId, updateUserDto);

    expect(user.department._id).toEqual(updateUserDto.department._id);
    expect(user.department.name).toEqual(updateUserDto.department.name);
  });

  it('should throw error if user not found', async () => {
    expect.assertions(2);

    const updateUserDto: UpdateUserDto = {
      department: { _id: new Types.ObjectId(), name: 'IT' },
    };

    try {
      await userService.update(new Types.ObjectId(), updateUserDto);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toBe('User not found');
    }
  });

  it('cannot delete a department manager user', async () => {
    expect.assertions(2);

    try {
      await userService.remove(managerUserId);
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenException);
      expect(err.message).toBe('User is a manager of a department, cannot be deleted');
    }
  });

  it('should delete user', async () => {
    const { data: user } = await userService.remove(nonManagerUserId);

    expect(user._id).toEqual(nonManagerUserId);
  });

  it('cannot find deleted user', async () => {
    const { data: user } = await userService.findOne(nonManagerUserId);

    expect(user).toBeNull();
  });

  it('should be able to update multiple users', async () => {
    const userModelSpy = jest.spyOn(userModel, 'updateMany');

    const updateUserDto: UpdateUserDto = {
      department: { _id: new Types.ObjectId(), name: 'IT' },
    };

    await userService.updateMany({ _id: nonManagerUserId }, updateUserDto);

    expect(userModelSpy).toBeCalledTimes(1);
  });
});
