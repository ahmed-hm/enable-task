import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { PaginationDto } from 'src/shared/dto';
import { UserJWTToken } from '../auth/types';
import { RoleEnum } from '../role/types';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

describe('DepartmentController', () => {
  let controller: DepartmentController;
  let departmentService: DepartmentService;
  let departmentId: Types.ObjectId;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
    })
      .useMocker((token) => {
        if (token === DepartmentService) {
          return {
            create: jest.fn().mockReturnValue({ data: { id: 'id' } }),
            findAll: jest.fn().mockReturnValue({ data: [{ id: 'id' }] }),
            findOne: jest.fn().mockReturnValue({ data: { id: 'id' } }),
            update: jest.fn().mockReturnValue({ data: { id: 'id' } }),
            remove: jest.fn().mockReturnValue({ data: { id: 'id' } }),
          };
        }
      })
      .compile();

    controller = module.get<DepartmentController>(DepartmentController);
    departmentService = module.get<DepartmentService>(DepartmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be able to create department', async () => {
    const spy = jest.spyOn(departmentService, 'create');

    const createDepartmentDto: CreateDepartmentDto = {
      name: 'name',
      description: 'description',
      manager: new Types.ObjectId(),
    };

    const result = await controller.create(createDepartmentDto);

    expect(spy).toBeCalledWith(createDepartmentDto);
    expect(spy).toBeCalledTimes(1);
    expect(result?.payload?.data).toBeDefined();
    expect(result?.payload?.data).toEqual({ id: 'id' });

    departmentId = result?.payload?.data?.id;
  });

  it('should be able to find all departments', async () => {
    const spy = jest.spyOn(departmentService, 'findAll');

    const findAllDepartmentsDto: PaginationDto = {
      page: 1,
      limit: 10,
    };

    const result = await controller.findAll(findAllDepartmentsDto);

    expect(spy).toBeCalledWith(findAllDepartmentsDto);
    expect(spy).toBeCalledTimes(1);
    expect(result?.payload?.data).toBeDefined();
    expect(result?.payload?.data).toEqual([{ id: 'id' }]);
  });

  it('should be able to find one department', async () => {
    const spy = jest.spyOn(departmentService, 'findOne');

    const result = await controller.findOne({ id: departmentId });

    expect(spy).toBeCalledWith(departmentId);
    expect(spy).toBeCalledTimes(1);
    expect(result?.payload?.data).toBeDefined();
    expect(result?.payload?.data).toEqual({ id: 'id' });
  });

  it('should be able to update department', async () => {
    const spy = jest.spyOn(departmentService, 'update');

    const updateDepartmentDto: CreateDepartmentDto = {
      name: 'name',
      description: 'description',
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

    const result = await controller.update({ id: departmentId }, updateDepartmentDto, userJWTToken);

    expect(spy).toBeCalledWith(departmentId, updateDepartmentDto, userJWTToken);
    expect(spy).toBeCalledTimes(1);
    expect(result?.payload?.data).toBeDefined();
    expect(result?.payload?.data).toEqual({ id: 'id' });
  });

  it('should be able to remove department', async () => {
    const spy = jest.spyOn(departmentService, 'remove');

    const result = await controller.remove({ id: departmentId });

    expect(spy).toBeCalledWith(departmentId);
    expect(spy).toBeCalledTimes(1);
    expect(result?.payload?.data).toBeDefined();
    expect(result?.payload?.data).toEqual({ id: 'id' });
  });
});
