import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { roleSchemaFactory, ROLE_MODEL_NAME } from './schemas/role.schema';

const RoleMongooseDynamicModule = MongooseModule.forFeature([{ name: ROLE_MODEL_NAME, schema: roleSchemaFactory() }]);

@Module({
  imports: [RoleMongooseDynamicModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleMongooseDynamicModule],
})
export class RoleModule {}
