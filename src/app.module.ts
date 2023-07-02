import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserModule } from './modules/user/user.module';

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
  ],
})
export class AppModule {}
