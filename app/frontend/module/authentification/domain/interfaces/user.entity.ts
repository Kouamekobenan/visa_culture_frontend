import {
  PaginatedResponseRepository,
  UserRole,
} from '@/app/frontend/utils/types/manager.type';
import {
  IResetPassWordDto,
  IUserController,
  RegisterDto,
  RegisterResponse,
  UpdateUserDto,
  User,
} from '../entities/user.entity';
import { FiltreUserDto } from '../../application/user.service';
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
  paginateSearch(
    page: number,
    limit: number,
    search?: FiltreUserDto,
    role?: UserRole | 'ALL',
  ): Promise<PaginatedResponseRepository<User>>;
  stats(
    page: number,
    limit: number,
  ): Promise<PaginatedResponseRepository<IUserController>>;
}
