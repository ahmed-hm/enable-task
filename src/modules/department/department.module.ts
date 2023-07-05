import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { departmentSchemaFactory, DEPARTMENT_MODEL_NAME } from './schema/department.schema';

const departmentMongooseModule = MongooseModule.forFeature([{ name: DEPARTMENT_MODEL_NAME, schema: departmentSchemaFactory() }]);

@Module({
  imports: [departmentMongooseModule, forwardRef(() => UserModule)],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [departmentMongooseModule, DepartmentService],
})
export class DepartmentModule {}
