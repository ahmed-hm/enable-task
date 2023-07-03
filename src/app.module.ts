import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthModule } from './modules/auth/auth.module';
import { JWTGuard } from './modules/auth/guards/jwt.guard';
import { IUserModel, UserModelName } from './modules/user/schema/user.schema';
import { UserModule } from './modules/user/user.module';
import { GlobalHandler } from './shared/exception-handlers';
import { seedUsers } from './shared/seed/seed';

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
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalHandler },
    { provide: APP_GUARD, useClass: JWTGuard },
  ],
})
export class AppModule {
  logger = new Logger(AppModule.name);

  constructor(@InjectModel(UserModelName) private userModel: IUserModel) {
    this.logger.log('starting user seed');
    seedUsers(this.userModel);
    this.logger.log('finished user seed');
  }
}
