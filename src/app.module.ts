import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthModule } from './modules/auth/auth.module';
import { JWTGuard } from './modules/auth/guards/jwt.guard';
import { PermissionGuard } from './modules/auth/guards/permission.guard';
import { RoleModule } from './modules/role/role.module';
import { IRoleModel, ROLE_MODEL_NAME } from './modules/role/schemas/role.schema';
import { IUserModel, USER_MODEL_NAME } from './modules/user/schema/user.schema';
import { UserModule } from './modules/user/user.module';
import { GlobalHandler } from './shared/exception-handlers';
import { seedRoles, seedUsers } from './shared/seed/seed';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mongod = await MongoMemoryServer.create({
          instance: { port: +configService.get('MONGODB_IN_MEMORY_PORT') },
        });
        const uri = mongod.getUri();

        return { uri };
      },
    }),
    UserModule,
    AuthModule,
    RoleModule,
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
  ) {
    this.startSeed();
  }

  async startSeed() {
    this.logger.log('starting role seed');
    await seedRoles(this.roleModel);
    this.logger.log('finished role seed');

    this.logger.log('starting user seed');
    await seedUsers(this.userModel);
    this.logger.log('finished user seed');
  }
}
