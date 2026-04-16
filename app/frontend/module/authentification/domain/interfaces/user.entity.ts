
import { IResetPassWordDto, RegisterDto, RegisterResponse, UpdateUserDto, User } from "../entities/user.entity";
export interface ForgotPasswordDto {
  email: string;
}
export enum OtpType {
  VERIFICATION = 'VERIFICATION',
  RESET_PASSWORD = 'RESET_PASSWORD',
  LOGIN = 'LOGIN',
}
export interface IOtp {
  id: string;
  code: string;
  type: OtpType;
  isUsed: boolean;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}
export interface IUserRepository {
  create(dto: RegisterDto): Promise<RegisterResponse>;
  updateRole(id: string): Promise<void>;
  findAll(): Promise<User[]>;
  update(id: string, dto: UpdateUserDto): Promise<User>;
  resetPassword(dto: IResetPassWordDto): Promise<void>;
  forgotpassword(email: ForgotPasswordDto): Promise<IOtp>;
}
