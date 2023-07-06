import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CreateRoleDto, FindAllRolesDto, UpdateRoleDto } from './dto';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleEnum } from './types';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: RoleService;
  let roleId: Types.ObjectId;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
    })
      .useMocker((token) => {
        if (token === RoleService) {
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

    controller = module.get<RoleController>(RoleController);
    roleService = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be able to create role', async () => {
    const spy = jest.spyOn(roleService, 'create');

    const createRoleDto: CreateRoleDto = {
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
    };

    const result = await controller.create(createRoleDto);

    expect(spy).toBeCalledWith(createRoleDto);
    expect(spy).toBeCalledTimes(1);
    expect(result?.payload?.data).toBeDefined();

    roleId = result?.payload?.data?.id;
  });

  it('should be able to find all roles', async () => {
    const spy = jest.spyOn(roleService, 'findAll');

    const findAllRolesDto: FindAllRolesDto = {
      limit: 10,
      page: 1,
    };

    const result = await controller.findAll(findAllRolesDto);

    expect(spy).toBeCalledWith(findAllRolesDto);
    expect(spy).toBeCalledTimes(1);
    expect(result?.payload?.data).toBeDefined();
  });

  it('should be able to find one role', async () => {
    const spy = jest.spyOn(roleService, 'findOne');

    const result = await controller.findOne({ id: roleId });

    expect(spy).toBeCalledWith(roleId);
    expect(spy).toBeCalledTimes(1);
    expect(result?.payload?.data).toBeDefined();
  });

  it('should be able to update role', async () => {
    const spy = jest.spyOn(roleService, 'update');

    const updateRoleDto: UpdateRoleDto = {
      permission: {
        department: {
          create: false,
          read: false,
          update: false,
          delete: false,
        },
        user: {
          create: false,
          read: false,
          update: false,
          delete: false,
        },
        role: {
          create: false,
          read: false,
          update: false,
          delete: false,
        },
      },
    };

    const result = await controller.update({ id: roleId }, updateRoleDto);

    expect(spy).toBeCalledWith(roleId, updateRoleDto);
    expect(spy).toBeCalledTimes(1);
    expect(result?.payload?.data).toBeDefined();
  });

  it('should be able to remove role', async () => {
    const spy = jest.spyOn(roleService, 'remove');

    const result = await controller.remove({ id: roleId });

    expect(spy).toBeCalledWith(roleId);
    expect(spy).toBeCalledTimes(1);
    expect(result?.payload?.data).toBeDefined();
  });
});
