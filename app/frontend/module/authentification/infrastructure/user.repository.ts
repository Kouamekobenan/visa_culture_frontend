import { api } from '@/app/backend/database/api';
import {
  IResetPassWordDto,
  RegisterDto,
  RegisterResponse,
  UpdateUserDto,
  User,
} from '../domain/entities/user.entity';
import { IUserRepository } from '../domain/interfaces/user.entity';
export class UserRepository implements IUserRepository {
  async create(dto: RegisterDto): Promise<RegisterResponse> {
    const users = await api.post(`/auth/register`, dto);
    return {
      message: users.data.message,
      token: {
        accessToken: users.data.accessToken,
        refreshToken: users.data.refreshToken,
      },
    };
  }
  async updateRole(id: string): Promise<void> {
    const url = `users/role/${id}`;
    await api.patch(url);
  }
  async findAll(): Promise<User[]> {
    const url = '/users';
    const users = await api.get(url);
    return users.data;
  }
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const url = `/auth/update/${id}`;
    const user = await api.patch(url, dto);
    return user.data;
  }
  async resetPassword(dto: IResetPassWordDto): Promise<void> {
    await api.post('/auth/reset-password', dto);
  }
  async forgotpassword(email: string): Promise<void> {
    await api.post('/otp/forgot-password', email);
  }
}
