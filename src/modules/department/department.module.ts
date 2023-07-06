import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { departmentSchemaFactory, DEPARTMENT_MODEL_NAME } from './schema/department.schema';

export const DepartmentMongooseModule = MongooseModule.forFeature([{ name: DEPARTMENT_MODEL_NAME, schema: departmentSchemaFactory() }]);

@Module({
  imports: [DepartmentMongooseModule, forwardRef(() => UserModule)],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentMongooseModule, DepartmentService],
})
export class DepartmentModule {}
