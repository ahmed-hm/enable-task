import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthModule } from './modules/auth/auth.module';
import { JWTGuard } from './modules/auth/guards/jwt.guard';
import { UserModule } from './modules/user/user.module';
import { GlobalHandler } from './shared/exception-handlers';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mongod = await MongoMemoryServer.create({
          instance: { port: configService.get('MONGODB_IN_MEMORY_PORT') },
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
export class AppModule {}
