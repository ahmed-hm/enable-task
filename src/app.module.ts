import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { JWTGuard } from './modules/auth/guards/jwt.guard';
import { PermissionGuard } from './modules/auth/guards/permission.guard';
import { DepartmentModule } from './modules/department/department.module';
import { DEPARTMENT_MODEL_NAME, IDepartmentModel } from './modules/department/schema/department.schema';
import { ROLE_MODEL_NAME } from './modules/role/constants';
import { RoleModule } from './modules/role/role.module';
import { IRoleModel } from './modules/role/schemas/role.schema';
import { IUserModel, USER_MODEL_NAME } from './modules/user/schema/user.schema';
import { UserModule } from './modules/user/user.module';
import { GlobalHandler } from './shared/exception-handlers';
import { configSchema } from './shared/schemas/joi';
import { seedAll } from './shared/seed/seed';
import { mongooseFactory } from './shared/utils';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: configSchema() }),
    MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: mongooseFactory }),
    UserModule,
    AuthModule,
    RoleModule,
    DepartmentModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalHandler },
    { provide: APP_GUARD, useClass: JWTGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {
  logger = new Logger(AppModule.name);

  constructor(
    @InjectModel(USER_MODEL_NAME) private userModel: IUserModel,
    @InjectModel(ROLE_MODEL_NAME) private roleModel: IRoleModel,
    @InjectModel(DEPARTMENT_MODEL_NAME) private departmentModel: IDepartmentModel,
  ) {
    seedAll(this.roleModel, this.userModel, this.departmentModel);
  }
}
