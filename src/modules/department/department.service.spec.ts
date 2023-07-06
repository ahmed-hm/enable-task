import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import { PaginationDto } from 'src/shared/dto';
import { UserJWTToken } from '../auth/types';
import { RoleEnum } from '../role/types';
import { UserService } from '../user/user.service';
import { DepartmentMongooseModule } from './department.module';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

describe('DepartmentService', () => {
  let departmentService: DepartmentService;
  let departmentId: Types.ObjectId;
  let mongoInstance: MongoMemoryServer;
  let testingModule: TestingModule;
  let userService: UserService;
  // let userServiceSpy: jest.SpyInstance;

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
        DepartmentMongooseModule,
      ],
      providers: [DepartmentService],
    })
      .useMocker((token) => {
        if (token === UserService) {
          return {
            findOne: jest.fn().mockReturnValue({ data: {} }),
            updateMany: jest.fn().mockReturnValue({ data: {} }),
          };
        }
      })
      .compile();

    departmentService = testingModule.get<DepartmentService>(DepartmentService);
    userService = testingModule.get<UserService>(UserService);
  });

  afterAll(async () => {
    await mongoInstance.stop();
    testingModule.close();
  });

  it('should be defined', () => {
    expect(departmentService).toBeDefined();
  });

  it('should be able to create department', async () => {
    const setSpy = jest.fn();
    const saveSpy = jest.fn();

    when(userService.findOne)
      .calledWith(expect.any(Types.ObjectId))
      .mockResolvedValue({ data: { set: setSpy, save: saveSpy } as any })
      .defaultResolvedValue({ data: null });

    const createDepartmentDto: CreateDepartmentDto = {
      name: 'test',
      description: 'test',
      manager: new Types.ObjectId(),
    };

    const { data } = await departmentService.create(createDepartmentDto);

    expect(data.name).toEqual(createDepartmentDto.name);
    expect(data.description).toEqual(createDepartmentDto.description);
    expect(data.manager).toEqual(createDepartmentDto.manager);

    expect(setSpy).toBeCalledTimes(1);
    expect(saveSpy).toBeCalledTimes(1);

    departmentId = data._id;
  });

  it('super admin should be able to update department', async () => {
    const setSpy = jest.fn();
    const saveSpy = jest.fn();

    when(userService.findOne)
      .calledWith(expect.any(Types.ObjectId))
      .mockResolvedValue({ data: { set: setSpy, save: saveSpy } as any })
      .defaultResolvedValue({ data: null });

    const updateDepartmentDto: UpdateDepartmentDto = {
      name: 'test2',
      description: 'test2',
      manager: new Types.ObjectId(),
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

    const { data } = await departmentService.update(departmentId, updateDepartmentDto, userJWTToken);

    expect(data.name).toEqual('test2');
    expect(data.description).toEqual('test2');
    expect(data.manager).toEqual(updateDepartmentDto.manager);

    expect(setSpy).toBeCalledTimes(2);
    expect(saveSpy).toBeCalledTimes(2);
  });

  it('non-manager should not be able to update department', async () => {
    expect.assertions(2);

    const updateDepartmentDto: UpdateDepartmentDto = {
      name: 'test2',
      description: 'test2',
      manager: new Types.ObjectId(),
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
        type: RoleEnum.EMPLOYEE,
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

    try {
      await departmentService.update(departmentId, updateDepartmentDto, userJWTToken);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toEqual('You are not allowed to update this department');
    }
  });

  it('should be able to find all departments', async () => {
    const findAllDepartments: PaginationDto = {
      page: 1,
      limit: 10,
    };

    const { data, limit, page, pages, total } = await departmentService.findAll(findAllDepartments);

    expect(data.length).toEqual(1);
    expect(limit).toEqual(findAllDepartments.limit);
    expect(page).toEqual(findAllDepartments.page);
    expect(pages).toEqual(1);
    expect(total).toEqual(1);
  });

  it('should be able to find one department', async () => {
    const { data } = await departmentService.findOne(departmentId);

    expect(data._id).toEqual(departmentId);
  });

  it('should be able to delete department', async () => {
    const { data } = await departmentService.remove(departmentId);

    expect(data._id).toEqual(departmentId);
    expect(userService.updateMany).toBeCalledTimes(1);
  });

  it('should not be able to find one department', async () => {
    expect.assertions(2);
    try {
      await departmentService.findOne(departmentId);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual('Department not found');
    }
  });
});
