
import { IResetPassWordDto, RegisterDto, RegisterResponse, UpdateUserDto, User } from "../entities/user.entity";

export interface IUserRepository {
  create(dto: RegisterDto): Promise<RegisterResponse>;
  updateRole(id: string): Promise<void>;
  findAll(): Promise<User[]>;
  update(id: string, dto: UpdateUserDto): Promise<User>;
  resetPassword(dto:IResetPassWordDto):Promise<void>
  forgotpassword(email:string):Promise<void>
}
