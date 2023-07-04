import { Role } from "src/modules/role/entities/role.entity";

export type UserJWTToken = {
  _id: string;
  email: string;
  role: Role
}
  